'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, ShoppingBag, Star, Share2, Zap, Shield, Truck, Plus, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToyyibPayModal from '@/components/ToyyibPayModal';
import OfferModal from '@/components/OfferModal';
import { useAllProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/components/AlertProvider';

// Helper function to check if product is new (within 4 days of creation)
const isProductNew = (product: any): boolean => {
  if (!product.createdAt) return false;
  
  const createdDate = new Date(product.createdAt);
  const currentDate = new Date();
  const daysDifference = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference <= 4;
};

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Additional images for gallery
  category: string;
  size: string[];
  color: string;
  inStock: boolean;
  isNew?: boolean;
  isSoldOut?: boolean;
  description?: string;
  // Bidding properties
  isBiddingItem?: boolean;
  biddingEndTime?: number;
  currentBid?: number;
  highestBidder?: string;
  highestBidderEmail?: string;
  biddingStartPrice?: number;
  biddingDuration?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const products = useAllProducts();
  const { settings } = useSiteSettings();
  const { user, setShowAuthModal } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const MIN_INCREMENT = 5;

  useEffect(() => {
    setIsLoading(true);
    console.log('🔍 Product page loading:', {
      productId: params.id,
      totalProducts: products.length,
      products: products.map(p => ({ id: p.id, name: p.name }))
    });
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (products.length === 0) {
        console.log('⏰ Loading timeout - products still empty, showing not found');
        setIsLoading(false);
        return;
      }
    }, 5000); // 5 second timeout
    
    // Wait for products to load
    if (products.length === 0) {
      console.log('⏳ Waiting for products to load...');
      return () => clearTimeout(loadingTimeout);
    }
    
    const foundProduct = products.find(p => p.id === params.id);
    console.log('🎯 Found product:', foundProduct);
    
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.image);
      if (foundProduct.size.length > 0) {
        setSelectedSize(foundProduct.size[0]);
      }
      
      // Check if favorited
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorited(favorites.includes(foundProduct.id));
      console.log('✅ Product loaded successfully');
    } else {
      console.error('❌ Product not found with ID:', params.id);
    }
    
    clearTimeout(loadingTimeout);
    setIsLoading(false);
  }, [params.id, products]);

  // Timer for bidding countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-mark sold when timer ends
  useEffect(() => {
    if (product?.isBiddingItem && product?.biddingEndTime && product.biddingEndTime <= Date.now() && !product.isSoldOut) {
      const allProducts = localStorage.getItem('adminProducts');
      if (allProducts) {
        const parsedProducts = JSON.parse(allProducts);
        const updatedProducts = parsedProducts.map((p: any) => 
          p.id === product.id ? { ...p, isSoldOut: true } : p
        );
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
        window.dispatchEvent(new Event('productUpdated'));
        setProduct({ ...product, isSoldOut: true });
      }
    }
  }, [product, now]);

  const toggleFavorite = () => {
    if (!product) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updatedFavorites;
    
    if (isFavorited) {
      updatedFavorites = favorites.filter((id: string) => id !== product.id);
    } else {
      updatedFavorites = [...favorites, product.id];
    }
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorited(!isFavorited);
    
    // Trigger custom event to update header badge
    window.dispatchEvent(new Event('favoriteChanged'));
  };

  const handlePurchase = () => {
    console.log('💳 Buy Now clicked!', { user, product });
    
    if (!user) {
      console.log('⚠️ No user logged in for purchase');
      showError('Login Required', 'Please login to make a purchase.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleAddToCart = async () => {
    console.log('🛒 Add to Cart clicked!', { user, product });
    
    if (!product) {
      console.log('❌ No product selected');
      showError('Product Not Found', 'The selected product could not be found. Please try again.');
      return;
    }
    
    if (isAddingToCart) {
      console.log('🔄 Already adding to cart, skipping...');
      return;
    }
    
    setIsAddingToCart(true);
    
    // Temporary bypass for testing - remove in production
    if (!user) {
      console.log('⚠️ No user logged in, but allowing for testing');
      // For now, allow adding to cart without login for testing
      // alert('Please login to add items to cart');
      // return;
    }

    console.log('✅ Proceeding with cart (with or without user)');
    
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    
    // Check if item already in cart
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === product?.id
    );

    if (existingItemIndex > -1) {
      // Update quantity
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem = {
        id: product?.id,
        name: product?.name,
        brand: product?.brand,
        price: product?.price,
        image: product?.image,
        selectedSize: product?.size?.[0] || 'One Size', // Use first available size or default
        quantity: quantity
      };
      existingCart.push(cartItem);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(existingCart));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    console.log('✅ Item successfully added to cart:', existingCart);
    
    // Add slight delay for better UX
    setTimeout(() => {
      setIsAddingToCart(false);
      
      showSuccess(
        'Added to Cart Successfully!',
        `${product?.name} has been added to your shopping cart. You can continue shopping or proceed to checkout.`
      );
    }, 500);
  };

  const handleMakeOffer = () => {
    console.log('💰 Make Offer clicked!', { user, product });
    
    if (!user) {
      console.log('⚠️ No user logged in for offer');
      showError('Login Required', 'Please login to make an offer on this item.');
      return;
    }
    setShowOfferModal(true);
  };

  const formatRemaining = (endTime?: number) => {
    if (!endTime) return "Not started";
    const diff = endTime - now;
    if (diff <= 0) return "Ended";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handlePlaceBid = () => {
    if (!product) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const value = Number(bidAmount);
    if (!bidAmount || Number.isNaN(value)) {
      setBidMessage('Masukkan nilai bid yang sah');
      return;
    }

    const currentBid = product.currentBid ?? product.biddingStartPrice ?? product.price;
    const minBid = currentBid + MIN_INCREMENT;
    if (value < minBid) {
      setBidMessage(`Min bid ${settings.currency}${minBid.toLocaleString()}`);
      return;
    }

    setIsPlacingBid(true);

    const allProducts = localStorage.getItem('adminProducts');
    if (allProducts) {
      const parsedProducts = JSON.parse(allProducts);
      const updatedProducts = parsedProducts.map((p: any) => 
        p.id === product.id 
          ? { 
              ...p, 
              currentBid: value, 
              highestBidder: user.name || 'User',
              highestBidderEmail: user.email
            }
          : p
      );
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
      window.dispatchEvent(new Event('productUpdated'));
      
      setProduct({
        ...product,
        currentBid: value,
        highestBidder: user.name || 'User',
        highestBidderEmail: user.email
      });

      setBidMessage('You are the highest bidder!');
      setBidAmount('');
    }

    setIsPlacingBid(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-900">Loading product...</h1>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">
            Looking for product ID: <code className="bg-gray-200 px-2 py-1 rounded">{params.id}</code>
          </p>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/shop')}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Shop
            </button>
            <button 
              onClick={() => router.push('/')}
              className="border border-black text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiple product images for gallery
  const productImages = [
    product.image,
    ...(product.images || [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-xl">
              <img 
                src={selectedImage} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-black shadow-lg' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{product.brand}</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-all ${
                      isFavorited 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {isProductNew(product) && (
                <div className="inline-block bg-black text-white text-xs px-4 py-2 font-medium mb-3 tracking-widest uppercase">
                  JUST ARRIVED
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-black mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-black">{settings.currency}{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">{settings.currency}{product.originalPrice.toLocaleString()}</span>
                )}
              </div>


            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-black mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || `Experience premium quality with the ${product.name} from ${product.brand}. This ${product.category.toLowerCase()} combines style, comfort, and durability. Perfect for streetwear enthusiasts who appreciate authentic fashion pieces.`}
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-black mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Brand:</span>
                  <p className="text-gray-700">{product.brand}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <p className="text-gray-700">{product.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Color:</span>
                  <p className="text-gray-700">{product.color}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Available Sizes:</span>
                  <p className="text-gray-700">{product.size.join(' • ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Condition:</span>
                  <p className="text-gray-700">Authentic • Bundle Item</p>
                </div>
              </div>
            </div>



            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Authentic</p>
                <p className="text-xs text-gray-600">Guaranteed</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-600">Orders {'>'}RM150</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                <p className="text-xs text-gray-600">1-3 days</p>
              </div>
            </div>

            {/* Purchase Actions - Enhanced Mobile-Friendly Layout */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-6 rounded-xl shadow-2xl border z-10">
              {product.isBiddingItem ? (
                // BIDDING INTERFACE
                <div className="space-y-4">
                  {/* Bidding Status Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${product.isSoldOut ? "bg-red-400" : "bg-green-400 animate-pulse"}`} />
                        <span className="font-bold text-purple-900">
                          {product.isSoldOut ? 'SOLD OUT' : 'LIVE AUCTION'}
                        </span>
                      </div>
                      {product.biddingEndTime && (
                        <div className="flex items-center space-x-1 text-purple-800 font-semibold">
                          <Clock className="h-4 w-4" />
                          <span>{formatRemaining(product.biddingEndTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Bid and Highest Bidder */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Current Bid</p>
                      <p className="text-2xl font-black text-gray-900">
                        {settings.currency}{((product.currentBid ?? product.biddingStartPrice ?? product.price)).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Starting: {settings.currency}{(product.biddingStartPrice ?? product.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Highest Bidder</p>
                      <p className="text-lg font-bold text-gray-900">
                        {product.highestBidder || 'No bids yet'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.isSoldOut && product.highestBidder ? '✅ Won' : 'Be the first!'}
                      </p>
                    </div>
                  </div>

                  {/* Bid Input Section */}
                  {!product.isSoldOut ? (
                    <div className="space-y-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Place Your Bid (min +{settings.currency}{MIN_INCREMENT})
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => {
                              setBidAmount(e.target.value);
                              setBidMessage('');
                            }}
                            min={(product.currentBid ?? product.biddingStartPrice ?? product.price) + MIN_INCREMENT}
                            placeholder={`${settings.currency}${((product.currentBid ?? product.biddingStartPrice ?? product.price) + MIN_INCREMENT).toLocaleString()}`}
                            disabled={!user}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={handlePlaceBid}
                            disabled={isPlacingBid || !user}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                              !user
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isPlacingBid
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg active:scale-95'
                            }`}
                          >
                            {isPlacingBid ? 'Placing...' : 'Place Bid'}
                          </button>
                        </div>
                      </div>
                      
                      {bidMessage && (
                        <p className={`text-sm font-semibold ${
                          bidMessage.includes('highest') ? 'text-green-700' : 'text-red-600'
                        }`}>
                          {bidMessage}
                        </p>
                      )}

                      {!user && (
                        <p className="text-sm font-semibold text-blue-700">
                          You must <button onClick={() => setShowAuthModal(true)} className="underline hover:no-underline">login or register</button> to place bids.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                      <p className="text-lg font-bold text-red-800 mb-2">Auction Ended</p>
                      {product.highestBidder && (
                        <p className="text-sm text-red-700">
                          Won by <span className="font-bold">{product.highestBidder}</span> at {settings.currency}{(product.currentBid ?? product.price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* View Full Details Button */}
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    View Full Details ↑
                  </button>
                </div>
              ) : (
                // REGULAR PURCHASE INTERFACE
                !product.isSoldOut ? (
                  <div className="space-y-3">
                    {/* Add to Cart Button - Large and Easy to Tap */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className={`w-full py-5 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center justify-center space-x-3 min-h-[65px] touch-manipulation ${
                        isAddingToCart 
                          ? 'bg-green-600 text-white cursor-not-allowed' 
                          : 'bg-gray-900 text-white hover:bg-black active:bg-gray-800 hover:scale-105 active:scale-95 cursor-pointer'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                          <span className="text-xl">ADDING...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-7 w-7" />
                          <span className="text-xl">ADD TO CART</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Actions - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handlePurchase}
                        className="w-full py-4 px-4 rounded-xl font-bold text-base bg-black text-white hover:bg-gray-800 active:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 min-h-[55px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Zap className="h-6 w-6" />
                        <span>BUY NOW</span>
                      </button>
                      
                      <button
                        onClick={handleMakeOffer}
                        className="w-full py-4 px-4 rounded-xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 min-h-[55px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <ShoppingBag className="h-6 w-6" />
                        <span>MAKE OFFER</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      SOLD OUT
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ToyyibPay Payment Modal */}
      {showPaymentModal && product && (
        <ToyyibPayModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          productName={product.name}
          productImage={product.image}
          productBrand={product.brand}
          productSize={selectedSize}
          productColor={product.color}
          productId={product.id}
          amount={product.price}
          orderId={`order-${Date.now()}`}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            showSuccess('Order Placed', 'Your order has been placed successfully!');
            setTimeout(() => router.push('/my-purchases'), 2000);
          }}
        />
      )}

      {/* Offer Modal */}
      {showOfferModal && product && (
        <OfferModal
          onClose={() => setShowOfferModal(false)}
          product={{
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            size: product.size,
            category: product.category,
            color: product.color,
            inStock: product.inStock
          }}
          onOfferSubmitted={() => {
            setShowOfferModal(false);
            alert('Offer submitted successfully! We will review and get back to you.');
          }}
        />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
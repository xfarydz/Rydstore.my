'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, ShoppingBag, Star, Share2, Zap, Shield, Truck, Plus } from 'lucide-react';
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
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const products = useAllProducts();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
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
              {!product.isSoldOut ? (
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
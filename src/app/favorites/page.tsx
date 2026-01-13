'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAllProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  size: string[];
  color: string;
  inStock: boolean;
  isNew?: boolean;
  isSoldOut?: boolean;
  description?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const allProducts = useAllProducts();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Use user-specific favorites if user is logged in, otherwise use global favorites  
    const favoritesKey = user?.id ? `favorites_${user.id}` : 'favorites';
    const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    setFavorites(savedFavorites);
    
    // Filter products to only show favorited ones
    const favoriteItems = allProducts.filter(product => 
      savedFavorites.includes(product.id)
    );
    
    setFavoriteProducts(favoriteItems);
  }, [allProducts, user?.id]);

  const removeFavorite = (productId: string) => {
    const updatedFavorites = favorites.filter(id => id !== productId);
    setFavorites(updatedFavorites);
    
    // Use user-specific favorites if user is logged in
    const favoritesKey = user?.id ? `favorites_${user.id}` : 'favorites';
    localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
    
    // Update favorite products list
    const updatedProducts = favoriteProducts.filter(product => product.id !== productId);
    setFavoriteProducts(updatedProducts);
    
    // Trigger event to update header badge
    window.dispatchEvent(new Event('favoriteChanged'));
  };

  const clearAllFavorites = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      setFavorites([]);
      setFavoriteProducts([]);
      
      // Use user-specific favorites if user is logged in
      const favoritesKey = user?.id ? `favorites_${user.id}` : 'favorites';
      localStorage.setItem(favoritesKey, JSON.stringify([]));
      
      window.dispatchEvent(new Event('favoriteChanged'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-2xl font-bold text-black flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-3 fill-current" />
                  My Favorites
                </h1>
                <p className="text-gray-600">
                  {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            
            {favoriteProducts.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favoriteProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="mb-8">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Start browsing and add items to your favorites by clicking the heart icon on any product.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          // Favorites Grid
          <div>
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>All Items</option>
                  <option>Available Only</option>
                  <option>On Sale</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>Recently Added</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Product Image */}
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            NEW
                          </span>
                        )}
                        {product.isSoldOut && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            SOLD OUT
                          </span>
                        )}
                      </div>
                      
                      {/* Remove Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</span>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-black">{settings.currency}{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {settings.currency}{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className={`w-2 h-2 rounded-full ${product.inStock && !product.isSoldOut ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Sizes: {product.size.join(', ')}</span>
                      <span>{product.color}</span>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-4 flex space-x-2">
                      <Link 
                        href={`/product/${product.id}`}
                        className="flex-1 bg-black text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => removeFavorite(product.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
'use client'

import { Search, ShoppingBag, Menu, User, Heart, MessageCircle, LogOut, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/hooks/useAuth'
import { products } from '@/data/products'
import Chat from './Chat'
import NotificationDropdown from './NotificationDropdown'
import UserOffers from './UserOffers'
import NewsletterNotification from './NewsletterNotification'

function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
      const totalItems = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      console.log('🛒 Cart count updated:', totalItems);
      setCartCount(totalItems);
    };

    updateCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Listen for custom cart events
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleCartClick = () => {
    console.log('🛒 Cart button clicked! Navigating to /cart');
    window.location.href = '/cart';
  };

  if (!isMounted) {
    return (
      <div className="relative">
        <button 
          onClick={handleCartClick}
          className="p-3 text-gray-600 hover:text-white hover:bg-black rounded-lg transition-all duration-200 border border-gray-200 hover:border-black shadow-sm"
        >
          <ShoppingBag className="h-6 w-6" />
        </button>
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">0</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={handleCartClick}
        className="p-3 text-gray-600 hover:text-white hover:bg-black rounded-lg transition-all duration-200 border border-gray-200 hover:border-black shadow-sm group"
      >
        <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </div>
  );
}

function FavoriteBadge({ user, isAuthenticated }: { user: any; isAuthenticated: boolean }) {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const updateFavoriteCount = () => {
      // Use user-specific favorites if authenticated, otherwise use global favorites
      const favoritesKey = isAuthenticated && user?.id ? `favorites_${user.id}` : 'favorites';
      const favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
      setFavoriteCount(favorites.length);
    };

    updateFavoriteCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateFavoriteCount);
    
    // Listen for custom favorite events
    window.addEventListener('favoriteChanged', updateFavoriteCount);
    
    return () => {
      window.removeEventListener('storage', updateFavoriteCount);
      window.removeEventListener('favoriteChanged', updateFavoriteCount);
    };
  }, [isAuthenticated, user?.id]); // Add dependencies untuk re-run bila auth status berubah

  if (!isMounted || favoriteCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {favoriteCount > 99 ? '99+' : favoriteCount}
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showUserOffers, setShowUserOffers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { settings, isLoaded } = useSiteSettings()
  const { user, isAuthenticated, isInitialized, logout, setShowAuthModal } = useAuth()

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Filter products based on search query
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6) // Limit to 6 results for dropdown

    setSearchResults(filtered)
    setShowSearchResults(true)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to shop page with search query
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setShowSearchResults(false)
    }
  }

  const handleProductClick = (productId: string) => {
    window.location.href = `/product/${productId}`
    setIsSearchOpen(false)
    setShowSearchResults(false)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && !(event.target as Element)?.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen])

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            {isLoaded && settings.logoUrl && settings.logoUrl !== '' ? (
              <img
                src={settings.logoUrl.includes('data:image') ? settings.logoUrl : `${settings.logoUrl}?v=${Date.now()}`}
                alt={`${settings.storeName} Logo`}
                className="h-8 sm:h-10 md:h-12 w-auto object-contain cursor-pointer"
                key={settings.logoUrl.substring(0, 50)}
                loading="eager"
                onClick={() => window.location.href = '/'}
                onError={(e) => {
                  console.error('❌ Logo failed to load');
                  console.error('Logo URL type:', settings.logoUrl.includes('data:') ? 'base64' : 'file path');
                  console.error('Logo URL length:', settings.logoUrl.length);
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
                onLoad={() => {
                  console.log('✅ Logo loaded successfully');
                  console.log('Logo type:', settings.logoUrl.includes('data:') ? 'base64 image' : 'file: ' + settings.logoUrl);
                }}
              />
            ) : null}
            {/* Fallback text logo */}
            <div className={`flex items-center cursor-pointer ${isLoaded && settings.logoUrl && settings.logoUrl !== '' ? 'hidden' : ''}`} onClick={() => window.location.href = '/'}>
              <span className="text-xl font-bold text-black font-display">{settings.storeName}</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a href="/" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">HOME</a>
            <a href="/new-arrivals" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">NEW ARRIVALS</a>
            <a href="/live-bidding" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">BIDDING</a>
            <a href="/shop" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">SHOP ALL</a>
            <a href="/sold-items" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">SOLD ITEMS</a>
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Favorites */}
            <button 
              onClick={() => window.location.href = '/favorites'}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            >
              <Heart className="h-5 w-5" />
              <FavoriteBadge user={user} isAuthenticated={isAuthenticated} />
            </button>
            
            {/* Notifications */}
            {isInitialized && isAuthenticated && <NotificationDropdown />}
            
            {/* User Authentication */}
            {isInitialized && isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </a>
                      <a
                        href="/my-purchases"
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-3" />
                        My Purchases
                      </a>
                      <button
                        onClick={() => {
                          setShowUserOffers(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        My Offers
                      </button>
                      <button
                        onClick={() => {
                          setShowChat(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Chat Messages
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isInitialized ? (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <User className="h-5 w-5" />
              </button>
            ) : (
              <div className="p-2 w-10 h-10"></div>
            )}
            
            {/* Chat Button (for authenticated users) */}
            {isInitialized && isAuthenticated && (
              <button 
                onClick={() => setShowChat(true)}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all relative"
              >
                <MessageCircle className="h-5 w-5" />
                {/* Chat notification badge could go here */}
              </button>
            )}
            
            {/* Newsletter Notifications */}
            <NewsletterNotification />
            
            {/* Shopping Cart */}
            <CartIcon />
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white search-container shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearchSubmit} className="relative group">
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                
                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for products, brands, or categories..."
                  className="w-full pl-12 pr-24 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm 
                           focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black 
                           transition-all duration-200 shadow-sm hover:shadow-md
                           placeholder-gray-400 font-medium"
                  autoFocus
                />
                
                {/* Search Actions */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {/* Search Submit Button */}
                  {searchQuery.trim() && (
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold 
                               hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      Search
                    </button>
                  )}
                  
                  {/* Close Search Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                      setShowSearchResults(false)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-hidden z-50 backdrop-blur-sm">
                    <div className="p-1">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Quick Results
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                            {searchResults.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Results List */}
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {searchResults.map((product, index) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="w-full flex items-center p-4 hover:bg-gray-50 transition-all duration-150 text-left group border-b border-gray-50/50 last:border-b-0"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                              />
                              {product.isNew && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-black">{product.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{product.brand} • {product.category}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm font-bold text-black">RM{product.price}</p>
                                <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  View Details →
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* View All Results */}
                      <div className="p-3 border-t border-gray-50 bg-gray-50/30">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full py-3 text-center text-black font-semibold hover:bg-white rounded-xl transition-all duration-150 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                          <span className="flex items-center justify-center gap-2">
                            View all results for "<span className="font-bold">{searchQuery}</span>"
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* No Results */}
                {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-8 text-center z-50">
                    <div className="text-gray-300 mb-4">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-1">No results for "<span className="font-medium">{searchQuery}</span>"</p>
                    <p className="text-sm text-gray-500 mb-4">Try different keywords or check spelling</p>
                    <div className="flex gap-2 justify-center">
                      {['Nike', 'Jackets', 'T-Shirts'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearch(suggestion)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
              
              {/* Search Tips */}
              {searchQuery.length === 0 && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-gray-100">
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 mr-2">🔥 Trending:</span>
                    {[
                      { term: 'Nike', emoji: '👟' },
                      { term: 'Jackets', emoji: '🧥' },
                      { term: 'T-Shirts', emoji: '👕' },
                      { term: 'Supreme', emoji: '💯' }
                    ].map(({ term, emoji }) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="group text-xs bg-white hover:bg-black hover:text-white px-4 py-2 rounded-full text-gray-700 transition-all duration-200 border border-gray-200 hover:border-black shadow-sm hover:shadow-md font-medium"
                      >
                        <span className="mr-1">{emoji}</span>
                        {term}
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500">
                      💡 Tip: Try searching by brand, category, or product name
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat Component */}
        <Chat isOpen={showChat} onClose={() => setShowChat(false)} />
        
        {/* User Offers Modal */}
        {showUserOffers && (
          <UserOffers onClose={() => setShowUserOffers(false)} />
        )}
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="/" className="text-gray-900 font-semibold hover:text-black">HOME</a>
              <a href="/new-arrivals" className="text-gray-900 font-semibold hover:text-black">NEW ARRIVALS</a>
              <a href="/live-bidding" className="text-gray-900 font-semibold hover:text-black">BIDDING</a>
              <a href="/shop" className="text-gray-900 font-semibold hover:text-black">SHOP ALL</a>
              <a href="/sold-items" className="text-gray-900 font-semibold hover:text-black">SOLD ITEMS</a>
              <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">•</a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

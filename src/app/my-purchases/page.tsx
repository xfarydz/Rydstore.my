'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Phone, ArrowLeft, Home, ShoppingBag, Heart, Menu, User } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Footer from '@/components/Footer';

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  size: string;
  color: string;
  amount: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: any;
  purchaseDate: string;
  timestamp?: string;
  status: 'paid' | 'preparing' | 'in_transit' | 'delivered';
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function MyPurchasesPage() {
  const { settings } = useSiteSettings();
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      loadUserPurchases(parsedUser.email);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserPurchases = (userEmail: string) => {
    try {
      // Load from sales records where user is the buyer
      const salesRecords = JSON.parse(localStorage.getItem('salesRecords') || '[]');
      console.log('All sales records:', salesRecords);
      console.log('Looking for purchases by email:', userEmail);
      
      const userPurchases = salesRecords
        .filter((sale: any) => {
          // Check both flattened and nested buyer email formats
          const buyerEmail = sale.buyerEmail || sale.buyer?.email;
          const matches = buyerEmail === userEmail;
          console.log(`Sale ${sale.id}: buyerEmail=${buyerEmail}, matches=${matches}`);
          return matches;
        })
        .map((sale: any) => {
          // Map old status values to new ones for backwards compatibility
          let mappedStatus = sale.status || 'paid';
          if (mappedStatus === 'packing') mappedStatus = 'preparing';
          if (mappedStatus === 'shipped') mappedStatus = 'in_transit';
          
          return {
            ...sale,
            status: mappedStatus,
            // Ensure we have the required fields for display
            productName: sale.productName || 'Unknown Product',
            productBrand: sale.productBrand || sale.brand || 'Unknown Brand',
            size: sale.size || 'N/A',
            color: sale.color || 'N/A'
          };
        })
        .sort((a: any, b: any) => new Date(b.timestamp || b.purchaseDate).getTime() - new Date(a.timestamp || a.purchaseDate).getTime());
      
      console.log('User purchases found:', userPurchases);
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return '💰';
      case 'preparing': return '📦';
      case 'in_transit': return '🚛';
      case 'delivered': return '✅';
      default: return '💰';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Done';
      case 'preparing': return 'Preparing';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Completed';
      default: return 'Payment Done';
    }
  };

  const handleTrackingClick = (trackingNumber: string, phone: string) => {
    if (trackingNumber && phone) {
      // Create WhatsApp message with tracking info
      const message = `Hello! Your order tracking number is: ${trackingNumber}. You can track your package using this number.`;
      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt={settings.storeName}
                    className="h-8 w-auto"
                  />
                ) : (
                  <div className="text-xl font-bold text-black">{settings.storeName}</div>
                )}
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="/" className="flex items-center text-gray-700 hover:text-black transition-colors">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </a>
                <a href="/shop" className="flex items-center text-gray-700 hover:text-black transition-colors">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop
                </a>
                <a href="/favorites" className="flex items-center text-gray-700 hover:text-black transition-colors">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </a>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </a>
                <a href="/shop" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                  <ShoppingBag className="h-4 w-4 mr-3" />
                  Shop
                </a>
                <a href="/favorites" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                  <Heart className="h-4 w-4 mr-3" />
                  Favorites
                </a>
              </div>
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">My Purchases</h1>
            <p className="text-gray-600 mb-8">Please log in to view your purchase history and track your orders.</p>
            <div className="space-y-4">
              <a
                href="/profile"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Login / Register
              </a>
              <div>
                <a href="/" className="text-gray-600 hover:text-black transition-colors">
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.storeName}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="text-xl font-bold text-black">{settings.storeName}</div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="flex items-center text-gray-700 hover:text-black transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
              <a href="/shop" className="flex items-center text-gray-700 hover:text-black transition-colors">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop
              </a>
              <a href="/favorites" className="flex items-center text-gray-700 hover:text-black transition-colors">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </a>
              <a href="/profile" className="flex items-center text-gray-700 hover:text-black transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs mr-2">
                  {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                My Profile
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                <Home className="h-4 w-4 mr-3" />
                Home
              </a>
              <a href="/shop" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                <ShoppingBag className="h-4 w-4 mr-3" />
                Shop
              </a>
              <a href="/favorites" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                <Heart className="h-4 w-4 mr-3" />
                Favorites
              </a>
              <a href="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs mr-3">
                  {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                My Profile
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <a href="/" className="text-gray-600 hover:text-black transition-colors mr-4">
              <ArrowLeft className="h-5 w-5" />
            </a>
            <h1 className="text-3xl font-bold text-black">My Purchases</h1>
          </div>
          <p className="text-gray-600">Track your orders and view purchase history</p>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Your purchase history will appear here once you make your first order.</p>
            <a
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <img
                        src={purchase.productImage}
                        alt={purchase.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{purchase.productName}</h3>
                        <p className="text-sm text-gray-600">{purchase.productBrand}</p>
                        <p className="text-sm text-gray-500">
                          Size: {purchase.size} • Color: {purchase.color}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black">RM{purchase.amount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(purchase.timestamp || purchase.purchaseDate).toLocaleDateString('en-MY')}
                      </p>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
                          {getStatusIcon(purchase.status)}
                          <span className="ml-1">{getStatusText(purchase.status)}</span>
                        </span>
                        {purchase.trackingNumber && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                            Track: {purchase.trackingNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Order ID: {purchase.id}
                      </div>
                    </div>

                    {/* Tracking Information */}
                    {purchase.trackingNumber && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                            <p className="text-lg font-mono text-black">{purchase.trackingNumber}</p>
                            {purchase.estimatedDelivery && (
                              <p className="text-sm text-gray-600">
                                Est. Delivery: {new Date(purchase.estimatedDelivery).toLocaleDateString('en-MY')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleTrackingClick(purchase.trackingNumber!, purchase.buyerPhone)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Send to WhatsApp
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Progress Timeline */}
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        {['paid', 'preparing', 'in_transit', 'delivered'].map((status, index) => {
                          const isActive = ['paid', 'preparing', 'in_transit', 'delivered'].indexOf(purchase.status) >= index;
                          const isCurrent = purchase.status === status;
                          
                          return (
                            <div key={status} className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                isActive 
                                  ? isCurrent 
                                    ? 'bg-black text-white' 
                                    : 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-500'
                              }`}>
                                {isActive && !isCurrent ? '✓' : index + 1}
                              </div>
                              <span className={`ml-2 text-sm ${isActive ? 'text-black' : 'text-gray-500'}`}>
                                {getStatusText(status)}
                              </span>
                              {index < 3 && (
                                <div className={`w-8 h-0.5 mx-2 ${
                                  ['paid', 'packing', 'shipped', 'delivered'].indexOf(purchase.status) > index 
                                    ? 'bg-green-400' 
                                    : 'bg-gray-300'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
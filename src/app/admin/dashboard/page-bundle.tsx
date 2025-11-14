'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, Settings, LogOut, Edit, Trash2, Upload, Globe, Check } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../../../hooks/useSiteSettings';

interface BundleProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  size: string[];
  color: string;
  isAvailable: boolean; // Available for sale
  isSoldOut: boolean;   // Already sold
  isNew?: boolean;
  description?: string;
  isBundleItem?: boolean;
  offers?: Offer[];
}

interface Offer {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  offeredPrice: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  paidAt?: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BundleProduct | null>(null);
  const { settings, updateSettings } = useSiteSettings();
  const router = useRouter();

  // Function to reload products data
  const reloadProducts = () => {
    import('../../../data/products').then((module) => {
      const originalProducts = module.products;
      
      // Convert to bundle products with localStorage data
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      
      const bundleProducts = originalProducts.map(product => {
        const adminProduct = adminProducts.find((ap: any) => ap.id === product.id);
        return {
          ...product,
          isAvailable: adminProduct ? adminProduct.inStock && !adminProduct.isSoldOut : product.inStock,
          isSoldOut: adminProduct ? adminProduct.isSoldOut : false,
          isBundleItem: true,
          offers: adminProduct?.offers || []
        };
      });

      setProducts(bundleProducts);
    });
  };

  useEffect(() => {
    // Check if admin is authenticated
    if (!localStorage.getItem('adminAuth')) {
      router.push('/admin');
      return;
    }

    reloadProducts();
    
    // Auto-refresh products every 10 seconds to catch new offers
    const interval = setInterval(reloadProducts, 10000);
    
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  const saveProducts = (newProducts: BundleProduct[]) => {
    setProducts(newProducts);
    localStorage.setItem('adminProducts', JSON.stringify(newProducts));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this bundle item?')) {
      const newProducts = products.filter(p => p.id !== id);
      saveProducts(newProducts);
    }
  };

  const markAsSold = (id: string) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, isSoldOut: true, isAvailable: false } : p
    );
    saveProducts(updatedProducts);
  };

  const markAsAvailable = (id: string) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, isSoldOut: false, isAvailable: true } : p
    );
    saveProducts(updatedProducts);
  };

  // Bundle-specific stats
  const availableItems = products.filter(p => p.isAvailable && !p.isSoldOut).length;
  const soldItems = products.filter(p => p.isSoldOut).length;
  const totalRevenue = products.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
  const pendingOffers = products.reduce((sum, p) => sum + (p.offers?.filter(o => o.status === 'pending').length || 0), 0);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Bundle Items', icon: ShoppingCart },
    { id: 'offers', label: 'Offers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Total Items', value: products.length, color: 'bg-blue-500' },
    { label: 'Available', value: availableItems, color: 'bg-green-500' },
    { label: 'Sold', value: soldItems, color: 'bg-purple-500' },
    { label: 'Revenue', value: `${settings.currency}${totalRevenue.toLocaleString()}`, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">RYDSTORE.MY</h1>
          <p className="text-sm text-gray-300">Bundle Items Admin</p>
        </div>
        
        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                activeTab === item.id ? 'bg-gray-800 border-r-2 border-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black capitalize">{activeTab}</h2>
              <p className="text-gray-600">Manage your bundle items and offers</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                    {index === 0 && <Package className="h-6 w-6 text-white" />}
                    {index === 1 && <Check className="h-6 w-6 text-white" />}
                    {index === 2 && <ShoppingCart className="h-6 w-6 text-white" />}
                    {index === 3 && <Globe className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-black">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Sold Items */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Recently Sold</h3>
                <div className="space-y-4">
                  {products
                    .filter(p => p.isSoldOut)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-black">{product.name}</p>
                          <p className="text-sm text-gray-600">{settings.currency}{product.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">SOLD</span>
                      </div>
                    ))}
                  {soldItems === 0 && (
                    <p className="text-gray-500 text-center py-8">No items sold yet</p>
                  )}
                </div>
              </div>

              {/* Pending Offers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Pending Offers ({pendingOffers})</h3>
                <div className="space-y-4">
                  {products
                    .filter(p => p.offers?.some(o => o.status === 'pending'))
                    .slice(0, 5)
                    .map((product) => {
                      const pendingOffer = product.offers?.find(o => o.status === 'pending');
                      return (
                        <div key={product.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium text-black">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Offer: {settings.currency}{pendingOffer?.offeredPrice.toLocaleString()} 
                              (Original: {settings.currency}{product.price.toLocaleString()})
                            </p>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">PENDING</span>
                        </div>
                      );
                    })}
                  {pendingOffers === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending offers</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-black">Bundle Items</h3>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bundle Item
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold text-black mb-2">{product.name}</h4>
                        <p className="text-gray-600 mb-2">{product.brand}</p>
                        <p className="text-lg font-bold text-black mb-3">{settings.currency}{product.price.toLocaleString()}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.isSoldOut 
                              ? 'bg-red-100 text-red-800' 
                              : product.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.isSoldOut ? 'SOLD' : product.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </span>
                          
                          {(product.offers?.filter(o => o.status === 'pending').length || 0) > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              {product.offers?.filter(o => o.status === 'pending').length || 0} Offers
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {!product.isSoldOut && (
                            <button 
                              onClick={() => markAsSold(product.id)}
                              className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
                            >
                              Mark Sold
                            </button>
                          )}
                          
                          {product.isSoldOut && (
                            <button 
                              onClick={() => markAsAvailable(product.id)}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Mark Available
                            </button>
                          )}
                          
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
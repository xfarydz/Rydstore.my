'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, Settings, LogOut, Edit, Trash2, Upload, Globe, Check } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../../../hooks/useSiteSettings';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { settings, updateSettings } = useSiteSettings();
  const router = useRouter();

  // Function to reload products data
  const reloadProducts = () => {
    import('../../../data/products').then((module) => {
      const originalProducts = module.products;
      
      // Load admin products with localStorage data
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      
      const mergedProducts = originalProducts.map(product => {
        const adminProduct = adminProducts.find((ap: any) => ap.id === product.id);
        return {
          ...product,
          inStock: adminProduct ? adminProduct.inStock : product.inStock,
          isSoldOut: adminProduct ? adminProduct.isSoldOut : false,
          offers: adminProduct?.offers || []
        };
      });

      setProducts(mergedProducts);
      
      // Update localStorage with merged data if needed
      if (adminProducts.length === 0) {
        // Initialize with default data for single-unit bundle items
        const initialProducts = mergedProducts.map(p => ({
          ...p,
          offers: []
        }));
        localStorage.setItem('adminProducts', JSON.stringify(initialProducts));
      }
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

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('adminProducts', JSON.stringify(newProducts));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const newProducts = products.filter(p => p.id !== id);
      saveProducts(newProducts);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'offers', label: 'Offers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Updated stats for single-unit items (no quantities)
  const totalSold = products.filter(p => p.isSoldOut).length;
  const totalRevenue = products.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
  
  const stats = [
    { label: 'Total Products', value: products.length, color: 'bg-blue-500' },
    { label: 'In Stock', value: products.filter(p => p.inStock && !p.isSoldOut).length, color: 'bg-green-500' },
    { label: 'Sold Out', value: products.filter(p => p.isSoldOut || !p.inStock).length, color: 'bg-red-500' },
    { label: 'Total Sold', value: totalSold, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">RYDSTORE.MY</h1>
          <p className="text-sm text-gray-300">Admin Panel</p>
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
              <p className="text-gray-600">Manage your store and view analytics</p>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            )}
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

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                    <p className="text-blue-600 text-sm font-medium">Total Products</p>
                    <p className="text-blue-100 text-xs mt-1">{products.filter(p => p.inStock).length} in stock</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{settings.currency}{totalRevenue.toLocaleString()}</p>
                    <p className="text-green-600 text-sm font-medium">Revenue</p>
                    <p className="text-green-100 text-xs mt-1">From {totalSold} sold items</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{totalSold}</p>
                    <p className="text-purple-600 text-sm font-medium">Items Sold</p>
                    <p className="text-purple-100 text-xs mt-1">{products.filter(p => p.isSoldOut).length} items sold</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Upload className="h-5 w-5 text-orange-600 mr-1" />
                    </div>
                    <p className="text-orange-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.inStock && !p.isSoldOut).length}</p>
                    <p className="text-orange-100 text-xs mt-1">Ready for sale</p>
                  </div>
                </div>
              </div>

              {/* Top Selling Products (Recently Sold) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Recently Sold Items</h3>
                <div className="space-y-4">
                  {products
                    .filter(p => p.isSoldOut)
                    .slice(0, 6)
                    .map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                          <span className="text-sm text-gray-500">SOLD</span>
                        </div>
                        <div className={`w-full h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500`}></div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {['Nike', 'Adidas', 'Supreme', 'Off-White', 'Jordan'].map((brand) => {
                    const brandProducts = products.filter(p => p.brand === brand);
                    const brandRevenue = brandProducts.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
                    return (
                      <div key={brand} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{brand}</span>
                        <span className="text-green-600 font-bold">{settings.currency}{brandRevenue.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Store Health</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-green-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-green-600">{products.filter(p => p.inStock && !p.isSoldOut).length}</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-yellow-600 text-sm font-medium">Pending Offers</p>
                    <p className="text-2xl font-bold text-yellow-600">{products.reduce((sum, p) => sum + (p.offers?.filter(o => o.status === 'pending').length || 0), 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingCart className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-red-600 text-sm font-medium">Sold Out</p>
                    <p className="text-2xl font-bold text-red-600">{products.filter(p => p.isSoldOut || !p.inStock).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-black">All Products - Single Unit Items</h3>
                <p className="text-gray-600">Each product is a unique item (1 unit only)</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold text-black mb-2 truncate">{product.name}</h4>
                        <p className="text-gray-600 mb-2 text-sm">{product.brand}</p>
                        <p className="text-lg font-bold text-black mb-3">{settings.currency}{product.price.toLocaleString()}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isSoldOut 
                              ? 'bg-red-100 text-red-800' 
                              : product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.isSoldOut ? 'SOLD' : product.inStock ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </span>
                          
                          {(product.offers?.filter(o => o.status === 'pending').length || 0) > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              {product.offers?.filter(o => o.status === 'pending').length || 0} Offers
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
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
                
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product</p>
                    <button 
                      onClick={() => setShowAddProduct(true)}
                      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Add Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-black">Customer Offers</h3>
                <p className="text-gray-600">Manage price offers from customers</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {products
                    .filter(p => p.offers && p.offers.length > 0)
                    .map((product) => 
                      product.offers?.map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex space-x-4">
                              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div>
                                <h4 className="font-bold text-black">{product.name}</h4>
                                <p className="text-gray-600">{product.brand}</p>
                                <p className="text-sm text-gray-500">Original: {settings.currency}{product.price.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{settings.currency}{offer.offeredPrice.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{offer.customerName}</p>
                              <p className="text-xs text-gray-500">{offer.customerEmail}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {offer.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          {offer.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{offer.message}</p>
                            </div>
                          )}
                          
                          {offer.status === 'pending' && (
                            <div className="mt-4 flex space-x-2">
                              <button 
                                onClick={() => {
                                  // Accept offer logic
                                  const updatedProducts = products.map(p => {
                                    if (p.id === product.id) {
                                      const updatedOffers = p.offers?.map(o => 
                                        o.id === offer.id ? { ...o, status: 'accepted' as const } : o
                                      );
                                      return { ...p, offers: updatedOffers };
                                    }
                                    return p;
                                  });
                                  saveProducts(updatedProducts);
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Accept Offer
                              </button>
                              <button 
                                onClick={() => {
                                  // Reject offer logic
                                  const updatedProducts = products.map(p => {
                                    if (p.id === product.id) {
                                      const updatedOffers = p.offers?.map(o => 
                                        o.id === offer.id ? { ...o, status: 'rejected' as const } : o
                                      );
                                      return { ...p, offers: updatedOffers };
                                    }
                                    return p;
                                  });
                                  saveProducts(updatedProducts);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Reject Offer
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                </div>
                
                {products.every(p => !p.offers || p.offers.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                    <p className="text-gray-600">Customer offers will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
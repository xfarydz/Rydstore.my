'use client';

import { useState, useEffect } from 'react';
import { User, Edit3, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Malaysia'
    }
  });

  useEffect(() => {
    // Check localStorage for user
    try {
      const savedUser = localStorage.getItem('currentUser');
      console.log('Checking saved user:', savedUser);
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user:', parsedUser);
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        setFormData({
          fullName: parsedUser.fullName || parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || {
            street: '',
            city: '',
            state: '',
            postcode: '',
            country: 'Malaysia'
          }
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  const createDemoUser = () => {
    const demoUser = {
      id: 'user-demo',
      name: 'Demo User',
      fullName: 'Demo User Full Name',
      email: 'demo@faridstore.com',
      phone: '+60123456789',
      address: {
        street: '123 Demo Street',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        postcode: '50000',
        country: 'Malaysia'
      },
      joinedDate: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    window.location.reload();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to login to access your profile page.</p>
          <div className="space-y-3">
            <button
              onClick={createDemoUser}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Demo Account & Access Profile
            </button>
            <a
              href="/"
              className="block w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Homepage
            </a>
            <p className="text-sm text-gray-500">
              Click "Create Demo Account" to test profile features, or go to homepage to register properly
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl shadow-lg border-l-4 ${
            message.includes('success') 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-700' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500 text-red-700'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                message.includes('success') ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Photo & Quick Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mt-4 text-gray-900">{formData.fullName || 'User'}</h3>
                <p className="text-gray-500 text-sm">{formData.email}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-MY', {
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Account Status</p>
                    <p className="font-semibold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <p className="text-gray-600 mt-1">Update your personal details and preferences</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name *
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter your full name"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">{formData.fullName}</div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address *
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter your email address"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">{formData.email}</div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number *
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="e.g. +60123456789"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">{formData.phone}</div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Member Since
                      </label>
                      <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 font-medium text-gray-800">
                        {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                    <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Street Address
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter your street address"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">
                          {formData.address.street || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          City
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.address.city}
                              onChange={(e) => handleInputChange('address.city', e.target.value)}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                              placeholder="Enter your city"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">
                            {formData.address.city || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          State
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <select
                              value={formData.address.state}
                              onChange={(e) => handleInputChange('address.state', e.target.value)}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                            >
                              <option value="">Select State</option>
                              <option value="Johor">Johor</option>
                              <option value="Kedah">Kedah</option>
                              <option value="Kelantan">Kelantan</option>
                              <option value="Kuala Lumpur">Kuala Lumpur</option>
                              <option value="Melaka">Melaka</option>
                              <option value="Penang">Penang</option>
                              <option value="Selangor">Selangor</option>
                              <option value="Sabah">Sabah</option>
                              <option value="Sarawak">Sarawak</option>
                              <option value="Terengganu">Terengganu</option>
                              <option value="Pahang">Pahang</option>
                              <option value="Perak">Perak</option>
                              <option value="Perlis">Perlis</option>
                              <option value="Negeri Sembilan">Negeri Sembilan</option>
                              <option value="Putrajaya">Putrajaya</option>
                              <option value="Labuan">Labuan</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-100 font-medium text-gray-800">
                            {formData.address.state || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Need help?</p>
                  <p className="text-xs text-gray-600">Contact our support team</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <a
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  ← Back to Homepage
                </a>
                <a
                  href="/shop"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
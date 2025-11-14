'use client';

import { useState, useEffect } from 'react';
import { User, Edit3, Save, X, ArrowLeft, Home, ShoppingBag, Heart, Menu } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { validateMalaysianPhone, validateEmail, validatePostcode } from '@/utils/profileValidation';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const { settings } = useSiteSettings();
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
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
    // Check localStorage for user directly
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
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
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validateMalaysianPhone(formData.phone)) {
      errors.phone = 'Please enter a valid Malaysian phone number (e.g., +60123456789 or 0123456789)';
    }
    
    // Validate address
    if (!formData.address.street.trim()) {
      errors.street = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!formData.address.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    } else if (!validatePostcode(formData.address.postcode)) {
      errors.postcode = 'Please enter a valid 5-digit Malaysian postcode';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setMessage('Please fix the validation errors below.');
      setLoading(false);
      return;
    }
    
    try {
      // Update localStorage directly
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // ALSO UPDATE registeredUsers array so admin can see updated data
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = registeredUsers.findIndex((u: any) => u.email === updatedUser.email);
      if (userIndex !== -1) {
        // Update existing user in registeredUsers array
        registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...formData };
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Debug: Log what we saved
        console.log('=== PROFILE SAVE DEBUG ===');
        console.log('Updated user in registeredUsers:', registeredUsers[userIndex]);
        console.log('Form data saved:', formData);
        console.log('Updated registeredUsers array:', registeredUsers);
      } else {
        console.log('ERROR: User not found in registeredUsers array for email:', updatedUser.email);
      }
      
      setMessage('✅ Profile updated successfully! You can now make purchases.');
      setIsEditing(false);
      setValidationErrors({});
      setTimeout(() => setMessage(''), 5000);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Login Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">You need to login to access your profile page.</p>
          <div className="space-y-4">
            <button
              onClick={createDemoUser}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              ✨ Create Demo Account
            </button>
            <a
              href="/"
              className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              🏠 Go to Homepage
            </a>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              Click "Create Demo Account" to test profile features instantly
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as main page but without search */}
      <header className="bg-white border-b border-gray-200 shadow-sm">      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0">
                <a href="/" className="flex items-center">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={`${settings.storeName} Logo`}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xl font-bold text-black">{settings.storeName}</span>
                  )}
                </a>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              <a href="/" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">HOME</a>
              <a href="/new-arrivals" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">NEW ARRIVALS</a>
              <a href="/shop" className="text-gray-800 hover:text-black font-semibold transition-colors text-sm tracking-wide">SHOP ALL</a>
            </nav>
            
            {/* Right Side Actions - No Search Button */}
            <div className="flex items-center space-x-6">
              {/* Favorites */}
              <button 
                onClick={() => window.location.href = '/favorites'}
                className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <Heart className="h-5 w-5" />
              </button>
              
              {/* User Profile - Always show as active */}
              <div className="relative">
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">{user?.name || 'Profile'}</span>
                </button>
                
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-600">{user?.email || 'user@email.com'}</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="/"
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <Home className="h-4 w-4 mr-3" />
                        Home
                      </a>
                      <a
                        href="/shop"
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <ShoppingBag className="h-4 w-4 mr-3" />
                        Shop
                      </a>
                      <a
                        href="/favorites"
                        className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4 mr-3" />
                        Favorites
                      </a>
                      <button
                        onClick={() => {
                          localStorage.removeItem('currentUser');
                          window.location.href = '/';
                        }}
                        className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Shopping Cart */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                  <ShoppingBag className="h-5 w-5" />
                </button>
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">0</span>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Back Button & Page Header - Same Line */}
        <div className="flex items-center mb-8 relative">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">Account Settings</h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Profile Photo</h2>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <User className="w-4 h-4" />
                Change Photo
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Profile Information</h2>
                  <p className="text-gray-300 text-sm">Manage your personal details and preferences</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 shadow-lg font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Personal Information Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Personal Information</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                        {formData.fullName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                        {formData.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number *
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm ${
                            validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="e.g. +60123456789"
                        />
                        {validationErrors.phone && (
                          <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.phone}</p>
                        )}
                      </div>
                    ) : (
                      <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                        {formData.phone}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Member Since
                    </label>
                    <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 font-medium text-gray-800">
                      {new Date(user.joinedDate).toLocaleDateString('en-MY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Address Information</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                        {formData.address.street || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                          placeholder="Enter your city"
                        />
                      ) : (
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                          {formData.address.city || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        State
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                        >
                          <option value="">Select State</option>
                          <option value="Johor">Johor</option>
                          <option value="Kedah">Kedah</option>
                          <option value="Kelantan">Kelantan</option>
                          <option value="Kuala Lumpur">Kuala Lumpur</option>
                          <option value="Labuan">Labuan</option>
                          <option value="Melaka">Melaka</option>
                          <option value="Negeri Sembilan">Negeri Sembilan</option>
                          <option value="Pahang">Pahang</option>
                          <option value="Penang">Penang</option>
                          <option value="Perak">Perak</option>
                          <option value="Perlis">Perlis</option>
                          <option value="Putrajaya">Putrajaya</option>
                          <option value="Sabah">Sabah</option>
                          <option value="Sarawak">Sarawak</option>
                          <option value="Selangor">Selangor</option>
                          <option value="Terengganu">Terengganu</option>
                        </select>
                      ) : (
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                          {formData.address.state || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Postcode
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address.postcode}
                          onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                          placeholder="e.g. 50000"
                        />
                      ) : (
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 font-medium text-gray-800">
                          {formData.address.postcode || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                      >
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Brunei">Brunei</option>
                      </select>
                    ) : (
                      <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 font-medium text-gray-800">
                        {formData.address.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
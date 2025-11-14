'use client';

import { useState } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      
      if (isLoginMode) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        if (!formData.name || !formData.phone) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        success = await register(formData.name, formData.email, formData.phone, formData.password);
        if (!success) {
          setError('Email already exists');
        }
      }

      if (success) {
        setShowAuthModal(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-4 border-black">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-black text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={() => setShowAuthModal(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-black text-white px-4 py-3 rounded-lg text-sm border-2 border-gray-300">
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white"
                  placeholder="Enter your full name"
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white"
                  placeholder="Enter your phone number"
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-black text-lg"
          >
            {loading ? 'Please wait...' : isLoginMode ? '● SIGN IN ●' : '● CREATE ACCOUNT ●'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="px-6 pb-6 text-center border-t-2 border-black pt-4 bg-gray-50">
          <p className="text-black font-medium">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setFormData({ name: '', email: '', phone: '', password: '' });
              }}
              className="ml-2 text-black font-bold hover:bg-black hover:text-white px-3 py-1 rounded transition-all border border-black"
            >
              {isLoginMode ? 'SIGN UP' : 'SIGN IN'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
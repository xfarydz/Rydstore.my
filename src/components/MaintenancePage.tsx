'use client'

import React from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function MaintenancePage() {
  const { settings } = useSiteSettings()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        {/* Logo Section */}
        <div className="mb-12">
          {settings.logoUrl ? (
            <div className="mb-6">
              <img 
                src={settings.logoUrl} 
                alt={settings.storeName}
                className="w-32 h-32 mx-auto mb-6 object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-5xl">{settings.storeName.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-5xl font-black text-black mb-3 font-display">{settings.storeName.toUpperCase()}</h1>
          <p className="text-gray-600 font-medium tracking-wide">ITEM SELECTED</p>
        </div>
        
        {/* Main Message */}
        <div className="bg-black rounded-3xl p-10 mb-10 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
            Under Maintenance
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed font-body">
            We're working hard to bring you an even better shopping experience. 
            Our website will be back online soon with amazing new features!
          </p>
          
          {/* Progress Bar */}
          <div className="bg-gray-800 rounded-full h-4 mb-6">
            <div className="bg-white h-4 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-gray-400 font-medium">System Updates in Progress...</p>
        </div>
        
        {/* Features Being Updated */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-bold text-black mb-6 font-display">What's Coming</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-gray-800">Enhanced Product Catalog</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-gray-800">Improved User Experience</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">⏳</span>
                </div>
                <span className="font-medium text-gray-600">New Payment Options</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">⏳</span>
                </div>
                <span className="font-medium text-gray-600">Mobile App Integration</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 font-body">
              📧 Questions? Email us at: 
              <a href={`mailto:hello@${settings.storeName.toLowerCase().replace(/\s+/g, '')}.com`} className="text-black hover:text-gray-600 ml-1 font-bold underline">
                hello@{settings.storeName.toLowerCase().replace(/\s+/g, '')}.com
              </a>
            </p>
            <p className="text-gray-700 mt-2 font-body">
              📱 Follow us for updates: 
              <a href="https://instagram.com/rydstore.my" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-600 ml-1">
                <svg className="w-6 h-6 inline" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </p>
          </div>
          
          {/* Estimated Time */}
          <div className="bg-black rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-lg mb-2">
              ⏰ Expected to be back: <span className="text-gray-300">Soon</span>
            </p>
            <p className="text-gray-400 text-sm">We'll notify our newsletter subscribers first!</p>
          </div>

        </div>
      </div>
    </div>
  )
}
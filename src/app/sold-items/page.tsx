'use client';

import React from 'react'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'
import { useAllProducts } from '@/hooks/useProducts'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function SoldItemsPage() {
  const allProducts = useAllProducts()
  const { settings } = useSiteSettings()
  
  // Filter sold out products
  const soldProducts = allProducts.filter(product => product.isSoldOut || !product.inStock)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AuthModal />
      
      {/* Sold Items Hero Section */}
      <section 
        className={`relative text-white py-20 ${!settings.heroBackgroundImage ? 'bg-black' : ''}`}
        style={settings.heroBackgroundImage ? {
          backgroundImage: `url("${settings.heroBackgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        } : {}}
      >
        {/* Background Overlay for readability */}
        {settings.heroBackgroundImage && (
          <div className="absolute inset-0 bg-black/50"></div>
        )}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            SOLD OUT ITEMS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Browse previously sold items - check back for restocks
          </p>
        </div>
      </section>

      {/* Main Sold Items Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">          
          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  SOLD OUT COLLECTION
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold text-black">{soldProducts.length} sold items</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">SORT BY:</span>
                <select className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>Recently Sold</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Brand A-Z</option>
                  <option>Category</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {soldProducts.length} sold out products
              </p>
            </div>
            
            <ProductGrid products={soldProducts} />

            {/* No Sold Products Found */}
            {soldProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All items in stock!</h3>
                <p className="text-gray-500">No sold out items at the moment. Check back later.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
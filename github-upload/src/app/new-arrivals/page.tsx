'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'
import { useAllProducts } from '@/hooks/useProducts'
import { useSiteSettings } from '@/hooks/useSiteSettings'

// Helper function to check if product is new (within 4 days of creation) - Same as ProductCard
const isProductNew = (product: any): boolean => {
  if (!product.createdAt) return false;
  
  const createdDate = new Date(product.createdAt);
  const currentDate = new Date();
  const daysDifference = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference <= 4;
};

export default function NewArrivalsPage() {
  const products = useAllProducts()
  const { settings } = useSiteSettings()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Filter products that are new arrivals (same logic as JUST ARRIVED label)
  // Only show available products (not sold out) in new arrivals
  const newArrivals = products.filter(product => 
    isProductNew(product) && product.inStock && !product.isSoldOut
  )

  // Sort by newest first
  const sortedNewArrivals = newArrivals.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AuthModal />
      
      {/* Hero Section */}
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
            NEW ARRIVALS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Fresh drops from the last 4 days
          </p>
          {sortedNewArrivals.length > 0 && (
            <p className="text-lg text-yellow-400 mt-4">
              🔥 {sortedNewArrivals.length} new items just dropped!
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Products Available */}
        {sortedNewArrivals.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                LATEST DROPS
              </h2>
              <p className="text-gray-600">
                <span className="font-semibold text-black">{sortedNewArrivals.length} new arrivals</span>
              </p>
            </div>
            
            {/* Product Grid */}
            <ProductGrid products={sortedNewArrivals} />
            
            {/* Browse More Button */}
            <div className="text-center mt-12">
              <a 
                href="/shop"
                className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg inline-block"
              >
                VIEW ALL PRODUCTS
              </a>
            </div>
          </>
        ) : (
          /* No New Arrivals */
          <div className="text-center py-20">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              COMING SOON NEW DROP!
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              No new arrivals in the last 4 days. Stay tuned for fresh drops coming your way!
            </p>
            <div className="space-y-4 text-gray-500 text-lg">
              <p>🔔 Follow us on Instagram @rydstore.my for updates</p>
              <p>⏰ New drops happen regularly - check back soon!</p>
              <p>📱 Contact +60174694966 for special requests</p>
            </div>
            
            {/* Browse Current Collection */}
            <div className="mt-12 space-x-4">
              <a 
                href="/shop"
                className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg inline-block"
              >
                BROWSE CURRENT COLLECTION
              </a>
              <a 
                href="/"
                className="bg-gray-200 text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-lg inline-block"
              >
                BACK TO HOME
              </a>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
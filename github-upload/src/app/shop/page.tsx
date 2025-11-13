'use client'

import React, { Suspense } from 'react'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import FilterSidebar from '@/components/FilterSidebar'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'
import MaintenancePage from '@/components/MaintenancePage'
import { useProducts } from '@/hooks/useProducts'
import { FilterProvider, useFilters } from '@/hooks/useFilters'
import { useSiteSettings } from '@/hooks/useSiteSettings'

function ShopContent() {
  const products = useProducts()
  const { applyFilters, filters } = useFilters()
  const { settings } = useSiteSettings()
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Apply filters to products
  const filteredProducts = applyFilters(products)

  // Check if maintenance mode is enabled
  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

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
      
      {/* Shop Hero Section */}
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
            SHOP ALL
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Browse all our products with advanced filtering options
          </p>
        </div>
      </section>

      {/* Main Shop Content with Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>
          
          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  {filters.searchQuery ? `SEARCH: "${filters.searchQuery}"` : 'ALL PRODUCTS'}
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold text-black">{products.length} total items</span>
                </p>
                {filters.searchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔍 Showing search results for &quot;{filters.searchQuery}&quot;
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">SORT BY:</span>
                <select className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Sellers</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredProducts.length} products found
                {filteredProducts.length !== products.length && (
                  <span className="text-black font-semibold"> (filtered from {products.length} total)</span>
                )}
              </p>
            </div>
            
            <ProductGrid products={filteredProducts} />
            
            {/* Load More Button */}
            {filteredProducts.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                  LOAD MORE PRODUCTS
                </button>
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    }>
      <FilterProvider>
        <ShopContent />
      </FilterProvider>
    </Suspense>
  )
}
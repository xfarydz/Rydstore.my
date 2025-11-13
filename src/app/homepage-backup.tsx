import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import FilterSidebar from '@/components/FilterSidebar'
import { products } from '@/data/products'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            PREMIUM 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              STREETWEAR
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Discover exclusive fashion pieces from top international brands. 
            Curated collection of premium streetwear, limited editions & more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
              SHOP COLLECTION
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all">
              VIEW LOOKBOOK
            </button>
          </div>
        </div>
      </section>
      
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
                  LATEST COLLECTION
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold text-blue-600">{products.length} items</span> available • Free shipping on orders over RM150
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">SORT BY:</span>
                <select className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Sellers</option>
                </select>
              </div>
            </div>
            
            <ProductGrid products={products} />
            
            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                LOAD MORE PRODUCTS
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
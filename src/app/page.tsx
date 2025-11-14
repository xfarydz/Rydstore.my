'use client';

import Header from '@/components/Header'
import CategoryFilter from '@/components/CategoryFilter'
import FeaturedProducts from '@/components/FeaturedProducts'
import AuthModal from '@/components/AuthModal'
import WelcomeSection from '@/components/WelcomeSection'
import Footer from '@/components/Footer'
import MaintenancePage from '@/components/MaintenancePage'
import ProfileCompletionWarning from '@/components/ProfileCompletionWarning'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/hooks/useAuth'

function HomeContent() {
  const { settings } = useSiteSettings();
  const { isAuthenticated } = useAuth();

  // Check if maintenance mode is enabled
  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AuthModal />
      
      {/* Hero Section */}
      <section 
        className={`relative text-white min-h-[500px] ${!settings.heroBackgroundImage ? 'bg-gradient-to-r from-gray-800 to-gray-900' : ''}`}
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
          <div className="absolute inset-0 bg-black/40"></div>
        )}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {settings.heroTitle}
            <span className="block text-white">
              {settings.heroSubtitle}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {settings.heroDescription}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => {
                const categorySection = document.getElementById('category-section');
                if (categorySection) {
                  categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
              SHOP NOW!
            </button>
          </div>
        </div>
      </section>

      {/* Simple Welcome Message */}
      <WelcomeSection />

      {/* Category Filter Section */}
      <div id="category-section">
        <CategoryFilter />
      </div>

      {/* Featured Products Section - Auto Sliding Highlighted Products */}
      <FeaturedProducts />

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Shop?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our complete collection of fashion items with advanced filtering options. 
            Find exactly what you&apos;re looking for in our full product catalog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="inline-flex items-center px-8 py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Browse All Products</span>
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <button
              onClick={() => {
                const categorySection = document.getElementById('category-section');
                if (categorySection) {
                  categorySection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }
              }}
              className="inline-flex items-center px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Shop by Category</span>
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}

'use client'

import React, { useState, useEffect } from 'react'
import { useAllProducts } from '@/hooks/useProducts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

export default function FeaturedProducts() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const allProducts = useAllProducts()

  // Always use category-based approach with featured products prioritized
  const slide1Products = allProducts.filter(p => 
    (p.category === 'T-Shirts' || p.category === 'Pants' || p.category === 'shirts' || p.category === 'pants') && !p.isSoldOut
  ).sort((a, b) => {
    // Featured products appear first in their categories
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  }).slice(0, 4)
  
  const slide2Products = allProducts.filter(p => 
    (p.category === 'Jackets' || p.category === 'Accessories' || p.category === 'jackets' || p.category === 'accessories') && !p.isSoldOut
  ).sort((a, b) => {
    // Featured products appear first in their categories
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  }).slice(0, 4)

  const slides = [
    { title: 'SHIRTS & PANTS', products: slide1Products },
    { title: 'JACKETS & ACCESSORIES', products: slide2Products }
  ]

  const totalSlides = 2

  // Auto-rotate slides
  useEffect(() => {
    if (totalSlides > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [totalSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold mb-4">FEATURED PRODUCTS</h2>
            <p className="text-gray-600 text-lg">{slides[currentSlide]?.title}</p>
          </div>
        </div>

        <div className="relative group">
          {/* Navigation Arrows - Only show on hover */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slides Container */}
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, slideIdx) => (
                <div key={slideIdx} className="w-full flex-shrink-0 px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {slide.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-4">
          {slides.map((slide, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                idx === currentSlide 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {slide.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
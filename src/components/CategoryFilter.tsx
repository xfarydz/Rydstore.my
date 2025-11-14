'use client'

import React, { useState } from 'react'
import { Shirt, Package, Zap, Watch } from 'lucide-react'

interface CategoryFilterProps {
  onCategorySelect?: (category: string) => void
}

const categories = [
  {
    id: 'shirts',
    name: 'SHIRTS',
    icon: Shirt,
    bgColor: 'bg-black', // Pure black
    textColor: 'text-white',
    description: 'T-Shirts & Casual Wear',
    items: ['Basic Tees', 'Graphic Shirts', 'Polo Shirts', 'Tank Tops']
  },
  {
    id: 'pants',
    name: 'PANTS',
    icon: Package,
    bgColor: 'bg-white', // Pure white
    textColor: 'text-black',
    description: 'Jeans & Trousers',
    items: ['Skinny Jeans', 'Cargo Pants', 'Shorts', 'Joggers']
  },
  {
    id: 'jackets',
    name: 'JACKETS',
    icon: Zap,
    bgColor: 'bg-black', // Pure black
    textColor: 'text-white',
    description: 'Hoodies & Outerwear',
    items: ['Hoodies', 'Bombers', 'Windbreakers', 'Sweaters']
  },
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    icon: Watch,
    bgColor: 'bg-white', // Pure white
    textColor: 'text-black',
    description: 'Caps, Bags & Watches',
    items: ['Caps', 'Backpacks', 'Watches', 'Sunglasses']
  },
  {
    id: 'collection',
    name: 'COLLECTION',
    icon: Package,
    bgColor: 'bg-black', // Pure black
    textColor: 'text-white',
    description: 'Special Collections & Limited Items',
    items: ['Limited Edition', 'Special Items', 'Exclusive Pieces', 'Signature Collection']
  }
]

export default function CategoryFilter({ onCategorySelect }: CategoryFilterProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    console.log(`Clicked main category: ${categoryId}`)
    // Navigate to shop page with category filter
    window.location.href = `/shop?category=${categoryId}`
  }

  const handleSubcategoryClick = (categoryId: string, subcategory: string) => {
    console.log(`Clicked subcategory: ${subcategory} in ${categoryId}`)
    // Navigate to shop page with subcategory filter
    const subcategorySlug = subcategory.toLowerCase().replace(' ', '-')
    window.location.href = `/shop?category=${categoryId}&subcategory=${subcategorySlug}`
  }

  const handleViewAllClick = (categoryId: string) => {
    console.log(`View all clicked for: ${categoryId}`)
    // Navigate to shop page with category filter
    window.location.href = `/shop?category=${categoryId}`
  }

  const handleFilterByCategory = (categoryId: string) => {
    console.log(`Filter by category: ${categoryId}`)
    // Navigate to shop page with category filter
    window.location.href = `/shop?category=${categoryId}`
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your favorite category for a better shopping experience
          </p>
        </div>

        {/* Merged Categories Layout with Hover Only */}
        <div className="mb-8">
          <div className="flex flex-col max-w-6xl mx-auto px-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              const isHovered = hoveredCategory === category.id

              return (
                <div
                  key={category.id}
                  className="w-full"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Main Category Button - Custom Hover Effects */}
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group relative w-full h-20 px-8 py-6 border-2 border-black transition-all duration-500 ease-in-out overflow-hidden transform ${
                      category.bgColor === 'bg-black' 
                        ? 'bg-black text-white hover:bg-white hover:text-black hover:shadow-2xl' 
                        : 'bg-white text-black hover:bg-white hover:text-black hover:shadow-2xl hover:border-gray-900'
                    } hover:scale-105 ${
                      index === 0 ? 'border-b-0' : index === categories.length - 1 ? '' : 'border-b-0'
                    }`}
                  >
                    {/* Subtle glow effect for white buttons on hover */}
                    {category.bgColor === 'bg-white' && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-gray-100 to-gray-200 transition-all duration-500"></div>
                    )}
                    
                    {/* Category Content */}
                    <div className="relative flex items-center justify-between h-full">
                      {/* Icon and Name */}
                      <div className="flex items-center">
                        <Icon className="h-8 w-8 mr-6 flex-shrink-0" />
                        <span className="text-2xl font-bold uppercase tracking-widest">
                          {category.name}
                        </span>
                      </div>
                      
                      {/* Arrow Indicator */}
                      <div className="text-3xl transition-transform duration-300 group-hover:translate-x-2">→</div>
                    </div>
                  </button>

                  {/* Hover Dropdown - Only on Mouse Touch */}
                  {isHovered && (
                    <div className="w-full bg-black text-white border-l-2 border-r-2 border-b-2 border-black transform transition-all duration-300 ease-out animate-fadeIn">
                      {/* Description Section */}
                      <div className="p-8 border-b border-gray-700">
                        <div className="max-w-4xl mx-auto">
                          <p className="text-xl font-semibold mb-6 text-center">{category.description}</p>
                          
                          {/* Category Items Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {category.items.map((item, itemIndex) => (
                              <button
                                key={itemIndex}
                                onClick={() => handleSubcategoryClick(category.id, item)}
                                className="text-sm py-3 px-4 bg-gray-800 hover:bg-gray-600 rounded transition-colors text-left font-medium"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="p-6">
                        <div className="max-w-4xl mx-auto flex gap-4 justify-center">
                          <button 
                            onClick={() => handleViewAllClick(category.id)}
                            className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded"
                          >
                            View All {category.name}
                          </button>
                          <button 
                            onClick={() => handleFilterByCategory(category.id)}
                            className="px-8 py-4 bg-gray-800 text-white font-bold uppercase tracking-wider hover:bg-gray-600 transition-colors rounded border border-gray-600"
                          >
                            Filter by {category.name}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
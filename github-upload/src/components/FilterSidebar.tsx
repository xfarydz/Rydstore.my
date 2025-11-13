'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { brands, sizes, categories } from '@/data/products'
import { useFilters } from '@/hooks/useFilters'

export default function FilterSidebar() {
  const {
    filters,
    setSelectedBrands,
    setSelectedSizes,
    setSelectedCategories,
    clearAllFilters,
    hasActiveFilters
  } = useFilters();

  const [isBrandOpen, setIsBrandOpen] = useState(false)
  const [isSizeOpen, setIsSizeOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const toggleFilter = (item: string, currentList: string[], setList: (list: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item))
    } else {
      setList([...currentList, item])
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            FILTERS
          </h2>
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 uppercase tracking-wide"
            >
              CLEAR ALL
            </button>
          )}
        </div>
        
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-1">
            {[...filters.selectedBrands, ...filters.selectedSizes, ...filters.category].map(filter => (
              <span key={filter} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded border">
                {filter}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => {
                  if (filters.selectedBrands.includes(filter)) toggleFilter(filter, filters.selectedBrands, setSelectedBrands)
                  if (filters.selectedSizes.includes(filter)) toggleFilter(filter, filters.selectedSizes, setSelectedSizes)
                  if (filters.category.includes(filter)) toggleFilter(filter, filters.category, setSelectedCategories)
                }} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter Dropdown */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            SHOP BY BRAND
            {filters.selectedBrands.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({filters.selectedBrands.length})</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isBrandOpen ? 'rotate-180' : ''}`} />
        </button>
        {isBrandOpen && (
          <div className="p-4 pt-0 space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label
                key={brand}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.selectedBrands.includes(brand)}
                  onChange={() => toggleFilter(brand, filters.selectedBrands, setSelectedBrands)}
                  className="mr-3 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900 select-none">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Dropdown */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            SHOP BY CATEGORY
            {filters.category.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({filters.category.length})</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
        </button>
        {isCategoryOpen && (
          <div className="p-4 pt-0 space-y-2 max-h-48 overflow-y-auto">
            {categories.map(category => (
              <label
                key={category}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.category.includes(category)}
                  onChange={() => toggleFilter(category, filters.category, setSelectedCategories)}
                  className="mr-3 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900 select-none">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Size Filter Dropdown */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsSizeOpen(!isSizeOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            SHOP BY SIZE
            {filters.selectedSizes.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({filters.selectedSizes.length})</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isSizeOpen ? 'rotate-180' : ''}`} />
        </button>
        {isSizeOpen && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <label
                  key={size}
                  className="flex items-center justify-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.selectedSizes.includes(size)}
                    onChange={() => toggleFilter(size, filters.selectedSizes, setSelectedSizes)}
                    className="sr-only"
                  />
                  <span className={`w-full text-center py-2 px-3 text-xs font-medium border rounded transition-all ${
                    filters.selectedSizes.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                  }`}>
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

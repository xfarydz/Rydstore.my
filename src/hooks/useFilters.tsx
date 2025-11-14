'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/data/products';

interface FilterState {
  selectedBrands: string[];
  selectedSizes: string[];
  category: string[];
  searchQuery: string;
}

interface FilterContextType {
  filters: FilterState;
  setSelectedBrands: (brands: string[]) => void;
  setSelectedSizes: (sizes: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearAllFilters: () => void;
  applyFilters: (products: Product[]) => Product[];
  hasActiveFilters: boolean;
  setSearchQuery: (query: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialFilters: FilterState = {
  selectedBrands: [],
  selectedSizes: [],
  category: [],
  searchQuery: '',
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const searchParams = useSearchParams();

  // Category ID to actual category mapping
  const categoryMapping: { [key: string]: string[] } = {
    'shirts': ['T-Shirts'],
    'pants': ['Pants'],
    'jackets': ['Jackets', 'Hoodies'],
    'accessories': ['Accessories', 'Caps', 'Watches'],
    'collection': ['Collection']
  };

  // Auto-apply filters from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      // Map category ID to actual product categories
      const mappedCategories = categoryMapping[categoryParam] || [];
      if (mappedCategories.length > 0) {
        setFilters(prev => ({
          ...prev,
          category: mappedCategories
        }));
      }
    }

    // Handle subcategory if provided
    if (subcategoryParam && categoryParam) {
      const subcategoryName = subcategoryParam
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setFilters(prev => ({
        ...prev,
        category: [subcategoryName]
      }));
    }

    // Handle search query
    if (searchParam) {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchParam
      }));
    }
  }, [searchParams]);

  const setSelectedBrands = (brands: string[]) => {
    setFilters(prev => ({ ...prev, selectedBrands: brands }));
  };

  const setSelectedSizes = (sizes: string[]) => {
    setFilters(prev => ({ ...prev, selectedSizes: sizes }));
  };

  const setSelectedCategories = (categories: string[]) => {
    setFilters(prev => ({ ...prev, category: categories }));
  };

  const setSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  // Helper function to check if product is new (within 4 days of creation)
  const isProductNew = (product: Product): boolean => {
    if (!product.createdAt) return false;
    
    const createdDate = new Date(product.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 4;
  };

  const applyFilters = (products: Product[]): Product[] => {
    const filteredProducts = products.filter(product => {
      // Search filter
      if (filters.searchQuery.trim().length > 0) {
        const query = filters.searchQuery.toLowerCase();
        const searchMatch = 
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        
        if (!searchMatch) {
          return false;
        }
      }

      // Category filter
      if (filters.category.length > 0) {
        if (!filters.category.includes(product.category)) {
          return false;
        }
      }

      // Brand filter
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(product.brand)) {
        return false;
      }

      // Size filter
      if (filters.selectedSizes.length > 0) {
        const hasMatchingSize = filters.selectedSizes.some(size => product.size.includes(size));
        if (!hasMatchingSize) {
          return false;
        }
      }

      return true;
    });

    // Sort products: JUST ARRIVED items first, then others
    return filteredProducts.sort((a, b) => {
      const aIsJustArrived = a.isFeatured || isProductNew(a);
      const bIsJustArrived = b.isFeatured || isProductNew(b);
      
      // JUST ARRIVED products come first
      if (aIsJustArrived && !bIsJustArrived) return -1;
      if (!aIsJustArrived && bIsJustArrived) return 1;
      
      // If both are JUST ARRIVED or both are regular, maintain original order
      return 0;
    });
  };

  const hasActiveFilters = 
    filters.selectedBrands.length > 0 ||
    filters.selectedSizes.length > 0 ||
    filters.category.length > 0 ||
    filters.searchQuery.trim().length > 0;

  return (
    <FilterContext.Provider value={{
      filters,
      setSelectedBrands,
      setSelectedSizes,
      setSelectedCategories,
      setSearchQuery,
      updateFilters,
      clearAllFilters,
      applyFilters,
      hasActiveFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
'use client';

import { useState, useEffect } from 'react';
import { products as defaultProducts } from '../data/products';

export function useProducts() {
  const [allProducts, setAllProducts] = useState(defaultProducts);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProducts = () => {
    if (typeof window !== 'undefined') {
      let adminProducts = localStorage.getItem('adminProducts');
      
      // If no adminProducts in localStorage, initialize with default products
      if (!adminProducts) {
        console.log('No adminProducts found, initializing with default products');
        localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
        adminProducts = JSON.stringify(defaultProducts);
      }
      
      try {
        const parsedProducts = JSON.parse(adminProducts);
        console.log('Loading products from localStorage:', parsedProducts.length, 'products');
        setAllProducts(parsedProducts);
        
        // Clean up expired reservations on load
        cleanupExpiredReservations();
      } catch (error) {
        console.error('Error loading admin products:', error);
        setAllProducts(defaultProducts);
      }
    }
  };

  useEffect(() => {
    loadProducts();
    
    // Listen for product updates
    const handleProductUpdate = () => {
      console.log('Product update event received - reloading products');
      loadProducts();
      setRefreshKey(prev => prev + 1); // Force re-render
    };
    
    // Listen for custom events
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('storage', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('storage', handleProductUpdate);
    };
  }, []);

  // Filter out sold products from shop view - customers should only see available items
  const availableProducts = allProducts.filter(product => {
    const p = product as any; // Cast for dynamic properties
    return !p.isSoldOut && 
           p.inStock !== false && 
           p.isAvailable !== false &&
           !p.reservedBy; // Also exclude reserved items
  });
  
  console.log('useProducts hook returning:', {
    totalProducts: allProducts.length,
    availableProducts: availableProducts.length,
    refreshKey,
    soldProducts: allProducts.filter(p => p.isSoldOut).length
  });

  return availableProducts;
}

// Utility function to clean up expired reservations (older than 15 minutes)
export function cleanupExpiredReservations() {
  if (typeof window === 'undefined') return;
  
  const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
  const now = new Date().getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  
  let hasChanges = false;
  
  const cleanedProducts = products.map((product: any) => {
    if (product.reservedAt) {
      const reservedTime = new Date(product.reservedAt).getTime();
      if (now - reservedTime > fifteenMinutes) {
        console.log('🧹 Cleaning up expired reservation for:', product.name);
        hasChanges = true;
        return {
          ...product,
          reservedBy: undefined,
          reservedAt: undefined,
          reservedByEmail: undefined,
          isSoldOut: false,
          inStock: true,
          isAvailable: true
        };
      }
    }
    return product;
  });
  
  if (hasChanges) {
    localStorage.setItem('adminProducts', JSON.stringify(cleanedProducts));
    window.dispatchEvent(new Event('productUpdated'));
    console.log('🧹 Expired reservations cleaned up');
  }
}

// New hook for admin to get all products (including sold ones)
export function useAllProducts() {
  const [products, setProducts] = useState(defaultProducts);

  const loadAllProducts = () => {
    if (typeof window !== 'undefined') {
      let adminProducts = localStorage.getItem('adminProducts');
      
      // If no adminProducts in localStorage, initialize with default products
      if (!adminProducts) {
        console.log('No adminProducts found in useAllProducts, initializing with default products');
        localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
        adminProducts = JSON.stringify(defaultProducts);
      }
      
      try {
        const parsedProducts = JSON.parse(adminProducts);
        console.log('Loading all products from localStorage:', parsedProducts.length, 'products');
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Error loading admin products:', error);
        setProducts(defaultProducts);
      }
    }
  };

  useEffect(() => {
    loadAllProducts();
    
    // Listen for product updates
    const handleProductUpdate = () => {
      loadAllProducts();
    };
    
    // Listen for custom events
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('storage', handleProductUpdate);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('storage', handleProductUpdate);
    };
  }, []);

  return products;
}
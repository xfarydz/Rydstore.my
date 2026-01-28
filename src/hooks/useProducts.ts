'use client';

import { useState, useEffect } from 'react';
import { products as defaultProducts } from '../data/products';

export function useProducts() {
  const [allProducts, setAllProducts] = useState(defaultProducts);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFromServer = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log('Loaded products from server:', data.length, 'products');
        return data;
      }
    } catch (error) {
      console.error('Error loading products from server:', error);
    }
    return null;
  };

  const loadFromLocal = () => {
    if (typeof window !== 'undefined') {
      const adminProducts = localStorage.getItem('adminProducts');
      if (adminProducts) {
        try {
          return JSON.parse(adminProducts);
        } catch (error) {
          console.error('Error parsing localStorage products:', error);
        }
      }
    }
    return null;
  };

  const loadProducts = async () => {
    // Try server first, then localStorage, then defaults
    let products = await loadFromServer();
    
    if (!products || products.length === 0) {
      console.log('No server products, trying localStorage');
      products = loadFromLocal();
    }
    
    if (!products || products.length === 0) {
      console.log('No localStorage products, using defaults');
      products = defaultProducts;
      // Save defaults to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
      }
    }
    
    console.log('Loading products:', products.length, 'products');
    setAllProducts(products);
    
    // Save to localStorage for offline access
    if (typeof window !== 'undefined' && products) {
      localStorage.setItem('adminProducts', JSON.stringify(products));
    }
    
    // Clean up expired reservations on load
    cleanupExpiredReservations();
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

  const loadFromServer = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log('Loaded all products from server:', data.length, 'products');
        return data;
      }
    } catch (error) {
      console.error('Error loading products from server:', error);
    }
    return null;
  };

  const loadFromLocal = () => {
    if (typeof window !== 'undefined') {
      const adminProducts = localStorage.getItem('adminProducts');
      if (adminProducts) {
        try {
          return JSON.parse(adminProducts);
        } catch (error) {
          console.error('Error parsing localStorage products:', error);
        }
      }
    }
    return null;
  };

  const loadAllProducts = async () => {
    // Try server first, then localStorage, then defaults
    let allProducts = await loadFromServer();
    
    if (!allProducts || allProducts.length === 0) {
      console.log('No server products in useAllProducts, trying localStorage');
      allProducts = loadFromLocal();
    }
    
    if (!allProducts || allProducts.length === 0) {
      console.log('No localStorage products, using defaults');
      allProducts = defaultProducts;
      // Save defaults to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
      }
    }
    
    console.log('Loading all products:', allProducts.length, 'products');
    setProducts(allProducts);
    
    // Save to localStorage for offline access
    if (typeof window !== 'undefined' && allProducts) {
      localStorage.setItem('adminProducts', JSON.stringify(allProducts));
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

// Utility function to save products to both localStorage and Supabase
export async function saveProducts(products: any[]) {
  // Save to localStorage immediately
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminProducts', JSON.stringify(products));
    window.dispatchEvent(new Event('productUpdated'));
  }
  
  // Save to Supabase in background
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    });
    
    if (!res.ok) {
      console.error('Failed to sync products to server:', res.status);
    } else {
      console.log('Products synced to server successfully');
    }
  } catch (error) {
    console.error('Error syncing products to server:', error);
  }
}
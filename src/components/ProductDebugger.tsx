'use client';

import { useState, useEffect } from 'react';

export default function ProductDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [refreshCount, setRefreshCount] = useState(0);

  const updateDebugInfo = () => {
    if (typeof window !== 'undefined') {
      const adminProducts = localStorage.getItem('adminProducts');
      const parsed = adminProducts ? JSON.parse(adminProducts) : [];
      
      const info = {
        timestamp: new Date().toLocaleTimeString(),
        totalProducts: parsed.length,
        availableProducts: parsed.filter((p: any) => !p.isSoldOut && p.inStock).length,
        soldProducts: parsed.filter((p: any) => p.isSoldOut).length,
        productStatus: parsed.map((p: any) => ({
          id: p.id,
          name: p.name?.substring(0, 20) + '...',
          inStock: p.inStock,
          isSoldOut: p.isSoldOut,
          soldAt: p.soldAt
        }))
      };
      
      setDebugInfo(info);
      setRefreshCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    updateDebugInfo();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(updateDebugInfo, 2000);
    
    // Listen for product updates
    const handleUpdate = () => {
      console.log('ProductDebugger: Received product update event');
      setTimeout(updateDebugInfo, 100); // Small delay to ensure localStorage is updated
    };
    
    window.addEventListener('productUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('productUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (Object.keys(debugInfo).length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm shadow-lg z-50">
      <div className="font-bold mb-2">Debug Info (Refresh #{refreshCount})</div>
      <div className="mb-1">Time: {debugInfo.timestamp}</div>
      <div className="mb-1">Total: {debugInfo.totalProducts} | Available: {debugInfo.availableProducts} | Sold: {debugInfo.soldProducts}</div>
      
      <div className="mt-2 text-xs">
        <div className="font-semibold">Products:</div>
        {debugInfo.productStatus?.slice(0, 3).map((p: any) => (
          <div key={p.id} className={`${p.isSoldOut ? 'text-red-400' : 'text-green-400'}`}>
            {p.id}: {p.name} {p.isSoldOut ? '(SOLD)' : '(Available)'}
          </div>
        ))}
      </div>
      
      <button 
        onClick={updateDebugInfo}
        className="mt-2 bg-white text-black px-2 py-1 rounded text-xs"
      >
        Refresh Now
      </button>
    </div>
  );
}
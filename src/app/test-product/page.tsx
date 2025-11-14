'use client'

import { useAllProducts } from '@/hooks/useProducts'
import Link from 'next/link'

export default function TestProductPage() {
  const products = useAllProducts()
  
  console.log('🔍 Test page - Products loaded:', products.length)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Test Page</h1>
      <p className="mb-4">Total products: {products.length}</p>
      
      {products.length === 0 ? (
        <p className="text-red-500">❌ No products loaded!</p>
      ) : (
        <div className="space-y-4">
          <p className="text-green-500">✅ Products loaded successfully</p>
          <div className="grid gap-4">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="border p-4 rounded">
                <h3 className="font-bold">{product.name}</h3>
                <p>ID: {product.id}</p>
                <p>Price: RM{product.price}</p>
                <Link 
                  href={`/product/${product.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 inline-block"
                >
                  View Product Detail
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import React from 'react'
import { Product } from '@/data/products'
import Image from 'next/image'
import Link from 'next/link'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSiteSettings()

  const handleCardClick = () => {
    console.log('🔗 Product card clicked!', { productId: product.id, productName: product.name });
  }

  return (
    <div className="group bg-white overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-lg">
      <Link href={`/product/${product.id}`} onClick={handleCardClick}>
        <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {/* Click Indicator */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 transform scale-75 group-hover:scale-100 transition-all duration-300">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight hover:text-blue-600 cursor-pointer transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <div className="mb-2">
          <span className="text-lg font-bold text-gray-900">
            {settings.currency}{product.price.toLocaleString()}
          </span>
        </div>
        
        {/* Click to view details indicator */}
        <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
          Click to view details →
        </div>
      </div>
    </div>
  )
}
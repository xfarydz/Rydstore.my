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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('🔗 ProductCard clicked:', { 
      productId: product.id, 
      productName: product.name,
      href: `/product/${product.id}` 
    });
    
    // Manual navigation
    window.location.href = `/product/${product.id}`;
  }

  return (
    <div 
      onClick={handleClick}
      className="block group bg-white overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-lg cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.isBiddingItem && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold shadow-md">
            BIDDING
          </div>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="text-lg font-bold text-gray-900">
          {settings.currency}{product.price.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
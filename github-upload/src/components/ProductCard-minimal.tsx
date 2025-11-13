import React from 'react'
import { Product } from '@/data/products'
import Image from 'next/image'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSiteSettings()

  return (
    <div className="group cursor-pointer bg-white overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
          {product.name}
        </h3>
        <div className="mb-2">
          <span className="text-lg font-bold text-gray-900">
            {settings.currency}{product.price.toLocaleString()}
          </span>
        </div>
        <div className="mt-3">
          <button
            className="w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 bg-black text-white hover:bg-gray-800"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  )
}
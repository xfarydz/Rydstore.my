import React, { useState } from 'react'
import { Product } from '@/data/products'
import Image from 'next/image'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSiteSettings()
  const [addedToCart, setAddedToCart] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🛒 Add to Cart clicked for:', product.name)
    
    // Get existing cart or create new one
    const existingCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]')
    
    // Check if item already exists
    const existingItem = existingCart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
      console.log('📈 Updated quantity for existing item')
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
      console.log('➕ Added new item to cart')
    }
    
    // Save to localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(existingCart))
    console.log('💾 Cart saved to localStorage')
    
    // Show feedback
    setAddedToCart(true)
    setShowToast(true)
    console.log('✅ Showing success feedback')
    
    setTimeout(() => {
      setAddedToCart(false)
      setShowToast(false)
      console.log('🔄 Reset button state')
    }, 2000)
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'))
    console.log('📡 Dispatched cartUpdated event')
  }

  return (
    <div className="group bg-white overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer">
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
            onClick={handleAddToCart}
            disabled={product.isSoldOut}
            type="button"
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
              product.isSoldOut 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : addedToCart 
                ? 'bg-green-500 text-white'
                : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 hover:scale-105 active:scale-95'
            }`}
            style={{ pointerEvents: product.isSoldOut ? 'none' : 'auto' }}
          >
            {product.isSoldOut ? 'SOLD OUT' : addedToCart ? '✅ ADDED!' : '🛒 ADD TO CART'}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <span className="text-lg">🛒</span>
            <span className="font-medium">Added to cart!</span>
          </div>
        </div>
      )}
    </div>
  )
}
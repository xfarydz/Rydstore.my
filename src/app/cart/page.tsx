'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'
import PaymentModal from '@/components/PaymentModal'
import BulkPaymentModal from '@/components/BulkPaymentModal'
import ProfileCompletionModal from '@/components/ProfileCompletionModal'
import { useAuth } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { isProfileCompleteForCheckout } from '@/utils/profileValidation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand?: string;
  size?: string;
  color?: string;
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth()
  const { settings } = useSiteSettings()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shoppingCart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getShippingCost = () => {
    const subtotal = getTotalPrice()
    
    // Free shipping if total >= RM150
    if (subtotal >= 150) {
      return 0
    }
    
    // RM10 flat rate per order (not per item)
    return cartItems.length > 0 ? 10 : 0
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost()
  }

  const handleCheckoutItem = (item: CartItem) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // Check if profile is complete
    const profileCheck = isProfileCompleteForCheckout(user)
    if (!profileCheck.isComplete) {
      setShowProfileModal(true)
      return
    }

    setSelectedItem(item)
    setShowPaymentModal(true)
  }

  const handleBulkCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // Check if profile is complete
    const profileCheck = isProfileCompleteForCheckout(user)
    if (!profileCheck.isComplete) {
      setShowProfileModal(true)
      return
    }

    setShowBulkPaymentModal(true)
  }

  const calculateItemTotal = (item: CartItem) => {
    const itemTotal = item.price * item.quantity
    const cartSubtotal = getTotalPrice()
    
    // If cart total >= RM150, no shipping charge
    // If cart total < RM150, RM10 shipping per individual purchase
    const itemShipping = cartSubtotal >= 150 ? 0 : 10
    
    return itemTotal + itemShipping
  }

  const handlePaymentSuccess = () => {
    if (selectedItem) {
      // Remove item from cart after successful payment
      removeItem(selectedItem.id)
      setSelectedItem(null)

      // Mark product as sold in adminProducts
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
      const updatedProducts = adminProducts.map((p: any) => {
        if (p.id === selectedItem.id) {
          return {
            ...p,
            isSoldOut: true,
            inStock: false,
            soldAt: new Date().toISOString(),
            soldTo: user?.id
          }
        }
        return p
      })

      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      
      // Trigger product update event
      window.dispatchEvent(new Event('productUpdated'))

      console.log('🛒 Item removed from cart and marked as sold:', selectedItem.name)
    }
  }

  const handleBulkPaymentSuccess = () => {
    // Mark all cart items as sold in adminProducts
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    const cartItemIds = cartItems.map(item => item.id)
    
    const updatedProducts = adminProducts.map((p: any) => {
      if (cartItemIds.includes(p.id)) {
        return {
          ...p,
          isSoldOut: true,
          inStock: false,
          soldAt: new Date().toISOString(),
          soldTo: user?.id
        }
      }
      return p
    })

    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    
    // Clear entire cart after successful bulk payment
    clearCart()
    
    // Trigger product update event
    window.dispatchEvent(new Event('productUpdated'))
    window.dispatchEvent(new Event('cartUpdated'))

    console.log('🛒 Bulk payment successful - all items sold and cart cleared')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AuthModal />

      {selectedItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          productName={`${selectedItem.name} ${selectedItem.quantity > 1 ? `(${selectedItem.quantity}x)` : ''}`}
          productImage={selectedItem.image}
          productBrand={selectedItem.brand || 'Unknown'}
          productSize={selectedItem.size || 'One Size'}
          productColor={selectedItem.color || 'Default'}
          productId={selectedItem.id}
          amount={calculateItemTotal(selectedItem)}
          orderId={`cart-${selectedItem.id}-${Date.now()}`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <BulkPaymentModal
        isOpen={showBulkPaymentModal}
        onClose={() => setShowBulkPaymentModal(false)}
        cartItems={cartItems}
        totalAmount={getFinalTotal()}
        onPaymentSuccess={handleBulkPaymentSuccess}
      />

      {showProfileModal && user && (
        <ProfileCompletionModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          missingFields={isProfileCompleteForCheckout(user).missingFields}
          errors={[]}
          completionPercentage={85}
          onGoToProfile={() => {
            setShowProfileModal(false)
            window.location.href = '/profile'
          }}
        />
      )}

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty cart
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Link 
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart items
          <div className="space-y-4">
              {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{settings.currency}{item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">
                      {settings.currency}{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {settings.currency}{item.price} × {item.quantity}
                    </p>
                  </div>

                  {/* Remove Button Only */}
                  <div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Cart Summary - Moved Back to Bottom */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cart Summary</h3>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{settings.currency}{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping (Flat rate):
                  </span>
                  <span className="font-medium">
                    {getShippingCost() === 0 ? (
                      <span className="text-red-500 line-through decoration-2">RM10</span>
                    ) : (
                      `${settings.currency}${getShippingCost()}`
                    )}
                  </span>
                </div>
                {getTotalPrice() >= 150 && getShippingCost() === 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    🎉 Shipping fee waived! You saved <span className="text-red-500 line-through">RM10</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Total:</span>
                  <span className="text-blue-600">{settings.currency}{getFinalTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Bulk Checkout Button */}
              {cartItems.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => handleBulkCheckout()}
                    className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-semibold hover:from-black hover:to-gray-800 transition-all shadow-lg border border-gray-800"
                  >
                    Checkout
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  💡 <strong>Shipping Info:</strong> RM10 flat rate shipping per order. 
                  {getTotalPrice() >= 150 ? (
                    <span className="text-green-600 font-medium"> Shipping fee waived! <span className="text-red-500 line-through">RM10</span></span>
                  ) : (
                    <span> Add RM{(150 - getTotalPrice()).toLocaleString()} more to waive shipping fee!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { X, CreditCard, Smartphone, Building2, CheckCircle, Package, Truck } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { TOYYIBPAY_CONFIG } from '@/config/toyyibpay'

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface BulkPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  onPaymentSuccess: () => void;
}

export default function BulkPaymentModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  totalAmount, 
  onPaymentSuccess 
}: BulkPaymentModalProps) {
  const { settings } = useSiteSettings()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fpx' | 'ewallet'>('card')
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedEwallet, setSelectedEwallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review')
  
  // Card details
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const orderId = `bulk-${Date.now()}`

  if (!isOpen) return null

  const handlePayment = async () => {
    setLoading(true)
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Determine if this is truly a bulk order or single item from cart
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const isTrulyBulk = cartItems.length > 1 || totalQuantity > 1
    
    // Create sales record - ALL cart orders have items array for admin visibility
    const salesData = {
      id: 'cart-sale-' + Date.now(),
      orderId,
      type: isTrulyBulk ? 'bulk' : 'cart-single', // Distinguish cart single vs direct single
      // ALWAYS include items array for cart orders (admin needs to see what was ordered)
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        name: item.name, // Add both formats for compatibility
        productImage: item.image,
        image: item.image, // Add both formats for compatibility
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      // For single items from cart, also include productName for backward compatibility
      ...(totalQuantity === 1 && {
        productName: cartItems[0].name,
        productImage: cartItems[0].image
      }),
      totalAmount,
      currency: settings.currency || 'RM',
      paymentMethod: paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString(),
      purchaseDate: new Date().toLocaleDateString('en-MY'),
      
      // Add shipping info for bulk orders
      ...(isTrulyBulk && {
        shipping: {
          cost: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 150 ? 0 : 10,
          type: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 150 ? 'Free Shipping' : 'Standard'
        }
      }),
      
      // Complete buyer information
      buyer: {
        id: currentUser.id,
        name: currentUser.fullName || currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: {
          street: currentUser.address?.street || '',
          city: currentUser.address?.city || '',
          state: currentUser.address?.state || '',
          postcode: currentUser.address?.postcode || '',
          country: currentUser.address?.country || 'Malaysia'
        }
      }
    }
    
    // Save to sales records
    const salesRecords = JSON.parse(localStorage.getItem('salesRecords') || '[]')
    salesRecords.push(salesData)
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords))
    
    setLoading(false)
    setStep('success')
    
    // Auto close and trigger success after showing success screen
    setTimeout(() => {
      onPaymentSuccess()
      onClose()
    }, 2000)
  }

  const formatAmount = (amount: number) => {
    return `${settings.currency}${amount.toLocaleString()}`
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {step === 'success' ? (
          // Success Screen
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your {getTotalItems() === 1 ? 'order' : `bulk order of ${getTotalItems()} items`} has been processed successfully.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-2xl font-bold text-green-600">{formatAmount(totalAmount)}</p>
              <p className="text-sm text-gray-600">Total Amount Paid</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-900 to-black text-white rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold">
                  {getTotalItems() === 1 ? 'Checkout' : 'Bulk Checkout'}
                </h2>
                <p className="text-gray-300">
                  {getTotalItems() === 1 ? '1 item' : `${getTotalItems()} items`} • Order #{orderId.slice(-6)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {step === 'review' ? (
              // Order Review
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h3>
                
                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatAmount(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatAmount(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items):</span>
                    <span>{formatAmount(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>
                      {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) >= 150 ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500 line-through">RM10</span>
                          <span className="text-green-600 font-semibold text-sm">FREE</span>
                        </div>
                      ) : (
                        'RM10'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>{formatAmount(totalAmount)}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => setStep('payment')}
                  className="w-full mt-6 bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-xl font-semibold hover:from-black hover:to-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Continue to Payment
                </button>
              </div>
            ) : (
              // Payment Step
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Payment Details</h3>
                
                {/* Total Amount Display */}
                <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-xl mb-6 text-center">
                  <p className="text-sm opacity-80">Total Amount</p>
                  <p className="text-3xl font-bold">{formatAmount(totalAmount)}</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="w-5 h-5 text-gray-900"
                    />
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <div>
                      <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="fpx"
                      checked={paymentMethod === 'fpx'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'fpx')}
                      className="w-5 h-5 text-gray-900"
                    />
                    <Building2 className="w-6 h-6 text-gray-700" />
                    <div>
                      <span className="font-semibold text-gray-900">FPX Online Banking</span>
                      <p className="text-sm text-gray-600">All Malaysian banks</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="ewallet"
                      checked={paymentMethod === 'ewallet'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'ewallet')}
                      className="w-5 h-5 text-gray-900"
                    />
                    <Smartphone className="w-6 h-6 text-gray-700" />
                    <div>
                      <span className="font-semibold text-gray-900">E-Wallet</span>
                      <p className="text-sm text-gray-600">GrabPay, Touch 'n Go, Boost</p>
                    </div>
                  </label>
                </div>

                {/* FPX Bank Selection */}
                {paymentMethod === 'fpx' && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Select Your Bank (via ToyyibPay)</h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {TOYYIBPAY_CONFIG.fpxBanks.map((bank) => (
                        <label key={bank.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="bank"
                            value={bank.code}
                            checked={selectedBank === bank.code}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <img 
                            src={bank.icon} 
                            alt={bank.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.textContent = '🏦 ' + bank.name;
                            }}
                          />
                          <span className="text-sm font-medium">{bank.name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        🎯 <strong>ToyyibPay</strong> - Lower fees, secure Malaysian payment gateway<br/>
                        🔒 You will be redirected to your bank's secure login page.
                      </p>
                    </div>
                  </div>
                )}

                {/* E-wallet Selection */}
                {paymentMethod === 'ewallet' && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Select Your E-Wallet (via ToyyibPay)</h4>
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {TOYYIBPAY_CONFIG.ewallets.map((ewallet) => (
                        <label key={ewallet.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="ewallet"
                            value={ewallet.code}
                            checked={selectedEwallet === ewallet.code}
                            onChange={(e) => setSelectedEwallet(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <img 
                            src={ewallet.icon} 
                            alt={ewallet.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.textContent = '💳 ' + ewallet.name;
                            }}
                          />
                          <span className="text-sm font-medium">{ewallet.name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        💸 <strong>E-Wallet</strong> - Quick and convenient digital payment<br/>
                        📱 Complete payment in your preferred e-wallet app.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('review')}
                    className="flex-1 bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-xl font-semibold hover:from-black hover:to-gray-800 disabled:opacity-50 transition-all shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ${formatAmount(totalAmount)}`
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { X, Upload, Building2, CheckCircle, Copy, Check, QrCode, Package } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAlert } from './AlertProvider'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface BulkPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  totalAmount: number
  onPaymentSuccess: () => void
}

export default function BulkPaymentModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onPaymentSuccess,
}: BulkPaymentModalProps) {
  const { user } = useAuth()
  const { settings } = useSiteSettings()
  const { showSuccess, showError } = useAlert()
  const [receipt, setReceipt] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState('')

  const orderId = `bulk-${Date.now()}`
  const qrImage = settings.bankQrUrl || '' // set to '/images/duitnow-qr.png' if available

  if (!isOpen) return null

  const bankAccounts = (settings.bankAccountNumber && settings.bankName) ? [
    { bank: settings.bankName!, accountNumber: settings.bankAccountNumber!, accountName: settings.bankAccountName || 'Account Holder' }
  ] : [
    { bank: 'Maybank', accountNumber: '1234567890', accountName: 'RYDSTORE SDN BHD' },
    { bank: 'CIMB Bank', accountNumber: '9876543210', accountName: 'RYDSTORE SDN BHD' },
  ]

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please upload an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Please upload an image smaller than 5MB')
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceipt(reader.result as string)
      setUploading(false)
    }
    reader.onerror = () => {
      showError('Upload Failed', 'Failed to read the file. Please try again.')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!receipt) {
      showError('Receipt Required', 'Please upload your payment receipt to continue.')
      return
    }

    const order = {
      id: orderId,
      items: cartItems,
      amount: totalAmount,
      status: 'pending',
      paymentMethod: 'bank_transfer_bulk',
      receipt,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
    }

    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    existingOrders.push(order)
    localStorage.setItem('orders', JSON.stringify(existingOrders))

    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    const updatedProducts = products.map((p: any) => {
      const found = cartItems.find((ci) => ci.id === p.id)
      if (found) {
        return { ...p, isSoldOut: true, inStock: false, soldAt: new Date().toISOString(), orderId }
      }
      return p
    })
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    window.dispatchEvent(new Event('productUpdated'))

    localStorage.setItem('cart', JSON.stringify([]))
    window.dispatchEvent(new Event('cartUpdated'))

    showSuccess('Order Submitted', `Order #${orderId} submitted. We will verify payment shortly.`)
    onPaymentSuccess()
    onClose()
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 150 ? 0 : 10

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-200">
      <div
        style={{ animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-black text-white p-6 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bulk Checkout</h2>
            <p className="text-gray-300 text-sm">Order ID: {orderId}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-black" />
              <h3 className="font-semibold text-lg">Order Summary</h3>
            </div>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">RM {item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <p className="font-semibold">RM {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Amount to pay</p>
                  <p className="font-bold text-lg">RM {totalAmount.toFixed(2)}</p>
                </div>
                <button onClick={() => copyText(totalAmount.toFixed(2), 'amount')} className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  {copied === 'amount' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Payment reference</p>
                  <p className="font-mono font-semibold">{orderId}</p>
                </div>
                <button onClick={() => copyText(orderId, 'ref')} className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  {copied === 'ref' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Bank Transfer Details</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-3">Transfer the exact amount to one of the accounts below:</p>
              {bankAccounts.map((account, index) => (
                <div key={index} className="bg-white rounded-lg p-4 mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-lg">{account.bank}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Account Number:</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">{account.accountNumber}</p>
                        <button onClick={() => copyText(account.accountNumber, account.bank)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Copy account number">
                          {copied === account.bank ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Account Name: <span className="font-semibold">{account.accountName}</span></p>
                  </div>
                </div>
              ))}

              <div className="mt-4 bg-white rounded-lg p-4 border border-dashed border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  <p className="font-semibold">Scan & Pay (Optional)</p>
                </div>
                {qrImage ? (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Scan this DuitNow/static QR for faster payment. Please key in the exact amount and add the payment reference in remark.</p>
                    <img src={qrImage} alt="DuitNow QR" className="w-40 h-40 object-contain rounded-lg border border-gray-200" />
                    <p className="text-xs text-gray-500">Replace the QR image at public{qrImage} with your own.</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Add your bank static QR (DuitNow) by placing an image at <code className="font-mono">public{qrImage || '/images/duitnow-qr.png'}</code>. Customers can scan & pay then upload receipt.</p>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Upload Payment Receipt</h3>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition-colors">
              {receipt ? (
                <div className="space-y-3">
                  <img src={receipt} alt="Receipt" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Receipt uploaded successfully
                  </p>
                  <button onClick={() => setReceipt('')} className="text-sm text-red-600 hover:underline">
                    Remove & upload different receipt
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium mb-1">Click to upload receipt</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!receipt || uploading}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Submit Order & Receipt
          </button>
          <p className="text-xs text-gray-500 text-center">
            Your order will be processed once payment is verified by our team (usually within 24 hours)
          </p>
        </div>
      </div>
    </div>
  )
}

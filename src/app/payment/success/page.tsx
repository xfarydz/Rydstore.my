'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    // Get URL parameters from ToyyibPay return
    const status_id = searchParams.get('status_id')
    const billcode = searchParams.get('billcode')
    const order_id = searchParams.get('order_id')
    const amount = searchParams.get('amount')
    const reason = searchParams.get('reason')

    console.log('📄 Payment return page loaded with params:', {
      status_id,
      billcode,
      order_id,
      amount,
      reason
    })

    setPaymentDetails({
      status_id,
      billcode,
      order_id,
      amount,
      reason
    })

    // Determine payment status based on ToyyibPay response
    if (status_id === '1') {
      setPaymentStatus('success')
      console.log('✅ Payment successful')
    } else {
      setPaymentStatus('failed')
      console.log('❌ Payment failed:', reason)
    }
  }, [searchParams])

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Processing payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {paymentStatus === 'success' ? (
          <>
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Your payment has been processed successfully via ToyyibPay.</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
              <div className="text-sm text-green-700 space-y-1">
                {paymentDetails?.order_id && (
                  <p><span className="font-medium">Order ID:</span> {paymentDetails.order_id}</p>
                )}
                {paymentDetails?.billcode && (
                  <p><span className="font-medium">Bill Code:</span> {paymentDetails.billcode}</p>
                )}
                {paymentDetails?.amount && (
                  <p><span className="font-medium">Amount:</span> RM{(parseInt(paymentDetails.amount) / 100).toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors inline-block"
              >
                Continue Shopping
              </Link>
              
              <Link
                href="/my-purchases"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors inline-block"
              >
                View My Purchases
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600">Unfortunately, your payment could not be processed.</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
              <div className="text-sm text-red-700 space-y-1">
                {paymentDetails?.reason && (
                  <p><span className="font-medium">Reason:</span> {paymentDetails.reason}</p>
                )}
                {paymentDetails?.order_id && (
                  <p><span className="font-medium">Order ID:</span> {paymentDetails.order_id}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors inline-block"
              >
                Return to Home
              </Link>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🎯 Powered by <strong>ToyyibPay</strong> - Secure Malaysian Payment Gateway
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from './AlertProvider';
import { X, Loader, CheckCircle } from 'lucide-react';

interface ToyyibPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  productBrand: string;
  productSize: string;
  productColor: string;
  productId: string;
  amount: number;
  orderId: string;
  // Optional: pass cart items for bulk checkout
  items?: Array<{
    productId: string;
    productName: string;
    productImage: string;
    productBrand?: string;
    productSize?: string;
    productColor?: string;
    quantity?: number;
    price?: number;
  }>;
  onPaymentSuccess: () => void;
}

export default function ToyyibPayModal({
  isOpen,
  onClose,
  productName,
  productImage,
  productBrand,
  productSize,
  productColor,
  productId,
  amount,
  orderId,
  items,
  onPaymentSuccess
}: ToyyibPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  if (!isOpen) return null;

  const handlePayWithToyyibPay = async () => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to proceed with payment');
      return;
    }

    setLoading(true);

    try {
      // Create bill via our API
      const response = await fetch('/api/toyyibpay/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          reference: orderId,
          email: user.email,
          name: user.name,
          phone: user.phone
        })
      });

      const data = await response.json();

      if (data.success && data.billUrl) {
        // Save pending order to localStorage
        const order = {
          id: orderId,
          productId,
          productName,
          productImage,
          productBrand,
          productSize,
          productColor,
          amount,
          // Only attach items when provided (cart/bulk checkout)
          ...(Array.isArray(items) && items.length ? { items } : {}),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          status: 'pending',
          paymentMethod: 'toyyibpay',
          billCode: data.billCode,
          createdAt: new Date().toISOString()
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        // Mark product as sold
        const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const updatedProducts = products.map((p: any) =>
          p.id === productId
            ? { ...p, isSoldOut: true, inStock: false, orderId }
            : p
        );
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
        window.dispatchEvent(new Event('productUpdated'));

        // Redirect to ToyyibPay
        setRedirecting(true);
        showSuccess(
          'Redirecting to Payment Gateway',
          'You will be redirected to ToyyibPay to complete payment...'
        );
        
        setTimeout(() => {
          window.location.href = data.billUrl;
        }, 2000);
      } else {
        showError('Payment Setup Failed', data.error || 'Failed to create payment bill');
        setLoading(false);
      }
    } catch (error) {
      console.error('ToyyibPay error:', error);
      showError('Payment Error', 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-200">
      <div
        style={{ animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-black text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Secure Payment</h2>
            <button
              onClick={onClose}
              disabled={loading || redirecting}
              className="text-white hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
            <div className="flex gap-4">
              <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium">{productName}</p>
                <p className="text-sm text-gray-600">{productBrand}</p>
                <p className="text-sm text-gray-600">Size: {productSize} • Color: {productColor}</p>
                <p className="text-lg font-bold text-black mt-2">RM {amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Secure Payment via ToyyibPay</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Support multiple payment methods (ShopeePay, banks, cards, e-wallets)</li>
              <li>✓ Instant payment verification</li>
              <li>✓ Secure encryption by ToyyibPay</li>
              <li>✓ Your order auto-confirms upon successful payment</li>
            </ul>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayWithToyyibPay}
            disabled={loading || redirecting}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Setting up payment...
              </>
            ) : redirecting ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Redirecting to ToyyibPay...
              </>
            ) : (
              <>
                Proceed to Payment
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            You will be securely redirected to ToyyibPay to complete your payment
          </p>
        </div>
      </div>
    </div>
  );
}

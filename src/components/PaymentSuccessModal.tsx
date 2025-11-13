'use client';

import { X, CheckCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  amount: number;
  orderId: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  productName,
  productImage,
  amount,
  orderId
}: PaymentSuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ${
      show ? 'opacity-100' : 'opacity-0'
    }`}>
      <div 
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-900 to-black text-white rounded-t-3xl p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center relative">
            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-12 w-1 h-1 bg-pink-300 rounded-full animate-bounce"></div>
              <div className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping"></div>
            </div>
            
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-white/90 text-sm">Your order has been confirmed</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4 mb-4">
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{productName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  SOLD OUT
                </span>
                <ShoppingBag className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Order ID</span>
              <span className="text-gray-900 font-mono text-sm">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Amount Paid</span>
              <span className="text-gray-900 font-bold">RM {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Status</span>
              <span className="text-green-600 font-medium text-sm">✓ Completed</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm text-center">
              🎉 <strong>Congratulations!</strong> This item is now marked as <strong>SOLD OUT</strong> and no longer available for purchase.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 px-4 rounded-xl font-medium hover:from-black hover:to-gray-900 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                handleClose();
                // Navigate to My Purchases page
                window.location.href = '/my-purchases';
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              View My Purchases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
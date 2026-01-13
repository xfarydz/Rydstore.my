'use client';

import { useState } from 'react';
import { X, Smartphone, Building2, CreditCard } from 'lucide-react';
import BankTransferModal from './BankTransferModal';
import ToyyibPayModal from './ToyyibPayModal';

interface PaymentMethodSelectorProps {
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
  onPaymentSuccess: () => void;
}

export default function PaymentMethodSelector({
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
  onPaymentSuccess
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'toyyibpay' | 'bank' | null>(null);

  if (!isOpen) return null;

  if (selectedMethod === 'toyyibpay') {
    return (
      <ToyyibPayModal
        isOpen={true}
        onClose={() => {
          setSelectedMethod(null);
          onClose();
        }}
        productName={productName}
        productImage={productImage}
        productBrand={productBrand}
        productSize={productSize}
        productColor={productColor}
        productId={productId}
        amount={amount}
        orderId={orderId}
        onPaymentSuccess={() => {
          setSelectedMethod(null);
          onPaymentSuccess();
        }}
      />
    );
  }

  if (selectedMethod === 'bank') {
    return (
      <BankTransferModal
        isOpen={true}
        onClose={() => {
          setSelectedMethod(null);
          onClose();
        }}
        productName={productName}
        productImage={productImage}
        productBrand={productBrand}
        productSize={productSize}
        productColor={productColor}
        productId={productId}
        amount={amount}
        orderId={orderId}
        onPaymentSuccess={() => {
          setSelectedMethod(null);
          onPaymentSuccess();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-200">
      <div
        style={{ animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Choose Payment Method</h2>
              <p className="text-gray-300 text-sm">Select your preferred payment option</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Payment Amount</p>
            <p className="text-3xl font-bold text-black">RM {amount.toFixed(2)}</p>
            <p className="text-sm text-gray-700 mt-2">For: <span className="font-semibold">{productName}</span></p>
          </div>

          {/* Payment Methods Grid */}
          <div className="space-y-3">
            {/* E-Wallet Option */}
            <button
              onClick={() => setSelectedMethod('toyyibpay')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Smartphone className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">E-Wallet</h3>
                  <p className="text-sm text-gray-600 mt-0.5">ToyyibPay • Instant Verification</p>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ShopeePay</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Grab</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">TNG</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-blue-600">→</div>
                  <p className="text-xs text-green-600 font-semibold mt-1">RECOMMENDED</p>
                </div>
              </div>
            </button>

            {/* Bank Transfer Option */}
            <button
              onClick={() => setSelectedMethod('bank')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Building2 className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Bank Transfer</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Manual Transfer • 24-hour Verification</p>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Maybank</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">CIMB</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Public Bank</span>
                  </div>
                </div>
                <div className="text-2xl text-green-600">→</div>
              </div>
            </button>

            {/* Card Option (Future) */}
            <button
              disabled
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-lg">
                  <CreditCard className="h-7 w-7 text-gray-500" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-500 text-lg">Credit/Debit Card</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Coming Soon</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
              </div>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6 px-2">
            ✓ All methods are secure • ✓ Your data is encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Banknote, Globe } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  fee: string;
  description: string;
  available: boolean;
  type: 'card' | 'banking' | 'ewallet' | 'international';
}

interface PaymentSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  amount: number;
}

export default function PaymentSelector({ selectedMethod, onMethodSelect, amount }: PaymentSelectorProps) {
  const paymentMethods: PaymentMethod[] = [
    // Recommended: Stripe (International + Local)
    {
      id: 'stripe',
      name: 'Credit/Debit Card + FPX',
      icon: <CreditCard className="h-6 w-6" />,
      fee: '2.9% + RM1.50',
      description: 'Visa, Mastercard, FPX Online Banking',
      available: true,
      type: 'card'
    },
    
    // Local Malaysian Banking
    {
      id: 'fpx',
      name: 'FPX Online Banking',
      icon: <Building className="h-6 w-6" />,
      fee: '1.5%',
      description: 'Maybank, CIMB, Public Bank, RHB, etc',
      available: true,
      type: 'banking'
    },
    
    // E-Wallets
    {
      id: 'grabpay',
      name: 'GrabPay',
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
      fee: '2.5%',
      description: 'Pay with GrabPay wallet',
      available: true,
      type: 'ewallet'
    },
    
    {
      id: 'boost',
      name: 'Boost',
      icon: <Smartphone className="h-6 w-6 text-orange-600" />,
      fee: '2.5%',
      description: 'Pay with Boost e-wallet',
      available: true,
      type: 'ewallet'
    },
    
    // International
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      fee: '3.4% + RM2',
      description: 'International payments with buyer protection',
      available: true,
      type: 'international'
    },
    
    // Bank Transfer (Free)
    {
      id: 'bank_transfer',
      name: 'Bank Transfer (Manual)',
      icon: <Banknote className="h-6 w-6" />,
      fee: 'FREE',
      description: 'Transfer to our bank account (manual verification)',
      available: true,
      type: 'banking'
    }
  ];

  const calculateFee = (method: PaymentMethod): string => {
    if (method.fee === 'FREE') return 'FREE';
    
    // Simple fee calculation
    if (method.id === 'stripe') return `RM${(amount * 0.029 + 1.50).toFixed(2)}`;
    if (method.id === 'fpx') return `RM${(amount * 0.015).toFixed(2)}`;
    if (method.id === 'grabpay' || method.id === 'boost') return `RM${(amount * 0.025).toFixed(2)}`;
    if (method.id === 'paypal') return `RM${(amount * 0.034 + 2).toFixed(2)}`;
    
    return method.fee;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Payment Method</h3>
      
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          onClick={() => method.available && onMethodSelect(method.id)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedMethod === method.id
              ? 'border-black bg-gray-50'
              : method.available
              ? 'border-gray-200 hover:border-gray-400'
              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {method.icon}
              <div>
                <h4 className="font-semibold text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                Fee: {calculateFee(method)}
              </p>
              <p className="text-xs text-gray-500">
                {method.available ? 'Available' : 'Coming Soon'}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Payment Security Notice */}
      <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <p className="text-sm text-green-800 font-medium">Secure Payment</p>
        </div>
        <p className="text-xs text-green-700 mt-1">
          All payments are processed securely with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
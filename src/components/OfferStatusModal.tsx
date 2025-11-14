'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PaymentModal from './PaymentModal';
import { useAlert } from './AlertProvider';

interface OfferStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    offeredPrice: number;
    status: 'accepted' | 'rejected' | 'pending';
    originalPrice: number;
  };
}

export default function OfferStatusModal({ isOpen, onClose, offer }: OfferStatusModalProps) {
  const [showPayment, setShowPayment] = useState(false);
  const { user } = useAuth();
  const { showSuccess } = useAlert();

  if (!isOpen) return null;

  const handlePayNow = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    // Mark item as sold
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const updatedProducts = adminProducts.map((p: any) => {
      if (p.id === offer.productId) {
        return { 
          ...p, 
          isSoldOut: true,
          soldQuantity: (p.soldQuantity || 0) + 1,
          offers: p.offers?.map((o: any) => 
            o.id === offer.id ? { ...o, status: 'completed', paidAt: new Date().toISOString() } : o
          )
        };
      }
      return p;
    });
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));

    // Create success notification
    if (user) {
      const notifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
      const newNotification = {
        id: 'notification-' + Date.now(),
        userId: user.id,
        type: 'payment_success',
        title: 'Purchase Complete! 🎉',
        message: `You have successfully purchased ${offer.productName} for RM${offer.offeredPrice.toLocaleString()}. The item will be shipped to you soon!`,
        productId: offer.productId,
        productName: offer.productName,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      notifications.unshift(newNotification);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }

    setShowPayment(false);
    
    showSuccess(
      'Payment Successful!',
      'Your item has been purchased and will be shipped soon. Thank you for your purchase!'
    );
    
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Offer Status Update</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <img
                src={offer.productImage}
                alt={offer.productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{offer.productName}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Original Price: RM{offer.originalPrice.toLocaleString()}</p>
                  <p className="text-lg font-bold text-green-600">Your Offer: RM{offer.offeredPrice.toLocaleString()}</p>
                  <p className="text-sm text-green-600">You save: RM{(offer.originalPrice - offer.offeredPrice).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Content */}
          <div className="p-6">
            {offer.status === 'accepted' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Offer Accepted! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  Great news! The admin has accepted your offer. You can now proceed with the payment to complete your purchase.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Payment Required</p>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete your payment within 24 hours to secure this item.
                  </p>
                </div>

                <button
                  onClick={handlePayNow}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                >
                  Pay Now - RM{offer.offeredPrice.toLocaleString()}
                </button>
              </div>
            )}

            {offer.status === 'rejected' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Offer Not Accepted</h3>
                <p className="text-gray-600 mb-6">
                  Unfortunately, your offer was not accepted this time. You can try making a different offer or purchase at the listed price.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            )}

            {offer.status === 'pending' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-600 mb-2">Offer Under Review</h3>
                <p className="text-gray-600 mb-6">
                  Your offer is currently being reviewed by our team. You will receive a notification once there's an update.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        productName={offer.productName}
        productImage={offer.productImage}
        productBrand={'Unknown'}
        productSize={'One Size'}
        productColor={'Default'}
        productId={offer.productId || offer.id}
        amount={offer.offeredPrice}
        orderId={`offer-${offer.id}`}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
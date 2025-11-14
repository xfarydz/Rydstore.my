'use client';

import { useState, useEffect } from 'react';
import { Clock, Check, X, Package, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import OfferStatusModal from './OfferStatusModal';

interface UserOffersProps {
  onClose?: () => void;
}

export default function UserOffers({ onClose }: UserOffersProps) {
  const [userOffers, setUserOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!user) return;

    // Get user's offers from adminProducts
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const offers: any[] = [];

    adminProducts.forEach((product: any) => {
      if (product.offers) {
        product.offers.forEach((offer: any) => {
          if (offer.userId === user.id) {
            offers.push({
              ...offer,
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              originalPrice: product.price
            });
          }
        });
      }
    });

    // Sort by creation date (newest first)
    offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setUserOffers(offers);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <Package className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOfferClick = (offer: any) => {
    setSelectedOffer(offer);
    setShowOfferStatus(true);
  };

  if (!user) {
    const loginMessage = (
      <div className="text-center py-8">
        <p className="text-gray-600">Please login to view your offers.</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    );

    if (onClose) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {loginMessage}
          </div>
        </div>
      );
    }

    return loginMessage;
  }

  const content = (
    <div className={onClose ? "p-6" : "max-w-4xl mx-auto p-6"}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Offers</h2>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">{userOffers.length} total offers</p>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Offers Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-lg font-bold text-yellow-900">
                {userOffers.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Accepted</p>
              <p className="text-lg font-bold text-green-900">
                {userOffers.filter(o => o.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-lg font-bold text-red-900">
                {userOffers.filter(o => o.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Purchased</p>
              <p className="text-lg font-bold text-blue-900">
                {userOffers.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      {userOffers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
          <p className="text-gray-600">Start browsing products and make your first offer!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOffers.map((offer) => (
            <div 
              key={offer.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={offer.productImage}
                  alt={offer.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{offer.productName}</h4>
                      <div className="mt-1">
                        <span className="text-sm text-gray-600">Your Offer: </span>
                        <span className="font-semibold text-lg text-blue-600">
                          {settings.currency}{offer.offeredPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Original Price: {settings.currency}{offer.originalPrice.toLocaleString()}
                        <span className="text-green-600 ml-2">
                          (Save {settings.currency}{(offer.originalPrice - offer.offeredPrice).toLocaleString()})
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(offer.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(offer.status)}`}>
                        {getStatusIcon(offer.status)}
                        <span>
                          {offer.status === 'completed' ? 'PURCHASED ✅' : offer.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {offer.status === 'accepted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOfferClick(offer);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </button>
                      )}
                      
                      {offer.status === 'completed' && offer.paidAt && (
                        <p className="text-xs text-gray-500">
                          Paid: {new Date(offer.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {offer.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">"{offer.message}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Status Modal */}
      {selectedOffer && (
        <OfferStatusModal
          isOpen={showOfferStatus}
          onClose={() => {
            setShowOfferStatus(false);
            setSelectedOffer(null);
            // Refresh offers after modal close
            const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            const offers: any[] = [];
            adminProducts.forEach((product: any) => {
              if (product.offers) {
                product.offers.forEach((offer: any) => {
                  if (offer.userId === user.id) {
                    offers.push({
                      ...offer,
                      productId: product.id,
                      productName: product.name,
                      productImage: product.image,
                      originalPrice: product.price
                    });
                  }
                });
              }
            });
            offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUserOffers(offers);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );

  if (onClose) {
    // Render as modal
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  // Render as page
  return content;
}
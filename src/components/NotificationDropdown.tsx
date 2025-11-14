'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, CreditCard, XCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OfferStatusModal from './OfferStatusModal';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const { notifications, unreadCount, markNotificationAsRead, clearNotifications, user } = useAuth();

  // Check and auto-close expired accepted offers (24 hours)
  useEffect(() => {
    const checkExpiredOffers = () => {
      if (!user) return;
      
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      let hasExpiredOffers = false;
      
      const updatedProducts = adminProducts.map((product: any) => {
        if (product.offers && product.offers.length > 0) {
          const updatedOffers = product.offers.map((offer: any) => {
            // Check if offer is accepted and not paid, and older than 24 hours
            if (offer.status === 'accepted' && !offer.paidAt && offer.userId === user.id) {
              const acceptedTime = new Date(offer.acceptedAt || offer.createdAt).getTime();
              const now = new Date().getTime();
              const timeDiff = now - acceptedTime;
              const hoursElapsed = timeDiff / (1000 * 60 * 60);
              
              if (hoursElapsed >= 24) {
                console.log(`🕒 Offer ${offer.id} expired after 24 hours - auto-closing deal`);
                hasExpiredOffers = true;
                
                // Create notification for user about expired deal
                const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
                const expiredNotification = {
                  id: 'notification_' + Date.now(),
                  userId: user.id,
                  type: 'offer_expired',
                  title: 'Deal Expired ⏰',
                  message: `Your accepted offer for "${product.name}" has expired due to non-payment within 24 hours. The deal is now closed.`,
                  productId: product.id,
                  productName: product.name,
                  offerId: offer.id,
                  isRead: false,
                  createdAt: new Date().toISOString()
                };
                
                const updatedNotifications = [expiredNotification, ...userNotifications];
                localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
                
                return { ...offer, status: 'expired' as const };
              }
            }
            return offer;
          });
          
          return { ...product, offers: updatedOffers };
        }
        return product;
      });
      
      if (hasExpiredOffers) {
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
        // Trigger notification update event
        window.dispatchEvent(new Event('notificationUpdated'));
      }
    };
    
    // Check immediately and then every hour
    checkExpiredOffers();
    const intervalId = setInterval(checkExpiredOffers, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    
    // If it's a purchase success notification, show success details
    if (notification.type === 'payment_success') {
      setIsOpen(false); // Close dropdown
      // Could navigate to My Purchases page or show detailed modal here
      console.log('Purchase success notification clicked:', notification);
      return;
    }
    
    // If it's an offer-related notification, show the offer status modal
    if ((notification.type === 'offer_accepted' || notification.type === 'offer_rejected') && notification.offerId) {
      // Get offer details from localStorage
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const product = adminProducts.find((p: any) => p.id === notification.productId);
      const offer = product?.offers?.find((o: any) => o.id === notification.offerId);
      
      if (offer && product) {
        setSelectedOffer({
          id: offer.id,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          offeredPrice: offer.offeredPrice,
          status: offer.status,
          originalPrice: product.price
        });
        setShowOfferStatus(true);
        setIsOpen(false); // Close the dropdown when opening modal
      }
    }
  };

  const handlePayNowClick = (notification: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Mark as read first
    markNotificationAsRead(notification.id);
    
    // Get offer details and open payment modal
    if (notification.offerId) {
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const product = adminProducts.find((p: any) => p.id === notification.productId);
      const offer = product?.offers?.find((o: any) => o.id === notification.offerId);
      
      if (offer && product) {
        setSelectedOffer({
          id: offer.id,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          offeredPrice: offer.offeredPrice,
          status: offer.status,
          originalPrice: product.price
        });
        setShowOfferStatus(true);
        setIsOpen(false); // Close the dropdown when opening modal
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_accepted':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'offer_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'offer_expired':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'payment_required':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'payment_success':
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'offer_accepted':
      case 'payment_success':
        return 'bg-green-50 border-green-200';
      case 'offer_rejected':
        return 'bg-red-50 border-red-200';
      case 'offer_expired':
        return 'bg-orange-50 border-orange-200';
      case 'payment_required':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 ${
          isOpen ? 'bg-gray-100 text-black' : ''
        } ${unreadCount > 0 ? 'animate-pulse' : ''}`}
        title="Notifications"
      >
        <Bell className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-12' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div 
            className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden animate-in slide-in-from-top-2 fade-in-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow pointer */}
            <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t transform rotate-45 z-10"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearNotifications();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto notification-scroll">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                          : 'border-l-transparent hover:border-l-gray-300'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {notification.type === 'payment_success' && (
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                                  SOLD OUT
                                </span>
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Show product name for purchase notifications */}
                          {notification.type === 'payment_success' && (
                            <div className="mt-2 p-2 bg-green-50 rounded-md">
                              <p className="text-xs text-green-700 font-medium">
                                Product: {notification.productName}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          
                          {/* Action Button for Accepted Offers */}
                          {notification.type === 'offer_accepted' && (
                            <div>
                              {/* Countdown Timer */}
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-xs text-yellow-700 font-medium">
                                  ⏰ Payment deadline: 24 hours from acceptance
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                  Deal will auto-close if payment not completed within deadline
                                </p>
                              </div>
                              <button
                                onClick={(e) => handlePayNowClick(notification, e)}
                                className="mt-3 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-medium py-2.5 px-3 rounded-md transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              >
                                💳 Pay Now - RM{notification.offeredPrice?.toLocaleString() || 'N/A'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Offer Status Modal */}
      {selectedOffer && (
        <OfferStatusModal
          isOpen={showOfferStatus}
          onClose={() => {
            setShowOfferStatus(false);
            setSelectedOffer(null);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );
}
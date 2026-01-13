'use client';

import { useState, useEffect } from 'react';
import { X, Package, Truck, MapPin, CheckCircle, Clock, Send } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdateOrder: (saleId: string, newStatus: string, trackingNumber?: string) => void;
}

const ORDER_STATUSES = [
  { value: 'paid', label: 'Payment Confirmed', icon: CheckCircle, color: 'green' },
  { value: 'preparing', label: 'Preparing to Ship', icon: Package, color: 'yellow' },
  { value: 'in_transit', label: 'In Transit', icon: Truck, color: 'blue' },
  { value: 'delivered', label: 'Delivered', icon: MapPin, color: 'purple' }
];

export default function OrderTrackingModal({
  isOpen,
  onClose,
  order,
  onUpdateOrder
}: OrderTrackingModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'paid');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || 'paid');
      setTrackingNumber(order.trackingNumber || '');
      setShowTrackingInput(order.status === 'in_transit');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus === 'in_transit') {
      setShowTrackingInput(true);
    } else {
      setShowTrackingInput(false);
      setTrackingNumber('');
    }
  };

  const handleUpdateOrder = async () => {
    if (selectedStatus === 'in_transit' && !trackingNumber.trim()) {
      alert('Please enter tracking number for in transit orders.');
      return;
    }

    setIsUpdating(true);

    try {
      // Update the order status
      onUpdateOrder(order.id, selectedStatus, trackingNumber.trim());
      
      // If status is in_transit and we have tracking number, send WhatsApp
      if (selectedStatus === 'in_transit' && trackingNumber.trim() && order.buyer?.phone) {
        await sendTrackingWhatsApp(order, trackingNumber.trim());
      }

      setTimeout(() => {
        setIsUpdating(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating order:', error);
      setIsUpdating(false);
      alert('Failed to update order. Please try again.');
    }
  };

  const sendTrackingWhatsApp = async (saleData: any, tracking: string) => {
    const phone = saleData.buyer?.phone?.replace(/[^\d]/g, ''); // Clean phone number
    const customerName = saleData.buyer?.name || 'Customer';
    const productName = saleData.productName || 'Your order';
    const orderId = saleData.orderId;

    const message = `🚚 *ORDER SHIPPED NOTIFICATION*

Hello ${customerName}! 📦

Your order has been shipped and is now in transit:

📋 *Order Details:*
• Order ID: ${orderId}
• Product: ${productName}
• Status: In Transit 🚛

📍 *Tracking Information:*
• Tracking Number: *${tracking}*
• You can track your package using this number

⏰ *Estimated Delivery:*
• 2-5 working days (depending on location)

Thank you for shopping with us! 🙏

---
*Farid Fashion Store*
_Your trusted fashion partner_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
  };

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex(status => status.value === selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Order Tracking</h2>
            <p className="text-blue-100">Update order status and notify customer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.productName}</h3>
                <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
                <p className="text-sm text-gray-600">Customer: {order.buyer?.name}</p>
                <p className="text-sm text-gray-600">Phone: {order.buyer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-green-600">
                  {order.currency}{order.amount}
                </p>
                <p className="text-xs text-gray-500">{order.purchaseDate}</p>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Order Progress</h4>
            <div className="flex items-center justify-between">
              {ORDER_STATUSES.map((status, index) => {
                const isActive = index <= getCurrentStatusIndex();
                const isCurrent = status.value === selectedStatus;
                const StatusIcon = status.icon;
                
                return (
                  <div key={status.value} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive 
                        ? `bg-${status.color}-500 text-white` 
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <p className={`text-xs text-center font-medium ${
                      isActive ? `text-${status.color}-600` : 'text-gray-400'
                    }`}>
                      {status.label}
                    </p>
                    {index < ORDER_STATUSES.length - 1 && (
                      <div className={`absolute h-1 w-16 mt-6 ml-16 ${
                        index < getCurrentStatusIndex() ? 'bg-green-300' : 'bg-gray-200'
                      }`} style={{ zIndex: -1 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
            <div className="space-y-2">
              {ORDER_STATUSES.map((status) => {
                const StatusIcon = status.icon;
                return (
                  <label key={status.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="mr-3"
                    />
                    <StatusIcon className={`w-5 h-5 mr-3 text-${status.color}-500`} />
                    <span className="font-medium">{status.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tracking Number Input */}
          {showTrackingInput && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Tracking Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g., TT123456789MY)"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    <strong>Auto WhatsApp:</strong> Tracking number will be sent to customer automatically
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateOrder}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
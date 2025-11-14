'use client';

import { useState } from 'react';
import { X, MessageCircle, DollarSign, Tag } from 'lucide-react';
import { Product } from '@/data/products';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAlert } from './AlertProvider';

interface OfferModalProps {
  product: Product | null;
  onClose: () => void;
  onOfferSubmitted: () => void;
}

export default function OfferModal({ product, onClose, onOfferSubmitted }: OfferModalProps) {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const { showSuccess } = useAlert();
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!product || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice || isNaN(Number(offerPrice))) return;
    
    setLoading(true);
    
    const offer = {
      id: 'offer-' + Date.now(),
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      offeredPrice: Number(offerPrice),
      message: message || '',
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    console.log('Before saving offer - adminProducts:', adminProducts);
    console.log('Saving offer:', offer);
    
    let productFound = false;
    const updatedProducts = adminProducts.map((p: any) => {
      if (p.id === product.id) {
        productFound = true;
        return { ...p, offers: [...(p.offers || []), offer] };
      }
      return p;
    });
    
    // If product not found in adminProducts, add it with the offer
    if (!productFound) {
      updatedProducts.push({
        ...product,
        offers: [offer],
        soldQuantity: 0,
        totalStock: Math.floor(Math.random() * 20) + 5
      });
    }
    
    console.log('After adding offer - updatedProducts:', updatedProducts);
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    
    // Create chat conversation
    const chatId = 'chat-' + Date.now();
    const chatConversation = {
      id: chatId,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      offerId: offer.id,
      offeredPrice: Number(offerPrice),
      listedPrice: product.price,
      status: 'active',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: user.id,
          senderName: user.name,
          senderType: 'customer',
          message: `Hi! I'm interested in ${product.name}. I'd like to offer ${settings.currency}${Number(offerPrice).toLocaleString()} for this item.${message ? ' ' + message : ''}`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    const conversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
    conversations.push(chatConversation);
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
    
    setLoading(false);
    
    // Show success message
    showSuccess(
      'Offer Submitted Successfully!',
      `Your offer of ${settings.currency}${Number(offerPrice).toLocaleString()} has been submitted! Check the chat to continue the conversation.`
    );
    
    onOfferSubmitted();
    onClose();
  };

  const suggestedPrice = Math.floor(product.price * 0.8);
  const percentage = offerPrice ? Math.round((Number(offerPrice) / product.price) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Cancel Offer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="text-lg font-bold text-blue-600">
                Listed Price: RM{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Rules Warning */}
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Payment Agreement</h4>
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> By submitting this offer, you agree that if the admin accepts your offer, 
                you are committed to purchase this item at the agreed price. You will need to complete payment 
                immediately after acceptance.
              </p>
            </div>
          </div>
        </div>

        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Offer Price
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">RM</div>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder={suggestedPrice.toString()}
                min="1"
                max={product.price}
                required
              />
            </div>
            {offerPrice && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  That's {percentage}% of the listed price
                </span>
                <span className={`font-medium ${
                  percentage >= 80 ? 'text-green-600' : 
                  percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentage >= 80 ? 'Great offer!' : 
                   percentage >= 60 ? 'Fair offer' : 'Low offer'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                placeholder="Tell us why you want this item or any questions..."
              />
            </div>
          </div>

          {/* Suggested Prices */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Quick Offer Suggestions:</h4>
            <div className="flex gap-2 flex-wrap">
              {[0.9, 0.8, 0.7, 0.6].map((ratio) => {
                const price = Math.floor(product.price * ratio);
                return (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setOfferPrice(price.toString())}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors"
                  >
                    RM{price.toLocaleString()} ({Math.round(ratio * 100)}%)
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !offerPrice}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Submitting Offer...' : `Submit Offer - RM${offerPrice ? Number(offerPrice).toLocaleString() : '0'}`}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6 text-center text-sm text-gray-600">
          <p>Your offer will be reviewed by our team. You'll receive a response via chat within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
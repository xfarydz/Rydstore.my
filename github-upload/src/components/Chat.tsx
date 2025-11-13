'use client';

import { useState, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'admin';
  message: string;
  timestamp: string;
}

interface ChatConversation {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  offerId: string;
  offeredPrice: number;
  listedPrice: number;
  status: 'active' | 'closed';
  createdAt: string;
  messages: ChatMessage[];
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chat({ isOpen, onClose }: ChatProps) {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  const loadConversations = () => {
    // Mock data - in real app, fetch from API
    const mockConversations: ChatConversation[] = [];
    setConversations(mockConversations);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderType: 'customer',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversation) {
        return { ...c, messages: [...c.messages, message] };
      }
      return c;
    }));
    
    setNewMessage('');
  };

  if (!isOpen) return null;

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col animate-slideIn">
        {/* Chat Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Messages</h3>
              {conversations.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!activeConversation ? (
          // Conversations List View
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 h-full flex flex-col justify-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No messages yet</p>
                <p className="text-xs mt-1">Make an offer to start chatting!</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors mb-2 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={conv.productImage}
                        alt={conv.productName}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">{conv.productName}</h4>
                        <p className="text-xs text-gray-600">
                          Offer: {settings.currency}{conv.offeredPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">
                          {conv.messages.length} messages
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Active Conversation View  
          <div className="flex flex-col flex-1">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <button
                onClick={() => setActiveConversation(null)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to conversations
              </button>
              {activeConv && (
                <div className="flex items-center gap-2">
                  <img
                    src={activeConv.productImage}
                    alt={activeConv.productName}
                    className="w-8 h-8 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{activeConv.productName}</h4>
                    <p className="text-xs text-gray-600">Offer: {settings.currency}{activeConv.offeredPrice.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {!activeConv?.messages.length ? (
                <div className="text-center text-gray-500 text-sm">
                  <p>No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                activeConv.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export default function CustomAlert({
  isOpen,
  onClose,
  title,
  message,
  type,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false
}: CustomAlertProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-white" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-white" />;
      case 'warning':
        return <AlertCircle className="h-8 w-8 text-white" />;
      case 'info':
        return <Info className="h-8 w-8 text-white" />;
      default:
        return <Info className="h-8 w-8 text-white" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-black';
      case 'error':
        return 'bg-gray-800';
      case 'warning':
        return 'bg-gray-700';
      case 'info':
        return 'bg-gray-600';
      default:
        return 'bg-black';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header with Icon */}
        <div className={`${getIconBgColor()} rounded-t-2xl p-6 text-center relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex justify-center mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              {getIcon()}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center leading-relaxed mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${showCancel ? 'justify-between' : 'justify-center'}`}>
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors border border-gray-200"
              >
                {cancelText}
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              className={`${showCancel ? 'flex-1' : 'w-full'} px-4 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
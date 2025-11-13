'use client';

import React from 'react';
import { AlertTriangle, User, Phone, MapPin, Mail, X } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
  errors: string[];
  completionPercentage: number;
  onGoToProfile: () => void;
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  missingFields,
  errors,
  completionPercentage,
  onGoToProfile
}: ProfileCompletionModalProps) {
  if (!isOpen) return null;

  const getFieldIcon = (field: string) => {
    if (field.includes('Name') || field.includes('user_account')) return <User className="w-4 h-4" />;
    if (field.includes('Phone')) return <Phone className="w-4 h-4" />;
    if (field.includes('Email')) return <Mail className="w-4 h-4" />;
    if (field.includes('Address') || field.includes('Street') || field.includes('City') || field.includes('State') || field.includes('Postcode')) return <MapPin className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Profile Required</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  completionPercentage < 50 ? 'bg-red-500' : 
                  completionPercentage < 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete Your Profile to Continue
            </h3>
            <p className="text-gray-600">
              To ensure secure delivery and payment processing, please complete your profile information.
            </p>
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Missing Information:</h4>
              <div className="space-y-2">
                {missingFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-red-600">
                      {getFieldIcon(field)}
                    </div>
                    <span className="text-sm font-medium text-red-800">{field}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Please Fix:</h4>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Why complete your profile?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Faster checkout process</li>
              <li>• Accurate delivery information</li>
              <li>• Order status notifications</li>
              <li>• Better customer support</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={onGoToProfile}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg"
          >
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
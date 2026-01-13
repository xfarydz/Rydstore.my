'use client'

import React from 'react'
import { X, Check, AlertTriangle, Info, Trash2 } from 'lucide-react'

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: CustomModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-8 w-8 text-white" />
      case 'error':
        return <X className="h-8 w-8 text-white" />
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-white" />
      case 'info':
        return <Info className="h-8 w-8 text-white" />
      case 'confirm':
        return <Trash2 className="h-8 w-8 text-white" />
      default:
        return <Info className="h-8 w-8 text-white" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'info':
        return 'bg-blue-500'
      case 'confirm':
        return 'bg-gray-600'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-200">
      <div 
        style={{ animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {/* Header with Black Background */}
        <div className="bg-black text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body with White Background */}
        <div className="p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          {type === 'confirm' ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:bg-gray-100 text-gray-800 rounded-lg font-semibold transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.()
                  onClose()
                }}
                className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-all duration-200"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-all duration-200"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
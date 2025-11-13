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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-pulse">
        {/* Header with Icon */}
        <div className="text-center p-6">
          <div className={`mx-auto w-16 h-16 ${getIconBgColor()} rounded-full flex items-center justify-center mb-4`}>
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          {type === 'confirm' ? (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-medium transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.()
                  onClose()
                }}
                className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
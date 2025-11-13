'use client'

import React, { useState } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { ArrowRight } from 'lucide-react'
import CustomModal from './CustomModal'

export default function Footer() {
  const { settings } = useSiteSettings()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: ''
  })

  const showSuccessModal = (title: string, message: string) => {
    setModal({ isOpen: true, type: 'success', title, message })
  }

  const showErrorModal = (title: string, message: string) => {
    setModal({ isOpen: true, type: 'error', title, message })
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Store email in localStorage
      const existingEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]')
      if (!existingEmails.includes(email)) {
        existingEmails.push({
          email: email,
          subscribedAt: new Date().toISOString(),
          id: Date.now()
        })
        localStorage.setItem('newsletterEmails', JSON.stringify(existingEmails))
        showSuccessModal('Welcome to Our Newsletter!', 'Thank you for subscribing! You\'ll be the first to know about:\n\n✨ New arrivals\n🎯 Exclusive offers\n🔥 Flash sales\n💎 VIP discounts')
      } else {
        showErrorModal('Already Subscribed', 'This email is already subscribed to our newsletter.\n\nCheck your notifications for the latest updates!')
      }
      setEmail('')
    }
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
          
          {/* Left Side - Brand & Copyright */}
          <div className="flex-1 space-y-4">
            {/* Brand Logo */}
            <div className="flex items-center space-x-2">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.storeName}
                  className="h-16 w-auto"
                />
              ) : (
                <div className="text-5xl font-black text-black tracking-tight font-display">
                  {settings.storeName.toLowerCase()}
                </div>
              )}
            </div>
            
            {/* Copyright & Legal */}
            <div className="space-y-2 text-sm text-gray-600 max-w-md font-body">
              <p>
                All contents of this website are the property of {settings.storeName.toUpperCase()}. 
                No part of this site, including all text and images, may be reproduced in any form 
                without the prior written consent of {settings.storeName.toUpperCase()}.
              </p>
              <p className="font-medium text-black font-sans">
                Copyright © {currentYear}. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* Right Side - Newsletter */}
          <div className="flex-shrink-0 lg:max-w-md w-full">
            <div className="text-left">
              <h3 className="text-xl font-bold text-black mb-2 font-display">
                Join our mailing list
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-body">
                Access exclusive early drop access, discount codes + more
              </p>
              
              {/* Email Subscription Form */}
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`hello@${settings.storeName.toLowerCase().replace(/\s+/g, '')}.com`}
                  className="flex-1 px-4 py-3 border-b-2 border-black bg-transparent text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="ml-3 p-3 bg-black text-white hover:bg-gray-800 transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget Placeholder */}
      <div className="fixed bottom-6 left-6">
        <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors cursor-pointer">
          💬 Chat
        </div>
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </footer>
  )
}
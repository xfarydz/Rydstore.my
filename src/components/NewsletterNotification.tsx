'use client'

import React, { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'

interface Notification {
  id: number
  productId: string
  productName: string
  productImage: string
  productPrice: number
  productBrand: string
  sentAt: string
}

export default function NewsletterNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // Listen for new product updates
    const handleProductUpdate = () => {
      setTimeout(loadNotifications, 1000) // Small delay to ensure localStorage is updated
    }
    
    window.addEventListener('productUpdated', handleProductUpdate)
    return () => window.removeEventListener('productUpdated', handleProductUpdate)
  }, [])

  const loadNotifications = () => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('newsletterNotifications') || '[]')
      const userEmail = getCurrentUserEmail()
      
      if (userEmail) {
        // Filter notifications sent to this user's email
        const userNotifications = allNotifications.filter((notif: any) => 
          notif.recipients && notif.recipients.includes(userEmail)
        )
        
        setNotifications(userNotifications.reverse()) // Latest first
        
        // Check for unread notifications (sent in last 24 hours and not dismissed)
        const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        
        const unread = userNotifications.filter((notif: Notification) => 
          notif.sentAt > oneDayAgo && !dismissed.includes(notif.id)
        )
        
        setUnreadCount(unread.length)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const getCurrentUserEmail = () => {
    try {
      // Check if user is subscribed to newsletter
      const newsletterEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]')
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      
      if (currentUser.email) {
        // Check if current user's email is in newsletter subscribers
        const isSubscribed = newsletterEmails.some((sub: any) => sub.email === currentUser.email)
        return isSubscribed ? currentUser.email : null
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  const dismissNotification = (notificationId: number) => {
    try {
      const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')
      dismissed.push(notificationId)
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const dismissAllNotifications = () => {
    try {
      const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')
      notifications.forEach(notif => {
        if (!dismissed.includes(notif.id)) {
          dismissed.push(notif.id)
        }
      })
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error dismissing all notifications:', error)
    }
  }

  // Don't show if user is not subscribed to newsletter
  if (!getCurrentUserEmail()) {
    return null
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowNotifications(true)}
        className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">New Arrivals</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={dismissAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <img
                          src={notification.productImage}
                          alt={notification.productName}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.productName}
                          </p>
                          <p className="text-xs text-gray-500">{notification.productBrand}</p>
                          <p className="text-sm font-bold text-black">RM{notification.productPrice}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => {
                              setShowNotifications(false)
                              window.location.href = `/product/${notification.productId}`
                            }}
                            className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No new arrivals yet</p>
                  <p className="text-xs mt-1">You'll be notified when new products are added!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
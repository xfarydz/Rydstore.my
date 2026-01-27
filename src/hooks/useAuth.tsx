'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAlert } from '@/components/AlertProvider';

interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  joinedDate: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'offer_accepted' | 'offer_rejected' | 'offer_expired' | 'payment_required' | 'payment_success';
  title: string;
  message: string;
  productId: string;
  productName: string;
  offerId?: string;
  offeredPrice?: number;
  isRead: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  refreshNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    // Check if user is already logged in
    console.log('useAuth: Initializing...');
    
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      const sessionStatus = localStorage.getItem('authSession');
      console.log('useAuth: Saved user from localStorage:', savedUser);
      console.log('useAuth: Session status:', sessionStatus);
      
      // Only restore session if explicitly marked as active
      if (savedUser && sessionStatus === 'active') {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('useAuth: Parsed user:', parsedUser);
          
          // Ensure user has all required fields for backward compatibility
          const completeUser = {
            ...parsedUser,
            fullName: parsedUser.fullName || parsedUser.name,
            address: parsedUser.address || {
              street: '',
              city: '',
              state: '',
              postcode: '',
              country: 'Malaysia'
            }
          };
          
          console.log('useAuth: Complete user:', completeUser);
          setUser(completeUser);
          setIsAuthenticated(true);
          // Update localStorage with complete user data
          localStorage.setItem('currentUser', JSON.stringify(completeUser));
          console.log('useAuth: User authenticated successfully');
        } catch (error) {
          console.error('useAuth: Error parsing saved user:', error);
          localStorage.removeItem('currentUser');
        }
      } else {
        console.log('useAuth: No active session, staying logged out');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      console.log('Notification update event received');
      if (user) {
        refreshNotifications();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('notificationUpdated', handleNotificationUpdate);
    }
    
    setIsInitialized(true);
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      }
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        fullName: foundUser.fullName || foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        address: foundUser.address || {
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: 'Malaysia'
        },
        joinedDate: foundUser.joinedDate
      };
      setUser(userSession);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      localStorage.setItem('authSession', 'active');
      
      // Show success message
      alert.showSuccess('Welcome Back!', `Successfully logged in as ${userSession.name}`);
      
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }
    
    // Create new user
    const newUser = {
      id: 'user-' + Date.now(),
      name,
      fullName: name,
      email,
      phone,
      address: {
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: 'Malaysia'
      },
      password,
      joinedDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto-login after registration
    const userSession = {
      id: newUser.id,
      name: newUser.name,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      joinedDate: newUser.joinedDate
    };
    setUser(userSession);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    localStorage.setItem('authSession', 'active');
    
    return true;
  };

  const logout = () => {
    const userName = user?.name || 'User';
    
    // Show confirmation dialog
    alert.showAlert({
      title: 'Confirm Logout',
      message: `Are you sure you want to logout, ${userName}?`,
      type: 'warning',
      showCancel: true,
      confirmText: 'Logout',
      cancelText: 'Stay',
      onConfirm: () => {
        // Clear user-specific data after confirmation
        if (user?.id) {
          localStorage.removeItem(`favorites_${user.id}`);
          localStorage.removeItem(`notifications_${user.id}`);
          localStorage.removeItem(`cart_${user.id}`);
        }
        
        setUser(null);
        setIsAuthenticated(false);
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('currentUser');
        localStorage.setItem('authSession', 'inactive');
        localStorage.removeItem('favorites');
        localStorage.removeItem('cartItems');
        
        // Show logout success message
        setTimeout(() => {
          alert.showInfo('Logged Out', `Goodbye ${userName}! See you soon.`);
        }, 100);
      }
    });
  };

  const refreshNotifications = () => {
    if (!user) return;
    
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter((n: Notification) => !n.isRead).length);
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!user) return;
    
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    const updatedNotifications = userNotifications.map((n: Notification) => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n: Notification) => !n.isRead).length);
  };

  const clearNotifications = () => {
    if (!user) return;
    
    localStorage.removeItem(`notifications_${user.id}`);
    setNotifications([]);
    setUnreadCount(0);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => {
    if (!user) return;
    
    const newNotification: Notification = {
      ...notificationData,
      id: 'notification_' + Date.now(),
      userId: user.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('📨 Adding new notification:', newNotification);
    
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    const updatedNotifications = [newNotification, ...userNotifications];
    
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n: Notification) => !n.isRead).length);
    
    // Trigger notification update event
    window.dispatchEvent(new Event('notificationUpdated'));
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Update user in storage
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, ...profileData };
        }
        return u;
      });
      
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Update current user session
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      // Keep session active when profile updates
      localStorage.setItem('authSession', 'active');
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === email);
      if (userIndex === -1) {
        console.error('User not found with email:', email);
        return false;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      // Keep session flag active if current user matches the email
      if (user && user.email === email) {
        localStorage.setItem('authSession', 'active');
      }

      alert.showSuccess('Password Reset', 'Your password has been updated. Please sign in with the new password.');
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };

  // Refresh notifications when user changes
  useEffect(() => {
    refreshNotifications();
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isInitialized,
      notifications,
      unreadCount,
      login,
      register,
      logout,
      resetPassword,
      showAuthModal,
      setShowAuthModal,
      markNotificationAsRead,
      clearNotifications,
      refreshNotifications,
      addNotification,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
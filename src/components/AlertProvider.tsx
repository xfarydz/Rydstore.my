'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from './CustomAlert';

interface AlertContextType {
  showAlert: (config: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }) => void;
  showSuccess: (title: string, message: string, onConfirm?: () => void) => void;
  showError: (title: string, message: string, onConfirm?: () => void) => void;
  showWarning: (title: string, message: string, onConfirm?: () => void) => void;
  showInfo: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    showCancel: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  // Setup global alert function
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
        if (type === 'success') {
          showSuccess(title, message || '');
        } else if (type === 'error') {
          showError(title, message || '');
        } else if (type === 'warning') {
          showWarning(title, message || '');
        } else if (type === 'info') {
          showInfo(title, message || '');
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.showAlert) {
        delete window.showAlert;
      }
    };
  }, []);

  const showAlert = useCallback((config: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }) => {
    setAlertConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      type: config.type,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      onConfirm: config.onConfirm,
      showCancel: config.showCancel || false
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({ title, message, type: 'success', onConfirm });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({ title, message, type: 'error', onConfirm });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({ title, message, type: 'warning', onConfirm });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({ title, message, type: 'info', onConfirm });
  }, [showAlert]);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirm') => {
    showAlert({ 
      title, 
      message, 
      type: 'warning', 
      onConfirm, 
      showCancel: true, 
      confirmText 
    });
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm();
    }
    closeAlert();
  }, [alertConfig.onConfirm, closeAlert]);

  // Setup global window.showAlert function
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
        if (type === 'success') {
          showSuccess(title, message || '');
        } else if (type === 'error') {
          showError(title, message || '');
        } else if (type === 'warning') {
          showWarning(title, message || '');
        } else if (type === 'info') {
          showInfo(title, message || '');
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.showAlert) {
        delete window.showAlert;
      }
    };
  }, [showSuccess, showError, showWarning, showInfo]);

  const contextValue: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={handleConfirm}
        showCancel={alertConfig.showCancel}
      />
    </AlertContext.Provider>
  );
}

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Global alert functions for easy use
let globalAlertContext: AlertContextType | null = null;

export const setGlobalAlertContext = (context: AlertContextType) => {
  globalAlertContext = context;
};

export const alert = (message: string, title: string = 'Notification') => {
  if (globalAlertContext) {
    globalAlertContext.showInfo(title, message);
  } else {
    // Fallback to native alert
    window.alert(`${title}: ${message}`);
  }
};

export const alertSuccess = (message: string, title: string = 'Success') => {
  if (globalAlertContext) {
    globalAlertContext.showSuccess(title, message);
  } else {
    window.alert(`${title}: ${message}`);
  }
};

export const alertError = (message: string, title: string = 'Error') => {
  if (globalAlertContext) {
    globalAlertContext.showError(title, message);
  } else {
    window.alert(`${title}: ${message}`);
  }
};

export const alertConfirm = (message: string, onConfirm: () => void, title: string = 'Confirm') => {
  if (globalAlertContext) {
    globalAlertContext.showConfirm(title, message, onConfirm);
  } else {
    if (window.confirm(`${title}: ${message}`)) {
      onConfirm();
    }
  }
};
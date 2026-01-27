'use client';

import { useState, useEffect } from 'react';

export interface SiteSettings {
  storeName: string;
  storeSlogan: string;
  contactEmail: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  currency: string;
  heroBackgroundImage: string;
  heroDescription: string;
  phoneNumber?: string;
  maintenanceMode?: boolean;
  // Payment settings
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankQrUrl?: string;
}

const defaultSettings: SiteSettings = {
  storeName: "Farid's Store",
  storeSlogan: 'SELECTED ITEMS',
  contactEmail: 'admin@rydstore.my',
  logoUrl: '/images/logo.jpg',
  heroTitle: "Farid's Store",
  heroSubtitle: 'SELECTED ITEMS',
  currency: 'RM',
  heroBackgroundImage: '',
  heroDescription: 'Discover exclusive fashion pieces from top international brands. Curated collection from Kulim, Kedah with love.',
  phoneNumber: '+60174694966',
  maintenanceMode: false,
  bankName: 'Maybank',
  bankAccountNumber: '',
  bankAccountName: '',
  bankQrUrl: ''
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          const mergedSettings = parsedSettings.logoUrl
            ? parsedSettings
            : { ...defaultSettings, ...parsedSettings };

          console.log('📋 Loaded settings from localStorage:', {
            hasLogoUrl: !!mergedSettings.logoUrl,
            logoUrlLength: mergedSettings.logoUrl?.length || 0,
            storeName: mergedSettings.storeName
          });

          // Persist merge so future loads have logo
          if (!parsedSettings.logoUrl) {
            localStorage.setItem('siteSettings', JSON.stringify(mergedSettings));
          }

          setSettings(mergedSettings);
        } catch (error) {
          console.error('Error loading site settings:', error);
          setSettings(defaultSettings);
        }
      } else {
        console.log('ℹ️ No saved settings found, using defaults');
      }
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for storage changes from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'siteSettings') {
        console.log('🔄 Settings changed, reloading...');
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleSettingsUpdate = () => {
      console.log('🔄 Settings updated in same tab, reloading...');
      loadSettings();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
    
    console.log('💾 Settings updated:', newSettings);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
    
    // Force refresh images if logo changed (for mobile cache busting)
    if (newSettings.logoUrl && newSettings.logoUrl !== settings.logoUrl) {
      console.log('🔄 Logo updated, clearing cache for mobile devices...');
      
      // Clear mobile browser cache for images
      if (typeof window !== 'undefined') {
        // Trigger storage event to update other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'siteSettings',
          newValue: JSON.stringify(updatedSettings),
          url: window.location.href
        }));
        
        // Force reload images by updating timestamp
        setTimeout(() => {
          const images = document.querySelectorAll('img[src*="logo"], img[src*="data:image"]');
          images.forEach((img: any) => {
            const originalSrc = img.src.split('?')[0];
            img.src = `${originalSrc}?v=${Date.now()}`;
          });
        }, 100);
      }
    }
  };

  return { settings, updateSettings, isLoaded };
}
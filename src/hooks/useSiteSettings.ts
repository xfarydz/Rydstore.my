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
}

const defaultSettings: SiteSettings = {
  storeName: "Farid's Store",
  storeSlogan: 'SELECTED ITEMS',
  contactEmail: 'admin@rydstore.my',
  logoUrl: '',
  heroTitle: "Farid's Store",
  heroSubtitle: 'SELECTED ITEMS',
  currency: 'RM',
  heroBackgroundImage: '',
  heroDescription: 'Discover exclusive fashion pieces from top international brands. Curated collection from Kulim, Kedah with love.',
  phoneNumber: '+60174694966',
  maintenanceMode: false
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading site settings:', error);
          setSettings(defaultSettings);
        }
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
    
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
          const images = document.querySelectorAll('img[src*="logo"]');
          images.forEach((img: any) => {
            const originalSrc = img.src.split('?')[0];
            img.src = `${originalSrc}?v=${Date.now()}`;
          });
        }, 100);
      }
    }
  };

  return { settings, updateSettings };
}
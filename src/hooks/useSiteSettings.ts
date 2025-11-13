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
  };

  return { settings, updateSettings };
}
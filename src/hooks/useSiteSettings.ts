'use client';

import { useState, useEffect } from 'react';

const SETTINGS_ENDPOINT = '/api/settings';

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

  const persistLocal = (data: SiteSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteSettings', JSON.stringify(data));
    }
  };

  const loadFromLocal = (): SiteSettings | null => {
    if (typeof window === 'undefined') return null;
    const savedSettings = localStorage.getItem('siteSettings');
    if (!savedSettings) return null;
    try {
      const parsed = JSON.parse(savedSettings);
      return parsed.logoUrl ? parsed : { ...defaultSettings, ...parsed };
    } catch (error) {
      console.error('Error parsing local settings:', error);
      return null;
    }
  };

  const loadFromServer = async (): Promise<SiteSettings | null> => {
    try {
      const res = await fetch(SETTINGS_ENDPOINT, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      return { ...defaultSettings, ...data };
    } catch (error) {
      console.warn('Settings API fetch failed, falling back to local:', error);
      return null;
    }
  };

  const loadSettings = async () => {
    // 1) Try server
    const remote = await loadFromServer();
    if (remote) {
      setSettings(remote);
      persistLocal(remote);
      setIsLoaded(true);
      return;
    }

    // 2) Fallback to localStorage
    const local = loadFromLocal();
    if (local) {
      setSettings(local);
      setIsLoaded(true);
      return;
    }

    // 3) Fallback to defaults
    setSettings(defaultSettings);
    setIsLoaded(true);
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

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    persistLocal(updatedSettings);
    
    // Push to server (best-effort)
    try {
      await fetch(SETTINGS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
    } catch (error) {
      console.warn('Settings API save failed, kept local only:', error);
    }
    
    console.log('💾 Settings updated:', newSettings);
    
    // Dispatch custom event for same-tab updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    }
    
    // Force refresh images if logo changed (for mobile cache busting)
    if (newSettings.logoUrl && newSettings.logoUrl !== settings.logoUrl) {
      console.log('🔄 Logo updated, clearing cache for mobile devices...');
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'siteSettings',
          newValue: JSON.stringify(updatedSettings),
          url: window.location.href
        }));
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
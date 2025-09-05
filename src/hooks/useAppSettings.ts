import { useState, useEffect } from 'react';

interface AppSettings {
  autoLogoutEnabled: boolean;
  autoLogoutTimeoutSeconds: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoLogoutEnabled: true,
  autoLogoutTimeoutSeconds: 5,
};

const STORAGE_KEY = 'luna-guard-app-settings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting app settings:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
  };
}
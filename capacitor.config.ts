import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lunaguard.app',
  appName: 'Luna-guard',
  webDir: 'dist',
  server: {
    url: 'https://02283dee-ee62-4436-be66-735958ce4156.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
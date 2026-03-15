import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blackbelt.app',
  appName: 'BlackBelt',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#C62828',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#C62828',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  server: {
    // For development: uncomment and point to your dev server
    // url: 'http://localhost:3000',
    // cleartext: true,
  },
};

export default config;

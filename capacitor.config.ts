import type { CapacitorConfig } from '@capacitor/cli';

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blackbelt.com';
const useRemoteRuntime = process.env.CAPACITOR_REMOTE_RUNTIME === 'true';

const config: CapacitorConfig = {
  appId: 'app.blackbelt.academy',
  appName: 'BlackBelt',
  webDir: 'out',
  ...(useRemoteRuntime
    ? {
        server: {
          url: publicAppUrl,
          androidScheme: 'https',
          iosScheme: 'https',
        },
      }
    : {}),

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A0A0A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0A',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'BlackBelt',
    allowsLinkPreview: true,
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;

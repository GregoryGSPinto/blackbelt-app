import type { CapacitorConfig } from '@capacitor/cli';

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blackbeltv2.vercel.app';
const isMobileBuild = process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

const config: CapacitorConfig = {
  appId: 'app.blackbelt.academy',
  appName: 'BlackBelt',
  webDir: 'out',

  server: {
    url: 'https://blackbeltv2.vercel.app',
    androidScheme: 'https',
    iosScheme: 'https',
    ...(isMobileBuild ? { url: publicAppUrl } : {}),
  },

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

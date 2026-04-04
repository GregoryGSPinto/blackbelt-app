// Type declarations for Capacitor plugins used only in native builds.
// These packages are installed when running `npx cap add ios/android`,
// not in the web build. Dynamic imports + isNative() gate prevent
// runtime errors on web.

declare module 'capacitor-native-biometric' {
  export interface IsAvailableResult {
    isAvailable: boolean;
  }
  export interface VerifyIdentityOptions {
    reason?: string;
    title?: string;
    subtitle?: string;
    description?: string;
  }
  export const NativeBiometric: {
    isAvailable(): Promise<IsAvailableResult>;
    verifyIdentity(options: VerifyIdentityOptions): Promise<void>;
  };
}

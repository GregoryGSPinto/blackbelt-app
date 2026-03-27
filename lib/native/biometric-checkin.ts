import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  method: string;
}

export async function biometricCheckin(): Promise<BiometricResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, method: 'not_native' };
  }
  try {
    // @ts-expect-error — native-only plugin, installed in Capacitor build
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    await BiometricAuth.authenticate({
      reason: 'Confirme sua identidade para fazer check-in',
      cancelTitle: 'Cancelar',
    });
    return { success: true, method: 'biometric' };
  } catch {
    return { success: false, method: 'biometric_failed' };
  }
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    // @ts-expect-error — native-only plugin, installed in Capacitor build
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

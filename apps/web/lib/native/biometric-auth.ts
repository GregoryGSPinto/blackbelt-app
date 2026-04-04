import { isNative, isIOS } from '@/lib/platform';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export type BiometricType = 'face' | 'fingerprint' | 'none';

export async function getBiometricType(): Promise<BiometricType> {
  if (!isNative()) return 'none';
  try {
    const available = await isBiometricAvailable();
    if (!available) return 'none';
    // iOS uses Face ID on newer devices, Touch ID on older
    // Android uses fingerprint primarily
    return isIOS() ? 'face' : 'fingerprint';
  } catch {
    return 'none';
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    await NativeBiometric.verifyIdentity({
      reason: 'Entrar no BlackBelt',
      title: 'Autenticação',
      subtitle: 'Use biometria para entrar',
      description: 'Coloque o dedo no sensor ou olhe para a câmera',
    });
    return true;
  } catch {
    return false;
  }
}

export async function saveBiometricCredentials(email: string, refreshToken: string): Promise<void> {
  if (!isNative()) return;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: 'bb_bio_email', value: email });
    await Preferences.set({ key: 'bb_bio_token', value: refreshToken });
    await Preferences.set({ key: 'bb_bio_enabled', value: 'true' });
  } catch {
    console.warn('[Biometric] Failed to save credentials');
  }
}

export async function getBiometricCredentials(): Promise<{ email: string; refreshToken: string } | null> {
  if (!isNative()) return null;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const enabled = await Preferences.get({ key: 'bb_bio_enabled' });
    if (enabled.value !== 'true') return null;

    const email = await Preferences.get({ key: 'bb_bio_email' });
    const token = await Preferences.get({ key: 'bb_bio_token' });
    if (!email.value || !token.value) return null;

    return { email: email.value, refreshToken: token.value };
  } catch {
    return null;
  }
}

export async function clearBiometricCredentials(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key: 'bb_bio_email' });
    await Preferences.remove({ key: 'bb_bio_token' });
    await Preferences.remove({ key: 'bb_bio_enabled' });
  } catch {
    console.warn('[Biometric] Failed to clear credentials');
  }
}

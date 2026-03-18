import { isNative } from '@/lib/platform';

export async function scanQRCode(): Promise<string | null> {
  if (!isNative()) {
    // Web fallback — return null, web uses HTML5 camera or manual input
    return null;
  }

  try {
    const { Camera, CameraResultType } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    // In a real implementation, this would use a barcode scanner plugin
    // For now, Camera opens as a proof of native capability
    return photo.webPath ?? null;
  } catch {
    return null;
  }
}

export async function requestCameraPermission(): Promise<boolean> {
  if (!isNative()) return true; // Web handles its own permissions

  try {
    const { Camera } = await import('@capacitor/camera');
    const perm = await Camera.requestPermissions();
    return perm.camera === 'granted';
  } catch {
    return false;
  }
}

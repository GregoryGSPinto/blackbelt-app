'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner = forwardRef<HTMLDivElement, QRScannerProps>(function QRScanner({ onScan, onClose }, ref) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      startNativeScan();
    } else {
      startWebScan();
    }

    return () => {
      stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startNativeScan() {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: 'uri' as never,
        source: 'CAMERA' as never,
      });
      // In a real implementation, we'd decode the QR from the photo
      // For now, this is a placeholder
      if (photo.webPath) {
        onScan(photo.webPath);
      }
    } catch {
      setError('Não foi possível acessar a câmera');
    }
  }

  async function startWebScan() {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // In a real implementation, use a QR decoder library
      // like jsQR to continuously scan frames
    } catch {
      setError('Permissão de câmera negada. Use o código manual.');
    }
  }

  function stopScan() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function handleVibrate() {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Haptics not available
    }
  }

  function simulateScan() {
    handleVibrate();
    onScan('simulated-qr-data');
  }

  return (
    <div ref={ref} className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold text-white">Escanear QR Code</h2>
        <button onClick={() => { stopScan(); onClose(); }} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera view */}
      <div className="relative flex flex-1 items-center justify-center">
        {scanning && (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        )}

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-2xl border-2 border-white/50">
            <div className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-bb-red" />
            <div className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-bb-red" />
            <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-bb-red" />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-bb-red" />
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8">
            <div className="text-center">
              <p className="text-sm text-white">{error}</p>
              <Button size="sm" className="mt-4" onClick={simulateScan}>
                Simular Check-in (Demo)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-white/60">Aponte a câmera para o QR Code da aula</p>
        <button onClick={simulateScan} className="mt-2 text-xs text-bb-red hover:underline">
          Usar código manual
        </button>
      </div>
    </div>
  );
});

QRScanner.displayName = 'QRScanner';
export { QRScanner };

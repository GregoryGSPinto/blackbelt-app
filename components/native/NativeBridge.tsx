'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initDeepLinks } from '@/lib/native/deep-links';
import { initBackButton } from '@/lib/native/back-button';

export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    return initDeepLinks((path) => {
      if (!path) return;
      router.push(path);
    });
  }, [router]);

  useEffect(() => {
    return initBackButton();
  }, []);

  return null;
}

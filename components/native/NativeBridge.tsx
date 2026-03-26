'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initDeepLinks } from '@/lib/native/deep-links';

export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    return initDeepLinks((path) => {
      if (!path) return;
      router.push(path);
    });
  }, [router]);

  return null;
}

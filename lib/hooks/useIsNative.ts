'use client';

import { useState, useEffect } from 'react';
import { isNativeApp, isNativeBuild } from '@/lib/platform';

export function useIsNative(): boolean {
  const [native, setNative] = useState(isNativeBuild());
  useEffect(() => { setNative(isNativeApp()); }, []);
  return native;
}

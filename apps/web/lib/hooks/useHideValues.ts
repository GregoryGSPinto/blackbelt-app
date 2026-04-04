'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bb_hide_values';
const EVENT_NAME = 'bb:hide-values-change';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === '1';
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

function getServerSnapshot(): boolean {
  return false;
}

export function useHideValues() {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !getSnapshot();
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { hidden, toggle };
}

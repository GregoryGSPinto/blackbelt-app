'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import type { SupportedLocale } from '@/lib/types/regional';
import { LOCALE_LABELS } from '@/lib/types/regional';

const LOCALES: SupportedLocale[] = ['pt-BR', 'en-US', 'es'];

const FLAG: Record<SupportedLocale, string> = {
  'pt-BR': '🇧🇷',
  'en-US': '🇺🇸',
  'es': '🇪🇸',
};

function getCurrentLocale(): SupportedLocale {
  if (typeof document === 'undefined') return 'pt-BR';
  const match = document.cookie.match(/bb-locale=([^;]+)/);
  return (match?.[1] as SupportedLocale) ?? 'pt-BR';
}

function setLocaleCookie(locale: SupportedLocale) {
  document.cookie = `bb-locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

const LanguageSelector = forwardRef<HTMLDivElement, { className?: string }>(
  function LanguageSelector({ className }, ref) {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState<SupportedLocale>('pt-BR');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setCurrent(getCurrentLocale());
    }, []);

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSelect(locale: SupportedLocale) {
      setLocaleCookie(locale);
      setCurrent(locale);
      setOpen(false);
      window.location.reload();
    }

    return (
      <div ref={ref} className={`relative ${className ?? ''}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-lg border border-bb-gray-200 px-3 py-1.5 text-sm hover:bg-bb-gray-50"
          aria-label="Selecionar idioma"
        >
          <span>{FLAG[current]}</span>
          <span className="hidden sm:inline">{current.split('-')[0].toUpperCase()}</span>
        </button>

        {open && (
          <div ref={menuRef} className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-bb-gray-200 py-1 shadow-lg" style={{ background: 'var(--bb-depth-1)' }}>
            {LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleSelect(locale)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-bb-gray-50 ${locale === current ? 'bg-bb-gray-50 font-medium' : ''}`}
              >
                <span>{FLAG[locale]}</span>
                <span>{LOCALE_LABELS[locale]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

LanguageSelector.displayName = 'LanguageSelector';
export { LanguageSelector };

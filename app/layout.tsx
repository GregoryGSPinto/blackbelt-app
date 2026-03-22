import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { BetaWidgets } from '@/components/beta/BetaWidgets';
import { OfflineNotice } from '@/components/shared/OfflineNotice';
import { getThemeInitScript } from '@/lib/utils/theme';
import '@/styles/globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#C62828',
};

export const metadata: Metadata = {
  title: { default: 'BlackBelt — Gestão de Academias', template: '%s | BlackBelt' },
  description: 'Plataforma completa para gestão de academias de artes marciais. Check-in, turmas, progresso, pagamentos.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'BlackBelt',
    title: 'BlackBelt — Gestão de Academias',
    description: 'Plataforma completa para gestão de academias de artes marciais.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[var(--bb-depth-1)] font-sans text-[var(--bb-ink-100)] antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-bb-red focus:px-4 focus:py-2 focus:text-white">
          Pular para conteúdo principal
        </a>
        <Providers>
          <OfflineNotice />
          <main id="main-content">{children}</main>
        </Providers>
        <ServiceWorkerRegistrar />
        <InstallPrompt />
        <BetaWidgets />
      </body>
    </html>
  );
}

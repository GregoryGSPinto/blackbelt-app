import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, JetBrains_Mono, Outfit, Playfair_Display } from 'next/font/google';
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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#C62828',
};

export const metadata: Metadata = {
  title: { default: 'BlackBelt — Gestão de Academias de Artes Marciais', template: '%s | BlackBelt' },
  description: 'Check-in, turmas, cobranças e presença para academias de jiu-jitsu, judô, karatê e MMA. 7 dias grátis.',
  keywords: 'gestão academia, artes marciais, jiu jitsu, bjj, check-in, turmas, presença, cobrança',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/app-icons/icon-192.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://blackbeltv2.vercel.app',
    siteName: 'BlackBelt',
    title: 'BlackBelt — Sua academia funcionando no automático',
    description: 'Check-in, turmas, cobranças e presença. 7 dias grátis.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${outfit.variable} ${playfair.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        <link rel="icon" href="/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/app-icons/icon-192.svg" />
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

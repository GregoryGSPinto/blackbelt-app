import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, JetBrains_Mono, Outfit, Playfair_Display } from 'next/font/google';
import { Providers } from './providers';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { BetaWidgets } from '@/components/beta/BetaWidgets';
import { OfflineNotice } from '@/components/shared/OfflineNotice';
import { AccentColorInit } from '@/components/AccentColorInit';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
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
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'BlackBelt — Gestao de Academias de Artes Marciais',
    template: '%s | BlackBelt',
  },
  description: 'Sistema completo de gestao para academias de BJJ, Judo, Karate e MMA. Check-in, turmas, cobrancas, presenca e comunicacao.',
  keywords: ['academia', 'artes marciais', 'bjj', 'jiu jitsu', 'judo', 'karate', 'mma', 'check-in', 'gestao', 'turmas', 'presenca'],
  authors: [{ name: 'BlackBelt' }],
  creator: 'BlackBelt',
  publisher: 'BlackBelt',
  metadataBase: new URL('https://blackbeltv2.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://blackbeltv2.vercel.app',
    title: 'BlackBelt — Gestao de Academias de Artes Marciais',
    description: 'Sistema completo de gestao para academias de BJJ, Judo, Karate e MMA.',
    siteName: 'BlackBelt',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'BlackBelt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlackBelt — Gestao de Academias de Artes Marciais',
    description: 'Sistema completo de gestao para academias de artes marciais.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${outfit.variable} ${playfair.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        <GoogleAnalytics />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BlackBelt" />
      </head>
      <body className="min-h-screen bg-[var(--bb-depth-1)] font-sans text-[var(--bb-ink-100)] antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-bb-red focus:px-4 focus:py-2 focus:text-white">
          Pular para conteúdo principal
        </a>
        <AccentColorInit />
        <Providers>
          <OfflineNotice />
          <main id="main-content">{children}</main>
        </Providers>
        <ServiceWorkerRegistrar />
        <BetaWidgets />
      </body>
    </html>
  );
}

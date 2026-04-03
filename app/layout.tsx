import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import { Providers } from './providers';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { BetaWidgets } from '@/components/beta/BetaWidgets';
import { OfflineNotice } from '@/components/shared/OfflineNotice';
import { AccentColorInit } from '@/components/AccentColorInit';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { getAppUrl } from '@/lib/config/domains';
import { getThemeInitScript } from '@/lib/utils/theme';
import '@/styles/globals.css';

const appUrl = getAppUrl();

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
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

export const viewport: Viewport = {
  themeColor: '#C62828',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'BlackBelt App',
    template: '%s | BlackBelt',
  },
  description: 'Produto autenticado BlackBelt para operação de academias, APIs do produto e companion mobile.',
  keywords: ['academia', 'artes marciais', 'bjj', 'jiu jitsu', 'judo', 'karate', 'mma', 'check-in', 'gestao', 'turmas', 'presenca'],
  authors: [{ name: 'BlackBelt' }],
  creator: 'BlackBelt',
  publisher: 'BlackBelt',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: appUrl,
    title: 'BlackBelt App',
    description: 'Produto autenticado BlackBelt para operação web, APIs internas e mobile companion.',
    siteName: 'BlackBelt App',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'BlackBelt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlackBelt App',
    description: 'Produto autenticado BlackBelt para operação web e mobile.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
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

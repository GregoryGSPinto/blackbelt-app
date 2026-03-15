import type { Metadata } from 'next';
import { Providers } from './providers';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'BlackBelt — Gestão de Academias', template: '%s | BlackBelt' },
  description: 'Plataforma completa para gestão de academias de artes marciais. Check-in, turmas, progresso, pagamentos.',
  manifest: '/manifest.json',
  themeColor: '#C62828',
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-bb-white font-sans text-bb-gray-900 antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-bb-red focus:px-4 focus:py-2 focus:text-white">
          Pular para conteúdo principal
        </a>
        <Providers><main id="main-content">{children}</main></Providers>
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </body>
    </html>
  );
}

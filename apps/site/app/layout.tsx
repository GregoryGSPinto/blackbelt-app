import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { BRAND, CURRENT_PLATFORM_URLS } from '@blackbelt/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(CURRENT_PLATFORM_URLS.site),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: ['academia', 'artes marciais', 'bjj', 'jiu jitsu', 'gestao', 'check-in', 'turmas'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: CURRENT_PLATFORM_URLS.site,
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.tagline,
    siteName: BRAND.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans antialiased" style={{ margin: 0, background: '#0A0A0A', color: '#E5E7EB' }}>
        {children}
      </body>
    </html>
  );
}

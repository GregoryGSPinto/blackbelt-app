import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'BlackBelt v2',
  description: 'Gestão inteligente para academias de artes marciais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-bb-white font-sans text-bb-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

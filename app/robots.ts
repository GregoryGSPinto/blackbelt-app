import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/config/domains';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/status', '/termos', '/privacidade', '/privacidade-menores', '/cadastrar-academia', '/contato', '/developers', '/compete', '/campeonatos', '/ranking', '/marketplace', '/app-store', '/ajuda'],
        disallow: ['/', '/login', '/cadastro', '/convite', '/onboarding', '/admin', '/professor', '/dashboard', '/parent', '/teen', '/kids', '/network', '/api/'],
      },
    ],
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}

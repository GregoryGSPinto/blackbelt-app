import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/landing', '/sobre', '/contato', '/blog', '/termos', '/privacidade', '/aula-experimental'],
        disallow: ['/admin', '/professor', '/dashboard', '/parent', '/teen', '/kids', '/network', '/api/'],
      },
    ],
    sitemap: 'https://app.blackbelt.com/sitemap.xml',
  };
}

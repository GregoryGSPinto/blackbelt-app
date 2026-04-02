import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/config/domains';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();
  const now = new Date().toISOString();

  return [
    { url: `${baseUrl}/contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacidade-menores`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/cadastrar-academia`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${baseUrl}/developers`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/app-store`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/compete`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/campeonatos`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/ranking`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${baseUrl}/marketplace`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
  ];
}

// ═══════════════════════════════════════════════════
// @blackbelt/config — Constantes compartilhadas
// ═══════════════════════════════════════════════════

export const BRAND = {
  name: 'BlackBelt',
  tagline: 'Gestão completa para academias de artes marciais',
  color: '#C62828',
  domain: 'blackbelts.com.br',
} as const;

export const CURRENT_PLATFORM_URLS = {
  site: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://blackbelts.com.br'),
  app: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://app.blackbelts.com.br'),
  api: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'https://app.blackbelts.com.br/api'),
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  projectRef: 'tdplmmodmumryzdosmpv',
} as const;

export const PLANS = [
  { slug: 'starter', name: 'Starter', priceCents: 9700, maxStudents: 50 },
  { slug: 'essencial', name: 'Essencial', priceCents: 19700, maxStudents: 150 },
  { slug: 'pro', name: 'Pro', priceCents: 34700, maxStudents: 500 },
  { slug: 'black-belt', name: 'Black Belt', priceCents: 59700, maxStudents: 2000 },
  { slug: 'enterprise', name: 'Enterprise', priceCents: 0, maxStudents: null },
] as const;

export const DEMO_ACADEMY = {
  id: '809f2763-0096-4cfa-8057-b5b029cbc62f',
  name: 'Guerreiros do Tatame',
} as const;

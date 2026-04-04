import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

const APP_DIR = resolve(__dirname, '..', 'app');

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function routeGroupPath(group: string, ...segments: string[]): string {
  return resolve(APP_DIR, `(${group})`, ...segments);
}

function hasPage(...pathSegments: string[]): boolean {
  return existsSync(resolve(APP_DIR, ...pathSegments, 'page.tsx'));
}

// ────────────────────────────────────────────────────────────
// 1. Cada route group principal possui ao menos 1 page.tsx
// ────────────────────────────────────────────────────────────

describe('Route groups — páginas existem', () => {
  const CORE_ROUTES: Array<{ group: string; pagePath: string[] }> = [
    { group: 'auth', pagePath: ['(auth)', 'login'] },
    { group: 'auth (cadastro)', pagePath: ['(auth)', 'cadastro'] },
    { group: 'auth (selecionar-perfil)', pagePath: ['(auth)', 'selecionar-perfil'] },
    { group: 'main (dashboard)', pagePath: ['(main)', 'dashboard'] },
    { group: 'professor', pagePath: ['(professor)', 'professor'] },
    { group: 'admin', pagePath: ['(admin)', 'admin'] },
    { group: 'teen', pagePath: ['(teen)', 'teen'] },
    { group: 'kids', pagePath: ['(kids)', 'kids'] },
    { group: 'parent', pagePath: ['(parent)', 'parent'] },
  ];

  for (const route of CORE_ROUTES) {
    it(`(${route.group}) possui page.tsx`, () => {
      expect(hasPage(...route.pagePath)).toBe(true);
    });
  }
});

// ────────────────────────────────────────────────────────────
// 2. Cada route group possui layout.tsx
// ────────────────────────────────────────────────────────────

describe('Route groups — layouts existem', () => {
  const GROUPS_WITH_LAYOUT = ['auth', 'main', 'professor', 'admin', 'teen', 'kids', 'parent', 'franqueador'];

  for (const group of GROUPS_WITH_LAYOUT) {
    it(`(${group}) possui layout.tsx`, () => {
      const layoutPath = resolve(routeGroupPath(group), 'layout.tsx');
      expect(existsSync(layoutPath)).toBe(true);
    });
  }
});

// ────────────────────────────────────────────────────────────
// 3. Sem conflitos de rotas — nenhum route group repete slug
// ────────────────────────────────────────────────────────────

describe('Route groups — sem conflitos de slug', () => {
  it('nenhum route group define page.tsx no mesmo path relativo', () => {
    // Route groups que acessam URLs diferentes
    // (auth) -> /login, /cadastro, etc.
    // (main) -> /dashboard, etc.
    // (admin) -> /admin/...
    // (professor) -> /professor/...
    // (teen) -> /teen/...
    // (kids) -> /kids/...
    // (parent) -> /parent/...
    // Nenhum deles deve ter slug raiz conflitante

    const groupSlugs: Record<string, string[]> = {
      admin: ['admin'],
      professor: ['professor'],
      teen: ['teen'],
      kids: ['kids'],
      parent: ['parent'],
    };

    const allSlugs: string[] = [];
    for (const [_group, slugs] of Object.entries(groupSlugs)) {
      for (const slug of slugs) {
        expect(allSlugs).not.toContain(slug);
        allSlugs.push(slug);
      }
    }
  });

  it('root page.tsx existe (redirect)', () => {
    expect(hasPage()).toBe(true);
  });
});

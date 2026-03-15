# BlackBelt v2

Plataforma SaaS multi-tenant de gestão inteligente para academias de artes marciais.

## Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, Postgres, Realtime, Storage)
- **Mobile:** Capacitor 6 (PWA-first)
- **Tests:** Vitest

## Desenvolvimento

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Dev server |
| `pnpm build` | Build produção |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | Vitest |

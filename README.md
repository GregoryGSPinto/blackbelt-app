# BlackBelt v2

BlackBelt is a multi-tenant SaaS platform for intelligent management of martial arts academies. It covers the full lifecycle of a gym -- from student enrollment, check-in, belt promotions and class scheduling to financial billing, communication, gamification for younger students, and franchise network oversight. Every feature is role-aware: admins, professors, adult students, teens, kids and parents each get a dedicated experience optimized for their workflow.

The platform is built as a PWA-first application powered by Next.js 14 and Supabase, with native mobile shells via Capacitor. A mock mode (`NEXT_PUBLIC_USE_MOCK=true`) allows the entire frontend to run without any backend, making local development and UI iteration fast and self-contained.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 18, Tailwind CSS, Lucide React, Recharts |
| State | React Context + Hooks |
| Backend | Supabase (Auth, Postgres, Realtime, Storage, Edge Functions) |
| Payments | Asaas / Stripe (gateway abstraction) |
| Email | Resend |
| Analytics | PostHog |
| Monitoring | Sentry |
| Mobile | Capacitor 6 (iOS / Android) |
| i18n | next-intl |
| Tests | Vitest + Testing Library |
| CI/CD | GitHub Actions, Vercel |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Create local env file (mock mode enabled by default)
cp .env.example .env.local

# 3. Start development server
pnpm dev
```

The app runs at `http://localhost:3000` in full mock mode -- no Supabase instance required.

## Project Structure

```
blackbelt-v2/
├── app/
│   ├── (auth)/            # Login, registration, password recovery
│   ├── (admin)/           # Admin dashboard (sidebar layout)
│   ├── (professor)/       # Professor views (bottom nav)
│   ├── (main)/            # Adult student (bottom nav + FAB)
│   ├── (teen)/            # Teen student (gamified, XP bar)
│   ├── (kids)/            # Kids student (playful UI)
│   ├── (parent)/          # Parent / guardian
│   ├── (franqueador)/     # Franchise owner
│   ├── (network)/         # Network-wide views
│   ├── (public)/          # Public pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout + providers
│   └── middleware.ts      # Auth guard, locale, role routing
├── components/
│   ├── ui/                # Shared primitives (Button, Input, Modal, Toast, ...)
│   ├── shell/             # Layout shells per role
│   ├── auth/              # Auth-related components
│   ├── checkin/           # FAB check-in, QR scanner
│   ├── ai/               # AI-powered components
│   ├── championship/     # Tournament brackets, results
│   ├── marketplace/      # Marketplace components
│   ├── onboarding/       # Onboarding wizard
│   ├── reports/          # Report components
│   ├── shared/           # Cross-cutting shared components
│   └── video/            # Video player, class recordings
├── lib/
│   ├── api/               # Service contracts (130+ services)
│   ├── mocks/             # Mock implementations
│   ├── types/             # domain.ts, enums.ts, constants.ts
│   ├── domain/            # Pure business rules
│   ├── supabase/          # Supabase client setup
│   ├── security/          # Token store, session, crypto
│   ├── monitoring/        # Logger, web vitals, ServiceError
│   ├── analytics/         # PostHog integration
│   ├── notifications/     # Push notification config
│   ├── config/            # Environment validation
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React Contexts
│   ├── utils/             # Pure helpers
│   ├── sdk/               # Internal SDK utilities
│   ├── email-templates/   # Transactional email templates
│   └── env.ts             # isMock() + env validation
├── i18n/                  # Internationalization config
├── messages/              # Translation files
├── styles/                # globals.css
├── supabase/              # Migrations, seed, generated types
├── tests/                 # Unit and integration tests
├── scripts/               # Build scripts, seed scripts
└── public/                # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |

## Environment Variables

Copy `.env.example` to `.env.local` to get started. In mock mode only `NEXT_PUBLIC_USE_MOCK=true` is needed. See `.env.example` for the full list of variables required in production.

## Architecture Highlights

- **Service layer decoupled from routes.** `lib/api/` never imports from `app/`. Route groups are a UI concern.
- **Domain is the source of truth.** `lib/types/domain.ts`, `enums.ts`, `constants.ts`, and `lib/domain/rules.ts` define the system. Mocks implement these contracts.
- **Single mock toggle.** `isMock()` (controlled by `NEXT_PUBLIC_USE_MOCK`) is the only branching point between real and mock services.
- **Strict TypeScript.** Zero `any`. All DTOs are fully typed.
- **Tokens in memory.** Auth tokens are never persisted to localStorage or sessionStorage.

## License

MIT

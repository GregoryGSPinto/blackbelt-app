<div align="center">

# 🥋 blackbelt-app

**Authenticated product repository for the BlackBelt SaaS platform**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Realtime-3FCF8E?logo=supabase)](https://supabase.com/)
[![Capacitor 8](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor)](https://capacitorjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20Tests-6E9F18?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright)](https://playwright.dev/)
[![Tests](https://img.shields.io/badge/tests-20-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Product Topology](./reports/blackbelt-100-architecture-final.md) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Features](#features)

</div>

---

## The Problem

Martial arts academies across Brazil and Latin America manage their operations through a patchwork of spreadsheets, WhatsApp groups, handwritten attendance logs, and generic gym software that ignores belt progression, pedagogy, and the unique dynamics of combat sports. Franchise networks have zero visibility across units. Parents of child students are left out of the loop. Professors lack structured tools for lesson planning and student evaluation. The result: churn, billing leakage, and operational chaos.

## The Solution

`blackbelt-app` is the authenticated BlackBelt product: academy operation, mobile experience, internal product surfaces, authenticated APIs, and Supabase-backed business workflows. The public commercial site and private operations repository are intentionally separated and documented in the architecture report.

The platform ships as a **PWA-first** web app with **native mobile shells** via Capacitor for iOS and Android. A built-in **mock mode** (`NEXT_PUBLIC_USE_MOCK=true`) allows the entire frontend to run without any backend, enabling fast UI iteration and demo environments.

---

## Features

### Academy Administration
- **Student Management** -- enrollment, profiles, family grouping, bulk import (CSV via PapaParse)
- **Class & Schedule Management** -- recurring classes, room/space allocation, professor assignment, substitution handling
- **Belt Graduation System** -- curriculum tracking, technical evaluations, promotion workflows, certificate generation (jsPDF)
- **Financial Module** -- billing, invoicing, payment gateway abstraction (Asaas / Stripe), delinquency tracking, family billing
- **CRM & Leads** -- prospect pipeline, trial class scheduling, automated campaigns, churn prediction
- **Contracts** -- digital contract management and lifecycle tracking
- **Inventory & Store** -- stock management, in-app marketplace, orders, cart, and checkout
- **Reports & Analytics** -- dashboard with Recharts, professor reports, financial reports, CSV/PDF export
- **Communication** -- announcements, in-app messaging, WhatsApp integration, push notifications
- **Audit & Compliance** -- audit logs, conduct code management, LGPD data handling

### Professor Tools
- **Lesson Planning** -- structured lesson plans, technique bank, curriculum management
- **Attendance & Evaluation** -- class diary, physical assessments, technical evaluations, student 360 view
- **Training Periodization** -- training plans, periodization cycles, health monitoring
- **Video Analysis** -- fight analysis, video-assisted coaching
- **Live Class Management** -- active class view with real-time attendance

### Student Experience (Adult)
- **Dashboard** -- progress tracking, belt progression, attendance history
- **Check-in** -- QR code and proximity-based check-in (FAB component)
- **Community** -- social feed, events, hall of fame, referral program
- **Marketplace** -- store, cart, checkout, order tracking
- **AI Features** -- personal AI coach, fight analysis, competition prediction
- **Digital ID Card** -- in-app student card with QR code
- **Certificates & Titles** -- digital belt certificates, achievement titles

### Gamified Teen Experience
- **XP & Seasons** -- experience points system, seasonal battle pass, challenges
- **Ranking & Achievements** -- leaderboards, unlockable achievements
- **Content & Messaging** -- age-appropriate content feed, in-app messaging

### Kids Experience
- **Playful UI** -- child-friendly interface with stickers, rewards, belt visualization
- **Achievements & Collectibles** -- digital sticker album, unlockable rewards
- **Curated Content** -- age-appropriate educational content

### Parent / Guardian Portal
- **Children Overview** -- multi-child dashboard, attendance tracking, payment management
- **Authorization Management** -- parental consents, pickup authorizations
- **Journey Tracking** -- child's martial arts progression timeline
- **Notifications & Reports** -- real-time alerts, progress reports

### Reception Desk
- **Check-in Station** -- fast check-in workflow, visitor management
- **Front Desk Operations** -- enrollment, payments (cash register), messaging, trial class management

### Franchise Owner
- **Multi-Unit Management** -- cross-unit dashboards, standardization controls
- **Curriculum Governance** -- franchise-wide curriculum standards
- **Royalties & Expansion** -- royalty tracking, expansion pipeline
- **Communication** -- network-wide announcements and reporting

### Super Admin (Platform)
- **Platform Oversight** -- academy onboarding, health monitoring, feature flags
- **Revenue & Pipeline** -- platform revenue tracking, sales pipeline
- **Support & Communication** -- tenant support tools, broadcast messaging
- **Beta Management** -- beta program, NPS surveys, changelog

### Public Pages
- **Landing & Marketing** -- pricing, blog, about, contact, changelog
- **Tournament Discovery** -- public championship brackets and rankings
- **Academy Registration** -- self-service academy onboarding
- **Developer Portal** -- API documentation and API key management

---

## Architecture

```
blackbelt-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, registration, password recovery, profile selection
│   ├── (admin)/                  # Admin dashboard (sidebar layout)
│   ├── (professor)/              # Professor views (bottom nav)
│   ├── (main)/                   # Adult student (bottom nav + FAB)
│   ├── (teen)/                   # Teen student (gamified, XP bar)
│   ├── (kids)/                   # Kids student (playful UI)
│   ├── (parent)/                 # Parent / guardian
│   ├── (recepcao)/               # Reception desk
│   ├── (franqueador)/            # Franchise owner
│   ├── (network)/                # Network-wide views
│   ├── (superadmin)/             # Platform super admin
│   ├── (public)/                 # Public-facing pages
│   ├── api/                      # API routes (auth, payments, webhooks, CRON, LGPD, etc.)
│   └── onboarding/               # Onboarding wizard
├── components/                   # 30+ component directories
│   ├── ui/                       # Design system primitives (Button, Input, Modal, Toast, ...)
│   ├── shell/                    # Layout shells per role
│   ├── checkin/                  # QR scanner, proximity check-in
│   ├── championship/             # Tournament brackets, results
│   ├── marketplace/              # Store components
│   ├── ai/                       # AI-powered components
│   └── ...                       # billing, reports, video, onboarding, etc.
├── lib/
│   ├── api/                      # 239 service files — real + mock bifurcation
│   ├── mocks/                    # Mock implementations for all services
│   ├── types/                    # domain.ts, enums.ts, constants.ts
│   ├── domain/                   # Pure business rules
│   ├── supabase/                 # Supabase client setup + generated types
│   ├── security/                 # Token store, session, crypto
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React Contexts (state management)
│   ├── monitoring/               # Sentry logger, web vitals, ServiceError
│   ├── analytics/                # PostHog integration
│   ├── notifications/            # Push notification config
│   ├── email-templates/          # Transactional email templates (Resend)
│   └── sdk/                      # Internal SDK utilities
├── i18n/                         # Internationalization config (next-intl)
├── messages/                     # pt-BR, en-US, es translations
├── supabase/                     # 65 SQL migrations, seed, generated types
├── e2e/                          # Playwright E2E tests
├── tests/                        # Vitest unit & integration tests
├── scripts/                      # Build scripts, seed, Capacitor prepare
├── scaffolds/blackbelt-site/     # Local starter for the public commercial repo
├── scaffolds/blackbelt-infra-private/
│   └──                          # Local starter for the private operations repo
└── .github/workflows/            # CI, architecture guard, release, Supabase deploy
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Service layer decoupled from routes** | `lib/api/` never imports from `app/`. Route groups are a UI concern only. |
| **Mock/Real bifurcation** | `isMock()` is the single branching point. All 239 services have Supabase implementations alongside mock fallbacks. |
| **Domain as source of truth** | `domain.ts`, `enums.ts`, `constants.ts`, and `rules.ts` define the entire system model. |
| **Strict TypeScript** | Zero `any`. All DTOs are fully typed. |
| **Tokens in memory** | Auth tokens are never persisted to `localStorage` or `sessionStorage`. |
| **RLS-first security** | Row Level Security via `get_my_academy_ids()` (SECURITY DEFINER). Multi-tenant isolation at the database layer. |
| **PWA + Native shells** | Single codebase serves web, iOS, and Android via Capacitor 8. |
| **CSS custom properties** | All colors use `var(--bb-*)` tokens for white-label branding support. |

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14 |
| Language | TypeScript (strict mode) | 5.9 |
| UI | React + Tailwind CSS + Lucide React | 18 / 3.4 / 0.577 |
| Charts | Recharts | 3.8 |
| State | React Context + SWR | -- / 2.4 |
| Backend | Supabase (Auth, Postgres, Realtime, Storage, Edge Functions) | SSR 0.9 |
| Payments | Asaas / Stripe (gateway abstraction) | -- |
| Email | Resend | 6.9 |
| Analytics | PostHog | 1.360 |
| Monitoring | Sentry | 10.43 |
| Mobile | Capacitor (iOS + Android) | 8.2 |
| i18n | next-intl (pt-BR, en-US, es) | 4.8 |
| PDF | jsPDF + jspdf-autotable | 4.2 / 5.0 |
| CSV | PapaParse | 5.5 |
| Offline Storage | idb (IndexedDB) | 8.0 |
| Unit Tests | Vitest + Testing Library | 4.1 / 16.3 |
| E2E Tests | Playwright | 1.58 |
| CI/CD | GitHub Actions + Vercel | -- |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 10.30

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/GregoryGSPinto/blackbelt-v2.git
cd blackbelt-v2

# 2. Install dependencies
pnpm install

# 3. Create local env file (mock mode enabled by default)
cp .env.example .env.local

# 4. Start development server
pnpm dev
```

The app runs at `http://localhost:3000` in full mock mode -- no Supabase instance required.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run unit tests in watch mode |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm test:e2e:desktop` | Run E2E tests -- desktop viewport |
| `pnpm test:e2e:mobile` | Run E2E tests -- mobile viewport |
| `pnpm test:e2e:ui` | Run E2E tests with Playwright UI |
| `pnpm mobile:ios` | Build + sync + open iOS in Xcode |
| `pnpm mobile:android` | Build + sync + open Android in Android Studio |

---

## Testing

The project includes **20 test files** across two layers:

**Unit & Integration Tests (Vitest + Testing Library)** -- 15 files
- Domain rules (`rules.test.ts`)
- Route validation (`routes.test.ts`)
- Utility functions (validation, export)
- Service tests (aluno, professor, financeiro, CRM, check-in, auth, analytics, health-score, turmas)
- Native integration (deep links)
- Legal/config validation

**End-to-End Tests (Playwright)** -- 5 files
- Login flows across all profiles
- Dashboard rendering for each role
- Critical user flows
- Feature-level smoke tests
- Security assertions

```bash
# Run all unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run E2E with visual report
pnpm test:e2e:report
```

---

## Environment Variables

Copy `.env.example` to `.env.local` to get started. In mock mode, only `NEXT_PUBLIC_USE_MOCK=true` is needed.

For production, see `.env.example` for the full list of required variables including Supabase credentials, payment gateway keys, Resend API key, PostHog project key, and Sentry DSN.

---

## Deployment

| Environment | Platform | URL |
|-------------|----------|-----|
| Production (Web) | Vercel | [blackbeltv2.vercel.app](https://blackbeltv2.vercel.app) |
| Database | Supabase | Managed Postgres + Auth + Realtime + Storage |
| iOS | Capacitor | App Store (via Xcode) |
| Android | Capacitor | Play Store (via Android Studio) |
| CI/CD | GitHub Actions | Lint, typecheck, test on every PR |

---

## Repository

**GitHub:** [github.com/GregoryGSPinto/blackbelt-v2](https://github.com/GregoryGSPinto/blackbelt-v2)

---

## Author

**Gregory Guimaraes Silveira Pinto** -- Senior AI Solution Architect

---

## License

MIT

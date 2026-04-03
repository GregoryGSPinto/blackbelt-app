# BlackBelt v2 — Architecture V3

## Overview

BlackBelt v2 is a multi-tenant SaaS platform for martial arts academy management. 30 development phases delivering a complete ecosystem.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 (bb-*, belt-* tokens) |
| State | React Context + hooks |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Payments | Strategy Pattern (Mock/Asaas/Stripe) |
| i18n | next-intl (pt-BR, en-US, es) |
| Charts | Recharts (dynamic imports) |
| Mobile | Capacitor (iOS/Android) |
| PWA | Service Worker + manifest |

## Route Groups

| Group | Purpose |
|-------|---------|
| (auth) | Login, registration, password recovery |
| (main) | Student dashboard, classes, progress, feed |
| (admin) | Academy management, settings, reports |
| (professor) | Instructor tools, class management, grading |
| (parent) | Parent/guardian oversight dashboard |
| (kids) | Child-friendly interface |
| (teen) | Teen-specific interface |
| (public-operational) | App store, developer portal, marketplace, legal and support surfaces |
| (site-marketing) | Legacy redirects for pricing, blog and institucional pages |
| (network) | Multi-academy network management |

## 30 Phases — Complete Roadmap

### Phase 1-5: Foundation
1. **P1-P5** — Auth, profiles, classes, check-in, QR code
2. **P6-P10** — Student dashboard, XP/gamification, parent portal, pedagogical tools, evolution tracking

### Phase 6-10: Engagement
3. **P11-P15** — Achievements, ranking, messaging, notifications, content management
4. **P16-P20** — Plans/subscriptions, invoices, reports, analytics, insights

### Phase 11-15: Operations
5. **P21-P25** — Export/reports, student analytics, payment gateway, billing config, billing automation
6. **P26-P30** — Notification hub, preferences, automations, onboarding wizard, platform plans

### Phase 16-20: Multi-tenant
7. **P31-P35** — Branding/white-label, multi-unit, team/invites, inventory, spaces/rooms
8. **P36-P40** — Contracts, events, professor agenda, social feed, challenges

### Phase 21-25: Competition & AI
9. **P41-P50** — Tournaments, leads/CRM, group chat, recommendations, sentiment analysis
10. **P51-P60** — AI reports, privacy/LGPD, API keys, webhooks, SSO

### Phase 26-30: Platform
11. **P61-P75** — Audit log, network, referral B2B, observability, training video
12. **P76-P90** — Curriculum, training plans, periodization, physical assessment, video analysis
13. **P91-P105** — Marketplace, techniques library, course creator, reviews, marketplace payments
14. **P106-P120** — Certificates, AI coach, store, wearables, seasons/battle-pass
15. **P121-P135** — Access control, proximity check-in, leagues, IoT, orders/shipping
16. **P136-P147** — Franchise, championships, standards, posture analysis, registration/brackets

### Phase 30: Open Platform (P148-P152)
17. **P148** — Local SDK (`lib/sdk/blackbelt-sdk.ts`, `lib/sdk/webhooks-validator.ts`)
18. **P149** — Plugin system (install, configure, logs, categories)
19. **P150** — App Store (public marketplace with ratings, pricing, search)
20. **P151** — Developer Portal (API reference, sandbox, quick start)
21. **P152** — Ecosystem documentation and business model

## Service Layer Pattern

All services follow the isMock() bifurcation pattern:

```typescript
import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export async function listItems(): Promise<Item[]> {
  try {
    if (isMock()) {
      const { mockListItems } = await import('@/lib/mocks/items.mock');
      return mockListItems();
    }
    const res = await fetch('/api/v1/items');
    return res.json();
  } catch (error) { handleServiceError(error, 'items.list'); }
}
```

## Component Conventions

- forwardRef + displayName for all shared components
- BadgeVariant: 'active' | 'inactive' | 'pending' | 'belt'
- ButtonVariant: 'primary' | 'secondary' | 'ghost' | 'danger'
- Tailwind only, no inline styles
- 'use client' on all page components

## Subsystems Added in Phase 30

### SDK
- `BlackBeltSDK` class with typed resource methods
- `BlackBeltAPIError` for structured error handling
- Webhook signature validation via HMAC-SHA256

### Plugin System
- Plugin types: status, category, config schema
- CRUD operations: install, uninstall, configure
- Admin management UI with grid layout and config modal

### App Store
- Public marketplace with search, categories, featured
- Detail pages with screenshots, reviews, features
- Pricing in BRL (free + paid)

### Developer Portal
- Interactive API reference with expandable endpoints
- API sandbox with mock responses
- Quick start code snippets
- Developer account and app submission workflow

## Directory Structure

```
lib/
  api/          ~90+ service files
  mocks/        ~90+ mock files
  sdk/          SDK and webhook validator
  types/        Domain types, enums, plugins
  utils/        cn, i18n, timezone
app/
  (admin)/      Admin pages
  (public-operational)/ App store, developers, marketplace, legal, support
  (site-marketing)/     Redirects para blackbelts.com.br
  ...           Other route groups
components/
  ui/           Badge, Button, Spinner, etc.
  shared/       PageHeader, etc.
docs/
  SDK.md, ECOSYSTEM.md, ARCHITECTURE_V3.md, BUSINESS_MODEL.md
```

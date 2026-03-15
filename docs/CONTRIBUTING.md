# BlackBelt v2 — Contributing Guide

## Getting Started

```bash
# Clone
git clone <repo-url>
cd black_belt_v2

# Install
pnpm install

# Dev
pnpm dev
```

The app runs with `NEXT_PUBLIC_USE_MOCK=true` by default — no external services needed.

## Code Standards

### TypeScript
- **Strict mode** — no `any`, no implicit returns
- All services follow the `isMock()` bifurcation pattern
- Types in `lib/types/` (domain, payment, notification, regional, etc.)

### Components
- `forwardRef` + `displayName` for all shared components
- Components in `components/ui/` (primitives) and `components/shared/` (composed)
- Client components: `'use client'` directive at top

### Styling
- Tailwind CSS with design tokens: `bb-red`, `bb-gray-*`, `belt-*`
- No inline styles; use Tailwind utilities
- Badge variants: `'active' | 'inactive' | 'pending' | 'belt'` only
- Button variants: `'primary' | 'secondary' | 'ghost' | 'danger'` only

### Services
```typescript
// Pattern for every service function:
export async function doSomething(param: string): Promise<Result> {
  try {
    if (isMock()) {
      const { mockDoSomething } = await import('@/lib/mocks/something.mock');
      return mockDoSomething(param);
    }
    const res = await fetch('/api/endpoint', { ... });
    return res.json();
  } catch (error) { handleServiceError(error, 'context.name'); }
}
```

### File Organization
```
app/
  (admin)/admin/     # Admin pages
  (main)/            # Student pages
  (professor)/       # Professor pages
  (public)/          # Public pages (no auth)
  api/               # API routes
lib/
  api/               # Service layer (~50 services)
  mocks/             # Mock implementations (~50 mocks)
  types/             # Type definitions
  utils/             # Utility functions
  contexts/          # React contexts
  email-templates/   # HTML email templates
components/
  ui/                # Primitive components (Button, Badge, Spinner, etc.)
  shared/            # Composed components (PageHeader, InsightCard, etc.)
  ai/                # AI-specific components (CoachChat)
  pwa/               # PWA components
```

## PR Flow

1. Create branch from `main`: `feat/feature-name` or `fix/bug-name`
2. Make changes following the patterns above
3. Run validation: `pnpm build && pnpm test && pnpm typecheck`
4. Create PR with description of changes
5. Ensure CI passes (build + test + typecheck)

## Commit Convention

```
<type>: <short description>

Types: feat, fix, refactor, docs, test, chore
```

Examples:
- `feat: add tournament bracket view`
- `fix: correct badge variant for overdue status`
- `refactor: extract payment gateway interface`

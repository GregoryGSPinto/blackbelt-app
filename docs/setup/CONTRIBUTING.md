# Contributing to blackbelt-app

## Getting Started

```bash
# Clone
git clone <repo-url>
cd blackbelt-app

# Install
pnpm install

# Dev
pnpm dev
```

The app runs with `NEXT_PUBLIC_USE_MOCK=true` by default, so UI work does not require a live backend.

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
  (auth)/                    # Login, recovery, invite, account selection
  (public-operational)/      # Legal, support, onboarding, status, product-public pages
  (site-marketing)/          # Redirect-only compatibility layer to blackbeltv2.vercel.app
  (admin|main|parent|teen)/  # Authenticated app shells by role
  api/                       # Product API routes
lib/
  api/                       # Service layer
  mocks/                     # Mock implementations
  types/                     # Type definitions
  utils/                     # Utility functions
  contexts/                  # React contexts
  email-templates/           # HTML email templates
components/
  ui/                        # Primitive components
  shared/                    # Composed components
  shell/                     # Layout shells
docs/
  architecture/              # Product topology and boundary docs
  audits/                    # Historical audits moved out of root
  release/                   # Release and store runbooks
```

## PR Flow

1. Create branch from `main`: `feat/feature-name` or `fix/bug-name`
2. Make changes following the patterns above
3. Run validation: `pnpm release:gates`
4. Create PR with description of changes
5. Ensure CI passes (build + test + typecheck)

## Commit Convention

```
<type>: <short description>

Types: feat, fix, refactor, docs, test, chore
```

Examples:
- `chore(repo): reposition repository as blackbelt-app`
- `refactor(app): separate marketing redirects from public operational surfaces`
- `docs(architecture): document final product topology`

## Guardrails

- Do not reintroduce landing, blog, pricing or pure marketing content into the core app runtime.
- Do not place private operational docs, reports or prompts in the repository root.
- Do not place business logic directly in route files when it belongs in `features/` or `lib/`.

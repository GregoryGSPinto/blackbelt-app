# Contributing to blackbelt-app

## Repository Scope

`blackbelt-app` is the authenticated product repository for BlackBelt.

Keep these boundaries explicit:

- `app/`: routes, layouts, route handlers, route-level metadata only.
- `features/`: business capabilities, use cases, page entrypoints, feature services.
- `components/`: UI primitives, shells, and reusable presentation components.
- `lib/`: infrastructure, platform adapters, shared types, hooks, plumbing.
- `supabase/`: schema, migrations, seed, generated types.
- `scaffolds/blackbelt-site`: local starter for the public commercial repository.
- `scaffolds/blackbelt-infra-private`: local starter for the private operations repository.

## Branch Strategy

- `main`: protected, deployable.
- `release/*`: optional stabilization branches for coordinated launches.
- `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`: short-lived working branches.

## Commit Convention

Use Conventional Commits with repository/domain scope.

Examples:

- `chore(repo): reposition repository as blackbelt-app`
- `refactor(app): move route logic into feature entrypoints`
- `chore(site): scaffold public marketing repository`
- `chore(infra): scaffold private operations repository`
- `docs(architecture): document final product topology`

## Pull Requests

- Keep PRs auditable and focused.
- State whether the change affects `site`, `app`, `infra`, billing boundaries, or domain boundaries.
- Include validation evidence: `pnpm architecture:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Update architecture docs when moving folders, responsibilities, or deployment boundaries.

## Architectural Guardrails

- Do not add business logic directly to new route files.
- Do not mix SaaS billing for BlackBelt with academy-to-student billing.
- Do not place private operational docs or secrets in `blackbelt-app`.
- Prefer compatibility shims when migrating old import paths, then remove them in follow-up PRs.

## Summary

- What changed?
- Which repository boundary does this affect: `site`, `app`, `infra-private`, or cross-repo docs?

## Validation

- [ ] `pnpm architecture:check`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Architecture Notes

- Route/layout only changes in `app/`
- Business logic moved or kept in `features/`
- Infrastructure/plumbing changes kept in `lib/`
- SaaS billing vs academy billing boundary checked

## Deployment / Domain Impact

- [ ] `blackbelt.com`
- [ ] `app.blackbelt.com`
- [ ] `api.blackbelt.com`
- [ ] Internal/private operations only

## Follow-ups

- Any compatibility shim to remove later?

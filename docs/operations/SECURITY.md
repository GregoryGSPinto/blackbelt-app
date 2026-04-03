# Security Documentation (P-099)

## Authentication

- **Method**: JWT (access + refresh tokens)
- **Storage**: Tokens stored in memory only — never localStorage/sessionStorage
- **Provider**: Supabase Auth with RLS (Row Level Security)
- **MFA**: Optional TOTP-based 2FA via `lib/api/mfa.service.ts`
- **Session**: Auto-refresh with silent token renewal

## Authorization (RBAC)

8 user roles with distinct permissions:

| Role | Route Group | Access Level |
|------|------------|-------------|
| Super Admin | `/(superadmin)` | Platform-wide |
| Admin | `/(admin)` | Academy-wide |
| Professor | `/(professor)` | Assigned classes |
| Adult Student | `/(main)` | Own data |
| Teen Student | `/(teen)` | Own data (age-restricted) |
| Kids Student | `/(kids)` | Own data (simplified) |
| Parent | `/(parent)` | Children's data |
| Franchisee | `/(franqueador)` | Multi-academy |

RLS policies enforce tenant isolation at the database level.

## Security Headers

Configured in `next.config.js` and `middleware.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: strict policy with nonce-based scripts
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Input Sanitization

- All user input sanitized via `lib/security/sanitize.ts`
- XSS prevention: HTML entities escaped, dangerous tags stripped
- SQL injection: Prevented by Supabase parameterized queries
- CSRF: SameSite cookies + origin validation

## Rate Limiting

- API routes protected by `lib/security/rate-limit.ts`
- Default: 100 requests/minute per IP
- Auth endpoints: 10 requests/minute per IP
- Configurable per-route limits

## Data Protection (LGPD)

- Data export: Users can request full data export (`lib/api/lgpd.service.ts`)
- Data deletion: Right to be forgotten with cascading cleanup
- Consent tracking: Granular consent management
- Audit trail: All data access logged

## Secrets Management

- Environment variables via Vercel (encrypted at rest)
- No secrets in git repository
- API keys rotated quarterly
- Supabase service role key restricted to server-side only

## Vulnerability Reporting

Report security issues to: gregoryguimaraes12@gmail.com

Please include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

Response time: 24 hours acknowledgment, 72 hours initial assessment.

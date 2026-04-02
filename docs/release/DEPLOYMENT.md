# BlackBelt v2 — Deployment Guide

## Stack
- **Frontend/Backend**: Vercel (Next.js)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Asaas or Stripe
- **Email**: Resend
- **WhatsApp**: Evolution API (self-hosted)

## Environment Variables

### Required
```env
# App
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_APP_URL=https://app.blackbelt.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payment Gateway
PAYMENT_GATEWAY=asaas  # or: stripe, mock
ASAAS_API_KEY=...
ASAAS_WEBHOOK_TOKEN=...
# OR
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional
```env
# Email
RESEND_API_KEY=re_...

# WhatsApp
EVOLUTION_API_URL=https://...
EVOLUTION_API_KEY=...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Observability
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
```

## Deploy Steps

### 1. Supabase Setup
```bash
# Apply migrations
supabase db push

# Deploy edge functions
supabase functions deploy billing-cron
```

### 2. Vercel Deploy
```bash
# Connect repo
vercel link

# Set env vars
vercel env pull

# Deploy
vercel --prod
```

### 3. Post-Deploy Checklist
- [ ] Verify `/api/health` returns `{ status: "healthy" }`
- [ ] Test login flow end-to-end
- [ ] Verify payment webhook delivery (test mode)
- [ ] Check email delivery (send test)
- [ ] Confirm Supabase RLS policies are active
- [ ] Set up UptimeRobot for `/api/health`
- [ ] Configure Sentry alerts (error rate > 1%)

## Rollback Procedure

### Vercel
```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Database
```bash
# Rollback last migration
supabase db reset --linked

# Or apply specific migration
supabase migration repair <version> --status reverted
```

## Scaling Notes
- Vercel auto-scales serverless functions
- Supabase: upgrade plan for more connections (pooler recommended)
- Edge functions: 50ms cold start, 150ms warm
- Rate limit API keys at 100 req/min (in-memory, consider Redis for multi-region)

# Variáveis de Ambiente — Vercel

Configure no **Vercel Dashboard → Settings → Environment Variables**.

## Obrigatórias

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tdplmmodmumryzdosmpv.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` ou `eyJ...` | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Supabase → Settings → API → service_role |
| `SUPABASE_PROJECT_REF` | `tdplmmodmumryzdosmpv` | URL do projeto |
| `NEXT_PUBLIC_USE_MOCK` | `false` | Sempre false em produção |
| `NEXT_PUBLIC_APP_URL` | `https://blackbeltv2.vercel.app` | URL do deploy |

## Pagamento (quando ativar)

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `PAYMENT_GATEWAY` | `asaas` | — |
| `ASAAS_API_KEY` | `$aact_...` | Asaas → Integrações → API |
| `ASAAS_SANDBOX` | `false` | — |
| `ASAAS_WEBHOOK_TOKEN` | token gerado | Asaas → Webhooks |

## Email (quando ativar)

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `EMAIL_PROVIDER` | `resend` | — |
| `RESEND_API_KEY` | `re_...` | Resend → API Keys |
| `EMAIL_FROM` | `noreply@blackbelt.app` | Domínio verificado no Resend |

## Monitoramento (opcional)

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...@sentry.io/...` | Sentry → Project Settings |
| `SENTRY_AUTH_TOKEN` | token | Sentry → Auth Tokens |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` | PostHog → Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | — |

## Beta

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_BETA_MODE` | `true` (durante beta, `false` após) |

## Dicas

- **Environment**: configure para `Production`, `Preview` e `Development`
- **Sensitive keys** (SERVICE_ROLE_KEY, ASAAS_API_KEY, RESEND_API_KEY): marque como **Sensitive**
- Após salvar, faça um **redeploy** para as variáveis terem efeito

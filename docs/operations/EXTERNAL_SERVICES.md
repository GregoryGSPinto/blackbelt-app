# BlackBelt v2 — Servicos Externos

Todos os servicos externos funcionam com **degradacao graceful**: se a key nao esta configurada, o app continua funcionando normalmente com fallbacks.

## Resend (Emails)

**Arquivo:** `lib/integrations/resend.ts`

| Variavel | Obrigatoria | Onde criar |
|----------|-------------|------------|
| `RESEND_API_KEY` | Nao | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Nao | Dominio verificado no Resend |

### Sem key
- Emails nao sao enviados (warn no console)
- Admin recebe link copiavel (funciona, mas sem email bonito)
- Magic links usam o fluxo nativo do Supabase Auth

### Adicionar no Vercel
```bash
vercel env add RESEND_API_KEY production preview
vercel env add EMAIL_FROM production preview
```

---

## Asaas (Pagamentos)

**Arquivos:** `lib/integrations/asaas.ts`, `lib/api/gateways/asaas.gateway.ts`

| Variavel | Obrigatoria | Onde criar |
|----------|-------------|------------|
| `ASAAS_API_KEY` | Nao | [asaas.com](https://www.asaas.com) → Integracoes → API |
| `ASAAS_ENVIRONMENT` | Nao | `production` ou `sandbox` (default: sandbox) |
| `ASAAS_WEBHOOK_TOKEN` | Nao | Asaas → Webhooks |
| `PAYMENT_GATEWAY` | Nao | `asaas`, `stripe`, ou `mock` |

### Sem key
- Cobrancas ficam como "pagar na academia" (funciona presencial)
- Modulo financeiro mostra dados mock
- Nenhuma integracao de pagamento e ativada

### Adicionar no Vercel
```bash
vercel env add ASAAS_API_KEY production preview
vercel env add ASAAS_ENVIRONMENT production preview  # valor: production
vercel env add PAYMENT_GATEWAY production preview     # valor: asaas
```

---

## Sentry (Monitoramento)

**Arquivos:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `next.config.mjs`

| Variavel | Obrigatoria | Onde criar |
|----------|-------------|------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Nao | [sentry.io](https://sentry.io) → Project Settings → DSN |
| `SENTRY_AUTH_TOKEN` | Nao | Sentry → Auth Tokens (para source maps) |

### O que o Sentry captura
- Erros JavaScript no client (crashes, unhandled rejections)
- Erros no server (API routes, SSR)
- Performance (tempo de carregamento, LCP, FCP, CLS)
- Session replay (gravacao de tela em erros)

### Sem DSN
- Sentry e desativado silenciosamente (`if (dsn)` guard em todos os configs)
- `withSentryConfig` no `next.config.mjs` so e aplicado quando `SENTRY_AUTH_TOKEN` existe
- O app funciona normalmente sem nenhum overhead

### Adicionar no Vercel
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview
vercel env add SENTRY_AUTH_TOKEN production preview
```

---

## Verificacao Rapida

```bash
# Ver quais keys estao configuradas localmente
grep -E "^(RESEND|ASAAS|SENTRY|NEXT_PUBLIC_SENTRY)" .env.local

# Ver quais estao no Vercel
vercel env ls | grep -E "RESEND|ASAAS|SENTRY"

# Testar build sem nenhuma key externa
NEXT_PUBLIC_USE_MOCK=true npx next build
```

## Resumo de Fallbacks

| Servico | Sem Key | Funcionalidade afetada |
|---------|---------|----------------------|
| Resend | App funciona | Emails nao sao enviados, admin usa link copiavel |
| Asaas | App funciona | Cobrancas presenciais, dados mock no financeiro |
| Sentry | App funciona | Erros nao sao capturados remotamente |

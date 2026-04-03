# BlackBelt v2 — Instrucoes Finais para Ativacao Completa

## Passo 1: Rodar a Migration Master (5 minutos)

1. Abra: https://supabase.com/dashboard → blackbelt-production → SQL Editor
2. Clique "New Query"
3. Cole o conteudo COMPLETO do arquivo `MIGRATION_MASTER_PARA_RODAR.sql`
4. Clique RUN
5. Deve retornar "Success" sem erros
6. Se der erro de "already exists" → OK, e idempotente

## Passo 2: Rodar o Seed (5 minutos)

No terminal do projeto:
```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE \
NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co \
npx tsx scripts/seed-everything.ts
```

## Passo 3: Verificar (2 minutos)

```bash
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE \
NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co \
npx tsx scripts/verify-everything.ts
```

Todas as linhas devem ser ✅.

## Passo 4: Deploy Edge Functions (5 minutos)

```bash
# Instalar CLI do Supabase (se nao tem)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref tdplmmodmumryzdosmpv

# Deploy de cada function
supabase functions deploy delete-account
supabase functions deploy admin-create-user
supabase functions deploy evolve-profile
supabase functions deploy process-checkin
supabase functions deploy generate-qr
supabase functions deploy billing-cron
supabase functions deploy calculate-churn
supabase functions deploy generate-certificate
supabase functions deploy generate-invoice
supabase functions deploy generate-invoices
supabase functions deploy process-webhook
supabase functions deploy promote-belt
supabase functions deploy send-push
supabase functions deploy send-reminders
```

## Passo 5: Configurar Env Vars na Vercel (5 minutos)

Adicionar no Vercel Dashboard → Settings → Environment Variables:
- `RESEND_API_KEY` = (criar em resend.com)
- `RESEND_DOMAIN` = blackbelts.com.br (ou o dominio que comprar)
- `ASAAS_API_KEY` = (criar em asaas.com → sandbox primeiro)
- `ASAAS_SANDBOX` = true (trocar pra false quando for producao)
- `ASAAS_WEBHOOK_TOKEN` = (gerar token unico pra validar webhooks)

## Passo 6: Configurar Webhook do Asaas (5 minutos)

No dashboard do Asaas:
1. Va em Integracoes → Webhooks
2. URL: `https://blackbelts.com.br/api/webhooks/asaas?access_token=SEU_TOKEN`
3. Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
4. Salvar

## Passo 7: Testar no Browser (30 minutos)

Usar o checklist `TESTE_MANUAL_10_FLUXOS.md` que ja esta na raiz do projeto.

## Passo 8: Redeploy

Apos configurar tudo:
1. Vercel Dashboard → Deployments
2. No deploy mais recente → "..." → Redeploy
3. DESMARCAR "Use existing Build Cache"
4. Aguardar build (3-5 min)
5. Testar de novo

## Resumo do que foi ativado

- 15 tabelas novas no banco
- 4 helper functions SQL
- RLS em todas as tabelas
- 14 edge functions
- Email transacional (Resend)
- Pagamento (Asaas com PIX + Boleto)
- Audit log
- Familias com vinculos
- Controle parental
- Timeline do aluno
- Painel de inconsistencias
- Exclusao de conta (Apple compliance)
- Consentimento parental (Apple compliance)
- PDF reports (presenca + financeiro)
- WhatsApp integration
- Rate limiting + input sanitization
- Security headers (HSTS, CSP, X-Frame-Options)

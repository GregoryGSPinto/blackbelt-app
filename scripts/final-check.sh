#!/bin/bash
echo "VERIFICACAO FINAL — BlackBelt v2"
echo "================================"
echo ""

PASS=0
FAIL=0

check() {
  if [ $? -eq 0 ]; then
    echo "  OK  $1"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $1"
    FAIL=$((FAIL + 1))
  fi
}

# Build
echo "Build..."
pnpm typecheck > /dev/null 2>&1
check "TypeScript — zero erros"

pnpm build > /dev/null 2>&1
check "Next.js build — sucesso"

# Estrutura
echo ""
echo "Estrutura..."

test -f lib/api/family.service.ts
check "family.service.ts existe"

test -f lib/api/family-billing.service.ts
check "family-billing.service.ts existe"

test -f lib/api/data-health.service.ts
check "data-health.service.ts existe"

test -f lib/api/academy-settings.service.ts
check "academy-settings.service.ts existe"

test -f components/settings/DeleteAccountSection.tsx
check "DeleteAccountSection.tsx existe"

test -f components/legal/ParentalConsentFlow.tsx
check "ParentalConsentFlow.tsx existe"

test -f lib/hooks/usePagination.ts
check "usePagination.ts existe"

test -f lib/hooks/useQuery.ts
check "useQuery.ts existe"

test -f lib/email/resend.ts
check "Resend email existe"

test -f lib/utils/whatsapp.ts
check "WhatsApp utils existe"

test -f lib/utils/rate-limit.ts
check "Rate limit existe"

test -f lib/utils/sanitize.ts
check "Input sanitization existe"

test -f components/shared/PaginationControls.tsx
check "PaginationControls existe"

test -f components/error/GlobalErrorBoundary.tsx
check "GlobalErrorBoundary existe"

test -f components/shared/ErrorState.tsx
check "ErrorState existe"

test -f components/shared/WhatsAppButton.tsx
check "WhatsAppButton existe"

# Edge functions
echo ""
echo "Edge Functions..."

test -f supabase/functions/delete-account/index.ts
check "delete-account edge function"

test -f supabase/functions/admin-create-user/index.ts
check "admin-create-user edge function"

test -f supabase/functions/evolve-profile/index.ts
check "evolve-profile edge function"

# Migrations
echo ""
echo "Migrations..."

ls supabase/migrations/*usability* > /dev/null 2>&1 || ls supabase/migrations/074* > /dev/null 2>&1
check "Migration de usabilidade existe"

# Documentacao
echo ""
echo "Documentacao..."

test -f docs/GOOGLE_DATA_SAFETY.md
check "Google Data Safety"

test -f docs/APPLE_APP_PRIVACY.md
check "Apple App Privacy"

test -f TESTE_MANUAL_10_FLUXOS.md
check "Checklist de teste manual"

test -f docs/STORE_SCREENSHOTS_GUIDE.md
check "Guia de screenshots"

test -f INSTRUCOES_USABILIDADE.md
check "Instrucoes manuais"

# Seguranca
echo ""
echo "Seguranca..."

grep -q "X-Content-Type-Options" vercel.json 2>/dev/null
check "Security headers no vercel.json"

grep -q "resend" package.json 2>/dev/null
check "Resend no package.json"

grep -q "papaparse" package.json 2>/dev/null
check "Papaparse no package.json"

grep -q "jspdf" package.json 2>/dev/null
check "jsPDF no package.json"

# Asaas / Pagamento
echo ""
echo "Pagamento..."

test -f lib/payment/asaas.ts
check "Asaas SDK"

test -f app/api/webhooks/asaas/route.ts
check "Asaas webhook handler"

test -f app/api/payments/generate/route.ts
check "Payment generation API"

# Audit
echo ""
echo "Audit..."

test -f lib/api/audit.service.ts
check "Audit service"

grep -q "audit_log" app/api/students/create/route.ts 2>/dev/null
check "Audit integrado no create student"

# AuthGuard
test -f components/auth/AuthGuard.tsx
check "AuthGuard component"

# Migration master
echo ""
echo "Ativacao..."

test -f MIGRATION_MASTER_PARA_RODAR.sql
check "Migration master SQL"

test -f scripts/seed-everything.ts
check "Seed script"

test -f scripts/verify-everything.ts
check "Verify script"

test -f INSTRUCOES_FINAIS.md
check "Instrucoes finais"

# Trial
test -f components/trial/TrialBanner.tsx
check "Trial banner"

# Contato
find app -path "*contato*" -name "page.tsx" 2>/dev/null | grep -q .
check "Contato page"

# PDF Reports
test -f lib/reports/attendance-pdf.ts
check "PDF attendance report"

test -f lib/reports/financial-pdf.ts
check "PDF financial report"

# Resultado
echo ""
echo "================================"
echo "  Passou: $PASS"
echo "  Falhou: $FAIL"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "TUDO PRONTO! O BlackBelt v2 esta pronto para as stores."
else
  echo "$FAIL itens precisam de atencao antes de submeter."
fi

#!/bin/bash
echo "BLACKBELT v2 — TESTES E2E"
echo "========================="
echo ""
echo "Base URL: ${E2E_BASE_URL:-https://blackbelts.com.br}"
echo ""

# Instalar browsers se necessario
npx playwright install chromium --with-deps 2>/dev/null

# Rodar testes desktop
echo "Rodando testes desktop..."
npx playwright test --project=desktop --reporter=list 2>&1 | tee e2e/desktop-output.txt

# Contar resultados
PASSED=$(grep -c "passed" e2e/desktop-output.txt 2>/dev/null || echo 0)
FAILED=$(grep -c "failed" e2e/desktop-output.txt 2>/dev/null || echo 0)

echo ""
echo "========================="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

# Gerar relatorio HTML
echo "Relatorio HTML: e2e/report/index.html"
echo "Screenshots: e2e/artifacts/"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "TODOS OS TESTES PASSARAM! App pronto para as stores."
else
  echo "$FAILED testes falharam. Verificar screenshots em e2e/artifacts/"
fi

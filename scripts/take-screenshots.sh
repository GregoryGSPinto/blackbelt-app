#!/bin/bash
# Screenshots para App Store e Play Store
# Requer: npx playwright install chromium
#
# Uso:
#   bash scripts/take-screenshots.sh
#   bash scripts/take-screenshots.sh https://localhost:3000  (URL custom)

BASE_URL="${1:-https://app.blackbelt.com}"

SIZES=(
  "1290x2796:iPhone_15_Pro_Max"
  "1242x2208:iPhone_8_Plus"
  "2048x2732:iPad_Pro_12.9"
  "1080x1920:Android_Phone"
  "1200x1920:Android_7inch"
)

PAGES=(
  "/login:Login"
  "/admin:Dashboard"
  "/admin/alunos:Alunos"
  "/admin/financeiro:Financeiro"
  "/admin/turmas:Turmas"
)

mkdir -p docs/screenshots

for size_name in "${SIZES[@]}"; do
  IFS=':' read -r size name <<< "$size_name"
  IFS='x' read -r w h <<< "$size"
  for page_label in "${PAGES[@]}"; do
    IFS=':' read -r page label <<< "$page_label"
    echo "📸 ${name} — ${label}"
    npx playwright screenshot --viewport-size="${w},${h}" \
      "${BASE_URL}${page}" \
      "docs/screenshots/${name}_${label}.png" 2>/dev/null || echo "  ⚠️ falhou"
  done
done

echo ""
echo "Screenshots salvos em docs/screenshots/"
echo "Total: $(ls docs/screenshots/*.png 2>/dev/null | wc -l) arquivos"

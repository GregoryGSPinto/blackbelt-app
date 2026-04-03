#!/bin/bash
echo "=== BLACKBELT v2 HEALTH CHECK ==="
echo ""

# Code stats
echo "Pages: $(find app -name 'page.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "Services: $(find lib/api -name '*.service.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "Mocks: $(find lib/mocks -name '*.mock.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "API Routes: $(find app/api -name 'route.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "Migrations: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')"
echo "Components: $(find components -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"

# Build
echo ""
echo -n "Build: "
if pnpm build 2>&1 | grep -q "Generating static pages"; then
  echo "PASS"
else
  echo "FAIL"
fi

# Vercel
echo ""
echo -n "Vercel: "
DEPLOY=$(curl -sI "${APP_URL:-https://blackbelts.com.br}" -o /dev/null -w "%{http_code}" 2>/dev/null)
if [ "$DEPLOY" = "200" ]; then
  echo "Live ($DEPLOY)"
else
  echo "Status $DEPLOY"
fi

echo ""
echo "=== DONE ==="

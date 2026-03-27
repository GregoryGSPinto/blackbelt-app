#!/usr/bin/env bash
set -euo pipefail

echo "=== BlackBelt v2 — Deploy ==="

echo "[1/4] Validating environment..."
npx tsx scripts/validate-env.ts || exit 1

echo "[2/4] Type checking..."
npx tsc --noEmit || exit 1

echo "[3/4] Building..."
npx next build || exit 1

echo "[4/4] Pushing to GitHub..."
git push origin main || exit 1

echo ""
echo "Deploying to Vercel..."
vercel --prod --yes 2>/dev/null || echo "Vercel CLI not available — deploy via GitHub push"

echo "✅ Deploy complete"

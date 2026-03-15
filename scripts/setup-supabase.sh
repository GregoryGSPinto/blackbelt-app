#!/usr/bin/env bash
# BlackBelt v2 — Supabase Setup Script
# Usage: ./scripts/setup-supabase.sh
#
# Prerequisites:
#   - Set SUPABASE_PROJECT_REF environment variable
#   - Run: npx supabase login
#   - Ensure supabase CLI is available

set -euo pipefail

echo "=== BlackBelt v2 — Supabase Setup ==="
echo ""

# Check prerequisites
if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF not set"
  echo "Usage: SUPABASE_PROJECT_REF=your-ref ./scripts/setup-supabase.sh"
  exit 1
fi

echo "1. Linking project: $SUPABASE_PROJECT_REF"
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "2. Pushing database migrations..."
npx supabase db push

echo ""
echo "3. Verifying migrations (dry-run)..."
npx supabase db push --dry-run

echo ""
echo "4. Deploying edge functions..."
for fn in generate-qr process-checkin promote-belt generate-invoices send-push; do
  echo "   Deploying: $fn"
  npx supabase functions deploy "$fn" || echo "   WARNING: $fn deploy failed (may not exist yet)"
done

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Manual steps remaining:"
echo "  1. Configure Auth in Dashboard (Site URL, Redirect URLs)"
echo "  2. Create storage buckets: avatars (public), training-videos, content, contracts"
echo "  3. Set environment variables in Vercel"
echo "  4. Test with NEXT_PUBLIC_USE_MOCK=false"

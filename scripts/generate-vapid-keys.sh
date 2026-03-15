#!/usr/bin/env bash
# BlackBelt v2 — Generate VAPID Keys for Web Push
#
# Prerequisites: npx available (Node.js installed)
#
# Usage: ./scripts/generate-vapid-keys.sh

set -euo pipefail

echo "=== BlackBelt v2 — VAPID Key Generation ==="
echo ""
echo "Generating VAPID key pair for Web Push notifications..."
echo ""

npx web-push generate-vapid-keys --json 2>/dev/null || {
  echo "Installing web-push..."
  npx -y web-push generate-vapid-keys --json
}

echo ""
echo "Add these to your environment variables:"
echo "  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey above>"
echo "  VAPID_PRIVATE_KEY=<privateKey above>"

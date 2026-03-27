#!/usr/bin/env bash
set -euo pipefail

echo "=== BlackBelt Capacitor Sync ==="
echo ""

# Check prerequisites
command -v npx >/dev/null 2>&1 || { echo "Error: npx not found"; exit 1; }

# Step 1: Build Next.js
echo "[1/4] Building Next.js..."
npm run build

# Step 2: Prepare web assets for Capacitor
echo "[2/4] Preparing web assets..."
if [ -f scripts/prepare-capacitor-web.mjs ]; then
  node scripts/prepare-capacitor-web.mjs
fi

# Step 3: Sync platforms
PLATFORM="${1:-all}"

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "[3/4] Syncing iOS..."
  npx cap sync ios
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "[3/4] Syncing Android..."
  npx cap sync android
fi

# Step 4: Open IDE (optional)
if [ "${2:-}" = "--open" ]; then
  if [ "$PLATFORM" = "ios" ]; then
    npx cap open ios
  elif [ "$PLATFORM" = "android" ]; then
    npx cap open android
  else
    echo "Specify platform to open: cap-sync.sh ios --open"
  fi
fi

echo ""
echo "=== Sync complete ==="
echo "Usage: ./scripts/cap-sync.sh [ios|android|all] [--open]"

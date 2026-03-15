#!/bin/bash
# BlackBelt v2 — Capacitor Setup Script
# Run after initial setup to configure iOS and Android projects

set -e

echo "🔧 Building web app..."
pnpm build
npx next export -o out 2>/dev/null || echo "Note: 'next export' may require output: 'export' in next.config.js"

echo "📱 Adding native platforms..."
npx cap add ios 2>/dev/null || echo "iOS platform already added or Xcode not available"
npx cap add android 2>/dev/null || echo "Android platform already added or Android Studio not available"

echo "🔄 Syncing web assets to native projects..."
npx cap sync

echo "✅ Capacitor setup complete!"
echo ""
echo "To run on iOS:     npx cap open ios"
echo "To run on Android:  npx cap open android"
echo "To live reload:     npx cap run ios --livereload --external"

#!/bin/bash
# P-081/P-082: Generate app icons for iOS and Android
# Requires: ImageMagick (convert command)
# Usage: ./scripts/generate-app-icons.sh source_icon.png

SOURCE=${1:-"public/icons/icon-512x512.png"}

echo "Generating app icons from $SOURCE..."

# iOS icons
SIZES_IOS=(20 29 40 58 60 76 80 87 120 152 167 180 1024)
mkdir -p ios/App/App/Assets.xcassets/AppIcon.appiconset

for SIZE in "${SIZES_IOS[@]}"; do
  echo "  iOS: ${SIZE}x${SIZE}"
  convert "$SOURCE" -resize "${SIZE}x${SIZE}" "ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-${SIZE}.png" 2>/dev/null || echo "    (skipped - ImageMagick not available)"
done

# Android icons
DENSITIES=("mdpi:48" "hdpi:72" "xhdpi:96" "xxhdpi:144" "xxxhdpi:192")
for PAIR in "${DENSITIES[@]}"; do
  DENSITY="${PAIR%%:*}"
  SIZE="${PAIR##*:}"
  DIR="android/app/src/main/res/mipmap-${DENSITY}"
  mkdir -p "$DIR"
  echo "  Android ${DENSITY}: ${SIZE}x${SIZE}"
  convert "$SOURCE" -resize "${SIZE}x${SIZE}" "$DIR/ic_launcher.png" 2>/dev/null || echo "    (skipped - ImageMagick not available)"
done

echo "Done! Icons generated."

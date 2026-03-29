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

# Step 3b: Patch iOS Info.plist (post-sync — required for App Store)
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  echo "[3b/4] Patching iOS Info.plist..."
  PBUDDY=/usr/libexec/PlistBuddy

  # Privacy usage descriptions (Apple auto-rejects without these)
  $PBUDDY -c "Add :NSCameraUsageDescription string 'BlackBelt usa a câmera para escanear QR Code no check-in'" "$PLIST" 2>/dev/null \
    || $PBUDDY -c "Set :NSCameraUsageDescription 'BlackBelt usa a câmera para escanear QR Code no check-in'" "$PLIST"
  $PBUDDY -c "Add :NSPhotoLibraryUsageDescription string 'BlackBelt acessa suas fotos para atualizar sua foto de perfil'" "$PLIST" 2>/dev/null \
    || $PBUDDY -c "Set :NSPhotoLibraryUsageDescription 'BlackBelt acessa suas fotos para atualizar sua foto de perfil'" "$PLIST"
  $PBUDDY -c "Add :NSPhotoLibraryAddUsageDescription string 'BlackBelt salva fotos na sua galeria'" "$PLIST" 2>/dev/null \
    || $PBUDDY -c "Set :NSPhotoLibraryAddUsageDescription 'BlackBelt salva fotos na sua galeria'" "$PLIST"
  $PBUDDY -c "Add :NSFaceIDUsageDescription string 'BlackBelt usa Face ID para login biométrico'" "$PLIST" 2>/dev/null \
    || $PBUDDY -c "Set :NSFaceIDUsageDescription 'BlackBelt usa Face ID para login biométrico'" "$PLIST"

  # arm64 instead of deprecated armv7
  $PBUDDY -c "Set :UIRequiredDeviceCapabilities:0 arm64" "$PLIST"

  # iPhone portrait-only (iPad keeps all orientations)
  $PBUDDY -c "Delete :UISupportedInterfaceOrientations" "$PLIST" 2>/dev/null || true
  $PBUDDY -c "Add :UISupportedInterfaceOrientations array" "$PLIST"
  $PBUDDY -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" "$PLIST"

  echo "    Info.plist patched successfully."
fi

# Step 3c: Patch Android build.gradle for release signing
GRADLE="android/app/build.gradle"
if [ -f "$GRADLE" ]; then
  if ! grep -q "signingConfigs" "$GRADLE"; then
    echo "[3c/4] Patching Android build.gradle (release signing)..."
    # Insert signingConfigs block before buildTypes
    sed -i '' '/buildTypes {/i\
    signingConfigs {\
        release {\
            if (project.hasProperty('\''RELEASE_STORE_FILE'\'')) {\
                storeFile file(project.property('\''RELEASE_STORE_FILE'\''))\
                storePassword project.property('\''RELEASE_STORE_PASSWORD'\'')\
                keyAlias project.property('\''RELEASE_KEY_ALIAS'\'')\
                keyPassword project.property('\''RELEASE_KEY_PASSWORD'\'')\
            }\
        }\
    }
' "$GRADLE"
    # Add signingConfig to release buildType
    sed -i '' 's/proguardFiles getDefaultProguardFile.*proguard-rules.pro.*/& \
            signingConfig signingConfigs.release/' "$GRADLE"
    echo "    Android signing config patched."
  else
    echo "[3c/4] Android signing config already present."
  fi

  # Copy signing properties if available
  if [ -f "android-signing.properties.example" ] && [ ! -f "android/app/gradle.properties" ]; then
    echo "    ⚠️ android/app/gradle.properties not found."
    echo "    Copy android-signing.properties.example → android/app/gradle.properties"
    echo "    and fill in your keystore passwords."
  fi
fi

# Step 3d: Copy PrivacyInfo.xcprivacy (Apple Privacy Manifest)
PRIVACY_SRC="ios-privacy-manifest/PrivacyInfo.xcprivacy"
PRIVACY_DST="ios/App/App/PrivacyInfo.xcprivacy"
if [ -f "$PRIVACY_SRC" ] && [ -d "ios/App/App" ]; then
  echo "[3d/4] Copying PrivacyInfo.xcprivacy..."
  cp "$PRIVACY_SRC" "$PRIVACY_DST"
  echo "    PrivacyInfo.xcprivacy copied."
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

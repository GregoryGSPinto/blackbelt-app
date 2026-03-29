#!/usr/bin/env bash
set -euo pipefail

echo "=== BlackBelt Capacitor Sync ==="
echo ""

# Check prerequisites
command -v npx >/dev/null 2>&1 || { echo "Error: npx not found"; exit 1; }

# Java 21 (required by Capacitor 8 / Android Gradle)
if [ -d "/usr/local/opt/openjdk@21" ]; then
  export JAVA_HOME="/usr/local/opt/openjdk@21"
  export PATH="$JAVA_HOME/bin:$PATH"
elif [ -d "$HOME/.sdkman/candidates/java/21" ]; then
  export JAVA_HOME="$HOME/.sdkman/candidates/java/21"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

PLATFORM="${1:-all}"
SKIP_BUILD="${SKIP_BUILD:-false}"

# Step 1: Build Next.js (skip with SKIP_BUILD=true for fast iteration)
if [ "$SKIP_BUILD" != "true" ]; then
  echo "[1/5] Building Next.js..."
  pnpm build 2>&1 | tail -5
else
  echo "[1/5] Skipping build (SKIP_BUILD=true)"
fi

# Step 2: Prepare web assets for Capacitor
echo "[2/5] Preparing web assets..."
if [ -f scripts/prepare-capacitor-web.mjs ]; then
  node scripts/prepare-capacitor-web.mjs
fi

# Step 3: Sync platforms
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo "[3/5] Syncing iOS..."
  npx cap sync ios 2>&1 | tail -3
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo "[3/5] Syncing Android..."
  npx cap sync android 2>&1 | tail -3
fi

# Step 4: Post-sync patches (survive cap sync)
echo "[4/5] Applying native patches..."

# --- iOS: Info.plist ---
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  echo "  [iOS] Patching Info.plist..."
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

  # arm64 requirement
  $PBUDDY -c "Set :UIRequiredDeviceCapabilities:0 arm64" "$PLIST"

  # iPhone portrait-only (iPad keeps all orientations from Capacitor default)
  $PBUDDY -c "Delete :UISupportedInterfaceOrientations" "$PLIST" 2>/dev/null || true
  $PBUDDY -c "Add :UISupportedInterfaceOrientations array" "$PLIST"
  $PBUDDY -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" "$PLIST"

  echo "  [iOS] Info.plist patched ✅"
fi

# --- iOS: PrivacyInfo.xcprivacy ---
PRIVACY_SRC="ios-privacy-manifest/PrivacyInfo.xcprivacy"
PRIVACY_DST="ios/App/App/PrivacyInfo.xcprivacy"
if [ -f "$PRIVACY_SRC" ] && [ -d "ios/App/App" ]; then
  cp "$PRIVACY_SRC" "$PRIVACY_DST"
  echo "  [iOS] PrivacyInfo.xcprivacy copied ✅"
fi

# --- Android: Fix proguard-android.txt deprecation in all plugins ---
if [ -d "node_modules" ]; then
  PATCHED=0
  while IFS= read -r f; do
    sed -i '' "s/proguard-android\.txt/proguard-android-optimize.txt/g" "$f" 2>/dev/null && PATCHED=$((PATCHED+1))
  done < <(find node_modules -name "build.gradle" \( -path "*capacitor*" -o -path "*aparajita*" \) -exec grep -l "proguard-android\.txt" {} \; 2>/dev/null)
  if [ "$PATCHED" -gt 0 ]; then
    echo "  [Android] Patched proguard-android.txt in $PATCHED plugin(s) ✅"
  fi
fi

# --- Android: local.properties (SDK path) ---
LOCAL_PROPS="android/local.properties"
if [ -d "android" ] && [ ! -f "$LOCAL_PROPS" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "sdk.dir=$HOME/Library/Android/sdk" > "$LOCAL_PROPS"
    echo "  [Android] local.properties created (SDK at ~/Library/Android/sdk) ✅"
  fi
fi

# --- Android: Release signing ---
GRADLE="android/app/build.gradle"
SIGNING_GRADLE="native-patches/android-signing.gradle"
if [ -f "$GRADLE" ] && [ -f "$SIGNING_GRADLE" ]; then
  # Copy signing gradle file
  cp "$SIGNING_GRADLE" "android/app/signing.gradle"

  # Inject apply from: 'signing.gradle' if not present
  if ! grep -q "signing.gradle" "$GRADLE"; then
    echo "" >> "$GRADLE"
    echo "apply from: 'signing.gradle'" >> "$GRADLE"
    echo "  [Android] Signing config applied ✅"
  else
    echo "  [Android] Signing config already present ✅"
  fi
fi

# --- Android: Keystore check ---
if [ -d "android/app" ]; then
  if ls android/app/*.keystore android/app/*.jks 2>/dev/null | head -1 > /dev/null 2>&1; then
    echo "  [Android] Keystore found ✅"
  else
    echo ""
    echo "  ⚠️  KEYSTORE NAO ENCONTRADO"
    echo "  Execute manualmente:"
    echo "    keytool -genkey -v \\"
    echo "      -keystore android/app/blackbelt-release.keystore \\"
    echo "      -alias blackbelt \\"
    echo "      -keyalg RSA -keysize 2048 -validity 10000 \\"
    echo "      -dname \"CN=Gregory Pinto, O=BlackBelt, L=Vespasiano, ST=MG, C=BR\""
    echo ""
    echo "  Depois copie android-signing.properties.example → android/app/gradle.properties"
    echo "  e preencha as senhas."
  fi
fi

# Step 5: Open IDE (optional)
if [ "${2:-}" = "--open" ]; then
  echo "[5/5] Opening IDE..."
  if [ "$PLATFORM" = "ios" ]; then
    npx cap open ios
  elif [ "$PLATFORM" = "android" ]; then
    npx cap open android
  else
    echo "Specify platform to open: ./scripts/cap-sync.sh ios --open"
  fi
else
  echo "[5/5] Done. Use --open to launch IDE:"
  echo "  ./scripts/cap-sync.sh ios --open"
  echo "  ./scripts/cap-sync.sh android --open"
fi

echo ""
echo "=== Sync complete ==="
echo ""
echo "Quick reference:"
echo "  SKIP_BUILD=true ./scripts/cap-sync.sh all   # skip Next.js build"
echo "  ./scripts/cap-sync.sh ios --open             # sync + open Xcode"
echo "  ./scripts/cap-sync.sh android --open         # sync + open Android Studio"

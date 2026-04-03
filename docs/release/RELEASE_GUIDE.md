# BlackBelt v2 — Mobile Release Guide

> **Stack:** Next.js + Capacitor
> **App ID:** `app.blackbelt.v2`
> **App Name:** BlackBelt
> **Web Dir:** `out`
> **Backend:** Supabase at `blackbelts.com.br`

---

## iOS Release

### Prerequisites

- Xcode 15+ installed
- Active Apple Developer account ($99/year)
- Signing certificates and provisioning profiles configured in Xcode
- CocoaPods installed (`sudo gem install cocoapods`)

### Build Steps

```bash
npm run build
npx cap sync ios
npx cap open ios
```

### Archive and Upload

1. In Xcode, select **"Any iOS Device (arm64)"** as the build destination.
2. Go to **Product → Archive**.
3. Once the archive completes, the **Xcode Organizer** window opens automatically.
4. Select the archive and click **Distribute App**.
5. Choose **App Store Connect** as the distribution method.
6. Follow the prompts to upload.

### TestFlight

- After upload, the build is automatically processed by App Store Connect (takes 5–30 minutes).
- Once processing completes, the build appears in the **TestFlight** tab.
- Add internal testers or external testing groups as needed.
- External testing requires a brief Beta App Review.

### App Store Submission

1. In App Store Connect, go to **My Apps → BlackBelt**.
2. Create a new version under **App Store** tab.
3. Select the uploaded build.
4. Fill in release notes ("What's New").
5. Submit for review.

---

## Android Release

### Prerequisites

- Android Studio (latest stable)
- JDK 17
- A release keystore (see below)

### Generate Keystore (First Time Only)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/blackbelt-release.keystore -alias blackbelt -keyalg RSA -keysize 2048 -validity 10000
```

> **Important:** Back up the keystore and passwords securely. If you lose the keystore, you cannot update the app on Google Play.

### Configure Signing

In `android/app/build.gradle`, add the signing configuration:

```groovy
signingConfigs {
    release {
        storeFile file('../blackbelt-release.keystore')
        storePassword System.getenv('KEYSTORE_PASSWORD') ?: ''
        keyAlias 'blackbelt'
        keyPassword System.getenv('KEY_PASSWORD') ?: ''
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Build Steps

```bash
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```

### AAB Output Location

```
android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console).
2. Select the **BlackBelt** app (or create a new app entry).
3. Navigate to **Release → Production** (or testing track).
4. Upload the `.aab` file.

### Release Track Progression

1. **Internal testing** — immediate availability to internal testers (up to 100).
2. **Closed testing** — invite specific testers by email or Google Groups.
3. **Open testing** — publicly available opt-in beta.
4. **Production** — full public release.

Promote from one track to the next as confidence grows.

---

## Version Bumping

Update version numbers in all of the following locations before each release:

| File | Fields |
|------|--------|
| `package.json` | `version` |
| `capacitor.config.ts` | Update if version is referenced there |
| `android/app/build.gradle` | `versionCode` (integer, must increment) and `versionName` (semver string) |
| `ios/App/App.xcodeproj` | `MARKETING_VERSION` (semver string) and `CURRENT_PROJECT_VERSION` (integer, must increment) |

### Example

For releasing version 1.2.0:

- `package.json` → `"version": "1.2.0"`
- `build.gradle` → `versionCode 5`, `versionName "1.2.0"`
- Xcode project → `MARKETING_VERSION = 1.2.0`, `CURRENT_PROJECT_VERSION = 5`

---

## Checklist Before Submission

- [ ] All environment variables set for production (Supabase URL, anon key, etc.)
- [ ] Sentry DSN configured for crash reporting
- [ ] Push notification certificates configured (APNs for iOS, FCM for Android)
- [ ] Deep links configured (`.well-known/apple-app-site-association` and `.well-known/assetlinks.json` deployed to `blackbelts.com.br`)
- [ ] Store metadata and screenshots uploaded (App Store Connect / Google Play Console)
- [ ] Privacy policy URL accessible and linked in store listings
- [ ] Demo account created for Apple/Google reviewers (if the app requires login)
- [ ] App icons and splash screens finalized for all required sizes
- [ ] ProGuard / R8 rules tested (Android)
- [ ] Release build tested on physical devices (both platforms)

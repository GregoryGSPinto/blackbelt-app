# Apple App Store Privacy Details Guide

**App:** BlackBelt v2 (app.blackbelt.v2)
**Last updated:** 2026-03-26

This document provides the exact answers for the App Store Connect Privacy
section ("Privacy Nutrition Labels") and the required Xcode privacy manifest
(`PrivacyInfo.xcprivacy`) entries.

---

## 1. Privacy Nutrition Labels

### 1.1 Tracking Declaration

| Question | Answer |
|----------|--------|
| Do you or your third-party partners use data for tracking? | **No** |

> The app does not track users across apps or websites owned by other
> companies for advertising or data-broker purposes.

---

### 1.2 Data Linked to Your Identity

These data types are associated with the user's account or identity.

| Category | Data type | Purpose |
|----------|-----------|---------|
| Contact Info | Name | App Functionality |
| Contact Info | Email Address | App Functionality |
| Contact Info | Phone Number | App Functionality |
| Photos or Videos | Photos (profile avatar) | App Functionality |

---

### 1.3 Data Not Linked to Your Identity

These data types are collected but not associated with the user's identity.

| Category | Data type | Purpose |
|----------|-----------|---------|
| Usage Data | Product Interaction | Analytics |
| Diagnostics | Crash Data | App Functionality |
| Diagnostics | Performance Data | App Functionality |
| Identifiers | Device ID (push token) | App Functionality |

---

### 1.4 Data Used to Track You

**None.** The app does not use any data to track users across other companies'
apps or websites.

---

## 2. Full Category Checklist

Answer these in App Store Connect under App Privacy.

| Category | Collected? | Linked to Identity? | Used for Tracking? |
|----------|-----------|--------------------|--------------------|
| **Contact Info** | | | |
| - Name | Yes | Yes | No |
| - Email Address | Yes | Yes | No |
| - Phone Number | Yes | Yes | No |
| - Physical Address | No | -- | -- |
| - Other User Contact Info | No | -- | -- |
| **Health & Fitness** | | | |
| - Health | No | -- | -- |
| - Fitness | No | -- | -- |
| **Financial Info** | | | |
| - Payment Info | No | -- | -- |
| - Credit Info | No | -- | -- |
| - Other Financial Info | No | -- | -- |
| **Location** | | | |
| - Precise Location | No | -- | -- |
| - Coarse Location | No | -- | -- |
| **Sensitive Info** | No | -- | -- |
| **Contacts** | No | -- | -- |
| **User Content** | | | |
| - Emails or Text Messages | No | -- | -- |
| - Photos or Videos | Yes | Yes | No |
| - Audio Data | No | -- | -- |
| - Gameplay Content | No | -- | -- |
| - Customer Support | No | -- | -- |
| - Other User Content | No | -- | -- |
| **Browsing History** | No | -- | -- |
| **Search History** | No | -- | -- |
| **Identifiers** | | | |
| - User ID | Yes | Yes | No |
| - Device ID (push token) | Yes | No | No |
| **Purchases** | No | -- | -- |
| **Usage Data** | | | |
| - Product Interaction | Yes | No | No |
| - Advertising Data | No | -- | -- |
| - Other Usage Data | No | -- | -- |
| **Diagnostics** | | | |
| - Crash Data | Yes | No | No |
| - Performance Data | Yes | No | No |
| - Other Diagnostic Data | No | -- | -- |
| **Surroundings** | No | -- | -- |
| **Body** | No | -- | -- |

> **Note on Financial Info:** Payment is handled entirely by the Asaas
> payment gateway. The app never collects, processes, or stores credit card
> numbers, bank details, or other financial information. Therefore "Payment
> Info" is marked **No**.

> **Note on Biometric Data:** Biometric data (fingerprint/Face ID) used for
> check-in is processed exclusively on-device by the OS biometric API. It is
> never sent to a server. Apple does not require this to be declared in the
> nutrition labels because the app never accesses the raw biometric data.

---

## 3. Xcode Privacy Manifest (PrivacyInfo.xcprivacy)

Create the file at:
```
ios/App/App/PrivacyInfo.xcprivacy
```

Paste the following contents:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>

  <!-- Tracking declaration -->
  <key>NSPrivacyTracking</key>
  <false/>

  <key>NSPrivacyTrackingDomains</key>
  <array/>

  <!-- Collected data types -->
  <key>NSPrivacyCollectedDataTypes</key>
  <array>

    <!-- Name -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeName</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Email Address -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeEmailAddress</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Phone Number -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePhoneNumber</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Photos (profile avatar) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePhotos</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- User ID -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeUserID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Device ID (push notification token) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeDeviceID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Product Interaction (GA4 analytics) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeProductInteraction</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
      </array>
    </dict>

    <!-- Crash Data (Sentry) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeCrashData</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- Performance Data (Sentry) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePerformanceData</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <false/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

  </array>

  <!-- Required reason APIs -->
  <key>NSPrivacyAccessedAPITypes</key>
  <array>

    <!-- UserDefaults (Capacitor/plugins commonly use this) -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>

  </array>

</dict>
</plist>
```

---

## 4. Info.plist Privacy Keys

Ensure these keys are present in `ios/App/App/Info.plist` for permission
prompts:

```xml
<!-- Camera access for profile photo -->
<key>NSCameraUsageDescription</key>
<string>BlackBelt needs camera access to take your profile photo.</string>

<!-- Photo library for profile photo -->
<key>NSPhotoLibraryUsageDescription</key>
<string>BlackBelt needs photo library access to set your profile picture.</string>

<!-- Biometric authentication for check-in -->
<key>NSFaceIDUsageDescription</key>
<string>BlackBelt uses Face ID to verify your identity during check-in.</string>

<!-- Push notifications -->
<!-- Handled automatically by Capacitor Push Notifications plugin -->
```

---

## 5. App Tracking Transparency (ATT)

The app does **not** track users across other companies' apps or websites.
Therefore:

- `NSUserTrackingUsageDescription` is **not required** in Info.plist.
- The ATT prompt (`requestTrackingAuthorization`) is **not required**.
- `NSPrivacyTracking` is set to `false` in the privacy manifest.

---

## 6. Summary for App Store Connect Submission

When filling out the form in App Store Connect > App Privacy:

1. **Data Used to Track You** -- select "No" for all categories.
2. **Data Linked to You** -- declare: Name, Email Address, Phone Number, Photos, User ID.
3. **Data Not Linked to You** -- declare: Product Interaction, Crash Data, Performance Data, Device ID.
4. Upload or include the `PrivacyInfo.xcprivacy` file in your Xcode project target.

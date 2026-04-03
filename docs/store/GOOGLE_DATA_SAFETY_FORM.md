# BlackBelt v2 — Google Play Data Safety Form

**App:** BlackBelt v2 (app.blackbelt.v2)
**Last updated:** 2026-03-29

This document maps the app's data practices to the Google Play Console Data Safety form fields. Use it as a reference when filling out the form.

---

## 1. Data Collection & Security Overview

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS/TLS for all connections) |
| Do you provide a way for users to request that their data is deleted? | **Yes** (in-app button + public page at /excluir-conta) |

---

## 2. Data Types Collected

### 2.1 Personal Info

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Name | Yes | No | No | Yes | App functionality (user profile, class roster) |
| Email address | Yes | Yes (Resend — transactional emails) | No | Yes | App functionality, Account management |
| Phone number | Yes | No | No | Yes | App functionality (contact) |
| Address | Yes | No | No | No | App functionality (billing, when provided) |
| Date of birth | Yes | No | No | Yes (for Kids/Teen) | App functionality (age classification) |
| Race and ethnicity | No | — | — | — | — |
| Political or religious beliefs | No | — | — | — | — |
| Sexual orientation | No | — | — | — | — |
| Other personal info (CPF) | Yes | No | No | No | App functionality (contracts, billing) |

### 2.2 Financial Info

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| User payment info | No* | Yes (Asaas/Stripe gateway) | Yes | No | *Processed entirely by payment gateway; app never stores card data |
| Purchase history | Yes | No | No | No | App functionality (billing history) |
| Credit score | No | — | — | — | — |
| Other financial info | No | — | — | — | — |

### 2.3 Location

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Approximate location | No | — | — | — | — |
| Precise location | No | — | — | — | — |

> Note: Check-in by proximity uses Bluetooth/NFC, not GPS location.

### 2.4 Web Browsing

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Web browsing history | No | — | — | — | — |

### 2.5 Email and Text Messages

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Emails | No | — | — | — | — |
| SMS or MMS | No | — | — | — | — |
| Other in-app messages | Yes | No | No | No | App functionality (in-app messaging between users) |

### 2.6 Photos and Videos

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Photos | Yes | No | No | No | App functionality (profile avatar) |
| Videos | Yes | No | No | No | App functionality (video-aulas uploaded by professors) |

### 2.7 Audio

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Voice or sound recordings | No | — | — | — | — |
| Music files | No | — | — | — | — |
| Other audio files | No | — | — | — | — |

### 2.8 Health and Fitness

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Health info | No | — | — | — | — |
| Fitness info | No | — | — | — | — |

### 2.9 Contacts

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Contacts | No | — | — | — | — |

### 2.10 App Activity

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| App interactions | Yes | Yes (PostHog — anonymized) | No | No | Analytics |
| In-app search history | No | — | — | — | — |
| Installed apps | No | — | — | — | — |
| Other user-generated content | Yes | No | No | No | App functionality (class notes, evaluations) |
| Other actions | No | — | — | — | — |

### 2.11 Device or Other IDs

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Device or other IDs | Yes | No | No | No | App functionality (push notification token) |

### 2.12 Diagnostics

| Data type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|-----------|-----------|---------|------------|-----------|---------|
| Crash logs | Yes | Yes (Sentry) | No | No | App functionality (crash reporting) |
| Diagnostics | Yes | Yes (Sentry) | No | No | App functionality (performance monitoring) |
| Other app performance data | No | — | — | — | — |

---

## 3. Data Sharing Summary

| Third party | Data shared | Purpose |
|-------------|-----------|---------|
| **Asaas / Stripe** | Payment info (processed by gateway, not stored by app) | Payment processing |
| **Resend** | Email address | Transactional email delivery |
| **PostHog** | Anonymized app interactions | Analytics |
| **Sentry** | Crash logs, performance data | Error monitoring |

> **Important:** No data is shared for advertising, marketing, or data broker purposes.

---

## 4. Data Handling for Children

| Question | Answer |
|----------|--------|
| Is your app directed at children or does it collect data from children? | **Yes** — the app has specific Kids profiles (under 13) |
| Do you comply with COPPA and local children's privacy laws? | **Yes** — parental consent required, analytics disabled for Kids profiles |
| Is data from children shared with third parties? | **No** — analytics and crash reporting are disabled for Kids profiles |
| Are ads shown to children? | **No** — the app has no advertising |

---

## 5. Security Practices

| Practice | Implemented? |
|----------|-------------|
| Data encrypted in transit | Yes (HTTPS/TLS on all connections) |
| Data encrypted at rest | Yes (Supabase database encryption) |
| Data deletion mechanism | Yes (in-app account deletion + public deletion page) |
| Data export/portability | Yes (LGPD export — JSON download) |
| Independent security review | No (planned) |

---

## 6. Data Linked to Identity vs Not

### Linked to user identity:
- Name, Email, Phone, Date of birth, CPF, Photos, Purchase history, In-app messages, User-generated content

### Not linked to user identity:
- App interactions (anonymized via PostHog)
- Crash logs (anonymized via Sentry)
- Performance diagnostics
- Device ID (push token)

---

## 7. Form Navigation Guide

When filling the Google Play Console Data Safety form:

1. **"Does your app collect or share any of the required user data types?"** — Select **Yes**
2. **"Is all of the user data collected by your app encrypted in transit?"** — Select **Yes**
3. **"Do you provide a way for users to request that their data is deleted?"** — Select **Yes** and provide URL: `https://blackbelts.com.br/excluir-conta`
4. Go through each data type category above and fill in as documented
5. For each "shared" data type, specify the third party and purpose from Section 3
6. **Privacy Policy URL:** `https://blackbelts.com.br/privacidade`

---

*Documento mantido em conformidade com os requisitos do Google Play Data Safety.*

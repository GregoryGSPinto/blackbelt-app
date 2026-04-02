# Google Play Data Safety Form Guide

**App:** BlackBelt v2 (app.blackbelt.v2)
**Last updated:** 2026-03-26

This document provides the exact answers to fill out the Google Play Console
Data Safety section. Follow each section in order.

---

## 1. Overview Questions

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data is deleted? | **Yes** |

---

## 2. Data Types Declaration

### 2.1 Personal Info

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Name | Yes | No | App functionality, Account management | No | Yes |
| Email address | Yes | No | App functionality, Account management, Communications | No | Yes |
| Phone number | Yes | No | App functionality, Account management | No | Yes |

### 2.2 Photos and Videos

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Photos (profile avatar) | Yes | No | App functionality | **Yes** | Yes |

### 2.3 Financial Info

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Purchase history | No | No | N/A | N/A | N/A |
| Credit card / debit card / bank account number | No | No | N/A (handled entirely by Asaas payment gateway) | N/A | N/A |
| Other financial info | No | No | N/A | N/A | N/A |

> **Note:** All payment processing is handled by the Asaas payment gateway.
> The app never collects, stores, or has access to raw financial data such as
> card numbers. Asaas processes payments externally; no financial info passes
> through or is stored on BlackBelt servers.

### 2.4 Health and Fitness

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Health info | No | No | N/A | N/A | N/A |
| Fitness info | No | No | N/A | N/A | N/A |

### 2.5 Messages

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Emails | No | No | N/A | N/A | N/A |
| SMS or MMS | No | No | N/A | N/A | N/A |
| Other in-app messages | No | No | N/A | N/A | N/A |

### 2.6 App Activity

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| App interactions | Yes | No | Analytics (GA4) | No | Yes |
| In-app search history | No | No | N/A | N/A | N/A |
| Installed apps | No | No | N/A | N/A | N/A |
| Other user-generated content | No | No | N/A | N/A | N/A |

### 2.7 Web Browsing

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Web browsing history | No | No | N/A | N/A | N/A |

### 2.8 App Info and Performance

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Crash logs | Yes | No | Analytics (Sentry) | No | Yes |
| Diagnostics | Yes | No | Analytics (Sentry) | No | Yes |
| Other app performance data | No | No | N/A | N/A | N/A |

### 2.9 Device or Other IDs

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Device or other IDs (push notification tokens) | Yes | No | App functionality (push notifications) | No | Yes |

### 2.10 Contacts

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Contacts | No | No | N/A | N/A | N/A |

### 2.11 Location

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Approximate location | No | No | N/A | N/A | N/A |
| Precise location | No | No | N/A | N/A | N/A |

### 2.12 Audio

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Voice or sound recordings | No | No | N/A | N/A | N/A |
| Music files | No | No | N/A | N/A | N/A |
| Other audio files | No | No | N/A | N/A | N/A |

### 2.13 Files and Docs

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Files and docs | No | No | N/A | N/A | N/A |

### 2.14 Calendar

| Data type | Collected | Shared | Purpose | Optional | User can request deletion |
|-----------|-----------|--------|---------|----------|---------------------------|
| Calendar events | No | No | N/A | N/A | N/A |

---

## 3. Data Sharing

| Question | Answer |
|----------|--------|
| Does your app share user data with third parties? | **No** |

> The app does **not** share any collected data with third parties for
> advertising or marketing. Crash and diagnostics data are sent to Sentry
> solely for error tracking (first-party operational use). Analytics events
> are sent to Google Analytics 4 solely for first-party usage analysis.
> Transactional emails are sent via Resend solely for app communications.
> None of these constitute "sharing" under Google Play's Data Safety
> definition because they are service providers acting on behalf of the
> developer, not independent third parties using the data for their own
> purposes.

---

## 4. Security Practices

| Practice | Status |
|----------|--------|
| Data encrypted in transit (HTTPS/TLS) | **Yes** |
| Data encrypted at rest | **Yes** (Supabase PostgreSQL encryption at rest) |
| Users can request data deletion | **Yes** |
| Committed to following the Families Policy | **No** (app is not targeted at children) |

---

## 5. Biometric Data Note

Biometric data (fingerprint/face) used for check-in is processed and stored
**exclusively on-device** via the native biometric API. It is never
transmitted to any server or collected by the app. Therefore, biometric data
is **not declared** in the Data Safety form per Google Play guidelines
(on-device-only processing does not count as collection).

---

## 6. Third-Party SDKs Reference

| SDK | Data it processes | Declared as |
|-----|-------------------|-------------|
| Supabase (Auth + DB) | Name, email, phone, profile photo | Collected - App functionality, Account management |
| Google Analytics 4 (GA4) | App interactions, device identifiers | Collected - Analytics |
| Sentry | Crash logs, diagnostics | Collected - Analytics |
| Resend | Email address (transactional) | Collected - Communications |
| Asaas | Financial info (external) | **Not collected by the app** |
| Firebase Cloud Messaging / Capacitor Push | Push notification tokens | Collected - App functionality |

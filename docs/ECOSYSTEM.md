# BlackBelt Platform Ecosystem

## Overview

BlackBelt v2 is an open platform that enables third-party integrations, plugins, and automations for martial arts academy management. The ecosystem consists of five core subsystems.

## 1. SDK (Local Development Kit)

**Location:** `lib/sdk/blackbelt-sdk.ts`

A TypeScript SDK class that wraps all public API endpoints with type-safe methods. Not published to npm; imported locally.

Resources: Students, Classes, Attendance, Invoices, Plans, Events.

Features:
- Cursor-based pagination
- Configurable timeout with AbortSignal
- Typed error handling via `BlackBeltAPIError`
- Query parameter serialization

## 2. Webhook System

**Location:** `lib/sdk/webhooks-validator.ts`

Validates incoming webhook signatures using HMAC-SHA256 via Web Crypto API. Supports events like `student.created`, `checkin.registered`, `payment.received`, `belt.promoted`.

Outgoing webhook management is handled in `lib/api/webhooks-outgoing.service.ts`.

## 3. Plugin System

**Types:** `lib/types/plugins.ts`
**Service:** `lib/api/plugins.service.ts`
**Admin UI:** `app/(admin)/admin/plugins/page.tsx`

Categories: analytics, communication, payment, automation, integration.

Operations: install, uninstall, configure, view logs.

Each plugin declares a `configSchema` (typed fields) that renders a dynamic configuration form.

## 4. App Store

**Service:** `lib/api/app-store.service.ts`
**Public UI:** `app/(public)/app-store/page.tsx`
**Detail Page:** `app/(public)/app-store/[id]/page.tsx`

A public-facing marketplace for browsing, reviewing, and installing plugins and apps. Features search, category filters, ratings, pricing (free + paid in BRL), and featured app highlighting.

## 5. Developer Portal

**Service:** `lib/api/developer.service.ts`
**Landing:** `app/(public)/developers/page.tsx`
**API Reference:** `app/(public)/developers/api-reference/page.tsx`
**Sandbox:** `app/(public)/developers/sandbox/page.tsx`

Resources for external developers:
- Interactive API reference with endpoint documentation
- API sandbox/playground for testing endpoints with mock responses
- SDK quick start guide
- App submission workflow

## Architecture Flow

```
Developer -> SDK -> Public API (/api/v1/*)
Developer -> App Store (submit) -> Review -> Publish
Academy Admin -> Plugins Page -> Install -> Configure
API -> Webhooks -> Developer Endpoint -> Validate Signature
```

## Authentication

All API requests require the `X-API-Key` header. Keys are managed in Admin > Integrations > API.

Rate limit: 100 requests/minute per key. Pagination: cursor-based.

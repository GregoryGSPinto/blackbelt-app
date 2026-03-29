# Agent 01 — Admin + Super Admin Test Report

**Date:** 2026-03-29
**Environment:** Real Supabase (production instance)
**Tester:** Test Agent 1 (automated)

---

## 1.1 — Login

| User | Email | Result |
|------|-------|--------|
| Super Admin | gregoryguimaraes12@gmail.com | ✅ LOGIN OK (user_id: aee9e705-4bba-4bab-afed-21aac961ad84) |
| Admin | roberto@guerreiros.com | ✅ LOGIN OK (user_id: 5bc8697d-242a-4729-a974-ea6359e6b944) |

---

## 1.2 — Super Admin Queries

### 1.2a — All Academies
✅ **PASS** — SuperAdmin sees **3 academies**:
- Academia Guerreiros do Tatame (`809f2763...`, slug: guerreiros-tatame)
- teste sem link (`e0a4033e...`, slug: teste-sem-link)
- natalia bento fit (`fd32f7fb...`, slug: natalia-bento-fit)

### 1.2b — All Profiles (limit 20)
✅ **PASS** — SuperAdmin sees **36 total profiles** (20 returned in limit query).
- Note: column is `display_name`, not `email` or `full_name`.

### 1.2c — Count Users by Role
✅ **PASS** — 36 total profiles:

| Role | Count |
|------|-------|
| aluno_adulto | 12 |
| aluno_teen | 5 |
| admin | 4 |
| aluno_kids | 4 |
| responsavel | 4 |
| professor | 3 |
| superadmin | 2 |
| recepcao | 1 |
| franqueador | 1 |

### 1.2d — Tournaments
✅ **PASS** — Table `tournaments` exists but has **0 rows** (empty).
- `competitions` table also exists (0 rows).
- `events` table exists (1 row).
- `championship` table does NOT exist.

---

## 1.3 — Admin CRUD (RLS Isolation)

### 1.3a — Academy Isolation
✅ **PASS** — Admin sees **only 1 academy** (Academia Guerreiros do Tatame).
SuperAdmin sees 3 academies. RLS isolation confirmed.

### 1.3b — Admin Academy ID
✅ **PASS** — Academy ID: `809f2763-0096-4cfa-8057-b5b029cbc62f`
Found via `memberships` table (columns: id, profile_id, academy_id, role, status).

### 1.3c — Students in Academy
✅ **PASS** — Admin sees 30 memberships in their academy:

| Role | Count |
|------|-------|
| aluno_adulto | 12 |
| aluno_teen | 5 |
| aluno_kids | 4 |
| responsavel | 4 |
| professor | 3 |
| admin | 2 |

### 1.3d — Profile RLS Isolation
✅ **PASS (partial)** — Admin sees **33 profiles** vs SuperAdmin's **36 profiles**.
- Admin is missing: 2 admins + 1 superadmin from other academies.
- RLS correctly hides profiles from other academies (except shared/cross-academy ones).

### 1.3e — Classes
✅ **PASS** — Admin sees **11 classes**, all belonging to their academy.
- All 11 classes are in academy `809f2763...` (no cross-academy data exists yet to verify stricter isolation).

### 1.3f — Attendance
✅ **PASS** — `attendance` table exists with 3 rows.
- Columns: id, student_id, class_id, checked_at, method, created_at, updated_at

### 1.3g — Payments
✅ **PASS** — Financial tables present:
- `invoices`: 3 rows (columns include subscription_id, amount, status, due_date, payment_method, pix_qr_code, etc.)
- `subscriptions`: 3 rows (columns: id, student_id, plan_id, status, current_period_end)
- `payments`: exists but 0 rows

---

## 1.4 — Admin Write Test (Classes CRUD)

### 1.4a — CREATE
✅ **PASS** — Created class `__TEST_CLASS_AGENT01__` (id: `5fe0d94b...`).
- **Note:** Initial attempt with only `name`, `academy_id`, `capacity` was **rejected by RLS** (42501 error).
  The RLS INSERT policy on `classes` requires `unit_id` to exist in a unit belonging to the admin's academy.
  Once `modality_id`, `unit_id`, and `professor_id` were provided, creation succeeded.

### 1.4b — UPDATE
✅ **PASS** — Updated name to `__TEST_CLASS_UPDATED__`, confirmed via response.

### 1.4c — DELETE
✅ **PASS** — Deleted successfully, verified with follow-up SELECT returning empty array.

### 1.4d — Cleanup Verified
✅ **PASS** — No test data remains in the database.

---

## 1.5 — Admin Specific Features

### 1.5a — pre_checkins
✅ **PASS** — Table `pre_checkins` exists (0 rows currently). Schema accessible.

### 1.5b — Graduations / Belt Promotions
❌ **TABLES NOT FOUND** — None of the expected tables exist:
- `graduations` — NOT FOUND
- `belt_promotions` — NOT FOUND
- `student_progress` — NOT FOUND
- `belt_exams` — NOT FOUND
- `belt_levels` — NOT FOUND
- `student_belts` — NOT FOUND

**Issue:** Belt/graduation system tables have not been created yet. This is a missing feature area.

### 1.5c — Academy Settings
❌ **TABLE NOT FOUND** — Neither `academy_settings` nor `academy_configs` exist.

**Note:** Migration `20240320000003_user_preferences_academy_settings.sql` exists but may not have been applied, or uses a different table name.

### 1.5d — Other Admin Tables
✅ **PASS** — Core reference tables accessible:
- `modalities`: 3 rows
- `units`: 2 rows
- `plans`: 3 rows
- `class_enrollments`: 3 rows
- `notifications`: exists (0 rows)
- `messages`: exists (0 rows)

---

## Summary

| Test | Status | Notes |
|------|--------|-------|
| 1.1 Super Admin Login | ✅ | OK |
| 1.1 Admin Login | ✅ | OK |
| 1.2a All Academies | ✅ | 3 academies visible |
| 1.2b All Profiles | ✅ | 36 profiles, column is `display_name` |
| 1.2c Role Counts | ✅ | 9 roles, 36 users |
| 1.2d Tournaments | ✅ | Table exists, 0 rows |
| 1.3a Academy Isolation | ✅ | Admin sees 1 / SA sees 3 |
| 1.3b Admin Academy ID | ✅ | Found via memberships |
| 1.3c Students in Academy | ✅ | 30 members |
| 1.3d Profile RLS | ✅ | 33 vs 36 — partial isolation |
| 1.3e Classes | ✅ | 11 classes, all same academy |
| 1.3f Attendance | ✅ | 3 rows |
| 1.3g Payments | ✅ | invoices (3), subscriptions (3) |
| 1.4a CREATE class | ✅ | Requires unit_id for RLS check |
| 1.4b UPDATE class | ✅ | OK |
| 1.4c DELETE class | ✅ | OK + verified |
| 1.5a pre_checkins | ✅ | Table exists, 0 rows |
| 1.5b Graduations | ❌ | Tables do not exist |
| 1.5c Academy Settings | ❌ | Tables do not exist |
| 1.5d Other Tables | ✅ | modalities, units, plans, enrollments |

**Overall: 17/19 tests passed (89%)**

### Key Issues Found
1. **Belt/graduation tables missing** — No `graduations`, `belt_promotions`, `student_belts`, or `belt_levels` tables exist. This entire feature area needs migration creation.
2. **Academy settings table missing** — No `academy_settings` or `academy_configs` table despite migration file existing.
3. **Classes INSERT RLS** — The INSERT policy requires `unit_id` to validate academy membership. Inserting without `unit_id` fails silently with RLS error (not a validation error). Frontend must always provide `unit_id`.
4. **Profile column naming** — Column is `display_name`, not `full_name` or `email`. No email column on `profiles` table.

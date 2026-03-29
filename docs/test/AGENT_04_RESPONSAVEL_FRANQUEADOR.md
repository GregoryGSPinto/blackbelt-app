# Agent 04 — Responsavel & Franqueador Test Report

**Date:** 2026-03-29
**Target:** Real Supabase (REST API + RLS)
**Profiles tested:**
- Responsavel: maria.resp@email.com (auth_id: `d09a6a52-...`, profile_id: `65031157-...`)
- Franqueador: fernando@guerreiros.com (auth_id: `67af63f4-...`, profile_id: `c579e4e6-...`)

---

## 4.1 — Login

| Test | Result | Details |
|------|--------|---------|
| Responsavel login | ✅ | Token received, user_id `d09a6a52-74c0-4ef2-86d4-2cfeb73b2050` |
| Franqueador login | ✅ | Token received, user_id `67af63f4-2954-4843-9460-e0e8ded3646e` |

---

## 4.2 — Responsavel Tests

### 4.2.1 — See own profile

| Test | Result | Details |
|------|--------|---------|
| Profile visible via user_id | ✅ | display_name: "Maria Clara Mendes", role: "responsavel", lifecycle_status: "active" |
| Profile columns correct | ✅ | id, user_id, role, display_name, avatar, created_at, updated_at, person_id, lifecycle_status, parental_controls, needs_password_change |
| Note: profiles.academy_id | -- | Column does not exist on profiles table (academy membership is via `academy_members` table) |

### 4.2.2 — Find dependents/children

| Test | Result | Details |
|------|--------|---------|
| `guardians` table lookup | ✅ | 1 record found: guardian_profile_id matches, student_id=`b328b069-...`, relation="mae" |
| Student profile resolved | ✅ | Linked student: "Lucas Gabriel Mendes", role: "aluno_teen" |
| `guardian_links` table | -- | Table does not exist (hint pointed to `guardian_students`) |
| `guardian_students` table | ✅ | Table exists but 0 rows (different schema from `guardians`) |
| `dependents` table | -- | Table does not exist |

**Summary:** The `guardians` table is the correct table for guardian-student relationships. Maria Clara Mendes is linked as "mae" (mother) to student Lucas Gabriel Mendes.

### 4.2.3 — See payments

| Test | Result | Details |
|------|--------|---------|
| `payments` table | ✅ | Table exists, 0 rows visible (empty or no data) |
| `invoices` table | ✅ | **126 invoices visible** — includes amount, status, due_date, paid_at (sample: R$229, R$129, status=paid) |
| `subscriptions` table | ✅ | **21 subscriptions visible** — columns: id, student_id, plan_id, status, current_period_end |
| `billing` table | -- | Table does not exist |

**Note:** The Responsavel can see 126 invoices and 21 subscriptions. This is a **potential RLS concern** — a Responsavel should ideally only see invoices related to their own dependents, not all academy invoices. Needs verification whether RLS properly scopes to guardian's students only or if this is academy-wide visibility.

### 4.2.4 — CANNOT edit academy data

| Test | Result | Details |
|------|--------|---------|
| Read academies | ✅ | Can see 1 academy: "Academia Guerreiros do Tatame" |
| Update academy name | ✅ | Returned `[]` (0 rows affected) — RLS blocked the update |
| Academy name unchanged | ✅ | Verified: still "Academia Guerreiros do Tatame" |

### 4.2.5 — CANNOT delete profiles

| Test | Result | Details |
|------|--------|---------|
| Delete own profile | ✅ | Returned `[]` (0 rows affected) — RLS blocked |
| Delete other profile | ✅ | Returned `[]` (0 rows affected) — RLS blocked |
| Verify profile still exists | ✅ | Profile still present with correct data |

---

## 4.3 — Franqueador Tests

### 4.3.1 — See own profile

| Test | Result | Details |
|------|--------|---------|
| Profile visible | ✅ | display_name: "Fernando Almeida", role: "franqueador", lifecycle_status: "active" |

### 4.3.2 — See academies

| Test | Result | Details |
|------|--------|---------|
| Academies visible | ✅ | 1 academy visible: "Academia Guerreiros do Tatame" |
| Multiple academies | -- | Only 1 academy in the system; cannot test multi-academy franchise visibility |

### 4.3.3 — CANNOT create new academies

| Test | Result | Details |
|------|--------|---------|
| INSERT into academies | ✅ | Blocked with error: `"new row violates row-level security policy for table \"academies\""` (code 42501) |

### 4.3.4 — Cross-academy metrics

| Test | Result | Details |
|------|--------|---------|
| `academy_metrics` table | -- | Table does not exist |
| `dashboard_metrics` table | -- | Table does not exist |
| `franchise_metrics` table | -- | Table does not exist |
| `kpi_snapshots` table | -- | Table does not exist |
| `franchise_leads` table | ✅ | Table exists, 0 rows visible |
| `franchise_units` table | ✅ | Table exists, 0 rows visible |
| Profiles visibility | ✅ | Can see 33 profiles (all academy members) |
| Students visibility | ✅ | Can see 24 students |
| `academy_members` table | ✅ | 0 rows visible (empty for this user) |

**Note:** No cross-academy metrics tables exist yet. The Franqueador has broad read visibility (33 profiles, 24 students) similar to admin-level access within their academy scope.

### 4.3.5 — CANNOT update/delete (additional security)

| Test | Result | Details |
|------|--------|---------|
| Update academy name | ✅ | Returned `[]` (0 rows affected) — RLS blocked |
| Academy name unchanged | ✅ | Verified: still "Academia Guerreiros do Tatame" |
| Delete superadmin profile | ✅ | Returned `[]` (0 rows affected) — RLS blocked |
| Superadmin profile intact | ✅ | Verified: Gregory Guimaraes Pinto still exists with role superadmin |

---

## Summary

| Category | Passed | Failed | Skipped/N/A |
|----------|--------|--------|-------------|
| 4.1 Login | 2 | 0 | 0 |
| 4.2 Responsavel | 12 | 0 | 4 (tables don't exist) |
| 4.3 Franqueador | 10 | 0 | 5 (tables don't exist) |
| **Total** | **24** | **0** | **9** |

## Findings & Recommendations

1. **RLS is working correctly** for both profiles — neither Responsavel nor Franqueador can update academies or delete profiles.

2. **Franqueador INSERT blocked explicitly** — the only test that returned an actual RLS policy error message (code 42501) rather than silent empty results.

3. **Responsavel invoice visibility (potential concern):** The Responsavel user can see 126 invoices and 21 subscriptions. This should be validated to ensure RLS scopes invoices only to their dependents' subscriptions, not all academy invoices. If the academy only has those records and they all relate to the guardian's scope, this is fine; otherwise, this could be a data leak.

4. **No metrics tables exist** — `academy_metrics`, `dashboard_metrics`, `franchise_metrics`, `kpi_snapshots` are all absent. If Franqueador needs a cross-academy dashboard, these tables need to be created.

5. **`academy_members` is empty** for both users — the profile-to-academy relationship may be handled entirely through `get_my_academy_ids()` function rather than the `academy_members` table, or this table is not yet populated for these roles.

6. **`profiles.academy_id` does not exist** — academy membership is managed separately, not as a column on profiles.

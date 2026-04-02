# Agent 02 — Professor + Recepcionista Test Report

**Date:** 2026-03-29
**Target:** Real Supabase (REST API + RLS policies)
**Profiles tested:** Professor (andre@guerreiros.com), Recepcionista (julia@guerreiros.com)

---

## 2.1 — Login

| Test | Result | Details |
|------|--------|---------|
| Professor login | ✅ | user_id `42e55e1e-f985-4541-8acf-c3c2ee9cf1ce`, token 838 chars |
| Recepcionista login | ✅ | user_id `c1f4e1b5-6168-4006-9855-525dd308ff75`, token 828 chars |

---

## 2.2 — Professor Tests

### 2.2.1 — Own profile
| Test | Result | Details |
|------|--------|---------|
| See own profile | ✅ | profile_id `21eecdbc`, role=`professor`, display_name=`Andre Luis da Silva` |
| Membership visible | ✅ | academy_id `809f2763`, role=`professor`, status=`active` |

### 2.2.2 — See classes
| Test | Result | Details |
|------|--------|---------|
| All academy classes visible | ✅ | 11 classes returned (all from same academy) |
| Filter by own professor_id | ✅ | 6 own classes: BJJ Iniciante, BJJ Avancado, Muay Thai Sede, MMA, Competicao BJJ, Open Mat |

### 2.2.3 — Register attendance
| Test | Result | Details |
|------|--------|---------|
| INSERT attendance (manual) | ✅ | HTTP 201 — record `7f7d3241` created for student `c3927197` in class `1276f05a` |
| Attendance policy (professor of class) | ✅ | Professor of BJJ Iniciante successfully inserted attendance |

### 2.2.4 — Cleanup test attendance
| Test | Result | Details |
|------|--------|---------|
| DELETE test attendance | ❌ | HTTP 200 but empty array returned — RLS `attendance_delete` policy did NOT allow delete despite professor owning the class. Record `7f7d3241` persists. **BUG:** The `attendance_delete` policy (migration 041) checks `c.professor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())` which should match, but the delete returns empty. Possible cause: conflicting or shadowed policy, or `IF NOT EXISTS` prevented policy creation. |

### 2.2.5 — Attendance history
| Test | Result | Details |
|------|--------|---------|
| See attendance history | ✅ | 5 records visible for BJJ Iniciante class, ordered by date desc |

### 2.2.6 — Financial data access (security check)
| Test | Result | Details |
|------|--------|---------|
| Subscriptions visible | ⚠️ | **SECURITY CONCERN** — Professor can READ subscriptions (5+ records). RLS policy `subscriptions_academy_select` (migration 019) uses `is_member_of()` which allows ALL academy members, not just admin. Original intent (migration 008) was admin-only + own student. |
| Invoices visible | ⚠️ | **SECURITY CONCERN** — Professor can READ invoices (5+ records with amounts). Same RLS issue via `invoices_academy_select`. |
| Plans visible | ✅ | Plans are intentionally readable by all members (per migration 008 comment: "all members can read"). |

---

## 2.3 — Recepcionista Tests

### 2.3.1 — Own profile
| Test | Result | Details |
|------|--------|---------|
| See own profile | ✅ | profile_id `98f3df37`, role=`recepcao`, display_name=`Julia Santos` |
| Membership visible | ✅ | academy_id `809f2763`, role=`recepcao`, status=`active` |

### 2.3.2 — See students for check-in
| Test | Result | Details |
|------|--------|---------|
| Student profiles visible | ✅ | 10+ student profiles visible (aluno_adulto, aluno_teen, aluno_kids) from same academy |
| Students table visible | ✅ | Can read students table with belt info — needed for check-in workflows |

### 2.3.3 — Financial data write protection
| Test | Result | Details |
|------|--------|---------|
| UPDATE invoice | ✅ (blocked) | Returns empty array — RLS correctly prevents recepcao from updating invoices (admin-only write policy) |
| INSERT invoice | ✅ (blocked) | HTTP 403 — `new row violates row-level security policy for table "invoices"` |

### 2.3.4 — Financial data read access (security check)
| Test | Result | Details |
|------|--------|---------|
| Subscriptions visible | ⚠️ | **SECURITY CONCERN** — Recepcionista can READ subscriptions. Same `is_member_of()` issue as professor. |
| Invoices visible | ⚠️ | **SECURITY CONCERN** — Recepcionista can READ invoice amounts. |
| Plans visible | ✅ | Plans intentionally readable by all members. |

### 2.3.5 — Academy isolation (multi-tenancy)
| Test | Result | Details |
|------|--------|---------|
| Only own academy visible | ✅ | Only 1 distinct academy_id in all visible memberships: `809f2763-0096-4cfa-8057-b5b029cbc62f` |

---

## Summary

| Category | Passed | Failed | Warnings |
|----------|--------|--------|----------|
| Login | 2 | 0 | 0 |
| Professor profile/classes | 4 | 0 | 0 |
| Professor attendance | 2 | 1 | 0 |
| Professor financial | 1 | 0 | 2 |
| Recepcionista profile | 2 | 0 | 0 |
| Recepcionista students | 2 | 0 | 0 |
| Recepcionista financial write | 2 | 0 | 0 |
| Recepcionista financial read | 1 | 0 | 2 |
| Recepcionista multi-tenancy | 1 | 0 | 0 |
| **TOTAL** | **17** | **1** | **4** |

## Bugs Found

1. **BUG: Professor cannot DELETE attendance records** — The `attendance_delete` RLS policy (migration 041) should allow the professor of a class to delete attendance, but the DELETE operation returns empty despite the professor owning the class. The policy was created with `IF NOT EXISTS` which may have been silently skipped.

## Security Concerns

1. **Professor and Recepcionista can READ financial data (subscriptions + invoices)** — Migration 019 replaced the original admin-only SELECT policies on `subscriptions` and `invoices` with `is_member_of()` / academy-wide policies, meaning ANY active academy member can view payment amounts and subscription statuses. The original intent in migration 008 was admin-only read (plus students reading their own). Consider restricting these SELECT policies to `role IN ('admin', 'gestor')` or adding role checks.

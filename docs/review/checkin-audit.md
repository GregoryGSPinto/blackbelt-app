# Check-in System Audit — 2026-03-30

## 1. Tables in Supabase Real

| Table | Status | Records | Purpose |
|-------|--------|---------|---------|
| `attendance` | EXISTS | 1116 | Core attendance (1 per student/class/day) |
| `checkins` | EXISTS | 1018 | Reception entry/exit tracking |
| `pre_checkins` | EXISTS | 0 | Pre-check-in (intent to attend) |
| `guardian_links` | EXISTS | 36 | Parent-child relationships |
| `classes` | EXISTS | 11 | Class definitions |
| `class_enrollments` | EXISTS | 39 | Student-class enrollment |
| `students` | EXISTS | 24 | Student records (bridge profiles→attendance) |
| `visitantes` | EXISTS | ? | Visitor tracking |
| `parent_today_classes` | MISSING | - | View needed by parent-checkin.service |
| `parent_checkin_history` | MISSING | - | View needed by parent-checkin.service |
| `class_schedules` | MISSING | - | Not currently used |

## 2. Table Schemas

### attendance
```
id: uuid PK
student_id: uuid FK → students(id)
class_id: uuid FK → classes(id)
checked_at: timestamptz DEFAULT now()
method: text CHECK ('qr_code','manual','system')
created_at, updated_at: timestamptz
UNIQUE: (student_id, class_id, date_utc(checked_at))
```

### checkins
```
id: uuid PK
academy_id: uuid FK → academies(id)
profile_id: uuid FK → profiles(id)
profile_name: text
person_type: text (aluno, visitante, etc.)
belt: text
class_name: text
check_in_at: timestamptz
check_out_at: timestamptz
checked_in_by: uuid (nullable)
checkin_type: text (self, guardian, etc.)
created_at, updated_at: timestamptz
```

### pre_checkins
```
id: uuid PK
academy_id: uuid FK
student_id: uuid FK → profiles(id)
class_id: uuid FK
class_date: date
status: text CHECK ('confirmed','cancelled','attended','no_show')
created_at: timestamptz
UNIQUE: (student_id, class_id, class_date)
```

### Key: Dual referencing pattern
- `attendance` → `student_id` → `students.id` (old pattern)
- `checkins` → `profile_id` → `profiles.id` (new pattern)
- `pre_checkins` → `student_id` → `profiles.id` (confusing name)
- `students.profile_id` → `profiles.id` (bridge table)
- `guardian_links` → `guardian_id`/`child_id` → `profiles.id`

## 3. Services

| Service | Real Supabase | Tables Queried |
|---------|--------------|----------------|
| `checkin.service.ts` | YES | attendance |
| `attendance.service.ts` | YES | attendance, students, classes |
| `parent-checkin.service.ts` | YES* | parent_today_classes (MISSING VIEW), attendance |
| `pre-checkin.service.ts` | YES | pre_checkins |
| `recepcao-checkin.service.ts` | YES | students, checkins |
| `qr-checkin.service.ts` | YES | academy_settings, classes, attendance |
| `proximity-checkin.service.ts` | YES | academy_settings, classes, attendance |

*parent-checkin.service.ts queries `parent_today_classes` view which does NOT exist.

## 4. Pages

| Page | Profile | Status |
|------|---------|--------|
| `/dashboard/checkin` | Aluno Adulto | EXISTS — uses checkin.service |
| `/teen/checkin` | Teen | EXISTS — uses checkin.service |
| `/parent/checkin` | Responsavel | EXISTS — uses parent-checkin.service |
| `/parent/presencas` | Responsavel | EXISTS — weekly attendance view |
| `/parent/precheckin` | Responsavel | EXISTS — uses mock data, needs real |
| `/professor/presenca` | Professor | EXISTS — uses attendance.service |
| `/recepcao/checkin` | Recepcao | EXISTS — uses recepcao-checkin.service |
| `/admin/presenca` | Admin | MISSING — no page exists |

## 5. Gaps to Fix

1. **CRITICAL**: `parent_today_classes` and `parent_checkin_history` views don't exist — parent-checkin.service will fail in production
2. **CRITICAL**: `/parent/precheckin` page uses hardcoded mock data (MOCK_UPCOMING_CLASSES) not Supabase
3. **MISSING**: Admin attendance/presence page doesn't exist
4. **MISSING**: `pre_checkins` has 0 records (no seed data)
5. **CHECK**: Dashboard pages may use mock stats instead of real Supabase data
6. **NAMING**: `pre_checkins.student_id` actually references `profiles(id)` not `students(id)`

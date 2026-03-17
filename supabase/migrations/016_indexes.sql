-- Migration: 016_indexes
-- Performance indexes for core tables

-- ── Attendance ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_class_checked
  ON attendance (class_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_student_checked
  ON attendance (student_id, checked_at DESC);

-- ── Students ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_academy_belt_v2
  ON students (academy_id, belt);

-- ── Invoices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoices_due_status
  ON invoices (due_date, status);

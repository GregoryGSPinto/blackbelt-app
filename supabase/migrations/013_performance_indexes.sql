-- FASE 5 — Performance indexes for high-traffic query paths
-- These indexes cover the most common WHERE/JOIN columns across
-- attendance, students, classes, invoices and memberships tables.

CREATE INDEX IF NOT EXISTS idx_attendance_student_id  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id    ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checked_at  ON attendance(checked_at);
CREATE INDEX IF NOT EXISTS idx_students_academy_id    ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_classes_professor_id   ON classes(professor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date      ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_memberships_profile_id ON memberships(profile_id);

-- Migration: 016_indexes
-- Performance indexes for enterprise features

-- ── Audit logs ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_logs_academy_created
  ON audit_logs (academy_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON audit_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id);

-- ── Payments & billing ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_academy_status
  ON payments (academy_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_student_date
  ON payments (student_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_academy_month
  ON invoices (academy_id, reference_month);

CREATE INDEX IF NOT EXISTS idx_mensalidades_academy_status_month
  ON mensalidades (academy_id, status, reference_month);

-- ── Attendance ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_class_date
  ON attendance (class_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date
  ON attendance (student_id, date DESC);

-- ── Students ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_academy_belt
  ON students (academy_id, belt_level);

CREATE INDEX IF NOT EXISTS idx_students_academy_status
  ON students (academy_id, status);

CREATE INDEX IF NOT EXISTS idx_students_name_trgm
  ON students USING gin (name gin_trgm_ops);

-- ── Classes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_classes_academy_day
  ON classes (academy_id, day_of_week);

-- ── Events ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_academy_date
  ON events (academy_id, start_date);

CREATE INDEX IF NOT EXISTS idx_events_status
  ON events (status);

-- ── Content / Videos ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_videos_academy_published
  ON videos (academy_id, is_published);

CREATE INDEX IF NOT EXISTS idx_video_views_student
  ON video_views (student_id, watched_at DESC);

-- ── Notifications ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, is_read);

-- ── Store ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_store_products_academy
  ON store_products (academy_id, active);

CREATE INDEX IF NOT EXISTS idx_store_orders_student
  ON store_orders (student_id, created_at DESC);

-- ── Invite tokens ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
  ON invite_tokens (token);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_academy
  ON invite_tokens (academy_id, status);

-- ── Composite indexes for common queries ──────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_academy_role
  ON profiles (academy_id, role);

-- ── Partial indexes for active records ────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_active
  ON students (academy_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_payments_pending
  ON payments (academy_id, due_date) WHERE status = 'pending';

-- ============================================================
-- BlackBelt v2 — Migration 093: Platform Central Foundation
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.is_superadmin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.platform_breakpoint(width_px integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN width_px IS NULL THEN 'unknown'
    WHEN width_px < 480 THEN 'xs'
    WHEN width_px < 768 THEN 'sm'
    WHEN width_px < 1024 THEN 'md'
    WHEN width_px < 1440 THEN 'lg'
    WHEN width_px < 1920 THEN 'xl'
    ELSE 'tv'
  END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_feedback_category') THEN
    CREATE TYPE public.support_feedback_category AS ENUM (
      'feedback',
      'complaint',
      'suggestion',
      'bug',
      'question',
      'incident',
      'praise'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_severity') THEN
    CREATE TYPE public.platform_severity AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_status') THEN
    CREATE TYPE public.platform_status AS ENUM (
      'new',
      'triaged',
      'in_progress',
      'waiting_customer',
      'resolved',
      'closed',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_health_component_type') THEN
    CREATE TYPE public.platform_health_component_type AS ENUM (
      'api',
      'database',
      'auth',
      'jobs',
      'storage',
      'webhook',
      'integration',
      'frontend',
      'realtime',
      'queue'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_event_origin') THEN
    CREATE TYPE public.platform_event_origin AS ENUM (
      'web',
      'ios',
      'android',
      'api',
      'system',
      'worker',
      'seed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_incident_type') THEN
    CREATE TYPE public.platform_incident_type AS ENUM (
      'outage',
      'degradation',
      'security',
      'performance',
      'billing',
      'integrity',
      'integration',
      'ux'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_device_type') THEN
    CREATE TYPE public.platform_device_type AS ENUM (
      'desktop',
      'tablet',
      'mobile',
      'tv',
      'bot',
      'unknown'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_signal_status') THEN
    CREATE TYPE public.platform_signal_status AS ENUM (
      'healthy',
      'warning',
      'critical',
      'unknown',
      'not_configured'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.app_telemetry_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL UNIQUE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  device_model text,
  device_vendor text,
  os_name text,
  os_version text,
  browser_name text,
  browser_version text,
  screen_width integer,
  screen_height integer,
  viewport_width integer,
  viewport_height integer,
  pixel_ratio numeric(6,2),
  connection_effective_type text,
  locale text,
  timezone text,
  app_version text,
  release_version text,
  current_route text,
  last_error_route text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  pages_viewed integer DEFAULT 0,
  total_events integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL,
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  event_name text NOT NULL,
  route_path text,
  screen_name text,
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  viewport_width integer,
  viewport_height integer,
  breakpoint text GENERATED ALWAYS AS (public.platform_breakpoint(viewport_width)) STORED,
  app_version text,
  release_version text,
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  happened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_error_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text,
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  severity public.platform_severity NOT NULL DEFAULT 'medium',
  error_type text NOT NULL,
  error_code text,
  message text NOT NULL,
  route_path text,
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  viewport_width integer,
  viewport_height integer,
  os_name text,
  browser_name text,
  app_version text,
  release_version text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  fingerprint text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text,
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  route_path text NOT NULL,
  screen_name text,
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  viewport_width integer,
  viewport_height integer,
  breakpoint text GENERATED ALWAYS AS (public.platform_breakpoint(viewport_width)) STORED,
  app_version text,
  release_version text,
  load_time_ms integer,
  ttfb_ms integer,
  fcp_ms integer,
  lcp_ms integer,
  cls numeric(8,4),
  fid_ms integer,
  inp_ms integer,
  api_latency_ms integer,
  render_duration_ms integer,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_device_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL,
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  route_path text,
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  device_model text,
  device_vendor text,
  os_name text,
  os_version text,
  browser_name text,
  browser_version text,
  screen_width integer,
  screen_height integer,
  viewport_width integer,
  viewport_height integer,
  breakpoint text GENERATED ALWAYS AS (public.platform_breakpoint(viewport_width)) STORED,
  pixel_ratio numeric(6,2),
  orientation text,
  layout_risk_score numeric(5,2) DEFAULT 0,
  layout_risk_reason text,
  release_version text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_feedback_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category public.support_feedback_category NOT NULL DEFAULT 'feedback',
  severity public.platform_severity NOT NULL DEFAULT 'medium',
  status public.platform_status NOT NULL DEFAULT 'new',
  origin public.platform_event_origin NOT NULL DEFAULT 'web',
  title text NOT NULL,
  description text NOT NULL,
  route_path text,
  source_page text,
  device_type public.platform_device_type NOT NULL DEFAULT 'unknown',
  viewport_width integer,
  viewport_height integer,
  browser_name text,
  os_name text,
  app_version text,
  release_version text,
  is_customer_visible boolean NOT NULL DEFAULT true,
  external_reference text,
  first_response_at timestamptz,
  resolved_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_feedback_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.support_feedback_items(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_internal boolean NOT NULL DEFAULT true,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_feedback_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.support_feedback_items(id) ON DELETE CASCADE,
  assigned_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.support_feedback_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_feedback_item_tags (
  item_id uuid NOT NULL REFERENCES public.support_feedback_items(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.support_feedback_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.platform_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  incident_type public.platform_incident_type NOT NULL,
  severity public.platform_severity NOT NULL DEFAULT 'medium',
  status public.platform_status NOT NULL DEFAULT 'new',
  title text NOT NULL,
  summary text NOT NULL,
  route_path text,
  device_type public.platform_device_type,
  release_version text,
  started_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  component public.platform_health_component_type NOT NULL,
  status public.platform_signal_status NOT NULL DEFAULT 'unknown',
  uptime_percent numeric(6,3),
  error_rate_percent numeric(6,3),
  latency_ms integer,
  consecutive_failures integer NOT NULL DEFAULT 0,
  release_version text,
  environment text DEFAULT 'local',
  checked_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_risk_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  overall_status public.platform_signal_status NOT NULL DEFAULT 'unknown',
  risk_score numeric(5,2) NOT NULL DEFAULT 0,
  security_score numeric(5,2),
  ux_score numeric(5,2),
  suspicious_logins integer DEFAULT 0,
  auth_failures integer DEFAULT 0,
  release_regression_percent numeric(6,2),
  repeated_error_growth_percent numeric(6,2),
  notes text,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_observability_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  provider text,
  model text,
  model_version text,
  status public.platform_signal_status NOT NULL DEFAULT 'not_configured',
  feature_name text,
  request_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  timeout_count integer DEFAULT 0,
  avg_latency_ms integer,
  p95_latency_ms integer,
  estimated_cost numeric(12,4),
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_telemetry_sessions_academy_last_seen ON public.app_telemetry_sessions(academy_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_telemetry_sessions_release ON public.app_telemetry_sessions(release_version, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_happened_at ON public.app_telemetry_events(happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_route ON public.app_telemetry_events(route_path, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_release ON public.app_telemetry_events(release_version, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_telemetry_events_device ON public.app_telemetry_events(device_type, breakpoint, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_error_events_route ON public.app_error_events(route_path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_error_events_release ON public.app_error_events(release_version, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_error_events_device ON public.app_error_events(device_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_error_events_fingerprint ON public.app_error_events(fingerprint);
CREATE INDEX IF NOT EXISTS idx_app_performance_metrics_route ON public.app_performance_metrics(route_path, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_performance_metrics_release ON public.app_performance_metrics(release_version, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_performance_metrics_device ON public.app_performance_metrics(device_type, breakpoint, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_device_snapshots_breakpoint ON public.app_device_snapshots(device_type, breakpoint, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_feedback_items_status ON public.support_feedback_items(status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_feedback_items_academy ON public.support_feedback_items(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_feedback_items_category ON public.support_feedback_items(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_feedback_comments_item ON public.support_feedback_comments(item_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_support_feedback_assignments_item ON public.support_feedback_assignments(item_id, active, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_incidents_started_at ON public.platform_incidents(started_at DESC, severity);
CREATE INDEX IF NOT EXISTS idx_platform_health_snapshots_component ON public.platform_health_snapshots(component, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_risk_snapshots_snapshot_at ON public.platform_risk_snapshots(snapshot_at DESC, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_model_observability_snapshots_snapshot_at ON public.model_observability_snapshots(snapshot_at DESC);

ALTER TABLE public.app_telemetry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_device_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_risk_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_observability_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_sessions_superadmin_select') THEN
    CREATE POLICY platform_sessions_superadmin_select ON public.app_telemetry_sessions
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_events_superadmin_select') THEN
    CREATE POLICY platform_events_superadmin_select ON public.app_telemetry_events
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_errors_superadmin_select') THEN
    CREATE POLICY platform_errors_superadmin_select ON public.app_error_events
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_performance_superadmin_select') THEN
    CREATE POLICY platform_performance_superadmin_select ON public.app_performance_metrics
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_devices_superadmin_select') THEN
    CREATE POLICY platform_devices_superadmin_select ON public.app_device_snapshots
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_incidents_superadmin_all') THEN
    CREATE POLICY platform_incidents_superadmin_all ON public.platform_incidents
      FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_health_superadmin_select') THEN
    CREATE POLICY platform_health_superadmin_select ON public.platform_health_snapshots
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_risk_superadmin_select') THEN
    CREATE POLICY platform_risk_superadmin_select ON public.platform_risk_snapshots
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_model_superadmin_select') THEN
    CREATE POLICY platform_model_superadmin_select ON public.model_observability_snapshots
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_select_scope') THEN
    CREATE POLICY support_feedback_select_scope ON public.support_feedback_items
      FOR SELECT USING (
        public.is_superadmin_user()
        OR reporter_user_id = auth.uid()
        OR academy_id IN (SELECT public.get_my_academy_ids())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_insert_scope') THEN
    CREATE POLICY support_feedback_insert_scope ON public.support_feedback_items
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
          public.is_superadmin_user()
          OR reporter_user_id = auth.uid()
          OR academy_id IS NULL
          OR academy_id IN (SELECT public.get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_update_superadmin') THEN
    CREATE POLICY support_feedback_update_superadmin ON public.support_feedback_items
      FOR UPDATE USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_comments_select_scope') THEN
    CREATE POLICY support_feedback_comments_select_scope ON public.support_feedback_comments
      FOR SELECT USING (
        public.is_superadmin_user()
        OR EXISTS (
          SELECT 1
          FROM public.support_feedback_items sfi
          WHERE sfi.id = support_feedback_comments.item_id
            AND (
              sfi.reporter_user_id = auth.uid()
              OR sfi.academy_id IN (SELECT public.get_my_academy_ids())
            )
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_comments_insert_scope') THEN
    CREATE POLICY support_feedback_comments_insert_scope ON public.support_feedback_comments
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
          public.is_superadmin_user()
          OR author_user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_assignments_superadmin') THEN
    CREATE POLICY support_feedback_assignments_superadmin ON public.support_feedback_assignments
      FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_tags_superadmin_read') THEN
    CREATE POLICY support_feedback_tags_superadmin_read ON public.support_feedback_tags
      FOR SELECT USING (public.is_superadmin_user());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_feedback_item_tags_superadmin') THEN
    CREATE POLICY support_feedback_item_tags_superadmin ON public.support_feedback_item_tags
      FOR ALL USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());
  END IF;
END
$$;

CREATE OR REPLACE VIEW public.platform_overview_daily_v AS
SELECT
  date_trunc('day', e.happened_at)::date AS day,
  COUNT(*) FILTER (WHERE e.event_name IN ('route_visited', 'screen_viewed')) AS access_count,
  COUNT(DISTINCT e.user_id) FILTER (WHERE e.user_id IS NOT NULL) AS active_users,
  COUNT(DISTINCT e.academy_id) FILTER (WHERE e.academy_id IS NOT NULL) AS active_tenants,
  COUNT(*) FILTER (WHERE e.event_name = 'auth_failure') AS auth_failures,
  COUNT(*) FILTER (WHERE e.event_name = 'timeout') AS timeouts,
  (
    SELECT COUNT(*)
    FROM public.app_error_events err
    WHERE date_trunc('day', err.occurred_at)::date = date_trunc('day', e.happened_at)::date
  ) AS error_count,
  (
    SELECT ROUND(AVG(pm.load_time_ms))::integer
    FROM public.app_performance_metrics pm
    WHERE date_trunc('day', pm.recorded_at)::date = date_trunc('day', e.happened_at)::date
  ) AS avg_latency_ms
FROM public.app_telemetry_events e
GROUP BY 1;

CREATE OR REPLACE VIEW public.platform_error_route_metrics_v AS
SELECT
  COALESCE(route_path, '/unknown') AS route_path,
  device_type,
  COALESCE(release_version, 'unknown') AS release_version,
  COUNT(*) AS error_count,
  COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
  COUNT(*) FILTER (WHERE error_type = 'auth_failure') AS auth_failures,
  COUNT(*) FILTER (WHERE error_type = 'timeout') AS timeout_count,
  COUNT(DISTINCT academy_id) FILTER (WHERE academy_id IS NOT NULL) AS impacted_tenants,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS impacted_users,
  MAX(occurred_at) AS last_seen_at
FROM public.app_error_events
GROUP BY 1, 2, 3;

CREATE OR REPLACE VIEW public.platform_performance_route_metrics_v AS
SELECT
  route_path,
  device_type,
  COALESCE(release_version, 'unknown') AS release_version,
  COUNT(*) AS samples,
  ROUND(AVG(load_time_ms))::integer AS avg_load_time_ms,
  ROUND(AVG(lcp_ms))::integer AS avg_lcp_ms,
  ROUND(AVG(ttfb_ms))::integer AS avg_ttfb_ms,
  ROUND(AVG(api_latency_ms))::integer AS avg_api_latency_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY load_time_ms) AS p95_load_time_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY lcp_ms) AS p95_lcp_ms
FROM public.app_performance_metrics
GROUP BY 1, 2, 3;

CREATE OR REPLACE VIEW public.platform_device_layout_metrics_v AS
SELECT
  device_type,
  breakpoint,
  COALESCE(screen_width::text, '0') || 'x' || COALESCE(screen_height::text, '0') AS resolution,
  COUNT(*) AS snapshot_count,
  ROUND(AVG(layout_risk_score)::numeric, 2) AS avg_layout_risk_score,
  COUNT(*) FILTER (WHERE layout_risk_score >= 70) AS risky_snapshots,
  MAX(captured_at) AS last_captured_at
FROM public.app_device_snapshots
GROUP BY 1, 2, 3;

CREATE OR REPLACE VIEW public.platform_health_risk_latest_v AS
WITH latest_health AS (
  SELECT DISTINCT ON (academy_id, component)
    academy_id,
    component,
    status,
    uptime_percent,
    error_rate_percent,
    latency_ms,
    consecutive_failures,
    checked_at,
    details
  FROM public.platform_health_snapshots
  ORDER BY academy_id, component, checked_at DESC
),
latest_risk AS (
  SELECT DISTINCT ON (academy_id)
    academy_id,
    overall_status,
    risk_score,
    security_score,
    ux_score,
    suspicious_logins,
    auth_failures,
    release_regression_percent,
    repeated_error_growth_percent,
    snapshot_at,
    details
  FROM public.platform_risk_snapshots
  ORDER BY academy_id, snapshot_at DESC
)
SELECT
  a.id AS academy_id,
  a.name AS academy_name,
  lr.overall_status,
  lr.risk_score,
  lr.security_score,
  lr.ux_score,
  lr.suspicious_logins,
  lr.auth_failures,
  lr.release_regression_percent,
  lr.repeated_error_growth_percent,
  lr.snapshot_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'component', lh.component,
        'status', lh.status,
        'uptime_percent', lh.uptime_percent,
        'error_rate_percent', lh.error_rate_percent,
        'latency_ms', lh.latency_ms,
        'consecutive_failures', lh.consecutive_failures,
        'checked_at', lh.checked_at,
        'details', lh.details
      )
      ORDER BY lh.component
    ) FILTER (WHERE lh.component IS NOT NULL),
    '[]'::jsonb
  ) AS components
FROM public.academies a
LEFT JOIN latest_risk lr ON lr.academy_id = a.id
LEFT JOIN latest_health lh ON lh.academy_id = a.id
GROUP BY
  a.id,
  a.name,
  lr.overall_status,
  lr.risk_score,
  lr.security_score,
  lr.ux_score,
  lr.suspicious_logins,
  lr.auth_failures,
  lr.release_regression_percent,
  lr.repeated_error_growth_percent,
  lr.snapshot_at;

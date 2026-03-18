-- ═══════════════════════════════════════════════════════
-- 023 — Telemetry + Support Tickets
-- ═══════════════════════════════════════════════════════

-- Sessões de telemetria
CREATE TABLE IF NOT EXISTS telemetry_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID,
  role VARCHAR(30),
  academy_id UUID,

  -- Dispositivo
  device_type VARCHAR(10),
  device_model VARCHAR(100),
  device_vendor VARCHAR(50),
  os VARCHAR(50),
  os_version VARCHAR(20),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  screen_width INTEGER,
  screen_height INTEGER,
  pixel_ratio DECIMAL(3,1),
  touchscreen BOOLEAN DEFAULT false,
  connection_type VARCHAR(20),
  connection_speed VARCHAR(10),
  is_pwa BOOLEAN DEFAULT false,

  -- Localização
  locale VARCHAR(10),
  timezone VARCHAR(50),

  -- Sessão
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Métricas agregadas
  total_page_views INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  total_js_errors INTEGER DEFAULT 0,
  total_api_errors INTEGER DEFAULT 0,
  pages_visited TEXT[] DEFAULT '{}',
  slow_pages TEXT[] DEFAULT '{}',

  -- Performance média
  avg_lcp DECIMAL(8,2),
  avg_fcp DECIMAL(8,2),
  avg_cls DECIMAL(6,4),
  avg_fid DECIMAL(8,2),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Eventos individuais
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id UUID,

  event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
    'page_load', 'js_error', 'api_error', 'network_error',
    'slow_page', 'crash', 'action', 'navigation'
  )),

  page VARCHAR(200),
  data JSONB NOT NULL DEFAULT '{}',
  severity VARCHAR(10) DEFAULT 'info' CHECK (severity IN ('info','warning','error','critical')),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  academy_id UUID,
  session_id VARCHAR(50),

  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN (
    'bug', 'feature_request', 'billing', 'performance',
    'access', 'data', 'other'
  )),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting','resolved','closed')),

  device_info JSONB,
  page_url VARCHAR(200),
  screenshot_url TEXT,
  console_logs TEXT[],

  assigned_to VARCHAR(100),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,

  messages JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_telemetry_sessions_user ON telemetry_sessions(user_id);
CREATE INDEX idx_telemetry_sessions_academy ON telemetry_sessions(academy_id);
CREATE INDEX idx_telemetry_sessions_active ON telemetry_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_telemetry_sessions_started ON telemetry_sessions(started_at DESC);
CREATE INDEX idx_telemetry_events_session ON telemetry_events(session_id);
CREATE INDEX idx_telemetry_events_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_events_severity ON telemetry_events(severity);
CREATE INDEX idx_telemetry_events_created ON telemetry_events(created_at DESC);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);

-- RLS
ALTER TABLE telemetry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "telemetry_sessions_own" ON telemetry_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "telemetry_sessions_insert" ON telemetry_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "telemetry_sessions_update" ON telemetry_sessions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "telemetry_events_insert" ON telemetry_events FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "telemetry_events_own" ON telemetry_events FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "support_tickets_own" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "support_tickets_update" ON support_tickets FOR UPDATE USING (user_id = auth.uid());

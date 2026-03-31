DO $$
DECLARE
  v_owner_user_id uuid;
  v_superadmin_pid uuid;
  v_admin_pid uuid;
  v_prof1_pid uuid;
  v_academy_core uuid;
  v_academy_risk uuid;
  v_academy_scale uuid;
  v_academy_tablet uuid;
  v_academy_tv uuid;
BEGIN
  SELECT owner_id
  INTO v_owner_user_id
  FROM public.academies
  WHERE owner_id IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;

  SELECT id
  INTO v_superadmin_pid
  FROM public.profiles
  WHERE role = 'superadmin'
  ORDER BY created_at ASC
  LIMIT 1;

  SELECT id
  INTO v_admin_pid
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  SELECT id
  INTO v_prof1_pid
  FROM public.profiles
  WHERE role = 'professor'
  ORDER BY created_at ASC
  LIMIT 1;

  SELECT id
  INTO v_academy_core
  FROM public.academies
  ORDER BY created_at ASC
  LIMIT 1;

  v_academy_risk := COALESCE(
    (SELECT id FROM public.academies WHERE slug = 'lotus-combat-club' LIMIT 1),
    'c0000000-0000-0000-0000-000000000101'::uuid
  );
  v_academy_scale := COALESCE(
    (SELECT id FROM public.academies WHERE slug = 'alpha-enterprise-dojo' LIMIT 1),
    'c0000000-0000-0000-0000-000000000102'::uuid
  );
  v_academy_tablet := COALESCE(
    (SELECT id FROM public.academies WHERE slug = 'tablet-ops-academy' LIMIT 1),
    'c0000000-0000-0000-0000-000000000103'::uuid
  );
  v_academy_tv := COALESCE(
    (SELECT id FROM public.academies WHERE slug = 'arena-screens-hq' LIMIT 1),
    'c0000000-0000-0000-0000-000000000104'::uuid
  );

  IF v_owner_user_id IS NULL OR v_superadmin_pid IS NULL OR v_admin_pid IS NULL OR v_prof1_pid IS NULL OR v_academy_core IS NULL THEN
    RAISE EXCEPTION 'Platform Central seed requires at least one academy owner, one superadmin, one admin, one professor, and one academy in the active database.';
  END IF;

  INSERT INTO public.academies (id, name, slug, owner_id, status)
  VALUES
    (v_academy_risk, 'Lotus Combat Club', 'lotus-combat-club', v_owner_user_id, 'active'),
    (v_academy_scale, 'Alpha Enterprise Dojo', 'alpha-enterprise-dojo', v_owner_user_id, 'active'),
    (v_academy_tablet, 'Tablet Ops Academy', 'tablet-ops-academy', v_owner_user_id, 'active'),
    (v_academy_tv, 'Arena Screens HQ', 'arena-screens-hq', v_owner_user_id, 'active')
  ON CONFLICT (slug) DO NOTHING;

  DELETE FROM public.support_feedback_comments
  WHERE item_id IN (
    SELECT id FROM public.support_feedback_items WHERE origin = 'seed'
  );
  DELETE FROM public.support_feedback_assignments
  WHERE item_id IN (
    SELECT id FROM public.support_feedback_items WHERE origin = 'seed'
  );
  DELETE FROM public.support_feedback_item_tags
  WHERE item_id IN (
    SELECT id FROM public.support_feedback_items WHERE origin = 'seed'
  );
  DELETE FROM public.support_feedback_items WHERE origin = 'seed';
  DELETE FROM public.platform_incidents WHERE metadata ->> 'seed_tag' = 'platform_central_seed';
  DELETE FROM public.platform_health_snapshots WHERE details ->> 'seed_tag' = 'platform_central_seed';
  DELETE FROM public.platform_risk_snapshots WHERE details ->> 'seed_tag' = 'platform_central_seed';
  DELETE FROM public.model_observability_snapshots WHERE details ->> 'seed_tag' = 'platform_central_seed';
  DELETE FROM public.app_device_snapshots WHERE origin = 'seed';
  DELETE FROM public.app_performance_metrics WHERE origin = 'seed';
  DELETE FROM public.app_error_events WHERE origin = 'seed';
  DELETE FROM public.app_telemetry_events WHERE origin = 'seed';
  DELETE FROM public.app_telemetry_sessions WHERE origin = 'seed';

  INSERT INTO public.support_feedback_tags (slug, label, color)
  VALUES
    ('ux', 'UX', '#f59e0b'),
    ('performance', 'Performance', '#ef4444'),
    ('tablet', 'Tablet', '#3b82f6'),
    ('tv', 'TV', '#a855f7'),
    ('security', 'Security', '#ef4444')
  ON CONFLICT (slug) DO UPDATE
    SET label = EXCLUDED.label,
        color = EXCLUDED.color;

  INSERT INTO public.app_telemetry_sessions (
    session_key,
    academy_id,
    profile_id,
    origin,
    device_type,
    device_model,
    device_vendor,
    os_name,
    os_version,
    browser_name,
    browser_version,
    screen_width,
    screen_height,
    viewport_width,
    viewport_height,
    pixel_ratio,
    connection_effective_type,
    locale,
    timezone,
    app_version,
    release_version,
    current_route,
    started_at,
    last_seen_at,
    duration_seconds,
    pages_viewed,
    total_events,
    is_active,
    metadata
  )
  SELECT
    'platform-seed-session-' || gs,
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE
      WHEN gs % 7 = 0 THEN v_prof1_pid
      WHEN gs % 3 = 0 THEN v_admin_pid
      ELSE v_superadmin_pid
    END,
    'seed',
    CASE
      WHEN gs % 11 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 5 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'Samsung Smart TV'
      WHEN gs % 5 = 0 THEN 'iPad 10'
      WHEN gs % 2 = 0 THEN 'Galaxy A54'
      ELSE 'MacBook Pro'
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'Samsung'
      WHEN gs % 5 = 0 THEN 'Apple'
      WHEN gs % 2 = 0 THEN 'Samsung'
      ELSE 'Apple'
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'Tizen'
      WHEN gs % 2 = 0 THEN 'Android'
      ELSE 'macOS'
    END,
    CASE WHEN gs % 11 = 0 THEN '7' WHEN gs % 2 = 0 THEN '14' ELSE '14.4' END,
    CASE WHEN gs % 2 = 0 THEN 'Chrome' ELSE 'Safari' END,
    CASE WHEN gs % 2 = 0 THEN '123' ELSE '17' END,
    CASE WHEN gs % 11 = 0 THEN 3840 WHEN gs % 5 = 0 THEN 2048 WHEN gs % 2 = 0 THEN 1080 ELSE 1728 END,
    CASE WHEN gs % 11 = 0 THEN 2160 WHEN gs % 5 = 0 THEN 1536 WHEN gs % 2 = 0 THEN 2400 ELSE 1117 END,
    CASE WHEN gs % 11 = 0 THEN 1920 WHEN gs % 5 = 0 THEN 1024 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 11 = 0 THEN 1080 WHEN gs % 5 = 0 THEN 768 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    CASE WHEN gs % 11 = 0 THEN 1 WHEN gs % 2 = 0 THEN 3 ELSE 2 END,
    CASE WHEN gs % 4 = 0 THEN '3g' ELSE '4g' END,
    'pt-BR',
    'America/Sao_Paulo',
    '2.4.0',
    CASE WHEN gs % 6 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    CASE
      WHEN gs % 9 = 0 THEN '/dashboard/financeiro'
      WHEN gs % 7 = 0 THEN '/dashboard/checkout'
      WHEN gs % 5 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 4 = 0 THEN '/dashboard/agenda'
      ELSE '/dashboard'
    END,
    now() - ((gs % 30) || ' days')::interval - ((gs % 10) || ' hours')::interval,
    now() - ((gs % 28) || ' days')::interval,
    900 + (gs % 3600),
    5 + (gs % 17),
    30 + (gs % 90),
    gs > 300,
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM generate_series(1, 320) gs;

  INSERT INTO public.app_telemetry_events (
    session_key,
    academy_id,
    profile_id,
    origin,
    event_name,
    route_path,
    screen_name,
    device_type,
    viewport_width,
    viewport_height,
    app_version,
    release_version,
    duration_ms,
    metadata,
    happened_at
  )
  SELECT
    'platform-seed-session-' || ((gs % 320) + 1),
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE
      WHEN gs % 7 = 0 THEN v_prof1_pid
      WHEN gs % 3 = 0 THEN v_admin_pid
      ELSE v_superadmin_pid
    END,
    'seed',
    CASE
      WHEN gs % 37 = 0 THEN 'auth_failure'
      WHEN gs % 29 = 0 THEN 'timeout'
      WHEN gs % 2 = 0 THEN 'screen_viewed'
      ELSE 'route_visited'
    END,
    CASE
      WHEN gs % 13 = 0 THEN '/dashboard/checkout'
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 7 = 0 THEN '/dashboard/financeiro'
      WHEN gs % 5 = 0 THEN '/dashboard/agenda'
      ELSE '/dashboard'
    END,
    CASE
      WHEN gs % 13 = 0 THEN 'checkout'
      WHEN gs % 11 = 0 THEN 'tv-wall'
      WHEN gs % 7 = 0 THEN 'financeiro'
      WHEN gs % 5 = 0 THEN 'agenda'
      ELSE 'dashboard'
    END,
    CASE
      WHEN gs % 17 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 5 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE WHEN gs % 17 = 0 THEN 1920 WHEN gs % 5 = 0 THEN 1024 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 17 = 0 THEN 1080 WHEN gs % 5 = 0 THEN 768 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    '2.4.0',
    CASE WHEN gs % 6 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    CASE
      WHEN gs % 29 = 0 THEN 8200
      WHEN gs % 11 = 0 THEN 5600
      WHEN gs % 5 = 0 THEN 1900
      ELSE 420
    END,
    jsonb_build_object('seed_tag', 'platform_central_seed'),
    now() - ((gs % 30) || ' days')::interval - ((gs % 1440) || ' minutes')::interval
  FROM generate_series(1, 20000) gs;

  INSERT INTO public.app_error_events (
    session_key,
    academy_id,
    profile_id,
    origin,
    severity,
    error_type,
    error_code,
    message,
    route_path,
    device_type,
    viewport_width,
    viewport_height,
    os_name,
    browser_name,
    app_version,
    release_version,
    occurred_at,
    fingerprint,
    metadata
  )
  SELECT
    'platform-seed-session-' || ((gs % 320) + 1),
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE WHEN gs % 2 = 0 THEN v_admin_pid ELSE v_prof1_pid END,
    'seed',
    CASE WHEN gs % 13 = 0 THEN 'critical'::public.platform_severity WHEN gs % 3 = 0 THEN 'high'::public.platform_severity ELSE 'medium'::public.platform_severity END,
    CASE WHEN gs % 7 = 0 THEN 'auth_failure' WHEN gs % 5 = 0 THEN 'timeout' ELSE 'api_failure' END,
    CASE WHEN gs % 7 = 0 THEN 'AUTH' WHEN gs % 5 = 0 THEN 'TIMEOUT' ELSE 'HTTP_500' END,
    CASE
      WHEN gs % 7 = 0 THEN 'Falha repetida de login'
      WHEN gs % 5 = 0 THEN 'Timeout ao carregar tela'
      ELSE 'Erro inesperado na API'
    END,
    CASE
      WHEN gs % 13 = 0 THEN '/dashboard/checkout'
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 5 = 0 THEN '/dashboard/agenda'
      ELSE '/dashboard/financeiro'
    END,
    CASE
      WHEN gs % 13 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 11 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE WHEN gs % 13 = 0 THEN 1024 WHEN gs % 11 = 0 THEN 1920 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 13 = 0 THEN 768 WHEN gs % 11 = 0 THEN 1080 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    CASE WHEN gs % 2 = 0 THEN 'Android' ELSE 'macOS' END,
    CASE WHEN gs % 2 = 0 THEN 'Chrome' ELSE 'Safari' END,
    '2.4.0',
    CASE WHEN gs % 4 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    now() - ((gs % 30) || ' days')::interval - ((gs % 720) || ' minutes')::interval,
    'seed-error-' || gs,
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM generate_series(1, 360) gs;

  INSERT INTO public.app_performance_metrics (
    session_key,
    academy_id,
    profile_id,
    origin,
    route_path,
    screen_name,
    device_type,
    viewport_width,
    viewport_height,
    app_version,
    release_version,
    load_time_ms,
    ttfb_ms,
    fcp_ms,
    lcp_ms,
    cls,
    fid_ms,
    inp_ms,
    api_latency_ms,
    render_duration_ms,
    recorded_at,
    metadata
  )
  SELECT
    'platform-seed-session-' || ((gs % 320) + 1),
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE WHEN gs % 2 = 0 THEN v_admin_pid ELSE v_prof1_pid END,
    'seed',
    CASE
      WHEN gs % 13 = 0 THEN '/dashboard/checkout'
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 5 = 0 THEN '/dashboard/agenda'
      ELSE '/dashboard/financeiro'
    END,
    'screen',
    CASE
      WHEN gs % 11 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 5 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE WHEN gs % 11 = 0 THEN 1920 WHEN gs % 5 = 0 THEN 1024 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 11 = 0 THEN 1080 WHEN gs % 5 = 0 THEN 768 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    '2.4.0',
    CASE WHEN gs % 4 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    CASE
      WHEN gs % 11 = 0 THEN 5200
      WHEN gs % 13 = 0 THEN 4300
      WHEN gs % 5 = 0 THEN 2800
      ELSE 1100 + (gs % 900)
    END,
    120 + (gs % 600),
    300 + (gs % 900),
    CASE
      WHEN gs % 11 = 0 THEN 4900
      WHEN gs % 13 = 0 THEN 4100
      WHEN gs % 5 = 0 THEN 2500
      ELSE 1200 + (gs % 1200)
    END,
    CASE WHEN gs % 11 = 0 THEN 0.34 WHEN gs % 5 = 0 THEN 0.18 ELSE 0.05 END,
    40 + (gs % 120),
    80 + (gs % 200),
    220 + (gs % 900),
    240 + (gs % 1200),
    now() - ((gs % 30) || ' days')::interval - ((gs % 1440) || ' minutes')::interval,
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM generate_series(1, 1800) gs;

  INSERT INTO public.app_device_snapshots (
    session_key,
    academy_id,
    profile_id,
    origin,
    route_path,
    device_type,
    device_model,
    device_vendor,
    os_name,
    os_version,
    browser_name,
    browser_version,
    screen_width,
    screen_height,
    viewport_width,
    viewport_height,
    pixel_ratio,
    orientation,
    layout_risk_score,
    layout_risk_reason,
    release_version,
    captured_at,
    metadata
  )
  SELECT
    'platform-seed-session-' || ((gs % 320) + 1),
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE WHEN gs % 2 = 0 THEN v_admin_pid ELSE v_prof1_pid END,
    'seed',
    CASE
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 5 = 0 THEN '/dashboard/agenda'
      ELSE '/dashboard/checkout'
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 5 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE WHEN gs % 11 = 0 THEN 'Samsung Smart TV' WHEN gs % 5 = 0 THEN 'iPad 10' WHEN gs % 2 = 0 THEN 'Galaxy A54' ELSE 'MacBook Pro' END,
    CASE WHEN gs % 11 = 0 THEN 'Samsung' WHEN gs % 5 = 0 THEN 'Apple' ELSE 'Apple' END,
    CASE WHEN gs % 11 = 0 THEN 'Tizen' WHEN gs % 2 = 0 THEN 'Android' ELSE 'macOS' END,
    CASE WHEN gs % 11 = 0 THEN '7' WHEN gs % 2 = 0 THEN '14' ELSE '14.4' END,
    CASE WHEN gs % 2 = 0 THEN 'Chrome' ELSE 'Safari' END,
    CASE WHEN gs % 2 = 0 THEN '123' ELSE '17' END,
    CASE WHEN gs % 11 = 0 THEN 3840 WHEN gs % 5 = 0 THEN 2048 WHEN gs % 2 = 0 THEN 1080 ELSE 1728 END,
    CASE WHEN gs % 11 = 0 THEN 2160 WHEN gs % 5 = 0 THEN 1536 WHEN gs % 2 = 0 THEN 2400 ELSE 1117 END,
    CASE WHEN gs % 11 = 0 THEN 1920 WHEN gs % 5 = 0 THEN 1024 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 11 = 0 THEN 1080 WHEN gs % 5 = 0 THEN 768 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    CASE WHEN gs % 11 = 0 THEN 1 WHEN gs % 2 = 0 THEN 3 ELSE 2 END,
    CASE WHEN gs % 11 = 0 THEN 'landscape' ELSE 'portrait' END,
    CASE WHEN gs % 11 = 0 THEN 82 WHEN gs % 5 = 0 THEN 68 WHEN gs % 2 = 0 THEN 24 ELSE 15 END,
    CASE WHEN gs % 11 = 0 THEN 'TV wall clipping' WHEN gs % 5 = 0 THEN 'Tablet landscape overflow' ELSE NULL END,
    CASE WHEN gs % 4 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    now() - ((gs % 30) || ' days')::interval - ((gs % 1440) || ' minutes')::interval,
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM generate_series(1, 800) gs;

  INSERT INTO public.support_feedback_items (
    academy_id,
    reporter_profile_id,
    category,
    severity,
    status,
    origin,
    title,
    description,
    route_path,
    source_page,
    device_type,
    viewport_width,
    viewport_height,
    browser_name,
    os_name,
    app_version,
    release_version,
    first_response_at,
    resolved_at,
    last_activity_at,
    metadata
  )
  SELECT
    CASE
      WHEN gs % 5 = 0 THEN v_academy_tv
      WHEN gs % 4 = 0 THEN v_academy_tablet
      WHEN gs % 3 = 0 THEN v_academy_scale
      WHEN gs % 2 = 0 THEN v_academy_risk
      ELSE v_academy_core
    END,
    CASE WHEN gs % 2 = 0 THEN v_admin_pid ELSE v_prof1_pid END,
    CASE
      WHEN gs % 7 = 0 THEN 'complaint'::public.support_feedback_category
      WHEN gs % 5 = 0 THEN 'suggestion'::public.support_feedback_category
      WHEN gs % 3 = 0 THEN 'bug'::public.support_feedback_category
      ELSE 'feedback'::public.support_feedback_category
    END,
    CASE
      WHEN gs % 9 = 0 THEN 'critical'::public.platform_severity
      WHEN gs % 3 = 0 THEN 'high'::public.platform_severity
      ELSE 'medium'::public.platform_severity
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'resolved'::public.platform_status
      WHEN gs % 7 = 0 THEN 'in_progress'::public.platform_status
      WHEN gs % 5 = 0 THEN 'triaged'::public.platform_status
      ELSE 'new'::public.platform_status
    END,
    'seed',
    CASE
      WHEN gs % 11 = 0 THEN 'TV wall sem contraste'
      WHEN gs % 7 = 0 THEN 'Checkout travando em tablet'
      WHEN gs % 5 = 0 THEN 'Sugestão recorrente de filtros fortes'
      ELSE 'Feedback operacional da equipe'
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'Tela de TV corta badges e gráficos no painel principal.'
      WHEN gs % 7 = 0 THEN 'Tablet em landscape perde o CTA final do checkout.'
      WHEN gs % 5 = 0 THEN 'Time quer filtros por tenant, categoria e release na central.'
      ELSE 'Solicitação operacional recebida durante rotina do Super Admin.'
    END,
    CASE
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 7 = 0 THEN '/dashboard/checkout'
      WHEN gs % 5 = 0 THEN '/superadmin/suporte'
      ELSE '/dashboard'
    END,
    CASE
      WHEN gs % 11 = 0 THEN '/dashboard/tv-wall'
      WHEN gs % 7 = 0 THEN '/dashboard/checkout'
      WHEN gs % 5 = 0 THEN '/superadmin/suporte'
      ELSE '/dashboard'
    END,
    CASE
      WHEN gs % 11 = 0 THEN 'tv'::public.platform_device_type
      WHEN gs % 7 = 0 THEN 'tablet'::public.platform_device_type
      WHEN gs % 2 = 0 THEN 'mobile'::public.platform_device_type
      ELSE 'desktop'::public.platform_device_type
    END,
    CASE WHEN gs % 11 = 0 THEN 1920 WHEN gs % 7 = 0 THEN 1024 WHEN gs % 2 = 0 THEN 390 ELSE 1440 END,
    CASE WHEN gs % 11 = 0 THEN 1080 WHEN gs % 7 = 0 THEN 768 WHEN gs % 2 = 0 THEN 844 ELSE 900 END,
    CASE WHEN gs % 2 = 0 THEN 'Chrome' ELSE 'Safari' END,
    CASE WHEN gs % 2 = 0 THEN 'Android' ELSE 'macOS' END,
    '2.4.0',
    CASE WHEN gs % 4 = 0 THEN '2026.03.15' ELSE '2026.03.31' END,
    now() - ((gs % 20) || ' days')::interval,
    CASE WHEN gs % 11 = 0 THEN now() - ((gs % 10) || ' days')::interval ELSE NULL END,
    now() - ((gs % 6) || ' hours')::interval,
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM generate_series(1, 36) gs;

  INSERT INTO public.support_feedback_assignments (item_id, assigned_profile_id, assigned_by_profile_id, active)
  SELECT id, v_superadmin_pid, v_superadmin_pid, true
  FROM public.support_feedback_items
  WHERE origin = 'seed'
    AND status IN ('triaged', 'in_progress', 'resolved');

  INSERT INTO public.support_feedback_item_tags (item_id, tag_id)
  SELECT sfi.id, sft.id
  FROM public.support_feedback_items sfi
  JOIN public.support_feedback_tags sft
    ON (
      (sfi.route_path = '/dashboard/tv-wall' AND sft.slug = 'tv')
      OR (sfi.device_type = 'tablet' AND sft.slug = 'tablet')
      OR (sfi.category = 'bug' AND sft.slug = 'performance')
      OR (sfi.category = 'feedback' AND sft.slug = 'ux')
    )
  WHERE sfi.origin = 'seed'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.support_feedback_comments (item_id, author_profile_id, is_internal, body)
  SELECT id, v_superadmin_pid, true, 'Triagem inicial registrada na Central da Plataforma.'
  FROM public.support_feedback_items
  WHERE origin = 'seed'
    AND status IN ('triaged', 'in_progress', 'resolved')
  LIMIT 20;

  INSERT INTO public.platform_incidents (
    academy_id,
    incident_type,
    severity,
    status,
    title,
    summary,
    route_path,
    device_type,
    release_version,
    started_at,
    metadata
  )
  VALUES
    (v_academy_tablet, 'performance', 'high', 'in_progress', 'Checkout degradado em tablet', 'Latência acima de 4s em fluxo de checkout.', '/dashboard/checkout', 'tablet', '2026.03.31', now() - interval '2 days', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_tv, 'ux', 'critical', 'new', 'TV wall com clipping visual', 'KPIs e badges extrapolam a largura em telas grandes.', '/dashboard/tv-wall', 'tv', '2026.03.31', now() - interval '1 day', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_risk, 'security', 'high', 'new', 'Falhas repetidas de autenticação', 'Pico de auth failure após último release.', '/dashboard', 'desktop', '2026.03.15', now() - interval '3 days', jsonb_build_object('seed_tag', 'platform_central_seed'));

  INSERT INTO public.platform_health_snapshots (
    academy_id,
    component,
    status,
    uptime_percent,
    error_rate_percent,
    latency_ms,
    consecutive_failures,
    release_version,
    environment,
    checked_at,
    details
  )
  SELECT
    academy_id,
    component,
    status,
    uptime,
    error_rate,
    latency,
    failures,
    '2026.03.31',
    'local',
    now() - interval '30 minutes',
    jsonb_build_object('seed_tag', 'platform_central_seed')
  FROM (
    VALUES
      (v_academy_core, 'api'::public.platform_health_component_type, 'healthy'::public.platform_signal_status, 99.96, 0.8, 420, 0),
      (v_academy_core, 'database'::public.platform_health_component_type, 'healthy'::public.platform_signal_status, 99.99, 0.2, 110, 0),
      (v_academy_risk, 'auth'::public.platform_health_component_type, 'warning'::public.platform_signal_status, 98.80, 4.6, 980, 2),
      (v_academy_risk, 'api'::public.platform_health_component_type, 'warning'::public.platform_signal_status, 98.40, 5.1, 1280, 2),
      (v_academy_scale, 'jobs'::public.platform_health_component_type, 'healthy'::public.platform_signal_status, 99.91, 0.5, 180, 0),
      (v_academy_tablet, 'frontend'::public.platform_health_component_type, 'warning'::public.platform_signal_status, 99.20, 2.8, 1620, 1),
      (v_academy_tv, 'frontend'::public.platform_health_component_type, 'critical'::public.platform_signal_status, 97.10, 8.6, 2510, 3),
      (v_academy_tv, 'storage'::public.platform_health_component_type, 'healthy'::public.platform_signal_status, 99.95, 0.3, 220, 0)
  ) AS health(academy_id, component, status, uptime, error_rate, latency, failures);

  INSERT INTO public.platform_risk_snapshots (
    academy_id,
    overall_status,
    risk_score,
    security_score,
    ux_score,
    suspicious_logins,
    auth_failures,
    release_regression_percent,
    repeated_error_growth_percent,
    notes,
    snapshot_at,
    details
  )
  VALUES
    (v_academy_core, 'healthy', 22, 87, 84, 1, 2, 4.5, 3.2, 'Tenant saudável.', now() - interval '20 minutes', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_risk, 'critical', 78, 58, 61, 14, 28, 32.0, 44.0, 'Falhas repetidas pós-release.', now() - interval '20 minutes', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_scale, 'healthy', 28, 90, 82, 0, 1, 6.0, 5.0, 'Tenant enterprise estável.', now() - interval '20 minutes', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_tablet, 'warning', 54, 74, 57, 3, 8, 14.0, 17.0, 'Risco visual e performance em tablet.', now() - interval '20 minutes', jsonb_build_object('seed_tag', 'platform_central_seed')),
    (v_academy_tv, 'critical', 72, 80, 41, 0, 4, 22.0, 29.0, 'Problemas em telas grandes.', now() - interval '20 minutes', jsonb_build_object('seed_tag', 'platform_central_seed'));

  INSERT INTO public.model_observability_snapshots (
    academy_id,
    provider,
    model,
    model_version,
    status,
    feature_name,
    request_count,
    error_count,
    timeout_count,
    avg_latency_ms,
    p95_latency_ms,
    estimated_cost,
    snapshot_at,
    details
  )
  VALUES
    (NULL, NULL, NULL, NULL, 'not_configured', NULL, 0, 0, 0, NULL, NULL, NULL, now() - interval '15 minutes', jsonb_build_object('seed_tag', 'platform_central_seed'));

  RAISE NOTICE 'Seed Platform Central: 320 sessoes, 20000 eventos, 360 erros, 1800 metricas, 800 snapshots, 36 feedbacks.';
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- BlackBelt v2 — Seed Data Completo
-- Dados realistas brasileiros cobrindo todos os 9 perfis
-- ═══════════════════════════════════════════════════════════════════
--
-- Perfis cobertos:
-- 1. Super Admin
-- 2. Admin (dono da academia)
-- 3. Professor 1, Professor 2
-- 4. Recepcionista
-- 5. Aluno Adulto 1, 2, 3
-- 6. Aluno Teen 1, 2
-- 7. Aluno Kids 1, 2
-- 8. Responsavel 1 (pai do Kids 1), Responsavel 2 (mae do Kids 2)
-- 9. Franqueador
--
-- NOTA: Este seed usa UUIDs fixos para permitir referências cruzadas.
-- Em produção, use o fluxo de onboarding.
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 0. Limpar dados existentes (dev only)
-- ─────────────────────────────────────────────────────────────────

-- We do NOT truncate auth.users since we cannot manage that here.
-- This seed is designed to be run AFTER auth users are created via
-- Supabase Dashboard or auth API. The UUIDs below must match.

-- ─────────────────────────────────────────────────────────────────
-- 1. Fixed UUIDs (auth.users IDs — must be created in Supabase Auth)
-- ─────────────────────────────────────────────────────────────────
-- These are deterministic UUIDs for seeding. In a real environment,
-- create auth users first, then update these IDs.

DO $$
DECLARE
  -- Auth user IDs (simulate — in real env, create in auth.users first)
  v_superadmin_uid uuid := 'a0000000-0000-0000-0000-000000000001';
  v_admin_uid uuid := 'a0000000-0000-0000-0000-000000000002';
  v_prof1_uid uuid := 'a0000000-0000-0000-0000-000000000003';
  v_prof2_uid uuid := 'a0000000-0000-0000-0000-000000000004';
  v_recep_uid uuid := 'a0000000-0000-0000-0000-000000000005';
  v_adulto1_uid uuid := 'a0000000-0000-0000-0000-000000000006';
  v_adulto2_uid uuid := 'a0000000-0000-0000-0000-000000000007';
  v_adulto3_uid uuid := 'a0000000-0000-0000-0000-000000000008';
  v_teen1_uid uuid := 'a0000000-0000-0000-0000-000000000009';
  v_teen2_uid uuid := 'a0000000-0000-0000-0000-000000000010';
  v_kids1_uid uuid := 'a0000000-0000-0000-0000-000000000011';
  v_kids2_uid uuid := 'a0000000-0000-0000-0000-000000000012';
  v_resp1_uid uuid := 'a0000000-0000-0000-0000-000000000013';
  v_resp2_uid uuid := 'a0000000-0000-0000-0000-000000000014';
  v_franq_uid uuid := 'a0000000-0000-0000-0000-000000000015';

  -- Profile IDs
  v_superadmin_pid uuid := 'b0000000-0000-0000-0000-000000000001';
  v_admin_pid uuid := 'b0000000-0000-0000-0000-000000000002';
  v_prof1_pid uuid := 'b0000000-0000-0000-0000-000000000003';
  v_prof2_pid uuid := 'b0000000-0000-0000-0000-000000000004';
  v_recep_pid uuid := 'b0000000-0000-0000-0000-000000000005';
  v_adulto1_pid uuid := 'b0000000-0000-0000-0000-000000000006';
  v_adulto2_pid uuid := 'b0000000-0000-0000-0000-000000000007';
  v_adulto3_pid uuid := 'b0000000-0000-0000-0000-000000000008';
  v_teen1_pid uuid := 'b0000000-0000-0000-0000-000000000009';
  v_teen2_pid uuid := 'b0000000-0000-0000-0000-000000000010';
  v_kids1_pid uuid := 'b0000000-0000-0000-0000-000000000011';
  v_kids2_pid uuid := 'b0000000-0000-0000-0000-000000000012';
  v_resp1_pid uuid := 'b0000000-0000-0000-0000-000000000013';
  v_resp2_pid uuid := 'b0000000-0000-0000-0000-000000000014';
  v_franq_pid uuid := 'b0000000-0000-0000-0000-000000000015';

  -- Academy & Unit
  v_academy_id uuid := 'c0000000-0000-0000-0000-000000000001';
  v_unit_id uuid := 'c0000000-0000-0000-0000-000000000002';

  -- Plans
  v_plan_mensal uuid := 'c0000000-0000-0000-0000-000000000010';
  v_plan_trimestral uuid := 'c0000000-0000-0000-0000-000000000011';
  v_plan_anual uuid := 'c0000000-0000-0000-0000-000000000012';

  -- Modalities
  v_mod_bjj uuid := 'c0000000-0000-0000-0000-000000000020';
  v_mod_muay uuid := 'c0000000-0000-0000-0000-000000000021';

  -- Classes
  v_class_bjj_manha uuid := 'c0000000-0000-0000-0000-000000000030';
  v_class_bjj_noite uuid := 'c0000000-0000-0000-0000-000000000031';
  v_class_muay_noite uuid := 'c0000000-0000-0000-0000-000000000032';
  v_class_kids uuid := 'c0000000-0000-0000-0000-000000000033';

  -- Students
  v_student_adulto1 uuid := 'd0000000-0000-0000-0000-000000000001';
  v_student_adulto2 uuid := 'd0000000-0000-0000-0000-000000000002';
  v_student_adulto3 uuid := 'd0000000-0000-0000-0000-000000000003';
  v_student_teen1 uuid := 'd0000000-0000-0000-0000-000000000004';
  v_student_teen2 uuid := 'd0000000-0000-0000-0000-000000000005';
  v_student_kids1 uuid := 'd0000000-0000-0000-0000-000000000006';
  v_student_kids2 uuid := 'd0000000-0000-0000-0000-000000000007';

BEGIN
  -- ─────────────────────────────────────────────────────────────
  -- 2. Profiles
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.profiles (id, user_id, role, display_name, avatar) VALUES
    (v_superadmin_pid, v_superadmin_uid, 'admin', 'Carlos Eduardo Silva', NULL),
    (v_admin_pid, v_admin_uid, 'admin', 'Roberto Machado', NULL),
    (v_prof1_pid, v_prof1_uid, 'professor', 'Fernando Oliveira', NULL),
    (v_prof2_pid, v_prof2_uid, 'professor', 'Ana Beatriz Santos', NULL),
    (v_recep_pid, v_recep_uid, 'admin', 'Juliana Costa', NULL),
    (v_adulto1_pid, v_adulto1_uid, 'aluno_adulto', 'Marcos Vinícius Pereira', NULL),
    (v_adulto2_pid, v_adulto2_uid, 'aluno_adulto', 'Thiago Rodrigues', NULL),
    (v_adulto3_pid, v_adulto3_uid, 'aluno_adulto', 'Camila Ferreira', NULL),
    (v_teen1_pid, v_teen1_uid, 'aluno_teen', 'Pedro Henrique Lima', NULL),
    (v_teen2_pid, v_teen2_uid, 'aluno_teen', 'Isabela Souza', NULL),
    (v_kids1_pid, v_kids1_uid, 'aluno_kids', 'Lucas Gabriel Martins', NULL),
    (v_kids2_pid, v_kids2_uid, 'aluno_kids', 'Sofia Almeida', NULL),
    (v_resp1_pid, v_resp1_uid, 'responsavel', 'Ricardo Martins', NULL),
    (v_resp2_pid, v_resp2_uid, 'responsavel', 'Patricia Almeida', NULL),
    (v_franq_pid, v_franq_uid, 'admin', 'João Marcos Ribeiro', NULL)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 3. Academy
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.academies (id, name, slug, owner_id) VALUES
    (v_academy_id, 'Academia BlackBelt Centro', 'blackbelt-centro', v_admin_uid)
  ON CONFLICT (slug) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 4. Unit
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.units (id, academy_id, name, address) VALUES
    (v_unit_id, v_academy_id, 'Unidade Centro', 'Rua Augusta, 1200 - Consolação, São Paulo - SP')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 5. Memberships (all members linked to the academy)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.memberships (profile_id, academy_id, role, status) VALUES
    (v_admin_pid, v_academy_id, 'admin', 'active'),
    (v_prof1_pid, v_academy_id, 'professor', 'active'),
    (v_prof2_pid, v_academy_id, 'professor', 'active'),
    (v_recep_pid, v_academy_id, 'admin', 'active'),
    (v_adulto1_pid, v_academy_id, 'aluno_adulto', 'active'),
    (v_adulto2_pid, v_academy_id, 'aluno_adulto', 'active'),
    (v_adulto3_pid, v_academy_id, 'aluno_adulto', 'active'),
    (v_teen1_pid, v_academy_id, 'aluno_teen', 'active'),
    (v_teen2_pid, v_academy_id, 'aluno_teen', 'active'),
    (v_kids1_pid, v_academy_id, 'aluno_kids', 'active'),
    (v_kids2_pid, v_academy_id, 'aluno_kids', 'active'),
    (v_resp1_pid, v_academy_id, 'responsavel', 'active'),
    (v_resp2_pid, v_academy_id, 'responsavel', 'active')
  ON CONFLICT (profile_id, academy_id, role) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 6. Plans
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.plans (id, academy_id, name, price, interval, features) VALUES
    (v_plan_mensal, v_academy_id, 'Plano Mensal', 199.90, 'monthly',
      '["Acesso a todas as aulas", "Material didático", "App BlackBelt"]'::jsonb),
    (v_plan_trimestral, v_academy_id, 'Plano Trimestral', 169.90, 'quarterly',
      '["Acesso a todas as aulas", "Material didático", "App BlackBelt", "1 kimono grátis"]'::jsonb),
    (v_plan_anual, v_academy_id, 'Plano Anual', 139.90, 'yearly',
      '["Acesso a todas as aulas", "Material didático", "App BlackBelt", "1 kimono grátis", "Desconto em eventos"]'::jsonb)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 7. Modalities
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.modalities (id, academy_id, name, belt_required) VALUES
    (v_mod_bjj, v_academy_id, 'Jiu-Jitsu Brasileiro', 'white'),
    (v_mod_muay, v_academy_id, 'Muay Thai', 'white')
  ON CONFLICT (academy_id, name) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 8. Students
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.students (id, profile_id, academy_id, belt, started_at) VALUES
    (v_student_adulto1, v_adulto1_pid, v_academy_id, 'blue', now() - interval '2 years'),
    (v_student_adulto2, v_adulto2_pid, v_academy_id, 'white', now() - interval '4 months'),
    (v_student_adulto3, v_adulto3_pid, v_academy_id, 'purple', now() - interval '5 years'),
    (v_student_teen1, v_teen1_pid, v_academy_id, 'yellow', now() - interval '1 year'),
    (v_student_teen2, v_teen2_pid, v_academy_id, 'orange', now() - interval '8 months'),
    (v_student_kids1, v_kids1_pid, v_academy_id, 'grey_white', now() - interval '6 months'),
    (v_student_kids2, v_kids2_pid, v_academy_id, 'yellow', now() - interval '1 year')
  ON CONFLICT (profile_id, academy_id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 9. Guardians (parents linked to kids)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.guardians (guardian_profile_id, student_id, relation) VALUES
    (v_resp1_pid, v_student_kids1, 'pai'),
    (v_resp2_pid, v_student_kids2, 'mae')
  ON CONFLICT (guardian_profile_id, student_id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 10. Classes
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.classes (id, modality_id, unit_id, professor_id, schedule) VALUES
    (v_class_bjj_manha, v_mod_bjj, v_unit_id, v_prof1_pid,
      '[{"day": 1, "start": "07:00", "end": "08:30"}, {"day": 3, "start": "07:00", "end": "08:30"}, {"day": 5, "start": "07:00", "end": "08:30"}]'::jsonb),
    (v_class_bjj_noite, v_mod_bjj, v_unit_id, v_prof1_pid,
      '[{"day": 1, "start": "19:00", "end": "20:30"}, {"day": 3, "start": "19:00", "end": "20:30"}, {"day": 5, "start": "19:00", "end": "20:30"}]'::jsonb),
    (v_class_muay_noite, v_mod_muay, v_unit_id, v_prof2_pid,
      '[{"day": 2, "start": "19:00", "end": "20:30"}, {"day": 4, "start": "19:00", "end": "20:30"}]'::jsonb),
    (v_class_kids, v_mod_bjj, v_unit_id, v_prof2_pid,
      '[{"day": 2, "start": "16:00", "end": "17:00"}, {"day": 4, "start": "16:00", "end": "17:00"}, {"day": 6, "start": "10:00", "end": "11:00"}]'::jsonb)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 11. Class Enrollments
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.class_enrollments (student_id, class_id, status) VALUES
    -- Adultos no BJJ manhã e noite
    (v_student_adulto1, v_class_bjj_manha, 'active'),
    (v_student_adulto1, v_class_bjj_noite, 'active'),
    (v_student_adulto2, v_class_bjj_noite, 'active'),
    (v_student_adulto3, v_class_bjj_manha, 'active'),
    (v_student_adulto3, v_class_muay_noite, 'active'),
    -- Teens no BJJ noite e Muay Thai
    (v_student_teen1, v_class_bjj_noite, 'active'),
    (v_student_teen2, v_class_muay_noite, 'active'),
    -- Kids na turma infantil
    (v_student_kids1, v_class_kids, 'active'),
    (v_student_kids2, v_class_kids, 'active')
  ON CONFLICT (student_id, class_id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 12. Subscriptions
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.subscriptions (student_id, plan_id, status, current_period_end) VALUES
    (v_student_adulto1, v_plan_anual, 'active', now() + interval '8 months'),
    (v_student_adulto2, v_plan_mensal, 'active', now() + interval '15 days'),
    (v_student_adulto3, v_plan_trimestral, 'active', now() + interval '2 months'),
    (v_student_teen1, v_plan_mensal, 'active', now() + interval '20 days'),
    (v_student_teen2, v_plan_mensal, 'active', now() + interval '10 days'),
    (v_student_kids1, v_plan_trimestral, 'active', now() + interval '45 days'),
    (v_student_kids2, v_plan_anual, 'active', now() + interval '6 months')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 13. Attendance (last 30 days, realistic)
  -- ─────────────────────────────────────────────────────────────
  -- Adulto 1 (frequente, faixa azul)
  INSERT INTO public.attendance (student_id, class_id, checked_at, method) VALUES
    (v_student_adulto1, v_class_bjj_manha, now() - interval '1 day', 'qr_code'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '3 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_noite, now() - interval '5 days', 'manual'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '8 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_noite, now() - interval '10 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '12 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '15 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_noite, now() - interval '17 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '19 days', 'qr_code'),
    (v_student_adulto1, v_class_bjj_manha, now() - interval '22 days', 'manual'),
    -- Adulto 2 (iniciante, poucas presenças)
    (v_student_adulto2, v_class_bjj_noite, now() - interval '2 days', 'manual'),
    (v_student_adulto2, v_class_bjj_noite, now() - interval '7 days', 'manual'),
    (v_student_adulto2, v_class_bjj_noite, now() - interval '14 days', 'manual'),
    -- Adulto 3 (veterana, assídua)
    (v_student_adulto3, v_class_bjj_manha, now() - interval '1 day', 'qr_code'),
    (v_student_adulto3, v_class_muay_noite, now() - interval '2 days', 'qr_code'),
    (v_student_adulto3, v_class_bjj_manha, now() - interval '3 days', 'qr_code'),
    (v_student_adulto3, v_class_muay_noite, now() - interval '4 days', 'qr_code'),
    (v_student_adulto3, v_class_bjj_manha, now() - interval '8 days', 'qr_code'),
    (v_student_adulto3, v_class_muay_noite, now() - interval '9 days', 'qr_code'),
    (v_student_adulto3, v_class_bjj_manha, now() - interval '10 days', 'qr_code'),
    (v_student_adulto3, v_class_bjj_manha, now() - interval '15 days', 'qr_code'),
    (v_student_adulto3, v_class_muay_noite, now() - interval '16 days', 'qr_code'),
    -- Teen 1
    (v_student_teen1, v_class_bjj_noite, now() - interval '1 day', 'qr_code'),
    (v_student_teen1, v_class_bjj_noite, now() - interval '5 days', 'qr_code'),
    (v_student_teen1, v_class_bjj_noite, now() - interval '8 days', 'manual'),
    (v_student_teen1, v_class_bjj_noite, now() - interval '12 days', 'qr_code'),
    (v_student_teen1, v_class_bjj_noite, now() - interval '19 days', 'qr_code'),
    -- Teen 2
    (v_student_teen2, v_class_muay_noite, now() - interval '2 days', 'manual'),
    (v_student_teen2, v_class_muay_noite, now() - interval '7 days', 'manual'),
    (v_student_teen2, v_class_muay_noite, now() - interval '14 days', 'manual'),
    (v_student_teen2, v_class_muay_noite, now() - interval '21 days', 'manual'),
    -- Kids 1
    (v_student_kids1, v_class_kids, now() - interval '2 days', 'manual'),
    (v_student_kids1, v_class_kids, now() - interval '4 days', 'manual'),
    (v_student_kids1, v_class_kids, now() - interval '9 days', 'manual'),
    (v_student_kids1, v_class_kids, now() - interval '11 days', 'manual'),
    (v_student_kids1, v_class_kids, now() - interval '16 days', 'manual'),
    -- Kids 2
    (v_student_kids2, v_class_kids, now() - interval '2 days', 'manual'),
    (v_student_kids2, v_class_kids, now() - interval '7 days', 'manual'),
    (v_student_kids2, v_class_kids, now() - interval '14 days', 'manual')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 14. Invoices (via subscriptions)
  -- ─────────────────────────────────────────────────────────────
  -- We need subscription IDs — use a subquery approach
  INSERT INTO public.invoices (subscription_id, amount, status, due_date, paid_at)
  SELECT s.id, p.price, 'paid', (now() - interval '15 days')::date, now() - interval '14 days'
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.student_id = v_student_adulto1
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.invoices (subscription_id, amount, status, due_date)
  SELECT s.id, p.price, 'open', (now() + interval '5 days')::date
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.student_id = v_student_adulto2
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.invoices (subscription_id, amount, status, due_date, paid_at)
  SELECT s.id, p.price, 'paid', (now() - interval '10 days')::date, now() - interval '8 days'
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.student_id = v_student_adulto3
  LIMIT 1
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 15. Progressions (belt promotions)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.progressions (student_id, evaluated_by, from_belt, to_belt, created_at) VALUES
    (v_student_adulto1, v_prof1_pid, 'white', 'blue', now() - interval '6 months'),
    (v_student_adulto3, v_prof1_pid, 'blue', 'purple', now() - interval '1 year'),
    (v_student_teen1, v_prof2_pid, 'white', 'yellow', now() - interval '3 months'),
    (v_student_teen2, v_prof2_pid, 'yellow', 'orange', now() - interval '2 months')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 16. Evaluations
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.evaluations (student_id, class_id, criteria, score) VALUES
    (v_student_adulto1, v_class_bjj_manha, 'technique', 85),
    (v_student_adulto1, v_class_bjj_manha, 'discipline', 90),
    (v_student_adulto1, v_class_bjj_manha, 'attendance', 95),
    (v_student_adulto1, v_class_bjj_manha, 'evolution', 80),
    (v_student_adulto2, v_class_bjj_noite, 'technique', 60),
    (v_student_adulto2, v_class_bjj_noite, 'discipline', 75),
    (v_student_adulto3, v_class_bjj_manha, 'technique', 92),
    (v_student_adulto3, v_class_bjj_manha, 'discipline', 95),
    (v_student_adulto3, v_class_bjj_manha, 'evolution', 88),
    (v_student_teen1, v_class_bjj_noite, 'technique', 70),
    (v_student_teen1, v_class_bjj_noite, 'discipline', 80),
    (v_student_kids1, v_class_kids, 'technique', 65),
    (v_student_kids1, v_class_kids, 'discipline', 85),
    (v_student_kids2, v_class_kids, 'technique', 75),
    (v_student_kids2, v_class_kids, 'discipline', 90)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 17. Achievements
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.achievements (student_id, type, granted_at, granted_by, name, category, rarity) VALUES
    (v_student_adulto1, 'attendance_streak', now() - interval '1 month', v_prof1_pid, 'Guerreiro Consistente', 'presenca', 'rare'),
    (v_student_adulto1, 'belt_promotion', now() - interval '6 months', v_prof1_pid, 'Faixa Azul', 'graduacao', 'epic'),
    (v_student_adulto3, 'class_milestone', now() - interval '2 months', v_prof1_pid, '500 Aulas', 'presenca', 'legendary'),
    (v_student_teen1, 'custom', now() - interval '2 weeks', v_prof2_pid, 'Destaque da Semana', 'reconhecimento', 'common'),
    (v_student_kids1, 'attendance_streak', now() - interval '1 week', v_prof2_pid, 'Estrela da Turma', 'presenca', 'common'),
    (v_student_kids2, 'custom', now() - interval '3 days', v_prof2_pid, 'Melhor Comportamento', 'reconhecimento', 'common')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 18. Notifications
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.notifications (user_id, type, title, body, read) VALUES
    (v_adulto1_uid, 'achievement', 'Nova conquista desbloqueada!', 'Parabéns! Você completou 10 aulas consecutivas.', false),
    (v_adulto1_uid, 'payment', 'Pagamento confirmado', 'Sua mensalidade de março foi confirmada.', true),
    (v_admin_uid, 'system', 'Novo aluno matriculado', 'Thiago Rodrigues se matriculou no plano mensal.', false),
    (v_resp1_uid, 'checkin', 'Check-in realizado', 'Lucas Gabriel fez check-in na turma Kids às 16:00.', true),
    (v_resp2_uid, 'checkin', 'Check-in realizado', 'Sofia fez check-in na turma Kids às 16:05.', false),
    (v_teen1_uid, 'challenge', 'Novo desafio disponível!', 'Complete 5 aulas esta semana e ganhe 100 XP.', false)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 19. Messages
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.messages (from_id, to_id, channel, content, read_at) VALUES
    (v_prof1_pid, v_adulto1_pid, 'direct', 'Marcos, parabéns pela evolução! Vamos trabalhar mais guarda essa semana.', now() - interval '1 hour'),
    (v_adulto1_pid, v_prof1_pid, 'direct', 'Obrigado, professor! Pode deixar, vou me dedicar.', NULL),
    (v_resp1_pid, v_prof2_pid, 'direct', 'Professora Ana, como o Lucas está se comportando nas aulas?', now() - interval '2 hours'),
    (v_prof2_pid, v_resp1_pid, 'direct', 'O Lucas está ótimo! Muito focado e respeitoso com os colegas.', NULL),
    (v_admin_pid, v_prof1_pid, 'direct', 'Fernando, podemos conversar sobre o horário da turma da manhã?', now() - interval '3 hours')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 20. Feed Posts
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.feed_posts (academy_id, author_id, type, content, likes_count, comments_count) VALUES
    (v_academy_id, v_admin_pid, 'comunicado', 'Atenção: Semana que vem teremos seminário especial com o Mestre João! Não percam!', 12, 3),
    (v_academy_id, v_prof1_pid, 'manual', 'Treino incrível hoje! A turma da manhã mandou muito bem nos drills de passagem de guarda.', 8, 2),
    (v_academy_id, NULL, 'promocao', 'Parabéns ao Marcos Vinícius pela promoção à faixa azul! OSS!', 25, 7),
    (v_academy_id, v_prof2_pid, 'manual', 'Turma Kids arrasando! Hoje trabalhamos quedas e a garotada amou.', 15, 4)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 21. Student XP
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.student_xp (student_id, xp, level, title) VALUES
    (v_student_adulto1, 2500, 8, 'Guerreiro'),
    (v_student_adulto2, 350, 2, 'Iniciante'),
    (v_student_adulto3, 8500, 15, 'Mestre'),
    (v_student_teen1, 1200, 5, 'Explorador'),
    (v_student_teen2, 800, 4, 'Lutador'),
    (v_student_kids1, 600, 3, 'Estrelinha'),
    (v_student_kids2, 900, 4, 'Campeã')
  ON CONFLICT (student_id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 22. Leads
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.leads (academy_id, name, email, phone, modality, origin, status) VALUES
    (v_academy_id, 'Bruno Nascimento', 'bruno.nasc@email.com', '(11) 98765-4321', 'Jiu-Jitsu', 'instagram', 'lead'),
    (v_academy_id, 'Maria Clara', 'maria.clara@email.com', '(11) 91234-5678', 'Muay Thai', 'indicacao', 'contatado'),
    (v_academy_id, 'Rafael Lima', 'rafael.lima@email.com', '(11) 99876-5432', 'Jiu-Jitsu', 'google', 'experimental_marcada'),
    (v_academy_id, 'Fernanda Dias', 'fernanda.d@email.com', '(11) 97654-3210', 'Jiu-Jitsu', 'facebook', 'matriculou')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 23. NPS Responses
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.nps_responses (academy_id, student_id, score, feedback) VALUES
    (v_academy_id, v_student_adulto1, 10, 'Melhor academia que já treinei! Professores excelentes.'),
    (v_academy_id, v_student_adulto2, 8, 'Gostando muito, estou evoluindo rápido.'),
    (v_academy_id, v_student_adulto3, 9, 'Ambiente incrível, só gostaria de mais horários de manhã.'),
    (v_academy_id, v_student_teen1, 9, 'Treino muito bom, galera é gente boa.')
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 24. Financeiro senior por aluno
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.guardian_links (guardian_id, child_id, relationship, can_manage_payments)
  VALUES
    (v_resp1_pid, v_kids1_pid, 'parent', true),
    (v_resp2_pid, v_kids2_pid, 'parent', true)
  ON CONFLICT (guardian_id, child_id) DO NOTHING;

  INSERT INTO public.student_financial_profiles (
    academy_id,
    membership_id,
    profile_id,
    financial_model,
    charge_mode,
    payment_method_default,
    recurrence,
    amount_cents,
    discount_amount_cents,
    scholarship_percent,
    due_day,
    next_due_date,
    financial_status,
    notes,
    monthly_checkin_minimum,
    current_month_checkins,
    alert_days_before_month_end,
    checkin_goal_status,
    partnership_name,
    partnership_transfer_mode,
    exemption_reason,
    period_start_date,
    period_end_date
  )
  SELECT
    v_academy_id,
    m.id,
    m.profile_id,
    cfg.financial_model,
    cfg.charge_mode,
    cfg.payment_method_default,
    cfg.recurrence,
    cfg.amount_cents,
    cfg.discount_amount_cents,
    cfg.scholarship_percent,
    cfg.due_day,
    cfg.next_due_date,
    cfg.financial_status,
    cfg.notes,
    cfg.monthly_checkin_minimum,
    cfg.current_month_checkins,
    cfg.alert_days_before_month_end,
    cfg.checkin_goal_status,
    cfg.partnership_name,
    cfg.partnership_transfer_mode,
    cfg.exemption_reason,
    cfg.period_start_date,
    cfg.period_end_date
  FROM public.memberships m
  JOIN (
    VALUES
      (v_adulto1_pid, 'particular', 'manual', 'pix', 'monthly', 19990, 0, 0::numeric, 10, CURRENT_DATE + 10, 'em_dia', 'Aluno particular PIX mensal', 0, 0, 5, 'ok', NULL, NULL, NULL, CURRENT_DATE - 200, NULL),
      (v_adulto2_pid, 'particular', 'automatic', 'credit_card', 'semiannual', 89940, 0, 0::numeric, 31, CURRENT_DATE, 'vence_hoje', 'Cartão semestral', 0, 0, 5, 'ok', NULL, NULL, NULL, CURRENT_DATE - 100, NULL),
      (v_adulto3_pid, 'particular', 'hybrid', 'bank_transfer', 'annual', 149900, 0, 0::numeric, 5, CURRENT_DATE - 7, 'atrasado', 'Plano anual atrasado', 0, 0, 5, 'ok', NULL, NULL, NULL, CURRENT_DATE - 365, NULL),
      (v_teen1_pid, 'gympass', 'manual', 'external_platform', 'none', 0, 0, 0::numeric, NULL, NULL, 'em_dia', 'GymPass com meta 8', 8, 5, 4, 'attention', 'GymPass', 'Repasse por check-in', NULL, CURRENT_DATE - 60, NULL),
      (v_teen2_pid, 'totalpass', 'manual', 'external_platform', 'none', 0, 0, 0::numeric, NULL, NULL, 'em_dia', 'TotalPass com meta 10', 10, 4, 5, 'risk', 'TotalPass', 'Repasse por check-in', NULL, CURRENT_DATE - 60, NULL),
      (v_kids1_pid, 'bolsista', 'manual', 'pix', 'monthly', 19990, 9995, 50::numeric, 12, CURRENT_DATE + 2, 'vence_em_breve', 'Bolsista parcial', 0, 0, 5, 'ok', NULL, NULL, 'Bolsa kids parcial', CURRENT_DATE - 30, NULL),
      (v_kids2_pid, 'cortesia', 'manual', 'none', 'none', 0, 0, 0::numeric, NULL, NULL, 'isento', 'Cortesia para kids', 0, 0, 5, 'ok', NULL, NULL, 'Cortesia promocional', CURRENT_DATE - 30, CURRENT_DATE + 30),
      (v_resp1_pid, 'convenio', 'hybrid', 'boleto', 'monthly', 12990, 0, 0::numeric, 20, CURRENT_DATE + 1, 'vence_em_breve', 'Convênio empresarial', 0, 0, 5, 'ok', 'Convênio Empresa XPTO', 'Repasse mensal por funcionário ativo', NULL, CURRENT_DATE - 60, NULL)
  ) AS cfg(
    profile_id,
    financial_model,
    charge_mode,
    payment_method_default,
    recurrence,
    amount_cents,
    discount_amount_cents,
    scholarship_percent,
    due_day,
    next_due_date,
    financial_status,
    notes,
    monthly_checkin_minimum,
    current_month_checkins,
    alert_days_before_month_end,
    checkin_goal_status,
    partnership_name,
    partnership_transfer_mode,
    exemption_reason,
    period_start_date,
    period_end_date
  ) ON cfg.profile_id = m.profile_id
  WHERE m.academy_id = v_academy_id
    AND m.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel')
  ON CONFLICT (membership_id) DO UPDATE
  SET
    financial_model = EXCLUDED.financial_model,
    charge_mode = EXCLUDED.charge_mode,
    payment_method_default = EXCLUDED.payment_method_default,
    recurrence = EXCLUDED.recurrence,
    amount_cents = EXCLUDED.amount_cents,
    discount_amount_cents = EXCLUDED.discount_amount_cents,
    scholarship_percent = EXCLUDED.scholarship_percent,
    due_day = EXCLUDED.due_day,
    next_due_date = EXCLUDED.next_due_date,
    financial_status = EXCLUDED.financial_status,
    notes = EXCLUDED.notes,
    monthly_checkin_minimum = EXCLUDED.monthly_checkin_minimum,
    current_month_checkins = EXCLUDED.current_month_checkins,
    alert_days_before_month_end = EXCLUDED.alert_days_before_month_end,
    checkin_goal_status = EXCLUDED.checkin_goal_status,
    partnership_name = EXCLUDED.partnership_name,
    partnership_transfer_mode = EXCLUDED.partnership_transfer_mode,
    exemption_reason = EXCLUDED.exemption_reason,
    period_start_date = EXCLUDED.period_start_date,
    period_end_date = EXCLUDED.period_end_date;

  INSERT INTO public.student_payments (
    academy_id,
    student_profile_id,
    membership_id,
    description,
    amount_cents,
    billing_type,
    due_date,
    status,
    payment_method,
    paid_amount_cents,
    paid_at,
    reference_month,
    payment_notes,
    source
  )
  SELECT
    v_academy_id,
    sp.student_profile_id,
    m.id,
    sp.description,
    sp.amount_cents,
    sp.billing_type,
    sp.due_date,
    sp.status,
    sp.payment_method,
    sp.paid_amount_cents,
    sp.paid_at,
    sp.reference_month,
    sp.payment_notes,
    sp.source
  FROM (
    VALUES
      (v_adulto1_pid, 'Mensalidade PIX março', 19990, 'PIX', CURRENT_DATE + 10, 'PENDING', 'pix', NULL::integer, NULL::timestamptz, to_char(CURRENT_DATE, 'YYYY-MM'), NULL::text, 'recurring_charge'),
      (v_adulto2_pid, 'Semestral cartão março', 89940, 'CREDIT_CARD', CURRENT_DATE, 'PENDING', 'credit_card', NULL::integer, NULL::timestamptz, to_char(CURRENT_DATE, 'YYYY-MM'), NULL::text, 'recurring_charge'),
      (v_adulto3_pid, 'Anual transferência vencido', 149900, 'PIX', CURRENT_DATE - 7, 'OVERDUE', 'bank_transfer', NULL::integer, NULL::timestamptz, to_char(CURRENT_DATE, 'YYYY-MM'), 'Cliente prometeu regularizar', 'recurring_charge'),
      (v_kids1_pid, 'Bolsa parcial kids', 9995, 'PIX', CURRENT_DATE + 2, 'PENDING', 'pix', NULL::integer, NULL::timestamptz, to_char(CURRENT_DATE, 'YYYY-MM'), NULL::text, 'recurring_charge'),
      (v_resp1_pid, 'Convênio Empresa XPTO', 12990, 'BOLETO', CURRENT_DATE + 1, 'PENDING', 'boleto', NULL::integer, NULL::timestamptz, to_char(CURRENT_DATE, 'YYYY-MM'), NULL::text, 'manual_charge'),
      (v_kids2_pid, 'Cortesia registrada', 0, 'PIX', CURRENT_DATE + 30, 'CONFIRMED', 'none', 0, now() - interval '2 days', to_char(CURRENT_DATE, 'YYYY-MM'), 'Isenção total', 'migration')
  ) AS sp(
    student_profile_id,
    description,
    amount_cents,
    billing_type,
    due_date,
    status,
    payment_method,
    paid_amount_cents,
    paid_at,
    reference_month,
    payment_notes,
    source
  )
  JOIN public.memberships m
    ON m.profile_id = sp.student_profile_id
   AND m.academy_id = v_academy_id
  WHERE m.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.student_financial_alerts (
    academy_id,
    membership_id,
    profile_id,
    recipient_profile_id,
    recipient_type,
    alert_kind,
    channel,
    status,
    alert_reference_date,
    remaining_checkins,
    message
  )
  SELECT
    v_academy_id,
    m.id,
    m.profile_id,
    CASE
      WHEN m.profile_id = v_teen1_pid THEN v_teen1_pid
      WHEN m.profile_id = v_teen2_pid THEN v_teen2_pid
      WHEN m.profile_id = v_kids1_pid THEN v_resp1_pid
      ELSE NULL
    END,
    CASE
      WHEN m.profile_id = v_kids1_pid THEN 'guardian'
      ELSE 'student'
    END,
    'checkin_goal',
    'internal',
    'sent',
    CURRENT_DATE,
    CASE
      WHEN m.profile_id = v_teen1_pid THEN 3
      WHEN m.profile_id = v_teen2_pid THEN 6
      WHEN m.profile_id = v_kids1_pid THEN 2
      ELSE 0
    END,
    CASE
      WHEN m.profile_id = v_teen1_pid THEN 'GymPass abaixo da meta do mês.'
      WHEN m.profile_id = v_teen2_pid THEN 'TotalPass em risco de não bater a meta.'
      WHEN m.profile_id = v_kids1_pid THEN 'Responsável avisado sobre meta parcial de check-ins.'
      ELSE 'Alerta financeiro'
    END
  FROM public.memberships m
  WHERE m.academy_id = v_academy_id
    AND m.profile_id IN (v_teen1_pid, v_teen2_pid, v_kids1_pid)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed completo: 15 perfis, 1 academia, 4 turmas, 7 alunos, presenças, pagamentos, graduações.';
END $$;

DO $$
DECLARE
  v_admin_uid uuid := 'a0000000-0000-0000-0000-000000000002';
  v_superadmin_pid uuid := 'b0000000-0000-0000-0000-000000000001';
  v_admin_pid uuid := 'b0000000-0000-0000-0000-000000000002';
  v_prof1_pid uuid := 'b0000000-0000-0000-0000-000000000003';
  v_academy_core uuid := 'c0000000-0000-0000-0000-000000000001';
  v_academy_risk uuid := 'c0000000-0000-0000-0000-000000000101';
  v_academy_scale uuid := 'c0000000-0000-0000-0000-000000000102';
  v_academy_tablet uuid := 'c0000000-0000-0000-0000-000000000103';
  v_academy_tv uuid := 'c0000000-0000-0000-0000-000000000104';
BEGIN
  INSERT INTO public.academies (id, name, slug, owner_id, status)
  VALUES
    (v_academy_risk, 'Lotus Combat Club', 'lotus-combat-club', v_admin_uid, 'active'),
    (v_academy_scale, 'Alpha Enterprise Dojo', 'alpha-enterprise-dojo', v_admin_uid, 'active'),
    (v_academy_tablet, 'Tablet Ops Academy', 'tablet-ops-academy', v_admin_uid, 'active'),
    (v_academy_tv, 'Arena Screens HQ', 'arena-screens-hq', v_admin_uid, 'active')
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

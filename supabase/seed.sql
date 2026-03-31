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

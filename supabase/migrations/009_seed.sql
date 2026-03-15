-- ============================================================
-- BlackBelt v2 — Migration 009: Seed Data (Demo)
-- ============================================================
-- NOTE: This seed mirrors the mock data used in the frontend.
-- Run only in development/staging environments.

-- Demo Academy
INSERT INTO public.academies (id, name, slug, owner_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Academia BlackBelt Demo', 'blackbelt-demo', '00000000-0000-0000-0000-000000000001');

-- Demo Units
INSERT INTO public.units (id, academy_id, name, address) VALUES
  ('u0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Unidade Centro', 'Rua Principal, 100 - Centro'),
  ('u0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Unidade Norte', 'Av. Norte, 500 - Zona Norte');

-- Demo Modalities
INSERT INTO public.modalities (id, academy_id, name, belt_required) VALUES
  ('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'BJJ', 'white'),
  ('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Judô', 'white'),
  ('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Karatê', 'white'),
  ('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'MMA', 'blue');

-- Demo Plans
INSERT INTO public.plans (id, academy_id, name, price, interval, features) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Mensal', 150.00, 'monthly', '["Acesso a todas as aulas", "Conteúdo online", "Check-in via QR Code"]'),
  ('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Trimestral', 400.00, 'quarterly', '["Acesso a todas as aulas", "Conteúdo online", "Check-in via QR Code", "11% de desconto"]'),
  ('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Anual', 1400.00, 'yearly', '["Acesso a todas as aulas", "Conteúdo online", "Check-in via QR Code", "22% de desconto", "Kimono grátis"]');

-- Demo Videos
INSERT INTO public.videos (id, academy_id, title, description, url, belt_level, duration) VALUES
  ('v0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Guarda Fechada — Fundamentos', 'Aprenda os fundamentos da guarda fechada no BJJ.', 'https://example.com/v1', 'white', 15),
  ('v0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Raspagem de Gancho', 'Técnica essencial de raspagem para iniciantes.', 'https://example.com/v2', 'white', 12),
  ('v0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Triângulo — Detalhes', 'Detalhes avançados da finalização em triângulo.', 'https://example.com/v3', 'yellow', 20),
  ('v0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Berimbolo Básico', 'Introdução ao berimbolo para faixas verdes.', 'https://example.com/v4', 'green', 25),
  ('v0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Back Take — Spider Guard', 'Transição de spider guard para as costas.', 'https://example.com/v5', 'blue', 30),
  ('v0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Lapel Guard Avançada', 'Técnicas avançadas de lapel guard.', 'https://example.com/v6', 'purple', 28);

-- Demo Series
INSERT INTO public.series (id, academy_id, title) VALUES
  ('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Fundamentos BJJ'),
  ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Raspagens Essenciais'),
  ('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Jogo de Costas');

INSERT INTO public.series_videos (series_id, video_id, position) VALUES
  ('s0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000001', 1),
  ('s0000000-0000-0000-0000-000000000001', 'v0000000-0000-0000-0000-000000000002', 2),
  ('s0000000-0000-0000-0000-000000000002', 'v0000000-0000-0000-0000-000000000002', 1),
  ('s0000000-0000-0000-0000-000000000002', 'v0000000-0000-0000-0000-000000000003', 2),
  ('s0000000-0000-0000-0000-000000000003', 'v0000000-0000-0000-0000-000000000005', 1);

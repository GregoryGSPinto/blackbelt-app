-- 032: RLS policies + seed data for sales features (031)
-- Enables Row Level Security on all 11 sales tables and seeds WhatsApp templates/automations

-- ═══════════════════════════════════════════════════════════════════
-- PART 1: ENABLE RLS ON ALL SALES TABLES
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_actions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- PART 2: RLS POLICIES
-- Uses existing helpers: is_member_of(), get_my_academy_ids(), is_superadmin()
-- ═══════════════════════════════════════════════════════════════════

-- ── whatsapp_configs ─────────────────────────────────────────────
-- Academy members can read; admin can write

CREATE POLICY whatsapp_configs_select ON public.whatsapp_configs
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY whatsapp_configs_insert ON public.whatsapp_configs
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY whatsapp_configs_update ON public.whatsapp_configs
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY whatsapp_configs_superadmin ON public.whatsapp_configs
  FOR ALL USING (public.is_superadmin());

-- ── whatsapp_templates ───────────────────────────────────────────
-- Academy members can read; admin can write

CREATE POLICY whatsapp_templates_select ON public.whatsapp_templates
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY whatsapp_templates_insert ON public.whatsapp_templates
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY whatsapp_templates_update ON public.whatsapp_templates
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY whatsapp_templates_delete ON public.whatsapp_templates
  FOR DELETE USING (
    is_system = false AND academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin')
    )
  );

-- ── whatsapp_messages ────────────────────────────────────────────
-- Academy members can read; admin/professor can insert

CREATE POLICY whatsapp_messages_select ON public.whatsapp_messages
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY whatsapp_messages_insert ON public.whatsapp_messages
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor', 'professor', 'recepcao')
    )
  );

CREATE POLICY whatsapp_messages_delete ON public.whatsapp_messages
  FOR DELETE USING (
    status = 'queued' AND academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── whatsapp_automations ─────────────────────────────────────────

CREATE POLICY whatsapp_automations_select ON public.whatsapp_automations
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY whatsapp_automations_insert ON public.whatsapp_automations
  FOR INSERT WITH CHECK (
    academy_id IN (SELECT public.get_my_academy_ids())
  );

CREATE POLICY whatsapp_automations_update ON public.whatsapp_automations
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── payment_customers ────────────────────────────────────────────

CREATE POLICY payment_customers_select ON public.payment_customers
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY payment_customers_insert ON public.payment_customers
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY payment_customers_update ON public.payment_customers
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── payment_charges ──────────────────────────────────────────────

CREATE POLICY payment_charges_select ON public.payment_charges
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY payment_charges_insert ON public.payment_charges
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY payment_charges_update ON public.payment_charges
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── payment_subscriptions ────────────────────────────────────────

CREATE POLICY payment_subscriptions_select ON public.payment_subscriptions
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY payment_subscriptions_insert ON public.payment_subscriptions
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY payment_subscriptions_update ON public.payment_subscriptions
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── landing_page_configs ─────────────────────────────────────────
-- Public SELECT for published pages (visitors); admin can write

CREATE POLICY landing_page_configs_public_select ON public.landing_page_configs
  FOR SELECT USING (
    published = true OR public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY landing_page_configs_insert ON public.landing_page_configs
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY landing_page_configs_update ON public.landing_page_configs
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor')
    )
  );

-- ── landing_page_leads ───────────────────────────────────────────
-- Public INSERT (visitors submit form); admin can read

CREATE POLICY landing_page_leads_public_insert ON public.landing_page_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY landing_page_leads_select ON public.landing_page_leads
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY landing_page_leads_update ON public.landing_page_leads
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor', 'recepcao')
    )
  );

-- ── churn_predictions ────────────────────────────────────────────

CREATE POLICY churn_predictions_select ON public.churn_predictions
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY churn_predictions_insert ON public.churn_predictions
  FOR INSERT WITH CHECK (
    academy_id IN (SELECT public.get_my_academy_ids()) OR public.is_superadmin()
  );

CREATE POLICY churn_predictions_update ON public.churn_predictions
  FOR UPDATE USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor', 'professor')
    ) OR public.is_superadmin()
  );

-- ── churn_actions ────────────────────────────────────────────────

CREATE POLICY churn_actions_select ON public.churn_actions
  FOR SELECT USING (
    public.is_member_of(academy_id) OR public.is_superadmin()
  );

CREATE POLICY churn_actions_insert ON public.churn_actions
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
      AND m.role IN ('admin', 'gestor', 'professor')
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- PART 3: SEED FUNCTION — Populates templates + automations for ANY academy
-- Called once per academy (on creation or retroactively)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.seed_whatsapp_for_academy(p_academy_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if already seeded
  IF EXISTS (SELECT 1 FROM whatsapp_templates WHERE academy_id = p_academy_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- ── Default config ──
  INSERT INTO whatsapp_configs (academy_id, provider, allowed_hours_start, allowed_hours_end, active)
  VALUES (p_academy_id, 'mock', 8, 21, true)
  ON CONFLICT (academy_id) DO NOTHING;

  -- ── 30 System Templates ──
  INSERT INTO whatsapp_templates (academy_id, slug, name, text, variables, category, is_system) VALUES
  -- COBRANCA (6)
  (p_academy_id, 'cobranca_vencendo', 'Cobranca - Vencendo', 'Olá {nome}! Sua mensalidade de R${valor} vence dia {data}. PIX: {chave_pix}. Qualquer dúvida, estamos aqui! 🥋', ARRAY['nome','valor','data','chave_pix'], 'cobranca', true),
  (p_academy_id, 'cobranca_vencida', 'Cobranca - Vencida', 'Oi {nome}, tudo bem? Sua mensalidade de R${valor} venceu dia {data}. Precisa de ajuda? Estamos à disposição!', ARRAY['nome','valor','data'], 'cobranca', true),
  (p_academy_id, 'cobranca_atrasada_7d', 'Cobranca - 7 dias', 'Olá {nome}, notamos que o pagamento de {mes} está pendente (R${valor}). Pode regularizar? Aceitamos PIX! 😊', ARRAY['nome','mes','valor'], 'cobranca', true),
  (p_academy_id, 'cobranca_atrasada_15d', 'Cobranca - 15 dias', 'Oi {nome}, sua mensalidade de {mes} está em atraso. Vamos resolver? Fale comigo!', ARRAY['nome','mes'], 'cobranca', true),
  (p_academy_id, 'cobranca_link_pagamento', 'Cobranca - Link', 'Olá {nome}! Segue o link para pagamento: {link}. Valor: R${valor}. Vence dia {data}.', ARRAY['nome','link','valor','data'], 'cobranca', true),
  (p_academy_id, 'cobranca_confirmacao', 'Cobranca - Confirmacao', 'Recebemos seu pagamento de R${valor}! Obrigado, {nome}! Bons treinos! 🥋✅', ARRAY['nome','valor'], 'cobranca', true),
  -- AULA (6)
  (p_academy_id, 'aula_lembrete_amanha', 'Aula - Lembrete amanha', 'Oi {nome}! Lembrete: sua aula de {modalidade} é amanhã às {horario}. Te esperamos! 🥋', ARRAY['nome','modalidade','horario'], 'aula', true),
  (p_academy_id, 'aula_lembrete_hoje', 'Aula - Lembrete hoje', '{nome}, sua aula de {modalidade} é HOJE às {horario}! Não esqueça o kimono! 💪', ARRAY['nome','modalidade','horario'], 'aula', true),
  (p_academy_id, 'aula_cancelada', 'Aula - Cancelada', 'Atenção {nome}: a aula de {modalidade} de {data} às {horario} foi cancelada. {motivo}. Desculpe o transtorno.', ARRAY['nome','modalidade','data','horario','motivo'], 'aula', true),
  (p_academy_id, 'aula_reposicao', 'Aula - Reposicao', '{nome}, temos uma aula de reposição de {modalidade} dia {data} às {horario}. Confirma presença?', ARRAY['nome','modalidade','data','horario'], 'aula', true),
  (p_academy_id, 'aula_falta', 'Aula - Falta', 'Oi {nome}, sentimos sua falta na aula de {modalidade} hoje! Tá tudo bem? Qualquer coisa, fale conosco. 💪', ARRAY['nome','modalidade'], 'aula', true),
  (p_academy_id, 'aula_semana_sem_treinar', 'Aula - Sem treinar', '{nome}, faz {dias} dias que você não treina. Sentimos sua falta! Bora voltar? A próxima aula é {proxima_aula}. 🥋', ARRAY['nome','dias','proxima_aula'], 'aula', true),
  -- EXPERIMENTAL (4)
  (p_academy_id, 'experimental_confirmacao', 'Experimental - Confirmacao', 'Olá {nome}! Sua aula experimental de {modalidade} está confirmada para {data} às {horario} na {academia}. Te esperamos! 🥋', ARRAY['nome','modalidade','data','horario','academia'], 'experimental', true),
  (p_academy_id, 'experimental_lembrete', 'Experimental - Lembrete', '{nome}, sua aula experimental é AMANHÃ! {data} às {horario}. Traga roupa confortável. Te esperamos!', ARRAY['nome','data','horario'], 'experimental', true),
  (p_academy_id, 'experimental_pos_aula', 'Experimental - Pos-aula', 'Oi {nome}! E aí, curtiu a aula experimental? 😊 Se quiser conhecer nossos planos, é só falar!', ARRAY['nome'], 'experimental', true),
  (p_academy_id, 'experimental_followup', 'Experimental - Follow-up', '{nome}, passaram alguns dias desde sua aula experimental. Quer agendar outra? Temos vaga {proxima_turma}!', ARRAY['nome','proxima_turma'], 'experimental', true),
  -- GRADUACAO (3)
  (p_academy_id, 'graduacao_aprovado', 'Graduacao - Aprovado', 'Parabéns {nome}!! 🎉🥋 Você foi aprovado para a faixa {faixa}! A cerimônia será dia {data}. Orgulho!', ARRAY['nome','faixa','data'], 'graduacao', true),
  (p_academy_id, 'graduacao_convite', 'Graduacao - Convite', '{nome}, você está convidado para a cerimônia de graduação dia {data} às {horario}. Será especial! 🎉', ARRAY['nome','data','horario'], 'graduacao', true),
  (p_academy_id, 'graduacao_foto', 'Graduacao - Fotos', 'Olha que momento! A graduação de ontem foi incrível! Fotos disponíveis em {link}. 🥋🎉', ARRAY['link'], 'graduacao', true),
  -- ANIVERSARIO (2)
  (p_academy_id, 'aniversario', 'Aniversario', 'Feliz aniversário, {nome}! 🎂🎉 A família {academia} deseja tudo de melhor. Bons treinos no novo ano de vida! 🥋', ARRAY['nome','academia'], 'aniversario', true),
  (p_academy_id, 'aniversario_academia', 'Aniversario de academia', 'Oi {nome}! Hoje faz {meses} meses que você treina conosco! Obrigado pela confiança. OSS! 🥋💪', ARRAY['nome','meses'], 'aniversario', true),
  -- BOAS_VINDAS (2)
  (p_academy_id, 'boas_vindas', 'Boas-vindas', 'Seja bem-vindo à {academia}, {nome}! 🥋 Sua primeira aula: {modalidade} dia {data} às {horario}. Te esperamos!', ARRAY['nome','academia','modalidade','data','horario'], 'boas_vindas', true),
  (p_academy_id, 'boas_vindas_app', 'Boas-vindas - App', 'Oi {nome}! Baixe o app BlackBelt para acompanhar suas aulas, evolução e conquistas: {link} 📱', ARRAY['nome','link'], 'boas_vindas', true),
  -- EVENTO (3)
  (p_academy_id, 'evento_convite', 'Evento - Convite', '{nome}, você está convidado para: {evento} — {data} às {horario}. {descricao}. Confirma presença?', ARRAY['nome','evento','data','horario','descricao'], 'evento', true),
  (p_academy_id, 'evento_lembrete', 'Evento - Lembrete', 'Lembrete: {evento} é AMANHÃ! {data} às {horario}. {local}. Te esperamos!', ARRAY['evento','data','horario','local'], 'evento', true),
  (p_academy_id, 'evento_resultado', 'Evento - Resultado', 'Parabéns aos participantes do {evento}! Resultados: {link}. Obrigado a todos! 🏆', ARRAY['evento','link'], 'evento', true),
  -- GERAL (4)
  (p_academy_id, 'aviso_geral', 'Aviso geral', '{academia} informa: {mensagem}', ARRAY['academia','mensagem'], 'geral', true),
  (p_academy_id, 'horario_especial', 'Horario especial', 'Atenção {nome}: nosso horário será especial dia {data}. {detalhes}. Obrigado pela compreensão!', ARRAY['nome','data','detalhes'], 'geral', true),
  (p_academy_id, 'ferias', 'Ferias', 'Oi {nome}! A {academia} estará em recesso de {data_inicio} a {data_fim}. Boas férias e bons treinos! 🏖️🥋', ARRAY['nome','academia','data_inicio','data_fim'], 'geral', true),
  (p_academy_id, 'reativacao', 'Reativacao', 'Oi {nome}, sentimos sua falta! 😊 Que tal voltar a treinar? Temos novidades: {novidade}. Te esperamos de volta! 🥋', ARRAY['nome','novidade'], 'geral', true);

  -- ── 12 Default Automations ──
  INSERT INTO whatsapp_automations (academy_id, trigger_name, template_slug, description, active, delay_hours) VALUES
  (p_academy_id, 'mensalidade_vence_3d', 'cobranca_vencendo', 'Mensalidade vence em 3 dias → envia lembrete com PIX', true, 0),
  (p_academy_id, 'mensalidade_venceu', 'cobranca_vencida', 'Mensalidade venceu ontem → aviso amigável', true, 0),
  (p_academy_id, 'mensalidade_atrasada_7d', 'cobranca_atrasada_7d', 'Mensalidade 7 dias atrasada → lembrete com PIX', true, 0),
  (p_academy_id, 'experimental_agendada', 'experimental_confirmacao', 'Experimental agendada → confirmação imediata', true, 0),
  (p_academy_id, 'experimental_vespera', 'experimental_lembrete', 'Experimental amanhã → lembrete na véspera', true, 0),
  (p_academy_id, 'experimental_pos_aula', 'experimental_pos_aula', 'Experimental feita, não matriculou → follow-up 24h', true, 24),
  (p_academy_id, 'experimental_followup_5d', 'experimental_followup', 'Experimental feita, não matriculou → follow-up 5 dias', true, 120),
  (p_academy_id, 'sem_treinar_7d', 'aula_semana_sem_treinar', 'Aluno não treina há 7 dias → mensagem de reativação', false, 0),
  (p_academy_id, 'aniversario_aluno', 'aniversario', 'Aniversário do aluno → mensagem às 8h da manhã', true, 0),
  (p_academy_id, 'aniversario_academia', 'aniversario_academia', 'Mesversário de academia → mensagem mensal', true, 0),
  (p_academy_id, 'graduacao_aprovada', 'graduacao_aprovado', 'Graduação aprovada → parabéns imediato', true, 0),
  (p_academy_id, 'aula_lembrete', 'aula_lembrete_hoje', 'Lembrete de aula no dia → enviado 2h antes', true, 0);

END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- PART 4: SEED ALL EXISTING ACADEMIES
-- Runs seed_whatsapp_for_academy() for every academy in the database
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.academies
  LOOP
    PERFORM public.seed_whatsapp_for_academy(rec.id);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- PART 5: AUTO-SEED TRIGGER
-- Automatically seeds WhatsApp data when a new academy is created
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.on_academy_created_seed_sales()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_whatsapp_for_academy(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_academy_seed_sales ON public.academies;
CREATE TRIGGER trg_academy_seed_sales
  AFTER INSERT ON public.academies
  FOR EACH ROW
  EXECUTE FUNCTION public.on_academy_created_seed_sales();

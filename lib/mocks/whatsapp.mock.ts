import type {
  WhatsAppConfig,
  WhatsAppTemplate,
  WhatsAppMessage,
  WhatsAppAutomation,
  WhatsAppStats,
  WhatsAppMessageFilters,
  ScheduledMessage,
} from '@/lib/api/whatsapp.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ── 30 System Templates ──────────────────────────────────────────

const SYSTEM_TEMPLATES: WhatsAppTemplate[] = [
  // COBRANCA (6)
  { id: 'tpl-01', slug: 'cobranca_vencendo', name: 'Cobranca - Vencendo', text: 'Ola {nome}! Sua mensalidade de R${valor} vence dia {data}. PIX: {chave_pix}. Qualquer duvida, estamos aqui! 🥋', variables: ['nome', 'valor', 'data', 'chave_pix'], category: 'cobranca', isSystem: true, active: true },
  { id: 'tpl-02', slug: 'cobranca_vencida', name: 'Cobranca - Vencida', text: 'Oi {nome}, tudo bem? Sua mensalidade de R${valor} venceu dia {data}. Precisa de ajuda? Estamos a disposicao!', variables: ['nome', 'valor', 'data'], category: 'cobranca', isSystem: true, active: true },
  { id: 'tpl-03', slug: 'cobranca_atrasada_7d', name: 'Cobranca - 7 dias', text: 'Ola {nome}, notamos que o pagamento de {mes} esta pendente (R${valor}). Pode regularizar? Aceitamos PIX! 😊', variables: ['nome', 'mes', 'valor'], category: 'cobranca', isSystem: true, active: true },
  { id: 'tpl-04', slug: 'cobranca_atrasada_15d', name: 'Cobranca - 15 dias', text: 'Oi {nome}, sua mensalidade de {mes} esta em atraso. Vamos resolver? Fale comigo!', variables: ['nome', 'mes'], category: 'cobranca', isSystem: true, active: true },
  { id: 'tpl-05', slug: 'cobranca_link_pagamento', name: 'Cobranca - Link', text: 'Ola {nome}! Segue o link para pagamento: {link}. Valor: R${valor}. Vence dia {data}.', variables: ['nome', 'link', 'valor', 'data'], category: 'cobranca', isSystem: true, active: true },
  { id: 'tpl-06', slug: 'cobranca_confirmacao', name: 'Cobranca - Confirmacao', text: 'Recebemos seu pagamento de R${valor}! Obrigado, {nome}! Bons treinos! 🥋✅', variables: ['nome', 'valor'], category: 'cobranca', isSystem: true, active: true },
  // AULA (6)
  { id: 'tpl-07', slug: 'aula_lembrete_amanha', name: 'Aula - Lembrete amanha', text: 'Oi {nome}! Lembrete: sua aula de {modalidade} e amanha as {horario}. Te esperamos! 🥋', variables: ['nome', 'modalidade', 'horario'], category: 'aula', isSystem: true, active: true },
  { id: 'tpl-08', slug: 'aula_lembrete_hoje', name: 'Aula - Lembrete hoje', text: '{nome}, sua aula de {modalidade} e HOJE as {horario}! Nao esqueca o kimono! 💪', variables: ['nome', 'modalidade', 'horario'], category: 'aula', isSystem: true, active: true },
  { id: 'tpl-09', slug: 'aula_cancelada', name: 'Aula - Cancelada', text: 'Atencao {nome}: a aula de {modalidade} de {data} as {horario} foi cancelada. {motivo}. Desculpe o transtorno.', variables: ['nome', 'modalidade', 'data', 'horario', 'motivo'], category: 'aula', isSystem: true, active: true },
  { id: 'tpl-10', slug: 'aula_reposicao', name: 'Aula - Reposicao', text: '{nome}, temos uma aula de reposicao de {modalidade} dia {data} as {horario}. Confirma presenca?', variables: ['nome', 'modalidade', 'data', 'horario'], category: 'aula', isSystem: true, active: true },
  { id: 'tpl-11', slug: 'aula_falta', name: 'Aula - Falta', text: 'Oi {nome}, sentimos sua falta na aula de {modalidade} hoje! Ta tudo bem? Qualquer coisa, fale conosco. 💪', variables: ['nome', 'modalidade'], category: 'aula', isSystem: true, active: true },
  { id: 'tpl-12', slug: 'aula_semana_sem_treinar', name: 'Aula - Sem treinar', text: '{nome}, faz {dias} dias que voce nao treina. Sentimos sua falta! Bora voltar? A proxima aula e {proxima_aula}. 🥋', variables: ['nome', 'dias', 'proxima_aula'], category: 'aula', isSystem: true, active: true },
  // EXPERIMENTAL (4)
  { id: 'tpl-13', slug: 'experimental_confirmacao', name: 'Experimental - Confirmacao', text: 'Ola {nome}! Sua aula experimental de {modalidade} esta confirmada para {data} as {horario} na {academia}. Te esperamos! 🥋', variables: ['nome', 'modalidade', 'data', 'horario', 'academia'], category: 'experimental', isSystem: true, active: true },
  { id: 'tpl-14', slug: 'experimental_lembrete', name: 'Experimental - Lembrete', text: '{nome}, sua aula experimental e AMANHA! {data} as {horario}. Traga roupa confortavel. Te esperamos!', variables: ['nome', 'data', 'horario'], category: 'experimental', isSystem: true, active: true },
  { id: 'tpl-15', slug: 'experimental_pos_aula', name: 'Experimental - Pos-aula', text: 'Oi {nome}! E ai, curtiu a aula experimental? 😊 Se quiser conhecer nossos planos, e so falar!', variables: ['nome'], category: 'experimental', isSystem: true, active: true },
  { id: 'tpl-16', slug: 'experimental_followup', name: 'Experimental - Follow-up', text: '{nome}, passaram alguns dias desde sua aula experimental. Quer agendar outra? Temos vaga {proxima_turma}!', variables: ['nome', 'proxima_turma'], category: 'experimental', isSystem: true, active: true },
  // GRADUACAO (3)
  { id: 'tpl-17', slug: 'graduacao_aprovado', name: 'Graduacao - Aprovado', text: 'Parabens {nome}!! 🎉🥋 Voce foi aprovado para a faixa {faixa}! A cerimonia sera dia {data}. Orgulho!', variables: ['nome', 'faixa', 'data'], category: 'graduacao', isSystem: true, active: true },
  { id: 'tpl-18', slug: 'graduacao_convite', name: 'Graduacao - Convite', text: '{nome}, voce esta convidado para a cerimonia de graduacao dia {data} as {horario}. Sera especial! 🎉', variables: ['nome', 'data', 'horario'], category: 'graduacao', isSystem: true, active: true },
  { id: 'tpl-19', slug: 'graduacao_foto', name: 'Graduacao - Fotos', text: 'Olha que momento! A graduacao de ontem foi incrivel! Fotos disponiveis em {link}. 🥋🎉', variables: ['link'], category: 'graduacao', isSystem: true, active: true },
  // ANIVERSARIO (2)
  { id: 'tpl-20', slug: 'aniversario', name: 'Aniversario', text: 'Feliz aniversario, {nome}! 🎂🎉 A familia {academia} deseja tudo de melhor. Bons treinos no novo ano de vida! 🥋', variables: ['nome', 'academia'], category: 'aniversario', isSystem: true, active: true },
  { id: 'tpl-21', slug: 'aniversario_academia', name: 'Aniversario de academia', text: 'Oi {nome}! Hoje faz {meses} meses que voce treina conosco! Obrigado pela confianca. OSS! 🥋💪', variables: ['nome', 'meses'], category: 'aniversario', isSystem: true, active: true },
  // BOAS-VINDAS (2)
  { id: 'tpl-22', slug: 'boas_vindas', name: 'Boas-vindas', text: 'Seja bem-vindo a {academia}, {nome}! 🥋 Sua primeira aula: {modalidade} dia {data} as {horario}. Te esperamos!', variables: ['nome', 'academia', 'modalidade', 'data', 'horario'], category: 'boas_vindas', isSystem: true, active: true },
  { id: 'tpl-23', slug: 'boas_vindas_app', name: 'Boas-vindas - App', text: 'Oi {nome}! Baixe o app BlackBelt para acompanhar suas aulas, evolucao e conquistas: {link} 📱', variables: ['nome', 'link'], category: 'boas_vindas', isSystem: true, active: true },
  // EVENTOS (3)
  { id: 'tpl-24', slug: 'evento_convite', name: 'Evento - Convite', text: '{nome}, voce esta convidado para: {evento} — {data} as {horario}. {descricao}. Confirma presenca?', variables: ['nome', 'evento', 'data', 'horario', 'descricao'], category: 'evento', isSystem: true, active: true },
  { id: 'tpl-25', slug: 'evento_lembrete', name: 'Evento - Lembrete', text: 'Lembrete: {evento} e AMANHA! {data} as {horario}. {local}. Te esperamos!', variables: ['evento', 'data', 'horario', 'local'], category: 'evento', isSystem: true, active: true },
  { id: 'tpl-26', slug: 'evento_resultado', name: 'Evento - Resultado', text: 'Parabens aos participantes do {evento}! Resultados: {link}. Obrigado a todos! 🏆', variables: ['evento', 'link'], category: 'evento', isSystem: true, active: true },
  // GERAL (4)
  { id: 'tpl-27', slug: 'aviso_geral', name: 'Aviso geral', text: '{academia} informa: {mensagem}', variables: ['academia', 'mensagem'], category: 'geral', isSystem: true, active: true },
  { id: 'tpl-28', slug: 'horario_especial', name: 'Horario especial', text: 'Atencao {nome}: nosso horario sera especial dia {data}. {detalhes}. Obrigado pela compreensao!', variables: ['nome', 'data', 'detalhes'], category: 'geral', isSystem: true, active: true },
  { id: 'tpl-29', slug: 'ferias', name: 'Ferias', text: 'Oi {nome}! A {academia} estara em recesso de {data_inicio} a {data_fim}. Boas ferias e bons treinos! 🏖️🥋', variables: ['nome', 'academia', 'data_inicio', 'data_fim'], category: 'geral', isSystem: true, active: true },
  { id: 'tpl-30', slug: 'reativacao', name: 'Reativacao', text: 'Oi {nome}, sentimos sua falta! 😊 Que tal voltar a treinar? Temos novidades: {novidade}. Te esperamos de volta! 🥋', variables: ['nome', 'novidade'], category: 'geral', isSystem: true, active: true },
];

// ── Mock Message History ──────────────────────────────────────────

const MOCK_MESSAGES: WhatsAppMessage[] = [
  { id: 'msg-1', to: '5531999990001', toName: 'Joao Mendes', template: 'aula_lembrete_hoje', variables: { nome: 'Joao', modalidade: 'BJJ', horario: '19:00' }, status: 'read', sentAt: '2026-03-17T14:00:00Z', deliveredAt: '2026-03-17T14:00:05Z', readAt: '2026-03-17T14:05:00Z', createdAt: '2026-03-17T14:00:00Z' },
  { id: 'msg-2', to: '5531999990002', toName: 'Maria Santos', template: 'cobranca_vencendo', variables: { nome: 'Maria', valor: '179', data: '20/03', chave_pix: '11.222.333/0001-44' }, status: 'delivered', sentAt: '2026-03-17T10:00:00Z', deliveredAt: '2026-03-17T10:00:03Z', createdAt: '2026-03-17T10:00:00Z' },
  { id: 'msg-3', to: '5531999990003', toName: 'Pedro Oliveira', template: 'experimental_confirmacao', variables: { nome: 'Pedro', modalidade: 'Muay Thai', data: '19/03', horario: '18:00', academia: 'Guerreiros do Tatame' }, status: 'sent', sentAt: '2026-03-17T09:00:00Z', createdAt: '2026-03-17T09:00:00Z' },
  { id: 'msg-4', to: '5531999990004', toName: 'Ana Souza', template: 'cobranca_vencida', variables: { nome: 'Ana', valor: '199', data: '15/03' }, status: 'read', sentAt: '2026-03-16T11:00:00Z', deliveredAt: '2026-03-16T11:00:04Z', readAt: '2026-03-16T12:30:00Z', createdAt: '2026-03-16T11:00:00Z' },
  { id: 'msg-5', to: '5531999990005', toName: 'Lucas Ferreira', template: 'graduacao_aprovado', variables: { nome: 'Lucas', faixa: 'Azul', data: '25/03' }, status: 'read', sentAt: '2026-03-16T08:00:00Z', deliveredAt: '2026-03-16T08:00:02Z', readAt: '2026-03-16T08:15:00Z', createdAt: '2026-03-16T08:00:00Z' },
  { id: 'msg-6', to: '5531999990006', toName: 'Carla Lima', template: 'aniversario', variables: { nome: 'Carla', academia: 'Guerreiros do Tatame' }, status: 'delivered', sentAt: '2026-03-16T08:00:00Z', deliveredAt: '2026-03-16T08:00:05Z', createdAt: '2026-03-16T08:00:00Z' },
  { id: 'msg-7', to: '5531999990007', toName: 'Roberto Silva', template: 'aula_semana_sem_treinar', variables: { nome: 'Roberto', dias: '8', proxima_aula: 'Seg 19h BJJ' }, status: 'failed', error: 'Numero invalido', createdAt: '2026-03-15T14:00:00Z' },
  { id: 'msg-8', to: '5531999990008', toName: 'Fernanda Costa', template: 'boas_vindas', variables: { nome: 'Fernanda', academia: 'Guerreiros do Tatame', modalidade: 'Judo', data: '18/03', horario: '17:00' }, status: 'read', sentAt: '2026-03-15T10:00:00Z', deliveredAt: '2026-03-15T10:00:03Z', readAt: '2026-03-15T10:20:00Z', createdAt: '2026-03-15T10:00:00Z' },
  { id: 'msg-9', to: '5531999990009', toName: 'Thiago Rocha', template: 'cobranca_atrasada_7d', variables: { nome: 'Thiago', mes: 'Marco', valor: '179' }, status: 'delivered', sentAt: '2026-03-15T09:00:00Z', deliveredAt: '2026-03-15T09:00:04Z', createdAt: '2026-03-15T09:00:00Z' },
  { id: 'msg-10', to: '5531999990010', toName: 'Juliana Alves', template: 'evento_convite', variables: { nome: 'Juliana', evento: 'Open Mat Marco', data: '22/03', horario: '10:00', descricao: 'Treino aberto para todas as faixas' }, status: 'read', sentAt: '2026-03-14T16:00:00Z', deliveredAt: '2026-03-14T16:00:02Z', readAt: '2026-03-14T17:00:00Z', createdAt: '2026-03-14T16:00:00Z' },
];

// ── Mock Automations ─────────────────────────────────────────────

const MOCK_AUTOMATIONS: WhatsAppAutomation[] = [
  { id: 'auto-1', triggerName: 'mensalidade_vence_3d', templateSlug: 'cobranca_vencendo', description: 'Mensalidade vence em 3 dias → envia lembrete com PIX', active: true, delayHours: 0 },
  { id: 'auto-2', triggerName: 'mensalidade_venceu', templateSlug: 'cobranca_vencida', description: 'Mensalidade venceu ontem → aviso amigavel', active: true, delayHours: 0 },
  { id: 'auto-3', triggerName: 'mensalidade_atrasada_7d', templateSlug: 'cobranca_atrasada_7d', description: 'Mensalidade 7 dias atrasada → lembrete com PIX', active: true, delayHours: 0 },
  { id: 'auto-4', triggerName: 'experimental_agendada', templateSlug: 'experimental_confirmacao', description: 'Experimental agendada → confirmacao imediata', active: true, delayHours: 0 },
  { id: 'auto-5', triggerName: 'experimental_vespera', templateSlug: 'experimental_lembrete', description: 'Experimental amanha → lembrete na vespera', active: true, delayHours: 0 },
  { id: 'auto-6', triggerName: 'experimental_pos_aula', templateSlug: 'experimental_pos_aula', description: 'Experimental feita, nao matriculou → follow-up 24h', active: true, delayHours: 24 },
  { id: 'auto-7', triggerName: 'experimental_followup_5d', templateSlug: 'experimental_followup', description: 'Experimental feita, nao matriculou → follow-up 5 dias', active: true, delayHours: 120 },
  { id: 'auto-8', triggerName: 'sem_treinar_7d', templateSlug: 'aula_semana_sem_treinar', description: 'Aluno nao treina ha 7 dias → mensagem de reativacao', active: false, delayHours: 0 },
  { id: 'auto-9', triggerName: 'aniversario_aluno', templateSlug: 'aniversario', description: 'Aniversario do aluno → mensagem as 8h da manha', active: true, delayHours: 0 },
  { id: 'auto-10', triggerName: 'aniversario_academia', templateSlug: 'aniversario_academia', description: 'Mesversario de academia → mensagem mensal', active: true, delayHours: 0 },
  { id: 'auto-11', triggerName: 'graduacao_aprovada', templateSlug: 'graduacao_aprovado', description: 'Graduacao aprovada → parabens imediato', active: true, delayHours: 0 },
  { id: 'auto-12', triggerName: 'aula_lembrete', templateSlug: 'aula_lembrete_hoje', description: 'Lembrete de aula no dia → enviado 2h antes', active: true, delayHours: 0 },
];

// ── Mock Functions ────────────────────────────────────────────────

export async function mockGetWhatsAppConfig(_academyId: string): Promise<WhatsAppConfig> {
  await delay();
  return {
    provider: 'mock',
    apiKey: '',
    instanceId: '',
    phoneNumber: '5531999998888',
    academyId: _academyId,
    allowedHoursStart: 8,
    allowedHoursEnd: 21,
    active: true,
  };
}

export async function mockSaveWhatsAppConfig(_academyId: string, _config: Partial<WhatsAppConfig>): Promise<void> {
  await delay();
}

export async function mockGetTemplates(_academyId: string): Promise<WhatsAppTemplate[]> {
  await delay();
  return SYSTEM_TEMPLATES;
}

export async function mockCreateCustomTemplate(_academyId: string, name: string, slug: string, text: string, category: WhatsAppTemplate['category'], variables: string[]): Promise<WhatsAppTemplate> {
  await delay();
  return { id: `tpl-custom-${Date.now()}`, slug, name, text, variables, category, isSystem: false, active: true };
}

export async function mockSendMessage(_academyId: string, to: string, toName: string, templateSlug: string, variables: Record<string, string>): Promise<WhatsAppMessage> {
  await delay();
  return { id: `msg-${Date.now()}`, to, toName, template: templateSlug, variables, status: 'sent', sentAt: new Date().toISOString(), createdAt: new Date().toISOString() };
}

export async function mockSendBulk(_academyId: string, recipients: { phone: string; name: string }[], templateSlug: string, variables: Record<string, string>): Promise<WhatsAppMessage[]> {
  await delay();
  return recipients.map((r, i) => ({
    id: `msg-bulk-${Date.now()}-${i}`,
    to: r.phone,
    toName: r.name,
    template: templateSlug,
    variables,
    status: 'sent' as const,
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }));
}

export async function mockGetMessageHistory(_academyId: string, _filters?: WhatsAppMessageFilters): Promise<WhatsAppMessage[]> {
  await delay();
  let msgs = [...MOCK_MESSAGES];
  if (_filters?.status) msgs = msgs.filter((m) => m.status === _filters.status);
  if (_filters?.template) msgs = msgs.filter((m) => m.template === _filters.template);
  return msgs;
}

export async function mockGetMessageStats(_academyId: string): Promise<WhatsAppStats> {
  await delay();
  return { sent: 340, delivered: 325, read: 280, failed: 15, deliveryRate: 95, readRate: 82 };
}

export async function mockGetAutomations(_academyId: string): Promise<WhatsAppAutomation[]> {
  await delay();
  return MOCK_AUTOMATIONS;
}

export async function mockToggleAutomation(_automationId: string, _active: boolean): Promise<void> {
  await delay();
}

export async function mockScheduleMessage(_academyId: string, to: string, _toName: string, templateSlug: string, variables: Record<string, string>, sendAt: string): Promise<ScheduledMessage> {
  await delay();
  return { id: `sched-${Date.now()}`, to, template: templateSlug, variables, sendAt, status: 'scheduled' };
}

export async function mockCancelScheduled(_messageId: string): Promise<void> {
  await delay();
}

export async function mockTestConnection(_config: Partial<WhatsAppConfig>): Promise<boolean> {
  await delay();
  return true;
}

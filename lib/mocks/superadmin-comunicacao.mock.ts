import type { ComunicadoSaaS, StatusComunicado, CreateComunicadoPayload } from '@/lib/api/superadmin-comunicacao.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const COMUNICADOS: ComunicadoSaaS[] = [
  { id: 'com-1', titulo: 'Manutenção programada dia 20/03', mensagem: 'Informamos que no dia 20/03 (sábado) das 02h às 06h haverá manutenção programada no sistema. Durante este período o acesso poderá ficar intermitente. Pedimos desculpas pelo inconveniente.', tipo: 'manutencao', segmentacao: { tipo: 'todos' }, canal: ['email', 'in_app'], status: 'enviado', enviadoEm: '2026-03-15T10:00:00Z', metricas: { totalDestinatarios: 62, entregues: 62, abertos: 59, clicados: 12 }, criadoEm: '2026-03-14T16:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-2', titulo: 'Nova feature: Contratos Digitais', mensagem: 'Agora você pode gerar contratos digitais com assinatura eletrônica diretamente pelo BlackBelt! Crie templates personalizados, envie por email ou WhatsApp e acompanhe o status em tempo real.', tipo: 'novidade', segmentacao: { tipo: 'por_plano', filtro: 'plano:pro,blackbelt,enterprise' }, canal: ['email', 'push', 'in_app'], status: 'enviado', enviadoEm: '2026-03-10T09:00:00Z', metricas: { totalDestinatarios: 32, entregues: 32, abertos: 23, clicados: 15 }, criadoEm: '2026-03-09T14:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-3', titulo: 'Seu trial expira em 2 dias', mensagem: 'Seu período de teste está acabando! Não perca acesso a todas as funcionalidades. Escolha um plano agora e garanta a continuidade do seu trabalho. Use o código BLACKFRIDAY para 20% off no primeiro mês.', tipo: 'urgente', segmentacao: { tipo: 'por_feature', filtro: 'status:trial' }, canal: ['email', 'push'], status: 'enviado', enviadoEm: '2026-03-08T08:00:00Z', metricas: { totalDestinatarios: 5, entregues: 5, abertos: 5, clicados: 3 }, criadoEm: '2026-03-07T16:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-4', titulo: 'Relatório de Performance - Fevereiro', mensagem: 'Confira o relatório mensal de performance da sua academia. Acesse o dashboard para ver métricas detalhadas de presença, receita e crescimento.', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['email'], status: 'enviado', enviadoEm: '2026-03-01T09:00:00Z', metricas: { totalDestinatarios: 62, entregues: 60, abertos: 42, clicados: 28 }, criadoEm: '2026-02-28T15:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-5', titulo: 'Webinar: Como aumentar retenção de alunos', mensagem: 'Participe do nosso webinar gratuito sobre estratégias de retenção. Data: 25/03 às 19h. Inscreva-se pelo link no app.', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['email', 'in_app'], status: 'enviado', enviadoEm: '2026-02-20T10:00:00Z', metricas: { totalDestinatarios: 58, entregues: 58, abertos: 35, clicados: 18 }, criadoEm: '2026-02-19T14:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-6', titulo: 'Atualização de Segurança Importante', mensagem: 'Realizamos uma atualização de segurança importante. Todas as sessões foram renovadas. Se necessário, faça login novamente.', tipo: 'urgente', segmentacao: { tipo: 'todos' }, canal: ['email', 'push', 'in_app'], status: 'enviado', enviadoEm: '2026-02-15T07:00:00Z', metricas: { totalDestinatarios: 56, entregues: 56, abertos: 52, clicados: 8 }, criadoEm: '2026-02-15T06:30:00Z', criadoPor: 'Gregory' },
  { id: 'com-7', titulo: 'Nova Integração: WhatsApp Business', mensagem: 'Agora você pode enviar notificações automáticas via WhatsApp para seus alunos! Configure na aba Configurações > Integrações.', tipo: 'novidade', segmentacao: { tipo: 'por_plano', filtro: 'plano:pro,blackbelt,enterprise' }, canal: ['email', 'in_app'], status: 'enviado', enviadoEm: '2026-02-05T10:00:00Z', metricas: { totalDestinatarios: 30, entregues: 30, abertos: 22, clicados: 14 }, criadoEm: '2026-02-04T16:00:00Z', criadoPor: 'Gregory' },
  // RASCUNHOS
  { id: 'com-8', titulo: 'Oferta especial: upgrade com 20% off', mensagem: 'Por tempo limitado, faça upgrade do seu plano com 20% de desconto no primeiro trimestre! Aproveite features avançadas como gamificação, streaming e contratos digitais.', tipo: 'promocao', segmentacao: { tipo: 'por_plano', filtro: 'plano:starter' }, canal: ['email', 'push'], status: 'rascunho', metricas: { totalDestinatarios: 30, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '2026-03-16T14:00:00Z', criadoPor: 'Gregory' },
  { id: 'com-9', titulo: 'Pesquisa de Satisfação - NPS', mensagem: 'Queremos ouvir você! Responda nossa pesquisa rápida (2 min) e nos ajude a melhorar o BlackBelt. Como recompensa, ganhe 1 mês grátis na próxima renovação.', tipo: 'informativo', segmentacao: { tipo: 'por_health', filtro: 'health:>60' }, canal: ['email'], status: 'rascunho', metricas: { totalDestinatarios: 34, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '2026-03-16T10:00:00Z', criadoPor: 'Gregory' },
  // AGENDADO
  { id: 'com-10', titulo: 'Lembrete: Webinar amanhã às 19h', mensagem: 'Não esqueça! Amanhã às 19h teremos o webinar sobre retenção de alunos. Link de acesso no email anterior.', tipo: 'informativo', segmentacao: { tipo: 'todos' }, canal: ['push', 'in_app'], status: 'agendado', agendadoPara: '2026-03-24T17:00:00Z', metricas: { totalDestinatarios: 62, entregues: 0, abertos: 0, clicados: 0 }, criadoEm: '2026-03-16T12:00:00Z', criadoPor: 'Gregory' },
];

export async function mockListComunicados(status?: StatusComunicado): Promise<ComunicadoSaaS[]> {
  await delay(400);
  if (status) return COMUNICADOS.filter((c) => c.status === status).map((c) => ({ ...c }));
  return COMUNICADOS.map((c) => ({ ...c }));
}

export async function mockCreateComunicado(data: CreateComunicadoPayload): Promise<ComunicadoSaaS> {
  await delay(400);
  const comunicado: ComunicadoSaaS = {
    ...data,
    id: `com-${Date.now()}`,
    status: 'rascunho',
    metricas: { totalDestinatarios: 62, entregues: 0, abertos: 0, clicados: 0 },
    criadoEm: new Date().toISOString(),
    criadoPor: 'Gregory',
  };
  COMUNICADOS.push(comunicado);
  return { ...comunicado };
}

export async function mockEnviarComunicado(id: string): Promise<ComunicadoSaaS> {
  await delay(500);
  const c = COMUNICADOS.find((c) => c.id === id);
  if (c) {
    c.status = 'enviado';
    c.enviadoEm = new Date().toISOString();
    c.metricas.entregues = c.metricas.totalDestinatarios;
  }
  return { ...(c ?? COMUNICADOS[0]) };
}

export async function mockDeleteComunicado(id: string): Promise<void> {
  await delay(300);
  const idx = COMUNICADOS.findIndex((c) => c.id === id);
  if (idx !== -1) COMUNICADOS.splice(idx, 1);
}

import type { AutomationConfig } from '@/lib/types/notification';

const delay = () => new Promise((r) => setTimeout(r, 200));

const AUTOMATIONS: AutomationConfig[] = [
  { id: 'auto-1', name: 'Boas-vindas', description: 'Enviar mensagem quando aluno se matricula', enabled: true, channels: ['push', 'email', 'in_app'], template: 'boas_vindas', lastRunAt: '2026-03-14T08:30:00Z', triggerCount: 23 },
  { id: 'auto-2', name: 'Lembrete de Aula', description: '30min antes, push + WhatsApp', enabled: true, channels: ['push', 'whatsapp'], template: 'aula_em_breve', lastRunAt: '2026-03-15T09:00:00Z', triggerCount: 156 },
  { id: 'auto-3', name: 'Falta Detectada', description: 'Se aluno não veio na aula regular, enviar no dia seguinte', enabled: true, channels: ['push', 'in_app'], template: 'falta_detectada', lastRunAt: '2026-03-14T20:00:00Z', triggerCount: 42 },
  { id: 'auto-4', name: 'Inatividade 7 dias', description: 'Mensagem de incentivo após 7 dias sem presença', enabled: true, channels: ['push', 'whatsapp'], template: 'inatividade', lastRunAt: '2026-03-13T10:00:00Z', triggerCount: 18 },
  { id: 'auto-5', name: 'Inatividade 14 dias', description: 'Mensagem do professor + alerta admin', enabled: false, channels: ['push', 'email', 'in_app'], template: 'inatividade', lastRunAt: '2026-03-10T10:00:00Z', triggerCount: 5 },
  { id: 'auto-6', name: 'Aniversário', description: 'Mensagem de parabéns no dia do aniversário', enabled: true, channels: ['push', 'whatsapp'], template: 'aniversario', lastRunAt: '2026-03-12T07:00:00Z', triggerCount: 8 },
  { id: 'auto-7', name: 'Fatura Vencendo', description: '3 dias antes, no dia, D+1, D+5', enabled: true, channels: ['push', 'email', 'whatsapp'], template: 'fatura_vencendo', lastRunAt: '2026-03-15T06:00:00Z', triggerCount: 210 },
  { id: 'auto-8', name: 'Promoção de Faixa', description: 'Notificar aluno + responsável + registrar no feed', enabled: true, channels: ['push', 'email', 'in_app'], template: 'promocao_faixa', lastRunAt: '2026-03-08T15:00:00Z', triggerCount: 12 },
  { id: 'auto-9', name: 'Conquista Nova', description: 'Push + in-app quando aluno desbloqueia conquista', enabled: true, channels: ['push', 'in_app'], template: 'conquista_nova', lastRunAt: '2026-03-14T16:30:00Z', triggerCount: 67 },
  { id: 'auto-10', name: 'Relatório Mensal', description: 'Email para responsáveis no dia 1 de cada mês', enabled: true, channels: ['email'], template: 'relatorio_mensal', lastRunAt: '2026-03-01T07:00:00Z', triggerCount: 45 },
];

export async function mockListAutomations(_academyId: string): Promise<AutomationConfig[]> {
  await delay();
  return AUTOMATIONS.map((a) => ({ ...a }));
}

export async function mockToggleAutomation(id: string, enabled: boolean): Promise<AutomationConfig> {
  await delay();
  const auto = AUTOMATIONS.find((a) => a.id === id);
  if (!auto) throw new Error('Automation not found');
  auto.enabled = enabled;
  return { ...auto };
}

import type { MissionControlDTO } from '@/lib/api/superadmin-dashboard.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const DATA: MissionControlDTO = {
  kpis: {
    mrr: 12450,
    mrrVariacao: 8.2,
    arr: 149400,
    totalAcademias: 72,
    academiasAtivas: 62,
    academiasEmTrial: 8,
    academiasChurnMes: 2,
    totalAlunosPlataforma: 4200,
    ticketMedio: 200.81,
    churnRate: 3.2,
    ltv: 4800,
  },
  mrrHistorico: [
    { mes: 'Abr/25', valor: 7200 },
    { mes: 'Mai/25', valor: 7800 },
    { mes: 'Jun/25', valor: 8100 },
    { mes: 'Jul/25', valor: 8600 },
    { mes: 'Ago/25', valor: 9200 },
    { mes: 'Set/25', valor: 9500 },
    { mes: 'Out/25', valor: 9900 },
    { mes: 'Nov/25', valor: 10200 },
    { mes: 'Dez/25', valor: 10800 },
    { mes: 'Jan/26', valor: 11100 },
    { mes: 'Fev/26', valor: 11505 },
    { mes: 'Mar/26', valor: 12450 },
  ],
  crescimentoAcademias: [
    { mes: 'Abr/25', ativas: 38, novas: 5, churn: 1 },
    { mes: 'Mai/25', ativas: 40, novas: 4, churn: 2 },
    { mes: 'Jun/25', ativas: 42, novas: 3, churn: 1 },
    { mes: 'Jul/25', ativas: 44, novas: 4, churn: 2 },
    { mes: 'Ago/25', ativas: 47, novas: 5, churn: 2 },
    { mes: 'Set/25', ativas: 49, novas: 3, churn: 1 },
    { mes: 'Out/25', ativas: 51, novas: 4, churn: 2 },
    { mes: 'Nov/25', ativas: 53, novas: 4, churn: 2 },
    { mes: 'Dez/25', ativas: 55, novas: 3, churn: 1 },
    { mes: 'Jan/26', ativas: 58, novas: 5, churn: 2 },
    { mes: 'Fev/26', ativas: 60, novas: 4, churn: 2 },
    { mes: 'Mar/26', ativas: 62, novas: 4, churn: 2 },
  ],
  alertas: [
    { id: 'al-1', tipo: 'trial_expirando', titulo: 'Trial expira amanhã', descricao: 'Academia está no último dia de trial sem conversão.', academiaNome: 'Samurai Fight Club', academiaId: 'academy-samurai', urgencia: 'alta', criadoEm: '2026-03-17T06:00:00Z' },
    { id: 'al-2', tipo: 'trial_expirando', titulo: 'Trial expira amanhã', descricao: 'Nenhum pagamento registrado. Contato urgente.', academiaNome: 'Nova Era Martial Arts', academiaId: 'academy-nova-era', urgencia: 'alta', criadoEm: '2026-03-17T06:00:00Z' },
    { id: 'al-3', tipo: 'pagamento_falhou', titulo: 'Pagamento falhou', descricao: 'Cartão recusado na terceira tentativa.', academiaNome: 'Titans MMA', academiaId: 'academy-titans', urgencia: 'alta', criadoEm: '2026-03-16T14:30:00Z' },
    { id: 'al-4', tipo: 'churn_risco', titulo: 'Health Score crítico', descricao: 'Score caiu de 45 para 18 em 2 semanas. Admin não loga há 12 dias.', academiaNome: 'Fight Zone Academy', academiaId: 'academy-fightzone', urgencia: 'media', criadoEm: '2026-03-15T10:00:00Z' },
    { id: 'al-5', tipo: 'churn_risco', titulo: 'Health Score em queda', descricao: 'Perda de 8 alunos no mês. Inadimplência subiu para 22%.', academiaNome: 'Águia Dourada BJJ', academiaId: 'academy-aguia', urgencia: 'media', criadoEm: '2026-03-14T16:00:00Z' },
  ],
  topAcademias: [
    { id: 'academy-dragon', nome: 'Dragon Team MMA', plano: 'Enterprise', mrr: 499.90, alunos: 180, healthScore: 91 },
    { id: 'academy-alpha', nome: 'Alpha Fighters', plano: 'Black Belt', mrr: 499.90, alunos: 145, healthScore: 85 },
    { id: 'academy-guerreiros', nome: 'Guerreiros BJJ', plano: 'Pro', mrr: 299.90, alunos: 86, healthScore: 78 },
    { id: 'academy-iron', nome: 'Iron Fist Academy', plano: 'Pro', mrr: 299.90, alunos: 72, healthScore: 74 },
    { id: 'academy-bb-001', nome: 'BlackBelt Headquarters', plano: 'Black Belt', mrr: 499.90, alunos: 95, healthScore: 88 },
  ],
  academiasRisco: [
    { id: 'academy-fightzone', nome: 'Fight Zone Academy', healthScore: 18, motivoRisco: 'Admin não loga há 12 dias. 5 alunos cancelaram.', diasDesdeUltimoLogin: 12 },
    { id: 'academy-aguia', nome: 'Águia Dourada BJJ', healthScore: 25, motivoRisco: 'Inadimplência 22%. Perda de 8 alunos no mês.', diasDesdeUltimoLogin: 5 },
    { id: 'academy-cobra', nome: 'Cobra Kai Dojo', healthScore: 32, motivoRisco: 'Usa apenas 2 features. Nunca configurou financeiro.', diasDesdeUltimoLogin: 8 },
    { id: 'academy-lotus', nome: 'Lotus Martial Arts', healthScore: 38, motivoRisco: 'Downgrade de Pro para Starter. Alunos saindo.', diasDesdeUltimoLogin: 3 },
  ],
  distribuicaoPlanos: [
    { plano: 'Starter', quantidade: 30, receita: 2970 },
    { plano: 'Pro', quantidade: 22, receita: 6578 },
    { plano: 'Black Belt', quantidade: 8, receita: 3992 },
    { plano: 'Enterprise', quantidade: 2, receita: 910 },
  ],
};

export async function mockGetMissionControl(): Promise<MissionControlDTO> {
  await delay(500);
  return JSON.parse(JSON.stringify(DATA));
}

export async function mockResolverAlerta(alertaId: string): Promise<void> {
  await delay(300);
  const idx = DATA.alertas.findIndex((a) => a.id === alertaId);
  if (idx !== -1) DATA.alertas.splice(idx, 1);
}

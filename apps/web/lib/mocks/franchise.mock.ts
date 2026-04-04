import type {
  FranchiseAcademy,
  FranchiseNetwork,
  NetworkDashboard,
  NetworkFinancials,
  NetworkAlert,
  NetworkMessage,
  MonthlyRevenueByAcademy,
  BroadcastSummary,
  CurriculoItem,
  StandardItem,
  ExpansionData,
} from '@/lib/api/franchise.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const ACADEMIES: FranchiseAcademy[] = [
  { id: 'acad-1', name: 'Black Belt Moema', city: 'Sao Paulo - SP', students: 185, revenue: 62400, attendance_rate: 87, nps: 82, status: 'ativa' },
  { id: 'acad-2', name: 'Black Belt Alphaville', city: 'Barueri - SP', students: 142, revenue: 48900, attendance_rate: 79, nps: 75, status: 'ativa' },
  { id: 'acad-3', name: 'Black Belt Barra', city: 'Rio de Janeiro - RJ', students: 198, revenue: 71200, attendance_rate: 91, nps: 88, status: 'ativa' },
  { id: 'acad-4', name: 'Black Belt Savassi', city: 'Belo Horizonte - MG', students: 96, revenue: 32100, attendance_rate: 68, nps: 62, status: 'inadimplente' },
  { id: 'acad-5', name: 'Black Belt Moinhos', city: 'Porto Alegre - RS', students: 121, revenue: 41800, attendance_rate: 83, nps: 79, status: 'ativa' },
];

const MONTHS_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function generateMonthlyData(): MonthlyRevenueByAcademy[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const month = `${MONTHS_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    const academies = ACADEMIES.map((a) => ({
      academy_id: a.id,
      academy_name: a.name,
      revenue: Math.round(a.revenue * (0.85 + Math.random() * 0.3)),
    }));
    return {
      month,
      academies,
      total: academies.reduce((s, a) => s + a.revenue, 0),
    };
  });
}

function generateAlerts(): NetworkAlert[] {
  return [
    { id: 'alert-1', type: 'high_churn', academy_id: 'acad-4', academy_name: 'Black Belt Savassi', message: 'Taxa de churn de 12% no ultimo mes - acima do limite de 8%', severity: 'critical', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'alert-2', type: 'overdue', academy_id: 'acad-4', academy_name: 'Black Belt Savassi', message: 'Royalties de fevereiro em atraso ha 15 dias', severity: 'critical', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'alert-3', type: 'attendance_drop', academy_id: 'acad-2', academy_name: 'Black Belt Alphaville', message: 'Frequencia caiu 8% nas ultimas 4 semanas', severity: 'warning', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'alert-4', type: 'low_nps', academy_id: 'acad-4', academy_name: 'Black Belt Savassi', message: 'NPS de 62 - abaixo do padrao minimo da rede (70)', severity: 'warning', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  ];
}

// ====================================================================
// 1. mockGetMyNetwork
// ====================================================================

export async function mockGetMyNetwork(_profileId: string): Promise<FranchiseNetwork> {
  await delay();
  return {
    id: 'franchise-1',
    name: 'Rede Black Belt',
    unit_count: ACADEMIES.length,
  };
}

// ====================================================================
// 3. mockGetNetworkDashboard
// ====================================================================

export async function mockGetNetworkDashboard(_franchiseId: string): Promise<NetworkDashboard> {
  await delay();
  const monthlyData = generateMonthlyData();
  const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalRoyalties = Math.round(totalRevenue * 0.08);
  const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
  const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10 : 0;

  const sorted = [...ACADEMIES].sort((a, b) => b.revenue - a.revenue);

  return {
    kpis: {
      total_academies: ACADEMIES.length,
      total_students: ACADEMIES.reduce((s, a) => s + a.students, 0),
      total_revenue: totalRevenue,
      total_royalties: totalRoyalties,
      avg_nps: Math.round(ACADEMIES.reduce((s, a) => s + a.nps, 0) / ACADEMIES.length),
      avg_attendance: Math.round(ACADEMIES.reduce((s, a) => s + a.attendance_rate, 0) / ACADEMIES.length),
    },
    academies: ACADEMIES,
    alerts: generateAlerts(),
    financials: {
      monthly_data: monthlyData,
      total_revenue: totalRevenue,
      total_royalties: totalRoyalties,
      growth_pct: growthPct,
    },
    best_unit: { name: sorted[0].name, revenue: sorted[0].revenue },
    worst_unit: { name: sorted[sorted.length - 1].name, revenue: sorted[sorted.length - 1].revenue },
  };
}

// ====================================================================
// 2. mockGetAcademies (used by getNetworkUnits, getNetworkRanking, etc.)
// ====================================================================

export async function mockGetAcademies(_franchiseId: string): Promise<FranchiseAcademy[]> {
  await delay();
  return ACADEMIES;
}

// ====================================================================
// 4. mockGetFinancials
// ====================================================================

export async function mockGetFinancials(_franchiseId: string): Promise<NetworkFinancials> {
  await delay();
  const monthlyData = generateMonthlyData();
  const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
  const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
  return {
    monthly_data: monthlyData,
    total_revenue: totalRevenue,
    total_royalties: Math.round(totalRevenue * 0.08),
    growth_pct: prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10 : 0,
  };
}

// ====================================================================
// 9. mockGetBroadcastsSummary
// ====================================================================

export async function mockGetBroadcastsSummary(_franchiseId: string): Promise<BroadcastSummary[]> {
  await delay();
  return [
    {
      id: 'bc-1',
      type: 'comunicado',
      subject: 'Novos horarios de verao',
      body: 'Informamos que a partir de janeiro, os horarios de aula serao ajustados conforme grade de verao.',
      channels: ['email', 'push'],
      sent_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      created_by: 'Admin',
      total_recipients: 5,
      read_count: 3,
      delivered_count: 5,
    },
    {
      id: 'bc-2',
      type: 'novo_padrao',
      subject: 'Padrao de tatame atualizado',
      body: 'Novo padrao de tatame homologado para todas as unidades. Prazo de adequacao: 90 dias.',
      channels: ['email'],
      sent_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      created_by: 'Admin',
      total_recipients: 5,
      read_count: 4,
      delivered_count: 5,
    },
  ];
}

// ====================================================================
// 10. mockGetCurriculo
// ====================================================================

export async function mockGetCurriculo(_franchiseId: string): Promise<CurriculoItem[]> {
  await delay();
  return [
    {
      id: 'curr-1',
      modalidade: 'Jiu-Jitsu',
      nome: 'Curriculo Faixa Branca',
      descricao: 'Fundamentos basicos do Jiu-Jitsu para iniciantes',
      modulos: [
        { nome: 'Posicoes Basicas', tecnicas: 8 },
        { nome: 'Raspagens', tecnicas: 5 },
        { nome: 'Finalizacoes Basicas', tecnicas: 6 },
      ],
    },
    {
      id: 'curr-2',
      modalidade: 'Jiu-Jitsu',
      nome: 'Curriculo Faixa Azul',
      descricao: 'Tecnicas intermediarias e transicoes',
      modulos: [
        { nome: 'Guarda Fechada Avancada', tecnicas: 10 },
        { nome: 'Passagens de Guarda', tecnicas: 12 },
        { nome: 'Finalizacoes Intermediarias', tecnicas: 8 },
      ],
    },
    {
      id: 'curr-3',
      modalidade: 'Muay Thai',
      nome: 'Curriculo Iniciante',
      descricao: 'Fundamentos do Muay Thai',
      modulos: [
        { nome: 'Socos e Bloqueios', tecnicas: 6 },
        { nome: 'Chutes Basicos', tecnicas: 5 },
        { nome: 'Clinch Basico', tecnicas: 4 },
      ],
    },
  ];
}

// ====================================================================
// 11. mockGetStandardsOverview
// ====================================================================

export async function mockGetStandardsOverview(_franchiseId: string): Promise<StandardItem[]> {
  await delay();
  return [
    {
      id: 'std-1',
      category: 'visual',
      name: 'Identidade Visual Padrao',
      description: 'Fachada, uniformes e material de comunicacao devem seguir o manual da marca.',
      required: true,
      checklist_items: [
        { id: 'ci-1', description: 'Fachada conforme manual', completed: true },
        { id: 'ci-2', description: 'Uniformes padronizados', completed: true },
        { id: 'ci-3', description: 'Material impresso atualizado', completed: false },
      ],
      deadline: null,
    },
    {
      id: 'std-2',
      category: 'operacional',
      name: 'Processo de Matricula',
      description: 'Fluxo padrao de matricula e acompanhamento de novos alunos.',
      required: true,
      checklist_items: [
        { id: 'ci-4', description: 'Formulario padrao de matricula', completed: true },
        { id: 'ci-5', description: 'Aula experimental agendada', completed: false },
      ],
      deadline: '2026-06-30',
    },
    {
      id: 'std-3',
      category: 'pedagogico',
      name: 'Curriculo Minimo',
      description: 'Todas as unidades devem seguir o curriculo minimo da rede.',
      required: true,
      checklist_items: [
        { id: 'ci-6', description: 'Curriculo implantado', completed: true },
        { id: 'ci-7', description: 'Professores capacitados', completed: true },
        { id: 'ci-8', description: 'Avaliacoes periodicas realizadas', completed: false },
      ],
      deadline: null,
    },
  ];
}

// ====================================================================
// 12. mockGetExpansionData
// ====================================================================

export async function mockGetExpansionData(_franchiseId: string): Promise<ExpansionData> {
  await delay();
  return {
    leads: [
      { id: 'lead-1', name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(11) 99999-1234', city: 'Campinas', state: 'SP', investment_capacity: 180000, experience: '5 anos como instrutor de artes marciais', stage: 'analise', viability_score: 78, onboarding_step: null, notes: 'Interessado na regiao de Campinas-Valinhos' },
      { id: 'lead-2', name: 'Fernanda Costa', email: 'fernanda@email.com', phone: '(21) 98888-5678', city: 'Niteroi', state: 'RJ', investment_capacity: 220000, experience: 'Empresaria no ramo fitness', stage: 'aprovado', viability_score: 85, onboarding_step: 'contrato', notes: '' },
      { id: 'lead-3', name: 'Ricardo Souza', email: 'ricardo@email.com', phone: '(31) 97777-9012', city: 'Uberlandia', state: 'MG', investment_capacity: 150000, experience: 'Professor de educacao fisica', stage: 'lead', viability_score: null, onboarding_step: null, notes: 'Primeiro contato via site' },
    ],
    current_units: [
      { id: 'unit-1', name: 'Black Belt Moema', city: 'Sao Paulo', state: 'SP' },
      { id: 'unit-2', name: 'Black Belt Alphaville', city: 'Barueri', state: 'SP' },
      { id: 'unit-3', name: 'Black Belt Barra', city: 'Rio de Janeiro', state: 'RJ' },
      { id: 'unit-4', name: 'Black Belt Savassi', city: 'Belo Horizonte', state: 'MG' },
      { id: 'unit-5', name: 'Black Belt Moinhos', city: 'Porto Alegre', state: 'RS' },
    ],
  };
}

// ====================================================================
// Legacy: sendNetworkMessage
// ====================================================================

export async function mockSendNetworkMessage(_franchiseId: string, message: NetworkMessage): Promise<{ sent: number }> {
  await delay();
  return { sent: message.recipients.length || ACADEMIES.length };
}

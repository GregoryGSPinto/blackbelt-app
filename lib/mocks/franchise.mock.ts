import type {
  FranchiseAcademy,
  NetworkDashboard,
  NetworkFinancials,
  NetworkAlert,
  NetworkMessage,
  MonthlyRevenueByAcademy,
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

export async function mockGetNetworkDashboard(_franchiseId: string): Promise<NetworkDashboard> {
  await delay();
  const monthlyData = generateMonthlyData();
  const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalRoyalties = Math.round(totalRevenue * 0.08);
  const lastMonth = monthlyData[monthlyData.length - 1]?.total ?? 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.total ?? 0;
  const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100 * 10) / 10 : 0;

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
  };
}

export async function mockGetAcademies(_franchiseId: string): Promise<FranchiseAcademy[]> {
  await delay();
  return ACADEMIES;
}

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

export async function mockSendNetworkMessage(_franchiseId: string, message: NetworkMessage): Promise<{ sent: number }> {
  await delay();
  return { sent: message.recipients.length || ACADEMIES.length };
}

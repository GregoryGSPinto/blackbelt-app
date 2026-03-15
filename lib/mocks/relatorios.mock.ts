import type { ReportFilters, ReportResult } from '@/lib/api/relatorios.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MONTHS = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];

function presencaReport(): ReportResult {
  return {
    type: 'presenca',
    title: 'Presença por Turma',
    data: [
      { label: 'BJJ Iniciantes', value: 87, value2: 45 },
      { label: 'BJJ Avançado', value: 92, value2: 28 },
      { label: 'Judô Kids', value: 78, value2: 32 },
      { label: 'Karatê', value: 85, value2: 20 },
      { label: 'MMA', value: 90, value2: 15 },
      { label: 'BJJ Feminino', value: 88, value2: 18 },
      { label: 'Judô Adulto', value: 82, value2: 22 },
      { label: 'Karatê Kids', value: 75, value2: 25 },
    ],
    summary: { 'Média Geral': '84.6%', 'Total Aulas': 192, 'Total Presenças': 8240 },
  };
}

function evolucaoReport(): ReportResult {
  return {
    type: 'evolucao',
    title: 'Evolução de Alunos',
    data: MONTHS.map((m, i) => ({ label: m, value: 3 + Math.floor(Math.random() * 5), value2: 1 + Math.floor(i * 0.5) })),
    summary: { 'Promoções no Período': 22, 'Média/Mês': 3.7, 'Faixa Mais Promovida': 'Branca → Cinza' },
  };
}

function financeiroReport(): ReportResult {
  return {
    type: 'financeiro',
    title: 'Financeiro Consolidado',
    data: MONTHS.map((m, i) => ({
      label: m,
      value: 15000 + i * 800 + Math.floor(Math.random() * 2000),
      value2: 800 + Math.floor(Math.random() * 500),
    })),
    summary: { 'Receita Total': 'R$ 102.400', 'Inadimplência': '8.2%', 'Ticket Médio': 'R$ 170' },
  };
}

function retencaoReport(): ReportResult {
  return {
    type: 'retencao',
    title: 'Retenção de Alunos',
    data: MONTHS.map((m, i) => ({
      label: m,
      value: 115 + i * 3,
      value2: 2 + Math.floor(Math.random() * 3),
    })),
    summary: { 'Alunos Ativos': 130, 'Churn Mensal': '2.3%', 'Novos no Período': 18, 'Cancelamentos': 8 },
  };
}

function performanceReport(): ReportResult {
  return {
    type: 'performance',
    title: 'Performance de Professores',
    data: [
      { label: 'Prof. Ricardo', value: 92, value2: 4 },
      { label: 'Prof. Marcelo', value: 88, value2: 3 },
      { label: 'Prof. Amanda', value: 95, value2: 2 },
      { label: 'Prof. Carlos', value: 85, value2: 2 },
    ],
    summary: { 'Média Presença Turmas': '90%', 'Total Professores': 4, 'Melhor Desempenho': 'Prof. Amanda' },
  };
}

export async function mockGetReport(_academyId: string, filters: ReportFilters): Promise<ReportResult> {
  await delay();
  switch (filters.type) {
    case 'presenca': return presencaReport();
    case 'evolucao': return evolucaoReport();
    case 'financeiro': return financeiroReport();
    case 'retencao': return retencaoReport();
    case 'performance': return performanceReport();
    default: return presencaReport();
  }
}

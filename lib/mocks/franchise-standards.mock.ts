import type {
  Standard,
  ComplianceReport,
  ComplianceResult,
  ComplianceHistoryEntry,
  ComplianceStatus,
  CreateStandardData,
} from '@/lib/api/franchise-standards.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const STANDARDS: Standard[] = [
  {
    id: 'std-1', franchise_id: 'franchise-1', category: 'visual', name: 'Identidade Visual da Fachada',
    description: 'A fachada deve seguir o manual de marca com logotipo, cores e iluminacao padrao.',
    required: true,
    checklist_items: [
      { id: 'ci-1a', description: 'Logotipo principal instalado conforme manual', completed: true },
      { id: 'ci-1b', description: 'Cores da fachada conforme paleta oficial', completed: true },
      { id: 'ci-1c', description: 'Iluminacao noturna funcionando', completed: false },
    ],
    deadline: null, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'std-2', franchise_id: 'franchise-1', category: 'visual', name: 'Uniformes da Equipe',
    description: 'Todos os professores e funcionarios devem usar uniformes padrao da rede.',
    required: true,
    checklist_items: [
      { id: 'ci-2a', description: 'Professores com kimono oficial', completed: true },
      { id: 'ci-2b', description: 'Recepcao com camisa polo da marca', completed: true },
    ],
    deadline: null, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'std-3', franchise_id: 'franchise-1', category: 'operacional', name: 'Horarios de Funcionamento',
    description: 'A academia deve operar no minimo nos horarios padrao da rede.',
    required: true,
    checklist_items: [
      { id: 'ci-3a', description: 'Abertura as 06:00 nos dias uteis', completed: true },
      { id: 'ci-3b', description: 'Fechamento apos 21:00 nos dias uteis', completed: true },
      { id: 'ci-3c', description: 'Funcionamento aos sabados pela manha', completed: true },
    ],
    deadline: null, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'std-4', franchise_id: 'franchise-1', category: 'operacional', name: 'Sistema de Check-in',
    description: 'Utilizar sistema de check-in digital para controle de presenca.',
    required: true,
    checklist_items: [
      { id: 'ci-4a', description: 'Tablet de check-in instalado na recepcao', completed: true },
      { id: 'ci-4b', description: 'Catraca ou cancela funcionando', completed: false },
    ],
    deadline: '2026-06-30', created_at: '2025-02-01T10:00:00Z', updated_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'std-5', franchise_id: 'franchise-1', category: 'pedagogico', name: 'Curriculo Padrao de Faixas',
    description: 'Seguir o curriculo de faixas definido pela rede com os requisitos minimos de cada graduacao.',
    required: true,
    checklist_items: [
      { id: 'ci-5a', description: 'Curriculo atualizado no sistema', completed: true },
      { id: 'ci-5b', description: 'Professores treinados no curriculo', completed: true },
      { id: 'ci-5c', description: 'Avaliacoes trimestrais realizadas', completed: true },
    ],
    deadline: null, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'std-6', franchise_id: 'franchise-1', category: 'pedagogico', name: 'Programa Kids Padronizado',
    description: 'O programa kids deve seguir a metodologia ludica da rede com aulas de 45 min.',
    required: true,
    checklist_items: [
      { id: 'ci-6a', description: 'Materiais ludicos disponiveis', completed: true },
      { id: 'ci-6b', description: 'Professor certificado em Kids BJJ', completed: false },
      { id: 'ci-6c', description: 'Aulas de 45min conforme grade', completed: true },
    ],
    deadline: '2026-04-30', created_at: '2025-03-01T10:00:00Z', updated_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 'std-7', franchise_id: 'franchise-1', category: 'financeiro', name: 'Tabela de Precos da Rede',
    description: 'Os precos dos planos devem seguir a faixa definida pela franqueadora, com variacao maxima de 15%.',
    required: false,
    checklist_items: [
      { id: 'ci-7a', description: 'Plano mensal dentro da faixa', completed: true },
      { id: 'ci-7b', description: 'Plano trimestral dentro da faixa', completed: true },
      { id: 'ci-7c', description: 'Plano anual dentro da faixa', completed: true },
    ],
    deadline: null, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'std-8', franchise_id: 'franchise-1', category: 'qualidade', name: 'Pesquisa NPS Trimestral',
    description: 'Realizar pesquisa NPS a cada trimestre e manter score acima de 70.',
    required: true,
    checklist_items: [
      { id: 'ci-8a', description: 'Pesquisa enviada no trimestre', completed: true },
      { id: 'ci-8b', description: 'Minimo 50% de respostas', completed: false },
      { id: 'ci-8c', description: 'Plano de acao para detratores', completed: false },
    ],
    deadline: '2026-03-31', created_at: '2025-04-01T10:00:00Z', updated_at: '2025-12-01T10:00:00Z',
  },
];

const ACADEMY_NAMES: Record<string, string> = {
  'acad-1': 'Black Belt Moema',
  'acad-2': 'Black Belt Alphaville',
  'acad-3': 'Black Belt Barra',
  'acad-4': 'Black Belt Savassi',
  'acad-5': 'Black Belt Moinhos',
};

export async function mockGetStandards(_franchiseId: string): Promise<Standard[]> {
  await delay();
  return STANDARDS;
}

export async function mockCreateStandard(data: CreateStandardData): Promise<Standard> {
  await delay();
  const id = `std-${Date.now()}`;
  return {
    id,
    franchise_id: data.franchise_id,
    category: data.category,
    name: data.name,
    description: data.description,
    required: data.required,
    checklist_items: data.checklist_items.map((desc, i) => ({
      id: `ci-${id}-${i}`,
      description: desc,
      completed: false,
    })),
    deadline: data.deadline,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function mockCheckCompliance(academyId: string): Promise<ComplianceReport> {
  await delay();
  const results: ComplianceResult[] = STANDARDS.map((std) => {
    const completedItems = std.checklist_items.filter((c) => c.completed).length;
    const totalItems = std.checklist_items.length;
    const score = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
    let status: ComplianceStatus = 'conforme';
    if (score < 50) status = 'nao_conforme';
    else if (score < 100) status = 'parcial';
    return {
      standard_id: std.id,
      standard_name: std.name,
      category: std.category,
      status,
      completed_items: completedItems,
      total_items: totalItems,
      score,
      last_check: new Date().toISOString(),
    };
  });
  const overallScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  return {
    academy_id: academyId,
    academy_name: ACADEMY_NAMES[academyId] ?? 'Academia',
    overall_score: overallScore,
    results,
    checked_at: new Date().toISOString(),
  };
}

export async function mockGetComplianceHistory(academyId: string): Promise<ComplianceHistoryEntry[]> {
  await delay();
  return Array.from({ length: 6 }, (_, i) => ({
    id: `hist-${academyId}-${i}`,
    academy_id: academyId,
    overall_score: 70 + Math.floor(Math.random() * 25),
    checked_at: new Date(Date.now() - (5 - i) * 30 * 86400000).toISOString(),
    checked_by: 'Auditor da Rede',
  }));
}

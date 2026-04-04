import type { UnidadeFranquia, UnidadesOverview } from '@/lib/api/franqueador-unidades.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const UNIDADES: UnidadeFranquia[] = [
  {
    id: 'unit-1',
    name: 'Black Belt Moema',
    city: 'Sao Paulo',
    state: 'SP',
    manager_name: 'Carlos Souza',
    manager_email: 'carlos@blackbelt-moema.com',
    status: 'ativa',
    students_count: 185,
    revenue_monthly: 62400,
    health_score: 92,
    compliance_score: 95,
    opened_at: '2021-03-15T00:00:00Z',
    updated_at: '2026-03-10T14:30:00Z',
  },
  {
    id: 'unit-2',
    name: 'Black Belt Barra',
    city: 'Rio de Janeiro',
    state: 'RJ',
    manager_name: 'Fernanda Lima',
    manager_email: 'fernanda@blackbelt-barra.com',
    status: 'ativa',
    students_count: 198,
    revenue_monthly: 71200,
    health_score: 88,
    compliance_score: 91,
    opened_at: '2020-08-01T00:00:00Z',
    updated_at: '2026-03-12T09:15:00Z',
  },
  {
    id: 'unit-3',
    name: 'Black Belt Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    manager_name: 'Roberto Alves',
    manager_email: 'roberto@blackbelt-savassi.com',
    status: 'suspensa',
    students_count: 96,
    revenue_monthly: 32100,
    health_score: 54,
    compliance_score: 62,
    opened_at: '2022-01-10T00:00:00Z',
    updated_at: '2026-02-28T11:00:00Z',
  },
  {
    id: 'unit-4',
    name: 'Black Belt Moinhos',
    city: 'Porto Alegre',
    state: 'RS',
    manager_name: 'Ana Paula Costa',
    manager_email: 'ana@blackbelt-moinhos.com',
    status: 'ativa',
    students_count: 121,
    revenue_monthly: 41800,
    health_score: 79,
    compliance_score: 84,
    opened_at: '2022-06-20T00:00:00Z',
    updated_at: '2026-03-14T16:45:00Z',
  },
  {
    id: 'unit-5',
    name: 'Black Belt Alphaville',
    city: 'Barueri',
    state: 'SP',
    manager_name: 'Marcos Oliveira',
    manager_email: 'marcos@blackbelt-alphaville.com',
    status: 'ativa',
    students_count: 142,
    revenue_monthly: 48900,
    health_score: 85,
    compliance_score: 88,
    opened_at: '2021-11-05T00:00:00Z',
    updated_at: '2026-03-11T10:20:00Z',
  },
  {
    id: 'unit-6',
    name: 'Black Belt Boa Viagem',
    city: 'Recife',
    state: 'PE',
    manager_name: 'Juliana Mendes',
    manager_email: 'juliana@blackbelt-boaviagem.com',
    status: 'setup',
    students_count: 34,
    revenue_monthly: 12500,
    health_score: 68,
    compliance_score: 72,
    opened_at: '2025-11-01T00:00:00Z',
    updated_at: '2026-03-15T08:30:00Z',
  },
  {
    id: 'unit-7',
    name: 'Black Belt Lago Sul',
    city: 'Brasilia',
    state: 'DF',
    manager_name: 'Pedro Henrique Santos',
    manager_email: 'pedro@blackbelt-lagosul.com',
    status: 'ativa',
    students_count: 157,
    revenue_monthly: 55300,
    health_score: 81,
    compliance_score: 86,
    opened_at: '2021-07-12T00:00:00Z',
    updated_at: '2026-03-13T13:00:00Z',
  },
  {
    id: 'unit-8',
    name: 'Black Belt Centro',
    city: 'Curitiba',
    state: 'PR',
    manager_name: 'Luciana Ferreira',
    manager_email: 'luciana@blackbelt-centro.com',
    status: 'encerrada',
    students_count: 0,
    revenue_monthly: 0,
    health_score: 0,
    compliance_score: 0,
    opened_at: '2020-02-10T00:00:00Z',
    updated_at: '2025-09-30T18:00:00Z',
  },
];

export async function mockGetUnidades(_franchiseId: string): Promise<UnidadeFranquia[]> {
  await delay();
  return UNIDADES;
}

export async function mockGetUnidadesOverview(_franchiseId: string): Promise<UnidadesOverview> {
  await delay();
  const active = UNIDADES.filter((u) => u.status === 'ativa');
  const operational = UNIDADES.filter((u) => u.status !== 'encerrada');
  return {
    total_units: UNIDADES.length,
    active_units: active.length,
    total_students: UNIDADES.reduce((s, u) => s + u.students_count, 0),
    avg_health_score: operational.length > 0
      ? Math.round(operational.reduce((s, u) => s + u.health_score, 0) / operational.length)
      : 0,
    avg_compliance: operational.length > 0
      ? Math.round(operational.reduce((s, u) => s + u.compliance_score, 0) / operational.length)
      : 0,
  };
}

export async function mockGetUnidadeDetail(unitId: string): Promise<UnidadeFranquia> {
  await delay();
  const unit = UNIDADES.find((u) => u.id === unitId);
  if (!unit) throw new Error(`Unidade ${unitId} nao encontrada`);
  return unit;
}

export async function mockUpdateUnidadeStatus(
  unitId: string,
  status: UnidadeFranquia['status'],
): Promise<UnidadeFranquia> {
  await delay();
  const unit = UNIDADES.find((u) => u.id === unitId);
  if (!unit) throw new Error(`Unidade ${unitId} nao encontrada`);
  const updated = { ...unit, status, updated_at: new Date().toISOString() };
  const idx = UNIDADES.findIndex((u) => u.id === unitId);
  UNIDADES[idx] = updated;
  return updated;
}

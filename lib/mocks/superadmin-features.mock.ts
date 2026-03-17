import type { FeatureWithStats, FeatureFlag } from '@/lib/api/superadmin-features.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const FLAGS: FeatureWithStats[] = [
  { id: 'ff-1', nome: 'Gestão de Turmas', slug: 'turmas', descricao: 'Criar e gerenciar turmas, horários e presenças', categoria: 'core', statusGlobal: true, regras: { planos: ['starter', 'pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-06-01T10:00:00Z', atualizadoEm: '2025-06-01T10:00:00Z', stats: { featureSlug: 'turmas', totalAcademiasComAcesso: 62, totalAcademiasUsando: 61, taxaAdocao: 98, ultimoUso: '2026-03-17T08:00:00Z' } },
  { id: 'ff-2', nome: 'Financeiro', slug: 'financeiro', descricao: 'Controle de mensalidades, cobranças e relatórios financeiros', categoria: 'core', statusGlobal: true, regras: { planos: ['starter', 'pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-06-01T10:00:00Z', atualizadoEm: '2025-06-01T10:00:00Z', stats: { featureSlug: 'financeiro', totalAcademiasComAcesso: 62, totalAcademiasUsando: 59, taxaAdocao: 95, ultimoUso: '2026-03-17T07:30:00Z' } },
  { id: 'ff-3', nome: 'Check-in QR', slug: 'checkin_qr', descricao: 'Check-in de alunos via QR code na entrada da academia', categoria: 'core', statusGlobal: true, regras: { planos: ['starter', 'pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-06-01T10:00:00Z', atualizadoEm: '2025-06-01T10:00:00Z', stats: { featureSlug: 'checkin_qr', totalAcademiasComAcesso: 62, totalAcademiasUsando: 55, taxaAdocao: 88, ultimoUso: '2026-03-17T08:15:00Z' } },
  { id: 'ff-4', nome: 'Loja', slug: 'loja', descricao: 'Marketplace interno para venda de kimonos, equipamentos e acessórios', categoria: 'premium', statusGlobal: true, regras: { planos: ['pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-08-01T10:00:00Z', atualizadoEm: '2025-08-01T10:00:00Z', stats: { featureSlug: 'loja', totalAcademiasComAcesso: 32, totalAcademiasUsando: 20, taxaAdocao: 62, ultimoUso: '2026-03-16T14:00:00Z' } },
  { id: 'ff-5', nome: 'Streaming Vídeos', slug: 'streaming', descricao: 'Upload e streaming de vídeos de aulas e técnicas', categoria: 'premium', statusGlobal: true, regras: { planos: ['pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-09-01T10:00:00Z', atualizadoEm: '2025-09-01T10:00:00Z', stats: { featureSlug: 'streaming', totalAcademiasComAcesso: 32, totalAcademiasUsando: 14, taxaAdocao: 45, ultimoUso: '2026-03-15T20:00:00Z' } },
  { id: 'ff-6', nome: 'Gamificação', slug: 'gamificacao', descricao: 'Sistema de XP, conquistas e ranking para engajar alunos', categoria: 'premium', statusGlobal: true, regras: { planos: ['pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-10-01T10:00:00Z', atualizadoEm: '2025-10-01T10:00:00Z', stats: { featureSlug: 'gamificacao', totalAcademiasComAcesso: 32, totalAcademiasUsando: 12, taxaAdocao: 38, ultimoUso: '2026-03-16T10:00:00Z' } },
  { id: 'ff-7', nome: 'Contratos Digitais', slug: 'contratos', descricao: 'Geração e assinatura digital de contratos', categoria: 'premium', statusGlobal: true, regras: { planos: ['blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-11-01T10:00:00Z', atualizadoEm: '2026-03-10T10:00:00Z', stats: { featureSlug: 'contratos', totalAcademiasComAcesso: 10, totalAcademiasUsando: 6, taxaAdocao: 55, ultimoUso: '2026-03-14T11:00:00Z' } },
  { id: 'ff-8', nome: 'Eventos', slug: 'eventos', descricao: 'Organização de campeonatos, seminários e eventos internos', categoria: 'premium', statusGlobal: true, regras: { planos: ['pro', 'blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-09-15T10:00:00Z', atualizadoEm: '2025-09-15T10:00:00Z', stats: { featureSlug: 'eventos', totalAcademiasComAcesso: 32, totalAcademiasUsando: 13, taxaAdocao: 41, ultimoUso: '2026-03-12T16:00:00Z' } },
  { id: 'ff-9', nome: 'NPS', slug: 'nps', descricao: 'Pesquisa de Net Promoter Score automática para alunos', categoria: 'premium', statusGlobal: true, regras: { planos: ['blackbelt', 'enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2025-12-01T10:00:00Z', atualizadoEm: '2025-12-01T10:00:00Z', stats: { featureSlug: 'nps', totalAcademiasComAcesso: 10, totalAcademiasUsando: 3, taxaAdocao: 30, ultimoUso: '2026-03-10T09:00:00Z' } },
  { id: 'ff-10', nome: 'IA Análise Técnica', slug: 'ia_analise', descricao: 'Análise de vídeo por IA para feedback técnico de golpes e posições', categoria: 'beta', statusGlobal: true, regras: { planos: [], academiasIncluidas: ['academy-dragon', 'academy-alpha', 'ac-e1', 'ac-e2', 'ac-e3'], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2026-01-15T10:00:00Z', atualizadoEm: '2026-02-01T10:00:00Z', stats: { featureSlug: 'ia_analise', totalAcademiasComAcesso: 5, totalAcademiasUsando: 4, taxaAdocao: 80, ultimoUso: '2026-03-16T18:00:00Z' } },
  { id: 'ff-11', nome: 'Periodização', slug: 'periodizacao', descricao: 'Planejamento periodizado de treinos com ciclos e metas', categoria: 'beta', statusGlobal: true, regras: { planos: [], academiasIncluidas: ['academy-dragon', 'ac-e1', 'ac-e2', 'ac-e3', 'ac-e4', 'ac-e5', 'ac-e6', 'ac-e7'], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2026-02-01T10:00:00Z', atualizadoEm: '2026-02-01T10:00:00Z', stats: { featureSlug: 'periodizacao', totalAcademiasComAcesso: 8, totalAcademiasUsando: 5, taxaAdocao: 62, ultimoUso: '2026-03-15T14:00:00Z' } },
  { id: 'ff-12', nome: 'White Label', slug: 'white_label', descricao: 'App com marca própria da academia (sem branding BlackBelt)', categoria: 'experimental', statusGlobal: true, regras: { planos: ['enterprise'], academiasIncluidas: [], academiasExcluidas: [] }, rolloutPercentual: 100, criadoEm: '2026-01-01T10:00:00Z', atualizadoEm: '2026-01-01T10:00:00Z', stats: { featureSlug: 'white_label', totalAcademiasComAcesso: 2, totalAcademiasUsando: 2, taxaAdocao: 100, ultimoUso: '2026-03-17T06:00:00Z' } },
];

export async function mockListFeatureFlags(): Promise<FeatureWithStats[]> {
  await delay(400);
  return FLAGS.map((f) => ({ ...f, regras: { ...f.regras } }));
}

export async function mockToggleFeatureGlobal(featureId: string, enabled: boolean): Promise<FeatureFlag> {
  await delay(300);
  const f = FLAGS.find((f) => f.id === featureId);
  if (f) { f.statusGlobal = enabled; f.atualizadoEm = new Date().toISOString(); }
  const { stats: _stats, ...flag } = f ?? FLAGS[0]; void _stats;
  return { ...flag };
}

export async function mockUpdateFeatureFlag(featureId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
  await delay(400);
  const f = FLAGS.find((f) => f.id === featureId);
  if (f) { Object.assign(f, data); f.atualizadoEm = new Date().toISOString(); }
  const { stats: _stats, ...flag } = f ?? FLAGS[0]; void _stats;
  return { ...flag };
}

export async function mockCreateFeatureFlag(data: Omit<FeatureFlag, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<FeatureFlag> {
  await delay(400);
  const now = new Date().toISOString();
  const flag: FeatureFlag = { ...data, id: `ff-${Date.now()}`, criadoEm: now, atualizadoEm: now };
  FLAGS.push({ ...flag, stats: { featureSlug: flag.slug, totalAcademiasComAcesso: 0, totalAcademiasUsando: 0, taxaAdocao: 0, ultimoUso: now } });
  return flag;
}

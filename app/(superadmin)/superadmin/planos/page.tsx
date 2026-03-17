'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { getFaixas, getModulos, getPacotes } from '@/lib/api/pricing.service';
import type { FaixaBase, Modulo, PacoteSugerido } from '@/lib/api/pricing.service';

// ─── Constants ────────────────────────────────────────────────

const AMBER = '#f59e0b';
const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#3b82f6';

type TabKey = 'faixas' | 'modulos' | 'pacotes' | 'assinaturas' | 'receita';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'faixas', label: 'Faixas' },
  { key: 'modulos', label: 'Modulos' },
  { key: 'pacotes', label: 'Pacotes' },
  { key: 'assinaturas', label: 'Assinaturas' },
  { key: 'receita', label: 'Receita' },
];

const CATEGORIA_LABELS: Record<string, { label: string; color: string }> = {
  operacao: { label: 'Operacao', color: BLUE },
  ensino: { label: 'Ensino', color: '#8b5cf6' },
  engajamento: { label: 'Engajamento', color: GREEN },
  comercial: { label: 'Comercial', color: AMBER },
  avancado: { label: 'Avancado', color: '#ec4899' },
};

type SubStatus = 'trial' | 'discovery' | 'full' | 'cancelled';
type SubFilter = 'todos' | SubStatus;

interface MockSubscription {
  id: string;
  academyName: string;
  faixa: string;
  modulosPagos: string[];
  precoTotal: number;
  status: SubStatus;
  diasRestantesDescoberta: number;
  ciclo: 'mensal' | 'anual';
}

const MOCK_SUBSCRIPTIONS: MockSubscription[] = [
  {
    id: 's1',
    academyName: 'Guerreiros do Tatame',
    faixa: 'Profissional',
    modulosPagos: ['financeiro', 'pedagogico', 'checkin-qr', 'gamificacao', 'streaming'],
    precoTotal: 402,
    status: 'discovery',
    diasRestantesDescoberta: 45,
    ciclo: 'mensal',
  },
  {
    id: 's2',
    academyName: 'Fight Academy',
    faixa: 'Essencial',
    modulosPagos: ['financeiro', 'pedagogico', 'checkin-qr'],
    precoTotal: 264,
    status: 'full',
    diasRestantesDescoberta: 0,
    ciclo: 'mensal',
  },
  {
    id: 's3',
    academyName: 'BJJ Masters',
    faixa: 'Completo',
    modulosPagos: ['financeiro', 'pedagogico', 'checkin-qr', 'gamificacao', 'streaming', 'analytics', 'loja', 'kids'],
    precoTotal: 542,
    status: 'trial',
    diasRestantesDescoberta: 5,
    ciclo: 'mensal',
  },
  {
    id: 's4',
    academyName: 'Tatame Kids',
    faixa: 'Essencial',
    modulosPagos: ['financeiro', 'checkin-qr', 'kids'],
    precoTotal: 214,
    status: 'discovery',
    diasRestantesDescoberta: 72,
    ciclo: 'mensal',
  },
  {
    id: 's5',
    academyName: 'MMA Pro',
    faixa: 'Profissional',
    modulosPagos: ['financeiro', 'pedagogico', 'checkin-qr', 'gamificacao', 'streaming', 'analytics'],
    precoTotal: 549,
    status: 'cancelled',
    diasRestantesDescoberta: 0,
    ciclo: 'mensal',
  },
];

const STATUS_CONFIG: Record<SubStatus, { label: string; bg: string; color: string }> = {
  trial: { label: 'Trial', bg: 'rgba(59,130,246,0.15)', color: BLUE },
  discovery: { label: 'Descoberta', bg: 'rgba(245,158,11,0.15)', color: AMBER },
  full: { label: 'Ativo', bg: 'rgba(34,197,94,0.15)', color: GREEN },
  cancelled: { label: 'Cancelado', bg: 'rgba(239,68,68,0.15)', color: RED },
};

const FILTER_BUTTONS: { key: SubFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'trial', label: 'Trial' },
  { key: 'discovery', label: 'Descoberta' },
  { key: 'full', label: 'Ativo' },
  { key: 'cancelled', label: 'Cancelado' },
];

// ─── Revenue mock data ────────────────────────────────────────

interface ModuloReceita {
  nome: string;
  receita: number;
  academias: number;
}

const MOCK_MRR_POR_MODULO: ModuloReceita[] = [
  { nome: 'Financeiro', receita: 196, academias: 4 },
  { nome: 'Pedagogico', receita: 156, academias: 4 },
  { nome: 'QR Check-in', receita: 116, academias: 4 },
  { nome: 'Gamificacao', receita: 102, academias: 3 },
  { nome: 'Streaming', receita: 96, academias: 3 },
  { nome: 'Analytics', receita: 72, academias: 2 },
  { nome: 'Loja', receita: 48, academias: 1 },
  { nome: 'Kids', receita: 42, academias: 2 },
];

interface ConversaoModulo {
  nome: string;
  percent: number;
}

const MOCK_CONVERSAO: ConversaoModulo[] = [
  { nome: 'Gamificacao', percent: 62 },
  { nome: 'Streaming', percent: 55 },
  { nome: 'Analytics', percent: 48 },
  { nome: 'Loja', percent: 35 },
  { nome: 'Kids', percent: 30 },
  { nome: 'Franquia', percent: 8 },
];

// ─── Helpers ──────────────────────────────────────────────────

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function discoveryLabel(sub: MockSubscription): string {
  if (sub.status === 'cancelled') return '-';
  if (sub.status === 'full') return 'Encerrada';
  if (sub.status === 'trial') return `${sub.diasRestantesDescoberta} dias (trial)`;
  return `${sub.diasRestantesDescoberta} dias`;
}

function conversionColor(percent: number): string {
  if (percent > 50) return GREEN;
  if (percent >= 30) return AMBER;
  return RED;
}

// ─── Skeleton ─────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6 pb-20">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-5 w-96" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-36" />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function PlanosPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('faixas');
  const [loading, setLoading] = useState(true);

  const [faixas, setFaixas] = useState<FaixaBase[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [pacotes, setPacotes] = useState<PacoteSugerido[]>([]);
  const [subFilter, setSubFilter] = useState<SubFilter>('todos');

  const loadData = useCallback(async () => {
    try {
      const [f, m, p] = await Promise.all([getFaixas(), getModulos(), getPacotes()]);
      setFaixas(f);
      setModulos(m);
      setPacotes(p);
    } catch {
      toast('Erro ao carregar dados de pricing', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived data ──────────────────────────────────────────

  const modulosByCategory = useMemo(() => {
    const map = new Map<string, Modulo[]>();
    for (const m of modulos) {
      const cat = m.categoria;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    // Sort each group by ordem
    for (const [, list] of map) {
      list.sort((a, b) => a.ordem - b.ordem);
    }
    return map;
  }, [modulos]);

  const filteredSubs = useMemo(() => {
    if (subFilter === 'todos') return MOCK_SUBSCRIPTIONS;
    return MOCK_SUBSCRIPTIONS.filter((s) => s.status === subFilter);
  }, [subFilter]);

  const totalMRR = useMemo(() => {
    return MOCK_SUBSCRIPTIONS.filter((s) => s.status !== 'cancelled').reduce(
      (sum, s) => sum + s.precoTotal,
      0,
    );
  }, []);

  const maxModuloReceita = useMemo(() => {
    return Math.max(...MOCK_MRR_POR_MODULO.map((m) => m.receita));
  }, []);

  // ── Loading ───────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Pricing Management
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Faixas de base, modulos, pacotes, assinaturas e receita da plataforma
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              size="sm"
              variant={isActive ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* ═══ TAB 1: FAIXAS ══════════════════════════════════ */}
      {activeTab === 'faixas' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Faixas de Base ({faixas.length})
          </h2>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <div
              className="min-w-full rounded-xl"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {/* Header row */}
              <div
                className="grid grid-cols-6 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <span>Nome</span>
                <span>Faixa de alunos</span>
                <span>R$/mes</span>
                <span>R$/ano</span>
                <span>Professores</span>
                <span>Turmas</span>
              </div>
              {faixas.map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-6 gap-4 px-5 py-3"
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {f.nome}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    {f.minAlunos} - {f.maxAlunos}
                  </span>
                  <span className="text-sm font-bold" style={{ color: AMBER }}>
                    {fmtBRL(f.precoMensal)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    {fmtBRL(f.precoAnual)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {f.professoresInclusos}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {f.turmasInclusas}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {faixas.map((f) => (
              <Card key={f.id} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {f.nome}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: 'rgba(245,158,11,0.12)', color: AMBER }}
                  >
                    {f.minAlunos}-{f.maxAlunos} alunos
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-lg p-2"
                    style={{ background: 'var(--bb-depth-4)' }}
                  >
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Mensal</p>
                    <p className="text-sm font-bold" style={{ color: AMBER }}>{fmtBRL(f.precoMensal)}</p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ background: 'var(--bb-depth-4)' }}
                  >
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Anual</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{fmtBRL(f.precoAnual)}</p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ background: 'var(--bb-depth-4)' }}
                  >
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Professores</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{f.professoresInclusos}</p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ background: 'var(--bb-depth-4)' }}
                  >
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Turmas</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{f.turmasInclusas}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {faixas.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhuma faixa cadastrada.
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 2: MODULOS ═════════════════════════════════ */}
      {activeTab === 'modulos' && (
        <div className="space-y-6">
          {Array.from(modulosByCategory.entries()).map(([category, items]) => {
            const catConfig = CATEGORIA_LABELS[category] ?? { label: category, color: 'var(--bb-ink-60)' };
            return (
              <div key={category}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${catConfig.color}20`, color: catConfig.color }}
                  >
                    {catConfig.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {items.length} modulo{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((m) => (
                    <ModuloCard key={m.id} modulo={m} />
                  ))}
                </div>
              </div>
            );
          })}
          {modulos.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum modulo cadastrado.
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: PACOTES ═════════════════════════════════ */}
      {activeTab === 'pacotes' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Pacotes Sugeridos ({pacotes.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pacotes.map((p) => (
              <Card
                key={p.id}
                className="relative flex flex-col p-6"
                style={p.popular ? { border: '2px solid #f59e0b' } : undefined}
              >
                {p.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold"
                    style={{ background: AMBER, color: '#fff' }}
                  >
                    Mais Popular
                  </span>
                )}
                <div className="mb-4 text-center">
                  <span className="text-3xl">{p.icone}</span>
                  <h3 className="mt-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {p.nome}
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {p.descricao}
                  </p>
                </div>

                {/* Discount badge */}
                <div className="mb-4 text-center">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: 'rgba(34,197,94,0.15)', color: GREEN }}
                  >
                    {p.descontoPercent}% de desconto
                  </span>
                </div>

                {/* Pricing */}
                <div className="mb-4 text-center">
                  <p className="text-xs line-through" style={{ color: 'var(--bb-ink-40)' }}>
                    {fmtBRL(p.precoOriginal)}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: AMBER }}>
                    {fmtBRL(p.precoComDesconto)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>/mes</p>
                </div>

                {/* Modules included */}
                <div>
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    Modulos inclusos ({p.modulosSlugs.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.modulosSlugs.map((slug) => {
                      const mod = modulos.find((m) => m.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
                          style={{
                            background: 'var(--bb-depth-4)',
                            color: 'var(--bb-ink-80)',
                          }}
                          title={mod?.nome ?? slug}
                        >
                          {mod ? <span>{mod.icone}</span> : null}
                          {mod?.nome ?? slug}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {pacotes.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum pacote cadastrado.
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 4: ASSINATURAS ═════════════════════════════ */}
      {activeTab === 'assinaturas' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Assinaturas ({filteredSubs.length})
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_BUTTONS.map((fb) => {
                const isActive = subFilter === fb.key;
                return (
                  <Button
                    key={fb.key}
                    size="sm"
                    variant={isActive ? 'primary' : 'ghost'}
                    onClick={() => setSubFilter(fb.key)}
                  >
                    {fb.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <div
              className="min-w-full rounded-xl"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <div
                className="grid grid-cols-6 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
              >
                <span>Academia</span>
                <span>Faixa</span>
                <span>Modulos pagos</span>
                <span>Total/mes</span>
                <span>Status</span>
                <span>Descoberta</span>
              </div>
              {filteredSubs.map((sub) => {
                const statusCfg = STATUS_CONFIG[sub.status];
                return (
                  <div
                    key={sub.id}
                    className="grid grid-cols-6 items-center gap-4 px-5 py-3"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  >
                    <span className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {sub.academyName}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      {sub.faixa}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      {sub.modulosPagos.length}
                    </span>
                    <span className="text-sm font-bold" style={{ color: AMBER }}>
                      {fmtBRL(sub.precoTotal)}
                    </span>
                    <span>
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </span>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      {discoveryLabel(sub)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredSubs.map((sub) => {
              const statusCfg = STATUS_CONFIG[sub.status];
              return (
                <Card key={sub.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {sub.academyName}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg p-2" style={{ background: 'var(--bb-depth-4)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Faixa</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{sub.faixa}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'var(--bb-depth-4)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Total/mes</p>
                      <p className="text-sm font-bold" style={{ color: AMBER }}>{fmtBRL(sub.precoTotal)}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'var(--bb-depth-4)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Modulos</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{sub.modulosPagos.length}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'var(--bb-depth-4)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Descoberta</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{discoveryLabel(sub)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredSubs.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhuma assinatura encontrada para este filtro.
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 5: RECEITA E CONVERSAO ═════════════════════ */}
      {activeTab === 'receita' && (
        <div className="space-y-6">
          {/* MRR Card */}
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              MRR (Monthly Recurring Revenue)
            </p>
            <p className="mt-2 text-3xl font-bold" style={{ color: AMBER }}>
              {fmtBRL(totalMRR)}/mes
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Soma de {MOCK_SUBSCRIPTIONS.filter((s) => s.status !== 'cancelled').length} assinaturas ativas
            </p>
          </div>

          {/* MRR por modulo */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              MRR por Modulo
            </h3>
            <div className="space-y-3">
              {MOCK_MRR_POR_MODULO.map((m) => {
                const pct = maxModuloReceita > 0 ? (m.receita / maxModuloReceita) * 100 : 0;
                return (
                  <div key={m.nome}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {m.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: AMBER }}>
                          {fmtBRL(m.receita)}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                          ({m.academias} academia{m.academias !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-2 w-full rounded-full"
                      style={{ background: 'var(--bb-depth-1)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: AMBER }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversao pos-descoberta */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Conversao pos-descoberta
            </h3>
            <div className="space-y-3">
              {MOCK_CONVERSAO.map((c) => {
                const barColor = conversionColor(c.percent);
                return (
                  <div key={c.nome}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {c.nome}
                      </span>
                      <span className="text-sm font-bold" style={{ color: barColor }}>
                        {c.percent}%
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full"
                      style={{ background: 'var(--bb-depth-1)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${c.percent}%`, background: barColor }}
                      />
                    </div>
                    {c.percent < 30 && (
                      <p className="mt-0.5 text-[10px]" style={{ color: RED }}>
                        Considere reduzir preco
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight card */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: AMBER }}>
              Insight
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
              Gamificacao tem a maior taxa de conversao (62%). Considere inclui-la em pacotes menores
              para aumentar a adocao. Franquia tem a menor conversao (8%) — avalie reduzir o preco
              ou criar um trial estendido para esse modulo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModuloCard Sub-component ─────────────────────────────────

function ModuloCard({ modulo }: { modulo: Modulo }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = CATEGORIA_LABELS[modulo.categoria] ?? { label: modulo.categoria, color: 'var(--bb-ink-60)' };

  return (
    <Card className="flex flex-col p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{modulo.icone}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {modulo.nome}
            </p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
              style={{ background: `${catConfig.color}20`, color: catConfig.color }}
            >
              {catConfig.label}
            </span>
          </div>
        </div>
        {modulo.destaque && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: 'rgba(245,158,11,0.15)', color: AMBER }}
          >
            Popular
          </span>
        )}
      </div>

      <p className="mb-3 line-clamp-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
        {modulo.descricao}
      </p>

      {/* Pricing */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-lg font-bold" style={{ color: AMBER }}>
          {fmtBRL(modulo.precoMensal)}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>/mes</span>
        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          | {fmtBRL(modulo.precoAnual)}/ano
        </span>
      </div>

      {/* Features toggle */}
      {modulo.features.length > 0 && (
        <div className="mt-auto">
          <button
            type="button"
            className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--bb-brand)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ocultar' : 'Ver'} features ({modulo.features.length})
          </button>
          {expanded && (
            <ul className="space-y-1">
              {modulo.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  <span style={{ color: GREEN, fontSize: 10 }}>&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

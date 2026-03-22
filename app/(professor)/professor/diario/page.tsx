'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { listDiarios, createDiario } from '@/lib/api/diario-aula.service';
import type { DiarioAula, CreateDiarioPayload, TecnicaEnsinada } from '@/lib/api/diario-aula.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  PlusIcon,
  XIcon,
  FilterIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  FileTextIcon,
  CheckIcon,
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from '@/components/shell/icons';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ─────────────────────────────────────────────────────────

const TURMAS = [
  { id: 'all', nome: 'Todas as turmas' },
  { id: 'turma-bjj-noite', nome: 'BJJ Noite — Avancada' },
  { id: 'turma-bjj-manha', nome: 'BJJ Manha — Todos os niveis' },
  { id: 'turma-muaythai', nome: 'Muay Thai — Intermediario' },
];

const PERIODOS = [
  { id: 'all', label: 'Todos' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'trimestre', label: 'Trimestre' },
];

type TipoDiario = DiarioAula['tipo'];
type IntensidadeDiario = DiarioAula['intensidade'];

const TIPO_CONFIG: Record<TipoDiario, { label: string; bg: string; text: string }> = {
  tecnica: { label: 'Tecnica', bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  sparring: { label: 'Sparring', bg: 'rgba(249,115,22,0.12)', text: '#F97316' },
  mista: { label: 'Mista', bg: 'rgba(147,51,234,0.12)', text: '#9333EA' },
  competicao: { label: 'Competicao', bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  especial: { label: 'Especial', bg: 'rgba(107,114,128,0.12)', text: '#6B7280' },
};

const INTENSIDADE_CONFIG: Record<IntensidadeDiario, { label: string; bg: string; text: string }> = {
  leve: { label: 'Leve', bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
  moderada: { label: 'Moderada', bg: 'rgba(234,179,8,0.12)', text: '#EAB308' },
  intensa: { label: 'Intensa', bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
};

// ── Main page ─────────────────────────────────────────────────────────

export default function DiarioPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [diarios, setDiarios] = useState<DiarioAula[]>([]);
  const [turmaFilter, setTurmaFilter] = useState('all');
  const [periodoFilter, setPeriodoFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [formTurma, setFormTurma] = useState('turma-bjj-noite');
  const [formData, setFormData] = useState(new Date().toISOString().slice(0, 10));
  const [formTema, setFormTema] = useState('');
  const [formTipo, setFormTipo] = useState<TipoDiario>('tecnica');
  const [formIntensidade, setFormIntensidade] = useState<IntensidadeDiario>('moderada');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formDuracao, setFormDuracao] = useState(90);
  const [formPresentes, setFormPresentes] = useState(15);
  const [formMatriculados, setFormMatriculados] = useState(18);
  const [formTecnicas, setFormTecnicas] = useState<TecnicaEnsinada[]>([]);
  const [formTecNome, setFormTecNome] = useState('');
  const [formTecPosicao, setFormTecPosicao] = useState('');
  const [formTecCategoria, setFormTecCategoria] = useState('');
  const [formTecNivel, setFormTecNivel] = useState('branca');
  const [formDestaques, setFormDestaques] = useState<{ alunoId: string; alunoNome: string; motivo: string }[]>([]);
  const [formDestNome, setFormDestNome] = useState('');
  const [formDestMotivo, setFormDestMotivo] = useState('');
  const [formDificuldades, setFormDificuldades] = useState<{ alunoId: string; alunoNome: string; observacao: string }[]>([]);
  const [formDifNome, setFormDifNome] = useState('');
  const [formDifObs, setFormDifObs] = useState('');

  // ── Load data ───────────────────────────────────────────────────────

  const loadDiarios = useCallback(async () => {
    setLoading(true);
    try {
      const filtros: { turmaId?: string; periodo?: string } = {};
      if (turmaFilter !== 'all') filtros.turmaId = turmaFilter;
      if (periodoFilter !== 'all') filtros.periodo = periodoFilter;
      const result = await listDiarios('prof-1', Object.keys(filtros).length > 0 ? filtros : undefined);
      setDiarios(result);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [turmaFilter, periodoFilter, toast]);

  useEffect(() => { loadDiarios(); }, [loadDiarios]);

  const sortedDiarios = useMemo(() => {
    let filtered = [...diarios];
    if (turmaFilter !== 'all') filtered = filtered.filter((d) => d.turmaId === turmaFilter);
    return filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [diarios, turmaFilter]);

  // ── Handlers ────────────────────────────────────────────────────────

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function addTecnica() {
    if (!formTecNome.trim()) return;
    setFormTecnicas((prev) => [...prev, {
      nome: formTecNome.trim(),
      posicao: formTecPosicao.trim() || 'N/A',
      categoria: formTecCategoria.trim() || 'Geral',
      nivelFaixa: formTecNivel,
    }]);
    setFormTecNome(''); setFormTecPosicao(''); setFormTecCategoria('');
  }

  function removeTecnica(index: number) { setFormTecnicas((prev) => prev.filter((_, i) => i !== index)); }

  function addDestaque() {
    if (!formDestNome.trim() || !formDestMotivo.trim()) return;
    setFormDestaques((prev) => [...prev, { alunoId: `temp-${Date.now()}`, alunoNome: formDestNome.trim(), motivo: formDestMotivo.trim() }]);
    setFormDestNome(''); setFormDestMotivo('');
  }

  function removeDestaque(index: number) { setFormDestaques((prev) => prev.filter((_, i) => i !== index)); }

  function addDificuldade() {
    if (!formDifNome.trim() || !formDifObs.trim()) return;
    setFormDificuldades((prev) => [...prev, { alunoId: `temp-${Date.now()}`, alunoNome: formDifNome.trim(), observacao: formDifObs.trim() }]);
    setFormDifNome(''); setFormDifObs('');
  }

  function removeDificuldade(index: number) { setFormDificuldades((prev) => prev.filter((_, i) => i !== index)); }

  function resetForm() {
    setFormTurma('turma-bjj-noite'); setFormData(new Date().toISOString().slice(0, 10)); setFormTema('');
    setFormTipo('tecnica'); setFormIntensidade('moderada'); setFormObservacoes(''); setFormDuracao(90);
    setFormPresentes(15); setFormMatriculados(18);
    setFormTecnicas([]); setFormTecNome(''); setFormTecPosicao(''); setFormTecCategoria(''); setFormTecNivel('branca');
    setFormDestaques([]); setFormDestNome(''); setFormDestMotivo('');
    setFormDificuldades([]); setFormDifNome(''); setFormDifObs('');
  }

  async function handleCreate() {
    if (!formTema.trim()) { toast('Informe o tema geral da aula', 'error'); return; }
    setCreating(true);
    try {
      const payload: CreateDiarioPayload = {
        turmaId: formTurma, data: formData, temaGeral: formTema.trim(),
        tecnicasEnsinadas: formTecnicas, observacoesGerais: formObservacoes.trim(),
        alunosDestaque: formDestaques, alunosDificuldade: formDificuldades,
        totalPresentes: formPresentes, totalMatriculados: formMatriculados,
        duracaoMinutos: formDuracao, intensidade: formIntensidade, tipo: formTipo,
      };
      const created = await createDiario(payload);
      setDiarios((prev) => [created, ...prev]);
      toast('Diario salvo com sucesso!', 'success');
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }

  // ── Skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen space-y-4 p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton variant="card" className="h-10 w-40" />
          <Skeleton variant="card" className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map((i) => (<Skeleton key={i} variant="card" className="h-36" />))}
      </div>
    );
  }

  return (
    <PlanGate module="pedagogico">
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className="space-y-3 p-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Caderno de Aulas</h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{sortedDiarios.length} registro{sortedDiarios.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <FilterIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
            <select value={turmaFilter} onChange={(e) => setTurmaFilter(e.target.value)}
              className="appearance-none rounded-lg py-2 pl-8 pr-8 text-xs font-medium"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-80)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
              {TURMAS.map((t) => (<option key={t.id} value={t.id}>{t.nome}</option>))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          </div>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
            <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)}
              className="appearance-none rounded-lg py-2 pl-8 pr-8 text-xs font-medium"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-80)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
              {PERIODOS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          </div>
        </div>
      </header>

      {/* ── LISTING ──────────────────────────────────────────────────── */}
      <div className="space-y-3 px-4">
        {sortedDiarios.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpenIcon className="h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>Nenhum registro encontrado.</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Toque no + para criar seu primeiro diario de aula.</p>
          </div>
        ) : (
          sortedDiarios.map((diario) => {
            const isExpanded = expandedId === diario.id;
            const tipoCfg = TIPO_CONFIG[diario.tipo];
            const intCfg = INTENSIDADE_CONFIG[diario.intensidade];
            return (
              <div key={diario.id}>
                <button type="button" onClick={() => toggleExpand(diario.id)} className="w-full text-left transition-all"
                  style={{ background: 'var(--bb-depth-2)', border: `1px solid ${isExpanded ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`, borderRadius: isExpanded ? 'var(--bb-radius-lg) var(--bb-radius-lg) 0 0' : 'var(--bb-radius-lg)', padding: '16px' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        <CalendarIcon className="h-3 w-3 shrink-0" />
                        <span>{new Date(diario.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        <span>&middot;</span>
                        <span className="truncate">{diario.turmaNome}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{diario.temaGeral}</p>
                    </div>
                    {isExpanded ? <ChevronDownIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} /> : <ChevronRightIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />}
                  </div>
                  {diario.tecnicasEnsinadas.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {diario.tecnicasEnsinadas.map((t, i) => (
                        <span key={i} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          style={{ background: 'color-mix(in srgb, var(--bb-brand) 12%, transparent)', color: 'var(--bb-brand)' }}>{t.nome}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      <UsersIcon className="h-3 w-3" /> {diario.totalPresentes}/{diario.totalMatriculados}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: intCfg.bg, color: intCfg.text }}>{intCfg.label}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: tipoCfg.bg, color: tipoCfg.text }}>{tipoCfg.label}</span>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      <ClockIcon className="h-3 w-3" /> {diario.duracaoMinutos}min
                    </span>
                  </div>
                  {diario.observacoesGerais && !isExpanded && (
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {diario.observacoesGerais}
                    </p>
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-4 p-4" style={{ background: 'var(--bb-depth-2)', borderLeft: '1px solid var(--bb-brand)', borderRight: '1px solid var(--bb-brand)', borderBottom: '1px solid var(--bb-brand)', borderRadius: '0 0 var(--bb-radius-lg) var(--bb-radius-lg)' }}>
                    {diario.observacoesGerais && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Observacoes</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{diario.observacoesGerais}</p>
                      </div>
                    )}
                    {diario.tecnicasEnsinadas.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Tecnicas</p>
                        <div className="space-y-1.5">
                          {diario.tecnicasEnsinadas.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--bb-depth-3)', borderRadius: 'var(--bb-radius-lg)' }}>
                              <span className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{t.nome}</span>
                              <span style={{ color: 'var(--bb-ink-40)' }}>&middot;</span>
                              <span style={{ color: 'var(--bb-ink-60)' }}>{t.posicao}</span>
                              <span style={{ color: 'var(--bb-ink-40)' }}>&middot;</span>
                              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'color-mix(in srgb, var(--bb-brand) 12%, transparent)', color: 'var(--bb-brand)' }}>{t.categoria}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {diario.alunosDestaque.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Destaques</p>
                        <div className="space-y-1.5">
                          {diario.alunosDestaque.map((d, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22C55E', borderRadius: 'var(--bb-radius-lg)' }}>
                              <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#22C55E' }} />
                              <div><p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{d.alunoNome}</p><p style={{ color: 'var(--bb-ink-60)' }}>{d.motivo}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {diario.alunosDificuldade.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Atencao</p>
                        <div className="space-y-1.5">
                          {diario.alunosDificuldade.map((d, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(234,179,8,0.08)', borderLeft: '3px solid #EAB308', borderRadius: 'var(--bb-radius-lg)' }}>
                              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#EAB308' }} />
                              <div><p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{d.alunoNome}</p><p style={{ color: 'var(--bb-ink-60)' }}>{d.observacao}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => toast('Funcao de edicao disponivel em breve', 'info')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold transition-all"
                        style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                        <EditIcon className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => toast('PDF exportado com sucesso', 'success')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold transition-all"
                        style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                        <FileTextIcon className="h-3.5 w-3.5" /> Exportar PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <button type="button" onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
        style={{ width: '56px', height: '56px', background: 'var(--bb-brand)', color: '#fff', boxShadow: 'var(--bb-shadow-lg)' }} aria-label="Novo diario">
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* ── CREATE MODAL ─────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => { if (!creating) setShowCreateModal(false); }}>
          <div className="w-full max-w-lg overflow-y-auto sm:max-h-[90vh]"
            style={{ maxHeight: '92vh', background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg) var(--bb-radius-lg) 0 0', boxShadow: 'var(--bb-shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
              style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Novo Diario de Aula</h2>
              <button type="button" onClick={() => { if (!creating) { setShowCreateModal(false); resetForm(); } }}
                className="flex items-center justify-center rounded-full p-2" style={{ color: 'var(--bb-ink-60)', minWidth: '44px', minHeight: '44px' }}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-4">
              {/* Turma */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Turma</label>
                <select value={formTurma} onChange={(e) => setFormTurma(e.target.value)} className="w-full rounded-lg px-3 py-3 text-sm"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                  {TURMAS.filter((t) => t.id !== 'all').map((t) => (<option key={t.id} value={t.id}>{t.nome}</option>))}
                </select>
              </div>
              {/* Data */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Data</label>
                <input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className="w-full rounded-lg px-3 py-3 text-sm"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
              </div>
              {/* Tema */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Tema Geral *</label>
                <input type="text" value={formTema} onChange={(e) => setFormTema(e.target.value)} placeholder="Ex: Passagens de guarda com pressao"
                  className="w-full rounded-lg px-3 py-3 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
              </div>
              {/* Tecnicas */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Tecnicas</label>
                {formTecnicas.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {formTecnicas.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{ background: 'color-mix(in srgb, var(--bb-brand) 12%, transparent)', color: 'var(--bb-brand)' }}>
                        {t.nome}
                        <button type="button" onClick={() => removeTecnica(i)} className="ml-0.5 hover:opacity-60"><XIcon className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input type="text" value={formTecNome} onChange={(e) => setFormTecNome(e.target.value)} placeholder="Nome da tecnica"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <input type="text" value={formTecPosicao} onChange={(e) => setFormTecPosicao(e.target.value)} placeholder="Posicao"
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none sm:w-28"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <input type="text" value={formTecCategoria} onChange={(e) => setFormTecCategoria(e.target.value)} placeholder="Categoria"
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none sm:w-28"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <select value={formTecNivel} onChange={(e) => setFormTecNivel(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-xs sm:w-28"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                    <option value="branca">Branca</option><option value="azul">Azul</option><option value="roxa">Roxa</option><option value="marrom">Marrom</option><option value="preta">Preta</option>
                  </select>
                  <button type="button" onClick={addTecnica} className="flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                    style={{ background: 'var(--bb-brand)', color: '#fff', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px', minWidth: '44px' }}>
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Tipo + Intensidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Tipo</label>
                  <select value={formTipo} onChange={(e) => setFormTipo(e.target.value as TipoDiario)} className="w-full rounded-lg px-3 py-3 text-sm"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                    <option value="tecnica">Tecnica</option><option value="sparring">Sparring</option><option value="competicao">Competicao</option><option value="especial">Especial</option><option value="mista">Mista</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Intensidade</label>
                  <select value={formIntensidade} onChange={(e) => setFormIntensidade(e.target.value as IntensidadeDiario)} className="w-full rounded-lg px-3 py-3 text-sm"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                    <option value="leve">Leve</option><option value="moderada">Moderada</option><option value="intensa">Intensa</option>
                  </select>
                </div>
              </div>
              {/* Presentes + Matriculados */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Presentes</label>
                  <input type="number" value={formPresentes} onChange={(e) => setFormPresentes(Number(e.target.value))} min={0} max={100}
                    className="w-full rounded-lg px-3 py-3 text-sm outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Matriculados</label>
                  <input type="number" value={formMatriculados} onChange={(e) => setFormMatriculados(Number(e.target.value))} min={0} max={200}
                    className="w-full rounded-lg px-3 py-3 text-sm outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                </div>
              </div>
              {/* Duracao */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Duracao (minutos)</label>
                <input type="number" value={formDuracao} onChange={(e) => setFormDuracao(Number(e.target.value))} min={1} max={300}
                  className="w-full rounded-lg px-3 py-3 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
              </div>
              {/* Observacoes */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Observacoes</label>
                <textarea value={formObservacoes} onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Notas sobre a aula, evolucao dos alunos, etc." rows={4}
                  className="w-full resize-none rounded-lg px-3 py-3 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)' }} />
              </div>
              {/* Destaques */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Destaques</label>
                {formDestaques.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {formDestaques.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--bb-radius-lg)' }}>
                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" style={{ color: '#22C55E' }} />
                        <span className="flex-1" style={{ color: 'var(--bb-ink-80)' }}><strong>{d.alunoNome}</strong>: {d.motivo}</span>
                        <button type="button" onClick={() => removeDestaque(i)} className="shrink-0 p-1"><XIcon className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={formDestNome} onChange={(e) => setFormDestNome(e.target.value)} placeholder="Nome do aluno"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <input type="text" value={formDestMotivo} onChange={(e) => setFormDestMotivo(e.target.value)} placeholder="Motivo"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <button type="button" onClick={addDestaque} className="flex items-center justify-center rounded-lg px-3 py-2 transition-all"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px', minWidth: '44px' }}>
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Dificuldades */}
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--bb-ink-60)' }}>Dificuldades / Atencao</label>
                {formDificuldades.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {formDificuldades.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(234,179,8,0.08)', borderRadius: 'var(--bb-radius-lg)' }}>
                        <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" style={{ color: '#EAB308' }} />
                        <span className="flex-1" style={{ color: 'var(--bb-ink-80)' }}><strong>{d.alunoNome}</strong>: {d.observacao}</span>
                        <button type="button" onClick={() => removeDificuldade(i)} className="shrink-0 p-1"><XIcon className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={formDifNome} onChange={(e) => setFormDifNome(e.target.value)} placeholder="Nome do aluno"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <input type="text" value={formDifObs} onChange={(e) => setFormDifObs(e.target.value)} placeholder="Observacao"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
                  <button type="button" onClick={addDificuldade} className="flex items-center justify-center rounded-lg px-3 py-2 transition-all"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px', minWidth: '44px' }}>
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-4 py-3" style={{ background: 'var(--bb-depth-2)', borderTop: '1px solid var(--bb-glass-border)' }}>
              <button type="button" onClick={handleCreate} disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: 'var(--bb-brand)', color: '#fff', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>
                {creating ? (<><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Salvando...</>)
                  : (<><CheckIcon className="h-4 w-4" /> Salvar Diario</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PlanGate>
  );
}

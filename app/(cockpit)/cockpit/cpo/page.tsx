'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Eye,
  Archive,
  Lightbulb,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Pencil,
  MessageSquare,
  Bug,
  Heart,
  HelpCircle,
  Users,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Loader2,
  Rocket,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionHeader } from '@/components/cockpit/SectionHeader';
import { StatusBadge } from '@/components/cockpit/StatusBadge';
import { EmptyState } from '@/components/cockpit/EmptyState';
import { KpiCard } from '@/components/cockpit/KpiCard';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getCurrentSprint,
  getSprints,
  createSprint,
  updateSprint,
  getFeatureBacklog,
  createFeature,
  updateFeature,
  getUserFeedback,
  getFeedbackCount,
  updateFeedbackStatus,
  convertFeedbackToFeature,
  getPersonas,
  updatePersona,
} from '@/lib/api/cockpit.service';
import type {
  Sprint,
  FeatureBacklogItem,
  UserFeedbackItem,
  PersonaItem,
} from '@/lib/api/cockpit.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRODUCT = 'blackbelt';

const KANBAN_COLUMNS: { key: string; label: string }[] = [
  { key: 'icebox', label: 'Icebox' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'em_progresso', label: 'Em Progresso' },
  { key: 'review', label: 'Review' },
  { key: 'entregue', label: 'Done' },
];

const FEEDBACK_FILTERS: { key: string; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'lido', label: 'Lido' },
  { key: 'em_analise', label: 'Investigando' },
  { key: 'arquivado', label: 'Arquivado' },
  { key: 'convertido', label: 'Convertido' },
];

function feedbackCategoryIcon(cat: string) {
  switch (cat) {
    case 'bug':
      return <Bug className="h-4 w-4" />;
    case 'feature':
      return <Lightbulb className="h-4 w-4" />;
    case 'elogio':
      return <Heart className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function daysInColumn(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoje';
  return `há ${days}d`;
}

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function getFriday(): string {
  const monday = new Date(getMonday());
  monday.setDate(monday.getDate() + 4);
  return monday.toISOString().slice(0, 10);
}

function nextGoalStatus(current: string): string {
  if (current === 'nao_iniciado') return 'em_progresso';
  if (current === 'em_progresso') return 'concluido';
  return 'nao_iniciado';
}

function goalStatusIcon(status: string): string {
  if (status === 'em_progresso') return '🔄';
  if (status === 'concluido') return '✅';
  return '⬜';
}

function daysRemaining(weekEnd: string): number {
  const end = new Date(weekEnd + 'T23:59:59');
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ---------------------------------------------------------------------------
// Section 1: Sprint Atual
// ---------------------------------------------------------------------------

function SprintSection() {
  const { toast } = useToast();
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [history, setHistory] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showRetro, setShowRetro] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGoals, setNewGoals] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [retroText, setRetroText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cur, hist] = await Promise.all([
        getCurrentSprint(PRODUCT),
        getSprints(PRODUCT, 5),
      ]);
      setSprint(cur);
      setHistory(hist.filter((s) => s.id !== cur?.id).slice(0, 4));
      if (cur) {
        setNotesText(cur.notes ?? '');
        setRetroText(cur.retrospective ?? '');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function handleToggleGoal(idx: number) {
    if (!sprint) return;
    const updatedGoals = sprint.goals.map((g, i) =>
      i === idx ? { ...g, status: nextGoalStatus(g.status) } : g,
    );
    try {
      const updated = await updateSprint(sprint.id, { goals: updatedGoals });
      if (updated) setSprint(updated);
      else toast('Erro ao atualizar goal', 'error');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSaveNotes() {
    if (!sprint) return;
    setSaving(true);
    try {
      const updated = await updateSprint(sprint.id, { notes: notesText, retrospective: retroText });
      if (updated) {
        setSprint(updated);
        toast('Notas salvas', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSprint() {
    const goals = newGoals.filter((g) => g.trim()).map((g) => ({
      title: g.trim(),
      status: 'nao_iniciado',
    }));
    if (goals.length === 0) {
      toast('Defina pelo menos 1 goal', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await createSprint({
        product: PRODUCT,
        week_start: getMonday(),
        week_end: getFriday(),
        goals,
      });
      if (result) {
        setSprint(result);
        setCreating(false);
        setNotesText('');
        setRetroText('');
        toast('Sprint criado com sucesso', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bb-depth-2)' }}>
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-52" />
        </div>
      </section>
    );
  }

  if (!sprint && !creating) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Sprint Atual" />
        <EmptyState
          icon={<Rocket className="h-10 w-10" />}
          title="Nenhum sprint ativo"
          description="Crie o sprint da semana para acompanhar seus goals."
          action={{
            label: 'Criar Sprint da Semana',
            onClick: () => setCreating(true),
          }}
        />
      </section>
    );
  }

  if (creating) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Criar Sprint da Semana" />
        <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bb-depth-2)' }}>
          <div className="flex gap-4 text-sm" style={{ color: 'var(--bb-ink-3)' }}>
            <span>Início: {getMonday()}</span>
            <span>Fim: {getFriday()}</span>
          </div>
          {newGoals.map((g, i) => (
            <input
              key={i}
              type="text"
              value={g}
              onChange={(e) => {
                const copy = [...newGoals];
                copy[i] = e.target.value;
                setNewGoals(copy);
              }}
              placeholder={`Goal ${i + 1}`}
              aria-label={`Goal ${i + 1} do sprint`}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-3, var(--bb-ink-3))',
              }}
            />
          ))}
          <div className="flex gap-2">
            <button
              onClick={handleCreateSprint}
              disabled={saving}
              aria-label="Salvar sprint"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Criar Sprint
            </button>
            <button
              onClick={() => setCreating(false)}
              aria-label="Cancelar criação de sprint"
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ color: 'var(--bb-ink-2)', background: 'var(--bb-depth-1)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Sprint exists
  return (
    <section className="space-y-4">
      <SectionHeader title="Sprint Atual" />
      <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bb-depth-2)' }}>
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard title="Dias restantes" value={daysRemaining(sprint!.week_end)} icon={<Calendar className="h-4 w-4" />} />
          <KpiCard title="Velocity" value={sprint!.velocity} icon={<Zap className="h-4 w-4" />} />
          <KpiCard title="Prompts" value={sprint!.prompts_executed} icon={<MessageSquare className="h-4 w-4" />} />
          <KpiCard
            title="Goals"
            value={`${sprint!.goals.filter((g) => g.status === 'concluido').length}/${sprint!.goals.length}`}
            icon={<Target className="h-4 w-4" />}
          />
        </div>

        {/* Goals list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
            Goals
          </p>
          {sprint!.goals.map((goal, idx) => (
            <button
              key={idx}
              onClick={() => void handleToggleGoal(idx)}
              aria-label={`Alternar status do goal: ${goal.title}`}
              className="flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 text-sm transition-colors"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)' }}
            >
              <span className="text-base flex-shrink-0">{goalStatusIcon(goal.status)}</span>
              <span className="flex-1">{goal.title}</span>
              <StatusBadge
                label={goal.status === 'concluido' ? 'Concluído' : goal.status === 'em_progresso' ? 'Em progresso' : 'Não iniciado'}
                variant={goal.status === 'concluido' ? 'success' : goal.status === 'em_progresso' ? 'info' : 'neutral'}
              />
            </button>
          ))}
        </div>

        {/* Notes expandable */}
        <div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            aria-label="Expandir notas do sprint"
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--bb-ink-2)' }}
          >
            {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Notas
          </button>
          {showNotes && (
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              aria-label="Notas do sprint"
              rows={3}
              className="w-full mt-2 rounded-lg px-3 py-2 text-sm outline-none resize-y"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-3, var(--bb-ink-3))',
              }}
            />
          )}
        </div>

        {/* Retrospective expandable */}
        <div>
          <button
            onClick={() => setShowRetro(!showRetro)}
            aria-label="Expandir retrospectiva do sprint"
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--bb-ink-2)' }}
          >
            {showRetro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Retrospectiva
          </button>
          {showRetro && (
            <textarea
              value={retroText}
              onChange={(e) => setRetroText(e.target.value)}
              aria-label="Retrospectiva do sprint"
              rows={3}
              className="w-full mt-2 rounded-lg px-3 py-2 text-sm outline-none resize-y"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-3, var(--bb-ink-3))',
              }}
            />
          )}
        </div>

        {(showNotes || showRetro) && (
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            aria-label="Salvar notas e retrospectiva"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar
          </button>
        )}
      </div>

      {/* Sprint History */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            aria-label="Expandir histórico de sprints"
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--bb-ink-3)' }}
          >
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Histórico ({history.length} sprints anteriores)
          </button>
          {showHistory && (
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg p-3 text-sm"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-2)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium" style={{ color: 'var(--bb-ink-1)' }}>
                      {h.week_start} — {h.week_end}
                    </span>
                    <span style={{ color: 'var(--bb-ink-3)' }}>
                      vel {h.velocity} · {h.prompts_executed} prompts
                    </span>
                  </div>
                  {h.goals.map((g, gi) => (
                    <div key={gi} className="flex items-center gap-1.5">
                      <span className="text-sm">{goalStatusIcon(g.status)}</span>
                      <span>{g.title}</span>
                    </div>
                  ))}
                  {h.retrospective && (
                    <p className="mt-1 text-xs italic" style={{ color: 'var(--bb-ink-3)' }}>
                      {h.retrospective}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2: Roadmap Kanban
// ---------------------------------------------------------------------------

interface FeatureFormData {
  title: string;
  description: string;
  module: string;
  persona: string;
  rice_impact: number;
  rice_urgency: number;
  rice_effort: number;
}

const emptyForm: FeatureFormData = {
  title: '',
  description: '',
  module: '',
  persona: '',
  rice_impact: 5,
  rice_urgency: 5,
  rice_effort: 5,
};

function RoadmapSection() {
  const { toast } = useToast();
  const [features, setFeatures] = useState<FeatureBacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FeatureFormData>(emptyForm);
  const [creatingInColumn, setCreatingInColumn] = useState<string | null>(null);
  const [newForm, setNewForm] = useState<FeatureFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeatureBacklog(PRODUCT);
      setFeatures(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function getColumnItems(status: string): FeatureBacklogItem[] {
    return features.filter((f) => f.status === status);
  }

  function startEdit(item: FeatureBacklogItem) {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description ?? '',
      module: item.module ?? '',
      persona: item.persona ?? '',
      rice_impact: item.rice_impact,
      rice_urgency: item.rice_urgency,
      rice_effort: item.rice_effort,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const score = (editForm.rice_impact * editForm.rice_urgency) / editForm.rice_effort;
      const updated = await updateFeature(editingId, {
        title: editForm.title,
        description: editForm.description || null,
        module: editForm.module || null,
        persona: editForm.persona || null,
        rice_impact: editForm.rice_impact,
        rice_urgency: editForm.rice_urgency,
        rice_effort: editForm.rice_effort,
        rice_score: Math.round(score * 10) / 10,
      });
      if (updated) {
        setFeatures((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
        setEditingId(null);
        toast('Feature atualizada', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateInColumn() {
    if (!creatingInColumn || !newForm.title.trim()) return;
    setSaving(true);
    try {
      const score = (newForm.rice_impact * newForm.rice_urgency) / newForm.rice_effort;
      const created = await createFeature({
        product: PRODUCT,
        title: newForm.title.trim(),
        description: newForm.description || null,
        module: newForm.module || null,
        persona: newForm.persona || null,
        status: creatingInColumn,
        rice_impact: newForm.rice_impact,
        rice_urgency: newForm.rice_urgency,
        rice_effort: newForm.rice_effort,
        rice_score: Math.round(score * 10) / 10,
      });
      if (created) {
        setFeatures((prev) => [...prev, created]);
        setCreatingInColumn(null);
        setNewForm(emptyForm);
        toast('Feature criada', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[240px] rounded-xl p-3 space-y-2"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader title="Roadmap" />
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {KANBAN_COLUMNS.map((col) => {
          const items = getColumnItems(col.key);
          return (
            <div
              key={col.key}
              className="min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl p-3 flex flex-col"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-1)' }}>
                    {col.label}
                  </h3>
                  <span
                    className="text-xs rounded-full px-1.5 py-0.5 font-medium"
                    style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-3)' }}
                  >
                    {items.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCreatingInColumn(col.key);
                    setNewForm(emptyForm);
                  }}
                  aria-label={`Adicionar feature na coluna ${col.label}`}
                  className="rounded p-1 transition-colors"
                  style={{ color: 'var(--bb-ink-3)' }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Create inline form */}
              {creatingInColumn === col.key && (
                <div
                  className="rounded-lg p-2 mb-2 space-y-2"
                  style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-brand)' }}
                >
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    placeholder="Título da feature"
                    aria-label="Título da nova feature"
                    className="w-full rounded px-2 py-1 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Descrição"
                    aria-label="Descrição da nova feature"
                    className="w-full rounded px-2 py-1 text-xs outline-none"
                    style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newForm.module}
                      onChange={(e) => setNewForm({ ...newForm, module: e.target.value })}
                      placeholder="Módulo"
                      aria-label="Módulo da nova feature"
                      className="flex-1 rounded px-2 py-1 text-xs outline-none"
                      style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                    />
                    <input
                      type="text"
                      value={newForm.persona}
                      onChange={(e) => setNewForm({ ...newForm, persona: e.target.value })}
                      placeholder="Persona"
                      aria-label="Persona da nova feature"
                      className="flex-1 rounded px-2 py-1 text-xs outline-none"
                      style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                    />
                  </div>
                  <div className="flex gap-1">
                    <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      I
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newForm.rice_impact}
                        onChange={(e) => setNewForm({ ...newForm, rice_impact: Number(e.target.value) })}
                        aria-label="RICE impacto"
                        className="w-full rounded px-1 py-0.5 text-xs outline-none"
                        style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                      />
                    </label>
                    <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      U
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newForm.rice_urgency}
                        onChange={(e) => setNewForm({ ...newForm, rice_urgency: Number(e.target.value) })}
                        aria-label="RICE urgência"
                        className="w-full rounded px-1 py-0.5 text-xs outline-none"
                        style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                      />
                    </label>
                    <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      E
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newForm.rice_effort}
                        onChange={(e) => setNewForm({ ...newForm, rice_effort: Number(e.target.value) })}
                        aria-label="RICE esforço"
                        className="w-full rounded px-1 py-0.5 text-xs outline-none"
                        style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCreateInColumn}
                      disabled={saving}
                      aria-label="Salvar nova feature"
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                      style={{ background: 'var(--bb-brand)', color: '#fff' }}
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setCreatingInColumn(null)}
                      aria-label="Cancelar criação de feature"
                      className="rounded px-2 py-1 text-xs"
                      style={{ color: 'var(--bb-ink-3)' }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {items.map((item) => (
                  <div key={item.id}>
                    {editingId === item.id ? (
                      // Inline edit
                      <div
                        className="rounded-lg p-2 space-y-2"
                        style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-brand)' }}
                      >
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          aria-label="Editar título da feature"
                          className="w-full rounded px-2 py-1 text-xs font-semibold outline-none"
                          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                        />
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Descrição"
                          aria-label="Editar descrição da feature"
                          className="w-full rounded px-2 py-1 text-xs outline-none"
                          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editForm.module}
                            onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}
                            placeholder="Módulo"
                            aria-label="Editar módulo da feature"
                            className="flex-1 rounded px-2 py-1 text-xs outline-none"
                            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                          />
                          <input
                            type="text"
                            value={editForm.persona}
                            onChange={(e) => setEditForm({ ...editForm, persona: e.target.value })}
                            placeholder="Persona"
                            aria-label="Editar persona da feature"
                            className="flex-1 rounded px-2 py-1 text-xs outline-none"
                            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                            I
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={editForm.rice_impact}
                              onChange={(e) => setEditForm({ ...editForm, rice_impact: Number(e.target.value) })}
                              aria-label="Editar RICE impacto"
                              className="w-full rounded px-1 py-0.5 text-xs outline-none"
                              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                            />
                          </label>
                          <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                            U
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={editForm.rice_urgency}
                              onChange={(e) => setEditForm({ ...editForm, rice_urgency: Number(e.target.value) })}
                              aria-label="Editar RICE urgência"
                              className="w-full rounded px-1 py-0.5 text-xs outline-none"
                              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                            />
                          </label>
                          <label className="flex-1 text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                            E
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={editForm.rice_effort}
                              onChange={(e) => setEditForm({ ...editForm, rice_effort: Number(e.target.value) })}
                              aria-label="Editar RICE esforço"
                              className="w-full rounded px-1 py-0.5 text-xs outline-none"
                              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-1)' }}
                            />
                          </label>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            aria-label="Salvar edição da feature"
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                            style={{ background: 'var(--bb-brand)', color: '#fff' }}
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            aria-label="Cancelar edição"
                            className="rounded px-2 py-1 text-xs"
                            style={{ color: 'var(--bb-ink-3)' }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Card view
                      <button
                        onClick={() => startEdit(item)}
                        aria-label={`Editar feature ${item.title}`}
                        className="w-full text-left rounded-lg p-2.5 transition-colors"
                        style={{ background: 'var(--bb-depth-1)' }}
                      >
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--bb-ink-1)' }}>
                          {item.title}
                        </p>
                        {item.module && (
                          <StatusBadge label={item.module} variant="info" />
                        )}
                        {item.persona && (
                          <span className="text-xs ml-1" style={{ color: 'var(--bb-ink-3)' }}>
                            {item.persona}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="text-xs font-bold"
                            style={{ color: 'var(--bb-brand)' }}
                          >
                            RICE {item.rice_score}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                            {daysInColumn(item.created_at)}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--bb-ink-3)' }}>
                    Vazio
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 3: Feedback Inbox
// ---------------------------------------------------------------------------

function FeedbackSection() {
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<UserFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('novo');
  const [newCount, setNewCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [convertModalId, setConvertModalId] = useState<string | null>(null);
  const [convertTitle, setConvertTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        getUserFeedback(PRODUCT, filter),
        getFeedbackCount(PRODUCT, 'novo'),
      ]);
      setFeedbackList(items);
      setNewCount(count);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => { void load(); }, [load]);

  async function handleMarkRead(id: string) {
    try {
      const ok = await updateFeedbackStatus(id, 'lido');
      if (ok) {
        setFeedbackList((prev) => prev.filter((f) => f.id !== id));
        setNewCount((c) => Math.max(0, c - 1));
        toast('Marcado como lido', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleArchive(id: string) {
    try {
      const ok = await updateFeedbackStatus(id, 'arquivado');
      if (ok) {
        setFeedbackList((prev) => prev.filter((f) => f.id !== id));
        toast('Feedback arquivado', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleConvert() {
    if (!convertModalId || !convertTitle.trim()) return;
    setSaving(true);
    try {
      const featureId = await convertFeedbackToFeature(convertModalId, convertTitle.trim());
      if (featureId) {
        setFeedbackList((prev) => prev.filter((f) => f.id !== convertModalId));
        setConvertModalId(null);
        setConvertTitle('');
        toast('Feedback convertido em feature', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotes(id: string) {
    setSaving(true);
    try {
      const ok = await updateFeedbackStatus(id, filter, internalNotes);
      if (ok) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === id ? { ...f, internal_notes: internalNotes } : f)),
        );
        toast('Notas salvas', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function renderStars(rating: number | null) {
    if (rating === null) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className="h-3 w-3"
            style={{
              color: s <= rating ? 'var(--bb-warning)' : 'var(--bb-ink-3)',
              fill: s <= rating ? 'var(--bb-warning)' : 'transparent',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader
        title={`Feedback${newCount > 0 ? ` (${newCount} novos)` : ''}`}
      />

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FEEDBACK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-label={`Filtrar feedbacks por ${f.label}`}
            className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background: filter === f.key ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
              color: filter === f.key ? '#fff' : 'var(--bb-ink-2)',
            }}
          >
            {f.label}
            {f.key === 'novo' && newCount > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-xs font-bold"
                style={{
                  background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--bb-danger)',
                  color: '#fff',
                  minWidth: '18px',
                }}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bb-depth-2)' }}>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : feedbackList.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" />}
          title="Nenhum feedback"
          description={`Não há feedbacks com status "${FEEDBACK_FILTERS.find((f) => f.key === filter)?.label}".`}
        />
      ) : (
        <div className="space-y-2">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: fb.category === 'bug' ? 'var(--bb-danger)' : fb.category === 'elogio' ? 'var(--bb-success)' : 'var(--bb-brand)' }}
                >
                  {feedbackCategoryIcon(fb.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      if (expandedId === fb.id) {
                        setExpandedId(null);
                      } else {
                        setExpandedId(fb.id);
                        setInternalNotes(fb.internal_notes ?? '');
                      }
                    }}
                    aria-label={`Expandir feedback de ${fb.user_name ?? 'Anônimo'}`}
                    className="w-full text-left"
                  >
                    <p
                      className={`text-sm ${expandedId === fb.id ? '' : 'line-clamp-2'}`}
                      style={{ color: 'var(--bb-ink-1)' }}
                    >
                      {fb.message}
                    </p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      {fb.user_name ?? 'Anônimo'}
                    </span>
                    {fb.academy_name && (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                        · {fb.academy_name}
                      </span>
                    )}
                    {renderStars(fb.rating)}
                    <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                      {relativeDate(fb.created_at)}
                    </span>
                  </div>

                  {/* Expanded view */}
                  {expandedId === fb.id && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Notas internas..."
                        aria-label="Notas internas do feedback"
                        rows={2}
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-y"
                        style={{
                          background: 'var(--bb-depth-1)',
                          color: 'var(--bb-ink-1)',
                          border: '1px solid var(--bb-depth-3, var(--bb-ink-3))',
                        }}
                      />
                      <button
                        onClick={() => void handleSaveNotes(fb.id)}
                        disabled={saving}
                        aria-label="Salvar notas internas"
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: 'var(--bb-brand)', color: '#fff' }}
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar notas'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 gap-1">
                  {fb.status === 'novo' && (
                    <button
                      onClick={() => void handleMarkRead(fb.id)}
                      aria-label="Marcar como lido"
                      className="rounded p-1.5 transition-colors"
                      style={{ color: 'var(--bb-ink-3)' }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => void handleArchive(fb.id)}
                    aria-label="Arquivar feedback"
                    className="rounded p-1.5 transition-colors"
                    style={{ color: 'var(--bb-ink-3)' }}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  {fb.status !== 'convertido' && (
                    <button
                      onClick={() => {
                        setConvertModalId(fb.id);
                        setConvertTitle('');
                      }}
                      aria-label="Converter feedback em feature"
                      className="rounded p-1.5 transition-colors"
                      style={{ color: 'var(--bb-brand)' }}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Convert modal */}
      {convertModalId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConvertModalId(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bb-depth-2)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Converter feedback em feature"
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--bb-ink-1)' }}>
              Converter em Feature
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--bb-ink-3)' }}>
              Defina o título da feature que será criada a partir deste feedback.
            </p>
            <input
              type="text"
              value={convertTitle}
              onChange={(e) => setConvertTitle(e.target.value)}
              placeholder="Título da feature"
              aria-label="Título da feature a criar"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-4"
              style={{
                background: 'var(--bb-depth-1)',
                color: 'var(--bb-ink-1)',
                border: '1px solid var(--bb-depth-3, var(--bb-ink-3))',
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConvertModalId(null)}
                aria-label="Cancelar conversão"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-2)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleConvert()}
                disabled={saving || !convertTitle.trim()}
                aria-label="Confirmar conversão em feature"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Converter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 4: Personas
// ---------------------------------------------------------------------------

function PersonasSection() {
  const { toast } = useToast();
  const [personas, setPersonas] = useState<PersonaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PersonaItem>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPersonas(PRODUCT);
      setPersonas(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function startEdit(p: PersonaItem) {
    setEditingId(p.id);
    setEditData({
      name: p.name,
      description: p.description,
      pains: [...p.pains],
      jobs_to_be_done: [...p.jobs_to_be_done],
      key_features: [...p.key_features],
      feature_completion_pct: p.feature_completion_pct,
    });
  }

  async function handleSavePersona() {
    if (!editingId) return;
    setSaving(true);
    try {
      const updated = await updatePersona(editingId, editData);
      if (updated) {
        setPersonas((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
        toast('Persona atualizada', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function personaIcon(role: string | null) {
    switch (role) {
      case 'admin':
        return <BarChart3 className="h-6 w-6" />;
      case 'professor':
        return <Target className="h-6 w-6" />;
      case 'kids':
        return <Star className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  }

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bb-depth-2)' }}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader title="Personas" />

      {personas.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Nenhuma persona cadastrada"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {personas.map((p) => (
            <div key={p.id}>
              <button
                onClick={() => setDetailId(detailId === p.id ? null : p.id)}
                aria-label={`Ver detalhes da persona ${p.name}`}
                className="w-full text-left rounded-xl p-4 transition-colors"
                style={{ background: 'var(--bb-depth-2)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="rounded-full p-1.5"
                    style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-brand)' }}
                  >
                    {personaIcon(p.role_in_app)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-1)' }}>
                      {p.name}
                    </p>
                    {p.role_in_app && (
                      <StatusBadge label={p.role_in_app} variant="info" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bb-depth-1)' }}>
                  <div
                    className="rounded-full h-1.5 transition-all"
                    style={{
                      width: `${p.feature_completion_pct}%`,
                      background: p.feature_completion_pct >= 70 ? 'var(--bb-success)' : p.feature_completion_pct >= 40 ? 'var(--bb-warning)' : 'var(--bb-danger)',
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-3)' }}>
                  {p.feature_completion_pct}% completo
                </p>
              </button>

              {/* Detail panel */}
              {detailId === p.id && editingId !== p.id && (
                <div
                  className="mt-1 rounded-xl p-4 space-y-3"
                  style={{ background: 'var(--bb-depth-2)', borderTop: '2px solid var(--bb-brand)' }}
                >
                  {p.description && (
                    <p className="text-xs" style={{ color: 'var(--bb-ink-2)' }}>{p.description}</p>
                  )}

                  {p.pains.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--bb-danger)' }}>
                        Dores
                      </p>
                      <ul className="space-y-0.5">
                        {p.pains.map((pain, i) => (
                          <li key={i} className="text-xs" style={{ color: 'var(--bb-ink-2)' }}>
                            • {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.jobs_to_be_done.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--bb-brand)' }}>
                        Jobs to be done
                      </p>
                      <ul className="space-y-0.5">
                        {p.jobs_to_be_done.map((job, i) => (
                          <li key={i} className="text-xs" style={{ color: 'var(--bb-ink-2)' }}>
                            • {job}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.key_features.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--bb-success)' }}>
                        Features-chave
                      </p>
                      <ul className="space-y-0.5">
                        {p.key_features.map((feat, i) => (
                          <li key={i} className="text-xs" style={{ color: 'var(--bb-ink-2)' }}>
                            • {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => startEdit(p)}
                    aria-label={`Editar persona ${p.name}`}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ border: '1px solid var(--bb-brand)', color: 'var(--bb-brand)', background: 'transparent' }}
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                </div>
              )}

              {/* Edit panel */}
              {editingId === p.id && (
                <div
                  className="mt-1 rounded-xl p-4 space-y-3"
                  style={{ background: 'var(--bb-depth-2)', borderTop: '2px solid var(--bb-brand)' }}
                >
                  <input
                    type="text"
                    value={editData.name ?? ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    aria-label="Nome da persona"
                    placeholder="Nome"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', border: '1px solid var(--bb-depth-3, var(--bb-ink-3))' }}
                  />
                  <textarea
                    value={editData.description ?? ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    aria-label="Descrição da persona"
                    placeholder="Descrição"
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-y"
                    style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', border: '1px solid var(--bb-depth-3, var(--bb-ink-3))' }}
                  />

                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--bb-ink-3)' }}>Dores (uma por linha)</p>
                    <textarea
                      value={(editData.pains ?? []).join('\n')}
                      onChange={(e) => setEditData({ ...editData, pains: e.target.value.split('\n') })}
                      aria-label="Dores da persona"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-y"
                      style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', border: '1px solid var(--bb-depth-3, var(--bb-ink-3))' }}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--bb-ink-3)' }}>Jobs to be done (um por linha)</p>
                    <textarea
                      value={(editData.jobs_to_be_done ?? []).join('\n')}
                      onChange={(e) => setEditData({ ...editData, jobs_to_be_done: e.target.value.split('\n') })}
                      aria-label="Jobs to be done da persona"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-y"
                      style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', border: '1px solid var(--bb-depth-3, var(--bb-ink-3))' }}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--bb-ink-3)' }}>Features-chave (uma por linha)</p>
                    <textarea
                      value={(editData.key_features ?? []).join('\n')}
                      onChange={(e) => setEditData({ ...editData, key_features: e.target.value.split('\n') })}
                      aria-label="Features-chave da persona"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-y"
                      style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-1)', border: '1px solid var(--bb-depth-3, var(--bb-ink-3))' }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleSavePersona()}
                      disabled={saving}
                      aria-label="Salvar edição da persona"
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ background: 'var(--bb-brand)', color: '#fff' }}
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar edição da persona"
                      className="rounded-lg px-3 py-1.5 text-xs"
                      style={{ color: 'var(--bb-ink-2)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 5: Métricas de Produto
// ---------------------------------------------------------------------------

function MetricasSection() {
  const funnelData = [
    { label: 'Lead', value: 120, pct: 100 },
    { label: 'Trial', value: 45, pct: 37.5 },
    { label: 'Conversão', value: 18, pct: 15 },
    { label: 'Ativo', value: 14, pct: 11.7 },
  ];

  const topModules = [
    { label: 'Check-in QR', usage: 92 },
    { label: 'Diário de Aula', usage: 74 },
    { label: 'Vídeo-Aulas', usage: 68 },
    { label: 'Gestão de Alunos', usage: 55 },
    { label: 'Agenda', usage: 42 },
  ];

  return (
    <section className="space-y-4">
      <SectionHeader title="Métricas de Produto" />

      <p className="text-xs italic" style={{ color: 'var(--bb-ink-3)' }}>
        Dados reais disponíveis após integrar analytics
      </p>

      {/* Funnel */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bb-depth-2)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
          Funil de Conversão
        </p>
        {funnelData.map((step) => (
          <div key={step.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-1)' }}>
                {step.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                {step.value} ({step.pct}%)
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--bb-depth-1)' }}>
              <div
                className="rounded-full h-2 transition-all"
                style={{
                  width: `${step.pct}%`,
                  background: 'var(--bb-brand)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top modules */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bb-depth-2)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
          Módulos mais usados
        </p>
        {topModules.map((mod) => (
          <div key={mod.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-1)' }}>
                {mod.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>
                {mod.usage}%
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--bb-depth-1)' }}>
              <div
                className="rounded-full h-2 transition-all"
                style={{
                  width: `${mod.usage}%`,
                  background: mod.usage >= 80 ? 'var(--bb-success)' : mod.usage >= 50 ? 'var(--bb-warning)' : 'var(--bb-danger)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CpoPage() {
  return (
    <div className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto">
      <h1
        className="text-xl font-bold"
        style={{ color: 'var(--bb-ink-1)' }}
      >
        Cockpit CPO
      </h1>

      <SprintSection />
      <RoadmapSection />
      <FeedbackSection />
      <PersonasSection />
      <MetricasSection />
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getEvaluableStudents,
  getStudentEvaluationTimeline,
  createEvaluation,
  getProfessorClasses,
} from '@/lib/api/evaluation.service';
import type {
  EvaluableStudent,
  StudentEvaluation,
  EvaluationTimeline,
  CreateEvaluationPayload,
} from '@/lib/types/evaluation';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Belt display helpers ────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_LABEL: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

// ── SVG Radar Chart ─────────────────────────────────────────────────

interface RadarChartProps {
  technique: number;
  posture: number;
  evolution: number;
  behavior: number;
  conditioning: number;
  theory: number;
  discipline: number;
  size?: number;
}

function RadarChart({ technique, posture, evolution, behavior, conditioning, theory, discipline, size = 200 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const labels = ['Tecnica', 'Postura', 'Evolucao', 'Comportamento', 'Condic.', 'Teoria', 'Disciplina'];
  const values = [technique, posture, evolution, behavior, conditioning, theory, discipline];
  const angles = values.map((_, i) => (Math.PI * 2 * i) / 7 - Math.PI / 2);

  // Grid levels
  const gridLevels = [2, 4, 6, 8, 10];

  // Calculate polygon points
  const polygonPoints = values
    .map((v, i) => {
      const r = (v / 10) * maxRadius;
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid polygons */}
      {gridLevels.map((level) => {
        const r = (level / 10) * maxRadius;
        const points = angles
          .map((a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="var(--bb-glass-border)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxRadius * Math.cos(a)}
          y2={cy + maxRadius * Math.sin(a)}
          stroke="var(--bb-glass-border)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="var(--bb-brand-surface)"
        stroke="var(--bb-brand)"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* Data points */}
      {values.map((v, i) => {
        const r = (v / 10) * maxRadius;
        const x = cx + r * Math.cos(angles[i]);
        const y = cy + r * Math.sin(angles[i]);
        return <circle key={i} cx={x} cy={y} r="4" fill="var(--bb-brand)" />;
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const labelR = maxRadius + 20;
        const x = cx + labelR * Math.cos(angles[i]);
        const y = cy + labelR * Math.sin(angles[i]);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--bb-ink-60)"
            fontSize="11"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}

      {/* Score values near data points */}
      {values.map((v, i) => {
        const r = (v / 10) * maxRadius;
        const offsetR = r + 14;
        const x = cx + offsetR * Math.cos(angles[i]);
        const y = cy + offsetR * Math.sin(angles[i]);
        return (
          <text
            key={`val-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--bb-brand)"
            fontSize="12"
            fontWeight="700"
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}

// ── Score Slider Component ──────────────────────────────────────────

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function ScoreSlider({ label, value, onChange }: ScoreSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--bb-ink-80)]">{label}</span>
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'var(--bb-brand-gradient)' }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--bb-brand)]"
      />
      <div className="flex justify-between text-[10px] text-[var(--bb-ink-40)]">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

// ── Skeleton Loading ────────────────────────────────────────────────

function EvaluationSkeleton() {
  return (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-40" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="card" className="h-12" />
        ))}
      </div>
      <Skeleton variant="text" className="h-10 w-full" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-24" />
      ))}
    </div>
  );
}

// ── Views ───────────────────────────────────────────────────────────

type ViewMode = 'list' | 'evaluate' | 'history';

// ── Page Component ──────────────────────────────────────────────────

export default function ProfessorAvaliacoesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<EvaluableStudent[]>([]);
  const [classes, setClasses] = useState<Array<{ class_id: string; class_name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  // View mode
  const [view, setView] = useState<ViewMode>('list');
  const [selectedStudent, setSelectedStudent] = useState<EvaluableStudent | null>(null);

  // Evaluation form — 7 criteria
  const [technique, setTechnique] = useState(5);
  const [posture, setPosture] = useState(5);
  const [evolution, setEvolution] = useState(5);
  const [behavior, setBehavior] = useState(5);
  const [conditioning, setConditioning] = useState(5);
  const [theory, setTheory] = useState(5);
  const [discipline, setDiscipline] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [prontoGraduar, setProntoGraduar] = useState(false);

  // History
  const [timeline, setTimeline] = useState<EvaluationTimeline | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const professorId = profile?.id ?? '';

  // Load data
  useEffect(() => {
    if (!professorId) return;
    async function load() {
      try {
        const [studentData, classData] = await Promise.all([
          getEvaluableStudents(professorId),
          getProfessorClasses(professorId),
        ]);
        setStudents(studentData);
        setClasses(classData);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [professorId, toast]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = s.display_name.toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'all' || s.class_id === filterClass;
      return matchSearch && matchClass;
    });
  }, [students, search, filterClass]);

  // Open evaluation form
  const openEvaluation = useCallback((student: EvaluableStudent) => {
    setSelectedStudent(student);
    setTechnique(5);
    setPosture(5);
    setEvolution(5);
    setBehavior(5);
    setConditioning(5);
    setTheory(5);
    setDiscipline(5);
    setComment('');
    setProntoGraduar(false);
    setView('evaluate');
  }, []);

  // Open history
  const openHistory = useCallback(async (student: EvaluableStudent) => {
    setSelectedStudent(student);
    setLoadingHistory(true);
    setView('history');
    try {
      const data = await getStudentEvaluationTimeline(student.student_id);
      setTimeline(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [toast]);

  // Submit evaluation
  const handleSubmit = useCallback(async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const payload: CreateEvaluationPayload = {
        student_id: selectedStudent.student_id,
        class_id: selectedStudent.class_id,
        technique,
        posture,
        evolution,
        behavior,
        conditioning,
        theory,
        discipline,
        comment,
      };
      await createEvaluation(payload);
      toast('Avaliacao salva com sucesso!', 'success');
      // Refresh students
      const updated = await getEvaluableStudents(professorId);
      setStudents(updated);
      setView('list');
      setSelectedStudent(null);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedStudent, technique, posture, evolution, behavior, conditioning, theory, discipline, comment, professorId, toast]);

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return <EvaluationSkeleton />;
  }

  if (students.length === 0) {
    return (
      <PlanGate module="avaliacoes">
        <div className="p-4">
          <EmptyState
            title="Nenhum aluno encontrado"
            description="Voce nao possui alunos matriculados nas suas turmas para avaliar."
          />
        </div>
      </PlanGate>
    );
  }

  // ── Evaluation Form View ──────────────────────────────────────────

  if (view === 'evaluate' && selectedStudent) {
    const avg = ((technique + posture + evolution + behavior + conditioning + theory + discipline) / 7).toFixed(1);

    return (
      <PlanGate module="avaliacoes">
        <div className="space-y-5 p-4 pb-24">
        {/* Back button */}
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--bb-brand)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </button>

        {/* Student Header */}
        <div className="flex items-center gap-3">
          <Avatar name={selectedStudent.display_name} src={selectedStudent.avatar} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-[var(--bb-ink-100)]">
              {selectedStudent.display_name}
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge
                variant="belt"
                beltColor={BELT_COLORS[selectedStudent.belt] ?? '#D4D4D4'}
                size="sm"
              >
                {BELT_LABEL[selectedStudent.belt] ?? selectedStudent.belt}
              </Badge>
              <span className="text-xs text-[var(--bb-ink-40)]">{selectedStudent.class_name}</span>
            </div>
          </div>
        </div>

        {/* Radar Chart Preview */}
        <Card className="p-4">
          <h2 className="mb-2 text-center text-sm font-semibold text-[var(--bb-ink-80)]">
            Grafico de Avaliacao
          </h2>
          <RadarChart
            technique={technique}
            posture={posture}
            evolution={evolution}
            behavior={behavior}
            conditioning={conditioning}
            theory={theory}
            discipline={discipline}
            size={240}
          />
          <p className="mt-2 text-center text-xs text-[var(--bb-ink-40)]">
            Media: <span className="font-bold text-[var(--bb-brand)]">{avg}</span>/10
          </p>
        </Card>

        {/* Score Sliders — 7 criteria */}
        <Card className="space-y-5 p-4">
          <h2 className="text-sm font-semibold text-[var(--bb-ink-80)]">Pontuacoes (7 Criterios)</h2>
          <ScoreSlider label="Tecnica (pe e chao)" value={technique} onChange={setTechnique} />
          <ScoreSlider label="Postura / Guarda" value={posture} onChange={setPosture} />
          <ScoreSlider label="Evolucao desde ultima avaliacao" value={evolution} onChange={setEvolution} />
          <ScoreSlider label="Comportamento" value={behavior} onChange={setBehavior} />
          <ScoreSlider label="Condicionamento fisico" value={conditioning} onChange={setConditioning} />
          <ScoreSlider label="Conhecimento teorico" value={theory} onChange={setTheory} />
          <ScoreSlider label="Disciplina e dedicacao" value={discipline} onChange={setDiscipline} />
        </Card>

        {/* Comment */}
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-[var(--bb-ink-80)]">Observacoes</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentarios sobre o desempenho do aluno..."
            rows={4}
            className="w-full resize-none rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-3 py-2 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]"
          />
        </Card>

        {/* Pronto para graduar */}
        <Card className="p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Pronto para graduar?</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Recomendar este aluno para graduação de faixa</p>
            </div>
            <Toggle checked={prontoGraduar} onChange={setProntoGraduar} label="Pronto para graduar?" />
          </label>
        </Card>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] p-4">
          <Button
            size="lg"
            loading={saving}
            onClick={handleSubmit}
            className="w-full"
          >
            {prontoGraduar ? 'Salvar e Recomendar Graduacao' : 'Salvar Avaliacao'}
          </Button>
        </div>
      </div>
      </PlanGate>
    );
  }

  // ── History View ──────────────────────────────────────────────────

  if (view === 'history' && selectedStudent) {
    return (
      <PlanGate module="avaliacoes">
        <div className="space-y-5 p-4">
        {/* Back button */}
        <button
          onClick={() => { setView('list'); setTimeline(null); }}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--bb-brand)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </button>

        {/* Student Header */}
        <div className="flex items-center gap-3">
          <Avatar name={selectedStudent.display_name} src={selectedStudent.avatar} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-[var(--bb-ink-100)]">
              Historico: {selectedStudent.display_name}
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge
                variant="belt"
                beltColor={BELT_COLORS[selectedStudent.belt] ?? '#D4D4D4'}
                size="sm"
              >
                {BELT_LABEL[selectedStudent.belt] ?? selectedStudent.belt}
              </Badge>
            </div>
          </div>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !timeline || timeline.evaluations.length === 0 ? (
          <EmptyState
            title="Sem avaliacoes"
            description="Este aluno ainda nao possui avaliacoes registradas."
          />
        ) : (
          <>
            {/* Latest Radar Chart */}
            <Card className="p-4">
              <h2 className="mb-2 text-center text-sm font-semibold text-[var(--bb-ink-80)]">
                Ultima Avaliacao
              </h2>
              <RadarChart
                technique={timeline.evaluations[0].technique}
                posture={timeline.evaluations[0].posture}
                evolution={timeline.evaluations[0].evolution}
                behavior={timeline.evaluations[0].behavior}
                conditioning={timeline.evaluations[0].conditioning ?? 5}
                theory={timeline.evaluations[0].theory ?? 5}
                discipline={timeline.evaluations[0].discipline ?? 5}
                size={240}
              />
            </Card>

            {/* Timeline */}
            <div className="space-y-0">
              <h2 className="mb-3 text-sm font-semibold text-[var(--bb-ink-80)]">
                Historico de Avaliacoes ({timeline.evaluations.length})
              </h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-[var(--bb-glass-border)]" />

                {timeline.evaluations.map((ev, idx) => (
                  <TimelineCard key={ev.id} evaluation={ev} isFirst={idx === 0} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      </PlanGate>
    );
  }

  // ── Student List View (default) ───────────────────────────────────

  return (
    <PlanGate module="avaliacoes">
      <div className="space-y-5 p-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">Avaliacoes</h1>
          <p className="text-sm text-[var(--bb-ink-60)]">
            Avalie seus alunos em 7 eixos de desempenho
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[var(--bb-brand)]">{students.length}</p>
            <p className="text-xs text-[var(--bb-ink-40)]">Alunos</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[var(--bb-ink-80)]">{classes.length}</p>
            <p className="text-xs text-[var(--bb-ink-40)]">Turmas</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno..."
            className="w-full rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-4 py-2.5 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]"
          />

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-3 py-2 text-sm text-[var(--bb-ink-100)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]"
          >
            <option value="all">Todas as turmas</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--bb-ink-40)]">
            Nenhum aluno encontrado com esses filtros.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.student_id} className="p-4">
                {/* Top row: avatar + name + belt */}
                <div className="flex items-center gap-3">
                  <Avatar name={student.display_name} src={student.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--bb-ink-100)]">
                      {student.display_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant="belt"
                        beltColor={BELT_COLORS[student.belt] ?? '#D4D4D4'}
                        size="sm"
                      >
                        {BELT_LABEL[student.belt] ?? student.belt}
                      </Badge>
                      <span className="text-xs text-[var(--bb-ink-40)]">{student.class_name}</span>
                    </div>
                  </div>
                </div>

                {/* Evaluation meta */}
                <div className="mt-3 border-t border-[var(--bb-glass-border)] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--bb-ink-40)]">
                        Ultima avaliacao
                      </p>
                      <p className="text-xs text-[var(--bb-ink-60)]">
                        {student.last_evaluation_date
                          ? new Date(student.last_evaluation_date).toLocaleDateString('pt-BR')
                          : 'Nunca avaliado'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openHistory(student)}>
                        Historico
                      </Button>
                      <Button size="sm" onClick={() => openEvaluation(student)}>
                        Avaliar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PlanGate>
  );
}

// ── Timeline Card Component ─────────────────────────────────────────

function TimelineCard({ evaluation, isFirst }: { evaluation: StudentEvaluation; isFirst: boolean }) {
  const avg = ((evaluation.technique + evaluation.posture + evaluation.evolution + evaluation.behavior + (evaluation.conditioning ?? 5) + (evaluation.theory ?? 5) + (evaluation.discipline ?? 5)) / 7).toFixed(1);
  const date = new Date(evaluation.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative mb-4 pl-10">
      {/* Timeline dot */}
      <div
        className="absolute left-[10px] top-2 h-3 w-3 rounded-full border-2"
        style={{
          borderColor: isFirst ? 'var(--bb-brand)' : 'var(--bb-ink-40)',
          backgroundColor: isFirst ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
        }}
      />

      <Card className={`p-4 ${isFirst ? 'border-[var(--bb-brand)]' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--bb-ink-60)]">{date}</p>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background: 'var(--bb-brand-surface)',
              color: 'var(--bb-brand)',
            }}
          >
            Media: {avg}
          </span>
        </div>

        {/* Mini scores */}
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[
            { label: 'Tec', value: evaluation.technique },
            { label: 'Pos', value: evaluation.posture },
            { label: 'Evo', value: evaluation.evolution },
            { label: 'Comp', value: evaluation.behavior },
            { label: 'Cond', value: evaluation.conditioning ?? 5 },
            { label: 'Teor', value: evaluation.theory ?? 5 },
            { label: 'Disc', value: evaluation.discipline ?? 5 },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-[var(--bb-ink-40)]">
                {item.label}
              </p>
              <p
                className="text-sm font-bold"
                style={{
                  color:
                    item.value >= 8
                      ? 'var(--bb-success)'
                      : item.value >= 5
                        ? 'var(--bb-warning)'
                        : 'var(--bb-error)',
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Comment */}
        {evaluation.comment && (
          <p className="mt-3 border-t border-[var(--bb-glass-border)] pt-2 text-xs text-[var(--bb-ink-60)]">
            {evaluation.comment}
          </p>
        )}
      </Card>
    </div>
  );
}

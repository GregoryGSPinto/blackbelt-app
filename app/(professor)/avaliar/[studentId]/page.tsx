'use client';

import { useEffect, useState, useCallback, forwardRef, type HTMLAttributes } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  getStudentForEvaluation,
  getEvaluationHistory,
  saveEvaluation,
  promoteBelt,
} from '@/lib/api/avaliacao.service';
import type {
  StudentForEvaluationDTO,
  EvaluationHistoryDTO,
  EvaluationRecordDTO,
  VideoRecommendationDTO,
} from '@/lib/api/avaliacao.service';
import { BeltLevel, BELT_ORDER, MIN_ATTENDANCE_FOR_PROMOTION } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Dynamic Recharts imports (no SSR) ────────────────────────────────
const RadarChart = dynamic(() => import('recharts').then((m) => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then((m) => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((m) => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((m) => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then((m) => m.PolarRadiusAxis), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

// ── Belt Color Map ───────────────────────────────────────────────────
const BELT_COLORS: Record<string, string> = {
  white: '#f5f5f5',
  gray: '#9ca3af',
  yellow: '#eab308',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  brown: '#92400e',
  black: '#1a1a1a',
};

const BELT_LABELS: Record<string, string> = {
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

// ── Observation Templates ────────────────────────────────────────────
const OBSERVATION_TEMPLATES: string[] = [
  'Aluno demonstra boa evolucao tecnica. Recomendo foco em...',
  'Precisa melhorar consistencia nos treinos. Sugiro aumentar frequencia para...',
  'Excelente disciplina e comprometimento. Destaque em...',
  'Boa base tecnica, mas precisa desenvolver jogo ofensivo em...',
  'Evolucao significativa desde a ultima avaliacao. Pontos fortes:...',
];

// ── Slider Component ─────────────────────────────────────────────────

interface SliderProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ label, value, onValueChange, min = 0, max = 100, className, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const color =
      percentage >= 80
        ? 'bg-bb-success'
        : percentage >= 60
          ? 'bg-bb-warning'
          : 'bg-bb-error';

    return (
      <div ref={ref} className={className} {...props}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-bb-gray-700">{label}</span>
          <span className="text-sm font-bold text-bb-gray-900">{value}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bb-gray-200 accent-bb-red"
            aria-label={`${label}: ${value}`}
          />
          <div
            className={`pointer-events-none absolute left-0 top-0 h-2 rounded-full ${color} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-bb-gray-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  },
);
Slider.displayName = 'Slider';

// ── Main Page Component ──────────────────────────────────────────────

export default function AvaliarStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const [student, setStudent] = useState<StudentForEvaluationDTO | null>(null);
  const [history, setHistory] = useState<EvaluationHistoryDTO | null>(null);

  // Evaluation scores
  const [tecnica, setTecnica] = useState(50);
  const [disciplina, setDisciplina] = useState(50);
  const [evolucao, setEvolucao] = useState(50);
  const [consistencia, setConsistencia] = useState(50);
  const [observations, setObservations] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [studentData, historyData] = await Promise.all([
        getStudentForEvaluation(studentId),
        getEvaluationHistory(studentId),
      ]);
      setStudent(studentData);
      setHistory(historyData);

      // Pre-fill with slightly higher than last evaluation
      if (historyData.records.length > 0) {
        const last = historyData.records[0];
        setTecnica(Math.min(100, last.tecnica + 5));
        setDisciplina(Math.min(100, last.disciplina + 5));
        setEvolucao(Math.min(100, last.evolucao + 5));
        setConsistencia(Math.min(100, last.consistencia + 5));
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Radar chart data ──────────────────────────────────────────────
  const previousEval: EvaluationRecordDTO | null = history?.records[0] ?? null;

  const radarData = [
    {
      criteria: 'Tecnica',
      atual: tecnica,
      anterior: previousEval?.tecnica ?? 0,
    },
    {
      criteria: 'Disciplina',
      atual: disciplina,
      anterior: previousEval?.disciplina ?? 0,
    },
    {
      criteria: 'Evolucao',
      atual: evolucao,
      anterior: previousEval?.evolucao ?? 0,
    },
    {
      criteria: 'Consistencia',
      atual: consistencia,
      anterior: previousEval?.consistencia ?? 0,
    },
  ];

  // ── Belt promotion logic ──────────────────────────────────────────
  function getNextBelt(currentBelt: BeltLevel): BeltLevel | null {
    const idx = BELT_ORDER.indexOf(currentBelt);
    if (idx < 0 || idx >= BELT_ORDER.length - 1) return null;
    return BELT_ORDER[idx + 1];
  }

  function canPromote(): { eligible: boolean; reason: string } {
    if (!student) return { eligible: false, reason: 'Dados do aluno nao carregados' };

    const nextBelt = getNextBelt(student.belt);
    if (!nextBelt) return { eligible: false, reason: 'Aluno ja esta na faixa maxima' };

    const minAttendance = MIN_ATTENDANCE_FOR_PROMOTION[nextBelt];
    if (student.attendance_count < minAttendance) {
      return {
        eligible: false,
        reason: `Presencas insuficientes: ${student.attendance_count}/${minAttendance} para faixa ${BELT_LABELS[nextBelt] ?? nextBelt}`,
      };
    }

    const avgScore = (tecnica + disciplina + evolucao + consistencia) / 4;
    if (avgScore < 70) {
      return {
        eligible: false,
        reason: `Media de avaliacao insuficiente: ${avgScore.toFixed(0)}/70`,
      };
    }

    return { eligible: true, reason: '' };
  }

  const promotionStatus = canPromote();
  const nextBelt = student ? getNextBelt(student.belt) : null;

  // ── Handlers ──────────────────────────────────────────────────────

  async function handleSave() {
    if (!student) return;
    setSaving(true);
    try {
      await saveEvaluation({
        student_id: student.student_id,
        academy_id: student.academy_id,
        tecnica,
        disciplina,
        evolucao,
        consistencia,
        observations,
      });
      toast('Avaliacao salva com sucesso!', 'success');
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handlePromote() {
    if (!student || !nextBelt) return;
    setPromoting(true);
    try {
      await promoteBelt(student.student_id, nextBelt, student.academy_id);
      toast(`Aluno promovido para faixa ${BELT_LABELS[nextBelt] ?? nextBelt}!`, 'success');
      setShowPromoteModal(false);
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setPromoting(false);
    }
  }

  // ── Weakest areas for recommendations ─────────────────────────────
  function getWeakestCriteria(): string {
    const scores: Array<{ label: string; value: number }> = [
      { label: 'tecnica', value: tecnica },
      { label: 'disciplina', value: disciplina },
      { label: 'evolucao', value: evolucao },
      { label: 'consistencia', value: consistencia },
    ];
    scores.sort((a, b) => a.value - b.value);
    return scores[0].label;
  }

  const weakest = getWeakestCriteria();
  const filteredRecommendations = (history?.recommendations ?? []).filter(
    (r: VideoRecommendationDTO) => r.criteria === weakest || r.criteria === 'tecnica',
  );

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 text-center text-bb-gray-500">
        Aluno nao encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ── Header: Student Profile ───────────────────────────────── */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-4">
          <Avatar size="xl" name={student.display_name} src={student.avatar} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-bb-black">{student.display_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Badge
                variant="belt"
                beltColor={BELT_COLORS[student.belt] ?? '#1a1a1a'}
                size="md"
              >
                {BELT_LABELS[student.belt] ?? student.belt}
              </Badge>
              <span className="text-sm text-bb-gray-500">
                {student.total_classes} aulas
              </span>
              <span className="text-sm text-bb-gray-500">
                Ultima avaliacao:{' '}
                {student.last_evaluation_date
                  ? new Date(student.last_evaluation_date).toLocaleDateString('pt-BR')
                  : 'Nunca'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left Column: Sliders ──────────────────────────────── */}
        <div className="space-y-6">
          <Card className="space-y-6 p-6">
            <h2 className="text-lg font-semibold text-bb-black">Avaliacao</h2>

            <Slider
              label="Tecnica"
              value={tecnica}
              onValueChange={setTecnica}
            />
            <Slider
              label="Disciplina"
              value={disciplina}
              onValueChange={setDisciplina}
            />
            <Slider
              label="Evolucao"
              value={evolucao}
              onValueChange={setEvolucao}
            />
            <Slider
              label="Consistencia"
              value={consistencia}
              onValueChange={setConsistencia}
            />

            <div className="rounded-lg bg-bb-gray-50 p-3 text-center">
              <span className="text-sm text-bb-gray-500">Media Geral</span>
              <p className="text-2xl font-bold text-bb-black">
                {((tecnica + disciplina + evolucao + consistencia) / 4).toFixed(0)}
              </p>
            </div>
          </Card>

          {/* ── Observations ─────────────────────────────────────── */}
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold text-bb-black">Observacoes</h2>

            <div className="mb-3 flex flex-wrap gap-2">
              {OBSERVATION_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setObservations(tpl)}
                  className="rounded-full border border-bb-gray-300 px-3 py-1 text-xs text-bb-gray-600 transition-colors hover:border-bb-red hover:text-bb-red"
                >
                  {tpl.substring(0, 40)}...
                </button>
              ))}
            </div>

            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-bb-gray-300 p-3 text-sm text-bb-gray-900 placeholder:text-bb-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-red focus-visible:ring-offset-2"
              placeholder="Escreva suas observacoes sobre o aluno..."
            />
          </Card>
        </div>

        {/* ── Right Column: Radar Chart + Actions ───────────────── */}
        <div className="space-y-6">
          {/* Radar Chart */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-bb-black">
              Comparativo de Avaliacao
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="criteria"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <Radar
                    name="Anterior"
                    dataKey="anterior"
                    stroke="#9ca3af"
                    fill="#9ca3af"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Atual"
                    dataKey="atual"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recommendations */}
          {filteredRecommendations.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-bb-black">
                Videos Recomendados
              </h2>
              <p className="mb-3 text-xs text-bb-gray-500">
                Baseado na area mais fraca: <span className="font-medium capitalize">{weakest}</span>
              </p>
              <div className="space-y-2">
                {filteredRecommendations.map((video: VideoRecommendationDTO) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => router.push(video.url)}
                    className="flex w-full items-center gap-3 rounded-lg border border-bb-gray-200 p-3 text-left transition-colors hover:bg-bb-gray-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bb-red/10 text-bb-red">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-bb-black">
                        {video.title}
                      </p>
                      <p className="text-xs text-bb-gray-500">
                        {Math.floor(video.duration / 60)}min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Evaluation History */}
          {(history?.records ?? []).length > 0 && (
            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-bb-black">
                Historico de Avaliacoes
              </h2>
              <div className="space-y-3">
                {(history?.records ?? []).map((record: EvaluationRecordDTO) => (
                  <div
                    key={record.id}
                    className="rounded-lg border border-bb-gray-200 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-bb-black">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs text-bb-gray-500">
                        {record.professor_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <p className="text-bb-gray-500">Tecnica</p>
                        <p className="font-bold text-bb-gray-900">{record.tecnica}</p>
                      </div>
                      <div>
                        <p className="text-bb-gray-500">Disciplina</p>
                        <p className="font-bold text-bb-gray-900">{record.disciplina}</p>
                      </div>
                      <div>
                        <p className="text-bb-gray-500">Evolucao</p>
                        <p className="font-bold text-bb-gray-900">{record.evolucao}</p>
                      </div>
                      <div>
                        <p className="text-bb-gray-500">Consistencia</p>
                        <p className="font-bold text-bb-gray-900">{record.consistencia}</p>
                      </div>
                    </div>
                    {record.observations && (
                      <p className="mt-2 text-xs italic text-bb-gray-500">
                        {record.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── Action Buttons ─────────────────────────────────────────── */}
      <Card className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 border-t border-bb-gray-200 p-4">
        <div className="flex items-center gap-3">
          {nextBelt && (
            <div className="text-sm text-bb-gray-600">
              {promotionStatus.eligible ? (
                <span className="text-bb-success font-medium">
                  Elegivel para faixa {BELT_LABELS[nextBelt] ?? nextBelt}
                </span>
              ) : (
                <span className="text-bb-gray-500">{promotionStatus.reason}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {nextBelt && (
            <Button
              variant="secondary"
              disabled={!promotionStatus.eligible}
              onClick={() => setShowPromoteModal(true)}
            >
              Promover Faixa
            </Button>
          )}
          <Button
            variant="primary"
            loading={saving}
            onClick={handleSave}
            disabled={saving}
          >
            Salvar Avaliacao
          </Button>
        </div>
      </Card>

      {/* ── Promote Modal ──────────────────────────────────────────── */}
      <Modal
        open={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        variant="confirm"
        title="Confirmar Promocao de Faixa"
      >
        <div className="space-y-4">
          <p className="text-sm text-bb-gray-700">
            Voce esta prestes a promover <strong>{student.display_name}</strong> de{' '}
            <Badge variant="belt" beltColor={BELT_COLORS[student.belt] ?? '#1a1a1a'} size="sm">
              {BELT_LABELS[student.belt] ?? student.belt}
            </Badge>{' '}
            para{' '}
            {nextBelt && (
              <Badge variant="belt" beltColor={BELT_COLORS[nextBelt] ?? '#1a1a1a'} size="sm">
                {BELT_LABELS[nextBelt] ?? nextBelt}
              </Badge>
            )}
          </p>

          <div className="rounded-lg bg-bb-gray-50 p-3">
            <p className="text-xs text-bb-gray-500">Resumo da avaliacao atual:</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="text-bb-gray-500">Tec</p>
                <p className="font-bold">{tecnica}</p>
              </div>
              <div>
                <p className="text-bb-gray-500">Disc</p>
                <p className="font-bold">{disciplina}</p>
              </div>
              <div>
                <p className="text-bb-gray-500">Evo</p>
                <p className="font-bold">{evolucao}</p>
              </div>
              <div>
                <p className="text-bb-gray-500">Cons</p>
                <p className="font-bold">{consistencia}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowPromoteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={promoting}
              onClick={handlePromote}
              disabled={promoting}
            >
              Confirmar Promocao
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

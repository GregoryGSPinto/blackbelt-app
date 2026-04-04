'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getGoals, createGoal, getDiary, saveDiaryEntry } from '@/lib/api/metas.service';
import type { GoalDTO, DiaryEntryDTO, GoalType, MoodRating, CreateGoalPayload, SaveDiaryPayload } from '@/lib/api/metas.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────
const MOOD_OPTIONS: { value: MoodRating; emoji: string; label: string }[] = [
  { value: 'great', emoji: '\uD83D\uDE0A', label: 'Otimo' },
  { value: 'ok', emoji: '\uD83D\uDE10', label: 'Ok' },
  { value: 'hard', emoji: '\uD83D\uDE13', label: 'Dificil' },
];

const TAG_OPTIONS = ['guarda', 'passagem', 'raspagem', 'finalizacao', 'defesa', 'takedown', 'controle', 'transicao'];

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  belt: 'Faixa',
  frequency: 'Frequencia',
  competition: 'Competicao',
  technique: 'Tecnica',
  custom: 'Outro',
};

const GOAL_TYPE_COLORS: Record<GoalType, string> = {
  belt: '#8E24AA',
  frequency: '#F97316',
  competition: '#EAB308',
  technique: '#3B82F6',
  custom: '#6B7280',
};

type Tab = 'goals' | 'diary';

// ────────────────────────────────────────────────────────────
// Helper: month string
// ────────────────────────────────────────────────────────────
function getMonthString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthStr: string): string {
  const [year, mon] = monthStr.split('-').map(Number);
  const d = new Date(year, mon - 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// ────────────────────────────────────────────────────────────
// Goal Card
// ────────────────────────────────────────────────────────────
function GoalCard({ goal }: { goal: GoalDTO }) {
  const isWeekly = goal.type === 'frequency' && goal.weekly_target !== null;

  return (
    <Card variant="outlined" className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: GOAL_TYPE_COLORS[goal.type] }}
            />
            <span className="text-[10px] font-semibold uppercase text-bb-gray-400">
              {GOAL_TYPE_LABELS[goal.type]}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-bb-gray-900">{goal.title}</p>
        </div>
        <span className="text-lg font-bold text-bb-red-500">{goal.progress_percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-bb-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${goal.progress_percent}%`,
            backgroundColor: GOAL_TYPE_COLORS[goal.type],
          }}
        />
      </div>

      {/* Weekly tracker */}
      {isWeekly && goal.weekly_current !== null && goal.weekly_target !== null && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-bb-gray-500">Esta semana:</span>
          <div className="flex gap-1">
            {Array.from({ length: goal.weekly_target }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  i < goal.weekly_current!
                    ? 'border-green-500 bg-green-500'
                    : 'border-bb-gray-300 bg-bb-white'
                }`}
              >
                {i < goal.weekly_current! && (
                  <svg className="h-full w-full p-0.5 text-bb-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-bb-gray-700">
            {goal.weekly_current}/{goal.weekly_target}
          </span>
        </div>
      )}

      {/* Target date */}
      {goal.target_date && (
        <p className="text-[10px] text-bb-gray-400">
          Meta: {new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
        </p>
      )}

      {goal.description && (
        <p className="text-xs text-bb-gray-500">{goal.description}</p>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Diary Entry Card
// ────────────────────────────────────────────────────────────
function DiaryCard({ entry }: { entry: DiaryEntryDTO }) {
  const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);

  return (
    <Card variant="outlined" className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{moodOption?.emoji ?? ''}</span>
          <div>
            <p className="text-xs font-semibold text-bb-gray-900">
              {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </p>
            {entry.class_name && (
              <p className="text-[10px] text-bb-gray-400">{entry.class_name}</p>
            )}
          </div>
        </div>
        <span className="text-[10px] font-medium text-bb-gray-400">{moodOption?.label}</span>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-bb-red-500/10 px-2 py-0.5 text-[10px] font-medium text-bb-red-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Note */}
      {entry.note && (
        <p className="text-xs text-bb-gray-600 italic">{entry.note}</p>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
export default function MetasPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [tab, setTab] = useState<Tab>('goals');
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [diary, setDiary] = useState<DiaryEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => getMonthString(new Date()));

  // New goal modal
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<GoalType>('belt');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalWeekly, setNewGoalWeekly] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Diary entry modal
  const [showNewDiary, setShowNewDiary] = useState(false);
  const [diaryMood, setDiaryMood] = useState<MoodRating>('great');
  const [diaryTags, setDiaryTags] = useState<string[]>([]);
  const [diaryNote, setDiaryNote] = useState('');
  const [diaryClassName, setDiaryClassName] = useState('');
  const [savingDiary, setSavingDiary] = useState(false);

  // Load data
  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const [g, d] = await Promise.all([
          getGoals(studentId!),
          getDiary(studentId!, currentMonth),
        ]);
        setGoals(g);
        setDiary(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentMonth, studentId, studentLoading]);

  // Month navigation
  const navigateMonth = useCallback((direction: -1 | 1) => {
    const [year, mon] = currentMonth.split('-').map(Number);
    const d = new Date(year, mon - 1 + direction);
    setCurrentMonth(getMonthString(d));
    setLoading(true);
  }, [currentMonth]);

  // Save new goal
  const handleSaveGoal = useCallback(async () => {
    if (!newGoalTitle.trim()) return;
    setSavingGoal(true);
    try {
      const payload: CreateGoalPayload = {
        student_id: studentId ?? '',
        academy_id: '',
        type: newGoalType,
        title: newGoalTitle,
        description: newGoalDesc,
        target_date: newGoalDate || null,
        weekly_target: newGoalType === 'frequency' && newGoalWeekly ? Number(newGoalWeekly) : null,
      };
      const created = await createGoal(payload);
      setGoals((prev) => [created, ...prev]);
      setShowNewGoal(false);
      setNewGoalTitle('');
      setNewGoalDesc('');
      setNewGoalDate('');
      setNewGoalWeekly('');
    } finally {
      setSavingGoal(false);
    }
  }, [newGoalType, newGoalTitle, newGoalDesc, newGoalDate, newGoalWeekly]);

  // Save diary entry
  const handleSaveDiary = useCallback(async () => {
    setSavingDiary(true);
    try {
      const payload: SaveDiaryPayload = {
        student_id: studentId ?? '',
        academy_id: getActiveAcademyId(),
        date: new Date().toISOString().split('T')[0],
        mood: diaryMood,
        tags: diaryTags,
        note: diaryNote,
        class_name: diaryClassName || null,
      };
      const saved = await saveDiaryEntry(payload);
      setDiary((prev) => [saved, ...prev]);
      setShowNewDiary(false);
      setDiaryMood('great');
      setDiaryTags([]);
      setDiaryNote('');
      setDiaryClassName('');
    } finally {
      setSavingDiary(false);
    }
  }, [diaryMood, diaryTags, diaryNote, diaryClassName]);

  // Toggle diary tag
  const toggleTag = useCallback((tag: string) => {
    setDiaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Diary sorted by date descending
  const sortedDiary = useMemo(
    () => [...diary].sort((a, b) => b.date.localeCompare(a.date)),
    [diary],
  );

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-10 flex-1" />
          <Skeleton variant="text" className="h-10 flex-1" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      <h1 className="text-xl font-bold text-bb-gray-900">Metas & Diario</h1>

      {/* Tab switcher */}
      <div className="flex rounded-lg bg-bb-gray-100 p-1">
        {(['goals', 'diary'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-bb-white text-bb-red-500 shadow-sm' : 'text-bb-gray-500'
            }`}
          >
            {t === 'goals' ? 'Minhas Metas' : 'Diario de Treino'}
          </button>
        ))}
      </div>

      {/* ── Goals tab ─────────────────────────────────────── */}
      {tab === 'goals' && (
        <div className="space-y-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewGoal(true)}
          >
            + Nova Meta
          </Button>

          {goals.length === 0 ? (
            <Card variant="outlined" className="py-12 text-center">
              <p className="text-sm text-bb-gray-400">Nenhuma meta definida ainda.</p>
              <p className="mt-1 text-xs text-bb-gray-400">Crie sua primeira meta!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Diary tab ─────────────────────────────────────── */}
      {tab === 'diary' && (
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="rounded-lg p-2 text-bb-gray-500 hover:bg-bb-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-sm font-semibold capitalize text-bb-gray-700">
              {formatMonthLabel(currentMonth)}
            </p>
            <button
              onClick={() => navigateMonth(1)}
              className="rounded-lg p-2 text-bb-gray-500 hover:bg-bb-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewDiary(true)}
          >
            + Registrar Treino
          </Button>

          {/* Diary summary for the month */}
          {sortedDiary.length > 0 && (
            <Card variant="outlined" className="flex items-center justify-around py-3">
              {MOOD_OPTIONS.map((m) => {
                const count = sortedDiary.filter((e) => e.mood === m.value).length;
                return (
                  <div key={m.value} className="text-center">
                    <span className="text-xl">{m.emoji}</span>
                    <p className="text-sm font-bold text-bb-gray-900">{count}</p>
                    <p className="text-[10px] text-bb-gray-400">{m.label}</p>
                  </div>
                );
              })}
              <div className="text-center">
                <p className="text-xl font-bold text-bb-red-500">{sortedDiary.length}</p>
                <p className="text-[10px] text-bb-gray-400">Total</p>
              </div>
            </Card>
          )}

          {sortedDiary.length === 0 ? (
            <Card variant="outlined" className="py-12 text-center">
              <p className="text-sm text-bb-gray-400">Nenhum registro neste mes.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedDiary.map((entry) => (
                <DiaryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── New goal modal ────────────────────────────────── */}
      <Modal open={showNewGoal} onClose={() => setShowNewGoal(false)} title="Nova Meta">
        <div className="space-y-4">
          {/* Goal type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-700">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewGoalType(type)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    newGoalType === type
                      ? 'text-bb-white'
                      : 'bg-bb-gray-100 text-bb-gray-500'
                  }`}
                  style={newGoalType === type ? { backgroundColor: GOAL_TYPE_COLORS[type] } : undefined}
                >
                  {GOAL_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="goal-title" className="mb-1 block text-xs font-medium text-bb-gray-700">
              Titulo
            </label>
            <input
              id="goal-title"
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Ex: Faixa roxa ate Dez/2026"
              className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="goal-desc" className="mb-1 block text-xs font-medium text-bb-gray-700">
              Descricao (opcional)
            </label>
            <textarea
              id="goal-desc"
              value={newGoalDesc}
              onChange={(e) => setNewGoalDesc(e.target.value)}
              rows={2}
              placeholder="Detalhes sobre a meta..."
              className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
            />
          </div>

          {/* Target date */}
          <div>
            <label htmlFor="goal-date" className="mb-1 block text-xs font-medium text-bb-gray-700">
              Data alvo (opcional)
            </label>
            <input
              id="goal-date"
              type="date"
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
              className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
            />
          </div>

          {/* Weekly target (only for frequency) */}
          {newGoalType === 'frequency' && (
            <div>
              <label htmlFor="goal-weekly" className="mb-1 block text-xs font-medium text-bb-gray-700">
                Vezes por semana
              </label>
              <input
                id="goal-weekly"
                type="number"
                min={1}
                max={7}
                value={newGoalWeekly}
                onChange={(e) => setNewGoalWeekly(e.target.value)}
                placeholder="4"
                className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
              />
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            loading={savingGoal}
            onClick={handleSaveGoal}
            disabled={!newGoalTitle.trim()}
          >
            Salvar Meta
          </Button>
        </div>
      </Modal>

      {/* ── New diary entry modal ─────────────────────────── */}
      <Modal open={showNewDiary} onClose={() => setShowNewDiary(false)} title="Registrar Treino">
        <div className="space-y-4">
          {/* Mood picker */}
          <div>
            <label className="mb-2 block text-xs font-medium text-bb-gray-700">Como foi o treino?</label>
            <div className="flex gap-3 justify-center">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setDiaryMood(m.value)}
                  className={`flex flex-col items-center rounded-xl px-4 py-3 transition-all ${
                    diaryMood === m.value
                      ? 'bg-bb-red-500/10 ring-2 ring-bb-red-500 scale-110'
                      : 'bg-bb-gray-50 hover:bg-bb-gray-100'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`mt-1 text-xs font-medium ${diaryMood === m.value ? 'text-bb-red-500' : 'text-bb-gray-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-xs font-medium text-bb-gray-700">O que trabalhou?</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    diaryTags.includes(tag)
                      ? 'bg-bb-red-500 text-bb-white'
                      : 'bg-bb-gray-100 text-bb-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Class name */}
          <div>
            <label htmlFor="diary-class" className="mb-1 block text-xs font-medium text-bb-gray-700">
              Aula (opcional)
            </label>
            <input
              id="diary-class"
              type="text"
              value={diaryClassName}
              onChange={(e) => setDiaryClassName(e.target.value)}
              placeholder="Ex: BJJ Adulto — Manha"
              className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="diary-note" className="mb-1 block text-xs font-medium text-bb-gray-700">
              Nota pessoal (opcional)
            </label>
            <textarea
              id="diary-note"
              value={diaryNote}
              onChange={(e) => setDiaryNote(e.target.value)}
              rows={3}
              placeholder="Como voce se sentiu? O que aprendeu?"
              className="w-full rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-900 outline-none focus:border-bb-red-500"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            loading={savingDiary}
            onClick={handleSaveDiary}
          >
            Salvar Registro
          </Button>
        </div>
      </Modal>
    </div>
  );
}

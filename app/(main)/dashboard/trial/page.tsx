'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Calendar,
  Trophy,
  Star,
  Flame,
  Dumbbell,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  getMyTrialInfo,
  getTrialActivity,
  getConversionOffer,
  startConversion,
} from '@/lib/api/trial.service';
import type { TrialStudent, TrialActivity } from '@/lib/api/trial.service';

// ── Types ──────────────────────────────────────────────────────────────

interface Modality {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

interface DayInfo {
  dayNumber: number;
  date: Date;
  label: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  trained: boolean;
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
  description: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const ACADEMY_NAME = 'BlackBelt Academy';

const ALL_MODALITIES: Modality[] = [
  { id: 'BJJ', name: 'Jiu-Jitsu', description: 'A arte suave. Controle e finalizacao no solo.', emoji: '\uD83E\uDD4B' },
  { id: 'Muay Thai', name: 'Muay Thai', description: 'A arte das 8 armas. Golpes com punhos, cotovelos, joelhos e canelas.', emoji: '\uD83E\uDD4A' },
  { id: 'Judo', name: 'Judo', description: 'O caminho suave. Projecoes e imobilizacoes.', emoji: '\uD83E\uDD45' },
  { id: 'Karate', name: 'Karate', description: 'O caminho das maos vazias. Disciplina e tecnica de golpes.', emoji: '\uD83E\uDD4B' },
  { id: 'Wrestling', name: 'Wrestling', description: 'Luta olimpica. Quedas e controle.', emoji: '\uD83C\uDFCB\uFE0F' },
  { id: 'Boxe', name: 'Boxe', description: 'A nobre arte. Esquivas, jabs e cruzados.', emoji: '\uD83E\uDD4A' },
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

// ── Helpers ────────────────────────────────────────────────────────────

function getMotivationalMessage(classesAttended: number): string {
  if (classesAttended === 0) return 'Sua primeira aula te espera! Escolha um horario abaixo.';
  if (classesAttended === 1) return 'Mandou bem na primeira aula! Quando e a proxima?';
  if (classesAttended <= 3) return 'Voce ja esta pegando o ritmo! Continue assim!';
  if (classesAttended <= 5) return 'Impressionante! Voce treinou mais que muitos alunos regulares!';
  return 'Dedicacao maxima! Voce nasceu pra isso! \uD83D\uDD25';
}

function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

function buildTrialWeek(student: TrialStudent, activities: TrialActivity[]): DayInfo[] {
  const startDate = new Date(student.trial_start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect dates when classes were attended
  const trainedDates = new Set<string>();
  for (const act of activities) {
    if (act.activity_type === 'class_attended' || act.activity_type === 'first_visit') {
      const d = new Date(act.created_at);
      trainedDates.add(d.toISOString().split('T')[0]);
    }
  }

  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const isPast = date.getTime() < today.getTime();
    const isFuture = date.getTime() > today.getTime();

    days.push({
      dayNumber: i + 1,
      date,
      label: WEEKDAY_LABELS[date.getDay()],
      isToday,
      isPast,
      isFuture,
      trained: trainedDates.has(dateStr),
    });
  }

  return days;
}

function getClassModalities(activities: TrialActivity[]): Set<string> {
  const modalities = new Set<string>();
  for (const act of activities) {
    if (act.activity_type === 'class_attended' || act.activity_type === 'first_visit') {
      const className = (act.details.class_name as string) ?? '';
      for (const mod of ALL_MODALITIES) {
        if (
          className.toLowerCase().includes(mod.id.toLowerCase()) ||
          className.toLowerCase().includes(mod.name.toLowerCase())
        ) {
          modalities.add(mod.id);
        }
      }
    }
  }
  return modalities;
}

function buildAchievements(
  student: TrialStudent,
  activities: TrialActivity[],
  triedModalities: Set<string>,
  totalModalities: number,
): Achievement[] {
  const hasConsecutive3 = checkConsecutiveDays(activities, 3);
  const triedAll = triedModalities.size >= totalModalities;
  const gaveFeedback = student.rating !== undefined && student.rating !== null;

  return [
    {
      id: 'primeira-aula',
      icon: '\uD83C\uDFC5',
      label: 'Primeira Aula',
      unlocked: student.trial_classes_attended >= 1,
      description: 'Participou da primeira aula',
    },
    {
      id: 'explorador',
      icon: '\uD83E\uDD4B',
      label: 'Explorador',
      unlocked: triedModalities.size >= 2,
      description: 'Experimentou 2 modalidades',
    },
    {
      id: 'dedicado',
      icon: '\uD83D\uDCAA',
      label: 'Dedicado',
      unlocked: hasConsecutive3,
      description: 'Treinou 3 dias seguidos',
    },
    {
      id: 'all-in',
      icon: '\uD83D\uDD25',
      label: 'All-in',
      unlocked: triedAll,
      description: 'Experimentou todas as modalidades',
    },
    {
      id: '5-estrelas',
      icon: '\u2B50',
      label: '5 Estrelas',
      unlocked: gaveFeedback,
      description: 'Deu feedback sobre a experiencia',
    },
  ];
}

function checkConsecutiveDays(activities: TrialActivity[], target: number): boolean {
  const classDates = new Set<string>();
  for (const act of activities) {
    if (act.activity_type === 'class_attended' || act.activity_type === 'first_visit') {
      classDates.add(new Date(act.created_at).toISOString().split('T')[0]);
    }
  }

  const sortedDates = Array.from(classDates).sort();
  if (sortedDates.length < target) return false;

  let consecutive = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = daysBetween(prev, curr);
    if (diff === 1) {
      consecutive++;
      if (consecutive >= target) return true;
    } else {
      consecutive = 1;
    }
  }
  return consecutive >= target;
}

// ── Loading Skeleton ───────────────────────────────────────────────────

function TrialDashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="text" className="h-6 w-2/3" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
      <Skeleton variant="card" className="h-32" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
      <Skeleton variant="card" className="h-28" />
    </div>
  );
}

// ── Trial Week Calendar ────────────────────────────────────────────────

function TrialWeekCalendar({ days }: { days: DayInfo[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((day) => (
        <div
          key={day.dayNumber}
          className={cn(
            'flex flex-col items-center rounded-xl border p-2 text-center transition-all',
            day.isToday &&
              'border-[var(--bb-brand)] bg-[var(--bb-brand)]/10 ring-2 ring-[var(--bb-brand)] ring-offset-1 ring-offset-[var(--bb-depth-2)]',
            day.isPast && day.trained &&
              'border-emerald-500/40 bg-emerald-500/10',
            day.isPast && !day.trained &&
              'border-red-400/30 bg-red-400/5',
            day.isFuture &&
              'border-[var(--bb-glass-border)] bg-[var(--bb-depth-3)] opacity-60',
          )}
        >
          <span className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">
            {day.label}
          </span>
          <span className="text-[10px] text-[var(--bb-ink-20)]">
            Dia {day.dayNumber}
          </span>

          {day.isToday ? (
            <div className="mt-1 flex flex-col items-center">
              <Dumbbell className="h-4 w-4 text-[var(--bb-brand)]" />
              <span className="mt-0.5 text-[8px] font-bold leading-tight text-[var(--bb-brand)]">
                Hoje!
              </span>
            </div>
          ) : day.isPast ? (
            <div className="mt-1">
              {day.trained ? (
                <Check className="mx-auto h-5 w-5 text-emerald-500" />
              ) : (
                <X className="mx-auto h-5 w-5 text-red-400/60" />
              )}
            </div>
          ) : (
            <div className="mt-1">
              <Calendar className="mx-auto h-4 w-4 text-[var(--bb-ink-20)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Conversion Card ────────────────────────────────────────────────────

function ConversionCard({
  dayOfTrial,
  discountPercent,
  validUntil,
  onConvert,
  loading,
}: {
  dayOfTrial: number;
  discountPercent: number | null;
  validUntil: string | null;
  onConvert: () => void;
  loading: boolean;
}) {
  if (dayOfTrial < 3) return null;

  const isSubtle = dayOfTrial <= 4;
  const isMedium = dayOfTrial >= 5 && dayOfTrial <= 6;
  const isUrgent = dayOfTrial >= 7;

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-4',
        isSubtle && 'border-[var(--bb-glass-border)]',
        isMedium && 'border-amber-400/60',
        isUrgent && 'border-[var(--bb-brand)]',
      )}
      style={
        isUrgent
          ? {
              animation: 'pulse-border 2s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(var(--bb-brand-rgb, 239 68 68), 0.15)',
            }
          : undefined
      }
    >
      {/* Gradient top accent */}
      <div
        className={cn(
          'absolute left-0 right-0 top-0 h-1',
          isSubtle && 'bg-gradient-to-r from-amber-400/40 to-orange-400/40',
          isMedium && 'bg-gradient-to-r from-amber-400 to-orange-500',
          isUrgent && 'bg-gradient-to-r from-[var(--bb-brand)] to-orange-500',
        )}
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            isSubtle && 'bg-amber-400/10',
            isMedium && 'bg-amber-400/20',
            isUrgent && 'bg-[var(--bb-brand)]/20',
          )}
        >
          <Sparkles
            className={cn(
              'h-5 w-5',
              isSubtle && 'text-amber-400',
              isMedium && 'text-amber-500',
              isUrgent && 'text-[var(--bb-brand)]',
            )}
          />
        </div>
        <div className="flex-1">
          {isSubtle && (
            <>
              <p className="text-sm font-semibold text-[var(--bb-ink-100)]">
                Gostando? Garanta sua vaga!
              </p>
              <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">
                Quando voce estiver pronto, temos planos especiais esperando.
              </p>
            </>
          )}
          {isMedium && (
            <>
              <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                Seu trial esta acabando!
                {discountPercent ? ` ${discountPercent}% de desconto!` : ''}
              </p>
              <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">
                {discountPercent
                  ? `Oferta exclusiva para voce. Valida ate ${validUntil ? new Date(validUntil).toLocaleDateString('pt-BR') : 'em breve'}.`
                  : 'Nao perca o ritmo! Continue treinando com a gente.'}
              </p>
            </>
          )}
          {isUrgent && (
            <>
              <p className="text-base font-bold text-[var(--bb-ink-100)]">
                {discountPercent
                  ? `Ultimo dia! ${discountPercent}% OFF na matricula`
                  : 'Ultimo dia do seu trial!'}
              </p>
              <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">
                Nao deixe para amanha. Sua vaga esta garantida agora!
              </p>
            </>
          )}
          <Button
            variant="primary"
            size={isUrgent ? 'lg' : 'md'}
            className={cn('mt-3 w-full', isUrgent && 'animate-pulse')}
            onClick={onConvert}
            loading={loading}
          >
            {isUrgent ? 'QUERO ME MATRICULAR' : 'Ver planos'}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inline keyframes for urgent pulse */}
      {isUrgent && (
        <style>{`
          @keyframes pulse-border {
            0%, 100% { border-color: var(--bb-brand); }
            50% { border-color: var(--bb-glass-border); }
          }
        `}</style>
      )}
    </Card>
  );
}

// ── Post-Expiry Overlay ────────────────────────────────────────────────

function PostExpiryOverlay({
  student,
  triedModalities,
  onConvert,
  loading,
  academyPhone,
}: {
  student: TrialStudent;
  triedModalities: number;
  onConvert: () => void;
  loading: boolean;
  academyPhone?: string;
}) {
  const phone = academyPhone ?? '5511999999999';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Ola! Sou ${student.name}, fiz o periodo experimental e gostaria de saber mais sobre os planos.`,
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card variant="elevated" className="w-full max-w-md p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
          <span className="text-3xl">{'\uD83E\uDD4B'}</span>
        </div>

        <h2 className="text-xl font-bold text-[var(--bb-ink-100)]">
          Seu periodo experimental terminou!
        </h2>

        <div className="mt-4 flex justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--bb-brand)]">{student.trial_classes_attended}</p>
            <p className="text-xs text-[var(--bb-ink-40)]">aulas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">{triedModalities}</p>
            <p className="text-xs text-[var(--bb-ink-40)]">modalidades</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--bb-ink-60)]">
          Foi otimo ter voce conosco! Continue essa jornada e se torne parte da familia.
        </p>

        <Button
          variant="primary"
          size="lg"
          className="mt-6 w-full text-base font-bold"
          onClick={onConvert}
          loading={loading}
        >
          QUERO ME MATRICULAR
        </Button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] px-4 py-3 text-sm font-medium text-[var(--bb-ink-60)] transition-colors hover:bg-[var(--bb-depth-4)] hover:text-[var(--bb-ink-80)]"
        >
          <MessageCircle className="h-4 w-4" />
          Falar com a academia via WhatsApp
        </a>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function TrialDashboardPage() {
  const [student, setStudent] = useState<TrialStudent | null>(null);
  const [activities, setActivities] = useState<TrialActivity[]>([]);
  const [offer, setOffer] = useState<{ discount_percent: number; valid_until: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertLoading, setConvertLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const trialInfo = await getMyTrialInfo(academyId);
        if (!trialInfo) {
          setLoading(false);
          return;
        }

        setStudent(trialInfo);

        const [acts, conversionOffer] = await Promise.all([
          getTrialActivity(trialInfo.id),
          getConversionOffer(trialInfo.id),
        ]);

        setActivities(acts);
        setOffer(conversionOffer);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConvert = async () => {
    if (!student) return;
    setConvertLoading(true);
    try {
      const result = await startConversion(student.id);
      if (result?.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setConvertLoading(false);
    }
  };

  // ── Derived state ──

  const trialWeek = useMemo(
    () => (student ? buildTrialWeek(student, activities) : []),
    [student, activities],
  );

  const triedModalityIds = useMemo(() => getClassModalities(activities), [activities]);

  const now = new Date();
  const startDate = student ? new Date(student.trial_start_date) : now;
  const endDate = student ? new Date(student.trial_end_date) : now;
  const totalDays = Math.max(daysBetween(startDate, endDate), 1);
  const elapsedDays = Math.max(0, Math.min(daysBetween(startDate, now), totalDays));
  const daysRemaining = Math.max(0, totalDays - elapsedDays);
  const dayOfTrial = elapsedDays + 1;
  const progressPct = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  const isExpired = student ? new Date(student.trial_end_date) < now : false;
  // Show dashboard for 2 more days after expiry
  const daysAfterExpiry = isExpired ? daysBetween(endDate, now) : 0;
  const showExpiryOverlay = isExpired && daysAfterExpiry <= 2;
  const showDashboard = !isExpired || daysAfterExpiry <= 2;

  const relevantModalities = useMemo(() => {
    if (!student) return ALL_MODALITIES;
    const interested = new Set(student.modalities_interest);
    // Show interested modalities first, then all others
    const sorted = [
      ...ALL_MODALITIES.filter((m) => interested.has(m.id)),
      ...ALL_MODALITIES.filter((m) => !interested.has(m.id)),
    ];
    return sorted;
  }, [student]);

  const achievements = useMemo(
    () =>
      student
        ? buildAchievements(
            student,
            activities,
            triedModalityIds,
            relevantModalities.length,
          )
        : [],
    [student, activities, triedModalityIds, relevantModalities.length],
  );

  // ── Render ──

  if (loading) return <TrialDashboardSkeleton />;

  if (!student || !showDashboard) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl">{'\uD83E\uDD4B'}</span>
        <p className="mt-4 text-lg font-semibold text-[var(--bb-ink-100)]">
          Nenhum periodo experimental ativo
        </p>
        <p className="mt-1 text-sm text-[var(--bb-ink-40)]">
          Entre em contato com a academia para iniciar seu trial.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-5 p-4 pb-24">
      {/* Post-expiry overlay */}
      {showExpiryOverlay && (
        <PostExpiryOverlay
          student={student}
          triedModalities={triedModalityIds.size}
          onConvert={handleConvert}
          loading={convertLoading}
        />
      )}

      {/* ── 1. Welcome Banner ──────────────────────────────────── */}
      <section
        className="overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 40%, #c2410c 100%)',
        }}
      >
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Bem-vindo a {ACADEMY_NAME}! {'\uD83E\uDD4B'}
        </h1>
        <p className="mt-1 text-sm font-medium text-white/90">
          {isExpired
            ? 'Seu periodo experimental terminou'
            : `Voce tem ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''} para conhecer tudo`}
        </p>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-medium text-white/70">
            <span>Dia {dayOfTrial} de {totalDays}</span>
            <span>{progressPct}%</span>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/80">
          <Sparkles className="h-3.5 w-3.5" />
          Aproveite: todas as modalidades liberadas!
        </p>
      </section>

      {/* ── 2. Your Trial Week ─────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--bb-ink-100)]">
          Sua Semana de Trial
        </h2>
        <TrialWeekCalendar days={trialWeek} />

        {/* Motivational message */}
        <Card className="mt-3 p-3">
          <p className="text-center text-sm font-medium text-[var(--bb-ink-80)]">
            {getMotivationalMessage(student.trial_classes_attended)}
          </p>
        </Card>
      </section>

      {/* ── 3. Explore Modalities ──────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--bb-ink-100)]">
          Explore as Modalidades
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {relevantModalities.map((mod) => {
            const tried = triedModalityIds.has(mod.id);
            return (
              <Card
                key={mod.id}
                interactive
                className={cn(
                  'relative p-4',
                  tried && 'border-emerald-500/30 bg-emerald-500/5',
                )}
              >
                {tried && (
                  <Badge variant="active" size="sm" className="absolute right-3 top-3">
                    Ja experimentou!
                  </Badge>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{mod.emoji}</span>
                  <div>
                    <p className="font-semibold text-[var(--bb-ink-100)]">{mod.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">{mod.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 4. Your Progress (after 2+ classes) ────────────────── */}
      {student.trial_classes_attended >= 2 && (
        <section>
          <h2 className="mb-3 text-base font-bold text-[var(--bb-ink-100)]">
            Seu Progresso
          </h2>

          {/* Stats row */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Card className="flex flex-col items-center p-4 text-center">
              <Dumbbell className="h-6 w-6 text-[var(--bb-brand)]" />
              <p className="mt-1 text-2xl font-bold text-[var(--bb-ink-100)]">
                {student.trial_classes_attended}
              </p>
              <p className="text-xs text-[var(--bb-ink-40)]">Aulas realizadas</p>
            </Card>
            <Card className="flex flex-col items-center p-4 text-center">
              <Star className="h-6 w-6 text-amber-500" />
              <p className="mt-1 text-2xl font-bold text-[var(--bb-ink-100)]">
                {triedModalityIds.size}/{relevantModalities.length}
              </p>
              <p className="text-xs text-[var(--bb-ink-40)]">Modalidades experimentadas</p>
            </Card>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            {achievements.map((ach) => (
              <Card
                key={ach.id}
                className={cn(
                  'flex items-center gap-3 p-3',
                  !ach.unlocked && 'opacity-50',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg',
                    ach.unlocked
                      ? 'bg-amber-400/20'
                      : 'bg-[var(--bb-depth-4)]',
                  )}
                >
                  {ach.unlocked ? (
                    <span>{ach.icon}</span>
                  ) : (
                    <Lock className="h-4 w-4 text-[var(--bb-ink-20)]" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      ach.unlocked ? 'text-[var(--bb-ink-100)]' : 'text-[var(--bb-ink-40)]',
                    )}
                  >
                    {ach.label}
                  </p>
                  <p className="text-xs text-[var(--bb-ink-40)]">{ach.description}</p>
                </div>
                {ach.unlocked && (
                  <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                )}
              </Card>
            ))}
          </div>

          {/* Feedback CTA */}
          {!student.rating && (
            <Link href="/dashboard/trial/feedback">
              <Card interactive className="mt-3 flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                  <Trophy className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--bb-ink-100)]">
                    Desbloqueie a conquista &quot;5 Estrelas&quot;!
                  </p>
                  <p className="text-xs text-[var(--bb-ink-60)]">
                    Avalie sua experiencia e nos ajude a melhorar.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--bb-ink-40)]" />
              </Card>
            </Link>
          )}
        </section>
      )}

      {/* ── 5. Conversion Card (from day 3) ────────────────────── */}
      {!isExpired && (
        <ConversionCard
          dayOfTrial={dayOfTrial}
          discountPercent={offer?.discount_percent ?? null}
          validUntil={offer?.valid_until ?? null}
          onConvert={handleConvert}
          loading={convertLoading}
        />
      )}

      {/* ── Schedule / Check-in CTA ────────────────────────────── */}
      {!isExpired && (
        <Link href="/dashboard/checkin">
          <div className="fixed bottom-20 right-4 z-40 md:hidden">
            <button
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
              style={{ background: 'var(--bb-brand-gradient)' }}
              aria-label="Check-in"
            >
              <Flame className="h-6 w-6 text-white" />
            </button>
          </div>
        </Link>
      )}
    </div>
  );
}

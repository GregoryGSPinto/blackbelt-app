'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getModoAula, registrarPresenca, encerrarAula } from '@/lib/api/modo-aula.service';
import type { ModoAulaDTO, AlunoNaAula, AlertaAula } from '@/lib/api/modo-aula.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  SearchIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
  InfoIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Belt color map ────────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  branca: '#F5F5F5', cinza: '#9CA3AF', amarela: '#EAB308', laranja: '#EA580C',
  verde: '#16A34A', azul: '#2563EB', roxa: '#9333EA', marrom: '#92400E', preta: '#0A0A0A',
  white: '#F5F5F5', gray: '#9CA3AF', yellow: '#EAB308', orange: '#EA580C',
  green: '#16A34A', blue: '#2563EB', purple: '#9333EA', brown: '#92400E', black: '#0A0A0A',
};

function getBeltLabel(belt: string): string {
  const map: Record<string, string> = {
    branca: 'Branca', cinza: 'Cinza', amarela: 'Amarela', laranja: 'Laranja',
    verde: 'Verde', azul: 'Azul', roxa: 'Roxa', marrom: 'Marrom', preta: 'Preta',
    white: 'Branca', gray: 'Cinza', yellow: 'Amarela', orange: 'Laranja',
    green: 'Verde', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
  };
  return map[belt] ?? belt;
}

function isBeltWhite(belt: string): boolean {
  return belt === 'branca' || belt === 'white';
}

// ── Urgency styles ────────────────────────────────────────────────────

function getAlertStyles(urgencia: AlertaAula['urgencia']) {
  switch (urgencia) {
    case 'alta':
      return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#EF4444', icon: <AlertTriangleIcon className="h-4 w-4 shrink-0" /> };
    case 'media':
      return { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#EAB308', icon: <AlertTriangleIcon className="h-4 w-4 shrink-0" /> };
    case 'info':
      return { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6', icon: <InfoIcon className="h-4 w-4 shrink-0" /> };
  }
}

// ── Timer hook ────────────────────────────────────────────────────────

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);

  const formatted = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  return { seconds, running, formatted, start, stop };
}

// ── Main page ─────────────────────────────────────────────────────────

export default function TurmaAtivaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const timer = useTimer();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ModoAulaDTO | null>(null);
  const [alunos, setAlunos] = useState<AlunoNaAula[]>([]);
  const [alertas, setAlertas] = useState<AlertaAula[]>([]);
  const [dismissedAlertas, setDismissedAlertas] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [showAllAlertas, setShowAllAlertas] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{ totalPresentes: number; totalAlunos: number } | null>(null);
  const [aulaAnteriorOpen, setAulaAnteriorOpen] = useState(false);
  const [aulaStarted, setAulaStarted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getModoAula('turma-bjj-noite');
        setData(result);
        setAlunos(result.alunos);
        setAlertas(result.alertas);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // ── Helpers ─────────────────────────────────────────────────────────

  function alertaKey(a: AlertaAula, idx: number): string {
    return `${a.alunoId}-${a.tipo}-${idx}`;
  }

  const visibleAlertas = useMemo(() => {
    const filtered = alertas.filter((a, i) => !dismissedAlertas.has(alertaKey(a, i)));
    return showAllAlertas ? filtered : filtered.slice(0, 5);
  }, [alertas, dismissedAlertas, showAllAlertas]);

  const totalAlertas = useMemo(
    () => alertas.filter((a, i) => !dismissedAlertas.has(alertaKey(a, i))).length,
    [alertas, dismissedAlertas],
  );

  const presentes = useMemo(() => alunos.filter((a) => a.presente).length, [alunos]);

  const filteredAlunos = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = term ? alunos.filter((a) => a.nome.toLowerCase().includes(term)) : alunos;
    return [...filtered].sort((a, b) => {
      if (a.presente === b.presente) return a.nome.localeCompare(b.nome);
      return a.presente ? -1 : 1;
    });
  }, [alunos, search]);

  // ── Handlers ────────────────────────────────────────────────────────

  function dismissAlerta(key: string) {
    setDismissedAlertas((prev) => new Set(prev).add(key));
  }

  function handleStartAula() {
    setAulaStarted(true);
    timer.start();
    toast('Aula iniciada!', 'success');
  }

  async function handleTogglePresenca(alunoId: string) {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) return;
    const novoEstado = !aluno.presente;

    setAlunos((prev) =>
      prev.map((a) =>
        a.id === alunoId
          ? { ...a, presente: novoEstado, metodoCheckin: novoEstado ? 'manual' as const : undefined }
          : a,
      ),
    );

    try {
      await registrarPresenca('turma-bjj-noite', alunoId, novoEstado);
    } catch (err) {
      setAlunos((prev) =>
        prev.map((a) => (a.id === alunoId ? { ...a, presente: !novoEstado } : a)),
      );
      toast(translateError(err), 'error');
    }
  }

  async function handleEncerrarAula() {
    setShowEndModal(false);
    try {
      timer.stop();
      const result = await encerrarAula('turma-bjj-noite');
      setSummaryData(result);
      setShowSummary(true);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function handleGoToDiario() {
    router.push('/professor/diario');
  }

  // ── Skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen space-y-4 p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-12 w-32" />
        <div className="space-y-2">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
        </div>
        <Skeleton variant="text" className="h-10 w-full" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhuma turma encontrada.</p>
      </div>
    );
  }

  const turma = data.turma;
  const durationMinutes = Math.round(timer.seconds / 60);

  return (
    <div className="flex min-h-screen flex-col pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 px-4 pb-4 pt-4"
        style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{turma.nome}</h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{turma.modalidade} &middot; {turma.horario}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold tabular-nums" style={{ color: 'var(--bb-ink-100)' }}>
              {presentes}<span className="text-lg font-semibold" style={{ color: 'var(--bb-ink-40)' }}>/{alunos.length}</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>presentes</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-3)', borderRadius: 'var(--bb-radius-lg)' }}>
            <ClockIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
            <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--bb-ink-100)' }}>{timer.formatted}</span>
          </div>
          {!aulaStarted ? (
            <button type="button" onClick={handleStartAula} className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all"
              style={{ background: 'var(--bb-brand)', color: '#fff', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
              <PlayIcon className="h-4 w-4" /> Iniciar Aula
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
              <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: '#22C55E' }} />
              Aula em Andamento
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4">
        {/* ── ALERTAS ──────────────────────────────────────────────────── */}
        {totalAlertas > 0 && (
          <section className="space-y-2">
            {visibleAlertas.map((alerta) => {
              const idx = alertas.indexOf(alerta);
              const key = alertaKey(alerta, idx);
              const styles = getAlertStyles(alerta.urgencia);
              return (
                <div key={key} className="flex items-start gap-3 rounded-lg p-3"
                  style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 'var(--bb-radius-lg)' }}>
                  <span style={{ color: styles.text, marginTop: '2px' }}>{styles.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold" style={{ color: styles.text }}>{alerta.alunoNome}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-80)' }}>{alerta.mensagem}</p>
                  </div>
                  <button type="button" onClick={() => dismissAlerta(key)}
                    className="flex shrink-0 items-center justify-center p-1 transition-opacity hover:opacity-60"
                    style={{ color: 'var(--bb-ink-40)', minWidth: '44px', minHeight: '44px' }} aria-label="Dispensar alerta">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {totalAlertas > 5 && !showAllAlertas && (
              <button type="button" onClick={() => setShowAllAlertas(true)}
                className="w-full rounded-lg py-2 text-center text-xs font-semibold transition-colors"
                style={{ color: 'var(--bb-brand)', background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }}>
                Ver todos ({totalAlertas})
              </button>
            )}
          </section>
        )}

        {/* ── SEARCH ───────────────────────────────────────────────────── */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aluno..."
            className="w-full rounded-lg py-3 pl-10 pr-4 text-sm outline-none transition-all"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-lg)', minHeight: '44px' }} />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--bb-ink-40)' }}>
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── ALUNOS LIST ──────────────────────────────────────────────── */}
        <section className="space-y-2">
          {filteredAlunos.map((aluno) => {
            const beltColor = BELT_COLORS[aluno.faixa] ?? '#ccc';
            const isWhite = isBeltWhite(aluno.faixa);
            return (
              <div key={aluno.id} className="flex items-center gap-3 rounded-lg p-3 transition-all"
                style={{ background: 'var(--bb-depth-2)', border: `1px solid ${aluno.presente ? 'rgba(34,197,94,0.3)' : 'var(--bb-glass-border)'}`, borderRadius: 'var(--bb-radius-lg)' }}>
                <button type="button" onClick={() => handleTogglePresenca(aluno.id)}
                  className="flex shrink-0 items-center justify-center rounded-full transition-all"
                  style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', background: aluno.presente ? 'rgba(34,197,94,0.15)' : 'var(--bb-depth-3)', border: `2px solid ${aluno.presente ? '#22C55E' : 'var(--bb-glass-border)'}` }}
                  aria-label={aluno.presente ? 'Marcar como ausente' : 'Marcar como presente'}>
                  {aluno.presente && <CheckIcon className="h-5 w-5" style={{ color: '#22C55E' }} />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold" style={{ color: aluno.presente ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)' }}>{aluno.nome}</p>
                    {aluno.metodoCheckin === 'qr_code' && (
                      <span title="Check-in via QR Code" className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold"
                        style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>QR</span>
                    )}
                    {aluno.restricaoMedica && (
                      <span title={aluno.restricaoMedica}><AlertTriangleIcon className="h-3.5 w-3.5" style={{ color: '#EF4444' }} /></span>
                    )}
                    {aluno.diasDesdeUltimoTreino > 7 && (
                      <span title={`${aluno.diasDesdeUltimoTreino} dias sem treinar`}><AlertTriangleIcon className="h-3.5 w-3.5" style={{ color: '#EAB308' }} /></span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${beltColor}20`, color: isWhite ? 'var(--bb-ink-60)' : beltColor, border: isWhite ? '1px solid var(--bb-glass-border)' : 'none' }}>
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: beltColor, border: isWhite ? '1px solid var(--bb-ink-40)' : 'none' }} />
                      {getBeltLabel(aluno.faixa)}{aluno.graus > 0 && ` ${aluno.graus}g`}
                    </span>
                    {!aluno.presente && aluno.diasDesdeUltimoTreino > 0 && (
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{aluno.diasDesdeUltimoTreino}d sem treinar</span>
                    )}
                    {aluno.presente && aluno.checkinHora && (
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{aluno.checkinHora}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredAlunos.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum aluno encontrado.</p>
          )}
        </section>

        {/* ── AULA ANTERIOR ────────────────────────────────────────────── */}
        {data.aulaAnterior && (
          <section>
            <button type="button" onClick={() => setAulaAnteriorOpen(!aulaAnteriorOpen)}
              className="flex w-full items-center justify-between rounded-lg p-3 text-sm font-semibold transition-all"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-80)', borderRadius: aulaAnteriorOpen ? 'var(--bb-radius-lg) var(--bb-radius-lg) 0 0' : 'var(--bb-radius-lg)', minHeight: '44px' }}>
              <span className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} /> Aula Anterior
              </span>
              {aulaAnteriorOpen ? <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} /> : <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />}
            </button>
            {aulaAnteriorOpen && (
              <div className="space-y-2 p-4" style={{ background: 'var(--bb-depth-2)', borderLeft: '1px solid var(--bb-glass-border)', borderRight: '1px solid var(--bb-glass-border)', borderBottom: '1px solid var(--bb-glass-border)', borderRadius: '0 0 var(--bb-radius-lg) var(--bb-radius-lg)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    {new Date(data.aulaAnterior.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{data.aulaAnterior.presentes} presentes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.aulaAnterior.tecnicasEnsinadas.map((t) => (
                    <span key={t} className="rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>{t}</span>
                  ))}
                </div>
                {data.aulaAnterior.observacoes && (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>{data.aulaAnterior.observacoes}</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── FIXED BOTTOM BAR ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: 'var(--bb-depth-2)', borderTop: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-lg)' }}>
        <button type="button" onClick={() => setShowQRModal(true)} className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>
          <ClipboardCheckIcon className="h-4 w-4" /> QR Code
        </button>
        <button type="button" onClick={handleGoToDiario} className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>
          <BookOpenIcon className="h-4 w-4" /> Diario
        </button>
        <button type="button" onClick={() => { if (!aulaStarted) { toast('Inicie a aula primeiro', 'error'); return; } setShowEndModal(true); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all"
          style={{ background: aulaStarted ? '#EF4444' : 'var(--bb-depth-4)', color: aulaStarted ? '#fff' : 'var(--bb-ink-40)', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>
          <XIcon className="h-4 w-4" /> Encerrar
        </button>
      </div>

      {/* ── QR MODAL ─────────────────────────────────────────────────── */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowQRModal(false)}>
          <div className="w-full max-w-sm space-y-4 p-6" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>QR Code da Aula</h2>
              <button type="button" onClick={() => setShowQRModal(false)} className="flex items-center justify-center rounded-full p-2" style={{ color: 'var(--bb-ink-60)', minWidth: '44px', minHeight: '44px' }}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220">
                <rect width="220" height="220" rx="16" fill="white" />
                <rect x="20" y="20" width="65" height="65" rx="6" fill="#000" /><rect x="135" y="20" width="65" height="65" rx="6" fill="#000" /><rect x="20" y="135" width="65" height="65" rx="6" fill="#000" />
                <rect x="30" y="30" width="45" height="45" rx="3" fill="white" /><rect x="145" y="30" width="45" height="45" rx="3" fill="white" /><rect x="30" y="145" width="45" height="45" rx="3" fill="white" />
                <rect x="42" y="42" width="22" height="22" fill="#000" /><rect x="157" y="42" width="22" height="22" fill="#000" /><rect x="42" y="157" width="22" height="22" fill="#000" />
                <rect x="95" y="95" width="30" height="30" rx="4" fill="var(--bb-brand)" />
                <text x="110" y="115" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">BB</text>
              </svg>
            </div>
            <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>{turma.nome} &middot; {turma.horario}</p>
            <p className="text-center text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Alunos escaneiam para registrar presenca automaticamente</p>
          </div>
        </div>
      )}

      {/* ── END CONFIRMATION MODAL ───────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowEndModal(false)}>
          <div className="w-full max-w-sm space-y-4 p-6" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Encerrar Aula?</h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>A aula sera encerrada com {presentes} alunos presentes e duracao de {timer.formatted}. Esta acao nao pode ser desfeita.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowEndModal(false)} className="flex-1 rounded-lg py-3 text-sm font-semibold transition-all"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>Cancelar</button>
              <button type="button" onClick={handleEncerrarAula} className="flex-1 rounded-lg py-3 text-sm font-bold transition-all"
                style={{ background: '#EF4444', color: '#fff', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>Encerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUMMARY MODAL ────────────────────────────────────────────── */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm space-y-5 p-6" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)' }}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <CheckCircleIcon className="h-7 w-7" style={{ color: '#22C55E' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Aula Encerrada</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-lg p-4" style={{ background: 'var(--bb-depth-3)', borderRadius: 'var(--bb-radius-lg)' }}>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: '#22C55E' }}>{summaryData.totalPresentes}</p>
                <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Presentes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: '#EF4444' }}>{summaryData.totalAlunos - summaryData.totalPresentes}</p>
                <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Ausentes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{durationMinutes}</p>
                <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Minutos</p>
              </div>
            </div>
            <p className="text-center text-xs" style={{ color: 'var(--bb-ink-60)' }}>{turma.nome}</p>
            <button type="button" onClick={handleGoToDiario} className="w-full rounded-lg py-3 text-sm font-bold transition-all"
              style={{ background: 'var(--bb-brand)', color: '#fff', borderRadius: 'var(--bb-radius-lg)', minHeight: '48px' }}>Ir para o Diario</button>
          </div>
        </div>
      )}
    </div>
  );
}

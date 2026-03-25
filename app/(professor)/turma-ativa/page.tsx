'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveClass, saveAttendance } from '@/lib/api/turma-ativa.service';
import { generateQR } from '@/lib/api/qrcode.service';
import type { ActiveClassDTO, ActiveClassStudent } from '@/lib/api/turma-ativa.service';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComingSoon } from '@/components/shared/ComingSoon';

// ── Belt color mapping ─────────────────────────────────────────────
const BELT_BG: Record<string, string> = {
  white: 'bg-[var(--bb-belt-white,#FAFAFA)] border border-[var(--bb-glass-border)]',
  gray: 'bg-[var(--bb-belt-gray,#9CA3AF)]',
  yellow: 'bg-[var(--bb-belt-yellow,#EAB308)]',
  orange: 'bg-[var(--bb-belt-orange,#EA580C)]',
  green: 'bg-[var(--bb-belt-green,#16A34A)]',
  blue: 'bg-[var(--bb-belt-blue,#2563EB)]',
  purple: 'bg-[var(--bb-belt-purple,#9333EA)]',
  brown: 'bg-[var(--bb-belt-brown,#92400E)]',
  black: 'bg-[var(--bb-belt-black,#0A0A0A)]',
};

// ── Timer formatting ───────────────────────────────────────────────
function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TurmaAtivaPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────
  const [classData, setClassData] = useState<ActiveClassDTO | null>(null);
  const [students, setStudents] = useState<ActiveClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [saving, setSaving] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // QR
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState<Date | null>(null);
  const [qrRemainingSeconds, setQrRemainingSeconds] = useState(0);
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Confirm end
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  // ── Load class ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveClass('prof-1');
        setClassData(data);
        if (data) setStudents(data.students);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Start timer when class loaded ──────────────────────────────
  useEffect(() => {
    if (!classData) return;

    // Calculate elapsed time since class start
    const now = new Date();
    const [h, m] = classData.start_time.split(':').map(Number);
    const classStart = new Date(now);
    classStart.setHours(h, m, 0, 0);

    const diffSec = Math.max(0, Math.floor((now.getTime() - classStart.getTime()) / 1000));
    setElapsedSeconds(diffSec);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [classData]);

  // ── QR expiry timer ────────────────────────────────────────────
  useEffect(() => {
    if (!qrExpiresAt || !showQR) {
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
      return;
    }

    function tick() {
      const remaining = Math.max(0, Math.floor((qrExpiresAt!.getTime() - Date.now()) / 1000));
      setQrRemainingSeconds(remaining);
      if (remaining <= 0 && qrTimerRef.current) {
        clearInterval(qrTimerRef.current);
      }
    }

    tick();
    qrTimerRef.current = setInterval(tick, 1000);

    return () => {
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    };
  }, [qrExpiresAt, showQR]);

  // ── Toggle presence ────────────────────────────────────────────
  const togglePresence = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId
          ? { ...s, is_present: !s.is_present, checked_in_via_qr: false }
          : s,
      ),
    );
  }, []);

  // ── Generate QR ────────────────────────────────────────────────
  async function handleGenerateQR() {
    if (!classData) return;
    try {
      const result = await generateQR(classData.class_id, 5);
      setQrData(result.qrData);
      setQrExpiresAt(new Date(result.expiresAt));
      setShowQR(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar QR.';
      toast(message, 'error');
    }
  }

  // ── End class ──────────────────────────────────────────────────
  async function handleEndClass() {
    if (!classData) return;
    setSaving(true);
    try {
      const presentIds = students.filter((s) => s.is_present).map((s) => s.student_id);
      await saveAttendance({ class_id: classData.class_id, present_student_ids: presentIds });
      toast('Chamada salva com sucesso!', 'success');
      setShowConfirm(false);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push('/professor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar chamada.';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const presentCount = students.filter((s) => s.is_present).length;
  const absentStudents = students.filter((s) => !s.is_present);
  const presencePct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // ── Loading ────────────────────────────────────────────────────
  if (loading && comingSoonTimeout) return <ComingSoon backHref="/professor" backLabel="Voltar ao Painel" />;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)]">
        <Spinner size="lg" className="text-bb-white" />
      </div>
    );
  }

  // ── No active class ────────────────────────────────────────────
  if (!classData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <EmptyState
          title="Nenhuma aula ativa"
          description="Voce nao tem aula em andamento no momento."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bb-depth-1)] text-bb-white">
      {/* ── HEADER: Sticky dark bar ───────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-1)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          {/* Left: class info */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-bb-white">
              {classData.modality_name}
            </h1>
            <p className="text-xs text-[var(--bb-ink-40)]">
              {classData.start_time} - {classData.end_time} | {classData.unit_name}
            </p>
          </div>

          {/* Center: Timer */}
          <div className="text-center">
            <p className="font-mono text-2xl font-bold tracking-wider text-bb-white">
              {formatTimer(elapsedSeconds)}
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateQR}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bb-depth-3)] text-lg transition-colors hover:bg-[var(--bb-depth-1)]"
              title="Gerar QR Code"
            >
              QR
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg bg-bb-red px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Encerrar
            </button>
          </div>
        </div>

        {/* Presence counter bar */}
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-[var(--bb-depth-3)]">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${presencePct}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-bold text-bb-white">
            {presentCount}/{students.length}
          </span>
        </div>
      </header>

      {/* ── STUDENT LIST: Large touch-friendly cards ──────────────── */}
      <main className="flex-1 space-y-2 px-4 py-4">
        {students.map((student) => (
          <button
            key={student.student_id}
            onClick={() => togglePresence(student.student_id)}
            className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
              student.is_present
                ? 'bg-green-900/40 ring-2 ring-green-500/50'
                : 'bg-[var(--bb-depth-3)]/60 hover:bg-[var(--bb-depth-3)]'
            }`}
          >
            {/* Presence indicator */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-all ${
                student.is_present
                  ? 'bg-green-500 text-white'
                  : 'border-2 border-[var(--bb-glass-border)] text-transparent'
              }`}
            >
              {student.is_present && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Belt color indicator + Name */}
            <div className="flex flex-1 items-center gap-3">
              <div className={`h-10 w-2 shrink-0 rounded-full ${BELT_BG[student.belt] ?? 'bg-[var(--bb-ink-40)]'}`} />
              <div>
                <p className="text-base font-semibold text-bb-white">{student.display_name}</p>
                <p className="text-xs capitalize text-[var(--bb-ink-40)]">
                  Faixa {student.belt}
                </p>
              </div>
            </div>

            {/* QR indicator */}
            {student.checked_in_via_qr && (
              <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                Presente (QR)
              </span>
            )}
          </button>
        ))}
      </main>

      {/* ── QR MODAL: Large QR code + expiry ──────────────────────── */}
      <Modal open={showQR} onClose={() => setShowQR(false)} title="QR Code Check-in">
        <div className="flex flex-col items-center gap-5 py-4">
          {/* QR Code display */}
          <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-[var(--bb-depth-3)] p-4 shadow-[var(--bb-shadow-lg)]">
            {qrData ? (
              <div className="flex h-full w-full items-center justify-center">
                {/* In production, render an actual QR image. Here we show the encoded data visually. */}
                <div className="grid h-40 w-40 grid-cols-8 grid-rows-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        qrData.charCodeAt(i % qrData.length) % 2 === 0
                          ? 'bg-[var(--bb-ink-100)]'
                          : 'bg-[var(--bb-depth-1)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Spinner size="lg" />
            )}
          </div>

          <p className="text-center text-sm text-[var(--bb-ink-40)]">
            Peca aos alunos para escanear este QR Code
          </p>

          {/* Expiry timer */}
          {qrRemainingSeconds > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-[var(--bb-depth-3)] px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm font-medium text-[var(--bb-ink-60)]">
                Expira em {Math.floor(qrRemainingSeconds / 60)}:{(qrRemainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : qrExpiresAt ? (
            <div className="rounded-full bg-[var(--bb-brand-primary)]/10 px-4 py-2">
              <span className="text-sm font-medium text-[var(--bb-brand-primary)]">QR Code expirado</span>
            </div>
          ) : null}

          {/* Regenerate */}
          <Button variant="secondary" onClick={handleGenerateQR}>
            Gerar Novo QR
          </Button>
        </div>
      </Modal>

      {/* ── CONFIRM END CLASS MODAL ───────────────────────────────── */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Encerrar Aula" variant="confirm">
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg bg-[var(--bb-depth-3)] p-4 text-center">
            <p className="text-3xl font-bold text-[var(--bb-ink-100)]">
              {presentCount}/{students.length}{' '}
              <span className="text-base font-normal text-[var(--bb-ink-40)]">presentes</span>
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--bb-ink-60)]">({presencePct}%)</p>
          </div>

          {/* Absent list */}
          {absentStudents.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-[var(--bb-ink-40)]">Ausentes:</p>
              <p className="text-sm text-[var(--bb-ink-60)]">
                {absentStudents.map((s) => s.display_name).join(', ')}
              </p>
            </div>
          )}

          {/* Duration */}
          <p className="text-center text-sm text-[var(--bb-ink-40)]">
            Duracao: {formatTimer(elapsedSeconds)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" loading={saving} onClick={handleEndClass}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';
import { cn } from '@/lib/utils/cn';
import { getMyHealthSummary } from '@/lib/api/health-declaration.service';
import type { HealthSummary, RestrictionType } from '@/lib/api/health-declaration.service';

// ── Restriction label map ───────────────────────────────────────

const RESTRICTION_LABELS: Record<RestrictionType, string> = {
  no_sparring: 'Sem sparring',
  no_ground: 'Sem solo',
  no_striking: 'Sem golpes',
  no_takedowns: 'Sem quedas',
  limited_range: 'Amplitude limitada',
  no_contact: 'Sem contato',
  light_only: 'Apenas leve',
  observe_only: 'Apenas observar',
  custom: 'Personalizada',
};

// ── Loading skeleton ────────────────────────────────────────────

function SaudeSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton variant="text" className="h-10 w-40" />
        <Skeleton variant="text" className="h-10 w-52" />
      </div>
    </div>
  );
}

// ── Helper: format date ─────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Main page ───────────────────────────────────────────────────

export default function SaudeDashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        if (!academyId) return;
        const data = await getMyHealthSummary(academyId);
        setSummary(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]);

  if (loading) return <SaudeSkeleton />;

  const parq = summary?.parq ?? null;
  const clearance = summary?.clearance ?? null;
  const activeInjuries = summary?.activeInjuries ?? [];
  const restrictions = summary?.restrictions ?? [];

  // ── Clearance status logic ──────────────────────────────────

  const now = new Date();
  let clearanceStatus: 'valid' | 'expired' | 'pending' = 'pending';
  let clearanceLabel = 'Pendente';
  let clearanceColor = 'text-yellow-500';

  if (clearance) {
    if (clearance.valid_until) {
      const expiresAt = new Date(clearance.valid_until);
      if (expiresAt > now && clearance.status === 'approved') {
        clearanceStatus = 'valid';
        clearanceLabel = `Valido ate ${formatDate(clearance.valid_until)}`;
        clearanceColor = 'text-green-500';
      } else {
        clearanceStatus = 'expired';
        clearanceLabel = 'Expirado';
        clearanceColor = 'text-red-500';
      }
    } else if (clearance.status === 'approved') {
      clearanceStatus = 'valid';
      clearanceLabel = 'Aprovado';
      clearanceColor = 'text-green-500';
    } else if (clearance.status === 'denied') {
      clearanceLabel = 'Negado';
      clearanceColor = 'text-red-500';
    }
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[var(--bb-radius-md)]"
          style={{ background: 'var(--bb-brand-gradient)' }}
        >
          <Heart className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">Minha Saude</h1>
      </div>

      {/* ── Summary cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* PAR-Q Status */}
        <Card
          variant="default"
          interactive
          className="flex items-start gap-3 p-4"
          onClick={() => router.push('/dashboard/saude/parq')}
        >
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              parq ? 'bg-green-500/10' : 'bg-yellow-500/10',
            )}
          >
            <ClipboardCheck className={cn('h-5 w-5', parq ? 'text-green-500' : 'text-yellow-500')} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--bb-ink-40)]">
              PAR-Q
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm font-semibold',
                parq ? 'text-green-500' : 'text-yellow-500',
              )}
            >
              {parq ? 'Questionario preenchido' : 'Pendente'}
            </p>
            {parq && (
              <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                Preenchido em {formatDate(parq.completed_at)}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--bb-ink-20)]" />
        </Card>

        {/* Atestado medico */}
        <Card variant="default" className="flex items-start gap-3 p-4">
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              clearanceStatus === 'valid'
                ? 'bg-green-500/10'
                : clearanceStatus === 'expired'
                  ? 'bg-red-500/10'
                  : 'bg-yellow-500/10',
            )}
          >
            <FileCheck
              className={cn(
                'h-5 w-5',
                clearanceStatus === 'valid'
                  ? 'text-green-500'
                  : clearanceStatus === 'expired'
                    ? 'text-red-500'
                    : 'text-yellow-500',
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--bb-ink-40)]">
              Atestado Medico
            </p>
            <p className={cn('mt-0.5 text-sm font-semibold', clearanceColor)}>
              {clearanceLabel}
            </p>
          </div>
        </Card>

        {/* Lesoes ativas */}
        <Card variant="default" className="flex items-start gap-3 p-4">
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              activeInjuries.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
            )}
          >
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                activeInjuries.length > 0 ? 'text-red-500' : 'text-green-500',
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--bb-ink-40)]">
              Lesoes Ativas
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm font-semibold',
                activeInjuries.length > 0 ? 'text-red-500' : 'text-green-500',
              )}
            >
              {activeInjuries.length === 0
                ? 'Nenhuma'
                : `${activeInjuries.length} lesao${activeInjuries.length > 1 ? 'es' : ''}`}
            </p>
            {activeInjuries.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {activeInjuries.slice(0, 3).map((injury) => (
                  <p key={injury.id} className="text-xs text-[var(--bb-ink-40)]">
                    {injury.body_part} — {injury.severity}
                  </p>
                ))}
                {activeInjuries.length > 3 && (
                  <p className="text-xs text-[var(--bb-ink-40)]">
                    +{activeInjuries.length - 3} mais
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Restricoes */}
        <Card variant="default" className="flex items-start gap-3 p-4">
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              restrictions.length > 0 ? 'bg-orange-500/10' : 'bg-green-500/10',
            )}
          >
            <ShieldAlert
              className={cn(
                'h-5 w-5',
                restrictions.length > 0 ? 'text-orange-500' : 'text-green-500',
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--bb-ink-40)]">
              Restricoes
            </p>
            {restrictions.length === 0 ? (
              <p className="mt-0.5 text-sm font-semibold text-green-500">Nenhuma</p>
            ) : (
              <div className="mt-1 space-y-1">
                {restrictions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-[var(--bb-radius-md)] bg-[var(--bb-depth-2)] px-2 py-1"
                  >
                    <span className="text-xs font-medium text-orange-500">
                      {RESTRICTION_LABELS[r.restriction_type] ?? r.restriction_type}
                    </span>
                    {r.body_part && (
                      <span className="text-xs text-[var(--bb-ink-40)]">
                        ({r.body_part})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Action buttons ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/dashboard/saude/parq')}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Preencher PAR-Q
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.push('/dashboard/saude/historico')}
        >
          <FileCheck className="mr-2 h-4 w-4" />
          Atualizar Historico Medico
        </Button>
      </div>
    </div>
  );
}

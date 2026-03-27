'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  FileCheck,
  Shield,
  Settings,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listInjuries,
  listRestrictions,
  listClearances,
} from '@/lib/api/health-declaration.service';
import type {
  HealthInjury,
  TrainingRestriction,
  MedicalClearance,
  RecoveryStatus,
  Severity,
} from '@/lib/api/health-declaration.service';

// ── Labels ────────────────────────────────────────────────────────

const RECOVERY_LABEL: Record<RecoveryStatus, string> = {
  active: 'Ativa',
  recovering: 'Recuperando',
  recovered: 'Recuperada',
  chronic: 'Cronica',
};

const RECOVERY_COLOR: Record<RecoveryStatus, { color: string; bg: string }> = {
  active: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  recovering: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  recovered: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  chronic: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
};

const SEVERITY_LABEL: Record<Severity, string> = {
  mild: 'Leve',
  moderate: 'Moderada',
  severe: 'Grave',
};

const SEVERITY_COLOR: Record<Severity, { color: string; bg: string }> = {
  mild: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  severe: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

// ── Sections ──────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'lesoes', label: 'Lesoes', icon: AlertTriangle, href: '/admin/saude/lesoes', desc: 'Gerenciar lesoes de alunos' },
  { key: 'restricoes', label: 'Restricoes', icon: Shield, href: '/admin/saude/lesoes', desc: 'Ver restricoes de treino' },
  { key: 'atestados', label: 'Atestados', icon: FileCheck, href: '/admin/saude/atestados', desc: 'Atestados medicos' },
  { key: 'config', label: 'Configuracoes', icon: Settings, href: '/admin/saude/config', desc: 'Configurar saude' },
] as const;

// ── Skeleton ──────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-4 w-80" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function SaudePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [injuries, setInjuries] = useState<HealthInjury[]>([]);
  const [restrictions, setRestrictions] = useState<TrainingRestriction[]>([]);
  const [clearances, setClearances] = useState<MedicalClearance[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const [inj, rest, clr] = await Promise.all([
          listInjuries(academyId),
          listRestrictions(academyId),
          listClearances(academyId),
        ]);
        setInjuries(inj);
        setRestrictions(rest);
        setClearances(clr);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageSkeleton />;

  // ── Stats ───────────────────────────────────────────────────────
  const activeInjuries = injuries.filter((i) => i.recovery_status === 'active' || i.recovery_status === 'recovering');
  const pendingClearances = clearances.filter((c) => c.status === 'pending');
  const activeRestrictions = restrictions.filter((r) => r.is_active);
  const studentsWithRestrictions = new Set(activeRestrictions.map((r) => r.profile_id)).size;
  const recentInjuries = injuries.slice(0, 8);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
            Saude e Aptidao Fisica
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Painel de controle de saude dos alunos
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/saude/lesoes">
            <Button size="sm">Registrar Lesao</Button>
          </Link>
          <Link href="/admin/saude/atestados">
            <Button variant="secondary" size="sm">Ver Atestados Pendentes</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Activity size={20} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Lesoes Ativas</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{activeInjuries.length}</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <FileCheck size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Atestados Pendentes</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{pendingClearances.length}</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <Users size={20} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Alunos com Restricoes</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{studentsWithRestrictions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Sections */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.key} href={section.href}>
              <Card
                interactive
                className="flex items-center gap-3 p-4"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
                  <Icon size={18} style={{ color: 'var(--bb-brand)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{section.label}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{section.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--bb-ink-40)' }} />
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Injuries Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Lesoes Recentes</h2>
          <Link href="/admin/saude/lesoes" className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
            Ver todas
          </Link>
        </div>

        <div
          className="overflow-hidden"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Aluno</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Parte do Corpo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Gravidade</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInjuries.map((injury) => (
                  <tr key={injury.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {injury.profile_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{injury.body_part}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: SEVERITY_COLOR[injury.severity].color,
                          background: SEVERITY_COLOR[injury.severity].bg,
                        }}
                      >
                        {SEVERITY_LABEL[injury.severity]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {new Date(injury.injury_date).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: RECOVERY_COLOR[injury.recovery_status].color,
                          background: RECOVERY_COLOR[injury.recovery_status].bg,
                        }}
                      >
                        {RECOVERY_LABEL[injury.recovery_status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentInjuries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                      Nenhuma lesao registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

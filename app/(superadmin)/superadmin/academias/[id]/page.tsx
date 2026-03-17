'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import type { AcademyFull } from '@/lib/types';
import { getAcademy, suspendAcademy, reactivateAcademy } from '@/lib/api/superadmin.service';
import { startImpersonation } from '@/lib/api/superadmin-impersonate.service';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativa' },
  trial: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Trial' },
  suspended: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Suspensa' },
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pendente' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)', label: 'Cancelada' },
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AcademyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [academy, setAcademy] = useState<AcademyFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const a = await getAcademy(params.id);
        setAcademy(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleToggleStatus() {
    if (!academy) return;
    try {
      const updated = academy.status === 'suspended'
        ? await reactivateAcademy(academy.id)
        : await suspendAcademy(academy.id);
      setAcademy(updated);
      toast(updated.status === 'suspended' ? 'Academia suspensa.' : 'Academia reativada.', 'success');
    } catch {
      toast('Erro ao alterar status.', 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <span className="text-5xl">🔍</span>
        <h2 className="mt-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Academia nao encontrada</h2>
        <Link href="/superadmin/academias" className="mt-4 text-sm" style={{ color: '#f59e0b' }}>
          ← Voltar para academias
        </Link>
      </div>
    );
  }

  const st = STATUS_STYLES[academy.status] ?? STATUS_STYLES.active;
  const studentsPercent = academy.max_students > 0
    ? Math.min(((academy.total_students ?? 0) / academy.max_students) * 100, 100) : 0;
  const profsPercent = academy.max_professors > 0
    ? Math.min(((academy.total_professors ?? 0) / academy.max_professors) * 100, 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
        <Link href="/superadmin/academias" className="hover:underline" style={{ color: '#f59e0b' }}>
          Academias
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--bb-ink-100)' }}>{academy.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
            style={{ background: 'rgba(245,158,11,0.12)' }}
          >
            🏟️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{academy.name}</h1>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: st.bg, color: st.text }}>
                {st.label}
              </span>
              {academy.plan && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>
                  {academy.plan.name}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              {academy.city}/{academy.state} · {academy.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                await startImpersonation(academy.id);
                toast('Entrando como admin...', 'info');
                router.push('/admin');
              } catch { toast('Erro ao impersonar.', 'error'); }
            }}
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
          >
            Entrar como Admin
          </Button>
          <Button
            variant="ghost"
            onClick={handleToggleStatus}
          >
            {academy.status === 'suspended' ? 'Reativar' : 'Suspender'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Alunos', value: `${academy.total_students ?? 0}/${academy.max_students}`, icon: '👥', color: '#3b82f6' },
          { label: 'Professores', value: `${academy.total_professors ?? 0}/${academy.max_professors}`, icon: '🎓', color: '#a855f7' },
          { label: 'Turmas', value: String(academy.total_classes ?? 0), icon: '📅', color: '#f59e0b' },
          { label: 'MRR', value: formatCurrency(academy.monthly_revenue ?? 0), icon: '💰', color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="flex items-center gap-2">
              <span>{s.icon}</span>
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Usage bars */}
      <Card className="p-5">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Uso de Recursos</h2>
        <div className="space-y-4">
          {[
            { label: 'Alunos', current: academy.total_students ?? 0, max: academy.max_students, percent: studentsPercent },
            { label: 'Professores', current: academy.total_professors ?? 0, max: academy.max_professors, percent: profsPercent },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                <span>{r.label}</span>
                <span>{r.current}/{r.max} ({Math.round(r.percent)}%)</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${r.percent}%`,
                    background: r.percent >= 90 ? '#ef4444' : r.percent >= 70 ? '#f59e0b' : '#22c55e',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info */}
      <Card className="p-5">
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Informacoes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Dono', value: academy.owner_name ?? '-' },
            { label: 'Email', value: academy.email ?? '-' },
            { label: 'Telefone', value: academy.phone ?? '-' },
            { label: 'Endereco', value: academy.address ?? '-' },
            { label: 'Plano', value: academy.plan?.name ?? '-' },
            { label: 'Preco mensal', value: academy.plan ? formatCurrency(academy.plan.price_monthly) : '-' },
            { label: 'Cadastro', value: formatDate(academy.created_at) },
            { label: 'Onboarding', value: academy.onboarded_at ? formatDate(academy.onboarded_at) : 'Pendente' },
            ...(academy.trial_ends_at ? [{ label: 'Trial expira', value: formatDate(academy.trial_ends_at) }] : []),
          ].map((item) => (
            <div key={item.label} className="flex justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-2)' }}>
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

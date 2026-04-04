'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  AlertTriangle,
  Gavel,
  Settings,
  ChevronRight,
  FileText,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  getActiveTemplate,
  getAcceptanceStats,
  listIncidents,
  listSanctions,
} from '@/lib/api/conduct-code.service';
import type {
  ConductTemplate,
  ConductIncident,
  ConductSanction,
  IncidentCategory,
  IncidentSeverity,
  SanctionType,
} from '@/lib/api/conduct-code.service';

// ── Labels ────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<IncidentCategory, string> = {
  hygiene: 'Higiene',
  disrespect: 'Desrespeito',
  aggression: 'Agressao',
  property_damage: 'Dano Material',
  sparring_violation: 'Violacao de Sparring',
  attendance: 'Frequencia',
  substance: 'Substancia',
  harassment: 'Assedio',
  safety_violation: 'Violacao de Seguranca',
  other: 'Outro',
};

const CATEGORY_COLOR: Record<IncidentCategory, { color: string; bg: string }> = {
  hygiene: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  disrespect: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  aggression: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  property_damage: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  sparring_violation: { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  attendance: { color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  substance: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  harassment: { color: '#BE185D', bg: 'rgba(190,24,93,0.1)' },
  safety_violation: { color: '#EA580C', bg: 'rgba(234,88,12,0.1)' },
  other: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  serious: 'Grave',
  critical: 'Critica',
};

const SEVERITY_COLOR: Record<IncidentSeverity, { color: string; bg: string }> = {
  minor: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  serious: { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const SANCTION_LABEL: Record<SanctionType, string> = {
  verbal_warning: 'Advertencia Verbal',
  written_warning: 'Advertencia Escrita',
  suspension: 'Suspensao',
  ban: 'Banimento',
  community_service: 'Servico Comunitario',
  other: 'Outra',
};

const SANCTION_COLOR: Record<SanctionType, { color: string; bg: string }> = {
  verbal_warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  written_warning: { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  suspension: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ban: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  community_service: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  other: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

// ── Sections ──────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'template', label: 'Codigo de Conduta', icon: BookOpen, href: '/admin/conduta/template', desc: 'Ver e editar o codigo de conduta' },
  { key: 'ocorrencias', label: 'Ocorrencias', icon: AlertTriangle, href: '/admin/conduta/ocorrencias', desc: 'Gerenciar ocorrencias' },
  { key: 'sancoes', label: 'Sancoes', icon: Gavel, href: '/admin/conduta/sancoes', desc: 'Gerenciar sancoes' },
  { key: 'config', label: 'Configuracoes', icon: Settings, href: '/admin/conduta/config', desc: 'Configurar conduta' },
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
      <Skeleton variant="card" className="h-48" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function CondutaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ConductTemplate | null>(null);
  const [stats, setStats] = useState<{ total_students: number; accepted: number; pending: number }>({
    total_students: 0,
    accepted: 0,
    pending: 0,
  });
  const [incidents, setIncidents] = useState<ConductIncident[]>([]);
  const [sanctions, setSanctions] = useState<ConductSanction[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const [tpl, acceptance, inc, san] = await Promise.all([
          getActiveTemplate(academyId),
          getAcceptanceStats(academyId),
          listIncidents(academyId),
          listSanctions(academyId),
        ]);
        setTemplate(tpl);
        setStats(acceptance);
        setIncidents(inc);
        setSanctions(san);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageSkeleton />;

  // ── Derived data ──────────────────────────────────────────────────
  const activeSanctions = sanctions.filter((s) => s.is_active);
  const recentIncidents = incidents.slice(0, 5);
  const acceptanceRate = stats.total_students > 0
    ? Math.round((stats.accepted / stats.total_students) * 100)
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>
            Codigo de Conduta
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Painel de controle do codigo de conduta da academia
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <FileText size={20} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Versao do Template</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                {template ? `v${template.version}` : '--'}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <CheckCircle size={20} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Taxa de Aceitacao</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                {stats.accepted}/{stats.total_students}{' '}
                <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-60)' }}>({acceptanceRate}%)</span>
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <ShieldAlert size={20} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Sancoes Ativas</p>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{activeSanctions.length}</p>
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

      {/* Recent Incidents Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Ocorrencias Recentes</h2>
          <Link href="/admin/conduta/ocorrencias" className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
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
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Gravidade</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident) => (
                  <tr key={incident.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {incident.profile_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: CATEGORY_COLOR[incident.category].color,
                          background: CATEGORY_COLOR[incident.category].bg,
                        }}
                      >
                        {CATEGORY_LABEL[incident.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: SEVERITY_COLOR[incident.severity].color,
                          background: SEVERITY_COLOR[incident.severity].bg,
                        }}
                      >
                        {SEVERITY_LABEL[incident.severity]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {new Date(incident.incident_date).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentIncidents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                      Nenhuma ocorrencia registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Sanctions Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Sancoes Ativas</h2>
          <Link href="/admin/conduta/sancoes" className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
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
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Tipo</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Inicio</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Fim</th>
                </tr>
              </thead>
              <tbody>
                {activeSanctions.map((sanction) => (
                  <tr key={sanction.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {sanction.profile_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          color: SANCTION_COLOR[sanction.sanction_type].color,
                          background: SANCTION_COLOR[sanction.sanction_type].bg,
                        }}
                      >
                        {SANCTION_LABEL[sanction.sanction_type]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {new Date(sanction.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {sanction.end_date
                          ? new Date(sanction.end_date).toLocaleDateString('pt-BR')
                          : 'Indeterminado'}
                      </span>
                    </td>
                  </tr>
                ))}
                {activeSanctions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                      Nenhuma sancao ativa no momento.
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { isMock } from '@/lib/env';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { UserPlusIcon } from '@/components/shell/icons';
import type { LeadStatus } from '@/lib/api/leads.service';

interface SuperAdminLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

type FilterStatus = 'todos' | LeadStatus;

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  agendado: 'Agendado',
  compareceu: 'Compareceu',
  matriculou: 'Matriculou',
  desistiu: 'Desistiu',
};

const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  novo: { bg: 'rgba(99,102,241,0.15)', text: '#6366F1' },
  contatado: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  agendado: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  compareceu: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  matriculou: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  desistiu: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function getMockLeads(): SuperAdminLead[] {
  return [
    { id: 'l1', name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(11) 99999-1111', source: 'landing', status: 'novo', createdAt: '2026-04-01T10:00:00Z' },
    { id: 'l2', name: 'Ana Souza', email: 'ana@email.com', phone: '(21) 98888-2222', source: 'instagram', status: 'contatado', createdAt: '2026-03-30T15:00:00Z' },
    { id: 'l3', name: 'Ricardo Lima', email: 'ricardo@email.com', phone: '(31) 97777-3333', source: 'landing', status: 'agendado', createdAt: '2026-03-28T09:00:00Z' },
    { id: 'l4', name: 'Fernanda Costa', email: 'fernanda@email.com', phone: '(11) 96666-4444', source: 'indicacao', status: 'compareceu', createdAt: '2026-03-25T14:00:00Z' },
    { id: 'l5', name: 'Thiago Rocha', email: 'thiago@email.com', phone: '(41) 95555-5555', source: 'whatsapp', status: 'matriculou', createdAt: '2026-03-20T11:00:00Z' },
    { id: 'l6', name: 'Julia Almeida', email: 'julia@email.com', phone: '(51) 94444-6666', source: 'landing', status: 'novo', createdAt: '2026-04-02T08:00:00Z' },
    { id: 'l7', name: 'Bruno Santos', email: 'bruno@email.com', phone: '(11) 93333-7777', source: 'instagram', status: 'desistiu', createdAt: '2026-03-15T16:00:00Z' },
    { id: 'l8', name: 'Patricia Nunes', email: 'patricia@email.com', phone: '(21) 92222-8888', source: 'landing', status: 'novo', createdAt: '2026-04-03T07:30:00Z' },
  ];
}

export default function SuperAdminLeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<SuperAdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('todos');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      if (isMock()) {
        setLeads(getMockLeads());
        return;
      }
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, phone, source, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        toast(translateError(error), 'error');
        return;
      }
      setLeads(
        (data ?? []).map((l: Record<string, unknown>) => ({
          id: l.id as string,
          name: (l.name as string) ?? '',
          email: (l.email as string) ?? '',
          phone: (l.phone as string) ?? '',
          source: (l.source as string) ?? '',
          status: (l.status as LeadStatus) ?? 'novo',
          createdAt: (l.created_at as string) ?? '',
        })),
      );
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    try {
      if (!isMock()) {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
      }
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
      toast('Status atualizado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  const filtered = filter === 'todos' ? leads : leads.filter((l) => l.status === filter);
  const newThisWeek = leads.filter((l) => {
    const d = new Date(l.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return d >= weekAgo && l.status === 'novo';
  }).length;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* Header */}
      <section className="animate-reveal">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bb-brand-surface)' }}
          >
            <UserPlusIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Leads</h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Gestao de leads do site</p>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="animate-reveal grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>{leads.length}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Total Leads</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#6366F1' }}>{newThisWeek}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Novos esta semana</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
            {leads.filter((l) => l.status === 'matriculou').length}
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Convertidos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
            {leads.filter((l) => l.status === 'desistiu').length}
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Perdidos</p>
        </Card>
      </section>

      {/* Filter */}
      <section className="animate-reveal flex flex-wrap gap-2">
        {(['todos', 'novo', 'contatado', 'agendado', 'compareceu', 'matriculou', 'desistiu'] as FilterStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
            style={{
              background: filter === s ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: filter === s ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {s === 'todos' ? 'Todos' : STATUS_LABELS[s]}
            {s !== 'todos' && (
              <span className="ml-1 opacity-70">
                ({leads.filter((l) => l.status === s).length})
              </span>
            )}
          </button>
        ))}
      </section>

      {/* List */}
      <section className="animate-reveal space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhum lead encontrado"
            description="Nao ha leads com este filtro."
            variant="search"
          />
        ) : (
          filtered.map((lead) => {
            const sc = STATUS_COLORS[lead.status];
            return (
              <div
                key={lead.id}
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                    {lead.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>
                    {lead.email} · {lead.phone}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {lead.source} · {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="rounded px-1 py-0.5 text-[10px]"
                    style={{
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-60)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  >
                    {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

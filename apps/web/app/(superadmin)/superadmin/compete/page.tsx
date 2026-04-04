'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getTournaments,
  getCircuits,
} from '@/lib/api/compete.service';
import type { Tournament, TournamentCircuit, TournamentStatus } from '@/lib/api/compete.service';
import {
  TrophyIcon,
  UsersIcon,
  PlusIcon,
  MapPinIcon,
  EditIcon,
  SwordsIcon,
  RadioIcon,
  BarChartIcon,
  RefreshIcon,
  SearchIcon,
  EyeIcon,
} from '@/components/shell/icons';

// ── Constants ──────────────────────────────────────────────────────────

const AMBER = '#f59e0b';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  aguardando_aprovacao: 'Aguardando Aprovacao',
  draft: 'Rascunho',
  published: 'Publicado',
  registration_open: 'Inscricoes Abertas',
  registration_closed: 'Inscricoes Encerradas',
  weigh_in: 'Pesagem',
  live: 'Ao Vivo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<TournamentStatus, { bg: string; text: string }> = {
  aguardando_aprovacao: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  draft: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  published: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  registration_open: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  registration_closed: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
  weigh_in: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  live: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  completed: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Page ───────────────────────────────────────────────────────────────

export default function SuperAdminCompetePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [circuits, setCircuits] = useState<TournamentCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const [tournamentsData, circuitsData] = await Promise.all([
          getTournaments(),
          getCircuits(),
        ]);
        setTournaments(tournamentsData);
        setCircuits(circuitsData);
      } catch {
        /* handled by service */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAthletes = tournaments.reduce((sum, t) => sum + (t.max_athletes ?? 0), 0);
  const liveNow = tournaments.filter((t) => t.status === 'live').length;
  const filteredTournaments = tournaments
    .filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.organizer_id.toLowerCase().includes(q)
        );
      }
      return true;
    });

  // ── Skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 overflow-x-hidden" data-stagger>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Compete
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Gestao de campeonatos da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <BarChartIcon className="h-4 w-4" />
            Analytics
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
            style={{ background: AMBER, color: '#000' }}
          >
            <PlusIcon className="h-4 w-4" />
            Campeonato Destaque
          </button>
        </div>
      </section>

      {/* ── Stats Cards ───────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: TrophyIcon,
            label: 'Total Campeonatos',
            value: tournaments.length,
            color: AMBER,
          },
          {
            icon: UsersIcon,
            label: 'Total Atletas',
            value: totalAthletes,
            color: '#3B82F6',
          },
          {
            icon: SwordsIcon,
            label: 'Circuitos Ativos',
            value: circuits.length,
            color: '#A855F7',
          },
          {
            icon: RadioIcon,
            label: 'Ao Vivo Agora',
            value: liveNow,
            color: liveNow > 0 ? '#EF4444' : '#6B7280',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-lg p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${stat.color}20`, color: stat.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <section
        className="flex flex-wrap gap-2 rounded-lg p-4"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <span className="flex items-center text-xs font-semibold mr-2" style={{ color: 'var(--bb-ink-40)' }}>
          Acoes Rapidas:
        </span>
        {[
          { label: 'Criar Circuito', icon: PlusIcon },
          { label: 'Gerenciar Categorias', icon: SwordsIcon },
          { label: 'Configurar Areas', icon: MapPinIcon },
          { label: 'Sincronizar Rankings', icon: RefreshIcon },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </section>

      {/* ── Circuits ──────────────────────────────────────────────── */}
      {circuits.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Circuitos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {circuits.map((circuit) => (
              <div
                key={circuit.id}
                className="rounded-lg p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {circuit.name}
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {circuit.season} &middot; {circuit.tournament_ids.length} etapa
                      {circuit.tournament_ids.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center transition-all hover:opacity-80"
                    style={{ color: 'var(--bb-ink-40)' }}
                    aria-label="Editar circuito"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                  >
                    {circuit.slug}
                  </span>
                </div>
                {circuit.description && (
                  <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--bb-ink-40)' }}>
                    {circuit.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tournaments List ──────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Todos os Campeonatos
          </h2>
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: 'var(--bb-ink-40)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar campeonato..."
                className="w-full rounded-lg pl-10 pr-3 py-2 min-h-[40px] text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg px-3 py-2 min-h-[40px] text-sm outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              <option value="">Todos</option>
              {(Object.keys(STATUS_LABELS) as TournamentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="py-8 text-center">
            <TrophyIcon className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--bb-ink-20)' }} />
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhum campeonato encontrado.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Campeonato
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Organizador
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Data
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Atletas
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Academias
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-semibold uppercase"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTournaments.map((t) => {
                    const sc = STATUS_COLORS[t.status];
                    return (
                      <tr
                        key={t.id}
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                              {t.name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPinIcon className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} />
                              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                                {t.city}
                                {t.state ? `, ${t.state}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                          {t.organizer_name || t.organizer_id}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>
                          {formatDate(t.start_date)}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {t.max_athletes ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {t.areas_count}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {STATUS_LABELS[t.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center transition-all hover:opacity-80"
                              style={{ color: 'var(--bb-ink-40)' }}
                              aria-label="Visualizar"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center transition-all hover:opacity-80"
                              style={{ color: 'var(--bb-ink-40)' }}
                              aria-label="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--bb-glass-border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {filteredTournaments.length} de {tournaments.length} campeonato
                {tournaments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

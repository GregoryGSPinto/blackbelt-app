'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getAlertas,
  marcarLido,
  marcarTodosLidos,
  type AlertaProfessor,
} from '@/lib/api/professor-alertas.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  BellIcon,
  AlertTriangleIcon,
  AwardIcon,
  StarIcon,
  UsersIcon,
  UserIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  HeartIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@/components/shell/icons';

// ── Helpers ─────────────────────────────────────────────────────────────

type UrgenciaFilter = 'todos' | 'alta' | 'media' | 'info';

const URGENCIA_CONFIG: Record<
  AlertaProfessor['urgencia'],
  { label: string; color: string; bg: string; border: string }
> = {
  alta: {
    label: 'Alta',
    color: 'var(--bb-error)',
    bg: 'color-mix(in srgb, var(--bb-error) 10%, transparent)',
    border: 'var(--bb-error)',
  },
  media: {
    label: 'Media',
    color: 'var(--bb-warning)',
    bg: 'color-mix(in srgb, var(--bb-warning) 10%, transparent)',
    border: 'var(--bb-warning)',
  },
  info: {
    label: 'Info',
    color: 'var(--bb-info)',
    bg: 'color-mix(in srgb, var(--bb-info) 10%, transparent)',
    border: 'var(--bb-info)',
  },
};

const TIPO_ICON: Record<AlertaProfessor['tipo'], React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ausencia: AlertTriangleIcon,
  graduacao_pronta: AwardIcon,
  aniversario: StarIcon,
  turma_lotada: UsersIcon,
  primeiro_dia: UserIcon,
  retorno: CheckCircleIcon,
  avaliacao_pendente: ClipboardCheckIcon,
  lesao_reportada: HeartIcon,
};

const FILTER_TABS: { key: UrgenciaFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'alta', label: 'Alta' },
  { key: 'media', label: 'Media' },
  { key: 'info', label: 'Info' },
];

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atras`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atras`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d atras`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ── Component ───────────────────────────────────────────────────────────

export default function AlertasProfessorPage() {
  const { toast } = useToast();
  const [alertas, setAlertas] = useState<AlertaProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UrgenciaFilter>('todos');

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlertas('prof-1');
      setAlertas(data);
    } catch {
      toast('Erro ao carregar alertas', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  async function handleMarcarLido(alertaId: string) {
    try {
      await marcarLido(alertaId);
      setAlertas((prev) =>
        prev.map((a) => (a.id === alertaId ? { ...a, lido: true } : a)),
      );
    } catch {
      toast('Erro ao marcar como lido', 'error');
    }
  }

  async function handleMarcarTodosLidos() {
    try {
      await marcarTodosLidos('prof-1');
      setAlertas((prev) => prev.map((a) => ({ ...a, lido: true })));
      toast('Todos os alertas marcados como lidos', 'success');
    } catch {
      toast('Erro ao marcar todos como lidos', 'error');
    }
  }

  const filteredAlertas =
    filter === 'todos'
      ? alertas
      : alertas.filter((a) => a.urgencia === filter);

  const unreadCount = alertas.filter((a) => !a.lido).length;

  // ── Loading skeleton ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="mx-auto max-w-lg space-y-4 px-4 pt-6">
          <Skeleton variant="text" className="h-8 w-36" />
          <Skeleton variant="text" className="h-10 w-full" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
            <h1
              className="text-2xl font-extrabold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Alertas
            </h1>
            {unreadCount > 0 && (
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                style={{ background: 'var(--bb-error)' }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarcarTodosLidos}
              className="flex items-center gap-1 min-h-[44px] px-3 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--bb-brand)' }}
            >
              <CheckIcon className="h-4 w-4" />
              Marcar todos como lidos
            </button>
          )}
        </div>

        {/* ── Filter tabs ─────────────────────────────────────── */}
        <div
          className="flex overflow-x-auto gap-1 p-1"
          style={{
            background: 'var(--bb-depth-2)',
            borderRadius: 'var(--bb-radius-lg)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.key;
            const count =
              tab.key === 'todos'
                ? alertas.length
                : alertas.filter((a) => a.urgencia === tab.key).length;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className="flex-1 flex items-center justify-center gap-1 min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--bb-depth-4)' : 'transparent',
                  color: isActive ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)',
                  boxShadow: isActive ? 'var(--bb-shadow-sm)' : 'none',
                }}
              >
                {tab.label}
                <span
                  className="text-[10px] opacity-60"
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Alert cards ─────────────────────────────────────── */}
        {filteredAlertas.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-16 text-center"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <BellIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">
              {filter === 'todos'
                ? 'Nenhum alerta no momento.'
                : `Nenhum alerta com urgencia "${FILTER_TABS.find((t) => t.key === filter)?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlertas.map((alerta) => {
              const urgCfg = URGENCIA_CONFIG[alerta.urgencia];
              const IconComponent = TIPO_ICON[alerta.tipo];

              return (
                <div
                  key={alerta.id}
                  style={{
                    background: alerta.lido ? 'var(--bb-depth-2)' : 'var(--bb-depth-3)',
                    borderRadius: 'var(--bb-radius-lg)',
                    border: '1px solid var(--bb-glass-border)',
                    borderLeft: alerta.lido
                      ? '1px solid var(--bb-glass-border)'
                      : `3px solid ${urgCfg.border}`,
                    boxShadow: 'var(--bb-shadow-sm)',
                    opacity: alerta.lido ? 0.75 : 1,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: urgCfg.bg,
                          color: urgCfg.color,
                        }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-sm font-bold truncate"
                            style={{ color: 'var(--bb-ink-100)' }}
                          >
                            {alerta.titulo}
                          </h3>
                          {/* Urgencia badge */}
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0"
                            style={{
                              color: urgCfg.color,
                              background: urgCfg.bg,
                            }}
                          >
                            {urgCfg.label}
                          </span>
                        </div>

                        <p
                          className="mt-1 text-xs leading-relaxed"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          {alerta.mensagem}
                        </p>

                        {/* Meta: aluno, turma, time */}
                        <div
                          className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {alerta.alunoNome && (
                            <span className="flex items-center gap-0.5">
                              <UserIcon className="h-3 w-3" />
                              {alerta.alunoNome}
                            </span>
                          )}
                          {alerta.turmaNome && (
                            <span className="flex items-center gap-0.5">
                              <UsersIcon className="h-3 w-3" />
                              {alerta.turmaNome}
                            </span>
                          )}
                          <span>{timeAgo(alerta.criadoEm)}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-2">
                          {alerta.acao && (
                            <Link
                              href={alerta.acao.rota}
                              className="flex items-center gap-1 min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                              style={{
                                background: 'var(--bb-brand)',
                                color: '#fff',
                                borderRadius: 'var(--bb-radius-md)',
                              }}
                            >
                              {alerta.acao.label}
                              <ChevronRightIcon className="h-3 w-3" />
                            </Link>
                          )}

                          {!alerta.lido && (
                            <button
                              type="button"
                              onClick={() => handleMarcarLido(alerta.id)}
                              className="flex items-center gap-1 min-h-[44px] px-3 py-2 text-xs font-medium transition-opacity hover:opacity-70"
                              style={{ color: 'var(--bb-ink-40)' }}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Marcar como lido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

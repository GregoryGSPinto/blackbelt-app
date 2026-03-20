'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { getRecepcaoDashboard } from '@/lib/api/recepcao-dashboard.service';
import type { RecepcaoDashboardDTO } from '@/lib/api/recepcao-dashboard.service';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import {
  UsersIcon,
  CalendarIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@/components/shell/icons';

// ── Helpers ────────────────────────────────────────────────────────

function getBeltCSSVar(belt: string): string {
  const map: Record<string, string> = {
    white: '#f5f5f5', gray: '#9ca3af', yellow: '#eab308', orange: '#f97316',
    green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', brown: '#92400e', black: '#1f2937',
  };
  return map[belt] ?? '#9ca3af';
}

function getUrgenciaColor(u: string): string {
  if (u === 'alta') return '#ef4444';
  if (u === 'media') return '#eab308';
  return '#6b7280';
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoDashboardPage() {
  const { data, loading } = useSWRFetch<RecepcaoDashboardDTO>(
    'recepcao-dashboard',
    () => getRecepcaoDashboard(),
  );
  const [clock, setClock] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-5 w-64" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  if (!data) return null;

  const pendenciasCount = data.pendencias.length;

  return (
    <div className="space-y-5 p-4 pb-20">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--bb-ink-100)' }}>
              {clock}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Guerreiros do Tatame &middot; {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {pendenciasCount > 0 && (
            <span
              className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-bold text-white"
              style={{ background: '#ef4444' }}
            >
              {pendenciasCount}
            </span>
          )}
        </div>
      </section>

      {/* ── ACOES RAPIDAS ────────────────────────────────── */}
      <div className="mb-4">
        <p
          className="text-xs font-medium mb-2"
          style={{ color: 'var(--bb-ink-50)' }}
        >
          Acoes Rapidas
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Buscar Aluno', href: '/recepcao/busca' },
            { label: 'Cadastro Rapido', href: '/recepcao/cadastro' },
            { label: 'Check-in Manual', href: '/recepcao/caixa' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:brightness-110"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                color: 'var(--bb-ink-80)',
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── AULA EM ANDAMENTO ─────────────────────────────── */}
      {data.aulaEmAndamento && (
        <Card className="border-emerald-500" style={{ borderColor: '#10b981', borderWidth: '2px' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-3 w-3 animate-pulse rounded-full" style={{ background: '#10b981' }} />
            <span className="text-sm font-bold" style={{ color: '#10b981' }}>AULA EM ANDAMENTO</span>
          </div>
          <p className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            {data.aulaEmAndamento.turma}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            <span>Prof. {data.aulaEmAndamento.professor.replace('Prof. ', '')}</span>
            <span>{data.aulaEmAndamento.sala}</span>
            <span className="font-semibold" style={{ color: '#10b981' }}>
              {data.aulaEmAndamento.presentes}/{data.aulaEmAndamento.capacidade} presentes
            </span>
          </div>
        </Card>
      )}

      {/* ── SUMMARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Alunos Ativos', value: data.resumo.alunosAtivos, icon: <UsersIcon className="h-5 w-5" />, color: '#10b981' },
          { label: 'Aulas Hoje', value: data.resumo.aulasHoje, icon: <CalendarIcon className="h-5 w-5" />, color: '#3b82f6' },
          { label: 'Check-ins Hoje', value: data.totalCheckinsHoje, icon: <CheckSquareIcon className="h-5 w-5" />, color: '#8b5cf6' },
          { label: 'Pendencias', value: pendenciasCount, icon: <AlertTriangleIcon className="h-5 w-5" />, color: '#ef4444' },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden p-4"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: card.color, borderRadius: 'var(--bb-radius-lg) 0 0 var(--bb-radius-lg)' }}
            />
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center"
                style={{ borderRadius: 'var(--bb-radius-md)', background: `color-mix(in srgb, ${card.color} 12%, transparent)`, color: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>{card.label}</p>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--bb-ink-100)' }}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PENDENCIAS ────────────────────────────────────── */}
      {data.pendencias.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Pendencias
          </h2>
          <div className="space-y-2">
            {[...data.pendencias]
              .sort((a, b) => {
                const order = { alta: 0, media: 1, baixa: 2 };
                return order[a.urgencia] - order[b.urgencia];
              })
              .map((p, i) => (
                <Card
                  key={i}
                  className="relative overflow-hidden"
                  style={{ borderLeft: `3px solid ${getUrgenciaColor(p.urgencia)}` }}
                >
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{p.titulo}</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{p.descricao}</p>
                  <div className="mt-2">
                    <Button variant="ghost" size="sm" className="text-emerald-600" style={{ color: '#059669' }}>
                      {p.acao.label} <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* ── AGENDA DO DIA ─────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Agenda do Dia
        </h2>
        <div className="relative space-y-0">
          <div
            className="absolute left-[19px] top-4 bottom-4"
            style={{ width: '2px', background: 'var(--bb-glass-border)' }}
          />
          {data.aulasHoje.map((aula, i) => {
            const statusIcon = aula.status === 'concluida' ? '\u2705' : aula.status === 'em_andamento' ? '\uD83D\uDFE2' : '\u23F3';
            const dotColor = aula.status === 'concluida' ? 'var(--bb-ink-40)' : aula.status === 'em_andamento' ? '#10b981' : 'var(--bb-ink-40)';

            return (
              <div key={i} className="relative flex gap-4 py-2">
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-sm"
                    style={{
                      borderRadius: 'var(--bb-radius-full)',
                      background: aula.status === 'em_andamento' ? 'rgba(16,185,129,0.1)' : 'var(--bb-depth-4)',
                      border: `2px solid ${dotColor}`,
                    }}
                  >
                    {statusIcon}
                  </div>
                </div>
                <div
                  className="flex-1 p-3"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                    boxShadow: aula.status === 'em_andamento' ? '0 0 12px rgba(16,185,129,0.15)' : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--bb-ink-100)' }}>
                      {aula.horario}
                    </span>
                    {aula.status === 'em_andamento' && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#10b981' }} />
                        Ao vivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>{aula.turma}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    <span>{aula.professor}</span>
                    <span>{aula.sala}</span>
                    <span>{aula.matriculados}/{aula.capacidade}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ULTIMOS CHECK-INS ─────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Ultimos Check-ins
        </h2>
        <div className="space-y-2">
          {data.checkinsHoje.slice(0, 5).map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <ClockIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
              <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--bb-ink-40)' }}>{c.horario}</span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{c.alunoNome}</span>
              </div>
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ background: getBeltCSSVar(c.faixa), border: c.faixa === 'white' ? '1px solid var(--bb-ink-20)' : undefined }}
              />
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{c.turma}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANIVERSARIANTES ───────────────────────────────── */}
      {data.aniversariantes.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Aniversariantes
          </h2>
          <div className="space-y-2">
            {data.aniversariantes.map((a, i) => (
              <Card key={i} style={{ borderLeft: '3px solid #10b981' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  🎂 {a.nome} faz {a.idade} anos hoje!
                </p>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: '#059669' }}
                    onClick={() => toast('Parabens enviado!', 'success')}
                  >
                    Enviar parabens
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

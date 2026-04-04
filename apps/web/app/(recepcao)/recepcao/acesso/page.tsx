'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { getAcesso, registrarEntradaManual, registrarSaida } from '@/lib/api/recepcao-acesso.service';
import type { AcessoAcademia } from '@/lib/api/recepcao-acesso.service';
import { UserPlusIcon, ClockIcon } from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ────────────────────────────────────────────────────────

function getBeltColor(belt?: string): string {
  if (!belt) return '#9ca3af';
  const map: Record<string, string> = {
    white: '#f5f5f5', gray: '#9ca3af', yellow: '#eab308', orange: '#f97316',
    green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', brown: '#92400e', black: '#1f2937',
  };
  return map[belt] ?? '#9ca3af';
}

function getTipoLabel(tipo: string): string {
  const map: Record<string, string> = { aluno: 'Aluno', professor: 'Professor', visitante: 'Visitante' };
  return map[tipo] ?? tipo;
}

function getTipoBadgeColor(tipo: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    aluno: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    professor: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    visitante: { bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
  };
  return map[tipo] ?? { bg: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' };
}

function getOccupancyColor(pct: number): string {
  if (pct >= 80) return '#ef4444';
  if (pct >= 60) return '#eab308';
  return '#10b981';
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoAcessoPage() {
  const { toast } = useToast();

  const [data, setData] = useState<AcessoAcademia | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'aluno' | 'professor' | 'visitante'>('todos');

  // Entry modal
  const [entradaOpen, setEntradaOpen] = useState(false);
  const [entradaNome, setEntradaNome] = useState('');
  const [entradaTipo, setEntradaTipo] = useState<'aluno' | 'professor' | 'visitante'>('aluno');
  const [entradaLoading, setEntradaLoading] = useState(false);

  // Visitor modal
  const [visitanteOpen, setVisitanteOpen] = useState(false);
  const [visitanteNome, setVisitanteNome] = useState('');
  const [visitanteMotivo, setVisitanteMotivo] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getAcesso();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function handleRegistrarSaida(pessoaId: string, nome: string) {
    try {
      await registrarSaida(pessoaId);
      setData((prev) => prev ? {
        ...prev,
        totalDentro: prev.totalDentro - 1,
        pessoasDentro: prev.pessoasDentro.filter((p) => p.id !== pessoaId),
      } : prev);
      toast(`Saida de ${nome} registrada`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleEntrada() {
    setEntradaLoading(true);
    try {
      await registrarEntradaManual({ nome: entradaNome, tipo: entradaTipo });
      toast(`Entrada de ${entradaNome} registrada!`, 'success');
      setEntradaOpen(false);
      setEntradaNome('');
      // Reload
      const result = await getAcesso();
      setData(result);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setEntradaLoading(false);
    }
  }

  function handleVisitante() {
    toast(`Visitante ${visitanteNome} registrado!`, 'success');
    setVisitanteOpen(false);
    setVisitanteNome('');
    setVisitanteMotivo('');
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-10" />
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  const occupancyPct = Math.round((data.totalDentro / data.capacidadeMaxima) * 100);
  const occupancyColor = getOccupancyColor(occupancyPct);

  const filteredPessoas = filter === 'todos'
    ? data.pessoasDentro
    : data.pessoasDentro.filter((p) => p.tipo === filter);

  return (
    <div className="space-y-5 p-4 pb-20">
      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Controle de Acesso</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold" style={{ background: `color-mix(in srgb, ${occupancyColor} 10%, transparent)`, color: occupancyColor }}>
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full" style={{ background: occupancyColor }} />
          {data.totalDentro} pessoas dentro
        </span>
      </div>

      {/* ── OCCUPANCY CARD ────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Ocupacao</span>
          <span className="text-sm font-bold" style={{ color: occupancyColor }}>
            {data.totalDentro}/{data.capacidadeMaxima} ({occupancyPct}%)
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${occupancyPct}%`, background: occupancyColor }}
          />
        </div>
      </Card>

      {/* ── ACTION BUTTONS ────────────────────────────────── */}
      <div className="flex gap-2">
        <Button size="sm" style={{ background: '#10b981' }} className="flex-1" onClick={() => setEntradaOpen(true)}>
          <UserPlusIcon className="mr-1 h-4 w-4" /> Registrar Entrada Manual
        </Button>
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => setVisitanteOpen(true)}>
          Registrar Visitante
        </Button>
      </div>

      {/* ── FILTER TABS ───────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-4)' }}>
        {([
          { key: 'todos' as const, label: 'Todos' },
          { key: 'aluno' as const, label: 'Alunos' },
          { key: 'professor' as const, label: 'Professores' },
          { key: 'visitante' as const, label: 'Visitantes' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all"
            style={{
              background: filter === tab.key ? '#10b981' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DENTRO AGORA ──────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Dentro Agora ({filteredPessoas.length})
        </h2>
        <div className="space-y-1">
          {filteredPessoas.map((pessoa) => {
            const tipoBadge = getTipoBadgeColor(pessoa.tipo);
            return (
              <div
                key={pessoa.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                {pessoa.faixa && (
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ background: getBeltColor(pessoa.faixa), border: pessoa.faixa === 'white' ? '1px solid var(--bb-ink-20)' : undefined }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{pessoa.nome}</p>
                  <div className="flex flex-wrap gap-x-2 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                    <span>Entrada: {pessoa.horaEntrada}</span>
                    {pessoa.turma && <span>{pessoa.turma}</span>}
                  </div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: tipoBadge.bg, color: tipoBadge.color }}>
                  {getTipoLabel(pessoa.tipo)}
                </span>
                <Button size="sm" variant="ghost" onClick={() => handleRegistrarSaida(pessoa.id, pessoa.nome)}>
                  Saida
                </Button>
              </div>
            );
          })}
          {filteredPessoas.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Ninguem nesta categoria
            </p>
          )}
        </div>
      </section>

      {/* ── MOVIMENTACAO ───────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Movimentacao</h2>
        <div className="space-y-1">
          {data.movimentacao.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <span className="text-base">{mov.direcao === 'entrada' ? '\u2192' : '\u2190'}</span>
              <ClockIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
              <span className="text-xs tabular-nums" style={{ color: 'var(--bb-ink-40)' }}>{mov.horario}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{mov.nome}</span>
              <span className="ml-auto text-[10px] font-medium" style={{ color: mov.direcao === 'entrada' ? '#10b981' : '#ef4444' }}>
                {mov.direcao === 'entrada' ? 'Entrada' : 'Saida'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ENTRADA MODAL ─────────────────────────────────── */}
      <Modal open={entradaOpen} onClose={() => setEntradaOpen(false)} title="Registrar Entrada Manual">
        <div className="space-y-4">
          <Input label="Nome" value={entradaNome} onChange={(e) => setEntradaNome(e.target.value)} placeholder="Nome da pessoa" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Tipo</label>
            <select value={entradaTipo} onChange={(e) => setEntradaTipo(e.target.value as 'aluno' | 'professor' | 'visitante')} className="h-12 w-full rounded-md px-3 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="visitante">Visitante</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEntradaOpen(false)}>Cancelar</Button>
            <Button style={{ background: '#10b981' }} onClick={handleEntrada} loading={entradaLoading} disabled={!entradaNome || entradaLoading}>
              Confirmar Entrada
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── VISITANTE MODAL ───────────────────────────────── */}
      <Modal open={visitanteOpen} onClose={() => setVisitanteOpen(false)} title="Registrar Visitante">
        <div className="space-y-4">
          <Input label="Nome" value={visitanteNome} onChange={(e) => setVisitanteNome(e.target.value)} placeholder="Nome do visitante" />
          <Input label="Motivo" value={visitanteMotivo} onChange={(e) => setVisitanteMotivo(e.target.value)} placeholder="Ex: Reuniao, entrega, aula experimental..." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setVisitanteOpen(false)}>Cancelar</Button>
            <Button style={{ background: '#10b981' }} onClick={handleVisitante} disabled={!visitanteNome}>
              Registrar Visitante
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

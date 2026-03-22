'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import {
  buscarAlunoCheckin,
  registrarEntrada,
  registrarSaida,
  getDentroAgora,
  registrarVisitante,
} from '@/lib/api/recepcao-checkin.service';
import type { AlunoCheckin, PessoaDentro, CapacidadeInfo } from '@/lib/api/recepcao-checkin.service';
import { useToast } from '@/lib/hooks/useToast';

// ── Faixa color helper ─────────────────────────────────────────────────
const FAIXA_COLORS: Record<string, string> = {
  branca: '#f5f5f5', azul: '#2563eb', roxa: '#7c3aed', marrom: '#92400e', preta: '#1e1e1e', cinza: '#6b7280', amarela: '#eab308', laranja: '#f97316', verde: '#22c55e', vermelha: '#ef4444',
};

export default function RecepcaoCheckinPage() {
  useTheme();
  const { toast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<AlunoCheckin[]>([]);
  const [selecionado, setSelecionado] = useState<AlunoCheckin | null>(null);
  const [dentroAgora, setDentroAgora] = useState<PessoaDentro[]>([]);
  const [capacidade, setCapacidade] = useState<CapacidadeInfo>({ totalDentro: 0, capacidadeMax: 80, percentual: 0 });
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [showVisitante, setShowVisitante] = useState(false);
  const [visitanteNome, setVisitanteNome] = useState('');
  const [visitanteMotivo, setVisitanteMotivo] = useState('');

  // Autofocus
  useEffect(() => { searchRef.current?.focus(); }, []);

  // Load "dentro agora"
  const loadDentro = useCallback(async () => {
    const res = await getDentroAgora();
    setDentroAgora(res.pessoas);
    setCapacidade(res.capacidade);
    setLoading(false);
  }, []);

  useEffect(() => { loadDentro(); }, [loadDentro]);

  // Search debounce
  useEffect(() => {
    if (query.length < 2) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      const res = await buscarAlunoCheckin(query);
      setResultados(res);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleEntrada(aluno: AlunoCheckin) {
    setRegistrando(true);
    const res = await registrarEntrada(aluno.id);
    if (res.success) {
      toast(`Entrada registrada: ${aluno.nome}`, 'success');
      setSelecionado(null);
      setQuery('');
      setResultados([]);
      await loadDentro();
    } else {
      toast(res.message, 'error');
    }
    setRegistrando(false);
  }

  async function handleSaida(pessoaId: string, nome: string) {
    const res = await registrarSaida(pessoaId);
    if (res.success) {
      toast(`Saída registrada: ${nome}`, 'success');
      await loadDentro();
    } else {
      toast('Erro ao registrar saída', 'error');
    }
  }

  async function handleVisitante() {
    if (!visitanteNome.trim()) return;
    const res = await registrarVisitante(visitanteNome, visitanteMotivo);
    if (res.success) {
      toast('Visitante registrado!', 'success');
      setShowVisitante(false);
      setVisitanteNome('');
      setVisitanteMotivo('');
      await loadDentro();
    }
  }

  // Capacity bar color
  const capColor = capacidade.percentual > 90 ? '#ef4444' : capacidade.percentual > 70 ? '#eab308' : '#22c55e';

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Check-in</h1>
        <button
          onClick={() => setShowVisitante(true)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--bb-brand)' }}
        >
          + Visitante
        </button>
      </div>

      {/* Capacity bar */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)' }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
            Lotação: {capacidade.totalDentro}/{capacidade.capacidadeMax}
          </span>
          <span className="text-sm font-bold" style={{ color: capColor }}>
            {capacidade.percentual.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(capacidade.percentual, 100)}%`, background: capColor }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelecionado(null); }}
          placeholder="Buscar aluno por nome... (foco automático)"
          className="w-full rounded-xl px-4 py-3 text-base outline-none"
          style={{
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
            border: '2px solid var(--bb-glass-border)',
          }}
        />

        {/* Autocomplete results */}
        {resultados.length > 0 && !selecionado && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-xl"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-lg)' }}
          >
            {resultados.map((aluno) => (
              <button
                key={aluno.id}
                onClick={() => { setSelecionado(aluno); setResultados([]); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: FAIXA_COLORS[aluno.faixa] || '#6b7280' }}>
                  {aluno.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{aluno.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{aluno.turma} · Faixa {aluno.faixa}</p>
                </div>
                {aluno.statusFinanceiro === 'em_dia' && (
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">Em dia</span>
                )}
                {aluno.statusFinanceiro === 'atrasado' && (
                  <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">{aluno.diasAtraso}d atraso</span>
                )}
                {aluno.statusFinanceiro === 'inadimplente' && (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">Inadimplente</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected student card */}
      {selecionado && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)', border: '2px solid var(--bb-brand)' }}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: FAIXA_COLORS[selecionado.faixa] || '#6b7280' }}>
              {selecionado.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{selecionado.nome}</p>
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Faixa {selecionado.faixa} · {selecionado.turma}</p>
            </div>
          </div>

          {/* Financial status */}
          <div className="mt-3">
            {selecionado.statusFinanceiro === 'em_dia' && (
              <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: '#22c55e20' }}>
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Financeiro em dia</span>
              </div>
            )}
            {selecionado.statusFinanceiro === 'atrasado' && (
              <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: '#eab30820' }}>
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-medium" style={{ color: '#eab308' }}>Atrasado {selecionado.diasAtraso} dias</span>
              </div>
            )}
            {selecionado.statusFinanceiro === 'inadimplente' && (
              <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: '#ef444420' }}>
                <span className="text-lg">🚫</span>
                <span className="text-sm font-medium" style={{ color: '#ef4444' }}>Inadimplente — {selecionado.diasAtraso} dias de atraso</span>
              </div>
            )}
          </div>

          {/* Register entry button */}
          <button
            onClick={() => handleEntrada(selecionado)}
            disabled={registrando}
            className="mt-4 w-full rounded-xl py-4 text-lg font-bold text-white transition-opacity disabled:opacity-50"
            style={{ background: '#22c55e' }}
          >
            {registrando ? 'Registrando...' : '✅ Registrar Entrada'}
          </button>
        </div>
      )}

      {/* People inside */}
      <div>
        <h2 className="mb-3 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Dentro agora ({dentroAgora.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: 'var(--bb-depth-3)' }} />
            ))}
          </div>
        ) : dentroAgora.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bb-depth-3)' }}>
            <p className="text-2xl">🏠</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>Ninguém na academia agora</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dentroAgora.map((pessoa) => (
              <div
                key={pessoa.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'var(--bb-depth-3)' }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: pessoa.faixa ? (FAIXA_COLORS[pessoa.faixa] || '#6b7280') : 'var(--bb-brand)' }}
                >
                  {pessoa.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{pessoa.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {pessoa.tipo === 'visitante' ? 'Visitante' : pessoa.turma}
                    {pessoa.faixa ? ` · ${pessoa.faixa}` : ''}
                    {' · Entrada '}
                    {pessoa.horaEntrada}
                  </p>
                </div>
                <button
                  onClick={() => handleSaida(pessoa.id, pessoa.nome)}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef444430'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
                >
                  Saída
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitor modal */}
      {showVisitante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowVisitante(false)}>
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--bb-depth-3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Registrar Visitante</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome *</label>
                <input
                  type="text"
                  value={visitanteNome}
                  onChange={(e) => setVisitanteNome(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                  placeholder="Nome do visitante"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Motivo</label>
                <select
                  value={visitanteMotivo}
                  onChange={(e) => setVisitanteMotivo(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <option value="">Selecionar...</option>
                  <option value="aula_experimental">Aula experimental</option>
                  <option value="visita">Visita / Conhecer</option>
                  <option value="acompanhante">Acompanhante</option>
                  <option value="entrega">Entrega</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowVisitante(false)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleVisitante}
                disabled={!visitanteNome.trim()}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--bb-brand)' }}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

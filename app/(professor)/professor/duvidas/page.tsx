'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getDuvidasPendentes,
  getDuvidasRespondidas,
  responderDuvida,
  type Duvida,
} from '@/lib/api/video-experience.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchIcon } from '@/components/shell/icons';

// ── Helpers ──────────────────────────────────────────────────────────

type DuvidaComVideo = Duvida & { videoTitulo: string; videoId: string };

type FilterTab = 'pendentes' | 'respondidas' | 'todas';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'respondidas', label: 'Respondidas' },
  { key: 'todas', label: 'Todas' },
];

const BELT_COLORS: Record<string, string> = {
  white: '#e5e5e5', branca: '#e5e5e5',
  blue: '#3b82f6', azul: '#3b82f6',
  purple: '#8b5cf6', roxa: '#8b5cf6',
  brown: '#92400e', marrom: '#92400e',
  black: '#1c1917', preta: '#1c1917',
};

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atras`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atras`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atras`;
  return `${Math.floor(d / 30)}m atras`;
}

// ── Main page ────────────────────────────────────────────────────────

export default function ProfessorDuvidasPage() {
  const [pendentes, setPendentes] = useState<DuvidaComVideo[]>([]);
  const [respondidas, setRespondidas] = useState<DuvidaComVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Data fetch ───────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [p, r] = await Promise.all([getDuvidasPendentes(), getDuvidasRespondidas()]);
    setPendentes(p);
    setRespondidas(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Actions ──────────────────────────────────────────────────────

  const handleResponder = useCallback(async (duvidaId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    await responderDuvida(duvidaId, responseText.trim());
    // Move from pendentes to respondidas
    const answered = pendentes.find((d) => d.id === duvidaId);
    if (answered) {
      const updated: DuvidaComVideo = {
        ...answered,
        respondida: true,
        resposta: {
          professorNome: 'Voce',
          texto: responseText.trim(),
          respondidoEm: new Date().toISOString(),
        },
      };
      setPendentes((prev) => prev.filter((d) => d.id !== duvidaId));
      setRespondidas((prev) => [updated, ...prev]);
    }
    setRespondingId(null);
    setResponseText('');
    setSubmitting(false);
  }, [responseText, pendentes]);

  // ── Filter & search ──────────────────────────────────────────────

  const allDuvidas = [...pendentes, ...respondidas];

  const filteredList = (() => {
    let list: DuvidaComVideo[];
    switch (activeFilter) {
      case 'pendentes': list = pendentes; break;
      case 'respondidas': list = respondidas; break;
      case 'todas': list = allDuvidas; break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.alunoNome.toLowerCase().includes(q) ||
          d.pergunta.toLowerCase().includes(q) ||
          d.videoTitulo.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => b.votos - a.votos);
  })();

  // ── Stats ────────────────────────────────────────────────────────

  const statsPendentes = pendentes.length;
  const statsRespondidas = respondidas.length;
  const statsTotal = allDuvidas.length;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-2" style={{ background: 'var(--bb-depth-2)' }}>
        <PageHeader title="Duvidas dos Alunos" subtitle="Gerencie e responda duvidas dos seus videos" />
      </div>

      {/* Stats card */}
      <div className="px-4 py-4" style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
        <div className="flex gap-3">
          <StatCard label="Pendentes" value={statsPendentes} color="var(--bb-warning)" loading={loading} />
          <StatCard label="Respondidas" value={statsRespondidas} color="var(--bb-success)" loading={loading} />
          <StatCard label="Total" value={statsTotal} color="var(--bb-info)" loading={loading} />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <SearchIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por video ou aluno..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--bb-ink-100)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              &#10005;
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-3 flex gap-2 px-4">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = tab.key === 'pendentes' ? statsPendentes : tab.key === 'respondidas' ? statsRespondidas : statsTotal;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                color: isActive ? 'white' : 'var(--bb-ink-60)',
                border: isActive ? 'none' : '1px solid var(--bb-glass-border)',
              }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bb-depth-4)',
                  color: isActive ? 'white' : 'var(--bb-ink-40)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Duvidas list ───────────────────────────────────────── */}
      <div className="mt-4 space-y-3 px-4">
        {loading && (
          <>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </>
        )}

        {!loading && filteredList.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
              {activeFilter === 'pendentes'
                ? 'Nenhuma duvida pendente!'
                : searchQuery
                  ? 'Nenhum resultado encontrado.'
                  : 'Nenhuma duvida ainda.'}
            </p>
          </div>
        )}

        {!loading && filteredList.map((duvida) => (
          <div
            key={duvida.id}
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Question header */}
            <div className="p-4">
              {/* Video title badge */}
              <div className="mb-2">
                <span
                  className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  🎬 {duvida.videoTitulo}
                </span>
              </div>

              {/* Student info */}
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: BELT_COLORS[duvida.alunoFaixa.toLowerCase()] ?? '#888' }}
                >
                  {duvida.alunoNome.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {duvida.alunoNome}
                    </span>
                    <span
                      className="inline-block h-2.5 w-6 rounded-sm"
                      style={{ background: BELT_COLORS[duvida.alunoFaixa.toLowerCase()] ?? '#999' }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(duvida.criadoEm)}</span>
                </div>
                {/* Vote count badge */}
                <div
                  className="flex flex-col items-center rounded-xl px-3 py-1.5"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>▲</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>{duvida.votos}</span>
                  <span className="text-[9px]" style={{ color: 'var(--bb-ink-40)' }}>votos</span>
                </div>
              </div>

              {/* Timestamp link */}
              {duvida.timestamp != null && (
                <div className="mt-2">
                  <span
                    className="inline-block rounded-lg px-2 py-0.5 text-xs font-mono font-semibold"
                    style={{
                      background: 'var(--bb-brand-surface)',
                      color: 'var(--bb-brand)',
                      cursor: 'pointer',
                    }}
                  >
                    &#9654; [{fmtTime(duvida.timestamp)}]
                  </span>
                </div>
              )}

              {/* Question text */}
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                {duvida.pergunta}
              </p>

              {/* Vote info */}
              {duvida.votos > 1 && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {duvida.votos} alunos com esta duvida
                </p>
              )}
            </div>

            {/* Professor response (if answered) */}
            {duvida.respondida && duvida.resposta && (
              <div
                className="border-t px-4 py-3"
                style={{
                  background: 'var(--bb-success-surface)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">✅</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--bb-success)' }}>
                    Respondida por {duvida.resposta.professorNome}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                  {duvida.resposta.texto}
                </p>
              </div>
            )}

            {/* Response form (if not answered) */}
            {!duvida.respondida && (
              <div className="border-t px-4 py-3" style={{ borderColor: 'var(--bb-glass-border)' }}>
                {respondingId === duvida.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={3}
                      autoFocus
                      className="w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'var(--bb-depth-4)',
                        color: 'var(--bb-ink-100)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponder(duvida.id)}
                        disabled={!responseText.trim() || submitting}
                        className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                        style={{ background: 'var(--bb-brand)' }}
                      >
                        {submitting ? 'Enviando...' : 'Responder'}
                      </button>
                      <button
                        onClick={() => { setRespondingId(null); setResponseText(''); }}
                        className="rounded-xl px-4 py-2 text-sm font-medium"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingId(duvida.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      background: 'var(--bb-brand-surface)',
                      color: 'var(--bb-brand)',
                      border: '1px solid var(--bb-brand-light)',
                    }}
                  >
                    <span>💬</span> Responder
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center rounded-xl py-3"
      style={{
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      {loading ? (
        <Skeleton className="h-6 w-8" />
      ) : (
        <span className="text-xl font-black" style={{ color }}>{value}</span>
      )}
      <span className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>{label}</span>
    </div>
  );
}

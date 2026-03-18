'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getModulo,
  marcarLicaoConcluida,
  type ModuloTeorico,
  type Licao,
  type ConteudoBloco,
} from '@/lib/api/academia-teorica.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';

/* ── Belt color map ─────────────────────────────────────────────── */

const BELT_COLORS: Record<string, { bg: string; text: string }> = {
  branca:  { bg: 'var(--bb-belt-white)',  text: 'var(--bb-ink-80)' },
  amarela: { bg: 'var(--bb-belt-yellow)', text: '#000' },
  laranja: { bg: 'var(--bb-belt-orange)', text: '#fff' },
  verde:   { bg: 'var(--bb-belt-green)',  text: '#fff' },
  azul:    { bg: 'var(--bb-belt-blue)',   text: '#fff' },
  roxa:    { bg: 'var(--bb-belt-purple)', text: '#fff' },
  marrom:  { bg: 'var(--bb-belt-brown)',  text: '#fff' },
  preta:   { bg: 'var(--bb-belt-black)',  text: '#fff' },
};

function beltStyle(faixa: string) {
  return BELT_COLORS[faixa] ?? BELT_COLORS.branca;
}

/* ── Highlight color map ─────────────────────────────────────────── */

const HIGHLIGHT_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  info:    { bg: 'var(--bb-info-surface)',    border: 'var(--bb-info)',    text: 'var(--bb-info)' },
  warning: { bg: 'var(--bb-warning-surface)', border: 'var(--bb-warning)', text: 'var(--bb-warning)' },
  success: { bg: 'var(--bb-success-surface)', border: 'var(--bb-success)', text: 'var(--bb-success)' },
  danger:  { bg: 'var(--bb-brand-surface)',   border: 'var(--bb-brand)',   text: 'var(--bb-brand)' },
};

/* ── Skeleton ────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="h-4 w-20 animate-pulse rounded" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      <div className="h-6 w-56 animate-pulse rounded" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      <div className="h-4 w-72 animate-pulse rounded" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      <div className="h-3 w-full animate-pulse rounded-full" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-2xl" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      ))}
    </div>
  );
}

/* ── Content block renderer ──────────────────────────────────────── */

function ContentBlock({ bloco }: { bloco: ConteudoBloco }) {
  switch (bloco.tipo) {
    case 'titulo':
      return (
        <h4 className="mb-2 mt-4 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          {bloco.conteudo}
        </h4>
      );

    case 'paragrafo':
      return (
        <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
          {bloco.conteudo}
        </p>
      );

    case 'lista':
      return (
        <ul className="mb-3 space-y-1 pl-5 list-disc">
          {(bloco.itens ?? bloco.conteudo.split(', ')).map((item, i) => (
            <li key={i} className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case 'destaque': {
      const hs = HIGHLIGHT_STYLE[bloco.cor ?? 'info'];
      return (
        <div
          className="mb-3 rounded-xl p-3 text-sm leading-relaxed"
          style={{
            backgroundColor: hs.bg,
            borderLeft: `3px solid ${hs.border}`,
            color: hs.text,
          }}
        >
          {bloco.conteudo}
        </div>
      );
    }

    case 'termo':
      return bloco.termo ? (
        <div
          className="mb-2 rounded-xl p-3"
          style={{
            backgroundColor: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>
              {bloco.termo.original}
            </span>
            <span className="text-xs italic" style={{ color: 'var(--bb-ink-60)' }}>
              ({bloco.termo.pronuncia})
            </span>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            {bloco.termo.traducao}
          </p>
          {bloco.termo.exemplo && (
            <p className="mt-1 text-xs italic" style={{ color: 'var(--bb-ink-60)' }}>
              {bloco.termo.exemplo}
            </p>
          )}
        </div>
      ) : null;

    case 'dica':
      return (
        <div
          className="mb-3 flex items-start gap-2 rounded-xl p-3 text-sm"
          style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}
        >
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span><strong>Dica:</strong> {bloco.conteudo}</span>
        </div>
      );

    case 'curiosidade':
      return (
        <div
          className="mb-3 flex items-start gap-2 rounded-xl p-3 text-sm"
          style={{ backgroundColor: 'var(--bb-warning-surface)', color: 'var(--bb-warning)' }}
        >
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Curiosidade:</strong> {bloco.conteudo}</span>
        </div>
      );

    case 'imagem':
      return (
        <div className="mb-3 overflow-hidden rounded-xl" style={{ backgroundColor: 'var(--bb-depth-4)' }}>
          <div className="flex aspect-video items-center justify-center">
            <svg className="h-8 w-8" style={{ color: 'var(--bb-ink-20)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      );

    case 'video_ref':
      return (
        <div
          className="mb-3 flex items-center gap-3 rounded-xl p-3"
          style={{ backgroundColor: 'var(--bb-brand-surface)', border: '1px solid var(--bb-brand)' }}
        >
          <svg className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--bb-brand)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
            {bloco.conteudo}
          </span>
        </div>
      );

    case 'quiz':
      return null;

    default:
      return (
        <p className="mb-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
          {bloco.conteudo}
        </p>
      );
  }
}

/* ── Lesson accordion ────────────────────────────────────────────── */

function LessonCard({
  licao,
  index,
  expanded,
  onToggle,
  onComplete,
  marking,
}: {
  licao: Licao;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onComplete: (id: string) => void;
  marking: boolean;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            backgroundColor: licao.concluida ? 'var(--bb-success-surface)' : 'var(--bb-depth-4)',
            color: licao.concluida ? 'var(--bb-success)' : 'var(--bb-ink-60)',
          }}
        >
          {licao.concluida ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            index + 1
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: licao.concluida ? 'var(--bb-success)' : 'var(--bb-ink-100)' }}
          >
            {licao.titulo}
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            {licao.duracao}
          </p>
        </div>

        <svg
          className="h-4 w-4 flex-shrink-0 transition-transform"
          style={{
            color: 'var(--bb-ink-40)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 pt-3"
          style={{ borderTop: '1px solid var(--bb-glass-border)' }}
        >
          {licao.conteudo.blocos.map((bloco, i) => (
            <ContentBlock key={i} bloco={bloco} />
          ))}

          {!licao.concluida && (
            <Button
              onClick={() => onComplete(licao.id)}
              loading={marking}
              className="mt-4 w-full"
              size="sm"
            >
              Marcar como concluida
            </Button>
          )}

          {licao.concluida && licao.concluidaEm && (
            <p className="mt-4 text-center text-xs" style={{ color: 'var(--bb-success)' }}>
              Concluida em {new Date(licao.concluidaEm).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Module detail page ──────────────────────────────────────────── */

export default function ModuloDetailPage() {
  const params = useParams();
  const moduloId = params.moduloId as string;

  const [modulo, setModulo] = useState<(ModuloTeorico & { licoes: Licao[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchModulo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getModulo(moduloId);
      setModulo(data);
    } finally {
      setLoading(false);
    }
  }, [moduloId]);

  useEffect(() => {
    fetchModulo();
  }, [fetchModulo]);

  const handleLessonComplete = async (licaoId: string) => {
    setMarkingId(licaoId);
    try {
      await marcarLicaoConcluida(licaoId);
      setModulo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          licoesCompletadas: prev.licoesCompletadas + 1,
          licoes: prev.licoes.map((l) =>
            l.id === licaoId ? { ...l, concluida: true, concluidaEm: new Date().toISOString() } : l,
          ),
        };
      });
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return <PageSkeleton />;

  if (!modulo) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Modulo nao encontrado.</p>
        <Link href="/academia" className="mt-2 inline-block text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
          Voltar
        </Link>
      </div>
    );
  }

  const belt = beltStyle(modulo.faixa);
  const progressPct = modulo.totalLicoes > 0
    ? Math.round((modulo.licoesCompletadas / modulo.totalLicoes) * 100)
    : 0;
  const allDone = modulo.licoes.length > 0 && modulo.licoes.every((l) => l.concluida);

  return (
    <div className="max-w-2xl mx-auto space-y-5 p-4 md:p-6 pb-24">
      {/* Back link */}
      <Link
        href="/academia"
        className="inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--bb-brand)' }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Academia
      </Link>

      {/* Module header */}
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
            style={{ backgroundColor: belt.bg, color: belt.text }}
          >
            {modulo.faixa}
          </span>
          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            {modulo.modalidade}
          </span>
        </div>

        <PageHeader title={modulo.titulo} subtitle={modulo.descricao} />

        <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
          <span>{modulo.licoesCompletadas}/{modulo.totalLicoes} licoes</span>
          <span>&middot;</span>
          <span>{progressPct}%</span>
        </div>

        <div
          className="mt-2 h-2.5 w-full overflow-hidden"
          style={{ borderRadius: 'var(--bb-radius-full)', backgroundColor: 'var(--bb-depth-4)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              borderRadius: 'var(--bb-radius-full)',
              backgroundColor: allDone ? 'var(--bb-success)' : 'var(--bb-brand)',
            }}
          />
        </div>
      </Card>

      {/* Lessons */}
      <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
        Licoes
      </h2>

      <div className="space-y-2">
        {modulo.licoes.map((licao, idx) => (
          <LessonCard
            key={licao.id}
            licao={licao}
            index={idx}
            expanded={expandedLesson === licao.id}
            onToggle={() => setExpandedLesson(expandedLesson === licao.id ? null : licao.id)}
            onComplete={handleLessonComplete}
            marking={markingId === licao.id}
          />
        ))}
      </div>

      {/* Quiz button */}
      {allDone ? (
        <Link href={`/academia/${moduloId}/quiz`}>
          <Button className="w-full" size="lg">
            Fazer Quiz
          </Button>
        </Link>
      ) : (
        <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Complete todas as licoes para desbloquear o quiz
        </p>
      )}
    </div>
  );
}

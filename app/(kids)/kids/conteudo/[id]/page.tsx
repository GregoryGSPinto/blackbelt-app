'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getVideoExperience,
  addNota,
  avaliarVideo,
  type VideoExperience,
} from '@/lib/api/video-experience.service';

// ── Helpers ──────────────────────────────────────────────────────────

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const FUN_COLORS = [
  '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#22c55e', '#ec4899',
];

// ── Main page ────────────────────────────────────────────────────────

export default function KidsVideoExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [data, setData] = useState<VideoExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stars, setStars] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  const [notaText, setNotaText] = useState('');
  const [notaSalva, setNotaSalva] = useState(false);
  const [activeSection, setActiveSection] = useState<'video' | 'capitulos' | 'mais'>('video');
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data fetch ───────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVideoExperience(videoId).then((result) => {
      if (!cancelled) {
        setData(result);
        setProgress(result.progresso.progressoSegundos);
        if (result.social.minhaAvaliacao) setStars(result.social.minhaAvaliacao);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [videoId]);

  // ── Playback sim ─────────────────────────────────────────────────

  const duracao = data?.video.duracaoSegundos ?? 0;

  useEffect(() => {
    if (isPlaying && data) {
      progressRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= duracao) {
            setIsPlaying(false);
            setCompleted(true);
            setEarnedStars((prev) => prev + 5);
            return duracao;
          }
          return p + 1;
        });
      }, 1000);
    } else if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [isPlaying, data, duracao]);

  // ── Actions ──────────────────────────────────────────────────────

  const handleReaction = useCallback((r: string) => {
    setReaction(r);
    setTimeout(() => setReaction(null), 2000);
  }, []);

  const handleRate = useCallback(async (s: number) => {
    setStars(s);
    await avaliarVideo(videoId, s);
  }, [videoId]);

  const handleSaveNota = useCallback(async () => {
    if (!notaText.trim()) return;
    await addNota(videoId, notaText);
    setNotaSalva(true);
    setTimeout(() => setNotaSalva(false), 3000);
  }, [notaText, videoId]);

  // ── Loading ──────────────────────────────────────────────────────

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#FFF7ED' }}>
        <div className="text-center">
          <div className="text-5xl animate-bounce">🥋</div>
          <p className="mt-2 text-lg font-bold" style={{ color: '#92400e' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const progressPct = duracao > 0 ? (progress / duracao) * 100 : 0;

  return (
    <>
      {/* Reaction animation */}
      <style>{`
        @keyframes kidsReaction {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -20px) scale(1.3); }
          40% { transform: translate(-50%, -30px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80px) scale(0.8); }
        }
        @keyframes kidsBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* Floating reaction */}
      {reaction && (
        <div
          className="pointer-events-none fixed left-1/2 z-50 text-5xl"
          style={{
            animation: 'kidsReaction 1.5s ease-out forwards',
            top: '40%',
          }}
        >
          {reaction}
        </div>
      )}

      <div className="min-h-screen pb-24" style={{ background: '#FFF7ED', color: '#1c1917' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#FFFBEB' }}>
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
            style={{ background: '#FEF3C7' }}
          >
            &#8592;
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-lg font-black" style={{ color: '#f59e0b' }}>
              {earnedStars}
            </span>
          </div>
        </div>

        {/* ── Video Player ───────────────────────────────────────── */}
        <div
          className="relative mx-4 mt-2 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            aspectRatio: '16/9',
            borderRadius: '20px',
          }}
        >
          {/* Thumbnail */}
          {data.video.thumbnailUrl && (
            <img
              src={data.video.thumbnailUrl}
              alt={data.video.titulo}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ borderRadius: '20px', opacity: isPlaying ? 0.4 : 0.8 }}
            />
          )}

          {/* Play/Pause only — BIG touch target */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-transform active:scale-90"
              style={{ background: '#f59e0b' }}
            >
              <span className="ml-1 text-3xl text-white">
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
          </div>

          {/* Progress */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '0 0 20px 20px' }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: '#f59e0b',
                borderRadius: '0 0 0 20px',
              }}
            />
          </div>

          {/* Time badge */}
          <div
            className="absolute bottom-3 right-3 rounded-xl px-3 py-1 text-sm font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            {fmtTime(progress)} / {data.video.duracaoFormatada}
          </div>
        </div>

        {/* ── Completed celebration ──────────────────────────────── */}
        {completed && (
          <div
            className="mx-4 mt-4 rounded-3xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #FEF3C7, #ECFDF5)',
              border: '3px solid #f59e0b',
            }}
          >
            <p className="text-4xl" style={{ animation: 'kidsBounce 0.6s ease infinite' }}>
              🎉
            </p>
            <p className="mt-2 text-xl font-black" style={{ color: '#92400e' }}>
              Parabens! Voce assistiu a aula!
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: '#f59e0b' }}>
              +5 estrelas ganhas!
            </p>
          </div>
        )}

        {/* ── Title ──────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <h1 className="text-xl font-black leading-tight" style={{ color: '#1c1917' }}>
            {data.video.titulo}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: '#f59e0b' }}
            >
              {data.professor.nome.charAt(0)}
            </div>
            <span className="text-sm font-bold" style={{ color: '#92400e' }}>
              {data.professor.nome}
            </span>
          </div>
        </div>

        {/* ── Reactions (instead of comments) ────────────────────── */}
        <div className="mt-4 px-4">
          <p className="text-sm font-bold" style={{ color: '#92400e' }}>
            O que achou?
          </p>
          <div className="mt-2 flex gap-3">
            {[
              { emoji: '😊', label: 'Gostei!' },
              { emoji: '👍', label: 'Legal!' },
              { emoji: '😕', label: 'Nao entendi' },
            ].map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReaction(r.emoji)}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-transform active:scale-95"
                style={{
                  background: '#FFFBEB',
                  border: '2px solid #FDE68A',
                }}
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="text-xs font-bold" style={{ color: '#92400e' }}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Star rating ────────────────────────────────────────── */}
        <div className="mt-4 px-4">
          <p className="text-sm font-bold" style={{ color: '#92400e' }}>
            De uma nota!
          </p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleRate(s)}
                className="text-4xl transition-transform active:scale-125"
                style={{
                  filter: s <= stars ? 'none' : 'grayscale(100%) opacity(0.3)',
                }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* ── Notes (simplified) ─────────────────────────────────── */}
        <div className="mt-4 px-4">
          <p className="text-sm font-bold" style={{ color: '#92400e' }}>
            O que voce aprendeu hoje?
          </p>
          <textarea
            value={notaText}
            onChange={(e) => setNotaText(e.target.value)}
            placeholder="Escreva aqui..."
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none"
            style={{
              background: '#FFFBEB',
              border: '2px solid #FDE68A',
              color: '#1c1917',
            }}
          />
          <button
            onClick={handleSaveNota}
            disabled={!notaText.trim()}
            className="mt-2 w-full rounded-2xl py-3 text-sm font-black text-white disabled:opacity-40"
            style={{ background: '#f59e0b' }}
          >
            {notaSalva ? '✅ Salvo!' : 'Salvar'}
          </button>
        </div>

        {/* ── Section tabs ───────────────────────────────────────── */}
        <div className="mt-6 flex gap-2 px-4">
          {([
            { key: 'video' as const, label: 'Aula', icon: '🎬' },
            { key: 'capitulos' as const, label: 'Partes', icon: '📑' },
            { key: 'mais' as const, label: 'Mais aulas', icon: '🎯' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-3 text-sm font-bold transition-colors"
              style={{
                background: activeSection === tab.key ? '#f59e0b' : '#FFFBEB',
                color: activeSection === tab.key ? 'white' : '#92400e',
                border: activeSection === tab.key ? 'none' : '2px solid #FDE68A',
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Section content ────────────────────────────────────── */}
        <div className="mt-4 px-4">

          {/* Description */}
          {activeSection === 'video' && (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>
                {data.video.descricao}
              </p>

              {/* Series info */}
              {data.serie && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}
                >
                  <p className="text-sm font-black" style={{ color: '#92400e' }}>
                    📺 {data.serie.nome}
                  </p>
                  <p className="mt-1 text-xs font-bold" style={{ color: '#d97706' }}>
                    Aula {data.serie.episodioAtual} de {data.serie.totalEpisodios}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {data.serie.episodioAnterior && (
                      <button
                        onClick={() => router.push(`/kids/conteudo/${data.serie!.episodioAnterior}`)}
                        className="flex-1 rounded-2xl py-2 text-sm font-bold text-white"
                        style={{ background: '#f59e0b' }}
                      >
                        &#8592; Anterior
                      </button>
                    )}
                    {data.serie.proximoEpisodio && (
                      <button
                        onClick={() => router.push(`/kids/conteudo/${data.serie!.proximoEpisodio}`)}
                        className="flex-1 rounded-2xl py-2 text-sm font-bold text-white"
                        style={{ background: '#22c55e' }}
                      >
                        Proxima &#8594;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {data.video.tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: FUN_COLORS[i % FUN_COLORS.length] }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          {activeSection === 'capitulos' && (
            <div className="space-y-2">
              {data.capitulos.map((ch, i) => {
                const isActive = progress >= ch.tempo
                  && (i === data.capitulos.length - 1 || progress < data.capitulos[i + 1].tempo);
                const color = FUN_COLORS[i % FUN_COLORS.length];
                return (
                  <button
                    key={`ch-${i}`}
                    onClick={() => setProgress(ch.tempo)}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:scale-[0.98]"
                    style={{
                      background: isActive ? color : '#FFFBEB',
                      border: isActive ? 'none' : '2px solid #FDE68A',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                      style={{ background: isActive ? 'rgba(255,255,255,0.3)' : color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-bold"
                        style={{ color: isActive ? 'white' : '#1c1917' }}
                      >
                        {ch.titulo}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#a8a29e' }}
                      >
                        {ch.tempoFormatado}
                      </p>
                    </div>
                    {progress >= ch.tempo && (
                      <span className="text-lg">✅</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Related videos */}
          {activeSection === 'mais' && (
            <div className="space-y-3">
              {data.videosRelacionados.map((rel, i) => {
                const color = FUN_COLORS[i % FUN_COLORS.length];
                return (
                  <button
                    key={rel.id}
                    onClick={() => router.push(`/kids/conteudo/${rel.id}`)}
                    className="flex w-full items-center gap-3 overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.98]"
                    style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}
                  >
                    <div
                      className="flex h-20 w-24 shrink-0 items-center justify-center text-3xl"
                      style={{ background: color }}
                    >
                      {rel.assistido ? '✅' : '▶️'}
                    </div>
                    <div className="flex-1 overflow-hidden py-2 pr-3">
                      <p className="truncate text-sm font-black" style={{ color: '#1c1917' }}>
                        {rel.titulo}
                      </p>
                      <p className="text-xs font-bold" style={{ color: '#a8a29e' }}>
                        {rel.professor}
                      </p>
                      <p className="text-xs" style={{ color: '#d97706' }}>
                        {rel.duracao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

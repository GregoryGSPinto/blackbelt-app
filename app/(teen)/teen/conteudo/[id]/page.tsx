'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import {
  getVideoExperience,
  curtirVideo,
  addComentario,
  addDuvida,
  addNota,
  editarNota,
  deletarNota,
  avaliarVideo,
  type VideoExperience,
  type Comentario,
  type Duvida,
} from '@/lib/api/video-experience.service';

// ── Helpers ──────────────────────────────────────────────────────────

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const BELT_COLORS: Record<string, string> = {
  white: '#e5e5e5', branca: '#e5e5e5', blue: '#3b82f6', azul: '#3b82f6',
  purple: '#8b5cf6', roxa: '#8b5cf6', brown: '#92400e', marrom: '#92400e',
  black: '#1c1917', preta: '#1c1917',
};

type TabKey = 'comentarios' | 'duvidas' | 'notas' | 'capitulos' | 'relacionados';
const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'comentarios', label: 'Chat', icon: '💬' },
  { key: 'duvidas', label: 'Q&A', icon: '❓' },
  { key: 'notas', label: 'Notas', icon: '📝' },
  { key: 'capitulos', label: 'Caps', icon: '📑' },
  { key: 'relacionados', label: 'Mais', icon: '🎬' },
];

// ── XP Toast ─────────────────────────────────────────────────────────

interface XpToastData { id: number; text: string; xp: number }
let toastCounter = 0;

function XpToast({ toast, onDone }: { toast: XpToastData; onDone: (id: number) => void }) {
  useEffect(() => { const t = setTimeout(() => onDone(toast.id), 2000); return () => clearTimeout(t); }, [toast.id, onDone]);
  return (
    <div className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2" style={{ animation: 'xpToastAnim 2s ease-out forwards', top: '30%' }}>
      <div className="rounded-2xl px-5 py-3 text-center font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', fontSize: '1.1rem' }}>
        <span>{toast.text}</span>
        <span className="ml-2 text-lg font-black text-yellow-300">+{toast.xp} XP</span>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────

export default function TeenVideoExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [data, setData] = useState<VideoExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('comentarios');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [toasts, setToasts] = useState<XpToastData[]>([]);
  const [commentText, setCommentText] = useState('');
  const [duvidaText, setDuvidaText] = useState('');
  const [notaText, setNotaText] = useState('');
  const [editingNota, setEditingNota] = useState<string | null>(null);
  const [editNotaText, setEditNotaText] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    trackFeatureUsage('content', 'view');
    getVideoExperience(videoId).then((d) => {
      if (!cancelled) { setData(d); setProgress(d.progresso.progressoSegundos); }
    }).catch((err) => {
      console.error('[TeenVideoExperiencePage]', err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [videoId]);

  useEffect(() => {
    if (isPlaying && data) {
      progressRef.current = setInterval(() => {
        setProgress((p) => { if (p >= data.video.duracaoSegundos) { setIsPlaying(false); return data.video.duracaoSegundos; } return p + 1; });
      }, 1000);
    } else if (progressRef.current) clearInterval(progressRef.current);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [isPlaying, data]);

  const addXp = useCallback((xp: number, text: string) => {
    setSessionXp((prev) => prev + xp);
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, text, xp }]);
  }, []);
  const removeToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const handleLike = useCallback(async () => {
    if (!data) return;
    const res = await curtirVideo(videoId);
    setData((d) => d ? { ...d, social: { ...d.social, curtidas: res.curtidas, curtidoPorMim: !d.social.curtidoPorMim } } : d);
    addXp(15, '❤️ Curtiu!');
  }, [data, videoId, addXp]);

  const handleComment = useCallback(async () => {
    if (!commentText.trim() || !data) return;
    const c = await addComentario(videoId, commentText);
    setData((d) => d ? { ...d, comentarios: [c, ...d.comentarios] } : d);
    setCommentText('');
    addXp(25, '💬 Comentario!');
  }, [commentText, data, videoId, addXp]);

  const handleDuvida = useCallback(async () => {
    if (!duvidaText.trim() || !data) return;
    const dv = await addDuvida(videoId, duvidaText, progress);
    setData((d) => d ? { ...d, duvidas: [dv, ...d.duvidas] } : d);
    setDuvidaText('');
    addXp(10, '❓ Duvida!');
  }, [duvidaText, data, videoId, progress, addXp]);

  const handleAddNota = useCallback(async () => {
    if (!notaText.trim() || !data) return;
    const n = await addNota(videoId, notaText, progress);
    setData((d) => d ? { ...d, notasPessoais: [...d.notasPessoais, n] } : d);
    setNotaText('');
  }, [notaText, data, videoId, progress]);

  const handleEditNota = useCallback(async (notaId: string) => {
    if (!editNotaText.trim()) return;
    const updated = await editarNota(notaId, editNotaText);
    setData((d) => d ? { ...d, notasPessoais: d.notasPessoais.map((n) => n.id === notaId ? updated : n) } : d);
    setEditingNota(null); setEditNotaText('');
  }, [editNotaText]);

  const handleDeleteNota = useCallback(async (notaId: string) => {
    await deletarNota(notaId);
    setData((d) => d ? { ...d, notasPessoais: d.notasPessoais.filter((n) => n.id !== notaId) } : d);
  }, []);

  const handleRate = useCallback(async (stars: number) => { setMyRating(stars); await avaliarVideo(videoId, stars); }, [videoId]);
  const handleQuizDone = useCallback(() => { setQuizDone(true); addXp(50, '🎯 Quiz!'); }, [addXp]);

  if (loading || !data) {
    return (<div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bb-depth-1)' }}><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>);
  }

  const v = data.video;
  const prof = data.professor;
  const soc = data.social;
  const progressPct = v.duracaoSegundos > 0 ? (progress / v.duracaoSegundos) * 100 : 0;

  return (
    <>
      <style>{`@keyframes xpToastAnim { 0% { opacity:0; transform:translate(-50%,20px) scale(0.8); } 15% { opacity:1; transform:translate(-50%,0) scale(1.05); } 25% { transform:translate(-50%,0) scale(1); } 75% { opacity:1; transform:translate(-50%,-10px); } 100% { opacity:0; transform:translate(-50%,-40px) scale(0.9); } }`}</style>
      {toasts.map((t) => <XpToast key={t.id} toast={t} onDone={removeToast} />)}

      <div className="min-h-screen pb-20" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}><span className="text-lg">&#8592;</span> Voltar</button>
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' }}>
            <span className="text-base">⚡</span><span>{sessionXp} XP</span>
          </div>
        </div>

        {/* Player */}
        <div className="relative" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', aspectRatio: '16/9' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl active:scale-90" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
              <span className="ml-1 text-2xl text-white">{isPlaying ? '⏸' : '▶'}</span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', transition: 'width 0.3s' }} />
          </div>
          <div className="absolute bottom-2 right-3 rounded-md px-2 py-0.5 text-xs font-mono text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>{fmtTime(progress)} / {fmtTime(v.duracaoSegundos)}</div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-around py-3" style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
          {[
            { onClick: handleLike, icon: soc.curtidoPorMim ? '❤️' : '🤍', label: String(soc.curtidas), color: soc.curtidoPorMim ? '#ef4444' : undefined },
            { onClick: () => setActiveTab('comentarios'), icon: '💬', label: String(data.comentarios.length) },
            { onClick: () => setActiveTab('duvidas'), icon: '❓', label: String(data.duvidas.length) },
            { onClick: () => setShowQuiz(true), icon: '🎯', label: data.quizCompletado ? 'DONE' : 'QUIZ', color: data.quizCompletado ? '#22c55e' : '#8b5cf6' },
            { onClick: () => document.getElementById('rating-section')?.scrollIntoView({ behavior: 'smooth' }), icon: '⭐', label: soc.mediaAvaliacao.toFixed(1) },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} className="flex flex-col items-center gap-0.5">
              <span className="text-xl">{btn.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: btn.color ?? 'var(--bb-ink-40)' }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="px-4 py-4" style={{ background: 'var(--bb-depth-2)' }}>
          <h1 className="text-lg font-bold leading-tight">{v.titulo}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            <span>{v.modalidade}</span><span>&#183;</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>{v.dificuldade}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>{prof.nome.charAt(0)}</div>
            <div>
              <p className="text-sm font-semibold">{prof.nome}</p>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-6 rounded-sm" style={{ background: BELT_COLORS[prof.faixa] ?? '#999' }} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{prof.graus}o grau &middot; {prof.totalVideos} videos</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {v.tags.map((tag) => (<span key={tag} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>#{tag}</span>))}
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>{v.descricao}</p>
          {data.serie && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Serie: {data.serie.nome}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>Episodio {data.serie.episodioAtual} de {data.serie.totalEpisodios}</p>
              <div className="mt-2 flex gap-2">
                {data.serie.episodioAnterior && <button onClick={() => router.push(`/teen/conteudo/${data.serie!.episodioAnterior}`)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>&#8592; Anterior</button>}
                {data.serie.proximoEpisodio && <button onClick={() => router.push(`/teen/conteudo/${data.serie!.proximoEpisodio}`)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>Proximo &#8594;</button>}
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div id="rating-section" className="mt-2 px-4 py-4" style={{ background: 'var(--bb-depth-2)' }}>
          <p className="text-sm font-bold">Avalie esta aula</p>
          <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => handleRate(s)} className="text-2xl active:scale-110">{s <= myRating ? '⭐' : '☆'}</button>)}</div>
          <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>Media: {soc.mediaAvaliacao.toFixed(1)} ({soc.totalAvaliacoes} avaliacoes)</p>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-0 z-10 mt-2 flex border-b" style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}>
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold" style={{ color: activeTab === tab.key ? '#8b5cf6' : 'var(--bb-ink-40)', borderBottom: activeTab === tab.key ? '2px solid #8b5cf6' : '2px solid transparent' }}>
              <span className="text-sm">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-4 py-4">
          {activeTab === 'comentarios' && (<div className="space-y-4">
            <div className="flex gap-2">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Deixe seu comentario..." rows={2} className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              <button onClick={handleComment} disabled={!commentText.trim()} className="self-end rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Enviar</button>
            </div>
            {data.comentarios.map((c) => <CommentCard key={c.id} comment={c} />)}
          </div>)}

          {activeTab === 'duvidas' && (<div className="space-y-4">
            <div className="flex gap-2">
              <textarea value={duvidaText} onChange={(e) => setDuvidaText(e.target.value)} placeholder="Tem alguma duvida?" rows={2} className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              <button onClick={handleDuvida} disabled={!duvidaText.trim()} className="self-end rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Perguntar</button>
            </div>
            {[...data.duvidas].sort((a, b) => b.votos - a.votos).map((d) => <DuvidaCard key={d.id} duvida={d} />)}
          </div>)}

          {activeTab === 'notas' && (<div className="space-y-4">
            <div className="flex gap-2">
              <textarea value={notaText} onChange={(e) => setNotaText(e.target.value)} placeholder="Anote algo importante..." rows={2} className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              <button onClick={handleAddNota} disabled={!notaText.trim()} className="self-end rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Salvar</button>
            </div>
            {data.notasPessoais.map((n) => (<div key={n.id} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}>
              {editingNota === n.id ? (<div className="space-y-2">
                <textarea value={editNotaText} onChange={(e) => setEditNotaText(e.target.value)} rows={2} className="w-full resize-none rounded-lg px-2 py-1 text-sm outline-none" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }} />
                <div className="flex gap-2"><button onClick={() => handleEditNota(n.id)} className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: '#8b5cf6' }}>Salvar</button><button onClick={() => setEditingNota(null)} className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Cancelar</button></div>
              </div>) : (<>
                <p className="text-sm">{n.texto}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{n.timestamp != null ? `[${fmtTime(n.timestamp)}]` : ''} {timeAgo(n.criadaEm)}</span>
                  <div className="flex gap-2"><button onClick={() => { setEditingNota(n.id); setEditNotaText(n.texto); }} className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Editar</button><button onClick={() => handleDeleteNota(n.id)} className="text-xs font-semibold" style={{ color: 'var(--bb-error)' }}>Excluir</button></div>
                </div>
              </>)}
            </div>))}
          </div>)}

          {activeTab === 'capitulos' && (<div className="space-y-2">
            {data.capitulos.map((ch, i) => {
              const isActive = progress >= ch.tempo && (i === data.capitulos.length - 1 || progress < data.capitulos[i + 1].tempo);
              return (<button key={i} onClick={() => setProgress(ch.tempo)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left" style={{ background: isActive ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.12))' : 'var(--bb-depth-4)', border: isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--bb-glass-border)' }}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: isActive ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'var(--bb-ink-20)' }}>{i + 1}</span>
                <div className="flex-1"><p className="text-sm font-semibold" style={{ color: isActive ? '#8b5cf6' : 'var(--bb-ink-100)' }}>{ch.titulo}</p><p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{ch.tempoFormatado}</p></div>
                {progress >= ch.tempo && <span className="text-sm">✅</span>}
              </button>);
            })}
          </div>)}

          {activeTab === 'relacionados' && (<div className="space-y-3">
            {data.videosRelacionados.map((rel) => (<button key={rel.id} onClick={() => router.push(`/teen/conteudo/${rel.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left" style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}>
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg text-xl" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>{rel.assistido ? '✅' : '▶️'}</div>
              <div className="flex-1 overflow-hidden"><p className="truncate text-sm font-semibold">{rel.titulo}</p><p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{rel.professor} &middot; {rel.duracao}</p></div>
            </button>))}
          </div>)}
        </div>

        {/* Quiz Modal */}
        {showQuiz && (<div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: 'var(--bb-depth-2)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">🎯 Quiz</h2><button onClick={() => { setShowQuiz(false); setQuizDone(false); }} className="text-xl" style={{ color: 'var(--bb-ink-40)' }}>&#10005;</button></div>
            {quizDone ? (<div className="space-y-4 text-center"><p className="text-5xl">🎉</p><p className="text-xl font-bold" style={{ color: '#22c55e' }}>Mandou bem! +50 XP ganhos!</p><button onClick={() => { setShowQuiz(false); setQuizDone(false); setQuizAnswers([]); }} className="rounded-xl px-6 py-2 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Fechar</button></div>)
            : (<div className="space-y-6">
              {['Qual o primeiro passo do toreando?', 'Onde fica o joelho?', 'Como finalizar no side?', 'Melhor contra DLR?'].map((q, qi) => (<div key={qi}><p className="text-sm font-semibold">{qi + 1}. {q}</p><div className="mt-2 space-y-1.5">{['Opcao A', 'Opcao B', 'Opcao C', 'Opcao D'].map((opt, oi) => (<button key={oi} onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }} className="w-full rounded-lg px-3 py-2 text-left text-sm" style={{ background: quizAnswers[qi] === oi ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))' : 'var(--bb-depth-4)', border: quizAnswers[qi] === oi ? '1px solid #8b5cf6' : '1px solid var(--bb-glass-border)' }}>{opt}</button>))}</div></div>))}
              <button onClick={handleQuizDone} disabled={quizAnswers.length < 4} className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Enviar Respostas (+50 XP)</button>
            </div>)}
          </div>
        </div>)}
      </div>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function CommentCard({ comment }: { comment: Comentario }) {
  return (
    <div className="rounded-xl p-3" style={{ background: comment.fixado ? 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.06))' : 'var(--bb-depth-4)', border: comment.fixado ? '1px solid rgba(139,92,246,0.2)' : '1px solid var(--bb-glass-border)' }}>
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: comment.ehProfessor ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : BELT_COLORS[comment.autorFaixa] ?? '#888' }}>{comment.autorNome.charAt(0)}</div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ color: comment.ehProfessor ? '#8b5cf6' : 'var(--bb-ink-100)' }}>{comment.autorNome}</span>
            {comment.ehProfessor && <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" style={{ background: '#8b5cf6' }}>Prof</span>}
            {comment.fixado && <span className="text-xs">📌</span>}
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(comment.criadoEm)}</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{comment.texto}</p>
          {comment.timestamp != null && <span className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-mono" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>[{fmtTime(comment.timestamp)}]</span>}
          <span className="mt-1.5 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>❤️ {comment.curtidas}</span>
        </div>
      </div>
      {comment.respostas.length > 0 && (<div className="ml-10 mt-2 space-y-2 border-l-2 pl-3" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>{comment.respostas.map((r) => <CommentCard key={r.id} comment={r} />)}</div>)}
    </div>
  );
}

function DuvidaCard({ duvida }: { duvida: Duvida }) {
  return (
    <div className="rounded-xl p-3" style={{ background: duvida.respondida ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(6,182,212,0.06))' : 'var(--bb-depth-4)', border: duvida.respondida ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--bb-glass-border)' }}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5"><button className="text-lg">▲</button><span className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{duvida.votos}</span></div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-6 rounded-sm" style={{ background: BELT_COLORS[duvida.alunoFaixa] ?? '#999' }} />
            <span className="text-sm font-semibold">{duvida.alunoNome}</span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(duvida.criadoEm)}</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{duvida.pergunta}</p>
          {duvida.timestamp != null && <span className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-mono" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>[{fmtTime(duvida.timestamp)}]</span>}
          {duvida.respondida && duvida.resposta && (<div className="mt-2 rounded-lg p-2" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}><p className="text-xs font-bold" style={{ color: '#22c55e' }}>✅ {duvida.resposta.professorNome}</p><p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{duvida.resposta.texto}</p></div>)}
        </div>
      </div>
    </div>
  );
}

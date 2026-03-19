'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getVideoExperience,
  curtirVideo,
  descurtirVideo,
  salvarVideo,
  removerSalvo,
  addComentario,
  curtirComentario,
  responderComentario,
  addDuvida,
  votarDuvida,
  addNota,
  editarNota,
  deletarNota,
  registrarProgresso,
} from '@/lib/api/video-experience.service';
import type {
  VideoExperience,
  Comentario,
  Duvida,
  NotaPessoal,
} from '@/lib/api/video-experience.service';

/* ════════════════════════════════════════════════════════════════ */
/*  Helpers                                                        */
/* ════════════════════════════════════════════════════════════════ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}m`;
}

const BELT_COLORS: Record<string, string> = {
  white: 'var(--bb-belt-white)',
  gray: 'var(--bb-belt-gray)',
  yellow: 'var(--bb-belt-yellow)',
  orange: 'var(--bb-belt-orange)',
  green: 'var(--bb-belt-green)',
  blue: 'var(--bb-belt-blue)',
  purple: 'var(--bb-belt-purple)',
  brown: 'var(--bb-belt-brown)',
  black: 'var(--bb-belt-black)',
};

const BELT_LABELS: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

type TabKey = 'sobre' | 'comentarios' | 'duvidas' | 'notas' | 'quiz';

/* ════════════════════════════════════════════════════════════════ */
/*  SVG Icons (inline, no external deps)                           */
/* ════════════════════════════════════════════════════════════════ */

function IconPlay({ size = 24 }: { size?: number }) {
  return (<svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>);
}
function IconPause({ size = 24 }: { size?: number }) {
  return (<svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>);
}
function IconSkipBack({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12.5 8L7 12l5.5 4V8z" /><path d="M19 8l-5.5 4L19 16V8z" /><line x1="5" y1="6" x2="5" y2="18" /></svg>);
}
function IconSkipForward({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11.5 16L17 12l-5.5-4v8z" /><path d="M5 16l5.5-4L5 8v8z" /><line x1="19" y1="6" x2="19" y2="18" /></svg>);
}
function IconFullscreen({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>);
}
function IconHeart({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  if (filled) return (<svg width={size} height={size} fill="var(--bb-brand)" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>);
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>);
}
function IconBookmark({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  if (filled) return (<svg width={size} height={size} fill="var(--bb-brand)" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>);
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>);
}
function IconMessage({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>);
}
function IconHelp({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
}
function IconStar({ size = 16, filled = false }: { size?: number; filled?: boolean }) {
  if (filled) return (<svg width={size} height={size} fill="#EAB308" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>);
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>);
}
function IconShare({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>);
}
function IconChevronLeft({ size = 20 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>);
}
function IconEdit({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
}
function IconTrash({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>);
}
function IconThumbUp({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>);
}
function IconPin({ size = 14 }: { size?: number }) {
  return (<svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>);
}
function IconCheck({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>);
}

/* ════════════════════════════════════════════════════════════════ */
/*  Small Reusable Pieces                                          */
/* ════════════════════════════════════════════════════════════════ */

function BeltBadge({ faixa, small = false }: { faixa: string; small?: boolean }) {
  const color = BELT_COLORS[faixa] ?? 'var(--bb-ink-40)';
  const label = BELT_LABELS[faixa] ?? faixa;
  const isDark = faixa !== 'white' && faixa !== 'yellow';
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${small ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}
      style={{ backgroundColor: color, color: isDark ? '#fff' : '#1a1a1a' }}
    >
      {label}
    </span>
  );
}

function Avatar({ nome, size = 32, faixa }: { nome: string; size?: number; faixa?: string }) {
  const initials = nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const borderColor = faixa ? BELT_COLORS[faixa] ?? 'var(--bb-ink-20)' : 'var(--bb-ink-20)';
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)',
        border: `2px solid ${borderColor}`,
      }}
    >
      {initials}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Loading Skeleton                                               */
/* ════════════════════════════════════════════════════════════════ */

function PageSkeleton() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      <Skeleton variant="card" className="w-full aspect-video rounded-none" />
      <div className="flex gap-4 px-4 py-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="circle" className="h-10 w-10" />
        ))}
      </div>
      <div className="px-4 space-y-2">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-5 w-16 rounded-full" />
          <Skeleton variant="text" className="h-5 w-20 rounded-full" />
          <Skeleton variant="text" className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton variant="text" className="h-4 w-48" />
      </div>
      <div className="mx-4 mt-4">
        <Skeleton variant="card" className="h-20" />
      </div>
      <div className="flex gap-2 px-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <div className="flex gap-1 px-4 mt-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" className="h-9 flex-1" />
        ))}
      </div>
      <div className="px-4 mt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE COMPONENT                                            */
/* ════════════════════════════════════════════════════════════════ */

export default function VideoExperiencePage() {
  const params = useParams();
  const videoId = params.id as string;

  /* ── State ─────────────────────────────────────────────────── */
  const [data, setData] = useState<VideoExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('sobre');

  // Video player
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Social
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [notas, setNotas] = useState<NotaPessoal[]>([]);
  const [commentSort, setCommentSort] = useState<'relevantes' | 'recentes'>('relevantes');

  // Inputs
  const [commentText, setCommentText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);

  /* ── Load data ─────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    getVideoExperience(videoId)
      .then((result) => {
        setData(result);
        setLiked(result.social.curtidoPorMim);
        setLikeCount(result.social.curtidas);
        setSaved(result.social.salvoPorMim);
        setComentarios(result.comentarios);
        setDuvidas(result.duvidas);
        setNotas(result.notasPessoais);
        setCurrentTime(result.progresso.progressoSegundos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  /* ── Video player logic ────────────────────────────────────── */
  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleVideoTap = useCallback(() => {
    setShowControls(true);
    hideControlsAfterDelay();
  }, [hideControlsAfterDelay]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
      hideControlsAfterDelay();
    } else {
      v.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }, [hideControlsAfterDelay]);

  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pct * duration);
  }, [duration, seekTo]);

  const handleProgressTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const touch = e.touches[0];
    const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    seekTo(pct * duration);
  }, [duration, seekTo]);

  const changeSpeed = useCallback((speed: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      v.requestFullscreen?.();
    }
  }, []);

  // Save progress every 10 seconds
  useEffect(() => {
    if (!data?.video.videoUrl) return;
    progressTimerRef.current = setInterval(() => {
      const v = videoRef.current;
      if (v && !v.paused) {
        registrarProgresso(videoId, Math.floor(v.currentTime));
      }
    }, 10000);
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [videoId, data?.video.videoUrl]);

  // Track current time
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => { if (!isSeeking) setCurrentTime(v.currentTime); };
    const onMeta = () => setDuration(v.duration);
    const onEnded = () => { setIsPlaying(false); setShowControls(true); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('ended', onEnded);
    };
  }, [isSeeking, data?.video.videoUrl]);

  /* ── Active chapter ────────────────────────────────────────── */
  const activeChapter = useMemo(() => {
    if (!data) return null;
    const chapters = data.capitulos;
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].tempo) return chapters[i];
    }
    return chapters[0] ?? null;
  }, [data, currentTime]);

  /* ── Social actions ────────────────────────────────────────── */
  const handleLike = useCallback(async () => {
    if (!data) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) { await descurtirVideo(videoId); }
      else { await curtirVideo(videoId); }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }, [data, liked, videoId]);

  const handleSave = useCallback(async () => {
    if (!data) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      if (wasSaved) { await removerSalvo(videoId); }
      else { await salvarVideo(videoId); }
    } catch { setSaved(wasSaved); }
  }, [data, saved, videoId]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;
    const ts = videoRef.current ? Math.floor(videoRef.current.currentTime) : undefined;
    try {
      const c = await addComentario(videoId, commentText.trim(), ts);
      setComentarios((prev) => [c, ...prev]);
      setCommentText('');
    } catch { /* ignore */ }
  }, [commentText, videoId]);

  const handleLikeComment = useCallback(async (comentarioId: string) => {
    setComentarios((prev) =>
      prev.map((c) =>
        c.id === comentarioId
          ? { ...c, curtidoPorMim: !c.curtidoPorMim, curtidas: c.curtidoPorMim ? c.curtidas - 1 : c.curtidas + 1 }
          : { ...c, respostas: c.respostas.map((r) => (r.id === comentarioId ? { ...r, curtidoPorMim: !r.curtidoPorMim, curtidas: r.curtidoPorMim ? r.curtidas - 1 : r.curtidas + 1 } : r)) },
      ),
    );
    try { await curtirComentario(comentarioId); } catch { /* ignore */ }
  }, []);

  const handleReply = useCallback(async (comentarioId: string) => {
    if (!replyText.trim()) return;
    try {
      const r = await responderComentario(comentarioId, replyText.trim());
      setComentarios((prev) =>
        prev.map((c) => (c.id === comentarioId ? { ...c, respostas: [...c.respostas, r] } : c)),
      );
      setReplyingTo(null);
      setReplyText('');
    } catch { /* ignore */ }
  }, [replyText]);

  const handleAddQuestion = useCallback(async () => {
    if (!questionText.trim()) return;
    const ts = videoRef.current ? Math.floor(videoRef.current.currentTime) : undefined;
    try {
      const d = await addDuvida(videoId, questionText.trim(), ts);
      setDuvidas((prev) => [d, ...prev]);
      setQuestionText('');
    } catch { /* ignore */ }
  }, [questionText, videoId]);

  const handleVoteQuestion = useCallback(async (duvidaId: string) => {
    setDuvidas((prev) =>
      prev.map((d) =>
        d.id === duvidaId
          ? { ...d, votadoPorMim: !d.votadoPorMim, votos: d.votadoPorMim ? d.votos - 1 : d.votos + 1 }
          : d,
      ),
    );
    try { await votarDuvida(duvidaId); } catch { /* ignore */ }
  }, []);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    const ts = noteTimestamp && videoRef.current ? Math.floor(videoRef.current.currentTime) : undefined;
    try {
      const n = await addNota(videoId, noteText.trim(), ts);
      setNotas((prev) => [n, ...prev]);
      setNoteText('');
      setNoteTimestamp(false);
    } catch { /* ignore */ }
  }, [noteText, noteTimestamp, videoId]);

  const handleEditNote = useCallback(async (notaId: string) => {
    if (!editingNoteText.trim()) return;
    try {
      const n = await editarNota(notaId, editingNoteText.trim());
      setNotas((prev) => prev.map((note) => (note.id === notaId ? n : note)));
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch { /* ignore */ }
  }, [editingNoteText]);

  const handleDeleteNote = useCallback(async (notaId: string) => {
    setNotas((prev) => prev.filter((n) => n.id !== notaId));
    try { await deletarNota(notaId); } catch { /* ignore */ }
  }, []);

  const scrollToTabs = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  /* ── Parse clickable timestamps [MM:SS] in text ────────────── */
  const renderTextWithTimestamps = useCallback((text: string) => {
    const regex = /\[(\d{1,2}:\d{2})\]/g;
    const parts: (string | { time: string; seconds: number })[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      const [m, s] = match[1].split(':').map(Number);
      parts.push({ time: match[1], seconds: m * 60 + s });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.map((p, i) => {
      if (typeof p === 'string') return <span key={i}>{p}</span>;
      return (
        <button key={i} onClick={() => seekTo(p.seconds)} className="font-semibold px-1 rounded" style={{ color: 'var(--bb-brand)', backgroundColor: 'var(--bb-brand-surface)' }}>
          {p.time}
        </button>
      );
    });
  }, [seekTo]);

  /* ── Sorted comments ───────────────────────────────────────── */
  const sortedComments = useMemo(() => {
    const pinned = comentarios.filter((c) => c.fixado);
    const rest = comentarios.filter((c) => !c.fixado);
    const sorted = commentSort === 'relevantes'
      ? rest.sort((a, b) => b.curtidas - a.curtidas)
      : rest.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    return [...pinned, ...sorted];
  }, [comentarios, commentSort]);

  /* ── Sorted questions ──────────────────────────────────────── */
  const sortedQuestions = useMemo(() => {
    const answered = duvidas.filter((d) => d.respondida).sort((a, b) => b.votos - a.votos);
    const unanswered = duvidas.filter((d) => !d.respondida).sort((a, b) => b.votos - a.votos);
    return [...answered, ...unanswered];
  }, [duvidas]);

  /* ── Effective duration ────────────────────────────────────── */
  const effectiveDuration = duration || data?.video.duracaoSegundos || 0;
  const progressPct = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  /* ── Render ────────────────────────────────────────────────── */
  if (loading) return <PageSkeleton />;
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Video nao encontrado</p>
        <Link href="/dashboard/conteudo" className="mt-4 text-sm font-semibold" style={{ color: 'var(--bb-brand)' }}>Voltar para a Biblioteca</Link>
      </div>
    );
  }

  const vid = data.video;
  const prof = data.professor;
  const serie = data.serie;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bb-depth-1)' }}>

      {/* ── BACK BUTTON ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center px-2 py-2 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bb-depth-1) 85%, transparent)' }}>
        <Link href="/dashboard/conteudo" className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--bb-ink-80)' }}>
          <IconChevronLeft size={20} />
          <span className="text-sm font-medium">Biblioteca</span>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  1. VIDEO PLAYER                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <div className="relative w-full aspect-video" style={{ backgroundColor: '#000' }}>
        {vid.videoUrl ? (
          <>
            <video ref={videoRef} src={vid.videoUrl} className="w-full h-full object-contain" playsInline preload="metadata" onClick={handleVideoTap} />

            {/* Controls overlay */}
            <div
              className="absolute inset-0 flex flex-col justify-between transition-opacity duration-300"
              style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
              onClick={handleVideoTap}
            >
              {/* Center controls */}
              <div className="flex-1 flex items-center justify-center gap-8">
                <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                  <IconSkipBack size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center text-white shadow-lg">
                  {isPlaying ? <IconPause size={32} /> : <IconPlay size={32} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                  <IconSkipForward size={20} />
                </button>
              </div>

              {/* Bottom control bar */}
              <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
                <div ref={progressBarRef} className="relative w-full h-6 flex items-center cursor-pointer group" onClick={handleProgressClick} onTouchMove={handleProgressTouch} onTouchStart={() => setIsSeeking(true)} onTouchEnd={() => setIsSeeking(false)}>
                  <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/30 transition-all relative">
                    {/* Chapter markers */}
                    {data.capitulos.map((ch, idx) => {
                      const pct = effectiveDuration > 0 ? (ch.tempo / effectiveDuration) * 100 : 0;
                      return <div key={idx} className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/70" style={{ left: `${pct}%` }} title={ch.titulo} />;
                    })}
                    <div className="h-full rounded-full absolute top-0 left-0" style={{ width: `${progressPct}%`, backgroundColor: 'var(--bb-brand)' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progressPct}%`, backgroundColor: 'var(--bb-brand)', transform: 'translate(-50%, -50%)' }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[11px] text-white/80 font-mono">{formatTime(currentTime)} / {formatTime(effectiveDuration)}</span>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-[11px] text-white/80 font-semibold px-2 py-0.5 rounded bg-white/10">{playbackSpeed}x</button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                          {SPEED_OPTIONS.map((s) => (
                            <button key={s} onClick={() => changeSpeed(s)} className="block w-full text-left text-xs px-4 py-2 transition-colors" style={{ color: s === playbackSpeed ? 'var(--bb-brand)' : 'var(--bb-ink-80)', backgroundColor: s === playbackSpeed ? 'var(--bb-brand-surface)' : 'transparent' }}>
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={toggleFullscreen} className="text-white/80"><IconFullscreen size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No video URL */
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: vid.thumbnailUrl ? `url(${vid.thumbnailUrl}) center/cover` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 text-center">
              <div className="text-5xl mb-3 opacity-40">&#127909;</div>
              <p className="text-white/90 font-bold text-lg">Video em breve</p>
              {data.progresso.progressoSegundos > 0 && (
                <button className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: 'var(--bb-brand)' }} onClick={() => seekTo(data.progresso.progressoSegundos)}>
                  Continuar de {formatTime(data.progresso.progressoSegundos)}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Continue watching button */}
        {vid.videoUrl && data.progresso.progressoSegundos > 0 && currentTime < 5 && !isPlaying && (
          <button className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg" style={{ backgroundColor: 'var(--bb-brand)' }} onClick={() => { seekTo(data.progresso.progressoSegundos); togglePlay(); }}>
            Continuar de {formatTime(data.progresso.progressoSegundos)}
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  2. ACTION BAR                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <div className="flex items-center gap-1 px-3 py-2.5 overflow-x-auto" style={{ borderBottom: '1px solid var(--bb-glass-border)', scrollbarWidth: 'none' }}>
        <button onClick={handleLike} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors flex-shrink-0" style={{ backgroundColor: liked ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)', color: liked ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
          <IconHeart size={18} filled={liked} />{likeCount}
        </button>
        <button onClick={() => scrollToTabs('comentarios')} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
          <IconMessage size={18} />{comentarios.reduce((sum, c) => sum + 1 + c.respostas.length, 0)}
        </button>
        <button onClick={() => scrollToTabs('duvidas')} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
          <IconHelp size={18} />{duvidas.length}
        </button>
        <div className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
          <IconStar size={16} filled />{data.social.mediaAvaliacao.toFixed(1)}
        </div>
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors flex-shrink-0" style={{ backgroundColor: saved ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)', color: saved ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
          <IconBookmark size={18} filled={saved} />{saved ? 'Salvo' : 'Salvar'}
        </button>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--bb-depth-3)', color: copiedLink ? 'var(--bb-success)' : 'var(--bb-ink-60)' }}>
          <IconShare size={18} />{copiedLink ? 'Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  3. VIDEO INFO                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <div className="px-4 pt-4">
        <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--bb-ink-100)' }}>{vid.titulo}</h1>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>{vid.modalidade}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>{vid.dificuldade}</span>
          <BeltBadge faixa={vid.faixa} small />
        </div>

        {/* Meta */}
        <p className="text-[11px] mt-2" style={{ color: 'var(--bb-ink-40)' }}>
          {formatDate(vid.publicadoEm)} &middot; {(data.analytics?.visualizacoesTotal ?? 0).toLocaleString('pt-BR')} visualizacoes &middot; {vid.duracaoFormatada}
        </p>

        {/* Professor card */}
        <div className="flex items-start gap-3 mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
          <Avatar nome={prof.nome} size={44} faixa={prof.faixa} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold truncate" style={{ color: 'var(--bb-ink-100)' }}>{prof.nome}</span>
              <BeltBadge faixa={prof.faixa} small />
              {prof.graus > 0 && <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>{prof.graus}o grau</span>}
            </div>
            <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--bb-ink-60)' }}>{prof.bio}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--bb-ink-40)' }}>{prof.totalVideos} videos &middot; {prof.totalAlunos.toLocaleString('pt-BR')} alunos</p>
          </div>
        </div>

        {/* Series info */}
        {serie && (
          <div className="flex items-center justify-between mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bb-brand-surface)', border: '1px solid var(--bb-brand)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>Serie</p>
              <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {serie.nome} &middot; Episodio {serie.episodioAtual}/{serie.totalEpisodios}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {serie.episodioAnterior && (
                <Link href={`/dashboard/conteudo/${serie.episodioAnterior}`} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
                  <IconChevronLeft size={16} />
                </Link>
              )}
              {serie.proximoEpisodio && (
                <Link href={`/dashboard/conteudo/${serie.proximoEpisodio}`} className="w-8 h-8 rounded-full flex items-center justify-center rotate-180" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
                  <IconChevronLeft size={16} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  4. CHAPTERS                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {data.capitulos.length > 0 && (
        <div className="mt-4">
          <p className="px-4 text-xs font-semibold mb-2" style={{ color: 'var(--bb-ink-60)' }}>Capitulos</p>
          <div className="flex gap-2 px-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {data.capitulos.map((ch, idx) => {
              const isActive = activeChapter?.titulo === ch.titulo && activeChapter?.tempo === ch.tempo;
              return (
                <button key={idx} onClick={() => seekTo(ch.tempo)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors" style={{ backgroundColor: isActive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)', color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)', border: isActive ? '1px solid var(--bb-brand)' : '1px solid transparent' }}>
                  <span className="font-mono text-[10px]">{ch.tempoFormatado}</span>
                  {ch.titulo}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  5. TABS                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <div ref={tabsRef} className="mt-6">
        <div className="flex mx-4 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bb-depth-3)' }}>
          {([
            { key: 'sobre' as TabKey, label: 'Sobre' },
            { key: 'comentarios' as TabKey, label: 'Chat' },
            { key: 'duvidas' as TabKey, label: 'Duvidas' },
            { key: 'notas' as TabKey, label: 'Notas' },
            { key: 'quiz' as TabKey, label: 'Quiz' },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex-1 py-2.5 text-[11px] font-semibold transition-colors" style={{ backgroundColor: activeTab === tab.key ? 'var(--bb-brand)' : 'transparent', color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-4 mt-4">

          {/* ── Tab: Sobre ──────────────────────────────────────── */}
          {activeTab === 'sobre' && (
            <div className="space-y-5">
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--bb-ink-80)' }}>{vid.descricaoCompleta || vid.descricao}</p>

              {vid.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {vid.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors" style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {data.tecnicasRelacionadas.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--bb-ink-100)' }}>Tecnicas Relacionadas</h3>
                  <div className="space-y-2">
                    {data.tecnicasRelacionadas.map((tec) => (
                      <div key={tec.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                        <div className="flex items-center gap-2">
                          <BeltBadge faixa={tec.faixa} small />
                          <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>{tec.nome}</span>
                        </div>
                        {tec.temVideo && tec.videoId && (
                          <Link href={`/dashboard/conteudo/${tec.videoId}`} className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
                            Ver video
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Comentarios ────────────────────────────────── */}
          {activeTab === 'comentarios' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Deixe um comentario..." className="flex-1 text-xs px-3 py-2.5 rounded-xl outline-none" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-40" style={{ backgroundColor: 'var(--bb-brand)' }}>Enviar</button>
              </div>

              <div className="flex gap-2">
                {(['relevantes', 'recentes'] as const).map((opt) => (
                  <button key={opt} onClick={() => setCommentSort(opt)} className="text-[10px] font-semibold px-3 py-1 rounded-full transition-colors" style={{ backgroundColor: commentSort === opt ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)', color: commentSort === opt ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>

              {sortedComments.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--bb-ink-40)' }}>Nenhum comentario ainda. Seja o primeiro!</p>
              ) : (
                sortedComments.map((c) => (
                  <div key={c.id}>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bb-depth-3)', borderLeft: c.ehProfessor ? '3px solid var(--bb-brand)' : 'none', border: c.ehProfessor ? undefined : '1px solid var(--bb-glass-border)' }}>
                      <div className="flex items-start gap-2.5">
                        <Avatar nome={c.autorNome} size={28} faixa={c.autorFaixa} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>{c.autorNome}</span>
                            <BeltBadge faixa={c.autorFaixa} small />
                            {c.ehProfessor && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bb-brand)', color: '#fff' }}>Professor</span>}
                            {c.fixado && <span style={{ color: 'var(--bb-ink-40)' }}><IconPin size={12} /></span>}
                            <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(c.criadoEm)}</span>
                          </div>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{renderTextWithTimestamps(c.texto)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => handleLikeComment(c.id)} className="flex items-center gap-1 text-[10px] font-medium" style={{ color: c.curtidoPorMim ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                              <IconThumbUp size={13} />{c.curtidas}
                            </button>
                            <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }} className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>

                      {replyingTo === c.id && (
                        <div className="flex gap-2 mt-3 ml-10">
                          <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Sua resposta..." className="flex-1 text-[11px] px-2.5 py-2 rounded-lg outline-none" style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} onKeyDown={(e) => e.key === 'Enter' && handleReply(c.id)} autoFocus />
                          <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()} className="text-[11px] font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-40" style={{ backgroundColor: 'var(--bb-brand)' }}>Enviar</button>
                        </div>
                      )}
                    </div>

                    {c.respostas.length > 0 && (
                      <div className="ml-8 mt-1.5 space-y-1.5">
                        {c.respostas.map((r) => (
                          <div key={r.id} className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bb-depth-3)', borderLeft: r.ehProfessor ? '3px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)' }}>
                            <div className="flex items-start gap-2">
                              <Avatar nome={r.autorNome} size={22} faixa={r.autorFaixa} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-bold" style={{ color: 'var(--bb-ink-100)' }}>{r.autorNome}</span>
                                  <BeltBadge faixa={r.autorFaixa} small />
                                  {r.ehProfessor && <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bb-brand)', color: '#fff' }}>Professor</span>}
                                  <span className="text-[9px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(r.criadoEm)}</span>
                                </div>
                                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{renderTextWithTimestamps(r.texto)}</p>
                                <button onClick={() => handleLikeComment(r.id)} className="flex items-center gap-1 text-[10px] font-medium mt-1" style={{ color: r.curtidoPorMim ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                                  <IconThumbUp size={12} />{r.curtidas}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Duvidas ────────────────────────────────────── */}
          {activeTab === 'duvidas' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Faca uma pergunta..." className="flex-1 text-xs px-3 py-2.5 rounded-xl outline-none" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()} />
                <button onClick={handleAddQuestion} disabled={!questionText.trim()} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-40" style={{ backgroundColor: 'var(--bb-brand)' }}>Enviar</button>
              </div>

              {sortedQuestions.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma duvida ainda. Pergunte ao professor!</p>
              ) : (
                sortedQuestions.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl space-y-2" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                    <div className="flex items-start gap-2.5">
                      <Avatar nome={d.alunoNome} size={28} faixa={d.alunoFaixa} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-100)' }}>{d.alunoNome}</span>
                          <BeltBadge faixa={d.alunoFaixa} small />
                          <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{timeAgo(d.criadoEm)}</span>
                        </div>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{renderTextWithTimestamps(d.pergunta)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-10">
                      <button onClick={() => handleVoteQuestion(d.id)} className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors" style={{ backgroundColor: d.votadoPorMim ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)', color: d.votadoPorMim ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                        <IconThumbUp size={12} />{d.votos} &middot; Tambem tenho essa duvida
                      </button>
                    </div>

                    {d.respondida && d.resposta && (
                      <div className="ml-8 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bb-brand-surface)', borderLeft: '3px solid var(--bb-brand)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bb-brand)', color: '#fff' }}>Professor</span>
                          <span className="text-[11px] font-bold" style={{ color: 'var(--bb-ink-100)' }}>{d.resposta.professorNome}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{renderTextWithTimestamps(d.resposta.texto)}</p>
                      </div>
                    )}

                    {!d.respondida && (
                      <p className="text-[10px] ml-10 font-medium" style={{ color: 'var(--bb-ink-40)' }}>Aguardando resposta do professor...</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Notas ──────────────────────────────────────── */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Anote algo sobre esta aula..." rows={3} className="w-full text-xs px-3 py-2.5 rounded-xl outline-none resize-none" style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={noteTimestamp} onChange={(e) => setNoteTimestamp(e.target.checked)} className="w-4 h-4 rounded accent-[var(--bb-brand)]" />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--bb-ink-60)' }}>Marcar timestamp atual ({formatTime(currentTime)})</span>
                  </label>
                  <button onClick={handleAddNote} disabled={!noteText.trim()} className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-40" style={{ backgroundColor: 'var(--bb-brand)' }}>Salvar nota</button>
                </div>
              </div>

              {notas.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma nota pessoal ainda.</p>
              ) : (
                notas.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                    {editingNoteId === n.id ? (
                      <div className="space-y-2">
                        <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} rows={3} className="w-full text-xs px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} autoFocus />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingNoteId(null); setEditingNoteText(''); }} className="text-[11px] font-medium px-3 py-1.5 rounded-lg" style={{ color: 'var(--bb-ink-60)' }}>Cancelar</button>
                          <button onClick={() => handleEditNote(n.id)} disabled={!editingNoteText.trim()} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40" style={{ backgroundColor: 'var(--bb-brand)' }}>Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {n.timestamp != null && (
                            <button onClick={() => seekTo(n.timestamp!)} className="text-[10px] font-semibold px-1.5 py-0.5 rounded mb-1 inline-block" style={{ backgroundColor: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
                              {formatTime(n.timestamp)}
                            </button>
                          )}
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>{n.texto}</p>
                          <p className="text-[9px] mt-1.5" style={{ color: 'var(--bb-ink-40)' }}>{formatDate(n.criadaEm)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => { setEditingNoteId(n.id); setEditingNoteText(n.texto); }} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--bb-ink-40)' }}><IconEdit size={14} /></button>
                          <button onClick={() => handleDeleteNote(n.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--bb-error)' }}><IconTrash size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Quiz ───────────────────────────────────────── */}
          {activeTab === 'quiz' && (
            <div className="flex flex-col items-center justify-center py-10">
              {data.temQuiz ? (
                data.quizCompletado ? (
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--bb-success-surface)' }}>
                      <IconCheck size={36} />
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Quiz concluido!</p>
                    <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      Sua nota: <span className="font-bold" style={{ color: 'var(--bb-success)' }}>{data.quizNota ?? 0}%</span>
                    </p>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white mt-2" style={{ backgroundColor: 'var(--bb-brand)' }}>Refazer quiz</button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--bb-brand-surface)' }}>
                      <svg width={36} height={36} fill="none" stroke="var(--bb-brand)" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Teste seus conhecimentos</p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--bb-ink-60)' }}>Responda o quiz para ganhar XP e validar o que aprendeu nesta aula.</p>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white mt-2" style={{ backgroundColor: 'var(--bb-brand)' }}>Comecar quiz</button>
                  </div>
                )
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-40)' }}>Sem quiz para este video</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>O professor ainda nao criou um quiz para esta aula.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  6. RELATED VIDEOS                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {data.videosRelacionados.length > 0 && (
        <div className="mt-8">
          <h2 className="px-4 text-sm font-bold mb-3" style={{ color: 'var(--bb-ink-100)' }}>Videos Relacionados</h2>

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-3 px-4 overflow-x-auto pb-4 lg:hidden" style={{ scrollbarWidth: 'none' }}>
            {data.videosRelacionados.map((v) => (
              <Link key={v.id} href={`/dashboard/conteudo/${v.id}`} className="flex-shrink-0 group" style={{ width: 'clamp(160px, 30vw, 220px)' }}>
                <div className="relative rounded-xl overflow-hidden">
                  <div className="aspect-video w-full flex items-center justify-center" style={{ background: v.thumbnail ? `url(${v.thumbnail}) center/cover` : 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }}>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconPlay size={18} />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">{v.duracao}</span>
                    {v.assistido && <span className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bb-success)', color: '#fff' }}>Assistido</span>}
                  </div>
                </div>
                <p className="text-[11px] font-semibold mt-1.5 truncate" style={{ color: 'var(--bb-ink-100)' }}>{v.titulo}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--bb-ink-40)' }}>{v.professor}</p>
              </Link>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 px-4 pb-4">
            {data.videosRelacionados.map((v) => (
              <Link key={v.id} href={`/dashboard/conteudo/${v.id}`} className="flex gap-3 p-2 rounded-xl group transition-colors" style={{ backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: v.thumbnail ? `url(${v.thumbnail}) center/cover` : 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }}>
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-medium">{v.duracao}</span>
                  {v.assistido && <span className="absolute top-1 right-1 text-[7px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bb-success)', color: '#fff' }}>Visto</span>}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--bb-ink-100)' }}>{v.titulo}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>{v.professor}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

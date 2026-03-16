'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getSeriesDetail,
  trackProgress,
  completeEpisode,
  submitQuiz,
} from '@/lib/api/streaming.service';
import type {
  SeriesDetail,
  QuizQuestion,
  QuizResult,
} from '@/lib/types/streaming';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SeriesPlayerPage() {
  const params = useParams();
  const { toast } = useToast();

  const [detail, setDetail] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [episodeCompleted, setEpisodeCompleted] = useState(false);
  const [showTrailComplete, setShowTrailComplete] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentEpisode = detail?.series.videos.find(
    (v) => v.id === currentEpisodeId
  );

  const currentQuestions =
    detail?.quiz_questions?.[currentEpisodeId] ?? [];

  const currentQuestion: QuizQuestion | undefined =
    currentQuestions[quizStep];

  // ---------- Load series detail ----------
  useEffect(() => {
    const seriesId = params.id as string;
    getSeriesDetail(seriesId)
      .then((d) => {
        setDetail(d);
        const firstIncomplete = d.series.videos.find((v) => {
          const prog = d.progress.find((p) => p.video_id === v.id);
          return !prog || !prog.completed;
        });
        setCurrentEpisodeId(
          firstIncomplete?.id ?? d.series.videos[0]?.id ?? ''
        );
      })
      .catch(() => toast('Erro ao carregar série', 'error'))
      .finally(() => setLoading(false));
  }, [params.id]);

  // ---------- Simulated playback ----------
  useEffect(() => {
    if (!isPlaying || !currentEpisode) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + playbackSpeed;
        if (
          next >= currentEpisode.duration_seconds * 0.9 &&
          !episodeCompleted
        ) {
          setEpisodeCompleted(true);
          setIsPlaying(false);

          completeEpisode('stu-1', currentEpisodeId).catch(() => {});

          const questions = detail?.quiz_questions?.[currentEpisodeId];
          if (questions && questions.length > 0) {
            setShowQuiz(true);
            setQuizStep(0);
            setSelectedAnswers([]);
            setQuizResult(null);
          } else {
            checkTrailCompletion();
          }
        }
        return Math.min(next, currentEpisode.duration_seconds);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentEpisodeId, episodeCompleted]);

  // ---------- Track progress periodically ----------
  useEffect(() => {
    if (!isPlaying || !currentEpisode) return;

    const tracker = setInterval(() => {
      trackProgress('stu-1', currentEpisodeId, currentTime).catch(
        () => {}
      );
    }, 10000);

    return () => clearInterval(tracker);
  }, [isPlaying, currentEpisodeId, currentTime]);

  // ---------- Quiz handlers ----------
  function handleQuizAnswer(optionIndex: number) {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[quizStep] = optionIndex;
      return next;
    });
  }

  async function handleQuizSubmit() {
    if (selectedAnswers[quizStep] === undefined) return;

    if (quizStep < currentQuestions.length - 1) {
      setQuizStep((prev) => prev + 1);
      return;
    }

    try {
      const result = await submitQuiz(
        'stu-1',
        currentEpisodeId,
        selectedAnswers
      );
      setQuizResult(result);
    } catch {
      toast('Erro ao enviar quiz', 'error');
    }
  }

  function handleNextEpisode() {
    if (!detail) return;
    const videos = detail.series.videos;
    const idx = videos.findIndex((v) => v.id === currentEpisodeId);
    if (idx < videos.length - 1) {
      switchEpisode(videos[idx + 1].id);
    } else {
      setShowTrailComplete(true);
    }
    setShowQuiz(false);
    setQuizResult(null);
  }

  function checkTrailCompletion() {
    if (!detail) return;
    const videos = detail.series.videos;
    const idx = videos.findIndex((v) => v.id === currentEpisodeId);
    if (idx === videos.length - 1) {
      setShowTrailComplete(true);
    }
  }

  function switchEpisode(episodeId: string) {
    setCurrentEpisodeId(episodeId);
    setCurrentTime(0);
    setIsPlaying(false);
    setEpisodeCompleted(false);
    setShowQuiz(false);
    setQuizStep(0);
    setSelectedAnswers([]);
    setQuizResult(null);
  }

  function handleProgressBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressBarRef.current || !currentEpisode) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * currentEpisode.duration_seconds;
    setCurrentTime(Math.max(0, Math.min(newTime, currentEpisode.duration_seconds)));
  }

  function isEpisodeCompleted(videoId: string): boolean {
    if (!detail) return false;
    const prog = detail.progress.find((p) => p.video_id === videoId);
    return prog?.completed ?? false;
  }

  const speeds = [0.5, 1, 1.5, 2];

  // ---------- Loading skeleton ----------
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col gap-4 p-4"
        style={{ backgroundColor: '#0A0A0E' }}
      >
        <Skeleton className="w-full h-[50vh] rounded-xl" />
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-1/2 h-5" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    );
  }

  if (!detail || !currentEpisode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0E' }}
      >
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Série não encontrada
          </p>
          <Link
            href="/dashboard/conteudo"
            className="text-red-500 underline"
          >
            Voltar para conteúdos
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent =
    currentEpisode.duration_seconds > 0
      ? (currentTime / currentEpisode.duration_seconds) * 100
      : 0;

  const episodeIndex = detail.series.videos.findIndex(
    (v) => v.id === currentEpisodeId
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0A0A0E' }}
    >
      {/* ==================== PLAYER AREA ==================== */}
      <div
        className="relative w-full lg:w-[60%]"
        style={{
          background:
            detail.series.gradient_css ??
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          minHeight: '50vh',
        }}
      >
        {/* Back button */}
        <Link
          href="/dashboard/conteudo"
          className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Voltar</span>
        </Link>

        {/* Episode indicator */}
        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white/70 text-xs font-medium">
            Episódio {episodeIndex + 1} de {detail.series.videos.length}
          </span>
        </div>

        {/* Center play area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl mb-6 select-none">🥋</span>
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
          >
            {isPlaying ? (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
              >
                <polygon points="8,5 19,12 8,19" />
              </svg>
            )}
          </button>
          <p className="text-white/60 text-sm mt-4 font-medium">
            {currentEpisode.title}
          </p>
        </div>

        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3 group"
          >
            <div
              className="h-full bg-red-500 rounded-full relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Play/Pause + time */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="text-white hover:text-red-400 transition-colors"
              >
                {isPlaying ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                )}
              </button>
              <span className="text-white/70 text-xs font-mono">
                {formatTime(currentTime)} /{' '}
                {formatTime(currentEpisode.duration_seconds)}
              </span>
            </div>

            {/* Speed buttons */}
            <div className="flex items-center gap-1">
              {speeds.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    playbackSpeed === speed
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Fullscreen placeholder */}
            <button className="text-white/60 hover:text-white transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 00-2 2v3" />
                <path d="M21 8V5a2 2 0 00-2-2h-3" />
                <path d="M3 16v3a2 2 0 002 2h3" />
                <path d="M16 21h3a2 2 0 002-2v-3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT BELOW PLAYER ==================== */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Series info */}
        <div className="flex-1 p-5 lg:w-[60%]">
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {detail.series.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {detail.series.professor_name && (
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                Prof. {detail.series.professor_name}
              </span>
            )}
            {detail.series.modality && (
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                {detail.series.modality}
              </span>
            )}
            {detail.series.min_belt && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                {detail.series.min_belt}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatTime(
                detail.series.videos.reduce(
                  (acc, v) => acc + v.duration_seconds,
                  0
                )
              )}{' '}
              total
            </span>
          </div>

          {detail.series.description && (
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {detail.series.description}
            </p>
          )}

          {/* Episode list (mobile) */}
          <div className="lg:hidden">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
              Episódios
            </h2>
            <div className="flex flex-col gap-2">
              {detail.series.videos.map((video, idx) => {
                const isCurrent = video.id === currentEpisodeId;
                const completed = isEpisodeCompleted(video.id);
                return (
                  <button
                    key={video.id}
                    onClick={() => switchEpisode(video.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isCurrent
                        ? 'bg-red-500/10 border border-red-500/50'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        completed
                          ? 'bg-green-500/20 text-green-400'
                          : isCurrent
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {completed ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(video.duration_seconds)}
                      </p>
                    </div>
                    {!isCurrent && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-gray-500 flex-shrink-0"
                      >
                        <polygon points="8,5 19,12 8,19" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Episode list sidebar (desktop) */}
        <div className="hidden lg:block lg:w-[40%] border-l border-white/10 p-5 overflow-y-auto max-h-[calc(100vh-50vh)]">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
            Episódios ({detail.series.videos.length})
          </h2>
          <div className="flex flex-col gap-2">
            {detail.series.videos.map((video, idx) => {
              const isCurrent = video.id === currentEpisodeId;
              const completed = isEpisodeCompleted(video.id);
              return (
                <button
                  key={video.id}
                  onClick={() => switchEpisode(video.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    isCurrent
                      ? 'bg-red-500/10 border border-red-500/50'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      completed
                        ? 'bg-green-500/20 text-green-400'
                        : isCurrent
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(video.duration_seconds)}
                    </p>
                  </div>
                  {!isCurrent && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-500 flex-shrink-0"
                    >
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== QUIZ MODAL ==================== */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141a] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            {!quizResult ? (
              <>
                {/* Quiz header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-lg">📝</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Quiz — Teste seus conhecimentos!
                    </h2>
                    <p className="text-xs text-gray-500">
                      Pergunta {quizStep + 1} de {currentQuestions.length}
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mb-6">
                  {currentQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= quizStep ? 'bg-red-500' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Question */}
                {currentQuestion && (
                  <div>
                    <p className="text-white font-medium mb-4 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {currentQuestion.options.map((option, optIdx) => {
                        const labels = ['A', 'B', 'C', 'D', 'E'];
                        const isSelected =
                          selectedAnswers[quizStep] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleQuizAnswer(optIdx)}
                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-red-500 bg-red-500/10 text-white'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/10 text-gray-400'
                              }`}
                            >
                              {labels[optIdx]}
                            </span>
                            <span className="text-sm">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={handleQuizSubmit}
                      disabled={selectedAnswers[quizStep] === undefined}
                      className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
                    >
                      {quizStep < currentQuestions.length - 1
                        ? 'Próxima'
                        : 'Confirmar'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Quiz result */}
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">
                    {quizResult.score === currentQuestions.length
                      ? '🏆'
                      : quizResult.score >=
                          currentQuestions.length / 2
                        ? '👏'
                        : '📖'}
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    Resultado: {quizResult.score}/
                    {currentQuestions.length}
                  </h2>

                  {quizResult.score === currentQuestions.length ? (
                    <p className="text-green-400 font-medium mb-2">
                      Parabéns! Acertou tudo!
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-2">
                      Continue estudando para melhorar!
                    </p>
                  )}

                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
                    <span className="text-yellow-400 font-bold">
                      +{quizResult.xp_gained} XP
                    </span>
                  </div>

                  {/* Per-question breakdown */}
                  <div className="flex flex-col gap-2 mb-6 text-left">
                    {currentQuestions.map((q, i) => {
                      const wrong = quizResult.wrong_answers.find((w) => w.question === q.question);
                      const isCorrect = !wrong;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            isCorrect
                              ? 'bg-green-500/10 border border-green-500/20'
                              : 'bg-red-500/10 border border-red-500/20'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">
                              Pergunta {i + 1}
                            </p>
                            {!isCorrect && wrong?.hint && (
                              <p className="text-xs text-red-400 mt-1">
                                {wrong.hint}
                              </p>
                            )}
                            {isCorrect && (
                              <p className="text-xs text-green-400 mt-1">
                                +10 XP
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleNextEpisode}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {episodeIndex < detail.series.videos.length - 1
                      ? 'Próximo episódio'
                      : 'Finalizar'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== TRAIL COMPLETE MODAL ==================== */}
      {showTrailComplete && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141a] border border-yellow-500/30 rounded-2xl w-full max-w-md p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              TRILHA COMPLETA!
            </h2>
            <p className="text-yellow-400 font-semibold text-lg mb-4">
              {detail.series.title}
            </p>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {detail.series.videos.length}
                </p>
                <p className="text-xs text-gray-500">Episódios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {formatTime(
                    detail.series.videos.reduce(
                      (acc, v) => acc + v.duration_seconds,
                      0
                    )
                  )}
                </p>
                <p className="text-xs text-gray-500">Duração total</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  toast('Certificado será enviado para seu e-mail!', 'success');
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-all"
              >
                Baixar Certificado
              </Button>
              <Button
                onClick={() => {
                  toast('Link copiado!', 'success');
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
              >
                Compartilhar
              </Button>
              <Link
                href="/dashboard/conteudo"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2"
              >
                Voltar para conteúdos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

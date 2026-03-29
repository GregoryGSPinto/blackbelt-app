'use client';

import { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import type { VideoAnnotation } from '@/lib/api/training-video.service';


type DrawToolType = 'circle' | 'arrow' | 'text';
type DrawColor = 'green' | 'red' | 'yellow';

interface AnnotatedPlayerProps {
  videoUrl: string;
  annotations: VideoAnnotation[];
  duration: number;
  readOnly?: boolean;
  onAddAnnotation?: (annotation: { timestamp_sec: number; type: DrawToolType; color: DrawColor; content: string; x: number; y: number }) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const TOOL_ICONS: Record<DrawToolType, string> = { circle: 'O', arrow: '→', text: 'T' };
const COLOR_CLASSES: Record<DrawColor, string> = { green: 'bg-green-500', red: 'bg-red-500', yellow: 'bg-yellow-500' };
const COLOR_BORDER: Record<DrawColor, string> = { green: 'border-green-500', red: 'border-red-500', yellow: 'border-yellow-500' };

const AnnotatedPlayer = forwardRef<HTMLDivElement, AnnotatedPlayerProps>(function AnnotatedPlayer(
  { videoUrl, annotations, duration, readOnly = false, onAddAnnotation },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(true);
  const [selectedTool, setSelectedTool] = useState<DrawToolType | null>(null);
  const [selectedColor, setSelectedColor] = useState<DrawColor>('red');
  const [annotationText, setAnnotationText] = useState('');
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) { video.pause(); } else { video.play(); }
    setPlaying(!playing);
  }, [playing]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); }
  }, []);

  const handleSpeedChange = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }, [speed]);

  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !selectedTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setClickPos({ x, y });
    if (selectedTool !== 'text') {
      onAddAnnotation?.({ timestamp_sec: Math.round(currentTime), type: selectedTool, color: selectedColor, content: selectedTool === 'circle' ? 'Atenção neste ponto' : 'Direção do movimento', x, y });
      setSelectedTool(null);
    }
  }, [readOnly, selectedTool, selectedColor, currentTime, onAddAnnotation]);

  const handleSubmitTextAnnotation = useCallback(() => {
    if (!clickPos || !annotationText.trim()) return;
    onAddAnnotation?.({ timestamp_sec: Math.round(currentTime), type: 'text', color: selectedColor, content: annotationText, x: clickPos.x, y: clickPos.y });
    setAnnotationText('');
    setClickPos(null);
    setSelectedTool(null);
  }, [clickPos, annotationText, selectedColor, currentTime, onAddAnnotation]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    function onFSChange() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const visibleAnnotations = annotations.filter((a) => Math.abs(a.timestamp_sec - currentTime) < 3);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const jumpToAnnotation = useCallback((sec: number) => {
    if (videoRef.current) { videoRef.current.currentTime = sec; setCurrentTime(sec); }
  }, []);

  return (
    <div ref={ref} className="flex flex-col">
      <div ref={containerRef} className={`relative ${isFullscreen ? 'h-screen w-screen bg-black' : ''}`}>
        {/* Video area */}
        <div className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-lg bg-black" onClick={handleVideoClick}>
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setPlaying(false)}
            playsInline
          />

          {/* Annotation overlays */}
          {visibleAnnotations.map((ann) => (
            <div
              key={ann.id}
              className="absolute pointer-events-none"
              style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {ann.type === 'circle' && (
                <div className={`h-12 w-12 rounded-full border-3 ${COLOR_BORDER[ann.color]} opacity-80`} />
              )}
              {ann.type === 'arrow' && (
                <div className={`text-2xl font-bold ${ann.color === 'green' ? 'text-green-500' : ann.color === 'red' ? 'text-red-500' : 'text-yellow-500'}`}>
                  &#10148;
                </div>
              )}
              {ann.type === 'text' && (
                <div className={`rounded px-2 py-1 text-xs font-bold text-white ${COLOR_CLASSES[ann.color]} opacity-90`}>
                  {ann.content}
                </div>
              )}
            </div>
          ))}

          {/* Text annotation input overlay */}
          {selectedTool === 'text' && clickPos && (
            <div
              className="absolute z-20"
              style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1 rounded bg-bb-gray-900/90 p-2">
                <input
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitTextAnnotation()}
                  placeholder="Texto..."
                  className="w-32 rounded border border-bb-gray-600 bg-bb-gray-800 px-2 py-1 text-xs text-white"
                  autoFocus
                />
                <button onClick={handleSubmitTextAnnotation} className="rounded bg-bb-primary px-2 py-1 text-xs text-white" aria-label="Confirmar anotação">OK</button>
                <button onClick={() => { setClickPos(null); setSelectedTool(null); }} className="rounded bg-bb-gray-600 px-2 py-1 text-xs text-white" aria-label="Cancelar anotação">X</button>
              </div>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="mt-2 space-y-2">
          {/* Timeline */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bb-gray-700 accent-bb-primary"
              aria-label="Progresso do vídeo"
            />
            {/* Annotation markers on timeline */}
            {annotations.map((ann) => (
              <button
                key={ann.id}
                onClick={() => jumpToAnnotation(ann.timestamp_sec)}
                className={`absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full ${COLOR_CLASSES[ann.color]}`}
                style={{ left: `${(ann.timestamp_sec / duration) * 100}%` }}
                title={ann.content}
                aria-label={`Ir para anotação em ${formatTime(ann.timestamp_sec)}`}
              />
            ))}
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-primary text-white" aria-label={playing ? 'Pausar' : 'Reproduzir'}>
                {playing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                )}
              </button>
              <span className="text-xs text-bb-gray-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleSpeedChange} className="rounded bg-bb-gray-700 px-2 py-1 text-xs font-medium text-bb-gray-300 hover:bg-bb-gray-600" aria-label={`Velocidade de reprodução: ${speed}x`}>
                {speed}x
              </button>
              <button onClick={toggleFullscreen} className="rounded bg-bb-gray-700 px-2 py-1 text-xs text-bb-gray-300 hover:bg-bb-gray-600" aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
                {isFullscreen ? 'Sair' : 'Tela cheia'}
              </button>
              {!readOnly && (
                <button
                  onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
                  className="rounded bg-bb-gray-700 px-2 py-1 text-xs text-bb-gray-300 hover:bg-bb-gray-600"
                  aria-label={showAnnotationPanel ? 'Ocultar painel de anotações' : 'Mostrar painel de anotações'}
                >
                  Anotar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drawing tools (professor only) */}
        {!readOnly && showAnnotationPanel && (
          <div className="mt-3 rounded-lg border border-bb-gray-700 bg-bb-gray-800 p-3">
            <p className="mb-2 text-xs font-medium text-bb-gray-400">Ferramentas de anotação</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {(Object.keys(TOOL_ICONS) as DrawToolType[]).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold ${selectedTool === tool ? 'bg-bb-primary text-white' : 'bg-bb-gray-700 text-bb-gray-300 hover:bg-bb-gray-600'}`}
                    aria-label={tool === 'circle' ? 'Ferramenta círculo' : tool === 'arrow' ? 'Ferramenta seta' : 'Ferramenta texto'}
                  >
                    {TOOL_ICONS[tool]}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-bb-gray-600" />
              <div className="flex gap-1">
                {(Object.keys(COLOR_CLASSES) as DrawColor[]).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-full ${COLOR_CLASSES[color]} ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-bb-gray-800' : ''}`}
                    aria-label={color === 'green' ? 'Cor verde' : color === 'red' ? 'Cor vermelha' : 'Cor amarela'}
                  />
                ))}
              </div>
              {selectedTool && (
                <span className="ml-2 text-xs text-bb-gray-400">
                  Clique no vídeo para adicionar {selectedTool === 'circle' ? 'círculo' : selectedTool === 'arrow' ? 'seta' : 'texto'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Annotation panel (bottom sheet on mobile in fullscreen) */}
        {isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 max-h-[40vh] overflow-y-auto rounded-t-xl bg-bb-gray-900/95 p-4 md:absolute md:bottom-auto md:left-auto md:right-4 md:top-4 md:max-h-[60vh] md:w-80 md:rounded-xl">
            <h3 className="mb-2 text-sm font-bold text-white">Anotações ({annotations.length})</h3>
            <div className="space-y-2">
              {annotations.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => jumpToAnnotation(ann.timestamp_sec)}
                  className="w-full rounded-lg bg-bb-gray-800 p-2 text-left hover:bg-bb-gray-700"
                  aria-label={`Ir para anotação em ${formatTime(ann.timestamp_sec)}: ${ann.content}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${COLOR_CLASSES[ann.color]}`} />
                    <span className="text-xs font-medium text-bb-gray-300">{formatTime(ann.timestamp_sec)}</span>
                    <span className="text-xs text-bb-gray-500">{ann.author_name}</span>
                  </div>
                  <p className="mt-1 text-xs text-bb-gray-400">{ann.content}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Annotation list (non-fullscreen) */}
      {!isFullscreen && annotations.length > 0 && (
        <div className="mt-4 rounded-lg border border-bb-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-bb-black">Anotações ({annotations.length})</h3>
          <div className="space-y-2">
            {annotations.map((ann) => (
              <button
                key={ann.id}
                onClick={() => jumpToAnnotation(ann.timestamp_sec)}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-bb-gray-50"
                aria-label={`Ir para anotação em ${formatTime(ann.timestamp_sec)}: ${ann.content}`}
              >
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${COLOR_CLASSES[ann.color]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-bb-primary">{formatTime(ann.timestamp_sec)}</span>
                    <span className="text-xs text-bb-gray-500">{ann.author_name}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-bb-gray-700">{ann.content}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

AnnotatedPlayer.displayName = 'AnnotatedPlayer';
export { AnnotatedPlayer };

'use client';

import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { captureAndAnalyze, type PostureResult, type BodyLandmark, type PostureIssue } from '@/lib/api/posture-analysis.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const SKELETON_CONNECTIONS: [string, string][] = [
  ['nose', 'neck'],
  ['left_eye', 'nose'],
  ['right_eye', 'nose'],
  ['left_ear', 'left_eye'],
  ['right_ear', 'right_eye'],
  ['neck', 'left_shoulder'],
  ['neck', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_elbow', 'right_wrist'],
  ['neck', 'spine_mid'],
  ['spine_mid', 'spine_low'],
  ['spine_low', 'left_hip'],
  ['spine_low', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'],
  ['right_knee', 'right_ankle'],
  ['left_ankle', 'left_foot'],
  ['right_ankle', 'right_foot'],
];

const SEVERITY_COLOR: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

const SEVERITY_STYLE: Record<string, React.CSSProperties> = {
  low: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)', borderColor: 'var(--bb-success)' },
  medium: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)', borderColor: 'var(--bb-warning)' },
  high: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)', borderColor: 'var(--bb-danger)' },
};

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const TYPE_LABEL: Record<string, string> = {
  base: 'Base',
  guard: 'Guarda',
  posture: 'Postura',
  position: 'Posição',
};

function getScoreStyle(score: number): React.CSSProperties {
  if (score >= 80) return { color: 'var(--bb-success)' };
  if (score >= 60) return { color: 'var(--bb-warning)' };
  return { color: 'var(--bb-danger)' };
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function getLandmarkColor(landmarkId: string, issues: PostureIssue[]): string {
  const bodyPartMap: Record<string, string[]> = {
    base: ['left_ankle', 'right_ankle', 'left_foot', 'right_foot'],
    guard: ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow'],
    posture: ['neck', 'spine_mid', 'spine_low'],
    position: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
  };

  for (const issue of issues) {
    const affectedLandmarks = bodyPartMap[issue.type] || [];
    if (affectedLandmarks.includes(landmarkId)) {
      return SEVERITY_COLOR[issue.severity];
    }
  }
  return '#22c55e';
}

function getConnectionColor(from: string, to: string, issues: PostureIssue[]): string {
  const colorFrom = getLandmarkColor(from, issues);
  const colorTo = getLandmarkColor(to, issues);
  if (colorFrom === '#ef4444' || colorTo === '#ef4444') return '#ef4444';
  if (colorFrom === '#eab308' || colorTo === '#eab308') return '#eab308';
  return '#22c55e';
}

const PostureCamera = forwardRef<HTMLDivElement, object>(function PostureCamera(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<PostureResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera] = useState(true);

  const handleCapture = useCallback(async () => {
    setLoading(true);
    try {
      const captureResult = await captureAndAnalyze(document.createElement('video'));
      setResult(captureResult.result);
    } catch {
      // Error handled by service
    } finally {
      setLoading(false);
    }
  }, []);

  // Draw skeleton overlay on canvas
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw dark background to simulate camera feed
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Grid lines for reference
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 10) * i, 0);
      ctx.lineTo((w / 10) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 10) * i);
      ctx.lineTo(w, (h / 10) * i);
      ctx.stroke();
    }

    const landmarkMap = new Map<string, BodyLandmark>();
    result.landmarks.forEach((lm) => landmarkMap.set(lm.id, lm));

    // Draw connections
    SKELETON_CONNECTIONS.forEach(([fromId, toId]) => {
      const from = landmarkMap.get(fromId);
      const to = landmarkMap.get(toId);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.strokeStyle = getConnectionColor(fromId, toId, result.issues);
      ctx.lineWidth = 3;
      ctx.moveTo(from.x * w, from.y * h);
      ctx.lineTo(to.x * w, to.y * h);
      ctx.stroke();
    });

    // Draw landmarks
    result.landmarks.forEach((lm) => {
      const color = getLandmarkColor(lm.id, result.issues);
      const x = lm.x * w;
      const y = lm.y * h;

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color + '40';
      ctx.fill();

      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [result]);

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Camera / Canvas Preview */}
        <div className="relative flex-1">
          <div className="relative overflow-hidden rounded-xl border-2 border-bb-gray-200" style={{ background: 'var(--bb-ink-1)' }}>
            {showCamera && !result && (
              <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-white/60">Pré-visualização da câmera</p>
                  <p className="mt-1 text-xs text-white/40">Posicione-se de frente para a câmera</p>
                </div>
              </div>
            )}
            {result && (
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="h-[400px] w-full object-contain"
              />
            )}
            {/* Overlay score badge */}
            {result && (
              <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
                <p className="text-xs text-white/70">Score</p>
                <p className="text-2xl font-bold" style={getScoreStyle(result.overall_score)}>
                  {result.overall_score}
                </p>
              </div>
            )}
          </div>

          {/* Capture button */}
          <div className="mt-3 flex justify-center">
            <Button
              variant="primary"
              onClick={handleCapture}
              disabled={loading}
              className="px-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Analisando...
                </span>
              ) : (
                'Capturar'
              )}
            </Button>
          </div>
        </div>

        {/* Side Panel — Issues */}
        <div className="w-full space-y-3 lg:w-80">
          {/* Score Display */}
          {result && (
            <div className="flex items-center gap-4 rounded-xl border border-bb-gray-200 p-4" style={{ background: 'var(--bb-depth-1)' }}>
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    className={getScoreRingColor(result.overall_score)}
                    strokeWidth="3"
                    strokeDasharray={`${result.overall_score}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold" style={getScoreStyle(result.overall_score)}>
                    {result.overall_score}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-bb-black">Score Geral</p>
                <p className="text-xs text-bb-gray-500">
                  {result.overall_score >= 80 ? 'Excelente postura!' : result.overall_score >= 60 ? 'Postura boa, com ajustes' : 'Precisa de atenção'}
                </p>
                <p className="mt-1 text-xs text-bb-gray-400">
                  {result.issues.length} {result.issues.length === 1 ? 'ponto' : 'pontos'} de melhoria
                </p>
              </div>
            </div>
          )}

          {/* Issues List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-bb-black">
              {result ? 'Pontos Identificados' : 'Aguardando análise...'}
            </h3>
            {!result && (
              <div className="rounded-lg border border-dashed border-bb-gray-300 p-6 text-center">
                <p className="text-sm text-bb-gray-400">
                  Clique em &quot;Capturar&quot; para analisar sua postura
                </p>
              </div>
            )}
            {result?.issues.map((issue, idx) => (
              <div
                key={idx}
                className="rounded-lg border p-3"
                style={SEVERITY_STYLE[issue.severity]}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase">
                      {TYPE_LABEL[issue.type]}
                    </span>
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-medium">
                      {issue.body_part}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium uppercase">
                    {SEVERITY_LABEL[issue.severity]}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium">{issue.description}</p>
                <p className="mt-1 text-xs opacity-80">{issue.suggestion}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          {result && (
            <div className="rounded-lg border border-bb-gray-200 p-3" style={{ background: 'var(--bb-depth-1)' }}>
              <p className="mb-2 text-xs font-semibold text-bb-gray-500">Legenda</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full" style={{ background: 'var(--bb-success)' }} />
                  <span className="text-xs text-bb-gray-500">Correto</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-bb-gray-500">Atenção</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-bb-gray-500">Corrigir</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PostureCamera.displayName = 'PostureCamera';
export { PostureCamera };

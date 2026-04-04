import type { FrameAnalysis, VideoAnalysis, ComparisonResult } from '@/lib/api/video-analysis.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockAnalyzeFrame(_videoId: string, timestampSec: number): Promise<FrameAnalysis> {
  await delay(300);
  const frames: Record<number, FrameAnalysis> = {
    5: { timestamp_sec: 5, posture_score: 85, balance_score: 78, technique_notes: ['Guarda fechada bem posicionada', 'Grip firme na gola'], corrections: ['Abrir levemente os cotovelos para melhor controle'] },
    12: { timestamp_sec: 12, posture_score: 72, balance_score: 80, technique_notes: ['Início da transição para armbar'], corrections: ['Quadril precisa subir mais antes de esticar a perna', 'Manter controle do braço adversário'] },
    28: { timestamp_sec: 28, posture_score: 90, balance_score: 88, technique_notes: ['Excelente underhook', 'Base sólida'], corrections: ['Cabeça poderia estar mais colada ao peito do oponente'] },
  };
  return frames[timestampSec] ?? {
    timestamp_sec: timestampSec,
    posture_score: 70 + Math.floor(Math.random() * 20),
    balance_score: 68 + Math.floor(Math.random() * 22),
    technique_notes: ['Posição neutra detectada', 'Aguardando transição'],
    corrections: ['Manter pressão constante', 'Evitar espaço entre os braços e o tronco'],
  };
}

export async function mockAnalyzeVideo(videoId: string): Promise<VideoAnalysis> {
  await delay(500);
  const analyses: Record<string, VideoAnalysis> = {
    'vid-1': {
      id: 'va-1', video_id: 'vid-1', overall_score: 78, posture_score: 72, balance_score: 80, technique_score: 82,
      highlights: ['Bom controle de postura do oponente', 'Transição suave da guarda fechada para o armbar', 'Grip consistente durante toda a execução'],
      corrections: ['Elevar mais o quadril no momento da finalização', 'Manter o calcanhar mais próximo do pescoço do oponente', 'Cortar o ângulo mais cedo na transição'],
      summary: 'Boa execução geral do armbar da guarda fechada. A transição é fluida mas a finalização precisa de ajustes na elevação do quadril. Recomendo praticar o drill de hip bump para melhorar esse aspecto.',
      frame_analyses: [
        { timestamp_sec: 5, posture_score: 85, balance_score: 78, technique_notes: ['Guarda fechada bem posicionada'], corrections: ['Abrir cotovelos'] },
        { timestamp_sec: 12, posture_score: 72, balance_score: 80, technique_notes: ['Início da transição'], corrections: ['Quadril mais alto'] },
        { timestamp_sec: 28, posture_score: 68, balance_score: 75, technique_notes: ['Finalização'], corrections: ['Calcanhar no pescoço'] },
      ],
      analyzed_at: '2026-03-10T15:00:00Z',
    },
    'vid-2': {
      id: 'va-2', video_id: 'vid-2', overall_score: 85, posture_score: 88, balance_score: 82, technique_score: 85,
      highlights: ['Ótimo grip no gi', 'Timing de passagem preciso', 'Controle de distância eficiente'],
      corrections: ['Aumentar pressão lateral após a passagem', 'Consolidar side control mais rápido', 'Manter underhook ativo na transição'],
      summary: 'Passagem de guarda toreando executada com bom timing e controle. O grip inicial é excelente. Precisa melhorar a consolidação da posição após completar a passagem.',
      frame_analyses: [
        { timestamp_sec: 3, posture_score: 90, balance_score: 85, technique_notes: ['Grip inicial excelente'], corrections: [] },
        { timestamp_sec: 8, posture_score: 88, balance_score: 80, technique_notes: ['Passagem em andamento'], corrections: ['Pressão no joelho'] },
        { timestamp_sec: 15, posture_score: 82, balance_score: 78, technique_notes: ['Side control'], corrections: ['Consolidar mais rápido'] },
      ],
      analyzed_at: '2026-03-11T11:00:00Z',
    },
    'vid-4': {
      id: 'va-4', video_id: 'vid-4', overall_score: 91, posture_score: 90, balance_score: 88, technique_score: 95,
      highlights: ['Controle de postura impecável', 'Ângulo de corte perfeito', 'Boa transição para o ajuste final', 'Timing de entrada preciso'],
      corrections: ['Puxar a cabeça com mais ênfase no ajuste final'],
      summary: 'Setup de triângulo muito bem executado. O aluno demonstra domínio da técnica com ângulo de corte e controle de postura de alto nível. Técnica pronta para competição.',
      frame_analyses: [
        { timestamp_sec: 5, posture_score: 92, balance_score: 90, technique_notes: ['Setup perfeito'], corrections: [] },
        { timestamp_sec: 18, posture_score: 90, balance_score: 88, technique_notes: ['Corte do ângulo'], corrections: [] },
        { timestamp_sec: 30, posture_score: 88, balance_score: 86, technique_notes: ['Ajuste final'], corrections: ['Puxar cabeça'] },
      ],
      analyzed_at: '2026-03-12T16:00:00Z',
    },
  };
  return analyses[videoId] ?? {
    id: `va-${Date.now()}`, video_id: videoId, overall_score: 75, posture_score: 73, balance_score: 76, technique_score: 76,
    highlights: ['Execução dentro dos padrões básicos', 'Boa intenção de movimento'],
    corrections: ['Melhorar a base durante transições', 'Manter pressão constante'],
    summary: 'Execução básica da técnica. Fundamentos presentes mas há espaço para refinamento em postura e timing.',
    frame_analyses: [],
    analyzed_at: new Date().toISOString(),
  };
}

export async function mockCompareExecution(referenceVideoId: string, studentVideoId: string): Promise<ComparisonResult> {
  await delay(500);
  return {
    id: `cmp-${Date.now()}`, reference_video_id: referenceVideoId, student_video_id: studentVideoId,
    similarity_score: 72, posture_diff: -8, timing_diff: -12,
    key_differences: [
      'Elevação do quadril 15% menor que a referência',
      'Timing da transição 0.8s mais lento',
      'Grip na manga posicionado 5cm abaixo do ideal',
      'Ângulo de corte 10° menor que o demonstrado',
    ],
    recommendations: [
      'Praticar drill de hip escape para melhorar elevação',
      'Assistir a referência em 0.5x e replicar cada etapa',
      'Focar no grip antes de iniciar a transição',
      'Gravar nova execução após 3 sessões de treino focado',
    ],
    compared_at: new Date().toISOString(),
  };
}

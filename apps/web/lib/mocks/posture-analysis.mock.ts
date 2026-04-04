import type { PostureResult, CaptureAnalysisResult } from '@/lib/api/posture-analysis.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const MOCK_LANDMARKS = [
  { id: 'nose', name: 'Nariz', x: 0.50, y: 0.10, z: 0.00, confidence: 0.98 },
  { id: 'left_eye', name: 'Olho Esquerdo', x: 0.47, y: 0.08, z: -0.01, confidence: 0.97 },
  { id: 'right_eye', name: 'Olho Direito', x: 0.53, y: 0.08, z: -0.01, confidence: 0.97 },
  { id: 'left_ear', name: 'Orelha Esquerda', x: 0.43, y: 0.09, z: -0.02, confidence: 0.92 },
  { id: 'right_ear', name: 'Orelha Direita', x: 0.57, y: 0.09, z: -0.02, confidence: 0.91 },
  { id: 'left_shoulder', name: 'Ombro Esquerdo', x: 0.38, y: 0.22, z: 0.00, confidence: 0.96 },
  { id: 'right_shoulder', name: 'Ombro Direito', x: 0.62, y: 0.21, z: 0.00, confidence: 0.95 },
  { id: 'left_elbow', name: 'Cotovelo Esquerdo', x: 0.30, y: 0.38, z: 0.02, confidence: 0.93 },
  { id: 'right_elbow', name: 'Cotovelo Direito', x: 0.70, y: 0.37, z: 0.03, confidence: 0.94 },
  { id: 'left_wrist', name: 'Punho Esquerdo', x: 0.35, y: 0.50, z: 0.04, confidence: 0.91 },
  { id: 'right_wrist', name: 'Punho Direito', x: 0.65, y: 0.49, z: 0.05, confidence: 0.90 },
  { id: 'left_hip', name: 'Quadril Esquerdo', x: 0.42, y: 0.52, z: 0.00, confidence: 0.95 },
  { id: 'right_hip', name: 'Quadril Direito', x: 0.58, y: 0.52, z: 0.00, confidence: 0.94 },
  { id: 'left_knee', name: 'Joelho Esquerdo', x: 0.40, y: 0.72, z: 0.02, confidence: 0.93 },
  { id: 'right_knee', name: 'Joelho Direito', x: 0.60, y: 0.71, z: 0.01, confidence: 0.92 },
  { id: 'left_ankle', name: 'Tornozelo Esquerdo', x: 0.39, y: 0.92, z: 0.01, confidence: 0.90 },
  { id: 'right_ankle', name: 'Tornozelo Direito', x: 0.61, y: 0.91, z: 0.00, confidence: 0.89 },
  { id: 'neck', name: 'Pescoço', x: 0.50, y: 0.18, z: 0.00, confidence: 0.96 },
  { id: 'spine_mid', name: 'Coluna Média', x: 0.50, y: 0.35, z: 0.01, confidence: 0.93 },
  { id: 'spine_low', name: 'Coluna Baixa', x: 0.50, y: 0.48, z: 0.00, confidence: 0.92 },
  { id: 'left_foot', name: 'Pé Esquerdo', x: 0.38, y: 0.96, z: 0.02, confidence: 0.88 },
  { id: 'right_foot', name: 'Pé Direito', x: 0.62, y: 0.95, z: 0.01, confidence: 0.87 },
];

const MOCK_ISSUES = [
  {
    type: 'base' as const,
    body_part: 'Pés',
    severity: 'medium' as const,
    description: 'Base muito estreita — pés próximos demais',
    suggestion: 'Afaste os pés na largura dos ombros para melhorar estabilidade. Pratique o drill de movimentação lateral mantendo a base aberta.',
  },
  {
    type: 'guard' as const,
    body_part: 'Mãos',
    severity: 'high' as const,
    description: 'Mãos baixas — guarda aberta expondo rosto e pescoço',
    suggestion: 'Mantenha as mãos na altura do queixo com cotovelos fechados. No jiu-jitsu em pé, a guarda protege contra takedowns e golpes no clinch.',
  },
  {
    type: 'posture' as const,
    body_part: 'Coluna',
    severity: 'medium' as const,
    description: 'Coluna curvada para frente — postura comprometida',
    suggestion: 'Ative o core e mantenha a coluna neutra. Uma postura ereta facilita a respiração e permite reações mais rápidas. Fortalecimento do core é essencial.',
  },
  {
    type: 'position' as const,
    body_part: 'Quadril/Joelho',
    severity: 'low' as const,
    description: 'Joelhos levemente estendidos — perda de explosão',
    suggestion: 'Flexione ligeiramente os joelhos para manter prontidão. A posição "atlética" permite mudanças de direção rápidas e defesa de queda.',
  },
];

export async function mockAnalyzePosture(_imageBase64: string): Promise<PostureResult> {
  await delay();
  return {
    landmarks: MOCK_LANDMARKS,
    issues: MOCK_ISSUES,
    overall_score: 72,
    analyzed_at: new Date().toISOString(),
  };
}

export async function mockCaptureAndAnalyze(): Promise<CaptureAnalysisResult> {
  await delay();
  return {
    frame_id: `frame-${Date.now()}`,
    result: {
      landmarks: MOCK_LANDMARKS,
      issues: MOCK_ISSUES,
      overall_score: 72,
      analyzed_at: new Date().toISOString(),
    },
    captured_at: new Date().toISOString(),
  };
}

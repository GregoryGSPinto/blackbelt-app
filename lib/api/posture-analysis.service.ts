import { isMock } from '@/lib/env';

export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueType = 'base' | 'guard' | 'posture' | 'position';

export interface BodyLandmark {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface PostureIssue {
  type: IssueType;
  body_part: string;
  severity: IssueSeverity;
  description: string;
  suggestion: string;
}

export interface PostureResult {
  landmarks: BodyLandmark[];
  issues: PostureIssue[];
  overall_score: number;
  analyzed_at: string;
}

export interface CaptureAnalysisResult {
  frame_id: string;
  result: PostureResult;
  captured_at: string;
}

const emptyPostureResult: PostureResult = { landmarks: [], issues: [], overall_score: 0, analyzed_at: '' };

export async function analyzePosture(imageBase64: string): Promise<PostureResult> {
  try {
    if (isMock()) {
      const { mockAnalyzePosture } = await import('@/lib/mocks/posture-analysis.mock');
      return mockAnalyzePosture(imageBase64);
    }
    // Log analysis request to DB
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase.from('telemetry_events').insert({
      event: 'posture_analysis_requested',
      payload: { image_size: imageBase64.length },
    }).then(() => {}, () => {});

    // Vision API not configured — return graceful default
    console.error('[analyzePosture] Vision API not configured — returning default');
    return {
      ...emptyPostureResult,
      analyzed_at: new Date().toISOString(),
      issues: [{
        type: 'posture' as IssueType,
        body_part: 'geral',
        severity: 'low' as IssueSeverity,
        description: 'Análise de postura requer configuração da Vision API.',
        suggestion: 'Configure a API em Configurações > Integrações para habilitar análise automática.',
      }],
    };
  } catch (error) {
    console.error('[analyzePosture] Fallback:', error);
    return { ...emptyPostureResult, analyzed_at: new Date().toISOString() };
  }
}

export async function captureAndAnalyze(videoRef: HTMLVideoElement): Promise<CaptureAnalysisResult> {
  try {
    if (isMock()) {
      const { mockCaptureAndAnalyze } = await import('@/lib/mocks/posture-analysis.mock');
      return mockCaptureAndAnalyze();
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[captureAndAnalyze] Cannot get canvas context');
      return { frame_id: `frame-${Date.now()}`, result: emptyPostureResult, captured_at: new Date().toISOString() };
    }
    ctx.drawImage(videoRef, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    const result = await analyzePosture(base64);
    return {
      frame_id: `frame-${Date.now()}`,
      result,
      captured_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[captureAndAnalyze] Fallback:', error);
    return { frame_id: `frame-${Date.now()}`, result: emptyPostureResult, captured_at: new Date().toISOString() };
  }
}

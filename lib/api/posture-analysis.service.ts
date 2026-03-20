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
    try {
      const res = await fetch('/api/ai/posture-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!res.ok) {
        console.warn('[analyzePosture] API error:', res.status);
        return { ...emptyPostureResult, analyzed_at: new Date().toISOString() };
      }
      return res.json();
    } catch {
      console.warn('[posture-analysis.analyzePosture] API not available — feature em desenvolvimento');
      return { ...emptyPostureResult, analyzed_at: new Date().toISOString() };
    }
  } catch (error) {
    console.warn('[analyzePosture] Fallback:', error);
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
      console.warn('[captureAndAnalyze] Cannot get canvas context');
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
    console.warn('[captureAndAnalyze] Fallback:', error);
    return { frame_id: `frame-${Date.now()}`, result: emptyPostureResult, captured_at: new Date().toISOString() };
  }
}

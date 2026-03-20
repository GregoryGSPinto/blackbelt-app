import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface ContentRecommendation {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'series';
  thumbnailUrl: string;
  reason: string;
  relevanceScore: number;
  duration?: string;
}

export interface RecommendationContext {
  belt: string;
  recentQuizScores: { topic: string; score: number }[];
  watchedVideoIds: string[];
  classId: string;
}

// ── Service ───────────────────────────────────────────────────

export async function getRecommendations(
  studentId: string,
  limit = 10,
): Promise<ContentRecommendation[]> {
  try {
    if (isMock()) {
      const recs: ContentRecommendation[] = [
        { id: 'v-1', title: 'Raspagem de Meia Guarda — Técnica Completa', type: 'video', thumbnailUrl: '', reason: 'Baseado na sua faixa (Azul)', relevanceScore: 95, duration: '12:30' },
        { id: 'v-2', title: 'Defesa de Kimura — 5 Variações', type: 'video', thumbnailUrl: '', reason: 'Alunos similares assistiram', relevanceScore: 88, duration: '8:45' },
        { id: 'q-1', title: 'Quiz: Guarda Fechada', type: 'quiz', thumbnailUrl: '', reason: 'Reforce seu conhecimento (score baixo)', relevanceScore: 92 },
        { id: 's-1', title: 'Série: Passagem de Guarda Completa', type: 'series', thumbnailUrl: '', reason: 'Novo conteúdo para sua faixa', relevanceScore: 85, duration: '45:00' },
        { id: 'v-3', title: 'Triângulo do Fundo — Setup e Finalização', type: 'video', thumbnailUrl: '', reason: 'Recomendado pelo seu professor', relevanceScore: 90, duration: '10:15' },
        { id: 'v-4', title: 'Armlock da Guarda — Detalhes Avançados', type: 'video', thumbnailUrl: '', reason: 'Popular na sua turma', relevanceScore: 78, duration: '7:20' },
        { id: 'q-2', title: 'Quiz: Finalizações das Costas', type: 'quiz', thumbnailUrl: '', reason: 'Complete sua trilha', relevanceScore: 75 },
        { id: 'v-5', title: 'Berimbolo — Passo a Passo', type: 'video', thumbnailUrl: '', reason: 'Conteúdo mais assistido esta semana', relevanceScore: 70, duration: '15:00' },
      ];
      return recs.slice(0, limit);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('content_videos')
        .select('id, title, thumbnail_url, duration_seconds')
        .order('views_count', { ascending: false })
        .limit(limit);
      if (error || !data) {
        console.warn('[getRecommendations] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>, idx: number) => ({
        id: (row.id as string) || '',
        title: (row.title as string) || '',
        type: 'video' as const,
        thumbnailUrl: (row.thumbnail_url as string) || '',
        reason: 'Conteúdo popular',
        relevanceScore: 100 - idx * 5,
        duration: row.duration_seconds ? `${Math.floor((row.duration_seconds as number) / 60)}:${String((row.duration_seconds as number) % 60).padStart(2, '0')}` : undefined,
      }));
    } catch {
      console.warn('[recommendation.getRecommendations] API not available, using fallback');
      return [];
    }
  } catch (error) {
    console.warn('[getRecommendations] Fallback:', error);
    return [];
  }
}

export async function markRecommendationSeen(
  studentId: string,
  contentId: string,
): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Recommendation marked as seen', { contentId, studentId });
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('recommendation_views')
        .insert({ student_id: studentId, content_id: contentId });
      if (error) {
        console.warn('[markRecommendationSeen] Insert failed:', error.message);
      }
    } catch {
      console.warn('[recommendation.markRecommendationSeen] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[markRecommendationSeen] Fallback:', error);
  }
}

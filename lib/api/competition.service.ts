import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'draft' | 'registration' | 'in_progress' | 'completed';
  categories: CompetitionCategory[];
  totalParticipants: number;
}

export interface CompetitionCategory {
  id: string;
  name: string;
  belt: string;
  weightClass: string;
  ageGroup: string;
  participants: CompetitionParticipant[];
  bracket: BracketMatch[];
}

export interface CompetitionParticipant {
  id: string;
  studentId: string;
  name: string;
  belt: string;
  weight: number;
  seed: number;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  participant1: { id: string; name: string } | null;
  participant2: { id: string; name: string } | null;
  winner: string | null;
  score1: string | null;
  score2: string | null;
  method: string | null;
}

export interface CompetitionResult {
  gold: { name: string; studentId: string };
  silver: { name: string; studentId: string };
  bronze: { name: string; studentId: string }[];
}

// ── Service ───────────────────────────────────────────────────

export async function listCompetitions(academyId: string): Promise<Competition[]> {
  try {
    if (isMock()) {
      return [
        {
          id: 'comp-1',
          name: 'Copa Guerreiros 2026',
          date: '2026-04-15',
          location: 'Ginásio Central',
          status: 'registration',
          categories: [],
          totalParticipants: 32,
        },
        {
          id: 'comp-2',
          name: 'Interclasses Março',
          date: '2026-03-25',
          location: 'Academia Guerreiros',
          status: 'in_progress',
          categories: [],
          totalParticipants: 16,
        },
      ];
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('academy_id', academyId)
        .order('date', { ascending: false });
      if (error || !data) {
        console.error('[listCompetitions] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: (row.id as string) || '',
        name: (row.name as string) || '',
        date: (row.date as string) || '',
        location: (row.location as string) || '',
        status: (row.status as Competition['status']) || 'draft',
        categories: [],
        totalParticipants: (row.total_participants as number) || 0,
      }));
    } catch {
      console.error('[competition.listCompetitions] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[listCompetitions] Fallback:', error);
    return [];
  }
}

export async function createCompetition(
  academyId: string,
  data: { name: string; date: string; location: string },
): Promise<Competition> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Competition created', { name: data.name });
      return {
        id: `comp-${Date.now()}`,
        ...data,
        status: 'draft',
        categories: [],
        totalParticipants: 0,
      };
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: row, error } = await supabase
        .from('competitions')
        .insert({ academy_id: academyId, name: data.name, date: data.date, location: data.location, status: 'draft' })
        .select()
        .single();
      if (error || !row) {
        console.error('[createCompetition] Insert failed:', error?.message);
        return { id: '', ...data, status: 'draft', categories: [], totalParticipants: 0 };
      }
      return {
        id: (row.id as string) || '',
        name: data.name,
        date: data.date,
        location: data.location,
        status: 'draft',
        categories: [],
        totalParticipants: 0,
      };
    } catch {
      console.error('[competition.createCompetition] API not available, returning fallback');
      return { id: '', ...data, status: 'draft', categories: [], totalParticipants: 0 };
    }
  } catch (error) {
    console.error('[createCompetition] Fallback:', error);
    return { id: '', ...data, status: 'draft', categories: [], totalParticipants: 0 };
  }
}

export async function generateBracket(
  categoryId: string,
  eliminationType: 'single' | 'double' = 'single',
): Promise<BracketMatch[]> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Generating elimination bracket', { eliminationType, categoryId });
      return [
        { id: 'm-1', round: 1, position: 1, participant1: { id: 'p-1', name: 'Rafael Costa' }, participant2: { id: 'p-2', name: 'Bruno Lima' }, winner: null, score1: null, score2: null, method: null },
        { id: 'm-2', round: 1, position: 2, participant1: { id: 'p-3', name: 'Pedro Henrique' }, participant2: { id: 'p-4', name: 'Lucas Ferreira' }, winner: null, score1: null, score2: null, method: null },
        { id: 'm-3', round: 2, position: 1, participant1: null, participant2: null, winner: null, score1: null, score2: null, method: null },
      ];
    }
    try {
      const res = await fetch('/api/competitions/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, eliminationType }),
      });
      if (!res.ok) {
        console.error('[generateBracket] API error:', res.status);
        return [];
      }
      return res.json();
    } catch {
      console.error('[competition.generateBracket] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[generateBracket] Fallback:', error);
    return [];
  }
}

export async function recordMatchResult(
  matchId: string,
  winnerId: string,
  score1: string,
  score2: string,
  method: string,
): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Match result recorded', { matchId, winnerId, score1, score2, method });
      return;
    }
    try {
      const res = await fetch(`/api/competitions/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, score1, score2, method }),
      });
      if (!res.ok) {
        console.error('[recordMatchResult] API error:', res.status);
      }
    } catch {
      console.error('[competition.recordMatchResult] API not available, using fallback');
    }
  } catch (error) {
    console.error('[recordMatchResult] Fallback:', error);
  }
}

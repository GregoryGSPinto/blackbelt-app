import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
      const res = await fetch(`/api/competitions?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[competition.listCompetitions] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'competition.list');
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
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[competition.createCompetition] API not available, using fallback');
      return { id: "", name: "", date: "", location: "", modality: "", categories: [], status: "upcoming", academy_id: "", created_at: "" } as unknown as Competition;
    }

  } catch (error) {
    handleServiceError(error, 'competition.create');
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[competition.generateBracket] API not available, using fallback');
      return [];
    }

  } catch (error) {
    handleServiceError(error, 'competition.generateBracket');
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[competition.recordMatchResult] API not available, using fallback');
    }

  } catch (error) {
    handleServiceError(error, 'competition.recordResult');
  }
}

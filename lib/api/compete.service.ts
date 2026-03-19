import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export type TournamentStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'confirmed' | 'paid' | 'checked_in' | 'weighed_in' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'waived';
export type BracketMethodType = 'single_elimination' | 'double_elimination' | 'round_robin';
export type MatchMethodType = 'submission' | 'points' | 'dq' | 'walkover' | 'referee_decision' | 'draw';
export type MatchStatus = 'pending' | 'called' | 'in_progress' | 'completed' | 'cancelled';
export type CategoryStatus = 'open' | 'closed' | 'in_progress' | 'completed';
export type BracketStatus = 'pending' | 'in_progress' | 'completed';
export type CircuitStatus = 'active' | 'completed' | 'cancelled';
export type FeedItemType = 'result' | 'announcement' | 'photo' | 'bracket_update' | 'schedule_change' | 'medal_ceremony';

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string;
  date: string;
  endDate: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  organizerId: string;
  academyId: string | null;
  circuitId: string | null;
  circuitStage: number | null;
  status: TournamentStatus;
  modality: string;
  registrationFee: number;
  registrationDeadline: string;
  maxRegistrations: number | null;
  totalRegistrations: number;
  totalAcademies: number;
  totalAreas: number;
  bannerUrl: string | null;
  logoUrl: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentCircuit {
  id: string;
  name: string;
  slug: string;
  description: string;
  season: string;
  region: string;
  organizerId: string;
  totalStages: number;
  status: CircuitStatus;
  logoUrl: string | null;
  stages: Tournament[];
  createdAt: string;
  updatedAt: string;
}

export interface TournamentCategory {
  id: string;
  tournamentId: string;
  name: string;
  beltRange: string;
  weightRange: string;
  ageRange: string;
  gender: string;
  modality: string;
  matchDurationSeconds: number;
  totalRegistrations: number;
  status: CategoryStatus;
  createdAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  categoryId: string;
  athleteId: string;
  athleteName: string;
  academyId: string | null;
  academyName: string | null;
  belt: string;
  weight: number | null;
  seed: number | null;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentRef: string | null;
  checkedInAt: string | null;
  weighedInAt: string | null;
  weighInValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  categoryId: string;
  method: BracketMethodType;
  totalRounds: number;
  totalAthletes: number;
  status: BracketStatus;
  generatedAt: string | null;
  matches: TournamentMatch[];
  createdAt: string;
}

export interface TournamentMatch {
  id: string;
  bracketId: string;
  tournamentId: string;
  categoryId: string;
  round: number;
  position: number;
  fighterAId: string | null;
  fighterAName: string | null;
  fighterBId: string | null;
  fighterBName: string | null;
  winnerId: string | null;
  winnerName: string | null;
  method: MatchMethodType | null;
  submissionName: string | null;
  scoreA: number;
  scoreB: number;
  advantagesA: number;
  advantagesB: number;
  penaltiesA: number;
  penaltiesB: number;
  durationSeconds: number | null;
  matNumber: number | null;
  areaNumber: number | null;
  scheduledTime: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: MatchStatus;
  notes: string | null;
  createdAt: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  fullName: string;
  nickname: string | null;
  photoUrl: string | null;
  belt: string;
  weight: number | null;
  weightClass: string | null;
  ageGroup: string | null;
  academyId: string | null;
  academyName: string | null;
  modality: string;
  totalFights: number;
  wins: number;
  losses: number;
  draws: number;
  submissions: number;
  submissionsSuffered: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  rankingPoints: number;
  rankingPosition: number | null;
  winRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyTournamentStats {
  id: string;
  academyId: string;
  tournamentId: string;
  academyName: string;
  totalAthletes: number;
  gold: number;
  silver: number;
  bronze: number;
  totalFights: number;
  wins: number;
  losses: number;
  submissions: number;
  points: number;
  rankingPosition: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentFeedItem {
  id: string;
  tournamentId: string;
  type: FeedItemType;
  title: string;
  content: string | null;
  imageUrl: string | null;
  matchId: string | null;
  categoryId: string | null;
  authorId: string | null;
  authorName: string | null;
  pinned: boolean;
  createdAt: string;
}

export interface TournamentPrediction {
  id: string;
  tournamentId: string;
  userId: string;
  matchId: string | null;
  categoryId: string | null;
  predictedWinnerId: string;
  predictedMethod: string | null;
  isCorrect: boolean | null;
  pointsEarned: number;
  createdAt: string;
}

export interface MedalTableEntry {
  position: number;
  academyId: string;
  academyName: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  points: number;
  totalAthletes: number;
}

export interface TournamentStats {
  totalRegistrations: number;
  totalAcademies: number;
  totalCategories: number;
  totalMatches: number;
  completedMatches: number;
  totalSubmissions: number;
  averageMatchDuration: number;
  registrationsByStatus: Record<RegistrationStatus, number>;
}

export interface CreateTournamentPayload {
  name: string;
  slug: string;
  description: string;
  rules?: string;
  date: string;
  endDate?: string;
  venue: string;
  address?: string;
  city?: string;
  state?: string;
  modality?: string;
  registrationFee?: number;
  registrationDeadline?: string;
  maxRegistrations?: number;
  totalAreas?: number;
  circuitId?: string;
  circuitStage?: number;
  bannerUrl?: string;
  logoUrl?: string;
}

export interface UpdateTournamentPayload extends Partial<CreateTournamentPayload> {
  id: string;
}

export interface CreateCategoryPayload {
  tournamentId: string;
  name: string;
  beltRange: string;
  weightRange: string;
  ageRange: string;
  gender?: string;
  modality?: string;
  matchDurationSeconds?: number;
}

export interface RegisterAthletePayload {
  tournamentId: string;
  categoryId: string;
  athleteId: string;
  athleteName: string;
  academyId?: string;
  academyName?: string;
  belt: string;
  weight?: number;
}

export interface RecordResultPayload {
  winnerId: string;
  winnerName: string;
  method: MatchMethodType;
  submissionName?: string;
  scoreA: number;
  scoreB: number;
  advantagesA?: number;
  advantagesB?: number;
  penaltiesA?: number;
  penaltiesB?: number;
  durationSeconds: number;
  notes?: string;
}

export interface SubmitPredictionPayload {
  tournamentId: string;
  matchId: string;
  categoryId?: string;
  predictedWinnerId: string;
  predictedMethod?: string;
}

export interface PredictionLeaderboardEntry {
  userId: string;
  userName: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalPoints: number;
  position: number;
}

export interface CircuitRankingEntry {
  position: number;
  athleteId: string;
  athleteName: string;
  academyName: string;
  totalPoints: number;
  stagesParticipated: number;
  gold: number;
  silver: number;
  bronze: number;
}

// ── Tournaments ──────────────────────────────────────────────

export async function getTournaments(filters?: { status?: TournamentStatus; modality?: string; featured?: boolean }): Promise<Tournament[]> {
  try {
    if (isMock()) {
      const { mockGetTournaments } = await import('@/lib/mocks/compete.mock');
      return mockGetTournaments(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.featured !== undefined) params.set('featured', String(filters.featured));
      const res = await fetch(`/api/compete/tournaments?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getTournaments');
      return res.json();
    } catch {
      console.warn('[compete.getTournaments] API not available, using mock fallback');
      const { mockGetTournaments } = await import('@/lib/mocks/compete.mock');
      return mockGetTournaments(filters);
    }
  } catch (error) { handleServiceError(error, 'compete.getTournaments'); }
}

export async function getTournament(slug: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockGetTournament } = await import('@/lib/mocks/compete.mock');
      return mockGetTournament(slug);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${slug}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getTournament');
      return res.json();
    } catch {
      console.warn('[compete.getTournament] API not available, using mock fallback');
      const { mockGetTournament } = await import('@/lib/mocks/compete.mock');
      return mockGetTournament(slug);
    }
  } catch (error) { handleServiceError(error, 'compete.getTournament'); }
}

export async function createTournament(payload: CreateTournamentPayload): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockCreateTournament } = await import('@/lib/mocks/compete.mock');
      return mockCreateTournament(payload);
    }
    try {
      const res = await fetch('/api/compete/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.createTournament');
      return res.json();
    } catch {
      console.warn('[compete.createTournament] API not available, using mock fallback');
      const { mockCreateTournament } = await import('@/lib/mocks/compete.mock');
      return mockCreateTournament(payload);
    }
  } catch (error) { handleServiceError(error, 'compete.createTournament'); }
}

export async function updateTournament(payload: UpdateTournamentPayload): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockUpdateTournament } = await import('@/lib/mocks/compete.mock');
      return mockUpdateTournament(payload);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.updateTournament');
      return res.json();
    } catch {
      console.warn('[compete.updateTournament] API not available, using mock fallback');
      const { mockUpdateTournament } = await import('@/lib/mocks/compete.mock');
      return mockUpdateTournament(payload);
    }
  } catch (error) { handleServiceError(error, 'compete.updateTournament'); }
}

export async function publishTournament(tournamentId: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockPublishTournament } = await import('@/lib/mocks/compete.mock');
      return mockPublishTournament(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/publish`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.publishTournament');
      return res.json();
    } catch {
      console.warn('[compete.publishTournament] API not available, using mock fallback');
      const { mockPublishTournament } = await import('@/lib/mocks/compete.mock');
      return mockPublishTournament(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.publishTournament'); }
}

export async function openRegistration(tournamentId: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockOpenRegistration } = await import('@/lib/mocks/compete.mock');
      return mockOpenRegistration(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/open-registration`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.openRegistration');
      return res.json();
    } catch {
      console.warn('[compete.openRegistration] API not available, using mock fallback');
      const { mockOpenRegistration } = await import('@/lib/mocks/compete.mock');
      return mockOpenRegistration(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.openRegistration'); }
}

export async function closeRegistration(tournamentId: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockCloseRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCloseRegistration(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/close-registration`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.closeRegistration');
      return res.json();
    } catch {
      console.warn('[compete.closeRegistration] API not available, using mock fallback');
      const { mockCloseRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCloseRegistration(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.closeRegistration'); }
}

export async function startTournament(tournamentId: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockStartTournament } = await import('@/lib/mocks/compete.mock');
      return mockStartTournament(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/start`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.startTournament');
      return res.json();
    } catch {
      console.warn('[compete.startTournament] API not available, using mock fallback');
      const { mockStartTournament } = await import('@/lib/mocks/compete.mock');
      return mockStartTournament(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.startTournament'); }
}

export async function completeTournament(tournamentId: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockCompleteTournament } = await import('@/lib/mocks/compete.mock');
      return mockCompleteTournament(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/complete`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.completeTournament');
      return res.json();
    } catch {
      console.warn('[compete.completeTournament] API not available, using mock fallback');
      const { mockCompleteTournament } = await import('@/lib/mocks/compete.mock');
      return mockCompleteTournament(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.completeTournament'); }
}

export async function getTournamentStats(tournamentId: string): Promise<TournamentStats> {
  try {
    if (isMock()) {
      const { mockGetTournamentStats } = await import('@/lib/mocks/compete.mock');
      return mockGetTournamentStats(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/stats`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getTournamentStats');
      return res.json();
    } catch {
      console.warn('[compete.getTournamentStats] API not available, using mock fallback');
      const { mockGetTournamentStats } = await import('@/lib/mocks/compete.mock');
      return mockGetTournamentStats(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getTournamentStats'); }
}

// ── Circuits ────────────────────────────────────────────────

export async function getCircuits(filters?: { season?: string; status?: CircuitStatus }): Promise<TournamentCircuit[]> {
  try {
    if (isMock()) {
      const { mockGetCircuits } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuits(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.season) params.set('season', filters.season);
      if (filters?.status) params.set('status', filters.status);
      const res = await fetch(`/api/compete/circuits?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getCircuits');
      return res.json();
    } catch {
      console.warn('[compete.getCircuits] API not available, using mock fallback');
      const { mockGetCircuits } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuits(filters);
    }
  } catch (error) { handleServiceError(error, 'compete.getCircuits'); }
}

export async function getCircuit(slug: string): Promise<TournamentCircuit> {
  try {
    if (isMock()) {
      const { mockGetCircuit } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuit(slug);
    }
    try {
      const res = await fetch(`/api/compete/circuits/${slug}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getCircuit');
      return res.json();
    } catch {
      console.warn('[compete.getCircuit] API not available, using mock fallback');
      const { mockGetCircuit } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuit(slug);
    }
  } catch (error) { handleServiceError(error, 'compete.getCircuit'); }
}

export async function getCircuitRanking(circuitId: string): Promise<CircuitRankingEntry[]> {
  try {
    if (isMock()) {
      const { mockGetCircuitRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuitRanking(circuitId);
    }
    try {
      const res = await fetch(`/api/compete/circuits/${circuitId}/ranking`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getCircuitRanking');
      return res.json();
    } catch {
      console.warn('[compete.getCircuitRanking] API not available, using mock fallback');
      const { mockGetCircuitRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuitRanking(circuitId);
    }
  } catch (error) { handleServiceError(error, 'compete.getCircuitRanking'); }
}

// ── Categories ──────────────────────────────────────────────

export async function getCategories(tournamentId: string): Promise<TournamentCategory[]> {
  try {
    if (isMock()) {
      const { mockGetCategories } = await import('@/lib/mocks/compete.mock');
      return mockGetCategories(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/categories`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getCategories');
      return res.json();
    } catch {
      console.warn('[compete.getCategories] API not available, using mock fallback');
      const { mockGetCategories } = await import('@/lib/mocks/compete.mock');
      return mockGetCategories(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getCategories'); }
}

export async function createCategory(payload: CreateCategoryPayload): Promise<TournamentCategory> {
  try {
    if (isMock()) {
      const { mockCreateCategory } = await import('@/lib/mocks/compete.mock');
      return mockCreateCategory(payload);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${payload.tournamentId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.createCategory');
      return res.json();
    } catch {
      console.warn('[compete.createCategory] API not available, using mock fallback');
      const { mockCreateCategory } = await import('@/lib/mocks/compete.mock');
      return mockCreateCategory(payload);
    }
  } catch (error) { handleServiceError(error, 'compete.createCategory'); }
}

export async function generateStandardCategories(tournamentId: string): Promise<TournamentCategory[]> {
  try {
    if (isMock()) {
      const { mockGenerateStandardCategories } = await import('@/lib/mocks/compete.mock');
      return mockGenerateStandardCategories(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/categories/generate`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.generateStandardCategories');
      return res.json();
    } catch {
      console.warn('[compete.generateStandardCategories] API not available, using mock fallback');
      const { mockGenerateStandardCategories } = await import('@/lib/mocks/compete.mock');
      return mockGenerateStandardCategories(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.generateStandardCategories'); }
}

// ── Registrations ───────────────────────────────────────────

export async function registerAthlete(payload: RegisterAthletePayload): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockRegisterAthlete } = await import('@/lib/mocks/compete.mock');
      return mockRegisterAthlete(payload);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${payload.tournamentId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.registerAthlete');
      return res.json();
    } catch {
      console.warn('[compete.registerAthlete] API not available, using mock fallback');
      const { mockRegisterAthlete } = await import('@/lib/mocks/compete.mock');
      return mockRegisterAthlete(payload);
    }
  } catch (error) { handleServiceError(error, 'compete.registerAthlete'); }
}

export async function registerBatch(tournamentId: string, athletes: RegisterAthletePayload[]): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockRegisterBatch } = await import('@/lib/mocks/compete.mock');
      return mockRegisterBatch(tournamentId, athletes);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/registrations/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athletes }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.registerBatch');
      return res.json();
    } catch {
      console.warn('[compete.registerBatch] API not available, using mock fallback');
      const { mockRegisterBatch } = await import('@/lib/mocks/compete.mock');
      return mockRegisterBatch(tournamentId, athletes);
    }
  } catch (error) { handleServiceError(error, 'compete.registerBatch'); }
}

export async function getRegistrations(tournamentId: string, categoryId?: string): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetRegistrations(tournamentId, categoryId);
    }
    try {
      const params = new URLSearchParams();
      if (categoryId) params.set('categoryId', categoryId);
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/registrations?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getRegistrations');
      return res.json();
    } catch {
      console.warn('[compete.getRegistrations] API not available, using mock fallback');
      const { mockGetRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetRegistrations(tournamentId, categoryId);
    }
  } catch (error) { handleServiceError(error, 'compete.getRegistrations'); }
}

export async function getMyRegistrations(userId: string): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockGetMyRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetMyRegistrations(userId);
    }
    try {
      const res = await fetch('/api/compete/registrations/me');
      if (!res.ok) throw new ServiceError(res.status, 'compete.getMyRegistrations');
      return res.json();
    } catch {
      console.warn('[compete.getMyRegistrations] API not available, using mock fallback');
      const { mockGetMyRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetMyRegistrations(userId);
    }
  } catch (error) { handleServiceError(error, 'compete.getMyRegistrations'); }
}

export async function confirmPayment(registrationId: string, paymentRef: string): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockConfirmPayment } = await import('@/lib/mocks/compete.mock');
      return mockConfirmPayment(registrationId, paymentRef);
    }
    try {
      const res = await fetch(`/api/compete/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRef }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.confirmPayment');
      return res.json();
    } catch {
      console.warn('[compete.confirmPayment] API not available, using mock fallback');
      const { mockConfirmPayment } = await import('@/lib/mocks/compete.mock');
      return mockConfirmPayment(registrationId, paymentRef);
    }
  } catch (error) { handleServiceError(error, 'compete.confirmPayment'); }
}

export async function cancelRegistration(registrationId: string): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockCancelRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCancelRegistration(registrationId);
    }
    try {
      const res = await fetch(`/api/compete/registrations/${registrationId}/cancel`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.cancelRegistration');
      return res.json();
    } catch {
      console.warn('[compete.cancelRegistration] API not available, using mock fallback');
      const { mockCancelRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCancelRegistration(registrationId);
    }
  } catch (error) { handleServiceError(error, 'compete.cancelRegistration'); }
}

export async function checkInAthlete(registrationId: string): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockCheckInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockCheckInAthlete(registrationId);
    }
    try {
      const res = await fetch(`/api/compete/registrations/${registrationId}/checkin`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.checkInAthlete');
      return res.json();
    } catch {
      console.warn('[compete.checkInAthlete] API not available, using mock fallback');
      const { mockCheckInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockCheckInAthlete(registrationId);
    }
  } catch (error) { handleServiceError(error, 'compete.checkInAthlete'); }
}

export async function weighInAthlete(registrationId: string, weight: number): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockWeighInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockWeighInAthlete(registrationId, weight);
    }
    try {
      const res = await fetch(`/api/compete/registrations/${registrationId}/weighin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.weighInAthlete');
      return res.json();
    } catch {
      console.warn('[compete.weighInAthlete] API not available, using mock fallback');
      const { mockWeighInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockWeighInAthlete(registrationId, weight);
    }
  } catch (error) { handleServiceError(error, 'compete.weighInAthlete'); }
}

// ── Brackets ────────────────────────────────────────────────

export async function generateBracket(categoryId: string): Promise<TournamentBracket> {
  try {
    if (isMock()) {
      const { mockGenerateBracket } = await import('@/lib/mocks/compete.mock');
      return mockGenerateBracket(categoryId);
    }
    try {
      const res = await fetch(`/api/compete/categories/${categoryId}/bracket`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.generateBracket');
      return res.json();
    } catch {
      console.warn('[compete.generateBracket] API not available, using mock fallback');
      const { mockGenerateBracket } = await import('@/lib/mocks/compete.mock');
      return mockGenerateBracket(categoryId);
    }
  } catch (error) { handleServiceError(error, 'compete.generateBracket'); }
}

export async function getBracket(categoryId: string): Promise<TournamentBracket> {
  try {
    if (isMock()) {
      const { mockGetBracket } = await import('@/lib/mocks/compete.mock');
      return mockGetBracket(categoryId);
    }
    try {
      const res = await fetch(`/api/compete/categories/${categoryId}/bracket`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getBracket');
      return res.json();
    } catch {
      console.warn('[compete.getBracket] API not available, using mock fallback');
      const { mockGetBracket } = await import('@/lib/mocks/compete.mock');
      return mockGetBracket(categoryId);
    }
  } catch (error) { handleServiceError(error, 'compete.getBracket'); }
}

export async function getAllBrackets(tournamentId: string): Promise<TournamentBracket[]> {
  try {
    if (isMock()) {
      const { mockGetAllBrackets } = await import('@/lib/mocks/compete.mock');
      return mockGetAllBrackets(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/brackets`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAllBrackets');
      return res.json();
    } catch {
      console.warn('[compete.getAllBrackets] API not available, using mock fallback');
      const { mockGetAllBrackets } = await import('@/lib/mocks/compete.mock');
      return mockGetAllBrackets(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getAllBrackets'); }
}

// ── Matches ─────────────────────────────────────────────────

export async function getMatchesByArea(tournamentId: string, areaNumber: number): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetMatchesByArea } = await import('@/lib/mocks/compete.mock');
      return mockGetMatchesByArea(tournamentId, areaNumber);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/matches?area=${areaNumber}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getMatchesByArea');
      return res.json();
    } catch {
      console.warn('[compete.getMatchesByArea] API not available, using mock fallback');
      const { mockGetMatchesByArea } = await import('@/lib/mocks/compete.mock');
      return mockGetMatchesByArea(tournamentId, areaNumber);
    }
  } catch (error) { handleServiceError(error, 'compete.getMatchesByArea'); }
}

export async function getNextMatches(tournamentId: string, limit?: number): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetNextMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetNextMatches(tournamentId, limit);
    }
    try {
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/matches/next?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getNextMatches');
      return res.json();
    } catch {
      console.warn('[compete.getNextMatches] API not available, using mock fallback');
      const { mockGetNextMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetNextMatches(tournamentId, limit);
    }
  } catch (error) { handleServiceError(error, 'compete.getNextMatches'); }
}

export async function callMatch(matchId: string): Promise<TournamentMatch> {
  try {
    if (isMock()) {
      const { mockCallMatch } = await import('@/lib/mocks/compete.mock');
      return mockCallMatch(matchId);
    }
    try {
      const res = await fetch(`/api/compete/matches/${matchId}/call`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.callMatch');
      return res.json();
    } catch {
      console.warn('[compete.callMatch] API not available, using mock fallback');
      const { mockCallMatch } = await import('@/lib/mocks/compete.mock');
      return mockCallMatch(matchId);
    }
  } catch (error) { handleServiceError(error, 'compete.callMatch'); }
}

export async function startMatch(matchId: string): Promise<TournamentMatch> {
  try {
    if (isMock()) {
      const { mockStartMatch } = await import('@/lib/mocks/compete.mock');
      return mockStartMatch(matchId);
    }
    try {
      const res = await fetch(`/api/compete/matches/${matchId}/start`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'compete.startMatch');
      return res.json();
    } catch {
      console.warn('[compete.startMatch] API not available, using mock fallback');
      const { mockStartMatch } = await import('@/lib/mocks/compete.mock');
      return mockStartMatch(matchId);
    }
  } catch (error) { handleServiceError(error, 'compete.startMatch'); }
}

export async function recordResult(matchId: string, result: RecordResultPayload): Promise<TournamentMatch> {
  try {
    if (isMock()) {
      const { mockRecordResult } = await import('@/lib/mocks/compete.mock');
      return mockRecordResult(matchId, result);
    }
    try {
      const res = await fetch(`/api/compete/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.recordResult');
      return res.json();
    } catch {
      console.warn('[compete.recordResult] API not available, using mock fallback');
      const { mockRecordResult } = await import('@/lib/mocks/compete.mock');
      return mockRecordResult(matchId, result);
    }
  } catch (error) { handleServiceError(error, 'compete.recordResult'); }
}

export async function getLiveMatches(tournamentId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetLiveMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetLiveMatches(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/matches/live`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getLiveMatches');
      return res.json();
    } catch {
      console.warn('[compete.getLiveMatches] API not available, using mock fallback');
      const { mockGetLiveMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetLiveMatches(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getLiveMatches'); }
}

export async function getCompletedMatches(tournamentId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetCompletedMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetCompletedMatches(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/matches/completed`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getCompletedMatches');
      return res.json();
    } catch {
      console.warn('[compete.getCompletedMatches] API not available, using mock fallback');
      const { mockGetCompletedMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetCompletedMatches(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getCompletedMatches'); }
}

// ── Feed ────────────────────────────────────────────────────

export async function getFeed(tournamentId: string, type?: FeedItemType): Promise<TournamentFeedItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeed } = await import('@/lib/mocks/compete.mock');
      return mockGetFeed(tournamentId, type);
    }
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/feed?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getFeed');
      return res.json();
    } catch {
      console.warn('[compete.getFeed] API not available, using mock fallback');
      const { mockGetFeed } = await import('@/lib/mocks/compete.mock');
      return mockGetFeed(tournamentId, type);
    }
  } catch (error) { handleServiceError(error, 'compete.getFeed'); }
}

export async function postAnnouncement(tournamentId: string, title: string, content: string): Promise<TournamentFeedItem> {
  try {
    if (isMock()) {
      const { mockPostAnnouncement } = await import('@/lib/mocks/compete.mock');
      return mockPostAnnouncement(tournamentId, title, content);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'announcement', title, content }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.postAnnouncement');
      return res.json();
    } catch {
      console.warn('[compete.postAnnouncement] API not available, using mock fallback');
      const { mockPostAnnouncement } = await import('@/lib/mocks/compete.mock');
      return mockPostAnnouncement(tournamentId, title, content);
    }
  } catch (error) { handleServiceError(error, 'compete.postAnnouncement'); }
}

export async function postPhoto(tournamentId: string, title: string, imageUrl: string): Promise<TournamentFeedItem> {
  try {
    if (isMock()) {
      const { mockPostPhoto } = await import('@/lib/mocks/compete.mock');
      return mockPostPhoto(tournamentId, title, imageUrl);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'photo', title, imageUrl }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.postPhoto');
      return res.json();
    } catch {
      console.warn('[compete.postPhoto] API not available, using mock fallback');
      const { mockPostPhoto } = await import('@/lib/mocks/compete.mock');
      return mockPostPhoto(tournamentId, title, imageUrl);
    }
  } catch (error) { handleServiceError(error, 'compete.postPhoto'); }
}

// ── Results & Medal Table ───────────────────────────────────

export async function getResults(tournamentId: string): Promise<AcademyTournamentStats[]> {
  try {
    if (isMock()) {
      const { mockGetResults } = await import('@/lib/mocks/compete.mock');
      return mockGetResults(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/results`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getResults');
      return res.json();
    } catch {
      console.warn('[compete.getResults] API not available, using mock fallback');
      const { mockGetResults } = await import('@/lib/mocks/compete.mock');
      return mockGetResults(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getResults'); }
}

export async function getMedalTable(tournamentId: string): Promise<MedalTableEntry[]> {
  try {
    if (isMock()) {
      const { mockGetMedalTable } = await import('@/lib/mocks/compete.mock');
      return mockGetMedalTable(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/medal-table`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getMedalTable');
      return res.json();
    } catch {
      console.warn('[compete.getMedalTable] API not available, using mock fallback');
      const { mockGetMedalTable } = await import('@/lib/mocks/compete.mock');
      return mockGetMedalTable(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getMedalTable'); }
}

export async function getAthleteResults(athleteId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteResults } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteResults(athleteId);
    }
    try {
      const res = await fetch(`/api/compete/athletes/${athleteId}/results`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAthleteResults');
      return res.json();
    } catch {
      console.warn('[compete.getAthleteResults] API not available, using mock fallback');
      const { mockGetAthleteResults } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteResults(athleteId);
    }
  } catch (error) { handleServiceError(error, 'compete.getAthleteResults'); }
}

// ── Athlete Profiles & Rankings ─────────────────────────────

export async function getAthleteProfile(userId: string): Promise<AthleteProfile> {
  try {
    if (isMock()) {
      const { mockGetAthleteProfile } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteProfile(userId);
    }
    try {
      const res = await fetch(`/api/compete/athletes/${userId}/profile`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAthleteProfile');
      return res.json();
    } catch {
      console.warn('[compete.getAthleteProfile] API not available, using mock fallback');
      const { mockGetAthleteProfile } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteProfile(userId);
    }
  } catch (error) { handleServiceError(error, 'compete.getAthleteProfile'); }
}

export async function getAthleteRanking(modality?: string): Promise<AthleteProfile[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteRanking(modality);
    }
    try {
      const params = new URLSearchParams();
      if (modality) params.set('modality', modality);
      const res = await fetch(`/api/compete/athletes/ranking?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAthleteRanking');
      return res.json();
    } catch {
      console.warn('[compete.getAthleteRanking] API not available, using mock fallback');
      const { mockGetAthleteRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteRanking(modality);
    }
  } catch (error) { handleServiceError(error, 'compete.getAthleteRanking'); }
}

export async function getAcademyRanking(tournamentId?: string): Promise<AcademyTournamentStats[]> {
  try {
    if (isMock()) {
      const { mockGetAcademyRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAcademyRanking(tournamentId);
    }
    try {
      const params = new URLSearchParams();
      if (tournamentId) params.set('tournamentId', tournamentId);
      const res = await fetch(`/api/compete/academies/ranking?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAcademyRanking');
      return res.json();
    } catch {
      console.warn('[compete.getAcademyRanking] API not available, using mock fallback');
      const { mockGetAcademyRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAcademyRanking(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getAcademyRanking'); }
}

export async function getAthleteRankingList(filters?: { belt?: string; weightClass?: string }): Promise<AthleteProfile[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteRankingList } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteRankingList(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.belt) params.set('belt', filters.belt);
      if (filters?.weightClass) params.set('weightClass', filters.weightClass);
      const res = await fetch(`/api/compete/athletes/ranking-list?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getAthleteRankingList');
      return res.json();
    } catch {
      console.warn('[compete.getAthleteRankingList] API not available, using mock fallback');
      const { mockGetAthleteRankingList } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteRankingList(filters);
    }
  } catch (error) { handleServiceError(error, 'compete.getAthleteRankingList'); }
}

// ── Predictions ─────────────────────────────────────────────

export async function submitPrediction(payload: SubmitPredictionPayload): Promise<TournamentPrediction> {
  try {
    if (isMock()) {
      const { mockSubmitPrediction } = await import('@/lib/mocks/compete.mock');
      return mockSubmitPrediction(payload);
    }
    try {
      const res = await fetch('/api/compete/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new ServiceError(res.status, 'compete.submitPrediction');
      return res.json();
    } catch {
      console.warn('[compete.submitPrediction] API not available, using mock fallback');
      const { mockSubmitPrediction } = await import('@/lib/mocks/compete.mock');
      return mockSubmitPrediction(payload);
    }
  } catch (error) { handleServiceError(error, 'compete.submitPrediction'); }
}

export async function getMyPredictions(tournamentId: string, userId: string): Promise<TournamentPrediction[]> {
  try {
    if (isMock()) {
      const { mockGetMyPredictions } = await import('@/lib/mocks/compete.mock');
      return mockGetMyPredictions(tournamentId, userId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/predictions/me`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getMyPredictions');
      return res.json();
    } catch {
      console.warn('[compete.getMyPredictions] API not available, using mock fallback');
      const { mockGetMyPredictions } = await import('@/lib/mocks/compete.mock');
      return mockGetMyPredictions(tournamentId, userId);
    }
  } catch (error) { handleServiceError(error, 'compete.getMyPredictions'); }
}

export async function getPredictionLeaderboard(tournamentId: string): Promise<PredictionLeaderboardEntry[]> {
  try {
    if (isMock()) {
      const { mockGetPredictionLeaderboard } = await import('@/lib/mocks/compete.mock');
      return mockGetPredictionLeaderboard(tournamentId);
    }
    try {
      const res = await fetch(`/api/compete/tournaments/${tournamentId}/predictions/leaderboard`);
      if (!res.ok) throw new ServiceError(res.status, 'compete.getPredictionLeaderboard');
      return res.json();
    } catch {
      console.warn('[compete.getPredictionLeaderboard] API not available, using mock fallback');
      const { mockGetPredictionLeaderboard } = await import('@/lib/mocks/compete.mock');
      return mockGetPredictionLeaderboard(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'compete.getPredictionLeaderboard'); }
}

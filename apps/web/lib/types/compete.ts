// ============================================================
// BlackBelt v2 — Compete Module Types
// Torneios, chaves, inscrições, resultados, rankings, predições
// ============================================================

import type { BeltLevel } from './domain';

// ────────────────────────────────────────────────────────────
// ENUMS (union types)
// ────────────────────────────────────────────────────────────

/** Status do torneio. Default: 'aguardando_aprovacao'. */
export type TournamentStatus =
  | 'aguardando_aprovacao'
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'weigh_in'
  | 'live'
  | 'completed'
  | 'cancelled';

/** Formato de chave do torneio. */
export type BracketType = 'single_elimination' | 'double_elimination' | 'round_robin';

/** Status de uma luta. */
export type MatchStatus = 'pending' | 'called' | 'in_progress' | 'completed' | 'cancelled' | 'bye';

/** Status da inscrição de um atleta. */
export type RegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'weighed_in'
  | 'competing'
  | 'eliminated'
  | 'winner'
  | 'cancelled'
  | 'no_show';

/** Status de pagamento da inscrição. */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'waived';

/** Tipo de item no feed ao vivo. */
export type FeedItemType = 'result' | 'announcement' | 'photo' | 'call' | 'schedule_change' | 'medal';

/** Método de finalização de uma luta. */
export type MatchMethod =
  | 'pontos'
  | 'submissao'
  | 'desistencia'
  | 'desqualificacao'
  | 'wo'
  | 'decisao_arbitro';

/** Tier de patrocínio. */
export type SponsorTier = 'gold' | 'silver' | 'bronze';

/** Tipo de card social para compartilhamento. */
export type SocialCardType = 'result' | 'medal' | 'bracket' | 'registration' | 'champion';

// ────────────────────────────────────────────────────────────
// ENTIDADES PRINCIPAIS
// ────────────────────────────────────────────────────────────

/**
 * Torneio / campeonato.
 *
 * @invariant status default é 'aguardando_aprovacao'. Apenas superadmin pode aprovar.
 * @invariant slug é único globalmente.
 */
export interface Tournament {
  readonly id: string;
  academy_id: string;
  circuit_id: string | null;
  name: string;
  slug: string;
  description: string;
  banner_url: string | null;
  location: string;
  address: string;
  city: string;
  state: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  modalities: string[];
  status: TournamentStatus;
  rules_url: string | null;
  max_athletes: number | null;
  registration_fee: number;
  areas_count: number;
  organizer_id: string;
  organizer_name: string;
  sponsors: Sponsor[];

  // Approval fields — superadmin workflow
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;

  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Circuito de torneios (série de eventos com ranking acumulado).
 *
 * @invariant tournament_ids mantém a ordem cronológica dos eventos.
 */
export interface TournamentCircuit {
  readonly id: string;
  name: string;
  slug: string;
  description: string;
  season: string;
  logo_url: string | null;
  tournament_ids: string[];
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Categoria de competição dentro de um torneio.
 *
 * @invariant Combinação (tournament_id + name) é única.
 */
export interface TournamentCategory {
  readonly id: string;
  tournament_id: string;
  name: string;
  modality: string;
  gender: 'male' | 'female' | 'mixed';
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  belt_min: BeltLevel | null;
  belt_max: BeltLevel | null;
  bracket_type: BracketType;
  match_duration_seconds: number;
  registered_count: number;
  max_athletes: number | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Inscrição de um atleta em uma categoria de torneio.
 *
 * @invariant Um atleta só pode se inscrever 1x por categoria.
 */
export interface TournamentRegistration {
  readonly id: string;
  tournament_id: string;
  category_id: string;
  athlete_profile_id: string;
  academy_id: string;
  athlete_name: string;
  academy_name: string;
  weight: number | null;
  seed: number | null;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  checked_in_at: string | null;
  weighed_in_at: string | null;
  weigh_in_weight: number | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Chave (bracket) de uma categoria.
 *
 * @invariant Apenas 1 bracket ativo por categoria.
 */
export interface TournamentBracket {
  readonly id: string;
  category_id: string;
  tournament_id: string;
  bracket_type: BracketType;
  rounds_count: number;
  current_round: number;
  is_complete: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Luta individual dentro de um bracket.
 *
 * @invariant match_number é único por bracket.
 */
export interface TournamentMatch {
  readonly id: string;
  bracket_id: string;
  tournament_id: string;
  category_id: string;
  category_name: string;
  round: number;
  match_number: number;
  area: number | null;
  scheduled_time: string | null;
  athlete1_id: string | null;
  athlete1_name: string | null;
  athlete1_academy: string | null;
  athlete2_id: string | null;
  athlete2_name: string | null;
  athlete2_academy: string | null;
  winner_id: string | null;
  loser_id: string | null;
  method: MatchMethod | null;
  score_athlete1: number | null;
  score_athlete2: number | null;
  penalties_athlete1: number;
  penalties_athlete2: number;
  advantages_athlete1: number;
  advantages_athlete2: number;
  duration_seconds: number | null;
  status: MatchStatus;
  next_match_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Perfil competitivo de um atleta.
 *
 * @invariant Vinculado 1:1 ao Profile do usuário.
 */
export interface AthleteProfile {
  readonly id: string;
  user_id: string;
  profile_id: string;
  academy_id: string;
  display_name: string;
  avatar_url: string | null;
  belt: BeltLevel;
  weight: number | null;
  birth_date: string | null;
  gender: 'male' | 'female';
  modalities: string[];
  wins: number;
  losses: number;
  draws: number;
  medals_gold: number;
  medals_silver: number;
  medals_bronze: number;
  ranking_points: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Estatísticas de uma academia em torneios.
 */
export interface AcademyTournamentStats {
  readonly id: string;
  academy_id: string;
  academy_name: string;
  academy_logo_url: string | null;
  circuit_id: string | null;
  tournaments_participated: number;
  total_athletes: number;
  medals_gold: number;
  medals_silver: number;
  medals_bronze: number;
  total_points: number;
  ranking_position: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Predição de resultado feita por um usuário.
 *
 * @invariant Um usuário só pode fazer 1 predição por categoria por torneio.
 */
export interface TournamentPrediction {
  readonly id: string;
  tournament_id: string;
  category_id: string;
  user_id: string;
  predicted_winner_id: string;
  actual_winner_id: string | null;
  is_correct: boolean | null;
  points_earned: number;
  readonly created_at: string;
}

/**
 * Item do feed ao vivo de um torneio.
 */
export interface TournamentFeedItem {
  readonly id: string;
  tournament_id: string;
  type: FeedItemType;
  title: string;
  content: string;
  image_url: string | null;
  match_id: string | null;
  category_name: string | null;
  author_name: string | null;
  readonly created_at: string;
}

/**
 * Patrocinador de um torneio.
 */
export interface Sponsor {
  readonly id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  tier: SponsorTier;
}

// ────────────────────────────────────────────────────────────
// FILTROS E QUERIES
// ────────────────────────────────────────────────────────────

/** Filtros para listagem de torneios. */
export interface TournamentFilters {
  status?: TournamentStatus;
  modality?: string;
  city?: string;
  state?: string;
  circuit_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Filtros para listagem de categorias. */
export interface CategoryFilters {
  modality?: string;
  gender?: 'male' | 'female' | 'mixed';
  belt?: BeltLevel;
  age_group?: string;
  search?: string;
}

/** Filtros para listagem de inscrições. */
export interface RegistrationFilters {
  status?: RegistrationStatus;
  payment_status?: PaymentStatus;
  category_id?: string;
  academy_id?: string;
  search?: string;
}

// ────────────────────────────────────────────────────────────
// DTOs DE RESULTADO
// ────────────────────────────────────────────────────────────

/** Resultado de uma luta registrado pelo árbitro. */
export interface MatchResult {
  winner_id: string;
  method: MatchMethod;
  score_athlete1: number;
  score_athlete2: number;
  penalties_athlete1: number;
  penalties_athlete2: number;
  advantages_athlete1: number;
  advantages_athlete2: number;
  duration_seconds: number;
  notes?: string;
}

/** Entrada no quadro de medalhas. */
export interface MedalTable {
  academy_id: string;
  academy_name: string;
  academy_logo_url: string | null;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  ranking_position: number;
}

/** Estatísticas gerais de um torneio. */
export interface TournamentStats {
  tournament_id: string;
  total_registrations: number;
  confirmed_registrations: number;
  checked_in_count: number;
  weighed_in_count: number;
  categories_count: number;
  brackets_generated: number;
  matches_total: number;
  matches_completed: number;
  matches_in_progress: number;
  matches_pending: number;
  academies_count: number;
  revenue_total: number;
  revenue_collected: number;
}

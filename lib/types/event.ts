// ============================================================
// BlackBelt v2 — Event Types
// Eventos da academia: competicoes, seminarios, graduacoes, etc.
// ============================================================

import type { BeltLevel } from './domain';

export type EventType = 'competition' | 'seminar' | 'graduation' | 'open_mat' | 'workshop';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface AcademyEvent {
  id: string;
  academy_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  max_participants: number;
  enrolled: number;
  modalities: string[];
  min_belt: BeltLevel;
  fee: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  max_participants: number;
  modalities: string[];
  min_belt: BeltLevel;
  fee: number;
  status: EventStatus;
}

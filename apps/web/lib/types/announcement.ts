// ============================================================
// BlackBelt v2 — Announcement Types
// ============================================================

export type AnnouncementStatus = 'draft' | 'published' | 'scheduled';

export type AnnouncementAudience =
  | 'all'
  | 'professors'
  | 'students'
  | 'parents'
  | 'specific_class';

export interface Announcement {
  id: string;
  academy_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  status: AnnouncementStatus;
  target_audience: AnnouncementAudience;
  target_class_id: string | null;
  target_class_name: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  attachments: AnnouncementAttachment[];
  read_count: number;
  total_recipients: number;
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size_bytes: number;
}

export interface AnnouncementStats {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  avg_read_rate: number;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  target_audience: AnnouncementAudience;
  target_class_id?: string;
  scheduled_at?: string;
  attachments?: File[];
}

// === Segmented Announcement Targeting (S10) ===

export interface AnnouncementTarget {
  type: 'all' | 'class' | 'modality' | 'belt' | 'age_group' | 'status' | 'custom';
  classIds?: string[];
  modalityIds?: string[];
  beltLevels?: string[];
  ageGroup?: 'kids' | 'teen' | 'adult';
  paymentStatus?: 'em_dia' | 'inadimplente';
  inactivityDays?: number;
  includeGuardians?: boolean;
}

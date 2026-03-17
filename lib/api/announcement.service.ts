import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type {
  Announcement,
  AnnouncementStats,
  CreateAnnouncementPayload,
} from '@/lib/types/announcement';

export async function listAnnouncements(
  academyId: string,
  filters?: { status?: string; audience?: string },
): Promise<Announcement[]> {
  try {
    if (isMock()) {
      const { mockListAnnouncements } = await import('@/lib/mocks/announcement.mock');
      return mockListAnnouncements(academyId, filters);
    }
    console.warn('[announcement.list] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'announcement.list');
  }
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  try {
    if (isMock()) {
      const { mockGetAnnouncement } = await import('@/lib/mocks/announcement.mock');
      return mockGetAnnouncement(id);
    }
    console.warn('[announcement.get] fallback — not yet connected to Supabase');
    return null;
  } catch (error) {
    handleServiceError(error, 'announcement.get');
  }
}

export async function createAnnouncement(
  academyId: string,
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  try {
    if (isMock()) {
      const { mockCreateAnnouncement } = await import('@/lib/mocks/announcement.mock');
      return mockCreateAnnouncement(academyId, payload);
    }
    console.warn('[announcement.create] fallback — not yet connected to Supabase');
    return { id: '', academy_id: academyId, title: payload.title, content: payload.content, author_id: '', author_name: '', status: 'draft', target_audience: payload.target_audience, target_class_id: null, target_class_name: null, scheduled_at: null, published_at: null, created_at: new Date().toISOString(), attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
  } catch (error) {
    handleServiceError(error, 'announcement.create');
  }
}

export async function publishAnnouncement(id: string): Promise<Announcement> {
  try {
    if (isMock()) {
      const { mockPublishAnnouncement } = await import('@/lib/mocks/announcement.mock');
      return mockPublishAnnouncement(id);
    }
    console.warn('[announcement.publish] fallback — not yet connected to Supabase');
    return { id, academy_id: '', title: '', content: '', author_id: '', author_name: '', status: 'published', target_audience: 'all', target_class_id: null, target_class_name: null, scheduled_at: null, published_at: new Date().toISOString(), created_at: '', attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
  } catch (error) {
    handleServiceError(error, 'announcement.publish');
  }
}

export async function getAnnouncementStats(academyId: string): Promise<AnnouncementStats> {
  try {
    if (isMock()) {
      const { mockGetAnnouncementStats } = await import('@/lib/mocks/announcement.mock');
      return mockGetAnnouncementStats(academyId);
    }
    console.warn('[announcement.getStats] fallback — not yet connected to Supabase');
    return { total: 0, published: 0, scheduled: 0, drafts: 0, avg_read_rate: 0 } as AnnouncementStats;
  } catch (error) {
    handleServiceError(error, 'announcement.getStats');
  }
}

export async function markAnnouncementAsRead(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAnnouncementAsRead } = await import('@/lib/mocks/announcement.mock');
      return mockMarkAnnouncementAsRead(id);
    }
    console.warn('[announcement.markAsRead] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'announcement.markAsRead');
  }
}

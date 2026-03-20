import { isMock } from '@/lib/env';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('announcements').select('*').eq('academy_id', academyId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.audience) query = query.eq('target_audience', filters.audience);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('[listAnnouncements] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Announcement[];
  } catch (error) {
    console.warn('[listAnnouncements] Fallback:', error);
    return [];
  }
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  try {
    if (isMock()) {
      const { mockGetAnnouncement } = await import('@/lib/mocks/announcement.mock');
      return mockGetAnnouncement(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single();
    if (error) {
      console.warn('[getAnnouncement] error:', error.message);
      return null;
    }
    return data as unknown as Announcement;
  } catch (error) {
    console.warn('[getAnnouncement] Fallback:', error);
    return null;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('announcements').insert({ academy_id: academyId, ...payload }).select().single();
    if (error) {
      console.warn('[createAnnouncement] error:', error.message);
      return { id: '', academy_id: academyId, title: payload.title, content: payload.content, author_id: '', author_name: '', status: 'draft', target_audience: payload.target_audience, target_class_id: null, target_class_name: null, scheduled_at: null, published_at: null, created_at: new Date().toISOString(), attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
    }
    return data as unknown as Announcement;
  } catch (error) {
    console.warn('[createAnnouncement] Fallback:', error);
    return { id: '', academy_id: academyId, title: payload.title, content: payload.content, author_id: '', author_name: '', status: 'draft', target_audience: payload.target_audience, target_class_id: null, target_class_name: null, scheduled_at: null, published_at: null, created_at: new Date().toISOString(), attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
  }
}

export async function publishAnnouncement(id: string): Promise<Announcement> {
  try {
    if (isMock()) {
      const { mockPublishAnnouncement } = await import('@/lib/mocks/announcement.mock');
      return mockPublishAnnouncement(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('announcements').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) {
      console.warn('[publishAnnouncement] error:', error.message);
      return { id, academy_id: '', title: '', content: '', author_id: '', author_name: '', status: 'published', target_audience: 'all', target_class_id: null, target_class_name: null, scheduled_at: null, published_at: new Date().toISOString(), created_at: '', attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
    }
    return data as unknown as Announcement;
  } catch (error) {
    console.warn('[publishAnnouncement] Fallback:', error);
    return { id, academy_id: '', title: '', content: '', author_id: '', author_name: '', status: 'published', target_audience: 'all', target_class_id: null, target_class_name: null, scheduled_at: null, published_at: new Date().toISOString(), created_at: '', attachments: [], read_count: 0, total_recipients: 0 } as Announcement;
  }
}

export async function getAnnouncementStats(academyId: string): Promise<AnnouncementStats> {
  try {
    if (isMock()) {
      const { mockGetAnnouncementStats } = await import('@/lib/mocks/announcement.mock');
      return mockGetAnnouncementStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('announcements').select('status').eq('academy_id', academyId);
    if (error || !data) {
      console.warn('[getAnnouncementStats] error:', error?.message ?? 'no data');
      return { total: 0, published: 0, scheduled: 0, drafts: 0, avg_read_rate: 0 } as AnnouncementStats;
    }
    const total = data.length;
    const published = data.filter((d: { status: string }) => d.status === 'published').length;
    const scheduled = data.filter((d: { status: string }) => d.status === 'scheduled').length;
    const drafts = data.filter((d: { status: string }) => d.status === 'draft').length;
    return { total, published, scheduled, drafts, avg_read_rate: 0 } as AnnouncementStats;
  } catch (error) {
    console.warn('[getAnnouncementStats] Fallback:', error);
    return { total: 0, published: 0, scheduled: 0, drafts: 0, avg_read_rate: 0 } as AnnouncementStats;
  }
}

export async function markAnnouncementAsRead(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkAnnouncementAsRead } = await import('@/lib/mocks/announcement.mock');
      return mockMarkAnnouncementAsRead(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('announcement_reads').insert({ announcement_id: id });
    if (error) {
      console.warn('[markAnnouncementAsRead] error:', error.message);
    }
    return;
  } catch (error) {
    console.warn('[markAnnouncementAsRead] Fallback:', error);
    return;
  }
}

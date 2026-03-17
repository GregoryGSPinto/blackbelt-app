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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'announcement.markAsRead');
  }
}

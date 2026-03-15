import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type PostType =
  | 'promotion'
  | 'achievement'
  | 'milestone'
  | 'class_photo'
  | 'event'
  | 'coach_tip';

export interface FeedComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: 'system' | 'admin' | 'teacher';
  content: string;
  imageUrl?: string;
  likes: number;
  commentCount: number;
  liked: boolean;
  comments: FeedComment[];
  createdAt: string;
}

export interface FeedHighlightStudent {
  name: string;
  avatar: string | null;
  reason: string;
}

export interface FeedHighlightClass {
  className: string;
  stat: string;
}

export interface FeedHighlightBirthday {
  name: string;
  date: string;
}

export interface FeedHighlights {
  studentOfTheWeek: FeedHighlightStudent | null;
  classHighlight: FeedHighlightClass | null;
  birthdays: FeedHighlightBirthday[];
}

export async function getFeed(
  academyId: string,
  page: number,
  filter?: PostType,
): Promise<FeedPost[]> {
  try {
    if (isMock()) {
      const { mockGetFeed } = await import('@/lib/mocks/feed.mock');
      return mockGetFeed(academyId, page, filter);
    }
    const params = new URLSearchParams({ academyId, page: String(page) });
    if (filter) params.set('filter', filter);
    const res = await fetch(`/api/feed?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'feed.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'feed.get');
  }
}

export async function likePost(postId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockLikePost } = await import('@/lib/mocks/feed.mock');
      return mockLikePost(postId);
    }
    const res = await fetch(`/api/feed/${postId}/like`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'feed.like');
  } catch (error) {
    handleServiceError(error, 'feed.like');
  }
}

export async function addComment(
  postId: string,
  content: string,
): Promise<FeedComment> {
  try {
    if (isMock()) {
      const { mockAddComment } = await import('@/lib/mocks/feed.mock');
      return mockAddComment(postId, content);
    }
    const res = await fetch(`/api/feed/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'feed.comment');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'feed.comment');
  }
}

export async function getHighlights(
  academyId: string,
): Promise<FeedHighlights> {
  try {
    if (isMock()) {
      const { mockGetHighlights } = await import('@/lib/mocks/feed.mock');
      return mockGetHighlights(academyId);
    }
    const res = await fetch(`/api/feed/highlights?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'feed.highlights');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'feed.highlights');
  }
}

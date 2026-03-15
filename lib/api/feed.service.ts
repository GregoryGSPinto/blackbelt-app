import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type PostType = 'achievement' | 'class_photo' | 'event' | 'milestone' | 'coach_tip' | 'student_post';

export interface FeedPost {
  id: string;
  type: PostType;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  imageUrl?: string;
  likes: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
}

export interface FeedComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export async function getFeed(academyId: string, page: number, filter?: PostType): Promise<FeedPost[]> {
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
  } catch (error) { handleServiceError(error, 'feed.get'); }
}

export async function likePost(postId: string): Promise<void> {
  try {
    if (isMock()) return;
    const res = await fetch(`/api/feed/${postId}/like`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'feed.like');
  } catch (error) { handleServiceError(error, 'feed.like'); }
}

export async function commentPost(postId: string, content: string): Promise<FeedComment> {
  try {
    if (isMock()) {
      return { id: `comment-${Date.now()}`, authorName: 'Você', content, createdAt: new Date().toISOString() };
    }
    const res = await fetch(`/api/feed/${postId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    if (!res.ok) throw new ServiceError(res.status, 'feed.comment');
    return res.json();
  } catch (error) { handleServiceError(error, 'feed.comment'); }
}

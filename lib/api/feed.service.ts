import { isMock } from '@/lib/env';

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
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const limit = 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      let query = supabase
        .from('feed_posts')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (filter) {
        query = query.eq('type', filter);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[getFeed] Query failed:', error.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: (row.id as string) || '',
        type: (row.type as PostType) || 'event',
        authorId: (row.author_id as string) || '',
        authorName: (row.author_name as string) || '',
        authorAvatar: (row.author_avatar as string) || null,
        authorRole: (row.author_role as 'system' | 'admin' | 'teacher') || 'system',
        content: (row.content as string) || '',
        imageUrl: (row.image_url as string) || undefined,
        likes: (row.likes as number) || 0,
        commentCount: (row.comment_count as number) || 0,
        liked: false,
        comments: [],
        createdAt: (row.created_at as string) || '',
      }));
    } catch {
      console.warn('[feed.getFeed] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.warn('[getFeed] Fallback:', error);
    return [];
  }
}

export async function likePost(postId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockLikePost } = await import('@/lib/mocks/feed.mock');
      return mockLikePost(postId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[likePost] No authenticated user');
        return;
      }
      const { error } = await supabase
        .from('feed_likes')
        .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' });
      if (error) {
        console.warn('[likePost] Upsert failed:', error.message);
      }
    } catch {
      console.warn('[feed.likePost] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[likePost] Fallback:', error);
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
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[addComment] No authenticated user');
        return { id: '', authorName: '', content, createdAt: new Date().toISOString() };
      }
      const { data: row, error } = await supabase
        .from('feed_comments')
        .insert({ post_id: postId, user_id: user.id, content })
        .select()
        .single();
      if (error || !row) {
        console.warn('[addComment] Insert failed:', error?.message);
        return { id: '', authorName: '', content, createdAt: new Date().toISOString() };
      }
      return {
        id: (row.id as string) || '',
        authorName: (row.author_name as string) || '',
        content: (row.content as string) || content,
        createdAt: (row.created_at as string) || new Date().toISOString(),
      };
    } catch {
      console.warn('[feed.addComment] API not available, using fallback');
      return { id: '', authorName: '', content, createdAt: new Date().toISOString() };
    }
  } catch (error) {
    console.warn('[addComment] Fallback:', error);
    return { id: '', authorName: '', content, createdAt: new Date().toISOString() };
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
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('academy_settings')
        .select('value')
        .eq('academy_id', academyId)
        .eq('key', 'feed_highlights')
        .single();
      if (error || !data) {
        console.warn('[getHighlights] Query failed:', error?.message);
        return { studentOfTheWeek: null, classHighlight: null, birthdays: [] };
      }
      return (data.value as FeedHighlights) || { studentOfTheWeek: null, classHighlight: null, birthdays: [] };
    } catch {
      console.warn('[feed.getHighlights] API not available, returning empty');
      return { studentOfTheWeek: null, classHighlight: null, birthdays: [] };
    }
  } catch (error) {
    console.warn('[getHighlights] Fallback:', error);
    return { studentOfTheWeek: null, classHighlight: null, birthdays: [] };
  }
}

import { isMock } from '@/lib/env';

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_belt: string;
  rating: number;
  text: string;
  created_at: string;
  creator_response?: string;
  helpful_count: number;
  reported: boolean;
}

export interface AverageRating {
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

export async function createReview(courseId: string, userId: string, rating: number, text: string): Promise<Review> {
  try {
    if (isMock()) {
      const { mockCreateReview } = await import('@/lib/mocks/reviews.mock');
      return mockCreateReview(courseId, userId, rating, text);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({ course_id: courseId, user_id: userId, rating, text })
      .select()
      .single();
    if (error || !data) {
      console.warn('[createReview] Supabase error:', error?.message);
      const { mockCreateReview } = await import('@/lib/mocks/reviews.mock');
      return mockCreateReview(courseId, userId, rating, text);
    }
    return data as Review;
  } catch (error) {
    console.warn('[createReview] Fallback:', error);
    const { mockCreateReview } = await import('@/lib/mocks/reviews.mock');
    return mockCreateReview(courseId, userId, rating, text);
  }
}

export async function getReviews(courseId: string, page?: number): Promise<{ reviews: Review[]; total: number; page: number }> {
  try {
    if (isMock()) {
      const { mockGetReviews } = await import('@/lib/mocks/reviews.mock');
      return mockGetReviews(courseId, page);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const pageSize = 10;
    const currentPage = page ?? 1;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      console.warn('[getReviews] Supabase error:', error.message);
      const { mockGetReviews } = await import('@/lib/mocks/reviews.mock');
      return mockGetReviews(courseId, page);
    }
    return { reviews: (data ?? []) as Review[], total: count ?? 0, page: currentPage };
  } catch (error) {
    console.warn('[getReviews] Fallback:', error);
    const { mockGetReviews } = await import('@/lib/mocks/reviews.mock');
    return mockGetReviews(courseId, page);
  }
}

export async function getAverageRating(courseId: string): Promise<AverageRating> {
  try {
    if (isMock()) {
      const { mockGetAverageRating } = await import('@/lib/mocks/reviews.mock');
      return mockGetAverageRating(courseId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('course_id', courseId);
    if (error || !data || data.length === 0) {
      console.warn('[getAverageRating] Supabase error or no data:', error?.message);
      const { mockGetAverageRating } = await import('@/lib/mocks/reviews.mock');
      return mockGetAverageRating(courseId);
    }
    const total = data.length;
    const average = data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / total;
    const distribution = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: data.filter((r: { rating: number }) => r.rating === stars).length,
    }));
    return { average: Math.round(average * 10) / 10, total, distribution };
  } catch (error) {
    console.warn('[getAverageRating] Fallback:', error);
    const { mockGetAverageRating } = await import('@/lib/mocks/reviews.mock');
    return mockGetAverageRating(courseId);
  }
}

export async function reportReview(reviewId: string, reason: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockReportReview } = await import('@/lib/mocks/reviews.mock');
      return mockReportReview(reviewId, reason);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('reviews')
      .update({ reported: true, report_reason: reason })
      .eq('id', reviewId);
    if (error) {
      console.warn('[reportReview] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[reportReview] Fallback:', error);
  }
}

export async function respondToReview(reviewId: string, response: string): Promise<Review> {
  try {
    if (isMock()) {
      const { mockRespondToReview } = await import('@/lib/mocks/reviews.mock');
      return mockRespondToReview(reviewId, response);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ creator_response: response })
      .eq('id', reviewId)
      .select()
      .single();
    if (error || !data) {
      console.warn('[respondToReview] Supabase error:', error?.message);
      const { mockRespondToReview } = await import('@/lib/mocks/reviews.mock');
      return mockRespondToReview(reviewId, response);
    }
    return data as Review;
  } catch (error) {
    console.warn('[respondToReview] Fallback:', error);
    const { mockRespondToReview } = await import('@/lib/mocks/reviews.mock');
    return mockRespondToReview(reviewId, response);
  }
}

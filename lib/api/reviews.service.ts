import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId, rating, text }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'reviews.create');
      return res.json();
    } catch {
      console.warn('[reviews.createReview] API not available, using fallback');
      return { id: "", user_id: "", user_name: "", rating: 0, comment: "", created_at: "" } as unknown as Review;
    }
  } catch (error) { handleServiceError(error, 'reviews.create'); }
}

export async function getReviews(courseId: string, page?: number): Promise<{ reviews: Review[]; total: number; page: number }> {
  try {
    if (isMock()) {
      const { mockGetReviews } = await import('@/lib/mocks/reviews.mock');
      return mockGetReviews(courseId, page);
    }
    try {
      const params = new URLSearchParams({ courseId });
      if (page) params.set('page', String(page));
      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'reviews.list');
      return res.json();
    } catch {
      console.warn('[reviews.getReviews] API not available, using fallback');
      return { reviews: [], total: 0, page: 0 };
    }
  } catch (error) { handleServiceError(error, 'reviews.list'); }
}

export async function getAverageRating(courseId: string): Promise<AverageRating> {
  try {
    if (isMock()) {
      const { mockGetAverageRating } = await import('@/lib/mocks/reviews.mock');
      return mockGetAverageRating(courseId);
    }
    try {
      const res = await fetch(`/api/reviews/average?courseId=${courseId}`);
      if (!res.ok) throw new ServiceError(res.status, 'reviews.average');
      return res.json();
    } catch {
      console.warn('[reviews.getAverageRating] API not available, using fallback');
      return { average: 0, total: 0, distribution: [] } as unknown as AverageRating;
    }
  } catch (error) { handleServiceError(error, 'reviews.average'); }
}

export async function reportReview(reviewId: string, reason: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockReportReview } = await import('@/lib/mocks/reviews.mock');
      return mockReportReview(reviewId, reason);
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'reviews.report');
    } catch {
      console.warn('[reviews.reportReview] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'reviews.report'); }
}

export async function respondToReview(reviewId: string, response: string): Promise<Review> {
  try {
    if (isMock()) {
      const { mockRespondToReview } = await import('@/lib/mocks/reviews.mock');
      return mockRespondToReview(reviewId, response);
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'reviews.respond');
      return res.json();
    } catch {
      console.warn('[reviews.respondToReview] API not available, using fallback');
      return { id: "", user_id: "", user_name: "", rating: 0, comment: "", created_at: "" } as unknown as Review;
    }
  } catch (error) { handleServiceError(error, 'reviews.respond'); }
}

import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type CourseModality = 'bjj' | 'judo' | 'mma' | 'muay_thai' | 'wrestling' | 'no_gi';
export type BeltLevel = 'branca' | 'cinza' | 'amarela' | 'laranja' | 'verde' | 'azul' | 'roxa' | 'marrom' | 'preta' | 'todas';
export type CourseStatus = 'draft' | 'published' | 'suspended';

export interface CourseModule {
  id: string;
  title: string;
  videos: { id: string; title: string; duration: number }[];
  duration: number;
}

export interface MarketplaceCourse {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_academy: string;
  title: string;
  description: string;
  thumbnail_url: string;
  preview_video_url: string;
  modality: CourseModality;
  belt_level: BeltLevel;
  duration_total: number;
  price: number;
  rating: number;
  reviews_count: number;
  students_count: number;
  modules: CourseModule[];
  status: CourseStatus;
}

export interface CoursePurchase {
  id: string;
  course_id: string;
  course_title: string;
  course_thumbnail: string;
  creator_name: string;
  purchased_at: string;
  price: number;
  progress: number;
}

export interface MarketplaceFilters {
  modality?: CourseModality;
  belt_level?: BeltLevel;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  search?: string;
  category?: 'mais_vendidos' | 'novos' | 'para_sua_faixa';
}

export async function listCourses(filters?: MarketplaceFilters): Promise<MarketplaceCourse[]> {
  try {
    if (isMock()) {
      const { mockListCourses } = await import('@/lib/mocks/marketplace.mock');
      return mockListCourses(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.belt_level) params.set('belt_level', filters.belt_level);
      if (filters?.min_price !== undefined) params.set('min_price', String(filters.min_price));
      if (filters?.max_price !== undefined) params.set('max_price', String(filters.max_price));
      if (filters?.min_rating !== undefined) params.set('min_rating', String(filters.min_rating));
      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      const res = await fetch(`/api/marketplace/courses?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplace.listCourses');
      return res.json();
    } catch {
      console.warn('[marketplace.listCourses] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplace.listCourses'); }
}

export async function getCourse(id: string): Promise<MarketplaceCourse> {
  try {
    if (isMock()) {
      const { mockGetCourse } = await import('@/lib/mocks/marketplace.mock');
      return mockGetCourse(id);
    }
    try {
      const res = await fetch(`/api/marketplace/courses/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplace.getCourse');
      return res.json();
    } catch {
      console.warn('[marketplace.getCourse] API not available, using fallback');
      return { id: "", title: "", description: "", creator_id: "", creator_name: "", creator_avatar: null, modality: "bjj", belt_level: "white", price: 0, thumbnail_url: "", preview_video_url: null, modules: [], total_lessons: 0, total_duration_min: 0, rating: 0, review_count: 0, students_count: 0, status: "draft", created_at: "", updated_at: "" } as unknown as MarketplaceCourse;
    }
  } catch (error) { handleServiceError(error, 'marketplace.getCourse'); }
}

export async function purchaseCourse(courseId: string, userId: string): Promise<CoursePurchase> {
  try {
    if (isMock()) {
      const { mockPurchaseCourse } = await import('@/lib/mocks/marketplace.mock');
      return mockPurchaseCourse(courseId, userId);
    }
    try {
      const res = await fetch(`/api/marketplace/courses/${courseId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'marketplace.purchaseCourse');
      return res.json();
    } catch {
      console.warn('[marketplace.purchaseCourse] API not available, using fallback');
      return { id: "", course_id: "", user_id: "", purchased_at: "", status: "active" } as unknown as CoursePurchase;
    }
  } catch (error) { handleServiceError(error, 'marketplace.purchaseCourse'); }
}

export async function getMyPurchases(userId: string): Promise<CoursePurchase[]> {
  try {
    if (isMock()) {
      const { mockGetMyPurchases } = await import('@/lib/mocks/marketplace.mock');
      return mockGetMyPurchases(userId);
    }
    try {
      const res = await fetch(`/api/marketplace/purchases?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplace.getMyPurchases');
      return res.json();
    } catch {
      console.warn('[marketplace.getMyPurchases] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplace.getMyPurchases'); }
}

export async function getMySales(creatorId: string): Promise<CoursePurchase[]> {
  try {
    if (isMock()) {
      const { mockGetMySales } = await import('@/lib/mocks/marketplace.mock');
      return mockGetMySales(creatorId);
    }
    try {
      const res = await fetch(`/api/marketplace/sales?creatorId=${creatorId}`);
      if (!res.ok) throw new ServiceError(res.status, 'marketplace.getMySales');
      return res.json();
    } catch {
      console.warn('[marketplace.getMySales] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'marketplace.getMySales'); }
}

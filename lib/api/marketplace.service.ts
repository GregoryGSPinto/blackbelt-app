import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('marketplace_courses')
      .select('*')
      .eq('status', 'published');

    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.belt_level) query = query.eq('belt_level', filters.belt_level);
    if (filters?.min_price !== undefined) query = query.gte('price', filters.min_price);
    if (filters?.max_price !== undefined) query = query.lte('price', filters.max_price);
    if (filters?.min_rating !== undefined) query = query.gte('rating', filters.min_rating);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    if (filters?.category === 'mais_vendidos') {
      query = query.order('students_count', { ascending: false });
    } else if (filters?.category === 'novos') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('rating', { ascending: false });
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('[listCourses] Supabase error:', error?.message);
      return [];
    }

    return data.map((c: Record<string, unknown>) => ({
      id: (c.id as string) ?? '',
      creator_id: (c.creator_id as string) ?? '',
      creator_name: (c.creator_name as string) ?? '',
      creator_academy: (c.creator_academy as string) ?? '',
      title: (c.title as string) ?? '',
      description: (c.description as string) ?? '',
      thumbnail_url: (c.thumbnail_url as string) ?? '',
      preview_video_url: (c.preview_video_url as string) ?? '',
      modality: (c.modality as CourseModality) ?? 'bjj',
      belt_level: (c.belt_level as BeltLevel) ?? 'todas',
      duration_total: (c.duration_total as number) ?? 0,
      price: (c.price as number) ?? 0,
      rating: (c.rating as number) ?? 0,
      reviews_count: (c.reviews_count as number) ?? 0,
      students_count: (c.students_count as number) ?? 0,
      modules: (c.modules as CourseModule[]) ?? [],
      status: (c.status as CourseStatus) ?? 'published',
    }));
  } catch (error) {
    console.warn('[listCourses] Fallback:', error);
    return [];
  }
}

export async function getCourse(id: string): Promise<MarketplaceCourse> {
  try {
    if (isMock()) {
      const { mockGetCourse } = await import('@/lib/mocks/marketplace.mock');
      return mockGetCourse(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('marketplace_courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.warn('[getCourse] Supabase error or no data:', error?.message);
      return { id, creator_id: '', creator_name: '', creator_academy: '', title: '', description: '', thumbnail_url: '', preview_video_url: '', modality: 'bjj', belt_level: 'todas', duration_total: 0, price: 0, rating: 0, reviews_count: 0, students_count: 0, modules: [], status: 'draft' };
    }

    return {
      id: data.id ?? id,
      creator_id: data.creator_id ?? '',
      creator_name: data.creator_name ?? '',
      creator_academy: data.creator_academy ?? '',
      title: data.title ?? '',
      description: data.description ?? '',
      thumbnail_url: data.thumbnail_url ?? '',
      preview_video_url: data.preview_video_url ?? '',
      modality: data.modality ?? 'bjj',
      belt_level: data.belt_level ?? 'todas',
      duration_total: data.duration_total ?? 0,
      price: data.price ?? 0,
      rating: data.rating ?? 0,
      reviews_count: data.reviews_count ?? 0,
      students_count: data.students_count ?? 0,
      modules: data.modules ?? [],
      status: data.status ?? 'draft',
    };
  } catch (error) {
    console.warn('[getCourse] Fallback:', error);
    return { id, creator_id: '', creator_name: '', creator_academy: '', title: '', description: '', thumbnail_url: '', preview_video_url: '', modality: 'bjj', belt_level: 'todas', duration_total: 0, price: 0, rating: 0, reviews_count: 0, students_count: 0, modules: [], status: 'draft' };
  }
}

export async function purchaseCourse(courseId: string, userId: string): Promise<CoursePurchase> {
  try {
    if (isMock()) {
      const { mockPurchaseCourse } = await import('@/lib/mocks/marketplace.mock');
      return mockPurchaseCourse(courseId, userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('course_purchases')
      .insert({ course_id: courseId, user_id: userId, progress: 0 })
      .select('*, marketplace_courses(title, thumbnail_url, creator_name, price)')
      .single();

    if (error || !data) {
      console.warn('[purchaseCourse] Supabase error:', error?.message);
      return { id: '', course_id: courseId, course_title: '', course_thumbnail: '', creator_name: '', purchased_at: new Date().toISOString(), price: 0, progress: 0 };
    }

    const course = data.marketplace_courses as Record<string, unknown> | null;
    return {
      id: data.id ?? '',
      course_id: data.course_id ?? courseId,
      course_title: (course?.title as string) ?? '',
      course_thumbnail: (course?.thumbnail_url as string) ?? '',
      creator_name: (course?.creator_name as string) ?? '',
      purchased_at: data.created_at ?? new Date().toISOString(),
      price: (course?.price as number) ?? 0,
      progress: data.progress ?? 0,
    };
  } catch (error) {
    console.warn('[purchaseCourse] Fallback:', error);
    return { id: '', course_id: courseId, course_title: '', course_thumbnail: '', creator_name: '', purchased_at: new Date().toISOString(), price: 0, progress: 0 };
  }
}

export async function getMyPurchases(userId: string): Promise<CoursePurchase[]> {
  try {
    if (isMock()) {
      const { mockGetMyPurchases } = await import('@/lib/mocks/marketplace.mock');
      return mockGetMyPurchases(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('course_purchases')
      .select('*, marketplace_courses(title, thumbnail_url, creator_name, price)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[getMyPurchases] Supabase error:', error?.message);
      return [];
    }

    return data.map((p: Record<string, unknown>) => {
      const course = p.marketplace_courses as Record<string, unknown> | null;
      return {
        id: (p.id as string) ?? '',
        course_id: (p.course_id as string) ?? '',
        course_title: (course?.title as string) ?? '',
        course_thumbnail: (course?.thumbnail_url as string) ?? '',
        creator_name: (course?.creator_name as string) ?? '',
        purchased_at: (p.created_at as string) ?? '',
        price: (course?.price as number) ?? 0,
        progress: (p.progress as number) ?? 0,
      };
    });
  } catch (error) {
    console.warn('[getMyPurchases] Fallback:', error);
    return [];
  }
}

export async function getMySales(creatorId: string): Promise<CoursePurchase[]> {
  try {
    if (isMock()) {
      const { mockGetMySales } = await import('@/lib/mocks/marketplace.mock');
      return mockGetMySales(creatorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('course_purchases')
      .select('*, marketplace_courses!inner(title, thumbnail_url, creator_name, price, creator_id)')
      .eq('marketplace_courses.creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[getMySales] Supabase error:', error?.message);
      return [];
    }

    return data.map((p: Record<string, unknown>) => {
      const course = p.marketplace_courses as Record<string, unknown> | null;
      return {
        id: (p.id as string) ?? '',
        course_id: (p.course_id as string) ?? '',
        course_title: (course?.title as string) ?? '',
        course_thumbnail: (course?.thumbnail_url as string) ?? '',
        creator_name: (course?.creator_name as string) ?? '',
        purchased_at: (p.created_at as string) ?? '',
        price: (course?.price as number) ?? 0,
        progress: (p.progress as number) ?? 0,
      };
    });
  } catch (error) {
    console.warn('[getMySales] Fallback:', error);
    return [];
  }
}

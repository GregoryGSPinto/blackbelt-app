import { isMock } from '@/lib/env';
import type { MarketplaceCourse, CourseModality, BeltLevel, CourseModule } from '@/lib/api/marketplace.service';

export interface CourseAnalytics {
  course_id: string;
  course_title: string;
  views: number;
  sales: number;
  revenue: number;
  reviews: number;
  monthly_data: { month: string; views: number; sales: number; revenue: number }[];
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  modality: CourseModality;
  belt_level: BeltLevel;
  price: number;
  thumbnail_url?: string;
  preview_video_url?: string;
}

export interface AddModulePayload {
  course_id: string;
  title: string;
}

export interface AddLessonPayload {
  course_id: string;
  module_id: string;
  title: string;
  video_url: string;
  duration: number;
}

export async function createCourse(creatorId: string, payload: CreateCoursePayload): Promise<MarketplaceCourse> {
  try {
    if (isMock()) {
      const { mockCreateCourse } = await import('@/lib/mocks/course-creator.mock');
      return mockCreateCourse(creatorId, payload);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('courses')
      .insert({ creator_id: creatorId, ...payload, status: 'draft' })
      .select()
      .single();
    if (error || !data) {
      console.error('[createCourse] Supabase error:', error?.message);
      return {} as MarketplaceCourse;
    }
    return data as unknown as MarketplaceCourse;
  } catch (error) {
    console.error('[createCourse] Fallback:', error);
    return {} as MarketplaceCourse;
  }
}

export async function addModule(payload: AddModulePayload): Promise<CourseModule> {
  try {
    if (isMock()) {
      const { mockAddModule } = await import('@/lib/mocks/course-creator.mock');
      return mockAddModule(payload);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('course_modules')
      .insert({ course_id: payload.course_id, title: payload.title })
      .select()
      .single();
    if (error || !data) {
      console.error('[addModule] Supabase error:', error?.message);
      return {} as CourseModule;
    }
    return data as unknown as CourseModule;
  } catch (error) {
    console.error('[addModule] Fallback:', error);
    return {} as CourseModule;
  }
}

export async function addLesson(payload: AddLessonPayload): Promise<void> {
  try {
    if (isMock()) {
      const { mockAddLesson } = await import('@/lib/mocks/course-creator.mock');
      return mockAddLesson(payload);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('course_lessons')
      .insert({ course_id: payload.course_id, module_id: payload.module_id, title: payload.title, video_url: payload.video_url, duration: payload.duration });
    if (error) {
      console.error('[addLesson] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[addLesson] Fallback:', error);
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
  try {
    if (isMock()) {
      const { mockReorderModules } = await import('@/lib/mocks/course-creator.mock');
      return mockReorderModules(courseId, moduleIds);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const updates = moduleIds.map((id, index) =>
      supabase.from('course_modules').update({ sort_order: index }).eq('id', id).eq('course_id', courseId)
    );
    await Promise.all(updates);
  } catch (error) {
    console.error('[reorderModules] Fallback:', error);
  }
}

export async function publishCourse(courseId: string): Promise<MarketplaceCourse> {
  try {
    if (isMock()) {
      const { mockPublishCourse } = await import('@/lib/mocks/course-creator.mock');
      return mockPublishCourse(courseId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('courses')
      .update({ status: 'published' })
      .eq('id', courseId)
      .select()
      .single();
    if (error || !data) {
      console.error('[publishCourse] Supabase error:', error?.message);
      return {} as MarketplaceCourse;
    }
    return data as unknown as MarketplaceCourse;
  } catch (error) {
    console.error('[publishCourse] Fallback:', error);
    return {} as MarketplaceCourse;
  }
}

export async function getCourseAnalytics(creatorId: string): Promise<CourseAnalytics[]> {
  try {
    if (isMock()) {
      const { mockGetCourseAnalytics } = await import('@/lib/mocks/course-creator.mock');
      return mockGetCourseAnalytics(creatorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('course_analytics')
      .select('*')
      .eq('creator_id', creatorId);
    if (error || !data) {
      console.error('[getCourseAnalytics] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as CourseAnalytics[];
  } catch (error) {
    console.error('[getCourseAnalytics] Fallback:', error);
    return [];
  }
}

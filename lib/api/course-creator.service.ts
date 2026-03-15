import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    const res = await fetch(`/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, ...payload }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'courseCreator.create'); }
}

export async function addModule(payload: AddModulePayload): Promise<CourseModule> {
  try {
    if (isMock()) {
      const { mockAddModule } = await import('@/lib/mocks/course-creator.mock');
      return mockAddModule(payload);
    }
    const res = await fetch(`/api/courses/${payload.course_id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: payload.title }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.addModule');
    return res.json();
  } catch (error) { handleServiceError(error, 'courseCreator.addModule'); }
}

export async function addLesson(payload: AddLessonPayload): Promise<void> {
  try {
    if (isMock()) {
      const { mockAddLesson } = await import('@/lib/mocks/course-creator.mock');
      return mockAddLesson(payload);
    }
    const res = await fetch(`/api/courses/${payload.course_id}/modules/${payload.module_id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: payload.title, video_url: payload.video_url, duration: payload.duration }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.addLesson');
  } catch (error) { handleServiceError(error, 'courseCreator.addLesson'); }
}

export async function reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
  try {
    if (isMock()) {
      const { mockReorderModules } = await import('@/lib/mocks/course-creator.mock');
      return mockReorderModules(courseId, moduleIds);
    }
    const res = await fetch(`/api/courses/${courseId}/modules/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleIds }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.reorderModules');
  } catch (error) { handleServiceError(error, 'courseCreator.reorderModules'); }
}

export async function publishCourse(courseId: string): Promise<MarketplaceCourse> {
  try {
    if (isMock()) {
      const { mockPublishCourse } = await import('@/lib/mocks/course-creator.mock');
      return mockPublishCourse(courseId);
    }
    const res = await fetch(`/api/courses/${courseId}/publish`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.publish');
    return res.json();
  } catch (error) { handleServiceError(error, 'courseCreator.publish'); }
}

export async function getCourseAnalytics(creatorId: string): Promise<CourseAnalytics[]> {
  try {
    if (isMock()) {
      const { mockGetCourseAnalytics } = await import('@/lib/mocks/course-creator.mock');
      return mockGetCourseAnalytics(creatorId);
    }
    const res = await fetch(`/api/courses/analytics?creatorId=${creatorId}`);
    if (!res.ok) throw new ServiceError(res.status, 'courseCreator.analytics');
    return res.json();
  } catch (error) { handleServiceError(error, 'courseCreator.analytics'); }
}

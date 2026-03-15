import type { MarketplaceCourse, CourseModule } from '@/lib/api/marketplace.service';
import type { CreateCoursePayload, AddModulePayload, AddLessonPayload, CourseAnalytics } from '@/lib/api/course-creator.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

export async function mockCreateCourse(creatorId: string, payload: CreateCoursePayload): Promise<MarketplaceCourse> {
  await delay();
  return {
    id: `mkt-${Date.now()}`,
    creator_id: creatorId,
    creator_name: 'Prof. Ricardo Almeida',
    creator_academy: 'Alliance BJJ SP',
    title: payload.title,
    description: payload.description,
    thumbnail_url: payload.thumbnail_url || '/img/course-default.jpg',
    preview_video_url: payload.preview_video_url || '',
    modality: payload.modality,
    belt_level: payload.belt_level,
    duration_total: 0,
    price: payload.price,
    rating: 0,
    reviews_count: 0,
    students_count: 0,
    modules: [],
    status: 'draft',
  };
}

export async function mockAddModule(payload: AddModulePayload): Promise<CourseModule> {
  await delay();
  return {
    id: `mod-${Date.now()}`,
    title: payload.title,
    videos: [],
    duration: 0,
  };
}

export async function mockAddLesson(_payload: AddLessonPayload): Promise<void> {
  await delay();
}

export async function mockReorderModules(_courseId: string, _moduleIds: string[]): Promise<void> {
  await delay();
}

export async function mockPublishCourse(_courseId: string): Promise<MarketplaceCourse> {
  await delay();
  return {
    id: _courseId,
    creator_id: 'prof-1',
    creator_name: 'Prof. Ricardo Almeida',
    creator_academy: 'Alliance BJJ SP',
    title: 'Curso Publicado',
    description: 'Descrição do curso publicado',
    thumbnail_url: '/img/course-default.jpg',
    preview_video_url: '',
    modality: 'bjj',
    belt_level: 'branca',
    duration_total: 120,
    price: 197.90,
    rating: 0,
    reviews_count: 0,
    students_count: 0,
    modules: [],
    status: 'published',
  };
}

export async function mockGetCourseAnalytics(_creatorId: string): Promise<CourseAnalytics[]> {
  await delay();
  const months = ['Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26', 'Mar/26'];
  return [
    {
      course_id: 'mkt-1',
      course_title: 'Guarda Fechada Completa - Do Básico ao Avançado',
      views: 12480,
      sales: 856,
      revenue: 169363.40,
      reviews: 142,
      monthly_data: months.map((month, i) => ({
        month,
        views: 1500 + Math.floor(Math.random() * 800) + i * 200,
        sales: 80 + Math.floor(Math.random() * 40) + i * 15,
        revenue: (80 + Math.floor(Math.random() * 40) + i * 15) * 197.90,
      })),
    },
    {
      course_id: 'mkt-5',
      course_title: 'Raspagens Modernas - Jogo por Baixo',
      views: 8320,
      sales: 445,
      revenue: 132165.00,
      reviews: 87,
      monthly_data: months.map((month, i) => ({
        month,
        views: 1000 + Math.floor(Math.random() * 600) + i * 150,
        sales: 50 + Math.floor(Math.random() * 30) + i * 10,
        revenue: (50 + Math.floor(Math.random() * 30) + i * 10) * 297.00,
      })),
    },
    {
      course_id: 'mkt-new',
      course_title: 'Estrangulamentos da Meia-Guarda (Rascunho)',
      views: 0,
      sales: 0,
      revenue: 0,
      reviews: 0,
      monthly_data: months.map((month) => ({
        month,
        views: 0,
        sales: 0,
        revenue: 0,
      })),
    },
  ];
}

import { BeltLevel } from '@/lib/types';
import type { Video } from '@/lib/types';
import type { AdminVideoDTO, AdminStorageStats, CreateVideoRequest } from '@/lib/api/admin-content.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const mockVideos: AdminVideoDTO[] = [
  { id: 'vid-1', title: 'Guarda Fechada — Fundamentos', belt_level: BeltLevel.White, duration: 15, views: 245, likes: 38, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-01-15' },
  { id: 'vid-2', title: 'Raspagem de Gancho', belt_level: BeltLevel.White, duration: 12, views: 189, likes: 22, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-01-20' },
  { id: 'vid-3', title: 'Sequência de Chutes — Básico', belt_level: BeltLevel.White, duration: 18, views: 134, likes: 15, professor_name: 'Prof. Fernanda', modality: 'Muay Thai', status: 'published', thumbnail_url: '', created_at: '2026-01-25' },
  { id: 'vid-4', title: 'Clinch e Joelhadas', belt_level: BeltLevel.Yellow, duration: 22, views: 112, likes: 19, professor_name: 'Prof. Fernanda', modality: 'Muay Thai', status: 'draft', thumbnail_url: '', created_at: '2026-01-28' },
  { id: 'vid-5', title: 'Triângulo — Detalhes', belt_level: BeltLevel.Yellow, duration: 20, views: 156, likes: 31, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-02-01' },
  { id: 'vid-6', title: 'Combinações de Boxe', belt_level: BeltLevel.White, duration: 14, views: 95, likes: 12, professor_name: 'Prof. Ricardo', modality: 'Boxe', status: 'published', thumbnail_url: '', created_at: '2026-02-05' },
  { id: 'vid-7', title: 'Defesa Pessoal — Módulo 1', belt_level: BeltLevel.White, duration: 30, views: 67, likes: 8, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'processing', thumbnail_url: '', created_at: '2026-02-08' },
  { id: 'vid-8', title: 'Berimbolo Básico', belt_level: BeltLevel.Green, duration: 25, views: 98, likes: 17, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-02-10' },
  { id: 'vid-10', title: 'Back Take — Spider Guard', belt_level: BeltLevel.Blue, duration: 30, views: 73, likes: 14, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-02-20' },
  { id: 'vid-11', title: 'Preparação Física para Luta', belt_level: BeltLevel.White, duration: 45, views: 210, likes: 44, professor_name: 'Prof. Ricardo', modality: 'MMA', status: 'published', thumbnail_url: '', created_at: '2026-02-25' },
  { id: 'vid-12', title: 'Lapel Guard Avançada', belt_level: BeltLevel.Purple, duration: 28, views: 42, likes: 9, professor_name: 'Prof. André', modality: 'Jiu-Jitsu', status: 'published', thumbnail_url: '', created_at: '2026-03-01' },
  { id: 'vid-13', title: 'Esquivas e Contra-Ataques', belt_level: BeltLevel.Yellow, duration: 16, views: 0, likes: 0, professor_name: 'Prof. Fernanda', modality: 'Muay Thai', status: 'draft', thumbnail_url: '', created_at: '2026-03-10' },
];

export async function mockListAdminVideos(_academyId: string): Promise<AdminVideoDTO[]> {
  await delay();
  return [...mockVideos];
}

export async function mockCreateVideo(data: CreateVideoRequest): Promise<Video> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `vid-new-${Date.now()}`,
    academy_id: 'academy-1',
    title: data.title,
    url: data.url,
    belt_level: data.belt_level,
    duration: data.duration,
    created_at: now,
    updated_at: now,
  };
}

export async function mockDeleteVideo(_id: string): Promise<void> {
  await delay();
}

export async function mockTogglePublish(_id: string, _publish: boolean): Promise<void> {
  await delay();
}

export async function mockGetAdminStorageStats(_academyId: string): Promise<AdminStorageStats> {
  await delay();
  return {
    total_videos: mockVideos.length,
    total_size_gb: 8.5,
    limit_gb: 10,
    usage_percent: 85,
  };
}

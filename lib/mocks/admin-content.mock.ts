import { BeltLevel } from '@/lib/types';
import type { Video } from '@/lib/types';
import type { AdminVideoDTO, CreateVideoRequest } from '@/lib/api/admin-content.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockListAdminVideos(_academyId: string): Promise<AdminVideoDTO[]> {
  await delay();
  return [
    { id: 'vid-1', title: 'Guarda Fechada — Fundamentos', belt_level: BeltLevel.White, duration: 15, views: 245, created_at: '2026-01-15' },
    { id: 'vid-2', title: 'Raspagem de Gancho', belt_level: BeltLevel.White, duration: 12, views: 189, created_at: '2026-01-20' },
    { id: 'vid-5', title: 'Triângulo — Detalhes', belt_level: BeltLevel.Yellow, duration: 20, views: 156, created_at: '2026-02-01' },
    { id: 'vid-8', title: 'Berimbolo Básico', belt_level: BeltLevel.Green, duration: 25, views: 98, created_at: '2026-02-10' },
    { id: 'vid-10', title: 'Back Take — Spider Guard', belt_level: BeltLevel.Blue, duration: 30, views: 73, created_at: '2026-02-20' },
    { id: 'vid-12', title: 'Lapel Guard Avançada', belt_level: BeltLevel.Purple, duration: 28, views: 42, created_at: '2026-03-01' },
  ];
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

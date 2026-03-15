import type { GroupMessage } from '@/lib/api/group-chat.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const MESSAGES: GroupMessage[] = [
  { id: 'gm-1', classId: 'class-1', authorId: 'prof-1', authorName: 'Prof. Silva', content: 'Atenção turma: treino amanhã será focado em finalizações. Tragam seus quimonos limpos!', createdAt: '2026-03-15T10:00:00Z' },
  { id: 'gm-2', classId: 'class-1', authorId: 'student-1', authorName: 'João Silva', content: 'Beleza professor! Vamos estar lá.', createdAt: '2026-03-15T10:15:00Z' },
  { id: 'gm-3', classId: 'class-1', authorId: 'student-2', authorName: 'Ana Costa', content: 'Ótimo! Estou precisando praticar triângulo.', createdAt: '2026-03-15T10:20:00Z' },
  { id: 'gm-4', classId: 'class-1', authorId: 'prof-1', authorName: 'Prof. Silva', content: 'Perfeito Ana! Vamos focar nisso sim. Até amanhã galera!', createdAt: '2026-03-15T10:25:00Z' },
];

export async function mockGetGroupMessages(_classId: string): Promise<GroupMessage[]> {
  await delay();
  return MESSAGES.map((m) => ({ ...m }));
}

export async function mockSendGroupMessage(classId: string, content: string): Promise<GroupMessage> {
  await delay();
  const msg: GroupMessage = { id: `gm-${Date.now()}`, classId, authorId: 'user-1', authorName: 'Você', content, createdAt: new Date().toISOString() };
  MESSAGES.push(msg);
  return msg;
}

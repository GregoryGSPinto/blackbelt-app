import { BeltLevel } from '@/lib/types';
import type { ProfessorDashboardDTO } from '@/lib/api/professor.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetProfessorDashboard(_professorId: string): Promise<ProfessorDashboardDTO> {
  await delay();
  return {
    proximaAula: {
      class_id: 'class-bjj-noite',
      modality_name: 'Brazilian Jiu-Jitsu',
      start_time: '19:00',
      end_time: '20:30',
      unit_name: 'Unidade Centro',
      enrolled_count: 15,
    },
    aulaAtiva: null,
    minhasTurmas: [
      { class_id: 'class-bjj-manha', modality_name: 'BJJ Manhã', enrolled_count: 12, schedule_text: 'Seg/Qua/Sex 07:00-08:30', presenca_media: 78 },
      { class_id: 'class-bjj-noite', modality_name: 'BJJ Noite', enrolled_count: 15, schedule_text: 'Seg/Qua/Sex 19:00-20:30', presenca_media: 82 },
    ],
    meusAlunos: [
      { student_id: 'stu-1', display_name: 'João Mendes', avatar: null, belt: BeltLevel.Blue, ultima_presenca: '2026-03-14' },
      { student_id: 'stu-2', display_name: 'Maria Oliveira', avatar: null, belt: BeltLevel.Purple, ultima_presenca: '2026-03-14' },
      { student_id: 'stu-3', display_name: 'Pedro Santos', avatar: null, belt: BeltLevel.White, ultima_presenca: '2026-03-12' },
      { student_id: 'stu-5', display_name: 'Lucas Ferreira', avatar: null, belt: BeltLevel.Green, ultima_presenca: '2026-03-14' },
      { student_id: 'stu-7', display_name: 'Rafael Souza', avatar: null, belt: BeltLevel.Brown, ultima_presenca: '2026-03-13' },
      { student_id: 'stu-8', display_name: 'Camila Lima', avatar: null, belt: BeltLevel.Blue, ultima_presenca: '2026-03-10' },
    ],
    mensagensRecentes: [
      { conversation_id: 'conv-1', from_name: 'João Mendes', preview: 'Professor, preciso de ajuda com a técnica...', time: '14:30', unread: true },
      { conversation_id: 'conv-2', from_name: 'Maria Oliveira', preview: 'Obrigada pela dica de ontem!', time: '10:15', unread: false },
      { conversation_id: 'conv-3', from_name: 'Rafael Souza', preview: 'Posso fazer reposição na turma de manhã?', time: 'Ontem', unread: true },
    ],
  };
}

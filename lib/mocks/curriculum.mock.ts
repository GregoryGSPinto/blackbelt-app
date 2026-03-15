import type { CurriculumDTO, CurriculumRequirement, StudentCurriculumProgress } from '@/lib/api/curriculum.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const BJJ_BLUE_BELT: CurriculumDTO = {
  id: 'curr-bjj-blue',
  academy_id: 'academy-1',
  modality: 'bjj',
  target_belt: 'azul',
  min_time_months: 24,
  min_attendance: 80,
  min_evaluation_score: 70,
  notes: 'Currículo para promoção à faixa azul. Aluno deve demonstrar domínio das posições fundamentais, defesas e pelo menos 3 finalizações.',
  requirements: [
    { id: 'req-1', category: 'tecnicas_obrigatorias', name: 'Armlock da guarda fechada', description: 'Aplicação correta do armlock partindo da guarda fechada com controle de quadril', video_ref_id: 'vid-101', required: true },
    { id: 'req-2', category: 'tecnicas_obrigatorias', name: 'Triângulo (guarda fechada)', description: 'Triângulo com ajuste de ângulo e finalização correta', video_ref_id: 'vid-102', required: true },
    { id: 'req-3', category: 'tecnicas_obrigatorias', name: 'Kimura da guarda fechada', description: 'Kimura com controle de pulso e rotação correta do ombro', video_ref_id: 'vid-103', required: true },
    { id: 'req-4', category: 'tecnicas_obrigatorias', name: 'Passagem de guarda toreando', description: 'Passagem com controle de calça e pressão lateral', video_ref_id: 'vid-104', required: true },
    { id: 'req-5', category: 'tecnicas_obrigatorias', name: 'Raspagem tesoura', description: 'Raspagem de tesoura da guarda fechada com controle de manga e gola', video_ref_id: 'vid-105', required: true },
    { id: 'req-6', category: 'tecnicas_obrigatorias', name: 'Fuga do mount (elbow-knee escape)', description: 'Escape do mount usando quadril e enquadramento', video_ref_id: 'vid-106', required: true },
    { id: 'req-7', category: 'tecnicas_obrigatorias', name: 'Fuga da lateral (side control escape)', description: 'Recomposição de guarda partindo da posição inferior lateral', required: true },
    { id: 'req-8', category: 'tecnicas_obrigatorias', name: 'Queda: Osoto-gari', description: 'Execução segura da queda com controle do parceiro', required: true },
    { id: 'req-9', category: 'tecnicas_obrigatorias', name: 'Estrangulamento da montada (cross choke)', description: 'Cross choke da montada com postura correta e grip profundo', video_ref_id: 'vid-109', required: true },
    { id: 'req-10', category: 'opcionais', name: 'Guilhotina da guarda fechada', description: 'Guilhotina com controle de cabeça e fechamento de guarda alta', video_ref_id: 'vid-110', required: false },
    { id: 'req-11', category: 'opcionais', name: 'Raspagem pendular', description: 'Raspagem pendular com controle de manga e gola, elevando o quadril', required: false },
    { id: 'req-12', category: 'opcionais', name: 'Passagem de guarda X-pass', description: 'Passagem rápida com controle do joelho e pressão sobre o quadril', required: false },
    { id: 'req-13', category: 'teoricos', name: 'Princípios de base e postura', description: 'Explicar os conceitos de base, postura e conexão em cada posição', required: true },
    { id: 'req-14', category: 'teoricos', name: 'Hierarquia posicional', description: 'Conhecer a hierarquia de posições e pontuação em competição', required: true },
    { id: 'req-15', category: 'comportamentais', name: 'Etiqueta do tatame', description: 'Higiene, respeito aos colegas, pontualidade, cuidar do kimono, cumprimentar ao entrar no tatame', required: true },
  ],
};

const CURRICULA: CurriculumDTO[] = [BJJ_BLUE_BELT];

export async function mockGetCurriculum(_academyId: string, modality: string, belt: string): Promise<CurriculumDTO | null> {
  await delay();
  return CURRICULA.find((c) => c.modality === modality && c.target_belt === belt) ?? null;
}

export async function mockCreateCurriculum(curriculum: Omit<CurriculumDTO, 'id'>): Promise<CurriculumDTO> {
  await delay();
  const created: CurriculumDTO = { ...curriculum, id: `curr-${Date.now()}` };
  CURRICULA.push(created);
  return created;
}

export async function mockUpdateCurriculum(id: string, data: Partial<CurriculumDTO>): Promise<CurriculumDTO> {
  await delay();
  const idx = CURRICULA.findIndex((c) => c.id === id);
  if (idx >= 0) CURRICULA[idx] = { ...CURRICULA[idx], ...data };
  return CURRICULA[idx];
}

export async function mockAddRequirement(curriculumId: string, requirement: Omit<CurriculumRequirement, 'id'>): Promise<CurriculumRequirement> {
  await delay();
  const req: CurriculumRequirement = { ...requirement, id: `req-${Date.now()}` };
  const curr = CURRICULA.find((c) => c.id === curriculumId);
  if (curr) curr.requirements.push(req);
  return req;
}

export async function mockRemoveRequirement(curriculumId: string, requirementId: string): Promise<void> {
  await delay();
  const curr = CURRICULA.find((c) => c.id === curriculumId);
  if (curr) curr.requirements = curr.requirements.filter((r) => r.id !== requirementId);
}

export async function mockGetStudentProgress(_studentId: string, modality: string, belt: string): Promise<StudentCurriculumProgress> {
  await delay();
  const curriculum = CURRICULA.find((c) => c.modality === modality && c.target_belt === belt) ?? BJJ_BLUE_BELT;
  const completed = ['req-1', 'req-2', 'req-5', 'req-6', 'req-8', 'req-13', 'req-15'];
  return {
    curriculum,
    completed,
    total: curriculum.requirements.length,
    completedCount: completed.length,
    percentage: Math.round((completed.length / curriculum.requirements.length) * 100),
  };
}

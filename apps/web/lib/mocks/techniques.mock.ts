import type { TechniqueDTO } from '@/lib/api/techniques.service';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

const TECHNIQUES: TechniqueDTO[] = [
  {
    id: 'tec-1', name: 'Armbar da Guarda Fechada', modality: 'bjj', belt_level: 'branca', category: 'finalização', tags: ['armbar', 'guarda fechada', 'braço'],
    description: 'Finalização clássica do Jiu-Jitsu. Partindo da guarda fechada, controle a postura do oponente, isole o braço e aplique a hiperextensão do cotovelo.',
    video_url: '/mock/ref/armbar-closed-guard.mp4', thumbnail_url: '/mock/ref/thumbs/armbar-closed-guard.jpg',
    key_points: ['Quebrar a postura do oponente', 'Pivotar o quadril 90°', 'Apertar os joelhos no braço', 'Elevar o quadril para finalizar'],
    created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tec-2', name: 'Triângulo (Triangle Choke)', modality: 'bjj', belt_level: 'branca', category: 'finalização', tags: ['triângulo', 'triangle', 'estrangulamento', 'guarda'],
    description: 'Estrangulamento usando as pernas. Isole cabeça e braço do oponente, encaixe a perna e corte o ângulo para comprimir a artéria carótida.',
    video_url: '/mock/ref/triangle.mp4', thumbnail_url: '/mock/ref/thumbs/triangle.jpg',
    key_points: ['Controlar postura e isolar um braço', 'Subir a perna no pescoço', 'Cortar ângulo lateral', 'Puxar a cabeça para baixo para ajustar'],
    created_at: '2026-01-15T10:05:00Z', updated_at: '2026-01-15T10:05:00Z',
  },
  {
    id: 'tec-3', name: 'Passagem Toreando', modality: 'bjj', belt_level: 'branca', category: 'passagem', tags: ['toreando', 'passagem de guarda', 'gi'],
    description: 'Passagem de guarda clássica com controle de calça. Empurre as pernas para o lado e avance lateralmente para conquistar side control.',
    video_url: '/mock/ref/toreando.mp4', thumbnail_url: '/mock/ref/thumbs/toreando.jpg',
    key_points: ['Grip firme nas calças na altura do joelho', 'Pressionar os joelhos ao chão', 'Passar lateralmente com velocidade', 'Consolidar side control imediatamente'],
    created_at: '2026-01-16T08:00:00Z', updated_at: '2026-01-16T08:00:00Z',
  },
  {
    id: 'tec-4', name: 'Berimbolo', modality: 'bjj', belt_level: 'roxa', category: 'transição', tags: ['berimbolo', 'inversão', 'costas'],
    description: 'Técnica avançada de inversão para pegar as costas. Partindo de De La Riva, inverter sob o oponente e emergir nas costas.',
    video_url: '/mock/ref/berimbolo.mp4', thumbnail_url: '/mock/ref/thumbs/berimbolo.jpg',
    key_points: ['Gancho de De La Riva profundo', 'Grip no cinto ou calça', 'Inversão fluida por baixo', 'Emergir nas costas com ganchos'],
    created_at: '2026-01-17T09:00:00Z', updated_at: '2026-01-17T09:00:00Z',
  },
  {
    id: 'tec-5', name: 'Raspagem de Tesoura (Scissor Sweep)', modality: 'bjj', belt_level: 'branca', category: 'raspagem', tags: ['tesoura', 'scissor sweep', 'guarda fechada'],
    description: 'Raspagem básica da guarda fechada. Use o movimento de tesoura com as pernas para derrubar o oponente e montar.',
    video_url: '/mock/ref/scissor-sweep.mp4', thumbnail_url: '/mock/ref/thumbs/scissor-sweep.jpg',
    key_points: ['Abrir a guarda com grip na manga e gola', 'Perna de cima no peito como barreira', 'Perna de baixo corta na canela', 'Movimento simultâneo de tesoura'],
    created_at: '2026-01-18T10:00:00Z', updated_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 'tec-6', name: 'Kimura da Meia-Guarda', modality: 'bjj', belt_level: 'azul', category: 'finalização', tags: ['kimura', 'meia-guarda', 'ombro'],
    description: 'Finalização de ombro partindo da meia-guarda inferior. Isole o braço, aplique a americana invertida (kimura) com controle de quadril.',
    video_url: '/mock/ref/kimura-half.mp4', thumbnail_url: '/mock/ref/thumbs/kimura-half.jpg',
    key_points: ['Controlar o braço com figura de quatro', 'Sentar e criar ângulo', 'Manter cotovelo colado ao corpo', 'Rotacionar o ombro para finalizar'],
    created_at: '2026-01-19T08:00:00Z', updated_at: '2026-01-19T08:00:00Z',
  },
  {
    id: 'tec-7', name: 'Guilhotina (Guillotine Choke)', modality: 'bjj', belt_level: 'branca', category: 'finalização', tags: ['guilhotina', 'guillotine', 'pescoço', 'front headlock'],
    description: 'Estrangulamento frontal. Encaixe o braço sob o queixo, mãos em gable grip e aplique pressão com os antebraços na traqueia/carótida.',
    video_url: '/mock/ref/guillotine.mp4', thumbnail_url: '/mock/ref/thumbs/guillotine.jpg',
    key_points: ['Encaixar braço profundo sob o queixo', 'Gable grip ou S-grip', 'Guarda fechada para controle', 'Puxar para cima com os braços e empurrar com o quadril'],
    created_at: '2026-01-20T09:00:00Z', updated_at: '2026-01-20T09:00:00Z',
  },
  {
    id: 'tec-8', name: 'Passagem de Joelho (Knee Cut Pass)', modality: 'bjj', belt_level: 'azul', category: 'passagem', tags: ['knee cut', 'passagem', 'knee slide'],
    description: 'Passagem moderna e eficiente. Deslize o joelho pela coxa do oponente enquanto controla o quadril e a cabeça.',
    video_url: '/mock/ref/knee-cut.mp4', thumbnail_url: '/mock/ref/thumbs/knee-cut.jpg',
    key_points: ['Underhook na lateral', 'Joelho desliza pela coxa', 'Pressão de quadril constante', 'Controlar a cabeça ou o braço distante'],
    created_at: '2026-01-21T10:00:00Z', updated_at: '2026-01-21T10:00:00Z',
  },
  {
    id: 'tec-9', name: 'Montada (Mount Control)', modality: 'bjj', belt_level: 'branca', category: 'posição', tags: ['montada', 'mount', 'posição dominante'],
    description: 'Controle da posição montada. Manter a base, distribuir o peso e preparar ataques enquanto neutraliza tentativas de fuga.',
    video_url: '/mock/ref/mount-control.mp4', thumbnail_url: '/mock/ref/thumbs/mount-control.jpg',
    key_points: ['Joelhos apertados na cintura', 'Quadril pesado sobre o esterno', 'Mãos no chão para base', 'Reagir às tentativas de fuga mantendo o equilíbrio'],
    created_at: '2026-01-22T08:00:00Z', updated_at: '2026-01-22T08:00:00Z',
  },
  {
    id: 'tec-10', name: 'Oma Plata', modality: 'bjj', belt_level: 'azul', category: 'finalização', tags: ['omoplata', 'ombro', 'guarda'],
    description: 'Finalização de ombro usando as pernas. Da guarda, isolar o braço, pivotar e usar a perna para rotacionar o ombro do oponente.',
    video_url: '/mock/ref/omaplata.mp4', thumbnail_url: '/mock/ref/thumbs/omaplata.jpg',
    key_points: ['Isolar o braço da guarda', 'Pivotar o quadril e encaixar a perna', 'Sentar e controlar o quadril', 'Inclinar para frente para finalizar'],
    created_at: '2026-01-23T09:00:00Z', updated_at: '2026-01-23T09:00:00Z',
  },
  {
    id: 'tec-11', name: 'X-Guard Sweep', modality: 'bjj', belt_level: 'roxa', category: 'raspagem', tags: ['x-guard', 'raspagem', 'inversão'],
    description: 'Raspagem da guarda X. Controlar uma perna com os braços e as duas pernas posicionadas em X para elevar e derrubar o oponente.',
    video_url: '/mock/ref/x-guard-sweep.mp4', thumbnail_url: '/mock/ref/thumbs/x-guard-sweep.jpg',
    key_points: ['Entrar na X-guard com gancho profundo', 'Perna de baixo no quadril, perna de cima atrás do joelho', 'Elevar o oponente', 'Direcionar a queda lateralmente'],
    created_at: '2026-01-24T10:00:00Z', updated_at: '2026-01-24T10:00:00Z',
  },
  {
    id: 'tec-12', name: 'Rear Naked Choke (Mata-Leão)', modality: 'bjj', belt_level: 'branca', category: 'finalização', tags: ['mata-leão', 'RNC', 'costas', 'estrangulamento'],
    description: 'O estrangulamento mais clássico das artes marciais. Das costas, encaixe o braço sob o queixo, mão atrás da cabeça e comprima.',
    video_url: '/mock/ref/rnc.mp4', thumbnail_url: '/mock/ref/thumbs/rnc.jpg',
    key_points: ['Manter ganchos nas costas', 'Braço desliza sob o queixo', 'Mão atrás da cabeça (seatbelt)', 'Expandir o peito para comprimir'],
    created_at: '2026-01-25T08:00:00Z', updated_at: '2026-01-25T08:00:00Z',
  },
  {
    id: 'tec-13', name: 'De La Riva Guard', modality: 'bjj', belt_level: 'azul', category: 'posição', tags: ['de la riva', 'guarda aberta', 'gancho'],
    description: 'Guarda aberta com gancho na perna do oponente. Posição versátil para raspagens, berimbolo e ataques de inversão.',
    video_url: '/mock/ref/dlr-guard.mp4', thumbnail_url: '/mock/ref/thumbs/dlr-guard.jpg',
    key_points: ['Gancho profundo por trás da perna', 'Grip na manga ou calça', 'Quadril ativo e sempre em movimento', 'Manter a outra perna como barreira'],
    created_at: '2026-01-26T09:00:00Z', updated_at: '2026-01-26T09:00:00Z',
  },
  {
    id: 'tec-14', name: 'Osoto Gari', modality: 'judo', belt_level: 'branca', category: 'queda', tags: ['osoto gari', 'queda', 'judo'],
    description: 'Grande varredura externa. Uma das quedas mais fundamentais do judô — desbalancear e ceifar a perna de apoio do adversário.',
    video_url: '/mock/ref/osoto-gari.mp4', thumbnail_url: '/mock/ref/thumbs/osoto-gari.jpg',
    key_points: ['Kuzushi — puxar para desbalancear', 'Perna ceifa atrás do joelho', 'Tronco acompanha o movimento', 'Projetar com todo o corpo'],
    created_at: '2026-01-27T10:00:00Z', updated_at: '2026-01-27T10:00:00Z',
  },
  {
    id: 'tec-15', name: 'Double Leg Takedown', modality: 'wrestling', belt_level: 'branca', category: 'queda', tags: ['double leg', 'queda', 'wrestling', 'takedown'],
    description: 'Queda com pegada nas duas pernas. Abaixar o nível, penetrar e levantar/projetar o oponente.',
    video_url: '/mock/ref/double-leg.mp4', thumbnail_url: '/mock/ref/thumbs/double-leg.jpg',
    key_points: ['Change level — abaixar o quadril', 'Penetration step com o joelho', 'Cabeça no peito do oponente', 'Levantar e projetar lateralmente'],
    created_at: '2026-01-28T08:00:00Z', updated_at: '2026-01-28T08:00:00Z',
  },
  {
    id: 'tec-16', name: 'Low Kick', modality: 'muay-thai', belt_level: 'branca', category: 'striking', tags: ['low kick', 'chute baixo', 'muay thai'],
    description: 'Chute baixo na coxa do oponente. Fundamental do Muay Thai para desgastar a base e mobilidade adversária.',
    video_url: '/mock/ref/low-kick.mp4', thumbnail_url: '/mock/ref/thumbs/low-kick.jpg',
    key_points: ['Giro do quadril para potência', 'Canela como área de impacto', 'Manter guarda alta', 'Retornar à base rapidamente'],
    created_at: '2026-01-29T09:00:00Z', updated_at: '2026-01-29T09:00:00Z',
  },
  {
    id: 'tec-17', name: 'Clinch com Joelhada', modality: 'muay-thai', belt_level: 'azul', category: 'striking', tags: ['clinch', 'joelhada', 'muay thai', 'plum'],
    description: 'Controle de clinch tailandês (plum) com joelhada. Dominar a nuca do oponente e aplicar joelhadas ao tronco.',
    video_url: '/mock/ref/clinch-knee.mp4', thumbnail_url: '/mock/ref/thumbs/clinch-knee.jpg',
    key_points: ['Mãos entrelaçadas atrás da nuca', 'Cotovelos apertados', 'Puxar a cabeça para baixo', 'Joelho sobe reto ao tronco'],
    created_at: '2026-01-30T10:00:00Z', updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'tec-18', name: 'Leg Drag Pass', modality: 'bjj', belt_level: 'roxa', category: 'passagem', tags: ['leg drag', 'passagem', 'no-gi'],
    description: 'Passagem arrastando a perna do oponente. Controlar o tornozelo, arrastar para o lado e avançar com pressão lateral.',
    video_url: '/mock/ref/leg-drag.mp4', thumbnail_url: '/mock/ref/thumbs/leg-drag.jpg',
    key_points: ['Controlar o tornozelo com firmeza', 'Arrastar a perna cruzando a linha central', 'Pressão de quadril lateral', 'Consolidar com crossface'],
    created_at: '2026-02-01T08:00:00Z', updated_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'tec-19', name: 'Defesa de Raspagem (Base Recovery)', modality: 'bjj', belt_level: 'branca', category: 'defesa', tags: ['defesa', 'base', 'fundamentals'],
    description: 'Recuperação de base quando o oponente tenta raspar. Manter postura, ampliar a base e reposicionar os joelhos.',
    video_url: '/mock/ref/base-recovery.mp4', thumbnail_url: '/mock/ref/thumbs/base-recovery.jpg',
    key_points: ['Manter os braços travados no chão', 'Ampliar a base com os joelhos', 'Não cruzar as pernas', 'Postura ereta e quadril baixo'],
    created_at: '2026-02-02T09:00:00Z', updated_at: '2026-02-02T09:00:00Z',
  },
  {
    id: 'tec-20', name: 'Loop Choke', modality: 'bjj', belt_level: 'marrom', category: 'finalização', tags: ['loop choke', 'estrangulamento', 'gi', 'gola'],
    description: 'Estrangulamento com a gola do gi. Aproveitar o momento de entrada do oponente para encaixar a gola e rolar para finalizar.',
    video_url: '/mock/ref/loop-choke.mp4', thumbnail_url: '/mock/ref/thumbs/loop-choke.jpg',
    key_points: ['Grip profundo na gola cruzada', 'Timing na entrada do oponente', 'Rolar por cima mantendo o grip', 'Pressão do antebraço na carótida'],
    created_at: '2026-02-03T10:00:00Z', updated_at: '2026-02-03T10:00:00Z',
  },
];

export async function mockListTechniques(filters?: { modality?: string; category?: string; belt_level?: string; search?: string }): Promise<TechniqueDTO[]> {
  await delay();
  let result = TECHNIQUES.map((t) => ({ ...t }));
  if (filters?.modality) result = result.filter((t) => t.modality === filters.modality);
  if (filters?.category) result = result.filter((t) => t.category === filters.category);
  if (filters?.belt_level) result = result.filter((t) => t.belt_level === filters.belt_level);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)));
  }
  return result;
}

export async function mockGetTechniqueById(techniqueId: string): Promise<TechniqueDTO> {
  await delay(200);
  const technique = TECHNIQUES.find((t) => t.id === techniqueId);
  if (!technique) throw new Error('Técnica não encontrada');
  return { ...technique };
}

export async function mockCreateTechnique(technique: Omit<TechniqueDTO, 'id' | 'created_at' | 'updated_at'>): Promise<TechniqueDTO> {
  await delay(300);
  const newTechnique: TechniqueDTO = {
    ...technique, id: `tec-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  TECHNIQUES.push(newTechnique);
  return newTechnique;
}

export async function mockGetByModality(modality: string): Promise<TechniqueDTO[]> {
  await delay();
  return TECHNIQUES.filter((t) => t.modality === modality).map((t) => ({ ...t }));
}

import type { MarketplaceCourse, MarketplaceFilters, CoursePurchase } from '@/lib/api/marketplace.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const COURSES: MarketplaceCourse[] = [
  {
    id: 'mkt-1', creator_id: 'prof-1', creator_name: 'Prof. Ricardo Almeida', creator_academy: 'Team Kime SP',
    title: 'Guarda Fechada Completa - Do Básico ao Avançado', description: 'Domine todas as variações de guarda fechada com técnicas testadas em competição. Aprenda sweeps, submissions e controle posicional.',
    thumbnail_url: '/img/course-guard.jpg', preview_video_url: '/video/preview-guard.mp4',
    modality: 'bjj', belt_level: 'branca', duration_total: 480, price: 197.90, rating: 4.8, reviews_count: 142, students_count: 856,
    modules: [
      { id: 'mod-1', title: 'Fundamentos da Guarda Fechada', videos: [{ id: 'v1', title: 'Postura e Controle', duration: 12 }, { id: 'v2', title: 'Quebra de Postura', duration: 15 }, { id: 'v3', title: 'Armlock da Guarda', duration: 18 }], duration: 45 },
      { id: 'mod-2', title: 'Sweeps Essenciais', videos: [{ id: 'v4', title: 'Tesoura', duration: 14 }, { id: 'v5', title: 'Hip Bump', duration: 12 }, { id: 'v6', title: 'Pendulum', duration: 16 }], duration: 42 },
      { id: 'mod-3', title: 'Finalizações', videos: [{ id: 'v7', title: 'Triângulo', duration: 20 }, { id: 'v8', title: 'Kimura', duration: 15 }, { id: 'v9', title: 'Omoplata', duration: 18 }], duration: 53 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-2', creator_id: 'prof-2', creator_name: 'Prof. Marcos Souza', creator_academy: 'Academia Tatame RJ',
    title: 'Passagem de Guarda - Sistema Completo', description: 'Sistema passo a passo para passar qualquer tipo de guarda. Inclui pressão, velocidade e técnicas modernas.',
    thumbnail_url: '/img/course-pass.jpg', preview_video_url: '/video/preview-pass.mp4',
    modality: 'bjj', belt_level: 'azul', duration_total: 360, price: 247.00, rating: 4.9, reviews_count: 98, students_count: 623,
    modules: [
      { id: 'mod-4', title: 'Conceitos de Passagem', videos: [{ id: 'v10', title: 'Princípios de Pressão', duration: 14 }, { id: 'v11', title: 'Controle de Quadril', duration: 16 }], duration: 30 },
      { id: 'mod-5', title: 'Passagens de Pressão', videos: [{ id: 'v12', title: 'Over-Under', duration: 20 }, { id: 'v13', title: 'Smash Pass', duration: 18 }], duration: 38 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-3', creator_id: 'prof-3', creator_name: 'Sensei Takeshi Yamamoto', creator_academy: 'Judô Clube Paulista',
    title: 'Ippon Seoi Nage - Técnica Perfeita', description: 'Aprenda o arremesso mais popular do judô com detalhes biomecânicos e variações para competição.',
    thumbnail_url: '/img/course-seoi.jpg', preview_video_url: '/video/preview-seoi.mp4',
    modality: 'judo', belt_level: 'amarela', duration_total: 240, price: 149.90, rating: 4.7, reviews_count: 67, students_count: 412,
    modules: [
      { id: 'mod-6', title: 'Kuzushi e Entrada', videos: [{ id: 'v14', title: 'Desequilíbrio Frontal', duration: 12 }, { id: 'v15', title: 'Entrada Clássica', duration: 15 }], duration: 27 },
      { id: 'mod-7', title: 'Variações Competitivas', videos: [{ id: 'v16', title: 'Drop Seoi', duration: 14 }, { id: 'v17', title: 'Seoi em Movimento', duration: 16 }], duration: 30 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-4', creator_id: 'prof-4', creator_name: 'Prof. Anderson Lima', creator_academy: 'Team Nogueira MMA',
    title: 'MMA Ground and Pound - Estratégias no Solo', description: 'Técnicas de ground and pound para MMA. Posicionamento, strikes e transições.',
    thumbnail_url: '/img/course-gnp.jpg', preview_video_url: '/video/preview-gnp.mp4',
    modality: 'mma', belt_level: 'todas', duration_total: 300, price: 279.90, rating: 4.6, reviews_count: 53, students_count: 318,
    modules: [
      { id: 'mod-8', title: 'Posicionamento no Solo', videos: [{ id: 'v18', title: 'Montada para GnP', duration: 15 }, { id: 'v19', title: 'Meia-guarda Ofensiva', duration: 18 }], duration: 33 },
      { id: 'mod-9', title: 'Strikes Efetivos', videos: [{ id: 'v20', title: 'Cotoveladas Legais', duration: 12 }, { id: 'v21', title: 'Marteladas', duration: 14 }], duration: 26 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-5', creator_id: 'prof-1', creator_name: 'Prof. Ricardo Almeida', creator_academy: 'Team Kime SP',
    title: 'Raspagens Modernas - Jogo por Baixo', description: 'As raspagens mais eficientes do jiu-jitsu moderno. De La Riva, Berimbolo e Single Leg X.',
    thumbnail_url: '/img/course-sweeps.jpg', preview_video_url: '/video/preview-sweeps.mp4',
    modality: 'bjj', belt_level: 'roxa', duration_total: 420, price: 297.00, rating: 4.9, reviews_count: 87, students_count: 445,
    modules: [
      { id: 'mod-10', title: 'De La Riva Guard', videos: [{ id: 'v22', title: 'DLR Básico', duration: 16 }, { id: 'v23', title: 'DLR Sweeps', duration: 20 }], duration: 36 },
      { id: 'mod-11', title: 'Berimbolo System', videos: [{ id: 'v24', title: 'Inversão', duration: 18 }, { id: 'v25', title: 'Back Take', duration: 22 }], duration: 40 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-6', creator_id: 'prof-5', creator_name: 'Prof. Kátia Fernandes', creator_academy: 'Academia Vitória Feminino',
    title: 'BJJ Feminino - Técnicas para Mulheres', description: 'Adaptações técnicas considerando diferenças físicas. Estratégias inteligentes para competição feminina.',
    thumbnail_url: '/img/course-fem.jpg', preview_video_url: '/video/preview-fem.mp4',
    modality: 'bjj', belt_level: 'branca', duration_total: 350, price: 177.00, rating: 4.8, reviews_count: 112, students_count: 678,
    modules: [
      { id: 'mod-12', title: 'Defesa e Escape', videos: [{ id: 'v26', title: 'Escapes da Montada', duration: 15 }, { id: 'v27', title: 'Defesa de Costas', duration: 14 }], duration: 29 },
      { id: 'mod-13', title: 'Jogo Leve e Eficiente', videos: [{ id: 'v28', title: 'X-Guard', duration: 18 }, { id: 'v29', title: 'Knee Shield', duration: 16 }], duration: 34 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-7', creator_id: 'prof-6', creator_name: 'Sensei Paulo Miyagi', creator_academy: 'Budokan Judô',
    title: 'Judô Ne-Waza - Luta no Solo', description: 'Técnicas de solo para judocas. Imobilizações, chaves e estrangulamentos dentro das regras do judô.',
    thumbnail_url: '/img/course-newaza.jpg', preview_video_url: '/video/preview-newaza.mp4',
    modality: 'judo', belt_level: 'verde', duration_total: 280, price: 167.90, rating: 4.5, reviews_count: 45, students_count: 289,
    modules: [
      { id: 'mod-14', title: 'Osae-Komi', videos: [{ id: 'v30', title: 'Kesa-Gatame', duration: 12 }, { id: 'v31', title: 'Yoko-Shiho', duration: 14 }], duration: 26 },
      { id: 'mod-15', title: 'Kansetsu-Waza', videos: [{ id: 'v32', title: 'Juji-Gatame', duration: 16 }, { id: 'v33', title: 'Ude-Garami', duration: 14 }], duration: 30 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-8', creator_id: 'prof-7', creator_name: 'Prof. Diego Brandão', creator_academy: 'Chute Boxe Academy',
    title: 'Muay Thai - Clinch e Joelhadas', description: 'Domine o clinch tailandês e suas variações de joelhadas para competição e defesa pessoal.',
    thumbnail_url: '/img/course-clinch.jpg', preview_video_url: '/video/preview-clinch.mp4',
    modality: 'muay_thai', belt_level: 'todas', duration_total: 320, price: 199.90, rating: 4.7, reviews_count: 76, students_count: 534,
    modules: [
      { id: 'mod-16', title: 'Fundamentos do Clinch', videos: [{ id: 'v34', title: 'Plum Position', duration: 14 }, { id: 'v35', title: 'Controle de Pescoço', duration: 16 }], duration: 30 },
      { id: 'mod-17', title: 'Joelhadas Devastadoras', videos: [{ id: 'v36', title: 'Joelhada Reta', duration: 12 }, { id: 'v37', title: 'Joelhada Curva', duration: 14 }], duration: 26 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-9', creator_id: 'prof-2', creator_name: 'Prof. Marcos Souza', creator_academy: 'Academia Tatame RJ',
    title: 'Leg Locks - Guia Definitivo', description: 'Ataques de perna modernos: heel hook, toe hold, kneebar e defesas essenciais. IBJJF e ADCC rules.',
    thumbnail_url: '/img/course-legs.jpg', preview_video_url: '/video/preview-legs.mp4',
    modality: 'no_gi', belt_level: 'marrom', duration_total: 380, price: 347.00, rating: 4.9, reviews_count: 134, students_count: 521,
    modules: [
      { id: 'mod-18', title: 'Entradas de Perna', videos: [{ id: 'v38', title: 'Single Leg X Entry', duration: 18 }, { id: 'v39', title: '50/50 Entry', duration: 16 }], duration: 34 },
      { id: 'mod-19', title: 'Heel Hook System', videos: [{ id: 'v40', title: 'Inside Heel Hook', duration: 20 }, { id: 'v41', title: 'Outside Heel Hook', duration: 22 }], duration: 42 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-10', creator_id: 'prof-8', creator_name: 'Prof. Roberto Cyborg', creator_academy: 'Fight Sports Brasil',
    title: 'No-Gi Wrestling para BJJ', description: 'Quedas e controle em pé para praticantes de jiu-jitsu sem kimono. Adaptações do wrestling olímpico.',
    thumbnail_url: '/img/course-wrestling.jpg', preview_video_url: '/video/preview-wrestling.mp4',
    modality: 'wrestling', belt_level: 'todas', duration_total: 290, price: 227.00, rating: 4.6, reviews_count: 58, students_count: 367,
    modules: [
      { id: 'mod-20', title: 'Single Leg Takedown', videos: [{ id: 'v42', title: 'Setup e Entrada', duration: 15 }, { id: 'v43', title: 'Finalizações da Queda', duration: 18 }], duration: 33 },
      { id: 'mod-21', title: 'Double Leg', videos: [{ id: 'v44', title: 'Blast Double', duration: 14 }, { id: 'v45', title: 'Double to Trip', duration: 16 }], duration: 30 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-11', creator_id: 'prof-4', creator_name: 'Prof. Anderson Lima', creator_academy: 'Team Nogueira MMA',
    title: 'Defesa Pessoal com MMA', description: 'Técnicas práticas de defesa pessoal baseadas em MMA. Situações reais e reações rápidas.',
    thumbnail_url: '/img/course-selfdef.jpg', preview_video_url: '/video/preview-selfdef.mp4',
    modality: 'mma', belt_level: 'branca', duration_total: 200, price: 127.90, rating: 4.4, reviews_count: 89, students_count: 912,
    modules: [
      { id: 'mod-22', title: 'Distância e Postura', videos: [{ id: 'v46', title: 'Posição Base', duration: 10 }, { id: 'v47', title: 'Controle de Distância', duration: 12 }], duration: 22 },
      { id: 'mod-23', title: 'Contra-Ataques', videos: [{ id: 'v48', title: 'Defesa contra Soco', duration: 14 }, { id: 'v49', title: 'Queda e Controle', duration: 16 }], duration: 30 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-12', creator_id: 'prof-5', creator_name: 'Prof. Kátia Fernandes', creator_academy: 'Academia Vitória Feminino',
    title: 'Competição de BJJ - Preparação Mental e Física', description: 'Prepare-se para sua primeira competição. Periodização, corte de peso saudável e mentalidade competitiva.',
    thumbnail_url: '/img/course-comp.jpg', preview_video_url: '/video/preview-comp.mp4',
    modality: 'bjj', belt_level: 'azul', duration_total: 260, price: 187.00, rating: 4.7, reviews_count: 64, students_count: 398,
    modules: [
      { id: 'mod-24', title: 'Preparação Física', videos: [{ id: 'v50', title: 'Força para BJJ', duration: 20 }, { id: 'v51', title: 'Cardio Específico', duration: 18 }], duration: 38 },
      { id: 'mod-25', title: 'Mentalidade', videos: [{ id: 'v52', title: 'Controle de Ansiedade', duration: 15 }, { id: 'v53', title: 'Visualização', duration: 12 }], duration: 27 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-13', creator_id: 'prof-3', creator_name: 'Sensei Takeshi Yamamoto', creator_academy: 'Judô Clube Paulista',
    title: 'Kata-Waza - Projeções de Ombro', description: 'Todas as técnicas de projeção de ombro do judô. Seoi Nage, Kata Guruma, Morote e variações.',
    thumbnail_url: '/img/course-kata.jpg', preview_video_url: '/video/preview-kata.mp4',
    modality: 'judo', belt_level: 'laranja', duration_total: 310, price: 159.90, rating: 4.6, reviews_count: 41, students_count: 245,
    modules: [
      { id: 'mod-26', title: 'Morote Seoi Nage', videos: [{ id: 'v54', title: 'Pegada e Entrada', duration: 14 }, { id: 'v55', title: 'Execução e Queda', duration: 16 }], duration: 30 },
      { id: 'mod-27', title: 'Kata Guruma Moderno', videos: [{ id: 'v56', title: 'Adaptação sem Perna', duration: 18 }, { id: 'v57', title: 'Fireman Carry', duration: 15 }], duration: 33 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-14', creator_id: 'prof-7', creator_name: 'Prof. Diego Brandão', creator_academy: 'Chute Boxe Academy',
    title: 'Low Kicks que Destroem', description: 'Chutes baixos devastadores. Timing, ângulo, setup e como lidar com checagem.',
    thumbnail_url: '/img/course-lowkick.jpg', preview_video_url: '/video/preview-lowkick.mp4',
    modality: 'muay_thai', belt_level: 'todas', duration_total: 220, price: 157.90, rating: 4.5, reviews_count: 52, students_count: 421,
    modules: [
      { id: 'mod-28', title: 'Mecânica do Chute', videos: [{ id: 'v58', title: 'Rotação de Quadril', duration: 14 }, { id: 'v59', title: 'Ângulos de Ataque', duration: 12 }], duration: 26 },
      { id: 'mod-29', title: 'Setups e Combos', videos: [{ id: 'v60', title: 'Jab-Low Kick', duration: 15 }, { id: 'v61', title: 'Switch Kick', duration: 13 }], duration: 28 },
    ],
    status: 'published',
  },
  {
    id: 'mkt-15', creator_id: 'prof-8', creator_name: 'Prof. Roberto Cyborg', creator_academy: 'Fight Sports Brasil',
    title: 'Back Takes - A Arte de Pegar as Costas', description: 'Entradas para as costas a partir de todas as posições. Controle, manutenção e finalizações.',
    thumbnail_url: '/img/course-back.jpg', preview_video_url: '/video/preview-back.mp4',
    modality: 'bjj', belt_level: 'roxa', duration_total: 340, price: 267.00, rating: 4.8, reviews_count: 91, students_count: 476,
    modules: [
      { id: 'mod-30', title: 'Entradas das Costas', videos: [{ id: 'v62', title: 'Chair Sit', duration: 16 }, { id: 'v63', title: 'Arm Drag', duration: 14 }], duration: 30 },
      { id: 'mod-31', title: 'Controle e Finalização', videos: [{ id: 'v64', title: 'Seatbelt Control', duration: 18 }, { id: 'v65', title: 'Rear Naked Choke', duration: 20 }], duration: 38 },
    ],
    status: 'published',
  },
];

const PURCHASES: CoursePurchase[] = [
  { id: 'purch-1', course_id: 'mkt-1', course_title: 'Guarda Fechada Completa - Do Básico ao Avançado', course_thumbnail: '/img/course-guard.jpg', creator_name: 'Prof. Ricardo Almeida', purchased_at: '2026-01-15T10:30:00Z', price: 197.90, progress: 65 },
  { id: 'purch-2', course_id: 'mkt-3', course_title: 'Ippon Seoi Nage - Técnica Perfeita', course_thumbnail: '/img/course-seoi.jpg', creator_name: 'Sensei Takeshi Yamamoto', purchased_at: '2026-02-20T14:00:00Z', price: 149.90, progress: 30 },
  { id: 'purch-3', course_id: 'mkt-8', course_title: 'Muay Thai - Clinch e Joelhadas', course_thumbnail: '/img/course-clinch.jpg', creator_name: 'Prof. Diego Brandão', purchased_at: '2026-03-01T09:00:00Z', price: 199.90, progress: 10 },
];

export async function mockListCourses(filters?: MarketplaceFilters): Promise<MarketplaceCourse[]> {
  await delay();
  let result = COURSES.filter((c) => c.status === 'published');
  if (filters?.modality) result = result.filter((c) => c.modality === filters.modality);
  if (filters?.belt_level) result = result.filter((c) => c.belt_level === filters.belt_level || c.belt_level === 'todas');
  if (filters?.min_price !== undefined) result = result.filter((c) => c.price >= filters.min_price!);
  if (filters?.max_price !== undefined) result = result.filter((c) => c.price <= filters.max_price!);
  if (filters?.min_rating !== undefined) result = result.filter((c) => c.rating >= filters.min_rating!);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.creator_name.toLowerCase().includes(q));
  }
  if (filters?.category === 'mais_vendidos') result = [...result].sort((a, b) => b.students_count - a.students_count);
  if (filters?.category === 'novos') result = [...result].reverse();
  return result.map((c) => ({ ...c }));
}

export async function mockGetCourse(id: string): Promise<MarketplaceCourse> {
  await delay();
  const course = COURSES.find((c) => c.id === id);
  if (!course) throw new Error('Course not found');
  return { ...course };
}

export async function mockPurchaseCourse(courseId: string, _userId: string): Promise<CoursePurchase> {
  await delay();
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) throw new Error('Course not found');
  const purchase: CoursePurchase = {
    id: `purch-${Date.now()}`,
    course_id: courseId,
    course_title: course.title,
    course_thumbnail: course.thumbnail_url,
    creator_name: course.creator_name,
    purchased_at: new Date().toISOString(),
    price: course.price,
    progress: 0,
  };
  PURCHASES.push(purchase);
  course.students_count++;
  return purchase;
}

export async function mockGetMyPurchases(_userId: string): Promise<CoursePurchase[]> {
  await delay();
  return PURCHASES.map((p) => ({ ...p }));
}

export async function mockGetMySales(_creatorId: string): Promise<CoursePurchase[]> {
  await delay();
  return [
    { id: 'sale-1', course_id: 'mkt-1', course_title: 'Guarda Fechada Completa', course_thumbnail: '/img/course-guard.jpg', creator_name: 'Aluno João Silva', purchased_at: '2026-03-10T08:00:00Z', price: 197.90, progress: 45 },
    { id: 'sale-2', course_id: 'mkt-1', course_title: 'Guarda Fechada Completa', course_thumbnail: '/img/course-guard.jpg', creator_name: 'Aluna Maria Santos', purchased_at: '2026-03-12T11:00:00Z', price: 197.90, progress: 20 },
    { id: 'sale-3', course_id: 'mkt-5', course_title: 'Raspagens Modernas', course_thumbnail: '/img/course-sweeps.jpg', creator_name: 'Aluno Pedro Costa', purchased_at: '2026-03-08T15:00:00Z', price: 297.00, progress: 60 },
    { id: 'sale-4', course_id: 'mkt-5', course_title: 'Raspagens Modernas', course_thumbnail: '/img/course-sweeps.jpg', creator_name: 'Aluno Carlos Mendes', purchased_at: '2026-03-05T09:30:00Z', price: 297.00, progress: 35 },
  ];
}

import type { PlanoAula, SemanaPlanejamento, CreatePlanoPayload } from '@/lib/api/plano-aula.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const PLANOS: PlanoAula[] = [
  // Semana 11 (03/10-03/14) — Tema: Guarda Fechada
  { id: 'plano-1', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-10', status: 'concluido', aquecimento: { descricao: 'Corrida leve + solo drills (shrimp, bridge, granby roll)', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Armbar da guarda fechada', posicao: 'Guarda Fechada' }, { nome: 'Triângulo', posicao: 'Guarda Fechada' }, { nome: 'Combinação armbar → triângulo', posicao: 'Guarda Fechada' }], duracaoMinutos: 35, observacoes: 'Foco na quebra de postura' }, pratica: { tipo: 'sparring_posicional', descricao: 'Sparring posicional — só guarda fechada, 3min cada lado', duracaoMinutos: 20, regras: 'Passador vs guardeiro, só guarda fechada' }, encerramento: { descricao: 'Alongamento + feedback da turma', duracaoMinutos: 5 }, duracaoTotal: 70, temaDaSemana: 'Guarda Fechada', nivelFoco: 'todos', notas: 'Revisar controle de postura antes de atacar' },
  { id: 'plano-2', professorId: 'prof-1', turmaId: 'turma-bjj-manha', turmaNome: 'BJJ Manhã — Todos os níveis', data: '2026-03-10', status: 'concluido', aquecimento: { descricao: 'Corrida + animal walk', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Scissor Sweep', posicao: 'Guarda Fechada' }, { nome: 'Hip Bump Sweep', posicao: 'Guarda Fechada' }], duracaoMinutos: 30 }, pratica: { tipo: 'drill', descricao: 'Repetição de raspagens em cadeia', duracaoMinutos: 15 }, encerramento: { descricao: 'Alongamento guiado', duracaoMinutos: 5 }, duracaoTotal: 60, temaDaSemana: 'Guarda Fechada', nivelFoco: 'branca-azul', notas: 'Conceito de desequilíbrio' },
  { id: 'plano-3', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-12', status: 'concluido', aquecimento: { descricao: 'Puxada de guarda + queda técnica', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Omoplata', posicao: 'Guarda Fechada' }, { nome: 'Kimura', posicao: 'Guarda Fechada' }, { nome: 'Cross Choke', posicao: 'Guarda Fechada' }], duracaoMinutos: 35 }, pratica: { tipo: 'sparring_livre', descricao: 'Sparring livre começando da guarda', duracaoMinutos: 20, regras: 'Começar da guarda fechada' }, encerramento: { descricao: 'Roda de conversa sobre a semana', duracaoMinutos: 5 }, duracaoTotal: 70, temaDaSemana: 'Guarda Fechada', nivelFoco: 'azul+', notas: 'Cadeia de ataques: omoplata → kimura → cross choke' },
  { id: 'plano-4', professorId: 'prof-1', turmaId: 'turma-bjj-manha', turmaNome: 'BJJ Manhã — Todos os níveis', data: '2026-03-12', status: 'concluido', aquecimento: { descricao: 'Solo drills básicos', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Retenção de guarda fechada', posicao: 'Guarda Fechada' }], duracaoMinutos: 25 }, pratica: { tipo: 'drill', descricao: 'Drill de retenção: parceiro tenta abrir, guardeiro mantém', duracaoMinutos: 15 }, encerramento: { descricao: 'Alongamento', duracaoMinutos: 5 }, duracaoTotal: 55, temaDaSemana: 'Guarda Fechada', nivelFoco: 'branca-azul', notas: '' },
  { id: 'plano-5', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-14', status: 'concluido', aquecimento: { descricao: 'Corrida + movimentação de guarda', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Flower Sweep', posicao: 'Guarda Fechada' }, { nome: 'Pendulum Sweep', posicao: 'Guarda Fechada' }], duracaoMinutos: 30, observacoes: 'Ênfase no timing' }, pratica: { tipo: 'sparring_posicional', descricao: 'King of the hill — guardeiro tenta raspar', duracaoMinutos: 20, regras: 'Quem raspa fica, quem perde sai' }, encerramento: { descricao: 'Feedback + revisão da semana', duracaoMinutos: 5 }, duracaoTotal: 65, temaDaSemana: 'Guarda Fechada', nivelFoco: 'todos', notas: 'Encerramento da semana de guarda fechada' },
  { id: 'plano-6', professorId: 'prof-1', turmaId: 'turma-muaythai', turmaNome: 'Muay Thai — Intermediário', data: '2026-03-14', status: 'concluido', aquecimento: { descricao: 'Pular corda + shadow boxing', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Jab-Cross-Hook', posicao: 'Em Pé' }, { nome: 'Low Kick', posicao: 'Em Pé' }], duracaoMinutos: 25 }, pratica: { tipo: 'sparring_posicional', descricao: 'Sparring técnico — só mãos + low kick', duracaoMinutos: 15, regras: 'Sem chutes altos, sem clinch' }, encerramento: { descricao: 'Abdominais + alongamento', duracaoMinutos: 10 }, duracaoTotal: 60, temaDaSemana: 'Combinações básicas', nivelFoco: 'todos', notas: '' },
  // Semana 12 (03/17-03/21) — Tema: Passagem de Guarda
  { id: 'plano-7', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-17', status: 'planejado', aquecimento: { descricao: 'Solo drills de passagem (hip switch, knee cut drill)', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Toreando', posicao: 'Em Pé' }, { nome: 'Over-Under', posicao: 'Meia Guarda' }], duracaoMinutos: 35, observacoes: 'Conceito: controlar quadril antes de passar' }, pratica: { tipo: 'sparring_posicional', descricao: 'Passador vs guardeiro, 3min cada lado', duracaoMinutos: 20, regras: 'Guardeiro pode usar qualquer guarda' }, encerramento: { descricao: 'Alongamento + Q&A', duracaoMinutos: 5 }, duracaoTotal: 70, temaDaSemana: 'Passagem de Guarda', nivelFoco: 'todos', notas: 'Primeira aula da semana de passagem' },
  { id: 'plano-8', professorId: 'prof-1', turmaId: 'turma-bjj-manha', turmaNome: 'BJJ Manhã — Todos os níveis', data: '2026-03-17', status: 'planejado', aquecimento: { descricao: 'Corrida + bear crawl', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Toreando básico', posicao: 'Em Pé' }], duracaoMinutos: 25 }, pratica: { tipo: 'drill', descricao: 'Drill de toreando em sequência', duracaoMinutos: 15 }, encerramento: { descricao: 'Alongamento', duracaoMinutos: 5 }, duracaoTotal: 55, temaDaSemana: 'Passagem de Guarda', nivelFoco: 'branca-azul', notas: '' },
  { id: 'plano-9', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-19', status: 'planejado', aquecimento: { descricao: 'Movimentação + guard retention drills', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Knee Slice', posicao: 'Meia Guarda' }, { nome: 'Leg Drag', posicao: 'Guarda Aberta' }], duracaoMinutos: 35 }, pratica: { tipo: 'sparring_posicional', descricao: 'Passador começa em pé, guardeiro sentado', duracaoMinutos: 20, regras: 'Reinicia se guardeiro raspar' }, encerramento: { descricao: 'Feedback coletivo', duracaoMinutos: 5 }, duracaoTotal: 70, temaDaSemana: 'Passagem de Guarda', nivelFoco: 'azul+', notas: '' },
  { id: 'plano-10', professorId: 'prof-1', turmaId: 'turma-bjj-manha', turmaNome: 'BJJ Manhã — Todos os níveis', data: '2026-03-19', status: 'planejado', aquecimento: { descricao: 'Solo drills', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Knee Slice básico', posicao: 'Meia Guarda' }], duracaoMinutos: 25 }, pratica: { tipo: 'drill', descricao: 'Drill de knee slice progressivo', duracaoMinutos: 15 }, encerramento: { descricao: 'Alongamento guiado', duracaoMinutos: 5 }, duracaoTotal: 55, temaDaSemana: 'Passagem de Guarda', nivelFoco: 'branca-azul', notas: '' },
  { id: 'plano-11', professorId: 'prof-1', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', data: '2026-03-21', status: 'planejado', aquecimento: { descricao: 'Corrida + drills de base', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Body Lock Pass', posicao: 'Em Pé' }, { nome: 'Stack Pass', posicao: 'Guarda Fechada' }], duracaoMinutos: 30 }, pratica: { tipo: 'sparring_livre', descricao: 'Sparring livre 5x5min', duracaoMinutos: 25, regras: 'Foco em aplicar passagens da semana' }, encerramento: { descricao: 'Roda de conversa + revisão semanal', duracaoMinutos: 5 }, duracaoTotal: 70, temaDaSemana: 'Passagem de Guarda', nivelFoco: 'todos', notas: 'Encerramento da semana de passagem' },
  { id: 'plano-12', professorId: 'prof-1', turmaId: 'turma-muaythai', turmaNome: 'Muay Thai — Intermediário', data: '2026-03-17', status: 'planejado', aquecimento: { descricao: 'Shadow boxing 3 rounds', duracaoMinutos: 10 }, tecnicaPrincipal: { tecnicas: [{ nome: 'Clinch', posicao: 'Em Pé' }, { nome: 'Knee from Clinch', posicao: 'Em Pé' }], duracaoMinutos: 25 }, pratica: { tipo: 'sparring_posicional', descricao: 'Sparring de clinch — somente joelhadas e sweeps', duracaoMinutos: 15, regras: 'Sem socos, sem chutes a distância' }, encerramento: { descricao: 'Alongamento + feedback', duracaoMinutos: 10 }, duracaoTotal: 60, temaDaSemana: 'Clinch e controle', nivelFoco: 'todos', notas: '' },
];

export async function mockCreatePlano(dados: CreatePlanoPayload): Promise<PlanoAula> {
  await delay(500);
  const turmaNames: Record<string, string> = { 'turma-bjj-noite': 'BJJ Noite — Avançada', 'turma-bjj-manha': 'BJJ Manhã — Todos os níveis', 'turma-muaythai': 'Muay Thai — Intermediário' };
  const plano: PlanoAula = {
    id: `plano-${Date.now()}`,
    professorId: 'prof-1',
    turmaId: dados.turmaId,
    turmaNome: turmaNames[dados.turmaId] ?? dados.turmaId,
    data: dados.data,
    status: 'planejado',
    aquecimento: dados.aquecimento,
    tecnicaPrincipal: dados.tecnicaPrincipal,
    pratica: dados.pratica,
    encerramento: dados.encerramento,
    duracaoTotal: dados.aquecimento.duracaoMinutos + dados.tecnicaPrincipal.duracaoMinutos + dados.pratica.duracaoMinutos + dados.encerramento.duracaoMinutos,
    temaDaSemana: dados.temaDaSemana,
    nivelFoco: dados.nivelFoco,
    materiais: dados.materiais,
    notas: dados.notas,
  };
  PLANOS.push(plano);
  return plano;
}

export async function mockUpdatePlano(id: string, dados: Partial<CreatePlanoPayload>): Promise<PlanoAula> {
  await delay(400);
  const plano = PLANOS.find((p) => p.id === id);
  if (plano) Object.assign(plano, dados);
  return plano ?? PLANOS[0];
}

export async function mockListPlanos(_professorId: string, _periodo?: string): Promise<PlanoAula[]> {
  await delay(500);
  return PLANOS.map((p) => ({ ...p }));
}

export async function mockGetSemana(_professorId: string, semana: string): Promise<SemanaPlanejamento> {
  await delay(500);
  const weekMap: Record<string, { start: string; end: string; tema: string }> = {
    '2026-W11': { start: '2026-03-10', end: '2026-03-16', tema: 'Guarda Fechada' },
    '2026-W12': { start: '2026-03-17', end: '2026-03-23', tema: 'Passagem de Guarda' },
  };
  const info = weekMap[semana] ?? weekMap['2026-W12'];
  const aulas = PLANOS.filter((p) => p.data >= (info?.start ?? '') && p.data <= (info?.end ?? ''));
  return { semana, tema: info?.tema ?? '', aulas };
}

export async function mockDuplicarPlano(id: string, novaData: string): Promise<PlanoAula> {
  await delay(400);
  const original = PLANOS.find((p) => p.id === id) ?? PLANOS[0];
  const copia: PlanoAula = { ...original, id: `plano-${Date.now()}`, data: novaData, status: 'planejado' };
  PLANOS.push(copia);
  return copia;
}

export async function mockGetProximaAula(_professorId: string): Promise<PlanoAula | null> {
  await delay(300);
  const hoje = '2026-03-17';
  const proximas = PLANOS.filter((p) => p.data >= hoje && p.status === 'planejado').sort((a, b) => a.data.localeCompare(b.data));
  return proximas[0] ?? null;
}

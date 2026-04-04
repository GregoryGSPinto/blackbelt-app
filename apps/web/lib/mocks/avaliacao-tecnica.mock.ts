import type { AvaliacaoTecnica, EvolucaoAluno } from '@/lib/api/avaliacao-tecnica.service';
import { CRITERIOS_BJJ } from '@/lib/api/avaliacao-tecnica.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const ALUNOS_NOMES: Record<string, { nome: string; faixa: string }> = {
  'alu-1': { nome: 'Pedro Silva', faixa: 'azul' },
  'alu-2': { nome: 'Ana Costa', faixa: 'roxa' },
  'alu-3': { nome: 'João Oliveira', faixa: 'branca' },
  'alu-4': { nome: 'Maria Santos', faixa: 'azul' },
  'alu-5': { nome: 'Lucas Mendes', faixa: 'branca' },
  'alu-6': { nome: 'Fernanda Lima', faixa: 'azul' },
  'alu-7': { nome: 'Carlos Souza', faixa: 'roxa' },
  'alu-8': { nome: 'Juliana Ferreira', faixa: 'branca' },
  'alu-9': { nome: 'Rafael Almeida', faixa: 'marrom' },
  'alu-10': { nome: 'Beatriz Rocha', faixa: 'azul' },
  'alu-11': { nome: 'Thiago Nascimento', faixa: 'branca' },
  'alu-12': { nome: 'Camila Barbosa', faixa: 'azul' },
  'alu-13': { nome: 'Gustavo Martins', faixa: 'roxa' },
  'alu-14': { nome: 'Patricia Gomes', faixa: 'azul' },
  'alu-15': { nome: 'Diego Cardoso', faixa: 'branca' },
};

function makeNotas(base: number[], variance = 0.5): { slug: string; nota: number }[] {
  return CRITERIOS_BJJ.map((c, i) => ({
    slug: c.slug,
    nota: Math.max(0, Math.min(10, base[i] + (Math.random() - 0.5) * variance * 2)),
  }));
}

function media(criterios: { nota: number }[]): number {
  return +(criterios.reduce((s, c) => s + c.nota, 0) / criterios.length).toFixed(1);
}

function recomendacao(criterios: { nota: number }[], faixa: string): 'manter_faixa' | 'quase_pronto' | 'pronto_para_promover' {
  const minimos: Record<string, number> = { branca: 4, azul: 5, roxa: 6, marrom: 7 };
  const min = minimos[faixa] ?? 5;
  const abaixo = criterios.filter((c) => c.nota < min).length;
  if (abaixo === 0) return 'pronto_para_promover';
  if (abaixo <= 2) return 'quase_pronto';
  return 'manter_faixa';
}

const AVALIACOES: AvaliacaoTecnica[] = [];
const dates = ['2025-10-15', '2025-11-20', '2025-12-18', '2026-01-22', '2026-02-19', '2026-03-15'];

// Generate 30 evaluations across 15 students, 6 months
const studentBases: Record<string, number[][]> = {
  'alu-1': [[5, 4, 5, 4, 3, 4, 3, 5], [5.5, 4.5, 5.5, 4.5, 3.5, 4.5, 3.5, 5.5]],
  'alu-2': [[7, 6, 7, 6, 5, 7, 6, 7], [7.5, 6.5, 7.5, 7, 5.5, 7.5, 6.5, 7.5]],
  'alu-3': [[3, 2, 2, 3, 2, 2, 2, 3], [3.5, 2.5, 2.5, 3.5, 2.5, 2.5, 2.5, 3.5]],
  'alu-4': [[6, 5, 5, 5, 4, 6, 5, 5], [6.5, 5.5, 6, 6, 5, 6.5, 5.5, 6]],  // pronto para promover
  'alu-5': [[2, 1, 1, 2, 1, 1, 1, 2], [2.5, 1.5, 1.5, 2.5, 1.5, 1.5, 1.5, 2.5]],
  'alu-6': [[5, 4, 4, 5, 3, 4, 3, 4], [5, 4, 4, 5, 3, 4, 3, 4]],
  'alu-7': [[7, 7, 8, 7, 6, 7, 7, 7], [7.5, 7.5, 8.5, 7.5, 6.5, 7.5, 7.5, 7.5]],
  'alu-8': [[3, 2, 2, 3, 2, 3, 2, 3], [4, 3, 3, 4, 3, 3.5, 2.5, 3.5]],  // subindo
  'alu-9': [[8, 8, 9, 8, 7, 8, 7, 8], [8.5, 8.5, 9, 8.5, 7.5, 8.5, 7.5, 8.5]],  // pronto para preta
  'alu-10': [[5, 5, 5, 4, 4, 5, 4, 5], [5.5, 5, 5, 4, 4, 5, 3.5, 4.5]],  // caindo em 2 critérios
  'alu-11': [[3, 2, 2, 2, 1, 2, 1, 2], [3, 2, 2, 2, 1, 2, 1, 2]],
  'alu-12': [[4, 4, 4, 4, 3, 4, 3, 4], [5, 4.5, 4.5, 4.5, 3.5, 4.5, 3.5, 4.5]],  // subindo
  'alu-13': [[7, 6, 7, 7, 5, 7, 6, 6], [7, 6, 6.5, 7, 5, 7, 5.5, 6]],  // caindo ligeiramente
  'alu-14': [[5, 4, 4, 5, 3, 4, 3, 4], [5, 4, 4, 5, 3, 4, 3, 4]],
  'alu-15': [[2, 2, 2, 2, 2, 2, 1, 2], [3, 2.5, 2.5, 3, 2.5, 2.5, 2, 3]],  // subindo
};

let evalId = 1;
for (const [alunoId, bases] of Object.entries(studentBases)) {
  const info = ALUNOS_NOMES[alunoId];
  for (let i = 0; i < bases.length; i++) {
    const criterios = makeNotas(bases[i], 0.3);
    const med = media(criterios);
    AVALIACOES.push({
      id: `eval-${evalId++}`,
      alunoId,
      alunoNome: info.nome,
      professorId: 'prof-1',
      professorNome: 'André Galvão',
      data: dates[dates.length - bases.length + i],
      faixaNoMomento: info.faixa,
      criterios,
      mediaGeral: med,
      observacoes: `Avaliação periódica de ${info.nome}.`,
      recomendacao: recomendacao(criterios, info.faixa),
    });
  }
}

export async function mockCreateAvaliacao(
  alunoId: string,
  criterios: { slug: string; nota: number }[],
  observacoes: string,
): Promise<AvaliacaoTecnica> {
  await delay(500);
  const info = ALUNOS_NOMES[alunoId] ?? { nome: 'Aluno', faixa: 'branca' };
  const med = media(criterios);
  const avaliacao: AvaliacaoTecnica = {
    id: `eval-${Date.now()}`,
    alunoId,
    alunoNome: info.nome,
    professorId: 'prof-1',
    professorNome: 'André Galvão',
    data: new Date().toISOString().split('T')[0],
    faixaNoMomento: info.faixa,
    criterios,
    mediaGeral: med,
    observacoes,
    recomendacao: recomendacao(criterios, info.faixa),
  };
  AVALIACOES.unshift(avaliacao);
  return avaliacao;
}

export async function mockListAvaliacoes(
  _professorId: string,
  filtros?: { turmaId?: string; periodo?: string; faixa?: string },
): Promise<AvaliacaoTecnica[]> {
  await delay(500);
  let result = [...AVALIACOES];
  if (filtros?.faixa) result = result.filter((a) => a.faixaNoMomento === filtros.faixa);
  return result.sort((a, b) => b.data.localeCompare(a.data));
}

export async function mockGetEvolucaoAluno(alunoId: string): Promise<EvolucaoAluno> {
  await delay(500);
  const avaliacoes = AVALIACOES.filter((a) => a.alunoId === alunoId).sort((a, b) => a.data.localeCompare(b.data));
  const info = ALUNOS_NOMES[alunoId] ?? { nome: 'Aluno', faixa: 'branca' };
  const minimos: Record<string, number> = { branca: 4, azul: 5, roxa: 6, marrom: 7 };
  const min = minimos[info.faixa] ?? 5;

  const evolucaoPorCriterio = CRITERIOS_BJJ.map((c) => {
    const historico = avaliacoes.map((a) => ({
      data: a.data,
      nota: a.criterios.find((cr) => cr.slug === c.slug)?.nota ?? 0,
    }));
    const first = historico[0]?.nota ?? 0;
    const last = historico[historico.length - 1]?.nota ?? 0;
    const diff = last - first;
    return {
      slug: c.slug,
      nome: c.nome,
      historico,
      tendencia: (diff > 0.5 ? 'subindo' : diff < -0.5 ? 'caindo' : 'estavel') as 'subindo' | 'estavel' | 'caindo',
    };
  });

  const ultima = avaliacoes[avaliacoes.length - 1];
  const penultima = avaliacoes[avaliacoes.length - 2];

  const requisitosPromocao = CRITERIOS_BJJ.map((c) => {
    const nota = ultima?.criterios.find((cr) => cr.slug === c.slug)?.nota ?? 0;
    return { criterio: c.nome, notaAtual: +nota.toFixed(1), notaMinima: min, atingiu: nota >= min };
  });

  return {
    alunoId,
    avaliacoes,
    evolucaoPorCriterio,
    mediaAtual: ultima?.mediaGeral ?? 0,
    mediaAnterior: penultima?.mediaGeral ?? 0,
    prontoParaPromocao: requisitosPromocao.every((r) => r.atingiu),
    requisitosPromocao,
  };
}

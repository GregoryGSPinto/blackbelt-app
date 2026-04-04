import type { FaixaKids } from '@/lib/api/kids-faixa.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockGetFaixaKids(_studentId: string): Promise<FaixaKids> {
  await delay();
  return {
    faixaAtual: {
      nome: 'Cinza',
      cor: '#9ca3af',
      emoji: '\u{1FA76}',
      desde: '2026-01-15',
      mensagem: 'Voc\u00ea est\u00e1 arrasando com a faixa cinza! Continue treinando forte!',
    },
    proximaFaixa: {
      nome: 'Amarela',
      cor: '#facc15',
      emoji: '\u{1F49B}',
      mensagem: 'A faixa amarela est\u00e1 quase l\u00e1! Complete suas coisas boas para conseguir!',
    },
    historicoFaixas: [
      {
        nome: 'Branca',
        cor: '#ffffff',
        emoji: '\u2B1C',
        data: '2025-08-10',
        mensagem: 'Primeira faixa! O come\u00e7o da jornada marcial!',
      },
      {
        nome: 'Cinza',
        cor: '#9ca3af',
        emoji: '\u{1FA76}',
        data: '2026-01-15',
        mensagem: 'Evoluiu para faixa cinza! Parab\u00e9ns pela dedica\u00e7\u00e3o!',
      },
    ],
    coisasBoas: [
      {
        emoji: '\u{1F938}',
        texto: 'Executar 3 rolamentos perfeitos na aula',
        feito: true,
      },
      {
        emoji: '\u{1F91D}',
        texto: 'Ajudar um colega a aprender uma t\u00e9cnica nova',
        feito: true,
      },
      {
        emoji: '\u{1F94B}',
        texto: 'Praticar a sequ\u00eancia de defesa pessoal completa',
        feito: false,
      },
    ],
  };
}

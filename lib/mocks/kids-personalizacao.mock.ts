import type { PersonalizacaoKids } from '@/lib/api/kids-personalizacao.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockGetPersonalizacao(_studentId: string): Promise<PersonalizacaoKids> {
  await delay();
  return {
    mascoteAtual: 'm-1',
    mascotesDisponiveis: [
      { id: 'm-1', nome: 'Le\u00e3o', emoji: '\u{1F981}', desbloqueado: true },
      { id: 'm-2', nome: 'Drag\u00e3o', emoji: '\u{1F409}', desbloqueado: true, requisito: 'N\u00edvel 3' },
      { id: 'm-3', nome: '\u00c1guia', emoji: '\u{1F985}', desbloqueado: true, requisito: 'N\u00edvel 5' },
      { id: 'm-4', nome: 'Urso', emoji: '\u{1F43B}', desbloqueado: false, requisito: 'N\u00edvel 7' },
      { id: 'm-5', nome: 'Tigre', emoji: '\u{1F42F}', desbloqueado: false, requisito: 'N\u00edvel 10' },
      { id: 'm-6', nome: 'Tubar\u00e3o', emoji: '\u{1F988}', desbloqueado: false, requisito: 'N\u00edvel 13' },
      { id: 'm-7', nome: 'F\u00eanix', emoji: '\u{1F426}\u200D\u{1F525}', desbloqueado: false, requisito: 'N\u00edvel 15' },
      { id: 'm-8', nome: 'Drag\u00e3o Dourado', emoji: '\u{1F432}', desbloqueado: false, requisito: 'N\u00edvel 20' },
    ],
    molduraAtual: 'mol-1',
    molduras: [
      { id: 'mol-1', nome: 'Padr\u00e3o', css: 'border-2 border-gray-300 rounded-full', desbloqueada: true },
      { id: 'mol-2', nome: 'Estrelas', css: 'border-2 border-yellow-400 rounded-full shadow-lg shadow-yellow-200', desbloqueada: false, requisito: 'Resgatar com 60 estrelas' },
      { id: 'mol-3', nome: 'Arco-\u00edris', css: 'border-4 border-transparent bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 rounded-full', desbloqueada: false, requisito: 'Resgatar com 120 estrelas' },
    ],
    corAtual: 'cor-1',
    cores: [
      { id: 'cor-1', nome: 'Amarelo Sol', hex: '#facc15', desbloqueada: true },
      { id: 'cor-2', nome: 'Laranja Fogo', hex: '#f97316', desbloqueada: true },
      { id: 'cor-3', nome: 'Rosa Estrela', hex: '#ec4899', desbloqueada: true },
      { id: 'cor-4', nome: 'Roxo Magia', hex: '#a855f7', desbloqueada: false, requisito: 'Resgatar com 40 estrelas' },
      { id: 'cor-5', nome: 'Azul Oceano', hex: '#3b82f6', desbloqueada: false, requisito: 'N\u00edvel 8' },
    ],
    tituloAtual: 'Exploradora',
    titulosDisponiveis: [
      { titulo: 'Novato', emoji: '\u{1F331}', desbloqueado: true },
      { titulo: 'Explorador', emoji: '\u{1F9ED}', desbloqueado: true },
      { titulo: 'Ninja', emoji: '\u{1F977}', desbloqueado: true, requisito: 'Resgatado com 50 estrelas' },
      { titulo: 'Drag\u00e3o', emoji: '\u{1F409}', desbloqueado: false, requisito: 'Resgatar com 100 estrelas' },
      { titulo: 'Lenda', emoji: '\u{1F3C6}', desbloqueado: false, requisito: 'N\u00edvel 15' },
    ],
  };
}

export async function mockSetMascoteKids(_studentId: string, _mascoteId: string): Promise<{ sucesso: boolean }> {
  await delay(500);
  return { sucesso: true };
}

export async function mockSetCorKids(_studentId: string, _corId: string): Promise<{ sucesso: boolean }> {
  await delay(500);
  return { sucesso: true };
}

export async function mockSetTituloKids(_studentId: string, _titulo: string): Promise<{ sucesso: boolean }> {
  await delay(500);
  return { sucesso: true };
}

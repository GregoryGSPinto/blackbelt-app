import { emailLayout } from './base';

export interface BeltPromotionData {
  nome: string;
  faixaAnterior: string;
  faixaNova: string;
  academia: string;
  professor: string;
  dataPromocao: string;
}

const BELT_COLORS: Record<string, string> = {
  white: '#E8E8E8',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#F97316',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  brown: '#92400E',
  black: '#1C1917',
};

const BELT_NAMES: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

export function beltPromotionEmail(data: BeltPromotionData): string {
  const newBeltColor = BELT_COLORS[data.faixaNova] ?? '#333';
  const newBeltName = BELT_NAMES[data.faixaNova] ?? data.faixaNova;
  const oldBeltName = BELT_NAMES[data.faixaAnterior] ?? data.faixaAnterior;

  return emailLayout(
    `<p>Parabens <strong>${data.nome}</strong>!</p>
<p>Voce foi promovido(a) de faixa na <strong>${data.academia}</strong>!</p>
<div style="text-align:center;margin:24px 0">
<div style="display:inline-block;background:#FFFBEB;border-radius:16px;padding:24px 40px">
<p style="font-size:14px;color:#666;margin:0 0 8px">Faixa ${oldBeltName}</p>
<p style="font-size:24px;margin:0">&#8595;</p>
<div style="display:inline-block;background:${newBeltColor};color:${data.faixaNova === 'white' || data.faixaNova === 'yellow' ? '#333' : '#fff'};padding:12px 32px;border-radius:8px;margin:8px 0;font-size:18px;font-weight:700">
Faixa ${newBeltName}
</div>
</div>
</div>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#f5f5f5">
<td style="padding:12px;border:1px solid #eee;font-weight:600">Professor</td>
<td style="padding:12px;border:1px solid #eee">${data.professor}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Data</td>
<td style="padding:12px;border:1px solid #eee">${data.dataPromocao}</td>
</tr>
</table>
<p>Continue treinando com dedicacao! Cada faixa e uma conquista que reflete seu esforco e evolucao.</p>`,
    'https://app.blackbelt.com/dashboard/progresso',
    'Ver Meu Progresso',
  );
}

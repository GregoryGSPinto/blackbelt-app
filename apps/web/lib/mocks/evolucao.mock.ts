import { BeltLevel } from '@/lib/types';
import type { MeuProgressoDTO, HistoricoFaixaDTO, RequisitoProximaFaixaDTO } from '@/lib/api/evolucao.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetMeuProgresso(_studentId: string): Promise<MeuProgressoDTO> {
  await delay();
  return {
    faixa_atual: BeltLevel.Blue,
    data_promocao: '2026-02-01',
    tempo_na_faixa_dias: 42,
    total_aulas: 52,
    media_avaliacoes: 83,
  };
}

export async function mockGetHistoricoFaixas(_studentId: string): Promise<HistoricoFaixaDTO[]> {
  await delay();
  return [
    { id: 'h-1', from_belt: BeltLevel.White, to_belt: BeltLevel.Gray, date: '2025-03-15', evaluated_by_name: 'Carlos Silva' },
    { id: 'h-2', from_belt: BeltLevel.Gray, to_belt: BeltLevel.Yellow, date: '2025-06-20', evaluated_by_name: 'Carlos Silva' },
    { id: 'h-3', from_belt: BeltLevel.Yellow, to_belt: BeltLevel.Orange, date: '2025-09-10', evaluated_by_name: 'Carlos Silva' },
    { id: 'h-4', from_belt: BeltLevel.Orange, to_belt: BeltLevel.Green, date: '2025-11-30', evaluated_by_name: 'Carlos Silva' },
    { id: 'h-5', from_belt: BeltLevel.Green, to_belt: BeltLevel.Blue, date: '2026-02-01', evaluated_by_name: 'Carlos Silva' },
  ];
}

export async function mockGetRequisitoProximaFaixa(_studentId: string): Promise<RequisitoProximaFaixaDTO> {
  await delay();
  return {
    proxima_faixa: BeltLevel.Purple,
    presenca: { necessario: 80, atual: 52, percentual: 65 },
    avaliacao: { necessario: 80, atual: 83, percentual: 100 },
    tempo_minimo_meses: 6,
    tempo_atual_meses: 1,
    completo: false,
  };
}

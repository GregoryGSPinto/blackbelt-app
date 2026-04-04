'use client';

import { useState, useEffect } from 'react';
import { getMeuProgresso, getHistoricoFaixas, getRequisitoProximaFaixa } from '@/lib/api/evolucao.service';
import type { MeuProgressoDTO, HistoricoFaixaDTO, RequisitoProximaFaixaDTO } from '@/lib/api/evolucao.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { BeltLevel } from '@/lib/types';
import { useStudentId } from '@/lib/hooks/useStudentId';

const BELT_ORDER: BeltLevel[] = [
  BeltLevel.White, BeltLevel.Gray, BeltLevel.Yellow, BeltLevel.Orange,
  BeltLevel.Green, BeltLevel.Blue, BeltLevel.Purple, BeltLevel.Brown, BeltLevel.Black,
];

export default function ProgressoPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [progresso, setProgresso] = useState<MeuProgressoDTO | null>(null);
  const [historico, setHistorico] = useState<HistoricoFaixaDTO[]>([]);
  const [requisitos, setRequisitos] = useState<RequisitoProximaFaixaDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const [p, h, r] = await Promise.all([
          getMeuProgresso(studentId!), getHistoricoFaixas(studentId!), getRequisitoProximaFaixa(studentId!),
        ]);
        setProgresso(p); setHistorico(h); setRequisitos(r);
      } finally { setLoading(false); }
    }
    load();
  }, [studentId, studentLoading]);

  if (loading) {
    return <div className="space-y-4 p-4"><Skeleton variant="card" className="h-20" /><Skeleton variant="card" className="h-40" /></div>;
  }

  const currentBeltIdx = progresso ? BELT_ORDER.indexOf(progresso.faixa_atual) : 0;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-bb-black">Meu Progresso</h1>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {BELT_ORDER.map((belt, i) => (
          <div key={belt} className="flex flex-col items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= currentBeltIdx ? 'bg-bb-red text-white' : 'bg-bb-gray-300 text-bb-gray-500'}`}>{i + 1}</div>
            <span className={`mt-1 text-[10px] ${i <= currentBeltIdx ? 'text-bb-black font-medium' : 'text-bb-gray-500'}`}>{belt}</span>
          </div>
        ))}
      </div>
      {progresso && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-bb-gray-500">Faixa Atual</p><Badge variant="belt" size="sm" className="mt-1">{progresso.faixa_atual}</Badge></div>
            <div className="text-right"><p className="text-sm text-bb-gray-500">Desde {new Date(progresso.data_promocao).toLocaleDateString('pt-BR')}</p><p className="text-xs text-bb-gray-500">{progresso.tempo_na_faixa_dias} dias</p></div>
          </div>
        </Card>
      )}
      {requisitos && (
        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-bb-black">Requisitos: <Badge variant="belt" size="sm">{requisitos.proxima_faixa}</Badge></h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm"><span className="text-bb-gray-500">Presença</span><span className="font-medium">{requisitos.presenca.atual}/{requisitos.presenca.necessario}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-300"><div className="h-full rounded-full bg-bb-red" style={{ width: `${requisitos.presenca.percentual}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span className="text-bb-gray-500">Avaliação</span><span className="font-medium">{requisitos.avaliacao.atual}/{requisitos.avaliacao.necessario}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-300"><div className="h-full rounded-full bg-bb-success" style={{ width: `${Math.min(requisitos.avaliacao.percentual, 100)}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span className="text-bb-gray-500">Tempo na faixa</span><span className="font-medium">{requisitos.tempo_atual_meses}/{requisitos.tempo_minimo_meses} meses</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-300"><div className="h-full rounded-full bg-bb-info" style={{ width: `${(requisitos.tempo_atual_meses / requisitos.tempo_minimo_meses) * 100}%` }} /></div>
            </div>
          </div>
        </Card>
      )}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Histórico de Faixas</h2>
        <div className="space-y-2">
          {historico.map((h) => (
            <Card key={h.id} className="flex items-center gap-3 p-3">
              <Badge variant="belt" size="sm">{h.to_belt}</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-bb-black">{h.from_belt} → {h.to_belt}</p>
                <p className="text-xs text-bb-gray-500">{new Date(h.date).toLocaleDateString('pt-BR')} · Prof. {h.evaluated_by_name}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

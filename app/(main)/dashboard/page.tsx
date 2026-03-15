'use client';

import { useState, useEffect } from 'react';
import { getAlunoDashboard } from '@/lib/api/aluno.service';
import type { AlunoDashboardDTO } from '@/lib/api/aluno.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MainDashboardPage() {
  const [data, setData] = useState<AlunoDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getAlunoDashboard('stu-1');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 p-4">
      {/* Próxima aula */}
      {data.proximaAula ? (
        <Card variant="elevated" className="border-l-4 border-bb-red p-4">
          <p className="text-xs font-semibold uppercase text-bb-gray-500">Próxima Aula</p>
          <p className="mt-1 text-lg font-bold text-bb-black">{data.proximaAula.modality_name}</p>
          <p className="text-sm text-bb-gray-500">
            {data.proximaAula.start_time} - {data.proximaAula.end_time}
          </p>
          <p className="text-sm text-bb-gray-500">
            Prof. {data.proximaAula.professor_name} · {data.proximaAula.unit_name}
          </p>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-bb-gray-500">Sem aulas hoje. Descanse bem!</p>
        </Card>
      )}

      {/* Progresso de faixa */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-bb-gray-500">Progresso de Faixa</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="belt" size="sm">{data.progressoFaixa.faixa_atual}</Badge>
              <span className="text-bb-gray-500">→</span>
              <Badge variant="belt" size="sm">{data.progressoFaixa.proxima_faixa}</Badge>
            </div>
          </div>
          <span className="text-2xl font-bold text-bb-red">{data.progressoFaixa.percentual}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-bb-gray-300">
          <div
            className="h-full rounded-full bg-bb-red transition-all"
            style={{ width: `${data.progressoFaixa.percentual}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-bb-gray-500">
          {data.progressoFaixa.aulas_concluidas}/{data.progressoFaixa.aulas_necessarias} aulas
        </p>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-bb-black">{data.frequenciaMes.presencas}/{data.frequenciaMes.total_aulas}</p>
          <p className="text-xs text-bb-gray-500">Frequência do mês</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-bb-red">{data.streak}</p>
          <p className="text-xs text-bb-gray-500">Dias de streak</p>
        </Card>
      </div>

      {/* Conteúdo recomendado */}
      {data.conteudoRecomendado.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Conteúdo Recomendado</h2>
          <div className="space-y-2">
            {data.conteudoRecomendado.map((video) => (
              <Card key={video.video_id} className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-16 items-center justify-center rounded bg-bb-gray-300 text-xs text-bb-gray-500">
                  {video.duration}min
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-black">{video.title}</p>
                  <Badge variant="belt" size="sm">{video.belt_level}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Últimas conquistas */}
      {data.ultimasConquistas.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-bb-black">Últimas Conquistas</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.ultimasConquistas.map((conquista) => (
              <Card key={conquista.id} className="flex-shrink-0 p-3 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-bb-warning/20">
                  <span className="text-lg">🏆</span>
                </div>
                <p className="mt-1 text-xs font-medium text-bb-black">{conquista.name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

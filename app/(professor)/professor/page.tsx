'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { ProfessorDashboardDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfessorDashboardPage() {
  const [data, setData] = useState<ProfessorDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getProfessorDashboard('prof-1');
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
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 p-4">
      {/* Hero: Próxima aula ou aula ativa */}
      {data.aulaAtiva ? (
        <Card variant="elevated" className="bg-bb-red p-4 text-white">
          <p className="text-xs font-semibold uppercase">Aula em Andamento</p>
          <p className="mt-1 text-lg font-bold">{data.aulaAtiva.modality_name}</p>
          <p className="text-sm opacity-80">{data.aulaAtiva.present_count}/{data.aulaAtiva.total_count} presentes</p>
          <Link href="/professor/turma-ativa">
            <Button variant="secondary" className="mt-3 w-full">
              Abrir Turma Ativa
            </Button>
          </Link>
        </Card>
      ) : data.proximaAula ? (
        <Card variant="elevated" className="border-l-4 border-bb-red p-4">
          <p className="text-xs font-semibold uppercase text-bb-gray-500">Próxima Aula</p>
          <p className="mt-1 text-lg font-bold text-bb-black">{data.proximaAula.modality_name}</p>
          <p className="text-sm text-bb-gray-500">
            {data.proximaAula.start_time} - {data.proximaAula.end_time} · {data.proximaAula.unit_name}
          </p>
          <p className="text-sm text-bb-gray-500">{data.proximaAula.enrolled_count} alunos matriculados</p>
          <Link href="/professor/turma-ativa">
            <Button className="mt-3 w-full">Iniciar Aula</Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-bb-gray-500">Sem aulas agendadas para hoje.</p>
        </Card>
      )}

      {/* Minhas Turmas */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Minhas Turmas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.minhasTurmas.map((turma) => (
            <Card key={turma.class_id} className="p-3">
              <p className="font-medium text-bb-black">{turma.modality_name}</p>
              <p className="text-xs text-bb-gray-500">{turma.schedule_text}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-bb-gray-500">{turma.enrolled_count} alunos</span>
                <span className={`font-medium ${turma.presenca_media >= 70 ? 'text-bb-success' : 'text-bb-warning'}`}>
                  {turma.presenca_media}% presença
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Meus Alunos */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Meus Alunos</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.meusAlunos.map((aluno) => (
            <Card key={aluno.student_id} className="flex flex-col items-center p-3 text-center">
              <Avatar name={aluno.display_name} size="md" />
              <p className="mt-1 text-sm font-medium text-bb-black">{aluno.display_name}</p>
              <Badge variant="belt" size="sm" className="mt-0.5">{aluno.belt}</Badge>
              <p className="mt-1 text-xs text-bb-gray-500">
                {aluno.ultima_presenca ? `Último: ${new Date(aluno.ultima_presenca).toLocaleDateString('pt-BR')}` : 'Sem registros'}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Mensagens recentes */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Mensagens Recentes</h2>
        <div className="space-y-2">
          {data.mensagensRecentes.map((msg) => (
            <Card key={msg.conversation_id} className={`p-3 ${msg.unread ? 'border-l-2 border-bb-red' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-bb-black">{msg.from_name}</p>
                <span className="text-xs text-bb-gray-500">{msg.time}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-bb-gray-500">{msg.preview}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

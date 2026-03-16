'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { TurmaResumoDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ProfessorTurmasPage() {
  const [turmas, setTurmas] = useState<TurmaResumoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessorDashboard('prof-1');
        setTurmas(data.minhasTurmas);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (turmas.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Nenhuma turma encontrada"
          description="Voce nao possui turmas atribuidas no momento."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-bb-gray-900">Minhas Turmas</h1>
        <p className="text-sm text-bb-gray-500">
          {turmas.length} {turmas.length === 1 ? 'turma' : 'turmas'} ativas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-bb-gray-900">{turmas.length}</p>
          <p className="text-[10px] text-bb-gray-500">Turmas</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-bb-gray-900">
            {turmas.reduce((acc, t) => acc + t.enrolled_count, 0)}
          </p>
          <p className="text-[10px] text-bb-gray-500">Total Alunos</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-bb-red">
            {turmas.length > 0
              ? Math.round(turmas.reduce((acc, t) => acc + t.presenca_media, 0) / turmas.length)
              : 0}
            %
          </p>
          <p className="text-[10px] text-bb-gray-500">Presenca Media</p>
        </Card>
      </div>

      {/* Turma Cards */}
      <div className="space-y-3">
        {turmas.map((turma) => (
          <Link key={turma.class_id} href="/turma-ativa">
            <Card variant="outlined" className="p-4 transition-colors hover:bg-bb-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-bb-gray-900">
                    {turma.modality_name}
                  </h2>
                  <p className="mt-0.5 text-sm text-bb-gray-500">{turma.schedule_text}</p>
                </div>
                <Badge variant="active" size="sm">
                  {turma.enrolled_count} alunos
                </Badge>
              </div>

              {/* Attendance bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bb-gray-500">Presenca media</span>
                  <span
                    className={`font-semibold ${
                      turma.presenca_media >= 70 ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {turma.presenca_media}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-bb-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      turma.presenca_media >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${turma.presenca_media}%` }}
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

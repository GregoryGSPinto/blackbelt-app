'use client';

import { useState, useEffect } from 'react';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { ProfessorDashboardDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export default function ProfessorPerfilPage() {
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-sm text-bb-gray-500">Erro ao carregar perfil.</p>
      </div>
    );
  }

  const totalAlunos = data.meusAlunos.length;
  const totalTurmas = data.minhasTurmas.length;
  const mediaPresenca =
    totalTurmas > 0
      ? Math.round(data.minhasTurmas.reduce((acc, t) => acc + t.presenca_media, 0) / totalTurmas)
      : 0;

  return (
    <div className="pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-bb-gray-900 to-bb-gray-700 px-4 pb-6 pt-8">
        <div className="flex items-center gap-4">
          <Avatar
            name="Professor Silva"
            size="xl"
            className="ring-4 ring-white/30"
          />
          <div>
            <h1 className="text-xl font-bold text-white">Professor Silva</h1>
            <Badge variant="active" size="sm" className="mt-1">
              Professor
            </Badge>
            <p className="mt-1 text-sm text-bb-gray-300">
              Brazilian Jiu-Jitsu
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-bb-gray-900">{totalTurmas}</p>
            <p className="text-[10px] text-bb-gray-500">Turmas</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-bb-gray-900">{totalAlunos}</p>
            <p className="text-[10px] text-bb-gray-500">Alunos</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-bb-red">{mediaPresenca}%</p>
            <p className="text-[10px] text-bb-gray-500">Presenca</p>
          </Card>
        </div>

        {/* Bio */}
        <Card variant="outlined" className="p-4">
          <h2 className="text-sm font-semibold text-bb-gray-900">Sobre</h2>
          <p className="mt-2 text-sm leading-relaxed text-bb-gray-500">
            Faixa preta de Brazilian Jiu-Jitsu com mais de 10 anos de experiencia.
            Especialista em tecnicas de solo e preparacao para competicao.
            Certificado pela CBJJ.
          </p>
        </Card>

        {/* Minhas Turmas */}
        <section>
          <h2 className="mb-3 font-semibold text-bb-gray-900">Minhas Turmas</h2>
          <div className="space-y-2">
            {data.minhasTurmas.map((turma) => (
              <Card key={turma.class_id} variant="outlined" className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-bb-gray-900">{turma.modality_name}</p>
                    <p className="text-xs text-bb-gray-500">{turma.schedule_text}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-bb-gray-900">{turma.enrolled_count} alunos</p>
                    <span
                      className={`text-xs font-medium ${
                        turma.presenca_media >= 70 ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {turma.presenca_media}% presenca
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Informacoes */}
        <section>
          <h2 className="mb-3 font-semibold text-bb-gray-900">Informacoes</h2>
          <Card variant="outlined" className="divide-y divide-bb-gray-100 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-bb-gray-500">Graduacao</span>
              <span className="text-sm font-medium text-bb-gray-900">Faixa Preta</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-bb-gray-500">Modalidade</span>
              <span className="text-sm font-medium text-bb-gray-900">BJJ</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-bb-gray-500">Aulas esta semana</span>
              <span className="text-sm font-medium text-bb-gray-900">{totalTurmas * 3}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-bb-gray-500">Mensagens pendentes</span>
              <span className="text-sm font-medium text-bb-red">
                {data.mensagensRecentes.filter((m) => m.unread).length}
              </span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

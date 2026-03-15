'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { ProfessorDashboardDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusDoDia } from '@/components/shared/StatusDoDia';
import { QuickActions } from '@/components/shared/QuickActions';
import { DayRecap } from '@/components/shared/DayRecap';
import { useRouter } from 'next/navigation';

export default function ProfessorDashboardPage() {
  const router = useRouter();
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

  // Compute contextual header message
  const headerInfo = useMemo(() => {
    if (!data) return null;

    if (data.aulaAtiva) {
      return {
        type: 'active' as const,
        message: 'Aula em andamento',
        detail: `${data.aulaAtiva.modality_name} - ${data.aulaAtiva.present_count}/${data.aulaAtiva.total_count} presentes`,
      };
    }

    if (data.proximaAula) {
      // Calculate minutes until class
      const now = new Date();
      const [h, m] = data.proximaAula.start_time.split(':').map(Number);
      const classTime = new Date(now);
      classTime.setHours(h, m, 0, 0);
      const diffMin = Math.round((classTime.getTime() - now.getTime()) / 60000);

      if (diffMin > 0 && diffMin <= 60) {
        return {
          type: 'soon' as const,
          message: `${data.proximaAula.modality_name} em ${diffMin}min`,
          detail: `${data.proximaAula.enrolled_count} esperados.`,
        };
      }

      return {
        type: 'later' as const,
        message: `Proxima aula: ${data.proximaAula.modality_name}`,
        detail: `${data.proximaAula.start_time} - ${data.proximaAula.end_time} | ${data.proximaAula.enrolled_count} alunos`,
      };
    }

    return {
      type: 'none' as const,
      message: 'Sem aulas hoje.',
      detail: 'Revise o progresso dos alunos.',
    };
  }, [data]);

  // Students needing attention: absent 3+ days
  const atRiskStudents = useMemo(() => {
    if (!data) return [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return data.meusAlunos.filter((a) => {
      if (!a.ultima_presenca) return true;
      return new Date(a.ultima_presenca) < threeDaysAgo;
    });
  }, [data]);

  // Students ready for evaluation (mock: those with belt below purple and recent attendance)
  const readyForEval = useMemo(() => {
    if (!data) return [];
    const beltOrder = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'];
    return data.meusAlunos.filter((a) => {
      const idx = beltOrder.indexOf(a.belt);
      if (idx >= 6) return false; // purple+ not ready for next belt easily
      if (!a.ultima_presenca) return false;
      const daysSinceLast = Math.floor((Date.now() - new Date(a.ultima_presenca).getTime()) / 86400000);
      return daysSinceLast <= 2; // recently active
    }).slice(0, 4);
  }, [data]);

  // Unread messages
  const unreadMessages = useMemo(() => {
    if (!data) return [];
    return data.mensagensRecentes.filter((m) => m.unread);
  }, [data]);

  // Build schedule for today + tomorrow (using minhasTurmas schedule_text)
  const upcomingClasses = useMemo(() => {
    if (!data) return [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const now = new Date();
    const todayName = dayNames[now.getDay()];
    const tomorrowName = dayNames[(now.getDay() + 1) % 7];

    return data.minhasTurmas
      .filter((t) => {
        const text = t.schedule_text.toLowerCase();
        return text.includes(todayName.toLowerCase()) || text.includes(tomorrowName.toLowerCase());
      })
      .map((t) => ({
        ...t,
        isToday: t.schedule_text.toLowerCase().includes(todayName.toLowerCase()),
      }));
  }, [data]);

  function handleQuickAction(key: string) {
    switch (key) {
      case 'aula':
        router.push('/turma-ativa');
        break;
      case 'avaliar':
        router.push('/professor/avaliacoes');
        break;
      case 'mensagens':
        router.push('/professor/mensagens');
        break;
      case 'turma':
        router.push('/professor/turmas');
        break;
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5 p-4">
      {/* ── StatusDoDia ─────────────────────────────────────────── */}
      <StatusDoDia
        role="professor"
        data={{
          classesToday: data.minhasTurmas.length,
          totalStudents: data.meusAlunos.length,
          nextClassTime: data.proximaAula?.start_time ?? '--',
          unreadMessages: unreadMessages.length,
        }}
      />

      {/* ── Contextual Header ───────────────────────────────────── */}
      {headerInfo && (
        <Card
          variant="elevated"
          className={`p-4 ${
            headerInfo.type === 'active'
              ? 'border-l-4 border-bb-red bg-red-50'
              : headerInfo.type === 'soon'
                ? 'border-l-4 border-yellow-500 bg-yellow-50'
                : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {headerInfo.type === 'active' && (
                <span className="mb-1 inline-flex items-center gap-1 text-xs font-bold uppercase text-bb-red">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-bb-red" />
                  Ao vivo
                </span>
              )}
              <p className="text-lg font-bold text-bb-gray-900">{headerInfo.message}</p>
              <p className="text-sm text-bb-gray-500">{headerInfo.detail}</p>
            </div>
            {headerInfo.type === 'active' && (
              <Link href="/turma-ativa">
                <Button size="sm">Abrir Chamada</Button>
              </Link>
            )}
            {headerInfo.type === 'soon' && (
              <Link href="/turma-ativa">
                <Button size="sm" variant="secondary">Iniciar Aula</Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* ── QuickActions ────────────────────────────────────────── */}
      <QuickActions
        role="professor"
        badges={{ mensagens: unreadMessages.length }}
        onAction={handleQuickAction}
      />

      {/* ── SECTION 1: Alunos que Precisam de Atencao ───────────── */}
      {atRiskStudents.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-bb-gray-900">
            Alunos que Precisam de Atencao
            <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-bb-red px-1 text-xs font-bold text-white">
              {atRiskStudents.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {atRiskStudents.map((aluno) => {
              const daysSince = aluno.ultima_presenca
                ? Math.floor((Date.now() - new Date(aluno.ultima_presenca).getTime()) / 86400000)
                : null;
              return (
                <Card key={aluno.student_id} className="flex items-center gap-3 border-l-4 border-yellow-400 p-3">
                  <Avatar name={aluno.display_name} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-bb-gray-900">{aluno.display_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="belt" size="sm">{aluno.belt}</Badge>
                      <span className="text-xs text-bb-gray-500">
                        {daysSince !== null ? `${daysSince}d sem treinar` : 'Nunca treinou'}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0 text-bb-red">
                    Mensagem
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SECTION 2: Proximas Aulas ───────────────────────────── */}
      <section>
        <h2 className="mb-3 font-semibold text-bb-gray-900">Proximas Aulas</h2>
        {upcomingClasses.length > 0 ? (
          <div className="space-y-2">
            {upcomingClasses.map((cls) => (
              <Card key={cls.class_id} className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium text-bb-gray-900">{cls.modality_name}</p>
                  <p className="text-xs text-bb-gray-500">{cls.schedule_text}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-bb-gray-900">{cls.enrolled_count} alunos</p>
                  <span className={`text-xs font-medium ${cls.isToday ? 'text-bb-red' : 'text-bb-gray-500'}`}>
                    {cls.isToday ? 'Hoje' : 'Amanha'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center text-sm text-bb-gray-500">
            Nenhuma aula programada para hoje ou amanha.
          </Card>
        )}
      </section>

      {/* ── SECTION 3: Prontos para Avaliacao ───────────────────── */}
      {readyForEval.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-bb-gray-900">Prontos para Avaliacao</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {readyForEval.map((aluno) => (
              <Card key={aluno.student_id} className="flex flex-col items-center p-3 text-center">
                <Avatar name={aluno.display_name} size="md" />
                <p className="mt-1 text-sm font-medium text-bb-gray-900">{aluno.display_name}</p>
                <Badge variant="belt" size="sm" className="mt-0.5">{aluno.belt}</Badge>
                <Button size="sm" variant="ghost" className="mt-2 text-xs text-bb-red">
                  Avaliar
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 4: Mensagens Nao Lidas ──────────────────────── */}
      {unreadMessages.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-bb-gray-900">
            Mensagens Nao Lidas
            <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-bb-red px-1 text-xs font-bold text-white">
              {unreadMessages.length}
            </span>
          </h2>
          <div className="space-y-2">
            {unreadMessages.map((msg) => (
              <Card key={msg.conversation_id} className="border-l-2 border-bb-red p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-bb-gray-900">{msg.from_name}</p>
                  <span className="text-xs text-bb-gray-500">{msg.time}</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-bb-gray-500">{msg.preview}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 5: Minhas Turmas ────────────────────────────── */}
      <section>
        <h2 className="mb-3 font-semibold text-bb-gray-900">Minhas Turmas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.minhasTurmas.map((turma) => (
            <Card key={turma.class_id} className="p-3">
              <p className="font-medium text-bb-gray-900">{turma.modality_name}</p>
              <p className="text-xs text-bb-gray-500">{turma.schedule_text}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-bb-gray-500">{turma.enrolled_count} alunos</span>
                <span
                  className={`font-medium ${
                    turma.presenca_media >= 70 ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {turma.presenca_media}% presenca
                </span>
              </div>
              {/* Attendance bar */}
              <div className="mt-1 h-1.5 w-full rounded-full bg-bb-gray-100">
                <div
                  className={`h-1.5 rounded-full ${
                    turma.presenca_media >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${turma.presenca_media}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── DayRecap (shows after 20h) ──────────────────────────── */}
      <DayRecap
        role="professor"
        data={{
          classCount: data.minhasTurmas.length,
          className: data.minhasTurmas[0]?.modality_name ?? '',
          present: data.aulaAtiva?.present_count ?? 10,
          total: data.aulaAtiva?.total_count ?? 14,
          pct: data.aulaAtiva ? Math.round((data.aulaAtiva.present_count / data.aulaAtiva.total_count) * 100) : 78,
          totalPresent: data.meusAlunos.length,
        }}
        onDismiss={() => {}}
      />
    </div>
  );
}

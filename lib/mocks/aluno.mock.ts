import { BeltLevel } from '@/lib/types';
import type { AlunoDashboardDTO } from '@/lib/api/aluno.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetAlunoDashboard(_studentId: string): Promise<AlunoDashboardDTO> {
  await delay();

  const today = new Date();
  const dayOfWeek = today.getDay();

  // Build week starting from Monday
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const weekFull = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

  // Find Monday of the current week
  const monday = new Date(today);
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  const semana = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayIndex = d.getDay();
    const isPast = d < today && d.toDateString() !== today.toDateString();
    const isToday = d.toDateString() === today.toDateString();

    let status: 'done' | 'scheduled' | 'rest' | 'missed';
    let classes: string[] = [];

    if (dayIndex === 0) {
      status = 'rest';
    } else if ([1, 3, 5].includes(dayIndex)) {
      classes = ['BJJ 19h'];
      if (isPast) status = 'done';
      else if (isToday) status = 'scheduled';
      else status = 'scheduled';
    } else if (dayIndex === 2) {
      classes = ['BJJ Advanced 19h'];
      if (isPast) status = 'done';
      else if (isToday) status = 'scheduled';
      else status = 'scheduled';
    } else if (dayIndex === 4) {
      classes = ['BJJ Advanced 19h', 'No-Gi 20h30'];
      if (isPast) status = 'done';
      else if (isToday) status = 'scheduled';
      else status = 'scheduled';
    } else {
      status = 'rest';
    }

    return {
      day_label: weekFull[dayIndex],
      day_short: weekDays[dayIndex],
      date: d.toISOString().split('T')[0],
      status,
      classes,
    };
  });

  // Build 3-month heatmap
  const heatmap3Meses = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (2 - i), 1);
    const totalDias = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Generate random present days
    const diasPresentes: number[] = [];
    const maxPresent = i === 2 ? 14 : Math.floor(totalDias * 0.6);
    for (let day = 1; day <= totalDias; day++) {
      const dayOfWeek = new Date(d.getFullYear(), d.getMonth(), day).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && diasPresentes.length < maxPresent) {
        if (Math.random() > 0.3) diasPresentes.push(day);
      }
    }

    return {
      mes_label: monthNames[d.getMonth()],
      ano: d.getFullYear(),
      total_dias: totalDias,
      dias_presentes: diasPresentes,
    };
  });

  return {
    student_name: 'Joao',
    avatar_url: null,
    ranking_position: 5,
    total_academy_students: 87,
    membro_desde: '2025-04-10',
    proximaAula: {
      class_id: 'class-bjj-adv',
      modality_name: 'BJJ Advanced',
      level_label: 'Avancado',
      professor_name: 'Andre Galvao',
      start_time: '19:00',
      end_time: '20:30',
      unit_name: 'Unidade Centro',
    },
    aulaAgora: false,
    proximaAulaAmanha: {
      class_id: 'class-bjj-noite',
      modality_name: 'BJJ',
      level_label: 'Todos os Niveis',
      professor_name: 'Carlos Silva',
      start_time: '19:00',
      end_time: '20:30',
      unit_name: 'Unidade Centro',
    },
    proximasAulas: [
      {
        class_id: 'class-bjj-adv',
        modality_name: 'BJJ Advanced',
        level_label: 'Avancado',
        professor_name: 'Andre Galvao',
        start_time: '19:00',
        end_time: '20:30',
        unit_name: 'Unidade Centro',
      },
      {
        class_id: 'class-nogi',
        modality_name: 'No-Gi',
        level_label: 'Intermediario',
        professor_name: 'Marcelo Garcia',
        start_time: '20:30',
        end_time: '22:00',
        unit_name: 'Unidade Centro',
      },
      {
        class_id: 'class-bjj-fund',
        modality_name: 'BJJ Fundamentos',
        level_label: 'Iniciante',
        professor_name: 'Carlos Silva',
        start_time: '07:00',
        end_time: '08:30',
        unit_name: 'Unidade Centro',
      },
    ],
    progressoFaixa: {
      faixa_atual: BeltLevel.Blue,
      proxima_faixa: BeltLevel.Purple,
      percentual: 65,
      aulas_necessarias: 80,
      aulas_concluidas: 52,
      requisitos: [
        { label: 'Presencas', atual: 52, necessario: 80, completo: false },
        { label: 'Tempo minimo (meses)', atual: 11, necessario: 18, completo: false },
        { label: 'Avaliacoes positivas', atual: 3, necessario: 4, completo: false },
      ],
    },
    frequenciaMes: {
      total_aulas: 12,
      presencas: 10,
      dias_presentes: [1, 3, 4, 5, 7, 8, 10, 11, 12, 14],
      mes_label: 'Marco',
    },
    frequenciaMesAnteriorPct: 78,
    streak: 12,
    videos_watched: 23,
    quiz_score_avg: 82,
    evolucao: {
      presencas_atual: 88,
      presencas_necessario: 120,
      meses_atual: 11,
      meses_necessario: 6,
      quiz_avg: 82,
      quiz_necessario: 70,
    },
    heatmap3Meses: heatmap3Meses,
    mensalidade: {
      plano_nome: 'Plano Ilimitado',
      valor: 189.90,
      status: 'em_dia',
      vencimento: '2026-04-05',
      mes_label: 'Marco 2026',
    },
    conteudoRecomendado: [
      { video_id: 'vid-1', title: 'Guarda Fechada — Fundamentos', duration: 15, belt_level: BeltLevel.Blue },
      { video_id: 'vid-2', title: 'Raspagem de Gancho', duration: 12, belt_level: BeltLevel.Blue },
      { video_id: 'vid-3', title: 'Passagem de Guarda — Pressao', duration: 20, belt_level: BeltLevel.Blue },
    ],
    continuarAssistindo: {
      video_id: 'vid-2',
      title: 'Raspagem de Gancho',
      thumbnail_url: '/thumbnails/raspagem-gancho.jpg',
      duration: 720,
      watched_seconds: 432,
      progress_pct: 60,
    },
    ultimasConquistas: [
      { id: 'ach-1', name: 'Streak 10 dias', icon: '\uD83D\uDD25', type: 'attendance_streak', granted_at: '2026-03-14' },
      { id: 'ach-2', name: '50 aulas', icon: '\uD83C\uDFC5', type: 'class_milestone', granted_at: '2026-03-10' },
      { id: 'ach-3', name: 'Faixa Azul', icon: '\uD83E\uDD4B', type: 'belt_promotion', granted_at: '2025-11-22' },
      { id: 'ach-4', name: 'Madrugador', icon: '\uD83C\uDF1F', type: 'custom', granted_at: '2025-10-15' },
    ],
    proximaConquista: {
      name: 'Streak 30',
      icon: '\uD83D\uDD25',
      description: 'Mantenha 30 dias consecutivos de treino',
      progress_current: 12,
      progress_target: 30,
    },
    semana,
  };
}

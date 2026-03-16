'use client';

import { forwardRef } from 'react';

// ── Data shapes per role ──────────────────────────────────────────────
interface AdminData {
  classesToday: number;
  expectedStudents: number;
  risks: number;
}

interface ProfessorData {
  classesToday: number;
  totalStudents: number;
  nextClassTime: string;
  unreadMessages: number;
}

interface AlunoAdultoData {
  nextClass: string;
  nextTime: string;
  timeLeft: string;
  streak: number;
  newVideos: number;
}

interface AlunoTeenData {
  level: number;
  rank: number;
  challengeProgress: string;
  streak: number;
}

interface AlunoKidsData {
  stars: number;
  nextDay: string;
  nextTime: string;
  starsToNext: number;
}

interface ResponsavelData {
  childStatus: string;
  unreadMessages: number;
}

type RoleDataMap = {
  admin: AdminData;
  professor: ProfessorData;
  aluno_adulto: AlunoAdultoData;
  aluno_teen: AlunoTeenData;
  aluno_kids: AlunoKidsData;
  responsavel: ResponsavelData;
};

type Role = keyof RoleDataMap;

interface StatusDoDiaProps<R extends Role = Role> {
  role: R;
  data: RoleDataMap[R];
}

// ── Gradient themes per role ──────────────────────────────────────────
const ROLE_GRADIENTS: Record<Role, string> = {
  admin: 'bg-gradient-to-r from-[var(--bb-depth-3)] to-[var(--bb-depth-5)]',
  professor: 'bg-gradient-to-r from-[var(--bb-depth-3)] to-[var(--bb-depth-5)]',
  aluno_adulto: 'bg-gradient-to-r from-[var(--bb-depth-3)] to-[var(--bb-depth-5)]',
  aluno_teen: 'bg-gradient-to-r from-purple-900 to-[var(--bb-depth-3)]',
  aluno_kids: 'bg-gradient-to-r from-yellow-700 to-[var(--bb-depth-3)]',
  responsavel: 'bg-gradient-to-r from-[var(--bb-depth-5)] to-[var(--bb-depth-3)]',
};

// ── Builders for each role ────────────────────────────────────────────
function buildMessage(role: Role, data: RoleDataMap[Role]): string {
  switch (role) {
    case 'admin': {
      const d = data as AdminData;
      return `🟢 Academia saudável · ${d.classesToday} aulas hoje · ${d.expectedStudents} esperados · ⚠️ ${d.risks} risco(s)`;
    }
    case 'professor': {
      const d = data as ProfessorData;
      return `🥋 Hoje: ${d.classesToday} aulas · ${d.totalStudents} alunos · Primeira às ${d.nextClassTime} · 💬 ${d.unreadMessages} não lidas`;
    }
    case 'aluno_adulto': {
      const d = data as AlunoAdultoData;
      return `🥋 ${d.nextClass} às ${d.nextTime} (em ${d.timeLeft}) · 🔥 ${d.streak} dias · 📺 ${d.newVideos} vídeos`;
    }
    case 'aluno_teen': {
      const d = data as AlunoTeenData;
      return `🎮 Level ${d.level} · #${d.rank} ranking · 🏆 ${d.challengeProgress} desafio · 🔥 ${d.streak} dias`;
    }
    case 'aluno_kids': {
      const d = data as AlunoKidsData;
      return `⭐ ${d.stars} estrelas! · 🥋 Aula ${d.nextDay} ${d.nextTime} · 🎁 ${d.starsToNext} p/ próximo prêmio`;
    }
    case 'responsavel': {
      const d = data as ResponsavelData;
      return `👨‍👧‍👦 ${d.childStatus} · 💬 ${d.unreadMessages} msg`;
    }
    default:
      return '';
  }
}

const StatusDoDia = forwardRef<HTMLDivElement, StatusDoDiaProps>(
  function StatusDoDia({ role, data }, ref) {
    const message = buildMessage(role, data);

    return (
      <div
        ref={ref}
        className={`flex items-center gap-2 rounded-lg p-3 text-sm text-[var(--bb-ink-100)] ${ROLE_GRADIENTS[role]}`}
      >
        <span className="truncate">{message}</span>
      </div>
    );
  },
);

StatusDoDia.displayName = 'StatusDoDia';

export { StatusDoDia };
export type { StatusDoDiaProps, Role, RoleDataMap };

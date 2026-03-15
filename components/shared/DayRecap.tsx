'use client';

import { forwardRef, useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────
type Role = 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'aluno_kids' | 'responsavel';

interface AdminRecapData {
  checkins: number;
  received: number;
  riskName: string;
  riskDays: number;
}

interface ProfessorRecapData {
  classCount: number;
  className: string;
  present: number;
  total: number;
  pct: number;
  totalPresent: number;
}

interface AlunoAdultoRecapData {
  className: string;
  streak: number;
  beltProgress: number;
  nextBelt: string;
}

interface AlunoTeenRecapData {
  xpGained: number;
  streak: number;
  progress: number;
  target: number;
  rank: number;
}

interface ResponsavelRecapData {
  childName: string;
  otherChild: string;
  tomorrow: string;
}

type RoleRecapDataMap = {
  admin: AdminRecapData;
  professor: ProfessorRecapData;
  aluno_adulto: AlunoAdultoRecapData;
  aluno_teen: AlunoTeenRecapData;
  aluno_kids: never;
  responsavel: ResponsavelRecapData;
};

interface DayRecapProps<R extends Role = Role> {
  role: R;
  data: RoleRecapDataMap[R];
  onDismiss: () => void;
}

// ── Message builders ──────────────────────────────────────────────────
function buildRecapMessage(role: Role, data: RoleRecapDataMap[Role]): string {
  switch (role) {
    case 'admin': {
      const d = data as AdminRecapData;
      return `Hoje: ${d.checkins} check-ins, R$${d.received} recebidos, ${d.riskName} ${d.riskDays} dias sem vir.`;
    }
    case 'professor': {
      const d = data as ProfessorRecapData;
      return `${d.classCount} aulas: ${d.className} ${d.present}/${d.total} (${d.pct}%). ${d.totalPresent} presenças.`;
    }
    case 'aluno_adulto': {
      const d = data as AlunoAdultoRecapData;
      return `✅ Presente no ${d.className}! 🔥 Streak ${d.streak}. ${d.beltProgress}% para faixa ${d.nextBelt}.`;
    }
    case 'aluno_teen': {
      const d = data as AlunoTeenRecapData;
      return `+${d.xpGained} XP. Streak ${d.streak}. Desafio ${d.progress}/${d.target}. Subiu p/ #${d.rank}! 🎉`;
    }
    case 'responsavel': {
      const d = data as ResponsavelRecapData;
      return `${d.childName} treinou ✅. ${d.otherChild} sem aula. Amanhã: ${d.tomorrow}.`;
    }
    default:
      return '';
  }
}

// ── localStorage helpers ──────────────────────────────────────────────
function getDismissKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `bb_day_recap_dismissed_${today}`;
}

function isDismissedToday(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getDismissKey()) === '1';
}

function dismissToday(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getDismissKey(), '1');
}

const DayRecap = forwardRef<HTMLDivElement, DayRecapProps>(
  function DayRecap({ role, data, onDismiss }, ref) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const hour = new Date().getHours();
      if (hour >= 20 && !isDismissedToday()) {
        setVisible(true);
      }
    }, []);

    // aluno_kids has no recap content
    if (role === 'aluno_kids') return null;
    if (!visible) return null;

    const message = buildRecapMessage(role, data);
    if (!message) return null;

    const handleDismiss = () => {
      dismissToday();
      setVisible(false);
      onDismiss();
    };

    return (
      <div
        ref={ref}
        className="relative rounded-lg border border-bb-gray-500 bg-bb-gray-700/80 p-4 text-sm text-bb-white"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-bb-gray-300 transition-colors hover:bg-bb-gray-500 hover:text-bb-white"
          aria-label="Fechar resumo do dia"
        >
          ✕
        </button>
        <p className="pr-8">{message}</p>
      </div>
    );
  },
);

DayRecap.displayName = 'DayRecap';

export { DayRecap };
export type { DayRecapProps, Role, RoleRecapDataMap };

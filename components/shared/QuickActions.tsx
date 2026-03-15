'use client';

import { forwardRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────
type Role = 'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'aluno_kids' | 'responsavel';

interface ActionItem {
  key: string;
  icon: string;
  label: string;
}

interface QuickActionsProps {
  role: Role;
  badges?: Record<string, number>;
  onAction: (actionKey: string) => void;
}

// ── Actions per role ──────────────────────────────────────────────────
const ACTIONS_BY_ROLE: Record<Role, ActionItem[]> = {
  admin: [
    { key: 'riscos', icon: '📊', label: 'Riscos' },
    { key: 'cobrancas', icon: '💰', label: 'Cobranças' },
    { key: 'leads', icon: '📱', label: 'Leads' },
    { key: 'comunicado', icon: '📢', label: 'Comunicado' },
  ],
  professor: [
    { key: 'aula', icon: '🥋', label: 'Aula' },
    { key: 'avaliar', icon: '📝', label: 'Avaliar' },
    { key: 'mensagens', icon: '💬', label: 'Mensagens' },
    { key: 'turma', icon: '📊', label: 'Turma' },
  ],
  aluno_adulto: [
    { key: 'checkin', icon: '✅', label: 'Check-in' },
    { key: 'video', icon: '📺', label: 'Vídeo' },
    { key: 'ranking', icon: '🏆', label: 'Ranking' },
    { key: 'agenda', icon: '📅', label: 'Agenda' },
  ],
  aluno_teen: [
    { key: 'checkin', icon: '✅', label: 'Check-in' },
    { key: 'desafio', icon: '🏆', label: 'Desafio' },
    { key: 'ranking', icon: '🎮', label: 'Ranking' },
    { key: 'videos', icon: '📺', label: 'Vídeos' },
  ],
  aluno_kids: [
    { key: 'estrelas', icon: '⭐', label: 'Estrelas' },
    { key: 'aula', icon: '🥋', label: 'Aula' },
    { key: 'figurinhas', icon: '🎁', label: 'Figurinhas' },
  ],
  responsavel: [
    { key: 'presencas', icon: '👀', label: 'Presenças' },
    { key: 'mensagens', icon: '💬', label: 'Mensagens' },
    { key: 'pagamentos', icon: '💰', label: 'Pagamentos' },
    { key: 'agenda', icon: '📅', label: 'Agenda' },
  ],
};

const QuickActions = forwardRef<HTMLDivElement, QuickActionsProps>(
  function QuickActions({ role, badges = {}, onAction }, ref) {
    const actions = ACTIONS_BY_ROLE[role] ?? [];

    return (
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible"
      >
        {actions.map((action) => {
          const badgeCount = badges[action.key] ?? 0;

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key)}
              className="relative flex min-w-[5rem] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-bb-gray-700 p-4 text-bb-white transition-colors hover:bg-bb-gray-500"
            >
              {badgeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-bb-red px-1 text-[10px] font-bold text-white">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
              <span className="text-xl">{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

QuickActions.displayName = 'QuickActions';

export { QuickActions };
export type { QuickActionsProps, Role, ActionItem };

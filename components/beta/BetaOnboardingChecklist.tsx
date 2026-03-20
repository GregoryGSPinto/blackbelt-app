'use client';

import { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';

const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === 'true';

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'academy_config', label: 'Configurar dados da academia (nome, logo, cores)', href: '/admin/configuracoes' },
  { id: 'modality', label: 'Criar pelo menos 1 modalidade', href: '/admin/turmas' },
  { id: 'class', label: 'Criar pelo menos 1 turma', href: '/admin/turmas' },
  { id: 'students', label: 'Cadastrar pelo menos 3 alunos', href: '/admin/alunos' },
  { id: 'checkin', label: 'Fazer 1 check-in', href: '/admin/checkin' },
  { id: 'message', label: 'Enviar 1 mensagem para um aluno', href: '/admin/mensagens' },
  { id: 'invoice', label: 'Gerar 1 fatura', href: '/admin/financeiro' },
];

const STORAGE_KEY = 'beta_onboarding_completed';

const BetaOnboardingChecklist = forwardRef<HTMLDivElement>(function BetaOnboardingChecklist(_, ref) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompleted(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setDismissed(localStorage.getItem('beta_onboarding_dismissed') === 'true');
  }, []);

  if (!isBetaMode || dismissed) return null;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const allDone = completedCount === total;
  const progress = Math.round((completedCount / total) * 100);

  function toggleItem(id: string) {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('beta_onboarding_dismissed', 'true');
  }

  return (
    <div
      ref={ref}
      className="rounded-xl p-4 mb-4"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {allDone ? 'Parabens! Sua academia esta configurada.' : 'Bem-vindo ao Beta! Complete estes passos:'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>
            {completedCount}/{total} concluidos
          </p>
        </div>
        {allDone && (
          <button
            onClick={handleDismiss}
            className="text-xs font-medium"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Fechar
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: allDone ? '#22c55e' : '#f59e0b' }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {CHECKLIST_ITEMS.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <button
              onClick={() => toggleItem(item.id)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors"
              style={{
                borderColor: completed[item.id] ? '#22c55e' : 'var(--bb-glass-border)',
                background: completed[item.id] ? '#22c55e' : 'transparent',
              }}
            >
              {completed[item.id] && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <Link
              href={item.href}
              className="text-sm transition-colors"
              style={{
                color: completed[item.id] ? 'var(--bb-ink-40)' : 'var(--bb-ink-80)',
                textDecoration: completed[item.id] ? 'line-through' : 'none',
              }}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
});

BetaOnboardingChecklist.displayName = 'BetaOnboardingChecklist';

export { BetaOnboardingChecklist };

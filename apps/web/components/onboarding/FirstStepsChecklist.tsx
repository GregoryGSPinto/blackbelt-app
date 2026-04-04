'use client';

import { forwardRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  actionLabel: string;
  check: () => Promise<boolean>;
}

interface FirstStepsChecklistProps {
  variant: 'admin' | 'professor' | 'aluno';
}

// ── Check functions (mock-aware) ──────────────────────────────────

async function checkHasClasses(): Promise<boolean> {
  try {
    const { listClasses } = await import('@/lib/api/class.service');
    const classes = await listClasses('academy-1');
    return classes.length > 0;
  } catch { return false; }
}

async function checkHasStudents(): Promise<boolean> {
  try {
    const { listStudents } = await import('@/lib/api/student-management.service');
    const students = await listStudents('academy-1');
    return students.length >= 5;
  } catch { return false; }
}

async function checkHasFinanceiro(): Promise<boolean> {
  try {
    const { getInvoices } = await import('@/lib/api/billing.service');
    const invoices = await getInvoices('academy-1');
    return invoices.length > 0;
  } catch { return false; }
}

// ── Checklists per variant ────────────────────────────────────────

const ADMIN_ITEMS: ChecklistItem[] = [
  { id: 'account', label: 'Criar conta', href: '#', actionLabel: 'Feito!', check: async () => true },
  { id: 'academy', label: 'Dados da academia', href: '/admin/configuracoes', actionLabel: 'Configurar', check: async () => true },
  { id: 'turma', label: 'Criar primeira turma', href: '/admin/turmas', actionLabel: 'Criar turma', check: checkHasClasses },
  { id: 'alunos', label: 'Cadastrar 5 alunos', href: '/admin/alunos', actionLabel: 'Cadastrar', check: checkHasStudents },
  { id: 'checkin', label: 'Fazer primeiro check-in', href: '/admin/turmas', actionLabel: 'Como funciona?', check: async () => false },
  { id: 'financeiro', label: 'Explorar o financeiro', href: '/admin/financeiro', actionLabel: 'Abrir financeiro', check: checkHasFinanceiro },
];

const PROFESSOR_ITEMS: ChecklistItem[] = [
  { id: 'plano-aula', label: 'Criar primeiro plano de aula', href: '/professor/plano-aula', actionLabel: 'Plano de aula', check: async () => false },
  { id: 'avaliar', label: 'Avaliar um aluno', href: '/professor/avaliacoes', actionLabel: 'Avaliacoes', check: async () => false },
  { id: 'video', label: 'Enviar primeiro video', href: '/professor/conteudo', actionLabel: 'Meu conteudo', check: async () => false },
];

const ALUNO_ITEMS: ChecklistItem[] = [
  { id: 'checkin', label: 'Fazer primeiro check-in', href: '/dashboard', actionLabel: 'Check-in', check: async () => false },
  { id: 'video', label: 'Assistir um video', href: '/dashboard/conteudo', actionLabel: 'Biblioteca', check: async () => false },
  { id: 'licao', label: 'Completar uma licao teorica', href: '/academia', actionLabel: 'Academia', check: async () => false },
];

function getItems(variant: 'admin' | 'professor' | 'aluno'): ChecklistItem[] {
  if (variant === 'professor') return PROFESSOR_ITEMS;
  if (variant === 'aluno') return ALUNO_ITEMS;
  return ADMIN_ITEMS;
}

function getTitle(variant: 'admin' | 'professor' | 'aluno'): string {
  if (variant === 'professor') return 'Comece aqui';
  if (variant === 'aluno') return 'Sua jornada comeca aqui';
  return 'Primeiros Passos';
}

// ── Component ─────────────────────────────────────────────────────

const FirstStepsChecklist = forwardRef<HTMLDivElement, FirstStepsChecklistProps>(
  function FirstStepsChecklist({ variant }, ref) {
    const [hidden, setHidden] = useState(false);
    const [completed, setCompleted] = useState<Record<string, boolean>>({});
    const [loaded, setLoaded] = useState(false);

    const items = getItems(variant);
    const title = getTitle(variant);

    useEffect(() => {
      // Check if user dismissed
      const key = `bb_checklist_${variant}_hidden`;
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1') {
        setHidden(true);
        return;
      }

      // Run checks
      async function runChecks() {
        const results: Record<string, boolean> = {};
        for (const item of items) {
          try {
            results[item.id] = await item.check();
          } catch {
            results[item.id] = false;
          }
        }
        setCompleted(results);
        setLoaded(true);
      }
      runChecks();
    }, [variant, items]);

    if (hidden || !loaded) return null;

    const completedCount = Object.values(completed).filter(Boolean).length;
    const totalCount = items.length;
    const allDone = completedCount === totalCount;
    const pct = Math.round((completedCount / totalCount) * 100);

    function handleHide() {
      const key = `bb_checklist_${variant}_hidden`;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, '1');
      }
      setHidden(true);
    }

    return (
      <div
        ref={ref}
        className="rounded-xl p-5"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {allDone ? 'Sua academia esta configurada!' : title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--bb-ink-50)' }}>
              {completedCount} de {totalCount} concluidos
            </p>
          </div>
          <button
            onClick={handleHide}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--bb-ink-40)' }}
            aria-label="Esconder checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone ? '#22c55e' : 'var(--bb-brand)',
            }}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const isDone = completed[item.id] ?? false;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: isDone ? 'rgba(34,197,94,0.06)' : 'var(--bb-depth-3)',
                }}
              >
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: isDone ? '#22c55e' : 'var(--bb-depth-4)',
                    border: isDone ? 'none' : '1.5px solid var(--bb-ink-30)',
                  }}
                >
                  {isDone && <Check className="h-3 w-3 text-white" />}
                </div>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: isDone ? 'var(--bb-ink-50)' : 'var(--bb-ink-80)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                  {isDone && ' (feito!)'}
                </span>
                {!isDone && (
                  <Link
                    href={item.href}
                    className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bb-brand-surface, rgba(239,68,68,0.1))', color: 'var(--bb-brand)' }}
                  >
                    {item.actionLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

FirstStepsChecklist.displayName = 'FirstStepsChecklist';

export { FirstStepsChecklist };

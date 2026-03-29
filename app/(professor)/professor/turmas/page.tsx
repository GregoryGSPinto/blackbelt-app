'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import type { BeltLevel } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// Belt helpers
// ────────────────────────────────────────────────────────────
const BELT_COLORS: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_LABEL: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

const BELT_ORDER: Record<string, number> = {
  white: 0, gray: 1, yellow: 2, orange: 3, green: 4,
  blue: 5, purple: 6, brown: 7, black: 8,
};

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface StudentSeed {
  id: string;
  name: string;
  belt: BeltLevel;
}

interface ClassSeed {
  id: string;
  name: string;
  modality: string;
  professor: string;
  days: string;
  time: string;
  students: StudentSeed[];
}

// ────────────────────────────────────────────────────────────
// Mock seed data
// ────────────────────────────────────────────────────────────
const SEED_CLASSES: ClassSeed[] = [
  {
    id: 'cls-bjj-manha',
    name: 'BJJ Adulto Manha',
    modality: 'BJJ',
    professor: 'Prof. Andre',
    days: 'Seg / Qua / Sex',
    time: '07:00',
    students: [
      { id: 's1', name: 'Joao Mendes', belt: 'blue' as BeltLevel },
      { id: 's2', name: 'Maria Oliveira', belt: 'purple' as BeltLevel },
      { id: 's3', name: 'Pedro Santos', belt: 'white' as BeltLevel },
      { id: 's4', name: 'Ana Costa', belt: 'blue' as BeltLevel },
      { id: 's5', name: 'Lucas Ferreira', belt: 'white' as BeltLevel },
      { id: 's6', name: 'Rafael Souza', belt: 'brown' as BeltLevel },
      { id: 's7', name: 'Camila Lima', belt: 'blue' as BeltLevel },
      { id: 's8', name: 'Diego Rocha', belt: 'white' as BeltLevel },
    ],
  },
  {
    id: 'cls-bjj-noite',
    name: 'BJJ Adulto Noite',
    modality: 'BJJ',
    professor: 'Prof. Andre',
    days: 'Seg / Qua / Sex',
    time: '19:00',
    students: [
      { id: 's9', name: 'Juliana Martins', belt: 'purple' as BeltLevel },
      { id: 's10', name: 'Marcos Pereira', belt: 'blue' as BeltLevel },
      { id: 's11', name: 'Patricia Gomes', belt: 'brown' as BeltLevel },
      { id: 's12', name: 'Bruno Alves', belt: 'white' as BeltLevel },
      { id: 's13', name: 'Fernanda Ribeiro', belt: 'blue' as BeltLevel },
      { id: 's14', name: 'Thiago Nascimento', belt: 'purple' as BeltLevel },
      { id: 's15', name: 'Carla Duarte', belt: 'white' as BeltLevel },
      { id: 's16', name: 'Gustavo Moreira', belt: 'blue' as BeltLevel },
      { id: 's17', name: 'Isabela Freitas', belt: 'white' as BeltLevel },
      { id: 's18', name: 'Roberto Cardoso', belt: 'brown' as BeltLevel },
      { id: 's19', name: 'Larissa Vieira', belt: 'blue' as BeltLevel },
      { id: 's20', name: 'Eduardo Pinto', belt: 'purple' as BeltLevel },
    ],
  },
  {
    id: 'cls-judo',
    name: 'Judo Adulto',
    modality: 'Judo',
    professor: 'Prof. Fernanda',
    days: 'Ter / Qui',
    time: '18:00',
    students: [
      { id: 's21', name: 'Amanda Barros', belt: 'yellow' as BeltLevel },
      { id: 's22', name: 'Felipe Torres', belt: 'orange' as BeltLevel },
      { id: 's23', name: 'Vanessa Cruz', belt: 'green' as BeltLevel },
      { id: 's24', name: 'Renato Dias', belt: 'yellow' as BeltLevel },
      { id: 's25', name: 'Tatiana Nunes', belt: 'white' as BeltLevel },
      { id: 's26', name: 'Vinicius Rocha', belt: 'orange' as BeltLevel },
    ],
  },
  {
    id: 'cls-bjj-kids',
    name: 'BJJ Kids',
    modality: 'BJJ',
    professor: 'Prof. Fernanda',
    days: 'Sab',
    time: '09:00',
    students: [
      { id: 's27', name: 'Miguel Silva', belt: 'gray' as BeltLevel },
      { id: 's28', name: 'Sofia Santos', belt: 'gray' as BeltLevel },
      { id: 's29', name: 'Arthur Oliveira', belt: 'yellow' as BeltLevel },
      { id: 's30', name: 'Helena Costa', belt: 'white' as BeltLevel },
      { id: 's31', name: 'Theo Ferreira', belt: 'gray' as BeltLevel },
    ],
  },
  {
    id: 'cls-bjj-teen',
    name: 'BJJ Teen',
    modality: 'BJJ',
    professor: 'Prof. Andre',
    days: 'Ter / Qui',
    time: '17:00',
    students: [
      { id: 's32', name: 'Bruna Alves', belt: 'orange' as BeltLevel },
      { id: 's33', name: 'Caio Martins', belt: 'green' as BeltLevel },
      { id: 's34', name: 'Luana Pereira', belt: 'yellow' as BeltLevel },
      { id: 's35', name: 'Gabriel Mendes', belt: 'orange' as BeltLevel },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function computeAverageBelt(students: StudentSeed[]): string {
  if (students.length === 0) return 'white';
  const total = students.reduce((acc, s) => acc + (BELT_ORDER[s.belt] ?? 0), 0);
  const avg = Math.round(total / students.length);
  const entry = Object.entries(BELT_ORDER).find(([, v]) => v === avg);
  return entry ? entry[0] : 'white';
}

const MODALITY_EMOJI: Record<string, string> = {
  BJJ: '\uD83E\uDD4B',
  Judo: '\uD83E\uDD4B',
};

// ────────────────────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────────────────────
export default function ProfessorTurmasPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalStudents = SEED_CLASSES.reduce((acc, c) => acc + c.students.length, 0);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--bb-ink-100)]">Minhas Turmas</h1>
          <p className="mt-1 text-sm text-[var(--bb-ink-40)]">
            {SEED_CLASSES.length} turmas ativas
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[var(--bb-ink-100)]">{SEED_CLASSES.length}</p>
            <p className="text-[10px] text-[var(--bb-ink-40)]">Turmas</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[var(--bb-ink-100)]">{totalStudents}</p>
            <p className="text-[10px] text-[var(--bb-ink-40)]">Total Alunos</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[var(--bb-brand)]">
              {SEED_CLASSES.length > 0
                ? Math.round(totalStudents / SEED_CLASSES.length)
                : 0}
            </p>
            <p className="text-[10px] text-[var(--bb-ink-40)]">Media/Turma</p>
          </Card>
        </div>

        {/* Class Cards */}
        {SEED_CLASSES.length === 0 && (
          <EmptyState
            icon="🥋"
            title="Nenhuma turma encontrada"
            description="Você ainda não possui turmas atribuídas. Entre em contato com a administração."
            variant="first-time"
          />
        )}
        <div className="space-y-4">
          {SEED_CLASSES.map((cls) => {
            const isExpanded = expandedId === cls.id;
            const avgBelt = computeAverageBelt(cls.students);

            return (
              <Card
                key={cls.id}
                className="overflow-hidden p-0"
              >
                {/* Card Header — clickable */}
                <button
                  type="button"
                  onClick={() => toggle(cls.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[var(--bb-depth-2)]"
                >
                  {/* Emoji */}
                  <span className="mt-0.5 text-2xl">
                    {MODALITY_EMOJI[cls.modality] ?? '\uD83E\uDD4B'}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-[var(--bb-ink-100)]">
                      {cls.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">
                      {cls.modality} &middot; {cls.professor}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                      {cls.days} &mdash; {cls.time}
                    </p>
                  </div>

                  {/* Right side: student count + average belt */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-semibold text-[var(--bb-ink-100)]">
                      {cls.students.length} alunos
                    </span>
                    <Badge
                      variant="belt"
                      beltColor={BELT_COLORS[avgBelt] ?? '#D4D4D4'}
                      size="sm"
                    >
                      {BELT_LABEL[avgBelt] ?? avgBelt}
                    </Badge>
                  </div>
                </button>

                {/* Summary student avatars (always visible) */}
                <div className="flex items-center gap-1 border-t border-[var(--bb-glass-border)] px-4 py-2.5">
                  <div className="flex -space-x-2">
                    {cls.students.slice(0, 5).map((stu) => (
                      <Avatar key={stu.id} name={stu.name} size="sm" className="h-6 w-6 text-[10px] ring-2 ring-[var(--bb-depth-3)]" />
                    ))}
                  </div>
                  {cls.students.length > 5 && (
                    <span className="ml-1 text-xs text-[var(--bb-ink-40)]">
                      +{cls.students.length - 5}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[var(--bb-ink-40)]">
                    {isExpanded ? 'Recolher' : 'Ver alunos'}
                  </span>
                  <svg
                    className={`ml-1 h-4 w-4 text-[var(--bb-ink-40)] transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded: full student list */}
                {isExpanded && (
                  <div className="border-t border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
                      Lista de Alunos
                    </p>
                    <div className="space-y-2">
                      {cls.students
                        .slice()
                        .sort((a, b) => (BELT_ORDER[b.belt] ?? 0) - (BELT_ORDER[a.belt] ?? 0))
                        .map((stu) => (
                          <div
                            key={stu.id}
                            className="flex items-center gap-3 rounded-lg bg-[var(--bb-depth-3)] px-3 py-2"
                          >
                            <Avatar name={stu.name} size="sm" />
                            <span className="flex-1 text-sm font-medium text-[var(--bb-ink-100)]">
                              {stu.name}
                            </span>
                            <Badge
                              variant="belt"
                              beltColor={BELT_COLORS[stu.belt] ?? '#D4D4D4'}
                              size="sm"
                            >
                              {BELT_LABEL[stu.belt] ?? stu.belt}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

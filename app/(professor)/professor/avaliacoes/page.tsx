'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { AlunoResumoDTO, TurmaResumoDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

// ── Belt display helpers ────────────────────────────────────────────

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

// ── Mock evaluation metadata per student ────────────────────────────
// Extends the dashboard data with evaluation-specific fields for the listing

interface StudentEvalRow {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: string;
  ultima_presenca: string | null;
  last_evaluation: string | null;
  status: 'pendente' | 'em_dia' | 'atrasada';
  attendance_pct: number;
  technical_score: number;
  behavior_note: string;
  turma: string;
  modalidade: string;
}

const MOCK_EVAL_EXTRA: Record<
  string,
  {
    last_evaluation: string | null;
    status: 'pendente' | 'em_dia' | 'atrasada';
    attendance_pct: number;
    technical_score: number;
    behavior_note: string;
    turma: string;
    modalidade: string;
  }
> = {
  'stu-1': {
    last_evaluation: '2026-02-10',
    status: 'pendente',
    attendance_pct: 92,
    technical_score: 76,
    behavior_note: 'Excelente disciplina e respeito aos colegas',
    turma: 'BJJ Noite',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
  'stu-2': {
    last_evaluation: '2026-01-20',
    status: 'atrasada',
    attendance_pct: 88,
    technical_score: 84,
    behavior_note: 'Lideranca positiva no tatame',
    turma: 'BJJ Noite',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
  'stu-3': {
    last_evaluation: null,
    status: 'pendente',
    attendance_pct: 65,
    technical_score: 42,
    behavior_note: 'Precisa melhorar pontualidade',
    turma: 'BJJ Manhã',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
  'stu-5': {
    last_evaluation: '2026-03-01',
    status: 'em_dia',
    attendance_pct: 95,
    technical_score: 70,
    behavior_note: 'Dedicado e proativo nos treinos',
    turma: 'BJJ Manhã',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
  'stu-7': {
    last_evaluation: '2026-02-25',
    status: 'em_dia',
    attendance_pct: 85,
    technical_score: 90,
    behavior_note: 'Referencia tecnica para a turma',
    turma: 'BJJ Noite',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
  'stu-8': {
    last_evaluation: '2025-12-10',
    status: 'atrasada',
    attendance_pct: 58,
    technical_score: 62,
    behavior_note: 'Boa atitude mas frequencia irregular',
    turma: 'BJJ Manhã',
    modalidade: 'Brazilian Jiu-Jitsu',
  },
};

// ── Status helpers ──────────────────────────────────────────────────

function statusLabel(s: StudentEvalRow['status']): { text: string; className: string } {
  switch (s) {
    case 'em_dia':
      return { text: 'Em dia', className: 'bg-green-100 text-green-700' };
    case 'pendente':
      return { text: 'Pendente', className: 'bg-yellow-100 text-yellow-700' };
    case 'atrasada':
      return { text: 'Atrasada', className: 'bg-red-100 text-red-700' };
  }
}

function scoreBadgeClass(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

// ── Page Component ──────────────────────────────────────────────────

export default function ProfessorAvaliacoesPage() {
  const [alunos, setAlunos] = useState<AlunoResumoDTO[]>([]);
  const [turmas, setTurmas] = useState<TurmaResumoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'em_dia' | 'atrasada'>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessorDashboard('prof-1');
        setAlunos(data.meusAlunos);
        setTurmas(data.minhasTurmas);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build enriched rows with evaluation metadata
  const rows: StudentEvalRow[] = useMemo(() => {
    return alunos.map((a) => {
      const extra = MOCK_EVAL_EXTRA[a.student_id] ?? {
        last_evaluation: null,
        status: 'pendente' as const,
        attendance_pct: 50,
        technical_score: 50,
        behavior_note: 'Sem observacoes',
        turma: turmas[0]?.modality_name ?? 'Turma',
        modalidade: turmas[0]?.modality_name ?? 'Modalidade',
      };

      return {
        student_id: a.student_id,
        display_name: a.display_name,
        avatar: a.avatar,
        belt: a.belt,
        ultima_presenca: a.ultima_presenca,
        ...extra,
      };
    });
  }, [alunos, turmas]);

  // Unique turma names for filter
  const turmaNames = useMemo(() => {
    const names = new Set(rows.map((r) => r.turma));
    return Array.from(names).sort();
  }, [rows]);

  // Filtered list
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch = r.display_name.toLowerCase().includes(search.toLowerCase());
      const matchTurma = filterTurma === 'all' || r.turma === filterTurma;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchTurma && matchStatus;
    });
  }, [rows, search, filterTurma, filterStatus]);

  // Summary counts
  const summary = useMemo(() => {
    const pendente = rows.filter((r) => r.status === 'pendente').length;
    const atrasada = rows.filter((r) => r.status === 'atrasada').length;
    const emDia = rows.filter((r) => r.status === 'em_dia').length;
    return { pendente, atrasada, emDia, total: rows.length };
  }, [rows]);

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (alunos.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Nenhum aluno encontrado"
          description="Voce nao possui alunos matriculados nas suas turmas para avaliar."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">Avaliacoes</h1>
        <p className="text-sm text-[var(--bb-ink-60)]">
          Gerencie as avaliacoes dos seus alunos
        </p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{summary.pendente}</p>
          <p className="text-xs text-[var(--bb-ink-40)]">Pendentes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{summary.atrasada}</p>
          <p className="text-xs text-[var(--bb-ink-40)]">Atrasadas</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{summary.emDia}</p>
          <p className="text-xs text-[var(--bb-ink-40)]">Em dia</p>
        </Card>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar aluno..."
          className="w-full rounded-lg border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-4 py-2 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand-primary)]"
        />

        <div className="flex flex-wrap gap-2">
          {/* Turma filter */}
          <select
            value={filterTurma}
            onChange={(e) => setFilterTurma(e.target.value)}
            className="rounded-lg border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-3 py-1.5 text-xs text-[var(--bb-ink-100)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand-primary)]"
          >
            <option value="all">Todas as turmas</option>
            {turmaNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-lg border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] px-3 py-1.5 text-xs text-[var(--bb-ink-100)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand-primary)]"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="atrasada">Atrasada</option>
            <option value="em_dia">Em dia</option>
          </select>
        </div>
      </div>

      {/* ── Student List ──────────────────────────────────────────────── */}
      {filteredRows.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--bb-ink-40)]">
          Nenhum aluno encontrado com esses filtros.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((row) => {
            const status = statusLabel(row.status);
            return (
              <Card key={row.student_id} className="p-4">
                {/* Top row: avatar + name + belt + status */}
                <div className="flex items-center gap-3">
                  <Avatar name={row.display_name} src={row.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-[var(--bb-ink-100)]">
                        {row.display_name}
                      </p>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant="belt"
                        beltColor={BELT_COLORS[row.belt] ?? '#D4D4D4'}
                        size="sm"
                      >
                        {BELT_LABEL[row.belt] ?? row.belt}
                      </Badge>
                      <span className="text-xs text-[var(--bb-ink-40)]">
                        {row.turma}
                      </span>
                    </div>
                  </div>
                  <Link href={`/avaliar/${row.student_id}`}>
                    <Button size="sm">Avaliar</Button>
                  </Link>
                </div>

                {/* Detail row: attendance, technical, behavior */}
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[var(--bb-glass-border)] pt-3">
                  {/* Attendance */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--bb-ink-40)]">
                      Frequencia
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1.5 flex-1 rounded-full bg-[var(--bb-depth-3)]">
                        <div
                          className={`h-1.5 rounded-full ${
                            row.attendance_pct >= 80
                              ? 'bg-green-500'
                              : row.attendance_pct >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${row.attendance_pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[var(--bb-ink-100)]">
                        {row.attendance_pct}%
                      </span>
                    </div>
                  </div>

                  {/* Technical evolution */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--bb-ink-40)]">
                      Tecnica
                    </p>
                    <p className={`mt-1 text-sm font-bold ${scoreBadgeClass(row.technical_score)}`}>
                      {row.technical_score}/100
                    </p>
                  </div>

                  {/* Behavior */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--bb-ink-40)]">
                      Comportamento
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--bb-ink-60)]">
                      {row.behavior_note}
                    </p>
                  </div>
                </div>

                {/* Last evaluation date */}
                <p className="mt-2 text-[10px] text-[var(--bb-ink-40)]">
                  Ultima avaliacao:{' '}
                  {row.last_evaluation
                    ? new Date(row.last_evaluation).toLocaleDateString('pt-BR')
                    : 'Nunca avaliado'}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

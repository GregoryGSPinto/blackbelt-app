'use client';

import { useState, useEffect, useMemo } from 'react';
import { listClasses } from '@/lib/api/turmas.service';
import type { ClassWithDetails } from '@/lib/api/turmas.service';
import type { EnrolledStudentDTO } from '@/lib/api/turmas.service';
import { getClassById } from '@/lib/api/turmas.service';
import { handleServiceError } from '@/lib/api/errors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { BeltLevel, EnrollmentStatus } from '@/lib/types';

// ── Types ────────────────────────────────────────────────────────────

interface AdminStudentRow {
  student_id: string;
  display_name: string;
  email: string;
  belt: BeltLevel;
  plan: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  classes: string[];
}

// ── Belt helpers ─────────────────────────────────────────────────────

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

const BELT_COLOR: Record<string, string> = {
  white: 'bg-white text-gray-800 border border-gray-300',
  gray: 'bg-gray-400 text-white',
  yellow: 'bg-yellow-400 text-yellow-900',
  orange: 'bg-orange-500 text-white',
  green: 'bg-green-500 text-white',
  blue: 'bg-blue-600 text-white',
  purple: 'bg-purple-600 text-white',
  brown: 'bg-amber-800 text-white',
  black: 'bg-gray-900 text-white',
};

const PLAN_NAMES = ['Mensal', 'Trimestral', 'Anual'];

function deriveEmail(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    + '@email.com';
}

function derivePlan(index: number): string {
  return PLAN_NAMES[index % PLAN_NAMES.length];
}

// ── Data builder ─────────────────────────────────────────────────────

function buildStudentRows(
  classes: ClassWithDetails[],
  enrolledByClass: Map<string, EnrolledStudentDTO[]>,
): AdminStudentRow[] {
  const studentMap = new Map<string, AdminStudentRow>();

  for (const cls of classes) {
    const enrolled = enrolledByClass.get(cls.id) ?? [];
    for (const student of enrolled) {
      const existing = studentMap.get(student.student_id);
      if (existing) {
        if (!existing.classes.includes(cls.modality_name)) {
          existing.classes.push(cls.modality_name);
        }
      } else {
        studentMap.set(student.student_id, {
          student_id: student.student_id,
          display_name: student.display_name,
          email: deriveEmail(student.display_name),
          belt: student.belt,
          plan: derivePlan(studentMap.size),
          status: student.enrollment_status,
          enrolled_at: student.enrolled_at,
          classes: [cls.modality_name],
        });
      }
    }
  }

  return [...studentMap.values()].sort((a, b) =>
    a.display_name.localeCompare(b.display_name, 'pt-BR'),
  );
}

// ── Main ─────────────────────────────────────────────────────────────

export default function AdminAlunosPage() {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBelt, setFilterBelt] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const classes = await listClasses('academy-1');
        // Fetch enrolled students for each class
        const enrolledByClass = new Map<string, EnrolledStudentDTO[]>();
        const details = await Promise.all(classes.map((c) => getClassById(c.id)));
        for (const detail of details) {
          enrolledByClass.set(detail.id, detail.enrolled_students);
        }
        const rows = buildStudentRows(classes, enrolledByClass);
        setStudents(rows);
      } catch (error) {
        handleServiceError(error, 'admin.alunos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = students;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.display_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }

    if (filterBelt) {
      result = result.filter((s) => s.belt === filterBelt);
    }

    if (filterStatus) {
      result = result.filter((s) => s.status === filterStatus);
    }

    return result;
  }, [students, search, filterBelt, filterStatus]);

  const activeCount = students.filter((s) => s.status === EnrollmentStatus.Active).length;
  const inactiveCount = students.filter((s) => s.status === EnrollmentStatus.Inactive).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-bb-black">Alunos</h1>
          <p className="mt-1 text-sm text-bb-gray-500">
            {students.length} aluno{students.length !== 1 ? 's' : ''} &middot;{' '}
            <span className="text-green-500">{activeCount} ativos</span>
            {inactiveCount > 0 && (
              <span className="text-bb-gray-500"> &middot; {inactiveCount} inativos</span>
            )}
          </p>
        </div>
        <Button onClick={() => {}}>Novo Aluno</Button>
      </div>

      {/* ── Search & Filters ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-300 bg-bb-white py-2 pl-9 pr-3 text-sm text-bb-black placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
          />
        </div>

        <select
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          className="rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-700 focus:border-bb-red focus:outline-none"
        >
          <option value="">Todas as faixas</option>
          {Object.entries(BELT_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm text-bb-gray-700 focus:border-bb-red focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value={EnrollmentStatus.Active}>Ativo</option>
          <option value={EnrollmentStatus.Inactive}>Inativo</option>
        </select>
      </div>

      {/* ── Results count ───────────────────────────────────────────── */}
      {(search || filterBelt || filterStatus) && (
        <p className="text-xs text-bb-gray-500">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-bb-gray-500">
            {search || filterBelt || filterStatus
              ? 'Nenhum aluno encontrado com esses filtros.'
              : 'Nenhum aluno cadastrado.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Faixa</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Plano</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Turmas</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Matricula</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.student_id} className="border-b border-bb-gray-100 hover:bg-bb-gray-100/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-bb-black">{student.display_name}</p>
                      <p className="text-xs text-bb-gray-500">{student.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          BELT_COLOR[student.belt] ?? 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {BELT_LABEL[student.belt] ?? student.belt}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bb-gray-700">{student.plan}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          student.status === EnrollmentStatus.Active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {student.status === EnrollmentStatus.Active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {student.classes.map((cls) => (
                          <span
                            key={cls}
                            className="rounded bg-bb-gray-100 px-1.5 py-0.5 text-[11px] text-bb-gray-700"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-bb-gray-500">
                      {new Date(student.enrolled_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

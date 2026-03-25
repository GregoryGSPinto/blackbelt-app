'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  listStudents,
  getStudentManagementStats,
} from '@/lib/api/student-management.service';
import type {
  AdminStudentItem,
  StudentManagementStats,
} from '@/lib/types/student-management';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { BeltLevel } from '@/lib/types/domain';
import { translateError } from '@/lib/utils/error-translator';
import { exportToCSV } from '@/lib/utils/export-csv';
import { Download } from 'lucide-react';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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
  white: '#f5f5f5',
  gray: '#9ca3af',
  yellow: '#eab308',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  brown: '#92400e',
  black: '#1f2937',
};

const BELT_TEXT: Record<string, string> = {
  white: '#374151',
  gray: '#fff',
  yellow: '#422006',
  orange: '#fff',
  green: '#fff',
  blue: '#fff',
  purple: '#fff',
  brown: '#fff',
  black: '#fff',
};

const MENSALIDADE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  em_dia: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Em dia' },
  pendente: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Pendente' },
  atrasado: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Atrasado' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativo' },
  inactive: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: 'Inativo' },
  pending: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Pendente' },
};

// Turmas derived from student data below (no hardcoded list)

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function AdminAlunosPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [stats, setStats] = useState<StudentManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBelt, setFilterBelt] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTurma, setFilterTurma] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, st] = await Promise.all([
          listStudents(getActiveAcademyId()),
          getStudentManagementStats(getActiveAcademyId()),
        ]);
        setStudents(s);
        setStats(st);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const turmaOptions = useMemo(
    () => [...new Set(students.flatMap((s) => s.turmas))].sort(),
    [students],
  );

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
    if (filterBelt) result = result.filter((s) => s.belt === filterBelt);
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (filterTurma) result = result.filter((s) => s.turmas.includes(filterTurma));
    return result;
  }, [students, search, filterBelt, filterStatus, filterTurma]);

  function handleExportCSV() {
    exportToCSV(
      filtered.map((s) => ({
        Nome: s.display_name,
        Email: s.email,
        Faixa: BELT_LABEL[s.belt] ?? s.belt,
        Turmas: s.turmas.join('; '),
        Frequencia: `${s.attendance_rate}%`,
        Mensalidade: MENSALIDADE_STYLES[s.mensalidade_status]?.label ?? s.mensalidade_status,
        Status: STATUS_STYLES[s.status]?.label ?? s.status,
      })),
      'alunos',
    );
    toast('CSV exportado!', 'success');
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="animate-reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Alunos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gestão completa de alunos da academia
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const header = 'Nome,Email,Telefone,CPF,Data Nascimento,Faixa,Turma,Plano\n';
              const example = 'João Silva,joao@email.com,(11)99999-9999,123.456.789-00,1990-01-15,white,BJJ Fundamentos,Mensal\n';
              const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'modelo_importacao_alunos.csv';
              a.click();
              URL.revokeObjectURL(url);
              toast('Planilha modelo baixada!', 'success');
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Planilha Modelo
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
          <Link
            href="/admin/convites"
            className="inline-flex items-center rounded-lg px-4 py-2 min-h-[44px] text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            + Novo Aluno
          </Link>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      {stats && (
        <section className="animate-reveal grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Ativos</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: '#22c55e' }}>
              {stats.total_active}
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Novos este mês</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>
              {stats.new_this_month}
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Inativos</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-60)' }}>
              {stats.inactive}
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Por Faixa</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(stats.by_belt)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([belt, count]) => (
                  <span
                    key={belt}
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: BELT_COLOR[belt] ?? '#666',
                      color: BELT_TEXT[belt] ?? '#fff',
                    }}
                  >
                    {count}
                  </span>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <section className="animate-reveal flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 min-h-[44px] text-sm w-full"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        />
        <select
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          className="rounded-lg px-3 py-2 min-h-[44px] text-sm w-full sm:w-auto"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          <option value="">Todas as faixas</option>
          {Object.values(BeltLevel).map((b) => (
            <option key={b} value={b}>{BELT_LABEL[b] ?? b}</option>
          ))}
        </select>
        <select
          value={filterTurma}
          onChange={(e) => setFilterTurma(e.target.value)}
          className="rounded-lg px-3 py-2 min-h-[44px] text-sm w-full sm:w-auto"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          <option value="">Todas as turmas</option>
          {turmaOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg px-3 py-2 min-h-[44px] text-sm w-full sm:w-auto"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="pending">Pendente</option>
        </select>
      </section>

      {/* ── Results count ───────────────────────────────────────── */}
      {(search || filterBelt || filterStatus || filterTurma) && (
        <p className="animate-reveal text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
      )}

      {/* ── Student List ────────────────────────────────────────── */}
      <section className="animate-reveal space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16" style={{ color: 'var(--bb-ink-40)' }}>
            <span className="text-4xl">🥋</span>
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              {search || filterBelt || filterStatus || filterTurma
                ? 'Nenhum aluno encontrado com esses filtros'
                : 'Nenhum aluno cadastrado'}
            </p>
            {!search && !filterBelt && !filterStatus && !filterTurma && (
              <Link
                href="/admin/convites"
                className="inline-flex items-center rounded-lg px-4 py-2 min-h-[44px] text-sm font-semibold"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                Gerar Link de Convite
              </Link>
            )}
          </div>
        ) : (
          /* ── Desktop table ─────────────────────────────────── */
          <div
            className="hidden overflow-hidden rounded-lg sm:block"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    {['Aluno', 'Faixa', 'Turmas', 'Freq.', 'Mensalidade', 'Status', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const ms = MENSALIDADE_STYLES[s.mensalidade_status];
                    const ss = STATUS_STYLES[s.status];
                    return (
                      <tr
                        key={s.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: BELT_COLOR[s.belt] ?? '#666',
                                color: BELT_TEXT[s.belt] ?? '#fff',
                              }}
                            >
                              {getInitials(s.display_name)}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="truncate text-sm font-medium"
                                style={{ color: 'var(--bb-ink-100)' }}
                              >
                                {s.display_name}
                              </p>
                              <p className="truncate text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                                {s.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{
                              background: BELT_COLOR[s.belt] ?? '#666',
                              color: BELT_TEXT[s.belt] ?? '#fff',
                            }}
                          >
                            {BELT_LABEL[s.belt] ?? s.belt}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {s.turmas.map((t) => (
                              <span
                                key={t}
                                className="rounded px-1.5 py-0.5 text-[11px]"
                                style={{
                                  background: 'var(--bb-depth-4)',
                                  color: 'var(--bb-ink-60)',
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-12 rounded-full"
                              style={{ background: 'var(--bb-depth-4)' }}
                            >
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${s.attendance_rate}%`,
                                  background:
                                    s.attendance_rate >= 80
                                      ? '#22c55e'
                                      : s.attendance_rate >= 60
                                        ? '#eab308'
                                        : '#ef4444',
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                              {s.attendance_rate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ background: ms.bg, color: ms.text }}
                          >
                            {ms.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ background: ss.bg, color: ss.text }}
                          >
                            {ss.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/alunos/${s.id}`}
                            className="text-xs font-medium transition-colors"
                            style={{ color: 'var(--bb-brand)' }}
                          >
                            Ver perfil
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Mobile cards ──────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="space-y-2 sm:hidden">
            {filtered.map((s) => {
              const ms = MENSALIDADE_STYLES[s.mensalidade_status];
              const ss = STATUS_STYLES[s.status];
              return (
                <Link
                  key={s.id}
                  href={`/admin/alunos/${s.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition-all"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: BELT_COLOR[s.belt] ?? '#666',
                      color: BELT_TEXT[s.belt] ?? '#fff',
                    }}
                  >
                    {getInitials(s.display_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                      {s.display_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: BELT_COLOR[s.belt] ?? '#666',
                          color: BELT_TEXT[s.belt] ?? '#fff',
                        }}
                      >
                        {BELT_LABEL[s.belt] ?? s.belt}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                        {s.attendance_rate}% freq.
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: ms.bg, color: ms.text }}
                      >
                        {ms.label}
                      </span>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: ss.bg, color: ss.text }}
                  >
                    {ss.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

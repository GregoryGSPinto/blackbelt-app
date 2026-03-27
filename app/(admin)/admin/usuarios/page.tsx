'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { createBrowserClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/env';

// ── Constants ────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  recepcao: 'Recepcionista',
  aluno_adulto: 'Aluno Adulto',
  aluno_teen: 'Aluno Teen',
  aluno_kids: 'Aluno Kids',
  responsavel: 'Responsavel',
};

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
  professor: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  recepcao: { bg: 'rgba(249,115,22,0.15)', text: '#f97316' },
  aluno_adulto: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  aluno_teen: { bg: 'rgba(20,184,166,0.15)', text: '#14b8a6' },
  aluno_kids: { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
  responsavel: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
};

interface UserRow {
  id: string;
  display_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

// ── Mock data ────────────────────────────────────────────────────────────

const MOCK_USERS: UserRow[] = [
  {
    id: 'mock-1',
    display_name: 'Carlos Machado',
    email: 'carlos@academia.com',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'mock-2',
    display_name: 'Rafael Mendes',
    email: 'rafael@academia.com',
    role: 'professor',
    status: 'active',
    created_at: '2025-02-15T14:30:00Z',
  },
  {
    id: 'mock-3',
    display_name: 'Juliana Santos',
    email: 'juliana@academia.com',
    role: 'recepcao',
    status: 'active',
    created_at: '2025-03-01T09:00:00Z',
  },
  {
    id: 'mock-4',
    display_name: 'Pedro Almeida',
    email: 'pedro@email.com',
    role: 'aluno_adulto',
    status: 'active',
    created_at: '2025-04-20T16:00:00Z',
  },
  {
    id: 'mock-5',
    display_name: 'Lucas Ferreira',
    email: '--',
    role: 'aluno_teen',
    status: 'active',
    created_at: '2025-05-05T11:00:00Z',
  },
  {
    id: 'mock-6',
    display_name: 'Maria Oliveira',
    email: 'maria@email.com',
    role: 'responsavel',
    status: 'active',
    created_at: '2025-05-05T11:30:00Z',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'pending':
      return 'Pendente';
    case 'inactive':
      return 'Inativo';
    case 'suspended':
      return 'Suspenso';
    default:
      return status;
  }
}

function getStatusStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'active':
      return { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' };
    case 'pending':
      return { bg: 'rgba(234,179,8,0.15)', text: '#eab308' };
    case 'inactive':
      return { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' };
    case 'suspended':
      return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
    default:
      return { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' };
  }
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (isMock()) {
          setUsers(MOCK_USERS);
          setLoading(false);
          return;
        }

        const academyId = getActiveAcademyId();
        if (!academyId) {
          setLoading(false);
          return;
        }

        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('memberships')
          .select('*, profiles(id, display_name, user_id, role)')
          .eq('academy_id', academyId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows: UserRow[] = (data || []).map((m: Record<string, unknown>) => {
          const profile = m.profiles as Record<string, unknown> | null;
          return {
            id: (profile?.id as string) || (m.id as string),
            display_name: (profile?.display_name as string) || 'Sem nome',
            email: '--',
            role: (profile?.role as string) || (m.role as string) || 'aluno_adulto',
            status: m.status as string,
            created_at: m.created_at as string,
          };
        });

        setUsers(rows);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // ── Derived state ─────────────────────────────────────────────────────

  const roleOptions = useMemo(
    () => [...new Set(users.map((u) => u.role))].sort(),
    [users],
  );

  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.display_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (filterRole) {
      result = result.filter((u) => u.role === filterRole);
    }
    return result;
  }, [users, search, filterRole]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  // ── Loading skeleton ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div
            className="h-8 w-40 animate-pulse rounded-lg"
            style={{ background: 'var(--bb-depth-3)' }}
          />
          <div
            className="h-10 w-36 animate-pulse rounded-lg"
            style={{ background: 'var(--bb-depth-3)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg"
              style={{ background: 'var(--bb-depth-3)' }}
            />
          ))}
        </div>
        <div
          className="h-11 animate-pulse rounded-lg"
          style={{ background: 'var(--bb-depth-3)' }}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg"
            style={{ background: 'var(--bb-depth-3)' }}
          />
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" style={{ background: 'var(--bb-depth-1)' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Usuarios
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Todos os membros da academia
          </p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 min-h-[44px] text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: 'var(--bb-brand)',
            color: '#fff',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: 'var(--bb-shadow-lg)',
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuario
        </Link>
      </section>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
            Total
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {users.length}
          </p>
        </div>
        {Object.entries(roleCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([role, count]) => {
            const rc = ROLE_COLOR[role] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
            return (
              <div
                key={role}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                  {ROLE_LABEL[role] ?? role}
                </p>
                <p className="mt-1 text-2xl font-bold" style={{ color: rc.text }}>
                  {count}
                </p>
              </div>
            );
          })}
      </section>

      {/* ── Filter / search bar ─────────────────────────────────── */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg pl-10 pr-3 py-2.5 min-h-[44px] text-sm focus:outline-none"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg px-3 py-2.5 min-h-[44px] text-sm w-full sm:w-auto focus:outline-none"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
            borderRadius: 'var(--bb-radius-sm)',
          }}
        >
          <option value="">Todos os perfis</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r] ?? r}
            </option>
          ))}
        </select>
      </section>

      {/* ── Results count ───────────────────────────────────────── */}
      {(search || filterRole) && (
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-16"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            {search || filterRole
              ? 'Nenhum usuario encontrado com esses filtros'
              : 'Nenhum usuario cadastrado'}
          </p>
          {!search && !filterRole && (
            <Link
              href="/admin/usuarios/novo"
              className="inline-flex items-center rounded-lg px-4 py-2 min-h-[44px] text-sm font-semibold"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              Criar Primeiro Usuario
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────────── */}
          <section
            className="hidden overflow-hidden rounded-xl sm:block"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    {['Nome', 'Email', 'Perfil', 'Status', 'Data de cadastro'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const rc = ROLE_COLOR[u.role] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
                    const sc = getStatusStyle(u.status);
                    return (
                      <tr
                        key={`${u.id}-${u.role}`}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--bb-depth-3)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        {/* Nome */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ background: rc.bg, color: rc.text }}
                            >
                              {getInitials(u.display_name)}
                            </div>
                            <span
                              className="truncate text-sm font-medium"
                              style={{ color: 'var(--bb-ink-100)' }}
                            >
                              {u.display_name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3">
                          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                            {u.email || '--'}
                          </span>
                        </td>

                        {/* Perfil (role badge) */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                            style={{ background: rc.bg, color: rc.text }}
                          >
                            {ROLE_LABEL[u.role] ?? u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {getStatusLabel(u.status)}
                          </span>
                        </td>

                        {/* Data de cadastro */}
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          {formatDate(u.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Mobile cards ──────────────────────────────────── */}
          <section className="space-y-2 sm:hidden">
            {filtered.map((u) => {
              const rc = ROLE_COLOR[u.role] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
              const sc = getStatusStyle(u.status);
              return (
                <div
                  key={`${u.id}-${u.role}-m`}
                  className="rounded-xl p-3"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: rc.bg, color: rc.text }}
                    >
                      {getInitials(u.display_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {u.display_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--bb-ink-40)' }}>
                        {u.email || '--'}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {getStatusLabel(u.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between pl-[52px]">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: rc.bg, color: rc.text }}
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatDate(u.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

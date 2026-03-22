'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Types ──────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  academy: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_USERS: UserRow[] = [
  { id: 'u1', name: 'Roberto Garcia', email: 'roberto@guerreiros.com', role: 'admin', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-22T14:30:00', createdAt: '2025-06-15' },
  { id: 'u2', name: 'Prof. André Lima', email: 'andre@guerreiros.com', role: 'professor', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-22T10:00:00', createdAt: '2025-07-01' },
  { id: 'u3', name: 'Camila Souza', email: 'camila@guerreiros.com', role: 'recepcao', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-21T18:00:00', createdAt: '2025-08-10' },
  { id: 'u4', name: 'Lucas Ferreira', email: 'lucas@email.com', role: 'aluno', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-22T19:00:00', createdAt: '2025-09-01' },
  { id: 'u5', name: 'Maria Santos', email: 'maria@email.com', role: 'aluno', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-20T07:30:00', createdAt: '2025-10-15' },
  { id: 'u6', name: 'Helena Costa', email: 'helena@fightclub.com', role: 'admin', academy: 'Fight Club SP', status: 'active', lastLogin: '2026-03-22T16:00:00', createdAt: '2025-11-01' },
  { id: 'u7', name: 'Prof. Marcelo Costa', email: 'marcelo@fightclub.com', role: 'professor', academy: 'Fight Club SP', status: 'active', lastLogin: '2026-03-21T20:00:00', createdAt: '2025-11-15' },
  { id: 'u8', name: 'Ana Paula Silva', email: 'ana@email.com', role: 'responsavel', academy: 'Guerreiros do Tatame', status: 'active', lastLogin: '2026-03-19T12:00:00', createdAt: '2026-01-10' },
  { id: 'u9', name: 'Pedro Henrique', email: 'pedro@email.com', role: 'aluno', academy: 'Fight Club SP', status: 'suspended', lastLogin: '2026-02-15T09:00:00', createdAt: '2025-12-01' },
  { id: 'u10', name: 'Juliana Almeida', email: 'juliana@nova-academia.com', role: 'admin', academy: 'Nova Academia BJJ', status: 'pending', lastLogin: '', createdAt: '2026-03-20' },
];

const ROLES_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: '#3b82f6' },
  professor: { label: 'Professor', color: '#22c55e' },
  aluno: { label: 'Aluno', color: '#8b5cf6' },
  recepcao: { label: 'Recepção', color: '#f59e0b' },
  responsavel: { label: 'Responsável', color: '#ec4899' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: '#22c55e' },
  suspended: { label: 'Suspenso', color: '#ef4444' },
  pending: { label: 'Pendente', color: '#f59e0b' },
};

export default function SuperAdminUsuariosPage() {
  useTheme();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAcademy, setFilterAcademy] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setUsers(MOCK_USERS); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, []);

  const academies = useMemo(() => [...new Set(users.map((u) => u.academy))], [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterRole && u.role !== filterRole) return false;
      if (filterAcademy && u.academy !== filterAcademy) return false;
      return true;
    });
  }, [users, search, filterRole, filterAcademy]);

  // Stats
  const total = users.length;
  const active = users.filter((u) => u.status === 'active').length;
  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Usuários</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>{total}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{active}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Ativos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{admins}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Admins</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="flex-1 min-w-[200px] rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        >
          <option value="">Todos os roles</option>
          {Object.entries(ROLES_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={filterAcademy}
          onChange={(e) => setFilterAcademy(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        >
          <option value="">Todas as academias</option>
          {academies.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Nenhum usuário encontrado</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const role = ROLES_LABELS[user.role] || { label: user.role, color: '#6b7280' };
            const status = STATUS_LABELS[user.status] || { label: user.status, color: '#6b7280' };
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                style={{ background: 'var(--bb-depth-3)' }}
                onClick={() => setSelectedUser(user)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bb-depth-3)'; }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: role.color }}>
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{user.name}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${role.color}20`, color: role.color }}>{role.label}</span>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${status.color}20`, color: status.color }}>{status.label}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>{user.email} · {user.academy}</p>
                </div>
                <p className="hidden text-xs sm:block" style={{ color: 'var(--bb-ink-40)' }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{selectedUser.name}</h3>
            <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              <p>📧 {selectedUser.email}</p>
              <p>🏢 {selectedUser.academy}</p>
              <p>👤 {ROLES_LABELS[selectedUser.role]?.label || selectedUser.role}</p>
              <p>📅 Cadastro: {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</p>
              <p>🕐 Último login: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('pt-BR') : 'Nunca'}</p>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${STATUS_LABELS[selectedUser.status]?.color || '#6b7280'}20`, color: STATUS_LABELS[selectedUser.status]?.color || '#6b7280' }}>
                  {STATUS_LABELS[selectedUser.status]?.label || selectedUser.status}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

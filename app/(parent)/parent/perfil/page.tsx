'use client';

import { useState, useEffect } from 'react';
import { getGuardianDashboard } from '@/lib/api/responsavel.service';
import type { GuardianDashboardDTO } from '@/lib/api/responsavel.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Section Components
// ────────────────────────────────────────────────────────────

function ProfileHeader({ name, email }: { name: string; email: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-bb-gray-900 to-bb-gray-700 px-4 pb-12 pt-8">
        <div className="flex flex-col items-center">
          <Avatar name={name} size="xl" className="ring-4 ring-white/30" />
          <h2 className="mt-3 text-lg font-bold text-white">{name}</h2>
          <p className="text-sm text-bb-gray-400">{email}</p>
        </div>
      </div>
      <div className="-mt-4 mx-4 mb-4 rounded-[var(--bb-radius-lg)] bg-[var(--bb-depth-3)] p-4 shadow-[var(--bb-shadow-md)]">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-[var(--bb-ink-40)]">Perfil</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--bb-ink-100)]">Responsavel</p>
          </div>
          <div>
            <p className="text-xs text-[var(--bb-ink-40)]">Conta</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--bb-success)]">Ativa</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LinkedChildrenSection({ data }: { data: GuardianDashboardDTO }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
        Filhos Vinculados ({data.children.length})
      </h3>
      <div className="space-y-3">
        {data.children.map((child) => (
          <Card key={child.student_id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={child.display_name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--bb-ink-100)]">{child.display_name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="belt" size="sm">{child.belt_label}</Badge>
                  <span className="text-xs text-[var(--bb-ink-40)]">{child.age} anos</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--bb-ink-100)]">{child.frequency_percent}%</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">Freq.</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg bg-[var(--bb-depth-3)] p-2 text-center">
                <p className="text-[10px] text-[var(--bb-ink-40)]">Pagamento</p>
                <p className={`text-xs font-semibold ${
                  child.payment.status === 'em_dia' ? 'text-[var(--bb-success)]' :
                  child.payment.status === 'pendente' ? 'text-[var(--bb-warning)]' :
                  'text-[var(--bb-brand-primary)]'
                }`}>
                  {child.payment.status === 'em_dia' ? 'Em dia' :
                   child.payment.status === 'pendente' ? 'Pendente' : 'Atrasado'}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[var(--bb-depth-3)] p-2 text-center">
                <p className="text-[10px] text-[var(--bb-ink-40)]">Plano</p>
                <p className="text-xs font-semibold text-[var(--bb-ink-100)]">{child.payment.plan_name}</p>
              </div>
              <div className="flex-1 rounded-lg bg-[var(--bb-depth-3)] p-2 text-center">
                <p className="text-[10px] text-[var(--bb-ink-40)]">Valor</p>
                <p className="text-xs font-semibold text-[var(--bb-ink-100)]">R${child.payment.price}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactInfoSection() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bb-gray-500">
        Informacoes de Contato
      </h3>
      <Card className="divide-y divide-bb-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-100">
              <svg className="h-4 w-4 text-bb-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-bb-gray-500">Email</p>
              <p className="text-sm font-medium text-bb-gray-900">responsavel@email.com</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-100">
              <svg className="h-4 w-4 text-bb-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-bb-gray-500">Telefone</p>
              <p className="text-sm font-medium text-bb-gray-900">(11) 98765-4321</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-100">
              <svg className="h-4 w-4 text-bb-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-bb-gray-500">Endereco</p>
              <p className="text-sm font-medium text-bb-gray-900">Sao Paulo, SP</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SettingsSection() {
  const items = [
    { label: 'Notificacoes', description: 'Configurar alertas e avisos' },
    { label: 'Privacidade', description: 'Dados e permissoes' },
    { label: 'Ajuda', description: 'Central de suporte' },
  ];

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bb-gray-500">
        Configuracoes
      </h3>
      <Card className="divide-y divide-bb-gray-100">
        {items.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-bb-gray-50"
          >
            <div>
              <p className="text-sm font-medium text-bb-gray-900">{item.label}</p>
              <p className="text-xs text-bb-gray-500">{item.description}</p>
            </div>
            <svg
              className="h-4 w-4 text-bb-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentPerfilPage() {
  const [data, setData] = useState<GuardianDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getGuardianDashboard('prof-guardian-1');
        setData(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bb-gray-50 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bb-gray-50 p-4">
        <div className="text-center">
          <p className="text-4xl">👤</p>
          <h2 className="mt-4 text-lg font-bold text-bb-gray-900">Perfil indisponivel</h2>
          <p className="mt-1 text-sm text-bb-gray-500">
            Nao foi possivel carregar seus dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-50 pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
        <ProfileHeader
          name={data.guardian_name}
          email="responsavel@email.com"
        />
        <LinkedChildrenSection data={data} />
        <ContactInfoSection />
        <SettingsSection />

        {/* Logout */}
        <button className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
          Sair da conta
        </button>
      </div>
    </div>
  );
}

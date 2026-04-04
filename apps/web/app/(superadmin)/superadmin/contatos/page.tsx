'use client';

import { useEffect, useState } from 'react';
import { Mail, Clock, CheckCircle, Archive, Eye } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface ContactMessage {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  assunto?: string | null;
  mensagem: string;
  status: 'novo' | 'lido' | 'respondido' | 'arquivado';
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  novo: { label: 'Novo', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: <Mail size={14} /> },
  lido: { label: 'Lido', color: '#eab308', bg: 'rgba(234,179,8,0.15)', icon: <Eye size={14} /> },
  respondido: { label: 'Respondido', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', icon: <CheckCircle size={14} /> },
  arquivado: { label: 'Arquivado', color: 'var(--bb-ink-40)', bg: 'var(--bb-depth-2)', icon: <Archive size={14} /> },
};

export default function ContatosPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/contato');
        const json = await res.json();
        setMessages(json.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Contatos do Site
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Mensagens recebidas via formulario de contato da landing page.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {['novo', 'lido', 'respondido', 'arquivado'].map((status) => {
          const config = STATUS_CONFIG[status];
          const count = messages.filter((m) => m.status === status).length;
          return (
            <div
              key={status}
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: config.color }}>{config.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  {config.label}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--bb-brand)', borderTopColor: 'transparent' }} />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon="📬"
          title="Nenhuma mensagem recebida"
          description="As mensagens enviadas pelo formulário de contato da landing page aparecerão aqui."
          variant="first-time"
        />
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Nome</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Email</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Assunto</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => {
                const config = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.novo;
                return (
                  <tr
                    key={msg.id}
                    onClick={() => setSelected(msg)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: config.bg, color: config.color }}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{msg.nome}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--bb-ink-60)' }}>{msg.email}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--bb-ink-60)' }}>{msg.assunto || '—'}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--bb-ink-40)' }}>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatDate(msg.created_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-8"
            style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', boxShadow: 'var(--bb-shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{selected.nome}</h3>
                <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{selected.email}</p>
                {selected.telefone && (
                  <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>{selected.telefone}</p>
                )}
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: (STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.novo).bg,
                  color: (STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.novo).color,
                }}
              >
                {(STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.novo).icon}
                {(STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.novo).label}
              </span>
            </div>

            {selected.assunto && (
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Assunto: {selected.assunto}
              </p>
            )}

            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                {selected.mensagem}
              </p>
            </div>

            <p className="mt-4 text-xs" style={{ color: 'var(--bb-ink-20)' }}>
              Recebido em {formatDate(selected.created_at)}
            </p>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-60)', cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

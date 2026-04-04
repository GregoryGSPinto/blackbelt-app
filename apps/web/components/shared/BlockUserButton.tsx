'use client';

import { useState } from 'react';
import { ShieldOff, Loader2 } from 'lucide-react';
import { blockUser } from '@/lib/api/moderation.service';
import { useToast } from '@/lib/hooks/useToast';

interface BlockUserButtonProps {
  userId: string;
  userName: string;
  size?: 'sm' | 'md';
}

export function BlockUserButton({ userId, userName, size = 'sm' }: BlockUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleBlock() {
    setLoading(true);
    try {
      await blockUser(userId);
      toast('Usuário bloqueado', 'success');
      setOpen(false);
    } catch {
      toast('Erro ao bloquear usuário', 'error');
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
        style={{
          color: 'var(--bb-ink-40)',
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Bloquear usuário"
        aria-label={`Bloquear ${userName}`}
      >
        <ShieldOff size={iconSize} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Bloquear ${userName}`}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Bloquear {userName}?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Você não verá mais mensagens desta pessoa.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-80)',
                  minHeight: '44px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: 'var(--bb-danger)',
                  color: '#fff',
                  minHeight: '44px',
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldOff size={16} />
                )}
                {loading ? 'Bloqueando...' : 'Bloquear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

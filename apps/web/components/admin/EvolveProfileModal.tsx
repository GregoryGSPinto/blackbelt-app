'use client';

import { forwardRef, useState } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { evolveProfile } from '@/lib/api/family.service';

// ── Types ──────────────────────────────────────────────────────────────

interface EvolveProfileModalProps {
  profileId: string;
  studentName: string;
  currentRole: string;
  newRole: string;
  age: number;
  preservedStats?: { label: string; value: string | number }[];
  onClose: () => void;
  onSuccess?: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function transitionLabel(currentRole: string, newRole: string): string {
  if (currentRole === 'aluno_kids' && newRole === 'aluno_teen') return 'Kids para Teen';
  if (currentRole === 'aluno_teen' && newRole === 'aluno_adulto') return 'Teen para Adulto';
  if (currentRole === 'aluno_adulto' && newRole === 'professor') return 'Aluno para Professor';
  return `${currentRole} para ${newRole}`;
}

function transitionDescription(currentRole: string, newRole: string, name: string, age: number): string {
  if (currentRole === 'aluno_kids' && newRole === 'aluno_teen')
    return `${name} completou ${age} anos. Deseja promover para Aluno Teen?`;
  if (currentRole === 'aluno_teen' && newRole === 'aluno_adulto')
    return `${name} completou ${age} anos. Promover para Aluno Adulto?`;
  if (newRole === 'professor')
    return `${name} sera promovido a Professor. O perfil de aluno sera mantido (multi-perfil).`;
  return `Promover ${name} de ${currentRole} para ${newRole}`;
}

// ── Component ──────────────────────────────────────────────────────────

const EvolveProfileModal = forwardRef<HTMLDivElement, EvolveProfileModalProps>(
  function EvolveProfileModal(
    { profileId, studentName, currentRole, newRole, age, preservedStats, onClose, onSuccess },
    ref,
  ) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [createAuth, setCreateAuth] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isKidsToTeen = currentRole === 'aluno_kids' && newRole === 'aluno_teen';

    async function handleEvolve() {
      setLoading(true);
      try {
        await evolveProfile({
          profileId,
          newRole,
          reason: `Transicao ${transitionLabel(currentRole, newRole)} — ${age} anos`,
          createAuth: isKidsToTeen && createAuth,
          email: createAuth ? email : undefined,
          password: createAuth ? password : undefined,
        });
        toast(`${studentName} promovido para ${newRole} com sucesso!`, 'success');
        onSuccess?.();
        onClose();
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }

    const inputStyle = {
      background: 'var(--bb-depth-2)',
      color: 'var(--bb-ink-100)',
      border: '1px solid var(--bb-glass-border)',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div
          ref={ref}
          className="w-full max-w-md rounded-xl p-6"
          style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="mb-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Promover Perfil
          </h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {transitionDescription(currentRole, newRole, studentName, age)}
          </p>

          {/* Badge transicao */}
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}>
              {currentRole}
            </span>
            <span style={{ color: 'var(--bb-ink-40)' }}>→</span>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>
              {newRole}
            </span>
          </div>

          {/* Stats preservados */}
          {preservedStats && preservedStats.length > 0 && (
            <div className="mb-4 rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="mb-2 text-xs font-bold" style={{ color: 'var(--bb-ink-80)' }}>Historico preservado:</p>
              <div className="flex flex-wrap gap-3">
                {preservedStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-sm font-bold" style={{ color: 'var(--bb-brand)' }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kids→Teen: criar auth? */}
          {isKidsToTeen && (
            <div className="mb-4 flex flex-col gap-3 rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                <input type="checkbox" checked={createAuth} onChange={(e) => setCreateAuth(e.target.checked)} />
                Criar login proprio para o teen
              </label>
              {createAuth && (
                <div className="flex flex-col gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-lg px-3 text-sm" style={inputStyle} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="h-10 rounded-lg px-3 text-sm" style={inputStyle} />
                </div>
              )}
            </div>
          )}

          {/* Botoes */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}>
              Cancelar
            </button>
            <button type="button" onClick={handleEvolve} disabled={loading} className="flex-1 rounded-lg px-4 py-3 text-sm font-bold disabled:opacity-50" style={{ background: 'var(--bb-brand)', color: '#fff' }}>
              {loading ? 'Promovendo...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

EvolveProfileModal.displayName = 'EvolveProfileModal';

export { EvolveProfileModal };
export type { EvolveProfileModalProps };

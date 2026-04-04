'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { ShieldIcon } from '@/components/shell/icons';
import { isMock } from '@/lib/env';
import { isNative } from '@/lib/platform';

interface GuardianAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guardianName?: string;
}

export function GuardianAuthModal({
  open,
  onClose,
  onSuccess,
  guardianName,
}: GuardianAuthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check biometric availability on mount
  useEffect(() => {
    if (!open) return;
    setPassword('');
    setError('');
    setLoading(false);

    async function checkBiometric() {
      if (isNative()) {
        try {
          const { isBiometricAvailable } = await import('@/lib/native/biometric-auth');
          const available = await isBiometricAvailable();
          setBiometricAvailable(available);
        } catch {
          setBiometricAvailable(false);
        }
      }
    }
    checkBiometric();

    // Focus the input after modal opens
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const validatePassword = useCallback(
    async (pin: string): Promise<boolean> => {
      if (isMock()) {
        // Mock mode: accept "1234" as the PIN
        return pin === '1234';
      }

      // Real mode: validate against Supabase auth
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) return false;

        // Re-authenticate with password
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: pin,
        });
        return !error;
      } catch {
        return false;
      }
    },
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Digite a senha');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const valid = await validatePassword(password);
      if (valid) {
        onSuccess();
        onClose();
      } else {
        setError('Senha incorreta');
      }
    } catch {
      setError('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometric() {
    setLoading(true);
    setError('');

    try {
      const { authenticateWithBiometric } = await import(
        '@/lib/native/biometric-auth'
      );
      const success = await authenticateWithBiometric();
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError('Autenticacao biometrica falhou');
      }
    } catch {
      setError('Erro ao usar biometria');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="default"
      title="Autenticacao do Responsavel"
    >
      <div className="space-y-5">
        {/* Icon & description */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bb-brand-surface)' }}
          >
            <ShieldIcon className="h-7 w-7 text-[var(--bb-brand)]" />
          </div>
          <p className="text-sm text-[var(--bb-ink-60)]">
            {guardianName
              ? `Para acessar o perfil de ${guardianName}, digite a senha ou use biometria.`
              : 'Para acessar o perfil do responsavel, digite a senha ou use biometria.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            ref={inputRef}
            label="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            error={error}
            placeholder="Digite a senha do responsavel"
            autoComplete="current-password"
          />

          {/* Biometric button */}
          {biometricAvailable && (
            <button
              type="button"
              onClick={handleBiometric}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--bb-radius-md)] border px-4 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-brand)',
                backgroundColor: 'var(--bb-brand-surface)',
              }}
            >
              <ShieldIcon className="h-4 w-4" />
              Usar biometria
            </button>
          )}

          {/* Non-native hint */}
          {!isNative() && (
            <p className="text-center text-[10px] text-[var(--bb-ink-40)]">
              Biometria disponivel apenas no aplicativo
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[44px] flex-1 rounded-[var(--bb-radius-md)] border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                backgroundColor: 'var(--bb-depth-4)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="min-h-[44px] flex-1 rounded-[var(--bb-radius-md)] px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

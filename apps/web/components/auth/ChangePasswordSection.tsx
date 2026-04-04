'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordRules, getPasswordStrength, PASSWORD_RULES } from '@/components/auth/PasswordRules';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { createBrowserClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/env';

export function ChangePasswordSection() {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(newPassword);
  const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(newPassword));
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && allRulesPass && passwordsMatch && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isMock()) {
        // Simulate a short delay in mock mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast('Senha alterada com sucesso!', 'success');
        resetForm();
        return;
      }

      const supabase = createBrowserClient();

      // Verify current password by re-authenticating
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setError('Sessao expirada. Faca login novamente.');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Senha atual incorreta.');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast('Senha alterada com sucesso!', 'success');
      resetForm();
    } catch {
      setError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <section
      className="w-full rounded-lg p-6"
      style={
        {
          backgroundColor: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-md)',
        } as CSSProperties
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck
          className="h-5 w-5"
          style={{ color: 'var(--bb-brand)' }}
        />
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Alterar Senha
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <PasswordInput
          label="Senha atual"
          placeholder="Digite sua senha atual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="flex flex-col gap-3">
          <PasswordInput
            label="Nova senha"
            placeholder="Digite a nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <PasswordStrengthMeter strength={strength} />
          <PasswordRules password={newPassword} />
        </div>

        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Confirmar nova senha"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && (
            <p
              className="text-xs font-medium"
              style={{
                color: passwordsMatch
                  ? 'var(--bb-success)'
                  : 'var(--bb-error)',
              }}
            >
              {passwordsMatch ? 'Senhas coincidem' : 'Senhas nao coincidem'}
            </p>
          )}
        </div>

        {error && (
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--bb-error)' }}
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          loading={loading}
          className="mt-2 self-start"
        >
          <Lock className="mr-2 h-4 w-4" />
          Alterar Senha
        </Button>
      </form>
    </section>
  );
}
ChangePasswordSection.displayName = 'ChangePasswordSection';

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import type { OnboardToken } from '@/lib/types';
import { validateOnboardToken, redeemOnboardToken } from '@/lib/api/superadmin.service';
import { translateError } from '@/lib/utils/error-translator';

// ── Steps ────────────────────────────────────────────────────────

type Step = 'validating' | 'admin' | 'academy' | 'confirm' | 'done' | 'error';

const STEP_LABELS: Record<string, string> = {
  admin: 'Seus Dados',
  academy: 'Dados da Academia',
  confirm: 'Confirmacao',
};

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Este link de convite nao existe ou e invalido.',
  expired: 'Este link de convite ja expirou.',
  max_uses: 'Este link de convite ja foi utilizado.',
  inactive: 'Este link de convite foi desativado.',
};

// ── Page ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('validating');
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenData, setTokenData] = useState<OnboardToken | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  // Academy form
  const [academyAddress, setAcademyAddress] = useState('');
  const [academyCity, setAcademyCity] = useState('');
  const [academyState, setAcademyState] = useState('');
  const [academyPhone, setAcademyPhone] = useState('');

  const validateToken = useCallback(async () => {
    if (!tokenParam) {
      setErrorMsg('Nenhum token fornecido. Verifique o link recebido.');
      setStep('error');
      return;
    }
    try {
      const result = await validateOnboardToken(tokenParam);
      if (!result.valid) {
        setErrorMsg(ERROR_MESSAGES[result.error ?? 'not_found']);
        setStep('error');
        return;
      }
      setTokenData(result.token ?? null);
      setStep('admin');
    } catch {
      setErrorMsg('Erro ao validar o link. Tente novamente.');
      setStep('error');
    }
  }, [tokenParam]);

  useEffect(() => { validateToken(); }, [validateToken]);

  // ── Validation ─────────────────────────────────────────────────

  function validateAdminStep(): boolean {
    if (!adminName.trim()) { toast('Nome e obrigatorio.', 'error'); return false; }
    if (!adminEmail.trim()) { toast('Email e obrigatorio.', 'error'); return false; }
    if (!adminPassword || adminPassword.length < 6) { toast('Senha deve ter pelo menos 6 caracteres.', 'error'); return false; }
    if (adminPassword !== adminPasswordConfirm) { toast('Senhas nao conferem.', 'error'); return false; }
    return true;
  }

  function validateAcademyStep(): boolean {
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // 1. Sign up the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
        options: { data: { name: adminName.trim() } },
      });
      if (authError || !authData.user) {
        throw new Error(authError?.message ?? 'Erro ao criar conta.');
      }

      // 2. Fetch the auto-created profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .limit(1);
      const profileId = profiles?.[0]?.id ?? authData.user.id;

      // 3. Update profile to admin role
      await supabase
        .from('profiles')
        .update({ role: 'admin', display_name: adminName.trim() })
        .eq('id', profileId);

      // 4. Create membership if token has academy_id
      const academyId = tokenData?.academy_id;
      if (academyId) {
        await supabase
          .from('memberships')
          .insert({
            profile_id: profileId,
            academy_id: academyId,
            role: 'admin',
            status: 'active',
          });

        // Update academy with additional data
        await supabase
          .from('academies')
          .update({
            phone: academyPhone || undefined,
            city: academyCity || undefined,
            state: academyState || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', academyId);
      }

      // 5. Set cookies
      const cookieOpts = ';path=/;max-age=' + (60 * 60 * 24 * 30) + ';samesite=lax';
      document.cookie = 'bb-active-role=admin' + cookieOpts;
      if (academyId) {
        document.cookie = 'bb-academy-id=' + academyId + cookieOpts;
      }

      // 6. Redeem the onboard token
      await redeemOnboardToken(tokenParam!, academyId ?? '', profileId);

      // 7. Redirect to admin dashboard
      toast('Cadastro realizado com sucesso!', 'success');
      window.location.href = '/admin';
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  // Validating / Loading
  if (step === 'validating') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <div className="w-full max-w-md space-y-4 text-center">
          <Skeleton variant="card" className="h-48" />
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Validando link de convite...</p>
        </div>
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <Card className="w-full max-w-md p-8 text-center">
          <span className="text-5xl">⚠️</span>
          <h1 className="mt-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Link Invalido
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {errorMsg}
          </p>
          <p className="mt-4 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Entre em contato com o suporte se acredita que isso e um erro.
          </p>
        </Card>
      </div>
    );
  }

  // Done
  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bb-depth-1)' }}>
        <Card className="w-full max-w-md p-8 text-center">
          <span className="text-5xl">🎉</span>
          <h1 className="mt-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Cadastro Realizado!
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Sua academia <strong>{tokenData?.academy_name}</strong> foi configurada com sucesso.
          </p>
          <div
            className="mt-4 rounded-lg p-3 text-left text-sm"
            style={{ background: 'var(--bb-depth-2)' }}
          >
            <p style={{ color: 'var(--bb-ink-40)' }}>Plano: <strong style={{ color: 'var(--bb-ink-100)' }}>{tokenData?.plan_name}</strong></p>
            <p style={{ color: 'var(--bb-ink-40)' }}>Trial: <strong style={{ color: 'var(--bb-ink-100)' }}>{tokenData?.trial_days} dias</strong></p>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => { window.location.href = '/login'; }}
          >
            Acessar Plataforma
          </Button>
        </Card>
      </div>
    );
  }

  // ── Multi-step form ────────────────────────────────────────────

  const activeSteps = ['admin', 'academy', 'confirm'] as const;
  const currentIdx = activeSteps.indexOf(step as typeof activeSteps[number]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, var(--bb-warning), color-mix(in srgb, var(--bb-warning) 80%, black))' }}
        >
          <span className="text-lg font-bold text-white">B</span>
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>BlackBelt</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-warning)' }}>
            Onboarding
          </p>
        </div>
      </div>

      {/* Academy info banner */}
      {tokenData && (
        <div
          className="mb-4 w-full max-w-lg rounded-lg p-3 text-center"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--bb-warning)' }}>
            {tokenData.academy_name}
          </p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Plano {tokenData.plan_name} · Trial de {tokenData.trial_days} dias
          </p>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-6 flex w-full max-w-lg items-center justify-center gap-2">
        {activeSteps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: i <= currentIdx ? 'var(--bb-warning)' : 'var(--bb-depth-3)',
                color: i <= currentIdx ? '#fff' : 'var(--bb-ink-40)',
                border: `2px solid ${i <= currentIdx ? 'var(--bb-warning)' : 'var(--bb-glass-border)'}`,
              }}
            >
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <span
              className="hidden text-xs font-medium sm:inline"
              style={{ color: i <= currentIdx ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}
            >
              {STEP_LABELS[s]}
            </span>
            {i < activeSteps.length - 1 && (
              <div
                className="h-px w-8"
                style={{ background: i < currentIdx ? 'var(--bb-warning)' : 'var(--bb-glass-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card className="w-full max-w-lg p-6">
        {/* Step 1: Admin data */}
        {step === 'admin' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Seus Dados</h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Crie sua conta de administrador da academia.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome completo *</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Email *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Telefone</label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Senha *</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Min. 6 caracteres"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Confirmar senha *</label>
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => { if (validateAdminStep()) setStep('academy'); }}
              >
                Proximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Academy data */}
        {step === 'academy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dados da Academia</h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Complete as informacoes da sua academia.
            </p>

            <div
              className="rounded-lg p-3"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--bb-ink-40)' }}>Nome da academia</span>
                <span className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{tokenData?.academy_name}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Endereco</label>
              <input
                type="text"
                value={academyAddress}
                onChange={(e) => setAcademyAddress(e.target.value)}
                placeholder="Rua, numero"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Cidade</label>
                <input
                  type="text"
                  value={academyCity}
                  onChange={(e) => setAcademyCity(e.target.value)}
                  placeholder="Sua cidade"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Estado</label>
                <input
                  type="text"
                  value={academyState}
                  onChange={(e) => setAcademyState(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Telefone da academia</label>
              <input
                type="tel"
                value={academyPhone}
                onChange={(e) => setAcademyPhone(e.target.value)}
                placeholder="(11) 3333-4444"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('admin')}>Voltar</Button>
              <Button
                className="flex-1"
                onClick={() => { if (validateAcademyStep()) setStep('confirm'); }}
              >
                Proximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Confirmacao</h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Revise seus dados antes de finalizar o cadastro.
            </p>

            {/* Admin summary */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Administrador
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Nome', value: adminName },
                  { label: 'Email', value: adminEmail },
                  ...(adminPhone ? [{ label: 'Telefone', value: adminPhone }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-2)' }}>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academy summary */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Academia
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Nome', value: tokenData?.academy_name ?? '-' },
                  { label: 'Plano', value: tokenData?.plan_name ?? '-' },
                  { label: 'Trial', value: `${tokenData?.trial_days ?? 0} dias` },
                  ...(academyAddress ? [{ label: 'Endereco', value: academyAddress }] : []),
                  ...(academyCity ? [{ label: 'Cidade', value: `${academyCity}${academyState ? `/${academyState}` : ''}` }] : []),
                  ...(academyPhone ? [{ label: 'Telefone', value: academyPhone }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-2)' }}>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('academy')}>Voltar</Button>
              <Button
                className="flex-1"
                loading={submitting}
                onClick={handleSubmit}
              >
                Finalizar Cadastro
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Footer */}
      <p className="mt-6 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        BlackBelt Platform — Gestao Inteligente para Academias
      </p>
    </div>
  );
}

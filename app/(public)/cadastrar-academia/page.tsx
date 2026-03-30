'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAcademy } from '@/lib/api/onboarding.service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { BillingStep } from '@/components/onboarding/BillingStep';
import { PLANS, type AsaasPlan, type BillingData } from '@/lib/types/billing';
import { getActivePlans } from '@/lib/api/plans.service';
import {
  formatBrazilianPhone,
  formatCep,
  formatCnpj,
  normalizeWebsite,
  validateAcademyName,
  validateBrazilianMobilePhone,
  validateCep,
  validateCityName,
  validateCnpj,
  validateEmail,
  validateWebsite,
} from '@/lib/utils/validation';

type Step = 1 | 2 | 3 | 4 | 5;

const MODALIDADES = [
  'Jiu-Jitsu', 'Muay Thai', 'Boxe', 'Judô', 'Karatê', 'Taekwondo',
  'Wrestling', 'MMA', 'Capoeira', 'Kickboxing', 'Kung Fu', 'Aikido',
  'Krav Maga', 'Sambo', 'Luta Livre',
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];


const STEP_LABELS = ['Academia', 'Detalhes', 'Administrador', 'Plano e Pagamento', 'Confirmação'];

export default function CadastrarAcademiaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState<Record<number, boolean>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);

  // Step 1: Basic academy data
  const [academy, setAcademy] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
  });

  // Step 2: Academy details
  const [modalidades, setModalidades] = useState<string[]>([]);
  const [estimatedStudents, setEstimatedStudents] = useState('');
  const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Step 3: Admin data
  const [admin, setAdmin] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Step 4: Plan + Billing
  const [plan, setPlan] = useState('blackbelt');
  const [billingData, setBillingData] = useState<Partial<BillingData>>({ billingType: 'pix' });

  // Loaded plans from service (single source of truth)
  const [loadedPlans, setLoadedPlans] = useState<AsaasPlan[]>([]);
  const loadPlansFromService = useCallback(async () => {
    try {
      const active = await getActivePlans();
      const mapped: AsaasPlan[] = active.map((p) => ({
        id: p.tier,
        name: p.name,
        price: p.price_monthly / 100,
        priceCents: p.price_monthly,
        maxStudents: p.limits.max_alunos,
        maxUnits: p.limits.max_unidades,
        maxProfessors: p.limits.max_professores,
        features: p.features.filter((f) => f.included).map((f) => f.name),
        popular: p.is_popular,
      }));
      setLoadedPlans(mapped);
    } catch {
      setLoadedPlans(PLANS);
    }
  }, []);

  useEffect(() => {
    loadPlansFromService();
  }, [loadPlansFromService]);

  const academyErrors = {
    name: !academy.name.trim()
      ? 'Informe o nome da academia.'
      : !validateAcademyName(academy.name)
        ? 'Use apenas letras e espacos. Minimo de 3 caracteres.'
        : '',
    cnpj: academy.cnpj && !validateCnpj(academy.cnpj)
      ? 'Informe um CNPJ valido com 14 digitos.'
      : '',
    phone: !academy.phone.trim()
      ? 'Informe o telefone principal da academia.'
      : !validateBrazilianMobilePhone(academy.phone)
        ? 'Use um celular com DDD no formato (00) 00000-0000.'
        : '',
    email: academy.email && !validateEmail(academy.email)
      ? 'Informe um email valido.'
      : '',
    website: academy.website && !validateWebsite(academy.website)
      ? 'Informe um site valido. Ex.: academia.com.br'
      : '',
    cep: academy.cep && !validateCep(academy.cep)
      ? 'Informe um CEP valido com 8 digitos.'
      : '',
    city: !academy.city.trim()
      ? 'Informe a cidade.'
      : !validateCityName(academy.city)
        ? 'Informe uma cidade valida.'
        : '',
    state: !academy.state.trim()
      ? 'Selecione o estado.'
      : '',
  };

  const adminErrors = {
    name: !admin.name.trim() ? 'Informe o nome do administrador.' : '',
    email: !admin.email.trim()
      ? 'Informe o email do administrador.'
      : !validateEmail(admin.email)
        ? 'Informe um email valido.'
        : '',
    phone: admin.phone && !validateBrazilianMobilePhone(admin.phone)
      ? 'Use um celular com DDD no formato (00) 00000-0000.'
      : '',
    password: admin.password.length < 8
      ? 'A senha deve ter pelo menos 8 caracteres.'
      : '',
    confirmPassword: !admin.confirmPassword
      ? 'Confirme a senha.'
      : admin.password !== admin.confirmPassword
        ? 'As senhas nao conferem.'
        : '',
  };

  const isStep1Valid = Object.values(academyErrors).every((value) => !value);
  const isStep2Valid = modalidades.length > 0;
  const isStep3Valid = Object.values(adminErrors).every((value) => !value);
  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid && termsAccepted;

  function validateStep1(): boolean {
    if (!isStep1Valid) {
      toast('Revise os campos obrigatorios da academia.', 'error');
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!isStep2Valid) { toast('Selecione pelo menos uma modalidade', 'error'); return false; }
    return true;
  }

  function validateStep3(): boolean {
    if (!isStep3Valid) { toast('Revise os dados do administrador.', 'error'); return false; }
    return true;
  }

  function handleNext() {
    setAttemptedNext((prev) => ({ ...prev, [step]: true }));
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4) setStep(5);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      toast('Revise os dados e confirme o aceite dos documentos para continuar.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await createAcademy(
        { name: academy.name, cnpj: academy.cnpj, address: `${academy.address}, ${academy.number}${academy.complement ? ` - ${academy.complement}` : ''}, ${academy.neighborhood}, ${academy.city}/${academy.state}`, phone: academy.phone },
        { name: admin.name, email: admin.email, password: admin.password },
        plan,
      );

      // Create Asaas subscription (non-blocking — academy is already created)
      if (billingData.cpfCnpj && billingData.name) {
        const activePlans = loadedPlans.length > 0 ? loadedPlans : PLANS;
        const selectedPlan = activePlans.find(p => p.id === plan);
        if (selectedPlan) {
          try {
            const subRes = await fetch('/api/subscriptions/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                academyId: result.academyId,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                priceCents: selectedPlan.priceCents,
                billingType: billingData.billingType || 'pix',
                name: billingData.name,
                cpfCnpj: billingData.cpfCnpj,
                email: billingData.email || admin.email,
                phone: billingData.phone || academy.phone,
                address: billingData.address,
              }),
            });
            const subResult = await subRes.json();
            if (!subResult.success) {
              // Don't block — academy was created successfully
              toast('Academia criada! Configure o pagamento depois nas configuracoes.', 'warning');
            }
          } catch {
            // Subscription creation failed but academy is OK
          }
        }
      }

      toast('Academia criada com sucesso!', 'success');
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1200);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  function toggleModalidade(m: string) {
    setModalidades((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }

  function updateAcademyField(field: keyof typeof academy, value: string) {
    let nextValue = value;

    if (field === 'name') nextValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    if (field === 'cnpj') nextValue = formatCnpj(value);
    if (field === 'phone') nextValue = formatBrazilianPhone(value);
    if (field === 'cep') nextValue = formatCep(value);
    if (field === 'email') nextValue = value.trim();
    if (field === 'website') nextValue = value.trim().toLowerCase();
    if (field === 'city') nextValue = value.replace(/[^A-Za-zÀ-ÿ\s'.-]/g, '');

    setAcademy((prev) => ({ ...prev, [field]: nextValue }));
  }

  function updateAdminField(field: keyof typeof admin, value: string) {
    let nextValue = value;
    if (field === 'phone') nextValue = formatBrazilianPhone(value);
    if (field === 'email') nextValue = value.trim();
    setAdmin((prev) => ({ ...prev, [field]: nextValue }));
  }

  // Common input style
  const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30";
  const inputStyle = { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' };
  const labelCls = "mb-1 block text-sm font-medium";
  const labelStyle = { color: 'var(--bb-ink-80)' };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      {/* Logo */}
      <div className="mb-6 text-center">
        <h1
          className="text-3xl font-extrabold"
          style={{ color: 'var(--bb-brand)', letterSpacing: '-0.03em' }}
        >
          BLACKBELT
        </h1>
        <div
          className="mx-auto mt-2"
          style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }}
        />
        <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Cadastre sua academia e comece a usar em minutos
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6 flex w-full max-w-2xl items-center justify-center gap-1">
        {STEP_LABELS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
              style={{
                background: i + 1 <= step ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                color: i + 1 <= step ? '#fff' : 'var(--bb-ink-40)',
                border: `2px solid ${i + 1 <= step ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              }}
            >
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span
              className="hidden text-xs font-medium sm:inline"
              style={{ color: i + 1 <= step ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}
            >
              {s}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="h-px w-4 sm:w-8"
                style={{ background: i + 1 < step ? 'var(--bb-brand)' : 'var(--bb-glass-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div
        className="w-full max-w-2xl rounded-2xl p-6 sm:p-8"
        style={{
          background: 'var(--bb-depth-3)',
          boxShadow: 'var(--bb-shadow-xl)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        {/* Step 1: Basic Academy Data */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Dados da Academia
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Informações básicas do seu estabelecimento.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} style={labelStyle}>Nome da Academia *</label>
                <input
                  value={academy.name}
                  onChange={(e) => updateAcademyField('name', e.target.value)}
                  placeholder="Ex: Academia Guerreiros BJJ"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[1] && academyErrors.name && <p className="mt-1 text-xs text-red-400">{academyErrors.name}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>CNPJ</label>
                <input
                  value={academy.cnpj}
                  onChange={(e) => updateAcademyField('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[1] && academyErrors.cnpj && <p className="mt-1 text-xs text-red-400">{academyErrors.cnpj}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Telefone *</label>
                <input
                  value={academy.phone}
                  onChange={(e) => updateAcademyField('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[1] && academyErrors.phone && <p className="mt-1 text-xs text-red-400">{academyErrors.phone}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Email da academia</label>
                <input
                  type="email"
                  value={academy.email}
                  onChange={(e) => updateAcademyField('email', e.target.value)}
                  placeholder="contato@academia.com"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[1] && academyErrors.email && <p className="mt-1 text-xs text-red-400">{academyErrors.email}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Website</label>
                <input
                  value={academy.website}
                  onChange={(e) => updateAcademyField('website', e.target.value)}
                  onBlur={() => {
                    if (academy.website && validateWebsite(academy.website)) {
                      setAcademy((prev) => ({ ...prev, website: normalizeWebsite(prev.website) }));
                    }
                  }}
                  placeholder="www.academia.com.br"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[1] && academyErrors.website && <p className="mt-1 text-xs text-red-400">{academyErrors.website}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="mt-2 border-t pt-4" style={{ borderColor: 'var(--bb-glass-border)' }}>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Endereço
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>CEP</label>
                  <input
                    value={academy.cep}
                    onChange={(e) => updateAcademyField('cep', e.target.value)}
                    placeholder="00000-000"
                    className={inputCls}
                    style={inputStyle}
                  />
                  {attemptedNext[1] && academyErrors.cep && <p className="mt-1 text-xs text-red-400">{academyErrors.cep}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Rua / Avenida</label>
                  <input
                    value={academy.address}
                    onChange={(e) => setAcademy({ ...academy, address: e.target.value })}
                    placeholder="Rua das Artes Marciais"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Número</label>
                  <input
                    value={academy.number}
                    onChange={(e) => setAcademy({ ...academy, number: e.target.value })}
                    placeholder="123"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Complemento</label>
                  <input
                    value={academy.complement}
                    onChange={(e) => setAcademy({ ...academy, complement: e.target.value })}
                    placeholder="Sala 1, Bloco A"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Bairro</label>
                  <input
                    value={academy.neighborhood}
                    onChange={(e) => setAcademy({ ...academy, neighborhood: e.target.value })}
                    placeholder="Centro"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Cidade *</label>
                  <input
                    value={academy.city}
                    onChange={(e) => updateAcademyField('city', e.target.value)}
                    placeholder="Belo Horizonte"
                    className={inputCls}
                    style={inputStyle}
                  />
                  {attemptedNext[1] && academyErrors.city && <p className="mt-1 text-xs text-red-400">{academyErrors.city}</p>}
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Estado *</label>
                  <select
                    value={academy.state}
                    onChange={(e) => setAcademy({ ...academy, state: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">Selecione</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {attemptedNext[1] && academyErrors.state && <p className="mt-1 text-xs text-red-400">{academyErrors.state}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleNext} disabled={!isStep1Valid}>Próximo</Button>
            </div>
          </div>
        )}

        {/* Step 2: Academy Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Detalhes da Academia
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Conte-nos mais sobre as modalidades e funcionamento.
            </p>

            {/* Modalidades */}
            <div>
              <label className={labelCls} style={labelStyle}>Modalidades oferecidas *</label>
              <div className="flex flex-wrap gap-2">
                {MODALIDADES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleModalidade(m)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: modalidades.includes(m) ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
                      color: modalidades.includes(m) ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                      border: `1.5px solid ${modalidades.includes(m) ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                    }}
                  >
                    {modalidades.includes(m) ? '✓ ' : ''}{m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>Quantidade estimada de alunos</label>
                <select
                  value={estimatedStudents}
                  onChange={(e) => setEstimatedStudents(e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  <option value="1-30">Até 30 alunos</option>
                  <option value="31-100">31 a 100 alunos</option>
                  <option value="101-200">101 a 200 alunos</option>
                  <option value="201-500">201 a 500 alunos</option>
                  <option value="500+">Mais de 500 alunos</option>
                </select>
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Horário de funcionamento</label>
                <input
                  value={horarioFuncionamento}
                  onChange={(e) => setHorarioFuncionamento(e.target.value)}
                  placeholder="Seg-Sex 06h-22h"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-2 border-t pt-4" style={{ borderColor: 'var(--bb-glass-border)' }}>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
                Redes Sociais (opcional)
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>Instagram</label>
                  <input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@suaacademia"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Facebook</label>
                  <input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="facebook.com/suaacademia"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button className="flex-1" onClick={handleNext} disabled={!isStep2Valid}>Próximo</Button>
            </div>
          </div>
        )}

        {/* Step 3: Admin Data */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Dados do Administrador
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Crie sua conta de administrador da academia.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} style={labelStyle}>Nome completo *</label>
                <input
                  value={admin.name}
                  onChange={(e) => updateAdminField('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[3] && adminErrors.name && <p className="mt-1 text-xs text-red-400">{adminErrors.name}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={admin.email}
                  onChange={(e) => updateAdminField('email', e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[3] && adminErrors.email && <p className="mt-1 text-xs text-red-400">{adminErrors.email}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Telefone</label>
                <input
                  type="tel"
                  value={admin.phone}
                  onChange={(e) => updateAdminField('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[3] && adminErrors.phone && <p className="mt-1 text-xs text-red-400">{adminErrors.phone}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Senha *</label>
                <input
                  type="password"
                  value={admin.password}
                  onChange={(e) => updateAdminField('password', e.target.value)}
                  placeholder="Minimo 8 caracteres"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[3] && adminErrors.password && <p className="mt-1 text-xs text-red-400">{adminErrors.password}</p>}
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Confirmar senha *</label>
                <input
                  type="password"
                  value={admin.confirmPassword}
                  onChange={(e) => updateAdminField('confirmPassword', e.target.value)}
                  placeholder="Repita a senha"
                  className={inputCls}
                  style={inputStyle}
                />
                {attemptedNext[3] && adminErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{adminErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
              <Button className="flex-1" onClick={handleNext} disabled={!isStep3Valid}>Próximo</Button>
            </div>
          </div>
        )}

        {/* Step 4: Plan Selection + Billing */}
        {step === 4 && (
          <div className="space-y-4">
            <BillingStep
              selectedPlanId={plan}
              onPlanChange={setPlan}
              onBillingDataChange={setBillingData}
              billingData={billingData}
              availablePlans={loadedPlans.length > 0 ? loadedPlans : undefined}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}>Voltar</Button>
              <Button className="flex-1" onClick={handleNext}>Proximo</Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Confirmação
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Revise seus dados antes de finalizar o cadastro.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Alunos estimados
                </p>
                <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {estimatedStudents || 'Nao informado'}
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                  Horario da semana
                </p>
                <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {horarioFuncionamento || 'A definir'}
                </p>
              </div>
            </div>

            {/* Academy summary */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Academia
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Nome', value: academy.name },
                  ...(academy.cnpj ? [{ label: 'CNPJ', value: academy.cnpj }] : []),
                  { label: 'Telefone', value: academy.phone },
                  ...(academy.email ? [{ label: 'Email', value: academy.email }] : []),
                  ...(academy.website ? [{ label: 'Website', value: normalizeWebsite(academy.website) }] : []),
                  { label: 'Cidade', value: `${academy.city}/${academy.state}` },
                  { label: 'Modalidades', value: modalidades.join(', ') },
                  { label: 'Plano', value: (loadedPlans.length > 0 ? loadedPlans : PLANS).find((p) => p.id === plan)?.name ?? plan },
                  ...(billingData.name ? [{ label: 'Responsavel financeiro', value: billingData.name }] : []),
                  ...(billingData.billingType ? [{ label: 'Pagamento', value: billingData.billingType === 'pix' ? 'PIX' : billingData.billingType === 'boleto' ? 'Boleto' : 'Cartao' }] : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between rounded-lg px-3 py-2"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin summary */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Administrador
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Nome', value: admin.name },
                  { label: 'Email', value: admin.email },
                  ...(admin.phone ? [{ label: 'Telefone', value: admin.phone }] : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between rounded-lg px-3 py-2"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Termos e privacidade
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Leia os documentos e confirme o aceite para concluir o cadastro da academia.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/termos" target="_blank" className="text-sm font-medium underline" style={{ color: 'var(--bb-brand)' }}>
                  Ler Termos de Uso
                </Link>
                <Link href="/privacidade" target="_blank" className="text-sm font-medium underline" style={{ color: 'var(--bb-brand)' }}>
                  Ler Politica de Privacidade
                </Link>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setTermsAcceptedAt(e.target.checked ? new Date().toISOString() : null);
                  }}
                  className="mt-1 h-4 w-4 rounded border"
                />
                <span>
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" className="underline font-medium" style={{ color: 'var(--bb-brand)' }}>
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" target="_blank" className="underline font-medium" style={{ color: 'var(--bb-brand)' }}>
                    Politica de Privacidade
                  </Link>
                  , incluindo as condicoes de pagamento, processamento via Asaas e taxas aplicaveis.
                  {termsAcceptedAt && (
                    <span className="mt-1 block text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      Aceite registrado nesta sessao em {new Date(termsAcceptedAt).toLocaleString('pt-BR')}.
                    </span>
                  )}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(4)}>Voltar</Button>
              <Button className="flex-1" loading={loading} onClick={handleSubmit} disabled={!canSubmit}>
                Criar Minha Academia
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--bb-brand)' }}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

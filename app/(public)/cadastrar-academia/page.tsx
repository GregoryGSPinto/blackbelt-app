'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAcademy } from '@/lib/api/onboarding.service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

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

const PLATFORM_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 79/mês',
    color: '#6B7085',
    features: ['Até 50 alunos', '1 unidade', '2 professores', 'Gestão de alunos', 'Check-in', 'Financeiro básico', 'Agenda', 'Notificações'],
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: 'R$ 149/mês',
    color: '#3B82F6',
    features: ['Até 100 alunos', '1 unidade', '5 professores', 'Tudo do Starter', 'Streaming library', 'Certificados digitais', 'Relatórios avançados', 'Comunicação com responsáveis'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 249/mês',
    color: 'var(--bb-brand)',
    popular: true,
    features: ['Até 200 alunos', '2 unidades', 'Professores ilimitados', 'Tudo do Essencial', 'Campeonatos', 'Gamificação teen', 'Currículo técnico', 'Estoque', 'Contratos digitais'],
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    price: 'R$ 397/mês',
    color: '#F59E0B',
    features: ['Alunos ilimitados', 'Unidades ilimitadas', 'Tudo do Pro', 'Painel franqueador', 'White-label', 'API access', 'Suporte prioritário', 'Relatórios multi-unidade'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    color: '#8B5CF6',
    features: ['Tudo do Black Belt', 'SLA dedicado', 'Onboarding assistido', 'Customizações', 'Integração com sistemas legados'],
  },
];

const STEP_LABELS = ['Academia', 'Detalhes', 'Administrador', 'Plano', 'Confirmação'];

export default function CadastrarAcademiaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

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

  // Step 4: Plan
  const [plan, setPlan] = useState('blackbelt');

  function validateStep1(): boolean {
    if (!academy.name.trim()) { toast('Nome da academia é obrigatório', 'error'); return false; }
    if (!academy.phone.trim()) { toast('Telefone é obrigatório', 'error'); return false; }
    if (!academy.city.trim()) { toast('Cidade é obrigatória', 'error'); return false; }
    if (!academy.state.trim()) { toast('Estado é obrigatório', 'error'); return false; }
    return true;
  }

  function validateStep2(): boolean {
    if (modalidades.length === 0) { toast('Selecione pelo menos uma modalidade', 'error'); return false; }
    return true;
  }

  function validateStep3(): boolean {
    if (!admin.name.trim()) { toast('Nome do administrador é obrigatório', 'error'); return false; }
    if (!admin.email.trim()) { toast('Email é obrigatório', 'error'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) { toast('Email inválido', 'error'); return false; }
    if (admin.password.length < 6) { toast('Senha deve ter pelo menos 6 caracteres', 'error'); return false; }
    if (admin.password !== admin.confirmPassword) { toast('Senhas não conferem', 'error'); return false; }
    return true;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4) setStep(5);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await createAcademy(
        { name: academy.name, cnpj: academy.cnpj, address: `${academy.address}, ${academy.number}${academy.complement ? ` - ${academy.complement}` : ''}, ${academy.neighborhood}, ${academy.city}/${academy.state}`, phone: academy.phone },
        { name: admin.name, email: admin.email, password: admin.password },
        plan,
      );
      toast('Academia criada com sucesso!', 'success');
      setTimeout(() => router.push('/admin/setup-wizard'), 2000);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  function toggleModalidade(m: string) {
    setModalidades((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
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
                  onChange={(e) => setAcademy({ ...academy, name: e.target.value })}
                  placeholder="Ex: Academia Guerreiros BJJ"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>CNPJ</label>
                <input
                  value={academy.cnpj}
                  onChange={(e) => setAcademy({ ...academy, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Telefone *</label>
                <input
                  value={academy.phone}
                  onChange={(e) => setAcademy({ ...academy, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Email da academia</label>
                <input
                  type="email"
                  value={academy.email}
                  onChange={(e) => setAcademy({ ...academy, email: e.target.value })}
                  placeholder="contato@academia.com"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Website</label>
                <input
                  value={academy.website}
                  onChange={(e) => setAcademy({ ...academy, website: e.target.value })}
                  placeholder="www.academia.com.br"
                  className={inputCls}
                  style={inputStyle}
                />
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
                    onChange={(e) => setAcademy({ ...academy, cep: e.target.value })}
                    placeholder="00000-000"
                    className={inputCls}
                    style={inputStyle}
                  />
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
                    onChange={(e) => setAcademy({ ...academy, city: e.target.value })}
                    placeholder="Belo Horizonte"
                    className={inputCls}
                    style={inputStyle}
                  />
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
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleNext}>Próximo</Button>
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
              <Button className="flex-1" onClick={handleNext}>Próximo</Button>
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
                  onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={admin.email}
                  onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                  placeholder="seu@email.com"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Telefone</label>
                <input
                  type="tel"
                  value={admin.phone}
                  onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Senha *</label>
                <input
                  type="password"
                  value={admin.password}
                  onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Confirmar senha *</label>
                <input
                  type="password"
                  value={admin.confirmPassword}
                  onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
              <Button className="flex-1" onClick={handleNext}>Próximo</Button>
            </div>
          </div>
        )}

        {/* Step 4: Plan Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Escolha seu Plano
            </h2>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              7 dias grátis no plano Black Belt (acesso total). Sem cartão de crédito.
            </p>

            <div className="space-y-3">
              {PLATFORM_PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className="relative w-full rounded-xl p-5 text-left transition-all"
                  style={{
                    background: plan === p.id ? 'var(--bb-depth-2)' : 'var(--bb-depth-4)',
                    border: `2px solid ${plan === p.id ? p.color : 'var(--bb-glass-border)'}`,
                  }}
                >
                  {p.popular && (
                    <span
                      className="absolute -top-2 right-4 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: 'var(--bb-brand)' }}
                    >
                      MAIS POPULAR
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{p.name}</span>
                    <span className="text-lg font-bold" style={{ color: p.color }}>{p.price}</span>
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        <span style={{ color: p.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}>Voltar</Button>
              <Button className="flex-1" onClick={handleNext}>Próximo</Button>
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
                  { label: 'Cidade', value: `${academy.city}/${academy.state}` },
                  { label: 'Modalidades', value: modalidades.join(', ') },
                  { label: 'Plano', value: PLATFORM_PLANS.find((p) => p.id === plan)?.name ?? plan },
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
              className="rounded-lg p-3 text-center text-xs"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-40)' }}
            >
              Ao finalizar, você concorda com os{' '}
              <Link href="/termos" className="underline" style={{ color: 'var(--bb-brand)' }}>termos de uso</Link>{' '}
              e{' '}
              <Link href="/privacidade" className="underline" style={{ color: 'var(--bb-brand)' }}>política de privacidade</Link>.
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(4)}>Voltar</Button>
              <Button className="flex-1" loading={loading} onClick={handleSubmit}>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAcademy } from '@/lib/api/onboarding.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';

type Step = 1 | 2 | 3 | 4;

const PLATFORM_PLANS = [
  { id: 'free', name: 'Free', price: 'Grátis', features: ['1 unidade', '30 alunos', '3 turmas'] },
  { id: 'pro', name: 'Pro', price: 'R$ 199/mês', features: ['3 unidades', '200 alunos', 'Turmas ilimitadas', 'Relatórios', 'Automações'] },
  { id: 'enterprise', name: 'Enterprise', price: 'R$ 499/mês', features: ['Ilimitado', 'White-label', 'API', 'Suporte prioritário'] },
];

export default function CadastrarAcademiaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [academy, setAcademy] = useState({ name: '', cnpj: '', address: '', phone: '' });
  const [admin, setAdmin] = useState({ name: '', email: '', password: '' });
  const [plan, setPlan] = useState('pro');

  async function handleSubmit() {
    setLoading(true);
    try {
      await createAcademy(academy, admin, plan);
      setStep(4);
      toast('Academia criada com sucesso!', 'success');
      setTimeout(() => router.push('/admin/setup-wizard'), 2000);
    } catch {
      toast('Erro ao criar academia', 'error');
    } finally {
      setLoading(false);
    }
  }

  const STEPS = ['Academia', 'Administrador', 'Plano', 'Confirmação'];

  return (
    <div className="flex min-h-screen items-center justify-center bg-bb-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-bb-black">Cadastrar Academia</h1>
          <p className="mt-1 text-sm text-bb-gray-500">Comece a usar o BlackBelt em minutos</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i + 1 <= step ? 'bg-bb-primary text-white' : 'bg-bb-gray-200 text-bb-gray-500'
              }`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 ${i + 1 < step ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-bb-black">Dados da Academia</h2>
              {[
                { key: 'name', label: 'Nome da Academia', placeholder: 'Ex: Academia Boa Vista BJJ' },
                { key: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0001-00' },
                { key: 'address', label: 'Endereço', placeholder: 'Rua, número, bairro, cidade' },
                { key: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-bb-black">{label}</label>
                  <input
                    value={academy[key as keyof typeof academy]}
                    onChange={(e) => setAcademy({ ...academy, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <Button className="w-full" onClick={() => setStep(2)} disabled={!academy.name}>Próximo</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-bb-black">Dados do Administrador</h2>
              {[
                { key: 'name', label: 'Nome Completo', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'password', label: 'Senha', type: 'password' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-bb-black">{label}</label>
                  <input
                    type={type}
                    value={admin[key as keyof typeof admin]}
                    onChange={(e) => setAdmin({ ...admin, [key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!admin.email}>Próximo</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-bb-black">Escolha seu Plano</h2>
              <div className="space-y-3">
                {PLATFORM_PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      plan === p.id ? 'border-bb-primary bg-red-50' : 'border-bb-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bb-black">{p.name}</span>
                      <span className="font-bold text-bb-primary">{p.price}</span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {p.features.map((f) => (
                        <li key={f} className="text-xs text-bb-gray-500">✓ {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" onClick={handleSubmit} loading={loading}>Criar Academia</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
              <h2 className="text-lg font-bold text-bb-black">Academia Criada!</h2>
              <p className="text-sm text-bb-gray-500">Redirecionando para o setup inicial...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

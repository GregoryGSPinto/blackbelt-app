'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getChampionshipById,
  type ChampionshipDTO,
  type CategoryDTO,
} from '@/lib/api/championships.service';
import { register, getMyRegistrations, type RegistrationDTO } from '@/lib/api/championship-registration.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

const STEPS = ['Categoria', 'Dados', 'Pagamento', 'Confirmação'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  inscrito: { label: 'Inscrito', color: 'bg-blue-100 text-blue-700' },
  pesagem: { label: 'Pesagem', color: 'bg-yellow-100 text-yellow-700' },
  competindo: { label: 'Competindo', color: 'bg-green-100 text-green-700' },
  resultado: { label: 'Resultado', color: 'bg-bb-gray-100 text-bb-gray-600' },
};

const GENDER_LABEL: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino', misto: 'Misto' };

export default function InscricaoPage() {
  const params = useParams();
  const championshipId = params.id as string;

  const [championship, setChampionship] = useState<ChampionshipDTO | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<RegistrationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null);
  const [success, setSuccess] = useState(false);
  const [newReg, setNewReg] = useState<RegistrationDTO | null>(null);

  // Form state
  const [belt, setBelt] = useState('Azul');
  const [weight, setWeight] = useState('76');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState<'masculino' | 'feminino'>('masculino');

  useEffect(() => {
    Promise.all([
      getChampionshipById(championshipId),
      getMyRegistrations('current-user'),
    ])
      .then(([champ, regs]) => {
        setChampionship(champ);
        setMyRegistrations(regs.filter((r) => r.championship_id === championshipId));
      })
      .finally(() => setLoading(false));
  }, [championshipId]);

  // Auto-suggest categories based on input
  const suggestedCategories = championship?.categories.filter((cat) => {
    if (gender === 'masculino' && cat.gender === 'feminino') return false;
    if (gender === 'feminino' && cat.gender === 'masculino') return false;
    return true;
  }) ?? [];

  async function handleSubmit() {
    if (!championship || !selectedCategory) return;
    setSubmitting(true);
    try {
      const reg = await register(championshipId, selectedCategory.id, {
        athlete_id: 'current-user',
        athlete_name: 'Usuário Logado',
        academy: 'Gracie Barra Centro',
        belt,
        weight_declared: Number(weight),
        age: Number(age),
        gender,
      });
      setNewReg(reg);
      setSuccess(true);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!championship) return <div className="py-20 text-center text-bb-gray-500">Campeonato não encontrado</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={`Inscrição - ${championship.name}`} subtitle={`${new Date(championship.date).toLocaleDateString('pt-BR')} | ${championship.location}`} />

      {/* My existing registrations */}
      {myRegistrations.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold text-bb-black">Minhas inscrições neste campeonato</h2>
          <div className="space-y-2">
            {myRegistrations.map((reg) => {
              const statusInfo = STATUS_LABELS[reg.status];
              return (
                <div key={reg.id} className="flex items-center justify-between rounded-xl bg-bb-gray-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-bb-black">{reg.category_label}</p>
                    <p className="text-xs text-bb-gray-500">{reg.belt} | {reg.weight_declared}kg</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step tracker */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              i <= step ? 'bg-bb-primary text-white' : 'bg-bb-gray-200 text-bb-gray-500'
            }`}>
              {i < step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`hidden text-xs sm:block ${i <= step ? 'font-medium text-bb-black' : 'text-bb-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Category Selection */}
      {step === 0 && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-bb-black">Selecione a Categoria</h2>

          {/* Auto-suggest filters */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Faixa</label>
              <select value={belt} onChange={(e) => setBelt(e.target.value)} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
                {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Peso (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Idade</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Gênero</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'masculino' | 'feminino')} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
          </div>

          {/* Suggested categories */}
          <p className="mb-2 text-xs font-medium text-bb-gray-500">Categorias sugeridas para você:</p>
          <div className="space-y-2">
            {suggestedCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  selectedCategory?.id === cat.id
                    ? 'border-bb-primary bg-bb-primary/5'
                    : 'border-bb-gray-200 hover:bg-bb-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-bb-black">{cat.modality} - {cat.belt_range}</p>
                    <p className="text-xs text-bb-gray-500">{cat.weight_range} | {cat.age_range} | {GENDER_LABEL[cat.gender]}</p>
                  </div>
                  <span className="text-xs text-bb-gray-400">{cat.participants.length} atletas</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="primary" disabled={!selectedCategory} onClick={() => setStep(1)}>
              Próximo
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Confirm Data */}
      {step === 1 && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-bb-black">Confirmar Dados</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Categoria</p>
                <p className="font-medium text-bb-black">{selectedCategory?.modality} - {selectedCategory?.belt_range}</p>
              </div>
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Peso/Idade</p>
                <p className="font-medium text-bb-black">{selectedCategory?.weight_range}</p>
              </div>
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Faixa</p>
                <p className="font-medium text-bb-black">{belt}</p>
              </div>
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Peso declarado</p>
                <p className="font-medium text-bb-black">{weight} kg</p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-xs text-yellow-700">
                Certifique-se de que seus dados estão corretos. A pesagem oficial será realizada no dia do evento.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>Voltar</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Ir para pagamento</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-bb-black">Pagamento</h2>

          <div className="rounded-xl bg-bb-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-bb-gray-500">Taxa de inscrição</span>
              <span className="text-lg font-bold text-bb-black">
                R$ {championship.registration_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" defaultChecked className="h-4 w-4 accent-bb-primary" />
                <div>
                  <p className="text-sm font-medium text-bb-black">PIX</p>
                  <p className="text-xs text-bb-gray-500">Aprovação imediata</p>
                </div>
              </label>
            </div>
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" className="h-4 w-4 accent-bb-primary" />
                <div>
                  <p className="text-sm font-medium text-bb-black">Cartão de Crédito</p>
                  <p className="text-xs text-bb-gray-500">Até 3x sem juros</p>
                </div>
              </label>
            </div>
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <label className="flex items-center gap-3">
                <input type="radio" name="payment" className="h-4 w-4 accent-bb-primary" />
                <div>
                  <p className="text-sm font-medium text-bb-black">Boleto Bancário</p>
                  <p className="text-xs text-bb-gray-500">Até 3 dias úteis</p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Processando...' : 'Confirmar e pagar'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && success && newReg && (
        <Card className="p-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-bold text-bb-black">Inscrição confirmada!</h2>
          <p className="mt-1 text-sm text-bb-gray-500">Sua inscrição foi realizada com sucesso.</p>

          <div className="mx-auto mt-4 max-w-sm rounded-xl bg-bb-gray-50 p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bb-gray-500">Categoria</span>
                <span className="font-medium text-bb-black">{newReg.category_label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bb-gray-500">Status</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Inscrito</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bb-gray-500">Comprovante</span>
                {newReg.receipt_url ? (
                  <a href={newReg.receipt_url} className="text-xs font-medium text-bb-primary hover:underline">Baixar PDF</a>
                ) : (
                  <span className="text-xs text-bb-gray-400">Disponível em breve</span>
                )}
              </div>
            </div>
          </div>

          {/* Status tracker */}
          <div className="mx-auto mt-6 max-w-sm">
            <p className="mb-3 text-xs font-medium text-bb-gray-500">Acompanhe seu status:</p>
            <div className="flex items-center justify-between">
              {Object.entries(STATUS_LABELS).map(([key, _info], i) => (
                <div key={key} className="flex flex-1 items-center">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    key === newReg.status ? 'bg-bb-primary text-white' : i === 0 ? 'bg-green-100 text-green-600' : 'bg-bb-gray-200 text-bb-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 3 && <div className={`h-px flex-1 ${i === 0 ? 'bg-green-300' : 'bg-bb-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between">
              {Object.values(STATUS_LABELS).map((info) => (
                <span key={info.label} className="text-[9px] text-bb-gray-400">{info.label}</span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

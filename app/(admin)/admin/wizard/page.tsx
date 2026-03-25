'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getWizardProgress,
  saveWizardStep,
  completeWizard,
  type WizardProgressDTO,
  type WizardStepData,
} from '@/lib/api/wizard.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

interface StepConfig {
  title: string;
  subtitle: string;
  icon: string;
}

const STEPS: StepConfig[] = [
  { title: 'Nome e identidade visual', subtitle: 'Defina o nome, logo e cor primária da sua academia.', icon: '🎨' },
  { title: 'Unidades e locais', subtitle: 'Adicione as sedes e filiais.', icon: '📍' },
  { title: 'Modalidades', subtitle: 'Selecione as artes marciais oferecidas.', icon: '🥋' },
  { title: 'Professores', subtitle: 'Adicione os professores e envie convites.', icon: '👨‍🏫' },
  { title: 'Planos e preços', subtitle: 'Configure os planos de mensalidade.', icon: '💰' },
  { title: 'Turmas e horários', subtitle: 'Crie turmas e defina a grade horária.', icon: '📅' },
  { title: 'Importar alunos', subtitle: 'Importe via CSV ou cadastre manualmente.', icon: '👥' },
  { title: 'Biblioteca de vídeos', subtitle: 'Ative o acesso a vídeos e conteúdos.', icon: '🎬' },
  { title: 'Automações', subtitle: 'Configure notificações automáticas.', icon: '⚙️' },
  { title: 'Tudo pronto!', subtitle: 'Sua academia está no ar.', icon: '🚀' },
];

const MODALITIES = ['BJJ', 'Muay Thai', 'Judô', 'Karatê', 'MMA', 'Boxe', 'Wrestling', 'Taekwondo', 'Kickboxing', 'Capoeira'];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const AUTOMATIONS = [
  { key: 'welcome', label: 'Boas-vindas ao novo aluno', description: 'Envia mensagem automática quando um aluno se cadastra' },
  { key: 'absence', label: 'Alerta de ausência', description: 'Notifica quando aluno falta 3+ dias seguidos' },
  { key: 'birthday', label: 'Parabéns de aniversário', description: 'Envia mensagem no dia do aniversário' },
  { key: 'payment', label: 'Lembrete de pagamento', description: 'Avisa 3 dias antes do vencimento' },
  { key: 'renewal', label: 'Renovação de plano', description: 'Envia lembrete quando plano está expirando' },
];

export default function WizardPage() {
  const { toast } = useToast();
  const [, setProgress] = useState<WizardProgressDTO | null>(null);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0: Academy identity
  const [academyName, setAcademyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#DC2626');

  // Step 1: Units
  const [units, setUnits] = useState<{ name: string; address: string }[]>([{ name: '', address: '' }]);

  // Step 2: Modalities
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['BJJ']);

  // Step 3: Teachers
  const [teachers, setTeachers] = useState<{ name: string; email: string }[]>([{ name: '', email: '' }]);

  // Step 4: Plans
  const [plans, setPlans] = useState<{ name: string; price: string; frequency: string }[]>([
    { name: '', price: '', frequency: 'mensal' },
  ]);

  // Step 5: Classes
  const [classes, setClasses] = useState<{ name: string; modality: string; days: string[]; time: string }[]>([
    { name: '', modality: 'BJJ', days: [], time: '' },
  ]);

  // Step 6: Import method
  const [importMethod, setImportMethod] = useState<'csv' | 'manual' | 'later'>('later');

  // Step 7: Video library
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Step 8: Automations
  const [enabledAutomations, setEnabledAutomations] = useState<string[]>(['welcome', 'absence']);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getWizardProgress(getActiveAcademyId())
      .then((p) => {
        setProgress(p);
        setCurrentStep(p.currentStep);
        // Restore saved data
        const data = p.stepsData;
        if (data[0]) {
          setAcademyName((data[0].academyName as string) ?? '');
          setPrimaryColor((data[0].primaryColor as string) ?? '#DC2626');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getStepData = useCallback((): WizardStepData => {
    switch (currentStep) {
      case 0: return { academyName, primaryColor, logoUrl: null };
      case 1: return { units: JSON.stringify(units) };
      case 2: return { modalities: selectedModalities.join(',') };
      case 3: return { teachers: JSON.stringify(teachers) };
      case 4: return { plans: JSON.stringify(plans) };
      case 5: return { classes: JSON.stringify(classes) };
      case 6: return { importMethod };
      case 7: return { videoEnabled };
      case 8: return { automations: enabledAutomations.join(',') };
      default: return {};
    }
  }, [currentStep, academyName, primaryColor, units, selectedModalities, teachers, plans, classes, importMethod, videoEnabled, enabledAutomations]);

  async function handleNext() {
    setSaving(true);
    try {
      const updated = await saveWizardStep(getActiveAcademyId(), currentStep, getStepData());
      setProgress(updated);
      setCurrentStep(currentStep + 1);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setCurrentStep(currentStep + 1);
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await completeWizard(getActiveAcademyId());
      toast('Academia configurada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function handlePrev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function toggleModality(mod: string) {
    setSelectedModalities((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  }

  function toggleDay(classIdx: number, day: string) {
    setClasses((prev) =>
      prev.map((c, i) =>
        i === classIdx
          ? { ...c, days: c.days.includes(day) ? c.days.filter((d) => d !== day) : [...c.days, day] }
          : c,
      ),
    );
  }

  function toggleAutomation(key: string) {
    setEnabledAutomations((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
    );
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const stepConfig = STEPS[currentStep];
  const progressPercent = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-bb-gray-500">
          <span>Passo {currentStep + 1} de {STEPS.length}</span>
          <span>{Math.round(progressPercent)}% concluído</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-bb-gray-200">
          <div
            className="h-full rounded-full bg-bb-red transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-bb-red'
                  : i === currentStep
                    ? 'bg-bb-red-500'
                    : 'bg-bb-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="p-6">
        <div className="mb-6 text-center">
          <span className="text-3xl">{stepConfig.icon}</span>
          <h2 className="mt-2 text-xl font-bold text-bb-black">{stepConfig.title}</h2>
          <p className="mt-1 text-sm text-bb-gray-500">{stepConfig.subtitle}</p>
        </div>

        <div className="space-y-4">
          {/* Step 0: Academy identity */}
          {currentStep === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-bb-black">Nome da academia</label>
                <input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="Ex: Academia Fight Club"
                  className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bb-black">Logo (opcional)</label>
                <div className="mt-1 flex h-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-bb-gray-300 text-sm text-bb-gray-400 hover:border-bb-gray-400">
                  <div className="text-center">
                    <span className="text-2xl">📷</span>
                    <p className="mt-1">Clique ou arraste para upload</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bb-black">Cor primária</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-bb-gray-300"
                  />
                  <span className="text-sm text-bb-gray-500">{primaryColor}</span>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Units */}
          {currentStep === 1 && (
            <>
              {units.map((unit, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-bb-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-bb-gray-500">Unidade {idx + 1}</span>
                    {units.length > 1 && (
                      <button
                        onClick={() => setUnits((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-bb-gray-400 hover:text-red-500"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    value={unit.name}
                    onChange={(e) => setUnits((prev) => prev.map((u, i) => i === idx ? { ...u, name: e.target.value } : u))}
                    placeholder="Nome da unidade"
                    className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                  <input
                    value={unit.address}
                    onChange={(e) => setUnits((prev) => prev.map((u, i) => i === idx ? { ...u, address: e.target.value } : u))}
                    placeholder="Endereço completo"
                    className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                </div>
              ))}
              <button
                onClick={() => setUnits((prev) => [...prev, { name: '', address: '' }])}
                className="w-full rounded-lg border border-dashed border-bb-gray-300 py-2 text-sm text-bb-gray-500 hover:border-bb-gray-400 hover:text-bb-gray-700"
              >
                + Adicionar unidade
              </button>
            </>
          )}

          {/* Step 2: Modalities */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MODALITIES.map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleModality(mod)}
                  className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    selectedModalities.includes(mod)
                      ? 'border-bb-red bg-red-50 font-medium text-bb-red'
                      : 'border-bb-gray-200 text-bb-gray-600 hover:border-bb-gray-300'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Teachers */}
          {currentStep === 3 && (
            <>
              {teachers.map((teacher, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={teacher.name}
                    onChange={(e) => setTeachers((prev) => prev.map((t, i) => i === idx ? { ...t, name: e.target.value } : t))}
                    placeholder="Nome do professor"
                    className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                  <input
                    value={teacher.email}
                    onChange={(e) => setTeachers((prev) => prev.map((t, i) => i === idx ? { ...t, email: e.target.value } : t))}
                    placeholder="Email para convite"
                    type="email"
                    className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                  {teachers.length > 1 && (
                    <button
                      onClick={() => setTeachers((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-bb-gray-400 hover:text-red-500"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setTeachers((prev) => [...prev, { name: '', email: '' }])}
                className="w-full rounded-lg border border-dashed border-bb-gray-300 py-2 text-sm text-bb-gray-500 hover:border-bb-gray-400"
              >
                + Adicionar professor
              </button>
              <p className="text-xs text-bb-gray-400">Cada professor receberá um email de convite para acessar a plataforma.</p>
            </>
          )}

          {/* Step 4: Plans */}
          {currentStep === 4 && (
            <>
              {plans.map((plan, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-bb-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-bb-gray-500">Plano {idx + 1}</span>
                    {plans.length > 1 && (
                      <button
                        onClick={() => setPlans((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-bb-gray-400 hover:text-red-500"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    value={plan.name}
                    onChange={(e) => setPlans((prev) => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))}
                    placeholder="Nome do plano (ex: Básico, Premium)"
                    className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-bb-gray-400">R$</span>
                      <input
                        value={plan.price}
                        onChange={(e) => setPlans((prev) => prev.map((p, i) => i === idx ? { ...p, price: e.target.value } : p))}
                        placeholder="150,00"
                        className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 pl-9 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                      />
                    </div>
                    <select
                      value={plan.frequency}
                      onChange={(e) => setPlans((prev) => prev.map((p, i) => i === idx ? { ...p, frequency: e.target.value } : p))}
                      className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setPlans((prev) => [...prev, { name: '', price: '', frequency: 'mensal' }])}
                className="w-full rounded-lg border border-dashed border-bb-gray-300 py-2 text-sm text-bb-gray-500 hover:border-bb-gray-400"
              >
                + Adicionar plano
              </button>
            </>
          )}

          {/* Step 5: Classes */}
          {currentStep === 5 && (
            <>
              {classes.map((cls, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-bb-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-bb-gray-500">Turma {idx + 1}</span>
                    {classes.length > 1 && (
                      <button
                        onClick={() => setClasses((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-bb-gray-400 hover:text-red-500"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={cls.name}
                      onChange={(e) => setClasses((prev) => prev.map((c, i) => i === idx ? { ...c, name: e.target.value } : c))}
                      placeholder="Nome da turma"
                      className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                    />
                    <select
                      value={cls.modality}
                      onChange={(e) => setClasses((prev) => prev.map((c, i) => i === idx ? { ...c, modality: e.target.value } : c))}
                      className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                    >
                      {selectedModalities.map((mod) => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-bb-gray-500">Dias da semana</label>
                    <div className="mt-1 flex gap-1">
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(idx, day)}
                          className={`rounded px-2 py-1 text-xs transition-colors ${
                            cls.days.includes(day)
                              ? 'bg-bb-red text-bb-white'
                              : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    value={cls.time}
                    onChange={(e) => setClasses((prev) => prev.map((c, i) => i === idx ? { ...c, time: e.target.value } : c))}
                    placeholder="Horário (ex: 19:00 - 20:30)"
                    className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
                  />
                </div>
              ))}
              <button
                onClick={() => setClasses((prev) => [...prev, { name: '', modality: selectedModalities[0] ?? 'BJJ', days: [], time: '' }])}
                className="w-full rounded-lg border border-dashed border-bb-gray-300 py-2 text-sm text-bb-gray-500 hover:border-bb-gray-400"
              >
                + Adicionar turma
              </button>
            </>
          )}

          {/* Step 6: Import students */}
          {currentStep === 6 && (
            <div className="space-y-3">
              {(['csv', 'manual', 'later'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setImportMethod(method)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    importMethod === method
                      ? 'border-bb-red bg-red-50'
                      : 'border-bb-gray-200 hover:border-bb-gray-300'
                  }`}
                >
                  <span className="text-xl">
                    {method === 'csv' ? '📄' : method === 'manual' ? '✏️' : '⏭️'}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${importMethod === method ? 'text-bb-red' : 'text-bb-black'}`}>
                      {method === 'csv' ? 'Importar CSV' : method === 'manual' ? 'Cadastrar manualmente' : 'Fazer depois'}
                    </p>
                    <p className="text-xs text-bb-gray-500">
                      {method === 'csv'
                        ? 'Envie um arquivo CSV com os dados dos alunos'
                        : method === 'manual'
                          ? 'Cadastre alunos um por um agora'
                          : 'Pule esta etapa e importe depois'}
                    </p>
                  </div>
                </button>
              ))}
              {importMethod === 'csv' && (
                <div className="rounded-lg border-2 border-dashed border-bb-gray-300 p-6 text-center">
                  <span className="text-3xl">📂</span>
                  <p className="mt-2 text-sm text-bb-gray-500">Arraste o arquivo CSV aqui ou clique para selecionar</p>
                  <p className="mt-1 text-xs text-bb-gray-400">Colunas esperadas: nome, email, telefone, modalidade, faixa</p>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Video library */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-bb-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-bb-black">Biblioteca de Vídeos</p>
                    <p className="text-sm text-bb-gray-500">
                      Seus alunos terão acesso a vídeos técnicos, aulas gravadas e tutoriais.
                    </p>
                  </div>
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      videoEnabled ? 'bg-bb-red' : 'bg-bb-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        videoEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              {videoEnabled && (
                <div className="space-y-2">
                  <p className="text-sm text-bb-gray-500">Com a biblioteca ativada, seus alunos poderão:</p>
                  <ul className="space-y-1 text-sm text-bb-gray-600">
                    <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Assistir aulas gravadas a qualquer momento</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Acessar técnicas organizadas por faixa</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Salvar vídeos favoritos</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Receber recomendações personalizadas</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 8: Automations */}
          {currentStep === 8 && (
            <div className="space-y-2">
              {AUTOMATIONS.map((auto) => (
                <button
                  key={auto.key}
                  onClick={() => toggleAutomation(auto.key)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    enabledAutomations.includes(auto.key)
                      ? 'border-bb-red bg-red-50'
                      : 'border-bb-gray-200 hover:border-bb-gray-300'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      enabledAutomations.includes(auto.key)
                        ? 'border-bb-red bg-bb-red text-white'
                        : 'border-bb-gray-300'
                    }`}
                  >
                    {enabledAutomations.includes(auto.key) && (
                      <span className="text-xs">&#10003;</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bb-black">{auto.label}</p>
                    <p className="text-xs text-bb-gray-500">{auto.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 9: Complete */}
          {currentStep === 9 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
                &#10003;
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-bb-black">Sua academia está no ar!</p>
                <div className="space-y-1 text-sm text-green-600">
                  {academyName && <p>&#10003; {academyName} configurada</p>}
                  <p>&#10003; {selectedModalities.length} modalidade(s)</p>
                  <p>&#10003; {teachers.filter((t) => t.name).length} professor(es) convidado(s)</p>
                  <p>&#10003; {plans.filter((p) => p.name).length} plano(s) criado(s)</p>
                  <p>&#10003; {classes.filter((c) => c.name).length} turma(s) configurada(s)</p>
                  {videoEnabled && <p>&#10003; Biblioteca de vídeos ativada</p>}
                  <p>&#10003; {enabledAutomations.length} automação(ões) ativada(s)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentStep > 0 && currentStep < 9 && (
            <Button variant="ghost" onClick={handlePrev}>Voltar</Button>
          )}
          {currentStep < 9 && (
            <>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-bb-gray-400"
              >
                Pular
              </Button>
              <Button
                className="flex-1"
                onClick={handleNext}
                loading={saving}
              >
                Próximo
              </Button>
            </>
          )}
          {currentStep === 9 && (
            <Button
              className="flex-1"
              onClick={handleComplete}
              loading={saving}
            >
              Ir para o Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

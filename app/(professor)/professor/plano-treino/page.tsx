'use client';

import { useEffect, useState } from 'react';
import {
  getPlans,
  createPlan,
  updatePlan,
  type TrainingPlanDTO,
  type PlanStatus,
} from '@/lib/api/training-plan.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_LABEL: Record<PlanStatus, string> = { active: 'Ativo', completed: 'Concluído', archived: 'Arquivado' };
const STATUS_COLOR: Record<PlanStatus, string> = { active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', archived: 'bg-gray-100 text-gray-500' };

type WizardStep = 'goal' | 'duration' | 'review';

export default function PlanoTreinoProfessorPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<TrainingPlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('goal');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_id: 'student-1',
    name: '',
    goal: '',
    duration_weeks: 8,
  });

  useEffect(() => {
    getPlans('student-1').then(setPlans).finally(() => setLoading(false));
  }, []);

  async function handleCreatePlan() {
    try {
      const plan = await createPlan({
        student_id: form.student_id,
        created_by: 'prof-1',
        name: form.name,
        goal: form.goal,
        duration_weeks: form.duration_weeks,
        weeks: [],
        status: 'active',
      });
      setPlans((prev) => [plan, ...prev]);
      setShowWizard(false);
      setWizardStep('goal');
      setForm({ student_id: 'student-1', name: '', goal: '', duration_weeks: 8 });
      toast('Plano criado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleDuplicate(plan: TrainingPlanDTO) {
    try {
      const duplicated = await createPlan({
        student_id: plan.student_id,
        created_by: 'prof-1',
        name: `${plan.name} (Cópia)`,
        goal: plan.goal,
        duration_weeks: plan.duration_weeks,
        weeks: plan.weeks,
        status: 'active',
      });
      setPlans((prev) => [duplicated, ...prev]);
      toast('Plano duplicado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleArchive(planId: string) {
    try {
      const updated = await updatePlan(planId, { status: 'archived' });
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      toast('Plano arquivado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <PlanGate module="avaliacoes">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Planos de Treino</h1>
        <Button onClick={() => setShowWizard(true)}>Novo Plano</Button>
      </div>

      {/* Plans List */}
      {plans.length === 0 && (
        <EmptyState
          icon="📋"
          title="Nenhum plano de treino"
          description="Crie planos de treino personalizados para seus alunos com exercícios, séries e progressão semanal."
          actionLabel="Novo Plano"
          onAction={() => setShowWizard(true)}
          variant="first-time"
        />
      )}
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-bb-black">{plan.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[plan.status]}`}>
                    {STATUS_LABEL[plan.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-bb-gray-500">{plan.goal}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-bb-gray-500">
                  <span>{plan.duration_weeks} semanas</span>
                  <span>Criado: {new Date(plan.created_at).toLocaleDateString('pt-BR')}</span>
                  {plan.adherence_pct !== undefined && <span>Aderência: {plan.adherence_pct}%</span>}
                </div>
                {/* Adherence bar */}
                {plan.adherence_pct !== undefined && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-bb-gray-200">
                    <div
                      className={`h-full rounded-full ${plan.adherence_pct >= 70 ? 'bg-green-500' : plan.adherence_pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${plan.adherence_pct}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="ml-3 flex flex-col gap-1">
                <Button variant="ghost" onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}>
                  {expandedPlan === plan.id ? 'Fechar' : 'Detalhes'}
                </Button>
                <Button variant="secondary" onClick={() => handleDuplicate(plan)}>Duplicar</Button>
                {plan.status === 'active' && (
                  <Button variant="danger" onClick={() => handleArchive(plan.id)}>Arquivar</Button>
                )}
              </div>
            </div>

            {/* Expanded Week View */}
            {expandedPlan === plan.id && plan.weeks.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-bb-gray-200 pt-4">
                {plan.weeks.map((week) => (
                  <div key={week.week_number} className="rounded-lg border border-bb-gray-200 p-3">
                    <h4 className="text-sm font-semibold text-bb-black">
                      Semana {week.week_number}: {week.theme}
                    </h4>
                    <div className="mt-2 space-y-2">
                      {week.sessions.map((session) => (
                        <div key={session.id} className="rounded bg-bb-gray-50 p-2">
                          <p className="text-xs font-medium text-bb-black">{session.label}</p>
                          <ul className="mt-1 space-y-0.5">
                            {session.exercises.map((ex) => (
                              <li key={ex.id} className="text-xs text-bb-gray-500">
                                {ex.name}
                                {ex.sets && ex.reps ? ` — ${ex.sets}x${ex.reps}` : ''}
                                {ex.duration_min ? ` — ${ex.duration_min}min` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Wizard Modal */}
      <Modal open={showWizard} onClose={() => { setShowWizard(false); setWizardStep('goal'); }} title="Novo Plano de Treino">
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            {(['goal', 'duration', 'review'] as WizardStep[]).map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${wizardStep === step ? 'bg-bb-primary text-white' : 'bg-bb-gray-200 text-bb-gray-500'}`}>
                  {i + 1}
                </span>
                <span className={wizardStep === step ? 'font-medium text-bb-black' : 'text-bb-gray-500'}>
                  {step === 'goal' ? 'Objetivo' : step === 'duration' ? 'Duração' : 'Revisar'}
                </span>
                {i < 2 && <span className="mx-1 text-bb-gray-300">—</span>}
              </div>
            ))}
          </div>

          {wizardStep === 'goal' && (
            <>
              <input
                placeholder="Nome do plano"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Objetivo do plano (ex: preparar para competição, melhorar guarda...)"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
              <Button className="w-full" onClick={() => setWizardStep('duration')} disabled={!form.name || !form.goal}>
                Próximo
              </Button>
            </>
          )}

          {wizardStep === 'duration' && (
            <>
              <div>
                <label className="mb-1 block text-sm text-bb-black">Duração (semanas)</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={form.duration_weeks}
                  onChange={(e) => setForm({ ...form, duration_weeks: Number(e.target.value) })}
                  className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setWizardStep('goal')}>Voltar</Button>
                <Button className="flex-1" onClick={() => setWizardStep('review')}>Próximo</Button>
              </div>
            </>
          )}

          {wizardStep === 'review' && (
            <>
              <div className="rounded-lg bg-bb-gray-50 p-3 text-sm">
                <p><span className="font-medium text-bb-black">Nome:</span> {form.name}</p>
                <p className="mt-1"><span className="font-medium text-bb-black">Objetivo:</span> {form.goal}</p>
                <p className="mt-1"><span className="font-medium text-bb-black">Duração:</span> {form.duration_weeks} semanas</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setWizardStep('duration')}>Voltar</Button>
                <Button className="flex-1" onClick={handleCreatePlan}>Criar Plano</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}

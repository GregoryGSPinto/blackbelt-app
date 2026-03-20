'use client';

import { useEffect, useState } from 'react';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  analyzeViability,
  type FranchiseLead,
  type PipelineStage,
  type OnboardingStep,
  type ViabilityAnalysis,
} from '@/lib/api/franchise-expansion.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const STAGES: PipelineStage[] = ['lead', 'analise', 'aprovado', 'setup', 'operando'];
const STAGE_LABEL: Record<PipelineStage, string> = { lead: 'Lead', analise: 'Analise', aprovado: 'Aprovado', setup: 'Setup', operando: 'Operando' };
const STAGE_COLOR: Record<PipelineStage, string> = {
  lead: 'bg-blue-100 text-blue-700 border-blue-300',
  analise: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  aprovado: 'bg-green-100 text-green-700 border-green-300',
  setup: 'bg-purple-100 text-purple-700 border-purple-300',
  operando: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

const ONBOARDING_STEPS: OnboardingStep[] = ['dados', 'localizacao', 'viabilidade', 'contrato', 'setup', 'treinamento', 'inauguracao'];
const STEP_LABEL: Record<OnboardingStep, string> = {
  dados: 'Dados do Candidato',
  localizacao: 'Localizacao',
  viabilidade: 'Analise de Viabilidade',
  contrato: 'Contrato',
  setup: 'Setup da Unidade',
  treinamento: 'Treinamento',
  inauguracao: 'Inauguracao',
};

const VIABILITY_COLOR: Record<string, string> = {
  recomendado: 'text-green-600',
  viavel: 'text-blue-600',
  arriscado: 'text-yellow-600',
  nao_recomendado: 'text-red-600',
};

const VIABILITY_LABEL: Record<string, string> = {
  recomendado: 'Recomendado',
  viavel: 'Viavel',
  arriscado: 'Arriscado',
  nao_recomendado: 'Nao Recomendado',
};

type ViewMode = 'kanban' | 'onboarding';

export default function ExpansaoPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<FranchiseLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('kanban');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', state: '', investment_capacity: 0, experience: '', notes: '',
  });

  // Onboarding wizard
  const [selectedLead, setSelectedLead] = useState<FranchiseLead | null>(null);
  const [wizardStep, setWizardStep] = useState(0);

  // Viability
  const [viabilityResult, setViabilityResult] = useState<ViabilityAnalysis | null>(null);
  const [analyzingViability, setAnalyzingViability] = useState(false);

  useEffect(() => {
    getLeads('franchise-1')
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const lead = await createLead({ franchise_id: 'franchise-1', ...form });
      setLeads((prev) => [...prev, lead]);
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', city: '', state: '', investment_capacity: 0, experience: '', notes: '' });
      toast('Lead adicionado ao pipeline', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleStageChange(leadId: string, newStage: PipelineStage) {
    try {
      await updateLeadStatus(leadId, newStage);
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, stage: newStage, updated_at: new Date().toISOString() } : l));
      toast(`Lead movido para ${STAGE_LABEL[newStage]}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleViabilityAnalysis(location: string) {
    setAnalyzingViability(true);
    try {
      const result = await analyzeViability(location);
      setViabilityResult(result);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setAnalyzingViability(false);
    }
  }

  function openOnboarding(lead: FranchiseLead) {
    setSelectedLead(lead);
    const stepIdx = lead.onboarding_step ? ONBOARDING_STEPS.indexOf(lead.onboarding_step) : 0;
    setWizardStep(Math.max(0, stepIdx));
    setView('onboarding');
    setViabilityResult(null);
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-bb-black">Expansao da Rede</h1>
        <div className="flex gap-2">
          {view === 'onboarding' && (
            <Button variant="ghost" onClick={() => { setView('kanban'); setSelectedLead(null); }}>Voltar ao Pipeline</Button>
          )}
          <Button onClick={() => setShowCreate(true)}>Novo Lead</Button>
        </div>
      </div>

      {/* View: Kanban Pipeline */}
      {view === 'kanban' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 text-xs text-bb-gray-500">
            <span>{leads.length} leads no pipeline</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div key={stage}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLOR[stage].split(' ').slice(0, 2).join(' ')}`}>
                      {STAGE_LABEL[stage]}
                    </span>
                    <span className="text-xs text-bb-gray-500">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <Card key={lead.id} className="p-3">
                        <p className="font-medium text-bb-black">{lead.name}</p>
                        <p className="text-xs text-bb-gray-500">{lead.city} - {lead.state}</p>
                        <p className="text-xs text-bb-gray-500">{lead.phone}</p>
                        {lead.viability_score !== null && (
                          <p className="mt-1 text-xs">
                            <span className="text-bb-gray-500">Viabilidade: </span>
                            <span className={lead.viability_score >= 80 ? 'font-bold text-green-600' : lead.viability_score >= 60 ? 'font-bold text-yellow-600' : 'font-bold text-red-600'}>
                              {lead.viability_score}
                            </span>
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-bb-gray-500">R$ {lead.investment_capacity.toLocaleString('pt-BR')}</p>

                        <div className="mt-2 flex gap-1">
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                            className="flex-1 rounded border border-bb-gray-200 px-1 py-1 text-[10px]"
                          >
                            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                          </select>
                          {(lead.stage === 'aprovado' || lead.stage === 'setup') && (
                            <button
                              onClick={() => openOnboarding(lead)}
                              className="rounded bg-bb-primary px-2 py-1 text-[10px] text-white"
                            >
                              Onboarding
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View: Onboarding Wizard */}
      {view === 'onboarding' && selectedLead && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-bb-black">{selectedLead.name}</h2>
                <p className="text-sm text-bb-gray-500">{selectedLead.city} - {selectedLead.state}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STAGE_COLOR[selectedLead.stage].split(' ').slice(0, 2).join(' ')}`}>
                {STAGE_LABEL[selectedLead.stage]}
              </span>
            </div>
          </Card>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {ONBOARDING_STEPS.map((step, idx) => (
              <button
                key={step}
                onClick={() => setWizardStep(idx)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  idx === wizardStep
                    ? 'bg-bb-red text-white'
                    : idx < wizardStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-bb-gray-100 text-bb-gray-500'
                }`}
              >
                <span className="font-bold">{idx + 1}</span>
                <span className="hidden sm:inline">{STEP_LABEL[step]}</span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-bb-black">
              {wizardStep + 1}. {STEP_LABEL[ONBOARDING_STEPS[wizardStep]]}
            </h3>

            {/* Step: Dados */}
            {wizardStep === 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-bb-gray-500">Nome</p><p className="font-medium text-bb-black">{selectedLead.name}</p></div>
                  <div><p className="text-xs text-bb-gray-500">Email</p><p className="font-medium text-bb-black">{selectedLead.email}</p></div>
                  <div><p className="text-xs text-bb-gray-500">Telefone</p><p className="font-medium text-bb-black">{selectedLead.phone}</p></div>
                  <div><p className="text-xs text-bb-gray-500">Capacidade de Investimento</p><p className="font-medium text-bb-black">R$ {selectedLead.investment_capacity.toLocaleString('pt-BR')}</p></div>
                </div>
                <div><p className="text-xs text-bb-gray-500">Experiencia</p><p className="text-sm text-bb-black">{selectedLead.experience}</p></div>
                {selectedLead.notes && <div><p className="text-xs text-bb-gray-500">Notas</p><p className="text-sm text-bb-black">{selectedLead.notes}</p></div>}
              </div>
            )}

            {/* Step: Localizacao */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-bb-gray-500">Cidade</p><p className="font-medium text-bb-black">{selectedLead.city}</p></div>
                  <div><p className="text-xs text-bb-gray-500">Estado</p><p className="font-medium text-bb-black">{selectedLead.state}</p></div>
                </div>
                <div className="mt-4 rounded-lg bg-bb-gray-100 p-4 text-center text-sm text-bb-gray-500">
                  Mapa da regiao e analise de localizacao sera exibido aqui.
                </div>
              </div>
            )}

            {/* Step: Viabilidade */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <Button onClick={() => handleViabilityAnalysis(`${selectedLead.city}, ${selectedLead.state}`)} loading={analyzingViability}>
                  Analisar Viabilidade
                </Button>

                {viabilityResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-bb-gray-100 p-4">
                      <div>
                        <p className="text-sm text-bb-gray-500">Score de Viabilidade</p>
                        <p className="text-3xl font-bold text-bb-black">{viabilityResult.score}</p>
                      </div>
                      <span className={`text-lg font-bold ${VIABILITY_COLOR[viabilityResult.recommendation]}`}>
                        {VIABILITY_LABEL[viabilityResult.recommendation]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-xs text-bb-gray-500">Populacao</p><p className="font-bold text-bb-black">{viabilityResult.population.toLocaleString('pt-BR')}</p></div>
                      <div><p className="text-xs text-bb-gray-500">Concorrentes</p><p className="font-bold text-bb-black">{viabilityResult.competitors}</p></div>
                      <div><p className="text-xs text-bb-gray-500">Renda Media</p><p className="font-bold text-bb-black">R$ {viabilityResult.avg_income.toLocaleString('pt-BR')}</p></div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-bb-black">Fatores de Analise</p>
                      {viabilityResult.factors.map((f) => (
                        <div key={f.name} className="flex items-center gap-3">
                          <span className="w-40 text-xs text-bb-gray-500">{f.name}</span>
                          <div className="flex-1 h-4 rounded bg-bb-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded ${f.score >= 70 ? 'bg-green-500' : f.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${f.score}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs font-bold text-bb-black">{f.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Contrato */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <div className="rounded-lg border border-bb-gray-300 p-4">
                  <p className="font-medium text-bb-black">Contrato de Franquia</p>
                  <p className="mt-1 text-sm text-bb-gray-500">Documento do contrato de franquia para revisao e assinatura.</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" onClick={() => toast('Download do contrato iniciado', 'info')}>Baixar Modelo</Button>
                    <Button variant="ghost" onClick={() => toast('Link de assinatura enviado', 'success')}>Enviar para Assinatura</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Setup */}
            {wizardStep === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-bb-gray-500">Checklist de setup da nova unidade:</p>
                {[
                  'Ponto comercial aprovado',
                  'Reforma conforme projeto padrao',
                  'Equipamentos instalados (tatame, espelhos, etc)',
                  'Sistema BlackBelt configurado',
                  'Quadro de funcionarios montado',
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-bb-gray-300" />
                    <span className="text-bb-black">{item}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Step: Treinamento */}
            {wizardStep === 5 && (
              <div className="space-y-3">
                <p className="text-sm text-bb-gray-500">Treinamentos obrigatorios para o franqueado:</p>
                {[
                  { name: 'Imersao na Metodologia Black Belt', duration: '40h', status: 'concluido' },
                  { name: 'Gestao Financeira para Franqueados', duration: '16h', status: 'em_andamento' },
                  { name: 'Sistema BlackBelt v2', duration: '8h', status: 'pendente' },
                  { name: 'Marketing e Vendas Local', duration: '12h', status: 'pendente' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-bb-gray-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-bb-black">{t.name}</p>
                      <p className="text-xs text-bb-gray-500">{t.duration}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      t.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {t.status === 'concluido' ? 'Concluido' : t.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Step: Inauguracao */}
            {wizardStep === 6 && (
              <div className="space-y-3">
                <p className="text-sm text-bb-gray-500">Preparacao para a inauguracao da unidade:</p>
                {[
                  'Data de inauguracao definida',
                  'Campanha de marketing pre-inauguracao',
                  'Evento de inauguracao planejado',
                  'Aulas experimentais agendadas',
                  'Equipe completa e treinada',
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-bb-gray-300" />
                    <span className="text-bb-black">{item}</span>
                  </label>
                ))}
                <Button className="mt-4" onClick={() => {
                  handleStageChange(selectedLead.id, 'operando');
                  toast('Franquia inaugurada com sucesso!', 'success');
                }}>
                  Confirmar Inauguracao
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0}>
                Anterior
              </Button>
              <Button onClick={() => setWizardStep(Math.min(ONBOARDING_STEPS.length - 1, wizardStep + 1))} disabled={wizardStep === ONBOARDING_STEPS.length - 1}>
                Proximo
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Lead Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Lead de Franquia">
        <div className="space-y-3">
          <input placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Estado (UF)" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <input type="number" placeholder="Capacidade de investimento (R$)" value={form.investment_capacity || ''} onChange={(e) => setForm({ ...form, investment_capacity: Number(e.target.value) })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <textarea placeholder="Experiencia do candidato" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} rows={2} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <Button className="w-full" onClick={handleCreate} disabled={!form.name || !form.city}>Adicionar Lead</Button>
        </div>
      </Modal>
    </div>
  );
}

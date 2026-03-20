'use client';

import { useEffect, useState } from 'react';
import {
  getStandards,
  createStandard,
  checkCompliance,
  type Standard,
  type StandardCategory,
  type ComplianceReport,
} from '@/lib/api/franchise-standards.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const CATEGORY_LABEL: Record<StandardCategory, string> = {
  visual: 'Visual',
  operacional: 'Operacional',
  pedagogico: 'Pedagogico',
  financeiro: 'Financeiro',
  qualidade: 'Qualidade',
};

const CATEGORY_COLOR: Record<StandardCategory, string> = {
  visual: 'bg-purple-100 text-purple-700',
  operacional: 'bg-blue-100 text-blue-700',
  pedagogico: 'bg-green-100 text-green-700',
  financeiro: 'bg-yellow-100 text-yellow-700',
  qualidade: 'bg-red-100 text-red-700',
};

const COMPLIANCE_COLOR: Record<string, string> = {
  conforme: 'bg-green-100 text-green-700',
  parcial: 'bg-yellow-100 text-yellow-700',
  nao_conforme: 'bg-red-100 text-red-700',
  pendente: 'bg-gray-100 text-gray-500',
};

const COMPLIANCE_LABEL: Record<string, string> = {
  conforme: 'Conforme',
  parcial: 'Parcial',
  nao_conforme: 'Nao Conforme',
  pendente: 'Pendente',
};

const ACADEMIES = [
  { id: 'acad-1', name: 'Black Belt Moema' },
  { id: 'acad-2', name: 'Black Belt Alphaville' },
  { id: 'acad-3', name: 'Black Belt Barra' },
  { id: 'acad-4', name: 'Black Belt Savassi' },
  { id: 'acad-5', name: 'Black Belt Moinhos' },
];

type Tab = 'standards' | 'compliance';

export default function PadroesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('standards');
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    category: 'visual' as StandardCategory,
    name: '',
    description: '',
    required: true,
    checklist_items: [''],
    deadline: '',
  });

  // Compliance state
  const [selectedAcademy, setSelectedAcademy] = useState(ACADEMIES[0].id);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [filterCategory, setFilterCategory] = useState<StandardCategory | ''>('');

  useEffect(() => {
    getStandards('franchise-1')
      .then(setStandards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const standard = await createStandard({
        franchise_id: 'franchise-1',
        category: form.category,
        name: form.name,
        description: form.description,
        required: form.required,
        checklist_items: form.checklist_items.filter((c) => c.trim()),
        deadline: form.deadline || null,
      });
      setStandards((prev) => [...prev, standard]);
      setShowCreate(false);
      setForm({ category: 'visual', name: '', description: '', required: true, checklist_items: [''], deadline: '' });
      toast('Padrao criado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleCheckCompliance() {
    setChecking(true);
    try {
      const report = await checkCompliance(selectedAcademy);
      setComplianceReport(report);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setChecking(false);
    }
  }

  function addChecklistItem() {
    setForm({ ...form, checklist_items: [...form.checklist_items, ''] });
  }

  function updateChecklistItem(idx: number, value: string) {
    const items = [...form.checklist_items];
    items[idx] = value;
    setForm({ ...form, checklist_items: items });
  }

  function removeChecklistItem(idx: number) {
    if (form.checklist_items.length <= 1) return;
    setForm({ ...form, checklist_items: form.checklist_items.filter((_, i) => i !== idx) });
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const filteredStandards = filterCategory
    ? standards.filter((s) => s.category === filterCategory)
    : standards;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'standards', label: 'Padroes da Rede' },
    { id: 'compliance', label: 'Verificar Conformidade' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-bb-black">Padronizacao da Rede</h1>
        {tab === 'standards' && <Button onClick={() => setShowCreate(true)}>Novo Padrao</Button>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Standards */}
      {tab === 'standards' && (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${!filterCategory ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
            >
              Todas
            </button>
            {(Object.keys(CATEGORY_LABEL) as StandardCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filterCategory === cat ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
              >
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredStandards.map((std) => (
              <Card key={std.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-bb-black">{std.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLOR[std.category]}`}>
                        {CATEGORY_LABEL[std.category]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bb-gray-500">{std.description}</p>
                  </div>
                  {std.required && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Obrigatorio</span>
                  )}
                </div>

                {/* Checklist */}
                <div className="mt-3 space-y-1">
                  {std.checklist_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className={`h-3.5 w-3.5 rounded border ${item.completed ? 'border-green-500 bg-green-500 text-white' : 'border-bb-gray-300'} flex items-center justify-center`}>
                        {item.completed && <span>&#10003;</span>}
                      </span>
                      <span className={item.completed ? 'text-bb-gray-500 line-through' : 'text-bb-black'}>{item.description}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-bb-gray-500">
                  <span>{std.checklist_items.filter((c) => c.completed).length}/{std.checklist_items.length} itens</span>
                  {std.deadline && <span>Prazo: {new Date(std.deadline).toLocaleDateString('pt-BR')}</span>}
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-bb-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${std.checklist_items.length > 0 ? (std.checklist_items.filter((c) => c.completed).length / std.checklist_items.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Tab: Compliance */}
      {tab === 'compliance' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-bb-black">Verificar Conformidade</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-bb-black">Selecione a Academia</label>
                <select
                  value={selectedAcademy}
                  onChange={(e) => setSelectedAcademy(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                >
                  {ACADEMIES.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCheckCompliance} loading={checking}>Verificar</Button>
            </div>
          </Card>

          {complianceReport && (
            <>
              {/* Overall score */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-bb-gray-500">{complianceReport.academy_name}</p>
                    <p className="text-xs text-bb-gray-500">Verificado em {new Date(complianceReport.checked_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-bb-black">{complianceReport.overall_score}%</p>
                    <p className="text-xs text-bb-gray-500">Conformidade Geral</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-bb-gray-200">
                  <div
                    className={`h-full rounded-full ${complianceReport.overall_score >= 80 ? 'bg-green-500' : complianceReport.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${complianceReport.overall_score}%` }}
                  />
                </div>
              </Card>

              {/* Results */}
              <Card className="overflow-hidden">
                <div className="border-b border-bb-gray-300 p-4">
                  <h2 className="font-semibold text-bb-black">Resultado por Padrao</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                        <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Padrao</th>
                        <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Categoria</th>
                        <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Itens</th>
                        <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Score</th>
                        <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceReport.results.map((r) => (
                        <tr key={r.standard_id} className="border-b border-bb-gray-100">
                          <td className="px-4 py-3 font-medium text-bb-black">{r.standard_name}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLOR[r.category]}`}>
                              {CATEGORY_LABEL[r.category]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-bb-gray-500">{r.completed_items}/{r.total_items}</td>
                          <td className="px-4 py-3 text-center font-bold text-bb-black">{r.score}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COMPLIANCE_COLOR[r.status]}`}>
                              {COMPLIANCE_LABEL[r.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Create Standard Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Padrao da Rede">
        <div className="space-y-3">
          <input
            placeholder="Nome do padrao"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as StandardCategory })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          >
            {(Object.entries(CATEGORY_LABEL) as [StandardCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <textarea
            placeholder="Descricao"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-bb-black">Itens do Checklist</label>
            <div className="mt-1 space-y-2">
              {form.checklist_items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    placeholder={`Item ${idx + 1}`}
                    value={item}
                    onChange={(e) => updateChecklistItem(idx, e.target.value)}
                    className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  />
                  {form.checklist_items.length > 1 && (
                    <button onClick={() => removeChecklistItem(idx)} className="text-xs text-red-500 hover:underline">Remover</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addChecklistItem} className="mt-2 text-xs text-bb-red hover:underline">+ Adicionar Item</button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="rounded border-bb-gray-300"
            />
            <label htmlFor="required" className="text-sm text-bb-black">Obrigatorio</label>
          </div>

          <input
            type="date"
            placeholder="Prazo (opcional)"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />

          <Button className="w-full" onClick={handleCreate} disabled={!form.name}>Criar Padrao</Button>
        </div>
      </Modal>
    </div>
  );
}

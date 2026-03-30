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
import { getMyNetwork, getNetworkUnits, type NetworkUnit } from '@/lib/api/franchise.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { translateError } from '@/lib/utils/error-translator';

const CATEGORY_LABEL: Record<StandardCategory, string> = {
  visual: 'Visual',
  operacional: 'Operacional',
  pedagogico: 'Pedagogico',
  financeiro: 'Financeiro',
  qualidade: 'Qualidade',
};

const CATEGORY_STYLE: Record<StandardCategory, React.CSSProperties> = {
  visual: { background: 'color-mix(in srgb, #8b5cf6 15%, transparent)', color: '#8b5cf6' },
  operacional: { background: 'color-mix(in srgb, var(--bb-brand) 15%, transparent)', color: 'var(--bb-brand)' },
  pedagogico: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' },
  financeiro: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' },
  qualidade: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' },
};

const COMPLIANCE_STYLE: Record<string, React.CSSProperties> = {
  conforme: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' },
  parcial: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' },
  nao_conforme: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' },
  pendente: { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-3)' },
};

const COMPLIANCE_LABEL: Record<string, string> = {
  conforme: 'Conforme',
  parcial: 'Parcial',
  nao_conforme: 'Nao Conforme',
  pendente: 'Pendente',
};

type Tab = 'standards' | 'compliance';

export default function PadroesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [franchiseId, setFranchiseId] = useState('');
  const [academies, setAcademies] = useState<{ id: string; name: string }[]>([]);
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
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [filterCategory, setFilterCategory] = useState<StandardCategory | ''>('');

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const network = await getMyNetwork(profile.id);
        if (!network) return;
        setFranchiseId(network.id);
        const [stds, units] = await Promise.all([
          getStandards(network.id),
          getNetworkUnits(network.id),
        ]);
        setStandards(stds);
        const unitList = units.map((u: NetworkUnit) => ({ id: u.id, name: u.name }));
        setAcademies(unitList);
        if (unitList.length > 0) setSelectedAcademy(unitList[0].id);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate() {
    if (!franchiseId) return;
    try {
      const standard = await createStandard({
        franchise_id: franchiseId,
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
              tab === t.id ? 'text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
            style={tab === t.id ? { background: 'var(--bb-depth-1)' } : undefined}
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
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={CATEGORY_STYLE[std.category]}>
                        {CATEGORY_LABEL[std.category]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bb-gray-500">{std.description}</p>
                  </div>
                  {std.required && (
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' }}>Obrigatorio</span>
                  )}
                </div>

                {/* Checklist */}
                <div className="mt-3 space-y-1">
                  {std.checklist_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className={`h-3.5 w-3.5 rounded border ${item.completed ? 'text-white' : 'border-bb-gray-300'} flex items-center justify-center`} style={item.completed ? { borderColor: 'var(--bb-success)', background: 'var(--bb-success)' } : undefined}>
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
                    className="h-full rounded-full"
                    style={{
                      background: 'var(--bb-success)',
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
                  {academies.map((a) => (
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
                    className="h-full rounded-full"
                    style={{
                      background: complianceReport.overall_score >= 80 ? 'var(--bb-success)' : complianceReport.overall_score >= 60 ? 'var(--bb-warning)' : 'var(--bb-danger)',
                      width: `${complianceReport.overall_score}%`,
                    }}
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
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={CATEGORY_STYLE[r.category]}>
                              {CATEGORY_LABEL[r.category]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-bb-gray-500">{r.completed_items}/{r.total_items}</td>
                          <td className="px-4 py-3 text-center font-bold text-bb-black">{r.score}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={COMPLIANCE_STYLE[r.status]}>
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
                    <button onClick={() => removeChecklistItem(idx)} className="text-xs hover:underline" style={{ color: 'var(--bb-danger)' }}>Remover</button>
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

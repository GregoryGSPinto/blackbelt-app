'use client';

import { useState, useEffect } from 'react';
import { getLeads, getCRMMetrics, updateLeadStatus, createLead } from '@/lib/api/crm.service';
import type { Lead, CRMMetrics } from '@/lib/api/crm.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const PIPELINE_STATUSES = ['lead', 'contatado', 'experimental', 'compareceu', 'matriculou'] as const;
type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

const STATUS_LABEL: Record<string, string> = {
  lead: 'Lead',
  contatado: 'Contatado',
  experimental: 'Experimental',
  compareceu: 'Compareceu',
  matriculou: 'Matriculou',
};

const STATUS_COLOR: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-700',
  contatado: 'bg-yellow-100 text-yellow-700',
  experimental: 'bg-purple-100 text-purple-700',
  compareceu: 'bg-green-100 text-green-700',
  matriculou: 'bg-green-200 text-green-800',
};

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function ComercialPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [saving, setSaving] = useState(false);

  // New lead form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    modality: '',
    origin: 'Instagram',
    status: 'lead',
    notes: '',
    experimental_date: '',
  });

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getLeads(getActiveAcademyId()),
      getCRMMetrics(getActiveAcademyId()),
    ])
      .then(([l, m]) => {
        setLeads(l);
        setMetrics(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(leadId: string, newStatus: string) {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
      );
      toast(`Status atualizado para ${STATUS_LABEL[newStatus] || newStatus}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function advanceStatus(lead: Lead) {
    const currentIdx = PIPELINE_STATUSES.indexOf(lead.status as PipelineStatus);
    if (currentIdx >= 0 && currentIdx < PIPELINE_STATUSES.length - 1) {
      handleStatusChange(lead.id, PIPELINE_STATUSES[currentIdx + 1]);
    }
  }

  async function handleCreateLead() {
    if (!form.name.trim()) {
      toast('Nome é obrigatório', 'error');
      return;
    }
    setSaving(true);
    try {
      const newLead = await createLead({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        modality: form.modality || null,
        origin: form.origin,
        status: 'lead',
        notes: form.notes || null,
        experimental_date: form.experimental_date || null,
      });
      setLeads((prev) => [newLead, ...prev]);
      setShowNewLead(false);
      setForm({ name: '', email: '', phone: '', modality: '', origin: 'Instagram', status: 'lead', notes: '', experimental_date: '' });
      toast('Lead adicionado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <PlanGate module="landing_page">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Comercial — CRM</h1>
        <Button onClick={() => setShowNewLead(true)}>+ Novo Lead</Button>
      </div>

      {/* Metrics Bar */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: 'Leads (mês)', value: metrics.total_leads },
            { label: 'Contatados', value: metrics.contacted },
            { label: 'Experimentais', value: metrics.experimental_scheduled },
            { label: 'Convertidos', value: metrics.converted },
            { label: 'Taxa Conversão', value: `${metrics.conversion_rate}%` },
          ].map((m) => (
            <Card key={m.label} className="p-4">
              <p className="text-xs text-bb-gray-500">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-bb-black">{m.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {PIPELINE_STATUSES.map((status) => {
          const statusLeads = leads.filter((l) => l.status === status);
          return (
            <div key={status}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}>
                  {STATUS_LABEL[status]}
                </span>
                <span className="text-xs font-medium text-bb-gray-500">{statusLeads.length}</span>
              </div>
              <div className="space-y-2">
                {statusLeads.map((lead) => (
                  <Card key={lead.id} className="p-3">
                    <p className="font-medium text-bb-black">{lead.name}</p>
                    <p className="text-xs text-bb-gray-500">
                      {lead.modality ?? '—'} &middot; {lead.origin} &middot; {daysAgo(lead.created_at)} dias
                    </p>
                    {lead.phone && (
                      <p className="text-xs text-bb-gray-500">{lead.phone}</p>
                    )}
                    {lead.referred_by_name && (
                      <p className="text-xs text-bb-red">Indicado por {lead.referred_by_name}</p>
                    )}
                    {lead.experimental_date && (
                      <p className="text-xs text-purple-600">
                        Exp: {new Date(lead.experimental_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {lead.notes && (
                      <p className="mt-1 text-xs italic text-bb-gray-500">{lead.notes}</p>
                    )}

                    {/* Advance button */}
                    {status !== 'matriculou' && (
                      <button
                        onClick={() => advanceStatus(lead)}
                        className="mt-2 w-full rounded border border-bb-gray-200 bg-bb-gray-100 px-2 py-1 text-xs font-medium text-bb-gray-700 hover:bg-bb-gray-200"
                      >
                        Mover para {STATUS_LABEL[PIPELINE_STATUSES[PIPELINE_STATUSES.indexOf(status as PipelineStatus) + 1]]}
                      </button>
                    )}
                    {status === 'matriculou' && (
                      <span className="mt-2 block text-center text-xs font-medium text-green-600">Convertido</span>
                    )}
                  </Card>
                ))}
                {statusLeads.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-bb-gray-200 p-4 text-center text-xs text-bb-gray-500">
                    Nenhum lead
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Lead Modal */}
      <Modal open={showNewLead} onClose={() => setShowNewLead(false)} title="Novo Lead">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bb-black">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none"
              placeholder="Nome completo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bb-black">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bb-black">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bb-black">Modalidade</label>
              <select
                value={form.modality}
                onChange={(e) => setForm({ ...form, modality: e.target.value })}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                <option value="BJJ">BJJ</option>
                <option value="Muay Thai">Muay Thai</option>
                <option value="Judô">Judo</option>
                <option value="Karatê">Karate</option>
                <option value="MMA">MMA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bb-black">Origem</label>
              <select
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Google">Google</option>
                <option value="TikTok">TikTok</option>
                <option value="Indicação">Indicacao</option>
                <option value="Presencial">Presencial</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bb-black">Data Experimental</label>
            <input
              type="datetime-local"
              value={form.experimental_date}
              onChange={(e) => setForm({ ...form, experimental_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bb-black">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none"
              placeholder="Anotações sobre o lead..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowNewLead(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleCreateLead}>
              Salvar Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}

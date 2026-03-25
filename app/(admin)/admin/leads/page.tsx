'use client';

import { useEffect, useState } from 'react';
import { listLeads, updateLeadStatus, type LeadDTO, type LeadStatus } from '@/lib/api/leads.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const STATUS_PIPELINE: LeadStatus[] = ['novo', 'contatado', 'agendado', 'compareceu', 'matriculou', 'desistiu'];
const STATUS_LABEL: Record<LeadStatus, string> = { novo: 'Novo', contatado: 'Contatado', agendado: 'Agendado', compareceu: 'Compareceu', matriculou: 'Matriculou', desistiu: 'Desistiu' };
const STATUS_COLOR: Record<LeadStatus, { background: string; color: string }> = {
  novo: { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  contatado: { background: 'rgba(234,179,8,0.12)', color: '#ca8a04' },
  agendado: { background: 'rgba(168,85,247,0.12)', color: '#9333ea' },
  compareceu: { background: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  matriculou: { background: 'rgba(34,197,94,0.2)', color: '#15803d' },
  desistiu: { background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLeads(getActiveAcademyId()).then(setLeads).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
      toast(`Status atualizado para ${STATUS_LABEL[status]}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  // Kanban view
  const activeStatuses: LeadStatus[] = ['novo', 'contatado', 'agendado', 'compareceu'];

  return (
    <PlanGate module="landing_page">
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Leads — Aulas Experimentais</h1>

      {/* Pipeline Kanban */}
      {leads.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Nenhum lead cadastrado"
          description="Quando novos interessados agendarem aulas experimentais, eles aparecerão aqui no pipeline."
          variant="first-time"
        />
      )}
      <div className="grid grid-cols-4 gap-4">
        {activeStatuses.map((status) => {
          const statusLeads = leads.filter((l) => l.status === status);
          return (
            <div key={status}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</span>
                <span className="text-xs text-bb-gray-500">{statusLeads.length}</span>
              </div>
              <div className="space-y-2">
                {statusLeads.map((lead) => (
                  <Card key={lead.id} className="p-3">
                    <p className="font-medium text-bb-black">{lead.name}</p>
                    <p className="text-xs text-bb-gray-500">{lead.interest}</p>
                    <p className="text-xs text-bb-gray-500">{lead.phone}</p>
                    {lead.referralCode && <p className="text-xs text-bb-primary">Indicação: {lead.referralCode}</p>}
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="mt-2 w-full rounded border border-bb-gray-200 px-2 py-1 text-xs"
                    >
                      {STATUS_PIPELINE.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </PlanGate>
  );
}

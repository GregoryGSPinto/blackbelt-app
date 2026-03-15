'use client';

import { useEffect, useState } from 'react';
import { listLeads, updateLeadStatus, type LeadDTO, type LeadStatus } from '@/lib/api/leads.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const STATUS_PIPELINE: LeadStatus[] = ['novo', 'contatado', 'agendado', 'compareceu', 'matriculou', 'desistiu'];
const STATUS_LABEL: Record<LeadStatus, string> = { novo: 'Novo', contatado: 'Contatado', agendado: 'Agendado', compareceu: 'Compareceu', matriculou: 'Matriculou', desistiu: 'Desistiu' };
const STATUS_COLOR: Record<LeadStatus, string> = { novo: 'bg-blue-100 text-blue-700', contatado: 'bg-yellow-100 text-yellow-700', agendado: 'bg-purple-100 text-purple-700', compareceu: 'bg-green-100 text-green-700', matriculou: 'bg-green-200 text-green-800', desistiu: 'bg-red-100 text-red-700' };

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLeads('academy-1').then(setLeads).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
      toast(`Status atualizado para ${STATUS_LABEL[status]}`, 'success');
    } catch {
      toast('Erro ao atualizar', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  // Kanban view
  const activeStatuses: LeadStatus[] = ['novo', 'contatado', 'agendado', 'compareceu'];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Leads — Aulas Experimentais</h1>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-4 gap-4">
        {activeStatuses.map((status) => {
          const statusLeads = leads.filter((l) => l.status === status);
          return (
            <div key={status}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</span>
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
  );
}

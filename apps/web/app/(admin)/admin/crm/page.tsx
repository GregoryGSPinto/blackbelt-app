'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { getLeads, getCRMMetrics, updateLeadStatus, createLead } from '@/lib/api/crm.service';
import type { Lead, CRMMetrics } from '@/lib/api/crm.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const ETAPAS = [
  { key: 'lead', label: 'Novo', color: '#6b7280' },
  { key: 'contatado', label: 'Contatado', color: '#3b82f6' },
  { key: 'experimental', label: 'Agendou Exp.', color: '#8b5cf6' },
  { key: 'compareceu', label: 'Fez Exp.', color: '#f59e0b' },
  { key: 'matriculou', label: 'Matriculou', color: '#22c55e' },
  { key: 'perdido', label: 'Perdido', color: '#ef4444' },
] as const;

const ORIGENS = ['Indicação', 'Instagram', 'Google', 'Walk-in', 'WhatsApp', 'Site', 'Outro'];

export default function AdminCRMPage() {
  useTheme();
  const { toast } = useToast();
  const academyId = getActiveAcademyId();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNovoLead, setShowNovoLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterOrigem, setFilterOrigem] = useState('');

  // New lead form
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoOrigem, setNovoOrigem] = useState('Instagram');
  const [novoModalidade, setNovoModalidade] = useState('');
  const [novoSaving, setNovoSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [l, m] = await Promise.all([getLeads(academyId), getCRMMetrics(academyId)]);
      setLeads(l);
      setMetrics(m);
    } catch (err) {
      console.error('[AdminCRMPage]', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => { load(); }, [load]);

  async function handleMoverLead(leadId: string, novoStatus: string) {
    await updateLeadStatus(leadId, novoStatus);
    toast('Lead movido!', 'success');
    await load();
  }

  async function handleCriarLead() {
    if (!novoNome.trim() || !novoTelefone.trim()) return;
    setNovoSaving(true);
    await createLead({
      name: novoNome,
      email: novoEmail || null,
      phone: novoTelefone,
      modality: novoModalidade || null,
      origin: novoOrigem,
      status: 'lead',
      notes: null,
      experimental_date: null,
    });
    toast('Lead criado!', 'success');
    setShowNovoLead(false);
    setNovoNome('');
    setNovoTelefone('');
    setNovoEmail('');
    setNovoSaving(false);
    await load();
  }

  const filteredLeads = filterOrigem
    ? leads.filter((l) => l.origin === filterOrigem)
    : leads;

  function leadsByEtapa(etapa: string) {
    return filteredLeads.filter((l) => l.status === etapa);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>CRM / Leads</h1>
        <button
          onClick={() => setShowNovoLead(true)}
          className="rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--bb-brand)' }}
        >
          + Novo Lead
        </button>
      </div>

      {/* Funnel */}
      {metrics && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)' }}>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Funil de Conversão</h2>
          <div className="flex items-end gap-2">
            {[
              { label: 'Leads', value: metrics.total_leads, color: '#6b7280' },
              { label: 'Contatados', value: metrics.contacted, color: '#3b82f6' },
              { label: 'Agendaram', value: metrics.experimental_scheduled, color: '#8b5cf6' },
              { label: 'Vieram', value: metrics.attended, color: '#f59e0b' },
              { label: 'Matricularam', value: metrics.converted, color: '#22c55e' },
            ].map((item) => {
              const maxVal = Math.max(metrics.total_leads, 1);
              const height = Math.max(20, (item.value / maxVal) * 100);
              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                  <div className="w-full rounded-t-lg" style={{ height: `${height}px`, background: item.color }} />
                  <span className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-sm font-bold" style={{ color: '#22c55e' }}>
            Taxa de conversão: {metrics.conversion_rate}%
          </p>
        </div>
      )}

      {/* Filtro por origem */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterOrigem('')}
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: !filterOrigem ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
            color: !filterOrigem ? '#fff' : 'var(--bb-ink-80)',
          }}
        >
          Todos
        </button>
        {ORIGENS.map((o) => (
          <button
            key={o}
            onClick={() => setFilterOrigem(o)}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: filterOrigem === o ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: filterOrigem === o ? '#fff' : 'var(--bb-ink-80)',
            }}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ETAPAS.map((e) => (
            <div key={e.key} className="h-60 animate-pulse rounded-xl" style={{ background: 'var(--bb-depth-3)' }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ETAPAS.map((etapa) => {
            const etapaLeads = leadsByEtapa(etapa.key);
            return (
              <div key={etapa.key} className="rounded-xl p-3" style={{ background: 'var(--bb-depth-3)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: etapa.color }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{etapa.label}</h3>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: `${etapa.color}20`, color: etapa.color }}>
                    {etapaLeads.length}
                  </span>
                </div>
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {etapaLeads.length === 0 && (
                    <p className="py-4 text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>Nenhum lead</p>
                  )}
                  {etapaLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="cursor-pointer rounded-lg p-3 transition-transform hover:scale-[1.02]"
                      style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{lead.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>{lead.phone}</p>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>{lead.origin}</p>

                      {/* Move select */}
                      <select
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMoverLead(lead.id, e.target.value)}
                        className="mt-2 w-full rounded px-2 py-1 text-[11px]"
                        style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
                      >
                        {ETAPAS.map((et) => (
                          <option key={et.key} value={et.key}>{et.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelectedLead(null)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{selectedLead.name}</h3>
            <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              {selectedLead.phone && <p>📱 {selectedLead.phone}</p>}
              {selectedLead.email && <p>📧 {selectedLead.email}</p>}
              {selectedLead.modality && <p>🥋 {selectedLead.modality}</p>}
              <p>📍 Origem: {selectedLead.origin}</p>
              {selectedLead.experimental_date && <p>📅 Experimental: {selectedLead.experimental_date}</p>}
              {selectedLead.notes && (
                <div className="mt-2 rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--bb-ink-60)' }}>Notas:</p>
                  <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{selectedLead.notes}</p>
                </div>
              )}
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Criado em {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
              >
                Fechar
              </button>
              {selectedLead.phone && (
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Olá ${selectedLead.name.split(' ')[0]}! Tudo bem? Vi que você tem interesse em treinar conosco. Posso te ajudar?`);
                    window.open(`https://wa.me/${selectedLead.phone?.replace(/\D/g, '')}?text=${text}`, '_blank');
                  }}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-bold"
                  style={{ background: '#25D36620', color: '#25D366' }}
                >
                  WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Novo Lead modal */}
      {showNovoLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowNovoLead(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Novo Lead</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome *</label>
                <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Telefone *</label>
                <input type="tel" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Email</label>
                <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Origem</label>
                <select value={novoOrigem} onChange={(e) => setNovoOrigem(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}>
                  {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Modalidade</label>
                <input type="text" value={novoModalidade} onChange={(e) => setNovoModalidade(e.target.value)} placeholder="Ex: Jiu-Jitsu" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowNovoLead(false)} className="flex-1 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                Cancelar
              </button>
              <button onClick={handleCriarLead} disabled={!novoNome.trim() || !novoTelefone.trim() || novoSaving} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'var(--bb-brand)' }}>
                {novoSaving ? 'Salvando...' : 'Criar Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { listExperimentais, marcarChegou, marcarNaoVeio, marcarMatriculou } from '@/lib/api/recepcao-experimental.service';
import type { ExperimentalRecepcao, FunnelExperimental } from '@/lib/api/recepcao-experimental.service';
import { PlusIcon, PhoneIcon, ChevronRightIcon } from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';
import { PartyPopper } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────

function getStatusBadge(status: ExperimentalRecepcao['status']): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    agendada: { label: 'Agendada', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    confirmada: { label: 'Confirmada', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    chegou: { label: 'Chegou', bg: 'rgba(16,185,129,0.15)', color: '#059669' },
    nao_veio: { label: 'Nao veio', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    matriculou: { label: 'Matriculou', bg: 'rgba(16,185,129,0.2)', color: '#047857' },
    follow_up: { label: 'Follow-up', bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
    desistiu: { label: 'Desistiu', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  };
  return map[status] ?? { label: status, bg: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' };
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoExperimentaisPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hoje, setHoje] = useState<ExperimentalRecepcao[]>([]);
  const [followUp, setFollowUp] = useState<ExperimentalRecepcao[]>([]);
  const [historico, setHistorico] = useState<ExperimentalRecepcao[]>([]);
  const [funnel, setFunnel] = useState<FunnelExperimental>({ agendadas: 0, vieram: 0, matricularam: 0, conversao: 0 });

  // Agendar modal
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIdade, setFormIdade] = useState('');
  const [formModalidade, setFormModalidade] = useState('');
  const [formTurma, setFormTurma] = useState('');
  const [formData, setFormData] = useState('');
  const [formOrigem, setFormOrigem] = useState('');
  const [formObs, setFormObs] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await listExperimentais();
        if (!cancelled) {
          setHoje(result.hoje);
          setFollowUp(result.followUp);
          setHistorico(result.historico);
          setFunnel(result.funnel);
        }
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function handleChegou(id: string) {
    try {
      await marcarChegou(id);
      setHoje((prev) => prev.map((e) => e.id === id ? { ...e, status: 'chegou' as const } : e));
      toast('Marcado como chegou!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleNaoVeio(id: string) {
    try {
      await marcarNaoVeio(id);
      setHoje((prev) => prev.map((e) => e.id === id ? { ...e, status: 'nao_veio' as const } : e));
      toast('Marcado como nao veio', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleMatriculou(id: string) {
    try {
      await marcarMatriculou(id);
      setHoje((prev) => prev.map((e) => e.id === id ? { ...e, status: 'matriculou' as const } : e));
      toast('Matricula registrada! 🎉', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function handleAgendar() {
    toast('Experimental agendada com sucesso!', 'success');
    setAgendarOpen(false);
    setFormNome(''); setFormTelefone(''); setFormEmail(''); setFormIdade('');
    setFormModalidade(''); setFormTurma(''); setFormData(''); setFormOrigem(''); setFormObs('');
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-16" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 pb-20">
      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Aulas Experimentais</h1>
        <Button size="sm" style={{ background: '#10b981' }} onClick={() => setAgendarOpen(true)}>
          <PlusIcon className="mr-1 h-4 w-4" /> Agendar Nova
        </Button>
      </div>

      {/* ── FUNNEL ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
        <div className="flex flex-col items-center min-w-[4rem]">
          <span className="text-lg font-extrabold" style={{ color: '#3b82f6' }}>{funnel.agendadas}</span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Agendadas</span>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
        <div className="flex flex-col items-center min-w-[4rem]">
          <span className="text-lg font-extrabold" style={{ color: '#10b981' }}>{funnel.vieram}</span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Vieram</span>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
        <div className="flex flex-col items-center min-w-[4rem]">
          <span className="text-lg font-extrabold" style={{ color: '#059669' }}>{funnel.matricularam}</span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Matricularam</span>
        </div>
        <div className="ml-auto flex flex-col items-center min-w-[5rem]">
          <span className="text-lg font-extrabold" style={{ color: '#10b981' }}>{funnel.conversao}%</span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Conversao</span>
        </div>
      </div>

      {/* ── HOJE ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>HOJE</h2>
        <div className="space-y-3">
          {hoje.map((exp) => {
            const badge = getStatusBadge(exp.status);
            return (
              <Card key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>{exp.nome}</p>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" /> {exp.telefone}</span>
                      <span>{exp.email}</span>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {exp.turma} &middot; {exp.horario} &middot; {exp.idade} anos &middot; {exp.origem}
                    </div>
                    {exp.observacoes && (
                      <p className="mt-1 text-xs italic" style={{ color: 'var(--bb-ink-40)' }}>{exp.observacoes}</p>
                    )}
                  </div>
                </div>

                {/* Actions based on status */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(exp.status === 'agendada' || exp.status === 'confirmada') && (
                    <>
                      <Button size="sm" style={{ background: '#10b981' }} onClick={() => handleChegou(exp.id)}>
                        &#10003; Chegou!
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleNaoVeio(exp.id)}>
                        &#10007; Nao veio
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toast('Ligacao iniciada', 'success')}>
                        &#x1F4F1; Ligar
                      </Button>
                    </>
                  )}
                  {exp.status === 'chegou' && (
                    <>
                      <Button size="sm" style={{ background: '#10b981' }} onClick={() => handleMatriculou(exp.id)}>
                        <PartyPopper className="h-4 w-4 mr-1 inline-block" /> Matricular!
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => {
                        setHoje((prev) => prev.map((e) => e.id === exp.id ? { ...e, status: 'follow_up' as const } : e));
                        toast('Follow-up agendado', 'success');
                      }}>
                        &#x1F4C5; Follow-up
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setHoje((prev) => prev.map((e) => e.id === exp.id ? { ...e, status: 'desistiu' as const } : e));
                        toast('Marcado como desistiu', 'success');
                      }}>
                        &#10007; Desistiu
                      </Button>
                    </>
                  )}
                  {exp.status === 'matriculou' && (
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>&#10003; Matriculado!</span>
                  )}
                </div>
              </Card>
            );
          })}
          {hoje.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhuma experimental agendada para hoje
            </p>
          )}
        </div>
      </section>

      {/* ── FOLLOW-UP PENDENTE ────────────────────────────── */}
      {followUp.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>FOLLOW-UP PENDENTE</h2>
          <div className="space-y-2">
            {followUp.map((exp) => {
              const badge = getStatusBadge(exp.status);
              return (
                <Card key={exp.id} style={{ borderLeft: '3px solid #eab308' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{exp.nome}</p>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {exp.modalidade} &middot; Veio em {exp.data} &middot; {exp.telefone}
                      </p>
                      {exp.observacoes && <p className="text-xs italic mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>{exp.observacoes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => toast('Ligacao iniciada', 'success')}>
                        &#x1F4F1;
                      </Button>
                      <Button size="sm" style={{ background: '#10b981' }} onClick={async () => {
                        await marcarMatriculou(exp.id);
                        toast('Redirecionando para cadastro...', 'success');
                        const params = new URLSearchParams({ nome: exp.nome, telefone: exp.telefone, email: exp.email || '', modalidade: exp.modalidade, from: 'experimental' });
                        router.push(`/recepcao/cadastro?${params.toString()}`);
                      }}>
                        Matricular
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── HISTORICO ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>HISTORICO</h2>
        <div className="space-y-1">
          {historico.map((exp) => {
            const badge = getStatusBadge(exp.status);
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{exp.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{exp.modalidade} &middot; {exp.data}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AGENDAR MODAL ─────────────────────────────────── */}
      <Modal open={agendarOpen} onClose={() => setAgendarOpen(false)} title="Agendar Aula Experimental">
        <div className="space-y-3">
          <Input label="Nome" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Nome do visitante" />
          <Input label="Telefone" value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} placeholder="(11) 99999-9999" />
          <Input label="Email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          <Input label="Idade" type="number" value={formIdade} onChange={(e) => setFormIdade(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Modalidade</label>
            <select value={formModalidade} onChange={(e) => setFormModalidade(e.target.value)} className="h-12 w-full rounded-md px-3 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
              <option value="">Selecione</option>
              <option value="bjj">Jiu-Jitsu</option>
              <option value="muay_thai">Muay Thai</option>
              <option value="judo">Judo</option>
              <option value="mma">MMA</option>
            </select>
          </div>
          <Input label="Turma" value={formTurma} onChange={(e) => setFormTurma(e.target.value)} placeholder="Ex: Jiu-Jitsu Iniciante" />
          <Input label="Data" type="date" value={formData} onChange={(e) => setFormData(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Origem</label>
            <select value={formOrigem} onChange={(e) => setFormOrigem(e.target.value)} className="h-12 w-full rounded-md px-3 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
              <option value="">Selecione</option>
              <option value="instagram">Instagram</option>
              <option value="indicacao">Indicacao</option>
              <option value="site">Site</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="walk_in">Walk-in</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Observacoes</label>
            <textarea value={formObs} onChange={(e) => setFormObs(e.target.value)} rows={2} className="w-full rounded-md px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', resize: 'none' }} placeholder="Anotacoes..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAgendarOpen(false)}>Cancelar</Button>
            <Button style={{ background: '#10b981' }} onClick={handleAgendar} disabled={!formNome || !formTelefone}>
              Agendar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { cadastrarRapido, getPlanos, getTurmasDisponiveis } from '@/lib/api/recepcao-cadastro.service';
import type { CadastroRapido, CadastroResult, PlanoResumo, TurmaResumo } from '@/lib/api/recepcao-cadastro.service';
import { CheckIcon } from '@/components/shell/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

// ── Types ──────────────────────────────────────────────────────────

type TabType = 'matricula' | 'experimental' | 'lead';

const MODALIDADES = [
  { id: 'bjj', label: 'BJJ', emoji: '🥋' },
  { id: 'muay_thai', label: 'Muay Thai', emoji: '🥊' },
  { id: 'judo', label: 'Judo', emoji: '🏋️' },
  { id: 'mma', label: 'MMA', emoji: '👊' },
];

// ── Helpers ────────────────────────────────────────────────────────

function calcularIdade(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let age = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) age--;
  return age;
}

function detectarTipo(dataNasc: string): 'adulto' | 'teen' | 'kids' {
  const idade = calcularIdade(dataNasc);
  if (idade < 12) return 'kids';
  if (idade < 18) return 'teen';
  return 'adulto';
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoCadastroPage() {
  const { toast } = useToast();
  const nomeRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('matricula');

  // Data
  const [planos, setPlanos] = useState<PlanoResumo[]>([]);
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  // Matricula wizard
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CadastroResult | null>(null);

  // Form fields
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelParentesco, setResponsavelParentesco] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [planoId, setPlanoId] = useState('');

  // Experimental form
  const [expNome, setExpNome] = useState('');
  const [expTelefone, setExpTelefone] = useState('');
  const [expEmail, setExpEmail] = useState('');
  const [expModalidade, setExpModalidade] = useState('');
  const [expTurma, setExpTurma] = useState('');
  const [expData, setExpData] = useState('');

  // Lead form
  const [leadNome, setLeadNome] = useState('');
  const [leadTelefone, setLeadTelefone] = useState('');
  const [leadModalidade, setLeadModalidade] = useState('');
  const [leadObs, setLeadObs] = useState('');

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [p, t] = await Promise.all([getPlanos(), getTurmasDisponiveis()]);
        if (!cancelled) { setPlanos(p); setTurmas(t); }
      } catch (err) {
        if (!cancelled) toast(translateError(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  useEffect(() => {
    if (!loading && activeTab === 'matricula' && step === 1) {
      nomeRef.current?.focus();
    }
  }, [loading, activeTab, step]);

  const isUnder18 = dataNascimento ? calcularIdade(dataNascimento) < 18 : false;
  const tipoAluno = dataNascimento ? detectarTipo(dataNascimento) : 'adulto';

  // ── Submit handlers ───────────────────────────────────────────────

  async function handleMatricular(_gerarContrato: boolean) {
    setSubmitting(true);
    try {
      const data: CadastroRapido = {
        nome, email, telefone, dataNascimento, cpf: cpf || undefined,
        tipoAluno, modalidadeInteresse: modalidade, turmaId, planoId,
        origem: 'walk_in', tipo: 'matricula',
        ...(isUnder18 ? {
          responsavel: { nome: responsavelNome, email: responsavelEmail, telefone: responsavelTelefone, parentesco: responsavelParentesco },
        } : {}),
      };
      const res = await cadastrarRapido(data);
      setResult(res);
      toast('Aluno cadastrado com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExperimental() {
    setSubmitting(true);
    try {
      await cadastrarRapido({
        nome: expNome, email: expEmail, telefone: expTelefone,
        dataNascimento: '', tipoAluno: 'adulto',
        modalidadeInteresse: expModalidade, turmaId: expTurma,
        origem: 'walk_in', tipo: 'experimental',
      });
      toast('Experimental agendada com sucesso!', 'success');
      setExpNome(''); setExpTelefone(''); setExpEmail(''); setExpModalidade(''); setExpTurma(''); setExpData('');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLead() {
    setSubmitting(true);
    try {
      await cadastrarRapido({
        nome: leadNome, email: '', telefone: leadTelefone,
        dataNascimento: '', tipoAluno: 'adulto',
        modalidadeInteresse: leadModalidade,
        origem: 'walk_in', tipo: 'lead',
      });
      toast('Lead salvo com sucesso!', 'success');
      setLeadNome(''); setLeadTelefone(''); setLeadModalidade(''); setLeadObs('');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-10 w-28" />
          <Skeleton variant="text" className="h-10 w-28" />
          <Skeleton variant="text" className="h-10 w-20" />
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  const selectedPlano = planos.find((p) => p.id === planoId);
  const selectedTurma = turmas.find((t) => t.id === turmaId);

  return (
    <div className="space-y-5 p-4 pb-20">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Cadastro Rapido
      </h1>

      {/* ── TABS ─────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-4)' }}>
        {([
          { key: 'matricula' as TabType, label: 'Matricula' },
          { key: 'experimental' as TabType, label: 'Experimental' },
          { key: 'lead' as TabType, label: 'Lead' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setStep(1); setResult(null); }}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? '#10b981' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MATRICULA TAB ────────────────────────────────── */}
      {activeTab === 'matricula' && !result && (
        <>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: s <= step ? '#10b981' : 'var(--bb-depth-4)',
                    color: s <= step ? '#fff' : 'var(--bb-ink-40)',
                    border: s === step ? '2px solid #059669' : '2px solid transparent',
                  }}
                >
                  {s < step ? <CheckIcon className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div className="h-0.5 w-8" style={{ background: s < step ? '#10b981' : 'var(--bb-glass-border)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1 — Dados Pessoais */}
          {step === 1 && (
            <Card>
              <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Dados Pessoais
              </h2>
              <div className="space-y-3">
                <Input ref={nomeRef} label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do aluno" />
                <Input label="Data de nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                {dataNascimento && (
                  <p className="text-xs font-medium" style={{ color: '#10b981' }}>
                    Tipo detectado: {tipoAluno === 'kids' ? 'Kids' : tipoAluno === 'teen' ? 'Teen' : 'Adulto'} ({calcularIdade(dataNascimento)} anos)
                  </p>
                )}
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
                <Input label="CPF (opcional)" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />

                {isUnder18 && (
                  <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p className="mb-3 text-sm font-semibold" style={{ color: '#059669' }}>Dados do Responsavel (menor de 18)</p>
                    <div className="space-y-3">
                      <Input label="Nome do responsavel" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />
                      <Input label="Email do responsavel" type="email" value={responsavelEmail} onChange={(e) => setResponsavelEmail(e.target.value)} />
                      <Input label="Telefone do responsavel" value={responsavelTelefone} onChange={(e) => setResponsavelTelefone(e.target.value)} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Parentesco</label>
                        <select
                          value={responsavelParentesco}
                          onChange={(e) => setResponsavelParentesco(e.target.value)}
                          className="h-12 w-full rounded-md px-3 text-sm"
                          style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                        >
                          <option value="">Selecione</option>
                          <option value="mae">Mae</option>
                          <option value="pai">Pai</option>
                          <option value="avo">Avo/Avo</option>
                          <option value="tio">Tio/Tia</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  style={{ background: '#10b981' }}
                  onClick={() => setStep(2)}
                  disabled={!nome || !email || !telefone}
                >
                  Proximo
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2 — Modalidade e Turma */}
          {step === 2 && (
            <Card>
              <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Modalidade e Turma
              </h2>

              {/* Modalidade cards */}
              <p className="mb-2 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Modalidade</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MODALIDADES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModalidade(m.id)}
                    className="flex flex-col items-center gap-1 rounded-lg p-3 text-sm font-medium transition-all"
                    style={{
                      background: modalidade === m.id ? 'rgba(16,185,129,0.1)' : 'var(--bb-depth-4)',
                      border: modalidade === m.id ? '2px solid #10b981' : '2px solid transparent',
                      color: modalidade === m.id ? '#059669' : 'var(--bb-ink-60)',
                    }}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Turma selection */}
              <p className="mb-2 mt-4 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Turma</p>
              {turmas.length === 0 && (
                <EmptyState
                  icon="🥋"
                  title="Nenhuma turma disponível"
                  description="Cadastre turmas antes de realizar uma matrícula."
                  variant="first-time"
                />
              )}
              <div className="space-y-2">
                {turmas.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTurmaId(t.id)}
                    className="w-full rounded-lg p-3 text-left transition-all"
                    style={{
                      background: turmaId === t.id ? 'rgba(16,185,129,0.1)' : 'var(--bb-depth-4)',
                      border: turmaId === t.id ? '2px solid #10b981' : '2px solid transparent',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{t.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{t.horario} &middot; {t.professor} &middot; {t.vagas} vagas</p>
                  </button>
                ))}
              </div>

              {/* Plano selection */}
              <p className="mb-2 mt-4 text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Plano</p>
              {planos.length === 0 && (
                <EmptyState
                  icon="📋"
                  title="Nenhum plano disponível"
                  description="Cadastre planos antes de realizar uma matrícula."
                  variant="first-time"
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                {planos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlanoId(p.id)}
                    className="rounded-lg p-3 text-left transition-all"
                    style={{
                      background: planoId === p.id ? 'rgba(16,185,129,0.1)' : 'var(--bb-depth-4)',
                      border: planoId === p.id ? '2px solid #10b981' : '2px solid transparent',
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{p.nome}</p>
                    <p className="text-lg font-extrabold" style={{ color: '#10b981' }}>
                      R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {p.beneficios.map((b, i) => (
                        <li key={i} className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
                <Button
                  style={{ background: '#10b981' }}
                  onClick={() => setStep(3)}
                  disabled={!modalidade || !turmaId || !planoId}
                >
                  Proximo
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3 — Confirmacao */}
          {step === 3 && (
            <Card>
              <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Confirmacao
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Aluno</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{email} &middot; {telefone}</p>
                  <p className="text-xs" style={{ color: '#10b981' }}>{tipoAluno === 'kids' ? 'Kids' : tipoAluno === 'teen' ? 'Teen' : 'Adulto'}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Turma</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{selectedTurma?.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{selectedTurma?.horario}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-4)' }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Plano</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{selectedPlano?.nome}</p>
                  <p className="text-lg font-extrabold" style={{ color: '#10b981' }}>
                    R$ {selectedPlano?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleMatricular(false)} loading={submitting} disabled={submitting}>
                    Cadastrar sem Contrato
                  </Button>
                  <Button style={{ background: '#10b981' }} onClick={() => handleMatricular(true)} loading={submitting} disabled={submitting}>
                    Cadastrar e Gerar Contrato
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── MATRICULA RESULT ─────────────────────────────── */}
      {activeTab === 'matricula' && result && (
        <Card style={{ borderLeft: '3px solid #10b981' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckIcon className="h-5 w-5" style={{ color: '#10b981' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#10b981' }}>Cadastro realizado!</h2>
          </div>
          {result.loginTemporario && (
            <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Login temporario</p>
              <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-100)' }}>{result.loginTemporario.email}</p>
              <p className="text-sm font-mono font-bold" style={{ color: '#10b981' }}>{result.loginTemporario.senhaTemporaria}</p>
            </div>
          )}
          {result.proximaAula && (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Proxima aula: {result.proximaAula.turma} - {result.proximaAula.horario}
            </p>
          )}
          <div className="mt-3">
            <Button style={{ background: '#10b981' }} onClick={() => { setResult(null); setStep(1); setNome(''); setEmail(''); setTelefone(''); setCpf(''); setDataNascimento(''); setModalidade(''); setTurmaId(''); setPlanoId(''); }}>
              Novo Cadastro
            </Button>
          </div>
        </Card>
      )}

      {/* ── EXPERIMENTAL TAB ─────────────────────────────── */}
      {activeTab === 'experimental' && (
        <Card>
          <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Agendar Aula Experimental
          </h2>
          <div className="space-y-3">
            <Input label="Nome" value={expNome} onChange={(e) => setExpNome(e.target.value)} placeholder="Nome do visitante" />
            <Input label="Telefone" value={expTelefone} onChange={(e) => setExpTelefone(e.target.value)} placeholder="(11) 99999-9999" />
            <Input label="Email" type="email" value={expEmail} onChange={(e) => setExpEmail(e.target.value)} placeholder="email@exemplo.com" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Modalidade</label>
              <select
                value={expModalidade}
                onChange={(e) => setExpModalidade(e.target.value)}
                className="h-12 w-full rounded-md px-3 text-sm"
                style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              >
                <option value="">Selecione</option>
                {MODALIDADES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Turma</label>
              <select
                value={expTurma}
                onChange={(e) => setExpTurma(e.target.value)}
                className="h-12 w-full rounded-md px-3 text-sm"
                style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              >
                <option value="">Selecione</option>
                {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome} - {t.horario}</option>)}
              </select>
            </div>
            <Input label="Data" type="date" value={expData} onChange={(e) => setExpData(e.target.value)} />
          </div>
          <div className="mt-4">
            <Button
              style={{ background: '#10b981' }}
              className="w-full"
              onClick={handleExperimental}
              loading={submitting}
              disabled={!expNome || !expTelefone || submitting}
            >
              Agendar Experimental
            </Button>
          </div>
        </Card>
      )}

      {/* ── LEAD TAB ─────────────────────────────────────── */}
      {activeTab === 'lead' && (
        <Card>
          <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Registrar Lead
          </h2>
          <div className="space-y-3">
            <Input label="Nome" value={leadNome} onChange={(e) => setLeadNome(e.target.value)} placeholder="Nome" />
            <Input label="Telefone" value={leadTelefone} onChange={(e) => setLeadTelefone(e.target.value)} placeholder="(11) 99999-9999" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Modalidade</label>
              <select
                value={leadModalidade}
                onChange={(e) => setLeadModalidade(e.target.value)}
                className="h-12 w-full rounded-md px-3 text-sm"
                style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              >
                <option value="">Selecione</option>
                {MODALIDADES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Observacao</label>
              <textarea
                value={leadObs}
                onChange={(e) => setLeadObs(e.target.value)}
                rows={3}
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', resize: 'none' }}
                placeholder="Anotacoes sobre o lead..."
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              style={{ background: '#10b981' }}
              className="w-full"
              onClick={handleLead}
              loading={submitting}
              disabled={!leadNome || !leadTelefone || submitting}
            >
              Salvar Lead
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

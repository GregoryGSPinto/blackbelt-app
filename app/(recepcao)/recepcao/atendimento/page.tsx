'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { buscarAlunoAtendimento, checkinManual, registrarPagamento } from '@/lib/api/recepcao-atendimento.service';
import type { AlunoAtendimento } from '@/lib/api/recepcao-atendimento.service';
import { SearchIcon, PhoneIcon, MailIcon, AlertTriangleIcon } from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ────────────────────────────────────────────────────────

function getBeltLabel(belt: string): string {
  const map: Record<string, string> = {
    white: 'Branca', gray: 'Cinza', yellow: 'Amarela', orange: 'Laranja',
    green: 'Verde', blue: 'Azul', purple: 'Roxa', brown: 'Marrom', black: 'Preta',
  };
  return map[belt] ?? belt;
}

function getBeltColor(belt: string): string {
  const map: Record<string, string> = {
    white: '#f5f5f5', gray: '#9ca3af', yellow: '#eab308', orange: '#f97316',
    green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', brown: '#92400e', black: '#1f2937',
  };
  return map[belt] ?? '#9ca3af';
}

function getTipoLabel(tipo: string): string {
  const map: Record<string, string> = { adulto: 'Adulto', teen: 'Teen', kids: 'Kids' };
  return map[tipo] ?? tipo;
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoAtendimentoPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlunoAtendimento[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Checkin modal
  const [checkinAluno, setCheckinAluno] = useState<AlunoAtendimento | null>(null);
  const [checkinTurma, setCheckinTurma] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Pagamento modal
  const [pagAluno, setPagAluno] = useState<AlunoAtendimento | null>(null);
  const [pagValor, setPagValor] = useState('');
  const [pagMetodo, setPagMetodo] = useState('pix');
  const [pagRef, setPagRef] = useState('');
  const [pagLoading, setPagLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    setSearching(true);
    try {
      const res = await buscarAlunoAtendimento(q);
      setResults(res);
      setSearched(true);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSearching(false);
    }
  }, [toast]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  }

  async function handleCheckin() {
    if (!checkinAluno || !checkinTurma) return;
    setCheckinLoading(true);
    try {
      await checkinManual(checkinAluno.id, checkinTurma);
      toast(`Check-in de ${checkinAluno.nome} realizado!`, 'success');
      setCheckinAluno(null);
      setCheckinTurma('');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handlePagamento() {
    if (!pagAluno) return;
    setPagLoading(true);
    try {
      await registrarPagamento({
        alunoId: pagAluno.id,
        valor: parseFloat(pagValor),
        metodo: pagMetodo,
        referencia: pagRef,
      });
      toast(`Pagamento de ${pagAluno.nome} registrado!`, 'success');
      setPagAluno(null);
      setPagValor('');
      setPagRef('');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setPagLoading(false);
    }
  }

  return (
    <div className="space-y-5 p-4 pb-20">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Atendimento
      </h1>

      {/* ── SEARCH BAR ───────────────────────────────────── */}
      <div className="relative">
        <SearchIcon
          className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2"
          style={{ color: 'var(--bb-ink-40)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar aluno (nome, email, telefone)..."
          className="h-14 w-full rounded-xl pl-13 pr-4 text-base font-medium"
          style={{
            paddingLeft: '3.25rem',
            backgroundColor: 'var(--bb-depth-3)',
            border: '2px solid #10b981',
            borderRadius: 'var(--bb-radius-xl)',
            color: 'var(--bb-ink-100)',
            boxShadow: '0 0 16px rgba(16,185,129,0.1)',
          }}
        />
      </div>

      {/* ── LOADING ──────────────────────────────────────── */}
      {searching && (
        <div className="space-y-3">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      )}

      {/* ── NO RESULTS ───────────────────────────────────── */}
      {searched && !searching && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum aluno encontrado para &quot;{query}&quot;
          </p>
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────── */}
      {!searching && results.map((aluno) => (
        <Card
          key={aluno.id}
          className="relative overflow-hidden"
          style={{
            borderLeft: aluno.alertas.length > 0 ? '3px solid #ef4444' : undefined,
          }}
        >
          {/* Alert banner */}
          {aluno.alertas.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              {aluno.alertas[0]}
            </div>
          )}

          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>{aluno.nome}</p>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ background: `color-mix(in srgb, ${getBeltColor(aluno.faixa)} 15%, transparent)`, color: getBeltColor(aluno.faixa), border: aluno.faixa === 'white' ? '1px solid var(--bb-ink-20)' : undefined }}
            >
              {getBeltLabel(aluno.faixa)}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>
              {getTipoLabel(aluno.tipo)}
            </span>
          </div>

          {/* Contact */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" /> {aluno.telefone}</span>
            <span className="flex items-center gap-1"><MailIcon className="h-3 w-3" /> {aluno.email}</span>
          </div>

          {/* Financial status */}
          <div className="mt-2">
            {aluno.statusFinanceiro === 'em_dia' ? (
              <span className="text-xs font-semibold" style={{ color: '#10b981' }}>Em dia &#10003;</span>
            ) : (
              <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                Atrasado {aluno.diasAtraso} dias &middot; R$ {aluno.valorDevido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            <span>Plano: <strong style={{ color: 'var(--bb-ink-80)' }}>{aluno.plano}</strong></span>
            <span>Vencimento: <strong style={{ color: 'var(--bb-ink-80)' }}>{aluno.proximoVencimento}</strong></span>
            <span>Ultimo check-in: <strong style={{ color: 'var(--bb-ink-80)' }}>{aluno.ultimoCheckin}</strong></span>
            <span>Presencas/mes: <strong style={{ color: 'var(--bb-ink-80)' }}>{aluno.presencasMes}</strong></span>
          </div>

          {/* Turmas */}
          <div className="mt-2 flex flex-wrap gap-1">
            {aluno.turmas.map((t) => (
              <span key={t} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                {t}
              </span>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" style={{ background: '#10b981' }} onClick={() => { setCheckinAluno(aluno); setCheckinTurma(aluno.turmas[0] || ''); }}>
              &#10003; Check-in
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setPagAluno(aluno); setPagValor(aluno.valorDevido?.toString() || ''); }}>
              &#x1F4B3; Pagamento
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast('Funcionalidade de mensagem em desenvolvimento', 'success')}>
              &#x1F4AC; Mensagem
            </Button>
          </div>
        </Card>
      ))}

      {/* ── CHECKIN MODAL ────────────────────────────────── */}
      <Modal open={!!checkinAluno} onClose={() => setCheckinAluno(null)} title={`Check-in: ${checkinAluno?.nome}`}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Turma</label>
            <select
              value={checkinTurma}
              onChange={(e) => setCheckinTurma(e.target.value)}
              className="h-12 w-full rounded-md px-3 text-sm"
              style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            >
              {checkinAluno?.turmas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCheckinAluno(null)}>Cancelar</Button>
            <Button style={{ background: '#10b981' }} onClick={handleCheckin} loading={checkinLoading} disabled={!checkinTurma || checkinLoading}>
              Confirmar Check-in
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── PAGAMENTO MODAL ──────────────────────────────── */}
      <Modal open={!!pagAluno} onClose={() => setPagAluno(null)} title={`Pagamento: ${pagAluno?.nome}`}>
        <div className="space-y-4">
          <Input label="Valor (R$)" type="number" value={pagValor} onChange={(e) => setPagValor(e.target.value)} placeholder="0.00" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Metodo</label>
            <select
              value={pagMetodo}
              onChange={(e) => setPagMetodo(e.target.value)}
              className="h-12 w-full rounded-md px-3 text-sm"
              style={{ backgroundColor: 'var(--bb-depth-5)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            >
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartao Credito</option>
              <option value="cartao_debito">Cartao Debito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>
          <Input label="Referencia" value={pagRef} onChange={(e) => setPagRef(e.target.value)} placeholder="Mensalidade Mar/2026" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPagAluno(null)}>Cancelar</Button>
            <Button style={{ background: '#10b981' }} onClick={handlePagamento} loading={pagLoading} disabled={!pagValor || pagLoading}>
              Registrar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

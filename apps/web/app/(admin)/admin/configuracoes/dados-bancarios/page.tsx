'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isMock } from '@/lib/env';
import { useToast } from '@/lib/hooks/useToast';
import { Skeleton } from '@/components/ui/Skeleton';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { createBrowserClient } from '@/lib/supabase/client';

const BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Economica' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itau' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
  { code: '336', name: 'C6 Bank' },
  { code: '290', name: 'PagBank' },
  { code: '380', name: 'PicPay' },
];

interface BankFormData {
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  birthDate: string;
  companyType: string;
  companyTypeOther: string;
  bankCode: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountDigit: string;
  bankAccountType: string;
}

const COMPANY_TYPES = [
  { value: '', label: 'Selecione (se PJ)' },
  { value: 'MEI', label: 'MEI — Microempreendedor Individual' },
  { value: 'ME', label: 'ME — Microempresa' },
  { value: 'EPP', label: 'EPP — Empresa de Pequeno Porte' },
  { value: 'LIMITED', label: 'LTDA — Sociedade Limitada' },
  { value: 'SA', label: 'S/A — Sociedade Anonima' },
  { value: 'EIRELI', label: 'EIRELI' },
  { value: 'SLU', label: 'SLU — Sociedade Limitada Unipessoal' },
  { value: 'INDIVIDUAL', label: 'Empresa Individual' },
  { value: 'ASSOCIATION', label: 'Associacao' },
  { value: 'COOPERATIVA', label: 'Cooperativa' },
  { value: 'PESSOA_FISICA', label: 'Pessoa Fisica (CPF)' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

interface AcademyBankData {
  bank_account_configured: boolean;
  bank_owner_name: string | null;
  bank_owner_cpf_cnpj: string | null;
  bank_owner_email: string | null;
  bank_owner_phone: string | null;
  bank_code: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  bank_account_digit: string | null;
  bank_account_type: string | null;
  bank_company_type: string | null;
  asaas_subaccount_status: string | null;
}

function maskAccount(val: string | null): string {
  if (!val || val.length < 4) return val || '';
  return '***' + val.slice(-4);
}

export default function DadosBancariosPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<AcademyBankData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BankFormData>({
    name: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    birthDate: '',
    companyType: '',
    companyTypeOther: '',
    bankCode: '',
    bankAgency: '',
    bankAccount: '',
    bankAccountDigit: '',
    bankAccountType: 'CONTA_CORRENTE',
  });

  useEffect(() => {
    async function load() {
      try {
        if (isMock()) {
          setExisting({
            bank_account_configured: false,
            bank_owner_name: null,
            bank_owner_cpf_cnpj: null,
            bank_owner_email: null,
            bank_owner_phone: null,
            bank_code: null,
            bank_agency: null,
            bank_account: null,
            bank_account_digit: null,
            bank_account_type: null,
            bank_company_type: null,
            asaas_subaccount_status: null,
          });
          setLoading(false);
          return;
        }
        const supabase = createBrowserClient();
        const { data } = await supabase
          .from('academies')
          .select('bank_account_configured, bank_owner_name, bank_owner_cpf_cnpj, bank_owner_email, bank_owner_phone, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, bank_company_type, asaas_subaccount_status')
          .eq('id', getActiveAcademyId())
          .single();
        if (data) setExisting(data as AcademyBankData);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  function updateForm(partial: Partial<BankFormData>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.cpfCnpj || !form.email || !form.bankCode || !form.bankAgency || !form.bankAccount || !form.bankAccountDigit) {
      toast('Preencha todos os campos obrigatorios', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isMock()) {
        await new Promise((r) => setTimeout(r, 1500));
        setExisting({
          bank_account_configured: true,
          bank_owner_name: form.name,
          bank_owner_cpf_cnpj: form.cpfCnpj,
          bank_owner_email: form.email,
          bank_owner_phone: form.phone,
          bank_code: form.bankCode,
          bank_agency: form.bankAgency,
          bank_account: form.bankAccount,
          bank_account_digit: form.bankAccountDigit,
          bank_account_type: form.bankAccountType,
          bank_company_type: form.companyType,
          asaas_subaccount_status: 'active',
        });
        setEditing(false);
        toast('Conta configurada com sucesso!', 'success');
        return;
      }

      const res = await fetch('/api/academy/setup-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyId: getActiveAcademyId(),
          ...form,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast(result.error || 'Erro ao configurar conta', 'error');
        return;
      }
      setExisting({
        bank_account_configured: true,
        bank_owner_name: form.name,
        bank_owner_cpf_cnpj: form.cpfCnpj,
        bank_owner_email: form.email,
        bank_owner_phone: form.phone,
        bank_code: form.bankCode,
        bank_agency: form.bankAgency,
        bank_account: form.bankAccount,
        bank_account_digit: form.bankAccountDigit,
        bank_account_type: form.bankAccountType,
        bank_company_type: form.companyType,
        asaas_subaccount_status: 'active',
      });
      setEditing(false);
      toast('Conta configurada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]/30';
  const inputStyle = { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' };
  const labelCls = 'mb-1 block text-sm font-medium';
  const labelStyle = { color: 'var(--bb-ink-80)' };

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  // Already configured — show summary
  if (existing?.bank_account_configured && !editing) {
    const bankName = BANKS.find((b) => b.code === existing.bank_code)?.name || existing.bank_code;
    const statusColors: Record<string, { bg: string; text: string }> = {
      active: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
      pending: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
      rejected: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
      suspended: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
    };
    const sc = statusColors[existing.asaas_subaccount_status || 'pending'] || statusColors.pending;

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Dados Bancarios</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bb-ink-60)' }}>Sua conta para receber pagamentos dos alunos</p>
        </div>

        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Conta configurada</h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: sc.bg, color: sc.text }}
            >
              {existing.asaas_subaccount_status === 'active' ? 'Ativa' : existing.asaas_subaccount_status === 'pending' ? 'Pendente' : existing.asaas_subaccount_status === 'rejected' ? 'Rejeitada' : 'Suspensa'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Titular</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{existing.bank_owner_name}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>CPF/CNPJ</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{maskAccount(existing.bank_owner_cpf_cnpj)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Banco</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{bankName}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Agencia / Conta</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {existing.bank_agency} / {maskAccount(existing.bank_account)}-{existing.bank_account_digit}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
          >
            Atualizar dados bancarios
          </button>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <p className="font-medium" style={{ color: '#22C55E' }}>Conta configurada! Agora voce pode gerar cobrancas para seus alunos.</p>
          <button
            type="button"
            onClick={() => router.push('/admin/financeiro')}
            className="mt-3 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium text-white transition-all hover:opacity-80"
            style={{ background: 'var(--bb-brand)' }}
          >
            Gerar primeira cobranca
          </button>
        </div>
      </div>
    );
  }

  // Form to configure
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Dados Bancarios</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--bb-ink-60)' }}>
          Configure sua conta bancaria para receber mensalidades, matriculas e outras cobrancas diretamente na sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal data */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dados do titular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>Nome completo *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                placeholder="Nome do responsavel"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>CPF ou CNPJ *</label>
              <input
                type="text"
                value={form.cpfCnpj}
                onChange={(e) => updateForm({ cpfCnpj: e.target.value })}
                placeholder="000.000.000-00"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>E-mail *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="email@academia.com"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                placeholder="(31) 99999-9999"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Data de nascimento</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => updateForm({ birthDate: e.target.value })}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Tipo de empresa</label>
              <select
                value={form.companyType}
                onChange={(e) => updateForm({ companyType: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                {COMPANY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {form.companyType === 'OUTRO' && (
                <input
                  type="text"
                  value={form.companyTypeOther}
                  onChange={(e) => updateForm({ companyTypeOther: e.target.value })}
                  placeholder="Especifique o tipo de empresa..."
                  className={`${inputCls} mt-2`}
                  style={inputStyle}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bank data */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>Dados bancarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>Banco *</label>
              <select
                value={form.bankCode}
                onChange={(e) => updateForm({ bankCode: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Selecione o banco</option>
                {BANKS.map((b) => (
                  <option key={b.code} value={b.code}>{b.code} — {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Agencia *</label>
              <input
                type="text"
                value={form.bankAgency}
                onChange={(e) => updateForm({ bankAgency: e.target.value })}
                placeholder="1234"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Conta *</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => updateForm({ bankAccount: e.target.value })}
                placeholder="12345"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Digito *</label>
              <input
                type="text"
                value={form.bankAccountDigit}
                onChange={(e) => updateForm({ bankAccountDigit: e.target.value })}
                placeholder="0"
                maxLength={2}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Tipo de conta</label>
              <select
                value={form.bankAccountType}
                onChange={(e) => updateForm({ bankAccountType: e.target.value })}
                className={inputCls}
                style={inputStyle}
              >
                <option value="CONTA_CORRENTE">Conta Corrente</option>
                <option value="CONTA_POUPANCA">Conta Poupanca</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium"
              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-6 py-2 min-h-[44px] text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--bb-brand)' }}
          >
            {saving ? 'Configurando...' : 'Configurar Recebimento'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  listStudentContracts,
  listAcademyTemplates,
  generateStudentContract,
  sendForSignature,
  getContractMetrics,
  seedSystemTemplate,
  type StudentContract,
  type StudentContractStatus,
  type AcademyContractTemplate,
  type ContractMetrics,
} from '@/lib/api/contracts.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@/components/shell/icons';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { downloadContractPDF } from '@/lib/utils/contract-pdf';

const STATUS_LABEL: Record<StudentContractStatus, string> = {
  draft: 'Rascunho',
  pending_signature: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  renewed: 'Renovado',
};

const STATUS_COLOR: Record<StudentContractStatus, { bg: string; text: string }> = {
  draft: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  pending_signature: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  suspended: { bg: 'rgba(234,88,12,0.15)', text: '#EA580C' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  expired: { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
  renewed: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
};

type TabKey = 'contratos' | 'templates';

export default function ContratosPage() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<StudentContract[]>([]);
  const [templates, setTemplates] = useState<AcademyContractTemplate[]>([]);
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('contratos');
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({
    templateId: '',
    studentName: '',
    studentEmail: '',
    planName: '',
    monthlyValueCents: 15000,
    modalities: '',
  });
  const [showSend, setShowSend] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [preview, setPreview] = useState<StudentContract | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const academyId = getActiveAcademyId();
    Promise.all([
      listStudentContracts(academyId),
      listAcademyTemplates(academyId),
      getContractMetrics(academyId),
    ])
      .then(([c, t, m]) => {
        setContracts(c);
        setTemplates(t);
        setMetrics(m);
        if (t.length > 0) setGenForm((prev) => ({ ...prev, templateId: t[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSeedTemplate() {
    try {
      setSeeding(true);
      const tpl = await seedSystemTemplate(getActiveAcademyId());
      setTemplates((prev) => [tpl, ...prev]);
      setGenForm((prev) => ({ ...prev, templateId: tpl.id }));
      toast('Modelo padrao criado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  async function handleGenerate() {
    try {
      const academyId = getActiveAcademyId();
      const now = new Date();
      const startDate = now.toISOString().split('T')[0];

      const contract = await generateStudentContract(genForm.templateId, {
        academy_id: academyId,
        student_profile_id: `admin-${Date.now()}`,
        student_name: genForm.studentName,
        student_email: genForm.studentEmail || `${genForm.studentName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        plan_name: genForm.planName || 'Plano Mensal',
        monthly_value_cents: genForm.monthlyValueCents,
        payment_day: 10,
        duration_months: 12,
        start_date: startDate,
        modalities: genForm.modalities || 'Jiu-Jitsu',
      });
      setContracts((prev) => [contract, ...prev]);
      setShowGenerate(false);
      setGenForm((prev) => ({
        ...prev,
        studentName: '',
        studentEmail: '',
        planName: '',
        monthlyValueCents: 15000,
        modalities: '',
      }));
      toast('Contrato gerado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSend(contractId: string) {
    try {
      await sendForSignature(contractId);
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? { ...c, status: 'pending_signature' as StudentContractStatus }
            : c,
        ),
      );
      setShowSend(null);
      toast('Contrato enviado para assinatura', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <Skeleton variant="card" className="h-12 w-64" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  const filtered =
    filterStatus === 'all'
      ? contracts
      : contracts.filter((c) => c.status === filterStatus);

  const signatureRate =
    metrics && metrics.total > 0
      ? Math.round((metrics.active / metrics.total) * 100)
      : 0;

  return (
    <PlanGate module="financeiro">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Contratos
          </h1>
          <Button onClick={() => setShowGenerate(true)}>Gerar Contrato</Button>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Ativos',
                value: metrics.active,
                icon: FileTextIcon,
                color: '#3B82F6',
              },
              {
                label: 'Pendentes',
                value: metrics.pending,
                icon: ClockIcon,
                color: '#F59E0B',
              },
              {
                label: 'Taxa Assinatura',
                value: `${signatureRate}%`,
                icon: CheckCircleIcon,
                color: '#10B981',
              },
            ].map((m) => (
              <Card
                key={m.label}
                className="p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${m.color}20` }}
                  >
                    <m.icon
                      className="h-5 w-5"
                      style={{ color: m.color }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {m.label}
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {m.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex gap-1"
          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
        >
          {(['contratos', 'templates'] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: tab === t ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                borderBottom:
                  tab === t
                    ? '2px solid var(--bb-brand)'
                    : '2px solid transparent',
              }}
            >
              {t === 'contratos' ? 'Contratos' : 'Templates'}
            </button>
          ))}
        </div>

        {tab === 'contratos' && (
          <>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'all',
                  'draft',
                  'pending_signature',
                  'active',
                  'suspended',
                  'cancelled',
                  'expired',
                  'renewed',
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    background:
                      filterStatus === s
                        ? 'var(--bb-brand)'
                        : 'var(--bb-depth-3)',
                    color:
                      filterStatus === s ? 'white' : 'var(--bb-ink-60)',
                  }}
                >
                  {s === 'all'
                    ? 'Todos'
                    : STATUS_LABEL[s as StudentContractStatus]}
                </button>
              ))}
            </div>

            <div
              className="overflow-hidden"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: 'var(--bb-depth-3)',
                        borderBottom: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      <th
                        className="px-4 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Aluno
                      </th>
                      <th
                        className="hidden px-4 py-3 text-left text-xs font-medium md:table-cell"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Plano
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Status
                      </th>
                      <th
                        className="hidden px-4 py-3 text-right text-xs font-medium md:table-cell"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Criado em
                      </th>
                      <th
                        className="px-4 py-3 text-right text-xs font-medium"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const statusColors = STATUS_COLOR[c.status];
                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border)',
                          }}
                        >
                          <td className="px-4 py-3">
                            <p
                              className="font-medium"
                              style={{ color: 'var(--bb-ink-100)' }}
                            >
                              {c.student_name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--bb-ink-60)' }}
                            >
                              {c.student_email}
                            </p>
                          </td>
                          <td
                            className="hidden px-4 py-3 text-xs md:table-cell"
                            style={{ color: 'var(--bb-ink-60)' }}
                          >
                            <p>{c.plan_name}</p>
                            <p>
                              {(c.monthly_value_cents / 100).toLocaleString(
                                'pt-BR',
                                { style: 'currency', currency: 'BRL' },
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{
                                background: statusColors.bg,
                                color: statusColors.text,
                              }}
                            >
                              {STATUS_LABEL[c.status]}
                            </span>
                          </td>
                          <td
                            className="hidden px-4 py-3 text-right text-xs md:table-cell"
                            style={{ color: 'var(--bb-ink-60)' }}
                          >
                            {new Date(c.created_at).toLocaleDateString(
                              'pt-BR',
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              <button
                                onClick={() => setPreview(c)}
                                className="rounded px-2 py-1 text-xs font-medium transition-colors"
                                style={{
                                  color: 'var(--bb-ink-60)',
                                  background: 'var(--bb-depth-3)',
                                }}
                                title="Visualizar"
                              >
                                <EyeIcon className="inline h-3.5 w-3.5" />
                              </button>
                              {c.status === 'draft' && (
                                <button
                                  onClick={() => setShowSend(c.id)}
                                  className="rounded px-2 py-1 text-xs font-medium transition-colors"
                                  style={{ color: 'var(--bb-brand)' }}
                                >
                                  Enviar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          Nenhum contrato encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'templates' && (
          <div className="space-y-4">
            {templates.length === 0 && (
              <Card
                className="flex flex-col items-center gap-3 p-8"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  Nenhum modelo de contrato encontrado.
                </p>
                <Button onClick={handleSeedTemplate} disabled={seeding}>
                  {seeding ? 'Criando...' : 'Criar Modelo Padrao'}
                </Button>
              </Card>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className="p-4"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {t.name}
                      </h3>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        Origem: {t.source === 'system' ? 'Sistema' : t.source === 'custom' ? 'Personalizado' : 'Upload'}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        Versao: {t.version}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-ink-60)' }}
                      >
                        Criado em:{' '}
                        {new Date(t.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background: t.is_active
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(107,114,128,0.15)',
                          color: t.is_active ? '#10B981' : '#6B7280',
                        }}
                      >
                        {t.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      {t.is_default && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            background: 'rgba(59,130,246,0.15)',
                            color: '#3B82F6',
                          }}
                        >
                          Padrao
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Generate Modal */}
        <Modal
          open={showGenerate}
          onClose={() => setShowGenerate(false)}
          title="Gerar Contrato"
        >
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Template
              </label>
              <select
                value={genForm.templateId}
                onChange={(e) =>
                  setGenForm({ ...genForm, templateId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Nome do Aluno
              </label>
              <input
                value={genForm.studentName}
                onChange={(e) =>
                  setGenForm({ ...genForm, studentName: e.target.value })
                }
                placeholder="Nome completo"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Email do Aluno
              </label>
              <input
                value={genForm.studentEmail}
                onChange={(e) =>
                  setGenForm({ ...genForm, studentEmail: e.target.value })
                }
                placeholder="aluno@email.com"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Plano
              </label>
              <input
                value={genForm.planName}
                onChange={(e) =>
                  setGenForm({ ...genForm, planName: e.target.value })
                }
                placeholder="Plano Mensal"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Valor Mensal (R$)
              </label>
              <input
                type="number"
                value={genForm.monthlyValueCents / 100}
                onChange={(e) =>
                  setGenForm({
                    ...genForm,
                    monthlyValueCents: Math.round(
                      parseFloat(e.target.value || '0') * 100,
                    ),
                  })
                }
                placeholder="150.00"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Modalidades
              </label>
              <input
                value={genForm.modalities}
                onChange={(e) =>
                  setGenForm({ ...genForm, modalities: e.target.value })
                }
                placeholder="Jiu-Jitsu, Muay Thai"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  borderColor: 'var(--bb-glass-border)',
                }}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!genForm.studentName || !genForm.templateId}
            >
              Gerar
            </Button>
          </div>
        </Modal>

        {/* Send for Signature Modal */}
        <Modal
          open={!!showSend}
          onClose={() => setShowSend(null)}
          title="Enviar para Assinatura"
        >
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              O contrato sera enviado para assinatura digital. O aluno recebera um
              link para assinar.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  if (showSend) handleSend(showSend);
                }}
              >
                Confirmar Envio
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowSend(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Preview Modal */}
        <Modal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={
            preview
              ? `${preview.student_name} — ${preview.plan_name}`
              : ''
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={
                  preview
                    ? {
                        background: STATUS_COLOR[preview.status].bg,
                        color: STATUS_COLOR[preview.status].text,
                      }
                    : {}
                }
              >
                {preview ? STATUS_LABEL[preview.status] : ''}
              </span>
              {preview?.signed_at && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  Assinado em{' '}
                  {new Date(preview.signed_at).toLocaleDateString('pt-BR')}
                </span>
              )}
              {preview?.start_date && preview?.end_date && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  Vigencia:{' '}
                  {new Date(preview.start_date).toLocaleDateString('pt-BR')}{' '}
                  a{' '}
                  {new Date(preview.end_date).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={async () => {
                if (!preview) return;
                setDownloadingPdf(true);
                try {
                  const safeName = preview.student_name
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                  await downloadContractPDF(
                    'contract-content',
                    `contrato-${safeName}.pdf`,
                  );
                  toast('PDF gerado com sucesso', 'success');
                } catch (err) {
                  toast(translateError(err), 'error');
                } finally {
                  setDownloadingPdf(false);
                }
              }}
              disabled={downloadingPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: downloadingPdf ? 'var(--bb-ink-40)' : 'var(--bb-brand)',
                border: 'none',
                borderRadius: 8,
                cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                opacity: downloadingPdf ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {downloadingPdf ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              {downloadingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>

            {/* Contract body with professional document styling */}
            <div
              id="contract-content"
              style={{
                background: 'white',
                color: '#1a1a1a',
                fontFamily: "Georgia, 'Times New Roman', serif",
                padding: '48px 56px',
                maxWidth: '800px',
                margin: '0 auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                lineHeight: '1.8',
              }}
              dangerouslySetInnerHTML={{
                __html: preview?.contract_body_html ?? '',
              }}
            />
            <style>{`
              #contract-content h1 {
                font-size: 22px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0 0 24px 0;
                color: #1a1a1a;
              }
              #contract-content h2 {
                font-size: 16px;
                font-weight: bold;
                margin-top: 24px;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #ccc;
                color: #1a1a1a;
              }
              #contract-content p {
                margin: 8px 0;
                text-align: justify;
                color: #1a1a1a;
              }
              #contract-content strong {
                color: #111;
              }
            `}</style>
            <p
              className="text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Criado em:{' '}
              {preview
                ? new Date(preview.created_at).toLocaleDateString('pt-BR')
                : ''}
            </p>
          </div>
        </Modal>
      </div>
    </PlanGate>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BellRing, CalendarClock, CreditCard, Dumbbell, History, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BillingConfigSection } from '@/components/finance/BillingConfigSection';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { getAdminStudentDetail, type AdminStudentDetail } from '@/lib/api/admin-student-detail.service';
import {
  BILLING_STATUS_COLORS,
  BILLING_STATUS_LABELS,
  BILLING_TYPE_LABELS,
  CHECKIN_GOAL_COLORS,
  CHECKIN_GOAL_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_LABELS,
  formatCentsToBRL,
} from '@/lib/api/student-billing.service';

function paymentStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308', label: 'Pendente' },
    CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Confirmado' },
    RECEIVED: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Recebido' },
    OVERDUE: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Atrasado' },
    REFUNDED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280', label: 'Devolvido' },
    CANCELLED: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280', label: 'Cancelado' },
  };
  return map[status] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)', label: status };
}

export default function AdminStudentProfilePage() {
  const params = useParams();
  const academyId = getActiveAcademyId();
  const rawId = typeof params.id === 'string' ? params.id : '';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminStudentDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!academyId || !rawId) {
      setLoadError('Academia ativa ou aluno não identificado.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const detail = await getAdminStudentDetail(rawId, academyId);
      if (!detail) {
        setLoadError('Aluno não encontrado para a academia ativa.');
        setData(null);
        return;
      }
      setData(detail);
    } catch (error) {
      setLoadError(translateError(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [academyId, rawId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-6 w-52" />
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-56" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/admin/alunos" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para alunos
        </Link>
        <Card className="p-6">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Detalhe do aluno indisponível
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {loadError ?? 'Não foi possível carregar o aluno.'}
          </p>
        </Card>
      </div>
    );
  }

  const financial = data.financial_profile;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/alunos" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para alunos
        </Link>
        <button
          onClick={() => {
            load().catch(() => {});
            toast('Dados atualizados.', 'success');
          }}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          Atualizar
        </button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {data.display_name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <span>{data.email || 'Sem email'}</span>
              <span>{data.phone || 'Sem telefone'}</span>
              <span>Faixa {data.belt}</span>
              <span>Treina desde {new Date(data.started_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)' }}>
              Student ID: {data.student_id}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)' }}>
              Profile ID: {data.profile_id}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)' }}>
              Membership ID: {data.membership_id}
            </span>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Resumo financeiro real
            </h2>
          </div>

          {!financial ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Este aluno ainda não possui configuração financeira cadastrada.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Vínculo</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {BILLING_TYPE_LABELS[financial.financial_model]}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Cobrança</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {PAYMENT_METHOD_LABELS[financial.payment_method_default]}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Recorrência</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {RECURRENCE_LABELS[financial.recurrence]}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Valor líquido</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatCentsToBRL(Math.max(financial.amount_cents - financial.discount_amount_cents, 0))}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Próximo vencimento</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {financial.next_due_date ? new Date(`${financial.next_due_date}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem vencimento'}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Status financeiro</p>
                  <span className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: BILLING_STATUS_COLORS[financial.financial_status].bg, color: BILLING_STATUS_COLORS[financial.financial_status].text }}>
                    {BILLING_STATUS_LABELS[financial.financial_status]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Dumbbell className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Frequência e meta externa
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Presenças totais</p>
              <p className="mt-1 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{data.attendance_total}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Presenças no mês</p>
              <p className="mt-1 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{data.attendance_this_month}</p>
            </div>
            <div className="rounded-xl p-4 sm:col-span-2" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Última presença</p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {data.last_attendance_at ? new Date(data.last_attendance_at).toLocaleString('pt-BR') : 'Nenhuma presença registrada'}
              </p>
            </div>
            {financial && (financial.financial_model === 'gympass' || financial.financial_model === 'totalpass') && (
              <div className="rounded-xl p-4 sm:col-span-2" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Meta de check-ins</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {financial.current_month_checkins}/{financial.monthly_checkin_minimum} no mês
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: CHECKIN_GOAL_COLORS[financial.checkin_goal_status].bg, color: CHECKIN_GOAL_COLORS[financial.checkin_goal_status].text }}>
                    {CHECKIN_GOAL_LABELS[financial.checkin_goal_status]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      <BillingConfigSection
        membershipId={data.membership_id}
        profileId={data.profile_id}
        academyId={academyId}
        onSave={() => {
          load().catch(() => {});
        }}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Histórico financeiro real
            </h2>
          </div>
          {data.payment_history.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma cobrança registrada para este aluno.
            </p>
          ) : (
            <div className="space-y-2">
              {data.payment_history.map((payment) => {
                const style = paymentStatusStyle(payment.status);
                return (
                  <div
                    key={payment.id}
                    className="grid gap-3 rounded-xl p-4 md:grid-cols-[1.1fr,0.9fr,0.9fr,0.9fr]"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {payment.reference_month ?? 'Sem referência'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {payment.payment_method ?? 'Sem método definido'}
                      </p>
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {formatCentsToBRL(payment.amount)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                      {new Date(`${payment.due_date}T00:00:00`).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: style.bg, color: style.text }}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <BellRing className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Alertas enviados
            </h2>
          </div>
          {data.alerts.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhum alerta financeiro/check-in registrado para este aluno.
            </p>
          ) : (
            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {alert.alert_kind === 'checkin_goal' ? 'Meta de check-ins' : 'Status financeiro'}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {alert.message || 'Sem mensagem detalhada'}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)' }}>
                      {alert.recipient_type}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {new Date(alert.sent_at).toLocaleString('pt-BR')}</span>
                    <span>Canal: {alert.channel}</span>
                    <span>Status: {alert.status}</span>
                    {typeof alert.remaining_checkins === 'number' && <span>Faltando: {alert.remaining_checkins}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Contexto operacional
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Turmas ativas</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              {data.turmas.length > 0 ? data.turmas.join(', ') : 'Nenhuma turma ativa'}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Papel na academia</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              {data.role}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

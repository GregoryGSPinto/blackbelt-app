import { describe, expect, it } from 'vitest';
import {
  computeCheckinGoalStatus,
  computeFinancialStatus,
  computeNextDueDate,
  shouldSendCheckinAlert,
  validateFinancialProfileInput,
} from '@/lib/domain/student-financial';

describe('student-financial domain', () => {
  it('calcula status financeiro atrasado', () => {
    const status = computeFinancialStatus({
      financialModel: 'particular',
      amountCents: 15000,
      nextDueDate: '2026-03-10',
      referenceDate: new Date('2026-03-31T12:00:00Z'),
    });

    expect(status).toBe('atrasado');
  });

  it('trata cortesia como isento', () => {
    const status = computeFinancialStatus({
      financialModel: 'cortesia',
      amountCents: 0,
      nextDueDate: null,
      referenceDate: new Date('2026-03-31T12:00:00Z'),
    });

    expect(status).toBe('isento');
  });

  it('calcula proximo vencimento mensal respeitando o dia informado', () => {
    expect(computeNextDueDate('monthly', 10, new Date('2026-03-31T12:00:00Z'))).toBe('2026-04-10');
  });

  it('marca meta externa como risco quando faltam check-ins demais para poucos dias', () => {
    const status = computeCheckinGoalStatus({
      financialModel: 'gympass',
      currentMonthCheckins: 3,
      monthlyCheckinMinimum: 8,
      referenceDate: new Date('2026-03-29T12:00:00Z'),
    });

    expect(status).toBe('risk');
  });

  it('evita alerta duplicado no mesmo dia', () => {
    const shouldSend = shouldSendCheckinAlert({
      financialModel: 'totalpass',
      checkinGoalStatus: 'attention',
      alertDaysBeforeMonthEnd: 5,
      lastAlertSentAt: '2026-03-31T09:15:00Z',
      referenceDate: new Date('2026-03-31T18:00:00Z'),
    });

    expect(shouldSend).toBe(false);
  });

  it('normaliza e limita os campos de entrada', () => {
    const normalized = validateFinancialProfileInput({
      financial_model: 'bolsista',
      charge_mode: 'manual',
      payment_method_default: 'pix',
      recurrence: 'monthly',
      amount_cents: 15000,
      discount_amount_cents: 99999,
      scholarship_percent: 140,
      due_day: 45,
      next_due_date: '',
      notes: '  teste  ',
      monthly_checkin_minimum: -2,
      alert_days_before_month_end: 30,
      partnership_name: '',
      partnership_transfer_mode: '',
      exemption_reason: '',
      period_start_date: '',
      period_end_date: '',
    });

    expect(normalized.discount_amount_cents).toBe(15000);
    expect(normalized.scholarship_percent).toBe(100);
    expect(normalized.due_day).toBe(31);
    expect(normalized.monthly_checkin_minimum).toBe(0);
    expect(normalized.alert_days_before_month_end).toBe(15);
    expect(normalized.next_due_date).toBeNull();
  });
});

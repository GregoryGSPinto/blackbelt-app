import { describe, expect, it } from 'vitest';
import { decideAutomaticCheckinAlert } from '@/lib/server/student-financial-alerts';

describe('student-financial-alerts.service', () => {
  it('dispara para teen gympass abaixo da meta na janela', () => {
    const result = decideAutomaticCheckinAlert({
      academyId: 'academy-1',
      membershipId: 'm-1',
      profileId: 'p-1',
      financialModel: 'gympass',
      role: 'aluno_teen',
      currentMonthCheckins: 5,
      monthlyCheckinMinimum: 8,
      alertDaysBeforeMonthEnd: 4,
      lastAlertSentAt: null,
      referenceDate: new Date('2026-03-29T12:00:00Z'),
    });

    expect(result.shouldSend).toBe(true);
    expect(result.checkinGoalStatus).toBe('risk');
    expect(result.recipients).toEqual(['student', 'owner']);
  });

  it('dispara para teen totalpass em risco', () => {
    const result = decideAutomaticCheckinAlert({
      academyId: 'academy-1',
      membershipId: 'm-2',
      profileId: 'p-2',
      financialModel: 'totalpass',
      role: 'aluno_teen',
      currentMonthCheckins: 4,
      monthlyCheckinMinimum: 10,
      alertDaysBeforeMonthEnd: 5,
      lastAlertSentAt: null,
      referenceDate: new Date('2026-03-30T12:00:00Z'),
    });

    expect(result.shouldSend).toBe(true);
    expect(result.checkinGoalStatus).toBe('risk');
    expect(result.recipients).toEqual(['student', 'owner']);
  });

  it('direciona kids para responsável quando aplicável', () => {
    const result = decideAutomaticCheckinAlert({
      academyId: 'academy-1',
      membershipId: 'm-3',
      profileId: 'p-3',
      financialModel: 'gympass',
      role: 'aluno_kids',
      currentMonthCheckins: 2,
      monthlyCheckinMinimum: 8,
      alertDaysBeforeMonthEnd: 5,
      lastAlertSentAt: null,
      referenceDate: new Date('2026-03-30T12:00:00Z'),
    });

    expect(result.shouldSend).toBe(true);
    expect(result.recipients).toEqual(['guardian', 'owner']);
  });

  it('nao duplica alerta no mesmo dia', () => {
    const result = decideAutomaticCheckinAlert({
      academyId: 'academy-1',
      membershipId: 'm-4',
      profileId: 'p-4',
      financialModel: 'gympass',
      role: 'aluno_teen',
      currentMonthCheckins: 4,
      monthlyCheckinMinimum: 8,
      alertDaysBeforeMonthEnd: 5,
      lastAlertSentAt: '2026-03-30T09:00:00Z',
      referenceDate: new Date('2026-03-30T18:00:00Z'),
    });

    expect(result.shouldSend).toBe(false);
  });

  it('fora da janela nao dispara', () => {
    const result = decideAutomaticCheckinAlert({
      academyId: 'academy-1',
      membershipId: 'm-5',
      profileId: 'p-5',
      financialModel: 'gympass',
      role: 'aluno_adulto',
      currentMonthCheckins: 1,
      monthlyCheckinMinimum: 8,
      alertDaysBeforeMonthEnd: 5,
      lastAlertSentAt: null,
      referenceDate: new Date('2026-03-10T12:00:00Z'),
    });

    expect(result.shouldSend).toBe(false);
  });
});

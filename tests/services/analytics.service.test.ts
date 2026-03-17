import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock env
vi.mock('@/lib/env', () => ({ isMock: () => true }));

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar overview com dados de 12 meses', async () => {
    const { getAnalyticsOverview } = await import('@/lib/api/analytics.service');
    const overview = await getAnalyticsOverview('academy-1');
    expect(overview.studentsTimeline).toHaveLength(12);
    expect(overview.revenueTimeline).toHaveLength(12);
    expect(overview.retentionTimeline).toHaveLength(12);
    expect(overview.comparison.currentMonth.students).toBe(172);
  });

  it('deve retornar professor analytics ordenados', async () => {
    const { getProfessorPerformance } = await import('@/lib/api/analytics.service');
    const profs = await getProfessorPerformance('academy-1');
    expect(profs.length).toBeGreaterThan(0);
    expect(profs[0]).toHaveProperty('professor_name');
    expect(profs[0]).toHaveProperty('retention_rate');
  });

  it('deve retornar previsões de churn com scores ordenados', async () => {
    const { getChurnPredictions } = await import('@/lib/api/analytics.service');
    const predictions = await getChurnPredictions('academy-1');
    expect(predictions.length).toBeGreaterThan(0);
    // Should be sorted by score descending
    for (let i = 1; i < predictions.length; i++) {
      expect(predictions[i - 1].score).toBeGreaterThanOrEqual(predictions[i].score);
    }
  });

  it('deve classificar risco corretamente', async () => {
    const { getChurnPredictions } = await import('@/lib/api/analytics.service');
    const predictions = await getChurnPredictions('academy-1');
    for (const pred of predictions) {
      if (pred.score < 30) expect(pred.risk).toBe('low');
      else if (pred.score < 60) expect(pred.risk).toBe('medium');
      else if (pred.score < 80) expect(pred.risk).toBe('high');
      else expect(pred.risk).toBe('critical');
    }
  });

  it('deve retornar student analytics com histórico', async () => {
    const { getStudentAnalytics } = await import('@/lib/api/analytics.service');
    const analytics = await getStudentAnalytics('student-1');
    expect(analytics.attendanceHistory.length).toBeGreaterThan(0);
    expect(analytics.quizScores.length).toBeGreaterThan(0);
    expect(analytics.comparisonWithAvg).toHaveProperty('attendance');
  });
});

import { describe, expect, it } from 'vitest';
import {
  scoreAuthFailures,
  scoreErrorRate,
  scoreLatency,
  scoreRisk,
  scoreSecurity,
  summarizeStatuses,
} from '@/lib/platform/scoring';

describe('platform central scoring', () => {
  it('classifica taxa de erro corretamente', () => {
    expect(scoreErrorRate(1.2)).toBe('healthy');
    expect(scoreErrorRate(3.6)).toBe('warning');
    expect(scoreErrorRate(8.1)).toBe('critical');
  });

  it('classifica latência e auth failures corretamente', () => {
    expect(scoreLatency(800)).toBe('healthy');
    expect(scoreLatency(1800)).toBe('warning');
    expect(scoreLatency(3200)).toBe('critical');
    expect(scoreAuthFailures(2)).toBe('healthy');
    expect(scoreAuthFailures(12)).toBe('warning');
    expect(scoreAuthFailures(30)).toBe('critical');
  });

  it('classifica risco e segurança com direção oposta', () => {
    expect(scoreRisk(20)).toBe('healthy');
    expect(scoreRisk(50)).toBe('warning');
    expect(scoreRisk(92)).toBe('critical');
    expect(scoreSecurity(90)).toBe('healthy');
    expect(scoreSecurity(70)).toBe('warning');
    expect(scoreSecurity(40)).toBe('critical');
  });

  it('resume estados com prioridade para o pior caso', () => {
    expect(summarizeStatuses(['healthy', 'warning'])).toBe('warning');
    expect(summarizeStatuses(['healthy', 'critical'])).toBe('critical');
    expect(summarizeStatuses(['not_configured'])).toBe('not_configured');
  });
});

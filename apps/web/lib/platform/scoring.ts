import { PLATFORM_THRESHOLDS, type ThresholdStatus } from '@/lib/platform/thresholds';

function compareDescending(value: number | null | undefined, healthyMax: number, warningMax: number): ThresholdStatus {
  if (value == null || Number.isNaN(value)) return 'unknown';
  if (value <= healthyMax) return 'healthy';
  if (value <= warningMax) return 'warning';
  return 'critical';
}

function compareAscending(value: number | null | undefined, healthyMin: number, warningMin: number): ThresholdStatus {
  if (value == null || Number.isNaN(value)) return 'unknown';
  if (value >= healthyMin) return 'healthy';
  if (value >= warningMin) return 'warning';
  return 'critical';
}

export function scoreErrorRate(errorRatePercent: number | null | undefined): ThresholdStatus {
  return compareDescending(
    errorRatePercent,
    PLATFORM_THRESHOLDS.errorRatePercent.healthy,
    PLATFORM_THRESHOLDS.errorRatePercent.warning,
  );
}

export function scoreLatency(avgLatencyMs: number | null | undefined): ThresholdStatus {
  return compareDescending(
    avgLatencyMs,
    PLATFORM_THRESHOLDS.avgLatencyMs.healthy,
    PLATFORM_THRESHOLDS.avgLatencyMs.warning,
  );
}

export function scoreRisk(riskScore: number | null | undefined): ThresholdStatus {
  return compareDescending(
    riskScore,
    PLATFORM_THRESHOLDS.riskScore.healthy,
    PLATFORM_THRESHOLDS.riskScore.warning,
  );
}

export function scoreSecurity(securityScore: number | null | undefined): ThresholdStatus {
  return compareAscending(
    securityScore,
    PLATFORM_THRESHOLDS.securityScore.healthy,
    PLATFORM_THRESHOLDS.securityScore.warning,
  );
}

export function scoreUx(uxScore: number | null | undefined): ThresholdStatus {
  return compareAscending(
    uxScore,
    PLATFORM_THRESHOLDS.uxScore.healthy,
    PLATFORM_THRESHOLDS.uxScore.warning,
  );
}

export function scoreLayoutRisk(layoutRiskScore: number | null | undefined): ThresholdStatus {
  return compareDescending(
    layoutRiskScore,
    PLATFORM_THRESHOLDS.layoutRiskScore.healthy,
    PLATFORM_THRESHOLDS.layoutRiskScore.warning,
  );
}

export function scoreAuthFailures(authFailures: number | null | undefined): ThresholdStatus {
  return compareDescending(
    authFailures,
    PLATFORM_THRESHOLDS.authFailures.healthy,
    PLATFORM_THRESHOLDS.authFailures.warning,
  );
}

export function scoreReleaseRegression(releaseRegressionPercent: number | null | undefined): ThresholdStatus {
  return compareDescending(
    releaseRegressionPercent,
    PLATFORM_THRESHOLDS.releaseRegressionPercent.healthy,
    PLATFORM_THRESHOLDS.releaseRegressionPercent.warning,
  );
}

export function scoreConsecutiveFailures(consecutiveFailures: number | null | undefined): ThresholdStatus {
  return compareDescending(
    consecutiveFailures,
    PLATFORM_THRESHOLDS.consecutiveFailures.healthy,
    PLATFORM_THRESHOLDS.consecutiveFailures.warning,
  );
}

export function summarizeStatuses(statuses: ThresholdStatus[]): ThresholdStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  if (statuses.includes('healthy')) return 'healthy';
  if (statuses.includes('not_configured')) return 'not_configured';
  return 'unknown';
}

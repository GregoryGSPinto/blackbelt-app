export const PLATFORM_THRESHOLDS = {
  errorRatePercent: {
    healthy: 2,
    warning: 5,
  },
  avgLatencyMs: {
    healthy: 1200,
    warning: 2200,
  },
  riskScore: {
    healthy: 35,
    warning: 65,
  },
  securityScore: {
    healthy: 80,
    warning: 60,
  },
  uxScore: {
    healthy: 80,
    warning: 60,
  },
  layoutRiskScore: {
    healthy: 35,
    warning: 70,
  },
  authFailures: {
    healthy: 5,
    warning: 20,
  },
  releaseRegressionPercent: {
    healthy: 10,
    warning: 25,
  },
  consecutiveFailures: {
    healthy: 0,
    warning: 2,
  },
} as const;

export type ThresholdStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'not_configured';

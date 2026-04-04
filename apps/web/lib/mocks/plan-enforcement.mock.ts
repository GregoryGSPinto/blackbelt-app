import type { LimitCheckResult, UsageData, PlanResource } from '@/lib/api/plan-enforcement.service';

const MOCK_USAGE = {
  students_active: 18,
  units: 1,
  classes: 2,
};

export function mockCheckLimit(_academyId: string, resource: PlanResource): LimitCheckResult {
  const currentValues: Record<string, number> = {
    students_active: MOCK_USAGE.students_active,
    units: MOCK_USAGE.units,
    classes: MOCK_USAGE.classes,
    reports: 0,
    automations: 0,
    content: 0,
    api_access: 0,
    white_label: 0,
    custom_domain: 0,
  };

  const limits: Record<string, number | null> = {
    students_active: 30,
    units: 1,
    classes: 3,
    reports: null,
    automations: null,
    content: null,
    api_access: null,
    white_label: null,
    custom_domain: null,
  };

  const booleanResources = ['reports', 'automations', 'content', 'api_access', 'white_label', 'custom_domain'];
  const isBoolLimit = booleanResources.includes(resource);

  return {
    allowed: isBoolLimit ? false : (currentValues[resource] ?? 0) < (limits[resource] ?? 999),
    current: currentValues[resource] ?? 0,
    limit: limits[resource],
    plan: 'free',
    resource,
  };
}

export function mockGetUsage(_academyId: string): UsageData {
  return {
    plan: 'free',
    students_active: MOCK_USAGE.students_active,
    units: MOCK_USAGE.units,
    classes: MOCK_USAGE.classes,
    usage_percent: Math.round((MOCK_USAGE.students_active / 30) * 100),
  };
}

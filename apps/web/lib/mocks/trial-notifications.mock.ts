import type { TrialNotificationSummary } from '@/lib/api/trial-notifications.service';

export function mockProcessTrialNotifications(
  _academyId: string,
): TrialNotificationSummary {
  return {
    processed: 5,
    sent: 3,
    failed: 0,
    skipped: 2,
    results: [
      {
        type: 'welcome',
        studentId: 'trial-001',
        studentName: 'Lucas Almeida',
        phone: '5511999990001',
        sent: true,
      },
      {
        type: 'day3_reminder',
        studentId: 'trial-003',
        studentName: 'Camila Ferreira',
        phone: '5511999990003',
        sent: true,
      },
      {
        type: 'expiry_warning',
        studentId: 'trial-005',
        studentName: 'Pedro Santos',
        phone: '5511999990005',
        sent: true,
      },
    ],
  };
}

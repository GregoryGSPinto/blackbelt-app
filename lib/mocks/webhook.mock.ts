import type { WebhookConfig, WebhookDelivery, CreateWebhookPayload } from '@/lib/types/webhook';

const WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1',
    academyId: 'academy-1',
    url: 'https://api.erp.example.com/webhooks/blackbelt',
    events: ['new_student', 'payment'],
    secret: 'whsec_test_123456',
    active: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'wh-2',
    academyId: 'academy-1',
    url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
    events: ['check_in', 'belt_promotion'],
    secret: 'whsec_test_789012',
    active: true,
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'wh-3',
    academyId: 'academy-1',
    url: 'https://internal.academy.com/api/sync',
    events: ['new_student', 'check_in', 'payment', 'belt_promotion'],
    secret: 'whsec_test_345678',
    active: false,
    createdAt: '2026-03-01T00:00:00Z',
  },
];

export function mockListWebhooks(_academyId: string): WebhookConfig[] {
  return WEBHOOKS;
}

export function mockCreateWebhook(
  academyId: string,
  payload: CreateWebhookPayload,
): WebhookConfig {
  return {
    id: `wh-${Date.now()}`,
    academyId,
    url: payload.url,
    events: payload.events,
    secret: payload.secret || `whsec_${Math.random().toString(36).slice(2, 14)}`,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export function mockWebhookDeliveries(
  webhookId: string,
  limit: number,
): WebhookDelivery[] {
  const deliveries: WebhookDelivery[] = [
    {
      id: 'del-1',
      webhookId,
      event: 'new_student',
      payload: { student_id: 's-1', name: 'Lucas Ferreira', email: 'lucas@email.com' },
      statusCode: 200,
      responseBody: '{"ok":true}',
      attempts: 1,
      success: true,
      deliveredAt: '2026-03-17T15:30:00Z',
    },
    {
      id: 'del-2',
      webhookId,
      event: 'payment',
      payload: { student_id: 's-2', amount: 197, status: 'paid' },
      statusCode: 200,
      responseBody: '{"received":true}',
      attempts: 1,
      success: true,
      deliveredAt: '2026-03-17T14:00:00Z',
    },
    {
      id: 'del-3',
      webhookId,
      event: 'check_in',
      payload: { student_id: 's-3', class: 'BJJ Fundamentos', time: '19:02' },
      statusCode: 500,
      responseBody: 'Internal Server Error',
      attempts: 3,
      success: false,
      deliveredAt: '2026-03-17T12:00:00Z',
    },
    {
      id: 'del-4',
      webhookId,
      event: 'belt_promotion',
      payload: { student_id: 's-4', from: 'white', to: 'blue' },
      statusCode: 200,
      responseBody: '{"ok":true}',
      attempts: 1,
      success: true,
      deliveredAt: '2026-03-16T10:00:00Z',
    },
  ];

  return deliveries.slice(0, limit);
}

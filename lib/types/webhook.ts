// ── Webhook types (P-060) ─────────────────────────────────────

export type WebhookEvent =
  | 'new_student'
  | 'check_in'
  | 'payment'
  | 'belt_promotion'
  | 'class_created'
  | 'student_deactivated';

export interface WebhookConfig {
  id: string;
  academyId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  attempts: number;
  success: boolean;
  deliveredAt: string;
}

export interface CreateWebhookPayload {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

import type { WebhookEvent, WebhookLog } from '@/lib/types/payment';
import { logger } from '@/lib/monitoring/logger';

// In-memory processed webhook IDs for idempotency (in production, use DB)
const processedWebhooks = new Set<string>();

export async function processPaymentWebhook(event: WebhookEvent): Promise<WebhookLog> {
  const log: WebhookLog = {
    id: `log_${Date.now()}`,
    eventType: event.type,
    gateway: event.gateway,
    externalId: event.externalId,
    status: 'processed',
    receivedAt: event.receivedAt,
  };

  // Idempotency check
  if (processedWebhooks.has(event.id)) {
    logger.info('Duplicate webhook ignored', { webhookId: event.id });
    log.status = 'ignored';
    return log;
  }

  try {
    switch (event.type) {
      case 'payment.confirmed':
        await handlePaymentConfirmed(event);
        break;
      case 'payment.overdue':
        await handlePaymentOverdue(event);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(event);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      case 'subscription.renewed':
        await handleSubscriptionRenewed(event);
        break;
      default:
        logger.warn('Unknown webhook event type', { type: event.type });
        log.status = 'ignored';
    }

    processedWebhooks.add(event.id);
    logger.info('Webhook processed', { webhookId: event.id, type: event.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Webhook processing failed', { webhookId: event.id, error: message });
    log.status = 'failed';
    log.error = message;
  }

  return log;
}

async function handlePaymentConfirmed(event: WebhookEvent): Promise<void> {
  logger.info('Payment confirmed', { externalId: event.externalId, gateway: event.gateway });
  // In production: update Invoice status to 'paid', update Subscription status
  // Notify student: "Pagamento confirmado"
}

async function handlePaymentOverdue(event: WebhookEvent): Promise<void> {
  logger.info('Payment overdue', { externalId: event.externalId, gateway: event.gateway });
  // In production: update Invoice status to 'overdue'
  // Notify student + guardian: "Fatura vencida"
}

async function handlePaymentRefunded(event: WebhookEvent): Promise<void> {
  logger.info('Payment refunded', { externalId: event.externalId, gateway: event.gateway });
  // In production: update Invoice status to 'void'
  // Notify admin: "Estorno realizado"
}

async function handleSubscriptionCancelled(event: WebhookEvent): Promise<void> {
  logger.info('Subscription cancelled', { externalId: event.externalId, gateway: event.gateway });
  // In production: update Subscription status to 'cancelled'
  // Notify admin: "Assinatura cancelada"
}

async function handleSubscriptionRenewed(event: WebhookEvent): Promise<void> {
  logger.info('Subscription renewed', { externalId: event.externalId, gateway: event.gateway });
  // In production: generate next Invoice, update Subscription period
}

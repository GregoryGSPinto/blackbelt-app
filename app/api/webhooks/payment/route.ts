import { NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/api/payment-gateway.service';
import { processPaymentWebhook } from '@/lib/api/webhook-processor';
import { logger } from '@/lib/monitoring/logger';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-webhook-signature') ?? '';

    logger.info('Webhook received', { contentLength: payload.length });

    const gateway = await getPaymentGateway();
    const event = await gateway.processWebhook(payload, signature);
    const log = await processPaymentWebhook(event);

    logger.info('Webhook handled', { eventId: event.id, status: log.status });

    // Always return 200 to prevent gateway retries
    return NextResponse.json({ received: true, status: log.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Webhook handler error', { error: message });
    // Still return 200 to prevent infinite retries from gateway
    return NextResponse.json({ received: true, error: 'processing_failed' });
  }
}

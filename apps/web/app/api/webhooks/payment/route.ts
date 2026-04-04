import { NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/api/payment-gateway.service';
import { processPaymentWebhook } from '@/lib/api/webhook-processor';
import { logger } from '@/lib/monitoring/logger';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    // Read signature from multiple possible headers
    const signature =
      request.headers.get('x-webhook-signature') ??
      request.headers.get('asaas-access-token') ??
      request.headers.get('stripe-signature') ??
      '';

    logger.info('Payment webhook received', {
      contentLength: payload.length,
      hasSignature: !!signature,
    });

    const gateway = await getPaymentGateway();
    const event = await gateway.processWebhook(payload, signature);
    const log = await processPaymentWebhook(event);

    logger.info('Payment webhook processed', { eventId: event.id, status: log.status });

    return NextResponse.json({ received: true, status: log.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Payment webhook error', { error: message });
    // Return 200 to prevent infinite retries from gateway
    return NextResponse.json({ received: true, error: 'processing_failed' });
  }
}

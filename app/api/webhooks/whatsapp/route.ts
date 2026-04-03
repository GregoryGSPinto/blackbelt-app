import { NextResponse } from 'next/server';
import { parseIncomingWhatsApp } from '@/lib/api/channels/whatsapp.channel';
import { logger } from '@/lib/monitoring/logger';

const COMMAND_RESPONSES: Record<string, string> = {
  '/presenca': 'Sua presença de hoje foi registrada! Continue assim.',
  '/horario': 'Confira seus horários no app: https://blackbeltv2.vercel.app/turmas',
  '/fatura': 'Acesse suas faturas em: https://blackbeltv2.vercel.app/pagamentos',
};

/**
 * Validates webhook request using a shared secret token.
 * The WhatsApp provider must send this token in the X-Webhook-Token header.
 */
function validateWebhookToken(request: Request): boolean {
  const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (!expectedToken) {
    logger.warn('WHATSAPP_WEBHOOK_TOKEN not configured — webhook validation skipped');
    return true; // Allow in development when token is not set
  }

  const receivedToken = request.headers.get('X-Webhook-Token');
  if (!receivedToken || receivedToken !== expectedToken) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!validateWebhookToken(request)) {
    logger.warn('WhatsApp webhook rejected: invalid or missing token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    logger.info('WhatsApp webhook received', { type: payload.event });

    const message = parseIncomingWhatsApp(payload as Record<string, unknown>);

    // Check for commands
    const command = message.body.trim().toLowerCase();
    if (command in COMMAND_RESPONSES) {
      logger.info('WhatsApp command processed', { command, from: message.from });
      return NextResponse.json({ reply: COMMAND_RESPONSES[command] });
    }

    // Regular message — forward to messaging system
    logger.info('WhatsApp message received', { from: message.from, body: message.body });

    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('WhatsApp webhook error', { error: msg });
    return NextResponse.json({ received: true, error: 'processing_failed' });
  }
}

import { NextResponse } from 'next/server';
import { parseIncomingWhatsApp } from '@/lib/api/channels/whatsapp.channel';
import { logger } from '@/lib/monitoring/logger';

const COMMAND_RESPONSES: Record<string, string> = {
  '/presenca': 'Sua presença de hoje foi registrada! Continue assim.',
  '/horario': 'Confira seus horários no app: https://app.blackbelt.com/turmas',
  '/fatura': 'Acesse suas faturas em: https://app.blackbelt.com/pagamentos',
};

export async function POST(request: Request) {
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

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { VideoGuid, Status } = body;

    console.log(`[bunny-webhook] Video ${VideoGuid} status: ${Status}`);

    // Status: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
    // Aqui pode atualizar o status no Supabase se tiver tabela de video_aulas

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[bunny-webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

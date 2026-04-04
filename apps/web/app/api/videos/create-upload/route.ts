import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createVideo, generateUploadCredentials } from '@/lib/services/bunny-stream';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { title, collectionId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Step 1: Create video object in Bunny
    const video = await createVideo(title, collectionId);

    // Step 2: Generate TUS upload credentials
    const credentials = await generateUploadCredentials(video.guid);

    return NextResponse.json({
      success: true,
      ...credentials,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/videos/create-upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

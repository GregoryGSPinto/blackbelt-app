import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getVideo, deleteVideo, updateVideo, getEmbedUrl, getThumbnailUrl } from '@/lib/services/bunny-stream';

async function checkAuth(req: NextRequest): Promise<NextResponse | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await checkAuth(_req);
    if (authError) return authError;

    const video = await getVideo(params.id);
    return NextResponse.json({
      id: video.guid,
      title: video.title,
      duration: video.length,
      status: video.status === 4 ? 'ready' : video.status === 5 ? 'error' : 'processing',
      views: video.views,
      embedUrl: getEmbedUrl(video.guid),
      thumbnailUrl: getThumbnailUrl(video.guid),
      resolutions: video.availableResolutions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await checkAuth(req);
    if (authError) return authError;

    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    await updateVideo(params.id, title);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await checkAuth(_req);
    if (authError) return authError;

    await deleteVideo(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

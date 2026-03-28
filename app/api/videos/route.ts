import { NextRequest, NextResponse } from 'next/server';
import { listVideos, getEmbedUrl, getThumbnailUrl } from '@/lib/services/bunny-stream';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const search = searchParams.get('search') || undefined;
    const collection = searchParams.get('collection') || undefined;

    const result = await listVideos(page, 25, search, collection);

    const videos = result.items.map((v) => ({
      id: v.guid,
      title: v.title,
      duration: v.length,
      status: v.status === 4 ? 'ready' : v.status === 5 ? 'error' : 'processing',
      views: v.views,
      embedUrl: getEmbedUrl(v.guid),
      thumbnailUrl: getThumbnailUrl(v.guid),
      uploadedAt: v.dateUploaded,
      encodeProgress: v.encodeProgress,
      resolutions: v.availableResolutions,
      size: v.storageSize,
    }));

    return NextResponse.json({
      total: result.totalItems,
      page,
      videos,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/videos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

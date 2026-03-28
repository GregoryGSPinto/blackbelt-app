import { NextRequest, NextResponse } from 'next/server';
import { getVideo, deleteVideo, getEmbedUrl, getThumbnailUrl } from '@/lib/services/bunny-stream';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteVideo(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

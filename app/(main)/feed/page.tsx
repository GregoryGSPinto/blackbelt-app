'use client';

import { useEffect, useState } from 'react';
import { getFeed, likePost, type FeedPost, type PostType } from '@/lib/api/feed.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const TYPE_ICON: Record<PostType, string> = { achievement: '🏆', class_photo: '📸', event: '📅', milestone: '🎯', coach_tip: '💡', promotion: '🥋' };
const FILTERS: { id: PostType | ''; label: string }[] = [
  { id: '', label: 'Todos' }, { id: 'achievement', label: 'Conquistas' }, { id: 'coach_tip', label: 'Dicas' }, { id: 'event', label: 'Eventos' },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostType | ''>('');

  useEffect(() => {
    setLoading(true);
    getFeed('academy-1', 1, filter || undefined).then(setPosts).finally(() => setLoading(false));
  }, [filter]);

  async function handleLike(postId: string) {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
    await likePost(postId);
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-bb-black">Feed</h1>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === f.id ? 'bg-bb-primary text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>{f.label}</button>
        ))}
      </div>
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-gray-100 text-lg">{TYPE_ICON[post.type]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-bb-black">{post.authorName}</span>
                <span className="text-xs text-bb-gray-500">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="mt-1 text-sm text-bb-gray-700">{post.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 ${post.liked ? 'text-red-500' : 'text-bb-gray-500'}`}>
                  {post.liked ? '❤️' : '🤍'} {post.likes}
                </button>
                <span className="text-bb-gray-500">💬 {post.commentCount}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

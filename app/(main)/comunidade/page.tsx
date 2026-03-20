'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getFeed,
  likePost,
  addComment,
  getHighlights,
  type FeedPost,
  type FeedComment,
  type PostType,
  type FeedHighlights,
} from '@/lib/api/feed.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ──────────────────────────────────────────────────────────

const TYPE_ICON: Record<PostType, string> = {
  promotion: '🎖️',
  achievement: '🏆',
  milestone: '🎯',
  class_photo: '📸',
  event: '📅',
  coach_tip: '💡',
};

const TYPE_LABEL: Record<PostType, string> = {
  promotion: 'Promocao',
  achievement: 'Conquista',
  milestone: 'Marco',
  class_photo: 'Treino',
  event: 'Evento',
  coach_tip: 'Dica do Prof.',
};

const FILTERS: { id: PostType | ''; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'promotion', label: 'Promocoes' },
  { id: 'achievement', label: 'Conquistas' },
  { id: 'coach_tip', label: 'Dicas' },
  { id: 'class_photo', label: 'Treinos' },
  { id: 'event', label: 'Eventos' },
];

// ── Helpers ────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ── Comment Section ────────────────────────────────────────────────────

interface CommentSectionProps {
  postId: string;
  comments: FeedComment[];
  onAddComment: (postId: string, content: string) => Promise<void>;
}

function CommentSection({ postId, comments, onAddComment }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    await onAddComment(postId, newComment.trim());
    setNewComment('');
    setSubmitting(false);
    setExpanded(true);
  }

  return (
    <div className="mt-3 border-t border-bb-gray-100 pt-3">
      {comments.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-2 text-xs font-medium text-bb-gray-500 hover:text-bb-gray-700"
        >
          {expanded
            ? 'Ocultar comentarios'
            : `Ver ${comments.length} comentario${comments.length > 1 ? 's' : ''}`}
        </button>
      )}

      {expanded &&
        comments.map((c) => (
          <div key={c.id} className="mb-2 flex gap-2 text-xs">
            <span className="font-semibold text-bb-black">{c.authorName}</span>
            <span className="flex-1 text-bb-gray-700">{c.content}</span>
            <span className="shrink-0 text-bb-gray-500">
              {formatRelativeDate(c.createdAt)}
            </span>
          </div>
        ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="Escreva um comentario..."
          className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-1.5 text-xs text-bb-black placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          loading={submitting}
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}

// ── Highlights Sidebar ─────────────────────────────────────────────────

interface HighlightsSidebarProps {
  highlights: FeedHighlights | null;
}

function HighlightsSidebar({ highlights }: HighlightsSidebarProps) {
  if (!highlights) return null;

  return (
    <div className="space-y-4">
      {/* Student of the Week */}
      {highlights.studentOfTheWeek && (
        <Card variant="outlined" className="p-4">
          <h3 className="mb-3 text-sm font-bold text-bb-black">
            Aluno da Semana
          </h3>
          <div className="flex items-center gap-3">
            <Avatar
              size="lg"
              name={highlights.studentOfTheWeek.name}
              src={highlights.studentOfTheWeek.avatar}
            />
            <div>
              <p className="font-semibold text-bb-black">
                {highlights.studentOfTheWeek.name}
              </p>
              <p className="text-xs text-bb-gray-500">
                {highlights.studentOfTheWeek.reason}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Class Highlight */}
      {highlights.classHighlight && (
        <Card variant="outlined" className="p-4">
          <h3 className="mb-2 text-sm font-bold text-bb-black">
            Destaque da Turma
          </h3>
          <p className="text-sm font-medium text-bb-black">
            {highlights.classHighlight.className}
          </p>
          <p className="text-xs text-bb-gray-500">
            {highlights.classHighlight.stat}
          </p>
        </Card>
      )}

      {/* Birthdays */}
      {highlights.birthdays.length > 0 && (
        <Card variant="outlined" className="p-4">
          <h3 className="mb-2 text-sm font-bold text-bb-black">
            Aniversariantes da Semana
          </h3>
          <ul className="space-y-2">
            {highlights.birthdays.map((b) => (
              <li key={b.name} className="flex items-center gap-2 text-sm">
                <span>🎂</span>
                <span className="text-bb-black">{b.name}</span>
                <span className="text-xs text-bb-gray-500">{b.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function ComunidadePage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [highlights, setHighlights] = useState<FeedHighlights | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostType | ''>('');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const feedData = await getFeed('academy-1', 1, filter || undefined);
      setPosts(feedData);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    getHighlights('academy-1')
      .then(setHighlights)
      .catch(() => {});
  }, []);

  async function handleLike(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
    try {
      await likePost(postId);
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p,
        ),
      );
    }
  }

  async function handleAddComment(postId: string, content: string) {
    try {
      const newComment = await addComment(postId, content);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, newComment],
                commentCount: p.commentCount + 1,
              }
            : p,
        ),
      );
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bb-black">Mural da Academia</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-bb-red text-bb-white'
                : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Feed Column */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-bb-gray-500">
                Nenhuma publicacao encontrada.
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} variant="outlined" className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    size="md"
                    name={post.authorName}
                    src={post.authorAvatar}
                  />
                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-bb-black">
                        {post.authorName}
                      </span>
                      <span
                        className="shrink-0 rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] text-bb-gray-500"
                        title={TYPE_LABEL[post.type]}
                      >
                        {TYPE_ICON[post.type]} {TYPE_LABEL[post.type]}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-bb-gray-500">
                        {formatRelativeDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="mt-2 text-sm leading-relaxed text-bb-gray-700">
                      {post.content}
                    </p>

                    {/* Image (if any) */}
                    {post.imageUrl && (
                      <div className="mt-3 overflow-hidden rounded-lg bg-bb-gray-100">
                        <div className="flex h-48 items-center justify-center text-sm text-bb-gray-500">
                          📷 Imagem do treino
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          post.liked
                            ? 'font-semibold text-bb-red'
                            : 'text-bb-gray-500 hover:text-bb-red'
                        }`}
                      >
                        {post.liked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <span className="text-bb-gray-500">
                        💬 {post.commentCount}
                      </span>
                    </div>

                    {/* Comments */}
                    <CommentSection
                      postId={post.id}
                      comments={post.comments}
                      onAddComment={handleAddComment}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Highlights Sidebar */}
        <div className="w-full shrink-0 lg:w-72">
          <HighlightsSidebar highlights={highlights} />
        </div>
      </div>
    </div>
  );
}

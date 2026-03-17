'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  listAnnouncements,
  createAnnouncement,
  publishAnnouncement,
  getAnnouncementStats,
} from '@/lib/api/announcement.service';
import type {
  Announcement,
  AnnouncementStats,
  AnnouncementAudience,
  AnnouncementStatus,
} from '@/lib/types/announcement';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

const STATUS_LABEL: Record<AnnouncementStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  scheduled: 'Agendado',
};

const STATUS_COLORS: Record<AnnouncementStatus, { bg: string; text: string }> = {
  draft: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' },
  published: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  scheduled: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
};

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  all: 'Todos',
  professors: 'Professores',
  students: 'Alunos',
  parents: 'Responsáveis',
  specific_class: 'Turma Específica',
};

export default function ComunicadosPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AnnouncementStatus | 'all'>('all');
  const [filterAudience, setFilterAudience] = useState<AnnouncementAudience | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAudience, setFormAudience] = useState<AnnouncementAudience>('all');
  const [formSchedule, setFormSchedule] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [anns, s] = await Promise.all([
          listAnnouncements('academy-1'),
          getAnnouncementStats('academy-1'),
        ]);
        setAnnouncements(anns);
        setStats(s);
      } catch {
        toast('Erro ao carregar comunicados', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const filtered = useMemo(() => {
    let result = announcements;
    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status === filterStatus);
    }
    if (filterAudience !== 'all') {
      result = result.filter((a) => a.target_audience === filterAudience);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q),
      );
    }
    return result;
  }, [announcements, filterStatus, filterAudience, search]);

  async function handleCreate() {
    if (!formTitle.trim() || !formContent.trim()) return;
    try {
      const ann = await createAnnouncement('academy-1', {
        title: formTitle,
        content: formContent,
        target_audience: formAudience,
        scheduled_at: formSchedule || undefined,
      });
      setAnnouncements((prev) => [ann, ...prev]);
      toast('Comunicado criado com sucesso!', 'success');
      handleCloseCreate();
    } catch {
      toast('Erro ao criar comunicado', 'error');
    }
  }

  async function handlePublish(id: string) {
    try {
      const updated = await publishAnnouncement(id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      );
      toast('Comunicado publicado!', 'success');
    } catch {
      toast('Erro ao publicar', 'error');
    }
  }

  function handleCloseCreate() {
    setShowCreate(false);
    setFormTitle('');
    setFormContent('');
    setFormAudience('all');
    setFormSchedule('');
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-20 w-36" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="animate-reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Comunicados
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Envie avisos e informações para alunos, professores e responsáveis.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          + Novo Comunicado
        </button>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      {stats && (
        <section className="animate-reveal grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Publicados', value: stats.published, color: '#22c55e' },
            { label: 'Agendados', value: stats.scheduled, color: '#3b82f6' },
            { label: 'Rascunhos', value: stats.drafts },
            { label: 'Taxa de Leitura', value: `${stats.avg_read_rate}%`, color: 'var(--bb-brand)' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-3"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {s.label}
              </p>
              <p
                className="mt-1 text-xl font-bold"
                style={{ color: s.color ?? 'var(--bb-ink-100)' }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <section className="animate-reveal flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar comunicados..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AnnouncementStatus | 'all')}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          <option value="all">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="scheduled">Agendados</option>
          <option value="draft">Rascunhos</option>
        </select>
        <select
          value={filterAudience}
          onChange={(e) => setFilterAudience(e.target.value as AnnouncementAudience | 'all')}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
          }}
        >
          <option value="all">Todos os públicos</option>
          {Object.entries(AUDIENCE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </section>

      {/* ── Announcement Cards ──────────────────────────────────── */}
      <section className="animate-reveal grid gap-4 md:grid-cols-2">
        {filtered.map((ann) => {
          const sc = STATUS_COLORS[ann.status];
          const readRate = ann.total_recipients > 0
            ? Math.round((ann.read_count / ann.total_recipients) * 100)
            : 0;
          return (
            <div
              key={ann.id}
              className="cursor-pointer rounded-lg p-5 transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
              onClick={() => setSelectedAnn(ann)}
            >
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="font-semibold leading-snug"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {ann.title}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {STATUS_LABEL[ann.status]}
                </span>
              </div>

              <p
                className="mt-2 line-clamp-2 text-sm leading-relaxed"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {ann.content}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                <span>{ann.author_name}</span>
                <span>{formatDate(ann.created_at)}</span>
                <span
                  className="rounded px-1.5 py-0.5"
                  style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                >
                  {AUDIENCE_LABEL[ann.target_audience]}
                  {ann.target_class_name ? `: ${ann.target_class_name}` : ''}
                </span>
                {ann.status === 'published' && (
                  <span style={{ color: '#22c55e' }}>
                    {readRate}% leram ({ann.read_count}/{ann.total_recipients})
                  </span>
                )}
                {ann.scheduled_at && (
                  <span style={{ color: '#3b82f6' }}>
                    Agendado: {formatDate(ann.scheduled_at)}
                  </span>
                )}
              </div>

              {ann.attachments.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  <span>📎</span>
                  <span>{ann.attachments.length} anexo{ann.attachments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="col-span-full flex flex-col items-center gap-3 py-16"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <span className="text-4xl">📢</span>
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhum comunicado encontrado
            </p>
            <p className="text-xs">Tente outro filtro ou crie um novo comunicado.</p>
          </div>
        )}
      </section>

      {/* ── Create Modal ────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Novo Comunicado
              </h2>
              <button
                onClick={handleCloseCreate}
                className="text-xl"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Título
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Seminário de Jiu-Jitsu"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Mensagem
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escreva o comunicado..."
                  rows={4}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
                <div className="mt-1 flex gap-2">
                  {['**B**', '_I_', '• Lista'].map((btn) => (
                    <button
                      key={btn}
                      className="rounded px-2 py-1 text-xs"
                      style={{
                        background: 'var(--bb-depth-4)',
                        color: 'var(--bb-ink-60)',
                      }}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Público-alvo
                </label>
                <select
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value as AnnouncementAudience)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  {Object.entries(AUDIENCE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Agendamento (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formSchedule}
                  onChange={(e) => setFormSchedule(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseCreate}
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formTitle.trim() || !formContent.trim()}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  {formSchedule ? 'Agendar' : 'Salvar Rascunho'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ────────────────────────────────────────── */}
      {selectedAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <h2
                className="text-lg font-bold leading-snug pr-4"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {selectedAnn.title}
              </h2>
              <button
                onClick={() => setSelectedAnn(null)}
                className="text-xl shrink-0"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: STATUS_COLORS[selectedAnn.status].bg,
                    color: STATUS_COLORS[selectedAnn.status].text,
                  }}
                >
                  {STATUS_LABEL[selectedAnn.status]}
                </span>
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {AUDIENCE_LABEL[selectedAnn.target_audience]}
                  {selectedAnn.target_class_name ? `: ${selectedAnn.target_class_name}` : ''}
                </span>
                {selectedAnn.status === 'published' && (
                  <span className="text-xs" style={{ color: '#22c55e' }}>
                    {selectedAnn.read_count}/{selectedAnn.total_recipients} leram
                  </span>
                )}
              </div>

              <p
                className="whitespace-pre-line text-sm leading-relaxed"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                {selectedAnn.content}
              </p>

              {selectedAnn.attachments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Anexos:
                  </p>
                  {selectedAnn.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 rounded-lg p-2 text-xs"
                      style={{ background: 'var(--bb-depth-4)' }}
                    >
                      <span>📎</span>
                      <span style={{ color: 'var(--bb-ink-80)' }}>{att.name}</span>
                      <span style={{ color: 'var(--bb-ink-40)' }}>
                        ({Math.round(att.size_bytes / 1024)}KB)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                <p>Autor: {selectedAnn.author_name}</p>
                <p>Criado em: {formatDateTime(selectedAnn.created_at)}</p>
                {selectedAnn.published_at && (
                  <p>Publicado em: {formatDateTime(selectedAnn.published_at)}</p>
                )}
                {selectedAnn.scheduled_at && (
                  <p>Agendado para: {formatDateTime(selectedAnn.scheduled_at)}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                {selectedAnn.status === 'draft' && (
                  <button
                    onClick={() => {
                      handlePublish(selectedAnn.id);
                      setSelectedAnn(null);
                    }}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'var(--bb-brand)', color: '#fff' }}
                  >
                    Publicar Agora
                  </button>
                )}
                <button
                  onClick={() => setSelectedAnn(null)}
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

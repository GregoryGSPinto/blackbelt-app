'use client';

import { useState, useEffect, useMemo } from 'react';
import { listAdminVideos, deleteVideo, togglePublish, getAdminStorageStats } from '@/lib/api/admin-content.service';
import type { AdminVideoDTO, AdminStorageStats } from '@/lib/api/admin-content.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { Search, Film, Eye, Heart, Upload, HardDrive, MoreVertical, Globe, EyeOff, Trash2, Video } from 'lucide-react';

export default function AdminConteudoPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<AdminVideoDTO[]>([]);
  const [storage, setStorage] = useState<AdminStorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProfessor, setFilterProfessor] = useState('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listAdminVideos('academy-1'),
      getAdminStorageStats('academy-1'),
    ])
      .then(([vids, stats]) => {
        setVideos(vids);
        setStorage(stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const modalities = useMemo(() => {
    const set = new Set(videos.map((v) => v.modality));
    return Array.from(set).sort();
  }, [videos]);

  const professors = useMemo(() => {
    const set = new Set(videos.map((v) => v.professor_name));
    return Array.from(set).sort();
  }, [videos]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterModality !== 'all' && v.modality !== filterModality) return false;
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (filterProfessor !== 'all' && v.professor_name !== filterProfessor) return false;
      return true;
    });
  }, [videos, search, filterModality, filterStatus, filterProfessor]);

  const stats = useMemo(() => {
    const published = videos.filter((v) => v.status === 'published').length;
    const drafts = videos.filter((v) => v.status === 'draft').length;
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    return { total: videos.length, published, drafts, totalViews };
  }, [videos]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteVideo(deleteId);
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      setDeleteId(null);
      toast('Vídeo excluído com sucesso', 'success');
    } catch {
      toast('Erro ao excluir vídeo', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function handleTogglePublish(id: string, publish: boolean) {
    try {
      await togglePublish(id, publish);
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: publish ? 'published' as const : 'draft' as const } : v)),
      );
      setMenuOpen(null);
      toast(publish ? 'Vídeo publicado' : 'Vídeo despublicado', 'success');
    } catch {
      toast('Erro ao alterar status', 'error');
    }
  }

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? `${m}min` : ''}` : `${m}min`;
  }

  const statusLabel: Record<string, string> = { published: 'Publicado', draft: 'Rascunho', processing: 'Processando' };
  const statusColor: Record<string, string> = { published: '#22c55e', draft: '#f59e0b', processing: '#3b82f6' };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <Skeleton variant="card" className="h-12" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Gestão de Conteúdo</h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-50)' }}>
            Gerencie todos os vídeos da academia
          </p>
        </div>
        <Button onClick={() => toast('Use a área do Professor para enviar vídeos', 'info')}>
          <Upload className="mr-2 h-4 w-4" /> Enviar Vídeo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>Total</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.total}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: '#22c55e' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>Publicados</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.published}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" style={{ color: '#f59e0b' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>Rascunhos</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.drafts}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" style={{ color: '#6366f1' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-50)' }}>Views Total</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.totalViews.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Storage Bar */}
      {storage && (
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" style={{ color: 'var(--bb-ink-50)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>Armazenamento</span>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-50)' }}>
              {storage.total_size_gb.toFixed(1)}GB de {storage.limit_gb}GB
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(storage.usage_percent, 100)}%`,
                background: storage.usage_percent > 90 ? '#ef4444' : storage.usage_percent > 75 ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
          {storage.usage_percent > 80 && (
            <p className="mt-1 text-xs" style={{ color: storage.usage_percent > 90 ? '#ef4444' : '#f59e0b' }}>
              {storage.usage_percent > 90 ? 'Armazenamento quase cheio!' : 'Atenção: armazenamento acima de 80%'}
            </p>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            placeholder="Buscar vídeo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
          />
        </div>
        <select
          value={filterModality}
          onChange={(e) => setFilterModality(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="all">Todas modalidades</option>
          {modalities.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterProfessor}
          onChange={(e) => setFilterProfessor(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="all">Todos professores</option>
          {professors.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
        >
          <option value="all">Todos status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
          <option value="processing">Processando</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        {filtered.length} {filtered.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
      </p>

      {/* Video List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg py-16" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <Video className="mb-4 h-12 w-12" style={{ color: 'var(--bb-ink-30)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            {search || filterModality !== 'all' || filterStatus !== 'all' || filterProfessor !== 'all'
              ? 'Nenhum vídeo encontrado com esses filtros'
              : 'Nenhum vídeo na academia'}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            {search || filterModality !== 'all' || filterStatus !== 'all' || filterProfessor !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Os professores podem enviar vídeos na área de conteúdo'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)', background: 'var(--bb-depth-3)' }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Vídeo</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Professor</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Modalidade</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-50)' }}>Faixa</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-50)' }}>Duração</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-50)' }}>Views</th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-50)' }}>Status</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-50)' }}>Data</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-50)' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-[var(--bb-depth-3)]" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-16 items-center justify-center rounded" style={{ background: 'var(--bb-depth-3)' }}>
                            <Film className="h-4 w-4" style={{ color: 'var(--bb-ink-30)' }} />
                          </div>
                          <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{v.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{v.professor_name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{v.modality}</td>
                      <td className="px-4 py-3"><Badge variant="belt" size="sm">{v.belt_level}</Badge></td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--bb-ink-50)' }}>{formatDuration(v.duration)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Eye className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} />
                          <span style={{ color: 'var(--bb-ink-60)' }}>{v.views}</span>
                          <Heart className="ml-1 h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} />
                          <span style={{ color: 'var(--bb-ink-60)' }}>{v.likes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: `${statusColor[v.status]}20`, color: statusColor[v.status] }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[v.status] }} />
                          {statusLabel[v.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--bb-ink-50)' }}>
                        {new Date(v.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)}
                            className="rounded p-1 transition-colors hover:bg-[var(--bb-depth-3)]"
                          >
                            <MoreVertical className="h-4 w-4" style={{ color: 'var(--bb-ink-50)' }} />
                          </button>
                          {menuOpen === v.id && (
                            <div
                              className="absolute right-0 top-8 z-10 w-40 rounded-lg py-1 shadow-lg"
                              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                            >
                              {v.status === 'published' ? (
                                <button
                                  onClick={() => handleTogglePublish(v.id, false)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bb-depth-3)]"
                                  style={{ color: 'var(--bb-ink-80)' }}
                                >
                                  <EyeOff className="h-3.5 w-3.5" /> Despublicar
                                </button>
                              ) : v.status === 'draft' ? (
                                <button
                                  onClick={() => handleTogglePublish(v.id, true)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bb-depth-3)]"
                                  style={{ color: '#22c55e' }}
                                >
                                  <Globe className="h-3.5 w-3.5" /> Publicar
                                </button>
                              ) : null}
                              <button
                                onClick={() => { setDeleteId(v.id); setMenuOpen(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bb-depth-3)]"
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="rounded-lg p-4"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{v.title}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-50)' }}>{v.professor_name} · {v.modality}</p>
                  </div>
                  <span
                    className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: `${statusColor[v.status]}20`, color: statusColor[v.status] }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[v.status] }} />
                    {statusLabel[v.status]}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--bb-ink-50)' }}>
                  <Badge variant="belt" size="sm">{v.belt_level}</Badge>
                  <span>{formatDuration(v.duration)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {v.views}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {v.likes}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {new Date(v.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-2">
                    {v.status === 'published' ? (
                      <button
                        onClick={() => handleTogglePublish(v.id, false)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                      >
                        Despublicar
                      </button>
                    ) : v.status === 'draft' ? (
                      <button
                        onClick={() => handleTogglePublish(v.id, true)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: '#22c55e20', color: '#22c55e' }}
                      >
                        Publicar
                      </button>
                    ) : null}
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="rounded px-2 py-1 text-xs font-medium"
                      style={{ background: '#ef444420', color: '#ef4444' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir Vídeo" variant="confirm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

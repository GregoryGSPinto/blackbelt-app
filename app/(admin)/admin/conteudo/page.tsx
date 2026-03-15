'use client';

import { useState, useEffect } from 'react';
import { listAdminVideos, deleteVideo } from '@/lib/api/admin-content.service';
import type { AdminVideoDTO } from '@/lib/api/admin-content.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

export default function AdminConteudoPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<AdminVideoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listAdminVideos('academy-1').then(setVideos).catch(() => {}).finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="space-y-4 p-6"><Skeleton variant="text" className="h-8 w-48" /><Skeleton variant="card" className="h-64" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Gestão de Conteúdo</h1>
        <Button>Novo Vídeo</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Título</th>
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Faixa</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Duração</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Views</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Data</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
            </tr></thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-medium text-bb-black">{v.title}</td>
                  <td className="px-4 py-3"><Badge variant="belt" size="sm">{v.belt_level}</Badge></td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">{v.duration}min</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">{v.views}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">{new Date(v.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteId(v.id)} className="text-xs text-bb-error hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir Vídeo" variant="confirm">
        <div className="space-y-4">
          <p className="text-sm text-bb-gray-500">Tem certeza que deseja excluir este vídeo?</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

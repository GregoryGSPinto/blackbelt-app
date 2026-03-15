'use client';

import { useState, useEffect } from 'react';
import { listTechniques, createTechnique, type TechniqueDTO, type TechniqueModality, type TechniqueCategory, type BeltLevel } from '@/lib/api/techniques.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const MODALITY_LABEL: Record<TechniqueModality, string> = { bjj: 'BJJ', 'muay-thai': 'Muay Thai', judo: 'Judô', wrestling: 'Wrestling', mma: 'MMA' };
const CATEGORY_LABEL: Record<TechniqueCategory, string> = { finalização: 'Finalização', passagem: 'Passagem', raspagem: 'Raspagem', queda: 'Queda', defesa: 'Defesa', posição: 'Posição', transição: 'Transição', striking: 'Striking' };
const BELT_LABEL: Record<BeltLevel, string> = { branca: 'Branca', azul: 'Azul', roxa: 'Roxa', marrom: 'Marrom', preta: 'Preta' };
const BELT_COLOR: Record<BeltLevel, string> = { branca: 'bg-gray-100 text-gray-700', azul: 'bg-blue-100 text-blue-700', roxa: 'bg-purple-100 text-purple-700', marrom: 'bg-amber-100 text-amber-800', preta: 'bg-gray-900 text-white' };
const CATEGORY_COLOR: Record<TechniqueCategory, string> = { finalização: 'bg-red-100 text-red-700', passagem: 'bg-blue-100 text-blue-700', raspagem: 'bg-green-100 text-green-700', queda: 'bg-orange-100 text-orange-700', defesa: 'bg-yellow-100 text-yellow-700', posição: 'bg-indigo-100 text-indigo-700', transição: 'bg-teal-100 text-teal-700', striking: 'bg-pink-100 text-pink-700' };

const EMPTY_FORM = {
  name: '',
  modality: 'bjj' as TechniqueModality,
  belt_level: 'branca' as BeltLevel,
  category: 'finalização' as TechniqueCategory,
  tags: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  key_points: '',
};

export default function TecnicasAdminPage() {
  const { toast } = useToast();
  const [techniques, setTechniques] = useState<TechniqueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listTechniques().then(setTechniques).finally(() => setLoading(false));
  }, []);

  const filtered = techniques.filter((t) => {
    if (filterModality && t.modality !== filterModality) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.tags.some((tag) => tag.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, TechniqueDTO[]>>((acc, t) => {
    const key = t.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  async function handleCreate() {
    setCreating(true);
    try {
      const technique = await createTechnique({
        name: form.name,
        modality: form.modality,
        belt_level: form.belt_level,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        description: form.description,
        video_url: form.video_url,
        thumbnail_url: form.thumbnail_url,
        key_points: form.key_points.split('\n').map((p) => p.trim()).filter(Boolean),
      });
      setTechniques((prev) => [...prev, technique]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      toast('Técnica criada com sucesso', 'success');
    } catch {
      toast('Erro ao criar técnica', 'error');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Biblioteca de Técnicas</h1>
        <Button onClick={() => setShowCreate(true)}>Nova Técnica</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar técnica..."
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={filterModality}
          onChange={(e) => setFilterModality(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas modalidades</option>
          {Object.entries(MODALITY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas categorias</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-bb-gray-500">
        <span>{techniques.length} técnicas total</span>
        <span>{filtered.length} exibidas</span>
      </div>

      {/* Grouped techniques */}
      {Object.keys(grouped).length === 0 ? (
        <p className="py-8 text-center text-sm text-bb-gray-500">Nenhuma técnica encontrada.</p>
      ) : (
        Object.entries(grouped).map(([category, techs]) => (
          <div key={category}>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-bb-black">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLOR[category as TechniqueCategory]}`}>
                {CATEGORY_LABEL[category as TechniqueCategory]}
              </span>
              <span className="text-sm text-bb-gray-500">({techs.length})</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {techs.map((tech) => (
                <Card key={tech.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-bb-black">{tech.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BELT_COLOR[tech.belt_level]}`}>
                          {BELT_LABEL[tech.belt_level]}
                        </span>
                        <span className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-600">
                          {MODALITY_LABEL[tech.modality]}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-10 w-14 items-center justify-center rounded bg-bb-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-bb-gray-500 line-clamp-2">{tech.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tech.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded bg-bb-gray-100 px-1.5 py-0.5 text-xs text-bb-gray-500">
                        {tag}
                      </span>
                    ))}
                    {tech.tags.length > 3 && (
                      <span className="text-xs text-bb-gray-400">+{tech.tags.length - 3}</span>
                    )}
                  </div>
                  <div className="mt-3 border-t border-bb-gray-100 pt-2">
                    <p className="text-xs font-medium text-bb-gray-500">{tech.key_points.length} pontos-chave</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Técnica">
        <div className="space-y-3">
          <input
            placeholder="Nome da técnica"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value as TechniqueModality })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
              {Object.entries(MODALITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TechniqueCategory })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={form.belt_level} onChange={(e) => setForm({ ...form, belt_level: e.target.value as BeltLevel })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
              {Object.entries(BELT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <textarea
            placeholder="Descrição da técnica"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            rows={3}
          />
          <input
            placeholder="Tags (separadas por vírgula)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="URL do vídeo de referência"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Pontos-chave (um por linha)"
            value={form.key_points}
            onChange={(e) => setForm({ ...form, key_points: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            rows={4}
          />
          <Button className="w-full" onClick={handleCreate} disabled={!form.name || !form.description || creating} loading={creating}>
            Criar Técnica
          </Button>
        </div>
      </Modal>
    </div>
  );
}

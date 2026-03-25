'use client';

import { useState, useEffect } from 'react';
import { listTechniques, type TechniqueDTO, type TechniqueModality, type TechniqueCategory, type BeltLevel } from '@/lib/api/techniques.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import { PageHeader } from '@/components/shared/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComingSoon } from '@/components/shared/ComingSoon';

const MODALITY_LABEL: Record<TechniqueModality, string> = { bjj: 'BJJ', 'muay-thai': 'Muay Thai', judo: 'Judô', wrestling: 'Wrestling', mma: 'MMA' };
const CATEGORY_LABEL: Record<TechniqueCategory, string> = { finalização: 'Finalização', passagem: 'Passagem', raspagem: 'Raspagem', queda: 'Queda', defesa: 'Defesa', posição: 'Posição', transição: 'Transição', striking: 'Striking' };
const BELT_LABEL: Record<BeltLevel, string> = { branca: 'Branca', azul: 'Azul', roxa: 'Roxa', marrom: 'Marrom', preta: 'Preta' };
const BELT_COLOR: Record<BeltLevel, string> = { branca: 'bg-gray-100 text-gray-700', azul: 'bg-blue-100 text-blue-700', roxa: 'bg-purple-100 text-purple-700', marrom: 'bg-amber-100 text-amber-800', preta: 'bg-gray-900 text-white' };
const CATEGORY_COLOR: Record<TechniqueCategory, string> = { finalização: 'bg-red-100 text-red-700', passagem: 'bg-blue-100 text-blue-700', raspagem: 'bg-green-100 text-green-700', queda: 'bg-orange-100 text-orange-700', defesa: 'bg-yellow-100 text-yellow-700', posição: 'bg-indigo-100 text-indigo-700', transição: 'bg-teal-100 text-teal-700', striking: 'bg-pink-100 text-pink-700' };

const MODALITY_TABS: { key: string; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'bjj', label: 'BJJ' },
  { key: 'muay-thai', label: 'Muay Thai' },
  { key: 'judo', label: 'Judô' },
  { key: 'wrestling', label: 'Wrestling' },
];

export default function TecnicasCatalogPage() {
  const [techniques, setTechniques] = useState<TechniqueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [activeModality, setActiveModality] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBelt, setFilterBelt] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<TechniqueDTO | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    listTechniques().then(setTechniques).finally(() => setLoading(false));
  }, []);

  const filtered = techniques.filter((t) => {
    if (activeModality && t.modality !== activeModality) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterBelt && t.belt_level !== filterBelt) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.tags.some((tag) => tag.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Técnicas" subtitle="Explore a biblioteca de técnicas e grave sua execução" />

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar técnica por nome ou tag..."
          className="w-full rounded-lg border border-bb-gray-300 py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      {/* Modality tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {MODALITY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveModality(tab.key)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeModality === tab.key
                ? 'bg-bb-primary text-white'
                : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas categorias</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas faixas</option>
          {Object.entries(BELT_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {(filterCategory || filterBelt || search) && (
          <button
            onClick={() => { setFilterCategory(''); setFilterBelt(''); setSearch(''); }}
            className="text-sm text-bb-primary hover:underline"
          >
            Limpar
          </button>
        )}
        <span className="ml-auto text-sm text-bb-gray-500">{filtered.length} técnicas</span>
      </div>

      {/* Technique grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma técnica encontrada"
          description="Tente ajustar os filtros de busca."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech)}
              className="group rounded-xl border border-bb-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-bb-gray-100 group-hover:bg-bb-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bb-gray-400 group-hover:text-bb-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-bb-black group-hover:text-bb-primary">{tech.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${BELT_COLOR[tech.belt_level]}`}>
                      {BELT_LABEL[tech.belt_level]}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${CATEGORY_COLOR[tech.category]}`}>
                      {CATEGORY_LABEL[tech.category]}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-bb-gray-500 line-clamp-2">{tech.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {tech.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-bb-gray-50 px-1.5 py-0.5 text-xs text-bb-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Technique detail modal */}
      <Modal
        open={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        title={selectedTech?.name ?? ''}
      >
        {selectedTech && (
          <div className="space-y-4">
            {/* Video placeholder */}
            <div className="flex aspect-video items-center justify-center rounded-lg bg-bb-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${BELT_COLOR[selectedTech.belt_level]}`}>
                {BELT_LABEL[selectedTech.belt_level]}
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${CATEGORY_COLOR[selectedTech.category]}`}>
                {CATEGORY_LABEL[selectedTech.category]}
              </span>
              <span className="rounded-full bg-bb-gray-100 px-2 py-1 text-xs font-medium text-bb-gray-600">
                {MODALITY_LABEL[selectedTech.modality]}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-bb-gray-700">{selectedTech.description}</p>

            {/* Key points */}
            <div>
              <h4 className="text-sm font-bold text-bb-black">Pontos-Chave</h4>
              <ul className="mt-2 space-y-1.5">
                {selectedTech.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-bb-gray-700">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bb-primary text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {selectedTech.tags.map((tag) => (
                <span key={tag} className="rounded bg-bb-gray-100 px-2 py-1 text-xs text-bb-gray-500">
                  {tag}
                </span>
              ))}
            </div>

            {/* Record execution button */}
            <Button
              className="w-full"
              onClick={() => {
                setSelectedTech(null);
                window.location.href = '/progresso/videos';
              }}
            >
              Gravar Minha Execução
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

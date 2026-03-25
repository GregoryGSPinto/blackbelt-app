'use client';

import { useEffect, useState } from 'react';
import {
  getCurriculos,
  getCurriculoOverview,
  type CurriculoRede,
  type CurriculoOverview,
  type TecnicaCurriculo,
} from '@/lib/api/franqueador-curriculo.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ComingSoon } from '@/components/shared/ComingSoon';

type TechCategory = TecnicaCurriculo['category'];

const CATEGORY_LABEL: Record<TechCategory, string> = {
  fundamento: 'Fundamento',
  avancado: 'Avancado',
  competicao: 'Competicao',
  defesa_pessoal: 'Defesa Pessoal',
};

const CATEGORY_COLOR: Record<TechCategory, string> = {
  fundamento: 'bg-blue-100 text-blue-700',
  avancado: 'bg-purple-100 text-purple-700',
  competicao: 'bg-orange-100 text-orange-700',
  defesa_pessoal: 'bg-green-100 text-green-700',
};

const BELT_COLOR: Record<string, string> = {
  branca: 'bg-gray-100 text-gray-800 border border-gray-300',
  'branca-4graus': 'bg-gray-100 text-gray-800 border border-gray-400',
  amarela: 'bg-yellow-100 text-yellow-800',
  laranja: 'bg-orange-100 text-orange-800',
  verde: 'bg-green-100 text-green-800',
  azul: 'bg-blue-100 text-blue-800',
  'azul-4graus': 'bg-blue-200 text-blue-900',
  roxa: 'bg-purple-100 text-purple-800',
  marrom: 'bg-amber-800/10 text-amber-900',
  preta: 'bg-gray-900 text-white',
};

const BELT_LABEL: Record<string, string> = {
  branca: 'Branca',
  'branca-4graus': 'Branca 4 Graus',
  amarela: 'Amarela',
  laranja: 'Laranja',
  verde: 'Verde',
  azul: 'Azul',
  'azul-4graus': 'Azul 4 Graus',
  roxa: 'Roxa',
  marrom: 'Marrom',
  preta: 'Preta',
};

export default function CurriculoFranqueadorPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [curriculos, setCurriculos] = useState<CurriculoRede[]>([]);
  const [overview, setOverview] = useState<CurriculoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterModality, setFilterModality] = useState('');
  const [filterBelt, setFilterBelt] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getCurriculos('franchise-1'),
      getCurriculoOverview('franchise-1'),
    ])
      .then(([currs, ov]) => {
        setCurriculos(currs);
        setOverview(ov);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/franqueador" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const modalities = overview?.modalities ?? [...new Set(curriculos.map((c) => c.modality))];
  const beltLevels = [...new Set(curriculos.map((c) => c.belt_level))];

  const filtered = curriculos.filter((c) => {
    if (filterModality && c.modality !== filterModality) return false;
    if (filterBelt && c.belt_level !== filterBelt) return false;
    return true;
  });

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Curriculo Padronizado da Rede</h1>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Modalidades</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{overview.modalities.length}</p>
            <p className="mt-1 text-xs text-bb-gray-500">{overview.modalities.join(', ')}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Total Curriculos</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{overview.total_curriculos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Total Tecnicas</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{overview.total_techniques}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Modality filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setFilterModality('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !filterModality ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'
            }`}
          >
            Todas Modalidades
          </button>
          {modalities.map((mod) => (
            <button
              key={mod}
              onClick={() => setFilterModality(mod)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filterModality === mod ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Belt level filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterBelt('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !filterBelt ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'
            }`}
          >
            Todas Faixas
          </button>
          {beltLevels.map((belt) => (
            <button
              key={belt}
              onClick={() => setFilterBelt(belt)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filterBelt === belt ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'
              }`}
            >
              {BELT_LABEL[belt] ?? belt}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Cards */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-bb-gray-500">Nenhum curriculo encontrado para os filtros selecionados.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((curr) => {
            const isExpanded = expandedId === curr.id;
            const requiredCount = curr.techniques.filter((t) => t.required).length;

            return (
              <Card key={curr.id} className="overflow-hidden p-0">
                {/* Header */}
                <button
                  onClick={() => toggleExpand(curr.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-bb-gray-100/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-bb-black">{curr.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BELT_COLOR[curr.belt_level] ?? 'bg-gray-100 text-gray-700'}`}>
                        {BELT_LABEL[curr.belt_level] ?? curr.belt_level}
                      </span>
                      <span className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] font-medium text-bb-gray-500">
                        {curr.modality}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bb-gray-500 line-clamp-2">{curr.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-bb-gray-500">
                      <span>{curr.techniques.length} tecnicas ({requiredCount} obrigatorias)</span>
                      <span>Min. {curr.min_classes_required} aulas</span>
                      <span>{curr.evaluation_criteria.length} criterios de avaliacao</span>
                    </div>
                  </div>
                  <span className="mt-1 shrink-0 text-bb-gray-500 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    &#9660;
                  </span>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-bb-gray-300">
                    {/* Techniques List */}
                    <div className="p-4">
                      <h4 className="mb-3 text-sm font-semibold text-bb-black">Tecnicas</h4>
                      <div className="space-y-2">
                        {curr.techniques.map((tech) => (
                          <div
                            key={tech.id}
                            className="flex items-start gap-3 rounded-lg border border-bb-gray-200 p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-bb-black">{tech.name}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLOR[tech.category]}`}>
                                  {CATEGORY_LABEL[tech.category]}
                                </span>
                                {tech.required && (
                                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                    Obrigatoria
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-bb-gray-500">{tech.description}</p>
                            </div>
                            {tech.video_url && (
                              <a
                                href={tech.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 rounded bg-bb-gray-100 px-2 py-1 text-[10px] font-medium text-bb-red hover:bg-bb-gray-200"
                              >
                                Video
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evaluation Criteria */}
                    <div className="border-t border-bb-gray-200 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-bb-black">Criterios de Avaliacao</h4>
                      <ul className="space-y-1">
                        {curr.evaluation_criteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-bb-gray-500">
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-bb-gray-300 flex items-center justify-center text-[10px] text-bb-gray-500">
                              {idx + 1}
                            </span>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta */}
                    <div className="border-t border-bb-gray-200 px-4 py-3 text-xs text-bb-gray-500">
                      <div className="flex flex-wrap gap-4">
                        <span>Minimo de aulas: <strong className="text-bb-black">{curr.min_classes_required}</strong></span>
                        <span>Criado em: {new Date(curr.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>Atualizado em: {new Date(curr.updated_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

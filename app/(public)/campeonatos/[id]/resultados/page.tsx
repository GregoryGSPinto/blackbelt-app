'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getResults,
  getMedalTable,
  type CategoryResultDTO,
  type MedalTableEntry,
} from '@/lib/api/championship-live.service';
import { getChampionshipById, type ChampionshipDTO } from '@/lib/api/championships.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const MEDAL_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  silver: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300' },
  bronze: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
};

export default function ResultadosPage() {
  const params = useParams();
  const championshipId = params.id as string;

  const [championship, setChampionship] = useState<ChampionshipDTO | null>(null);
  const [results, setResults] = useState<CategoryResultDTO[]>([]);
  const [medalTable, setMedalTable] = useState<MedalTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'categories' | 'medals'>('categories');
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('');

  useEffect(() => {
    Promise.all([
      getChampionshipById(championshipId),
      getResults(championshipId),
      getMedalTable(championshipId),
    ])
      .then(([champ, res, medals]) => {
        setChampionship(champ);
        setResults(res);
        setMedalTable(medals);
      })
      .finally(() => setLoading(false));
  }, [championshipId]);

  // Filter results
  let filteredResults = results;
  if (filterModality) {
    filteredResults = filteredResults.filter((r) => r.modality === filterModality);
  }
  if (search) {
    const s = search.toLowerCase();
    filteredResults = filteredResults.filter((r) =>
      r.gold.athlete_name.toLowerCase().includes(s) ||
      r.silver.athlete_name.toLowerCase().includes(s) ||
      r.bronze.some((b) => b.athlete_name.toLowerCase().includes(s)) ||
      r.category_label.toLowerCase().includes(s),
    );
  }

  const modalities = [...new Set(results.map((r) => r.modality))];

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!championship) return null;

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-bb-black to-gray-800 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href={`/campeonatos/${championshipId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <h1 className="text-2xl font-bold">Resultados</h1>
          <p className="mt-1 text-sm text-white/70">{championship.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-bb-gray-200">
          <button
            onClick={() => setTab('categories')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'categories'
                ? 'border-bb-primary text-bb-primary'
                : 'border-transparent text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            Por Categoria
          </button>
          <button
            onClick={() => setTab('medals')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'medals'
                ? 'border-bb-primary text-bb-primary'
                : 'border-transparent text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            Quadro de Medalhas
          </button>
        </div>

        {tab === 'categories' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar atleta ou categoria..."
                  className="w-full rounded-lg border border-bb-gray-200 py-2 pl-10 pr-4 text-sm"
                />
              </div>
              <select
                value={filterModality}
                onChange={(e) => setFilterModality(e.target.value)}
                className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Todas modalidades</option>
                {modalities.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Category results */}
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.category_id} className="overflow-hidden">
                  <div className="border-b border-bb-gray-200 bg-bb-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-bb-black">{result.category_label}</h3>
                      <span className="rounded-full bg-bb-gray-200 px-2 py-0.5 text-[10px] text-bb-gray-500">{result.modality}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Gold */}
                    <div className={`flex items-center gap-3 rounded-xl border p-3 ${MEDAL_STYLE.gold.border} ${MEDAL_STYLE.gold.bg}`}>
                      <span className="text-xl">&#129351;</span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${MEDAL_STYLE.gold.text}`}>{result.gold.athlete_name}</p>
                        <p className="text-xs text-bb-gray-500">{result.gold.academy}</p>
                      </div>
                    </div>

                    {/* Silver */}
                    <div className={`flex items-center gap-3 rounded-xl border p-3 ${MEDAL_STYLE.silver.border} ${MEDAL_STYLE.silver.bg}`}>
                      <span className="text-xl">&#129352;</span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${MEDAL_STYLE.silver.text}`}>{result.silver.athlete_name}</p>
                        <p className="text-xs text-bb-gray-500">{result.silver.academy}</p>
                      </div>
                    </div>

                    {/* Bronze */}
                    {result.bronze.map((b, i) => (
                      <div key={`${b.athlete_id}-${i}`} className={`flex items-center gap-3 rounded-xl border p-3 ${MEDAL_STYLE.bronze.border} ${MEDAL_STYLE.bronze.bg}`}>
                        <span className="text-xl">&#129353;</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${MEDAL_STYLE.bronze.text}`}>{b.athlete_name}</p>
                          <p className="text-xs text-bb-gray-500">{b.academy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              {filteredResults.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-bb-gray-500">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'medals' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-200 bg-bb-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">Academia</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-yellow-600">Ouro</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500">Prata</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-orange-600">Bronze</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-bb-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-gray-100">
                  {medalTable.map((entry, i) => (
                    <tr key={entry.academy_id} className={`transition-colors hover:bg-bb-gray-50 ${i < 3 ? 'bg-yellow-50/30' : ''}`}>
                      <td className="px-4 py-3 font-bold text-bb-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-bb-black">{entry.academy_name}</td>
                      <td className="px-4 py-3 text-center">
                        {entry.gold > 0 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">{entry.gold}</span>
                        ) : (
                          <span className="text-bb-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.silver > 0 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">{entry.silver}</span>
                        ) : (
                          <span className="text-bb-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.bronze > 0 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{entry.bronze}</span>
                        ) : (
                          <span className="text-bb-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-bb-black">{entry.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

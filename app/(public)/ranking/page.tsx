'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getAthleteRanking,
  getAcademyRanking,
  type RankedAthleteDTO,
  type RankedAcademyDTO,
  type RankingFilters,
} from '@/lib/api/federation-ranking.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

const BELTS = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
const WEIGHTS = ['Galo (até 57kg)', 'Pluma (até 64kg)', 'Pena (até 70kg)', 'Leve (até 76kg)', 'Médio (até 82kg)', 'Meio-Pesado (até 88kg)', 'Pesado (até 94kg)', 'Super-Pesado (até 100kg)'];
const REGIONS = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Santa Catarina', 'Bahia', 'Pernambuco', 'Rio Grande do Sul'];
const MODALITIES = ['BJJ', 'No-Gi', 'Judô'];

const BELT_COLORS: Record<string, string> = {
  Branca: 'bg-white border border-bb-gray-300 text-bb-gray-600',
  Azul: 'bg-blue-600 text-white',
  Roxa: 'bg-purple-600 text-white',
  Marrom: 'bg-amber-800 text-white',
  Preta: 'bg-bb-black text-white',
};

type Tab = 'athletes' | 'academies';

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>('athletes');
  const [athletes, setAthletes] = useState<RankedAthleteDTO[]>([]);
  const [academies, setAcademies] = useState<RankedAcademyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [modality, setModality] = useState('');
  const [belt, setBelt] = useState('');
  const [weight, setWeight] = useState('');
  const [region, setRegion] = useState('');

  const currentUserId = 'ath-rank-5'; // Mock: highlighted "my" ranking

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'athletes') {
        const filters: RankingFilters = {};
        if (modality) filters.modality = modality;
        if (belt) filters.belt = belt;
        if (weight) filters.weight = weight;
        if (region) filters.region = region;
        const data = await getAthleteRanking(filters);
        setAthletes(data);
      } else {
        const data = await getAcademyRanking({ modality: modality || undefined, region: region || undefined });
        setAcademies(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, modality, belt, weight, region]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-bb-black to-[var(--bb-depth-5)] px-4 py-8 text-[var(--bb-ink-100)] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="Ranking da Federação" subtitle="Classificação oficial de atletas e academias - últimos 12 meses" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-bb-gray-200">
          <button
            onClick={() => setTab('athletes')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'athletes'
                ? 'border-bb-primary text-bb-primary'
                : 'border-transparent text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            Atletas
          </button>
          <button
            onClick={() => setTab('academies')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'academies'
                ? 'border-bb-primary text-bb-primary'
                : 'border-transparent text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            Academias
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select value={modality} onChange={(e) => setModality(e.target.value)} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
            <option value="">Modalidade</option>
            {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {tab === 'athletes' && (
            <>
              <select value={belt} onChange={(e) => setBelt(e.target.value)} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
                <option value="">Faixa</option>
                {BELTS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
                <option value="">Peso</option>
                {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </>
          )}
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm">
            <option value="">Região</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Points explanation */}
        <Card className="mb-6 p-4">
          <p className="text-xs text-bb-gray-500">
            <span className="font-bold">Pontuação:</span> Ouro = 9pts | Prata = 3pts | Bronze = 1pt.
            Multiplicadores: Local (1x) | Estadual (2x) | Nacional (3x). Período: últimos 12 meses.
          </p>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : tab === 'athletes' ? (
          /* Athletes ranking table */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-200 bg-bb-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">Atleta</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold text-bb-gray-500 sm:table-cell">Academia</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-bb-gray-500 md:table-cell">Faixa</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-bb-gray-500">Pts</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-yellow-600 sm:table-cell">&#129351;</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-gray-500 sm:table-cell">&#129352;</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-orange-600 sm:table-cell">&#129353;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-gray-100">
                  {athletes.length === 0 && (
                    <tr><td colSpan={8}>
                      <EmptyState
                        icon="🥋"
                        title="Nenhum atleta encontrado"
                        description="Ajuste os filtros de modalidade, faixa, peso ou região para encontrar atletas."
                        variant="search"
                      />
                    </td></tr>
                  )}
                  {athletes.map((a) => {
                    const isMe = a.athlete_id === currentUserId;
                    return (
                      <tr
                        key={a.athlete_id}
                        className={`transition-colors hover:bg-bb-gray-50 ${isMe ? 'bg-bb-primary/5 border-l-2 border-l-bb-primary' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${a.position <= 3 ? 'text-bb-primary' : 'text-bb-gray-500'}`}>
                            {a.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/ranking/atleta/${a.athlete_id}`} className="hover:underline">
                            <p className="font-semibold text-bb-black">
                              {a.athlete_name}
                              {isMe && <span className="ml-2 text-[10px] text-bb-primary">(Você)</span>}
                            </p>
                            <p className="text-xs text-bb-gray-500 sm:hidden">{a.academy}</p>
                          </Link>
                        </td>
                        <td className="hidden px-4 py-3 text-bb-gray-500 sm:table-cell">{a.academy}</td>
                        <td className="hidden px-4 py-3 text-center md:table-cell">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${BELT_COLORS[a.belt] ?? 'bg-bb-gray-200 text-bb-gray-600'}`}>
                            {a.belt}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-bb-black">{a.points}</td>
                        <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.gold || '-'}</td>
                        <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.silver || '-'}</td>
                        <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.bronze || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Academy ranking table */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-200 bg-bb-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-bb-gray-500">Academia</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold text-bb-gray-500 sm:table-cell">Região</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-bb-gray-500">Pts</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-bb-gray-500 sm:table-cell">Atletas</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-yellow-600">&#129351;</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-gray-500 sm:table-cell">&#129352;</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-bold text-orange-600 sm:table-cell">&#129353;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-gray-100">
                  {academies.length === 0 && (
                    <tr><td colSpan={8}>
                      <EmptyState
                        icon="🏆"
                        title="Nenhuma academia encontrada"
                        description="Ajuste os filtros de modalidade ou região para encontrar academias."
                        variant="search"
                      />
                    </td></tr>
                  )}
                  {academies.map((a) => (
                    <tr key={a.academy_id} className={`transition-colors hover:bg-bb-gray-50 ${a.position <= 3 ? 'bg-yellow-50/30' : ''}`}>
                      <td className="px-4 py-3 font-bold text-bb-gray-500">{a.position}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-bb-black">{a.academy_name}</p>
                        <p className="text-xs text-bb-gray-500 sm:hidden">{a.region}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-bb-gray-500 sm:table-cell">{a.region}</td>
                      <td className="px-4 py-3 text-center font-bold text-bb-black">{a.total_points}</td>
                      <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.athletes_count}</td>
                      <td className="px-4 py-3 text-center text-bb-gray-500">{a.gold || '-'}</td>
                      <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.silver || '-'}</td>
                      <td className="hidden px-4 py-3 text-center text-bb-gray-500 sm:table-cell">{a.bronze || '-'}</td>
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

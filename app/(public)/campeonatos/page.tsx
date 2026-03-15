'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getChampionships,
  type ChampionshipDTO,
  type ChampionshipFilters,
  type ChampionshipStatus,
} from '@/lib/api/championships.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

const STATUS_LABELS: Record<ChampionshipStatus, { label: string; color: string }> = {
  draft: { label: 'Em breve', color: 'bg-gray-100 text-gray-600' },
  registration_open: { label: 'Inscrições abertas', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Inscrições encerradas', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  finished: { label: 'Finalizado', color: 'bg-bb-gray-100 text-bb-gray-500' },
};

const MODALITIES = ['BJJ', 'No-Gi', 'Judô', 'MMA', 'Muay Thai'];
const REGIONS = ['São Paulo', 'Rio de Janeiro', 'Paraná', 'Bahia', 'Minas Gerais', 'Santa Catarina'];

export default function CampeonatosPage() {
  const [championships, setChampionships] = useState<ChampionshipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modality, setModality] = useState('');
  const [region, setRegion] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ChampionshipFilters = {};
      if (modality) filters.modality = modality;
      if (region) filters.region = region;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      const data = await getChampionships(filters);
      setChampionships(data);
    } finally {
      setLoading(false);
    }
  }, [modality, region, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group by month for timeline
  const grouped = championships.reduce<Record<string, ChampionshipDTO[]>>((acc, c) => {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-bb-black to-gray-800 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="Campeonatos" subtitle="Calendário de competições de artes marciais" />

          {/* Filters */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white"
            >
              <option value="" className="text-bb-black">Modalidade</option>
              {MODALITIES.map((m) => (
                <option key={m} value={m} className="text-bb-black">{m}</option>
              ))}
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white"
            >
              <option value="" className="text-bb-black">Região</option>
              {REGIONS.map((r) => (
                <option key={r} value={r} className="text-bb-black">{r}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Data início"
              className="rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Data fim"
              className="rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : championships.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-bb-gray-500">Nenhum campeonato encontrado</p>
            <p className="mt-1 text-sm text-bb-gray-400">Tente ajustar seus filtros</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonths.map((month) => {
              const d = new Date(month + '-01');
              const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

              return (
                <div key={month}>
                  {/* Month header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-bb-primary" />
                    <h2 className="text-lg font-bold capitalize text-bb-black">{label}</h2>
                    <div className="h-px flex-1 bg-bb-gray-200" />
                  </div>

                  {/* Championship cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[month].map((champ) => {
                      const statusInfo = STATUS_LABELS[champ.status];
                      const spotsLeft = champ.max_participants - champ.current_participants;

                      return (
                        <Link key={champ.id} href={`/campeonatos/${champ.id}`}>
                          <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                            {/* Top accent */}
                            <div className={`h-1 ${
                              champ.status === 'registration_open' ? 'bg-green-500' :
                              champ.status === 'in_progress' ? 'bg-blue-500' :
                              champ.status === 'finished' ? 'bg-bb-gray-300' : 'bg-bb-gray-200'
                            }`} />

                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-bold text-bb-black line-clamp-2">{champ.name}</h3>
                                <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>

                              <div className="mt-3 space-y-1.5 text-xs text-bb-gray-500">
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{new Date(champ.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="line-clamp-1">{champ.location}</span>
                                </div>
                              </div>

                              {/* Modalities */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {champ.modalities.map((m) => (
                                  <span key={m} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] font-medium text-bb-gray-600">{m}</span>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="mt-3 flex items-center justify-between border-t border-bb-gray-100 pt-3">
                                <div className="text-xs">
                                  {champ.status === 'registration_open' && spotsLeft > 0 ? (
                                    <span className="font-medium text-green-600">{spotsLeft} vagas restantes</span>
                                  ) : (
                                    <span className="text-bb-gray-400">{champ.current_participants} inscritos</span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-bb-black">
                                  R$ {champ.registration_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

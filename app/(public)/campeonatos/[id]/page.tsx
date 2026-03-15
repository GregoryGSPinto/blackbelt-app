'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getChampionshipById,
  type ChampionshipDTO,
  type ChampionshipStatus,
} from '@/lib/api/championships.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const STATUS_LABELS: Record<ChampionshipStatus, { label: string; color: string }> = {
  draft: { label: 'Em breve', color: 'bg-gray-100 text-gray-600' },
  registration_open: { label: 'Inscrições abertas', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Inscrições encerradas', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  finished: { label: 'Finalizado', color: 'bg-bb-gray-100 text-bb-gray-500' },
};

const GENDER_LABEL: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino', misto: 'Misto' };

export default function CampeonatoDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [championship, setChampionship] = useState<ChampionshipDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getChampionshipById(id)
      .then(setChampionship)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!championship) return <div className="py-20 text-center text-bb-gray-500">Campeonato não encontrado</div>;

  const statusInfo = STATUS_LABELS[championship.status];
  const spotsLeft = championship.max_participants - championship.current_participants;
  const deadlinePassed = new Date(championship.registration_deadline) < new Date();

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-bb-black to-gray-800 px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/campeonatos" className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{championship.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(championship.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {championship.location}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">R$ {championship.registration_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-white/60">Taxa de inscrição</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card className="p-5">
              <h2 className="text-lg font-bold text-bb-black">Sobre</h2>
              <p className="mt-2 text-sm leading-relaxed text-bb-gray-500">{championship.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {championship.modalities.map((m) => (
                  <span key={m} className="rounded-full bg-bb-gray-100 px-3 py-1 text-xs font-medium text-bb-gray-600">{m}</span>
                ))}
              </div>
            </Card>

            {/* Rules */}
            {championship.rules_pdf_url && (
              <Card className="p-5">
                <h2 className="text-lg font-bold text-bb-black">Regulamento</h2>
                <a
                  href={championship.rules_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-bb-gray-50 px-4 py-3 text-sm font-medium text-bb-primary hover:bg-bb-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Baixar regulamento (PDF)
                </a>
              </Card>
            )}

            {/* Categories */}
            <Card className="p-5">
              <h2 className="mb-4 text-lg font-bold text-bb-black">Categorias ({championship.categories.length})</h2>
              <div className="space-y-2">
                {championship.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedCategory === cat.id
                        ? 'border-bb-primary/30 bg-bb-primary/5'
                        : 'border-bb-gray-200 hover:bg-bb-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-bb-black">
                          {cat.modality} - {cat.belt_range}
                        </p>
                        <p className="text-xs text-bb-gray-500">
                          {cat.weight_range} | {cat.age_range} | {GENDER_LABEL[cat.gender]}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs font-medium text-bb-gray-600">
                          {cat.participants.length} atletas
                        </span>
                      </div>
                    </div>

                    {/* Expanded: show participants */}
                    {selectedCategory === cat.id && cat.participants.length > 0 && (
                      <div className="mt-3 border-t border-bb-gray-100 pt-3">
                        <p className="mb-2 text-xs font-medium text-bb-gray-500">Atletas inscritos:</p>
                        <div className="space-y-1">
                          {cat.participants.map((p) => (
                            <div key={p.athlete_id} className="flex items-center justify-between rounded-lg bg-bb-gray-50 px-3 py-1.5">
                              <span className="text-xs font-medium text-bb-black">{p.athlete_name}</span>
                              <span className="text-[10px] text-bb-gray-400">{p.academy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration Card */}
            <Card className="sticky top-4 p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-bb-gray-50 p-3">
                    <p className="text-lg font-bold text-bb-black">{championship.current_participants}</p>
                    <p className="text-xs text-bb-gray-500">Inscritos</p>
                  </div>
                  <div className="rounded-xl bg-bb-gray-50 p-3">
                    <p className="text-lg font-bold text-bb-black">{spotsLeft}</p>
                    <p className="text-xs text-bb-gray-500">Vagas</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-bb-gray-500">
                  <div className="flex justify-between">
                    <span>Prazo de inscrição</span>
                    <span className={`font-medium ${deadlinePassed ? 'text-red-500' : 'text-bb-black'}`}>
                      {new Date(championship.registration_deadline).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categorias</span>
                    <span className="font-medium text-bb-black">{championship.categories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidades</span>
                    <span className="font-medium text-bb-black">{championship.modalities.join(', ')}</span>
                  </div>
                </div>

                {championship.status === 'registration_open' && !deadlinePassed && spotsLeft > 0 ? (
                  <Link href={`/campeonatos/${championship.id}/inscricao`}>
                    <Button variant="primary" className="w-full">Inscrever-se</Button>
                  </Link>
                ) : championship.status === 'in_progress' && championship.live_stream_url ? (
                  <Link href={`/campeonatos/${championship.id}/live`}>
                    <Button variant="primary" className="w-full">Acompanhar ao vivo</Button>
                  </Link>
                ) : championship.status === 'finished' ? (
                  <Link href={`/campeonatos/${championship.id}/resultados`}>
                    <Button variant="secondary" className="w-full">Ver resultados</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {deadlinePassed ? 'Inscrições encerradas' : 'Inscrições em breve'}
                  </Button>
                )}

                {championship.live_stream_url && championship.status === 'in_progress' && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-600">Transmissão ao vivo</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getCategories,
  getRegistrations,
  type Tournament,
  type TournamentCategory,
  type TournamentRegistration,
} from '@/lib/api/compete.service';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  AwardIcon,
  ChevronRightIcon,
  ShareIcon,
} from '@/components/shell/icons';

const STATUS_CONFIG: Record<Tournament['status'], { label: string; bg: string; text: string }> = {
  aguardando_aprovacao: { label: 'Aguardando aprovacao', bg: 'rgba(234,179,8,0.1)', text: '#ca8a04' },
  draft: { label: 'Rascunho', bg: 'rgba(156,163,175,0.1)', text: 'var(--bb-ink-40)' },
  published: { label: 'Publicado', bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' },
  registration_open: { label: 'Inscricoes abertas', bg: 'rgba(34,197,94,0.15)', text: '#16a34a' },
  registration_closed: { label: 'Inscricoes encerradas', bg: 'rgba(234,179,8,0.15)', text: '#ca8a04' },
  weigh_in: { label: 'Pesagem', bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
  live: { label: 'Ao vivo', bg: 'rgba(59,130,246,0.15)', text: '#2563eb' },
  completed: { label: 'Finalizado', bg: 'rgba(156,163,175,0.1)', text: 'var(--bb-ink-40)' },
  cancelled: { label: 'Cancelado', bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
};

type Tab = 'info' | 'categories' | 'registrations' | 'brackets' | 'live' | 'results';

const TABS: { key: Tab; label: string }[] = [
  { key: 'info', label: 'Informacoes' },
  { key: 'categories', label: 'Categorias' },
  { key: 'registrations', label: 'Inscricoes' },
  { key: 'brackets', label: 'Chaves' },
  { key: 'live', label: 'Ao Vivo' },
  { key: 'results', label: 'Resultados' },
];

export default function TournamentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await getTournament(slug);
        setTournament(t);
        const [cats, regs] = await Promise.all([
          getCategories(t.id),
          getRegistrations(t.id),
        ]);
        setCategories(cats);
        setRegistrations(regs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: tournament?.name, url: window.location.href });
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Carregando torneio...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <AwardIcon className="h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Torneio nao encontrado</p>
        <Link href="/compete" className="text-sm underline" style={{ color: 'var(--bb-brand)' }}>
          Voltar para torneios
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[tournament.status];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      {/* Banner */}
      <div
        className="relative h-48 sm:h-64"
        style={{
          background: tournament.banner_url
            ? `url(${tournament.banner_url}) center/cover`
            : 'var(--bb-brand-gradient)',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))' }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
            <h1 className="text-2xl font-black text-white sm:text-4xl">{tournament.name}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Info bar */}
        <div
          className="-mt-4 flex flex-wrap items-center gap-4 rounded-xl p-4 sm:gap-6"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: 'var(--bb-shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            <CalendarIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <div>
              <div className="font-semibold">
                {new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              {tournament.end_date !== tournament.start_date && (
                <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  ate {new Date(tournament.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            <MapPinIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <div>
              <div className="font-semibold">{tournament.location}</div>
              <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {tournament.address} - {tournament.city}/{tournament.state}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            <UsersIcon className="h-4 w-4" style={{ color: 'var(--bb-brand)' }} />
            <div>
              <div className="font-semibold">{registrations.length} inscritos</div>
              <div className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{categories.length} categorias</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              style={{
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              <ShareIcon className="h-3.5 w-3.5" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="mt-6 flex gap-1 overflow-x-auto border-b"
          style={{ borderColor: 'var(--bb-glass-border)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor: activeTab === tab.key ? 'var(--bb-brand)' : 'transparent',
                color: activeTab === tab.key ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <h2 className="mb-3 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Sobre o torneio</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                    {tournament.description}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Organizador</p>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{tournament.organizer_name}</p>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Taxa de inscricao</p>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      R$ {tournament.registration_fee.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Prazo de inscricao</p>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {new Date(tournament.registration_deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Areas de luta</p>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{tournament.areas_count} areas</p>
                  </div>
                </div>

                {/* Modalities */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Modalidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {tournament.modalities.map((mod) => (
                      <span
                        key={mod}
                        className="rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{ backgroundColor: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Registration CTA */}
                {(tournament.status === 'registration_open') && (
                  <div
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Inscreva-se</h3>
                    <p className="mb-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      Vagas limitadas. Garanta sua inscricao.
                    </p>
                    <Link
                      href={`/compete/${slug}/inscricao`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                      style={{
                        background: 'var(--bb-brand-gradient)',
                        borderRadius: 'var(--bb-radius-lg)',
                        boxShadow: 'var(--bb-shadow-md)',
                      }}
                    >
                      <AwardIcon className="h-4 w-4" />
                      Fazer inscricao
                    </Link>
                  </div>
                )}

                {/* Quick links */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>Links rapidos</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/compete/${slug}/live`}
                      className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                    >
                      <span>Placar ao vivo</span>
                      <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                    </Link>
                    <Link
                      href={`/compete/${slug}/bracket`}
                      className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                    >
                      <span>Chaves</span>
                      <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                    </Link>
                    <Link
                      href={`/compete/${slug}/resultados`}
                      className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                    >
                      <span>Resultados</span>
                      <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                    </Link>
                    {tournament.rules_url && (
                      <a
                        href={tournament.rules_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        <span>Regulamento</span>
                        <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhuma categoria cadastrada ainda
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{
                      backgroundColor: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                    }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{cat.name}</p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {cat.modality} | {cat.belt_min ?? '?'}–{cat.belt_max ?? '?'} | {cat.weight_min ?? '?'}–{cat.weight_max ?? '?'}kg | {cat.age_min ?? '?'}–{cat.age_max ?? '?'} anos | {cat.gender === 'male' ? 'Masculino' : cat.gender === 'female' ? 'Feminino' : 'Misto'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                        {cat.registered_count}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>inscritos</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === 'registrations' && (
            <div
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {registrations.length === 0 ? (
                <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhuma inscricao confirmada ainda
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Atleta</th>
                        <th className="hidden px-4 py-3 text-left text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Academia</th>
                        <th className="hidden px-4 py-3 text-center text-xs font-bold sm:table-cell" style={{ color: 'var(--bb-ink-40)' }}>Peso</th>
                        <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                            {reg.athlete_name}
                            <span className="block text-xs sm:hidden" style={{ color: 'var(--bb-ink-40)' }}>{reg.academy_name}</span>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{reg.academy_name}</td>
                          <td className="hidden px-4 py-3 text-center sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>{reg.weight}kg</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                backgroundColor: reg.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : reg.status === 'pending' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                                color: reg.status === 'confirmed' ? '#16a34a' : reg.status === 'pending' ? '#ca8a04' : '#dc2626',
                              }}
                            >
                              {reg.status === 'confirmed' ? 'Confirmado' : reg.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Brackets Tab */}
          {activeTab === 'brackets' && (
            <div className="text-center py-8">
              <AwardIcon className="mx-auto h-10 w-10" style={{ color: 'var(--bb-ink-40)' }} />
              <p className="mt-3 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Visualizar chaves</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Selecione uma categoria para ver a chave completa</p>
              <Link
                href={`/compete/${slug}/bracket`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-sm)' }}
              >
                Ver chaves
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Live Tab */}
          {activeTab === 'live' && (
            <div className="text-center py-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              </div>
              <p className="mt-3 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Placar ao vivo</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Acompanhe as lutas em tempo real</p>
              <Link
                href={`/compete/${slug}/live`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-sm)' }}
              >
                Abrir placar
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="text-center py-8">
              <AwardIcon className="mx-auto h-10 w-10" style={{ color: 'var(--bb-ink-40)' }} />
              <p className="mt-3 font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Resultados</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Confira o quadro de medalhas e resultados por categoria</p>
              <Link
                href={`/compete/${slug}/resultados`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-sm)' }}
              >
                Ver resultados
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

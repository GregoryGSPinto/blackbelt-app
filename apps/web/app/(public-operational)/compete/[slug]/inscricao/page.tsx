'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getTournament,
  getCategories,
  registerAthlete,
  type Tournament,
  type TournamentCategory,
  type TournamentRegistration,
} from '@/lib/api/compete.service';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AwardIcon,
  ChevronDownIcon,
  CalendarIcon,
  MapPinIcon,
} from '@/components/shell/icons';

export default function InscricaoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<TournamentRegistration | null>(null);
  const [error, setError] = useState('');

  // Form fields
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [academy, setAcademy] = useState('');
  const [belt, setBelt] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const t = await getTournament(slug);
        setTournament(t);
        const cats = await getCategories(t.id);
        // Filter by available spots if max_athletes is set
        setCategories(cats.filter((c) => c.max_athletes == null || c.registered_count < c.max_athletes));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tournament || !categoryId) return;

    setSubmitting(true);
    setError('');
    try {
      const result = await registerAthlete(tournament.id, categoryId, {
        athlete_profile_id: cpf.replace(/\D/g, ''),
        academy_id: 'guest',
        athlete_name: name,
        academy_name: academy,
        weight: parseFloat(weight),
      });
      setSuccess(result);
    } catch {
      setError('Erro ao realizar inscricao. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--bb-brand)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="skeleton mt-3 inline-block h-3 w-24 rounded" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <AlertTriangleIcon className="h-12 w-12" style={{ color: 'var(--bb-ink-40)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Torneio nao encontrado</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen px-4 py-16" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl p-8 text-center"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: 'var(--bb-shadow-md)',
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
          >
            <CheckCircleIcon className="h-8 w-8" style={{ color: '#16a34a' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Inscricao realizada!</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Sua inscricao no torneio <strong>{tournament.name}</strong> foi registrada com sucesso.
          </p>

          <div
            className="mt-6 rounded-lg p-4 text-left"
            style={{
              backgroundColor: 'var(--bb-depth-3)',
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--bb-ink-40)' }}>Atleta</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{success.athlete_name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--bb-ink-40)' }}>Academia</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{success.academy_name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--bb-ink-40)' }}>Peso</span>
                <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{success.weight}kg</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--bb-ink-40)' }}>Status</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                  {success.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/compete/${slug}`}
              className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors"
              style={{
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
              }}
            >
              Ver torneio
            </Link>
            <Link
              href="/compete"
              className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-sm)' }}
            >
              Outros torneios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const BELTS = ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
      <div className="mx-auto max-w-2xl">
        {/* Tournament summary */}
        <div
          className="mb-6 rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <Link href={`/compete/${slug}`} className="hover:underline">
            <h2 className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>{tournament.name}</h2>
          </Link>
          <div className="mt-2 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              {tournament.city}/{tournament.state}
            </span>
          </div>
        </div>

        {/* Registration form */}
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            boxShadow: 'var(--bb-shadow-md)',
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              <AwardIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Inscricao</h1>
              <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Preencha os dados para se inscrever</p>
            </div>
          </div>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg p-3 text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 'var(--bb-radius-sm)' }}
            >
              <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Categoria *
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full appearance-none px-4 py-2.5 pr-10 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.registered_count} inscritos)
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Nome completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome completo"
                className="w-full px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              />
            </div>

            {/* CPF */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                CPF *
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                required
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              />
            </div>

            {/* Academy */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Academia *
              </label>
              <input
                type="text"
                value={academy}
                onChange={(e) => setAcademy(e.target.value)}
                required
                placeholder="Nome da sua academia"
                className="w-full px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              />
            </div>

            {/* Belt + Weight row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Faixa *
                </label>
                <div className="relative">
                  <select
                    value={belt}
                    onChange={(e) => setBelt(e.target.value)}
                    required
                    className="w-full appearance-none px-4 py-2.5 pr-10 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                      borderRadius: 'var(--bb-radius-sm)',
                    }}
                  >
                    <option value="">Selecione</option>
                    {BELTS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bb-ink-40)' }} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  step="0.1"
                  min="30"
                  max="200"
                  placeholder="Ex: 76.5"
                  className="w-full px-4 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                />
              </div>
            </div>

            {/* Fee info */}
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                backgroundColor: 'var(--bb-brand-surface)',
                borderRadius: 'var(--bb-radius-sm)',
                color: 'var(--bb-brand)',
              }}
            >
              Taxa de inscricao: <strong>R$ {tournament.registration_fee.toFixed(2).replace('.', ',')}</strong>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                background: 'var(--bb-brand-gradient)',
                borderRadius: 'var(--bb-radius-lg)',
                boxShadow: 'var(--bb-shadow-md)',
              }}
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <AwardIcon className="h-4 w-4" />
                  Confirmar inscricao
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

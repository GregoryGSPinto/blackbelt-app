'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getRelatorioProfessores,
  getDetalheProfessor,
} from '@/lib/api/relatorio-professor.service';
import type {
  RelatorioProfessor,
  DetalheProfessor,
} from '@/lib/api/relatorio-professor.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Dynamic Recharts imports ──────────────────────────────────────────

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

// ── Constants ──────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#C62828', '#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F'];

type Periodo = 'mes' | '3meses' | 'ano';

const PERIODO_LABEL: Record<Periodo, string> = {
  mes: 'Este Mes',
  '3meses': 'Ultimos 3 Meses',
  ano: 'Este Ano',
};

// ── Helpers ────────────────────────────────────────────────────────────

function getInitials(nome: string): string {
  const parts = nome.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getPresencaColor(taxa: number): string {
  if (taxa >= 80) return 'var(--bb-success)';
  if (taxa >= 60) return '#EAB308';
  return 'var(--bb-error)';
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let stars = '';
  for (let i = 0; i < full; i++) stars += '\u2605';
  if (half) stars += '\u2606';
  for (let i = 0; i < empty; i++) stars += '\u2606';
  return stars;
}

// ── Page ───────────────────────────────────────────────────────────────

export default function RelatorioProfessoresPage() {
  const [professores, setProfessores] = useState<RelatorioProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessor, setSelectedProfessor] = useState<DetalheProfessor | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  useEffect(() => {
    async function load() {
      try {
        const data = await getRelatorioProfessores('academy-1', periodo);
        setProfessores(data);
      } catch {
        /* silently fail for read-only page */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [periodo]);

  async function handleVerDetalhes(professorId: string) {
    setLoadingDetail(true);
    try {
      const detail = await getDetalheProfessor(professorId, periodo);
      setSelectedProfessor(detail);
    } catch {
      /* silently fail */
    } finally {
      setLoadingDetail(false);
    }
  }

  // ── Skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Relatorio de Professores
        </h1>
        <div
          className="flex overflow-hidden"
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {(['mes', '3meses', 'ano'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriodo(p); setSelectedProfessor(null); }}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                background: periodo === p ? 'var(--bb-brand)' : 'transparent',
                color: periodo === p ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {PERIODO_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Professor Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {professores.map((prof, index) => (
          <ProfessorCard
            key={prof.professorId}
            professor={prof}
            colorIndex={index}
            onVerDetalhes={() => handleVerDetalhes(prof.professorId)}
          />
        ))}
      </div>

      {professores.length === 0 && (
        <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Nenhum professor encontrado
        </div>
      )}

      {/* Detail Panel */}
      {loadingDetail && (
        <Card className="space-y-4 p-6">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-48" />
        </Card>
      )}

      {selectedProfessor && !loadingDetail && (
        <DetailPanel
          professor={selectedProfessor}
          onClose={() => setSelectedProfessor(null)}
        />
      )}
    </div>
  );
}

// ── Professor Card ───────────────────────────────────────────────────

function ProfessorCard({
  professor,
  colorIndex,
  onVerDetalhes,
}: {
  professor: RelatorioProfessor;
  colorIndex: number;
  onVerDetalhes: () => void;
}) {
  const presencaColor = getPresencaColor(professor.taxaPresencaMedia);

  return (
    <Card className="p-5">
      {/* Avatar + Name */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center text-sm font-bold text-white"
          style={{
            borderRadius: '50%',
            background: getAvatarColor(colorIndex),
          }}
        >
          {getInitials(professor.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {professor.nome}
          </p>
        </div>
      </div>

      {/* 2x2 Metrics Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Aulas/Mes</p>
          <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {professor.totalAulasNoMes}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Media Alunos</p>
          <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {professor.mediaAlunosPorAula}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Taxa Presenca</p>
          <p className="text-lg font-bold" style={{ color: presencaColor }}>
            {professor.taxaPresencaMedia}%
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>Avaliacao</p>
          <p className="text-lg" style={{ color: '#F59E0B' }}>
            {renderStars(professor.avaliacaoMedia)}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--bb-ink-60)' }}>{professor.avaliacaoMedia}</p>
        </div>
      </div>

      {/* Presenca Progress Bar */}
      <div className="mb-3">
        <div
          className="h-2 w-full overflow-hidden"
          style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${professor.taxaPresencaMedia}%`,
              background: presencaColor,
              borderRadius: 'var(--bb-radius-sm)',
            }}
          />
        </div>
      </div>

      {/* Turmas Badges */}
      <div className="mb-4 flex flex-wrap gap-1">
        {professor.turmas.map((turma) => (
          <span
            key={turma}
            className="px-2 py-0.5 text-[10px] font-medium"
            style={{
              borderRadius: 'var(--bb-radius-sm)',
              background: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-60)',
            }}
          >
            {turma}
          </span>
        ))}
      </div>

      {/* Ver Detalhes */}
      <Button variant="secondary" className="w-full" size="sm" onClick={onVerDetalhes}>
        Ver Detalhes
      </Button>
    </Card>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────

function DetailPanel({
  professor,
  onClose,
}: {
  professor: DetalheProfessor;
  onClose: () => void;
}) {
  const aulasToShow = professor.aulasDetalhadas
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10);

  return (
    <Card className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center text-sm font-bold text-white"
            style={{ borderRadius: '50%', background: '#C62828' }}
          >
            {getInitials(professor.nome)}
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {professor.nome}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {professor.turmas.join(' | ')}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* Evolucao Mensal Chart */}
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Evolucao Mensal — Presenca (%)
        </h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={professor.evolucaoMensal} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
              <XAxis
                dataKey="mes"
                tick={{ fill: 'var(--bb-ink-60)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--bb-glass-border)' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--bb-ink-60)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--bb-glass-border)' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 8,
                  color: 'var(--bb-ink-100)',
                }}
                formatter={(value) => [`${value}%`, 'Presenca']}
              />
              <Line
                type="monotone"
                dataKey="mediaPresenca"
                stroke="#C62828"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--bb-depth-3)', stroke: '#C62828', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#C62828' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aulas Detalhadas Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Ultimas Aulas
        </h3>

        {/* Mobile: Cards */}
        <div className="space-y-2 md:hidden">
          {aulasToShow.map((aula, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {aula.turma}
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {new Date(aula.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  {aula.presentes}/{aula.total}
                </p>
                <p className="text-xs" style={{ color: '#F59E0B' }}>
                  {renderStars(aula.avaliacao)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Data', 'Turma', 'Presentes/Total', 'Avaliacao'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-4)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aulasToShow.map((aula, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td className="px-4 py-2" style={{ color: 'var(--bb-ink-80)' }}>
                    {new Date(aula.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--bb-ink-100)' }}>
                    {aula.turma}
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--bb-ink-80)' }}>
                    {aula.presentes}/{aula.total}
                  </td>
                  <td className="px-4 py-2" style={{ color: '#F59E0B' }}>
                    {renderStars(aula.avaliacao)}
                    <span className="ml-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      ({aula.avaliacao})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getProfessorDashboard } from '@/lib/api/professor.service';
import type { AlunoResumoDTO } from '@/lib/api/professor.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

const BELT_COLORS: Record<string, string> = {
  white: '#FAFAFA',
  gray: '#9CA3AF',
  yellow: '#EAB308',
  orange: '#EA580C',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#9333EA',
  brown: '#92400E',
  black: '#0A0A0A',
};

const BELT_LABEL: Record<string, string> = {
  white: 'Branca',
  gray: 'Cinza',
  yellow: 'Amarela',
  orange: 'Laranja',
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

function daysSinceDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function attendanceLabel(days: number | null): { text: string; color: string } {
  if (days === null) return { text: 'Nunca treinou', color: 'text-red-600' };
  if (days === 0) return { text: 'Treinou hoje', color: 'text-green-600' };
  if (days === 1) return { text: 'Treinou ontem', color: 'text-green-600' };
  if (days <= 3) return { text: `${days}d atras`, color: 'text-yellow-600' };
  return { text: `${days}d sem treinar`, color: 'text-red-600' };
}

export default function ProfessorAlunosPage() {
  const [alunos, setAlunos] = useState<AlunoResumoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBelt, setFilterBelt] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessorDashboard('prof-1');
        setAlunos(data.meusAlunos);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredAlunos = useMemo(() => {
    return alunos.filter((a) => {
      const matchesSearch = a.display_name.toLowerCase().includes(search.toLowerCase());
      const matchesBelt = filterBelt === 'all' || a.belt === filterBelt;
      return matchesSearch && matchesBelt;
    });
  }, [alunos, search, filterBelt]);

  const beltCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of alunos) {
      counts[a.belt] = (counts[a.belt] ?? 0) + 1;
    }
    return counts;
  }, [alunos]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (alunos.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Nenhum aluno encontrado"
          description="Voce nao possui alunos matriculados nas suas turmas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-bb-gray-900">Meus Alunos</h1>
        <p className="text-sm text-bb-gray-500">
          {alunos.length} {alunos.length === 1 ? 'aluno' : 'alunos'} nas suas turmas
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar aluno..."
        className="w-full rounded-lg border border-bb-gray-300 px-4 py-2 text-sm text-bb-gray-900 placeholder:text-bb-gray-500 focus:border-bb-red focus:outline-none"
      />

      {/* Belt Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterBelt('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filterBelt === 'all'
              ? 'bg-bb-red text-white'
              : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-300'
          }`}
        >
          Todas ({alunos.length})
        </button>
        {Object.entries(beltCounts).map(([belt, count]) => (
          <button
            key={belt}
            onClick={() => setFilterBelt(belt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterBelt === belt
                ? 'bg-bb-red text-white'
                : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-300'
            }`}
          >
            {BELT_LABEL[belt] ?? belt} ({count})
          </button>
        ))}
      </div>

      {/* Student List */}
      {filteredAlunos.length === 0 ? (
        <p className="py-8 text-center text-sm text-bb-gray-500">
          Nenhum aluno encontrado com esses filtros.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredAlunos.map((aluno) => {
            const days = daysSinceDate(aluno.ultima_presenca);
            const attendance = attendanceLabel(days);
            return (
              <Card key={aluno.student_id} variant="outlined" className="flex items-center gap-3 p-3">
                <Avatar name={aluno.display_name} src={aluno.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-bb-gray-900">{aluno.display_name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge
                      variant="belt"
                      beltColor={BELT_COLORS[aluno.belt] ?? '#D4D4D4'}
                      size="sm"
                    >
                      {BELT_LABEL[aluno.belt] ?? aluno.belt}
                    </Badge>
                    <span className={`text-xs font-medium ${attendance.color}`}>
                      {attendance.text}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getAcademyHealth, getStudentHealthScores } from '@/lib/api/health-score.service';
import type { AcademyHealthSummary, StudentHealthScore } from '@/lib/api/health-score.service';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const RISK_LABEL: Record<string, string> = {
  low: 'Saudável',
  medium: 'Atenção',
  high: 'Risco',
  critical: 'Crítico',
};

const RISK_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

function gaugeColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#ef4444';
}

// Monthly subscription value estimate per student
const AVG_MONTHLY_VALUE = 180;

export default function RetencaoPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AcademyHealthSummary | null>(null);
  const [students, setStudents] = useState<StudentHealthScore[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentHealthScore | null>(null);

  useEffect(() => {
    Promise.all([
      getAcademyHealth('academy-1'),
      getStudentHealthScores('academy-1'),
    ])
      .then(([s, st]) => {
        setSummary(s);
        // Sort by score ascending (worst first)
        setStudents(st.sort((a, b) => a.score - b.score));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Retenção de Alunos</h1>

      {/* Gauge + Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Gauge */}
          <Card className="flex flex-col items-center justify-center p-6 lg:col-span-2">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={gaugeColor(summary.average_score)}
                  strokeWidth="12"
                  strokeDasharray={`${(summary.average_score / 100) * 327} 327`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-bb-black">{summary.average_score}</span>
                <span className="text-xs text-bb-gray-500">Health Score</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-bb-gray-500">Média da Academia</p>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-3">
            {[
              { label: 'Total de Alunos', value: summary.total_students, color: 'text-bb-black' },
              { label: 'Saudáveis', value: summary.healthy, color: 'text-green-600' },
              { label: 'Em Risco', value: summary.at_risk, color: 'text-yellow-600' },
              { label: 'Críticos', value: summary.critical, color: 'text-red-600' },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-xs text-bb-gray-500">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Students Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Alunos por Score</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Aluno</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Faixa</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Score</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Risco</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Freq.</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Financeiro</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Último Check-in</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ação</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.student_id}
                  className={`border-b border-bb-gray-100 ${s.risk === 'critical' ? 'bg-red-50' : s.risk === 'high' ? 'bg-orange-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-100 text-xs font-bold text-bb-gray-500">
                        {s.display_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-bb-black">{s.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center capitalize text-bb-gray-500">{s.belt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-bb-gray-100">
                        <div
                          className={`h-full rounded-full ${scoreColor(s.score)}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-bb-gray-700">{s.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_COLOR[s.risk]}`}>
                      {RISK_LABEL[s.risk]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-bb-gray-500">{s.frequency_score}%</td>
                  <td className="px-4 py-3 text-center text-bb-gray-500">{s.financial_score}%</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">
                    {s.last_checkin
                      ? new Date(s.last_checkin).toLocaleDateString('pt-BR')
                      : '—'}
                    {s.days_absent > 3 && (
                      <span className="ml-1 text-xs text-red-500">({s.days_absent}d)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="rounded-lg bg-bb-red px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Agir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Detail Modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.display_name ?? ''}
      >
        {selectedStudent && (
          <div className="space-y-5">
            {/* Profile Summary */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bb-gray-100 text-lg font-bold text-bb-gray-500">
                {selectedStudent.display_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-bb-black">{selectedStudent.display_name}</p>
                <p className="text-sm capitalize text-bb-gray-500">
                  Faixa {selectedStudent.belt} &middot;{' '}
                  <span className={`${RISK_COLOR[selectedStudent.risk]} rounded-full px-2 py-0.5 text-xs`}>
                    {RISK_LABEL[selectedStudent.risk]}
                  </span>
                </p>
                <p className="text-sm text-bb-gray-500">
                  Score geral: <span className="font-bold text-bb-black">{selectedStudent.score}/100</span>
                </p>
              </div>
            </div>

            {/* Health Score Breakdown */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-bb-black">Detalhamento do Score</p>
              {[
                { label: 'Frequência', value: selectedStudent.frequency_score },
                { label: 'Financeiro', value: selectedStudent.financial_score },
                { label: 'Evolução', value: selectedStudent.evolution_score },
                { label: 'Engajamento', value: selectedStudent.engagement_score },
                { label: 'Social', value: selectedStudent.social_score },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-bb-gray-500">{item.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bb-gray-100">
                    <div
                      className={`h-full rounded-full ${scoreColor(item.value)}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-bb-gray-700">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Insight */}
            <Card className="border-l-4 border-l-red-500 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Se perder <strong>{selectedStudent.display_name}</strong>:{' '}
                <strong>-R$ {AVG_MONTHLY_VALUE}/mês</strong>
              </p>
              {selectedStudent.days_absent > 3 && (
                <p className="mt-1 text-xs text-red-600">
                  Ausente há {selectedStudent.days_absent} dias
                  {selectedStudent.subscription_status === 'overdue' && ' — Pagamento em atraso'}
                </p>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setSelectedStudent(null)}
              >
                Mensagem
              </Button>
              <Button className="flex-1" onClick={() => setSelectedStudent(null)}>
                Perfil
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

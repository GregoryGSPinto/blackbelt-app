'use client';

import { useEffect, useState } from 'react';
import {
  getStudentProgress,
  type StudentCurriculumProgress,
  type RequirementCategory,
  REQUIREMENT_CATEGORY_LABEL,
} from '@/lib/api/curriculum.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

const CATEGORY_COLOR: Record<RequirementCategory, string> = {
  tecnicas_obrigatorias: 'bg-red-100 text-red-700',
  opcionais: 'bg-blue-100 text-blue-700',
  teoricos: 'bg-purple-100 text-purple-700',
  comportamentais: 'bg-green-100 text-green-700',
};

const CATEGORIES: RequirementCategory[] = ['tecnicas_obrigatorias', 'opcionais', 'teoricos', 'comportamentais'];

export default function CurriculoPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [progress, setProgress] = useState<StudentCurriculumProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getStudentProgress('student-1', 'bjj', 'azul')
      .then(setProgress)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!progress) return <div className="p-6 text-center text-sm text-bb-gray-500">Nenhum currículo disponível.</div>;

  const { curriculum, completed, percentage } = progress;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Meu Currículo</h1>

      {/* Target Belt */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-bb-gray-500">Próxima faixa</p>
            <p className="text-lg font-bold capitalize text-bb-black">Faixa {curriculum.target_belt}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-bb-primary">{percentage}%</p>
            <p className="text-xs text-bb-gray-500">{progress.completedCount}/{progress.total} requisitos</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-3 w-full rounded-full bg-bb-gray-200">
          <div
            className="h-full rounded-full bg-bb-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-bb-gray-500">Tempo mín.</p>
          <p className="text-sm font-bold text-bb-black">{curriculum.min_time_months}m</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-bb-gray-500">Frequência</p>
          <p className="text-sm font-bold text-bb-black">{curriculum.min_attendance}%</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-bb-gray-500">Nota mín.</p>
          <p className="text-sm font-bold text-bb-black">{curriculum.min_evaluation_score}</p>
        </Card>
      </div>

      {/* Requirements by category */}
      {CATEGORIES.map((cat) => {
        const items = curriculum.requirements.filter((r) => r.category === cat);
        if (items.length === 0) return null;
        const catCompleted = items.filter((r) => completed.includes(r.id)).length;
        return (
          <Card key={cat} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-bb-black">{REQUIREMENT_CATEGORY_LABEL[cat]}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLOR[cat]}`}>
                {catCompleted}/{items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((req) => {
                const done = completed.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${done ? 'border-green-200 bg-green-50' : 'border-bb-gray-200 bg-white'}`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-green-500 bg-green-500 text-white' : 'border-bb-gray-300'}`}>
                      {done && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-bb-black'}`}>{req.name}</p>
                        {req.required && !done && (
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Obrigatório</span>
                        )}
                        {req.video_ref_id && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">Video</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-bb-gray-500">{req.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

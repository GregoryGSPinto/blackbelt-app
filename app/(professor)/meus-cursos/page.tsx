'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourseAnalytics, type CourseAnalytics } from '@/lib/api/course-creator.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComingSoon } from '@/components/shared/ComingSoon';

const STATUS_LABEL: Record<string, string> = { draft: 'Rascunho', published: 'Publicado', suspended: 'Suspenso' };
const STATUS_VARIANT: Record<string, 'pending' | 'active' | 'inactive'> = { draft: 'pending', published: 'active', suspended: 'inactive' };

export default function MeusCursosPage() {
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getCourseAnalytics('prof-1')
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = analytics.reduce((s, a) => s + a.revenue, 0);
  const totalSales = analytics.reduce((s, a) => s + a.sales, 0);
  const totalViews = analytics.reduce((s, a) => s + a.views, 0);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/professor" backLabel="Voltar ao Painel" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Meus Cursos</h1>
        <Link href="/meus-cursos/novo">
          <Button>Criar novo curso</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Vendas Totais', value: totalSales.toLocaleString('pt-BR') },
          { label: 'Visualizações', value: totalViews.toLocaleString('pt-BR') },
          { label: 'Cursos', value: analytics.length.toString() },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-3">
            <p className="text-xs text-bb-gray-500">{kpi.label}</p>
            <p className="mt-1 text-lg font-bold text-bb-black sm:text-xl">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Course List */}
      {analytics.length === 0 && (
        <EmptyState
          icon="🎓"
          title="Nenhum curso criado"
          description="Crie cursos online para vender técnicas, drills e conteúdos exclusivos."
          actionLabel="Criar novo curso"
          actionHref="/meus-cursos/novo"
          variant="first-time"
        />
      )}
      <div className="space-y-3">
        {analytics.map((course) => {
          const isDraft = course.sales === 0 && course.views === 0;
          return (
            <Card key={course.course_id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-bb-black">{course.course_title}</h3>
                    <Badge variant={isDraft ? STATUS_VARIANT.draft : STATUS_VARIANT.published} size="sm">
                      {isDraft ? STATUS_LABEL.draft : STATUS_LABEL.published}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-bb-gray-500">
                    <span>{course.views.toLocaleString('pt-BR')} views</span>
                    <span>{course.sales.toLocaleString('pt-BR')} vendas</span>
                    <span>R$ {course.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>{course.reviews} avaliações</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/meus-cursos/financeiro">
                    <Button variant="ghost" size="sm">Financeiro</Button>
                  </Link>
                  {isDraft && (
                    <Button variant="secondary" size="sm">Editar</Button>
                  )}
                </div>
              </div>

              {/* Mini chart - monthly sales */}
              {!isDraft && (
                <div className="mt-3 flex items-end gap-1 h-12">
                  {course.monthly_data.map((m, i) => {
                    const maxSales = Math.max(...course.monthly_data.map((d) => d.sales), 1);
                    const height = (m.sales / maxSales) * 100;
                    return (
                      <div key={i} className="group relative flex-1">
                        <div
                          className="w-full rounded-t bg-bb-red/20 hover:bg-bb-red/40 transition-colors"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-bb-black px-2 py-0.5 text-[10px] text-white">
                          {m.month}: {m.sales} vendas
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

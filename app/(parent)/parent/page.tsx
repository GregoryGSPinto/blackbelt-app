'use client';

import { useState, useEffect } from 'react';
import { getParentDashboard } from '@/lib/api/parent.service';
import type { ParentDashboardDTO } from '@/lib/api/parent.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ParentDashboardPage() {
  const [data, setData] = useState<ParentDashboardDTO | null>(null);
  const [selectedFilho, setSelectedFilho] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getParentDashboard('parent-1');
        setData(d);
        if (d.filhos.length > 0) setSelectedFilho(d.filhos[0].student_id);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  if (!data) return null;

  const filho = data.filhos.find((f) => f.student_id === selectedFilho) ?? data.filhos[0];

  const statusColors = {
    em_dia: 'text-bb-success',
    pendente: 'text-bb-warning',
    atrasado: 'text-bb-error',
  };
  const statusLabels = {
    em_dia: 'Em dia',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
  };

  return (
    <div className="space-y-4 p-4">
      {/* Seletor de filho */}
      {data.filhos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {data.filhos.map((f) => (
            <button
              key={f.student_id}
              onClick={() => setSelectedFilho(f.student_id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                selectedFilho === f.student_id
                  ? 'bg-bb-red text-white'
                  : 'bg-bb-gray-300 text-bb-gray-700'
              }`}
            >
              <Avatar name={f.display_name} size="sm" />
              {f.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Card do filho */}
      {filho && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Avatar name={filho.display_name} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-bb-black">{filho.display_name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="belt" size="sm">{filho.belt}</Badge>
                  <span className="text-sm text-bb-gray-500">{filho.idade} anos</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Presença do mês */}
          <Card className="p-4">
            <p className="text-sm text-bb-gray-500">Presença do mês</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-bb-black">
                {filho.presenca_mes.presentes}
              </span>
              <span className="mb-1 text-sm text-bb-gray-500">
                / {filho.presenca_mes.total} aulas
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bb-gray-300">
              <div
                className="h-full rounded-full bg-bb-success"
                style={{ width: `${(filho.presenca_mes.presentes / filho.presenca_mes.total) * 100}%` }}
              />
            </div>
          </Card>

          {/* Aulas */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-xs text-bb-gray-500">Última aula</p>
              <p className="mt-1 text-sm font-medium text-bb-black">
                {filho.ultima_aula ? new Date(filho.ultima_aula).toLocaleDateString('pt-BR') : '—'}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-bb-gray-500">Próxima aula</p>
              <p className="mt-1 text-sm font-medium text-bb-black">
                {filho.proxima_aula ?? '—'}
              </p>
            </Card>
          </div>

          {/* Pagamento */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-bb-gray-500">Status do Pagamento</p>
              <span className={`text-sm font-bold ${statusColors[filho.pagamento_status]}`}>
                {statusLabels[filho.pagamento_status]}
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Notificações */}
      <section>
        <h2 className="mb-2 font-semibold text-bb-black">Notificações</h2>
        <div className="space-y-2">
          {data.notificacoes.map((n) => (
            <Card key={n.id} className={`p-3 ${!n.read ? 'border-l-2 border-bb-red' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-bb-black">{n.message}</p>
                <span className="flex-shrink-0 text-xs text-bb-gray-500">{n.time}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  getUnidades,
  getUnidadesOverview,
  updateUnidadeStatus,
  type UnidadeFranquia,
  type UnidadesOverview,
} from '@/lib/api/franqueador-unidades.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

type UnitStatus = UnidadeFranquia['status'];

const STATUS_LABEL: Record<UnitStatus, string> = {
  ativa: 'Ativa',
  setup: 'Em Setup',
  suspensa: 'Suspensa',
  encerrada: 'Encerrada',
};

const STATUS_COLOR: Record<UnitStatus, string> = {
  ativa: 'bg-green-100 text-green-700',
  setup: 'bg-blue-100 text-blue-700',
  suspensa: 'bg-yellow-100 text-yellow-700',
  encerrada: 'bg-red-100 text-red-700',
};

function healthColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}


export default function UnidadesFranqueadorPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [unidades, setUnidades] = useState<UnidadeFranquia[]>([]);
  const [overview, setOverview] = useState<UnidadesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UnitStatus | ''>('');
  const [statusModal, setStatusModal] = useState<UnidadeFranquia | null>(null);
  const [newStatus, setNewStatus] = useState<UnitStatus>('ativa');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getUnidades('franchise-1'),
      getUnidadesOverview('franchise-1'),
    ])
      .then(([units, ov]) => {
        setUnidades(units);
        setOverview(ov);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange() {
    if (!statusModal) return;
    setUpdating(true);
    try {
      const updated = await updateUnidadeStatus(statusModal.id, newStatus);
      setUnidades((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u)),
      );
      setStatusModal(null);
      toast(`Status de ${updated.name} alterado para ${STATUS_LABEL[newStatus]}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setUpdating(false);
    }
  }

  function openStatusModal(unit: UnidadeFranquia) {
    setStatusModal(unit);
    setNewStatus(unit.status);
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/franqueador" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const filtered = unidades.filter((u) => {
    if (filterStatus && u.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        u.manager_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Gestao de Unidades Franqueadas</h1>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Total Unidades</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{overview.total_units}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Ativas</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{overview.active_units}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Total Alunos</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{overview.total_students.toLocaleString('pt-BR')}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Health Score Medio</p>
            <p className={`mt-1 text-2xl font-bold ${healthColor(overview.avg_health_score)}`}>
              {overview.avg_health_score}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Compliance Medio</p>
            <p className={`mt-1 text-2xl font-bold ${healthColor(overview.avg_compliance)}`}>
              {overview.avg_compliance}%
            </p>
          </Card>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Buscar por nome, cidade, estado ou gestor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-1">
          {(['', 'ativa', 'setup', 'suspensa', 'encerrada'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as UnitStatus | '')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filterStatus === s ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'
              }`}
            >
              {s ? STATUS_LABEL[s as UnitStatus] : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🏢"
          title={search || filterStatus ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
          description={search || filterStatus ? 'Tente ajustar os filtros para encontrar a unidade desejada.' : 'Cadastre unidades franqueadas para gerenciá-las aqui.'}
          variant={search || filterStatus ? 'search' : 'first-time'}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((unit) => (
            <Card key={unit.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-bold text-bb-black">{unit.name}</h3>
                  <p className="text-sm text-bb-gray-500">{unit.city} - {unit.state}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[unit.status]}`}
                >
                  {STATUS_LABEL[unit.status]}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bb-gray-500">Gestor</span>
                  <span className="truncate pl-2 text-right font-medium text-bb-black">{unit.manager_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bb-gray-500">Alunos</span>
                  <span className="font-medium text-bb-black">{unit.students_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bb-gray-500">Receita Mensal</span>
                  <span className="font-medium text-bb-black">R$ {unit.revenue_monthly.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-bb-gray-500">Health</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-bb-gray-200">
                      <div
                        className={`h-full rounded-full ${unit.health_score >= 80 ? 'bg-green-500' : unit.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${unit.health_score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${healthColor(unit.health_score)}`}>
                      {unit.health_score}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-bb-gray-500">Compliance</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-bb-gray-200">
                      <div
                        className={`h-full rounded-full ${unit.compliance_score >= 80 ? 'bg-green-500' : unit.compliance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${unit.compliance_score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${healthColor(unit.compliance_score)}`}>
                      {unit.compliance_score}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-bb-gray-500">
                  Aberta em {new Date(unit.opened_at).toLocaleDateString('pt-BR')}
                </span>
                <button
                  onClick={() => openStatusModal(unit)}
                  className="text-xs font-medium text-bb-red hover:underline"
                >
                  Alterar Status
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Change Modal */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Alterar Status da Unidade"
      >
        {statusModal && (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-bb-black">{statusModal.name}</p>
              <p className="text-sm text-bb-gray-500">{statusModal.city} - {statusModal.state}</p>
            </div>

            <div>
              <p className="text-sm text-bb-gray-500">Status atual:</p>
              <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[statusModal.status]}`}>
                {STATUS_LABEL[statusModal.status]}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-bb-black">Novo Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UnitStatus)}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              >
                {(['ativa', 'setup', 'suspensa', 'encerrada'] as const).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStatusModal(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                loading={updating}
                onClick={handleStatusChange}
                disabled={newStatus === statusModal.status}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

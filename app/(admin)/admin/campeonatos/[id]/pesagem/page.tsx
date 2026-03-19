'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getRegistrations,
  getCategories,
  weighInAthlete,
  type TournamentRegistration,
  type TournamentCategory,
} from '@/lib/api/compete.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-yellow-100 text-yellow-700',
  weighed_in: 'bg-green-100 text-green-700',
  competing: 'bg-yellow-100 text-yellow-700',
  eliminated: 'bg-bb-gray-100 text-bb-gray-600',
  winner: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-bb-gray-100 text-bb-gray-600',
};

export default function PesagemPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [weighInModal, setWeighInModal] = useState<TournamentRegistration | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getRegistrations(tournamentId),
      getCategories(tournamentId),
    ])
      .then(([regs, cats]) => {
        setRegistrations(regs);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  // Get category name by id
  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
  }

  // Unique category ids from registrations
  const categoryIds = [...new Set(registrations.map((r) => r.category_id))];

  // Filter
  let filtered = registrations;
  if (filterCategory) {
    filtered = filtered.filter((r) => r.category_id === filterCategory);
  }
  if (filterStatus) {
    if (filterStatus === 'pending_weigh') {
      filtered = filtered.filter((r) => !r.weighed_in_at);
    } else if (filterStatus === 'weighed') {
      filtered = filtered.filter((r) => r.weighed_in_at !== null);
    }
  }

  // Group by category
  const grouped = filtered.reduce<Record<string, TournamentRegistration[]>>((acc, r) => {
    const catName = getCategoryName(r.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(r);
    return acc;
  }, {});

  async function handleConfirmWeighIn() {
    if (!weighInModal || !weightInput) return;
    setSubmitting(true);
    try {
      const result = await weighInAthlete(weighInModal.id, Number(weightInput));

      // Reload registrations to reflect updated state
      const updatedRegs = await getRegistrations(tournamentId);
      setRegistrations(updatedRegs);

      if (!result.passed) {
        const confirmChange = window.confirm(
          `Atleta pesou ${weightInput}kg e nao se encaixa na categoria atual. Categoria sugerida: "${result.category.name}". Deseja continuar?`,
        );
        if (!confirmChange) {
          // User declined, no further action
        }
      }

      setWeighInModal(null);
      setWeightInput('');
    } finally {
      setSubmitting(false);
    }
  }

  // Stats
  const totalRegistrations = registrations.length;
  const weighedIn = registrations.filter((r) => r.weighed_in_at !== null).length;
  const pending = registrations.filter((r) => r.weighed_in_at === null).length;

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pesagem" subtitle={`Campeonato ${tournamentId}`} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-bb-black">{totalRegistrations}</p>
          <p className="text-xs text-bb-gray-500">Total inscritos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{weighedIn}</p>
          <p className="text-xs text-bb-gray-500">Pesados</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          <p className="text-xs text-bb-gray-500">Pendentes</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {categoryIds.map((catId) => (
            <option key={catId} value={catId}>{getCategoryName(catId)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="pending_weigh">Pendente pesagem</option>
          <option value="weighed">Pesado</option>
        </select>
        <Button variant="ghost" className="ml-auto">
          Exportar PDF
        </Button>
      </div>

      {/* Registrations by category */}
      {Object.entries(grouped).map(([catLabel, regs]) => (
        <Card key={catLabel} className="overflow-hidden">
          <div className="border-b border-bb-gray-200 bg-bb-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-bb-black">{catLabel}</h3>
              <span className="text-xs text-bb-gray-500">{regs.length} atletas</span>
            </div>
          </div>

          <div className="divide-y divide-bb-gray-100">
            {regs.map((reg) => (
              <div key={reg.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bb-gray-200 text-xs font-bold text-bb-gray-500">
                  {reg.athlete_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-black">{reg.athlete_name}</p>
                  <p className="text-xs text-bb-gray-500">{reg.academy_name} | Peso: {reg.weight ?? '—'}kg</p>
                </div>
                <div className="flex items-center gap-2">
                  {reg.weigh_in_weight !== null && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      reg.weight !== null && Math.abs(reg.weigh_in_weight - reg.weight) > 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {reg.weigh_in_weight}kg
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[reg.status] ?? 'bg-bb-gray-100 text-bb-gray-600'}`}>
                    {reg.weighed_in_at ? 'Pesado' : 'Pendente'}
                  </span>
                  {!reg.weighed_in_at && (
                    <Button
                      variant="primary"
                      className="text-xs"
                      onClick={() => {
                        setWeighInModal(reg);
                        setWeightInput(String(reg.weight ?? ''));
                      }}
                    >
                      Pesar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Weigh-in Modal */}
      {weighInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-bb-black">Registrar Pesagem</h3>
            <p className="mt-1 text-sm text-bb-gray-500">{weighInModal.athlete_name} | {weighInModal.academy_name}</p>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-bb-gray-50 p-3">
                  <p className="text-xs text-bb-gray-500">Peso declarado</p>
                  <p className="text-lg font-bold text-bb-black">{weighInModal.weight ?? '—'}kg</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-bb-gray-500">Peso real (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-lg font-bold"
                    autoFocus
                  />
                </div>
              </div>

              {weightInput && weighInModal.weight !== null && Math.abs(Number(weightInput) - weighInModal.weight) > 2 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    Diferenca superior a 2kg. O atleta pode ser recategorizado automaticamente.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setWeighInModal(null); setWeightInput(''); }}>Cancelar</Button>
              <Button variant="primary" onClick={handleConfirmWeighIn} disabled={submitting || !weightInput}>
                {submitting ? 'Confirmando...' : 'Confirmar pesagem'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

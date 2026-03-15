'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getRegistrationsByChampionship,
  confirmWeighIn,
  changeCategory,
  type RegistrationDTO,
} from '@/lib/api/championship-registration.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';

const STATUS_COLORS: Record<string, string> = {
  inscrito: 'bg-blue-100 text-blue-700',
  pesagem: 'bg-green-100 text-green-700',
  competindo: 'bg-yellow-100 text-yellow-700',
  resultado: 'bg-bb-gray-100 text-bb-gray-600',
};

export default function PesagemPage() {
  const params = useParams();
  const championshipId = params.id as string;

  const [registrations, setRegistrations] = useState<RegistrationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [weighInModal, setWeighInModal] = useState<RegistrationDTO | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRegistrationsByChampionship(championshipId)
      .then(setRegistrations)
      .finally(() => setLoading(false));
  }, [championshipId]);

  // Unique categories
  const categories = [...new Set(registrations.map((r) => r.category_label))];

  // Filter
  let filtered = registrations;
  if (filterCategory) {
    filtered = filtered.filter((r) => r.category_label === filterCategory);
  }
  if (filterStatus) {
    filtered = filtered.filter((r) => r.status === filterStatus);
  }

  // Group by category
  const grouped = filtered.reduce<Record<string, RegistrationDTO[]>>((acc, r) => {
    if (!acc[r.category_label]) acc[r.category_label] = [];
    acc[r.category_label].push(r);
    return acc;
  }, {});

  async function handleConfirmWeighIn() {
    if (!weighInModal || !weightInput) return;
    setSubmitting(true);
    try {
      const updated = await confirmWeighIn(weighInModal.id, Number(weightInput));
      setRegistrations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );

      // Check auto re-categorization: if actual weight exceeds declared category
      const actualWeight = Number(weightInput);
      const declaredWeight = weighInModal.weight_declared;
      if (actualWeight > declaredWeight + 2) {
        // Auto-suggest re-categorization
        const heavierCategory = categories.find((c) =>
          c.includes('Pesado') || c.includes('Médio'),
        );
        if (heavierCategory && heavierCategory !== weighInModal.category_label) {
          const confirmChange = window.confirm(
            `Atleta pesou ${actualWeight}kg (declarado ${declaredWeight}kg). Deseja mover para "${heavierCategory}"?`,
          );
          if (confirmChange) {
            const newCatReg = registrations.find((r) => r.category_label === heavierCategory);
            if (newCatReg) {
              const changed = await changeCategory(weighInModal.id, newCatReg.category_id);
              setRegistrations((prev) =>
                prev.map((r) => (r.id === changed.id ? changed : r)),
              );
            }
          }
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
  const weighedIn = registrations.filter((r) => r.status === 'pesagem' || r.status === 'competindo' || r.status === 'resultado').length;
  const pending = registrations.filter((r) => r.status === 'inscrito').length;

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pesagem" subtitle={`Campeonato ${championshipId}`} />

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
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="inscrito">Pendente pesagem</option>
          <option value="pesagem">Pesado</option>
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
                  <p className="text-xs text-bb-gray-500">{reg.academy} | {reg.belt} | Declarado: {reg.weight_declared}kg</p>
                </div>
                <div className="flex items-center gap-2">
                  {reg.weight_actual !== null && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      Math.abs(reg.weight_actual - reg.weight_declared) > 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {reg.weight_actual}kg
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                    {reg.status === 'inscrito' ? 'Pendente' : 'Pesado'}
                  </span>
                  {reg.status === 'inscrito' && (
                    <Button
                      variant="primary"
                      className="text-xs"
                      onClick={() => {
                        setWeighInModal(reg);
                        setWeightInput(String(reg.weight_declared));
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
            <p className="mt-1 text-sm text-bb-gray-500">{weighInModal.athlete_name} | {weighInModal.academy}</p>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-bb-gray-50 p-3">
                  <p className="text-xs text-bb-gray-500">Peso declarado</p>
                  <p className="text-lg font-bold text-bb-black">{weighInModal.weight_declared}kg</p>
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

              {weightInput && Math.abs(Number(weightInput) - weighInModal.weight_declared) > 2 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    Diferença superior a 2kg. O atleta pode ser recategorizado automaticamente.
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

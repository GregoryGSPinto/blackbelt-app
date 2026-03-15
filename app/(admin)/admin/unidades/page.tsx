'use client';

import { useEffect, useState } from 'react';
import { listUnits, createUnit, deactivateUnit, type UnitDTO } from '@/lib/api/units.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

export default function UnidadesPage() {
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', operatingHours: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listUnits('academy-1').then(setUnits).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const unit = await createUnit('academy-1', form);
      setUnits((prev) => [...prev, unit]);
      setShowCreate(false);
      setForm({ name: '', address: '', phone: '', operatingHours: '' });
      toast('Unidade criada', 'success');
    } catch {
      toast('Erro ao criar unidade', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateUnit(id);
      setUnits((prev) => prev.map((u) => u.id === id ? { ...u, active: false } : u));
      toast('Unidade desativada', 'success');
    } catch {
      toast('Erro ao desativar', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Unidades</h1>
        <Button onClick={() => setShowCreate(true)}>Nova Unidade</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {units.map((unit) => (
          <Card key={unit.id} className={`p-4 ${unit.active ? '' : 'opacity-50'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-bb-black">{unit.name}</h3>
                {!unit.active && <span className="text-xs text-red-500">Desativada</span>}
              </div>
              {unit.active && (
                <button onClick={() => handleDeactivate(unit.id)} className="text-xs text-bb-gray-500 hover:text-red-500">Desativar</button>
              )}
            </div>
            <p className="mt-2 text-sm text-bb-gray-500">{unit.address}</p>
            <p className="text-sm text-bb-gray-500">{unit.phone}</p>
            <p className="text-xs text-bb-gray-500">{unit.operatingHours}</p>
            <div className="mt-3 flex gap-4 text-xs text-bb-gray-500">
              <span>{unit.classCount} turmas</span>
              <span>{unit.studentCount} alunos</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Unidade">
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Nome', placeholder: 'Ex: Filial Sul' },
            { key: 'address', label: 'Endereço', placeholder: 'Rua, número, bairro' },
            { key: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999' },
            { key: 'operatingHours', label: 'Horário de Funcionamento', placeholder: 'Seg-Sex 6h-22h' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-bb-black">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleCreate} loading={creating} disabled={!form.name}>Criar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

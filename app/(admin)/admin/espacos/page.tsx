'use client';

import { useEffect, useState } from 'react';
import { listSpaces, getSpaceSchedule, type SpaceDTO, type SpaceScheduleSlot } from '@/lib/api/spaces.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const STATUS_COLOR: Record<string, string> = { available: 'bg-green-100 text-green-700', occupied: 'bg-red-100 text-red-700', maintenance: 'bg-yellow-100 text-yellow-700' };

export default function EspacosPage() {
  const [spaces, setSpaces] = useState<SpaceDTO[]>([]);
  const [schedule, setSchedule] = useState<SpaceScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listSpaces('unit-1'), getSpaceSchedule('unit-1')])
      .then(([s, sc]) => { setSpaces(s); setSchedule(sc); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Espaços e Salas</h1>

      {/* Space Grid */}
      {spaces.length === 0 && (
        <EmptyState
          icon="🏢"
          title="Nenhum espaço cadastrado"
          description="Cadastre salas e espaços da sua academia para gerenciar a ocupação e agenda."
          variant="first-time"
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {spaces.map((space) => (
          <Card key={space.id} className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-bb-black">{space.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[space.status]}`}>
                {space.status === 'available' ? 'Livre' : space.status === 'occupied' ? 'Ocupado' : 'Manutenção'}
              </span>
            </div>
            <p className="mt-1 text-sm text-bb-gray-500">Capacidade: {space.capacity}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {space.equipment.map((eq) => (
                <span key={eq} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-500">{eq}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Timeline */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-bb-black">Agenda Semanal</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300">
                <th className="px-3 py-2 text-left font-medium text-bb-gray-500">Espaço</th>
                {DAYS.slice(1, 7).map((d) => (
                  <th key={d} className="px-3 py-2 text-center font-medium text-bb-gray-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spaces.filter((s) => s.status !== 'maintenance').map((space) => (
                <tr key={space.id} className="border-b border-bb-gray-100">
                  <td className="px-3 py-2 font-medium text-bb-black">{space.name}</td>
                  {[1, 2, 3, 4, 5, 6].map((day) => {
                    const slots = schedule.filter((s) => s.spaceId === space.id && s.day === day);
                    return (
                      <td key={day} className="px-3 py-2">
                        {slots.map((slot) => (
                          <div key={slot.startTime} className="mb-1 rounded bg-blue-50 px-1.5 py-0.5 text-xs">
                            <span className="font-medium text-blue-700">{slot.startTime}</span>
                            <span className="ml-1 text-blue-500">{slot.className}</span>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

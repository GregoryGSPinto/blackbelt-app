'use client';

import { useState, useEffect } from 'react';
import { getGrade } from '@/lib/api/horarios.service';
import type { WeeklyScheduleSlot } from '@/lib/api/horarios.service';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const DAY_NAMES = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function TurmasPage() {
  const [slots, setSlots] = useState<WeeklyScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<WeeklyScheduleSlot | null>(null);
  const [filterModality, setFilterModality] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const grade = await getGrade('academy-1');
        setSlots(grade.slots);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const modalities = [...new Set(slots.map((s) => s.modality_name))];
  const units = [...new Set(slots.map((s) => s.unit_name))];
  const filtered = slots.filter((s) => {
    if (filterModality && s.modality_name !== filterModality) return false;
    if (filterUnit && s.unit_name !== filterUnit) return false;
    return true;
  });
  const slotsByDay = filtered.reduce<Record<number, WeeklyScheduleSlot[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
    acc[s.day_of_week].push(s);
    return acc;
  }, {});
  const today = new Date().getDay();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
      </div>
    );
  }

  if (slots.length === 0) {
    return <div className="p-4"><EmptyState title="Nenhuma turma disponível" description="Não há turmas cadastradas para sua academia." /></div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-bb-black">Grade Horária</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={filterModality} onChange={(e) => setFilterModality(e.target.value)} className="rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm">
          <option value="">Todas modalidades</option>
          {modalities.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="rounded-lg border border-bb-gray-300 bg-bb-white px-3 py-2 text-sm">
          <option value="">Todas unidades</option>
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((day) => {
          const daySlots = slotsByDay[day];
          if (!daySlots || daySlots.length === 0) return null;
          const isToday = day === today;
          return (
            <div key={day}>
              <h2 className={`mb-2 text-sm font-semibold uppercase tracking-wide ${isToday ? 'text-bb-red' : 'text-bb-gray-500'}`}>
                {DAY_NAMES[day]} {isToday && '(Hoje)'}
              </h2>
              <div className="space-y-2">
                {daySlots.map((slot) => (
                  <button key={`${slot.class_id}-${slot.day_of_week}`} onClick={() => setSelectedSlot(slot)} className="w-full text-left">
                    <Card className="p-3 transition-colors hover:bg-bb-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-bb-black">{slot.modality_name}</p>
                          <p className="text-sm text-bb-gray-500">{slot.start_time} - {slot.end_time} · {slot.professor_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={slot.is_enrolled ? 'active' : 'inactive'} size="sm">{slot.is_enrolled ? 'Sua turma' : 'Disponível'}</Badge>
                          <p className="mt-1 text-xs text-bb-gray-500">{slot.enrolled_count}/{slot.max_students}</p>
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={!!selectedSlot} onClose={() => setSelectedSlot(null)} title="Detalhes da Turma">
        {selectedSlot && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-bb-black">{selectedSlot.modality_name}</h3>
            <p className="text-sm text-bb-gray-500">{selectedSlot.unit_name}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-bb-gray-500">Professor</p><p className="font-medium">{selectedSlot.professor_name}</p></div>
              <div><p className="text-bb-gray-500">Horário</p><p className="font-medium">{DAY_NAMES[selectedSlot.day_of_week]} {selectedSlot.start_time}-{selectedSlot.end_time}</p></div>
              <div><p className="text-bb-gray-500">Vagas</p><p className="font-medium">{selectedSlot.enrolled_count}/{selectedSlot.max_students}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

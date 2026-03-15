'use client';

import { useEffect, useState } from 'react';
import { getAgenda, getLessonRequests, approveLesson, rejectLesson, type AgendaSlot, type LessonRequest } from '@/lib/api/professor-agenda.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SLOT_COLORS: Record<string, string> = {
  class: 'bg-blue-100 border-blue-300 text-blue-700',
  private: 'bg-green-100 border-green-300 text-green-700',
  event: 'bg-purple-100 border-purple-300 text-purple-700',
  unavailable: 'bg-gray-100 border-gray-300 text-gray-500',
};

export default function ProfessorAgendaPage() {
  const { toast } = useToast();
  const [agenda, setAgenda] = useState<AgendaSlot[]>([]);
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAgenda('prof-1', 'current'), getLessonRequests('prof-1')])
      .then(([a, r]) => { setAgenda(a); setRequests(r); })
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    try {
      await approveLesson(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast('Aula aprovada', 'success');
    } catch {
      toast('Erro ao aprovar', 'error');
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectLesson(id, 'Horário indisponível');
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast('Aula recusada', 'success');
    } catch {
      toast('Erro ao recusar', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Minha Agenda</h1>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 p-4">
          <h2 className="mb-3 font-semibold text-bb-black">Solicitações Pendentes</h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                <div>
                  <p className="text-sm font-medium text-bb-black">{req.studentName}</p>
                  <p className="text-xs text-bb-gray-500">{new Date(req.requestedDate).toLocaleDateString('pt-BR')} às {req.requestedTime}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleApprove(req.id)}>Aprovar</Button>
                  <Button variant="ghost" onClick={() => handleReject(req.id)}>Recusar</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weekly View */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-bb-black">Semana Atual</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, idx) => {
            const daySlots = agenda.filter((s) => s.day === idx);
            return (
              <div key={day}>
                <p className="mb-2 text-center text-xs font-bold text-bb-gray-500">{day}</p>
                <div className="space-y-1">
                  {daySlots.length === 0 && (
                    <div className="rounded bg-bb-gray-50 p-2 text-center text-xs text-bb-gray-400">—</div>
                  )}
                  {daySlots.map((slot) => (
                    <div key={slot.id} className={`rounded border p-2 text-xs ${SLOT_COLORS[slot.type]}`}>
                      <p className="font-medium">{slot.title}</p>
                      <p>{slot.startTime}-{slot.endTime}</p>
                      {slot.studentName && <p className="mt-0.5 opacity-80">{slot.studentName}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(SLOT_COLORS).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${cls.split(' ')[0]}`} />
            <span className="capitalize text-bb-gray-500">{type === 'class' ? 'Turma' : type === 'private' ? 'Particular' : type === 'event' ? 'Evento' : 'Indisponível'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

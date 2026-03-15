'use client';

import { useEffect, useState } from 'react';
import { listEvents, enrollInEvent, type EventDTO } from '@/lib/api/events.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const TYPE_LABEL: Record<string, string> = { seminario: 'Seminário', workshop: 'Workshop', graduacao: 'Graduação', competicao: 'Competição', social: 'Social' };

export default function EventosPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents('academy-1').then(setEvents).finally(() => setLoading(false));
  }, []);

  async function handleEnroll(eventId: string) {
    try {
      await enrollInEvent(eventId, 'student-1');
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, enrolledCount: e.enrolledCount + 1 } : e));
      toast('Inscrição confirmada!', 'success');
    } catch {
      toast('Erro na inscrição', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bb-black">Eventos</h1>
      <div className="space-y-4">
        {events.filter((e) => e.enrollmentOpen).map((event) => {
          const spotsLeft = event.capacity - event.enrolledCount;
          return (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-bb-black">{event.name}</h3>
                  <span className="text-xs text-bb-gray-500">{TYPE_LABEL[event.type]}</span>
                </div>
                <span className="text-lg font-bold text-bb-black">{event.price === 0 ? 'Grátis' : `R$ ${event.price}`}</span>
              </div>
              <p className="mt-2 text-sm text-bb-gray-500">{event.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-bb-gray-500">
                <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                <span>{event.startTime} - {event.endTime}</span>
                <span>{event.location}</span>
                <span>{spotsLeft} vagas restantes</span>
              </div>
              <div className="mt-3">
                <Button onClick={() => handleEnroll(event.id)} disabled={spotsLeft <= 0}>
                  {spotsLeft > 0 ? 'Inscrever-se' : 'Esgotado'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

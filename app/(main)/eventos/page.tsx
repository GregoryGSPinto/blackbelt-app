'use client';

import { useEffect, useState } from 'react';
import {
  getEvents,
  registerForEvent,
  type EventoDTO,
  type EventoType,
} from '@/lib/api/eventos.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventoType, { icon: string; label: string }> = {
  graduacao: { icon: '🥋', label: 'Graduacao' },
  campeonato: { icon: '🏆', label: 'Campeonato' },
  seminario: { icon: '📚', label: 'Seminario' },
  workshop: { icon: '🥊', label: 'Workshop' },
  social: { icon: '🎉', label: 'Social' },
  open_mat: { icon: '🥋', label: 'Open Mat' },
};

const FILTERS: { id: EventoType | ''; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'graduacao', label: 'Graduacao' },
  { id: 'campeonato', label: 'Campeonato' },
  { id: 'seminario', label: 'Seminario' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'social', label: 'Social' },
  { id: 'open_mat', label: 'Open Mat' },
];

// ── Helpers ────────────────────────────────────────────────────────────

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr + 'T00:00:00');
  return eventDate >= today;
}

// ── Page ───────────────────────────────────────────────────────────────

export default function EventosPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventoType | ''>('');
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    getEvents('academy-1')
      .then(setEvents)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleRegister(eventId: string) {
    setRegistering(eventId);
    try {
      const registration = await registerForEvent(eventId, 'student-1');
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, enrolledCount: e.enrolledCount + 1 }
            : e,
        ),
      );
      if (registration.status === 'waitlist') {
        toast('Voce entrou na lista de espera!', 'info');
      } else {
        toast('Inscricao confirmada!', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setRegistering(null);
    }
  }

  const upcomingEvents = events
    .filter((e) => isUpcoming(e.date))
    .filter((e) => (filter ? e.type === filter : true))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => !isUpcoming(e.date))
    .filter((e) => (filter ? e.type === filter : true))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bb-black">Eventos</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-bb-red text-bb-white'
                : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-bb-gray-500">
            Proximos Eventos
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((evento) => {
              const spotsLeft = evento.capacity - evento.enrolledCount;
              const config = TYPE_CONFIG[evento.type];
              const isFull = spotsLeft <= 0;

              return (
                <Card key={evento.id} variant="outlined" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <h3 className="font-bold text-bb-black">
                          {evento.title}
                        </h3>
                      </div>

                      {/* Type badge */}
                      <div className="mt-1">
                        <Badge variant="active" size="sm">
                          {config.label}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-sm text-bb-gray-500">
                        {evento.description}
                      </p>

                      {/* Details */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-bb-gray-500">
                        <span>📅 {formatEventDate(evento.date)}</span>
                        <span>
                          🕐 {evento.startTime} - {evento.endTime}
                        </span>
                        <span>📍 {evento.location}</span>
                        <span
                          className={
                            isFull ? 'font-semibold text-bb-red' : ''
                          }
                        >
                          👥 {spotsLeft > 0 ? `${spotsLeft} vagas` : 'Esgotado'}
                        </span>
                      </div>
                    </div>

                    {/* Price + Action */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-lg font-bold text-bb-black">
                        {evento.price === 0
                          ? 'Gratis'
                          : `R$ ${evento.price}`}
                      </span>
                      {evento.enrollmentOpen && (
                        <Button
                          size="sm"
                          onClick={() => handleRegister(evento.id)}
                          disabled={isFull || registering === evento.id}
                          loading={registering === evento.id}
                        >
                          {isFull ? 'Esgotado' : 'Inscrever-se'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-bb-gray-500">
            Eventos Passados
          </h2>
          <div className="space-y-3">
            {pastEvents.map((evento) => {
              const config = TYPE_CONFIG[evento.type];
              return (
                <Card
                  key={evento.id}
                  className="p-3 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{config.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-bb-black">
                        {evento.title}
                      </p>
                      <p className="text-xs text-bb-gray-500">
                        {formatEventDate(evento.date)} - {evento.location}
                      </p>
                    </div>
                    <Badge variant="inactive" size="sm">
                      Encerrado
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-bb-gray-500">
            Nenhum evento encontrado{filter ? ' para este filtro' : ''}.
          </p>
        </Card>
      )}
    </div>
  );
}

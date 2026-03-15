'use client';

import { useEffect, useState } from 'react';
import { listEvents, createEvent, type EventDTO, type EventType } from '@/lib/api/events.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const TYPE_LABEL: Record<EventType, string> = { seminario: 'Seminário', workshop: 'Workshop', graduacao: 'Graduação', competicao: 'Competição', social: 'Social' };
const TYPE_COLOR: Record<EventType, string> = { seminario: 'bg-blue-100 text-blue-700', workshop: 'bg-purple-100 text-purple-700', graduacao: 'bg-yellow-100 text-yellow-700', competicao: 'bg-red-100 text-red-700', social: 'bg-green-100 text-green-700' };

export default function EventosAdminPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'seminario' as EventType, date: '', startTime: '09:00', endTime: '12:00', location: '', capacity: 30, price: 0, description: '', enrollmentOpen: true });

  useEffect(() => {
    listEvents('academy-1').then(setEvents).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const event = await createEvent('academy-1', form);
      setEvents((prev) => [...prev, event]);
      setShowCreate(false);
      toast('Evento criado', 'success');
    } catch {
      toast('Erro ao criar evento', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Eventos</h1>
        <Button onClick={() => setShowCreate(true)}>Novo Evento</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-bb-black">{event.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[event.type]}`}>{TYPE_LABEL[event.type]}</span>
                </div>
                <p className="mt-1 text-sm text-bb-gray-500">{event.description}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-bb-gray-500">
              <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
              <span>{event.startTime} - {event.endTime}</span>
              <span>{event.location}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-bb-gray-500">{event.enrolledCount}/{event.capacity} inscritos</span>
              <span className="text-sm font-bold text-bb-black">{event.price === 0 ? 'Grátis' : `R$ ${event.price}`}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-bb-gray-200">
              <div className="h-full rounded-full bg-bb-primary" style={{ width: `${(event.enrolledCount / event.capacity) * 100}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Evento">
        <div className="space-y-3">
          <input placeholder="Nome do evento" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <input placeholder="Local" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Capacidade" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="Preço (0=grátis)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" rows={2} />
          <Button className="w-full" onClick={handleCreate} disabled={!form.name || !form.date}>Criar Evento</Button>
        </div>
      </Modal>
    </div>
  );
}

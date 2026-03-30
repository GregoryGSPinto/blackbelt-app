'use client';

import { useEffect, useState } from 'react';
import {
  getBroadcasts,
  sendBroadcast,
  getReceipts,
  getTrainings,
  scheduleTraining,
  type Broadcast,
  type BroadcastType,
  type BroadcastChannel,
  type BroadcastRecipient,
  type ReceiptStatus,
  type NetworkTraining,
} from '@/lib/api/franchise-communication.service';
import { getMyNetwork } from '@/lib/api/franchise.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const TYPE_LABEL: Record<BroadcastType, string> = {
  comunicado: 'Comunicado',
  novo_padrao: 'Novo Padrao',
  marketing_material: 'Material Marketing',
  training: 'Treinamento',
  survey: 'Pesquisa',
};

const TYPE_COLOR: Record<BroadcastType, string> = {
  comunicado: 'bg-blue-100 text-blue-700',
  novo_padrao: 'bg-purple-100 text-purple-700',
  marketing_material: 'bg-green-100 text-green-700',
  training: 'bg-yellow-100 text-yellow-700',
  survey: 'bg-red-100 text-red-700',
};

const RECEIPT_COLOR: Record<ReceiptStatus, string> = {
  enviado: 'bg-gray-100 text-gray-500',
  entregue: 'bg-blue-100 text-blue-700',
  lido: 'bg-green-100 text-green-700',
  falha: 'bg-red-100 text-red-700',
};

const RECEIPT_LABEL: Record<ReceiptStatus, string> = {
  enviado: 'Enviado',
  entregue: 'Entregue',
  lido: 'Lido',
  falha: 'Falha',
};

const CHANNEL_LABEL: Record<BroadcastChannel, string> = {
  email: 'E-mail',
  push: 'Push',
  sms: 'SMS',
  in_app: 'In-App',
};

const TRAINING_STATUS_LABEL: Record<string, string> = {
  agendado: 'Agendado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
};

const TRAINING_STATUS_COLOR: Record<string, string> = {
  agendado: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

type Tab = 'broadcasts' | 'trainings';

export default function ComunicacaoPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [franchiseId, setFranchiseId] = useState('');
  const [tab, setTab] = useState<Tab>('broadcasts');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [trainings, setTrainings] = useState<NetworkTraining[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose broadcast
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    type: 'comunicado' as BroadcastType,
    subject: '',
    body: '',
    channels: ['email'] as BroadcastChannel[],
  });
  const [sending, setSending] = useState(false);

  // Receipts
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [receipts, setReceipts] = useState<BroadcastRecipient[]>([]);
  const [showReceipts, setShowReceipts] = useState(false);

  // Schedule training
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    title: '', description: '', date: '', time: '10:00', duration_minutes: 60,
    format: 'online' as 'presencial' | 'online' | 'hibrido', instructor: '', max_participants: 30,
  });

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const network = await getMyNetwork(profile.id);
        if (!network) return;
        setFranchiseId(network.id);
        const [b, t] = await Promise.all([
          getBroadcasts(network.id),
          getTrainings(network.id),
        ]);
        setBroadcasts(b);
        setTrainings(t);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    if (!franchiseId) return;
    setSending(true);
    try {
      const broadcast = await sendBroadcast(franchiseId, composeForm);
      setBroadcasts((prev) => [broadcast, ...prev]);
      setShowCompose(false);
      setComposeForm({ type: 'comunicado', subject: '', body: '', channels: ['email'] });
      toast('Comunicado enviado para a rede', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleViewReceipts(broadcast: Broadcast) {
    setSelectedBroadcast(broadcast);
    try {
      const r = await getReceipts(broadcast.id);
      setReceipts(r);
      setShowReceipts(true);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleScheduleTraining() {
    if (!franchiseId) return;
    try {
      const training = await scheduleTraining(franchiseId, trainingForm);
      setTrainings((prev) => [...prev, training]);
      setShowTrainingForm(false);
      setTrainingForm({ title: '', description: '', date: '', time: '10:00', duration_minutes: 60, format: 'online', instructor: '', max_participants: 30 });
      toast('Treinamento agendado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function toggleChannel(ch: BroadcastChannel) {
    setComposeForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'broadcasts', label: 'Comunicados' },
    { id: 'trainings', label: 'Treinamentos' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-bb-black">Comunicacao da Rede</h1>
        <div className="flex gap-2">
          {tab === 'broadcasts' && <Button onClick={() => setShowCompose(true)}>Novo Comunicado</Button>}
          {tab === 'trainings' && <Button onClick={() => setShowTrainingForm(true)}>Agendar Treinamento</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
            style={tab === t.id ? { background: 'var(--bb-depth-1)' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Broadcasts */}
      {tab === 'broadcasts' && (
        <div className="space-y-3">
          {broadcasts.length === 0 && (
            <EmptyState
              icon="📢"
              title="Nenhum comunicado enviado"
              description="Envie comunicados para todas as academias da rede."
              actionLabel="Novo Comunicado"
              onAction={() => setShowCompose(true)}
              variant="first-time"
            />
          )}
          {broadcasts.map((bc) => {
            const readCount = bc.recipients.filter((r) => r.status === 'lido').length;
            const deliveredCount = bc.recipients.filter((r) => r.status === 'entregue' || r.status === 'lido').length;
            const failCount = bc.recipients.filter((r) => r.status === 'falha').length;

            return (
              <Card key={bc.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-bb-black">{bc.subject}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLOR[bc.type]}`}>
                        {TYPE_LABEL[bc.type]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bb-gray-500 line-clamp-2">{bc.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-bb-gray-500">
                      <span>{new Date(bc.sent_at).toLocaleDateString('pt-BR')}</span>
                      <span>por {bc.created_by}</span>
                      <span>via {bc.channels.map((c) => CHANNEL_LABEL[c]).join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Receipt summary */}
                    <div className="flex gap-2 text-xs">
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">{readCount} lidos</span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">{deliveredCount} entregues</span>
                      {failCount > 0 && <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">{failCount} falha</span>}
                    </div>
                    <button
                      onClick={() => handleViewReceipts(bc)}
                      className="text-xs text-bb-red hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-bb-gray-200">
                  <div className="h-full bg-green-500" style={{ width: `${(readCount / bc.recipients.length) * 100}%` }} />
                  <div className="h-full bg-blue-400" style={{ width: `${((deliveredCount - readCount) / bc.recipients.length) * 100}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Trainings */}
      {tab === 'trainings' && (
        <div className="grid gap-4 md:grid-cols-2">
          {trainings.length === 0 && (
            <EmptyState
              icon="🎓"
              title="Nenhum treinamento agendado"
              description="Agende treinamentos para capacitar as equipes das academias da rede."
              actionLabel="Agendar Treinamento"
              onAction={() => setShowTrainingForm(true)}
              variant="first-time"
            />
          )}
          {trainings.map((tr) => (
            <Card key={tr.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-bb-black">{tr.title}</h3>
                  <p className="mt-1 text-sm text-bb-gray-500">{tr.description}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TRAINING_STATUS_COLOR[tr.status]}`}>
                  {TRAINING_STATUS_LABEL[tr.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-bb-gray-500">
                <span>{new Date(tr.date).toLocaleDateString('pt-BR')}</span>
                <span>{tr.time}</span>
                <span>{tr.duration_minutes}min</span>
                <span className="capitalize">{tr.format}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-bb-gray-500">Instrutor: {tr.instructor}</span>
                <span className="text-bb-gray-500">{tr.enrolled}/{tr.max_participants} inscritos</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-bb-gray-200">
                <div className="h-full rounded-full bg-bb-primary" style={{ width: `${(tr.enrolled / tr.max_participants) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Compose Broadcast Modal */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Novo Comunicado">
        <div className="space-y-3">
          <select
            value={composeForm.type}
            onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value as BroadcastType })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          >
            {(Object.entries(TYPE_LABEL) as [BroadcastType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            placeholder="Assunto"
            value={composeForm.subject}
            onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Mensagem..."
            value={composeForm.body}
            onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />

          {/* Channel selector */}
          <div>
            <label className="block text-sm font-medium text-bb-black">Canais de Envio</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(['email', 'push', 'sms', 'in_app'] as BroadcastChannel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    composeForm.channels.includes(ch)
                      ? 'bg-bb-red text-white'
                      : 'bg-bb-gray-100 text-bb-gray-500'
                  }`}
                >
                  {CHANNEL_LABEL[ch]}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient info */}
          <div className="rounded-lg bg-bb-gray-100 p-3 text-xs text-bb-gray-500">
            O comunicado sera enviado para todas as 5 academias da rede.
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCompose(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              loading={sending}
              onClick={handleSend}
              disabled={!composeForm.subject || !composeForm.body || composeForm.channels.length === 0}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipts Modal */}
      <Modal open={showReceipts} onClose={() => setShowReceipts(false)} title={selectedBroadcast ? `Confirmacoes: ${selectedBroadcast.subject}` : 'Confirmacoes'}>
        <div className="space-y-2">
          {receipts.map((r) => (
            <div key={r.academy_id} className="flex items-center justify-between rounded-lg border border-bb-gray-200 p-3">
              <div>
                <p className="text-sm font-medium text-bb-black">{r.academy_name}</p>
                {r.read_at && <p className="text-[10px] text-bb-gray-500">Lido em {new Date(r.read_at).toLocaleString('pt-BR')}</p>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RECEIPT_COLOR[r.status]}`}>
                {RECEIPT_LABEL[r.status]}
              </span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Schedule Training Modal */}
      <Modal open={showTrainingForm} onClose={() => setShowTrainingForm(false)} title="Agendar Treinamento">
        <div className="space-y-3">
          <input
            placeholder="Titulo do treinamento"
            value={trainingForm.title}
            onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Descricao"
            value={trainingForm.description}
            onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={trainingForm.date} onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="time" value={trainingForm.time} onChange={(e) => setTrainingForm({ ...trainingForm, time: e.target.value })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={trainingForm.format}
              onChange={(e) => setTrainingForm({ ...trainingForm, format: e.target.value as 'presencial' | 'online' | 'hibrido' })}
              className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Hibrido</option>
            </select>
            <input
              type="number"
              placeholder="Duracao (min)"
              value={trainingForm.duration_minutes}
              onChange={(e) => setTrainingForm({ ...trainingForm, duration_minutes: Number(e.target.value) })}
              className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            placeholder="Instrutor"
            value={trainingForm.instructor}
            onChange={(e) => setTrainingForm({ ...trainingForm, instructor: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Maximo de participantes"
            value={trainingForm.max_participants}
            onChange={(e) => setTrainingForm({ ...trainingForm, max_participants: Number(e.target.value) })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <Button className="w-full" onClick={handleScheduleTraining} disabled={!trainingForm.title || !trainingForm.date}>
            Agendar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

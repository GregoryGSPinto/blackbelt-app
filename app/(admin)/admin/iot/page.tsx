'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  getDevices,
  getLiveAccess,
  getOccupancy,
  getDeviceAlerts,
  type IoTDevice,
  type LiveAccessEvent,
  type OccupancyData,
  type DeviceAlert,
} from '@/lib/api/iot.service';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });

const DEVICE_TYPE_LABELS: Record<string, string> = {
  turnstile: 'Catraca',
  beacon: 'Beacon',
  display: 'Display',
  sensor: 'Sensor',
};

const DEVICE_TYPE_ICONS: Record<string, string> = {
  turnstile: '🚪',
  beacon: '📡',
  display: '🖥️',
  sensor: '🌡️',
};

const STATUS_STYLES: Record<string, { bg: React.CSSProperties; text: React.CSSProperties; dot: React.CSSProperties }> = {
  online: { bg: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)' }, text: { color: 'var(--bb-success)' }, dot: { background: 'var(--bb-success)' } },
  offline: { bg: { background: 'var(--bb-depth-2)' }, text: { color: 'var(--bb-ink-2)' }, dot: { background: 'var(--bb-ink-3)' } },
  error: { bg: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)' }, text: { color: 'var(--bb-danger)' }, dot: { background: 'var(--bb-danger)' } },
};

function getHourColor(count: number, max: number): string {
  const ratio = count / max;
  if (ratio >= 0.8) return 'var(--bb-danger)';
  if (ratio >= 0.6) return 'var(--bb-warning)';
  if (ratio >= 0.4) return 'var(--bb-warning)';
  if (ratio >= 0.2) return 'var(--bb-success)';
  return 'var(--bb-ink-3)';
}

export default function IoTPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [liveAccess, setLiveAccess] = useState<LiveAccessEvent[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [tab, setTab] = useState<'devices' | 'access' | 'metrics' | 'settings'>('devices');

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    Promise.all([
      getDevices('unit-1'),
      getLiveAccess('unit-1'),
      getOccupancy('unit-1'),
      getDeviceAlerts('unit-1'),
    ])
      .then(([d, la, o, al]) => {
        setDevices(d);
        setLiveAccess(la);
        setOccupancy(o);
        setAlerts(al);
      })
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const maxHourly = occupancy ? Math.max(...occupancy.hourly.map((h) => h.count)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader title="Painel IoT" subtitle={`${devices.length} dispositivos · ${onlineCount} online`} />

      {/* Alerts */}
      {alerts.filter((a) => !a.resolved).length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--bb-warning)', background: 'color-mix(in srgb, var(--bb-warning) 8%, transparent)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-warning)' }}>Alertas ({alerts.filter((a) => !a.resolved).length})</h3>
          <div className="mt-2 space-y-2">
            {alerts.filter((a) => !a.resolved).map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: alert.type === 'error' || alert.type === 'offline' ? 'var(--bb-danger)' : 'var(--bb-warning)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--bb-warning)' }}>{alert.device_name}: {alert.message}</p>
                  <p className="text-[10px]" style={{ color: 'color-mix(in srgb, var(--bb-warning) 70%, var(--bb-ink-1))' }}>{new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-bb-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-bb-gray-900">{devices.length}</p>
          <p className="text-xs text-bb-gray-500">Dispositivos</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-success)' }}>{onlineCount}</p>
          <p className="text-xs text-bb-gray-500">Online</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-bb-gray-900">{occupancy?.current ?? 0}</p>
          <p className="text-xs text-bb-gray-500">Ocupação Atual</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-bb-gray-900">{occupancy ? `${occupancy.percentage}%` : '—'}</p>
          <p className="text-xs text-bb-gray-500">Capacidade</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-bb-gray-200">
        {(['devices', 'access', 'metrics', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-bb-primary text-bb-primary' : 'text-bb-gray-500'}`}
          >
            {t === 'devices' && 'Dispositivos'}
            {t === 'access' && 'Acesso em Tempo Real'}
            {t === 'metrics' && 'Métricas'}
            {t === 'settings' && 'Configurações'}
          </button>
        ))}
      </div>

      {/* Devices Tab */}
      {tab === 'devices' && (
        <div className="space-y-3">
          {devices.length === 0 && (
            <EmptyState
              icon="📡"
              title="Nenhum dispositivo cadastrado"
              description="Adicione catracas, beacons, displays ou sensores para monitorar sua academia."
              variant="first-time"
            />
          )}
          {devices.map((device) => {
            const status = STATUS_STYLES[device.status];
            return (
              <div key={device.id} className="rounded-xl border border-bb-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{DEVICE_TYPE_ICONS[device.type] || '📦'}</span>
                    <div>
                      <p className="text-sm font-medium text-bb-gray-900">{device.name}</p>
                      <p className="text-xs text-bb-gray-500">{DEVICE_TYPE_LABELS[device.type]} · {device.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium" style={{ ...status.bg, ...status.text }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={status.dot} />
                      {device.status === 'online' ? 'Online' : device.status === 'offline' ? 'Offline' : 'Erro'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-bb-gray-400">
                  <span>Firmware: {device.firmware_version}</span>
                  <span>Última comunicação: {new Date(device.last_communication).toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Access Feed Tab */}
      {tab === 'access' && (
        <div className="rounded-xl border border-bb-gray-200">
          <div className="flex items-center justify-between border-b border-bb-gray-200 p-4">
            <h3 className="font-medium text-bb-gray-900">Feed de Acessos</h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full" style={{ background: 'var(--bb-success)' }} />
              <span className="text-xs text-bb-gray-500">Ao vivo</span>
            </div>
          </div>
          <div className="divide-y divide-bb-gray-100">
            {liveAccess.length === 0 && (
              <div className="p-4">
                <EmptyState
                  icon="🚶"
                  title="Nenhum acesso registrado"
                  description="Os acessos aparecerão aqui em tempo real conforme alunos entram e saem."
                  variant="first-time"
                />
              </div>
            )}
            {liveAccess.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-200 text-xs font-bold text-bb-gray-500">
                    {ev.student_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bb-gray-900">{ev.student_name}</p>
                    <p className="text-[10px] text-bb-gray-500">
                      {ev.direction === 'entry' ? '→ Entrada' : '← Saída'} · {ev.device_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-bb-gray-500">
                    {ev.method === 'qr_code' ? 'QR Code' : ev.method === 'proximity' ? 'Proximidade' : 'Manual'}
                  </span>
                  <p className="text-[10px] text-bb-gray-400">
                    {new Date(ev.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {tab === 'metrics' && occupancy && (
        <div className="space-y-6">
          {/* Occupancy vs Capacity */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Ocupação vs Capacidade</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 overflow-hidden rounded-full bg-bb-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${occupancy.percentage}%`, background: occupancy.percentage >= 80 ? 'var(--bb-danger)' : occupancy.percentage >= 60 ? 'var(--bb-warning)' : 'var(--bb-success)' }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-bb-gray-900">{occupancy.current}/{occupancy.max}</p>
                <p className="text-[10px] text-bb-gray-500">{occupancy.percentage}% ocupado</p>
              </div>
            </div>
          </div>

          {/* Hourly Heatmap */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Mapa de Calor por Hora</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy.hourly}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h: number) => `${h}h`} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={(h) => `${h}:00`} formatter={(v) => [`${v} pessoas`, 'Ocupação']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {occupancy.hourly.map((entry, idx) => (
                      <Cell key={idx} fill={getHourColor(entry.count, maxHourly)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-bb-gray-500">
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#94a3b8]" /> Baixa</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#22c55e]" /> Moderada</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#facc15]" /> Alta</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#f97316]" /> Muito Alta</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#ef4444]" /> Lotado</span>
            </div>
          </div>

          {/* Peak hours summary */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Resumo</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-bb-gray-900">{occupancy.hourly.reduce((a, h) => a + h.count, 0)}</p>
                <p className="text-[10px] text-bb-gray-500">Acessos Hoje</p>
              </div>
              <div>
                <p className="text-lg font-bold text-bb-gray-900">
                  {occupancy.hourly.reduce((max, h) => h.count > max.count ? h : max, occupancy.hourly[0]).hour}h
                </p>
                <p className="text-[10px] text-bb-gray-500">Horário Pico</p>
              </div>
              <div>
                <p className="text-lg font-bold text-bb-gray-900">{Math.round(occupancy.hourly.reduce((a, h) => a + h.count, 0) / occupancy.hourly.length)}</p>
                <p className="text-[10px] text-bb-gray-500">Média/Hora</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Link Devices */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-2 font-medium text-bb-gray-900">Vincular Dispositivos</h3>
            <p className="text-xs text-bb-gray-500">Adicione novos dispositivos IoT à unidade.</p>
            <Button variant="secondary" className="mt-3" onClick={() => toast('Dispositivo adicionado com sucesso!', 'success')}>Adicionar Dispositivo</Button>
          </div>

          {/* Alert Preferences */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Alertas</h3>
            <div className="space-y-3">
              {[
                { label: 'Dispositivo offline', desc: 'Notificar quando um dispositivo parar de responder' },
                { label: 'Capacidade excedida', desc: 'Alerta quando ocupação ultrapassar 90%' },
                { label: 'Acesso bloqueado', desc: 'Notificar em tentativa de acesso negada' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-bb-gray-900">{item.label}</p>
                    <p className="text-xs text-bb-gray-500">{item.desc}</p>
                  </div>
                  <div className="relative h-6 w-11 rounded-full" style={{ background: 'var(--bb-success)' }}>
                    <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Horário de Funcionamento</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-bb-gray-500">Abertura</label>
                <input type="time" defaultValue="06:00" className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-bb-gray-500">Fechamento</label>
                <input type="time" defaultValue="22:00" className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <Button variant="primary" className="mt-3" onClick={() => toast('Horário salvo com sucesso!', 'success')}>Salvar Horário</Button>
          </div>

          {/* Capacity */}
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-3 font-medium text-bb-gray-900">Capacidade Máxima</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Pessoas</label>
              <input
                type="number"
                defaultValue={occupancy?.max ?? 40}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <Button variant="primary" className="mt-3" onClick={() => toast('Capacidade atualizada com sucesso!', 'success')}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

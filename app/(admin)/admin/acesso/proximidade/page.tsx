'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  getProximityConfig,
  configureBeacon,
  configureGeofence,
  toggleAutoCheckin,
  type ProximityConfig,
  type BeaconConfig,
} from '@/lib/api/beacon.service';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

export default function ProximidadeAdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ProximityConfig | null>(null);
  const [showBeaconForm, setShowBeaconForm] = useState(false);
  const [newBeaconId, setNewBeaconId] = useState('');
  const [newBeaconName, setNewBeaconName] = useState('');
  const [newBeaconLocation, setNewBeaconLocation] = useState('');
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState('50');

  useEffect(() => {
    getProximityConfig('unit-1')
      .then(setConfig)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAutoCheckin = async () => {
    if (!config) return;
    try {
      const { enabled } = await toggleAutoCheckin('unit-1', !config.auto_checkin_enabled);
      setConfig({ ...config, auto_checkin_enabled: enabled });
      toast(enabled ? 'Check-in automático ativado' : 'Check-in automático desativado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  };

  const handleAddBeacon = async () => {
    if (!newBeaconId.trim()) return;
    try {
      const beacon = await configureBeacon('unit-1', newBeaconId, {
        name: newBeaconName,
        location_description: newBeaconLocation,
      });
      if (config) {
        setConfig({ ...config, beacons: [...config.beacons, beacon] });
      }
      setShowBeaconForm(false);
      setNewBeaconId('');
      setNewBeaconName('');
      setNewBeaconLocation('');
      toast('Beacon configurado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  };

  const handleSaveGeofence = async () => {
    const lat = parseFloat(geoLat);
    const lng = parseFloat(geoLng);
    const radius = parseInt(geoRadius, 10);
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      toast('Preencha coordenadas e raio', 'error');
      return;
    }
    try {
      const geo = await configureGeofence('unit-1', lat, lng, radius);
      if (config) {
        setConfig({ ...config, geofences: [geo] });
      }
      toast('Geofence salvo', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  };

  const handleToggleBeacon = async (beacon: BeaconConfig) => {
    try {
      const updated = await configureBeacon('unit-1', beacon.beacon_id, { active: !beacon.active });
      if (config) {
        setConfig({
          ...config,
          beacons: config.beacons.map((b) => b.id === beacon.id ? updated : b),
        });
      }
      toast(updated.active ? 'Beacon ativado' : 'Beacon desativado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  };

  if (loading || !config) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Check-in por Proximidade" subtitle="Configure beacons BLE e geofencing" />

      {/* Auto Check-in Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-bb-gray-200 p-4">
        <div>
          <h3 className="text-sm font-medium text-bb-gray-900">Check-in Automático</h3>
          <p className="mt-0.5 text-xs text-bb-gray-500">
            Quando ativo, alunos próximos com aula agendada fazem check-in automaticamente
          </p>
        </div>
        <button
          onClick={handleToggleAutoCheckin}
          className={`relative h-6 w-11 rounded-full transition-colors ${config.auto_checkin_enabled ? 'bg-green-500' : 'bg-bb-gray-300'}`}
        >
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.auto_checkin_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Dwell time */}
      <div className="rounded-xl border border-bb-gray-200 p-4">
        <h3 className="text-sm font-medium text-bb-gray-900">Tempo Mínimo de Permanência</h3>
        <p className="mt-0.5 text-xs text-bb-gray-500">
          Aluno deve permanecer próximo por pelo menos {config.min_dwell_seconds}s para ativar check-in
        </p>
      </div>

      {/* Beacons */}
      <div className="rounded-xl border border-bb-gray-200">
        <div className="flex items-center justify-between border-b border-bb-gray-200 p-4">
          <div>
            <h3 className="font-medium text-bb-gray-900">Beacons BLE</h3>
            <p className="text-xs text-bb-gray-500">{config.beacons.length} configurado(s)</p>
          </div>
          <Button variant="secondary" onClick={() => setShowBeaconForm(!showBeaconForm)}>
            {showBeaconForm ? 'Cancelar' : 'Adicionar'}
          </Button>
        </div>

        {showBeaconForm && (
          <div className="space-y-3 border-b border-bb-gray-200 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">ID do Beacon</label>
              <input
                type="text"
                value={newBeaconId}
                onChange={(e) => setNewBeaconId(e.target.value)}
                placeholder="BB-BLE-003"
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Nome</label>
              <input
                type="text"
                value={newBeaconName}
                onChange={(e) => setNewBeaconName(e.target.value)}
                placeholder="Sala 2"
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-bb-gray-500">Localização</label>
              <input
                type="text"
                value={newBeaconLocation}
                onChange={(e) => setNewBeaconLocation(e.target.value)}
                placeholder="Teto da sala 2"
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <Button variant="primary" onClick={handleAddBeacon}>Salvar Beacon</Button>
          </div>
        )}

        <div className="divide-y divide-bb-gray-100">
          {config.beacons.length === 0 && (
            <EmptyState
              icon="📡"
              title="Nenhum beacon configurado"
              description="Adicione beacons BLE para habilitar check-in por proximidade."
              actionLabel="Adicionar Beacon"
              onAction={() => setShowBeaconForm(true)}
            />
          )}
          {config.beacons.map((beacon) => (
            <div key={beacon.id} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${beacon.active ? 'bg-green-500' : 'bg-bb-gray-300'}`} />
                  <p className="text-sm font-medium text-bb-gray-900">{beacon.name}</p>
                </div>
                <p className="mt-0.5 text-xs text-bb-gray-500">{beacon.location_description}</p>
                <p className="mt-0.5 text-[10px] text-bb-gray-400">
                  ID: {beacon.beacon_id} · TX: {beacon.tx_power}dBm · Visto: {new Date(beacon.last_seen).toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => handleToggleBeacon(beacon)}
                className={`relative h-6 w-11 rounded-full transition-colors ${beacon.active ? 'bg-green-500' : 'bg-bb-gray-300'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${beacon.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Geofence */}
      <div className="rounded-xl border border-bb-gray-200 p-4">
        <h3 className="mb-3 font-medium text-bb-gray-900">Geofencing</h3>

        {config.geofences.length > 0 && (
          <div className="mb-4 rounded-lg bg-bb-gray-50 p-3">
            <p className="text-xs font-medium text-bb-gray-900">Geofence Atual</p>
            <p className="mt-0.5 text-[10px] text-bb-gray-500">
              {config.geofences[0].name} — Lat: {config.geofences[0].latitude}, Lng: {config.geofences[0].longitude}, Raio: {config.geofences[0].radius_meters}m
            </p>
            <div className="mt-1 flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${config.geofences[0].active ? 'bg-green-500' : 'bg-bb-gray-300'}`} />
              <span className="text-[10px] text-bb-gray-500">{config.geofences[0].active ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-500">Latitude</label>
            <input
              type="text"
              value={geoLat || (config.geofences[0]?.latitude.toString() ?? '')}
              onChange={(e) => setGeoLat(e.target.value)}
              placeholder="-23.5505"
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-500">Longitude</label>
            <input
              type="text"
              value={geoLng || (config.geofences[0]?.longitude.toString() ?? '')}
              onChange={(e) => setGeoLng(e.target.value)}
              placeholder="-46.6333"
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-bb-gray-500">Raio (metros)</label>
            <input
              type="number"
              value={geoRadius || (config.geofences[0]?.radius_meters.toString() ?? '50')}
              onChange={(e) => setGeoRadius(e.target.value)}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <Button variant="primary" className="mt-3" onClick={handleSaveGeofence}>
          Salvar Geofence
        </Button>
      </div>
    </div>
  );
}

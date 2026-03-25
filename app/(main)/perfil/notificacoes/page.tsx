'use client';

import { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/api/notification-preferences.service';
import type { NotificationPreferences, NotificationChannel, NotificationTemplate } from '@/lib/types/notification';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

const TEMPLATE_LABELS: Record<NotificationTemplate, string> = {
  aula_em_breve: 'Lembrete de Aula',
  fatura_vencendo: 'Fatura Vencendo',
  promocao_faixa: 'Promoção de Faixa',
  mensagem_professor: 'Mensagem do Professor',
  conquista_nova: 'Nova Conquista',
  boas_vindas: 'Boas-vindas',
  inatividade: 'Inatividade',
  falta_detectada: 'Falta Detectada',
  aniversario: 'Aniversário',
  relatorio_mensal: 'Relatório Mensal',
};

const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: 'push', label: 'Push' },
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'in_app', label: 'In-App' },
];

const ALL_TEMPLATES = Object.keys(TEMPLATE_LABELS) as NotificationTemplate[];

export default function NotificacoesPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getNotificationPreferences('user-1').then(setPrefs).finally(() => setLoading(false));
  }, []);

  function toggleChannel(template: NotificationTemplate, channel: NotificationChannel) {
    if (!prefs) return;
    const current = prefs.channels[template] ?? [];
    const updated = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    setPrefs({
      ...prefs,
      channels: { ...prefs.channels, [template]: updated },
    });
  }

  async function handleSave() {
    if (!prefs) return;
    setSaving(true);
    try {
      await updateNotificationPreferences('user-1', prefs);
      toast('Preferências salvas', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!prefs) return null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Preferências de Notificação</h1>

      {/* Master Mute */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-bb-black">Silenciar Tudo</p>
            <p className="text-sm text-bb-gray-500">Desativar todas as notificações</p>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, muteAll: !prefs.muteAll })}
            className={`relative h-6 w-11 rounded-full transition-colors ${prefs.muteAll ? 'bg-red-500' : 'bg-bb-gray-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs.muteAll ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-4">
        <p className="mb-3 font-medium text-bb-black">Horário de Silêncio</p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-bb-gray-500">De</label>
          <input
            type="time"
            value={prefs.quietHoursStart}
            onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
            className="rounded-lg border border-bb-gray-300 px-2 py-1 text-sm"
          />
          <label className="text-sm text-bb-gray-500">até</label>
          <input
            type="time"
            value={prefs.quietHoursEnd}
            onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
            className="rounded-lg border border-bb-gray-300 px-2 py-1 text-sm"
          />
        </div>
      </Card>

      {/* Channel Matrix */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Tipo</th>
                {CHANNELS.map((ch) => (
                  <th key={ch.id} className="px-4 py-3 text-center font-medium text-bb-gray-500">{ch.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TEMPLATES.map((template) => (
                <tr key={template} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-medium text-bb-black">{TEMPLATE_LABELS[template]}</td>
                  {CHANNELS.map((ch) => {
                    const active = prefs.channels[template]?.includes(ch.id) ?? false;
                    return (
                      <td key={ch.id} className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleChannel(template, ch.id)}
                          disabled={prefs.muteAll}
                          className={`h-5 w-5 rounded border-2 transition-colors ${
                            active && !prefs.muteAll
                              ? 'border-green-500 bg-green-500'
                              : 'border-bb-gray-300 bg-white'
                          } ${prefs.muteAll ? 'opacity-40' : ''}`}
                        >
                          {active && !prefs.muteAll && <span className="text-xs text-white">✓</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Salvar Preferências</Button>
    </div>
  );
}

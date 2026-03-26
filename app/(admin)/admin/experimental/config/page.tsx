'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { getTrialConfig, updateTrialConfig, seedDefaultConfig } from '@/lib/api/trial.service';
import type { TrialConfig } from '@/lib/api/trial.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Settings, Save } from 'lucide-react';

export default function TrialConfigPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<TrialConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const aid = getActiveAcademyId();
        let c = await getTrialConfig(aid);
        if (!c) c = await seedDefaultConfig(aid);
        setConfig(c);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof TrialConfig>(key: K, value: TrialConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await updateTrialConfig(getActiveAcademyId(), config);
      if (updated) setConfig(updated);
      toast('Configurações salvas', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-32" />)}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
        Erro ao carregar configurações
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Configurações do Trial
        </h1>
      </div>

      {/* General */}
      <Section title="Geral">
        <NumberField label="Duração do trial (dias)" value={config.trial_duration_days} onChange={(v) => update('trial_duration_days', v)} min={1} max={30} />
        <NumberField label="Limite de aulas" value={config.trial_classes_limit} onChange={(v) => update('trial_classes_limit', v)} min={1} max={99} />
        <p className="text-[10px]" style={{ color: 'var(--bb-ink-20)' }}>99 = ilimitado</p>
        <Toggle label="Criar conta automaticamente" checked={config.auto_create_account} onChange={(v) => update('auto_create_account', v)} />
        <Toggle label="Exigir telefone" checked={config.require_phone} onChange={(v) => update('require_phone', v)} />
        <Toggle label="Exigir email" checked={config.require_email} onChange={(v) => update('require_email', v)} />
        <Toggle label="Exigir declaração de saúde" checked={config.require_health_declaration} onChange={(v) => update('require_health_declaration', v)} />
      </Section>

      {/* Automations */}
      <Section title="Automações">
        <Toggle label="Enviar boas-vindas WhatsApp" checked={config.send_welcome_whatsapp} onChange={(v) => update('send_welcome_whatsapp', v)} />
        <Toggle label="Lembrete no dia 3" checked={config.send_day3_reminder} onChange={(v) => update('send_day3_reminder', v)} />
        <Toggle label="Lembrete no dia 5" checked={config.send_day5_reminder} onChange={(v) => update('send_day5_reminder', v)} />
        <Toggle label="Aviso de expiração" checked={config.send_expiry_notification} onChange={(v) => update('send_expiry_notification', v)} />
        <Toggle label="Oferta pós-expiração" checked={config.send_post_expiry_offer} onChange={(v) => update('send_post_expiry_offer', v)} />
      </Section>

      {/* Conversion offer */}
      <Section title="Oferta de Conversão">
        <NumberField label="Desconto de conversão (%)" value={config.conversion_discount_percent} onChange={(v) => update('conversion_discount_percent', v)} min={0} max={50} />
        <NumberField label="Validade do desconto (dias)" value={config.conversion_discount_valid_days} onChange={(v) => update('conversion_discount_valid_days', v)} min={1} max={30} />
      </Section>

      {/* Messages */}
      <Section title="Mensagens Personalizáveis">
        <TextAreaField label="Mensagem de boas-vindas" value={config.welcome_message} onChange={(v) => update('welcome_message', v)} />
        <TextAreaField label="Aviso de expiração" value={config.expiry_warning_message} onChange={(v) => update('expiry_warning_message', v)} />
        <TextAreaField label="Mensagem pós-expiração" value={config.expired_message} onChange={(v) => update('expired_message', v)} />
      </Section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        style={{ background: 'var(--bb-brand)' }}
      >
        <Save className="h-4 w-4" />
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
      <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1">
      <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{label}</span>
      <div
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ background: checked ? 'var(--bb-brand)' : 'var(--bb-depth-3)' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </div>
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 rounded-lg px-2 py-1 text-center text-sm"
        style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
      />
    </div>
  );
}

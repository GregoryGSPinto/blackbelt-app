'use client';

import { forwardRef, useState } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import type { ParentalControlConfig } from '@/lib/types/domain';

// ── Types ──────────────────────────────────────────────────────────────

interface ParentalControlPanelProps {
  studentName: string;
  profileId: string;
  initialConfig?: Partial<ParentalControlConfig>;
  onSave?: (config: ParentalControlConfig) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ParentalControlConfig = {
  canChangeEmail: false,
  canChangePassword: false,
  canViewFinancial: false,
  canSendMessages: true,
  canSelfCheckin: true,
  isSuspended: false,
  suspendedUntil: null,
  suspendedReason: null,
};

// ── Toggle Item ────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? 'var(--bb-brand)' : 'var(--bb-depth-3)' }}
      >
        <span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────

const ParentalControlPanel = forwardRef<HTMLDivElement, ParentalControlPanelProps>(
  function ParentalControlPanel({ studentName, profileId: _profileId, initialConfig, onSave }, ref) {
    const { toast } = useToast();
    const [config, setConfig] = useState<ParentalControlConfig>({
      ...DEFAULT_CONFIG,
      ...initialConfig,
    });
    const [saving, setSaving] = useState(false);

    function updateConfig<K extends keyof ParentalControlConfig>(key: K, value: ParentalControlConfig[K]) {
      setConfig((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
      setSaving(true);
      try {
        // Em mock, simula save
        await new Promise((r) => setTimeout(r, 500));
        onSave?.(config);
        toast('Controle parental atualizado!', 'success');
      } catch {
        toast('Erro ao salvar controle parental', 'error');
      } finally {
        setSaving(false);
      }
    }

    return (
      <div ref={ref} className="flex flex-col gap-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Controle Parental — {studentName}
          </h3>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            Defina o que seu filho(a) pode fazer no app
          </p>
        </div>

        <div
          className="divide-y rounded-lg px-4"
          style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)', borderColor: 'var(--bb-glass-border)' }}
        >
          <ToggleRow
            label="Pode alterar email"
            description="Permitir que altere o email da conta"
            checked={config.canChangeEmail}
            onChange={(v) => updateConfig('canChangeEmail', v)}
          />
          <ToggleRow
            label="Pode alterar senha"
            description="Permitir que altere a senha da conta"
            checked={config.canChangePassword}
            onChange={(v) => updateConfig('canChangePassword', v)}
          />
          <ToggleRow
            label="Pode ver financeiro"
            description="Visualizar pagamentos e faturas"
            checked={config.canViewFinancial}
            onChange={(v) => updateConfig('canViewFinancial', v)}
          />
          <ToggleRow
            label="Pode enviar mensagens"
            description="Enviar mensagens para professores e colegas"
            checked={config.canSendMessages}
            onChange={(v) => updateConfig('canSendMessages', v)}
          />
          <ToggleRow
            label="Pode fazer check-in sozinho"
            description="Registrar presenca sem supervisao"
            checked={config.canSelfCheckin}
            onChange={(v) => updateConfig('canSelfCheckin', v)}
          />
        </div>

        {/* Suspensao temporaria */}
        <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
          <ToggleRow
            label="Suspender acesso temporariamente"
            description="Bloqueia o acesso do teen ao app"
            checked={config.isSuspended}
            onChange={(v) => updateConfig('isSuspended', v)}
          />
          {config.isSuspended && (
            <div className="flex flex-col gap-2 pt-2">
              <input
                type="date"
                value={config.suspendedUntil ?? ''}
                onChange={(e) => updateConfig('suspendedUntil', e.target.value || null)}
                placeholder="Suspender ate (opcional)"
                className="h-10 w-full rounded-lg px-3 text-sm"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
              <input
                type="text"
                value={config.suspendedReason ?? ''}
                onChange={(e) => updateConfig('suspendedReason', e.target.value || null)}
                placeholder="Motivo da suspensao (opcional)"
                className="h-10 w-full rounded-lg px-3 text-sm"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          {saving ? 'Salvando...' : 'Salvar Controle Parental'}
        </button>
      </div>
    );
  },
);

ParentalControlPanel.displayName = 'ParentalControlPanel';

export { ParentalControlPanel };
export type { ParentalControlPanelProps };

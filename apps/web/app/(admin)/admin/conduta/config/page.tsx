'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  getConductConfig,
  updateConductConfig,
  seedDefaultConductConfig,
} from '@/lib/api/conduct-code.service';
import type { ConductConfig } from '@/lib/api/conduct-code.service';

// -- Toggle field definitions ------------------------------------------------

const TOGGLE_FIELDS: {
  key: keyof Pick<
    ConductConfig,
    'require_acceptance_on_signup' | 'auto_escalate_sanctions' | 'notify_on_incident' | 'notify_on_sanction'
  >;
  label: string;
  description: string;
}[] = [
  {
    key: 'require_acceptance_on_signup',
    label: 'Exigir aceite no cadastro',
    description: 'Novos alunos devem aceitar o codigo de conduta ao se cadastrar na academia.',
  },
  {
    key: 'auto_escalate_sanctions',
    label: 'Escalar sancoes automaticamente',
    description: 'Sancoes sao escaladas automaticamente conforme limites de advertencias e suspensoes.',
  },
  {
    key: 'notify_on_incident',
    label: 'Notificar ao registrar ocorrencia',
    description: 'Envia notificacao ao aluno quando uma ocorrencia e registrada.',
  },
  {
    key: 'notify_on_sanction',
    label: 'Notificar ao aplicar sancao',
    description: 'Envia notificacao ao aluno quando uma sancao e aplicada.',
  },
];

// -- Number field definitions ------------------------------------------------

const NUMBER_FIELDS: {
  key: keyof Pick<ConductConfig, 'suspension_after_warnings' | 'ban_after_suspensions'>;
  label: string;
  description: string;
  min: number;
  max: number;
}[] = [
  {
    key: 'suspension_after_warnings',
    label: 'Suspensao apos X advertencias',
    description: 'Numero de advertencias escritas antes de aplicar suspensao automatica.',
    min: 1,
    max: 20,
  },
  {
    key: 'ban_after_suspensions',
    label: 'Banimento apos X suspensoes',
    description: 'Numero de suspensoes antes de aplicar banimento automatico.',
    min: 1,
    max: 10,
  },
];

// -- Skeleton ----------------------------------------------------------------

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-64" />
      </div>
      <Skeleton variant="card" className="h-80" />
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-14" />
    </div>
  );
}

// -- Toggle component (uses shared Toggle from @/components/ui/Toggle) ------

// -- Main page ---------------------------------------------------------------

export default function ConductConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [config, setConfig] = useState<ConductConfig | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await getConductConfig(academyId);
        setConfig(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Save ------------------------------------------------------------------

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const academyId = getActiveAcademyId();
      const updated = await updateConductConfig(academyId, {
        require_acceptance_on_signup: config.require_acceptance_on_signup,
        auto_escalate_sanctions: config.auto_escalate_sanctions,
        notify_on_incident: config.notify_on_incident,
        notify_on_sanction: config.notify_on_sanction,
        suspension_after_warnings: config.suspension_after_warnings,
        ban_after_suspensions: config.ban_after_suspensions,
      });
      if (updated) {
        setConfig(updated);
        toast('Configuracoes salvas com sucesso', 'success');
      } else {
        toast('Erro ao salvar configuracoes', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  // -- Seed defaults ---------------------------------------------------------

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      const academyId = getActiveAcademyId();
      const seeded = await seedDefaultConductConfig(academyId);
      if (seeded) {
        setConfig(seeded);
        toast('Configuracao padrao gerada com sucesso', 'success');
      } else {
        toast('Erro ao gerar configuracao padrao', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  // -- Toggle handler --------------------------------------------------------

  function toggleField(key: keyof ConductConfig) {
    if (!config) return;
    setConfig({ ...config, [key]: !config[key as keyof ConductConfig] } as ConductConfig);
  }

  // -- Number handler --------------------------------------------------------

  function updateNumber(key: keyof ConductConfig, value: number) {
    if (!config) return;
    setConfig({ ...config, [key]: value } as ConductConfig);
  }

  // -- Loading state ---------------------------------------------------------

  if (loading) return <PageSkeleton />;

  // -- Empty state: no config yet --------------------------------------------

  if (!config) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/conduta"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'var(--bb-depth-3)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Configuracoes de Conduta
          </h1>
        </div>

        <Card
          className="p-6 text-center"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <Settings size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhuma configuracao de conduta encontrada para esta academia.
          </p>
          <Button
            className="mt-4"
            loading={seeding}
            disabled={seeding}
            onClick={handleSeedDefaults}
          >
            <RotateCcw size={14} className="mr-1" />
            Gerar Configuracao Padrao
          </Button>
        </Card>
      </div>
    );
  }

  // -- Config form -----------------------------------------------------------

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/conduta"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ background: 'var(--bb-depth-3)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Configuracoes de Conduta
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Defina as regras de conduta e sancoes da sua academia
          </p>
        </div>
      </div>

      {/* Toggle switches */}
      <Card
        className="divide-y p-0"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        {TOGGLE_FIELDS.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
            style={{ borderColor: 'var(--bb-glass-border)' }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                {field.label}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {field.description}
              </p>
            </div>
            <Toggle
              checked={Boolean(config[field.key])}
              onChange={() => toggleField(field.key)}
            />
          </div>
        ))}
      </Card>

      {/* Number inputs */}
      <Card
        className="divide-y p-0"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        {NUMBER_FIELDS.map((field) => (
          <div
            key={field.key}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            style={{ borderColor: 'var(--bb-glass-border)' }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                {field.label}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {field.description}
              </p>
            </div>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={config[field.key]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= field.min && val <= field.max) {
                  updateNumber(field.key, val);
                }
              }}
              className="w-full rounded-lg px-3 py-2 text-sm sm:w-24"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
                borderRadius: 'var(--bb-radius-md)',
              }}
            />
          </div>
        ))}
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          size="sm"
          loading={seeding}
          disabled={seeding || saving}
          onClick={handleSeedDefaults}
        >
          <RotateCcw size={14} className="mr-1" />
          Restaurar Padrao
        </Button>
        <Button
          loading={saving}
          disabled={saving || seeding}
          onClick={handleSave}
        >
          <Save size={14} className="mr-1" />
          Salvar Configuracoes
        </Button>
      </div>
    </div>
  );
}

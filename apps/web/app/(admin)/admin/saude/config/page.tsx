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
  getHealthConfig,
  updateHealthConfig,
  seedDefaultHealthConfig,
} from '@/lib/api/health-declaration.service';
import type { HealthConfig } from '@/lib/api/health-declaration.service';

// ── Toggle labels ─────────────────────────────────────────────────

const TOGGLE_FIELDS: {
  key: keyof Pick<
    HealthConfig,
    'require_parq' | 'require_medical_clearance' | 'require_emergency_contact' | 'require_pretraining_check' | 'auto_restrict_on_injury' | 'notify_professor_restrictions'
  >;
  label: string;
  description: string;
}[] = [
  {
    key: 'require_parq',
    label: 'Exigir PAR-Q',
    description: 'Alunos devem preencher o questionario PAR-Q antes de iniciar os treinos.',
  },
  {
    key: 'require_medical_clearance',
    label: 'Exigir Atestado Medico',
    description: 'Exige atestado medico valido para participacao nos treinos.',
  },
  {
    key: 'require_emergency_contact',
    label: 'Exigir Contato de Emergencia',
    description: 'Alunos devem informar um contato de emergencia no cadastro.',
  },
  {
    key: 'require_pretraining_check',
    label: 'Check Pre-treino',
    description: 'Habilita verificacao de saude antes de cada treino pelo professor.',
  },
  {
    key: 'auto_restrict_on_injury',
    label: 'Restricao Automatica por Lesao',
    description: 'Aplica restricoes de treino automaticamente ao registrar uma lesao.',
  },
  {
    key: 'notify_professor_restrictions',
    label: 'Notificar Professor sobre Restricoes',
    description: 'Professores recebem notificacao quando um aluno tem restricao de treino.',
  },
];

// ── Skeleton ──────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-64" />
      </div>
      <Skeleton variant="card" className="h-96" />
      <Skeleton variant="card" className="h-24" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function HealthConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [config, setConfig] = useState<HealthConfig | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await getHealthConfig(academyId);
        setConfig(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ────────────────────────────────────────────────────────

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const academyId = getActiveAcademyId();
      const updated = await updateHealthConfig(academyId, {
        require_parq: config.require_parq,
        require_medical_clearance: config.require_medical_clearance,
        clearance_validity_months: config.clearance_validity_months,
        require_emergency_contact: config.require_emergency_contact,
        require_pretraining_check: config.require_pretraining_check,
        auto_restrict_on_injury: config.auto_restrict_on_injury,
        notify_professor_restrictions: config.notify_professor_restrictions,
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

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      const academyId = getActiveAcademyId();
      const seeded = await seedDefaultHealthConfig(academyId);
      if (seeded) {
        setConfig(seeded);
        toast('Configuracoes padrao restauradas', 'success');
      } else {
        toast('Erro ao restaurar configuracoes', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  // ── Toggle handler ──────────────────────────────────────────────

  function toggleField(key: keyof HealthConfig) {
    if (!config) return;
    setConfig({ ...config, [key]: !config[key as keyof HealthConfig] } as HealthConfig);
  }

  if (loading) return <PageSkeleton />;

  // No config yet - allow seeding
  if (!config) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/saude" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ background: 'var(--bb-depth-3)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Configuracoes de Saude</h1>
        </div>

        <Card className="p-6 text-center" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}>
          <Settings size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhuma configuracao de saude encontrada para esta academia.
          </p>
          <Button
            className="mt-4"
            loading={seeding}
            disabled={seeding}
            onClick={handleSeedDefaults}
          >
            <RotateCcw size={14} className="mr-1" />
            Criar Configuracoes Padrao
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/saude" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ background: 'var(--bb-depth-3)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Configuracoes de Saude</h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Defina as regras de saude e aptidao para sua academia
          </p>
        </div>
      </div>

      {/* Toggles */}
      <Card
        className="divide-y p-0"
        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
      >
        {TOGGLE_FIELDS.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
            style={{ borderColor: 'var(--bb-glass-border)' }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{field.label}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{field.description}</p>
            </div>
            <Toggle checked={Boolean(config[field.key])} onChange={() => toggleField(field.key)} label={field.label} />
          </div>
        ))}
      </Card>

      {/* Clearance Validity */}
      <Card
        className="p-4 sm:p-6"
        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Validade do Atestado (meses)
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              Tempo em meses que um atestado medico permanece valido.
            </p>
          </div>
          <input
            type="number"
            min={1}
            max={60}
            value={config.clearance_validity_months}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                setConfig({ ...config, clearance_validity_months: val });
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

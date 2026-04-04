// ── Feature Flags (P-097) ─────────────────────────────────────
// A/B testing and feature toggle framework

export type FeatureFlag =
  | 'gamification'
  | 'chat'
  | 'qr_checkin'
  | 'whatsapp'
  | 'nfe'
  | 'multi_branch'
  | 'analytics_advanced'
  | 'ai_recommendations'
  | 'competition_brackets'
  | 'white_label'
  | 'api_public'
  | 'weekly_report'
  | 'mfa'
  | 'referral';

interface FeatureFlagConfig {
  id: FeatureFlag;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  variant?: 'A' | 'B';
  requiredPlan?: string[];
}

const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  { id: 'gamification', name: 'Gamificação', description: 'XP, levels e badges', enabled: true, rolloutPercentage: 100 },
  { id: 'chat', name: 'Chat Interno', description: 'Mensagens entre professor e aluno', enabled: true, rolloutPercentage: 100 },
  { id: 'qr_checkin', name: 'QR Check-in', description: 'Check-in por QR Code', enabled: true, rolloutPercentage: 100 },
  { id: 'whatsapp', name: 'WhatsApp', description: 'Integração WhatsApp', enabled: true, rolloutPercentage: 80, requiredPlan: ['pro', 'blackbelt', 'enterprise'] },
  { id: 'nfe', name: 'NF-e', description: 'Nota fiscal eletrônica', enabled: true, rolloutPercentage: 100, requiredPlan: ['pro', 'blackbelt', 'enterprise'] },
  { id: 'multi_branch', name: 'Multi-filial', description: 'Gestão de múltiplas unidades', enabled: true, rolloutPercentage: 100, requiredPlan: ['blackbelt', 'enterprise'] },
  { id: 'analytics_advanced', name: 'Analytics Avançado', description: 'Dashboards e previsão de churn', enabled: true, rolloutPercentage: 100 },
  { id: 'ai_recommendations', name: 'Recomendações IA', description: 'Conteúdo recomendado personalizado', enabled: true, rolloutPercentage: 50, variant: 'A' },
  { id: 'competition_brackets', name: 'Campeonatos', description: 'Chaves de competição internas', enabled: true, rolloutPercentage: 100 },
  { id: 'white_label', name: 'White Label', description: 'Marca customizável', enabled: true, rolloutPercentage: 100, requiredPlan: ['enterprise'] },
  { id: 'api_public', name: 'API Pública', description: 'API REST documentada', enabled: true, rolloutPercentage: 100, requiredPlan: ['pro', 'blackbelt', 'enterprise'] },
  { id: 'weekly_report', name: 'Relatório Semanal', description: 'Email automático toda segunda', enabled: true, rolloutPercentage: 100 },
  { id: 'mfa', name: '2FA/MFA', description: 'Autenticação em dois fatores', enabled: true, rolloutPercentage: 100 },
  { id: 'referral', name: 'Indicações', description: 'Sistema de indicação entre academias', enabled: true, rolloutPercentage: 100 },
];

// ── API ───────────────────────────────────────────────────────

let overrides: Partial<Record<FeatureFlag, boolean>> = {};

export function isFeatureEnabled(flag: FeatureFlag, academyPlan?: string): boolean {
  if (flag in overrides) return overrides[flag]!;

  const config = DEFAULT_FLAGS.find((f) => f.id === flag);
  if (!config) return false;
  if (!config.enabled) return false;

  // Plan gate
  if (config.requiredPlan && academyPlan && !config.requiredPlan.includes(academyPlan)) {
    return false;
  }

  // Rollout check (simple deterministic based on flag name)
  if (config.rolloutPercentage < 100) {
    const hash = flag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 100) < config.rolloutPercentage;
  }

  return true;
}

export function setFeatureOverride(flag: FeatureFlag, enabled: boolean): void {
  overrides[flag] = enabled;
}

export function clearFeatureOverrides(): void {
  overrides = {};
}

export function getAllFlags(): FeatureFlagConfig[] {
  return DEFAULT_FLAGS.map((f) => ({
    ...f,
    enabled: f.id in overrides ? overrides[f.id]! : f.enabled,
  }));
}

export function getFeatureVariant(flag: FeatureFlag): 'A' | 'B' | null {
  const config = DEFAULT_FLAGS.find((f) => f.id === flag);
  return config?.variant ?? null;
}

import { PLANS, PAGE_MODULE_MAP, getMinimumPlan, type ModuleId, type PlanDefinition } from './module-access';

export interface AccessStatus {
  allowed: boolean;
  reason: 'plan_includes' | 'trial_active' | 'discovery_active' | 'module_purchased' | 'blocked' | 'superadmin_bypass';
  currentPlan: PlanDefinition | null;
  requiredPlan: PlanDefinition | null;
  trialEndsAt: string | null;
  discoveryEndsAt: string | null;
  trialDaysLeft: number;
  discoveryDaysLeft: number;
  message: string;
}

export interface AcademySubscription {
  academyId: string;
  planSlug: string;
  status: 'trial' | 'discovery' | 'active' | 'past_due' | 'cancelled';
  createdAt: string;
  trialEndsAt: string;
  discoveryEndsAt: string;
  paidModules: ModuleId[];
}

// ══════════════════════════════════════
// VERIFICACAO PRINCIPAL
// ══════════════════════════════════════

export function checkAccess(
  subscription: AcademySubscription,
  module: ModuleId,
): AccessStatus {
  const now = new Date();
  const trialEnd = new Date(subscription.trialEndsAt);
  const discoveryEnd = new Date(subscription.discoveryEndsAt);
  const currentPlan = PLANS.find((p) => p.slug === subscription.planSlug) || PLANS[0];
  const requiredPlan = getMinimumPlan(module);
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const discoveryDaysLeft = Math.max(0, Math.ceil((discoveryEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // 1. Trial ativo (primeiros 7 dias) → TUDO liberado
  if (now < trialEnd && subscription.status === 'trial') {
    return {
      allowed: true,
      reason: 'trial_active',
      currentPlan,
      requiredPlan: null,
      trialEndsAt: subscription.trialEndsAt,
      discoveryEndsAt: subscription.discoveryEndsAt,
      trialDaysLeft,
      discoveryDaysLeft,
      message: `Trial ativo — ${trialDaysLeft} dias restantes. Tudo liberado!`,
    };
  }

  // 2. Periodo de descoberta (dia 8 ao dia 97) → TUDO liberado com aviso
  if (now < discoveryEnd && (subscription.status === 'discovery' || subscription.status === 'active')) {
    return {
      allowed: true,
      reason: 'discovery_active',
      currentPlan,
      requiredPlan: null,
      trialEndsAt: subscription.trialEndsAt,
      discoveryEndsAt: subscription.discoveryEndsAt,
      trialDaysLeft: 0,
      discoveryDaysLeft,
      message: `Periodo de descoberta — ${discoveryDaysLeft} dias restantes. Aproveite todos os modulos!`,
    };
  }

  // 3. Apos descoberta: verificar se o plano inclui o modulo
  if (currentPlan.modules.includes(module)) {
    return {
      allowed: true,
      reason: 'plan_includes',
      currentPlan,
      requiredPlan: null,
      trialEndsAt: null,
      discoveryEndsAt: null,
      trialDaysLeft: 0,
      discoveryDaysLeft: 0,
      message: `Incluido no plano ${currentPlan.name}.`,
    };
  }

  // 4. Verificar modulo a la carte
  if (subscription.paidModules.includes(module)) {
    return {
      allowed: true,
      reason: 'module_purchased',
      currentPlan,
      requiredPlan: null,
      trialEndsAt: null,
      discoveryEndsAt: null,
      trialDaysLeft: 0,
      discoveryDaysLeft: 0,
      message: 'Modulo contratado separadamente.',
    };
  }

  // 5. BLOQUEADO
  return {
    allowed: false,
    reason: 'blocked',
    currentPlan,
    requiredPlan,
    trialEndsAt: null,
    discoveryEndsAt: null,
    trialDaysLeft: 0,
    discoveryDaysLeft: 0,
    message: `Este recurso requer o plano ${requiredPlan.name} (R$ ${requiredPlan.price}/mes).`,
  };
}

// Verificar acesso por rota
export function checkPageAccess(
  subscription: AcademySubscription,
  pathname: string,
): AccessStatus {
  const requiredModule = PAGE_MODULE_MAP[pathname];

  if (!requiredModule) {
    return {
      allowed: true,
      reason: 'plan_includes',
      currentPlan: null,
      requiredPlan: null,
      trialEndsAt: null,
      discoveryEndsAt: null,
      trialDaysLeft: 0,
      discoveryDaysLeft: 0,
      message: 'Acesso livre.',
    };
  }

  return checkAccess(subscription, requiredModule);
}

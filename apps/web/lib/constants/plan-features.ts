export interface FeatureDefinition {
  id: string;
  name: string;
  category: 'core' | 'essencial' | 'pro' | 'blackbelt' | 'enterprise';
}

export const ALL_FEATURES: FeatureDefinition[] = [
  { id: 'gestao_alunos', name: 'Gestão de Alunos', category: 'core' },
  { id: 'checkin', name: 'Check-in', category: 'core' },
  { id: 'financeiro_basico', name: 'Financeiro Básico', category: 'core' },
  { id: 'agenda', name: 'Agenda', category: 'core' },
  { id: 'notificacoes', name: 'Notificações', category: 'core' },
  { id: 'biblioteca_videos', name: 'Biblioteca de Vídeos', category: 'core' },
  { id: 'streaming_library', name: 'Streaming Library', category: 'essencial' },
  { id: 'certificados_digitais', name: 'Certificados Digitais', category: 'essencial' },
  { id: 'relatorios_avancados', name: 'Relatórios Avançados', category: 'essencial' },
  { id: 'comunicacao_responsaveis', name: 'Comunicação com Responsáveis', category: 'essencial' },
  { id: 'app_aluno', name: 'App do Aluno', category: 'essencial' },
  { id: 'compete', name: 'Módulo Compete (Campeonatos)', category: 'pro' },
  { id: 'gamificacao_teen', name: 'Gamificação Teen', category: 'pro' },
  { id: 'curriculo_tecnico', name: 'Currículo Técnico', category: 'pro' },
  { id: 'match_analysis', name: 'Match Analysis', category: 'pro' },
  { id: 'estoque', name: 'Estoque', category: 'pro' },
  { id: 'contratos_digitais', name: 'Contratos Digitais', category: 'pro' },
  { id: 'franqueador', name: 'Painel Franqueador', category: 'blackbelt' },
  { id: 'white_label', name: 'White-Label', category: 'blackbelt' },
  { id: 'api_access', name: 'API Access', category: 'blackbelt' },
  { id: 'suporte_prioritario', name: 'Suporte Prioritário', category: 'blackbelt' },
  { id: 'relatorios_multi_unidade', name: 'Relatórios Multi-Unidade', category: 'blackbelt' },
  { id: 'sla_dedicado', name: 'SLA Dedicado', category: 'enterprise' },
  { id: 'onboarding_assistido', name: 'Onboarding Assistido', category: 'enterprise' },
  { id: 'customizacoes', name: 'Customizações', category: 'enterprise' },
  { id: 'integracao_legados', name: 'Integração Sistemas Legados', category: 'enterprise' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  essencial: 'Essencial',
  pro: 'Pro',
  blackbelt: 'Black Belt',
  enterprise: 'Enterprise',
};

export function getFeaturesForTier(tier: string): string[] {
  const order = ['core', 'essencial', 'pro', 'blackbelt', 'enterprise'];
  const tierIdx = order.indexOf(tier);
  if (tierIdx === -1) return [];
  const included = order.slice(0, tierIdx + 1);
  return ALL_FEATURES.filter((f) => included.includes(f.category)).map((f) => f.id);
}

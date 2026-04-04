import type { Plugin, PluginLog } from '@/lib/types/plugins';

const plugins: Plugin[] = [
  {
    id: 'plugin-whatsapp',
    name: 'WhatsApp Notifier',
    description: 'Envia notificações automáticas via WhatsApp para alunos e responsáveis.',
    version: '2.1.0',
    author: 'BlackBelt Team',
    category: 'communication',
    status: 'active',
    installedAt: '2025-08-15T10:00:00Z',
    configSchema: [
      { key: 'apiToken', label: 'Token da API', type: 'text', required: true },
      { key: 'instanceUrl', label: 'URL da Instância', type: 'text', required: true },
      { key: 'sendWelcome', label: 'Enviar mensagem de boas-vindas', type: 'boolean', required: false, defaultValue: true },
      { key: 'notifyCheckin', label: 'Notificar check-in', type: 'boolean', required: false, defaultValue: true },
      { key: 'notifyPayment', label: 'Notificar pagamento', type: 'boolean', required: false, defaultValue: true },
    ],
    config: {
      apiToken: 'evo_xxxxxxxxxxxx',
      instanceUrl: 'https://api.evolution.local',
      sendWelcome: true,
      notifyCheckin: true,
      notifyPayment: true,
    },
    icon: 'MessageCircle',
    requiredPermissions: ['students:read', 'notifications:write'],
  },
  {
    id: 'plugin-ga',
    name: 'Google Analytics',
    description: 'Integração com Google Analytics 4 para rastreamento de uso da plataforma.',
    version: '1.3.0',
    author: 'BlackBelt Team',
    category: 'analytics',
    status: 'active',
    installedAt: '2025-06-10T14:30:00Z',
    configSchema: [
      { key: 'measurementId', label: 'Measurement ID', type: 'text', required: true },
      { key: 'trackPageViews', label: 'Rastrear pageviews', type: 'boolean', required: false, defaultValue: true },
      { key: 'trackEvents', label: 'Rastrear eventos', type: 'boolean', required: false, defaultValue: true },
      { key: 'anonymizeIp', label: 'Anonimizar IP', type: 'boolean', required: false, defaultValue: true },
    ],
    config: {
      measurementId: 'G-XXXXXXXXXX',
      trackPageViews: true,
      trackEvents: true,
      anonymizeIp: true,
    },
    icon: 'BarChart3',
    requiredPermissions: ['analytics:read'],
  },
  {
    id: 'plugin-zapier',
    name: 'Zapier Integration',
    description: 'Conecte o BlackBelt a mais de 5.000 apps via Zapier triggers e actions.',
    version: '1.0.2',
    author: 'BlackBelt Team',
    category: 'automation',
    status: 'inactive',
    installedAt: null,
    configSchema: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true },
      { key: 'triggerEvents', label: 'Eventos de trigger', type: 'select', required: true, options: ['student.created', 'checkin.registered', 'payment.received', 'belt.promoted'] },
      { key: 'batchSize', label: 'Tamanho do lote', type: 'number', required: false, defaultValue: 10 },
    ],
    config: {},
    icon: 'Zap',
    requiredPermissions: ['webhooks:write', 'students:read', 'payments:read'],
  },
  {
    id: 'plugin-reports',
    name: 'Custom Reports',
    description: 'Gerador de relatórios personalizados com filtros avançados e exportação em múltiplos formatos.',
    version: '1.5.0',
    author: 'BlackBelt Team',
    category: 'analytics',
    status: 'inactive',
    installedAt: null,
    configSchema: [
      { key: 'defaultFormat', label: 'Formato padrão', type: 'select', required: true, options: ['pdf', 'csv', 'xlsx'] },
      { key: 'includeCharts', label: 'Incluir gráficos', type: 'boolean', required: false, defaultValue: true },
      { key: 'scheduleEnabled', label: 'Agendamento automático', type: 'boolean', required: false, defaultValue: false },
      { key: 'recipientEmail', label: 'E-mail do destinatário', type: 'text', required: false },
    ],
    config: {},
    icon: 'FileText',
    requiredPermissions: ['reports:read', 'reports:write', 'students:read'],
  },
];

export function mockListPlugins(): Plugin[] {
  return plugins;
}

export function mockGetPlugin(pluginId: string): Plugin {
  const plugin = plugins.find((p) => p.id === pluginId);
  if (!plugin) throw new Error('Plugin not found');
  return plugin;
}

export function mockInstallPlugin(pluginId: string): Plugin {
  const plugin = plugins.find((p) => p.id === pluginId);
  if (!plugin) throw new Error('Plugin not found');
  return { ...plugin, status: 'active', installedAt: new Date().toISOString() };
}

export function mockUninstallPlugin(_pluginId: string): void {
  return;
}

export function mockUpdatePluginConfig(
  pluginId: string,
  config: Record<string, string | boolean | number>
): Plugin {
  const plugin = plugins.find((p) => p.id === pluginId);
  if (!plugin) throw new Error('Plugin not found');
  return { ...plugin, config: { ...plugin.config, ...config } };
}

export function mockGetPluginLogs(pluginId: string): PluginLog[] {
  return [
    { id: 'log-1', pluginId, level: 'info', message: 'Plugin inicializado com sucesso', timestamp: '2025-12-01T08:00:00Z' },
    { id: 'log-2', pluginId, level: 'info', message: 'Webhook entregue: student.created', timestamp: '2025-12-01T08:15:00Z' },
    { id: 'log-3', pluginId, level: 'warn', message: 'Rate limit atingido, aguardando retry', timestamp: '2025-12-01T09:00:00Z' },
    { id: 'log-4', pluginId, level: 'error', message: 'Falha na conexão com endpoint externo', timestamp: '2025-12-01T09:30:00Z' },
    { id: 'log-5', pluginId, level: 'info', message: 'Reconectado com sucesso', timestamp: '2025-12-01T09:31:00Z' },
  ];
}

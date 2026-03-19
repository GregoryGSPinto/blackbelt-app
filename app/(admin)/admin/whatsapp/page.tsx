'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  sendMessage,
  sendBulk,
  getMessageHistory,
  getWhatsAppConfig,
  saveWhatsAppConfig,
  type WhatsAppMessage,
  type WhatsAppConfig,
} from '@/lib/api/whatsapp.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import {
  SendIcon,
  SearchIcon,
  SettingsIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  RefreshIcon,
  PhoneIcon,
} from '@/components/shell/icons';

// ── Dynamic Recharts imports (no SSR) ────────────────────────────────
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });

// ── Constants ────────────────────────────────────────────────────────

/** Local type for template slugs used in this page's UI */
type WhatsAppTemplateSlug = 'welcome' | 'class_reminder' | 'payment_reminder' | 'absence_alert' | 'graduation' | 'custom';

const ACADEMY_ID = 'academy-bb-001';

type TabId = 'enviar' | 'automacoes' | 'historico' | 'estatisticas' | 'configuracao';

const TABS: { id: TabId; label: string }[] = [
  { id: 'enviar', label: 'Enviar' },
  { id: 'automacoes', label: 'Automacoes' },
  { id: 'historico', label: 'Historico' },
  { id: 'estatisticas', label: 'Estatisticas' },
  { id: 'configuracao', label: 'Configuracao' },
];

const TEMPLATE_OPTIONS: { value: WhatsAppTemplateSlug; label: string; category: string }[] = [
  { value: 'welcome', label: 'Boas-vindas', category: 'Boas-vindas' },
  { value: 'class_reminder', label: 'Lembrete de Aula', category: 'Aula' },
  { value: 'payment_reminder', label: 'Lembrete de Pagamento', category: 'Cobranca' },
  { value: 'absence_alert', label: 'Alerta de Ausencia', category: 'Aula' },
  { value: 'graduation', label: 'Graduacao', category: 'Graduacao' },
  { value: 'custom', label: 'Personalizada', category: 'Geral' },
];

const TEMPLATE_VARIABLES: Record<WhatsAppTemplateSlug, string[]> = {
  welcome: ['nome', 'academia', 'link'],
  class_reminder: ['turma', 'horario'],
  payment_reminder: ['nome', 'valor', 'data'],
  absence_alert: ['responsavel', 'aluno', 'dias'],
  graduation: ['nome', 'faixa', 'data'],
  custom: ['mensagem'],
};

const TEMPLATE_TEXTS: Record<WhatsAppTemplateSlug, string> = {
  welcome:
    'Ola {{nome}}! Bem-vindo(a) a {{academia}}! Sua jornada nas artes marciais comeca agora. Acesse seu painel em {{link}}',
  class_reminder:
    'Lembrete: sua aula de {{turma}} comeca em 1 hora ({{horario}}). Nos vemos no tatame!',
  payment_reminder:
    'Ola {{nome}}, sua mensalidade de R${{valor}} vence em {{data}}. Para manter seu treino em dia, efetue o pagamento.',
  absence_alert:
    'Ola {{responsavel}}, {{aluno}} nao compareceu as ultimas {{dias}} aulas. Esta tudo bem?',
  graduation:
    'Parabens {{nome}}! Sua graduacao para faixa {{faixa}} foi aprovada! Cerimonia em {{data}}.',
  custom: '{{mensagem}}',
};

/** Local implementation of template rendering (replaces removed renderTemplate import) */
function renderTemplateText(templateSlug: WhatsAppTemplateSlug, vars: Record<string, string>): string {
  const text = TEMPLATE_TEXTS[templateSlug] ?? '';
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] || `{{${key}}}`);
}

const GROUP_OPTIONS = [
  'Todos os alunos',
  'Turma especifica',
  'Inadimplentes',
  'Aniversariantes do mes',
];

const STATUS_LABEL: Record<string, string> = {
  queued: 'Na fila',
  sent: 'Enviada',
  delivered: 'Entregue',
  read: 'Lida',
  failed: 'Falhou',
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  queued: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
  sent: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  delivered: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  read: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  failed: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

const CHART_COLORS: Record<string, string> = {
  sent: '#3b82f6',
  delivered: '#22c55e',
  read: '#10b981',
  failed: '#ef4444',
  queued: '#9ca3af',
};

const TEMPLATE_LABEL: Record<WhatsAppTemplateSlug, string> = {
  welcome: 'Boas-vindas',
  class_reminder: 'Lembrete de Aula',
  payment_reminder: 'Pagamento',
  absence_alert: 'Ausencia',
  graduation: 'Graduacao',
  custom: 'Personalizada',
};

// ── Automation mock data ─────────────────────────────────────────────

interface WhatsAppAutomation {
  id: string;
  triggerName: string;
  templateSlug: WhatsAppTemplateSlug;
  description: string;
  active: boolean;
  delayHours: number;
}

const MOCK_AUTOMATIONS: WhatsAppAutomation[] = [
  {
    id: 'auto-1',
    triggerName: 'Boas-vindas',
    templateSlug: 'welcome',
    description: 'Envia mensagem de boas-vindas quando um novo aluno e cadastrado.',
    active: true,
    delayHours: 0,
  },
  {
    id: 'auto-2',
    triggerName: 'Lembrete de Aula',
    templateSlug: 'class_reminder',
    description: 'Envia lembrete 1 hora antes da aula agendada.',
    active: true,
    delayHours: 0,
  },
  {
    id: 'auto-3',
    triggerName: 'Cobranca',
    templateSlug: 'payment_reminder',
    description: 'Envia lembrete de pagamento 3 dias antes do vencimento.',
    active: false,
    delayHours: 72,
  },
  {
    id: 'auto-4',
    triggerName: 'Alerta de Ausencia',
    templateSlug: 'absence_alert',
    description: 'Notifica o responsavel quando o aluno falta 3+ aulas consecutivas.',
    active: true,
    delayHours: 24,
  },
  {
    id: 'auto-5',
    triggerName: 'Graduacao Aprovada',
    templateSlug: 'graduation',
    description: 'Envia parabens quando uma graduacao e aprovada pelo professor.',
    active: false,
    delayHours: 0,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function computeStats(messages: WhatsAppMessage[]) {
  const sent = messages.length;
  const delivered = messages.filter((m) => m.status === 'delivered' || m.status === 'read').length;
  const read = messages.filter((m) => m.status === 'read').length;
  const failed = messages.filter((m) => m.status === 'failed').length;
  return {
    sent,
    delivered,
    read,
    failed,
    deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
    readRate: sent > 0 ? Math.round((read / sent) * 100) : 0,
    failedRate: sent > 0 ? Math.round((failed / sent) * 100) : 0,
  };
}

// ── Main Page ────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('enviar');
  const [loading, setLoading] = useState(true);

  // Data state
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [automations, setAutomations] = useState<WhatsAppAutomation[]>(MOCK_AUTOMATIONS);

  // Enviar tab state
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateSlug | ''>('');
  const [recipientMode, setRecipientMode] = useState<'individual' | 'group'>('individual');
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(GROUP_OPTIONS[0]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [sending, setSending] = useState(false);

  // Historico tab state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Configuracao tab state
  const [configProvider, setConfigProvider] = useState('evolution_api');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configInstanceId, setConfigInstanceId] = useState('');
  const [configPhone, setConfigPhone] = useState('');
  const [configHoursStart, setConfigHoursStart] = useState(8);
  const [configHoursEnd, setConfigHoursEnd] = useState(20);
  const [configSaving, setConfigSaving] = useState(false);
  const [configTesting, setConfigTesting] = useState(false);
  const [configConnected, setConfigConnected] = useState<boolean | null>(null);

  // ── Load data ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [hist, cfg] = await Promise.all([
          getMessageHistory(ACADEMY_ID),
          getWhatsAppConfig(ACADEMY_ID),
        ]);
        setMessages(hist);
        if (cfg) {
          setConfig(cfg);
          setConfigApiKey(cfg.apiKey ?? '');
          setConfigInstanceId(cfg.instanceId ?? '');
          setConfigPhone(cfg.phoneNumber ?? '');
          setConfigConnected(cfg.active);
        }
      } catch {
        toast('Erro ao carregar dados do WhatsApp', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Template change handler ──────────────────────────────────────
  const handleTemplateChange = useCallback((value: WhatsAppTemplateSlug | '') => {
    setSelectedTemplate(value);
    if (value) {
      const vars: Record<string, string> = {};
      TEMPLATE_VARIABLES[value].forEach((v) => { vars[v] = ''; });
      setVariables(vars);
    } else {
      setVariables({});
    }
  }, []);

  // ── Send handler ─────────────────────────────────────────────────
  async function handleSend() {
    if (!selectedTemplate) {
      toast('Selecione um template', 'error');
      return;
    }
    if (recipientMode === 'individual' && !phone.trim()) {
      toast('Informe o telefone do destinatario', 'error');
      return;
    }
    setSending(true);
    try {
      if (recipientMode === 'individual') {
        await sendMessage(ACADEMY_ID, phone.trim(), recipientName.trim(), selectedTemplate, variables);
        toast('Mensagem enviada com sucesso!', 'success');
      } else {
        // Group send (mock multiple phones)
        const mockRecipients = [
          { phone: '+5511999001001', name: 'Aluno 1' },
          { phone: '+5511999002002', name: 'Aluno 2' },
          { phone: '+5511999003003', name: 'Aluno 3' },
        ];
        const results = await sendBulk(ACADEMY_ID, mockRecipients, selectedTemplate, variables);
        const sentCount = results.filter((m) => m.status !== 'failed').length;
        const failedCount = results.filter((m) => m.status === 'failed').length;
        toast(`Envio em massa: ${sentCount} enviadas, ${failedCount} falharam`, 'success');
      }
      // Reload history
      const hist = await getMessageHistory(ACADEMY_ID);
      setMessages(hist);
      // Reset form
      setSelectedTemplate('');
      setPhone('');
      setRecipientName('');
      setVariables({});
      setScheduleEnabled(false);
      setScheduleDate('');
    } catch {
      toast('Erro ao enviar mensagem', 'error');
    } finally {
      setSending(false);
    }
  }

  // ── Toggle automation ────────────────────────────────────────────
  function handleToggleAutomation(id: string) {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
    const auto = automations.find((a) => a.id === id);
    toast(
      auto?.active ? 'Automacao desativada' : 'Automacao ativada',
      'success',
    );
  }

  // ── Test connection ──────────────────────────────────────────────
  async function handleTestConnection() {
    setConfigTesting(true);
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfigConnected(true);
      toast('Conexao bem-sucedida!', 'success');
    } catch {
      setConfigConnected(false);
      toast('Falha na conexao', 'error');
    } finally {
      setConfigTesting(false);
    }
  }

  // ── Save config ──────────────────────────────────────────────────
  async function handleSaveConfig() {
    setConfigSaving(true);
    try {
      await saveWhatsAppConfig(ACADEMY_ID, {
        phoneNumber: configPhone,
        instanceId: configInstanceId,
        apiKey: configApiKey,
        active: configConnected ?? false,
      });
      toast('Configuracao salva com sucesso!', 'success');
    } catch {
      toast('Erro ao salvar configuracao', 'error');
    } finally {
      setConfigSaving(false);
    }
  }

  // ── Filtered messages for history tab ────────────────────────────
  const filteredMessages = useMemo(() => {
    let result = messages;
    if (filterStatus !== 'all') {
      result = result.filter((m) => m.status === filterStatus);
    }
    if (filterTemplate !== 'all') {
      result = result.filter((m) => m.template === filterTemplate);
    }
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.to.includes(q) ||
          (m.toName && m.toName.toLowerCase().includes(q)) ||
          (m.template && m.template.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [messages, filterStatus, filterTemplate, filterSearch]);

  // ── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => computeStats(messages), [messages]);

  const chartData = useMemo(
    () => [
      { name: 'Enviadas', value: stats.sent, color: CHART_COLORS.sent },
      { name: 'Entregues', value: stats.delivered, color: CHART_COLORS.delivered },
      { name: 'Lidas', value: stats.read, color: CHART_COLORS.read },
      { name: 'Falharam', value: stats.failed, color: CHART_COLORS.failed },
    ],
    [stats],
  );

  // ── Preview text ─────────────────────────────────────────────────
  const previewText = useMemo(() => {
    if (!selectedTemplate) return '';
    try {
      return renderTemplateText(selectedTemplate, variables);
    } catch {
      return TEMPLATE_TEXTS[selectedTemplate] ?? '';
    }
  }, [selectedTemplate, variables]);

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-56" />
        <Skeleton variant="card" className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // ── Template preview ─────────────────────────────────────────────
  const templateCategories = TEMPLATE_OPTIONS.reduce<Record<string, typeof TEMPLATE_OPTIONS>>(
    (acc, tpl) => {
      if (!acc[tpl.category]) acc[tpl.category] = [];
      acc[tpl.category].push(tpl);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          WhatsApp
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie mensagens, automacoes e configuracoes do WhatsApp.
        </p>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div
        className="flex gap-1 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color:
                activeTab === tab.id
                  ? 'var(--bb-brand)'
                  : 'var(--bb-ink-60)',
              borderBottom:
                activeTab === tab.id
                  ? '2px solid var(--bb-brand)'
                  : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Enviar ───────────────────────────────────────── */}
      {activeTab === 'enviar' && (
        <div className="space-y-6">
          {/* Template Selector */}
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <label
              className="mb-2 block text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Template da mensagem
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) =>
                handleTemplateChange(e.target.value as WhatsAppTemplateSlug | '')
              }
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <option value="">Selecione um template...</option>
              {Object.entries(templateCategories).map(([category, templates]) => (
                <optgroup key={category} label={category}>
                  {templates.map((tpl) => (
                    <option key={tpl.value} value={tpl.value}>
                      {tpl.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Template Preview + Variable fields */}
          {selectedTemplate && (
            <div
              className="rounded-lg p-5"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <h3
                className="mb-3 text-sm font-semibold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                Preview da Mensagem
              </h3>
              <div
                className="mb-4 rounded-lg p-4 text-sm leading-relaxed"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-80)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                {previewText}
              </div>

              {/* Variable inputs */}
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATE_VARIABLES[selectedTemplate].map((varName) => (
                  <div key={varName}>
                    <label
                      className="mb-1 block text-xs font-medium"
                      style={{ color: 'var(--bb-ink-60)' }}
                    >
                      {`{{${varName}}}`}
                    </label>
                    <input
                      type="text"
                      value={variables[varName] ?? ''}
                      onChange={(e) =>
                        setVariables((prev) => ({
                          ...prev,
                          [varName]: e.target.value,
                        }))
                      }
                      placeholder={varName}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{
                        background: 'var(--bb-depth-3)',
                        color: 'var(--bb-ink-100)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Mode */}
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <h3
              className="mb-3 text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Destinatario
            </h3>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setRecipientMode('individual')}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background:
                    recipientMode === 'individual'
                      ? 'var(--bb-brand-surface)'
                      : 'var(--bb-depth-3)',
                  color:
                    recipientMode === 'individual'
                      ? 'var(--bb-brand)'
                      : 'var(--bb-ink-60)',
                  border:
                    recipientMode === 'individual'
                      ? '1px solid var(--bb-brand)'
                      : '1px solid var(--bb-glass-border)',
                }}
              >
                Individual
              </button>
              <button
                onClick={() => setRecipientMode('group')}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background:
                    recipientMode === 'group'
                      ? 'var(--bb-brand-surface)'
                      : 'var(--bb-depth-3)',
                  color:
                    recipientMode === 'group'
                      ? 'var(--bb-brand)'
                      : 'var(--bb-ink-60)',
                  border:
                    recipientMode === 'group'
                      ? '1px solid var(--bb-brand)'
                      : '1px solid var(--bb-glass-border)',
                }}
              >
                Grupo
              </button>
            </div>

            {recipientMode === 'individual' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    Telefone
                  </label>
                  <div className="relative">
                    <PhoneIcon
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: 'var(--bb-ink-40)' }}
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+55 11 99999-0000"
                      className="w-full rounded-lg py-2 pl-10 pr-3 text-sm"
                      style={{
                        background: 'var(--bb-depth-3)',
                        color: 'var(--bb-ink-100)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    Nome (opcional)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nome do destinatario"
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-100)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-60)' }}
                >
                  Grupo de destinatarios
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  {GROUP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Schedule + Send */}
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setScheduleEnabled(!scheduleEnabled)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                <ClockIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                Agendar envio
                <span
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  style={{
                    background: scheduleEnabled ? 'var(--bb-brand)' : 'var(--bb-ink-30)',
                  }}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                    style={{
                      transform: scheduleEnabled
                        ? 'translateX(18px)'
                        : 'translateX(3px)',
                    }}
                  />
                </span>
              </button>
            </div>

            {scheduleEnabled && (
              <div className="mb-4">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm sm:w-auto"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !selectedTemplate}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 sm:w-auto"
              style={{ background: 'var(--bb-brand)' }}
            >
              <SendIcon className="h-4 w-4" />
              {sending
                ? 'Enviando...'
                : scheduleEnabled
                  ? 'Agendar Mensagem'
                  : 'Enviar Agora'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: Automacoes ───────────────────────────────────── */}
      {activeTab === 'automacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              {automations.filter((a) => a.active).length} de{' '}
              {automations.length} automacoes ativas
            </p>
          </div>

          {automations.map((auto) => (
            <div
              key={auto.id}
              className="rounded-lg p-5 transition-all"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                opacity: auto.active ? 1 : 0.6,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {auto.triggerName}
                    </h3>
                    <span
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        background: 'var(--bb-depth-4)',
                        color: 'var(--bb-ink-60)',
                      }}
                    >
                      {TEMPLATE_LABEL[auto.templateSlug]}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {auto.description}
                  </p>
                  {auto.delayHours > 0 && (
                    <div
                      className="mt-2 flex items-center gap-1 text-xs"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      <ClockIcon className="h-3 w-3" />
                      <span>
                        Atraso: {auto.delayHours}h
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleToggleAutomation(auto.id)}
                  className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
                  style={{
                    background: auto.active
                      ? 'var(--bb-brand)'
                      : 'var(--bb-ink-30)',
                  }}
                  aria-label={
                    auto.active ? 'Desativar automacao' : 'Ativar automacao'
                  }
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: auto.active
                        ? 'translateX(20px)'
                        : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: Historico ────────────────────────────────────── */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: 'var(--bb-ink-40)' }}
              />
              <input
                type="text"
                placeholder="Buscar por telefone..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full rounded-lg py-2 pl-10 pr-3 text-sm"
                style={{
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <option value="all">Todos os status</option>
              <option value="queued">Na fila</option>
              <option value="sent">Enviada</option>
              <option value="delivered">Entregue</option>
              <option value="read">Lida</option>
              <option value="failed">Falhou</option>
            </select>
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <option value="all">Todos os templates</option>
              {TEMPLATE_OPTIONS.map((tpl) => (
                <option key={tpl.value} value={tpl.value}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--bb-glass-border)',
                      background: 'var(--bb-depth-3)',
                    }}
                  >
                    <th
                      className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Data
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Telefone
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Template
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => {
                    const statusStyle = STATUS_STYLE[msg.status] ?? STATUS_STYLE.queued;
                    return (
                      <tr
                        key={msg.id}
                        style={{
                          borderBottom: '1px solid var(--bb-glass-border)',
                        }}
                      >
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          {formatDateShort(msg.sentAt ?? msg.createdAt)}
                        </td>
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: 'var(--bb-ink-100)' }}
                        >
                          {msg.toName ?? msg.to}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: 'var(--bb-ink-80)' }}
                        >
                          {TEMPLATE_LABEL[msg.template as WhatsAppTemplateSlug] ?? msg.template}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.text,
                            }}
                          >
                            {STATUS_LABEL[msg.status] ?? msg.status}
                          </span>
                          {msg.error && (
                            <p
                              className="mt-1 text-xs"
                              style={{ color: '#ef4444' }}
                            >
                              {msg.error}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMessages.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-12 text-center text-sm"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        Nenhuma mensagem encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Estatisticas ─────────────────────────────────── */}
      {activeTab === 'estatisticas' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Enviadas',
                value: stats.sent,
                icon: <SendIcon className="h-5 w-5" />,
                color: '#3b82f6',
              },
              {
                label: 'Entregues',
                value: `${stats.deliveryRate}%`,
                icon: <CheckIcon className="h-5 w-5" />,
                color: '#22c55e',
              },
              {
                label: 'Lidas',
                value: `${stats.readRate}%`,
                icon: <CheckIcon className="h-5 w-5" />,
                color: '#10b981',
              },
              {
                label: 'Falharam',
                value: `${stats.failedRate}%`,
                icon: <XIcon className="h-5 w-5" />,
                color: '#ef4444',
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {kpi.label}
                  </p>
                </div>
                <p
                  className="mt-2 text-2xl font-bold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <h3
              className="mb-4 text-sm font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Mensagens por Status
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--bb-ink-60)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--bb-ink-40)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-sm)',
                      boxShadow: 'var(--bb-shadow-md)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                Resumo por Template
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bb-depth-3)' }}>
                    <th
                      className="px-4 py-2.5 text-left text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Template
                    </th>
                    <th
                      className="px-4 py-2.5 text-center text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Enviadas
                    </th>
                    <th
                      className="px-4 py-2.5 text-center text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Entregues
                    </th>
                    <th
                      className="px-4 py-2.5 text-center text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Lidas
                    </th>
                    <th
                      className="px-4 py-2.5 text-center text-xs font-medium"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      Falharam
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    messages.reduce<
                      Record<
                        string,
                        {
                          total: number;
                          delivered: number;
                          read: number;
                          failed: number;
                        }
                      >
                    >((acc, msg) => {
                      const key = msg.template;
                      if (!acc[key])
                        acc[key] = {
                          total: 0,
                          delivered: 0,
                          read: 0,
                          failed: 0,
                        };
                      acc[key].total++;
                      if (
                        msg.status === 'delivered' ||
                        msg.status === 'read'
                      )
                        acc[key].delivered++;
                      if (msg.status === 'read') acc[key].read++;
                      if (msg.status === 'failed') acc[key].failed++;
                      return acc;
                    }, {}),
                  ).map(([template, data]) => (
                    <tr
                      key={template}
                      style={{
                        borderBottom: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: 'var(--bb-ink-100)' }}
                      >
                        {TEMPLATE_LABEL[template as WhatsAppTemplateSlug] ??
                          template}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        {data.total}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ color: '#22c55e' }}
                      >
                        {data.delivered}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ color: '#10b981' }}
                      >
                        {data.read}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ color: '#ef4444' }}
                      >
                        {data.failed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Configuracao ─────────────────────────────────── */}
      {activeTab === 'configuracao' && (
        <div className="space-y-6">
          {/* Connection status */}
          <div
            className="flex items-center gap-3 rounded-lg p-4"
            style={{
              background:
                configConnected === true
                  ? 'rgba(34,197,94,0.1)'
                  : configConnected === false
                    ? 'rgba(239,68,68,0.1)'
                    : 'var(--bb-depth-2)',
              border: `1px solid ${
                configConnected === true
                  ? 'rgba(34,197,94,0.3)'
                  : configConnected === false
                    ? 'rgba(239,68,68,0.3)'
                    : 'var(--bb-glass-border)'
              }`,
            }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{
                background:
                  configConnected === true
                    ? '#22c55e'
                    : configConnected === false
                      ? '#ef4444'
                      : '#9ca3af',
              }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color:
                  configConnected === true
                    ? '#22c55e'
                    : configConnected === false
                      ? '#ef4444'
                      : 'var(--bb-ink-60)',
              }}
            >
              {configConnected === true
                ? 'Conectado'
                : configConnected === false
                  ? 'Desconectado'
                  : 'Status desconhecido'}
            </span>
          </div>

          {/* Config form */}
          <div
            className="space-y-5 rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {/* Provider */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Provedor
              </label>
              <select
                value={configProvider}
                onChange={(e) => setConfigProvider(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <option value="twilio">Twilio</option>
                <option value="z_api">Z-API</option>
                <option value="evolution_api">Evolution API</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                API Key
              </label>
              <input
                type="password"
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
                placeholder="Insira a API Key"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            </div>

            {/* Instance ID */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Instance ID
              </label>
              <input
                type="text"
                value={configInstanceId}
                onChange={(e) => setConfigInstanceId(e.target.value)}
                placeholder="ID da instancia"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Numero do WhatsApp
              </label>
              <div className="relative">
                <PhoneIcon
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--bb-ink-40)' }}
                />
                <input
                  type="tel"
                  value={configPhone}
                  onChange={(e) => setConfigPhone(e.target.value)}
                  placeholder="+55 11 99999-0000"
                  className="w-full rounded-lg py-2 pl-10 pr-3 text-sm"
                  style={{
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                />
              </div>
            </div>

            {/* Allowed hours */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Horario permitido para envios
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    De
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={configHoursStart}
                    onChange={(e) =>
                      setConfigHoursStart(Number(e.target.value))
                    }
                    className="w-16 rounded-lg px-2 py-2 text-center text-sm"
                    style={{
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-100)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    ate
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={configHoursEnd}
                    onChange={(e) =>
                      setConfigHoursEnd(Number(e.target.value))
                    }
                    className="w-16 rounded-lg px-2 py-2 text-center text-sm"
                    style={{
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-100)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    h
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={handleTestConnection}
                disabled={configTesting || !configApiKey || !configInstanceId}
                className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
                style={{
                  background: 'var(--bb-depth-4)',
                  color: 'var(--bb-ink-80)',
                }}
              >
                <RefreshIcon
                  className="h-4 w-4"
                  style={{
                    animation: configTesting
                      ? 'spin 1s linear infinite'
                      : undefined,
                  }}
                />
                {configTesting ? 'Testando...' : 'Testar Conexao'}
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={configSaving}
                className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--bb-brand)' }}
              >
                <SettingsIcon className="h-4 w-4" />
                {configSaving ? 'Salvando...' : 'Salvar Configuracao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

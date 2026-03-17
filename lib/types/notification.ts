export type NotificationChannel = 'push' | 'email' | 'whatsapp' | 'sms' | 'in_app';

export type NotificationTemplate =
  | 'aula_em_breve'
  | 'fatura_vencendo'
  | 'promocao_faixa'
  | 'mensagem_professor'
  | 'conquista_nova'
  | 'boas_vindas'
  | 'inatividade'
  | 'falta_detectada'
  | 'aniversario'
  | 'relatorio_mensal';

export interface NotificationResult {
  id: string;
  channel: NotificationChannel;
  status: 'sent' | 'failed' | 'queued';
  sentAt?: string;
  error?: string;
}

export interface NotificationPreferences {
  userId: string;
  muteAll: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  channels: Record<NotificationTemplate, NotificationChannel[]>;
}

export interface AutomationConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: NotificationChannel[];
  template: NotificationTemplate;
  lastRunAt?: string;
  triggerCount: number;
}

// ────────────────────────────────────────────────────────────
// In-App Notifications (P-015)
// ────────────────────────────────────────────────────────────

export type InAppNotificationType = 'alert' | 'info' | 'success' | 'warning' | 'billing';

export interface InAppNotification {
  id: string;
  user_id: string;
  type: InAppNotificationType;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

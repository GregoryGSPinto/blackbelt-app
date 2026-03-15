export interface WhatsAppMessage {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  to: string;
  template?: string;
  body?: string;
  sentAt: string;
}

export interface WhatsAppIncoming {
  messageId: string;
  from: string;
  body: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'document';
}

export interface WhatsAppSendResult {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
}

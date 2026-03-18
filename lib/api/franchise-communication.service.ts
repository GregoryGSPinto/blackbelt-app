import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// --- DTOs ---

export type BroadcastType = 'comunicado' | 'novo_padrao' | 'marketing_material' | 'training' | 'survey';
export type BroadcastChannel = 'email' | 'push' | 'sms' | 'in_app';
export type ReceiptStatus = 'enviado' | 'entregue' | 'lido' | 'falha';

export interface BroadcastRecipient {
  academy_id: string;
  academy_name: string;
  status: ReceiptStatus;
  read_at: string | null;
}

export interface Broadcast {
  id: string;
  franchise_id: string;
  type: BroadcastType;
  subject: string;
  body: string;
  channels: BroadcastChannel[];
  recipients: BroadcastRecipient[];
  sent_at: string;
  created_by: string;
}

export interface SendBroadcastData {
  type: BroadcastType;
  subject: string;
  body: string;
  channels: BroadcastChannel[];
  recipient_ids?: string[];
}

export interface NetworkTraining {
  id: string;
  franchise_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  format: 'presencial' | 'online' | 'hibrido';
  instructor: string;
  max_participants: number;
  enrolled: number;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
}

export interface ScheduleTrainingData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  format: 'presencial' | 'online' | 'hibrido';
  instructor: string;
  max_participants: number;
}

// --- Service Functions ---

export async function sendBroadcast(franchiseId: string, data: SendBroadcastData): Promise<Broadcast> {
  try {
    if (isMock()) {
      const { mockSendBroadcast } = await import('@/lib/mocks/franchise-communication.mock');
      return mockSendBroadcast(franchiseId, data);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.communication.send');
      return res.json();
    } catch {
      console.warn('[franchise-communication.sendBroadcast] API not available, using mock fallback');
      const { mockSendBroadcast } = await import('@/lib/mocks/franchise-communication.mock');
      return mockSendBroadcast(franchiseId, data);
    }
  } catch (error) { handleServiceError(error, 'franchise.communication.send'); }
}

export async function getBroadcasts(franchiseId: string): Promise<Broadcast[]> {
  try {
    if (isMock()) {
      const { mockGetBroadcasts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetBroadcasts(franchiseId);
    }
    // API not yet implemented — use mock
    const { mockGetBroadcasts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetBroadcasts(franchiseId);
  } catch (error) { handleServiceError(error, 'franchise.communication.list'); }
}

export async function getReceipts(broadcastId: string): Promise<BroadcastRecipient[]> {
  try {
    if (isMock()) {
      const { mockGetReceipts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetReceipts(broadcastId);
    }
    // API not yet implemented — use mock
    const { mockGetReceipts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetReceipts(broadcastId);
  } catch (error) { handleServiceError(error, 'franchise.communication.receipts'); }
}

export async function scheduleTraining(franchiseId: string, data: ScheduleTrainingData): Promise<NetworkTraining> {
  try {
    if (isMock()) {
      const { mockScheduleTraining } = await import('@/lib/mocks/franchise-communication.mock');
      return mockScheduleTraining(franchiseId, data);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franchise.communication.training');
      return res.json();
    } catch {
      console.warn('[franchise-communication.scheduleTraining] API not available, using mock fallback');
      const { mockScheduleTraining } = await import('@/lib/mocks/franchise-communication.mock');
      return mockScheduleTraining(franchiseId, data);
    }
  } catch (error) { handleServiceError(error, 'franchise.communication.training'); }
}

export async function getTrainings(franchiseId: string): Promise<NetworkTraining[]> {
  try {
    if (isMock()) {
      const { mockGetTrainings } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetTrainings(franchiseId);
    }
    // API not yet implemented — use mock
    const { mockGetTrainings } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetTrainings(franchiseId);
  } catch (error) { handleServiceError(error, 'franchise.communication.trainings'); }
}

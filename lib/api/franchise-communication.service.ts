import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: inserted, error } = await supabase
      .from('franchise_broadcasts')
      .insert({
        franchise_id: franchiseId,
        type: data.type,
        subject: data.subject,
        body: data.body,
        channels: data.channels,
        recipient_ids: data.recipient_ids ?? [],
      })
      .select()
      .single();

    if (error) {
      logServiceError(error, 'franchise-communication');
      return {} as Broadcast;
    }

    return inserted as unknown as Broadcast;
  } catch (error) {
    logServiceError(error, 'franchise-communication');
    return {} as Broadcast;
  }
}

export async function getBroadcasts(franchiseId: string): Promise<Broadcast[]> {
  try {
    if (isMock()) {
      const { mockGetBroadcasts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetBroadcasts(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_broadcasts')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('sent_at', { ascending: false });

    if (error) {
      logServiceError(error, 'franchise-communication');
      return [];
    }

    return (data ?? []) as unknown as Broadcast[];
  } catch (error) {
    logServiceError(error, 'franchise-communication');
    return [];
  }
}

export async function getReceipts(broadcastId: string): Promise<BroadcastRecipient[]> {
  try {
    if (isMock()) {
      const { mockGetReceipts } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetReceipts(broadcastId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_broadcast_receipts')
      .select('academy_id, academy_name, status, read_at')
      .eq('broadcast_id', broadcastId);

    if (error) {
      logServiceError(error, 'franchise-communication');
      return [];
    }

    return (data ?? []) as unknown as BroadcastRecipient[];
  } catch (error) {
    logServiceError(error, 'franchise-communication');
    return [];
  }
}

export async function scheduleTraining(franchiseId: string, data: ScheduleTrainingData): Promise<NetworkTraining> {
  try {
    if (isMock()) {
      const { mockScheduleTraining } = await import('@/lib/mocks/franchise-communication.mock');
      return mockScheduleTraining(franchiseId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: inserted, error } = await supabase
      .from('franchise_trainings')
      .insert({
        franchise_id: franchiseId,
        ...data,
        enrolled: 0,
        status: 'agendado',
      })
      .select()
      .single();

    if (error) {
      logServiceError(error, 'franchise-communication');
      return {} as NetworkTraining;
    }

    return inserted as unknown as NetworkTraining;
  } catch (error) {
    logServiceError(error, 'franchise-communication');
    return {} as NetworkTraining;
  }
}

export async function getTrainings(franchiseId: string): Promise<NetworkTraining[]> {
  try {
    if (isMock()) {
      const { mockGetTrainings } = await import('@/lib/mocks/franchise-communication.mock');
      return mockGetTrainings(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_trainings')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('date', { ascending: false });

    if (error) {
      logServiceError(error, 'franchise-communication');
      return [];
    }

    return (data ?? []) as unknown as NetworkTraining[];
  } catch (error) {
    logServiceError(error, 'franchise-communication');
    return [];
  }
}

import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import { logServiceError } from '@/lib/api/errors';

export type LeadStatus = 'novo' | 'contatado' | 'agendado' | 'compareceu' | 'matriculou' | 'desistiu';

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  source: string;
  referralCode?: string;
  status: LeadStatus;
  createdAt: string;
}

export async function listLeads(academyId: string): Promise<LeadDTO[]> {
  try {
    if (isMock()) {
      const { mockListLeads } = await import('@/lib/mocks/leads.mock');
      return mockListLeads(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, email, phone, interest, source, referral_code, status, created_at, academy_id')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'leads');
      return [];
    }

    return data.map((l: Record<string, unknown>) => ({
      id: (l.id as string) ?? '',
      name: (l.name as string) ?? '',
      email: (l.email as string) ?? '',
      phone: (l.phone as string) ?? '',
      interest: (l.interest as string) ?? '',
      source: (l.source as string) ?? '',
      referralCode: (l.referral_code as string | undefined),
      status: (l.status as LeadStatus) ?? 'novo',
      createdAt: (l.created_at as string) ?? '',
    }));
  } catch (error) {
    logServiceError(error, 'leads');
    return [];
  }
}

export async function createLead(data: Omit<LeadDTO, 'id' | 'status' | 'createdAt'>): Promise<LeadDTO> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/leads.mock');
      return mockCreateLead(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        interest: data.interest,
        source: data.source,
        referral_code: data.referralCode ?? null,
        status: 'novo',
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'leads');
      return { id: '', name: data.name, email: data.email, phone: data.phone, interest: data.interest, source: data.source, referralCode: data.referralCode, status: 'novo', createdAt: new Date().toISOString() };
    }

    trackFeatureUsage('crm', 'create');
    return {
      id: row.id ?? '',
      name: row.name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      interest: row.interest ?? '',
      source: row.source ?? '',
      referralCode: row.referral_code ?? undefined,
      status: row.status ?? 'novo',
      createdAt: row.created_at ?? '',
    };
  } catch (error) {
    logServiceError(error, 'leads');
    return { id: '', name: data.name, email: data.email, phone: data.phone, interest: data.interest, source: data.source, referralCode: data.referralCode, status: 'novo', createdAt: new Date().toISOString() };
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateLeadStatus } = await import('@/lib/mocks/leads.mock');
      return mockUpdateLeadStatus(leadId, status);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      logServiceError(error, 'leads');
    }
  } catch (error) {
    logServiceError(error, 'leads');
  }
}

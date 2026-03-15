import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import { createBrowserClient } from '@/lib/supabase/client';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  modality: string | null;
  origin: string;
  status: string;
  notes: string | null;
  experimental_date: string | null;
  referred_by_name: string | null;
  created_at: string;
}

export interface CRMMetrics {
  total_leads: number;
  contacted: number;
  experimental_scheduled: number;
  attended: number;
  converted: number;
  conversion_rate: number;
}

export async function getLeads(academyId: string): Promise<Lead[]> {
  try {
    if (isMock()) {
      const { mockGetLeads } = await import('@/lib/mocks/crm.mock');
      return mockGetLeads(academyId);
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) throw new ServiceError(500, 'crm.getLeads', error.message);
    return (data || []).map((row: { id: string; name: string; email: string | null; phone: string | null; modality: string | null; origin: string; status: string; notes: string | null; experimental_date: string | null; created_at: string }) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      modality: row.modality,
      origin: row.origin,
      status: row.status,
      notes: row.notes,
      experimental_date: row.experimental_date,
      referred_by_name: null as string | null,
      created_at: row.created_at,
    }));
  } catch (error) { handleServiceError(error, 'crm.getLeads'); }
}

export async function getCRMMetrics(academyId: string): Promise<CRMMetrics> {
  try {
    if (isMock()) {
      const { mockGetCRMMetrics } = await import('@/lib/mocks/crm.mock');
      return mockGetCRMMetrics(academyId);
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .eq('academy_id', academyId);

    if (error) throw new ServiceError(500, 'crm.getMetrics', error.message);

    const leads = data || [];
    const total = leads.length;
    const contacted = leads.filter((l: { status: string }) => l.status !== 'lead').length;
    const scheduled = leads.filter((l: { status: string }) => ['experimental', 'compareceu', 'matriculou'].includes(l.status)).length;
    const attended = leads.filter((l: { status: string }) => ['compareceu', 'matriculou'].includes(l.status)).length;
    const converted = leads.filter((l: { status: string }) => l.status === 'matriculou').length;
    const rate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return {
      total_leads: total,
      contacted,
      experimental_scheduled: scheduled,
      attended,
      converted,
      conversion_rate: rate,
    };
  } catch (error) { handleServiceError(error, 'crm.getMetrics'); }
}

export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateLeadStatus } = await import('@/lib/mocks/crm.mock');
      return mockUpdateLeadStatus(leadId, status);
    }

    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) throw new ServiceError(500, 'crm.updateStatus', error.message);
  } catch (error) { handleServiceError(error, 'crm.updateStatus'); }
}

export async function createLead(data: Omit<Lead, 'id' | 'created_at' | 'referred_by_name'>): Promise<Lead> {
  try {
    if (isMock()) {
      const { mockCreateLead } = await import('@/lib/mocks/crm.mock');
      return mockCreateLead(data);
    }

    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('leads')
      .insert(data)
      .select()
      .single();

    if (error) throw new ServiceError(500, 'crm.createLead', error.message);
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      modality: row.modality,
      origin: row.origin,
      status: row.status,
      notes: row.notes,
      experimental_date: row.experimental_date,
      referred_by_name: row.referred_by_name,
      created_at: row.created_at,
    };
  } catch (error) { handleServiceError(error, 'crm.createLead'); }
}

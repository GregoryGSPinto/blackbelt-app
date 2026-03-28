import { isMock } from '@/lib/env';
import type { Invoice, InvoiceStatus } from '@/lib/types';

export interface InvoiceFilters {
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  plan_id?: string;
}

export interface InvoiceWithDetails extends Invoice {
  student_name: string;
  plan_name: string;
  student_id: string;
}

export async function listInvoices(academyId: string, filters?: InvoiceFilters): Promise<InvoiceWithDetails[]> {
  try {
    if (isMock()) {
      const { mockListInvoices } = await import('@/lib/mocks/faturas.mock');
      return mockListInvoices(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('invoices').select('*, subscriptions!inner(students(profiles(display_name)), plans!inner(name, academy_id))').eq('subscriptions.plans.academy_id', academyId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.from) query = query.gte('due_date', filters.from);
    if (filters?.to) query = query.lte('due_date', filters.to);
    if (filters?.plan_id) query = query.eq('plan_id', filters.plan_id);
    const { data, error } = await query.order('due_date', { ascending: false });
    if (error || !data) {
      console.error('[listInvoices] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as InvoiceWithDetails[];
  } catch (error) {
    console.error('[listInvoices] Fallback:', error);
    return [];
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceWithDetails> {
  try {
    if (isMock()) {
      const { mockGetInvoiceById } = await import('@/lib/mocks/faturas.mock');
      return mockGetInvoiceById(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, subscriptions(students(profiles(display_name)), plans(name))')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getInvoiceById] Supabase error:', error?.message);
      return {} as InvoiceWithDetails;
    }
    return data as unknown as InvoiceWithDetails;
  } catch (error) {
    console.error('[getInvoiceById] Fallback:', error);
    return {} as InvoiceWithDetails;
  }
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  try {
    if (isMock()) {
      const { mockMarkPaid } = await import('@/lib/mocks/faturas.mock');
      return mockMarkPaid(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) {
      console.error('[markInvoicePaid] Supabase error:', error?.message);
      return {} as Invoice;
    }
    return data as unknown as Invoice;
  } catch (error) {
    console.error('[markInvoicePaid] Fallback:', error);
    return {} as Invoice;
  }
}

export async function generateMonthlyInvoices(academyId: string): Promise<Invoice[]> {
  try {
    if (isMock()) {
      const { mockGenerateMonthly } = await import('@/lib/mocks/faturas.mock');
      return mockGenerateMonthly(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('generate_monthly_invoices', { p_academy_id: academyId });
    if (error || !data) {
      console.error('[generateMonthlyInvoices] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as Invoice[];
  } catch (error) {
    console.error('[generateMonthlyInvoices] Fallback:', error);
    return [];
  }
}

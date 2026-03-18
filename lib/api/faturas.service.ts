import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    try {
      const params = new URLSearchParams({ academyId });
      if (filters?.status) params.set('status', filters.status);
      if (filters?.from) params.set('from', filters.from);
      if (filters?.to) params.set('to', filters.to);
      if (filters?.plan_id) params.set('plan_id', filters.plan_id);
      const res = await fetch(`/api/invoices?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'faturas.list');
      return res.json();
    } catch {
      console.warn('[faturas.listInvoices] API not available, using mock fallback');
      const { mockListInvoices } = await import('@/lib/mocks/faturas.mock');
      return mockListInvoices(academyId, filters);
    }
  } catch (error) {
    handleServiceError(error, 'faturas.list');
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceWithDetails> {
  try {
    if (isMock()) {
      const { mockGetInvoiceById } = await import('@/lib/mocks/faturas.mock');
      return mockGetInvoiceById(id);
    }
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'faturas.get');
      return res.json();
    } catch {
      console.warn('[faturas.getInvoiceById] API not available, using mock fallback');
      const { mockGetInvoiceById } = await import('@/lib/mocks/faturas.mock');
      return mockGetInvoiceById(id);
    }
  } catch (error) {
    handleServiceError(error, 'faturas.get');
  }
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  try {
    if (isMock()) {
      const { mockMarkPaid } = await import('@/lib/mocks/faturas.mock');
      return mockMarkPaid(id);
    }
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'faturas.markPaid');
      return res.json();
    } catch {
      console.warn('[faturas.markInvoicePaid] API not available, using mock fallback');
      const { mockMarkPaid } = await import('@/lib/mocks/faturas.mock');
      return mockMarkPaid(id);
    }
  } catch (error) {
    handleServiceError(error, 'faturas.markPaid');
  }
}

export async function generateMonthlyInvoices(academyId: string): Promise<Invoice[]> {
  try {
    if (isMock()) {
      const { mockGenerateMonthly } = await import('@/lib/mocks/faturas.mock');
      return mockGenerateMonthly(academyId);
    }
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academy_id: academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'faturas.generate');
      return res.json();
    } catch {
      console.warn('[faturas.generateMonthlyInvoices] API not available, using mock fallback');
      const { mockGenerateMonthly } = await import('@/lib/mocks/faturas.mock');
      return mockGenerateMonthly(academyId);
    }
  } catch (error) {
    handleServiceError(error, 'faturas.generate');
  }
}

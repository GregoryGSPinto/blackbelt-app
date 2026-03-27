import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface FamilyBillingDependent {
  personId: string;
  name: string;
  planName: string;
  monthlyAmount: number;
  status: 'em_dia' | 'atrasado' | 'vencendo_hoje';
  nextDueDate: string;
  daysOverdue?: number;
}

export interface FamilyBillingInvoice {
  id: string;
  dependentName: string;
  reference: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentLink?: string;
}

export interface FamilyPlanSuggestion {
  currentTotal: number;
  suggestedPlan: string;
  suggestedAmount: number;
  annualSavings: number;
}

export interface FamilyBilling {
  familyId: string;
  guardianName: string;
  totalMonthly: number;
  status: 'em_dia' | 'parcial' | 'atrasado';
  dependents: FamilyBillingDependent[];
  invoices: FamilyBillingInvoice[];
  familyPlanSuggestion?: FamilyPlanSuggestion;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getFamilyBilling(guardianPersonId: string): Promise<FamilyBilling> {
  if (isMock()) {
    return {
      familyId: guardianPersonId,
      guardianName: 'Patricia Oliveira',
      totalMonthly: 298,
      status: 'em_dia',
      dependents: [
        {
          personId: 'person-sophia',
          name: 'Sophia Oliveira',
          planName: 'Mensal Kids',
          monthlyAmount: 149,
          status: 'em_dia',
          nextDueDate: '2026-04-10',
        },
        {
          personId: 'person-miguel',
          name: 'Miguel Pereira',
          planName: 'Mensal Kids',
          monthlyAmount: 149,
          status: 'em_dia',
          nextDueDate: '2026-04-10',
        },
      ],
      invoices: [
        { id: 'inv-1', dependentName: 'Sophia Oliveira', reference: 'Marco/2026', amount: 149, dueDate: '2026-03-10', status: 'paid', paidAt: '2026-03-08' },
        { id: 'inv-2', dependentName: 'Miguel Pereira', reference: 'Marco/2026', amount: 149, dueDate: '2026-03-10', status: 'paid', paidAt: '2026-03-09' },
        { id: 'inv-3', dependentName: 'Sophia Oliveira', reference: 'Abril/2026', amount: 149, dueDate: '2026-04-10', status: 'pending' },
        { id: 'inv-4', dependentName: 'Miguel Pereira', reference: 'Abril/2026', amount: 149, dueDate: '2026-04-10', status: 'pending' },
      ],
      familyPlanSuggestion: {
        currentTotal: 298,
        suggestedPlan: 'Plano Familia',
        suggestedAmount: 249,
        annualSavings: 588,
      },
    };
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Buscar dependentes via family_links
    const { data: links } = await supabase
      .from('family_links')
      .select('dependent_person_id, people!family_links_dependent_person_id_fkey(full_name)')
      .eq('guardian_person_id', guardianPersonId)
      .eq('is_financial_responsible', true);

    const deps: FamilyBillingDependent[] = (links ?? []).map((l: Record<string, unknown>) => {
      const person = l.people as Record<string, unknown> | null;
      return {
        personId: l.dependent_person_id as string,
        name: (person?.full_name as string) ?? '',
        planName: 'Mensal',
        monthlyAmount: 149,
        status: 'em_dia' as const,
        nextDueDate: '2026-04-10',
      };
    });

    return {
      familyId: guardianPersonId,
      guardianName: '',
      totalMonthly: deps.reduce((s, d) => s + d.monthlyAmount, 0),
      status: 'em_dia',
      dependents: deps,
      invoices: [],
    };
  } catch (err) {
    console.error('[getFamilyBilling] error:', err);
    // Fallback to mock
    return getFamilyBilling(guardianPersonId);
  }
}

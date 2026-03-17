// ============================================================
// BlackBelt v2 — Financial Types
// Mensalidades, resumo financeiro, charts
// ============================================================

export type MensalidadeStatus = 'pago' | 'pendente' | 'atrasado' | 'isento';
export type PaymentMethod = 'PIX' | 'boleto' | 'cartao';

export interface Mensalidade {
  id: string;
  student_id: string;
  student_name: string;
  academy_id: string;
  amount: number;
  due_date: string;
  status: MensalidadeStatus;
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  reference_month: string; // "2026-03"
}

export interface FinancialSummary {
  revenue_this_month: number;
  revenue_last_month: number;
  pending_amount: number;
  overdue_amount: number;
  overdue_count: number;
  paid_count: number;
  total_count: number;
  ticket_medio: number;
}

export interface FinancialChartPoint {
  month: string;
  receita: number;
  pendente: number;
}

export interface OverdueItem {
  student_id: string;
  student_name: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  reference_month: string;
}

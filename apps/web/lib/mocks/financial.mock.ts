import type { Mensalidade, FinancialSummary, FinancialChartPoint, OverdueItem } from '@/lib/types/financial';

// ── Student names ──────────────────────────────────────────────────
const STUDENTS = [
  'João Pedro', 'Marina Silva', 'Rafael Costa', 'Luciana Ferreira', 'Sophia Nakamura',
  'Lucas Almeida', 'Ana Paula', 'Marcos Vieira', 'Carolina Lima', 'Pedro Santos',
  'Gustavo Ribeiro', 'Beatriz Nunes', 'Felipe Martins', 'Daniela Souza', 'Bruno Alves',
  'Julia Rocha', 'Carlos Mendes', 'Patricia Oliveira', 'Thiago Nascimento', 'Helena Costa',
];

// ── Generate mensalidades for 3 months × 20 visible students ──────
const MONTHS = ['2026-01', '2026-02', '2026-03'];
const METHODS: Array<'PIX' | 'boleto' | 'cartao'> = ['PIX', 'boleto', 'cartao'];

function generateMensalidades(): Mensalidade[] {
  const result: Mensalidade[] = [];
  let idx = 0;

  for (const month of MONTHS) {
    for (let s = 0; s < STUDENTS.length; s++) {
      const studentId = `student-${s + 1}`;
      const isCurrent = month === '2026-03';
      const isPrev = month === '2026-02';

      // 3 inadimplentes in current month
      const isOverdue = isCurrent && (s === 14 || s === 15 || s === 16); // Bruno, Julia, Carlos
      const isPending = isCurrent && s >= 17;

      let status: Mensalidade['status'] = 'pago';
      let paidAt: string | null = `${month}-05T10:00:00Z`;
      let method: Mensalidade['payment_method'] = METHODS[idx % 3];

      if (isOverdue) {
        status = 'atrasado';
        paidAt = null;
        method = null;
      } else if (isPending) {
        status = 'pendente';
        paidAt = null;
        method = null;
      } else if (isPrev && s === 14) {
        // Bruno was also late last month but paid
        status = 'pago';
        paidAt = `${month}-18T10:00:00Z`;
      }

      result.push({
        id: `mens-${month}-${s}`,
        student_id: studentId,
        student_name: STUDENTS[s],
        academy_id: 'academy-1',
        amount: s < 15 ? 397 : 297,
        due_date: `${month}-10`,
        status,
        paid_at: paidAt,
        payment_method: method,
        payment_notes: null,
        manual_payment: false,
        reference_month: month,
      });
      idx++;
    }
  }
  return result;
}

const ALL_MENSALIDADES = generateMensalidades();

// ── Service mocks ──────────────────────────────────────────────────

export function mockListMensalidades(
  _academyId: string,
  filters?: { month?: string; status?: string; search?: string },
): Mensalidade[] {
  let result = ALL_MENSALIDADES;

  if (filters?.month) {
    result = result.filter((m) => m.reference_month === filters.month);
  }
  if (filters?.status) {
    result = result.filter((m) => m.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((m) => m.student_name.toLowerCase().includes(q));
  }

  return result.sort((a, b) => {
    const order = { atrasado: 0, pendente: 1, pago: 2, isento: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
}

export function mockMarkAsPaid(
  mensalidadeId: string,
  method: 'PIX' | 'boleto' | 'cartao',
): Mensalidade {
  const item = ALL_MENSALIDADES.find((m) => m.id === mensalidadeId);
  if (!item) throw new Error('Mensalidade not found');
  item.status = 'pago';
  item.paid_at = new Date().toISOString();
  item.payment_method = method;
  item.manual_payment = false;
  return { ...item };
}

export function mockMarkAsManuallyPaid(
  mensalidadeId: string,
  paymentMethod: string,
  notes: string,
): Mensalidade {
  const item = ALL_MENSALIDADES.find((m) => m.id === mensalidadeId);
  if (!item) throw new Error('Mensalidade not found');
  item.status = 'pago';
  item.paid_at = new Date().toISOString();
  item.payment_method = paymentMethod as Mensalidade['payment_method'];
  item.payment_notes = notes || null;
  item.manual_payment = true;
  return { ...item };
}

export function mockGetFinancialSummary(_academyId: string): FinancialSummary {
  const current = ALL_MENSALIDADES.filter((m) => m.reference_month === '2026-03');
  const prev = ALL_MENSALIDADES.filter((m) => m.reference_month === '2026-02');

  const paid = current.filter((m) => m.status === 'pago');
  const pending = current.filter((m) => m.status === 'pendente');
  const overdue = current.filter((m) => m.status === 'atrasado');

  const revenueThis = paid.reduce((s, m) => s + m.amount, 0);
  const revenueLast = prev.filter((m) => m.status === 'pago').reduce((s, m) => s + m.amount, 0);

  return {
    revenue_this_month: revenueThis,
    revenue_last_month: revenueLast,
    pending_amount: pending.reduce((s, m) => s + m.amount, 0),
    overdue_amount: overdue.reduce((s, m) => s + m.amount, 0),
    overdue_count: overdue.length,
    paid_count: paid.length,
    total_count: current.length,
    ticket_medio: paid.length > 0 ? Math.round(revenueThis / paid.length) : 0,
  };
}

export function mockGetRevenueChart(_academyId: string): FinancialChartPoint[] {
  return [
    { month: 'Out', receita: 38500, pendente: 1200 },
    { month: 'Nov', receita: 40200, pendente: 800 },
    { month: 'Dez', receita: 41800, pendente: 1500 },
    { month: 'Jan', receita: 43500, pendente: 900 },
    { month: 'Fev', receita: 44690, pendente: 1100 },
    { month: 'Mar', receita: 47890, pendente: 4350 },
  ];
}

export function mockGetOverdueList(_academyId: string): OverdueItem[] {
  return ALL_MENSALIDADES
    .filter((m) => m.status === 'atrasado')
    .map((m) => {
      const due = new Date(m.due_date);
      const now = new Date();
      const days = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      return {
        student_id: m.student_id,
        student_name: m.student_name,
        amount: m.amount,
        due_date: m.due_date,
        days_overdue: days > 0 ? days : 1,
        reference_month: m.reference_month,
      };
    })
    .sort((a, b) => b.days_overdue - a.days_overdue);
}

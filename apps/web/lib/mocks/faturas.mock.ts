import { InvoiceStatus } from '@/lib/types';
import type { Invoice } from '@/lib/types';
import type { InvoiceFilters, InvoiceWithDetails } from '@/lib/api/faturas.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const STUDENT_NAMES = [
  'Lucas Silva', 'Pedro Santos', 'Ana Oliveira', 'Mariana Costa', 'Bruno Ferreira',
  'Gabriel Souza', 'Juliana Lima', 'Rafael Pereira', 'Camila Rodrigues', 'Diego Almeida',
  'Fernanda Martins', 'Thiago Ribeiro', 'Larissa Araújo', 'Mateus Barbosa', 'Isabela Gomes',
  'Vinícius Carvalho', 'Natália Melo', 'Felipe Rocha', 'Beatriz Nunes', 'Gustavo Castro',
  'Amanda Cardoso', 'Leonardo Teixeira', 'Carolina Correia', 'Rodrigo Dias', 'Letícia Monteiro',
  'Eduardo Vieira', 'Patrícia Campos', 'André Reis', 'Daniela Moreira', 'Lucas Pinto',
  'Maria Clara', 'João Pedro', 'Ana Beatriz', 'Marcos Vinicius', 'Julia Mendes',
  'Caio Ramos', 'Sofia Torres', 'Arthur Nogueira', 'Helena Duarte', 'Enzo Moura',
  'Valentina Freitas', 'Miguel Lopes', 'Laura Azevedo', 'Davi Borges', 'Alice Peixoto',
  'Bernardo Andrade', 'Heloísa Cunha', 'Noah Sampaio', 'Luana Farias', 'Samuel Aguiar',
];

const PLAN_MAP: Record<string, { name: string; price: number }> = {
  'plan-mensal': { name: 'Mensal', price: 150 },
  'plan-trimestral': { name: 'Trimestral', price: 400 },
  'plan-anual': { name: 'Anual', price: 1400 },
};

function generateInvoices(): InvoiceWithDetails[] {
  const invoices: InvoiceWithDetails[] = [];
  const plans = ['plan-mensal', 'plan-mensal', 'plan-mensal', 'plan-trimestral', 'plan-trimestral', 'plan-anual'];
  const months = 6;

  for (let m = 0; m < months; m++) {
    const monthDate = new Date(2025, 9 + m, 10);
    for (let s = 0; s < 50; s++) {
      const planId = plans[s % plans.length];
      const plan = PLAN_MAP[planId];
      const isPastMonth = m < 5;
      let status: InvoiceStatus;
      if (isPastMonth) {
        status = s < 45 ? InvoiceStatus.Paid : InvoiceStatus.Uncollectible;
      } else {
        status = s < 40 ? InvoiceStatus.Paid : s < 46 ? InvoiceStatus.Open : InvoiceStatus.Open;
      }
      invoices.push({
        id: `inv-${m}-${s}`,
        subscription_id: `sub-${s + 1}`,
        student_id: `student-${s + 1}`,
        student_name: STUDENT_NAMES[s],
        plan_name: plan.name,
        amount: plan.price,
        status,
        due_date: monthDate.toISOString().slice(0, 10),
        created_at: monthDate.toISOString(),
        updated_at: monthDate.toISOString(),
      });
    }
  }
  return invoices;
}

const MOCK_INVOICES = generateInvoices();

export async function mockListInvoices(_academyId: string, filters?: InvoiceFilters): Promise<InvoiceWithDetails[]> {
  await delay();
  let result = [...MOCK_INVOICES];
  if (filters?.status) result = result.filter((i) => i.status === filters.status);
  if (filters?.from) result = result.filter((i) => i.due_date >= filters.from!);
  if (filters?.to) result = result.filter((i) => i.due_date <= filters.to!);
  if (filters?.plan_id) result = result.filter((i) => {
    const planIdx = parseInt(i.student_id.split('-')[1]) - 1;
    const plans = ['plan-mensal', 'plan-mensal', 'plan-mensal', 'plan-trimestral', 'plan-trimestral', 'plan-anual'];
    return plans[planIdx % plans.length] === filters.plan_id;
  });
  return result;
}

export async function mockGetInvoiceById(id: string): Promise<InvoiceWithDetails> {
  await delay();
  const inv = MOCK_INVOICES.find((i) => i.id === id);
  if (!inv) throw new Error('Invoice not found');
  return inv;
}

export async function mockMarkPaid(id: string): Promise<Invoice> {
  await delay();
  const inv = MOCK_INVOICES.find((i) => i.id === id);
  if (!inv) throw new Error('Invoice not found');
  return { ...inv, status: InvoiceStatus.Paid, updated_at: new Date().toISOString() };
}

export async function mockMarkInvoiceAsPaid(
  id: string,
  paymentMethod: string,
  notes: string,
): Promise<Invoice> {
  await delay();
  const inv = MOCK_INVOICES.find((i) => i.id === id);
  if (!inv) throw new Error('Invoice not found');
  return {
    ...inv,
    status: InvoiceStatus.Paid,
    manual_payment: true,
    payment_method: paymentMethod,
    payment_notes: notes || null,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function mockGenerateMonthly(_academyId: string): Promise<Invoice[]> {
  await delay();
  const now = new Date();
  return Array.from({ length: 50 }, (_, i) => ({
    id: `inv-gen-${i}`,
    subscription_id: `sub-${i + 1}`,
    amount: [150, 150, 150, 400, 400, 1400][i % 6],
    status: InvoiceStatus.Open,
    due_date: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString().slice(0, 10),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }));
}

export { MOCK_INVOICES };

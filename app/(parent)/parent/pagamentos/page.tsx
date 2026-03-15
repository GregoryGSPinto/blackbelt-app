'use client';

import { useState, useEffect } from 'react';
import { listInvoices } from '@/lib/api/faturas.service';
import type { InvoiceWithDetails } from '@/lib/api/faturas.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface Filho {
  id: string;
  name: string;
  studentId: string;
  planName: string;
  planPrice: number;
  nextDue: string;
}

const MOCK_FILHOS: Filho[] = [
  { id: 'f1', name: 'Pedro Silva', studentId: 'student-2', planName: 'Mensal', planPrice: 150, nextDue: '2026-04-10' },
  { id: 'f2', name: 'Ana Silva', studentId: 'student-3', planName: 'Trimestral', planPrice: 400, nextDue: '2026-06-10' },
];

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pago',
  open: 'Pendente',
  uncollectible: 'Atrasado',
};

export default function ParentPagamentosPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilho, setSelectedFilho] = useState(MOCK_FILHOS[0].id);

  useEffect(() => {
    listInvoices('academy-1')
      .then((inv) => { setInvoices(inv); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filho = MOCK_FILHOS.find((f) => f.id === selectedFilho)!;
  const filhoInvoices = invoices.filter((i) => i.student_id === filho.studentId);
  const totalMensal = MOCK_FILHOS.reduce((s, f) => s + f.planPrice, 0);

  if (loading) return <div className="space-y-4 p-4"><Skeleton variant="text" className="h-8 w-48" /><Skeleton variant="card" className="h-40" /></div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Pagamentos</h1>

      {/* Total consolidado */}
      <Card className="p-4">
        <p className="text-xs text-bb-gray-500">Total Mensal (todos os filhos)</p>
        <p className="mt-1 text-2xl font-bold text-bb-red">R$ {totalMensal.toLocaleString('pt-BR')}</p>
        <p className="text-xs text-bb-gray-500">{MOCK_FILHOS.length} filhos matriculados</p>
      </Card>

      {/* Seletor de filho */}
      <div className="flex gap-2">
        {MOCK_FILHOS.map((f) => (
          <button key={f.id} onClick={() => setSelectedFilho(f.id)} className={`rounded-full px-4 py-2 text-xs font-medium ${selectedFilho === f.id ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>
            {f.name}
          </button>
        ))}
      </div>

      {/* Plano do filho selecionado */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-bb-gray-500">Plano de {filho.name}</p>
            <h2 className="mt-1 text-lg font-bold text-bb-black">{filho.planName}</h2>
            <p className="text-sm text-bb-gray-500">Próximo vencimento: {new Date(filho.nextDue).toLocaleDateString('pt-BR')}</p>
          </div>
          <p className="text-xl font-bold text-bb-red">R$ {filho.planPrice}</p>
        </div>
      </Card>

      {/* Faturas do filho */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Faturas de {filho.name}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Mês</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ação</th>
            </tr></thead>
            <tbody>
              {filhoInvoices.map((inv) => (
                <tr key={inv.id} className={`border-b border-bb-gray-100 ${inv.status === 'uncollectible' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-bb-black">{new Date(inv.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'uncollectible' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {STATUS_LABEL[inv.status] || inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status !== 'paid' && (
                      <button className="rounded bg-bb-red px-3 py-1 text-xs text-white hover:bg-bb-red/90">Pagar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

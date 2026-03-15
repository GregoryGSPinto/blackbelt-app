'use client';

import { forwardRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  children?: ReactNode;
}

const PLAN_COMPARISON = [
  { feature: 'Alunos ativos', free: 'Até 30', pro: 'Até 200', enterprise: 'Ilimitado' },
  { feature: 'Unidades', free: '1', pro: 'Até 3', enterprise: 'Ilimitado' },
  { feature: 'Turmas', free: 'Até 3', pro: 'Ilimitado', enterprise: 'Ilimitado' },
  { feature: 'Relatórios', free: '-', pro: 'Incluído', enterprise: 'Incluído' },
  { feature: 'Automações', free: '-', pro: 'Incluído', enterprise: 'Incluído' },
  { feature: 'Conteúdo', free: '-', pro: 'Incluído', enterprise: 'Incluído' },
  { feature: 'API', free: '-', pro: '-', enterprise: 'Incluído' },
  { feature: 'White Label', free: '-', pro: '-', enterprise: 'Incluído' },
];

const UpgradeModal = forwardRef<HTMLDivElement, UpgradeModalProps>(
  function UpgradeModal({ open, onClose, feature }, ref) {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div ref={ref} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <div className="text-center">
            <h2 className="text-xl font-bold text-bb-gray-900">Upgrade necessário</h2>
            <p className="mt-2 text-sm text-bb-gray-500">
              <strong>{feature}</strong> não está disponível no seu plano atual.
              Faça upgrade para desbloquear.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-bb-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bb-gray-50">
                  <th className="p-2 text-left font-medium text-bb-gray-600">Recurso</th>
                  <th className="p-2 text-center font-medium text-bb-gray-400">Free</th>
                  <th className="p-2 text-center font-medium text-bb-red">Pro</th>
                  <th className="p-2 text-center font-medium text-bb-gray-600">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bb-gray-100">
                {PLAN_COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="p-2 text-bb-gray-700">{row.feature}</td>
                    <td className="p-2 text-center text-bb-gray-400">{row.free}</td>
                    <td className="p-2 text-center font-medium text-bb-gray-900">{row.pro}</td>
                    <td className="p-2 text-center text-bb-gray-600">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Voltar
            </Button>
            <Link href="/admin/plano-plataforma" className="flex-1">
              <Button className="w-full">Fazer upgrade agora</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  },
);

UpgradeModal.displayName = 'UpgradeModal';

export { UpgradeModal };

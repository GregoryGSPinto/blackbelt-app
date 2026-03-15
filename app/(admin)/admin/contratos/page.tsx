'use client';

import { useEffect, useState } from 'react';
import { listContracts, generateContract, sendForSignature, type ContractDTO, type ContractTemplate } from '@/lib/api/contracts.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const TEMPLATE_LABEL: Record<ContractTemplate, string> = {
  matricula_adulto: 'Matrícula (Adulto)',
  matricula_menor: 'Matrícula (Menor)',
  professor: 'Professor',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  sent: 'bg-yellow-100 text-yellow-700',
  signed: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
};

export default function ContratosPage() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ template: 'matricula_adulto' as ContractTemplate, studentId: '' });

  useEffect(() => {
    listContracts('academy-1').then(setContracts).finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    try {
      const contract = await generateContract(genForm.template, genForm.studentId || 'student-1');
      setContracts((prev) => [...prev, contract]);
      setShowGenerate(false);
      toast('Contrato gerado', 'success');
    } catch {
      toast('Erro ao gerar contrato', 'error');
    }
  }

  async function handleSend(contractId: string) {
    try {
      await sendForSignature(contractId);
      setContracts((prev) => prev.map((c) => c.id === contractId ? { ...c, status: 'sent' as const } : c));
      toast('Contrato enviado para assinatura', 'success');
    } catch {
      toast('Erro ao enviar', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Contratos</h1>
        <Button onClick={() => setShowGenerate(true)}>Gerar Contrato</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Aluno/Professor</th>
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Tipo</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Data</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
            </tr></thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-medium text-bb-black">{contract.studentName}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{TEMPLATE_LABEL[contract.templateId]}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[contract.status]}`}>
                      {contract.status === 'draft' ? 'Rascunho' : contract.status === 'sent' ? 'Enviado' : contract.status === 'signed' ? 'Assinado' : 'Expirado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-bb-gray-500">{new Date(contract.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    {contract.status === 'draft' && (
                      <button onClick={() => handleSend(contract.id)} className="text-xs text-bb-primary hover:underline">Enviar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Gerar Contrato">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bb-black">Tipo de Contrato</label>
            <select value={genForm.template} onChange={(e) => setGenForm({ ...genForm, template: e.target.value as ContractTemplate })} className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
              {Object.entries(TEMPLATE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bb-black">ID do Aluno</label>
            <input value={genForm.studentId} onChange={(e) => setGenForm({ ...genForm, studentId: e.target.value })} placeholder="student-1" className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <Button className="w-full" onClick={handleGenerate}>Gerar</Button>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { listStaff, sendInvite, getActiveInvites, cancelInvite, resendInvite, type StaffMember, type InviteDTO } from '@/lib/api/invites.service';
import { Role } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
};

export default function EquipePage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<InviteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: Role.Professor as Role });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([listStaff('academy-1'), getActiveInvites('academy-1')])
      .then(([s, i]) => { setStaff(s); setInvites(i); })
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite() {
    setSending(true);
    try {
      const invite = await sendInvite(inviteForm.email, inviteForm.role, ['unit-1']);
      setInvites((prev) => [...prev, invite]);
      setShowInvite(false);
      setInviteForm({ email: '', role: Role.Professor });
      toast('Convite enviado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelInvite(id);
      setInvites((prev) => prev.filter((i) => i.id !== id));
      toast('Convite cancelado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleResend(id: string) {
    try {
      await resendInvite(id);
      toast('Convite reenviado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Equipe</h1>
        <Button onClick={() => setShowInvite(true)}>Convidar Membro</Button>
      </div>

      {/* Staff Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Função</th>
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Unidade(s)</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Último Acesso</th>
            </tr></thead>
            <tbody>
              {staff.length === 0 && (
                <tr><td colSpan={5}>
                  <EmptyState
                    icon="👥"
                    title="Nenhum membro na equipe"
                    description="Convide professores e administradores para gerenciar sua academia."
                    actionLabel="Convidar Membro"
                    onAction={() => setShowInvite(true)}
                    variant="first-time"
                  />
                </td></tr>
              )}
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-bb-black">{member.name}</p>
                    <p className="text-xs text-bb-gray-500">{member.email}</p>
                  </td>
                  <td className="px-4 py-3 text-bb-gray-500">{ROLE_LABEL[member.role] ?? member.role}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{member.units.join(', ')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{member.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-bb-gray-500">
                    {member.lastAccessAt ? new Date(member.lastAccessAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-bb-black">Convites Pendentes</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <Card key={inv.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-bb-black">{inv.email}</p>
                  <p className="text-xs text-bb-gray-500">{ROLE_LABEL[inv.role]} — Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleResend(inv.id)} className="text-xs text-bb-primary hover:underline">Reenviar</button>
                  <button onClick={() => handleCancel(inv.id)} className="text-xs text-red-500 hover:underline">Cancelar</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Convidar Membro">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bb-black">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="professor@email.com"
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bb-black">Função</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              <option value={Role.Professor}>Professor</option>
              <option value={Role.Admin}>Administrador</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowInvite(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleInvite} loading={sending} disabled={!inviteForm.email}>Enviar Convite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

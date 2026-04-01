'use client';

import { forwardRef, useState } from 'react';
import { isMock } from '@/lib/env';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { translateError } from '@/lib/utils/error-translator';
import { Role } from '@/lib/types/domain';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { deleteAccount } from '@/lib/api/preferences.service';

interface DeleteAccountSectionProps {
  className?: string;
}

const DeleteAccountSection = forwardRef<HTMLDivElement, DeleteAccountSectionProps>(
  function DeleteAccountSection({ className }, ref) {
    const { toast } = useToast();
    const { profile, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [soloAdminBlocked, setSoloAdminBlocked] = useState(false);

    // Superadmin never sees this section
    if (profile?.role === Role.Superadmin) {
      return null;
    }

    const isParent = profile?.role === Role.Responsavel;

    async function checkSoloAdmin(): Promise<boolean> {
      if (profile?.role !== Role.Admin) return false;

      if (isMock()) return false;

      try {
        const academyId = getActiveAcademyId();
        if (!academyId) return false;

        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('academy_id', academyId)
          .eq('role', 'admin')
          .eq('is_active', true);

        if (error) throw error;
        return (count ?? 0) <= 1;
      } catch {
        return false;
      }
    }

    async function handleOpenModal() {
      const isSolo = await checkSoloAdmin();
      if (isSolo) {
        setSoloAdminBlocked(true);
        setShowModal(true);
        return;
      }
      setSoloAdminBlocked(false);
      setShowModal(true);
    }

    async function handleDelete() {
      if (confirmationText !== 'EXCLUIR MINHA CONTA') return;

      setIsDeleting(true);
      try {
        if (isMock()) {
          toast('Solicitacao registrada. A exclusao definitiva ocorre em ate 30 dias.', 'success');
          setShowModal(false);
          await logout();
          return;
        }

        if (!profile?.id) {
          toast('Perfil nao encontrado. Faca login novamente.', 'error');
          return;
        }

        await deleteAccount(profile.id, confirmationText);
        toast('Solicitacao registrada. A exclusao definitiva ocorre em ate 30 dias.', 'success');
        setShowModal(false);
        await logout();
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setIsDeleting(false);
      }
    }

    return (
      <div ref={ref} className={className}>
        {/* Separator */}
        <div
          className="my-8 h-px"
          style={{ background: 'color-mix(in srgb, var(--bb-danger) 30%, transparent)' }}
        />

        {/* Danger Zone */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'color-mix(in srgb, var(--bb-danger) 40%, transparent)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--bb-danger)' }}>
            Zona de Perigo
          </h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Ao solicitar a exclusao, sua conta e marcada para remocao definitiva em ate 30 dias.
            Esse periodo cobre retencao operacional, prevencao de fraude e obrigacoes legais.
          </p>
          {isParent && (
            <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Seus filhos continuarao matriculados na academia. A academia sera notificada.
            </p>
          )}
          <button
            onClick={handleOpenModal}
            className="mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bb-danger)' }}
          >
            Excluir Minha Conta
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                if (!isDeleting) {
                  setShowModal(false);
                  setConfirmationText('');
                }
              }}
            />

            {/* Dialog */}
            <div
              className="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)' }}
            >
              {soloAdminBlocked ? (
                <>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--bb-danger)' }}>
                    Exclusao bloqueada
                  </h3>
                  <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    Voce e o unico administrador desta academia. Transfira a administracao para
                    outro usuario antes de excluir sua conta.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setConfirmationText('');
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
                    >
                      Entendi
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--bb-danger)' }}>
                    Excluir conta
                  </h3>
                  <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    <p className="font-semibold">Esta acao e IRREVERSIVEL.</p>
                    <p>Sua conta sera removida definitivamente em ate 30 dias, salvo obrigacao legal de retencao.</p>
                    {isParent && (
                      <p>Seus filhos vinculados continuarao na academia.</p>
                    )}
                  </div>

                  <label className="mt-4 block text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Digite <span className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>EXCLUIR MINHA CONTA</span> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="EXCLUIR MINHA CONTA"
                    disabled={isDeleting}
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bb-depth-1)',
                      borderColor: 'var(--bb-glass-border)',
                      color: 'var(--bb-ink-100)',
                    }}
                  />

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setConfirmationText('');
                      }}
                      disabled={isDeleting}
                      className="rounded-lg px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={confirmationText !== 'EXCLUIR MINHA CONTA' || isDeleting}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                      style={{ backgroundColor: 'var(--bb-danger)' }}
                    >
                      {isDeleting ? 'Excluindo...' : 'Confirmar Exclusao'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

DeleteAccountSection.displayName = 'DeleteAccountSection';

export default DeleteAccountSection;

'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { ConsentRecord } from '@/lib/api/privacy.service';
import { getConsents, updateConsent, requestDataExport, requestAccountDeletion } from '@/lib/api/privacy.service';
import { useToast } from '@/lib/hooks/useToast';
import { ComingSoon } from '@/components/shared/ComingSoon';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PrivacyPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (authLoading) return;
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    getConsents(profile.id).then((c) => { setConsents(c); setLoading(false); });
  }, [authLoading, profile?.id]);

  async function handleToggle(type: ConsentRecord['type'], accepted: boolean) {
    if (!profile?.id) return;
    const updated = await updateConsent(profile.id, type, accepted);
    setConsents((prev) => prev.map((c) => (c.type === updated.type ? updated : c)));
  }

  async function handleExport() {
    if (!profile?.id) return;
    setExporting(true);
    await requestDataExport(profile.id);
    setExporting(false);
    toast('Solicitação enviada! Você receberá um email quando seus dados estiverem prontos.', 'success');
  }

  async function handleDeleteRequest() {
    if (!profile?.id) return;
    setDeleting(true);
    await requestAccountDeletion(profile.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    toast('Solicitação registrada. Sua conta será excluída em 30 dias. Você pode cancelar entrando em contato com o suporte.', 'success');
  }

  const consentLabels: Record<string, { title: string; desc: string }> = {
    terms: { title: 'Termos de Uso', desc: 'Aceite dos termos de uso da plataforma' },
    privacy: { title: 'Política de Privacidade', desc: 'Aceite da política de privacidade e tratamento de dados' },
    marketing: { title: 'Comunicações de Marketing', desc: 'Receber emails promocionais e novidades' },
    data_processing: { title: 'Tratamento de Dados Operacionais', desc: 'Permitir o processamento necessário para operação, segurança e melhoria contínua da plataforma' },
  };

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      <PageHeader title="Privacidade e Dados" subtitle="Gerencie seus consentimentos e dados pessoais (LGPD)" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-bb-gray-900">Consentimentos</h2>
        <div className="space-y-3">
          {consents.map((c) => {
            const label = consentLabels[c.type];
            return (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-bb-gray-200 p-4">
                <div>
                  <p className="font-medium text-bb-gray-900">{label?.title ?? c.type}</p>
                  <p className="text-sm text-bb-gray-500">{label?.desc}</p>
                  {c.acceptedAt && (
                    <p className="mt-1 text-xs text-bb-gray-400">Aceito em {new Date(c.acceptedAt).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={c.accepted}
                    onChange={(e) => handleToggle(c.type, e.target.checked)}
                    disabled={c.type === 'terms' || c.type === 'privacy'}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-bb-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-bb-red peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-bb-gray-900">Seus Dados</h2>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="mb-3 text-sm text-bb-gray-600">
            Conforme a LGPD, você tem direito a solicitar uma cópia de todos os seus dados pessoais armazenados.
          </p>
          <Button variant="secondary" onClick={handleExport} disabled={exporting || !profile?.id}>
            {exporting ? 'Solicitando...' : 'Exportar Meus Dados'}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-bb-red">Zona de Perigo</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-sm text-bb-gray-600">
            Solicitar a exclusão da sua conta e todos os dados. Este processo é irreversível após o período de 30 dias.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-bb-red">Tem certeza?</p>
              <Button variant="danger" onClick={handleDeleteRequest} disabled={deleting || !profile?.id}>
                {deleting ? 'Solicitando...' : 'Sim, excluir minha conta'}
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={!profile?.id}>
              Solicitar Exclusão da Conta
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

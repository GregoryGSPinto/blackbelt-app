'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { ReferralStatsDTO } from '@/lib/api/referral-b2b.service';
import { getReferralStats } from '@/lib/api/referral-b2b.service';
import { PlanGate } from '@/components/plans/PlanGate';
import { ComingSoon } from '@/components/shared/ComingSoon';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    getReferralStats(getActiveAcademyId()).then((s) => { setStats(s); }).catch((err) => { console.error('[ReferralPage]', err); }).finally(() => { setLoading(false); });
  }, []);

  function copyLink() {
    if (!stats) return;
    navigator.clipboard.writeText(`https://app.blackbelt.com/r/${stats.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!stats) return;
    const text = `Conheça o BlackBelt! A melhor plataforma para gestão de academias. Cadastre-se pelo meu link e ganhe benefícios: https://app.blackbelt.com/r/${stats.code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if ((loading || !stats) && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading || !stats) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <PlanGate module="landing_page">
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageHeader title="Programa de Indicação" subtitle="Indique academias e ganhe meses grátis!" />

      <div className="rounded-xl bg-gradient-to-r from-bb-red to-red-700 p-6 text-white">
        <h2 className="text-xl font-bold">Indique uma academia e ganhe 1 mês grátis!</h2>
        <p className="mt-1 text-red-100">Quando a academia indicada ativar um plano Pro, você ganha 1 mês de crédito.</p>
        <div className="mt-4 flex items-center gap-3">
          <code className="rounded-lg bg-white/20 px-4 py-2 font-mono text-lg">{stats.code}</code>
          <Button variant="secondary" onClick={copyLink}>
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>
          <Button variant="ghost" onClick={shareWhatsApp}>
            <span className="text-white">WhatsApp</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Indicações</p>
          <p className="text-2xl font-bold text-bb-gray-900">{stats.totalReferrals}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Convertidas</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-success)' }}>{stats.convertedReferrals}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Créditos Ganhos</p>
          <p className="text-2xl font-bold text-bb-gray-900">{stats.creditsEarned} meses</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Créditos Restantes</p>
          <p className="text-2xl font-bold text-bb-red">{stats.creditsEarned - stats.creditsUsed} meses</p>
        </div>
      </div>

      <div className="rounded-xl border border-bb-gray-200">
        <h3 className="border-b border-bb-gray-200 p-4 font-medium text-bb-gray-900">Academias Indicadas</h3>
        <div className="divide-y divide-bb-gray-100">
          {stats.referrals.map((r) => (
            <div key={r.academyName} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-bb-gray-900">{r.academyName}</p>
                <p className="text-xs text-bb-gray-400">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={r.status === 'active' ? { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' } : r.status === 'pending' ? { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' } : { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' }}>
                {r.status === 'active' ? 'Ativa' : r.status === 'pending' ? 'Pendente' : 'Cancelada'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PlanGate>
  );
}

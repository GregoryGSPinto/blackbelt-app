'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import type { PlanResource } from '@/lib/api/plan-enforcement.service';

interface PlanLimitBannerProps {
  resource: PlanResource;
  current: number;
  limit: number;
  className?: string;
}

const RESOURCE_LABELS: Record<PlanResource, string> = {
  students_active: 'alunos ativos',
  units: 'unidades',
  classes: 'turmas',
  reports: 'relatórios',
  automations: 'automações',
  content: 'conteúdo',
  api_access: 'acesso à API',
  white_label: 'white label',
  custom_domain: 'domínio customizado',
};

const PlanLimitBanner = forwardRef<HTMLDivElement, PlanLimitBannerProps>(
  function PlanLimitBanner({ resource, current, limit, className = '' }, ref) {
    const pct = Math.round((current / limit) * 100);
    const isNear = pct >= 80;
    const isAtLimit = current >= limit;

    if (pct < 60) return null;

    return (
      <div
        ref={ref}
        className={`rounded-lg border p-3 ${
          isAtLimit
            ? 'border-red-200 bg-red-50'
            : isNear
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-bb-gray-200 bg-bb-gray-50'
        } ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isAtLimit ? 'text-red-700' : isNear ? 'text-yellow-700' : 'text-bb-gray-700'}`}>
              {isAtLimit
                ? `Limite de ${limit} ${RESOURCE_LABELS[resource]} atingido`
                : `${current} de ${limit} ${RESOURCE_LABELS[resource]} utilizados`}
            </p>
            <p className="mt-0.5 text-xs text-bb-gray-500">
              Plano Free &middot;{' '}
              <Link href="/admin/plano-plataforma" className="text-bb-red underline">
                Fazer upgrade para Pro
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-bb-gray-200">
          <div
            className={`h-full rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNear ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    );
  },
);

PlanLimitBanner.displayName = 'PlanLimitBanner';

export { PlanLimitBanner };

'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import type { Insight } from '@/lib/api/insights.service';

const SEVERITY_STYLES = {
  critical: 'border-l-4 border-l-red-500 bg-red-50',
  warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
  info: 'border-l-4 border-l-blue-500 bg-blue-50',
};

const SEVERITY_ICON = {
  critical: '🔴',
  warning: '🟡',
  info: '🔵',
};

const InsightCard = forwardRef<HTMLAnchorElement, { insight: Insight }>(function InsightCard({ insight }, ref) {
  return (
    <Link ref={ref} href={insight.actionUrl} className={`block rounded-lg p-3 ${SEVERITY_STYLES[insight.severity]} transition-opacity hover:opacity-80`}>
      <div className="flex items-start gap-2">
        <span className="text-sm">{SEVERITY_ICON[insight.severity]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-bb-black">{insight.title}</p>
          <p className="mt-0.5 text-xs text-bb-gray-500">{insight.description}</p>
        </div>
      </div>
    </Link>
  );
});

InsightCard.displayName = 'InsightCard';
export { InsightCard };

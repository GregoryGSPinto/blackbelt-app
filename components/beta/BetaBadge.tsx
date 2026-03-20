'use client';

import { forwardRef, useState } from 'react';
import { ChangelogDrawer } from './ChangelogDrawer';

const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === 'true';

const BetaBadge = forwardRef<HTMLDivElement>(function BetaBadge(_, ref) {
  const [showChangelog, setShowChangelog] = useState(false);

  if (!isBetaMode) return null;

  return (
    <div ref={ref} className="inline-flex items-center">
      <button
        onClick={() => setShowChangelog(true)}
        className="relative rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
        style={{
          background: 'rgba(245,158,11,0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.3)',
        }}
        title="Voce esta usando o BlackBelt Beta. Seu feedback e valioso!"
      >
        BETA
      </button>
      {showChangelog && <ChangelogDrawer onClose={() => setShowChangelog(false)} />}
    </div>
  );
});

BetaBadge.displayName = 'BetaBadge';

export { BetaBadge };

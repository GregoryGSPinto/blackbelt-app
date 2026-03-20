'use client';

import { forwardRef, useState, useEffect } from 'react';
import { getPublishedChangelog, type ChangelogEntry } from '@/lib/api/beta-changelog.service';

interface ChangelogDrawerProps {
  onClose: () => void;
}

const TYPE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  feature: { label: 'Novo', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  improvement: { label: 'Melhoria', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  fix: { label: 'Correcao', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const ChangelogDrawer = forwardRef<HTMLDivElement, ChangelogDrawerProps>(
  function ChangelogDrawer({ onClose }, ref) {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      getPublishedChangelog().then(data => {
        setEntries(data);
        setLoading(false);
        if (data.length > 0) {
          localStorage.setItem('changelog_last_seen_version', data[0].version);
        }
      });
    }, []);

    return (
      <div className="fixed inset-0 z-[100]" ref={ref}>
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div
          className="fixed right-0 top-0 h-full w-full max-w-md overflow-y-auto"
          style={{
            background: 'var(--bb-depth-2)',
            borderLeft: '1px solid var(--bb-glass-border)',
            boxShadow: 'var(--bb-shadow-lg)',
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
            style={{
              background: 'var(--bb-depth-2)',
              borderBottom: '1px solid var(--bb-glass-border)',
            }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Novidades
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ color: 'var(--bb-ink-40)' }}
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {loading && (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: 'var(--bb-ink-40)' }} />
              </div>
            )}

            {!loading && entries.length === 0 && (
              <p className="py-12 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhuma atualizacao publicada ainda.
              </p>
            )}

            {entries.map(entry => (
              <div key={entry.id} className="rounded-xl p-4" style={{ background: 'var(--bb-depth-3)' }}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                  >
                    v{entry.version}
                  </span>
                  {entry.published_at && (
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {new Date(entry.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {entry.title}
                </h3>
                <div className="space-y-1.5">
                  {entry.changes.map((change, i) => {
                    const badge = TYPE_BADGES[change.type] || TYPE_BADGES.improvement;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

ChangelogDrawer.displayName = 'ChangelogDrawer';

export { ChangelogDrawer };

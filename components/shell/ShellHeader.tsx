'use client';

import { forwardRef } from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface ShellHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  rightContent?: React.ReactNode;
}

const ShellHeader = forwardRef<HTMLElement, ShellHeaderProps>(
  function ShellHeader({ title, subtitle, userName, rightContent }, ref) {
    return (
      <header
        ref={ref}
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          background: 'var(--bb-depth-2)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{title}</h1>
            {subtitle && <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {rightContent}
            {userName && <Avatar name={userName} size="sm" />}
          </div>
        </div>
      </header>
    );
  },
);

ShellHeader.displayName = 'ShellHeader';

export { ShellHeader };

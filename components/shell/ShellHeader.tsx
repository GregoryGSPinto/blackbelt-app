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
        className="sticky top-0 z-20 border-b border-bb-gray-300 bg-white px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-bb-black">{title}</h1>
            {subtitle && <p className="text-xs text-bb-gray-500">{subtitle}</p>}
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

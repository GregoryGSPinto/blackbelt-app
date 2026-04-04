'use client';

import { forwardRef } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader({ title, subtitle }, ref) {
  return (
    <div ref={ref}>
      <h1 className="text-xl font-bold text-bb-black">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-bb-gray-500">{subtitle}</p>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';
export { PageHeader };

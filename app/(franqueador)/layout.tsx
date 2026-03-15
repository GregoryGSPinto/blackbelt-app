'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { href: '/franqueador', label: 'Dashboard' },
  { href: '/franqueador/padroes', label: 'Padronizacao' },
  { href: '/franqueador/royalties', label: 'Royalties' },
  { href: '/franqueador/expansao', label: 'Expansao' },
  { href: '/franqueador/comunicacao', label: 'Comunicacao' },
];

export default function FranqueadorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bb-gray-100">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-bb-gray-300 lg:bg-white">
        <div className="flex h-14 items-center border-b border-bb-gray-300 px-6">
          <span className="text-lg font-bold text-bb-red">BlackBelt</span>
          <span className="ml-1 text-xs text-bb-gray-500">Franqueador</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-bb-red/10 text-bb-red'
                    : 'text-bb-gray-500 hover:bg-bb-gray-100 hover:text-bb-black'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-bb-gray-300 bg-white lg:hidden">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-2 text-[10px] font-medium ${
                isActive ? 'text-bb-red' : 'text-bb-gray-500'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
    </div>
  );
}

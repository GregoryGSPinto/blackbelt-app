'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * SessionGuard — global session watchdog.
 * If auth stays loading for more than 15 seconds, assumes the session is dead
 * and redirects to /login after clearing cookies.
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setChecked(true);
      return;
    }

    const timeout = setTimeout(() => {
      if (!checked) {
        // Session dead — nuclear cleanup
        document.cookie = 'bb-token=; Max-Age=0; path=/';
        document.cookie = 'bb-active-role=; Max-Age=0; path=/';
        document.cookie = 'bb-academy-id=; Max-Age=0; path=/';
        router.push('/login');
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading, checked, router]);

  return <>{children}</>;
}

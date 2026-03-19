'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrecosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cadastrar-academia');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p style={{ color: 'var(--bb-ink-60)' }}>Redirecionando...</p>
    </div>
  );
}

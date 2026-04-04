'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { initTelemetry, stopTelemetry } from '@/lib/telemetry';

export function TelemetryInit() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.user_id) return;
    if (profile.role === 'aluno_kids') return;
    if (process.env.NEXT_PUBLIC_ENABLE_RUNTIME_TELEMETRY !== 'true') return;

    const academyId = document.cookie
      .split('; ')
      .find((item) => item.startsWith('bb-academy-id='))
      ?.split('=')[1] ?? '';

    initTelemetry(
      profile.user_id,
      profile.id,
      profile.role,
      academyId,
    );

    return () => {
      stopTelemetry();
    };
  }, [profile?.user_id, profile?.id, profile?.role]);

  return null;
}

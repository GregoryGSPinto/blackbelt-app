'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { initTelemetry, stopTelemetry } from '@/lib/telemetry';

export function TelemetryInit() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.user_id) return;

    initTelemetry(
      profile.user_id,
      profile.id,
      profile.role,
      '',
    );

    return () => {
      stopTelemetry();
    };
  }, [profile?.user_id, profile?.id, profile?.role]);

  return null;
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { TOUR_STEPS } from '@/lib/constants/tour-steps';
import type { TourStep } from '@/components/tour/TourOverlay';
import * as tourService from '@/lib/api/tour.service';
import { logServiceError } from '@/lib/api/errors';

interface UseTourReturn {
  showTour: boolean;
  steps: TourStep[];
  startTour: () => void;
  completeTour: () => void;
  skipTour: () => void;
}

export function useTour(): UseTourReturn {
  const { profile } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const checkedRef = useRef(false);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const role = profile?.role ?? '';
  const profileId = profile?.id ?? '';
  const steps = TOUR_STEPS[role] ?? [];

  // On mount, check has_seen_tour for the current profile
  useEffect(() => {
    if (!profileId || !role || steps.length === 0) return;

    let cancelled = false;

    async function check() {
      try {
        const seen = await tourService.getHasSeenTour(profileId);
        if (cancelled) return;

        checkedRef.current = true;

        if (!seen) {
          // Delay showing the tour by 1 second to let the page settle
          delayRef.current = setTimeout(() => {
            if (!cancelled) {
              setShowTour(true);
            }
          }, 1000);
        }
      } catch (error) {
        logServiceError(error, 'useTour.check');
        if (!cancelled) checkedRef.current = true;
      }
    }

    check();

    return () => {
      cancelled = true;
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, [profileId, role, steps.length]);

  const completeTour = useCallback(async () => {
    setShowTour(false);
    if (!profileId) return;

    try {
      await tourService.markTourAsSeen(profileId);
    } catch (error) {
      logServiceError(error, 'useTour.completeTour');
    }
  }, [profileId]);

  const skipTour = useCallback(async () => {
    setShowTour(false);
    if (!profileId) return;

    try {
      await tourService.markTourAsSeen(profileId);
    } catch (error) {
      logServiceError(error, 'useTour.skipTour');
    }
  }, [profileId]);

  const startTour = useCallback(async () => {
    if (!profileId || steps.length === 0) return;

    try {
      await tourService.resetTourForProfile(profileId);
      setShowTour(true);
    } catch (error) {
      logServiceError(error, 'useTour.startTour');
    }
  }, [profileId, steps.length]);

  return {
    showTour,
    steps,
    startTour,
    completeTour,
    skipTour,
  };
}

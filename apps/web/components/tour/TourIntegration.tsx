'use client';

import { useTour } from '@/lib/hooks/useTour';
import { TourOverlay } from './TourOverlay';

/**
 * Drop-in tour integration component.
 * Place this inside any shell to auto-trigger the tour on first access.
 * The tour uses the `has_seen_tour` column from the profiles table
 * and shows role-specific steps from lib/constants/tour-steps.ts.
 */
export function TourIntegration() {
  const { showTour, steps, completeTour } = useTour();

  if (!showTour || steps.length === 0) return null;

  return <TourOverlay steps={steps} onComplete={completeTour} />;
}

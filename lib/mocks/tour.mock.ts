// ── Mock tour state ──────────────────────────────────────────────────
// Simple in-memory Map that stores has_seen_tour per profileId.

const seenMap = new Map<string, boolean>();

export function mockGetHasSeenTour(profileId: string): boolean {
  return seenMap.get(profileId) ?? false;
}

export function mockMarkTourAsSeen(profileId: string): void {
  seenMap.set(profileId, true);
}

export function mockResetTour(profileId: string): void {
  seenMap.set(profileId, false);
}

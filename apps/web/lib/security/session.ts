import { getAccessToken } from './token-store';
import { decodeJWT } from './crypto';
import type { Role } from '@/lib/types';

export interface SessionProfile {
  id: string;
  role: Role;
  display_name: string;
}

export function getCurrentProfile(): SessionProfile | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  return {
    id: payload.profile_id,
    role: payload.role as Role,
    display_name: payload.display_name,
  };
}

export function getAcademyId(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJWT(token);
  return payload?.academy_id ?? null;
}

export function hasRole(role: Role): boolean {
  const profile = getCurrentProfile();
  return profile?.role === role;
}

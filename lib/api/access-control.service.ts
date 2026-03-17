import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  student_name: string;
  photo_url: string;
  belt: string;
  academy: string;
  membership_active: boolean;
}

export interface AccessEvent {
  id: string;
  student_id: string;
  student_name: string;
  photo_url: string;
  unit_id: string;
  timestamp: string;
  direction: 'entry' | 'exit';
  method: 'qr_code' | 'proximity' | 'manual';
  allowed: boolean;
  reason?: string;
}

export interface AccessRule {
  id: string;
  unit_id: string;
  name: string;
  type: 'allowed_hours' | 'max_daily_access' | 'block_overdue';
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface StudentCard {
  student_id: string;
  student_name: string;
  photo_url: string;
  belt: string;
  academy: string;
  unit: string;
  membership_active: boolean;
  membership_expires: string;
  qr_code_token: string;
  qr_code_expires: string;
}

export async function validateAccess(studentId: string, unitId: string): Promise<AccessResult> {
  try {
    if (isMock()) {
      const { mockValidateAccess } = await import('@/lib/mocks/access-control.mock');
      return mockValidateAccess(studentId, unitId);
    }
    try {
      const res = await fetch('/api/access/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, unitId }) });
      return res.json();
    } catch {
      console.warn('[access-control.validateAccess] API not available, using fallback');
      return {} as AccessResult;
    }
  } catch (error) { handleServiceError(error, 'accessControl.validate'); }
}

export async function getAccessLog(unitId: string, date?: string): Promise<AccessEvent[]> {
  try {
    if (isMock()) {
      const { mockGetAccessLog } = await import('@/lib/mocks/access-control.mock');
      return mockGetAccessLog(unitId, date);
    }
    try {
      const params = new URLSearchParams({ unitId });
      if (date) params.set('date', date);
      const res = await fetch(`/api/access/log?${params}`);
      return res.json();
    } catch {
      console.warn('[access-control.getAccessLog] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'accessControl.log'); }
}

export async function configureAccessRules(unitId: string, rules: Partial<AccessRule>[]): Promise<AccessRule[]> {
  try {
    if (isMock()) {
      const { mockConfigureAccessRules } = await import('@/lib/mocks/access-control.mock');
      return mockConfigureAccessRules(unitId, rules);
    }
    try {
      const res = await fetch('/api/access/rules', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, rules }) });
      return res.json();
    } catch {
      console.warn('[access-control.configureAccessRules] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'accessControl.rules'); }
}

export async function getAccessRules(unitId: string): Promise<AccessRule[]> {
  try {
    if (isMock()) {
      const { mockGetAccessRules } = await import('@/lib/mocks/access-control.mock');
      return mockGetAccessRules(unitId);
    }
    try {
      const res = await fetch(`/api/access/rules?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[access-control.getAccessRules] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'accessControl.getRules'); }
}

export async function getStudentCard(studentId: string): Promise<StudentCard> {
  try {
    if (isMock()) {
      const { mockGetStudentCard } = await import('@/lib/mocks/access-control.mock');
      return mockGetStudentCard(studentId);
    }
    try {
      const res = await fetch(`/api/access/card?studentId=${studentId}`);
      return res.json();
    } catch {
      console.warn('[access-control.getStudentCard] API not available, using fallback');
      return {} as StudentCard;
    }
  } catch (error) { handleServiceError(error, 'accessControl.card'); }
}

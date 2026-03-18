import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type CertificateType = 'course' | 'belt' | 'event';

export interface Certificate {
  id: string;
  type: CertificateType;
  user_name: string;
  title: string;
  description: string;
  issued_at: string;
  academy_name: string;
  issuer_name: string;
  verification_code: string;
  pdf_url: string;
  thumbnail_url: string;
}

export async function generateCourseCertificate(userId: string, courseId: string): Promise<Certificate> {
  try {
    if (isMock()) {
      const { mockGenerateCourseCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateCourseCertificate(userId, courseId);
    }
    try {
      const res = await fetch(`/api/certificates/course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'certificates.generateCourse');
      return res.json();
    } catch {
      console.warn('[certificates.generateCourseCertificate] API not available, using mock fallback');
      const { mockGenerateCourseCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateCourseCertificate(userId, courseId);
    }
  } catch (error) { handleServiceError(error, 'certificates.generateCourse'); }
}

export async function generateBeltCertificate(userId: string, belt: string, academyId: string): Promise<Certificate> {
  try {
    if (isMock()) {
      const { mockGenerateBeltCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateBeltCertificate(userId, belt, academyId);
    }
    try {
      const res = await fetch(`/api/certificates/belt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, belt, academyId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'certificates.generateBelt');
      return res.json();
    } catch {
      console.warn('[certificates.generateBeltCertificate] API not available, using mock fallback');
      const { mockGenerateBeltCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateBeltCertificate(userId, belt, academyId);
    }
  } catch (error) { handleServiceError(error, 'certificates.generateBelt'); }
}

export async function generateEventCertificate(userId: string, eventId: string): Promise<Certificate> {
  try {
    if (isMock()) {
      const { mockGenerateEventCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateEventCertificate(userId, eventId);
    }
    try {
      const res = await fetch(`/api/certificates/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'certificates.generateEvent');
      return res.json();
    } catch {
      console.warn('[certificates.generateEventCertificate] API not available, using mock fallback');
      const { mockGenerateEventCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockGenerateEventCertificate(userId, eventId);
    }
  } catch (error) { handleServiceError(error, 'certificates.generateEvent'); }
}

export async function verifyCertificate(code: string): Promise<Certificate | null> {
  try {
    if (isMock()) {
      const { mockVerifyCertificate } = await import('@/lib/mocks/certificates.mock');
      return mockVerifyCertificate(code);
    }
    try {
      const res = await fetch(`/api/certificates/verify/${code}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new ServiceError(res.status, 'certificates.verify');
      return res.json();
    } catch {
      console.warn('[certificates.verifyCertificate] API not available, using fallback');
      return null;
    }
  } catch (error) { handleServiceError(error, 'certificates.verify'); }
}

export async function getMyCertificates(userId: string): Promise<Certificate[]> {
  try {
    if (isMock()) {
      const { mockGetMyCertificates } = await import('@/lib/mocks/certificates.mock');
      return mockGetMyCertificates(userId);
    }
    try {
      const res = await fetch(`/api/certificates?userId=${userId}`);
      if (!res.ok) throw new ServiceError(res.status, 'certificates.list');
      return res.json();
    } catch {
      console.warn('[certificates.getMyCertificates] API not available, using mock fallback');
      const { mockGetMyCertificates } = await import('@/lib/mocks/certificates.mock');
      return mockGetMyCertificates(userId);
    }
  } catch (error) { handleServiceError(error, 'certificates.list'); }
}

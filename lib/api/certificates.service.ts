import { isMock } from '@/lib/env';

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
  if (isMock()) {
    const { mockGenerateCourseCertificate } = await import('@/lib/mocks/certificates.mock');
    return mockGenerateCourseCertificate(userId, courseId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('generate_course_certificate', { p_user_id: userId, p_course_id: courseId });
  if (error || !data) {
    console.error('[generateCourseCertificate] Supabase error:', error?.message);
    throw new Error(`[generateCourseCertificate] ${error?.message ?? 'No data returned'}`);
  }
  return data as unknown as Certificate;
}

export async function generateBeltCertificate(userId: string, belt: string, academyId: string): Promise<Certificate> {
  if (isMock()) {
    const { mockGenerateBeltCertificate } = await import('@/lib/mocks/certificates.mock');
    return mockGenerateBeltCertificate(userId, belt, academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('generate_belt_certificate', { p_user_id: userId, p_belt: belt, p_academy_id: academyId });
  if (error || !data) {
    console.error('[generateBeltCertificate] Supabase error:', error?.message);
    throw new Error(`[generateBeltCertificate] ${error?.message ?? 'No data returned'}`);
  }
  return data as unknown as Certificate;
}

export async function generateEventCertificate(userId: string, eventId: string): Promise<Certificate> {
  if (isMock()) {
    const { mockGenerateEventCertificate } = await import('@/lib/mocks/certificates.mock');
    return mockGenerateEventCertificate(userId, eventId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('generate_event_certificate', { p_user_id: userId, p_event_id: eventId });
  if (error || !data) {
    console.error('[generateEventCertificate] Supabase error:', error?.message);
    throw new Error(`[generateEventCertificate] ${error?.message ?? 'No data returned'}`);
  }
  return data as unknown as Certificate;
}

export async function verifyCertificate(code: string): Promise<Certificate | null> {
  if (isMock()) {
    const { mockVerifyCertificate } = await import('@/lib/mocks/certificates.mock');
    return mockVerifyCertificate(code);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('verification_code', code)
    .single();
  if (error || !data) {
    console.error('[verifyCertificate] Supabase error:', error?.message);
    return null;
  }
  return data as unknown as Certificate;
}

export async function getMyCertificates(userId: string): Promise<Certificate[]> {
  if (isMock()) {
    const { mockGetMyCertificates } = await import('@/lib/mocks/certificates.mock');
    return mockGetMyCertificates(userId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  if (error || !data) {
    console.error('[getMyCertificates] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as Certificate[];
}

import type { Certificate } from '@/lib/api/certificates.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1', type: 'course', user_name: 'João Silva',
    title: 'Conclusão: Guarda Fechada Completa', description: 'Completou com sucesso o curso "Guarda Fechada Completa - Do Básico ao Avançado" com 480 minutos de conteúdo.',
    issued_at: '2026-02-28T10:00:00Z', academy_name: 'Team Kime SP', issuer_name: 'Prof. Ricardo Almeida',
    verification_code: 'BB-CRS-2026-A1B2C3', pdf_url: '/certificates/cert-1.pdf', thumbnail_url: '/certificates/thumb-cert-1.jpg',
  },
  {
    id: 'cert-2', type: 'belt', user_name: 'João Silva',
    title: 'Graduação - Faixa Azul de Jiu-Jitsu', description: 'Graduado à faixa azul de Brazilian Jiu-Jitsu após demonstrar proficiência técnica e dedicação ao treinamento.',
    issued_at: '2025-12-15T14:00:00Z', academy_name: 'Team Kime SP', issuer_name: 'Mestre Eduardo Silva',
    verification_code: 'BB-BLT-2025-D4E5F6', pdf_url: '/certificates/cert-2.pdf', thumbnail_url: '/certificates/thumb-cert-2.jpg',
  },
  {
    id: 'cert-3', type: 'event', user_name: 'João Silva',
    title: 'Participação: Seminário de Guarda', description: 'Participou do seminário "Técnicas Avançadas de Guarda" com professor convidado internacional.',
    issued_at: '2026-01-20T17:00:00Z', academy_name: 'Team Kime SP', issuer_name: 'Prof. Ricardo Almeida',
    verification_code: 'BB-EVT-2026-G7H8I9', pdf_url: '/certificates/cert-3.pdf', thumbnail_url: '/certificates/thumb-cert-3.jpg',
  },
  {
    id: 'cert-4', type: 'course', user_name: 'João Silva',
    title: 'Conclusão: Ippon Seoi Nage - Técnica Perfeita', description: 'Completou com sucesso o curso de Judô "Ippon Seoi Nage - Técnica Perfeita" com 240 minutos de conteúdo.',
    issued_at: '2026-03-05T11:00:00Z', academy_name: 'Judô Clube Paulista', issuer_name: 'Sensei Takeshi Yamamoto',
    verification_code: 'BB-CRS-2026-J1K2L3', pdf_url: '/certificates/cert-4.pdf', thumbnail_url: '/certificates/thumb-cert-4.jpg',
  },
  {
    id: 'cert-5', type: 'event', user_name: 'João Silva',
    title: 'Participação: Copa BlackBelt 2025', description: 'Participou da Copa BlackBelt 2025, categoria Faixa Azul Peso Médio, conquistando a medalha de prata.',
    issued_at: '2025-11-10T18:00:00Z', academy_name: 'BlackBelt Platform', issuer_name: 'Comissão Organizadora',
    verification_code: 'BB-EVT-2025-M4N5O6', pdf_url: '/certificates/cert-5.pdf', thumbnail_url: '/certificates/thumb-cert-5.jpg',
  },
];

export async function mockGenerateCourseCertificate(_userId: string, _courseId: string): Promise<Certificate> {
  await delay();
  const cert: Certificate = {
    id: `cert-${Date.now()}`, type: 'course', user_name: 'João Silva',
    title: 'Conclusão: Curso Marketplace', description: 'Completou com sucesso o curso adquirido no marketplace.',
    issued_at: new Date().toISOString(), academy_name: 'BlackBelt Academy', issuer_name: 'Professor Responsável',
    verification_code: `BB-CRS-${Date.now()}`, pdf_url: '/certificates/new-cert.pdf', thumbnail_url: '/certificates/thumb-new.jpg',
  };
  CERTIFICATES.push(cert);
  return cert;
}

export async function mockGenerateBeltCertificate(_userId: string, belt: string, _academyId: string): Promise<Certificate> {
  await delay();
  const cert: Certificate = {
    id: `cert-${Date.now()}`, type: 'belt', user_name: 'João Silva',
    title: `Graduação - Faixa ${belt}`, description: `Graduado à faixa ${belt} após avaliação técnica.`,
    issued_at: new Date().toISOString(), academy_name: 'Team Kime SP', issuer_name: 'Mestre Responsável',
    verification_code: `BB-BLT-${Date.now()}`, pdf_url: '/certificates/belt-cert.pdf', thumbnail_url: '/certificates/thumb-belt.jpg',
  };
  CERTIFICATES.push(cert);
  return cert;
}

export async function mockGenerateEventCertificate(_userId: string, _eventId: string): Promise<Certificate> {
  await delay();
  const cert: Certificate = {
    id: `cert-${Date.now()}`, type: 'event', user_name: 'João Silva',
    title: 'Participação em Evento', description: 'Certificado de participação em evento da plataforma.',
    issued_at: new Date().toISOString(), academy_name: 'BlackBelt Platform', issuer_name: 'Organizador',
    verification_code: `BB-EVT-${Date.now()}`, pdf_url: '/certificates/event-cert.pdf', thumbnail_url: '/certificates/thumb-event.jpg',
  };
  CERTIFICATES.push(cert);
  return cert;
}

export async function mockVerifyCertificate(code: string): Promise<Certificate | null> {
  await delay();
  return CERTIFICATES.find((c) => c.verification_code === code) || null;
}

export async function mockGetMyCertificates(_userId: string): Promise<Certificate[]> {
  await delay();
  return CERTIFICATES.map((c) => ({ ...c }));
}

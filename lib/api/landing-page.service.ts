import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────

export interface LandingPagePhoto {
  url: string;
  legenda: string;
}

export interface LandingPageProfessor {
  nome: string;
  faixa: string;
  foto?: string;
}

export interface LandingPageModalidade {
  nome: string;
  icone: string;
  descricao: string;
  professores: LandingPageProfessor[];
}

export interface LandingPageGrade {
  turma: string;
  modalidade: string;
  diaSemana: string;
  horario: string;
  professor: string;
  vagasDisponiveis: number;
}

export interface LandingPagePlano {
  nome: string;
  preco: number;
  periodo: string;
  beneficios: string[];
  destaque: boolean;
}

export interface LandingPageDepoimento {
  nome: string;
  foto?: string;
  faixa: string;
  texto: string;
  nota: number;
}

export interface LandingPageStats {
  alunosAtivos: number;
  anosExistencia: number;
  modalidades: number;
  notaGoogle: number;
}

export interface LandingPageVisual {
  corPrimaria: string;
  corSecundaria: string;
  tema: 'claro' | 'escuro';
  heroBanner?: string;
}

export interface LandingPageData {
  nome: string;
  slug: string;
  logo?: string;
  descricao: string;
  endereco: string;
  cidade: string;
  telefone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  fotos: LandingPagePhoto[];
  modalidades: LandingPageModalidade[];
  grade: LandingPageGrade[];
  planos: LandingPagePlano[];
  depoimentos: LandingPageDepoimento[];
  stats: LandingPageStats;
  visual: LandingPageVisual;
  experimentalAtiva: boolean;
  turmasExperimental: string[];
}

export interface LeadFormData {
  nome: string;
  telefone: string;
  email?: string;
  modalidade: string;
  turma: string;
}

export interface LeadResult {
  success: boolean;
  mensagem: string;
}

// ── API ────────────────────────────────────────────────────────────

export async function getLandingPage(slug: string): Promise<LandingPageData | null> {
  try {
    if (isMock()) {
      const { mockGetLandingPage } = await import('@/lib/mocks/landing-page.mock');
      return mockGetLandingPage(slug);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('landing_page_configs').select('*').eq('slug', slug).eq('published', true).single();
    if (error) {
      console.warn('[getLandingPage] error:', error.message);
      return null;
    }
    return data as unknown as LandingPageData;
  } catch (error) {
    console.warn('[getLandingPage] Fallback:', error);
    return null;
  }
}

export async function getLandingPageByAcademy(academyId: string): Promise<LandingPageData | null> {
  try {
    if (isMock()) {
      const { mockGetLandingPageByAcademy } = await import('@/lib/mocks/landing-page.mock');
      return mockGetLandingPageByAcademy(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('landing_page_configs').select('*').eq('academy_id', academyId).single();
    if (error) {
      console.warn('[getLandingPageByAcademy] error:', error.message);
      return null;
    }
    return data as unknown as LandingPageData;
  } catch (error) {
    console.warn('[getLandingPageByAcademy] Fallback:', error);
    return null;
  }
}

export async function updateLandingPage(academyId: string, pageData: Partial<LandingPageData>): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateLandingPage } = await import('@/lib/mocks/landing-page.mock');
      return mockUpdateLandingPage(academyId, pageData);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('landing_page_configs').upsert({ academy_id: academyId, ...pageData, updated_at: new Date().toISOString() }, { onConflict: 'academy_id' });
    if (error) {
      console.warn('[updateLandingPage] error:', error.message);
    }
  } catch (error) {
    console.warn('[updateLandingPage] Fallback:', error);
  }
}

export async function agendarExperimental(slug: string, lead: LeadFormData): Promise<LeadResult> {
  try {
    if (isMock()) {
      const { mockAgendarExperimental } = await import('@/lib/mocks/landing-page.mock');
      return mockAgendarExperimental(slug, lead);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: config } = await supabase.from('landing_page_configs').select('academy_id').eq('slug', slug).single();
    if (!config) {
      console.warn('[agendarExperimental] Academia não encontrada para slug:', slug);
      return { success: false, mensagem: 'Academia não encontrada' };
    }
    const { error } = await supabase.from('landing_page_leads').insert({ academy_id: config.academy_id, nome: lead.nome, telefone: lead.telefone, email: lead.email, modalidade: lead.modalidade, turma: lead.turma });
    if (error) {
      console.warn('[agendarExperimental] error:', error.message);
      return { success: false, mensagem: 'Erro ao agendar. Tente novamente.' };
    }
    return { success: true, mensagem: 'Aula experimental agendada! Entraremos em contato pelo WhatsApp.' };
  } catch (error) {
    console.warn('[agendarExperimental] Fallback:', error);
    return { success: false, mensagem: 'Erro ao agendar. Tente novamente.' };
  }
}

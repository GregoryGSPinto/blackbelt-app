import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface CadastroRapido {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf?: string;
  genero?: 'M' | 'F' | 'outro';
  tipoAluno: 'adulto' | 'teen' | 'kids';
  responsavel?: {
    nome: string;
    email: string;
    telefone: string;
    parentesco: string;
  };
  modalidadeInteresse: string;
  turmaId?: string;
  planoId?: string;
  origem: 'walk_in' | 'indicacao' | 'site' | 'instagram' | 'whatsapp' | 'experimental';
  indicadoPor?: string;
  tipo: 'matricula' | 'experimental' | 'lead';
}

export interface CadastroResult {
  alunoId: string;
  tipo: string;
  loginTemporario?: { email: string; senhaTemporaria: string };
  contratoGerado?: boolean;
  proximaAula?: { turma: string; horario: string };
}

export interface PlanoResumo {
  id: string;
  nome: string;
  valor: number;
  beneficios: string[];
}

export interface TurmaResumo {
  id: string;
  nome: string;
  horario: string;
  professor: string;
  vagas: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function cadastrarRapido(data: CadastroRapido): Promise<CadastroResult> {
  try {
    if (isMock()) {
      const { mockCadastrarRapido } = await import('@/lib/mocks/recepcao-cadastro.mock');
      return mockCadastrarRapido(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('cadastros')
      .insert(data)
      .select()
      .single();
    if (error || !row) {
      console.warn('[cadastrarRapido] Supabase error:', error?.message);
      return { alunoId: '', tipo: data.tipo };
    }
    trackFeatureUsage('students', 'create');
    return row as unknown as CadastroResult;
  } catch (error) {
    console.warn('[cadastrarRapido] Fallback:', error);
    return { alunoId: '', tipo: data.tipo };
  }
}

export async function getPlanos(): Promise<PlanoResumo[]> {
  try {
    if (isMock()) {
      const { mockGetPlanos } = await import('@/lib/mocks/recepcao-cadastro.mock');
      return mockGetPlanos();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('plans')
      .select('id, name, price, features')
      .eq('active', true);
    if (error || !data) {
      console.warn('[getPlanos] Supabase error:', error?.message);
      return [];
    }
    return data.map((p: { id: string; name: string; price: number; features: string[] | null }) => ({ id: p.id, nome: p.name, valor: p.price, beneficios: p.features ?? [] })) as PlanoResumo[];
  } catch (error) {
    console.warn('[getPlanos] Fallback:', error);
    return [];
  }
}

export async function getTurmasDisponiveis(): Promise<TurmaResumo[]> {
  try {
    if (isMock()) {
      const { mockGetTurmasDisponiveis } = await import('@/lib/mocks/recepcao-cadastro.mock');
      return mockGetTurmasDisponiveis();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, schedule, professor_name, capacity, enrolled_count')
      .eq('status', 'active');
    if (error || !data) {
      console.warn('[getTurmasDisponiveis] Supabase error:', error?.message);
      return [];
    }
    return data.map((c: { id: string; name: string; schedule: string | null; professor_name: string | null; capacity: number | null; enrolled_count: number | null }) => ({ id: c.id, nome: c.name, horario: c.schedule ?? '', professor: c.professor_name ?? '', vagas: (c.capacity ?? 0) - (c.enrolled_count ?? 0) })) as TurmaResumo[];
  } catch (error) {
    console.warn('[getTurmasDisponiveis] Fallback:', error);
    return [];
  }
}

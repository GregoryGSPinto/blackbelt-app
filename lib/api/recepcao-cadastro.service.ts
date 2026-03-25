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

    // Calls server-side API route that uses service_role to create auth user + profile + student
    const res = await fetch('/api/students/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        dataNascimento: data.dataNascimento,
        cpf: data.cpf,
        tipoAluno: data.tipoAluno,
        turmaId: data.turmaId,
        planoId: data.planoId,
        academyId: 'academy-1', // resolved server-side in production via session
        origem: data.origem,
        tipo: data.tipo,
        responsavel: data.responsavel,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[cadastrarRapido] API error:', result.error);
      return { alunoId: '', tipo: data.tipo };
    }

    trackFeatureUsage('students', 'create');

    return {
      alunoId: result.alunoId as string,
      tipo: result.tipo as string,
      loginTemporario: result.loginTemporario as CadastroResult['loginTemporario'],
    };
  } catch (error) {
    console.error('[cadastrarRapido] Fallback:', error);
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
      console.error('[getPlanos] Supabase error:', error?.message);
      return [];
    }
    return data.map((p: { id: string; name: string; price: number; features: string[] | null }) => ({ id: p.id, nome: p.name, valor: p.price, beneficios: p.features ?? [] })) as PlanoResumo[];
  } catch (error) {
    console.error('[getPlanos] Fallback:', error);
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
      .select('id, schedule, modalities(name), profiles!classes_professor_id_fkey(display_name)');
    if (error || !data) {
      console.error('[getTurmasDisponiveis] Supabase error:', error?.message);
      return [];
    }
    return data.map((c: Record<string, unknown>) => {
      const mod = c.modalities as Record<string, unknown> | null;
      const prof = c.profiles as Record<string, unknown> | null;
      return {
        id: c.id as string,
        nome: (mod?.name ?? 'Turma') as string,
        horario: '',
        professor: (prof?.display_name ?? '') as string,
        vagas: 0,
      };
    });
  } catch (error) {
    console.error('[getTurmasDisponiveis] Fallback:', error);
    return [];
  }
}

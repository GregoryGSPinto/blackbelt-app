import { isMock } from '@/lib/env';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import { logServiceError } from '@/lib/api/errors';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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
        academyId: getActiveAcademyId(),
        origem: data.origem,
        tipo: data.tipo,
        responsavel: data.responsavel,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      logServiceError(new Error('API error'), 'recepcao-cadastro');
      return { alunoId: '', tipo: data.tipo };
    }

    trackFeatureUsage('students', 'create');

    return {
      alunoId: result.alunoId as string,
      tipo: result.tipo as string,
      loginTemporario: result.loginTemporario as CadastroResult['loginTemporario'],
    };
  } catch (error) {
    logServiceError(error, 'recepcao-cadastro');
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
    const academyId = getActiveAcademyId();
    const { data, error } = await supabase
      .from('plans')
      .select('id, name, price, features')
      .eq('academy_id', academyId)
      .eq('is_active', true);
    if (error || !data) {
      logServiceError(error, 'recepcao-cadastro');
      return [];
    }
    return data.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      nome: (p.name ?? '') as string,
      valor: (p.price ?? 0) as number,
      beneficios: (p.features ?? []) as string[],
    }));
  } catch (error) {
    logServiceError(error, 'recepcao-cadastro');
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
    const academyId = getActiveAcademyId();
    const { data, error } = await supabase
      .from('classes')
      .select('id, schedule, capacity, modalities(name), profiles!classes_professor_id_fkey(display_name), units!inner(academy_id)')
      .eq('units.academy_id', academyId);
    if (error || !data) {
      logServiceError(error, 'recepcao-cadastro');
      return [];
    }

    const dayNames: Record<number, string> = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab' };

    return data.map((c: Record<string, unknown>) => {
      const mod = c.modalities as Record<string, unknown> | null;
      const prof = c.profiles as Record<string, unknown> | null;
      const schedule = (c.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
      const cap = (c.capacity as number) ?? 30;

      // Build readable schedule string: "Seg 18:00, Qua 18:00"
      const horario = schedule
        .map((s: { day_of_week: number; start_time: string }) => `${dayNames[s.day_of_week] ?? ''} ${s.start_time}`)
        .join(', ');

      return {
        id: c.id as string,
        nome: (mod?.name ?? 'Turma') as string,
        horario,
        professor: (prof?.display_name ?? '') as string,
        vagas: cap,
      };
    });
  } catch (error) {
    logServiceError(error, 'recepcao-cadastro');
    return [];
  }
}

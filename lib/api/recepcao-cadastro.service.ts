import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch('/api/recepcao/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-cadastro.create');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-cadastro.create');
  }
}

export async function getPlanos(): Promise<PlanoResumo[]> {
  try {
    if (isMock()) {
      const { mockGetPlanos } = await import('@/lib/mocks/recepcao-cadastro.mock');
      return mockGetPlanos();
    }
    const res = await fetch('/api/recepcao/planos');
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-cadastro.planos');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-cadastro.planos');
  }
}

export async function getTurmasDisponiveis(): Promise<TurmaResumo[]> {
  try {
    if (isMock()) {
      const { mockGetTurmasDisponiveis } = await import('@/lib/mocks/recepcao-cadastro.mock');
      return mockGetTurmasDisponiveis();
    }
    const res = await fetch('/api/recepcao/turmas');
    if (!res.ok) throw new ServiceError(res.status, 'recepcao-cadastro.turmas');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'recepcao-cadastro.turmas');
  }
}

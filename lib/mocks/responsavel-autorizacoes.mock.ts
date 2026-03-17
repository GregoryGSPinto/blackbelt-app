import type { Autorizacao, ControleParental } from '@/lib/api/responsavel-autorizacoes.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_AUTORIZACOES: Autorizacao[] = [
  {
    id: 'auth-01',
    student_id: 'stu-sophia',
    student_name: 'Sophia',
    type: 'evento',
    title: 'Campeonato Regional de Jiu-Jitsu',
    description:
      'Solicitamos autorizacao para participacao da aluna Sophia no Campeonato Regional de Jiu-Jitsu Teen, que sera realizado no Ginasio Municipal dia 25/03/2026.',
    status: 'pendente',
    requested_at: '2026-03-14T10:30:00Z',
    responded_at: null,
  },
  {
    id: 'auth-02',
    student_id: 'stu-miguel',
    student_name: 'Miguel',
    type: 'foto',
    title: 'Uso de Imagem para Redes Sociais',
    description:
      'Gostavamos de utilizar fotos do Miguel durante as aulas para publicacao nas redes sociais da academia. As fotos serao usadas apenas para fins promocionais.',
    status: 'pendente',
    requested_at: '2026-03-13T14:15:00Z',
    responded_at: null,
  },
  {
    id: 'auth-03',
    student_id: 'stu-sophia',
    student_name: 'Sophia',
    type: 'viagem',
    title: 'Viagem para Seminario em Sao Paulo',
    description:
      'A equipe da academia ira participar de um seminario de Jiu-Jitsu em Sao Paulo nos dias 10 e 11/04/2026. Transporte e hospedagem inclusos.',
    status: 'pendente',
    requested_at: '2026-03-12T09:00:00Z',
    responded_at: null,
  },
  {
    id: 'auth-04',
    student_id: 'stu-sophia',
    student_name: 'Sophia',
    type: 'saida_sozinho',
    title: 'Saida Desacompanhada apos Aula',
    description:
      'Sophia podera sair desacompanhada da academia apos o termino das aulas nas tercas e quintas, conforme solicitacao da responsavel.',
    status: 'autorizado',
    requested_at: '2026-02-20T11:00:00Z',
    responded_at: '2026-02-20T18:30:00Z',
  },
  {
    id: 'auth-05',
    student_id: 'stu-miguel',
    student_name: 'Miguel',
    type: 'contato_emergencia',
    title: 'Atualizacao de Contato de Emergencia',
    description:
      'Solicitamos confirmacao do novo contato de emergencia: Avo Maria — (11) 98765-4321.',
    status: 'autorizado',
    requested_at: '2026-02-15T16:45:00Z',
    responded_at: '2026-02-16T08:00:00Z',
  },
  {
    id: 'auth-06',
    student_id: 'stu-miguel',
    student_name: 'Miguel',
    type: 'evento',
    title: 'Festival Interno Kids',
    description:
      'Autorizacao para participacao do Miguel no Festival Interno Kids da academia, que sera realizado no sabado dia 22/03/2026.',
    status: 'negado',
    requested_at: '2026-03-05T10:00:00Z',
    responded_at: '2026-03-06T07:30:00Z',
  },
];

const MOCK_CONTROLE_PARENTAL: Record<string, ControleParental> = {
  'stu-sophia': {
    student_id: 'stu-sophia',
    student_name: 'Sophia',
    permissions: [
      {
        key: 'uso_imagem',
        label: 'Uso de Imagem',
        enabled: true,
        description: 'Permitir que a academia use fotos da aluna em redes sociais e materiais promocionais.',
      },
      {
        key: 'saida_sozinho',
        label: 'Saida Desacompanhada',
        enabled: true,
        description: 'Permitir que a aluna saia da academia desacompanhada apos as aulas.',
      },
      {
        key: 'participacao_campeonatos',
        label: 'Participacao em Campeonatos',
        enabled: true,
        description: 'Autorizar automaticamente a participacao em campeonatos e competicoes.',
      },
      {
        key: 'contato_professor',
        label: 'Contato Direto com Professor',
        enabled: false,
        description: 'Permitir que professores entrem em contato direto com a aluna via mensagem.',
      },
      {
        key: 'treino_extra',
        label: 'Treinos Extras',
        enabled: true,
        description: 'Permitir participacao em treinos extras fora do horario regular.',
      },
      {
        key: 'compartilhar_progresso',
        label: 'Compartilhar Progresso',
        enabled: true,
        description: 'Compartilhar dados de progresso e desempenho com outros professores da academia.',
      },
    ],
  },
  'stu-miguel': {
    student_id: 'stu-miguel',
    student_name: 'Miguel',
    permissions: [
      {
        key: 'uso_imagem',
        label: 'Uso de Imagem',
        enabled: false,
        description: 'Permitir que a academia use fotos do aluno em redes sociais e materiais promocionais.',
      },
      {
        key: 'saida_sozinho',
        label: 'Saida Desacompanhada',
        enabled: false,
        description: 'Permitir que o aluno saia da academia desacompanhado apos as aulas.',
      },
      {
        key: 'participacao_campeonatos',
        label: 'Participacao em Campeonatos',
        enabled: false,
        description: 'Autorizar automaticamente a participacao em campeonatos e competicoes.',
      },
      {
        key: 'contato_professor',
        label: 'Contato Direto com Professor',
        enabled: false,
        description: 'Permitir que professores entrem em contato direto com o aluno via mensagem.',
      },
      {
        key: 'treino_extra',
        label: 'Treinos Extras',
        enabled: true,
        description: 'Permitir participacao em treinos extras fora do horario regular.',
      },
      {
        key: 'compartilhar_progresso',
        label: 'Compartilhar Progresso',
        enabled: true,
        description: 'Compartilhar dados de progresso e desempenho com outros professores da academia.',
      },
    ],
  },
};

export async function mockGetAutorizacoes(_guardianId: string): Promise<Autorizacao[]> {
  await delay();
  return MOCK_AUTORIZACOES;
}

export async function mockRespondAutorizacao(
  id: string,
  status: 'autorizado' | 'negado',
): Promise<Autorizacao> {
  await delay();
  const auth = MOCK_AUTORIZACOES.find((a) => a.id === id);
  if (!auth) throw new Error('Autorizacao nao encontrada');
  return {
    ...auth,
    status,
    responded_at: new Date().toISOString(),
  };
}

export async function mockGetControleParental(studentId: string): Promise<ControleParental> {
  await delay();
  return (
    MOCK_CONTROLE_PARENTAL[studentId] ?? {
      student_id: studentId,
      student_name: 'Aluno',
      permissions: [],
    }
  );
}

export async function mockUpdatePermission(
  _studentId: string,
  _key: string,
  _enabled: boolean,
): Promise<void> {
  await delay();
}

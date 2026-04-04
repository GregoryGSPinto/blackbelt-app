import type { Devedor, InadimplenciaMetrics, ContatoRegistro, ContatoTipo, ContatoResultado } from '@/lib/api/inadimplencia.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const DEVEDORES: Devedor[] = [
  { id: 'dev-1', alunoId: 'aluno-20', alunoNome: 'Carlos Pereira', alunoTelefone: '(11) 98111-2233', alunoEmail: 'carlos.p@email.com', valorDevido: 189, diasAtraso: 3, ultimoPagamento: '2026-02-14T00:00:00Z', plano: 'Mensal R$189', ultimoContato: { data: '2026-03-16T10:00:00Z', tipo: 'whatsapp', resultado: 'sem_resposta' }, statusCobranca: 'contatado' },
  { id: 'dev-2', alunoId: 'aluno-21', alunoNome: 'Luciana Ferraz', alunoTelefone: '(11) 98222-3344', alunoEmail: 'luciana.f@email.com', valorDevido: 338, diasAtraso: 10, ultimoPagamento: '2026-02-07T00:00:00Z', plano: 'Trimestral R$169/mês', ultimoContato: { data: '2026-03-14T14:00:00Z', tipo: 'ligacao', resultado: 'negociando' }, statusCobranca: 'negociando' },
  { id: 'dev-3', alunoId: 'aluno-22', alunoNome: 'Roberto Almeida', alunoTelefone: '(11) 98333-4455', alunoEmail: 'roberto.a@email.com', valorDevido: 149, diasAtraso: 5, ultimoPagamento: '2026-02-12T00:00:00Z', plano: 'Semestral R$149/mês', statusCobranca: 'pendente' },
  { id: 'dev-4', alunoId: 'aluno-23', alunoNome: 'Tatiana Borges', alunoTelefone: '(11) 98444-5566', alunoEmail: 'tatiana.b@email.com', valorDevido: 378, diasAtraso: 20, ultimoPagamento: '2026-01-25T00:00:00Z', plano: 'Mensal R$189', statusCobranca: 'pendente' },
  { id: 'dev-5', alunoId: 'aluno-24', alunoNome: 'Marcos Vieira', alunoTelefone: '(11) 98555-6677', alunoEmail: 'marcos.v@email.com', valorDevido: 298, diasAtraso: 15, ultimoPagamento: '2026-02-02T00:00:00Z', plano: 'Trimestral R$169/mês', ultimoContato: { data: '2026-03-12T09:00:00Z', tipo: 'email', resultado: 'sem_resposta' }, statusCobranca: 'contatado' },
  { id: 'dev-6', alunoId: 'aluno-25', alunoNome: 'Priscila Monteiro', alunoTelefone: '(11) 98666-7788', alunoEmail: 'priscila.m@email.com', valorDevido: 189, diasAtraso: 7, ultimoPagamento: '2026-02-10T00:00:00Z', plano: 'Mensal R$189', statusCobranca: 'pendente' },
  { id: 'dev-7', alunoId: 'aluno-26', alunoNome: 'Renato Dias', alunoTelefone: '(11) 98777-8899', alunoEmail: 'renato.d@email.com', valorDevido: 567, diasAtraso: 45, ultimoPagamento: '2026-01-01T00:00:00Z', plano: 'Mensal R$189', statusCobranca: 'pendente' },
  { id: 'dev-8', alunoId: 'aluno-27', alunoNome: 'Juliana Costa', alunoTelefone: '(11) 98888-9900', alunoEmail: 'juliana.c@email.com', valorDevido: 298, diasAtraso: 12, ultimoPagamento: '2026-02-05T00:00:00Z', plano: 'Semestral R$149/mês', statusCobranca: 'pendente' },
];

const CONTATOS: ContatoRegistro[] = [
  { id: 'cont-1', devedorId: 'dev-1', tipo: 'whatsapp', resultado: 'sem_resposta', observacao: 'Mensagem enviada, sem visualização', data: '2026-03-16T10:00:00Z' },
  { id: 'cont-2', devedorId: 'dev-2', tipo: 'ligacao', resultado: 'negociando', observacao: 'Aluna pediu parcelamento do valor atrasado em 2x', data: '2026-03-14T14:00:00Z' },
  { id: 'cont-3', devedorId: 'dev-2', tipo: 'whatsapp', resultado: 'sem_resposta', observacao: 'Primeiro contato via WhatsApp', data: '2026-03-10T09:00:00Z' },
  { id: 'cont-4', devedorId: 'dev-5', tipo: 'email', resultado: 'sem_resposta', observacao: 'Email de cobrança automático enviado', data: '2026-03-12T09:00:00Z' },
  { id: 'cont-5', devedorId: 'dev-1', tipo: 'ligacao', resultado: 'sem_resposta', observacao: 'Ligação não atendida, caixa postal', data: '2026-03-15T11:00:00Z' },
];

export async function mockGetDevedores(_academyId: string): Promise<Devedor[]> {
  await delay();
  return DEVEDORES.map((d) => ({ ...d, ultimoContato: d.ultimoContato ? { ...d.ultimoContato } : undefined }));
}

export async function mockGetInadimplenciaMetrics(_academyId: string): Promise<InadimplenciaMetrics> {
  await delay();
  return { totalDevedores: 8, valorTotalDevido: 2406, mediaAtraso: 15, recuperadoMes: 800 };
}

export async function mockRegistrarContato(devedorId: string, tipo: ContatoTipo, resultado: ContatoResultado, observacao: string): Promise<ContatoRegistro> {
  await delay();
  const registro: ContatoRegistro = {
    id: `cont-${Date.now()}`,
    devedorId,
    tipo,
    resultado,
    observacao,
    data: new Date().toISOString(),
  };
  CONTATOS.push(registro);
  return registro;
}

export async function mockGetHistoricoContatos(devedorId: string): Promise<ContatoRegistro[]> {
  await delay();
  return CONTATOS.filter((c) => c.devedorId === devedorId).map((c) => ({ ...c }));
}

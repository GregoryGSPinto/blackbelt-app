import type { ContratoTemplate, Contrato, ContratosMetrics, StatusContrato } from '@/lib/api/contratos-v2.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const TEMPLATES: ContratoTemplate[] = [
  {
    id: 'tpl-1',
    nome: 'Contrato de Matrícula',
    tipo: 'matricula',
    conteudoHTML: '<h1>Contrato de Matrícula</h1><p>Pelo presente instrumento particular, <strong>{{academia_nome}}</strong> e o(a) aluno(a) <strong>{{aluno_nome}}</strong>, firmam o presente contrato de prestação de serviços educacionais na modalidade de artes marciais, com início em <strong>{{data_inicio}}</strong>, no plano <strong>{{plano}}</strong>, pelo valor mensal de <strong>R$ {{valor_mensal}}</strong>.</p><p>Cláusula 1 - O aluno declara estar apto fisicamente...</p><p>Cláusula 2 - O pagamento deverá ser efetuado até o dia 10 de cada mês...</p>',
    variaveis: ['aluno_nome', 'plano', 'valor_mensal', 'data_inicio', 'academia_nome'],
    ativo: true,
    criadoEm: '2026-01-10T10:00:00Z',
  },
  {
    id: 'tpl-2',
    nome: 'Termo de Responsabilidade',
    tipo: 'termo_responsabilidade',
    conteudoHTML: '<h1>Termo de Responsabilidade</h1><p>Eu, <strong>{{aluno_nome}}</strong>, portador(a) do CPF <strong>{{aluno_cpf}}</strong>, declaro estar ciente dos riscos inerentes à prática de artes marciais na academia <strong>{{academia_nome}}</strong>.</p><p>Declaro que não possuo restrições médicas que impeçam a prática de atividades físicas e que participarei das aulas sob minha inteira responsabilidade.</p>',
    variaveis: ['aluno_nome', 'aluno_cpf', 'academia_nome'],
    ativo: true,
    criadoEm: '2026-01-10T10:00:00Z',
  },
  {
    id: 'tpl-3',
    nome: 'Código de Conduta',
    tipo: 'codigo_conduta',
    conteudoHTML: '<h1>Código de Conduta</h1><p>Eu, <strong>{{aluno_nome}}</strong>, me comprometo a seguir as regras de conduta da academia <strong>{{academia_nome}}</strong>, assinando este termo na data <strong>{{data}}</strong>.</p><p>1. Respeitar professores e colegas de treino.</p><p>2. Manter a higiene pessoal e do kimono.</p><p>3. Chegar pontualmente às aulas.</p><p>4. Não utilizar técnicas de forma agressiva ou desnecessária.</p>',
    variaveis: ['aluno_nome', 'academia_nome', 'data'],
    ativo: true,
    criadoEm: '2026-01-15T10:00:00Z',
  },
];

const CONTRATOS: Contrato[] = [
  { id: 'ctr-1', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-1', alunoNome: 'Lucas Teixeira', status: 'assinado', enviadoPor: 'email', assinadoEm: '2026-02-15T14:30:00Z', conteudoFinal: '<p>Contrato de matrícula assinado — Plano Mensal R$189</p>', criadoEm: '2026-02-15T10:00:00Z' },
  { id: 'ctr-2', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-2', alunoNome: 'Amanda Vieira', status: 'assinado', enviadoPor: 'whatsapp', assinadoEm: '2026-02-21T08:00:00Z', conteudoFinal: '<p>Contrato de matrícula assinado — Plano Trimestral R$169/mês</p>', criadoEm: '2026-02-20T09:00:00Z' },
  { id: 'ctr-3', templateId: 'tpl-2', templateNome: 'Termo de Responsabilidade', alunoId: 'aluno-3', alunoNome: 'Pedro Gonçalves', status: 'enviado', enviadoPor: 'email', conteudoFinal: '<p>Termo de responsabilidade — aguardando assinatura</p>', criadoEm: '2026-03-10T10:00:00Z' },
  { id: 'ctr-4', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-4', alunoNome: 'Marcos Ribeiro', status: 'visualizado', enviadoPor: 'email', conteudoFinal: '<p>Contrato visualizado, aguardando assinatura</p>', criadoEm: '2026-03-14T14:00:00Z' },
  { id: 'ctr-5', templateId: 'tpl-3', templateNome: 'Código de Conduta', alunoId: 'aluno-5', alunoNome: 'Juliana Pereira', status: 'assinado', enviadoPor: 'whatsapp', assinadoEm: '2026-03-05T16:00:00Z', conteudoFinal: '<p>Código de conduta assinado</p>', criadoEm: '2026-03-04T10:00:00Z' },
  { id: 'ctr-6', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-6', alunoNome: 'Gabriel Souza', status: 'assinado', enviadoPor: 'email', assinadoEm: '2026-03-02T11:00:00Z', conteudoFinal: '<p>Contrato de matrícula assinado — Plano Semestral R$149/mês</p>', criadoEm: '2026-03-01T09:00:00Z' },
  { id: 'ctr-7', templateId: 'tpl-2', templateNome: 'Termo de Responsabilidade', alunoId: 'aluno-7', alunoNome: 'Carla Mendes', status: 'assinado', enviadoPor: 'email', assinadoEm: '2026-02-28T15:00:00Z', conteudoFinal: '<p>Termo de responsabilidade assinado</p>', criadoEm: '2026-02-27T10:00:00Z' },
  { id: 'ctr-8', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-8', alunoNome: 'Thiago Barbosa', status: 'enviado', enviadoPor: 'whatsapp', conteudoFinal: '<p>Contrato de matrícula enviado via WhatsApp</p>', criadoEm: '2026-03-16T09:00:00Z' },
  { id: 'ctr-9', templateId: 'tpl-3', templateNome: 'Código de Conduta', alunoId: 'aluno-9', alunoNome: 'Fernanda Alves', status: 'assinado', enviadoPor: 'email', assinadoEm: '2026-03-08T10:00:00Z', conteudoFinal: '<p>Código de conduta assinado</p>', criadoEm: '2026-03-07T14:00:00Z' },
  { id: 'ctr-10', templateId: 'tpl-1', templateNome: 'Contrato de Matrícula', alunoId: 'aluno-10', alunoNome: 'Bruno Nascimento', status: 'rascunho', conteudoFinal: '<p>Rascunho — contrato ainda não enviado</p>', criadoEm: '2026-03-17T08:00:00Z' },
];

export async function mockListContratosTemplates(_academyId: string): Promise<ContratoTemplate[]> {
  await delay();
  return TEMPLATES.map((t) => ({ ...t, variaveis: [...t.variaveis] }));
}

export async function mockGetContratoTemplate(id: string): Promise<ContratoTemplate> {
  await delay();
  const template = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
  return { ...template, variaveis: [...template.variaveis] };
}

export async function mockCreateContratoTemplate(data: Omit<ContratoTemplate, 'id' | 'criadoEm'>): Promise<ContratoTemplate> {
  await delay();
  const template: ContratoTemplate = { ...data, id: `tpl-${Date.now()}`, variaveis: [...data.variaveis], criadoEm: new Date().toISOString() };
  TEMPLATES.push(template);
  return template;
}

export async function mockGerarContrato(templateId: string, alunoId: string, dados: Record<string, string>): Promise<Contrato> {
  await delay();
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  let conteudo = template.conteudoHTML;
  for (const [key, value] of Object.entries(dados)) {
    conteudo = conteudo.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  const contrato: Contrato = {
    id: `ctr-${Date.now()}`,
    templateId,
    templateNome: template.nome,
    alunoId,
    alunoNome: dados['aluno_nome'] ?? 'Aluno',
    status: 'rascunho',
    conteudoFinal: conteudo,
    criadoEm: new Date().toISOString(),
  };
  CONTRATOS.push(contrato);
  return contrato;
}

export async function mockEnviarParaAssinatura(contratoId: string, metodo: 'email' | 'whatsapp'): Promise<void> {
  await delay();
  const contrato = CONTRATOS.find((c) => c.id === contratoId);
  if (contrato) {
    contrato.status = 'enviado';
    contrato.enviadoPor = metodo;
  }
}

export async function mockAssinarContrato(contratoId: string, assinatura: string): Promise<Contrato> {
  await delay();
  const contrato = CONTRATOS.find((c) => c.id === contratoId) ?? CONTRATOS[0];
  contrato.status = 'assinado';
  contrato.assinadoEm = new Date().toISOString();
  contrato.assinaturaBase64 = assinatura;
  return { ...contrato };
}

export async function mockListContratos(_academyId: string, filters?: { status?: StatusContrato }): Promise<Contrato[]> {
  await delay();
  let result = CONTRATOS.map((c) => ({ ...c }));
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  return result;
}

export async function mockGetContratosMetrics(_academyId: string): Promise<ContratosMetrics> {
  await delay();
  return { contratosAtivos: 45, pendentesAssinatura: 5, taxaAssinatura: 92 };
}

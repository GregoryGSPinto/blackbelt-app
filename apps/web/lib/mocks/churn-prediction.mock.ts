import type { AlunoRisco, ChurnMetrics, ChurnTrendPoint } from '@/lib/api/churn-prediction.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_ALUNOS_RISCO: AlunoRisco[] = [
  {
    id: 'churn-1', nome: 'Marcos Vieira', faixa: 'blue', risco: 'alto', score: 82,
    motivos: ['Não treina há 12 dias', 'Presença caiu 65%', 'Zero logins no app'],
    dados: { presencaUltimas4Semanas: 35, presencaTendencia: 'caindo', diasSemTreinar: 12, pagamentoEmDia: true, diasAtraso: 0, tempoNaFaixa: 14, interacaoApp: 0, eventosParticipados: 0, amigosNaAcademia: 1 },
    acoesSugeridas: [
      { acao: 'Enviar mensagem de reativação via WhatsApp', canal: 'whatsapp', template: 'reativacao', prioridade: 'alta' },
      { acao: 'Agendar conversa com professor', canal: 'presencial', prioridade: 'alta' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-2', nome: 'Matheus Rodrigues', faixa: 'white', risco: 'alto', score: 75,
    motivos: ['Presença caiu 60%', 'Pagamento atrasado 8 dias', 'NPS 5'],
    dados: { presencaUltimas4Semanas: 40, presencaTendencia: 'caindo', diasSemTreinar: 5, pagamentoEmDia: false, diasAtraso: 8, tempoNaFaixa: 6, interacaoApp: 1, npsUltimo: 5, eventosParticipados: 0, amigosNaAcademia: 0 },
    acoesSugeridas: [
      { acao: 'Enviar WhatsApp perguntando se está tudo bem', canal: 'whatsapp', template: 'aula_semana_sem_treinar', prioridade: 'alta' },
      { acao: 'Oferecer desconto para regularizar pagamento', canal: 'whatsapp', template: 'cobranca_atrasada_7d', prioridade: 'alta' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-3', nome: 'Patrícia Mendes', faixa: 'purple', risco: 'alto', score: 72,
    motivos: ['Não treina há 15 dias', 'Tempo na faixa: 20 meses', 'Zero eventos'],
    dados: { presencaUltimas4Semanas: 20, presencaTendencia: 'caindo', diasSemTreinar: 15, pagamentoEmDia: true, diasAtraso: 0, tempoNaFaixa: 20, interacaoApp: 0, eventosParticipados: 0, amigosNaAcademia: 2 },
    acoesSugeridas: [
      { acao: 'Conversa sobre progressão de faixa', canal: 'presencial', prioridade: 'alta' },
      { acao: 'Convidar para evento/open mat', canal: 'whatsapp', template: 'evento_convite', prioridade: 'media' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-4', nome: 'Rafael Almeida', faixa: 'white', risco: 'medio', score: 55,
    motivos: ['Presença caiu 30%', 'Pagamento atrasado 5 dias'],
    dados: { presencaUltimas4Semanas: 60, presencaTendencia: 'caindo', diasSemTreinar: 4, pagamentoEmDia: false, diasAtraso: 5, tempoNaFaixa: 3, interacaoApp: 2, eventosParticipados: 1, amigosNaAcademia: 3 },
    acoesSugeridas: [
      { acao: 'Enviar lembrete de pagamento', canal: 'whatsapp', template: 'cobranca_vencida', prioridade: 'media' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-5', nome: 'Camila Ferraz', faixa: 'blue', risco: 'medio', score: 50,
    motivos: ['Não treina há 8 dias', 'Presença caiu 25%'],
    dados: { presencaUltimas4Semanas: 55, presencaTendencia: 'caindo', diasSemTreinar: 8, pagamentoEmDia: true, diasAtraso: 0, tempoNaFaixa: 10, interacaoApp: 1, eventosParticipados: 1, amigosNaAcademia: 4 },
    acoesSugeridas: [
      { acao: 'Mensagem perguntando se está tudo bem', canal: 'whatsapp', template: 'aula_semana_sem_treinar', prioridade: 'media' },
    ],
    statusAcao: 'acao_tomada', ultimoContato: '2026-03-15T10:00:00Z',
  },
  {
    id: 'churn-6', nome: 'Bruno Gomes', faixa: 'white', risco: 'medio', score: 48,
    motivos: ['Pagamento atrasado 10 dias', 'Zero logins no app'],
    dados: { presencaUltimas4Semanas: 70, presencaTendencia: 'estavel', diasSemTreinar: 3, pagamentoEmDia: false, diasAtraso: 10, tempoNaFaixa: 2, interacaoApp: 0, eventosParticipados: 0, amigosNaAcademia: 2 },
    acoesSugeridas: [
      { acao: 'Cobrar mensalidade via WhatsApp', canal: 'whatsapp', template: 'cobranca_atrasada_7d', prioridade: 'media' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-7', nome: 'Juliana Costa', faixa: 'blue', risco: 'medio', score: 45,
    motivos: ['Presença caiu 20%', 'Tempo na faixa: 19 meses'],
    dados: { presencaUltimas4Semanas: 65, presencaTendencia: 'caindo', diasSemTreinar: 4, pagamentoEmDia: true, diasAtraso: 0, tempoNaFaixa: 19, interacaoApp: 3, eventosParticipados: 2, amigosNaAcademia: 5 },
    acoesSugeridas: [
      { acao: 'Conversa sobre evolução técnica', canal: 'presencial', prioridade: 'media' },
    ],
    statusAcao: 'pendente',
  },
  {
    id: 'churn-8', nome: 'Diego Santos', faixa: 'white', risco: 'medio', score: 42,
    motivos: ['Não treina há 6 dias', 'Zero eventos participados'],
    dados: { presencaUltimas4Semanas: 60, presencaTendencia: 'caindo', diasSemTreinar: 6, pagamentoEmDia: true, diasAtraso: 0, tempoNaFaixa: 4, interacaoApp: 2, eventosParticipados: 0, amigosNaAcademia: 1 },
    acoesSugeridas: [
      { acao: 'Convidar para open mat', canal: 'whatsapp', template: 'evento_convite', prioridade: 'media' },
    ],
    statusAcao: 'pendente',
  },
];

export async function mockGetAlunosEmRisco(_academyId: string): Promise<AlunoRisco[]> {
  await delay();
  return MOCK_ALUNOS_RISCO;
}

export async function mockGetChurnMetrics(_academyId: string): Promise<ChurnMetrics> {
  await delay();
  return { totalRisco: 8, alto: 3, medio: 5, recuperados: 12, cancelados: 4, taxaRecuperacao: 75 };
}

export async function mockGetChurnTrend(_academyId: string): Promise<ChurnTrendPoint[]> {
  await delay();
  return [
    { mes: '2025-10', risco: 12, cancelados: 3, recuperados: 5 },
    { mes: '2025-11', risco: 10, cancelados: 2, recuperados: 6 },
    { mes: '2025-12', risco: 11, cancelados: 4, recuperados: 4 },
    { mes: '2026-01', risco: 9, cancelados: 2, recuperados: 7 },
    { mes: '2026-02', risco: 8, cancelados: 1, recuperados: 5 },
    { mes: '2026-03', risco: 8, cancelados: 0, recuperados: 4 },
  ];
}

export async function mockMarcarAcaoTomada(_studentId: string, _acao: string): Promise<void> {
  await delay();
}

export async function mockMarcarRecuperado(_studentId: string): Promise<void> {
  await delay();
}

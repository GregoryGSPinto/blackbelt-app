import type { TourStep } from '@/components/tour/TourOverlay';

// ── Tour steps per role ─────────────────────────────────────────────────
// Uses data-tour attributes added to the shell components.
// If a target element doesn't exist in the DOM, the TourOverlay
// component automatically skips that step.

export const TOUR_STEPS: Record<string, TourStep[]> = {
  admin: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu lateral',
      description: 'Navegue entre todas as funcionalidades da sua academia.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Resumo do dia',
      description: 'Veja os numeros mais importantes da sua academia de um relance.',
      position: 'bottom',
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Acoes rapidas',
      description: 'Cadastre alunos, crie turmas e registre presenca com um clique.',
      position: 'bottom',
    },
    {
      target: '[data-tour="profile-menu"]',
      title: 'Seu perfil',
      description: 'Acesse suas configuracoes, mude o tema e gerencie sua conta.',
      position: 'left',
    },
  ],
  professor: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu lateral',
      description: 'Acesse suas turmas, alunos e ferramentas pedagogicas.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Seu painel',
      description: 'Veja suas aulas do dia, alunos e frequencia.',
      position: 'bottom',
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Acoes rapidas',
      description: 'Inicie o modo aula, registre presenca e crie planos de treino.',
      position: 'bottom',
    },
  ],
  aluno_adulto: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Navegue entre treinos, conquistas, contrato e mais.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Seu progresso',
      description: 'Acompanhe sua frequencia, streak e proximas aulas.',
      position: 'bottom',
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Acoes rapidas',
      description: 'Faca check-in, veja treinos e acompanhe sua evolucao.',
      position: 'bottom',
    },
  ],
  aluno_teen: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Navegue entre treinos, desafios, ranking e conquistas.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Seu XP',
      description: 'Acompanhe seu nivel, XP e posicao no ranking.',
      position: 'bottom',
    },
  ],
  aluno_kids: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Veja suas estrelas, figurinhas e aventuras!',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Suas estrelas',
      description: 'Veja quantas estrelas voce ja ganhou!',
      position: 'bottom',
    },
  ],
  responsavel: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Acompanhe seus filhos, pagamentos e autorizacoes.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Painel familiar',
      description: 'Veja o progresso de todos os seus filhos em um so lugar.',
      position: 'bottom',
    },
  ],
  recepcao: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Acesse check-in, cadastro, atendimento e caixa.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Painel do dia',
      description: 'Veja quem chegou, agendamentos e pendencias do dia.',
      position: 'bottom',
    },
  ],
  superadmin: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Gerencie academias, planos, analytics e configuracoes da plataforma.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Visao geral',
      description: 'Metricas globais da plataforma: academias, usuarios, MRR.',
      position: 'bottom',
    },
  ],
  franqueador: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Menu',
      description: 'Gerencie sua rede de academias, padronizacao e royalties.',
      position: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Rede',
      description: 'Veja o desempenho de todas as unidades da sua rede.',
      position: 'bottom',
    },
  ],
};

'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  LifeBuoy,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  Check,
  X,
  Ticket,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from '@/lib/hooks/useTutorial';
import { useToast } from '@/lib/hooks/useToast';
import { ROLE_TUTORIAL_MAP } from '@/lib/tutorials/definitions';
import { Role } from '@/lib/types/enums';

// ── Types ─────────────────────────────────────────────────────────────────

type SupportSection = 'menu' | 'ticket' | 'faq';

type TicketCategory = 'Bug' | 'Feature' | 'Cobranca' | 'Performance' | 'Acesso' | 'Dados' | 'Outro';
type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

interface TicketFormData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ── FAQ Data (45 FAQs: 5 per role x 9 roles) ─────────────────────────────

const FAQ_DATA: Record<string, FAQItem[]> = {
  [Role.Admin]: [
    {
      question: 'Como cadastrar um aluno?',
      answer: 'Va em Alunos > Novo Aluno ou gere um link de convite em Alunos > Convidar.',
    },
    {
      question: 'Como gerar boleto?',
      answer: 'Financeiro > Faturas > Nova Fatura. Escolha o aluno e o valor.',
    },
    {
      question: 'Como mudar meu plano?',
      answer: 'Configuracoes > Meu Plano. Escolha os modulos ou mude de faixa.',
    },
    {
      question: 'Como funciona o check-in?',
      answer: 'O professor gera QR na aula. O aluno escaneia com o celular.',
    },
    {
      question: 'Como ver relatorios?',
      answer: 'Menu Relatorios. Use os filtros de periodo e tipo de relatorio.',
    },
  ],
  [Role.Professor]: [
    {
      question: 'Como iniciar uma aula?',
      answer: 'Dashboard > Iniciar Aula ou acesse Modo Aula no menu.',
    },
    {
      question: 'Como avaliar um aluno?',
      answer: 'Avaliacoes > Selecione o aluno > Preencha os 8 criterios tecnicos.',
    },
    {
      question: 'Como registrar presenca?',
      answer: 'Modo Aula > QR Code. Os alunos escaneiam, ou marque manual na lista.',
    },
    {
      question: 'Como ver o progresso de um aluno?',
      answer: 'Alunos > Clique no aluno > Visao 360 com todas as metricas.',
    },
    {
      question: 'Como planejar uma aula?',
      answer: 'Plano de Aula > Visao semanal > Clique no dia para montar a aula.',
    },
  ],
  [Role.AlunoAdulto]: [
    {
      question: 'Como fazer check-in?',
      answer: 'Toque no botao Check-in > Escaneie o QR Code que o professor gera.',
    },
    {
      question: 'Como ver minha evolucao?',
      answer: 'Perfil > Aba Evolucao mostra presenca, tecnicas e avaliacoes.',
    },
    {
      question: 'O que sao conquistas?',
      answer: 'Badges que voce desbloqueia treinando. Veja todas em Conquistas.',
    },
    {
      question: 'Como assistir videos?',
      answer: 'Menu Biblioteca > Escolha uma trilha ou video especifico.',
    },
    {
      question: 'Como indicar um amigo?',
      answer: 'Menu Indicar > Copie seu link pessoal e envie para amigos.',
    },
  ],
  [Role.AlunoTeen]: [
    {
      question: 'Como ganhar XP?',
      answer: 'Treine, faca check-in, complete desafios e suba no ranking.',
    },
    {
      question: 'O que sao desafios?',
      answer: 'Missoes semanais que dao XP extra. Veja em Desafios.',
    },
    {
      question: 'Como ver meu ranking?',
      answer: 'Menu Ranking mostra sua posicao entre os teens da academia.',
    },
    {
      question: 'Como ver minhas conquistas?',
      answer: 'Aba Conquistas mostra todos os badges que voce desbloqueou.',
    },
    {
      question: 'Como mudar meu avatar?',
      answer: 'Perfil > Toque na foto para trocar seu avatar.',
    },
  ],
  [Role.AlunoKids]: [
    {
      question: 'Como fazer presenca?',
      answer: 'Peca pro professor mostrar o QR Code e escaneie com o celular.',
    },
    {
      question: 'O que sao estrelas?',
      answer: 'Voce ganha estrelas quando treina! Quanto mais estrelas, mais conquistas.',
    },
    {
      question: 'Como ver minhas conquistas?',
      answer: 'Toque em Conquistas para ver seus badges especiais!',
    },
    {
      question: 'Como assistir videos?',
      answer: 'Toque em Videos para ver tecnicas legais de jiu-jitsu!',
    },
    {
      question: 'Cade minha faixa?',
      answer: 'Toque em Perfil para ver sua faixa e suas graus.',
    },
  ],
  [Role.Responsavel]: [
    {
      question: 'Como ver o progresso do meu filho?',
      answer: 'Dashboard mostra presenca, evolucao e avaliacoes do seu filho.',
    },
    {
      question: 'Como pagar mensalidade?',
      answer: 'Financeiro > Faturas mostra os boletos em aberto.',
    },
    {
      question: 'Como falar com o professor?',
      answer: 'Mensagens > Selecione o professor do seu filho.',
    },
    {
      question: 'Como trocar de plano?',
      answer: 'Fale com a recepcao da academia para trocar de plano.',
    },
    {
      question: 'Como cadastrar outro filho?',
      answer: 'Perfil > Adicionar Dependente. Preencha os dados do novo aluno.',
    },
  ],
  [Role.Franqueador]: [
    {
      question: 'Como ver todas as unidades?',
      answer: 'Dashboard mostra o mapa e KPIs de todas as franquias.',
    },
    {
      question: 'Como comparar unidades?',
      answer: 'Relatorios > Comparativo de Unidades com ranking.',
    },
    {
      question: 'Como aprovar um franqueado?',
      answer: 'Pipeline > Candidatos. Analise e aprove ou rejeite.',
    },
    {
      question: 'Como definir padroes?',
      answer: 'Configuracoes > Padroes da Rede para definir regras globais.',
    },
    {
      question: 'Como ver a receita total?',
      answer: 'Financeiro > Receita consolidada de toda a rede.',
    },
  ],
  [Role.Recepcao]: [
    {
      question: 'Como fazer matricula?',
      answer: 'Matriculas > Nova Matricula. Preencha dados do aluno e plano.',
    },
    {
      question: 'Como registrar aula experimental?',
      answer: 'Agenda > Aula Experimental. Cadastre o visitante.',
    },
    {
      question: 'Como consultar inadimplencia?',
      answer: 'Financeiro > Inadimplentes mostra quem esta devendo.',
    },
    {
      question: 'Como gerar contrato?',
      answer: 'Matriculas > Selecione o aluno > Gerar Contrato PDF.',
    },
    {
      question: 'Como agendar reposicao?',
      answer: 'Agenda > Reposicoes. Escolha a turma e horario disponivel.',
    },
  ],
  [Role.Superadmin]: [
    {
      question: 'Como impersonar uma academia?',
      answer: 'Academias > Selecione > Impersonar para ver como admin.',
    },
    {
      question: 'Como ver metricas globais?',
      answer: 'Dashboard Mission Control mostra todos os KPIs em tempo real.',
    },
    {
      question: 'Como gerenciar feature flags?',
      answer: 'Features > Toggle para ativar/desativar funcionalidades.',
    },
    {
      question: 'Como ver a saude do sistema?',
      answer: 'Health > Monitor de servicos, uptime e performance.',
    },
    {
      question: 'Como enviar comunicado global?',
      answer: 'Comunicacao > Nova mensagem para todas as academias.',
    },
  ],
};

// ── Ticket category options ───────────────────────────────────────────────

const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'Bug', label: 'Bug' },
  { value: 'Feature', label: 'Feature' },
  { value: 'Cobranca', label: 'Cobranca' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Acesso', label: 'Acesso' },
  { value: 'Dados', label: 'Dados' },
  { value: 'Outro', label: 'Outro' },
];

const TICKET_PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' },
];

// ── FAQ Accordion Item ────────────────────────────────────────────────────

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-left text-sm font-medium transition-colors"
        style={{ color: 'var(--bb-text-primary, #111)' }}
      >
        <span className="flex-1 pr-2">{item.question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0 opacity-60" />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-60" />
        )}
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{
          maxHeight: open ? '200px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <p
          className="text-sm pb-3 px-1"
          style={{ color: 'var(--bb-text-secondary, #666)' }}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────

const SupportWidget = forwardRef<HTMLDivElement>(function SupportWidget(_, ref) {
  const { profile } = useAuth();
  const { isActive: isTutorialActive, resetTutorial } = useTutorial();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<SupportSection>('menu');
  const [ticketForm, setTicketForm] = useState<TicketFormData>({
    subject: '',
    description: '',
    category: 'Bug',
    priority: 'media',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const role = profile?.role ?? null;

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset section when closing
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let animation complete
      const timer = setTimeout(() => {
        setSection('menu');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Get FAQ for current role
  const faqItems = useMemo<FAQItem[]>(() => {
    if (!role) return [];
    return FAQ_DATA[role] ?? [];
  }, [role]);

  // Handle tutorial reset
  const handleResetTutorial = useCallback(() => {
    if (!role) return;
    const tutorialId = ROLE_TUTORIAL_MAP[role];
    if (tutorialId) {
      resetTutorial(tutorialId);
      setIsOpen(false);
    }
  }, [role, resetTutorial]);

  // Handle ticket submit
  const handleTicketSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;

      setIsSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSubmitting(false);
      toast('Ticket enviado com sucesso! Responderemos em breve.', 'success');
      setTicketForm({
        subject: '',
        description: '',
        category: 'Bug',
        priority: 'media',
      });
      setIsOpen(false);
    },
    [ticketForm, toast],
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    },
    [],
  );

  // Don't render when tutorial is active
  if (isTutorialActive) return null;

  // Don't render if no profile
  if (!profile) return null;

  return (
    <div ref={ref}>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          right: '16px',
          bottom: '80px',
          backgroundColor: 'var(--bb-brand, #6366f1)',
          color: '#fff',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        aria-label="Suporte"
      >
        <LifeBuoy className="w-6 h-6" />
      </button>

      {/* Backdrop + Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={handleBackdropClick}
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Slide-up panel */}
          <div
            ref={panelRef}
            className="relative w-full max-w-lg rounded-t-2xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--bb-depth-2, #fff)',
              borderTop: '1px solid var(--bb-glass-border, rgba(255,255,255,0.15))',
              borderLeft: '1px solid var(--bb-glass-border, rgba(255,255,255,0.15))',
              borderRight: '1px solid var(--bb-glass-border, rgba(255,255,255,0.15))',
              maxHeight: '85vh',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              animation: 'supportSlideUp 0.3s ease-out',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: 'var(--bb-glass-border, rgba(0,0,0,0.2))' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                {section !== 'menu' && (
                  <button
                    type="button"
                    onClick={() => setSection('menu')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
                    style={{ color: 'var(--bb-text-secondary, #666)' }}
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                )}
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--bb-text-primary, #111)' }}
                >
                  {section === 'menu' && 'Suporte'}
                  {section === 'ticket' && 'Abrir Ticket'}
                  {section === 'faq' && 'Perguntas Frequentes'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                style={{ color: 'var(--bb-text-secondary, #666)' }}
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* ── Menu Section ─────────────────────────────── */}
              {section === 'menu' && (
                <div className="space-y-2">
                  {/* Abrir Ticket */}
                  <button
                    type="button"
                    onClick={() => setSection('ticket')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                      border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.08))',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: 'var(--bb-brand, #6366f1)', color: '#fff' }}
                    >
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-text-primary, #111)' }}
                      >
                        Abrir Ticket
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-text-secondary, #666)' }}
                      >
                        Reporte um problema ou solicite ajuda
                      </p>
                    </div>
                  </button>

                  {/* Tutorial */}
                  <button
                    type="button"
                    onClick={handleResetTutorial}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                      border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.08))',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: '#10b981', color: '#fff' }}
                    >
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-text-primary, #111)' }}
                      >
                        Tutorial
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-text-secondary, #666)' }}
                      >
                        Rever o tour guiado do sistema
                      </p>
                    </div>
                  </button>

                  {/* FAQ */}
                  <button
                    type="button"
                    onClick={() => setSection('faq')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                      border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.08))',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: '#f59e0b', color: '#fff' }}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-text-primary, #111)' }}
                      >
                        FAQ
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-text-secondary, #666)' }}
                      >
                        Perguntas frequentes do seu perfil
                      </p>
                    </div>
                  </button>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/5531996793625?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20BlackBelt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                      border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.08))',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: '#25d366', color: '#fff' }}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-text-primary, #111)' }}
                      >
                        WhatsApp
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--bb-text-secondary, #666)' }}
                      >
                        Fale conosco pelo WhatsApp
                      </p>
                    </div>
                  </a>

                  {/* Status do Sistema */}
                  <div
                    className="w-full flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                      border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.08))',
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: '#22c55e', color: '#fff' }}
                    >
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--bb-text-primary, #111)' }}
                      >
                        Status do Sistema
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#22c55e' }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: '#22c55e' }}
                        >
                          Todos os sistemas operacionais
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Ticket Section ───────────────────────────── */}
              {section === 'ticket' && (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="support-ticket-subject"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--bb-text-primary, #111)' }}
                    >
                      Assunto
                    </label>
                    <input
                      id="support-ticket-subject"
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) =>
                        setTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder="Descreva brevemente o problema"
                      required
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                        border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.12))',
                        color: 'var(--bb-text-primary, #111)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="support-ticket-category"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--bb-text-primary, #111)' }}
                    >
                      Categoria
                    </label>
                    <select
                      id="support-ticket-category"
                      value={ticketForm.category}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          category: e.target.value as TicketCategory,
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                        border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.12))',
                        color: 'var(--bb-text-primary, #111)',
                      }}
                    >
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label
                      htmlFor="support-ticket-priority"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--bb-text-primary, #111)' }}
                    >
                      Prioridade
                    </label>
                    <select
                      id="support-ticket-priority"
                      value={ticketForm.priority}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          priority: e.target.value as TicketPriority,
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                        border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.12))',
                        color: 'var(--bb-text-primary, #111)',
                      }}
                    >
                      {TICKET_PRIORITIES.map((pri) => (
                        <option key={pri.value} value={pri.value}>
                          {pri.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="support-ticket-description"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--bb-text-primary, #111)' }}
                    >
                      Descricao
                    </label>
                    <textarea
                      id="support-ticket-description"
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Descreva o problema com detalhes. Inclua passos para reproduzir se for um bug."
                      required
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bb-depth-1, #f9fafb)',
                        border: '1px solid var(--bb-glass-border, rgba(0,0,0,0.12))',
                        color: 'var(--bb-text-primary, #111)',
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !ticketForm.subject.trim() || !ticketForm.description.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--bb-brand, #6366f1)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          style={{ animation: 'spin 0.6s linear infinite' }}
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Ticket
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── FAQ Section ──────────────────────────────── */}
              {section === 'faq' && (
                <div>
                  {faqItems.length === 0 ? (
                    <p
                      className="text-sm text-center py-6"
                      style={{ color: 'var(--bb-text-secondary, #666)' }}
                    >
                      Nenhuma pergunta frequente disponivel para este perfil.
                    </p>
                  ) : (
                    <div>
                      {faqItems.map((item, index) => (
                        <FAQAccordionItem key={index} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation keyframes */}
      <style jsx global>{`
        @keyframes supportSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

SupportWidget.displayName = 'SupportWidget';

export default SupportWidget;

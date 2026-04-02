'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Types ───────────────────────────────────────────────────────────

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: HelpCategory;
}

type HelpCategory =
  | 'primeiros-passos'
  | 'turmas'
  | 'presenca'
  | 'financeiro'
  | 'streaming'
  | 'planos';

interface CategoryInfo {
  id: HelpCategory;
  label: string;
  icon: string;
  description: string;
}

// ── Category Data ───────────────────────────────────────────────────

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'primeiros-passos',
    label: 'Primeiros Passos',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    description: 'Comece a usar a plataforma',
  },
  {
    id: 'turmas',
    label: 'Turmas',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    description: 'Gerenciamento de turmas e modalidades',
  },
  {
    id: 'presenca',
    label: 'Presenca',
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    description: 'Check-in e controle de frequencia',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    description: 'Planos, pagamentos e faturas',
  },
  {
    id: 'streaming',
    label: 'Streaming',
    icon: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    description: 'Aulas ao vivo e conteudo gravado',
  },
  {
    id: 'planos',
    label: 'Planos',
    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM16 3.13a4 4 0 0 1 0 7.75',
    description: 'Assinaturas e recursos disponiveis',
  },
];

// ── 10 Mock Help Articles ───────────────────────────────────────────

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'art-01',
    title: 'Como criar minha conta na BlackBelt?',
    category: 'primeiros-passos',
    content:
      'Para criar sua conta, acesse a pagina de cadastro e informe seu email, nome completo e uma senha segura. Voce tambem pode ser convidado pela sua academia — nesse caso, basta clicar no link enviado por email e completar o cadastro. Apos a confirmacao do email, voce tera acesso ao painel de acordo com o seu perfil (aluno, professor ou administrador). Se sua academia ja estiver cadastrada, o administrador pode adicionar voce diretamente pelo painel de gestao.',
  },
  {
    id: 'art-02',
    title: 'Como fazer check-in na aula?',
    category: 'presenca',
    content:
      'Existem duas formas de registrar presenca: pelo QR Code disponibilizado na academia ou manualmente pelo professor. Para check-in por QR Code, abra o aplicativo e toque no botao de check-in (o botao flutuante na tela principal). Aponte a camera para o QR Code e sua presenca sera registrada automaticamente. O professor tambem pode registrar sua presenca manualmente pelo painel de turma ativa. Voce pode verificar seu historico de presencas na aba "Presenca" do seu perfil.',
  },
  {
    id: 'art-03',
    title: 'Como criar e gerenciar turmas?',
    category: 'turmas',
    content:
      'Para criar uma turma, acesse o painel administrativo e va em "Turmas" > "Nova Turma". Selecione a modalidade, o professor responsavel, a unidade e defina os horarios da semana. Voce pode definir a capacidade maxima de alunos e o nivel de faixa minimo para matricula. Para gerenciar uma turma existente, clique nela na listagem e voce podera editar horarios, trocar professor, ver alunos matriculados e acompanhar estatisticas de frequencia.',
  },
  {
    id: 'art-04',
    title: 'Como funciona a cobranca e os pagamentos?',
    category: 'financeiro',
    content:
      'A BlackBelt integra com gateways de pagamento como Asaas e Stripe para automatizar cobranças. O administrador da academia configura os planos (mensal, trimestral, anual) com seus respectivos valores. As faturas sao geradas automaticamente com base no ciclo do plano e enviadas por email ao aluno. O aluno pode pagar via boleto, PIX ou cartao de credito. O painel financeiro mostra o status de todas as faturas (em aberto, pagas, vencidas) e permite enviar lembretes de cobranca.',
  },
  {
    id: 'art-05',
    title: 'Como assistir aulas ao vivo?',
    category: 'streaming',
    content:
      'As aulas ao vivo sao transmitidas diretamente pela plataforma. Quando o professor iniciar uma transmissao, voce recebera uma notificacao. Acesse a aba "Ao Vivo" para ver as transmissoes disponiveis. O acesso ao conteudo pode ser filtrado por nivel de faixa — ou seja, voce so vera conteudos compativeis com o seu nivel. Apos a aula, a gravacao fica disponivel na biblioteca de videos para voce rever quantas vezes quiser.',
  },
  {
    id: 'art-06',
    title: 'Quais planos a BlackBelt oferece?',
    category: 'planos',
    content:
      'A BlackBelt oferece planos para academias de diferentes portes. O plano Starter e ideal para academias com ate 50 alunos e inclui gestao basica de turmas, presencas e financeiro. O plano Pro suporta ate 200 alunos e adiciona streaming, relatorios avancados e integracao com gateways de pagamento. O plano Enterprise e para redes e franquias, com multi-unidade, branding personalizado e suporte prioritario. Todos os planos incluem periodo de teste gratuito de 14 dias.',
  },
  {
    id: 'art-07',
    title: 'Como transferir um aluno entre turmas?',
    category: 'turmas',
    content:
      'Para transferir um aluno entre turmas, acesse o painel administrativo e va em "Alunos". Localize o aluno desejado e clique em "Editar Matricula". Voce vera a turma atual e podera selecionar a nova turma. Note que o aluno so pode ser transferido para turmas compativeis com seu nivel de faixa. O historico de presenca e avaliacoes da turma anterior e mantido. O aluno e o professor da nova turma serao notificados sobre a transferencia.',
  },
  {
    id: 'art-08',
    title: 'Como o sistema de graduacao funciona?',
    category: 'primeiros-passos',
    content:
      'O sistema de graduacao segue a hierarquia tradicional de faixas: Branca, Cinza, Amarela, Laranja, Verde, Azul, Roxa, Marrom e Preta. A faixa so pode subir, nunca descer. O professor avalia o aluno em criterios como tecnica, disciplina, evolucao e consistencia. Quando o aluno atinge os requisitos minimos (definidos pela academia), o professor pode solicitar a promocao de faixa. O administrador valida e a promocao e registrada no sistema com notificacao ao aluno.',
  },
  {
    id: 'art-09',
    title: 'Como exportar relatorios financeiros?',
    category: 'financeiro',
    content:
      'Para exportar relatorios, acesse o painel administrativo e va em "Relatorios". Selecione o tipo de relatorio (financeiro, presencas, alunos) e o periodo desejado. Voce pode filtrar por turma, modalidade ou status de pagamento. Clique em "Exportar" e escolha o formato (PDF ou CSV). O relatorio sera gerado em segundo plano e voce recebera uma notificacao quando estiver pronto para download. Relatorios em PDF incluem graficos e visualizacoes para facilitar a analise.',
  },
  {
    id: 'art-10',
    title: 'Como configurar notificacoes de presenca?',
    category: 'presenca',
    content:
      'Para configurar notificacoes de presenca, acesse "Configuracoes" > "Notificacoes" no painel administrativo. Voce pode ativar alertas para: aluno com mais de X dias sem treinar, queda na frequencia mensal, check-in realizado (para responsaveis de menores). As notificacoes podem ser enviadas por push, email ou WhatsApp. O professor tambem recebe alertas quando a frequencia media da turma cai abaixo de um limite configuravel. Responsaveis de alunos Kids e Teen recebem resumos semanais automaticos.',
  },
];

// ── Accordion Item ──────────────────────────────────────────────────

function AccordionItem({
  article,
  isOpen,
  onToggle,
}: {
  article: HelpArticle;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--bb-glass-border)] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-[var(--bb-depth-4)]"
      >
        <span className="pr-4 text-sm font-medium text-[var(--bb-ink-100)]">{article.title}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--bb-ink-40)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm leading-relaxed text-[var(--bb-ink-60)]">{article.content}</p>
        </div>
      )}
    </div>
  );
}

// ── Skeleton Loading ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HelpSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="text" className="h-5 w-72" />
      <Skeleton variant="text" className="h-12 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────────────

export default function AjudaPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all');
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return HELP_ARTICLES.filter((article) => {
      const matchSearch =
        search === '' ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.content.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || article.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  // Group by category for display
  const groupedArticles = useMemo(() => {
    if (selectedCategory !== 'all') {
      return [{ category: selectedCategory, articles: filteredArticles }];
    }

    const groups: Array<{ category: HelpCategory; articles: HelpArticle[] }> = [];
    const categoryMap = new Map<HelpCategory, HelpArticle[]>();

    for (const article of filteredArticles) {
      const existing = categoryMap.get(article.category);
      if (existing) {
        existing.push(article);
      } else {
        categoryMap.set(article.category, [article]);
      }
    }

    for (const [category, articles] of categoryMap) {
      groups.push({ category, articles });
    }

    return groups;
  }, [filteredArticles, selectedCategory]);

  const getCategoryLabel = (id: HelpCategory): string => {
    return CATEGORIES.find((c) => c.id === id)?.label ?? id;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--bb-ink-100)] sm:text-3xl">
          Central de Ajuda
        </h1>
        <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
          Encontre respostas para suas duvidas sobre a plataforma BlackBelt
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--bb-ink-40)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por topico..."
          className="w-full rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] py-3 pl-10 pr-4 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)]"
        />
      </div>

      {/* Categories */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const articleCount = HELP_ARTICLES.filter((a) => a.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className="flex flex-col items-center rounded-[var(--bb-radius-lg)] border p-4 text-center transition-all duration-200"
              style={{
                borderColor: isSelected ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                backgroundColor: isSelected ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isSelected ? 'var(--bb-brand)' : 'var(--bb-ink-40)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={cat.icon} />
              </svg>
              <span
                className="mt-2 text-xs font-semibold"
                style={{ color: isSelected ? 'var(--bb-brand)' : 'var(--bb-ink-80)' }}
              >
                {cat.label}
              </span>
              <span className="text-[10px] text-[var(--bb-ink-40)]">
                {articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Articles */}
      {filteredArticles.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--bb-ink-20)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-sm font-medium text-[var(--bb-ink-60)]">
            Nenhum artigo encontrado
          </p>
          <p className="mt-1 text-xs text-[var(--bb-ink-40)]">
            Tente buscar com outros termos ou selecione outra categoria
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedArticles.map((group) => (
            <div key={group.category}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--bb-ink-40)]">
                {getCategoryLabel(group.category)}
              </h2>
              <Card className="overflow-hidden p-0">
                {group.articles.map((article) => (
                  <AccordionItem
                    key={article.id}
                    article={article}
                    isOpen={openArticle === article.id}
                    onToggle={() =>
                      setOpenArticle(openArticle === article.id ? null : article.id)
                    }
                  />
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* AI Assistant Placeholder */}
      <Card className="mt-8 p-6 text-center" variant="outlined">
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'var(--bb-brand-surface)' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--bb-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-5H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            <path d="M10 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            <path d="M14 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-[var(--bb-ink-100)]">
          Assistente IA
        </h3>
        <p className="mt-1 text-xs text-[var(--bb-ink-60)]">
          Em breve: tire suas duvidas com nosso assistente inteligente
        </p>
        <div
          className="mx-auto mt-3 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            background: 'var(--bb-brand-surface)',
            color: 'var(--bb-brand)',
          }}
        >
          Em breve
        </div>
      </Card>
    </div>
  );
}

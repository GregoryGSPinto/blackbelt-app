'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupportEmail } from '@/lib/config/legal';

const SECTIONS = [
  { id: 'aceitacao', label: '1. Aceitacao dos Termos' },
  { id: 'servico', label: '2. Descricao do Servico' },
  { id: 'cadastro', label: '3. Cadastro e Conta' },
  { id: 'planos', label: '4. Planos e Pagamento' },
  { id: 'uso-aceitavel', label: '5. Uso Aceitavel' },
  { id: 'propriedade', label: '6. Propriedade Intelectual' },
  { id: 'dados-privacidade', label: '7. Dados e Privacidade' },
  { id: 'menores', label: '8. Menores de Idade' },
  { id: 'disponibilidade', label: '9. Disponibilidade do Servico' },
  { id: 'rescisao', label: '10. Rescisao' },
  { id: 'responsabilidade', label: '11. Limitacao de Responsabilidade' },
  { id: 'foro', label: '12. Foro' },
  { id: 'planos-assinatura', label: '13. Planos e Assinatura' },
  { id: 'processamento-pagamentos', label: '14. Processamento de Pagamentos' },
  { id: 'cobranca-alunos', label: '15. Cobranca de Alunos' },
  { id: 'reembolso', label: '16. Politica de Reembolso' },
];

export default function TermosPage() {
  const supportEmail = getSupportEmail();
  const [activeSection, setActiveSection] = useState('aceitacao');
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0.1,
    });

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTocOpen(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bb-depth-1, #0a0a0a)' }}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: 'var(--bb-ink-100, #fff)' }}
          >
            Termos de Uso
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--bb-ink-60, #999)' }}
          >
            Ultima atualizacao: Marco de 2026
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar TOC */}
          <nav
            className="hidden w-56 shrink-0 lg:block"
            aria-label="Indice dos termos de uso"
          >
            <div className="sticky top-8">
              <h2
                className="mb-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--bb-ink-60, #999)' }}
              >
                Indice
              </h2>
              <ul className="space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToSection(s.id)}
                      className="w-full px-2 py-1.5 text-left text-xs transition-colors"
                      style={{
                        color:
                          activeSection === s.id
                            ? 'var(--bb-brand, #ef4444)'
                            : 'var(--bb-ink-60, #999)',
                        fontWeight: activeSection === s.id ? '600' : '400',
                        borderRadius: 'var(--bb-radius-lg, 12px)',
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Mobile TOC toggle */}
          <div className="fixed bottom-4 right-4 z-30 lg:hidden">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: 'var(--bb-brand, #ef4444)' }}
              aria-label="Abrir indice"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>

          {/* Mobile TOC drawer */}
          {tocOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setTocOpen(false)}
              />
              <nav
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl p-4 lg:hidden"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  borderTop:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                }}
                aria-label="Indice dos termos de uso"
              >
                <div
                  className="mx-auto mb-3 h-1 w-8 rounded-full"
                  style={{
                    background: 'var(--bb-ink-60, #999)',
                  }}
                />
                <ul className="space-y-1">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollToSection(s.id)}
                        className="w-full px-3 py-2 text-left text-sm transition-colors"
                        style={{
                          color:
                            activeSection === s.id
                              ? 'var(--bb-brand, #ef4444)'
                              : 'var(--bb-ink-60, #999)',
                          fontWeight: activeSection === s.id ? '600' : '400',
                          borderRadius: 'var(--bb-radius-lg, 12px)',
                        }}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}

          {/* Content */}
          <article className="min-w-0 flex-1 space-y-6">
            {/* Section 1 — Aceitacao dos Termos */}
            <section id="aceitacao" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  1. Aceitacao dos Termos
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Ao acessar, navegar ou utilizar a plataforma BlackBelt (&quot;Plataforma&quot;), disponibilizada por Gregory Guimaraes Pinto, com sede em Vespasiano - MG, Brasil (&quot;BlackBelt&quot; ou &quot;Nos&quot;), voce (&quot;Usuario&quot;) declara que leu, entendeu e concorda integralmente com estes Termos de Uso (&quot;Termos&quot;).
                  </p>
                  <p>
                    Caso nao concorde com qualquer disposicao destes Termos, voce devera cessar imediatamente o uso da Plataforma. O uso continuado da Plataforma apos alteracoes nos Termos implica aceitacao das novas condicoes.
                  </p>
                  <p>
                    Estes Termos constituem um contrato vinculante entre voce e a BlackBelt, regido pela legislacao brasileira, em especial pelo Codigo Civil (Lei n. 10.406/2002), pelo Marco Civil da Internet (Lei n. 12.965/2014), pela Lei Geral de Protecao de Dados (Lei n. 13.709/2018) e pelo Codigo de Defesa do Consumidor (Lei n. 8.078/1990), quando aplicavel.
                  </p>
                  <p>
                    Para os fins destes Termos, consideram-se: &quot;Plataforma&quot; — o software SaaS BlackBelt, acessivel via web e aplicativos moveis; &quot;Academia&quot; — a entidade que contrata a Plataforma; &quot;Administrador&quot; — o usuario designado pela Academia para gerenciar a conta; &quot;Professor&quot; — usuario com perfil de docente; &quot;Aluno&quot; — usuario matriculado; &quot;Responsavel&quot; — representante legal de um aluno menor de idade.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 — Descricao do Servico */}
            <section id="servico" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  2. Descricao do Servico
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    A BlackBelt e uma plataforma SaaS (Software as a Service) de gestao inteligente para academias de artes marciais, oferecendo as seguintes funcionalidades principais:
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>Gestao de turmas, modalidades, horarios e matriculas com suporte a multiplas unidades.</li>
                    <li>Controle de presenca via QR Code, NFC, biometria ou registro manual, com historico completo.</li>
                    <li>Sistema de graduacao e progressao de faixas com criterios configurados pela Academia.</li>
                    <li>Avaliacao pedagogica de alunos por multiplos criterios tecnicos, com rubrica padronizada.</li>
                    <li>Gestao financeira completa: planos modulares, assinaturas, faturas, cobrancas automatizadas via Asaas e Stripe.</li>
                    <li>Comunicacao interna entre professores, alunos e responsaveis via mensagens e notificacoes.</li>
                    <li>Streaming de aulas ao vivo e biblioteca de conteudo sob demanda.</li>
                    <li>Relatorios analiticos e dashboards de desempenho com inteligencia artificial.</li>
                    <li>Aplicativos moveis nativos (iOS e Android) via Capacitor, com suporte a modo offline.</li>
                    <li>Sistema gamificado para perfis Teen e Kids com XP, conquistas e rankings.</li>
                    <li>Gestao de campeonatos com chaves automaticas, resultados e classificacoes.</li>
                    <li>Marketplace integrado para venda de produtos e equipamentos.</li>
                  </ul>
                  <p>
                    A disponibilidade de funcionalidades pode variar conforme o plano contratado pela Academia. A BlackBelt reserva-se o direito de adicionar, modificar ou descontinuar funcionalidades, com comunicacao previa de 30 (trinta) dias para alteracoes significativas que impactem o uso corrente.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 — Cadastro e Conta */}
            <section id="cadastro" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  3. Cadastro e Conta
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    3.1. Para utilizar a Plataforma, o Usuario devera criar uma conta fornecendo informacoes verdadeiras, completas e atualizadas. O cadastro pode ocorrer por convite da Academia ou por autoregistro, conforme configuracao da Academia.
                  </p>
                  <p>
                    3.2. O Usuario e integralmente responsavel pela seguranca e confidencialidade de suas credenciais de acesso (email e senha). A BlackBelt utiliza criptografia bcrypt com salt individual para armazenamento de senhas e tokens JWT em memoria para autenticacao — nenhum token e armazenado em localStorage ou sessionStorage.
                  </p>
                  <p>
                    3.3. O Usuario deve notificar imediatamente a BlackBelt em caso de uso nao autorizado da sua conta ou qualquer violacao de seguranca, pelo email {supportEmail}.
                  </p>
                  <p>
                    3.4. A BlackBelt reserva-se o direito de suspender ou encerrar contas que violem estes Termos, que apresentem comportamento fraudulento ou que permanecam inativas por periodo superior a 12 (doze) meses, sem prejuizo de outras medidas cabiveis.
                  </p>
                  <p>
                    3.5. Um mesmo Usuario pode possuir multiplos perfis vinculados a diferentes Academias na Plataforma, cada um com permissoes e dados isolados.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 — Planos e Pagamento */}
            <section id="planos" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  4. Planos e Pagamento
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    4.1. A BlackBelt oferece diferentes planos de assinatura com funcionalidades e limites distintos, incluindo planos Essential, Professional e Enterprise. Os valores, funcionalidades incluidas e limites de cada plano estao disponiveis na pagina de precos da Plataforma.
                  </p>
                  <p>
                    4.2. A cobranca e recorrente, conforme o ciclo do plano contratado (mensal, trimestral ou anual). O pagamento pode ser realizado via boleto bancario, PIX ou cartao de credito, processados pelos gateways Asaas e/ou Stripe.
                  </p>
                  <p>
                    4.3. Em caso de inadimplencia superior a 15 (quinze) dias, a BlackBelt podera suspender o acesso a Plataforma ate a regularizacao do pagamento. Os dados da Academia serao mantidos por 90 (noventa) dias apos a suspensao. Apos esse periodo, os dados poderao ser anonimizados ou excluidos.
                  </p>
                  <p>
                    4.4. A BlackBelt atua como intermediadora tecnologica entre a Academia e seus alunos. A relacao comercial entre Academia e Aluno (mensalidades de treino, produtos, eventos) e de exclusiva responsabilidade da Academia contratante.
                  </p>
                  <p>
                    4.5. Reajustes de preco serao comunicados com antecedencia minima de 30 (trinta) dias e aplicados apenas ao proximo ciclo de cobranca. Reajustes anuais seguem o indice IGPM/FGV ou outro indice oficial que o substitua.
                  </p>
                  <p>
                    4.6. A Academia pode solicitar upgrade ou downgrade de plano a qualquer momento. O upgrade e efetivado imediatamente com cobranca proporcional. O downgrade e efetivado ao final do ciclo vigente.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 — Uso Aceitavel */}
            <section id="uso-aceitavel" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  5. Uso Aceitavel
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    5.1. O Usuario compromete-se a utilizar a Plataforma exclusivamente para os fins previstos nestes Termos, em conformidade com a legislacao vigente e os valores do esporte. E expressamente vedado:
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>Utilizar a Plataforma para fins ilicitos, fraudulentos ou que violem direitos de terceiros.</li>
                    <li>Tentar acessar, obter ou modificar dados de outros Usuarios ou Academias sem autorizacao explicita.</li>
                    <li>Realizar engenharia reversa, descompilar, desmontar ou tentar extrair o codigo-fonte da Plataforma.</li>
                    <li>Utilizar bots, scrapers, crawlers ou qualquer mecanismo automatizado para acessar a Plataforma sem autorizacao previa por escrito da BlackBelt.</li>
                    <li>Distribuir virus, malware, trojans ou qualquer codigo malicioso atraves da Plataforma.</li>
                    <li>Sobrecarregar intencionalmente os servidores ou infraestrutura da Plataforma (ataques DDoS, flood, etc.).</li>
                    <li>Revender, sublicenciar, ceder ou redistribuir o acesso a Plataforma a terceiros nao autorizados.</li>
                    <li>Publicar conteudo ofensivo, difamatorio, discriminatorio, que incite violencia ou que viole a dignidade humana.</li>
                    <li>Compartilhar credenciais de acesso com terceiros ou utilizar credenciais de outros usuarios.</li>
                    <li>Utilizar a Plataforma de forma que prejudique o funcionamento do servico para outros usuarios.</li>
                  </ul>
                  <p>
                    5.2. A BlackBelt podera limitar, suspender ou encerrar o acesso de qualquer Usuario que viole estas disposicoes, sem aviso previo e sem prejuizo de outras medidas legais cabiveis, incluindo responsabilizacao civil e criminal.
                  </p>
                  <p>
                    5.3. O Usuario que identificar vulnerabilidades de seguranca na Plataforma devera reporta-las imediatamente para {supportEmail}, comprometendo-se a nao explora-las.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 — Propriedade Intelectual */}
            <section id="propriedade" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  6. Propriedade Intelectual
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    6.1. Todo o conteudo, marca, logotipo, design, codigo-fonte, algoritmos, modelos de dados, interfaces, textos, graficos, icones e demais elementos da Plataforma sao de propriedade exclusiva da Gregory Guimaraes Pinto ou de seus licenciadores, protegidos pela Lei de Direitos Autorais (Lei n. 9.610/1998), pela Lei de Propriedade Industrial (Lei n. 9.279/1996) e por tratados internacionais de propriedade intelectual.
                  </p>
                  <p>
                    6.2. A utilizacao da Plataforma nao confere ao Usuario qualquer direito de propriedade intelectual sobre a Plataforma ou seus componentes. O Usuario recebe apenas uma licenca limitada, nao exclusiva, intransferivel e revogavel para uso da Plataforma conforme o plano contratado.
                  </p>
                  <p>
                    6.3. Os dados e conteudos inseridos pelos Usuarios na Plataforma (informacoes de alunos, avaliacoes, videos, etc.) permanecem de propriedade dos respectivos Usuarios ou Academias. A BlackBelt nao reivindica propriedade sobre tais conteudos, recebendo apenas uma licenca limitada para armazena-los, processa-los e exibi-los estritamente para a prestacao do servico.
                  </p>
                  <p>
                    6.4. E expressamente proibida a reproducao, distribuicao, modificacao, criacao de obras derivadas, engenharia reversa ou qualquer uso nao autorizado dos elementos da Plataforma, sob pena de responsabilizacao civil e criminal.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 — Dados e Privacidade */}
            <section id="dados-privacidade" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  7. Dados e Privacidade
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    7.1. O tratamento de dados pessoais realizado pela BlackBelt e regido pela nossa{' '}
                    <a
                      href="/privacidade"
                      className="underline"
                      style={{ color: 'var(--bb-brand, #ef4444)' }}
                    >
                      Politica de Privacidade
                    </a>
                    , que constitui parte integrante destes Termos e deve ser lida em conjunto com este documento.
                  </p>
                  <p>
                    7.2. A BlackBelt atua como Operadora de dados pessoais (nos termos da LGPD, Art. 5, VII) em relacao aos dados dos alunos, professores e responsaveis vinculados a Academia, sendo a Academia a Controladora dos dados (Art. 5, VI). A BlackBelt e Controladora apenas dos dados da propria conta da Academia (dados cadastrais, financeiros e de uso da Plataforma).
                  </p>
                  <p>
                    7.3. A Academia, como Controladora, e responsavel por obter consentimento adequado dos seus alunos e responsaveis para o tratamento de dados pessoais na Plataforma, conforme exigido pela LGPD.
                  </p>
                  <p>
                    7.4. A BlackBelt implementa medidas tecnicas e organizacionais adequadas para proteger os dados pessoais contra acesso nao autorizado, perda, destruicao ou alteracao, incluindo: criptografia em transito (TLS 1.3) e em repouso (AES-256), autenticacao segura com JWT, controle de acesso RBAC com 8 perfis, isolamento multi-tenant e Row Level Security (RLS) no banco de dados.
                  </p>
                  <p>
                    7.5. O Usuario pode exercer seus direitos como titular de dados (acesso, correcao, exclusao, portabilidade, etc.) conforme descrito na Politica de Privacidade.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 — Menores de Idade */}
            <section id="menores" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  8. Menores de Idade
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    8.1. A Plataforma possui perfis especificos para criancas (Kids, ate 12 anos) e adolescentes (Teen, 13 a 17 anos), projetados com funcionalidades adequadas a cada faixa etaria, em conformidade com o Estatuto da Crianca e do Adolescente (Lei n. 8.069/1990) e o Art. 14 da LGPD.
                  </p>
                  <p>
                    8.2. O cadastro de qualquer menor de 18 anos na Plataforma deve ser realizado exclusivamente pelo Responsavel legal, que devera fornecer consentimento expresso e especifico para a coleta e tratamento dos dados do menor.
                  </p>
                  <p>
                    8.3. O Responsavel legal assume integral responsabilidade pelas atividades do menor na Plataforma e tem acesso completo a todos os dados, historicos e interacoes do menor.
                  </p>
                  <p>
                    8.4. Os perfis Kids possuem interface simplificada e ludica, sem acesso a funcionalidades financeiras, de comunicacao direta ou conteudos nao adequados a faixa etaria. Os perfis Teen possuem funcionalidades intermediarias com supervisao do Responsavel.
                  </p>
                  <p>
                    8.5. O Responsavel pode revogar o consentimento e solicitar a exclusao dos dados do menor a qualquer momento, atraves das configuracoes da conta ou por email para {supportEmail}. A exclusao sera efetivada no prazo de 15 (quinze) dias.
                  </p>
                  <p>
                    8.6. A BlackBelt nao utiliza dados de menores para fins de marketing, publicidade, perfilamento comportamental ou qualquer finalidade alem da prestacao do servico educacional/esportivo contratado.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 — Disponibilidade do Servico */}
            <section id="disponibilidade" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  9. Disponibilidade do Servico
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    9.1. A BlackBelt empenhara seus melhores esforcos para manter a Plataforma disponivel 24 horas por dia, 7 dias por semana, com meta de disponibilidade (SLA) de 99,5% ao mes, excluindo periodos de manutencao programada.
                  </p>
                  <p>
                    9.2. Manutencoes programadas serao realizadas preferencialmente em horarios de menor utilizacao (entre 02:00 e 06:00, horario de Brasilia) e comunicadas com antecedencia minima de 48 horas por email e/ou notificacao na Plataforma.
                  </p>
                  <p>
                    9.3. A Plataforma oferece funcionalidades de modo offline (dados salvos localmente no dispositivo), permitindo consulta basica de informacoes mesmo sem conexao com a internet. Os dados serao sincronizados automaticamente quando a conexao for restabelecida.
                  </p>
                  <p>
                    9.4. A BlackBelt nao sera responsabilizada por indisponibilidades causadas por: forca maior ou caso fortuito; falhas de provedores de infraestrutura de terceiros (Supabase, Vercel, AWS); falhas na conexao de internet do Usuario; ataques ciberneticos (DDoS, ransomware, etc.); determinacoes governamentais ou judiciais.
                  </p>
                  <p>
                    9.5. O status operacional da Plataforma pode ser consultado em tempo real na pagina{' '}
                    <a
                      href="/status"
                      className="underline"
                      style={{ color: 'var(--bb-brand, #ef4444)' }}
                    >
                      blackbeltv2.vercel.app/status
                    </a>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 — Rescisao */}
            <section id="rescisao" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  10. Rescisao
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    10.1. A Academia pode cancelar sua assinatura a qualquer momento pelo painel administrativo (Configuracoes {'>'} Plano {'>'} Cancelar). O cancelamento sera efetivado ao final do ciclo de cobranca vigente, sem reembolso proporcional do periodo ja pago.
                  </p>
                  <p>
                    10.2. Apos o cancelamento, os dados da Academia serao mantidos por 90 (noventa) dias para eventual reativacao. Durante esse periodo, o acesso a Plataforma sera restrito a consulta e exportacao de dados. Apos os 90 dias, os dados serao anonimizados ou permanentemente excluidos, exceto quando houver obrigacao legal de retencao.
                  </p>
                  <p>
                    10.3. A BlackBelt podera rescindir a conta imediatamente, sem aviso previo, em caso de: violacao grave destes Termos; uso fraudulento da Plataforma; inadimplencia superior a 90 (noventa) dias; determinacao judicial ou administrativa; ou ameaca a seguranca da Plataforma ou de outros usuarios.
                  </p>
                  <p>
                    10.4. Em caso de rescisao, a Academia podera solicitar a exportacao dos seus dados em formato padrao (CSV e/ou JSON) antes do encerramento definitivo, pelo prazo de 30 (trinta) dias apos a notificacao de rescisao.
                  </p>
                  <p>
                    10.5. A rescisao nao exime a Academia do pagamento de valores devidos referentes ao periodo de utilizacao anterior ao cancelamento.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11 — Limitacao de Responsabilidade */}
            <section id="responsabilidade" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  11. Limitacao de Responsabilidade
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    11.1. A BlackBelt nao se responsabiliza por danos indiretos, incidentais, especiais, consequentes ou punitivos decorrentes do uso ou impossibilidade de uso da Plataforma, incluindo, mas nao se limitando a: perda de lucros, perda de dados, interrupcao de negocios ou perda de oportunidades comerciais.
                  </p>
                  <p>
                    11.2. A responsabilidade total e agregada da BlackBelt por quaisquer reclamacoes decorrentes destes Termos ou do uso da Plataforma sera limitada ao valor total efetivamente pago pelo Usuario nos 12 (doze) meses imediatamente anteriores ao evento que deu origem a reclamacao.
                  </p>
                  <p>
                    11.3. A BlackBelt nao se responsabiliza por:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Conteudo gerado, publicado ou compartilhado por Usuarios na Plataforma.</li>
                    <li>Relacoes comerciais, contratuais ou de qualquer natureza entre Academias e seus Alunos.</li>
                    <li>Decisoes pedagogicas, administrativas ou financeiras tomadas pela Academia com base em informacoes ou relatorios da Plataforma.</li>
                    <li>Perdas decorrentes de acesso nao autorizado por falha do Usuario em manter suas credenciais seguras.</li>
                    <li>Danos causados por virus, malware ou outros elementos nocivos que possam afetar o equipamento do Usuario.</li>
                    <li>Indisponibilidade de servicos de terceiros integrados a Plataforma (gateways de pagamento, provedores de email, etc.).</li>
                  </ul>
                  <p>
                    11.4. Nenhuma disposicao destes Termos exclui ou limita a responsabilidade da BlackBelt em casos onde a exclusao ou limitacao nao e permitida pela legislacao brasileira aplicavel, incluindo o Codigo de Defesa do Consumidor.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12 — Foro */}
            <section id="foro" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  12. Foro
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    12.1. Estes Termos sao regidos exclusivamente pela legislacao da Republica Federativa do Brasil, incluindo, mas nao se limitando a: Codigo Civil (Lei n. 10.406/2002), Marco Civil da Internet (Lei n. 12.965/2014), Lei Geral de Protecao de Dados (Lei n. 13.709/2018), Codigo de Defesa do Consumidor (Lei n. 8.078/1990) quando aplicavel, e Estatuto da Crianca e do Adolescente (Lei n. 8.069/1990) para funcionalidades envolvendo menores.
                  </p>
                  <p>
                    12.2. Fica eleito o foro da Comarca de Vespasiano, Estado de Minas Gerais, para dirimir quaisquer controversias decorrentes destes Termos, renunciando as partes a qualquer outro, por mais privilegiado que seja. Esta clausula nao prejudica o direito do consumidor de ajuizar acao no foro do seu domicilio, conforme Art. 101, I do Codigo de Defesa do Consumidor.
                  </p>
                  <p>
                    12.3. A BlackBelt incentiva a resolucao amigavel de disputas. Antes de iniciar qualquer procedimento judicial, as partes deverao tentar resolver a questao por meio de negociacao direta, pelo prazo minimo de 30 (trinta) dias, contados da notificacao por escrito da parte reclamante.
                  </p>
                  <p className="mt-4">
                    <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Contato:</strong>
                  </p>
                  <ul className="list-none space-y-1 pl-0">
                    <li><strong>Responsavel:</strong> Gregory Guimaraes Pinto</li>
                    <li><strong>Email:</strong> {supportEmail}</li>
                    <li><strong>WhatsApp:</strong> +55 (31) 99679-3625</li>
                    <li><strong>Sede:</strong> Vespasiano - MG, Brasil</li>
                    <li><strong>Site:</strong> https://blackbeltv2.vercel.app</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 13 — Planos e Assinatura */}
            <section id="planos-assinatura" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  13. Planos e Assinatura
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    13.1. O BlackBelt oferece planos de assinatura mensal para academias de artes marciais. Os planos disponiveis, seus valores e funcionalidades estao detalhados na pagina de cadastro e podem ser atualizados a qualquer momento mediante aviso previo de 30 dias.
                  </p>
                  <p>
                    13.2. Todo novo cadastro recebe um periodo de teste gratuito de 7 (sete) dias corridos, com acesso completo a todas as funcionalidades da plataforma.
                  </p>
                  <p>
                    13.3. Ao final do periodo de teste, a cobranca da assinatura sera gerada automaticamente no metodo de pagamento escolhido durante o cadastro (PIX, boleto bancario ou cartao de credito).
                  </p>
                  <p>
                    13.4. O ciclo de cobranca e mensal, contado a partir da data de vencimento do periodo de teste.
                  </p>
                  <p>
                    13.5. O nao pagamento da assinatura por mais de 15 (quinze) dias apos o vencimento podera resultar na suspensao temporaria do acesso a plataforma. Os dados da academia serao mantidos por 90 (noventa) dias apos a suspensao.
                  </p>
                  <p>
                    13.6. O cancelamento da assinatura pode ser solicitado a qualquer momento, sem multa ou taxa de cancelamento. O acesso permanece ativo ate o fim do periodo ja pago.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14 — Processamento de Pagamentos */}
            <section id="processamento-pagamentos" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  14. Processamento de Pagamentos
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    14.1. Os pagamentos da assinatura do BlackBelt sao processados pela empresa Asaas Gestao Financeira S.A. (CNPJ 19.540.550/0001-21), instituicao de pagamento autorizada pelo Banco Central do Brasil sob o codigo 461.
                  </p>
                  <p>
                    14.2. O BlackBelt nao armazena dados de cartao de credito. Todas as informacoes financeiras sao processadas diretamente pelo Asaas, em conformidade com os padroes de seguranca PCI-DSS.
                  </p>
                  <p>
                    14.3. Os metodos de pagamento aceitos sao: PIX, boleto bancario e cartao de credito (Visa, Mastercard, Elo, American Express, Discover e Hipercard).
                  </p>
                  <p>
                    14.4. Pagamentos via PIX sao confirmados instantaneamente. Boletos bancarios tem prazo de compensacao de ate 1 (um) dia util apos o pagamento. Pagamentos via cartao de credito sao processados conforme prazos da operadora.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 15 — Cobranca de Alunos */}
            <section id="cobranca-alunos" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  15. Cobranca de Alunos (Funcionalidade da Plataforma)
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    15.1. O BlackBelt oferece uma funcionalidade que permite a academia gerar cobrancas para seus alunos diretamente pela plataforma (mensalidades, matriculas e outros servicos).
                  </p>
                  <p>
                    15.2. Para utilizar essa funcionalidade, o responsavel pela academia deve configurar seus dados bancarios dentro da plataforma (menu Configuracoes {'>'} Dados Bancarios).
                  </p>
                  <p>
                    15.3. Ao configurar os dados bancarios, sera criada automaticamente uma subconta de pagamento vinculada a academia, processada pelo Asaas. Esta subconta e de titularidade do responsavel pela academia.
                  </p>
                  <p>
                    15.4. As cobrancas geradas pela academia para seus alunos sao processadas pela subconta da academia no Asaas. O valor recebido e depositado diretamente na conta bancaria informada pelo responsavel da academia.
                  </p>
                  <p>
                    15.5. O BlackBelt NAO intermedia, retem ou tem acesso aos valores recebidos pela academia de seus alunos. A relacao financeira entre a academia e seus alunos e de responsabilidade exclusiva da academia.
                  </p>
                  <p>
                    15.6. As taxas cobradas pelo Asaas sobre as transacoes da subconta da academia sao de responsabilidade da academia. As taxas vigentes incluem:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>PIX: R$ 0,99 por cobranca recebida (primeiros 3 meses), R$ 1,99 apos</li>
                    <li>Boleto: R$ 0,99 por boleto compensado (primeiros 3 meses), R$ 1,99 apos</li>
                    <li>Cartao de credito: 1,99% + R$ 0,49 (primeiros 3 meses), 2,99% + R$ 0,49 apos</li>
                  </ul>
                  <p>
                    15.7. O BlackBelt nao cobra taxa adicional sobre as transacoes realizadas pela academia com seus alunos. As unicas taxas aplicaveis sao as do processador de pagamento (Asaas).
                  </p>
                  <p>
                    15.8. O BlackBelt nao se responsabiliza por eventuais disputas, chargebacks, estornos ou inadimplencia entre a academia e seus alunos.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 16 — Politica de Reembolso */}
            <section id="reembolso" data-section className="scroll-mt-20">
              <div
                className="overflow-hidden p-6"
                style={{
                  background: 'var(--bb-depth-3, #1e1e2e)',
                  border:
                    '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                  borderRadius: 'var(--bb-radius-lg, 12px)',
                }}
              >
                <h2
                  className="mb-4 text-lg font-semibold"
                  style={{ color: 'var(--bb-ink-100, #fff)' }}
                >
                  16. Politica de Reembolso
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    16.1. Em caso de cobranca indevida da assinatura do BlackBelt, o valor sera estornado integralmente em ate 7 (sete) dias uteis apos a solicitacao.
                  </p>
                  <p>
                    16.2. Nao ha reembolso proporcional para cancelamentos realizados no meio do ciclo de cobranca. O acesso permanece ativo ate o fim do periodo pago.
                  </p>
                  <p>
                    16.3. O periodo de teste gratuito nao gera direito a reembolso, pois nao ha cobranca durante este periodo.
                  </p>
                  <p>
                    16.4. Reembolsos de cobrancas realizadas pela academia a seus alunos devem ser tratados diretamente entre a academia e o aluno, atraves da subconta Asaas da academia.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer note */}
            <div
              className="pt-6"
              style={{
                borderTop:
                  '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
              }}
            >
              <p
                className="text-xs"
                style={{ color: 'var(--bb-ink-60, #999)' }}
              >
                Documento mantido por Gregory Guimaraes Pinto. A versao mais atualizada deste documento pode ser encontrada em blackbeltv2.vercel.app/termos.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

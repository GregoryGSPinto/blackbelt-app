'use client';

import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'quem-somos', label: '1. Quem Somos' },
  { id: 'dados-coletados', label: '2. Dados que Coletamos' },
  { id: 'como-usamos', label: '3. Como Usamos Seus Dados' },
  { id: 'menores', label: '4. Dados de Menores (KIDS)' },
  { id: 'compartilhamento', label: '5. Compartilhamento' },
  { id: 'armazenamento', label: '6. Armazenamento e Seguranca' },
  { id: 'direitos', label: '7. Seus Direitos (LGPD)' },
  { id: 'retencao', label: '8. Retencao' },
  { id: 'cookies', label: '9. Cookies' },
  { id: 'alteracoes', label: '10. Alteracoes' },
];

export default function PrivacidadePage() {
  const [activeSection, setActiveSection] = useState('quem-somos');
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
            Politica de Privacidade
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--bb-ink-60, #999)' }}
          >
            Ultima atualizacao: 18 de marco de 2026
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar TOC */}
          <nav
            className="hidden w-56 shrink-0 lg:block"
            aria-label="Indice da politica de privacidade"
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
                aria-label="Indice da politica de privacidade"
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
            {/* Section 1 — Quem Somos */}
            <section id="quem-somos" data-section className="scroll-mt-20">
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
                  1. Quem Somos
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    A BlackBelt Tecnologia Ltda. (&quot;BlackBelt&quot;, &quot;nos&quot; ou &quot;nosso&quot;), inscrita no CNPJ sob o n. XX.XXX.XXX/0001-XX, com sede em Belo Horizonte/MG, Brasil, e a empresa responsavel pela plataforma BlackBelt — um sistema SaaS (Software as a Service) de gestao inteligente para academias de artes marciais.
                  </p>
                  <p>
                    A BlackBelt esta comprometida com a privacidade e a protecao dos dados pessoais dos seus usuarios, em total conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 — LGPD), o Marco Civil da Internet (Lei n. 12.965/2014) e, quando aplicavel, o Children&apos;s Online Privacy Protection Act (COPPA) dos Estados Unidos.
                  </p>
                  <p>
                    Esta Politica de Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos e protegemos os dados pessoais dos usuarios da plataforma BlackBelt (&quot;Plataforma&quot;), bem como os direitos dos titulares de dados e os mecanismos disponiveis para exerce-los.
                  </p>
                  <p>
                    Ao utilizar a Plataforma, voce declara ter lido e compreendido esta Politica. Recomendamos a leitura integral deste documento em conjunto com nossos{' '}
                    <a
                      href="/termos"
                      className="underline"
                      style={{ color: 'var(--bb-brand, #ef4444)' }}
                    >
                      Termos de Uso
                    </a>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 — Dados que Coletamos */}
            <section id="dados-coletados" data-section className="scroll-mt-20">
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
                  2. Dados que Coletamos
                </h2>
                <div
                  className="space-y-4 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Coletamos diferentes categorias de dados pessoais de acordo com o tipo de usuario e as funcionalidades utilizadas na Plataforma. Abaixo detalhamos cada categoria:
                  </p>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    2.1. Dados de Identificacao Pessoal
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Nome completo e nome social (quando informado)</li>
                    <li>Endereco de email</li>
                    <li>Numero de telefone celular</li>
                    <li>CPF (quando exigido pela Academia para fins de matricula ou cobranca)</li>
                    <li>Data de nascimento (obrigatorio para alunos Teen e Kids, para classificacao etaria)</li>
                    <li>Foto de perfil (opcional, carregada pelo usuario)</li>
                    <li>Endereco residencial (quando necessario para cobranca ou envio de correspondencia)</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    2.2. Dados de Uso da Plataforma
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Registros de presenca (check-ins) com data, hora, metodo utilizado (QR Code, NFC, manual) e localizacao aproximada</li>
                    <li>Avaliacoes pedagogicas, notas de desempenho e progressao de faixa/graduacao</li>
                    <li>Historico de conquistas, medalhas e evolucao no sistema gamificado</li>
                    <li>Mensagens trocadas entre usuarios dentro da Plataforma</li>
                    <li>Conteudos assistidos (videos, aulas ao vivo, materiais didaticos)</li>
                    <li>Preferencias de turma, modalidade e horario</li>
                    <li>Historico de interacoes com notificacoes e alertas</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    2.3. Dados Financeiros
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Informacoes do plano contratado e tipo de assinatura</li>
                    <li>Historico de faturas, pagamentos e inadimplencia</li>
                    <li>Dados de cartao de credito (processados exclusivamente pelos gateways de pagamento Asaas e Stripe — a BlackBelt nao armazena dados completos de cartao)</li>
                    <li>Dados bancarios para estorno ou reembolso, quando aplicavel</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    2.4. Dados Tecnicos e de Navegacao
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Endereco IP, tipo e versao do navegador, sistema operacional e resolucao de tela</li>
                    <li>Dados de geolocalizacao aproximada (apenas para check-in por proximidade, com consentimento previo e explicito)</li>
                    <li>Logs de acesso com registro de data, hora e IP (conforme exigido pelo Marco Civil da Internet — Art. 15)</li>
                    <li>Cookies e identificadores de sessao</li>
                    <li>Dados de desempenho do aplicativo (crashes, tempo de carregamento) para fins de diagnostico</li>
                    <li>Identificadores de dispositivo movel (device ID) quando o app nativo e utilizado</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 — Como Usamos Seus Dados */}
            <section id="como-usamos" data-section className="scroll-mt-20">
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
                  3. Como Usamos Seus Dados
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Os dados pessoais coletados sao utilizados exclusivamente para as seguintes finalidades, cada uma fundamentada em uma base legal prevista na LGPD (Art. 7):
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Prestacao do Servico (Art. 7, V — Execucao de Contrato):</strong> gestao de turmas, matriculas, controle de presenca, avaliacoes pedagogicas, progressao de faixa e graduacao.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Comunicacao (Art. 7, V):</strong> envio de notificacoes push, emails transacionais, lembretes de aula, alertas de vencimento e mensagens internas entre usuarios.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Financeiro (Art. 7, V):</strong> processamento de pagamentos recorrentes, emissao de faturas, gestao de cobrancas e controle de inadimplencia.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Relatorios e Dashboards (Art. 7, IX — Legitimo Interesse):</strong> geracao de estatisticas, indicadores de desempenho e relatorios analiticos para a Academia.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Seguranca (Art. 7, IX):</strong> prevencao de fraudes, deteccao de atividades suspeitas, controle de acesso baseado em perfis (RBAC) e auditoria.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Melhoria do Servico (Art. 7, IX):</strong> analise de padroes de uso para aprimorar funcionalidades, corrigir erros e otimizar a experiencia do usuario.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Conformidade Legal (Art. 7, II — Obrigacao Legal):</strong> retencao de logs de acesso conforme Marco Civil da Internet, armazenamento de dados fiscais conforme legislacao tributaria.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Suporte ao Usuario (Art. 7, V):</strong> atendimento a solicitacoes, resolucao de problemas tecnicos e esclarecimento de duvidas.
                    </li>
                  </ul>
                  <p>
                    A BlackBelt NAO utiliza dados pessoais para fins de marketing direto a terceiros, publicidade comportamental ou venda de dados.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 — Dados de Menores (KIDS) */}
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
                  4. Dados de Menores (KIDS) — Conformidade LGPD/COPPA
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    A Plataforma BlackBelt possui perfis especificos para criancas (Kids, ate 12 anos) e adolescentes (Teen, 13 a 17 anos). O tratamento de dados pessoais de menores e realizado com cuidado redobrado e em estrita conformidade com o Art. 14 da LGPD e, quando aplicavel, o Children&apos;s Online Privacy Protection Act (COPPA).
                  </p>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    4.1. Consentimento Parental Obrigatorio
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>O cadastro de qualquer menor de 18 anos na Plataforma so e permitido mediante o consentimento previo, expresso e especifico de pelo menos um responsavel legal.</li>
                    <li>O consentimento e coletado por meio de um formulario dedicado (Consentimento Parental) que exige a confirmacao ativa do responsavel.</li>
                    <li>O responsavel pode revogar o consentimento a qualquer momento, resultando na desativacao imediata da conta do menor e na exclusao de seus dados pessoais no prazo de 15 dias.</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    4.2. Dados Coletados de Menores
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Coletamos apenas os dados estritamente necessarios para a prestacao do servico: nome, data de nascimento, foto de perfil (opcional) e dados de uso da Plataforma (presencas, avaliacoes, progressao).</li>
                    <li>NAO coletamos dados sensíveis de menores alem do necessario para a funcionalidade pedagogica.</li>
                    <li>NAO utilizamos dados de menores para qualquer finalidade de marketing, publicidade, perfilamento comportamental ou monetizacao.</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    4.3. Supervisao pelo Responsavel
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>O acesso do menor a Plataforma e vinculado ao perfil do responsavel legal, garantindo supervisao adequada.</li>
                    <li>O responsavel tem acesso completo a todos os dados do menor, incluindo historico de presenca, avaliacoes, evolucao e mensagens (quando aplicavel).</li>
                    <li>O responsavel pode solicitar a exclusao, correcao ou portabilidade dos dados do menor a qualquer momento, atraves das configuracoes da conta ou por email para privacidade@blackbelt.com.</li>
                  </ul>

                  <h3
                    className="mt-2 font-semibold"
                    style={{ color: 'var(--bb-ink-100, #fff)' }}
                  >
                    4.4. Medidas Especiais de Protecao
                  </h3>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Os perfis Kids possuem interface simplificada e ludica, sem acesso a funcionalidades financeiras ou de comunicacao direta.</li>
                    <li>Os perfis Teen possuem funcionalidades intermediarias, com comunicacao supervisionada pelo responsavel.</li>
                    <li>Nenhum dado de menor e compartilhado com terceiros para finalidades que nao sejam estritamente necessarias a prestacao do servico.</li>
                    <li>Todos os dados de menores sao armazenados com o mesmo nivel de seguranca dos demais dados, com criptografia em repouso (AES-256) e em transito (TLS 1.3).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 — Compartilhamento */}
            <section id="compartilhamento" data-section className="scroll-mt-20">
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
                  5. Compartilhamento
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Seus dados pessoais podem ser compartilhados nas seguintes situacoes, sempre com base legal adequada:
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Academia contratante:</strong> os dados dos alunos, professores e responsaveis sao acessiveis pela Academia (Controladora dos dados) para fins de gestao e operacao. A Academia e responsavel pelo tratamento adequado desses dados em conformidade com a LGPD.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Gateways de pagamento (Asaas, Stripe):</strong> dados financeiros estritamente necessarios para processamento de transacoes. Esses provedores possuem suas proprias politicas de privacidade e certificacoes PCI-DSS.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Provedores de infraestrutura (Supabase, Vercel):</strong> para hospedagem, armazenamento e operacao da Plataforma. Os dados podem ser armazenados em servidores localizados fora do Brasil, conforme clausulas contratuais que garantem protecao adequada (Art. 33 da LGPD).
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Servicos de comunicacao:</strong> provedores de email transacional e notificacoes push para envio de comunicacoes essenciais ao funcionamento do servico.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Servicos de analytics (PostHog):</strong> dados anonimizados ou pseudonimizados para analise de uso da Plataforma e melhoria do servico. Nenhum dado pessoal identificavel e compartilhado para esta finalidade sem consentimento.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Autoridades publicas:</strong> quando exigido por lei, regulamentacao, determinacao judicial ou requisicao de autoridade competente (incluindo a ANPD — Autoridade Nacional de Protecao de Dados).
                    </li>
                  </ul>
                  <p>
                    <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>A BlackBelt NAO vende, aluga ou comercializa dados pessoais a terceiros para qualquer finalidade.</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 — Armazenamento e Seguranca */}
            <section id="armazenamento" data-section className="scroll-mt-20">
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
                  6. Armazenamento e Seguranca
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    A BlackBelt emprega medidas tecnicas e administrativas robustas para proteger os dados pessoais contra acesso nao autorizado, perda, destruicao, alteracao ou divulgacao indevida, em conformidade com o Art. 46 da LGPD:
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Criptografia:</strong> todos os dados em transito sao protegidos por TLS 1.3. Dados em repouso sao criptografados com AES-256 no banco de dados (Supabase/PostgreSQL).
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Autenticacao segura:</strong> tokens JWT armazenados exclusivamente em memoria (nunca em localStorage ou sessionStorage). Senhas processadas com bcrypt + salt individual.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Controle de acesso (RBAC):</strong> sistema de controle de acesso baseado em 8 perfis distintos (Admin, Professor, Adulto, Teen, Kids, Responsavel, Franqueador, Rede), com isolamento completo entre academias (multi-tenant).
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Row Level Security (RLS):</strong> politicas de seguranca implementadas diretamente no banco de dados PostgreSQL, garantindo que cada usuario acesse apenas os dados autorizados para seu perfil e academia.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Monitoramento e auditoria:</strong> logs de auditoria para todas as operacoes criticas, deteccao de anomalias em tempo real e alertas automaticos de seguranca.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Backups:</strong> backups automaticos diarios com retencao de 30 dias, criptografados e armazenados em infraestrutura geograficamente separada.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Testes de seguranca:</strong> analises de vulnerabilidade periodicas, revisoes de codigo e auditorias de seguranca independentes.
                    </li>
                  </ul>
                  <p>
                    Em caso de incidente de seguranca que possa acarretar risco ou dano relevante aos titulares, a BlackBelt notificara a ANPD e os titulares afetados em prazo razoavel, conforme Art. 48 da LGPD, informando a natureza dos dados afetados, os riscos envolvidos e as medidas adotadas.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 — Seus Direitos (LGPD) */}
            <section id="direitos" data-section className="scroll-mt-20">
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
                  7. Seus Direitos (LGPD Art. 18)
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Como titular dos dados pessoais, voce possui os seguintes direitos garantidos pela LGPD, que podem ser exercidos a qualquer momento, de forma gratuita:
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Confirmacao e acesso (Art. 18, I e II):</strong> confirmar a existencia de tratamento e acessar os dados pessoais que tratamos sobre voce.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Correcao (Art. 18, III):</strong> solicitar a correcao de dados incompletos, inexatos ou desatualizados.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Anonimizacao, bloqueio ou eliminacao (Art. 18, IV):</strong> solicitar anonimizacao, bloqueio ou eliminacao de dados desnecessarios, excessivos ou tratados em desconformidade com a LGPD.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Portabilidade (Art. 18, V):</strong> solicitar a portabilidade dos seus dados a outro fornecedor de servico, mediante requisicao expressa, em formato interoperavel (CSV/JSON).
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Eliminacao com consentimento (Art. 18, VI):</strong> solicitar a eliminacao dos dados pessoais tratados com base no consentimento, exceto quando houver obrigacao legal de retencao.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Informacao sobre compartilhamento (Art. 18, VII):</strong> ser informado sobre as entidades publicas e privadas com as quais seus dados sao compartilhados.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Revogacao do consentimento (Art. 18, IX):</strong> revogar o consentimento a qualquer momento, de forma gratuita e facilitada, sem prejuizo da legalidade do tratamento realizado anteriormente.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Oposicao (Art. 18, par. 2):</strong> opor-se ao tratamento realizado com base em hipotese de dispensa de consentimento, caso considere irregular.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Revisao de decisoes automatizadas (Art. 20):</strong> solicitar revisao de decisoes tomadas unicamente com base em tratamento automatizado de dados pessoais.
                    </li>
                  </ul>
                  <p className="mt-4">
                    <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Como exercer seus direitos:</strong>
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Pela propria Plataforma: acesse Configuracoes {'>'} Privacidade {'>'} Meus Dados.</li>
                    <li>Por email: envie sua solicitacao para <strong>privacidade@blackbelt.com</strong>, identificando-se como titular dos dados.</li>
                  </ul>
                  <p>
                    As solicitacoes serao respondidas no prazo de 15 (quinze) dias uteis, conforme Art. 18, par. 5 da LGPD. Caso nao esteja satisfeito com a resposta, voce pode apresentar reclamacao perante a Autoridade Nacional de Protecao de Dados (ANPD).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 — Retencao */}
            <section id="retencao" data-section className="scroll-mt-20">
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
                  8. Retencao
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Os dados pessoais sao mantidos pelo periodo estritamente necessario para as finalidades para as quais foram coletados, respeitando os seguintes prazos:
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Tipo de Dado
                          </th>
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Periodo de Retencao
                          </th>
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Base Legal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2">Dados de conta ativa</td>
                          <td className="px-3 py-2">Enquanto a conta estiver ativa</td>
                          <td className="px-3 py-2">Execucao de contrato</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2">Dados apos cancelamento</td>
                          <td className="px-3 py-2">90 dias (para reativacao)</td>
                          <td className="px-3 py-2">Legitimo interesse</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2">Logs de acesso</td>
                          <td className="px-3 py-2">6 meses</td>
                          <td className="px-3 py-2">Marco Civil da Internet (Art. 15)</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2">Dados fiscais e financeiros</td>
                          <td className="px-3 py-2">5 anos</td>
                          <td className="px-3 py-2">Legislacao tributaria</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2">Dados de menores (apos revogacao)</td>
                          <td className="px-3 py-2">15 dias</td>
                          <td className="px-3 py-2">LGPD Art. 14</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Dados para defesa em processos</td>
                          <td className="px-3 py-2">Ate prescricao legal</td>
                          <td className="px-3 py-2">Exercicio regular de direitos</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Apos os periodos indicados, os dados serao irreversivelmente anonimizados (para fins estatisticos e de melhoria do servico) ou permanentemente excluidos dos nossos sistemas, conforme Art. 16 da LGPD.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 — Cookies */}
            <section id="cookies" data-section className="scroll-mt-20">
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
                  9. Cookies
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    A Plataforma utiliza cookies e tecnologias similares para garantir o funcionamento adequado do servico, melhorar a experiencia do usuario e coletar dados analiticos. Abaixo detalhamos as categorias de cookies utilizados:
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Categoria
                          </th>
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Finalidade
                          </th>
                          <th
                            className="px-3 py-2 font-semibold"
                            style={{ color: 'var(--bb-ink-100, #fff)' }}
                          >
                            Consentimento
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--bb-ink-100, #fff)' }}>Essenciais</td>
                          <td className="px-3 py-2">Autenticacao, sessao, seguranca CSRF, preferencias de idioma e tema</td>
                          <td className="px-3 py-2">Nao requerido (necessarios ao funcionamento)</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom:
                              '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))',
                          }}
                        >
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--bb-ink-100, #fff)' }}>Analiticos</td>
                          <td className="px-3 py-2">Estatisticas de uso, melhoria da experiencia, metricas de desempenho (PostHog)</td>
                          <td className="px-3 py-2">Requerido (opt-in)</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--bb-ink-100, #fff)' }}>Funcionais</td>
                          <td className="px-3 py-2">Preferencias de layout, estado de tutorial, configuracoes salvas</td>
                          <td className="px-3 py-2">Nao requerido (melhoria da experiencia)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Voce pode gerenciar suas preferencias de cookies a qualquer momento pelo banner de cookies exibido na primeira visita ou pelas configuracoes do seu perfil na Plataforma. A desativacao de cookies essenciais pode comprometer o funcionamento adequado da Plataforma.
                  </p>
                  <p>
                    A BlackBelt NAO utiliza cookies de publicidade, remarketing ou rastreamento de terceiros para fins de marketing.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 — Alteracoes */}
            <section id="alteracoes" data-section className="scroll-mt-20">
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
                  10. Alteracoes
                </h2>
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--bb-ink-60, #999)' }}
                >
                  <p>
                    Esta Politica de Privacidade podera ser atualizada periodicamente para refletir mudancas nas nossas praticas de tratamento de dados, na legislacao aplicavel ou nas funcionalidades da Plataforma.
                  </p>
                  <p>
                    Alteracoes significativas serao comunicadas com antecedencia minima de 30 (trinta) dias, por meio de:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Notificacao por email para o endereco cadastrado do usuario.</li>
                    <li>Notificacao push no aplicativo movel (quando instalado).</li>
                    <li>Banner informativo na Plataforma web.</li>
                  </ul>
                  <p>
                    A versao vigente desta Politica estara sempre disponivel nesta pagina, com a data da ultima atualizacao claramente indicada no topo do documento.
                  </p>
                  <p>
                    O uso continuado da Plataforma apos a entrada em vigor das alteracoes implica concordancia com as novas condicoes. Caso o usuario nao concorde com as alteracoes, devera cessar o uso da Plataforma e solicitar a exclusao dos seus dados.
                  </p>
                  <p className="mt-4">
                    <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Encarregado de Protecao de Dados (DPO):</strong> privacidade@blackbelt.com
                  </p>
                  <p>
                    <strong style={{ color: 'var(--bb-ink-100, #fff)' }}>Suporte:</strong> suporte@blackbelt.com
                  </p>
                  <p>
                    Caso nao esteja satisfeito com a resposta da BlackBelt, voce pode apresentar reclamacao perante a Autoridade Nacional de Protecao de Dados (ANPD) em{' '}
                    <a
                      href="https://www.gov.br/anpd"
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--bb-brand, #ef4444)' }}
                    >
                      www.gov.br/anpd
                    </a>
                    .
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
                Documento mantido pela BlackBelt Tecnologia Ltda. em conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018). A versao mais atualizada pode ser encontrada em blackbelt.com/privacidade.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

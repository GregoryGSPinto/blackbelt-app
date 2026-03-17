'use client';

import { useState, useEffect, useRef } from 'react';

// ── Table of Contents Sections ──────────────────────────────────────

const SECTIONS = [
  { id: 'aceitacao', label: '1. Aceitacao dos Termos' },
  { id: 'definicoes', label: '2. Definicoes' },
  { id: 'servico', label: '3. Descricao do Servico' },
  { id: 'cadastro', label: '4. Cadastro e Conta' },
  { id: 'uso', label: '5. Uso da Plataforma' },
  { id: 'obrigacoes-academia', label: '6. Obrigacoes da Academia' },
  { id: 'obrigacoes-usuario', label: '7. Obrigacoes do Usuario' },
  { id: 'pagamentos', label: '8. Pagamentos e Planos' },
  { id: 'propriedade', label: '9. Propriedade Intelectual' },
  { id: 'conteudo-usuario', label: '10. Conteudo do Usuario' },
  { id: 'privacidade', label: '11. Privacidade e Dados' },
  { id: 'disponibilidade', label: '12. Disponibilidade e SLA' },
  { id: 'responsabilidade', label: '13. Limitacao de Responsabilidade' },
  { id: 'rescisao', label: '14. Rescisao e Cancelamento' },
  { id: 'alteracoes', label: '15. Alteracoes dos Termos' },
  { id: 'legislacao', label: '16. Legislacao Aplicavel' },
  { id: 'foro', label: '17. Foro' },
  { id: 'contato', label: '18. Contato' },
];

// ── Page Component ──────────────────────────────────────────────────

export default function TermosPage() {
  const [activeSection, setActiveSection] = useState('aceitacao');
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll-linked section tracking
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Termos de Uso — BlackBelt',
            description: 'Termos de uso da plataforma BlackBelt para gestao de academias de artes marciais.',
            url: 'https://app.blackbelt.com/termos',
            inLanguage: 'pt-BR',
            dateModified: '2026-03-17',
            publisher: {
              '@type': 'Organization',
              name: 'BlackBelt Tecnologia',
              url: 'https://app.blackbelt.com',
            },
          }),
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--bb-ink-100)] sm:text-3xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
          Ultima atualizacao: 17 de marco de 2026
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Table of Contents (sidebar) */}
        <nav className="hidden w-56 shrink-0 lg:block" aria-label="Indice dos termos de uso">
          <div className="sticky top-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--bb-ink-40)]">
              Indice
            </h2>
            <ul className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollToSection(s.id)}
                    className="w-full rounded-[var(--bb-radius-sm)] px-2 py-1.5 text-left text-xs transition-colors"
                    style={{
                      color: activeSection === s.id ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                      backgroundColor: activeSection === s.id ? 'var(--bb-brand-surface)' : 'transparent',
                      fontWeight: activeSection === s.id ? '600' : '400',
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
            style={{ background: 'var(--bb-brand-gradient)' }}
            aria-label="Abrir indice"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* Mobile TOC drawer */}
        {tocOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setTocOpen(false)} />
            <nav className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] p-4 lg:hidden" aria-label="Indice dos termos de uso">
              <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-[var(--bb-ink-20)]" />
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--bb-ink-40)]">
                Indice
              </h2>
              <ul className="space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToSection(s.id)}
                      className="w-full rounded-[var(--bb-radius-sm)] px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        color: activeSection === s.id ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                        backgroundColor: activeSection === s.id ? 'var(--bb-brand-surface)' : 'transparent',
                        fontWeight: activeSection === s.id ? '600' : '400',
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
        <article className="min-w-0 flex-1 space-y-8">
          {/* Section 1 */}
          <section id="aceitacao" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">1. Aceitacao dos Termos</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Ao acessar, navegar ou utilizar a plataforma BlackBelt (<strong>&quot;Plataforma&quot;</strong>), disponibilizada pela
                BlackBelt Tecnologia Ltda., inscrita no CNPJ sob o n. XX.XXX.XXX/0001-XX, com sede na cidade de
                Sao Paulo/SP (<strong>&quot;BlackBelt&quot;</strong> ou <strong>&quot;Nos&quot;</strong>), voce (<strong>&quot;Usuario&quot;</strong>) declara que leu, entendeu
                e concorda integralmente com estes Termos de Uso (<strong>&quot;Termos&quot;</strong>).
              </p>
              <p>
                Caso nao concorde com qualquer disposicao destes Termos, voce devera cessar imediatamente
                o uso da Plataforma. O uso continuado da Plataforma apos alteracoes nos Termos implica
                aceitacao das novas condicoes.
              </p>
              <p>
                Estes Termos constituem um contrato vinculante entre voce e a BlackBelt, regido pela
                legislacao brasileira, em especial pelo Codigo Civil (Lei n. 10.406/2002), pelo Marco
                Civil da Internet (Lei n. 12.965/2014) e pelo Codigo de Defesa do Consumidor (Lei n. 8.078/1990),
                quando aplicavel.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="definicoes" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">2. Definicoes</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Para os fins destes Termos, consideram-se:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Plataforma:</strong> o software SaaS BlackBelt, acessivel via web e aplicativos moveis, incluindo todas as funcionalidades, APIs e servicos relacionados.</li>
                <li><strong>Academia:</strong> a entidade juridica ou pessoa fisica que contrata a Plataforma para gestao da sua academia de artes marciais.</li>
                <li><strong>Administrador:</strong> o usuario designado pela Academia para gerenciar a conta na Plataforma.</li>
                <li><strong>Professor:</strong> usuario com perfil de docente, responsavel pela conducao de turmas e avaliacao de alunos.</li>
                <li><strong>Aluno:</strong> usuario matriculado em uma ou mais turmas da Academia na Plataforma.</li>
                <li><strong>Responsavel:</strong> usuario que representa legalmente um aluno menor de idade (Teen ou Kids).</li>
                <li><strong>Conteudo:</strong> qualquer dado, texto, imagem, video, audio ou informacao inserida na Plataforma por qualquer Usuario.</li>
                <li><strong>Dados Pessoais:</strong> informacoes relacionadas a pessoa natural identificada ou identificavel, conforme a LGPD.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="servico" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">3. Descricao do Servico</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                A BlackBelt e uma plataforma SaaS (Software as a Service) de gestao inteligente para academias
                de artes marciais, oferecendo as seguintes funcionalidades principais:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Gestao de turmas, modalidades, horarios e matriculas.</li>
                <li>Controle de presenca via QR Code, NFC ou registro manual.</li>
                <li>Sistema de graduacao e progressao de faixas.</li>
                <li>Avaliacao pedagogica de alunos por multiplos criterios.</li>
                <li>Gestao financeira: planos, assinaturas, faturas e cobrancas automatizadas.</li>
                <li>Comunicacao interna entre professores, alunos e responsaveis.</li>
                <li>Streaming de aulas ao vivo e biblioteca de conteudo sob demanda.</li>
                <li>Relatorios analiticos e dashboards de desempenho.</li>
                <li>Aplicativos moveis nativos (iOS e Android) via Capacitor.</li>
                <li>Integracao com gateways de pagamento (Asaas, Stripe) e servicos de comunicacao.</li>
              </ul>
              <p>
                A disponibilidade de funcionalidades pode variar conforme o plano contratado pela Academia.
                A BlackBelt reserva-se o direito de adicionar, modificar ou descontinuar funcionalidades,
                com comunicacao previa de 30 (trinta) dias para alteracoes significativas.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="cadastro" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">4. Cadastro e Conta</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                4.1. Para utilizar a Plataforma, o Usuario devera criar uma conta fornecendo informacoes verdadeiras,
                completas e atualizadas. O cadastro pode ocorrer por convite da Academia ou por autoregistro,
                conforme configuracao da Academia.
              </p>
              <p>
                4.2. O Usuario e integralmente responsavel pela seguranca e confidencialidade de suas credenciais
                de acesso (email e senha). A BlackBelt nao armazena senhas em texto plano, utilizando
                criptografia bcrypt com salt.
              </p>
              <p>
                4.3. O Usuario deve notificar imediatamente a BlackBelt em caso de uso nao autorizado da sua
                conta ou qualquer violacao de seguranca, pelo email suporte@blackbelt.com.
              </p>
              <p>
                4.4. A BlackBelt reserva-se o direito de suspender ou encerrar contas que violem estes Termos
                ou que apresentem comportamento fraudulento, sem prejuizo de outras medidas cabiveis.
              </p>
              <p>
                4.5. O cadastro de menores de 18 anos deve ser realizado pelo Responsavel legal, que assume
                integral responsabilidade pelas atividades do menor na Plataforma.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="uso" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">5. Uso da Plataforma</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>5.1. O Usuario compromete-se a utilizar a Plataforma exclusivamente para os fins previstos nestes Termos e em conformidade com a legislacao vigente. E expressamente vedado:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Utilizar a Plataforma para fins ilicitos, fraudulentos ou que violem direitos de terceiros.</li>
                <li>Tentar acessar, obter ou modificar dados de outros Usuarios ou Academias sem autorizacao.</li>
                <li>Realizar engenharia reversa, descompilar ou tentar extrair o codigo-fonte da Plataforma.</li>
                <li>Utilizar bots, scrapers ou qualquer mecanismo automatizado para acessar a Plataforma sem autorizacao previa por escrito.</li>
                <li>Distribuir virus, malware ou qualquer codigo malicioso atraves da Plataforma.</li>
                <li>Sobrecarregar intencionalmente os servidores ou infraestrutura da Plataforma.</li>
                <li>Revender, sublicenciar ou redistribuir o acesso a Plataforma a terceiros nao autorizados.</li>
              </ul>
              <p>
                5.2. A BlackBelt podera limitar, suspender ou encerrar o acesso de qualquer Usuario que viole
                estas disposicoes, sem aviso previo e sem prejuizo de outras medidas legais cabiveis.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="obrigacoes-academia" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">6. Obrigacoes da Academia</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>A Academia contratante compromete-se a:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Manter suas informacoes cadastrais e financeiras atualizadas.</li>
                <li>Garantir que todos os Usuarios vinculados a sua conta estejam cientes destes Termos.</li>
                <li>Obter consentimento adequado dos seus alunos e responsaveis para tratamento de dados pessoais na Plataforma, conforme a LGPD.</li>
                <li>Nao utilizar a Plataforma para praticas discriminatorias, abusivas ou que violem a dignidade humana.</li>
                <li>Manter a confidencialidade das informacoes de seus alunos e colaboradores.</li>
                <li>Realizar pagamentos na forma e nos prazos acordados no plano contratado.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="obrigacoes-usuario" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">7. Obrigacoes do Usuario</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Todo Usuario da Plataforma compromete-se a:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Fornecer informacoes verdadeiras e atualizadas no cadastro e durante o uso.</li>
                <li>Nao compartilhar suas credenciais de acesso com terceiros.</li>
                <li>Respeitar os direitos de propriedade intelectual da BlackBelt e de terceiros.</li>
                <li>Utilizar a Plataforma de maneira etica e em consonancia com os valores do esporte.</li>
                <li>Reportar imediatamente qualquer vulnerabilidade de seguranca identificada.</li>
                <li>Nao publicar conteudo ofensivo, difamatorio, discriminatorio ou que incite violencia.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="pagamentos" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">8. Pagamentos e Planos</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                8.1. A BlackBelt oferece diferentes planos de assinatura com funcionalidades e limites distintos.
                Os valores e condicoes de cada plano estao disponiveis na pagina de precos da Plataforma.
              </p>
              <p>
                8.2. A cobranca e recorrente, conforme o ciclo do plano contratado (mensal, trimestral ou anual).
                O pagamento pode ser realizado via boleto bancario, PIX ou cartao de credito.
              </p>
              <p>
                8.3. Em caso de inadimplencia superior a 15 (quinze) dias, a BlackBelt podera suspender o
                acesso a Plataforma ate a regularizacao do pagamento. Os dados serao mantidos por 90 (noventa)
                dias apos a suspensao.
              </p>
              <p>
                8.4. A BlackBelt atua como intermediadora tecnologica entre a Academia e seus alunos.
                A relacao comercial entre Academia e Aluno (mensalidades, planos de treino, etc.)
                e de exclusiva responsabilidade da Academia.
              </p>
              <p>
                8.5. Reajustes de preco serao comunicados com antecedencia minima de 30 (trinta) dias
                e aplicados apenas ao proximo ciclo de cobranca.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="propriedade" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">9. Propriedade Intelectual</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                9.1. Todo o conteudo, marca, logotipo, design, codigo-fonte, algoritmos, interfaces,
                textos, graficos e demais elementos da Plataforma sao de propriedade exclusiva da BlackBelt
                ou de seus licenciadores, protegidos pela Lei de Direitos Autorais (Lei n. 9.610/1998),
                Lei de Propriedade Industrial (Lei n. 9.279/1996) e tratados internacionais.
              </p>
              <p>
                9.2. A utilizacao da Plataforma nao confere ao Usuario qualquer direito de propriedade
                intelectual sobre a Plataforma ou seus componentes.
              </p>
              <p>
                9.3. E expressamente proibida a reproducao, distribuicao, modificacao, engenharia reversa
                ou qualquer uso nao autorizado dos elementos da Plataforma.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="conteudo-usuario" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">10. Conteudo do Usuario</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                10.1. Os dados e conteudos inseridos pelos Usuarios na Plataforma permanecem de propriedade
                dos respectivos Usuarios ou Academias. A BlackBelt nao reivindica propriedade sobre tais conteudos.
              </p>
              <p>
                10.2. O Usuario concede a BlackBelt uma licenca limitada, nao exclusiva e revogavel para
                armazenar, processar e exibir o conteudo inserido, estritamente para a prestacao do servico.
              </p>
              <p>
                10.3. O Usuario e exclusivamente responsavel pelo conteudo que publica na Plataforma,
                garantindo que nao viola direitos de terceiros, a legislacao vigente ou estes Termos.
              </p>
              <p>
                10.4. A BlackBelt podera remover conteudo que viole estes Termos ou a legislacao vigente,
                sem aviso previo.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="privacidade" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">11. Privacidade e Dados</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                11.1. O tratamento de dados pessoais realizado pela BlackBelt e regido pela nossa
                Politica de Privacidade, que constitui parte integrante destes Termos.
              </p>
              <p>
                11.2. A BlackBelt atua como Operadora de dados pessoais em relacao aos dados dos
                alunos e usuarios das Academias, sendo a Academia a Controladora dos dados.
              </p>
              <p>
                11.3. A BlackBelt implementa medidas tecnicas e organizacionais adequadas para
                proteger os dados pessoais contra acesso nao autorizado, perda, destruicao ou alteracao,
                em conformidade com a Lei Geral de Protecao de Dados (Lei n. 13.709/2018).
              </p>
              <p>
                11.4. Para mais informacoes sobre o tratamento de dados pessoais, consulte
                nossa <a href="/privacidade" className="font-medium text-[var(--bb-brand)] underline">Politica de Privacidade</a>.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="disponibilidade" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">12. Disponibilidade e SLA</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                12.1. A BlackBelt empenhara seus melhores esforcos para manter a Plataforma disponivel
                24 horas por dia, 7 dias por semana, com meta de disponibilidade de 99,5% ao mes.
              </p>
              <p>
                12.2. A BlackBelt podera realizar manutencoes programadas, preferencialmente em horarios
                de menor utilizacao, com comunicacao previa de 48 horas.
              </p>
              <p>
                12.3. A BlackBelt nao sera responsabilizada por indisponibilidades causadas por:
                forca maior, caso fortuito, falhas de terceiros (provedores de infraestrutura, internet),
                ataques ciberneticos ou acoes governamentais.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="responsabilidade" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">13. Limitacao de Responsabilidade</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                13.1. A BlackBelt nao se responsabiliza por danos indiretos, incidentais, especiais,
                consequentes ou punitivos decorrentes do uso ou impossibilidade de uso da Plataforma.
              </p>
              <p>
                13.2. A responsabilidade total da BlackBelt por quaisquer reclamacoes decorrentes destes
                Termos sera limitada ao valor total pago pelo Usuario nos 12 (doze) meses anteriores ao evento.
              </p>
              <p>
                13.3. A BlackBelt nao se responsabiliza por: (a) conteudo gerado por Usuarios;
                (b) relacoes comerciais entre Academias e Alunos; (c) decisoes tomadas com base em
                informacoes da Plataforma; (d) perdas decorrentes de acesso nao autorizado por falha
                do Usuario em manter suas credenciais seguras.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section id="rescisao" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">14. Rescisao e Cancelamento</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                14.1. A Academia pode cancelar sua assinatura a qualquer momento pelo painel administrativo.
                O cancelamento sera efetivado ao final do ciclo de cobranca vigente, sem reembolso proporcional.
              </p>
              <p>
                14.2. Apos o cancelamento, os dados da Academia serao mantidos por 90 (noventa) dias para
                eventual reativacao. Apos esse periodo, os dados serao anonimizados ou excluidos, exceto
                quando houver obrigacao legal de retencao.
              </p>
              <p>
                14.3. A BlackBelt podera rescindir a conta imediatamente em caso de violacao grave destes
                Termos, fraude, ou por determinacao judicial ou administrativa.
              </p>
              <p>
                14.4. Em caso de rescisao, a Academia podera solicitar a exportacao dos seus dados em
                formato padrao (CSV/JSON) antes do encerramento definitivo.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="alteracoes" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">15. Alteracoes dos Termos</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                15.1. A BlackBelt reserva-se o direito de alterar estes Termos a qualquer momento.
                Alteracoes significativas serao comunicadas com antecedencia de 30 (trinta) dias
                por email e/ou notificacao na Plataforma.
              </p>
              <p>
                15.2. O uso continuado da Plataforma apos a entrada em vigor das alteracoes implica
                aceitacao dos novos Termos. Caso o Usuario nao concorde com as alteracoes, devera
                cessar o uso e solicitar o cancelamento da conta.
              </p>
              <p>
                15.3. A versao vigente dos Termos estara sempre disponivel nesta pagina.
              </p>
            </div>
          </section>

          {/* Section 16 */}
          <section id="legislacao" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">16. Legislacao Aplicavel</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Estes Termos sao regidos pela legislacao da Republica Federativa do Brasil, incluindo,
                mas nao se limitando a:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Codigo Civil Brasileiro (Lei n. 10.406/2002)</li>
                <li>Marco Civil da Internet (Lei n. 12.965/2014)</li>
                <li>Lei Geral de Protecao de Dados Pessoais — LGPD (Lei n. 13.709/2018)</li>
                <li>Codigo de Defesa do Consumidor (Lei n. 8.078/1990), quando aplicavel</li>
                <li>Lei de Direitos Autorais (Lei n. 9.610/1998)</li>
                <li>Estatuto da Crianca e do Adolescente (Lei n. 8.069/1990), para funcionalidades envolvendo menores</li>
              </ul>
            </div>
          </section>

          {/* Section 17 */}
          <section id="foro" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">17. Foro</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Fica eleito o foro da Comarca de Sao Paulo, Estado de Sao Paulo, para dirimir quaisquer
                controversias decorrentes destes Termos, renunciando as partes a qualquer outro, por mais
                privilegiado que seja.
              </p>
              <p>
                Nao obstante, a BlackBelt incentiva a resolucao de disputas de forma amigavel.
                Antes de iniciar qualquer procedimento judicial, as partes deverao tentar resolver
                a questao por meio de negociacao direta, pelo prazo minimo de 30 (trinta) dias.
              </p>
            </div>
          </section>

          {/* Section 18 */}
          <section id="contato" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">18. Contato</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Para duvidas, sugestoes ou reclamacoes sobre estes Termos, entre em contato conosco:
              </p>
              <ul className="list-none space-y-1 pl-0">
                <li><strong>Email:</strong> suporte@blackbelt.com</li>
                <li><strong>Telefone:</strong> (11) 4000-0000</li>
                <li><strong>Endereco:</strong> Sao Paulo/SP, Brasil</li>
                <li><strong>DPO:</strong> privacidade@blackbelt.com</li>
              </ul>
            </div>
          </section>

          {/* Footer note */}
          <div className="border-t border-[var(--bb-glass-border)] pt-6">
            <p className="text-xs text-[var(--bb-ink-40)]">
              Documento gerado e mantido pela BlackBelt Tecnologia Ltda. A versao mais atualizada
              deste documento pode ser encontrada em blackbelt.com/termos.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

// ── Table of Contents Sections ──────────────────────────────────────

const SECTIONS = [
  { id: 'introducao', label: '1. Introducao' },
  { id: 'controlador', label: '2. Controlador e Operador' },
  { id: 'dados-coletados', label: '3. Dados Coletados' },
  { id: 'finalidade', label: '4. Finalidade do Tratamento' },
  { id: 'base-legal', label: '5. Base Legal (LGPD)' },
  { id: 'compartilhamento', label: '6. Compartilhamento de Dados' },
  { id: 'transferencia', label: '7. Transferencia Internacional' },
  { id: 'retencao', label: '8. Retencao de Dados' },
  { id: 'seguranca', label: '9. Seguranca' },
  { id: 'direitos', label: '10. Direitos do Titular' },
  { id: 'menores', label: '11. Dados de Menores' },
  { id: 'cookies', label: '12. Cookies e Tecnologias' },
  { id: 'incidentes', label: '13. Incidentes de Seguranca' },
  { id: 'alteracoes', label: '14. Alteracoes desta Politica' },
  { id: 'dpo', label: '15. Encarregado (DPO)' },
  { id: 'contato', label: '16. Contato e Canal de Atendimento' },
];

// ── Page Component ──────────────────────────────────────────────────

export default function PrivacidadePage() {
  const [activeSection, setActiveSection] = useState('introducao');
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
            name: 'Politica de Privacidade — BlackBelt',
            description: 'Politica de privacidade LGPD-ready da plataforma BlackBelt para gestao de academias de artes marciais.',
            url: 'https://app.blackbelt.com/privacidade',
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
          Politica de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[var(--bb-ink-40)]">
          Ultima atualizacao: 17 de marco de 2026
        </p>
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: 'var(--bb-success-surface)',
            color: 'var(--bb-success)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Compativel com LGPD (Lei n. 13.709/2018)
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Table of Contents (sidebar) */}
        <nav className="hidden w-56 shrink-0 lg:block" aria-label="Indice da politica de privacidade">
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-[var(--bb-glass-border)] bg-[var(--bb-depth-2)] p-4 lg:hidden" aria-label="Indice da politica de privacidade">
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
          <section id="introducao" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">1. Introducao</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                A BlackBelt Tecnologia Ltda. (<strong>&quot;BlackBelt&quot;</strong>, <strong>&quot;nos&quot;</strong> ou <strong>&quot;nosso&quot;</strong>) respeita a
                privacidade dos seus usuarios e esta comprometida com a protecao dos dados pessoais,
                em total conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 — <strong>LGPD</strong>).
              </p>
              <p>
                Esta Politica de Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos
                e protegemos os dados pessoais dos usuarios da plataforma BlackBelt, bem como os direitos dos
                titulares e os mecanismos disponiveis para exerce-los.
              </p>
              <p>
                Ao utilizar a Plataforma, voce concorda com as praticas descritas nesta Politica.
                Recomendamos a leitura integral deste documento em conjunto com nossos
                <a href="/termos" className="ml-1 font-medium text-[var(--bb-brand)] underline">Termos de Uso</a>.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="controlador" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">2. Controlador e Operador</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Conforme definido pela LGPD (Art. 5, VI e VII):
              </p>
              <div className="rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-4">
                <ul className="space-y-3">
                  <li>
                    <strong className="text-[var(--bb-ink-80)]">Controlador dos dados da conta da Academia:</strong>
                    <br />BlackBelt Tecnologia Ltda. — CNPJ: XX.XXX.XXX/0001-XX
                  </li>
                  <li>
                    <strong className="text-[var(--bb-ink-80)]">Controlador dos dados dos alunos e professores:</strong>
                    <br />A Academia contratante (pessoa juridica que contrata a Plataforma)
                  </li>
                  <li>
                    <strong className="text-[var(--bb-ink-80)]">Operador:</strong>
                    <br />BlackBelt Tecnologia Ltda., que processa os dados em nome da Academia conforme instrucoes e finalidades estabelecidas
                  </li>
                </ul>
              </div>
              <p>
                A BlackBelt atua como Operadora de dados pessoais dos alunos e professores,
                processando-os exclusivamente conforme as instrucoes da Academia (Controladora),
                nos termos do Art. 39 da LGPD.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="dados-coletados" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">3. Dados Coletados</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Coletamos as seguintes categorias de dados pessoais:</p>

              <h3 className="mt-4 font-semibold text-[var(--bb-ink-80)]">3.1. Dados de Identificacao</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Nome completo, email, telefone, CPF (quando exigido pela Academia)</li>
                <li>Data de nascimento (para alunos Teen e Kids)</li>
                <li>Foto de perfil (opcional)</li>
                <li>Endereco (quando necessario para cobranca)</li>
              </ul>

              <h3 className="mt-4 font-semibold text-[var(--bb-ink-80)]">3.2. Dados de Uso da Plataforma</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Registros de presenca (check-ins) com data, hora e metodo</li>
                <li>Avaliacoes pedagogicas e progressao de faixa</li>
                <li>Historico de conquistas e evolucao</li>
                <li>Mensagens trocadas na Plataforma</li>
                <li>Conteudos assistidos (videos, aulas ao vivo)</li>
              </ul>

              <h3 className="mt-4 font-semibold text-[var(--bb-ink-80)]">3.3. Dados Financeiros</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Informacoes de plano e assinatura</li>
                <li>Historico de faturas e pagamentos</li>
                <li>Dados de cartao de credito (processados diretamente pelos gateways de pagamento, nao armazenados pela BlackBelt)</li>
              </ul>

              <h3 className="mt-4 font-semibold text-[var(--bb-ink-80)]">3.4. Dados Tecnicos</h3>
              <ul className="list-disc space-y-1 pl-6">
                <li>Endereco IP, tipo de navegador, sistema operacional</li>
                <li>Dados de geolocalizacao aproximada (para check-in por proximidade, com consentimento)</li>
                <li>Logs de acesso (conforme Marco Civil da Internet — Art. 15)</li>
                <li>Cookies e identificadores de sessao</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="finalidade" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">4. Finalidade do Tratamento</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Os dados pessoais sao tratados para as seguintes finalidades especificas:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Prestacao do servico:</strong> gestao de turmas, matriculas, presencas, avaliacoes e graduacoes</li>
                <li><strong>Comunicacao:</strong> envio de notificacoes, mensagens entre usuarios, lembretes e alertas</li>
                <li><strong>Financeiro:</strong> processamento de pagamentos, emissao de faturas, cobranças recorrentes</li>
                <li><strong>Relatorios:</strong> geracao de dashboards, estatisticas e relatorios para a Academia</li>
                <li><strong>Seguranca:</strong> prevencao de fraudes, deteccao de atividades suspeitas, controle de acesso</li>
                <li><strong>Melhoria do servico:</strong> analise de uso para aprimorar funcionalidades e experiencia</li>
                <li><strong>Conformidade legal:</strong> cumprimento de obrigacoes legais e regulatorias</li>
                <li><strong>Suporte:</strong> atendimento a solicitacoes, duvidas e reclamacoes dos usuarios</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="base-legal" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">5. Base Legal (LGPD)</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                O tratamento de dados pessoais pela BlackBelt fundamenta-se nas seguintes bases legais
                previstas no Art. 7 da LGPD:
              </p>
              <div className="space-y-3">
                <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-3">
                  <p className="font-semibold text-[var(--bb-ink-80)]">Art. 7, I — Consentimento</p>
                  <p className="mt-1">Para coleta de dados opcionais (foto de perfil, geolocalizacao, cookies analiticos).</p>
                </div>
                <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-3">
                  <p className="font-semibold text-[var(--bb-ink-80)]">Art. 7, II — Obrigacao Legal</p>
                  <p className="mt-1">Para retencao de logs de acesso (Marco Civil da Internet, Art. 15) e dados fiscais.</p>
                </div>
                <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-3">
                  <p className="font-semibold text-[var(--bb-ink-80)]">Art. 7, V — Execucao de Contrato</p>
                  <p className="mt-1">Para prestacao do servico contratado (gestao de turmas, presencas, pagamentos).</p>
                </div>
                <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-3">
                  <p className="font-semibold text-[var(--bb-ink-80)]">Art. 7, IX — Legitimo Interesse</p>
                  <p className="mt-1">Para melhoria do servico, prevencao de fraudes e comunicacoes relevantes ao usuario.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="compartilhamento" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">6. Compartilhamento de Dados</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Seus dados pessoais podem ser compartilhados com:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Academia contratante:</strong> para gestao dos alunos, turmas e operacoes da academia.</li>
                <li><strong>Gateways de pagamento (Asaas, Stripe):</strong> para processamento de transacoes financeiras, sob seus respectivos termos de privacidade.</li>
                <li><strong>Provedores de infraestrutura (Supabase, Vercel):</strong> para hospedagem e operacao da Plataforma.</li>
                <li><strong>Servicos de comunicacao:</strong> para envio de emails transacionais e notificacoes push.</li>
                <li><strong>Autoridades publicas:</strong> quando exigido por lei, regulamentacao ou determinacao judicial.</li>
              </ul>
              <p className="mt-3 font-semibold text-[var(--bb-ink-80)]">
                A BlackBelt NAO vende, aluga ou comercializa dados pessoais a terceiros para fins de marketing.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="transferencia" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">7. Transferencia Internacional</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Alguns dos nossos provedores de servico podem armazenar dados em servidores localizados
                fora do Brasil. Nesses casos, a transferencia internacional de dados e realizada em
                conformidade com o Art. 33 da LGPD, mediante:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Clausulas contratuais padrao que garantem nivel adequado de protecao.</li>
                <li>Paises ou organismos internacionais que proporcionem grau de protecao adequado, conforme avaliacao da ANPD.</li>
                <li>Consentimento especifico e em destaque do titular, quando aplicavel.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="retencao" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">8. Retencao de Dados</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Os dados pessoais sao mantidos pelo periodo necessario para as finalidades descritas:</p>
              <div className="mt-3 overflow-hidden rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)]">
                      <th className="px-3 py-2 font-semibold text-[var(--bb-ink-80)]">Tipo de Dado</th>
                      <th className="px-3 py-2 font-semibold text-[var(--bb-ink-80)]">Periodo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bb-glass-border)]">
                    <tr>
                      <td className="px-3 py-2">Dados de conta ativa</td>
                      <td className="px-3 py-2">Enquanto a conta estiver ativa</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Dados apos cancelamento</td>
                      <td className="px-3 py-2">90 dias (para reativacao)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Logs de acesso</td>
                      <td className="px-3 py-2">6 meses (Marco Civil da Internet)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Dados fiscais/financeiros</td>
                      <td className="px-3 py-2">5 anos (legislacao tributaria)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Dados para defesa em processos</td>
                      <td className="px-3 py-2">Ate prescricao legal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Apos os periodos indicados, os dados serao anonimizados (para fins estatisticos)
                ou permanentemente excluidos, conforme Art. 16 da LGPD.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="seguranca" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">9. Seguranca</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Empregamos medidas tecnicas e administrativas para proteger os dados pessoais,
                conforme Art. 46 da LGPD, incluindo:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Criptografia:</strong> TLS 1.3 para dados em transito; AES-256 para dados em repouso.</li>
                <li><strong>Autenticacao:</strong> JWT com tokens em memoria (nao em localStorage/sessionStorage); bcrypt com salt para hashing de senhas.</li>
                <li><strong>Controle de acesso:</strong> RBAC (Role-Based Access Control) com 8 perfis distintos; isolamento multi-tenant por academia.</li>
                <li><strong>Monitoramento:</strong> logs de auditoria, deteccao de anomalias, alertas de seguranca em tempo real.</li>
                <li><strong>Backup:</strong> backups automaticos diarios com retencao de 30 dias, criptografados e armazenados em infraestrutura separada.</li>
                <li><strong>Testes:</strong> analises de vulnerabilidade periodicas e auditorias de seguranca.</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section id="direitos" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">10. Direitos do Titular (LGPD Art. 18)</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Como titular dos dados pessoais, voce tem os seguintes direitos garantidos pela LGPD:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Confirmacao:</strong> confirmar a existencia de tratamento de seus dados.</li>
                <li><strong>Acesso:</strong> acessar os dados pessoais que tratamos sobre voce.</li>
                <li><strong>Correcao:</strong> solicitar a correcao de dados incompletos, inexatos ou desatualizados.</li>
                <li><strong>Anonimizacao, bloqueio ou eliminacao:</strong> de dados desnecessarios, excessivos ou tratados em desconformidade.</li>
                <li><strong>Portabilidade:</strong> solicitar a transferencia dos seus dados a outro fornecedor de servico.</li>
                <li><strong>Eliminacao:</strong> solicitar a exclusao dos dados pessoais tratados com base no consentimento.</li>
                <li><strong>Informacao:</strong> ser informado sobre com quem seus dados sao compartilhados.</li>
                <li><strong>Revogacao:</strong> revogar o consentimento a qualquer momento, de forma gratuita e facilitada.</li>
                <li><strong>Oposicao:</strong> opor-se ao tratamento realizado com base em hipoteses de dispensa de consentimento, quando irregular.</li>
                <li><strong>Revisao de decisoes automatizadas:</strong> solicitar revisao de decisoes tomadas unicamente com base em tratamento automatizado.</li>
              </ul>
              <p className="mt-3">
                Para exercer seus direitos, voce pode:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Acessar a secao <strong>Privacidade</strong> nas configuracoes do seu perfil na Plataforma.</li>
                <li>Enviar email para <strong>privacidade@blackbelt.com</strong> identificando-se como titular.</li>
              </ul>
              <p>
                As solicitacoes serao respondidas no prazo de 15 (quinze) dias, conforme Art. 18, par. 5 da LGPD.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="menores" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">11. Dados de Menores</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                O tratamento de dados pessoais de criancas e adolescentes (alunos Kids e Teen) e
                realizado em conformidade com o Art. 14 da LGPD e o Estatuto da Crianca e do
                Adolescente (ECA — Lei n. 8.069/1990):
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>O cadastro de menores de 18 anos so e permitido com o consentimento expresso de pelo menos um Responsavel legal.</li>
                <li>O Responsavel tem acesso completo aos dados do menor e pode solicitar a exclusao a qualquer momento.</li>
                <li>Coletamos apenas os dados estritamente necessarios para a prestacao do servico.</li>
                <li>Nao utilizamos dados de menores para fins de marketing ou publicidade.</li>
                <li>O acesso do menor a Plataforma e vinculado ao perfil do Responsavel, garantindo supervisao adequada.</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section id="cookies" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">12. Cookies e Tecnologias de Rastreamento</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>Utilizamos as seguintes categorias de cookies:</p>
              <div className="mt-3 overflow-hidden rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)]">
                      <th className="px-3 py-2 font-semibold text-[var(--bb-ink-80)]">Categoria</th>
                      <th className="px-3 py-2 font-semibold text-[var(--bb-ink-80)]">Finalidade</th>
                      <th className="px-3 py-2 font-semibold text-[var(--bb-ink-80)]">Consentimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bb-glass-border)]">
                    <tr>
                      <td className="px-3 py-2 font-medium text-[var(--bb-ink-80)]">Essenciais</td>
                      <td className="px-3 py-2">Autenticacao, seguranca, preferencias do usuario</td>
                      <td className="px-3 py-2">Nao requerido</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-[var(--bb-ink-80)]">Analiticos</td>
                      <td className="px-3 py-2">Estatisticas de uso, melhoria do servico</td>
                      <td className="px-3 py-2">Requerido</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-[var(--bb-ink-80)]">Funcionais</td>
                      <td className="px-3 py-2">Preferencias de idioma, tema, layout</td>
                      <td className="px-3 py-2">Nao requerido</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Voce pode gerenciar suas preferencias de cookies nas configuracoes do seu perfil.
                A desativacao de cookies essenciais pode impactar o funcionamento da Plataforma.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section id="incidentes" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">13. Incidentes de Seguranca</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Em caso de incidente de seguranca que possa acarretar risco ou dano relevante aos
                titulares, a BlackBelt se compromete a:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Comunicar a Autoridade Nacional de Protecao de Dados (ANPD) em prazo razoavel, conforme Art. 48 da LGPD.</li>
                <li>Notificar os titulares afetados, informando: a natureza dos dados afetados, os riscos envolvidos, as medidas adotadas e as recomendacoes ao titular.</li>
                <li>Adotar medidas corretivas imediatas para mitigar os efeitos do incidente.</li>
                <li>Documentar integralmente o incidente e as acoes tomadas, para prestacao de contas.</li>
              </ul>
            </div>
          </section>

          {/* Section 14 */}
          <section id="alteracoes" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">14. Alteracoes desta Politica</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Esta Politica podera ser atualizada periodicamente para refletir mudancas nas nossas
                praticas, tecnologias ou na legislacao aplicavel.
              </p>
              <p>
                Alteracoes significativas serao comunicadas por email e/ou notificacao na Plataforma
                com antecedencia de 30 (trinta) dias. A versao vigente estara sempre disponivel nesta pagina
                com a data da ultima atualizacao.
              </p>
              <p>
                O uso continuado da Plataforma apos a atualizacao da Politica implica concordancia com
                as novas condicoes.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section id="dpo" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">15. Encarregado de Protecao de Dados (DPO)</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Conforme Art. 41 da LGPD, a BlackBelt designou um Encarregado de Protecao de Dados
                (Data Protection Officer — DPO) responsavel por:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Aceitar reclamacoes e comunicacoes dos titulares e prestar esclarecimentos.</li>
                <li>Receber comunicacoes da ANPD e adotar providencias.</li>
                <li>Orientar funcionarios e contratados sobre as praticas de protecao de dados.</li>
                <li>Executar as demais atribuicoes determinadas pelo controlador ou pela legislacao.</li>
              </ul>
              <div className="mt-3 rounded-[var(--bb-radius-md)] border border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)] p-4">
                <p className="font-semibold text-[var(--bb-ink-80)]">Encarregado (DPO)</p>
                <p className="mt-1">Email: <strong>privacidade@blackbelt.com</strong></p>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section id="contato" data-section className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold text-[var(--bb-ink-100)]">16. Contato e Canal de Atendimento</h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--bb-ink-60)]">
              <p>
                Para exercer seus direitos como titular, esclarecer duvidas ou registrar reclamacoes
                sobre o tratamento de dados pessoais:
              </p>
              <ul className="list-none space-y-1 pl-0">
                <li><strong>Email do DPO:</strong> privacidade@blackbelt.com</li>
                <li><strong>Email de suporte:</strong> suporte@blackbelt.com</li>
                <li><strong>Telefone:</strong> (11) 4000-0000</li>
                <li><strong>Endereco:</strong> Sao Paulo/SP, Brasil</li>
              </ul>
              <p>
                Caso nao esteja satisfeito com a resposta, voce pode apresentar reclamacao perante a
                Autoridade Nacional de Protecao de Dados (ANPD) — <a href="https://www.gov.br/anpd" className="font-medium text-[var(--bb-brand)] underline" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>.
              </p>
            </div>
          </section>

          {/* Footer note */}
          <div className="border-t border-[var(--bb-glass-border)] pt-6">
            <p className="text-xs text-[var(--bb-ink-40)]">
              Documento gerado e mantido pela BlackBelt Tecnologia Ltda. em conformidade com a Lei Geral
              de Protecao de Dados Pessoais (Lei n. 13.709/2018). A versao mais atualizada deste documento
              pode ser encontrada em blackbelt.com/privacidade.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

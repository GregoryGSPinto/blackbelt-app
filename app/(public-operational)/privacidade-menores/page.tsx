import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Privacidade para Menores — BlackBelt',
  description: 'Politica de privacidade e protecao de dados para menores de idade no BlackBelt',
};

export default function PrivacidadeMenoresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        Politica de Privacidade para Menores
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
        Ultima atualizacao: marco de 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
        {/* Intro */}
        <section>
          <p>
            O BlackBelt leva a seguranca dos dados de menores de idade muito a serio.
            Esta politica descreve como coletamos, usamos e protegemos os dados de
            criancas e adolescentes que utilizam nossa plataforma, em conformidade com
            a Lei Geral de Protecao de Dados (LGPD), o Estatuto da Crianca e do
            Adolescente (ECA), e as diretrizes COPPA (Children&apos;s Online Privacy
            Protection Act).
          </p>
        </section>

        {/* What we collect */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Dados que coletamos
          </h2>
          <ul className="mt-3 space-y-2 pl-5 list-disc">
            <li>
              <strong>Nome e data de nascimento</strong> — para identificacao e
              classificacao por faixa etaria na academia.
            </li>
            <li>
              <strong>Dados de presenca</strong> — registro de frequencia nas aulas para
              acompanhamento pelo responsavel e pela academia.
            </li>
            <li>
              <strong>Evolucao na academia</strong> — graduacoes de faixa, avaliacoes e
              progresso tecnico.
            </li>
            <li>
              <strong>Fotos de perfil</strong> — apenas se enviadas pelo responsavel,
              para identificacao visual na plataforma.
            </li>
          </ul>
        </section>

        {/* What we do NOT collect */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Dados que NAO coletamos
          </h2>
          <ul className="mt-3 space-y-2 pl-5 list-disc">
            <li>
              <strong>Localizacao</strong> — nao coletamos nem rastreamos a localizacao
              de menores em nenhum momento.
            </li>
            <li>
              <strong>Compartilhamento com terceiros</strong> — nao compartilhamos dados
              de menores com terceiros, anunciantes ou parceiros comerciais.
            </li>
            <li>
              <strong>Publicidade</strong> — nao exibimos anuncios para menores. Nenhum
              dado e usado para segmentacao publicitaria.
            </li>
            <li>
              <strong>Contatos do dispositivo</strong> — nao acessamos lista de contatos,
              mensagens ou qualquer dado do dispositivo.
            </li>
            <li>
              <strong>Conteudo gerado</strong> — menores nao podem criar ou publicar
              conteudo publico na plataforma.
            </li>
            <li>
              <strong>Rastreamento publicitario</strong> — nao utilizamos cookies de
              rastreamento, pixels ou tecnologias similares para menores.
            </li>
          </ul>
        </section>

        {/* Guardian rights */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Direitos do Responsavel
          </h2>
          <p className="mt-3">
            O responsavel legal do menor tem os seguintes direitos a qualquer momento:
          </p>
          <ul className="mt-3 space-y-2 pl-5 list-disc">
            <li>
              <strong>Revogar o consentimento</strong> — o responsavel pode revogar a
              autorizacao de uso da plataforma pelo menor nas configuracoes da conta.
            </li>
            <li>
              <strong>Solicitar exclusao de dados</strong> — o responsavel pode solicitar
              a exclusao completa dos dados do menor, que sera processada em ate 15 dias
              uteis.
            </li>
            <li>
              <strong>Acessar os dados</strong> — o responsavel pode visualizar todos os
              dados coletados sobre o menor na area do responsavel.
            </li>
            <li>
              <strong>Corrigir informacoes</strong> — o responsavel pode solicitar a
              correcao de qualquer dado incorreto sobre o menor.
            </li>
            <li>
              <strong>Exportar dados</strong> — o responsavel pode solicitar uma copia de
              todos os dados do menor em formato legivel.
            </li>
          </ul>
        </section>

        {/* Retention */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Retencao de Dados
          </h2>
          <ul className="mt-3 space-y-2 pl-5 list-disc">
            <li>
              Quando o menor deixa a academia, seus dados sao arquivados e o acesso e
              desativado.
            </li>
            <li>
              Dados arquivados sao mantidos por no maximo 5 anos para fins de auditoria
              e conformidade legal, apos isso sao permanentemente excluidos.
            </li>
            <li>
              Caso o responsavel solicite exclusao antecipada, os dados serao anonimizados
              em ate 15 dias uteis.
            </li>
          </ul>
        </section>

        {/* Security */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Seguranca
          </h2>
          <p className="mt-3">
            Utilizamos criptografia em transito (TLS/SSL) e controle de acesso baseado em
            funcoes (RLS — Row Level Security) para garantir que os dados de menores sejam
            acessados apenas por pessoas autorizadas: o proprio menor, seus responsaveis
            legais e a equipe da academia.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Contato
          </h2>
          <p className="mt-3">
            Para duvidas sobre esta politica ou para exercer seus direitos como responsavel,
            entre em contato conosco:
          </p>
          <p className="mt-2">
            <Link
              href="/contato"
              className="underline"
              style={{ color: 'var(--bb-brand)' }}
            >
              Pagina de contato
            </Link>
          </p>
        </section>

        {/* Back link */}
        <div className="pt-4">
          <Link
            href="/privacidade"
            className="text-sm underline"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ver Politica de Privacidade geral
          </Link>
        </div>
      </div>
    </div>
  );
}

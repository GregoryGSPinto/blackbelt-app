import Link from 'next/link';
import {
  getAccountDeletionUrl,
  getPrivacyUrl,
  getSupportEmail,
  getSupportPhone,
  getSupportUrl,
  getTermsUrl,
} from '@/lib/config/legal';

export default function ExcluirContaPage() {
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();
  const supportCards = [
    { label: 'URL pública', value: getAccountDeletionUrl() },
    { label: 'Suporte', value: supportEmail },
    ...(supportPhone ? [{ label: 'Canal rápido', value: supportPhone }] : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section
        className="rounded-[28px] border p-6 sm:p-8"
        style={{
          background: 'var(--bb-depth-3)',
          borderColor: 'var(--bb-glass-border)',
          boxShadow: 'var(--bb-shadow-xl)',
        }}
      >
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
        >
          Exclusão de conta e dados
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--bb-ink-100)] sm:text-4xl">
          Solicite a exclusão da sua conta com clareza e rastreabilidade
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--bb-ink-60)] sm:text-base">
          Esta é a página pública exigida para revisão da App Store e Google Play. Usuários adultos, responsáveis e gestores
          podem solicitar a exclusão da conta e dos dados pessoais diretamente no app ou pelos canais oficiais de suporte.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {supportCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-4)' }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--bb-ink-40)]">{item.label}</p>
              <p className="mt-2 break-words text-sm font-medium text-[var(--bb-ink-100)]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article
          className="rounded-[28px] border p-6 sm:p-8"
          style={{ background: 'var(--bb-depth-3)', borderColor: 'var(--bb-glass-border)' }}
        >
          <h2 className="text-xl font-semibold text-[var(--bb-ink-100)]">Como excluir sua conta</h2>
          <ol className="mt-4 space-y-4 text-sm leading-7 text-[var(--bb-ink-60)]">
            <li>1. No app, acesse `Perfil` ou `Configurações` → `Privacidade e Dados`.</li>
            <li>2. Toque em `Solicitar Exclusão da Conta` e confirme a solicitação.</li>
            <li>3. Registramos o pedido com prazo padrão de 30 dias para retenção operacional e prevenção de fraude.</li>
            <li>4. Se você for responsável por menor, a exclusão também interrompe o acesso do responsável aos dados vinculados.</li>
          </ol>

          <h3 className="mt-8 text-lg font-semibold text-[var(--bb-ink-100)]">Se você não conseguir entrar no app</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--bb-ink-60)]">
            Envie um email para <a className="font-medium text-[var(--bb-brand)] underline" href={`mailto:${supportEmail}`}>{supportEmail}</a> com
            o assunto `Exclusão de conta BlackBelt`. Para agilizar a análise, informe o email da conta, a academia vinculada e, quando aplicável,
            o nome do menor vinculado ao responsável.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--bb-ink-100)]">O que é removido</h3>
          <ul className="mt-3 space-y-3 text-sm leading-7 text-[var(--bb-ink-60)]">
            <li>Dados de login e acesso individual.</li>
            <li>Preferências pessoais e consentimentos associados ao perfil.</li>
            <li>Solicitações pendentes, registros de suporte e dados operacionais que não precisem ser mantidos por obrigação legal.</li>
          </ul>
        </article>

        <aside
          className="rounded-[28px] border p-6 sm:p-8"
          style={{ background: 'var(--bb-depth-3)', borderColor: 'var(--bb-glass-border)' }}
        >
          <h2 className="text-xl font-semibold text-[var(--bb-ink-100)]">Documentos e suporte</h2>
          <div className="mt-5 flex flex-col gap-3">
            <Link href="/privacidade" className="rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--bb-ink-100)]" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-4)' }}>
              Política de Privacidade
            </Link>
            <Link href="/termos" className="rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--bb-ink-100)]" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-4)' }}>
              Termos de Uso
            </Link>
            <Link href="/suporte" className="rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--bb-ink-100)]" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-4)' }}>
              Central de Contato e Suporte
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border p-4 text-sm leading-7 text-[var(--bb-ink-60)]" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-4)' }}>
            <p className="font-medium text-[var(--bb-ink-100)]">Links públicos para revisão</p>
            <p className="mt-2 break-words">{getPrivacyUrl()}</p>
            <p className="break-words">{getTermsUrl()}</p>
            <p className="break-words">{getSupportUrl()}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

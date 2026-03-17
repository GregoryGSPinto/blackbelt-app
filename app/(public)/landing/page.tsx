import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BlackBelt — O software que toda academia de artes marciais precisa',
  description: 'Gestão completa. Do tatame ao financeiro. Turmas, presença, streaming, graduação, financeiro e multi-perfil.',
  openGraph: {
    title: 'BlackBelt — Gestão de Academias',
    description: 'Plataforma SaaS completa para academias de artes marciais. Gerencie alunos, turmas, pagamentos e muito mais.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlackBelt — Gestão de Academias',
    description: 'Do tatame ao financeiro. A plataforma mais completa para academias.',
  },
};

const FEATURES = [
  { icon: '🥋', title: 'Turmas', desc: 'Crie turmas com horários, modalidades, capacidade e faixa mínima. Gestão visual completa.' },
  { icon: '✅', title: 'Presença', desc: 'Check-in por QR code, controle manual, heatmap de frequência e alertas de ausência.' },
  { icon: '🎥', title: 'Streaming', desc: 'Biblioteca de vídeos com quizzes, séries, trilhas e analytics de engajamento.' },
  { icon: '💰', title: 'Financeiro', desc: 'Cobranças automáticas, controle de inadimplência, relatórios e projeções de receita.' },
  { icon: '🏅', title: 'Graduação', desc: 'Critérios configuráveis por faixa, propostas automáticas, certificados e histórico.' },
  { icon: '👥', title: 'Multi-perfil', desc: 'Admin, professor, aluno adulto, teen, kids e responsável. Cada um com experiência própria.' },
];

const PROFILES = [
  { role: 'Admin', desc: 'Dashboard com métricas, financeiro, retenção, turmas, comunicados e plano.', bullets: ['Visão 360° da academia', 'Controle financeiro completo', 'Gestão de equipe e alunos'] },
  { role: 'Professor', desc: 'Gerencie presença, avalie alunos, publique conteúdo e acompanhe turmas.', bullets: ['Controle de presença por turma', 'Avaliações com radar chart', 'Biblioteca de conteúdo própria'] },
  { role: 'Aluno', desc: 'Acompanhe progresso, assista vídeos, faça check-in e veja conquistas.', bullets: ['Progresso visual de faixa', 'Heatmap de frequência', 'Vídeos com quizzes e XP'] },
  { role: 'Teen', desc: 'Experiência gamificada com XP, levels, desafios semanais e ranking.', bullets: ['Sistema de XP e levels', 'Desafios semanais', 'Ranking competitivo da turma'] },
  { role: 'Kids', desc: 'Interface lúdica com estrelas, missões, aventuras e muita diversão.', bullets: ['Estrelas e recompensas', 'Missões divertidas', 'Visual colorido e amigável'] },
  { role: 'Responsável', desc: 'Acompanhe seus filhos, pague mensalidades e fale com professores.', bullets: ['Dashboard por filho', 'Pagamento de mensalidades', 'Comunicação com professores'] },
];

const TESTIMONIALS = [
  { quote: 'Desde que adotamos o BlackBelt, a inadimplência caiu 40% e o engajamento dos alunos subiu muito.', name: 'Prof. Ricardo Almeida', academy: 'Alliance BJJ Centro' },
  { quote: 'A automação de cobranças economiza 10 horas por semana. O melhor investimento que fiz para a academia.', name: 'Sensei Marcos Tanaka', academy: 'Tanaka Dojo' },
  { quote: 'Meus alunos adoram o app. O sistema de conquistas e faixas digitais mudou a motivação dos treinos.', name: 'Mestre Ana Luíza', academy: 'Arte Suave Academy' },
];

const FAQ = [
  { q: 'Preciso de cartão de crédito para começar?', a: 'Não. O trial de 7 dias é totalmente gratuito com acesso Black Belt completo.' },
  { q: 'Funciona para qualquer arte marcial?', a: 'Sim! BJJ, Muay Thai, Judô, Karatê, MMA, Boxing, Taekwondo e qualquer modalidade de luta.' },
  { q: 'Como funciona o check-in dos alunos?', a: 'Os alunos fazem check-in pelo app usando QR code gerado por turma. Simples, rápido e seguro.' },
  { q: 'Posso migrar de outra plataforma?', a: 'Sim. Oferecemos importação de dados via CSV e suporte dedicado durante a migração.' },
  { q: 'Tem contrato de fidelidade?', a: 'Não. Cancele quando quiser. Seus dados são exportáveis a qualquer momento conforme LGPD.' },
  { q: 'Quantos alunos cabem em cada plano?', a: 'Depende do plano: Starter até 50, Essencial até 150, Pro até 200, Black Belt ilimitado.' },
  { q: 'O sistema funciona no celular?', a: 'Sim! PWA responsivo que funciona como app nativo no celular, tablet e desktop.' },
  { q: 'Como funciona o suporte?', a: 'Email e chat no horário comercial para todos. Suporte prioritário e WhatsApp para Pro e acima.' },
];

const PLANS_PREVIEW = [
  { name: 'Starter', price: 'R$ 97', highlight: false },
  { name: 'Essencial', price: 'R$ 197', highlight: false },
  { name: 'Pro', price: 'R$ 347', highlight: true },
  { name: 'Black Belt', price: 'R$ 597', highlight: false },
  { name: 'Enterprise', price: 'Consulte', highlight: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
        </span>
        <div className="hidden items-center gap-6 sm:flex">
          <a href="#features" className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>Funcionalidades</a>
          <a href="#profiles" className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>Por Perfil</a>
          <a href="#pricing" className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>Planos</a>
          <a href="#faq" className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>FAQ</a>
          <Link href="/login" className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>Login</Link>
          <Link
            href="/cadastrar-academia"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand)' }}
          >
            Começar Trial Grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-32">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
          O software que toda academia de{' '}
          <span style={{ color: 'var(--bb-brand)' }}>artes marciais</span> precisa
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: 'var(--bb-ink-60)' }}>
          Gestão completa. Do tatame ao financeiro. Turmas, presença, streaming, graduação e multi-perfil em uma única plataforma.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/cadastrar-academia"
            className="rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: 'var(--bb-brand)' }}
          >
            Começar Trial Grátis
          </Link>
          <Link
            href="/precos"
            className="rounded-xl border px-8 py-4 text-lg font-medium transition-colors"
            style={{ borderColor: 'var(--bb-glass-border)', color: 'var(--bb-ink-60)' }}
          >
            Ver Planos
          </Link>
        </div>
        <p className="mt-4 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          7 dias grátis com acesso Black Belt completo. Sem cartão de crédito.
        </p>
      </section>

      {/* Social Proof bar */}
      <section className="border-y px-6 py-8" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-12">
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Usado por <span className="font-bold" style={{ color: 'var(--bb-ink-100)' }}>150+ academias</span> em todo o Brasil
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="h-5 w-5" viewBox="0 0 20 20" fill="var(--bb-brand)">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>4.9/5 avaliação média</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">Tudo que sua academia precisa</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center" style={{ color: 'var(--bb-ink-60)' }}>
          6 módulos integrados para gerenciar todos os aspectos da sua academia.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border p-6 transition-transform hover:scale-[1.02]"
              style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
            >
              <span className="text-4xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por Perfil */}
      <section id="profiles" className="px-6 py-20" style={{ background: 'var(--bb-depth-2)' }}>
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Uma experiência para cada perfil</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center" style={{ color: 'var(--bb-ink-60)' }}>
            Cada tipo de usuário tem uma interface e funcionalidades personalizadas.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILES.map((p) => (
              <div
                key={p.role}
                className="rounded-2xl border p-6"
                style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-3)' }}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--bb-brand)' }}>{p.role}</h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{p.desc}</p>
                <ul className="mt-4 space-y-2">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      <span style={{ color: 'var(--bb-brand)' }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">O que dizem nossos clientes</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border p-6"
              style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
            >
              <p style={{ color: 'var(--bb-ink-60)' }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>{t.academy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="px-6 py-20" style={{ background: 'var(--bb-depth-2)' }}>
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Planos para todo tamanho de academia</h2>
          <p className="mx-auto mb-12 max-w-2xl" style={{ color: 'var(--bb-ink-60)' }}>
            Do iniciante ao enterprise. Comece grátis e escale conforme cresce.
          </p>
          <div className="grid gap-4 sm:grid-cols-5">
            {PLANS_PREVIEW.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border p-4 transition-transform hover:scale-105"
                style={{
                  borderColor: p.highlight ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                  background: p.highlight ? 'var(--bb-depth-3)' : 'var(--bb-depth-1)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>{p.name}</p>
                <p className="mt-1 text-2xl font-bold">{p.price}</p>
                {p.highlight && (
                  <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: 'var(--bb-brand)' }}>
                    Popular
                  </span>
                )}
              </div>
            ))}
          </div>
          <Link
            href="/precos"
            className="mt-8 inline-block rounded-xl border px-8 py-3 font-semibold transition-colors"
            style={{ borderColor: 'var(--bb-brand)', color: 'var(--bb-brand)' }}
          >
            Ver comparação completa
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border"
              style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                {item.q}
                <span className="transition-transform group-open:rotate-45" style={{ color: 'var(--bb-ink-40)' }}>+</span>
              </summary>
              <p className="px-4 pb-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-20 text-center" style={{ background: 'var(--bb-depth-2)' }}>
        <h2 className="text-3xl font-bold">Pronto para transformar sua academia?</h2>
        <p className="mx-auto mt-4 max-w-xl" style={{ color: 'var(--bb-ink-60)' }}>
          Comece seu trial de 7 dias grátis com acesso Black Belt completo. Sem cartão de crédito.
        </p>
        <Link
          href="/cadastrar-academia"
          className="mt-8 inline-block rounded-xl px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105"
          style={{ background: 'var(--bb-brand)' }}
        >
          Começar Trial Grátis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12" style={{ borderColor: 'var(--bb-glass-border)' }}>
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-4">
          <div>
            <span className="text-xl font-bold">Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span></span>
            <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Plataforma de gestão para academias de artes marciais.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li><a href="#features">Funcionalidades</a></li>
              <li><Link href="/precos">Planos e Preços</Link></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li><Link href="/sobre">Sobre</Link></li>
              <li><Link href="/contato">Contato</Link></li>
              <li><Link href="/ajuda">Central de Ajuda</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li><Link href="/termos">Termos de Uso</Link></li>
              <li><Link href="/privacidade">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          &copy; 2026 BlackBelt. Todos os direitos reservados. Feito com 🥋 por BlackBelt.
        </p>
      </footer>
    </div>
  );
}

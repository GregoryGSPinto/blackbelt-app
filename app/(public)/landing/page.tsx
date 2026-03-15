import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BlackBelt — Plataforma de Gestão para Academias de Artes Marciais',
  description: 'Gerencie alunos, turmas, pagamentos, presenças e faixas com a plataforma mais completa do mercado. Comece grátis.',
  openGraph: {
    title: 'BlackBelt — Gestão de Academias',
    description: 'Plataforma SaaS completa para academias de artes marciais.',
    type: 'website',
  },
};

const FEATURES = [
  { icon: '🥋', title: 'Gestão de Alunos', desc: 'Cadastro, faixas, presenças, avaliações e evolução de cada aluno em tempo real.' },
  { icon: '📊', title: 'Financeiro Completo', desc: 'Cobranças automáticas, PIX, boleto, cartão. Relatórios de receita e inadimplência.' },
  { icon: '📱', title: 'App para Alunos', desc: 'Check-in por QR code, agenda de aulas, conquistas, conteúdo e chat com professor.' },
  { icon: '🤖', title: 'Inteligência Artificial', desc: 'Relatórios automáticos, insights preditivos e coach virtual para alunos.' },
];

const PLANS = [
  { name: 'Free', price: 'R$ 0', period: '/mês', features: ['Até 30 alunos', '1 unidade', 'Check-in + presença', 'App básico'], cta: 'Começar Grátis', popular: false },
  { name: 'Pro', price: 'R$ 197', period: '/mês', features: ['Alunos ilimitados', 'Até 3 unidades', 'Cobranças automáticas', 'Relatórios IA', 'WhatsApp integrado', 'Suporte prioritário'], cta: 'Teste 14 dias grátis', popular: true },
  { name: 'Enterprise', price: 'Sob consulta', period: '', features: ['Tudo do Pro', 'Unidades ilimitadas', 'SSO corporativo', 'API dedicada', 'SLA 99.9%', 'Gerente de conta'], cta: 'Falar com Vendas', popular: false },
];

const STEPS = [
  { num: '1', title: 'Cadastre sua academia', desc: 'Crie sua conta em menos de 2 minutos. Sem cartão de crédito.' },
  { num: '2', title: 'Configure turmas e alunos', desc: 'Importe ou cadastre alunos. Crie turmas, horários e modalidades.' },
  { num: '3', title: 'Gerencie tudo em um lugar', desc: 'Presenças, pagamentos, comunicação e relatórios em uma única plataforma.' },
];

const FAQ = [
  { q: 'Preciso de cartão de crédito para começar?', a: 'Não. O plano Free é totalmente gratuito e não requer cartão de crédito.' },
  { q: 'Funciona para qualquer arte marcial?', a: 'Sim! BJJ, Muay Thai, Judô, Karatê, MMA, Boxing e qualquer modalidade de luta.' },
  { q: 'Como funciona o check-in dos alunos?', a: 'Os alunos fazem check-in pelo app usando QR code na recepção. Simples e rápido.' },
  { q: 'Posso migrar de outra plataforma?', a: 'Sim. Oferecemos importação de dados e suporte durante a migração.' },
  { q: 'Tem contrato de fidelidade?', a: 'Não. Cancele quando quiser. Seus dados são exportáveis a qualquer momento.' },
];

const TESTIMONIALS = [
  { quote: 'Desde que adotamos o BlackBelt, a inadimplência caiu 40% e o engajamento dos alunos subiu muito.', name: 'Prof. Ricardo Almeida', academy: 'Alliance BJJ Centro' },
  { quote: 'A automação de cobranças economiza 10 horas por semana. O melhor investimento que fiz para a academia.', name: 'Sensei Marcos Tanaka', academy: 'Tanaka Dojo' },
  { quote: 'Meus alunos adoram o app. O sistema de conquistas e faixas digitais mudou a motivação dos treinos.', name: 'Mestre Ana Luíza', academy: 'Arte Suave Academy' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bb-gray-900 text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-2xl font-bold text-white">Black<span className="text-bb-red">Belt</span></span>
        <div className="hidden items-center gap-6 sm:flex">
          <a href="#features" className="text-sm text-gray-300 hover:text-white">Funcionalidades</a>
          <a href="#pricing" className="text-sm text-gray-300 hover:text-white">Planos</a>
          <a href="#faq" className="text-sm text-gray-300 hover:text-white">FAQ</a>
          <Link href="/login" className="text-sm text-gray-300 hover:text-white">Login</Link>
          <Link href="/cadastrar-academia" className="rounded-lg bg-bb-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Começar Grátis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-32">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
          A plataforma completa para sua <span className="text-bb-red">academia de artes marciais</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Gerencie alunos, turmas, pagamentos, presenças e faixas. Automatize cobranças, envie comunicações e acompanhe tudo com inteligência artificial.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/cadastrar-academia" className="rounded-xl bg-bb-red px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-900/30 hover:bg-red-700">
            Cadastre sua academia grátis
          </Link>
          <a href="#features" className="rounded-xl border border-gray-600 px-8 py-4 text-lg font-medium text-gray-300 hover:border-gray-400">
            Conheça as funcionalidades
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Tudo que sua academia precisa</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Como funciona</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bb-red text-2xl font-bold">{s.num}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Planos e Preços</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-6 ${p.popular ? 'border-bb-red bg-gray-800' : 'border-gray-700 bg-gray-800/50'}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-bb-red px-4 py-1 text-xs font-bold">MAIS POPULAR</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-2"><span className="text-3xl font-extrabold">{p.price}</span><span className="text-gray-400">{p.period}</span></p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastrar-academia" className={`mt-6 block rounded-lg py-3 text-center font-semibold ${p.popular ? 'bg-bb-red text-white hover:bg-red-700' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">O que dizem nossos clientes</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
              <p className="text-gray-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-400">{t.academy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-gray-700 bg-gray-800/50">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                {item.q}
                <span className="text-gray-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-4">
          <div>
            <span className="text-xl font-bold">Black<span className="text-bb-red">Belt</span></span>
            <p className="mt-2 text-sm text-gray-400">Plataforma de gestão para academias de artes marciais.</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-white">Planos</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/sobre" className="hover:text-white">Sobre</Link></li>
              <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/termos" className="hover:text-white">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">&copy; 2026 BlackBelt. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

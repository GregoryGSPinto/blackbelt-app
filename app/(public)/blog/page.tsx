export const metadata = { title: 'Blog — BlackBelt' };

const PLACEHOLDER_POSTS = [
  { id: 1, title: 'Como aumentar a retenção de alunos na sua academia', excerpt: 'Estratégias práticas para manter seus alunos motivados e reduzir o churn.', date: '2026-03-01' },
  { id: 2, title: '5 métricas que todo dono de academia deve acompanhar', excerpt: 'MRR, churn, presença média, NPS e taxa de promoção — entenda cada uma.', date: '2026-02-20' },
  { id: 3, title: 'Automatização de cobranças: guia completo', excerpt: 'Como configurar cobranças automáticas e reduzir inadimplência em 50%.', date: '2026-02-10' },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-bb-gray-900">Blog</h1>
      <div className="space-y-8">
        {PLACEHOLDER_POSTS.map((post) => (
          <article key={post.id} className="border-b border-bb-gray-200 pb-8">
            <p className="text-sm text-bb-gray-400">{new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h2 className="mt-1 text-xl font-semibold text-bb-gray-900">{post.title}</h2>
            <p className="mt-2 text-bb-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-bb-gray-400">Mais artigos em breve. Estamos construindo nosso blog.</p>
    </div>
  );
}

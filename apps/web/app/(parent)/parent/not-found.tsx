import Link from 'next/link';

export default function ParentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6" style={{ color: 'var(--bb-ink-100)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bb-depth-3)' }}>
        <span className="text-3xl">404</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Página não encontrada</h2>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          O conteúdo que você busca não existe ou foi movido.
        </p>
      </div>
      <Link
        href="/parent"
        className="px-6 py-2 rounded-lg font-medium transition-colors"
        style={{ background: 'var(--bb-brand)', color: '#fff' }}
      >
        Voltar ao Painel do Responsável
      </Link>
    </div>
  );
}

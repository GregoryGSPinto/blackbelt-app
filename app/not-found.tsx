import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-xl border border-bb-gray-300 bg-bb-gray-100 p-8">
        <h2 className="text-6xl font-bold text-bb-red">404</h2>
        <h3 className="mt-2 text-xl font-semibold text-bb-gray-900">
          Pagina nao encontrada
        </h3>
        <p className="mt-2 max-w-sm text-sm text-bb-gray-500">
          O endereco que voce acessou nao existe ou foi removido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-bb-red px-4 text-sm font-medium text-bb-white transition-colors hover:bg-bb-red-dark"
        >
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}

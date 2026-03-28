import Link from 'next/link';

export function LegalFooter() {
  return (
    <div className="text-xs text-center py-2" style={{ color: 'var(--bb-ink-40)' }}>
      <Link href="/termos" className="hover:underline">Termos de Uso</Link>
      {' · '}
      <Link href="/privacidade" className="hover:underline">Politica de Privacidade</Link>
    </div>
  );
}

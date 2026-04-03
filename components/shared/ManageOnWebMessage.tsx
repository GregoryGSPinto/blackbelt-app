'use client';

export function ManageOnWebMessage({ feature = 'seu plano' }: { feature?: string }) {
  return (
    <div
      className="rounded-xl p-6 text-center"
      style={{
        background: 'var(--bb-depth-1)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <h3
        className="mb-1 text-base font-semibold"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        Gerenciar {feature}
      </h3>
      <p
        className="mb-3 text-sm"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        Para gerenciar {feature}, acesse pelo navegador:
      </p>
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--bb-brand)' }}
      >
        blackbeltv2.vercel.app
      </p>
    </div>
  );
}

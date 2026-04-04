export function CheckinMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl border max-w-sm mx-auto"
      style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--bb-danger)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--bb-warning)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--bb-success)' }} />
        <span className="text-xs ml-2" style={{ color: 'var(--bb-ink-40)' }}>
          BlackBelt — Check-in
        </span>
      </div>
      {/* Check-in content */}
      <div className="p-6 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--bb-brand-surface)', border: '2px dashed var(--bb-brand)' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--bb-ink-100)' }}>
          Aponte para o QR Code
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--bb-ink-40)' }}>
          Check-in em 3 segundos
        </p>
        <div
          className="w-full py-3.5 rounded-xl text-center text-sm font-bold text-white"
          style={{ background: 'var(--bb-brand-deep)' }}
        >
          FAZER CHECK-IN
        </div>
        <div className="mt-4 w-full flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
          <div className="w-2 h-6 rounded-full" style={{ background: '#3B82F6' }} />
          <div className="flex-1 text-left">
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-100)' }}>Último check-in</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Hoje, 18:32 — Turma Adulto</p>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--bb-success)' }}>✓</span>
        </div>
      </div>
    </div>
  );
}

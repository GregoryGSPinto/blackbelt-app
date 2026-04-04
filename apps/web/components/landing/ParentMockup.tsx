export function ParentMockup() {
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
          BlackBelt — Painel do Responsável
        </span>
      </div>
      {/* Parent content */}
      <div className="p-4">
        {/* Child card */}
        <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bb-depth-3)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--bb-brand-deep)' }}
            >
              S
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Sophia Oliveira</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#EAB308' }} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Faixa Amarela</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>18</p>
              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Presenças</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-success)' }}>92%</p>
              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Frequência</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Ter</p>
              <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Próx. aula</p>
            </div>
          </div>
        </div>
        {/* Recent activity */}
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bb-ink-40)' }}>ATIVIDADE RECENTE</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
            <span className="text-xs" style={{ color: 'var(--bb-success)' }}>✓</span>
            <span className="text-xs flex-1" style={{ color: 'var(--bb-ink-80)' }}>Check-in — Turma Kids</span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Hoje</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
            <span className="text-xs" style={{ color: 'var(--bb-brand)' }}>★</span>
            <span className="text-xs flex-1" style={{ color: 'var(--bb-ink-80)' }}>Avaliação do professor</span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Ontem</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl border max-w-lg mx-auto lg:mx-0"
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
          BlackBelt — Dashboard
        </span>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <KPICard label="Alunos Ativos" value="45" trend="+3 este mês" icon="👥" />
        <KPICard label="Receita" value="R$ 15.800" trend="+12% vs anterior" icon="💰" />
        <KPICard label="Presença" value="87%" trend="Acima da média" icon="📊" />
        <KPICard label="Turmas Hoje" value="3" trend="Próxima às 19h" icon="🥋" />
      </div>
      {/* Activity preview */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bb-ink-40)' }}>
          ÚLTIMOS CHECK-INS
        </div>
        <div className="space-y-2">
          <ActivityRow name="João Pedro" time="há 5 min" belt="azul" />
          <ActivityRow name="Maria Clara" time="há 12 min" belt="roxa" />
          <ActivityRow name="Lucas Teen" time="há 18 min" belt="amarela" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend, icon }: { label: string; value: string; trend: string; icon: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-3)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{label}</span>
        <span>{icon}</span>
      </div>
      <div className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--bb-success)' }}>{trend}</div>
    </div>
  );
}

function ActivityRow({ name, time, belt }: { name: string; time: string; belt: string }) {
  const beltColors: Record<string, string> = {
    branca: '#F8FAFC',
    azul: '#3B82F6',
    roxa: '#8B5CF6',
    amarela: '#EAB308',
    marrom: '#92400E',
  };
  return (
    <div
      className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
      style={{ background: 'var(--bb-depth-4)' }}
    >
      <div className="w-2 h-6 rounded-full" style={{ background: beltColors[belt] || '#94A3B8' }} />
      <span className="text-sm font-medium flex-1" style={{ color: 'var(--bb-ink-100)' }}>{name}</span>
      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{time}</span>
    </div>
  );
}

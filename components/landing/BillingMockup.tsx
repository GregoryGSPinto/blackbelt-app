export function BillingMockup() {
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
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-xs ml-2" style={{ color: 'var(--bb-ink-40)' }}>
          BlackBelt — Financeiro
        </span>
      </div>
      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-3)' }}>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Recebido</p>
            <p className="text-lg font-bold" style={{ color: '#22C55E' }}>R$ 12.400</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-3)' }}>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Pendente</p>
            <p className="text-lg font-bold" style={{ color: '#EAB308' }}>R$ 3.400</p>
          </div>
        </div>
        {/* Invoice list */}
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bb-ink-40)' }}>FATURAS RECENTES</div>
        <div className="space-y-2">
          <InvoiceRow name="Ana Costa" amount="R$ 197" status="pago" />
          <InvoiceRow name="Pedro Lima" amount="R$ 347" status="pago" />
          <InvoiceRow name="Carlos Souza" amount="R$ 197" status="pendente" />
          <InvoiceRow name="Julia Santos" amount="R$ 97" status="vencido" />
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ name, amount, status }: { name: string; amount: string; status: 'pago' | 'pendente' | 'vencido' }) {
  const statusConfig = {
    pago: { label: 'Pago', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    pendente: { label: 'Pendente', color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
    vencido: { label: 'Vencido', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const cfg = statusConfig[status];

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg" style={{ background: 'var(--bb-depth-3)' }}>
      <span className="text-sm font-medium flex-1" style={{ color: 'var(--bb-ink-100)' }}>{name}</span>
      <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>{amount}</span>
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

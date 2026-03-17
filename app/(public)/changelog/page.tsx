'use client';

import { CheckIcon, PlusIcon, ZapIcon } from '@/components/shell/icons';

interface ChangelogEntry {
  version: string;
  date: string;
  items: { type: 'new' | 'improved' | 'fixed'; text: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-03-17',
    items: [
      { type: 'new', text: 'Sistema de gamificação completo com XP, levels e badges' },
      { type: 'new', text: 'Integração WhatsApp para comunicação com alunos' },
      { type: 'new', text: 'Analytics avançado com previsão de churn' },
      { type: 'new', text: 'Multi-filial para academias com mais de uma unidade' },
      { type: 'new', text: 'API pública documentada para integrações' },
      { type: 'new', text: 'Chat interno professor-aluno e broadcast' },
      { type: 'new', text: 'NF-e automática após pagamento confirmado' },
      { type: 'new', text: 'Check-in por QR Code com validação' },
      { type: 'improved', text: 'Dashboard admin com widgets customizáveis' },
      { type: 'improved', text: 'Dark mode polido em todas as páginas' },
      { type: 'improved', text: 'Performance: bundle < 200KB initial load' },
      { type: 'improved', text: 'Acessibilidade WCAG 2.1 AA' },
      { type: 'fixed', text: 'Navegação mobile com animações suaves' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-02-15',
    items: [
      { type: 'new', text: 'Super Admin — gestão de academias e planos' },
      { type: 'new', text: 'Onboarding wizard para novas academias' },
      { type: 'new', text: 'Sistema de convites com tokens' },
      { type: 'improved', text: 'Dashboard com métricas em tempo real' },
      { type: 'fixed', text: 'Correção de tema em formulários' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-10',
    items: [
      { type: 'new', text: 'Lançamento inicial da plataforma BlackBelt v2' },
      { type: 'new', text: '8 perfis de usuário com interfaces dedicadas' },
      { type: 'new', text: 'Sistema de check-in e presença' },
      { type: 'new', text: 'Biblioteca de vídeos com quizzes' },
      { type: 'new', text: 'Gestão financeira completa' },
    ],
  },
];

const TYPE_CONFIG = {
  new: { label: 'Novo', icon: PlusIcon, color: '#22C55E' },
  improved: { label: 'Melhorado', icon: ZapIcon, color: '#3B82F6' },
  fixed: { label: 'Corrigido', icon: CheckIcon, color: '#F59E0B' },
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 py-12 sm:p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Changelog
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Acompanhe todas as atualizações e melhorias da plataforma.
        </p>
      </div>

      {CHANGELOG.map((entry) => (
        <div key={entry.version}>
          <div className="mb-4 flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: 'var(--bb-brand)', color: 'white' }}
            >
              v{entry.version}
            </span>
            <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              background: 'var(--bb-depth-2)',
              borderColor: 'var(--bb-glass-border)',
            }}
          >
            {entry.items.map((item, i) => {
              const config = TYPE_CONFIG[item.type];
              const Icon = config.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${config.color}20` }}
                  >
                    <Icon className="h-3 w-3" style={{ color: config.color }} />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ background: `${config.color}15`, color: config.color }}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                      {item.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

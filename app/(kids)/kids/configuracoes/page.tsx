'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

export default function KidsConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [estrelas, setEstrelas] = useState(true);
  const [aulas, setAulas] = useState(true);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  function handleSalvarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast('Preencha todos os campos.', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast('As senhas nao coincidem.', 'error');
      return;
    }
    toast('Senha alterada com sucesso!', 'success');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Configuracoes
      </h1>

      {/* Tema */}
      <section
        className="p-5"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <h2
          className="font-mono uppercase"
          style={{ fontSize: '13px', letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}
        >
          Tema
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Escolha como voce quer ver o app!
        </p>
        <div className="mt-4 flex gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              style={{
                background: theme === opt.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                color: theme === opt.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                border: theme === opt.value ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                padding: '12px 22px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notificacoes */}
      <section
        className="p-5"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <h2
          className="font-mono uppercase"
          style={{ fontSize: '13px', letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}
        >
          Notificacoes
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          O que voce quer receber avisos?
        </p>
        <div className="mt-4 space-y-5">
          <ToggleRow label="Estrelas" value={estrelas} onChange={setEstrelas} />
          <ToggleRow label="Aulas" value={aulas} onChange={setAulas} />
        </div>
      </section>

      {/* Seguranca */}
      <section
        className="p-5"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <h2
          className="font-mono uppercase"
          style={{ fontSize: '13px', letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}
        >
          Seguranca
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Trocar a senha da sua conta.
        </p>
        <div className="mt-4 space-y-4">
          <Input
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Sua senha de agora"
          />
          <Input
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Sua nova senha"
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Digite de novo a nova senha"
          />
          <Button onClick={handleSalvarSenha} size="lg">Salvar</Button>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Toggle Row (inline helper — bigger for kids)
// ────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-medium" style={{ color: 'var(--bb-ink-100)' }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          background: value ? 'var(--bb-brand)' : 'var(--bb-depth-5)',
          position: 'relative',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 27 : 3,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: '#fff',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/lib/api/preferences.service';
import type { UserPreferences } from '@/lib/types/preferences';
import { useAuth } from '@/lib/hooks/useAuth';

// ── Constants ────────────────────────────────────────────────────────

const MASCOTS = [
  { id: 'dragon', emoji: '\uD83D\uDC09', label: 'Dragao' },
  { id: 'tiger', emoji: '\uD83D\uDC2F', label: 'Tigre' },
  { id: 'eagle', emoji: '\uD83E\uDD85', label: 'Aguia' },
  { id: 'wolf', emoji: '\uD83D\uDC3A', label: 'Lobo' },
  { id: 'bear', emoji: '\uD83D\uDC3B', label: 'Urso' },
  { id: 'lion', emoji: '\uD83E\uDD81', label: 'Leao' },
];

const COLORS = [
  { id: '#EF4444', label: 'Vermelho' },
  { id: '#3B82F6', label: 'Azul' },
  { id: '#10B981', label: 'Verde' },
  { id: '#F59E0B', label: 'Amarelo' },
  { id: '#8B5CF6', label: 'Roxo' },
  { id: '#EC4899', label: 'Rosa' },
  { id: '#F97316', label: 'Laranja' },
  { id: '#06B6D4', label: 'Ciano' },
];

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; emoji: string }[] = [
  { value: 'light', label: 'Dia', emoji: '\u2600\uFE0F' },
  { value: 'dark', label: 'Noite', emoji: '\uD83C\uDF19' },
  { value: 'system', label: 'Auto', emoji: '\uD83C\uDF08' },
];

// ── Loading Skeleton ─────────────────────────────────────────────────

function KidsSkeleton() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <Skeleton variant="text" className="mx-auto h-10 w-64" />
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="card" className="h-40" />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function KidsConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { profile, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const profileId = profile?.id ?? '';

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      if (!profileId) {
        setLoading(false);
        return;
      }
      try {
        const p = await getUserPreferences(profileId);
        setPrefs(p);
      } catch {
        toast('Ops! Algo deu errado', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading, profileId, toast]);

  const savePref = useCallback(
    async (partial: Partial<UserPreferences>) => {
      try {
        if (!profileId) throw new Error('Perfil ativo nao encontrado.');
        await updateUserPreferences(profileId, partial);
        setPrefs((p) => (p ? { ...p, ...partial } : p));
        toast('Pronto!', 'success');
      } catch {
        toast('Ops! Tenta de novo', 'error');
      }
    },
    [profileId, toast],
  );

  if (loading || authLoading || !prefs) return <KidsSkeleton />;

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ fontSize: '16px' }}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Minhas coisas
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--bb-ink-60)' }}>
          Escolha como voce quer que tudo fique!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Mascote ────────────────────────────────────────────── */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '2px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 text-center text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Meu mascote
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {MASCOTS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => savePref({ mascot: m.id })}
                className="flex flex-col items-center gap-2 py-4 transition-all duration-200"
                style={{
                  minHeight: 48,
                  borderRadius: 'var(--bb-radius-lg)',
                  background: prefs.mascot === m.id ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                  border: prefs.mascot === m.id ? '3px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)',
                  transform: prefs.mascot === m.id ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span className="text-4xl">{m.emoji}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: prefs.mascot === m.id ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Cor favorita ───────────────────────────────────────── */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '2px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 text-center text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Minha cor favorita
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => savePref({ favorite_color: c.id })}
                className="flex flex-col items-center gap-2 py-3 transition-all duration-200"
                style={{
                  minHeight: 48,
                  borderRadius: 'var(--bb-radius-lg)',
                  background: 'var(--bb-depth-4)',
                  border: prefs.favorite_color === c.id ? '3px solid var(--bb-ink-100)' : '2px solid var(--bb-glass-border)',
                }}
              >
                <div
                  className="h-10 w-10"
                  style={{
                    borderRadius: '50%',
                    background: c.id,
                    boxShadow: prefs.favorite_color === c.id ? `0 0 12px ${c.id}` : 'none',
                  }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Sons ───────────────────────────────────────────────── */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '2px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 text-center text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Sons
          </h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => savePref({ sounds_enabled: !prefs.sounds_enabled })}
              className="flex w-full items-center justify-between px-4 py-4 transition-all duration-200"
              style={{
                minHeight: 48,
                borderRadius: 'var(--bb-radius-lg)',
                background: prefs.sounds_enabled ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                border: prefs.sounds_enabled ? '2px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)',
              }}
            >
              <span className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Sons de efeitos
              </span>
              <span className="text-2xl">{prefs.sounds_enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'}</span>
            </button>

            <button
              type="button"
              onClick={() => savePref({ mascot_music: !prefs.mascot_music })}
              className="flex w-full items-center justify-between px-4 py-4 transition-all duration-200"
              style={{
                minHeight: 48,
                borderRadius: 'var(--bb-radius-lg)',
                background: prefs.mascot_music ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                border: prefs.mascot_music ? '2px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)',
              }}
            >
              <span className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Musica do mascote
              </span>
              <span className="text-2xl">{prefs.mascot_music ? '\uD83C\uDFB5' : '\uD83D\uDD07'}</span>
            </button>
          </div>
        </div>

        {/* ── Tema ───────────────────────────────────────────────── */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-3)',
            border: '2px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h2
            className="mb-4 text-center text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Tema
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className="flex flex-col items-center gap-2 py-4 transition-all duration-200"
                style={{
                  minHeight: 48,
                  borderRadius: 'var(--bb-radius-lg)',
                  background: theme === opt.value ? 'var(--bb-brand-surface)' : 'var(--bb-depth-4)',
                  border: theme === opt.value ? '3px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)',
                }}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: theme === opt.value ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

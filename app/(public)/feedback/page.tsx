'use client';

import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/lib/hooks/useToast';
import { submitPublicFeedback } from '@/lib/api/cockpit.service';

// ── Types ────────────────────────────────────────────────────────────────────

type FeedbackCategory = 'bug' | 'feature' | 'ux' | 'performance' | 'geral' | 'elogio';

interface CategoryOption {
  value: FeedbackCategory;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Sugestao' },
  { value: 'ux', label: 'UX' },
  { value: 'performance', label: 'Performance' },
  { value: 'geral', label: 'Geral' },
  { value: 'elogio', label: 'Elogio' },
];

// ── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors sm:h-10 sm:w-10',
                isFilled
                  ? 'fill-[var(--bb-brand)] text-[var(--bb-brand)]'
                  : 'fill-transparent text-[var(--bb-ink-20)]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PublicFeedbackPage() {
  const { toast } = useToast();

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('geral');
  const [mensagem, setMensagem] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill from auth (best-effort)
  const [userId, setUserId] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<string | undefined>();

  useEffect(() => {
    async function tryLoadUser() {
      try {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setEmail(user.email ?? '');
          setNome(user.user_metadata?.full_name as string ?? '');

          // Try to get role from memberships
          const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .single();

          if (membership?.role) {
            setUserRole(membership.role);
          }
        }
      } catch {
        // Not logged in or supabase not configured — that's fine
      }
    }

    tryLoadUser();
  }, []);

  const isValid = mensagem.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid) {
      toast('A mensagem deve ter pelo menos 10 caracteres.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const success = await submitPublicFeedback({
        product: 'blackbelt',
        user_id: userId,
        user_name: nome.trim() || undefined,
        user_email: email.trim() || undefined,
        user_role: userRole,
        category,
        message: mensagem.trim(),
        rating: rating > 0 ? rating : undefined,
      });

      if (success) {
        toast('Obrigado pelo seu feedback! Vamos analisar em breve.', 'success');
        // Clear form
        setNome('');
        setEmail('');
        setCategory('geral');
        setMensagem('');
        setRating(0);
      } else {
        toast('Erro ao enviar feedback. Tente novamente.', 'error');
      }
    } catch {
      toast('Erro ao enviar feedback. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 pb-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Envie seu Feedback
        </h1>
        <p
          className="mt-2 text-sm sm:text-base"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Sua opiniao nos ajuda a melhorar o BlackBelt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <label
            htmlFor="fb-nome"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Nome <span style={{ color: 'var(--bb-ink-20)' }}>(opcional)</span>
          </label>
          <input
            id="fb-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1"
            style={{
              borderColor: 'var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-100)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-brand)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--bb-brand)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="fb-email"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Email <span style={{ color: 'var(--bb-ink-20)' }}>(opcional)</span>
          </label>
          <input
            id="fb-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1"
            style={{
              borderColor: 'var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-100)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-brand)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--bb-brand)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Categoria */}
        <div>
          <label
            htmlFor="fb-category"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Categoria
          </label>
          <select
            id="fb-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1"
            style={{
              borderColor: 'var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-100)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-brand)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--bb-brand)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagem */}
        <div>
          <label
            htmlFor="fb-mensagem"
            className="mb-1.5 block text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Mensagem <span style={{ color: 'var(--bb-brand)' }}>*</span>
          </label>
          <textarea
            id="fb-mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Conte-nos o que voce pensa..."
            rows={5}
            minLength={10}
            required
            className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1"
            style={{
              borderColor: 'var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-100)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-brand)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--bb-brand)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bb-glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <p
            className="mt-1 text-right text-xs"
            style={{
              color: mensagem.trim().length < 10 && mensagem.trim().length > 0
                ? 'var(--bb-brand)'
                : 'var(--bb-ink-20)',
            }}
          >
            {mensagem.trim().length}/10 caracteres minimos
          </p>
        </div>

        {/* Avaliacao (stars) */}
        <Card className="p-5">
          <p
            className="mb-3 text-center text-sm font-medium"
            style={{ color: 'var(--bb-ink-80)' }}
          >
            Avaliacao geral <span style={{ color: 'var(--bb-ink-20)' }}>(opcional)</span>
          </p>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <p
              className="mt-2 text-center text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              {rating} de 5 estrelas
            </p>
          )}
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={!isValid || submitting}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar Feedback
        </Button>
      </form>
    </div>
  );
}

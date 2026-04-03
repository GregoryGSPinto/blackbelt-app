# BLACKBELT v2 — GOOGLE + APPLE OAuth VIA SUPABASE
# Botões de login social funcionais

## CONTEXTO

Os botões Google e Apple no login existem mas não fazem nada.
Supabase gerencia todo o fluxo OAuth (redirect, token, sessão).
O código precisa chamar `supabase.auth.signInWithOAuth()` e tratar o callback.

Supabase projeto: `tdplmmodmumryzdosmpv`
URL: `https://tdplmmodmumryzdosmpv.supabase.co`
Callback URL: `https://tdplmmodmumryzdosmpv.supabase.co/auth/v1/callback`
Vercel: `blackbelts.com.br`

---

## REGRAS

1. **NÃO quebrar o login por email.** OAuth é adicional.
2. **isMock():** Em mock mode, botões OAuth mostram toast "OAuth disponível apenas em produção".
3. **handleServiceError** em cada catch.
4. **Redirect pós-login:** Após OAuth, buscar profile → redirect por role (igual email).
5. **pnpm typecheck && pnpm build** — ZERO erros.

---

## SEÇÃO 1 — CÓDIGO DO OAuth (o que o Claude Code faz)

### 1A. Criar lib/auth/oauth.ts

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/utils/mock';

export type OAuthProvider = 'google' | 'apple';

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  if (isMock()) {
    throw new Error('OAuth disponível apenas em produção. Use email/senha para testar.');
  }

  const supabase = getSupabaseClient();

  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      : 'https://blackbelts.com.br/auth/callback';

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined,
    },
  });

  if (error) {
    throw new Error(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Apple'}: ${error.message}`);
  }
}
```

### 1B. Criar app/auth/callback/route.ts (ou page.tsx)

Este é o ponto onde o Supabase redireciona após o OAuth.
Precisa trocar o `code` por uma sessão e redirecionar para o dashboard correto.

Verificar se já existe:
```bash
find app -path "*auth/callback*" | head -5
```

Se NÃO existe, criar `app/auth/callback/route.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', req.url));
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );

  // Trocar code por sessão
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[OAuth callback] Exchange error:', exchangeError.message);
    return NextResponse.redirect(new URL('/login?error=exchange_failed', req.url));
  }

  // Buscar profile para saber o role
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=no_user', req.url));
  }

  // Buscar profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // Se não tem profile, pode ser primeiro login via OAuth
  // Redirecionar para completar cadastro
  if (!profile) {
    return NextResponse.redirect(new URL('/completar-cadastro', req.url));
  }

  // Redirect por role
  const roleRoutes: Record<string, string> = {
    super_admin: '/superadmin',
    admin: '/admin',
    professor: '/professor',
    recepcionista: '/recepcao',
    aluno_adulto: '/aluno',
    aluno_teen: '/teen',
    aluno_kids: '/kids',
    responsavel: '/responsavel',
    franqueador: '/franqueador',
  };

  const destination = roleRoutes[profile.role] || '/';
  return NextResponse.redirect(new URL(destination, req.url));
}
```

### 1C. Criar app/completar-cadastro/page.tsx

Quando alguém faz login via Google/Apple pela PRIMEIRA vez, não tem profile no banco.
Precisa de uma tela para completar o cadastro (escolher academia, role, etc).

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function CompletarCadastroPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        // Verificar se já tem profile
        supabase.from('profiles').select('role').eq('user_id', data.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              // Já tem profile, redirecionar
              router.replace('/login');
            }
          });
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/complete-oauth-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          inviteCode: inviteCode || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao completar cadastro');

      // Redirect para o dashboard do role
      const roleRoutes: Record<string, string> = {
        admin: '/admin', professor: '/professor', aluno_adulto: '/aluno',
        aluno_teen: '/teen', aluno_kids: '/kids', responsavel: '/responsavel',
      };
      router.replace(roleRoutes[data.role] || '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bb-depth-0)' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bb-depth-0)' }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--bb-ink-100)' }}>Quase lá!</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--bb-ink-400)' }}>
          Bem-vindo(a), {user?.user_metadata?.full_name || user?.email}. Complete seu cadastro.
        </p>

        {user?.user_metadata?.avatar_url && (
          <div className="flex justify-center mb-6">
            <img src={user.user_metadata.avatar_url} alt="Avatar"
                 className="w-16 h-16 rounded-full border-2" style={{ borderColor: '#C62828' }} />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--bb-ink-300)' }}>
              Código de convite (se tiver)
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Ex: GUERREIROS2026"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-500)' }}>
              Recebeu um convite da sua academia? Cole o código aqui.
            </p>
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs"
                 style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            style={{ background: '#C62828' }}
          >
            {submitting ? 'Processando...' : inviteCode ? 'Entrar na Academia' : 'Continuar sem Convite'}
          </button>

          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--bb-ink-500)' }}>
              É dono de academia?{' '}
              <a href="/cadastrar-academia" className="underline" style={{ color: '#C62828' }}>
                Cadastre sua academia aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 1D. Criar API route para completar OAuth signup

`app/api/complete-oauth-signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { try { cookieStore.set({ name, value, ...options }); } catch {} },
        remove(name, options) { try { cookieStore.set({ name, value: '', ...options }); } catch {} },
      },
    }
  );

  // Verificar que o user está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== body.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let role = 'aluno_adulto'; // default
  let academyId: string | null = null;

  // Se tem invite code, processar
  if (body.inviteCode) {
    const { data: invite } = await supabase
      .from('invites')
      .select('*')
      .eq('code', body.inviteCode)
      .eq('status', 'active')
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Código de convite inválido ou expirado' }, { status: 400 });
    }

    role = invite.role || 'aluno_adulto';
    academyId = invite.academy_id;

    // Marcar convite como usado
    await supabase
      .from('invites')
      .update({ status: 'used', used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', invite.id);
  }

  // Criar profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    user_id: user.id,
    email: body.email,
    display_name: body.name || body.email.split('@')[0],
    role,
    academy_id: academyId,
    avatar_url: body.avatarUrl,
    status: 'active',
  }, { onConflict: 'user_id' });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Criar membership se tem academia
  if (academyId) {
    await supabase.from('memberships').upsert({
      profile_id: user.id,
      academy_id: academyId,
      role,
      status: 'active',
    }, { onConflict: 'profile_id,academy_id' });
  }

  return NextResponse.json({ role, academyId });
}
```

### 1E. Atualizar os botões de OAuth no login page

Encontrar os botões Google e Apple no `app/(auth)/login/page.tsx` e conectar:

```typescript
import { signInWithOAuth } from '@/lib/auth/oauth';
import { isMock } from '@/lib/utils/mock';

// No componente, adicionar state:
const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

// Handler:
const handleOAuth = async (provider: 'google' | 'apple') => {
  if (isMock()) {
    // Em mock, mostrar toast ou alert
    alert('OAuth disponível apenas em produção. Use as contas demo abaixo.');
    return;
  }
  
  setOauthLoading(provider);
  try {
    await signInWithOAuth(provider);
    // Supabase vai redirecionar para o provider
    // Não precisa fazer nada aqui — o redirect acontece automaticamente
  } catch (err: any) {
    setLocalError(err.message);
    setOauthLoading(null);
  }
};
```

Nos botões, trocar `type="button"` sem onClick por:

```tsx
<button
  type="button"
  onClick={() => handleOAuth('google')}
  disabled={oauthLoading === 'google'}
  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-200)', border: '1px solid var(--bb-glass-border)' }}
>
  {oauthLoading === 'google' ? (
    <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24">
      {/* Google icon SVG paths */}
    </svg>
  )}
  Google
</button>
```

Mesmo padrão para Apple.

### 1F. Atualizar middleware — /auth/callback e /completar-cadastro como rotas públicas

```bash
grep "PUBLIC_PATHS\|publicRoutes\|PUBLIC_ROUTES" middleware.ts
```

Adicionar `/auth/callback` e `/completar-cadastro` ao array de rotas públicas.

### 1G. Atualizar AuthContext — listener de auth state

No AuthContext, adicionar listener para detectar login via OAuth (o user retorna do redirect do provider):

```typescript
useEffect(() => {
  if (isMock()) return;

  const supabase = getSupabaseClient();

  // Verificar sessão existente
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadProfile(session.user);
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  });

  // Listener para mudanças de auth (OAuth redirect, logout, etc.)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

async function loadProfile(user: any) {
  const supabase = getSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profile) {
    setState({
      user: { id: user.id, email: user.email! },
      profile: { ...profile, role: normalizeRole(profile.role) },
      loading: false,
      error: null,
    });
  } else {
    // OAuth user sem profile — redirecionar para completar cadastro
    setState(prev => ({ ...prev, loading: false }));
    if (typeof window !== 'undefined' && !window.location.pathname.includes('completar-cadastro')) {
      window.location.href = '/completar-cadastro';
    }
  }
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Google + Apple OAuth — signInWithOAuth, callback route, complete signup flow, auth listener`

---

## SEÇÃO 2 — INSTRUÇÕES MANUAIS PARA GREGORY

O Code NÃO consegue fazer essas etapas. Gregory precisa fazer manualmente.

Imprimir no output do Code:

```
═══════════════════════════════════════════════════════
📋 AÇÕES MANUAIS — CONFIGURAR GOOGLE + APPLE OAuth
═══════════════════════════════════════════════════════

━━━ GOOGLE OAuth ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Abra: https://console.cloud.google.com
2. Crie projeto "BlackBelt" (ou use existente)
3. Menu lateral → APIs & Services → Credentials
4. Clique "+ CREATE CREDENTIALS" → "OAuth Client ID"
5. Application type: "Web application"
6. Name: "BlackBelt Login"
7. Authorized redirect URIs: ADICIONE ESTES DOIS:
   
   https://tdplmmodmumryzdosmpv.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   
8. Clique "Create"
9. COPIE o Client ID e Client Secret

10. Abra Supabase Dashboard:
    https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/auth/providers
11. Encontre "Google" na lista de providers
12. Toggle ON
13. Cole o Client ID e Client Secret
14. Clique "Save"

✅ Google OAuth configurado!

━━━ APPLE Sign In ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Requer Apple Developer Account ($99/ano)
   Se ainda não tem, pode pular e ativar depois.

1. Abra: https://developer.apple.com/account
2. Certificates, Identifiers & Profiles → Identifiers
3. Clique "+" → escolha "App IDs" → Continue
4. Description: "BlackBelt"
5. Bundle ID: "app.blackbelt.v2"
6. Marque "Sign In with Apple" → Continue → Register

7. Agora crie um Service ID:
   Identifiers → "+" → "Services IDs" → Continue
   Description: "BlackBelt Web Login"
   Identifier: "app.blackbelt.v2.web"
   Marque "Sign In with Apple" → Configure:
     - Primary App ID: selecione "BlackBelt"
     - Website URLs:
       Domain: blackbelts.com.br
       Return URL: https://tdplmmodmumryzdosmpv.supabase.co/auth/v1/callback
   Continue → Register

8. Crie uma Key:
   Keys → "+" → "BlackBelt Auth Key"
   Marque "Sign In with Apple" → Configure → selecione "BlackBelt"
   Continue → Register → BAIXE O ARQUIVO .p8 (GUARDE BEM!)
   Anote: Key ID

9. No Supabase Dashboard:
   Authentication → Providers → Apple → Toggle ON
   Cole:
   - Client ID: app.blackbelt.v2.web (o Service ID, NÃO o App ID)
   - Secret Key: conteúdo do arquivo .p8
   - Key ID: o Key ID anotado
   - Team ID: seu Apple Developer Team ID (está em Account → Membership)

✅ Apple Sign In configurado!

━━━ VERCEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Se ainda não tem, adicione na Vercel:
  NEXT_PUBLIC_APP_URL = https://blackbelts.com.br

━━━ TESTAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Acesse blackbelts.com.br/login
2. Clique "Google" → deve redirecionar para tela do Google
3. Faça login com sua conta Google
4. Se é primeira vez: vai para /completar-cadastro
5. Se já tem profile: vai para o dashboard do role

Se der erro "redirect_uri_mismatch":
  → Verifique que a URI no Google Console bate EXATAMENTE
  → https://tdplmmodmumryzdosmpv.supabase.co/auth/v1/callback

═══════════════════════════════════════════════════════
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit final:** `feat: OAuth complete — Google + Apple login, callback, signup flow, manual setup instructions`
**Push.**

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_OAUTH.md. Verifique: ls lib/auth/oauth.ts 2>/dev/null && ls app/auth/callback/ 2>/dev/null && ls app/completar-cadastro/ 2>/dev/null && pnpm typecheck 2>&1 | tail -5. Continue da parte incompleta. ZERO erros. Commit e push. Comece agora.
```

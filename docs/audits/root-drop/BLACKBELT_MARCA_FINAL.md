# BLACKBELT v2 — PROMPT FINAL: MARCA CONSOLIDADA NO MERCADO
## Tudo que falta para publicar nas lojas e ser um produto profissional
## Segurança, Performance, Polimento, Apple/Google Compliance, Testes Reais

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute FASE a FASE, na ordem (F1 → F2 → ... → F12)
> - Cada FASE termina com: `pnpm typecheck && pnpm build` → commit → push
> - Tempo estimado: 8-12 horas de execução contínua
> - Este é o ÚLTIMO prompt de código. Depois disso: apenas ações manuais do Gregory.
> - REGRAS DE SEMPRE: isMock() preservado, handleServiceError, var(--bb-*), PT-BR, nomes brasileiros

---

## FASE 1 — EXCLUIR MINHA CONTA (Apple rejeita sem isso)

A Apple exige que o usuário consiga deletar sua conta de DENTRO do app.
Não pode ser "mande email para suporte". Tem que ser botão funcional.
Referência: Apple Review Guideline 5.1.1(v)

### 1A. Edge function para deletar conta

Criar `supabase/functions/delete-account/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { confirmationText } = await req.json();

    if (confirmationText !== 'EXCLUIR MINHA CONTA') {
      return new Response(JSON.stringify({ error: 'Confirmação inválida' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Identificar quem está pedindo
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });

    // 1. Buscar todos os profiles do usuário
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role, academy_id, person_id')
      .eq('user_id', user.id);

    // 2. Arquivar profiles (não deletar — preserva integridade referencial)
    for (const profile of profiles || []) {
      await supabase
        .from('profiles')
        .update({
          lifecycle_status: 'archived',
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      // Se é responsável, NÃO deletar family_links (os filhos precisam continuar vinculados à academia)
      // Apenas marcar que este responsável não está mais ativo
    }

    // 3. Anonimizar dados pessoais na tabela people (LGPD)
    for (const profile of profiles || []) {
      if (profile.person_id) {
        await supabase
          .from('people')
          .update({
            full_name: 'Usuário removido',
            cpf: null,
            phone: null,
            email: null,
            avatar_url: null,
            medical_notes: null,
            emergency_contact_name: null,
            emergency_contact_phone: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.person_id);
      }
    }

    // 4. Anonimizar profile
    for (const profile of profiles || []) {
      await supabase
        .from('profiles')
        .update({
          display_name: 'Usuário removido',
          email: null,
          phone: null,
          avatar_url: null,
        })
        .eq('id', profile.id);
    }

    // 5. Log de exclusão (para auditoria LGPD — 5 anos)
    await supabase.from('account_deletion_log').insert({
      user_id: user.id,
      email_hash: await hashEmail(user.email || ''),
      profiles_archived: (profiles || []).map(p => p.id),
      requested_at: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    });

    // 6. Deletar conta Auth (irreversível)
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteErr) throw deleteErr;

    return new Response(JSON.stringify({
      success: true,
      message: 'Conta excluída com sucesso. Seus dados foram anonimizados conforme a LGPD.',
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

async function hashEmail(email: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 1B. Migration para log de exclusão

Adicionar ao final da migration de usabilidade (ou criar nova):

```sql
CREATE TABLE IF NOT EXISTS account_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  profiles_archived UUID[] DEFAULT '{}',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address VARCHAR(45),
  -- Manter por 5 anos para auditoria LGPD
  expires_at TIMESTAMPTZ DEFAULT now() + interval '5 years'
);

ALTER TABLE account_deletion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletion_log_superadmin" ON account_deletion_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);
```

### 1C. Componente DeleteAccountSection

Criar `components/settings/DeleteAccountSection.tsx`:

```typescript
// Seção "Zona de Perigo" nas configurações de TODOS os perfis
// 1. Texto explicando o que acontece ao excluir
// 2. Botão vermelho "Excluir Minha Conta"
// 3. Modal de confirmação com:
//    - "Esta ação é IRREVERSÍVEL"
//    - "Seus dados serão anonimizados conforme a LGPD"
//    - "Seus filhos vinculados continuarão na academia"
//    - Campo: "Digite EXCLUIR MINHA CONTA para confirmar"
//    - Botão vermelho: "Confirmar Exclusão" (desabilitado até digitar corretamente)
//    - Botão cinza: "Cancelar"
// 4. Ao confirmar: chamar edge function → logout → redirect para /login com toast
//
// IMPORTANTE:
// - Se o perfil é ADMIN e é o ÚNICO admin da academia → bloquear exclusão
//   "Você é o único administrador desta academia. Transfira a administração antes de excluir."
// - Se é RESPONSÁVEL de menores ativos → avisar:
//   "Seus filhos continuarão matriculados. A academia será notificada."
// - Se é SUPERADMIN (Gregory) → NÃO mostrar esta seção
```

### 1D. Integrar em TODAS as páginas de configurações

Verificar e adicionar `<DeleteAccountSection />` em:
- `app/(admin)/admin/configuracoes/page.tsx`
- `app/(professor)/professor/configuracoes/page.tsx`
- `app/(main)/dashboard/configuracoes/page.tsx` (aluno adulto)
- `app/(teen)/teen/configuracoes/page.tsx`
- `app/(parent)/parent/configuracoes/page.tsx`
- `app/(recepcao)/recepcao/configuracoes/page.tsx`
- NÃO adicionar no SuperAdmin nem no Kids (kids não tem conta própria)

Posição: ÚLTIMA seção da página, abaixo de tudo, com separador vermelho sutil.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: account deletion — Apple compliance 5.1.1(v) + LGPD anonymization`

---

## FASE 2 — CONSENTIMENTO PARENTAL ROBUSTO (Apple Kids Category)

A Apple exige que apps que lidam com menores tenham consentimento parental verificável.
Referência: Apple Guideline 1.3 (Kids Category), COPPA compliance.

### 2A. Fluxo de consentimento parental

Criar `components/legal/ParentalConsentFlow.tsx`:

```typescript
// Este componente aparece ANTES de um menor usar o app.
// Não é um checkbox simples — é um fluxo verificável.
//
// FLUXO:
// 1. Tela: "Para usar o BlackBelt, um responsável precisa autorizar"
//    - Botão: "Meu responsável está comigo agora"
//
// 2. Tela para o RESPONSÁVEL (verificação de idade):
//    - "Para confirmar que você é o responsável, responda:"
//    - "Qual é o seu ano de nascimento?" → select dropdown (1940-2010)
//    - Se idade < 18 → "Você precisa ser maior de idade para autorizar"
//    - Se idade >= 18 → continua
//
// 3. Tela de consentimento:
//    - Texto claro sobre quais dados são coletados do menor:
//      * Nome e data de nascimento
//      * Dados de presença e evolução na academia
//      * Fotos de perfil (se enviadas)
//      * NÃO coletamos localização do menor
//      * NÃO compartilhamos dados com terceiros
//      * NÃO exibimos anúncios
//    - Checkbox: "Li e concordo com a Política de Privacidade para Menores"
//    - Checkbox: "Autorizo [nome do menor] a usar o BlackBelt na academia [nome]"
//    - Nome do responsável (pré-preenchido se logado)
//    - Botão: "Autorizar"
//
// 4. Registro:
//    - Salvar no profile do menor: parental_consent = { 
//        granted: true, 
//        grantedBy: responsavelId, 
//        grantedAt: timestamp, 
//        guardianBirthYear: year,
//        ip: ip_address 
//      }
//    - Enviar email pro responsável confirmando a autorização
//
// QUANDO EXIBIR:
// - Quando um Kids ou Teen loga pela primeira vez
// - Quando o responsável cria um perfil Kids/Teen
// - Se parental_consent.granted é false no profile

// Salvar consentimento na coluna parental_controls JSONB do profile:
// { ...existingControls, consent: { granted: true, grantedBy, grantedAt, ip } }
```

### 2B. Adicionar campo de consentimento na migration

```sql
-- Já temos parental_controls JSONB — o consentimento vai dentro dele
-- Formato esperado:
-- {
--   "canChangeEmail": false,
--   "canChangePassword": false,
--   ...
--   "consent": {
--     "granted": true,
--     "grantedBy": "person-id-do-pai",
--     "grantedAt": "2026-03-27T10:00:00Z",
--     "guardianBirthYear": 1985,
--     "ip": "191.xxx.xxx.xxx",
--     "version": "1.0"
--   }
-- }
```

### 2C. Middleware de consentimento

No middleware ou no layout do TeenShell/KidsShell:
- Verificar `profile.parental_controls?.consent?.granted`
- Se false/null → redirecionar para `/consentimento-parental`
- Se true → continuar normalmente

Criar `app/(auth)/consentimento-parental/page.tsx` que renderiza `<ParentalConsentFlow />`

### 2D. Política de Privacidade para Menores

Criar `app/(public)/privacidade-menores/page.tsx`:
- Texto específico sobre coleta de dados de menores
- Quais dados: nome, nascimento, presença, evolução, fotos
- Quais NÃO: localização, contatos, conteúdo gerado, tracking publicitário
- Direitos do responsável: revogar a qualquer momento, solicitar exclusão
- Retenção: dados arquivados após saída, deletados após 5 anos
- Link para esta página na App Store (Privacy Policy URL)

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: parental consent flow — Apple 1.3 + COPPA + LGPD for minors`

---

## FASE 3 — PAGINAÇÃO REAL EM TODAS AS LISTAS

Sem paginação, uma academia com 500 alunos trava o app. Isso é inaceitável.

### 3A. Hook de paginação reutilizável

Criar `lib/hooks/usePagination.ts`:

```typescript
import { useState, useCallback } from 'react';

interface PaginationConfig {
  pageSize?: number;
  initialPage?: number;
}

interface PaginationState<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  hasMore: boolean;
  // Ações
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setData: (data: T[], totalCount: number) => void;
  setLoading: (loading: boolean) => void;
}

export function usePagination<T>(config: PaginationConfig = {}): PaginationState<T> {
  const pageSize = config.pageSize || 20;
  const [page, setPage] = useState(config.initialPage || 1);
  const [data, setDataState] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  const setData = useCallback((newData: T[], count: number) => {
    setDataState(newData);
    setTotalCount(count);
  }, []);

  return {
    data,
    page,
    pageSize,
    totalCount,
    totalPages,
    isLoading,
    hasMore,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    goToPage: setPage,
    setData,
    setLoading: setIsLoading,
  };
}
```

### 3B. Componente de paginação

Criar `components/shared/PaginationControls.tsx`:

```typescript
// Componente visual de paginação:
// [← Anterior] Página 3 de 25 [Próxima →]
// Mostrando 41-60 de 500 resultados
//
// Props:
// - page, totalPages, totalCount, pageSize
// - onPrevPage, onNextPage, onGoToPage
// - isLoading
//
// Mobile: botões grandes (h-12), texto simplificado
// Desktop: mostra números das páginas (1 ... 3 4 5 ... 25)
```

### 3C. Atualizar services com suporte a paginação

Para CADA service que retorna listas, adicionar parâmetros `page` e `pageSize`:

```typescript
// Padrão para queries paginadas:
export async function listStudents(academyId: string, options: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  classId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{ data: Student[]; totalCount: number }> {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (isMock()) {
    const allData = getMockStudents(academyId);
    const filtered = options.search
      ? allData.filter(s => s.name.toLowerCase().includes(options.search!.toLowerCase()))
      : allData;
    return {
      data: filtered.slice(from, to + 1),
      totalCount: filtered.length,
    };
  }

  try {
    const supabase = createClient();
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('academy_id', academyId)
      .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
      .range(from, to);

    if (options.search) {
      query = query.or(`display_name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
    }
    if (options.status) {
      query = query.eq('lifecycle_status', options.status);
    }
    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder !== 'desc' });
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { data: data || [], totalCount: count || 0 };
  } catch (error) {
    throw handleServiceError(error, 'listStudents');
  }
}
```

### 3D. Services que PRECISAM de paginação (verificar e atualizar cada um)

```bash
# Encontrar todos os services que retornam arrays (listas)
grep -rn "Promise<.*\[\]>" lib/api/ --include="*.ts" | grep -v "mock\|test\|node_modules" | head -30
```

Os prioritários (listas que podem ter centenas de itens):
1. `admin-dashboard.service.ts` — lista de alunos
2. `class.service.ts` — lista de alunos por turma
3. `invites.service.ts` — lista de convites
4. `trial.service.ts` — lista de experimentais
5. `recepcao-dashboard.service.ts` — lista de check-ins do dia
6. `responsavel.service.ts` — lista de presenças do filho
7. `announcement.service.ts` — lista de comunicados
8. `contracts.service.ts` — lista de contratos
9. `student_timeline_events` — timeline (usar infinite scroll)
10. `data_health_issues` — lista de inconsistências

Para cada um: adicionar `page`, `pageSize` nos parâmetros, usar `.range(from, to)` no Supabase, retornar `{ data, totalCount }`.

### 3E. Atualizar páginas de listagem

Para cada página que renderiza lista longa:
- Importar `usePagination` e `PaginationControls`
- Substituir `useEffect` que carrega tudo de uma vez por query paginada
- Adicionar campo de busca/filtro se não existe
- Adicionar `<PaginationControls />` no rodapé da lista
- Timeline do aluno: usar infinite scroll (carregar mais ao scrollar)

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real pagination — usePagination hook + PaginationControls + all list services`

---

## FASE 4 — TRATAMENTO DE ERROS ROBUSTO

### 4A. Error boundary global

Criar `components/error/GlobalErrorBoundary.tsx`:

```typescript
// React Error Boundary que:
// 1. Captura erros de renderização
// 2. Mostra tela amigável: "Algo deu errado. Tente novamente."
// 3. Botão "Tentar novamente" que faz reload
// 4. Botão "Reportar problema" que envia pra Sentry com contexto
// 5. Envia para Sentry automaticamente com user context
//
// Wrapper: colocar em app/layout.tsx envolvendo {children}
```

### 4B. Hook para queries com retry

Criar `lib/hooks/useQuery.ts`:

```typescript
// Hook que encapsula chamada de service com:
// 1. Loading state
// 2. Error state com mensagem amigável
// 3. Retry automático (1x após 2s) em caso de erro de rede
// 4. Retry manual (botão "Tentar novamente")
// 5. Stale-while-revalidate (mostra dados antigos enquanto recarrega)
// 6. Token refresh automático quando Supabase retorna 401
//
// Uso:
// const { data, isLoading, error, retry } = useQuery(
//   () => listStudents(academyId, { page }),
//   [academyId, page]
// );

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isRetrying: boolean;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { retryCount?: number; retryDelay?: number; staleTime?: number } = {}
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = options.retryCount ?? 1;
  const retryDelay = options.retryDelay ?? 2000;

  const execute = useCallback(async (isRetry = false) => {
    if (isRetry) setIsRetrying(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';

      // Retry automático em erro de rede
      if (retryCountRef.current < maxRetries && isNetworkError(err)) {
        retryCountRef.current++;
        setTimeout(() => execute(true), retryDelay);
        return;
      }

      // Token expirado → tentar refresh
      if (isAuthError(err)) {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          await supabase.auth.refreshSession();
          // Tentar de novo após refresh
          const result = await fetcher();
          setData(result);
          setError(null);
          return;
        } catch {
          setError('Sua sessão expirou. Faça login novamente.');
          return;
        }
      }

      setError(translateError(message));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { execute(); }, [execute]);

  return { data, isLoading, error, retry: () => execute(true), isRetrying };
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true;
  if (err instanceof Error && err.message.includes('NetworkError')) return true;
  return !navigator.onLine;
}

function isAuthError(err: unknown): boolean {
  if (err instanceof Error && (err.message.includes('401') || err.message.includes('JWT'))) return true;
  return false;
}

function translateError(message: string): string {
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
  }
  if (message.includes('duplicate key') || message.includes('already exists')) {
    return 'Este registro já existe no sistema.';
  }
  if (message.includes('foreign key') || message.includes('violates')) {
    return 'Não foi possível completar a ação. Existem registros vinculados.';
  }
  if (message.includes('permission') || message.includes('denied') || message.includes('403')) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'O registro não foi encontrado.';
  }
  if (message.includes('timeout')) {
    return 'A operação demorou demais. Tente novamente.';
  }
  return message;
}
```

### 4C. Componente de erro inline

Criar `components/shared/ErrorState.tsx`:

```typescript
// Componente visual para erro em listas/seções:
// ┌──────────────────────────────────┐
// │  ⚠️ Erro ao carregar dados       │
// │  Sem conexão com a internet.     │
// │                                  │
// │  [Tentar novamente]              │
// └──────────────────────────────────┘
//
// Props: message, onRetry, isRetrying
// Mobile-friendly: botão grande, texto claro
```

### 4D. Integrar nos componentes existentes

Para as 10 páginas mais críticas (dashboards de cada perfil):
- Substituir `useEffect + useState` manual por `useQuery`
- Adicionar `<ErrorState />` quando `error` não é null
- Adicionar `<GlobalErrorBoundary>` no `app/layout.tsx`

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: robust error handling — ErrorBoundary, useQuery with retry, ErrorState`

---

## FASE 5 — EMAIL TRANSACIONAL (Resend)

### 5A. Configurar Resend

```bash
pnpm add resend
```

Criar `lib/email/resend.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY não configurada — email não enviado');
    console.log(`[EMAIL] Para: ${options.to} | Assunto: ${options.subject}`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || `BlackBelt <noreply@${process.env.RESEND_DOMAIN || 'blackbelts.com.br'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar:', error);
    return { success: false, error };
  }
}
```

### 5B. Templates de email

Criar `lib/email/templates/`:

**welcome.ts** — Boas-vindas ao novo aluno:
```typescript
export function welcomeEmail(data: { name: string; academyName: string; loginUrl: string; tempPassword?: string }) {
  return {
    subject: `Bem-vindo à ${data.academyName}! 🥋`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #C62828;">Bem-vindo, ${data.name}!</h1>
        <p>Você foi cadastrado na academia <strong>${data.academyName}</strong>.</p>
        ${data.tempPassword ? `
          <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0;"><strong>Sua senha temporária:</strong> ${data.tempPassword}</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #666;">Você será solicitado a trocar no primeiro login.</p>
          </div>
        ` : ''}
        <a href="${data.loginUrl}" style="display: inline-block; background: #C62828; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Acessar BlackBelt
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">
          Este email foi enviado automaticamente pelo BlackBelt. Se você não se cadastrou, ignore este email.
        </p>
      </div>
    `,
  };
}
```

**invite.ts** — Convite para membro:
```typescript
export function inviteEmail(data: { name: string; academyName: string; role: string; inviteUrl: string; inviterName: string }) { ... }
```

**payment-reminder.ts** — Lembrete de pagamento:
```typescript
export function paymentReminderEmail(data: { name: string; amount: number; dueDate: string; paymentUrl: string; academyName: string }) { ... }
```

**parental-consent-confirmation.ts** — Confirmação de consentimento parental:
```typescript
export function parentalConsentEmail(data: { guardianName: string; childName: string; academyName: string; consentDate: string }) { ... }
```

**account-deleted.ts** — Confirmação de exclusão de conta:
```typescript
export function accountDeletedEmail(data: { name: string }) { ... }
```

### 5C. Integrar emails nos fluxos

1. **admin-create-user edge function** → após criar, enviar welcomeEmail
2. **Convite aceito** → enviar confirmação
3. **Consentimento parental** → enviar parentalConsentEmail pro responsável
4. **Delete account** → enviar accountDeletedEmail antes de deletar
5. **Lembrete de pagamento** (cron existente) → usar paymentReminderEmail

### 5D. API route para envio

Criar `app/api/emails/send/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import { welcomeEmail } from '@/lib/email/templates/welcome';
import { inviteEmail } from '@/lib/email/templates/invite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let template;
    switch (type) {
      case 'welcome': template = welcomeEmail(data); break;
      case 'invite': template = inviteEmail(data); break;
      // ... outros tipos
      default: return NextResponse.json({ error: 'Tipo de email inválido' }, { status: 400 });
    }

    const result = await sendEmail({ to: data.email || data.to, ...template });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: Resend email integration — welcome, invite, payment reminder, consent, deletion`

---

## FASE 6 — WHATSAPP LINKS REAIS

### 6A. Utility de geração de link WhatsApp

Criar `lib/utils/whatsapp.ts`:

```typescript
// Gera link wa.me que abre WhatsApp com mensagem pré-preenchida
// Não requer API do WhatsApp Business — funciona no celular do admin/recepcionista

export function generateWhatsAppLink(phone: string, message: string): string {
  // Limpar telefone: remover (, ), -, espaços
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Adicionar código do Brasil se não tem
  const fullPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  // Encode a mensagem
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

// Templates pré-definidos (substituir variáveis)
export function getWhatsAppMessage(template: string, variables: Record<string, string>): string {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replaceAll(`{${key}}`, value);
  }
  return message;
}

// Templates comuns
export const WA_TEMPLATES = {
  cobranca_vencendo: 'Olá {nome}! Sua mensalidade de R$ {valor} na {academia} vence amanhã ({data}). Pague pelo link: {link_pagamento}',
  cobranca_atrasada: 'Olá {nome}, sua mensalidade de R$ {valor} na {academia} está {dias} dias atrasada. Regularize pelo link: {link_pagamento}',
  convite_aluno: 'Olá {nome}! Você foi convidado para a academia {academia}. Acesse: {link_convite}',
  lembrete_aula: 'Olá {nome}! Lembrete: sua aula de {modalidade} é amanhã às {hora}. Te esperamos na {academia}! 🥋',
  aniversario: 'Feliz aniversário, {nome}! 🎂 A família {academia} deseja tudo de melhor pra você! 🥋',
  convite_teen: 'Olá! {nome_pai} cadastrou {nome_teen} na {academia}. Para ativar a conta, acesse: {link_ativacao}',
} as const;
```

### 6B. Botão "Enviar por WhatsApp" nos comunicados e cobranças

Criar `components/shared/WhatsAppButton.tsx`:

```typescript
// Botão verde com ícone do WhatsApp
// Ao clicar: abre wa.me no navegador (no mobile, abre o WhatsApp direto)
// Props: phone, message, label?, size?
//
// Uso:
// <WhatsAppButton
//   phone={aluno.phone}
//   message={getWhatsAppMessage(WA_TEMPLATES.cobranca_vencendo, {
//     nome: aluno.name,
//     valor: '229,00',
//     academia: 'Guerreiros BJJ',
//     data: '10/04/2026',
//     link_pagamento: 'https://...',
//   })}
// />
```

Integrar em:
- Lista de inadimplentes do admin: botão WhatsApp ao lado de cada aluno
- Detalhe do aluno: botão "Contatar por WhatsApp"
- Cobranças da recepção: botão por fatura
- Convites: botão "Enviar por WhatsApp" ao lado de "Enviar por Email"

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: WhatsApp link integration — templates + button component`

---

## FASE 7 — RELATÓRIOS PDF EXPORTÁVEIS

### 7A. Relatório de frequência em PDF

Criar `lib/reports/attendance-pdf.ts`:

```typescript
// Gerar PDF bonito de relatório de frequência:
// - Header: logo da academia + nome + período
// - Tabela: nome do aluno | turma | presenças | faltas | % frequência
// - Gráfico: top 10 mais frequentes (bar chart como SVG inline)
// - Rodapé: "Gerado pelo BlackBelt em {data}"
//
// Usar: jsPDF ou @react-pdf/renderer (escolher o que já estiver no package.json)
// Se nenhum existe, usar html2canvas + jsPDF
```

```bash
pnpm add jspdf jspdf-autotable
pnpm add -D @types/jspdf
```

### 7B. Relatório financeiro em PDF

```typescript
// - Header: logo + nome da academia + período
// - Resumo: total recebido, total pendente, total atrasado
// - Tabela: aluno | plano | valor | status | data pagamento
// - Gráfico: receita mensal (últimos 6 meses)
// - Rodapé
```

### 7C. Relatório do aluno para o responsável

```typescript
// Relatório mensal do filho:
// - Nome + foto + faixa + tempo de academia
// - Frequência do mês (heatmap simplificado ou tabela)
// - Evolução: conquistas, graduações
// - Notas do professor
// - Botão "Compartilhar no WhatsApp" (share do PDF)
```

### 7D. Botão "Exportar PDF" nas páginas de relatório

Nos dashboards e páginas de relatório do admin:
- Botão "📄 Exportar PDF" ao lado de "📊 Exportar CSV"
- Loading indicator durante geração
- Download automático do arquivo

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: PDF reports — attendance, financial, student report with logo`

---

## FASE 8 — SEGURANÇA FINAL

### 8A. Rate limiting nas API routes

Criar `lib/utils/rate-limit.ts`:

```typescript
// Rate limiter simples baseado em IP + endpoint
// Usa Map em memória (suficiente para Vercel serverless — cada instância tem seu próprio Map)
// Em produção pesada: migrar para Upstash Redis

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(identifier: string, options: { limit?: number; windowMs?: number } = {}): { success: boolean; remaining: number } {
  const limit = options.limit || 60; // 60 requests
  const windowMs = options.windowMs || 60000; // por minuto
  const now = Date.now();

  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
```

Integrar nas API routes mais sensíveis:
- `/api/students/create` → 10 req/min
- `/api/emails/send` → 20 req/min
- `/api/auth/login` → 5 req/min (brute force protection)

### 8B. Sanitização de inputs

Criar `lib/utils/sanitize.ts`:

```typescript
// Sanitizar inputs antes de salvar no banco:
// - Trim whitespace
// - Remover tags HTML (XSS prevention)
// - Validar formato de email, telefone, CPF
// - Limitar tamanho de campos de texto (max 1000 chars)

export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // remover HTML tags
    .replace(/[<>'"]/g, '') // remover caracteres perigosos
    .slice(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9()\-\s+]/g, '').trim();
}

export function sanitizeCPF(cpf: string): string {
  return cpf.replace(/[^0-9.\-]/g, '').trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  // Verificar dígitos repetidos
  if (/^(\d)\1+$/.test(digits)) return false;
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}
```

### 8C. Headers de segurança no Vercel

Verificar `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(self), microphone=(), geolocation=(self)" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### 8D. Verificar que RLS está ativo em TODAS as tabelas

```bash
# Script para verificar
cat > scripts/verify-rls.sql << 'EOF'
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
EOF
```

Se alguma tabela pública está com `rowsecurity = false` → é um risco de segurança. Ativar RLS e criar policies.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: security — rate limiting, input sanitization, security headers, RLS audit`

---

## FASE 9 — DATA SAFETY E PRIVACY DECLARATIONS

### 9A. Google Play Data Safety

Criar `docs/GOOGLE_DATA_SAFETY.md`:

```markdown
# BlackBelt v2 — Google Play Data Safety Declarations

## Dados coletados:

### Informações pessoais
- Nome ✅ (obrigatório para cadastro)
- Email ✅ (obrigatório para login, opcional para kids)
- Telefone ✅ (obrigatório para contato)
- Data de nascimento ✅ (para determinar faixa etária)
- CPF ⚠️ (opcional, usado para contratos)
- Fotos ⚠️ (opcional, perfil)

### Dados de uso
- Frequência/presença ✅ (funcionalidade core)
- Interações no app ✅ (analytics PostHog)
- Crash logs ✅ (Sentry)

### Dados financeiros
- Histórico de pagamentos ✅ (via Asaas — processado externamente)
- Plano/assinatura ✅

## Compartilhamento:
- Asaas: dados financeiros para processamento de pagamento
- Resend: email para envio de comunicações
- PostHog: dados anonimizados de uso
- Sentry: crash reports com contexto

## Segurança:
- Dados criptografados em trânsito (HTTPS/TLS)
- Dados criptografados em repouso (Supabase encripta)
- Usuário pode solicitar exclusão (botão in-app)

## Dados de menores:
- Coleta dados de menores de 13 anos COM consentimento parental verificável
- NÃO exibe anúncios
- NÃO compartilha dados de menores com terceiros
- NÃO rastreia localização de menores
```

### 9B. Apple App Privacy

Criar `docs/APPLE_APP_PRIVACY.md`:

```markdown
# BlackBelt v2 — Apple App Privacy Labels

## Contact Info (Linked to identity):
- Name
- Email Address
- Phone Number

## Identifiers (Linked to identity):
- User ID

## Usage Data (Linked to identity):
- Product Interaction

## Diagnostics (Not linked to identity):
- Crash Data
- Performance Data

## Health & Fitness (Linked to identity):
- Fitness (attendance/frequency data)

## Financial Info (Linked to identity):
- Payment Info (processed by Asaas, not stored in app)

## Data NOT collected:
- Location
- Contacts
- Browsing History
- Search History
- Sensitive Info
- Photos (only if user uploads voluntarily)
```

### 9C. Privacy Policy URL

A landing page já tem link de política de privacidade. Verificar que:
- URL funciona e é acessível sem login
- Conteúdo cobre LGPD, COPPA, e Apple requirements
- Menciona dados de menores explicitamente
- Tem data de última atualização
- Tem email de contato para solicitações

**Commit:** `docs: data safety declarations — Google Play + Apple App Privacy`

---

## FASE 10 — SCRIPT DE TESTE MANUAL DOS 10 FLUXOS CRÍTICOS

### 10A. Checklist de teste para o Gregory executar no browser

Criar `TESTE_MANUAL_10_FLUXOS.md`:

```markdown
# BlackBelt v2 — Teste Manual dos 10 Fluxos Críticos
# Executar no browser em https://blackbelts.com.br

## PRÉ-REQUISITO
- Migrations rodadas no Supabase
- Seeds rodados (principal + usabilidade)
- Deploy feito na Vercel

---

## FLUXO 1: Login de cada perfil
Para cada credencial abaixo, testar:
- [ ] Abre /login
- [ ] Digita email + senha
- [ ] Clica "Entrar"
- [ ] Redireciona para o dashboard correto
- [ ] Dashboard carrega dados (não fica spinner infinito)
- [ ] Nome do usuário aparece no header

Credenciais:
- [ ] admin@guerreiros.com / BlackBelt@2026 → /admin
- [ ] andre@guerreiros.com / BlackBelt@2026 → /professor
- [ ] joao@email.com / BlackBelt@2026 → /dashboard
- [ ] lucas.teen@email.com / BlackBelt@2026 → /teen
- [ ] patricia@email.com / BlackBelt@2026 → /parent
- [ ] julia@guerreiros.com / BlackBelt@2026 → /recepcao
- [ ] gregoryguimaraes12@gmail.com / @Greg1994 → /superadmin

---

## FLUXO 2: Admin cadastra aluno
- [ ] Login como admin
- [ ] Navega para /admin/alunos
- [ ] Clica "Cadastrar Aluno"
- [ ] Preenche: Nome "Teste Silva", Email "teste@teste.com", Telefone "(31) 99999-9999"
- [ ] Seleciona turma
- [ ] Clica "Cadastrar"
- [ ] Toast de sucesso aparece
- [ ] Aluno aparece na lista
- [ ] Se email fornecido: aluno consegue logar com senha temporária

---

## FLUXO 3: Criar família (admin)
- [ ] Login como admin
- [ ] Navega para /admin/cadastro-familia (ou botão "Criar Família")
- [ ] Step 1: preenche dados do responsável
- [ ] Step 2: adiciona filho (data nascimento → sistema detecta Kids ou Teen)
- [ ] Step 3: adiciona segundo filho (dados do responsável pré-preenchidos)
- [ ] Step 4: seleciona turma para cada filho
- [ ] Step 5: seleciona plano
- [ ] Step 6: revisa e confirma
- [ ] Toast de sucesso
- [ ] Responsável aparece na lista com filhos vinculados

---

## FLUXO 4: Responsável vê Central da Família
- [ ] Login como patricia@email.com
- [ ] Dashboard mostra filhos (Sophia e Miguel)
- [ ] Seletor de dependente funciona (trocar entre Sophia e Miguel)
- [ ] Agenda mostra aulas dos dois filhos
- [ ] Pagamentos mostra faturas consolidadas
- [ ] Total mensal correto
- [ ] Autorizações listam pendências (se existem)

---

## FLUXO 5: Responsável adiciona filho
- [ ] Login como responsável
- [ ] Navega para configurações → Meus Filhos
- [ ] Clica "Adicionar Filho"
- [ ] Preenche nome + data nascimento (8 anos = Kids)
- [ ] Salva
- [ ] Filho aparece na lista de dependentes
- [ ] Dashboard atualiza com novo filho

---

## FLUXO 6: Check-in do aluno
- [ ] Login como aluno adulto (joao@email.com)
- [ ] Dashboard mostra próxima aula
- [ ] Botão de check-in visível
- [ ] Clica check-in → toast "Presença registrada!"
- [ ] Frequência atualiza

---

## FLUXO 7: Professor faz chamada
- [ ] Login como professor (andre@guerreiros.com)
- [ ] Dashboard mostra "Aulas de hoje"
- [ ] Clica na turma → lista de alunos
- [ ] Marca presença de 3 alunos
- [ ] Salva chamada
- [ ] Toast de sucesso

---

## FLUXO 8: Comunicado por turma
- [ ] Login como admin
- [ ] Navega para comunicados → Novo comunicado
- [ ] Seleciona "Enviar para turma: BJJ Avançado"
- [ ] Escreve mensagem
- [ ] Preview mostra "Será enviado para X pessoas"
- [ ] Envia
- [ ] Login como aluno da turma → notificação aparece

---

## FLUXO 9: Pagamento do responsável
- [ ] Login como responsável
- [ ] Navega para pagamentos
- [ ] Vê faturas consolidadas por filho
- [ ] Fatura pendente mostra botão "Pagar"
- [ ] Clica pagar → abre link de pagamento (Asaas) ou mostra QR Pix

---

## FLUXO 10: Excluir conta
- [ ] Login como aluno de teste
- [ ] Navega para configurações
- [ ] Scrolla até "Zona de Perigo"
- [ ] Clica "Excluir Minha Conta"
- [ ] Modal pede confirmação
- [ ] Digita "EXCLUIR MINHA CONTA"
- [ ] Confirma
- [ ] Logout automático
- [ ] Tenta logar novamente → "Usuário não encontrado"

---

## RESULTADO

Para cada fluxo, anotar:
- ✅ Funciona completamente
- ⚠️ Funciona parcialmente (descrever o que não funcionou)
- ❌ Não funciona (descrever o erro)

Meta: 10/10 ✅ antes de submeter pras stores.
```

**Commit:** `docs: manual testing checklist — 10 critical flows`

---

## FASE 11 — GUIA DE SCREENSHOTS PARA AS STORES

### 11A. Screenshots necessárias

Criar `docs/STORE_SCREENSHOTS_GUIDE.md`:

```markdown
# Guia de Screenshots para App Store e Google Play

## Dimensões necessárias:
- iPhone 6.7" (1290×2796) — obrigatório App Store
- iPhone 6.5" (1284×2778) — obrigatório App Store
- Android (1290×2796 ou similar) — obrigatório Google Play

## Screenshots recomendadas (6 por plataforma):

### 1. Login/Welcome
- Tela de login com o visual escuro premium
- Mostrar os cards de demo com os 9 perfis
- Headline: "9 Perfis. Uma Plataforma."

### 2. Dashboard Admin
- Dashboard com dados bonitos (seed demo)
- KPIs, gráficos, ações rápidas
- Headline: "Gestão Completa da Sua Academia"

### 3. Central da Família
- Dashboard do responsável com seletor de filhos
- Agenda, frequência, pagamentos
- Headline: "Acompanhe Seus Filhos em Tempo Real"

### 4. Perfil Teen Gamificado
- Dashboard teen com XP, ranking, desafios
- Visual colorido e engajante
- Headline: "Transforme o Treino em Aventura"

### 5. Check-in QR
- Tela de check-in com QR code
- Visual limpo e profissional
- Headline: "Check-in em 2 Segundos"

### 6. Módulo Compete
- Tela de campeonato com bracket
- Visual esportivo
- Headline: "Organize Campeonatos Profissionais"

## Como gerar:
1. Rode o app no Xcode Simulator (iPhone 15 Pro Max para 6.7")
2. Faça login com admin@guerreiros.com
3. Navegue até cada tela
4. Screenshot: Cmd+S no Simulator
5. Use https://screenshots.pro para adicionar moldura e texto

## Textos para as stores:
- Título: "BlackBelt — Gestão de Academias"
- Subtítulo: "Artes Marciais · BJJ · Judô · MMA"
- Categoria: Business (ou Sports)
- Faixa etária: 4+ (com parental controls documentados)
```

**Commit:** `docs: store screenshots guide + texts`

---

## FASE 12 — VERIFICAÇÃO FINAL E DEPLOY

### 12A. Script de verificação completo

Criar `scripts/final-check.sh`:

```bash
#!/bin/bash
echo "🔍 VERIFICAÇÃO FINAL — BlackBelt v2"
echo "════════════════════════════════════"
echo ""

PASS=0
FAIL=0

check() {
  if [ $? -eq 0 ]; then
    echo "✅ $1"
    PASS=$((PASS + 1))
  else
    echo "❌ $1"
    FAIL=$((FAIL + 1))
  fi
}

# Build
echo "📦 Build..."
pnpm typecheck > /dev/null 2>&1
check "TypeScript — zero erros"

pnpm build > /dev/null 2>&1
check "Next.js build — sucesso"

# Estrutura
echo ""
echo "📁 Estrutura..."

test -f lib/api/family.service.ts
check "family.service.ts existe"

test -f lib/api/family-billing.service.ts
check "family-billing.service.ts existe"

test -f lib/api/data-health.service.ts
check "data-health.service.ts existe"

test -f lib/api/academy-settings.service.ts
check "academy-settings.service.ts existe"

test -f components/settings/DeleteAccountSection.tsx
check "DeleteAccountSection.tsx existe"

test -f components/legal/ParentalConsentFlow.tsx
check "ParentalConsentFlow.tsx existe"

test -f lib/hooks/usePagination.ts
check "usePagination.ts existe"

test -f lib/hooks/useQuery.ts
check "useQuery.ts existe"

test -f lib/email/resend.ts
check "Resend email existe"

test -f lib/utils/whatsapp.ts
check "WhatsApp utils existe"

test -f lib/utils/rate-limit.ts
check "Rate limit existe"

test -f lib/utils/sanitize.ts
check "Input sanitization existe"

test -f components/shared/PaginationControls.tsx
check "PaginationControls existe"

test -f components/error/GlobalErrorBoundary.tsx
check "GlobalErrorBoundary existe"

test -f components/shared/ErrorState.tsx
check "ErrorState existe"

test -f components/shared/WhatsAppButton.tsx
check "WhatsAppButton existe"

# Edge functions
echo ""
echo "⚡ Edge Functions..."

test -f supabase/functions/delete-account/index.ts
check "delete-account edge function"

test -f supabase/functions/admin-create-user/index.ts
check "admin-create-user edge function"

test -f supabase/functions/evolve-profile/index.ts
check "evolve-profile edge function"

# Migrations
echo ""
echo "📊 Migrations..."

ls supabase/migrations/*usability* > /dev/null 2>&1 || ls supabase/migrations/070* > /dev/null 2>&1
check "Migration de usabilidade existe"

# Documentação
echo ""
echo "📄 Documentação..."

test -f docs/GOOGLE_DATA_SAFETY.md
check "Google Data Safety"

test -f docs/APPLE_APP_PRIVACY.md
check "Apple App Privacy"

test -f TESTE_MANUAL_10_FLUXOS.md
check "Checklist de teste manual"

test -f docs/STORE_SCREENSHOTS_GUIDE.md
check "Guia de screenshots"

test -f INSTRUCOES_USABILIDADE.md
check "Instruções manuais"

# Segurança
echo ""
echo "🔒 Segurança..."

grep -q "X-Content-Type-Options" vercel.json 2>/dev/null
check "Security headers no vercel.json"

grep -q "resend" package.json 2>/dev/null
check "Resend no package.json"

grep -q "papaparse" package.json 2>/dev/null
check "Papaparse no package.json"

grep -q "jspdf" package.json 2>/dev/null
check "jsPDF no package.json"

# Páginas legais
echo ""
echo "⚖️ Páginas legais..."

test -f app/\(public\)/privacidade-menores/page.tsx
check "Política de privacidade para menores"

test -f components/legal/ParentalConsent.tsx
check "Componente de consentimento parental"

# Resultado
echo ""
echo "════════════════════════════════════"
echo "✅ Passou: $PASS"
echo "❌ Falhou: $FAIL"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 TUDO PRONTO! O BlackBelt v2 está pronto para as stores."
else
  echo "⚠️ $FAIL itens precisam de atenção antes de submeter."
fi
```

### 12B. Rodar verificação e corrigir

```bash
chmod +x scripts/final-check.sh
./scripts/final-check.sh
```

Se algum item falhou: corrigir antes de commitar.

### 12C. Deploy final

```bash
git add -A
git commit -m "feat: BlackBelt v2 — store-ready with security, compliance, performance, and polish"
git push origin main
```

Verificar que o deploy passou na Vercel.

**Commit final:** `release: BlackBelt v2 — ready for App Store and Google Play submission`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_MARCA_FINAL.md. Verifique estado:
ls supabase/functions/delete-account/index.ts 2>/dev/null && echo "F1 OK" || echo "F1 FALTA"
ls components/legal/ParentalConsentFlow.tsx 2>/dev/null && echo "F2 OK" || echo "F2 FALTA"
ls lib/hooks/usePagination.ts 2>/dev/null && echo "F3 OK" || echo "F3 FALTA"
ls lib/hooks/useQuery.ts 2>/dev/null && echo "F4 OK" || echo "F4 FALTA"
ls lib/email/resend.ts 2>/dev/null && echo "F5 OK" || echo "F5 FALTA"
ls lib/utils/whatsapp.ts 2>/dev/null && echo "F6 OK" || echo "F6 FALTA"
grep "jspdf" package.json 2>/dev/null && echo "F7 OK" || echo "F7 FALTA"
ls lib/utils/rate-limit.ts 2>/dev/null && echo "F8 OK" || echo "F8 FALTA"
ls docs/GOOGLE_DATA_SAFETY.md 2>/dev/null && echo "F9 OK" || echo "F9 FALTA"
ls TESTE_MANUAL_10_FLUXOS.md 2>/dev/null && echo "F10 OK" || echo "F10 FALTA"
ls docs/STORE_SCREENSHOTS_GUIDE.md 2>/dev/null && echo "F11 OK" || echo "F11 FALTA"
ls scripts/final-check.sh 2>/dev/null && echo "F12 OK" || echo "F12 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima fase incompleta. ZERO erros. Commit e push.
```

---

## O QUE FICA PARA O GREGORY (ações manuais)

Após este prompt, o código está 100%. Falta apenas:

1. **Rodar migrations** no Supabase SQL Editor (copiar/colar)
2. **Rodar seeds** no terminal (`npx tsx scripts/seed-usability.ts`)
3. **Configurar Resend** — criar conta em resend.com, verificar domínio, copiar API key pro .env
4. **Configurar Asaas** — criar conta, gerar chaves, configurar webhooks
5. **Deploy edge functions** — `supabase functions deploy delete-account admin-create-user evolve-profile`
6. **Testar os 10 fluxos** no browser com o checklist `TESTE_MANUAL_10_FLUXOS.md`
7. **Gerar screenshots** seguindo `STORE_SCREENSHOTS_GUIDE.md`
8. **Criar contas nas stores** — Apple Developer ($99/ano) + Google Play ($25)
9. **Preencher Data Safety** — copiar de `GOOGLE_DATA_SAFETY.md` e `APPLE_APP_PRIVACY.md`
10. **Submeter** — Google Play primeiro (review 2-3 dias), depois Apple (5-7 dias)

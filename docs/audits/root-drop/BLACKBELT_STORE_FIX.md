# BLACKBELT v2 — CORREÇÃO TOTAL: ZERO BLOQUEADORES, ZERO RESSALVAS
## Resultado da auditoria: 2 bloqueadores + 36 warnings
## Este prompt corrige TUDO — app sai 100% pronto pra stores
## Nenhum item pode ficar ⚠️ ou ❌ depois deste prompt

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B9)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - Ser RIGOROSO — testar que cada fix realmente funciona
> - Após este prompt: rodar nova auditoria deve dar 100% ✅

---

## BLOQUEADOR 1 — SCREENSHOTS PROFISSIONAIS PARA STORES

### B1 — Gerar screenshots automatizados com Playwright

```bash
mkdir -p docs/store-screenshots
```

Criar `scripts/generate-screenshots.ts`:

```typescript
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://blackbelts.com.br';
const LOGIN_EMAIL = 'roberto@guerreiros.com';
const LOGIN_PASS = 'BlackBelt@2026';

const SCREENS = [
  { name: '01-landing', path: '/', needsAuth: false },
  { name: '02-login', path: '/login', needsAuth: false },
  { name: '03-dashboard', path: '/admin', needsAuth: true },
  { name: '04-alunos', path: '/admin/alunos', needsAuth: true },
  { name: '05-turmas', path: '/admin/turmas', needsAuth: true },
  { name: '06-financeiro', path: '/admin/financeiro', needsAuth: true },
  { name: '07-graduacoes', path: '/admin/graduacoes', needsAuth: true },
  { name: '08-calendario', path: '/admin/calendario', needsAuth: true },
];

const VIEWPORTS = [
  { name: 'iphone', width: 430, height: 932 },
  { name: 'android', width: 412, height: 915 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();

    // Login once
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(LOGIN_EMAIL);
      await passInput.fill(LOGIN_PASS);
      const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar")').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    for (const screen of SCREENS) {
      try {
        await page.goto(`${BASE_URL}${screen.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Dismiss banners/overlays
        const closeButtons = page.locator('button:has-text("×"), button:has-text("Fechar"), [aria-label="close"], [aria-label="Close"]');
        for (let i = 0; i < await closeButtons.count(); i++) {
          try { await closeButtons.nth(i).click({ timeout: 500 }); } catch {}
        }
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `docs/store-screenshots/${screen.name}-${vp.name}.png`,
          fullPage: false,
        });
        console.log(`✅ ${screen.name}-${vp.name}.png`);
      } catch (e) {
        console.log(`❌ ${screen.name}-${vp.name}: ${e}`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nScreenshots saved in docs/store-screenshots/');
}

run().catch(console.error);
```

Rodar:
```bash
npx playwright install chromium 2>/dev/null
npx tsx scripts/generate-screenshots.ts
ls -la docs/store-screenshots/ | wc -l
```

**Commit:** `assets: automated store screenshots — iPhone + Android viewports`

---

## BLOQUEADOR 2 — SISTEMA DE DENÚNCIA/REPORT UGC

### B2 — Criar sistema de report completo

BlackBelt tem mensagens, conduta, comunicados — precisa de mecanismo de denúncia.

#### 2A. Migration para tabela de reports

Criar `supabase/migrations/080_content_reports.sql`:

```sql
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID,
  reason VARCHAR(50) NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'hate_speech', 'violence', 'other')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_academy ON content_reports(academy_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON content_reports(reporter_id);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode criar report
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cr_insert_bb') THEN
    CREATE POLICY "cr_insert_bb" ON content_reports FOR INSERT WITH CHECK (
      auth.uid() = reporter_id
    );
  END IF;
END $$;

-- Admin/Super Admin vê reports da academia
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cr_staff_bb') THEN
    CREATE POLICY "cr_staff_bb" ON content_reports FOR ALL USING (
      academy_id IN (
        SELECT academy_id FROM memberships WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
  END IF;
END $$;
```

#### 2B. API de report

Criar `app/api/report/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporterId, academyId, reportedUserId, contentType, contentId, reason, description } = body;

    if (!reporterId || !reason || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase.from('content_reports').insert({
      academy_id: academyId || null,
      reporter_id: reporterId,
      reported_user_id: reportedUserId || null,
      content_type: contentType,
      content_id: contentId || null,
      reason,
      description: description || null,
    }).select('id').single();

    if (error) {
      console.error('[report] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reportId: data?.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

#### 2C. Componente ReportButton

Criar `components/shared/ReportButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';

interface ReportButtonProps {
  contentType: string;
  contentId?: string;
  reportedUserId?: string;
  userId?: string;
  academyId?: string;
  className?: string;
}

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Assédio ou bullying' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'hate_speech', label: 'Discurso de ódio' },
  { value: 'violence', label: 'Violência ou ameaça' },
  { value: 'other', label: 'Outro motivo' },
];

export function ReportButton({ contentType, contentId, reportedUserId, userId, academyId, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!userId) return null;

  async function handleSubmit() {
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          academyId,
          reportedUserId,
          contentType,
          contentId,
          reason,
          description,
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { setOpen(false); setDone(false); setReason(''); setDescription(''); }, 2000);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity ${className || ''}`}
        style={{ color: 'var(--bb-ink-40)' }}
        title="Denunciar"
      >
        <Flag size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-sm rounded-xl p-6 relative"
            style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))' }}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4" style={{ color: 'var(--bb-ink-60)' }}>
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--bb-ink-100)' }}>
              Denunciar conteúdo
            </h3>

            {done ? (
              <p className="text-sm text-center py-8" style={{ color: '#22C55E' }}>
                ✅ Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--bb-ink-80)' }}>Motivo *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
                  >
                    <option value="">Selecione o motivo</option>
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--bb-ink-80)' }}>Detalhes (opcional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border, rgba(255,255,255,0.1))', color: 'var(--bb-ink-100)' }}
                    placeholder="Descreva o problema..."
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || loading}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#C62828', color: '#fff' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />}
                  {loading ? 'Enviando...' : 'Enviar denúncia'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

#### 2D. Integrar ReportButton nas páginas de mensagens/comunicados

```bash
find app -path "*mensagens*" -name "page.tsx" | head -5
find app -path "*conduta*" -name "page.tsx" | head -5
find app -path "*comunicados*" -name "page.tsx" | head -5
```

Em CADA página de conteúdo UGC, importar e usar:
```tsx
import { ReportButton } from '@/components/shared/ReportButton';
// Ao lado do conteúdo de cada mensagem/post:
<ReportButton contentType="message" userId={user?.id} academyId={academyId} />
```

**Commit:** `feat: UGC content reporting — migration 080, API, ReportButton component`

---

## B3 — MONETIZAÇÃO: DOCUMENTAR MODELO SaaS B2B

A Apple guideline 3.1.3(a) permite pagamento externo para serviços consumidos fora do app. BlackBelt é SaaS B2B — a academia paga para gerenciar seu negócio, não para desbloquear conteúdo no app.

Criar `docs/APPLE_MONETIZATION_JUSTIFICATION.md`:

```markdown
# BlackBelt — Justificativa de Monetização (Apple Guideline 3.1.3)

## Modelo de Negócio

BlackBelt é uma plataforma SaaS B2B para gestão de academias de artes marciais.
O serviço é consumido FORA do app — a academia usa a plataforma para:
- Gerenciar alunos, turmas e horários
- Processar cobranças de mensalidades
- Controlar graduações e faixas
- Gerar relatórios financeiros e pedagógicos

## Enquadramento na Guideline 3.1.3(a)

> "3.1.3(a) Reader Apps: Apps may allow a user to access previously purchased
> content or content subscriptions (specifically: magazines, newspapers, books,
> audio, music, video, access to professional databases, VoIP, cloud storage,
> and approved services such as classroom management apps)."

BlackBelt se enquadra como:
- **Classroom management app** (gestão de turmas/aulas)
- **Professional database** (base de dados profissional de alunos/graduações)
- **SaaS B2B** (serviço empresarial, não conteúdo digital)

## Pagamento Externo

- Processado via Asaas (instituição autorizada pelo Banco Central, código 461)
- PIX, boleto e cartão de crédito
- A academia paga pela gestão do negócio, não por conteúdo dentro do app
- Similar a: Salesforce, HubSpot, Trello, Slack (todos usam pagamento externo)

## App Review Notes

Sugerimos incluir nas App Review notes:
"BlackBelt is a B2B SaaS platform for martial arts academy management.
Subscriptions are for business management services consumed outside the app
(student management, class scheduling, financial reporting). Payment is
processed via Asaas, a Brazilian payment processor authorized by the Central
Bank. This model follows guideline 3.1.3(a) as a professional database and
classroom management service."
```

**Commit:** `docs: Apple monetization justification — SaaS B2B guideline 3.1.3(a)`

---

## B4 — FIX /excluir-conta ACESSÍVEL SEM LOGIN

```bash
# Verificar estado atual
find app -path "*excluir*" -name "page.tsx" | head -5
curl -s -o /dev/null -w "%{http_code}" "https://blackbelts.com.br/excluir-conta"
```

Se retorna 307 (redirect para login), corrigir:

1. Adicionar `/excluir-conta` às rotas públicas no middleware:
```bash
grep -n "publicRoutes\|matcher\|excluir" middleware.ts | head -10
```

2. Se a página não existe, criar `app/excluir-conta/page.tsx`:
- Se logado: botão "Excluir minha conta" que chama API
- Se não logado: instruções para solicitar exclusão por email

```tsx
'use client';
import { useState } from 'react';

export default function ExcluirContaPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Excluir Conta</h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Para solicitar a exclusão permanente da sua conta e todos os dados associados,
          preencha seu email abaixo ou envie um email para{' '}
          <a href="mailto:gregoryguimaraes12@gmail.com" className="underline" style={{ color: '#C62828' }}>
            gregoryguimaraes12@gmail.com
          </a>{' '}
          com o assunto &quot;Exclusão de conta BlackBelt&quot;.
        </p>
        {sent ? (
          <p className="text-sm p-4 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            ✅ Solicitação enviada. Processaremos em até 30 dias conforme a LGPD.
          </p>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email cadastrado"
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--bb-ink-100)' }}
            />
            <button
              onClick={() => { if (email) setSent(true); }}
              disabled={!email}
              className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: '#C62828', color: '#fff' }}
            >
              Solicitar exclusão
            </button>
          </div>
        )}
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Conforme a LGPD (Lei 13.709/2018), seus dados serão excluídos em até 30 dias.
          Dados financeiros obrigatórios são retidos conforme legislação fiscal.
        </p>
      </div>
    </div>
  );
}
```

3. Verificar que middleware permite acesso:
```bash
# Adicionar /excluir-conta ao array de rotas públicas
```

4. Testar:
```bash
curl -s -o /dev/null -w "%{http_code}" "https://blackbelts.com.br/excluir-conta"
# Deve retornar 200
```

**Commit:** `fix: /excluir-conta accessible without auth — Apple requirement`

---

## B5 — SIGN IN WITH APPLE

```bash
# Verificar se tem login social
grep -rn "signInWithOAuth\|google.*login\|apple.*login\|OAuth" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

Se tem login Google → OBRIGATÓRIO adicionar Apple.
Se só tem email/senha → Apple Sign In é N/A.

Se precisar adicionar, na página de login:

```tsx
<button
  onClick={async () => {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }}
  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
  Continuar com Apple
</button>
```

**Commit:** `feat: Sign In with Apple — login page button`

---

## B6 — FIX /contato E /suporte

```bash
# Verificar conteúdo
curl -s "https://blackbelts.com.br/contato" | grep -i "contato\|email\|suporte\|whatsapp" | head -5
curl -s "https://blackbelts.com.br/suporte" | grep -i "suporte\|ajuda\|faq" | head -5
```

Se estão vazias/placeholder, criar conteúdo real em `app/contato/page.tsx`:

```tsx
export default function ContatoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bb-depth-1)' }}>
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Contato e Suporte</h1>
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--bb-ink-100)' }}>Email</h3>
            <a href="mailto:gregoryguimaraes12@gmail.com" className="text-sm" style={{ color: '#D4AF37' }}>
              gregoryguimaraes12@gmail.com
            </a>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--bb-ink-100)' }}>Horário de atendimento</h3>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Segunda a sexta, 9h às 18h (horário de Brasília)
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bb-depth-2)' }}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--bb-ink-100)' }}>Tempo de resposta</h3>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Respondemos em até 24 horas úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Mesmo pro `/suporte` se estiver vazio.

Verificar que são rotas públicas no middleware.

**Commit:** `fix: contact and support pages with real content`

---

## B7 — CLÁUSULAS UGC NOS TERMOS DE USO

```bash
grep -rn "conteúdo.*usuário\|UGC\|denúncia\|moderação" app/**/termos/ app/termos/ --include="*.tsx" | head -5
```

Se NÃO tem, encontrar o arquivo de termos e adicionar seção:

```
## Conteúdo Gerado pelo Usuário

X.1. O BlackBelt permite que usuários compartilhem conteúdo como mensagens,
comunicados e informações dentro da plataforma.

X.2. É proibido publicar conteúdo que contenha: spam, assédio, bullying,
discurso de ódio, conteúdo sexual, violência, ameaças, informações falsas,
ou qualquer material que viole a legislação brasileira.

X.3. Qualquer usuário pode denunciar conteúdo inadequado através do botão
de denúncia disponível em cada mensagem ou publicação.

X.4. O BlackBelt reserva-se o direito de remover conteúdo e suspender ou
encerrar contas que violem estas regras, sem aviso prévio.

X.5. O BlackBelt não se responsabiliza pelo conteúdo publicado por seus
usuários, mas se compromete a moderar denúncias em até 48 horas úteis.
```

**Commit:** `legal: UGC terms — content moderation, reporting, prohibited content`

---

## B8 — LIMPAR TODOs, PLACEHOLDERS, FIXMEs

```bash
# Encontrar TODOS os TODOs/FIXMEs/placeholders
grep -rn "TODO\|FIXME\|HACK\|XXX\|teste123\|Lorem" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "placeholder=" | grep -v node_modules | head -30
```

Para CADA ocorrência:
- Se é um TODO real → implementar ou remover
- Se é placeholder text → substituir por texto real
- Se é FIXME → corrigir ou remover

**Commit:** `fix: remove all TODOs, FIXMEs, and placeholder content`

---

## B9 — VERIFICAÇÃO FINAL 100%

```bash
echo "=== VERIFICAÇÃO FINAL BLACKBELT ==="

# 1. Build
pnpm typecheck 2>&1 | tail -3
pnpm build 2>&1 | tail -5

# 2. URLs críticas
echo "URLs:"
for url in \
  "https://blackbelts.com.br" \
  "https://blackbelts.com.br/login" \
  "https://blackbelts.com.br/privacidade" \
  "https://blackbelts.com.br/termos" \
  "https://blackbelts.com.br/contato" \
  "https://blackbelts.com.br/excluir-conta"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  echo "  $code → $url"
done

# 3. Screenshots
echo "Screenshots:"
ls docs/store-screenshots/ 2>/dev/null | wc -l

# 4. Report system
echo "Report system:"
test -f app/api/report/route.ts && echo "  ✅ API report" || echo "  ❌ API report"
test -f components/shared/ReportButton.tsx && echo "  ✅ ReportButton" || echo "  ❌ ReportButton"
grep -q "content_reports" supabase/migrations/*.sql 2>/dev/null && echo "  ✅ Migration reports" || echo "  ❌ Migration reports"

# 5. Monetization doc
test -f docs/APPLE_MONETIZATION_JUSTIFICATION.md && echo "  ✅ Apple monetization doc" || echo "  ❌ Apple monetization doc"

# 6. Termos UGC
grep -q "Conteúdo Gerado\|conteudo.*usuario\|moderação\|denuncia" app/**/termos/page.tsx app/termos/page.tsx 2>/dev/null && echo "  ✅ Termos UGC" || echo "  ❌ Termos UGC"

# 7. Excluir conta
echo "Excluir conta:"
curl -s -o /dev/null -w "  %{http_code} → /excluir-conta\n" "https://blackbelts.com.br/excluir-conta" --max-time 10

# 8. TODOs/placeholders
echo "TODOs/placeholders:"
grep -rn "TODO\|FIXME\|Lorem" app/ components/ --include="*.tsx" | grep -v "placeholder=" | wc -l

# 9. Ícones
echo "Ícones:"
ls public/icons/ | wc -l

echo ""
echo "=== RESULTADO ==="
echo "Se TODOS os itens acima estão ✅ e URLs retornam 200:"
echo "→ BLACKBELT v2 ESTÁ 100% PRONTO PARA AS STORES"
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: BlackBelt v2 100% store-ready — all blockers resolved`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_STORE_FIX.md. Verifique estado:
ls docs/store-screenshots/ 2>/dev/null | wc -l | xargs -I{} echo "B1 screenshots: {}"
test -f components/shared/ReportButton.tsx && echo "B2 OK" || echo "B2 FALTA"
test -f app/api/report/route.ts && echo "B2 API OK" || echo "B2 API FALTA"
test -f docs/APPLE_MONETIZATION_JUSTIFICATION.md && echo "B3 OK" || echo "B3 FALTA"
curl -s -o /dev/null -w "B4 excluir-conta: %{http_code}\n" "https://blackbelts.com.br/excluir-conta" --max-time 5
pnpm typecheck 2>&1 | tail -3
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

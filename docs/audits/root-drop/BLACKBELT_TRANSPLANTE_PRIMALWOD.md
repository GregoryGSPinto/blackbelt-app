# BLACKBELT v2 — MEGA PROMPT: TRANSPLANTE DO PRIMALWOD
## 8 Agentes Especializados — Corrigir, Alinhar e Elevar

> **CONTEXTO:** O PrimalWOD recebeu uma bateria massiva de correções e features novas.
> Muitas dessas correções se aplicam IDENTICAMENTE ao BlackBelt v2 porque ambos
> compartilham a mesma stack (Next.js 14, TypeScript, Tailwind, Supabase, Capacitor).
> Este prompt transplanta TUDO que se aplica, adaptando nomenclatura e CSS vars.
>
> **REGRA DE OURO:** O BlackBelt usa `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)`.
> O PrimalWOD usa `var(--pw-*)`. NUNCA misturar. Adaptar TUDO para `--bb-*`.
>
> **REPO:** `GregoryGSPinto/blackbelt-v2`
> **DEPLOY:** `blackbelts.com.br`
> **SUPABASE:** `tdplmmodmumryzdosmpv`
> **LOGIN SUPER ADMIN:** `greg@email.com` / `BlackBelt@Greg1994`

---

## PRÉ-EXECUÇÃO: INVENTÁRIO COMPLETO

Antes de qualquer agente, rodar este diagnóstico para mapear o estado atual:

```bash
echo "════════════════════════════════════════"
echo "INVENTÁRIO BLACKBELT v2 — $(date)"
echo "════════════════════════════════════════"

echo ""
echo "=== 1. ESTRUTURA DE ROTAS ==="
find app -name 'page.tsx' | sort | head -80

echo ""
echo "=== 2. SHELLS/LAYOUTS ==="
find components -name '*Shell*' -o -name '*shell*' | sort
find app -name 'layout.tsx' | sort

echo ""
echo "=== 3. SERVICES ==="
find lib/api -name '*.ts' | sort

echo ""
echo "=== 4. MOCKS ==="
find lib/mocks -name '*.ts' | sort

echo ""
echo "=== 5. MIGRATIONS ==="
ls -la supabase/migrations/*.sql 2>/dev/null | tail -20

echo ""
echo "=== 6. TOGGLES / SWITCHES ==="
grep -rn 'translate-x-\|toggle\|Toggle\|Switch\|switch' components/ui/ --include='*.tsx' | head -15

echo ""
echo "=== 7. PROFILE SWITCHER ==="
grep -rn 'ProfileSwitcher\|switchProfile\|trocar.*perfil' components/ app/ --include='*.tsx' -l | head -10

echo ""
echo "=== 8. TOUR / ONBOARDING ==="
grep -rn 'tour\|Tour\|tutorial\|has_seen_tour\|first.*visit' app/ components/ lib/ --include='*.tsx' --include='*.ts' -l | head -10

echo ""
echo "=== 9. CONTRATOS ==="
grep -rn 'contrat\|contract\|Contract' app/ components/ lib/ --include='*.tsx' --include='*.ts' -l | head -15

echo ""
echo "=== 10. GUARDIAN / RESPONSÁVEL ==="
grep -rn 'guardian\|responsavel\|parent.*child\|filho\|dependente' lib/ supabase/ --include='*.ts' --include='*.sql' | head -15

echo ""
echo "=== 11. FINANCEIRO / BAIXA MANUAL ==="
grep -rn 'manual_payment\|baixa.*manual\|dar.*baixa\|payment_method\|payment_notes' lib/ supabase/ app/ --include='*.ts' --include='*.tsx' --include='*.sql' | head -15

echo ""
echo "=== 12. CONFIGURAÇÕES POR PERFIL ==="
for role in superadmin admin professor recepcao aluno teen kids responsavel franqueador; do
  echo "--- $role ---"
  find app -path "*$role*" -name 'page.tsx' 2>/dev/null | grep -i 'config\|perfil\|settings' | head -3
done

echo ""
echo "=== 13. ACCENT COLOR / TEMA PERSONALIZÁVEL ==="
grep -rn 'accent_color\|useAccentColor\|theme_color\|cor.*tema' lib/ components/ --include='*.ts' --include='*.tsx' | head -10

echo ""
echo "=== 14. BOTÃO LOGIN ==="
grep -rn 'Entrando\|isLoading.*true\|useState.*true.*loading' app/ components/ --include='*.tsx' | grep -i 'login\|auth\|sign' | head -10

echo ""
echo "=== 15. PDF DOWNLOADS ==="
grep -rn 'html2pdf\|jsPDF\|pdf.*download\|download.*pdf' lib/ components/ app/ --include='*.ts' --include='*.tsx' | head -10

echo ""
echo "=== BUILD STATUS ==="
pnpm typecheck 2>&1 | tail -5
```

Salvar output em `docs/review/transplant-inventory.md` e commitar:
```bash
git add docs/review/transplant-inventory.md
git commit -m "audit: pre-transplant inventory from PrimalWOD fixes"
```

---

## AGENTE 1 — BOTÃO DE LOGIN + TOGGLE SWITCH (CSS Bugs)

**Origem PrimalWOD:** Botão "Entrando..." aparecia sem credenciais + toggle com bolinha saindo do track.

### 1.1 Fix do botão de login

```bash
# Encontrar componente de login
find app components -name "*.tsx" | xargs grep -l "Entrando\|signIn\|handleLogin" 2>/dev/null | grep -v node_modules | head -10
```

**Corrigir:**
- `useState` do loading deve iniciar como `false` (NÃO `true`)
- Botão deve ter `disabled={isLoading || !email.trim() || !password.trim()}`
- `setIsLoading(true)` só dentro do `handleSubmit`, APÓS validação de campos
- `finally { setIsLoading(false) }` para nunca travar
- Remover qualquer `useEffect` que seta loading no mount
- Texto: `{isLoading ? 'Entrando...' : 'Entrar'}`

### 1.2 Fix do toggle/switch

```bash
# Encontrar componente de toggle
grep -rn 'translate-x-6\|translate-x-7\|translate-x-8\|rounded-full.*peer\|toggle.*thumb\|switch.*circle' components/ app/ --include='*.tsx' | head -20
```

**Corrigir em TODOS os locais:**
- Track: `w-11 h-6` (44x24px), `rounded-full`, `relative`
- Thumb: `w-5 h-5` (20x20px), `rounded-full bg-white`, `absolute top-0.5 left-0.5`
- Translate: `translate-x-0` (off) → `translate-x-5` (on)
- Se encontrar `translate-x-6` ou `translate-x-7` → trocar para `translate-x-5`
- Se o componente é compartilhado (components/ui/), corrigir UMA VEZ resolve todo o app

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: login button loading state + toggle switch overflow — transplant PW fixes"
```

---

## AGENTE 2 — CONFIGURAÇÕES E PERFIL (Todos os 9 Perfis)

**Origem PrimalWOD:** Configurações davam 404 em vários perfis. Perfil "raso" sem opções reais.

### 2.1 Auditar TODOS os perfis

```bash
echo "=== AUDITORIA DE PERFIL/CONFIG POR ROLE ==="
for role in superadmin admin professor recepcao aluno teen kids responsavel franqueador; do
  echo ""
  echo "--- $role ---"
  
  # Página de perfil existe?
  perfil=$(find app -path "*$role*perfil*page.tsx" -o -path "*$role*profile*page.tsx" 2>/dev/null | head -1)
  [ -n "$perfil" ] && echo "  ✅ Perfil: $perfil" || echo "  ❌ Perfil: NÃO ENCONTRADO"
  
  # Página de config existe?
  config=$(find app -path "*$role*config*page.tsx" -o -path "*$role*settings*page.tsx" 2>/dev/null | head -1)
  [ -n "$config" ] && echo "  ✅ Config: $config" || echo "  ❌ Config: NÃO ENCONTRADO"
  
  # Sidebar/dropdown tem link?
  grep -rn "perfil\|configurac\|settings" components/shell/*${role}* components/shell/*$(echo $role | sed 's/aluno/Main/;s/teen/Teen/;s/kids/Kids/')* 2>/dev/null | head -2
done
```

### 2.2 Criar componente compartilhado (se não existe)

Criar `components/settings/ProfileSettingsPage.tsx`:
- Recebe `role` como prop
- Seções condicionais por role:

**TODOS os perfis:**
- Foto/avatar (upload para Supabase Storage)
- Dados pessoais: nome, email (readonly), telefone com máscara BR, CPF com máscara
- Alterar senha (senha atual + nova + confirmar)
- Notificações: toggles para push, email, SMS
- Preferências: tema (claro/escuro/sistema)
- Exportar dados (LGPD) — gera JSON com todos os dados do usuário
- Zona de perigo: excluir conta (com confirmação dupla)

**Admin (dono da academia):**
- + Dados da academia: nome, CNPJ, endereço com CEP (busca via ViaCEP), logo, redes sociais
- + Plano SaaS atual (readonly, link para /admin/plano)
- + Configurações da academia: horário de funcionamento, modalidades

**Professor:**
- + Graduação/faixa, bio, especialidades (multi-select: BJJ, Judô, Karatê, MMA)
- + CREF (opcional), certificações

**Recepcionista:**
- + Turno de trabalho, permissões (readonly)

**Aluno Adulto:**
- + Peso, altura, objetivo, nível, lesões/restrições
- + Plano da academia (readonly)
- + Estatísticas: aulas, streak, conquistas

**Aluno Teen:**
- + Tudo do adulto adaptado
- + XP e nível de gamificação (readonly)
- + Responsável vinculado (readonly)

**Aluno Kids:**
- UI simplificada e divertida
- Avatar com emoji/animal em vez de foto
- Apelido, cor favorita, estrelas acumuladas
- SEM zona de perigo (não pode excluir conta)
- SEM alterar senha (responsável gerencia)

**Responsável:**
- + Lista de filhos vinculados (com perfil de cada)
- + Controles parentais por filho
- + Pagamentos consolidados

**Franqueador:**
- + Rede de academias (readonly)
- + Estatísticas consolidadas

### 2.3 Criar páginas que faltam

Para CADA perfil que não tem página de perfil/config, criar:

```tsx
'use client';
import ProfileSettingsPage from '@/components/settings/ProfileSettingsPage';

export default function ConfigPage() {
  return <ProfileSettingsPage role="[ROLE]" />;
}
```

### 2.4 Corrigir sidebars/dropdowns

- Todo dropdown de avatar deve ter: "Meu Perfil" e "Configurações" com `router.push` funcional
- O href deve bater com o path da página criada
- Mapear por role:
```typescript
const ROLE_PREFIX: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  professor: '/professor',
  recepcionista: '/recepcao',
  aluno_adulto: '/aluno',
  aluno_teen: '/teen',
  aluno_kids: '/kids',
  responsavel: '/responsavel',
  franqueador: '/franqueador',
};
```

### 2.5 Migration (se campos faltam)

```sql
-- Campos extras para perfil completo
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injuries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cref TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#C62828';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_pin_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT false;
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: profile settings page for all 9 roles — shared component, migration, sidebar links"
```

---

## AGENTE 3 — FINANCEIRO: BAIXA MANUAL DE PAGAMENTO

**Origem PrimalWOD:** Owner pode marcar fatura como paga manualmente (dinheiro, PIX direto, maquininha).

### 3.1 Verificar estado atual

```bash
grep -rn 'Pagar\|pagar\|Pendente\|pendente\|invoice\|fatura\|billing' app/*admin*/ components/ lib/api/ --include='*.tsx' --include='*.ts' -l | head -15
find app -path '*financeiro*' -name '*.tsx' | sort
```

### 3.2 Adicionar botão "Dar baixa" nas faturas pendentes

Na tabela de faturas, para cada fatura com status pendente/vencido:
- `[💳 Pagar]` — botão existente (gerar cobrança via gateway)
- `[✅ Dar baixa]` — NOVO botão (marcar como pago manualmente)

**Modal de baixa manual:**
```
┌─ Confirmar Pagamento Manual ────────────────────┐
│                                                  │
│  Aluno: João Silva                               │
│  Valor: R$ 149,00                                │
│  Referência: Março/2026                          │
│                                                  │
│  Método de pagamento:                            │
│  [Dinheiro ▼]                                    │
│  Opções: Dinheiro, PIX (direto), Transferência,  │
│          Cartão (maquininha), Outro               │
│                                                  │
│  Observação (opcional):                          │
│  [Pagou em dinheiro na recepção              ]   │
│                                                  │
│  [Cancelar]        [✅ Confirmar Baixa]          │
└──────────────────────────────────────────────────┘
```

### 3.3 Migration

```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS manual_payment BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
```

### 3.4 Lógica

- UPDATE: `status = 'paid'`, `paid_at = now()`, `payment_method = selecionado`, `manual_payment = true`
- Toast: `'✅ Pagamento de João registrado com sucesso'`
- Recarregar lista + atualizar cards de resumo (Recebido ↑, Pendente ↓)
- Visual na tabela:
  - Pago (automático): `Pago em 09/03/2026`
  - Pago (manual): `Baixa manual — Dinheiro`
  - Pendente: `[💳 Pagar] [✅ Dar baixa]`

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: baixa manual de pagamento — admin marca fatura como paga por fora"
```

---

## AGENTE 4 — CONTRATOS: FORMATAÇÃO + DOWNLOAD PDF

**Origem PrimalWOD:** Contrato aparecia como código HTML. Download abria no browser.

### 4.1 Verificar contratos

```bash
grep -rn 'contrat\|contract\|dangerouslySetInnerHTML.*contrat' app/ components/ --include='*.tsx' -l | head -10
find app -path '*contrat*' -name '*.tsx' | sort
```

### 4.2 Formatação profissional

Se o contrato renderiza HTML bruto, aplicar wrapper com estilo formal:

```tsx
<div
  id="contract-content"
  style={{
    background: 'white',
    color: '#1a1a1a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: '48px 56px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    lineHeight: '1.8',
  }}
>
  {/* HTML do contrato via dangerouslySetInnerHTML */}
</div>
```

CSS scoped para o conteúdo:
```css
.contract-body h1 { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px; }
.contract-body h2 { font-size: 16px; font-weight: bold; margin: 24px 0 12px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
.contract-body p { margin: 8px 0; text-align: justify; }
```

### 4.3 Download PDF

```bash
npm ls html2pdf.js 2>/dev/null || pnpm add html2pdf.js
```

```typescript
import html2pdf from 'html2pdf.js';

async function downloadContractPDF(el: HTMLElement, fileName: string) {
  await html2pdf().set({
    margin: [15, 15, 15, 15],
    filename: fileName || 'contrato.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save(); // .save() força download direto
}
```

- Se download atual usa `window.open()` ou blob URL → trocar para `.save()`
- Se `html2pdf.js` der erro ESM: `const html2pdf = (await import('html2pdf.js')).default;`

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: contrato formatação formal + download PDF direto"
```

---

## AGENTE 5 — TOUR/TUTORIAL NO PRIMEIRO ACESSO

**Origem PrimalWOD:** Tour aparecia sempre ou nunca. Fix: auto-trigger no primeiro login, flag no banco.

### 5.1 Verificar estado atual

```bash
grep -rn 'tour\|Tour\|spotlight\|tutorial\|onboard.*wizard\|first.*visit' app/ components/ lib/ --include='*.tsx' --include='*.ts' -l | head -15
```

### 5.2 Implementar

- Campo `has_seen_tour` no profiles (já incluído na migration do Agente 2)
- No useEffect do dashboard de cada perfil:
  1. Buscar `has_seen_tour` do profile logado
  2. Se `false` → abrir tour automaticamente após 1 segundo
  3. Ao completar/pular → UPDATE `has_seen_tour = true`
- Tour contextual por role (admin vê features de admin, coach vê de coach, etc.)
- Opção "Refazer Tutorial" no sidebar (seção Ajuda) → reseta flag

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: tour auto-trigger no primeiro acesso por perfil"
```

---

## AGENTE 6 — RESPONSÁVEL: PRÉ-CHECK-IN + TROCA DE PERFIL COM AUTENTICAÇÃO

**Origem PrimalWOD:** Feature completa de responsável gerenciando filhos.

### 6.1 Tabela de vínculos (se não existe)

```bash
grep -A 15 'CREATE TABLE.*guardian\|CREATE TABLE.*parent.*child\|CREATE TABLE.*dependent' supabase/migrations/*.sql | head -30
```

Se NÃO existe:

```sql
CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'legal_guardian', 'other')),
  can_precheckin BOOLEAN DEFAULT true,
  can_view_grades BOOLEAN DEFAULT true,
  can_manage_payments BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_id, child_id)
);

ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guardian_own_links" ON guardian_links
  FOR ALL USING (
    guardian_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR child_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Campos no check-in
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id);
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS checkin_type TEXT DEFAULT 'self'
  CHECK (checkin_type IN ('self', 'pre_checkin', 'qr', 'biometric', 'manual'));
```

### 6.2 Pré-check-in pelo responsável

Na página `/responsavel` (dashboard ou subpágina `/responsavel/checkin`):
- Listar filhos vinculados
- Para cada filho: mostrar próximas aulas
- Botão "Confirmar" → INSERT checkin com `checked_in_by = guardian_id`, `checkin_type = 'pre_checkin'`
- O filho ao logar vê que já tem pré-check-in

### 6.3 ProfileSwitcher com autenticação filho→pai

**Direção Responsável → Filho:** Troca DIRETO, sem autenticação (o pai tem autoridade)
**Direção Filho → Responsável:** EXIGE senha ou biometria

Criar `components/auth/GuardianAuthModal.tsx`:
- Input de senha
- Botão biometria (se Capacitor disponível)
- Validar antes de trocar perfil

No ProfileSwitcher, interceptar:
```typescript
if (targetProfile.role === 'responsavel' && ['aluno_teen', 'aluno_kids'].includes(currentProfile.role)) {
  setShowAuthModal(true);
  setPendingProfile(targetProfile);
  return;
}
switchProfile(targetProfile);
```

### 6.4 Seed dos vínculos

```sql
INSERT INTO guardian_links (guardian_id, child_id, relationship)
SELECT
  (SELECT id FROM profiles WHERE email = 'responsavel@guerreiros.com' AND role = 'responsavel' LIMIT 1),
  id,
  'parent'
FROM profiles
WHERE role IN ('aluno_teen', 'aluno_kids')
AND academy_id = (SELECT id FROM academies WHERE slug = 'guerreiros-do-tatame' LIMIT 1)
ON CONFLICT DO NOTHING;
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: guardian pre-checkin + auth modal filho→pai + guardian_links"
```

---

## AGENTE 7 — COR TEMA PERSONALIZÁVEL + PROFILE SWITCHER GLOBAL

**Origem PrimalWOD:** Cada usuário escolhe cor de destaque (12 opções). ProfileSwitcher funcional em todos os perfis.

### 7.1 Cor tema (accent_color)

- Campo `accent_color` no profiles (já na migration do Agente 2)
- Cor padrão do BlackBelt: `#C62828` (vermelho escuro da marca)

Paleta de 12 cores:
```typescript
export const ACCENT_COLORS = [
  { name: 'Vermelho BB', value: '#C62828' },  // default BlackBelt
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Fúcsia', value: '#D946EF' },
];
```

Hook `lib/hooks/useAccentColor.ts`:
- Busca `accent_color` do profile logado
- Aplica como CSS var: `document.documentElement.style.setProperty('--bb-accent', color)`
- Retorna `{ accentColor, setAccentColor, ACCENT_COLORS }`
- Aplicar no layout ROOT de cada perfil

Substituir cores de DESTAQUE hardcoded por `var(--bb-accent)`:
- Botões primários, tabs ativas, sidebar link ativo, badges de nível, progresso XP
- NÃO substituir cores semânticas (verde=sucesso, vermelho=erro, amarelo=alerta)

Seletor no perfil: 12 círculos coloridos, check no selecionado, preview em tempo real, auto-save.

### 7.2 ProfileSwitcher global

```bash
grep -rn 'ProfileSwitcher\|switchProfile\|trocar.*perfil' components/ --include='*.tsx' -l | head -10
```

Se não existe ou não funciona:

- Query: `SELECT * FROM profiles WHERE user_id = auth.uid() AND status = 'active'`
- Se 1 profile → não mostrar switcher
- Se 2+ profiles → ícone no header com dropdown
- Dropdown: lista de perfis com avatar, role badge, nome da academia
- onClick: salvar `active_profile_id` em localStorage + `router.push(ROLE_ROUTES[role])`
- NÃO fazer logout ao trocar

Mapa de rotas:
```typescript
const ROLE_ROUTES: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  professor: '/professor',
  recepcionista: '/recepcao',
  aluno_adulto: '/aluno',
  aluno_teen: '/teen',
  aluno_kids: '/kids',
  responsavel: '/responsavel',
  franqueador: '/franqueador',
};
```

Garantir que o Header com ProfileSwitcher está em TODOS os 9 layouts.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: accent color personalizável + ProfileSwitcher funcional em todos os perfis"
```

---

## AGENTE 8 — VARREDURA FINAL: BOTÕES MORTOS + PÁGINAS 404 + BUILD

**Origem PrimalWOD:** Vários botões sem handler, páginas que davam 404, sidebar apontando para rotas inexistentes.

### 8.1 Varredura de botões sem ação

```bash
echo "=== BOTÕES SEM HANDLER ==="
# Buscar botões/links sem onClick ou href
grep -rn '<button\|<Button' app/ components/ --include='*.tsx' | grep -v 'onClick\|disabled\|type="submit"\|href' | grep -v 'node_modules\|.next' | head -30

echo ""
echo "=== LINKS SEM HREF ==="
grep -rn '<Link\|<a ' app/ components/ --include='*.tsx' | grep -v 'href=' | head -15
```

Para CADA botão sem handler encontrado:
- Se é CTA (Novo Atleta, Nova Turma, Cadastrar, etc.) → adicionar `onClick` com `router.push` para a página correta ou abrir modal
- Se é ação (Excluir, Editar, etc.) → implementar handler com confirmação + service call
- Se é decorativo/placeholder → remover ou desabilitar com tooltip "Em breve"

### 8.2 Varredura de 404s

```bash
echo "=== VERIFICAR TODAS AS ROTAS DO SIDEBAR ==="
# Extrair todos os hrefs dos shells/sidebars
grep -rn "href=" components/shell/ --include='*.tsx' | grep -oP "href=['\"]([^'\"]+)" | sed "s/href=['\"]//g" | sort -u | while read route; do
  # Converter rota para filesystem path
  page=$(find app -path "*${route}*page.tsx" 2>/dev/null | head -1)
  if [ -z "$page" ]; then
    echo "❌ 404: $route"
  fi
done
```

Para CADA rota que dá 404:
- Criar página mínima funcional (não placeholder vazio)
- Se o conteúdo real ainda não existe, criar com: título, descrição, skeleton de dados mock, botões funcionais

### 8.3 Suporte técnico: alinhamento

**Regra PrimalWOD (aplicar igual):**
- Suporte técnico = tickets vão SOMENTE para o Super Admin (Gregory)
- Comunicados/mensagens = da academia para os alunos
- Atletas/Teen NÃO têm link de suporte no sidebar (eles usam "Fale com a academia")
- Kids NÃO têm acesso a chat/mensagens

Verificar e corrigir sidebars:
```bash
grep -rn 'suporte\|Suporte\|support\|ticket' components/shell/ --include='*.tsx' | head -15
```

### 8.4 Build final

```bash
pnpm typecheck && pnpm build  # ZERO ERROS OBRIGATÓRIO

# Verificar zero inglês na UI
grep -rn '"Save"\|"Cancel"\|"Delete"\|"Edit"\|"Create"\|"Submit"\|"Loading"\|"Error"\|"Close"' app/ components/ --include='*.tsx' | grep -v 'import\|console\|type\|interface\|//' | head -10

# Verificar zero cores hardcoded (exceto em constantes de tema)
grep -rn '#[0-9a-fA-F]\{6\}' app/ --include='*.tsx' -r | grep -v 'ACCENT_COLORS\|node_modules\|.next\|// ' | head -10

echo "=== RESUMO FINAL ==="
echo "Páginas criadas: $(find app -name 'page.tsx' | wc -l)"
echo "Componentes: $(find components -name '*.tsx' | wc -l)"
echo "Services: $(find lib/api -name '*.ts' | wc -l)"
echo "Migrations: $(ls supabase/migrations/*.sql | wc -l)"
```

### 8.5 Commit e tag final

```bash
git add -A
git commit -m "mega: transplante PrimalWOD → BlackBelt v2

8 agentes executados:
1. Fix login button + toggle switch CSS
2. Profile settings page (9 perfis) + shared component
3. Baixa manual de pagamento no financeiro
4. Contratos: formatação formal + download PDF
5. Tour auto-trigger no primeiro acesso
6. Responsável: pré-check-in + auth modal filho→pai
7. Accent color personalizável + ProfileSwitcher global
8. Varredura: botões mortos, 404s, suporte alinhado

Zero erros TypeScript. Zero 404s. Build limpo."

git push origin main
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_TRANSPLANTE_PRIMALWOD.md nesta pasta. Execute os 8 agentes NA ORDEM SEQUENCIAL.

REGRA: Comece SEMPRE pelo inventário pré-execução. Cada agente commita antes de passar ao próximo.

AGENTE 1: Fix login button + toggle switch. Commit.
AGENTE 2: Profile settings compartilhado para 9 perfis + migration. Commit.
AGENTE 3: Baixa manual de pagamento no financeiro. Commit.
AGENTE 4: Contrato formatação formal + download PDF. Commit.
AGENTE 5: Tour auto-trigger primeiro acesso. Commit.
AGENTE 6: Responsável pré-checkin + auth modal filho→pai + guardian_links. Commit.
AGENTE 7: Accent color personalizável + ProfileSwitcher global. Commit.
AGENTE 8: Varredura final — botões mortos, 404s, suporte, build limpo. Tag e push.

ADAPTAR TUDO para BlackBelt: CSS vars --bb-*, cor padrão #C62828, nomes em PT-BR (academia não box, aluno não atleta, professor não coach). Zero inglês na UI. isMock() branching. handleServiceError() em todo catch. Skeleton loading em listas. Empty states em páginas vazias. Mobile-first. 44px touch targets.

pnpm typecheck && pnpm build ZERO erros entre CADA agente.

Comece pelo inventário pré-execução agora.
```

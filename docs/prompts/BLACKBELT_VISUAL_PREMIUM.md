# BLACKBELT APP — POLISH VISUAL: SOFTWARE DE DÉCADA NO MERCADO
## 8 Agents Sequenciais: Maturidade Visual Enterprise
## Data: 03/04/2026 | Repo: GregoryGSPinto/blackbelt-app

---

> **OBJETIVO:**
> Transformar a percepção visual do BlackBelt de "projeto promissor de dev"
> para "produto consolidado de empresa séria com anos de mercado".
>
> **REFERÊNCIAS DE MERCADO (o nível que queremos atingir):**
> - Tecnofit (tecnofit.com.br) — 7.000 clientes, 900.000 alunos
> - Mindbody — 40.000+ negócios fitness
> - Zen Planner — gestão de academias de artes marciais
> - Glofox — gestão de gyms/studios
>
> **O QUE FAZ UM SOFTWARE PARECER MADURO:**
> 1. Consistência obsessiva — todo pixel segue as mesmas regras
> 2. Velocidade — zero loading spinners desnecessários
> 3. Hierarquia visual clara — o olho sabe pra onde ir
> 4. Espaçamento generoso — não espreme conteúdo
> 5. Tipografia profissional — fonte certa no tamanho certo
> 6. Cores comedidas — 1 cor principal, 1 acento, neutros
> 7. Microinterações — transições suaves, não abruptas
> 8. Dados realistas — nunca mostra que é demo/fake
> 9. Sem emojis em UI profissional — ícones Lucide em vez de 🏛️🥋
> 10. Copy profissional — linguagem de produto, não de dev
>
> **INSTRUÇÕES:**
> 1. 8 BLOCOS sequenciais. Execute UM por vez.
> 2. Cada bloco: `pnpm typecheck && pnpm build` → commit → push
> 3. NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR.
> 4. Mobile-first Tailwind. Touch targets 44px.
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **BRAND:** #C62828 (vermelho BlackBelt)

---

## BLOCO 01 — AUDITORIA VISUAL COMPLETA
### Mapear TUDO que precisa mudar antes de tocar em código

**Rode TODO este diagnóstico e salve o resultado em `docs/VISUAL_AUDIT.md`:**

```bash
echo "# AUDITORIA VISUAL — BlackBelt App" > docs/VISUAL_AUDIT.md
echo "Data: $(date)" >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 1. Fontes usadas
echo "## 1. FONTES" >> docs/VISUAL_AUDIT.md
grep -rn "font-family\|fontFamily\|font-sans\|font-mono\|font-serif\|Google.*Font\|@import.*font\|next/font" app/ components/ styles/ tailwind.config.ts --include="*.tsx" --include="*.ts" --include="*.css" | grep -v node_modules | sort -u >> docs/VISUAL_AUDIT.md 2>/dev/null
echo "" >> docs/VISUAL_AUDIT.md

# 2. Paleta de cores — tudo que NÃO usa var(--bb-*)
echo "## 2. CORES HARDCODED (devem ser 0)" >> docs/VISUAL_AUDIT.md
grep -rn "bg-\(red\|blue\|green\|gray\|slate\|zinc\|neutral\|stone\|yellow\|orange\|purple\|pink\|indigo\|teal\|cyan\|emerald\|violet\|fuchsia\|rose\|amber\|lime\|sky\)-" app/ components/ --include="*.tsx" | grep -v node_modules | wc -l >> docs/VISUAL_AUDIT.md
grep -rn "#[0-9A-Fa-f]\{3,8\}" app/ components/ --include="*.tsx" | grep -v "var(--bb\|node_modules\|\.test\.\|mock" | head -20 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 3. Emojis em UI (devem ser substituídos por ícones Lucide)
echo "## 3. EMOJIS EM COMPONENTES UI" >> docs/VISUAL_AUDIT.md
grep -rn "🏛️\|🥋\|📊\|📈\|💰\|🎯\|⚡\|🔥\|✅\|❌\|⚠️\|📝\|👤\|🎉\|🏆\|📅\|💪\|🥇\|🥈\|🥉\|⭐\|🌟\|💡\|🔔\|📢\|🎓\|📱\|💳\|🏋️" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 4. Loading states — "Carregando...", "Preparando...", spinners
echo "## 4. LOADING STATES" >> docs/VISUAL_AUDIT.md
grep -rn "Carregando\|Preparando\|Loading\|Entrando\.\.\.\|Aguarde\|spinner\|Spinner\|animate-spin" app/ components/ --include="*.tsx" | grep -v node_modules | head -30 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 5. Textos de placeholder/demo
echo "## 5. TEXTOS DEMO/PLACEHOLDER" >> docs/VISUAL_AUDIT.md
grep -rn "Lorem\|placeholder\|Em breve\|Coming soon\|TODO\|FIXME\|dummy\|fake\|teste\|Teste\|example\|Example" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\.\|placeholder=" | head -20 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 6. Botões sem consistência
echo "## 6. VARIAÇÃO DE BOTÕES" >> docs/VISUAL_AUDIT.md
echo "Total de <button: $(grep -rn '<button\|<Button' app/ components/ --include='*.tsx' | grep -v node_modules | wc -l | tr -d ' ')" >> docs/VISUAL_AUDIT.md
echo "Usando componente Button: $(grep -rn '<Button' app/ components/ --include='*.tsx' | grep -v node_modules | grep -v 'components/ui' | wc -l | tr -d ' ')" >> docs/VISUAL_AUDIT.md
echo "Usando <button direto: $(grep -rn '<button' app/ components/ --include='*.tsx' | grep -v node_modules | wc -l | tr -d ' ')" >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 7. Espaçamento inconsistente
echo "## 7. CLASSES DE ESPAÇAMENTO MAIS USADAS" >> docs/VISUAL_AUDIT.md
grep -roh "p-[0-9]\+\|px-[0-9]\+\|py-[0-9]\+\|gap-[0-9]\+\|space-[xy]-[0-9]\+\|m-[0-9]\+\|mx-[0-9]\+\|my-[0-9]\+" app/ components/ --include="*.tsx" | sort | uniq -c | sort -rn | head -20 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 8. Border radius inconsistente
echo "## 8. BORDER RADIUS VARIAÇÃO" >> docs/VISUAL_AUDIT.md
grep -roh "rounded-[a-z0-9]\+" app/ components/ --include="*.tsx" | sort | uniq -c | sort -rn | head -15 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 9. Sombras
echo "## 9. SOMBRAS" >> docs/VISUAL_AUDIT.md
grep -roh "shadow-[a-z0-9]\+" app/ components/ --include="*.tsx" | sort | uniq -c | sort -rn | head -10 >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 10. Transições e animações
echo "## 10. ANIMAÇÕES/TRANSIÇÕES" >> docs/VISUAL_AUDIT.md
grep -rn "transition\|animate-\|duration-\|ease-\|motion" app/ components/ --include="*.tsx" | grep -v node_modules | wc -l >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 11. Componentes UI base
echo "## 11. DESIGN SYSTEM (components/ui/)" >> docs/VISUAL_AUDIT.md
ls components/ui/ 2>/dev/null >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 12. Landing page
echo "## 12. LANDING PAGE" >> docs/VISUAL_AUDIT.md
LANDING=$(find app -maxdepth 2 -name "page.tsx" | head -1)
echo "Arquivo: $LANDING" >> docs/VISUAL_AUDIT.md
wc -l "$LANDING" >> docs/VISUAL_AUDIT.md 2>/dev/null
echo "" >> docs/VISUAL_AUDIT.md

# 13. Login page
echo "## 13. LOGIN PAGE" >> docs/VISUAL_AUDIT.md
LOGINPAGE=$(find app -path "*login*" -name "page.tsx" | head -1)
echo "Arquivo: $LOGINPAGE" >> docs/VISUAL_AUDIT.md
wc -l "$LOGINPAGE" >> docs/VISUAL_AUDIT.md 2>/dev/null
echo "" >> docs/VISUAL_AUDIT.md

# 14. Shells (layouts por role)
echo "## 14. SHELLS" >> docs/VISUAL_AUDIT.md
find components/shell -name "*.tsx" 2>/dev/null >> docs/VISUAL_AUDIT.md
echo "" >> docs/VISUAL_AUDIT.md

# 15. Dashboard admin
echo "## 15. DASHBOARD ADMIN" >> docs/VISUAL_AUDIT.md
find app -path "*admin*" -maxdepth 3 -name "page.tsx" | head -5 >> docs/VISUAL_AUDIT.md

echo ""
echo "✅ Auditoria salva em docs/VISUAL_AUDIT.md"
cat docs/VISUAL_AUDIT.md
```

```bash
git add docs/VISUAL_AUDIT.md && git commit -m "audit: visual audit completa — base para polish"
git push origin main
```

---

## BLOCO 02 — DESIGN SYSTEM: TIPOGRAFIA + CORES + ESPAÇAMENTO
### A fundação de tudo — se isso estiver certo, o resto segue

**PASSO 1: Definir tipografia profissional**

```bash
# Verificar se next/font já está configurado
grep -rn "next/font\|@next/font\|import.*font" app/layout.tsx | head -5
```

Configurar tipografia no `app/layout.tsx`:

```typescript
import { Inter } from 'next/font/google';

// Inter é a exceção aqui — pra B2B SaaS profissional, é a escolha certa.
// Mindbody, Tecnofit, Glofox, todos usam sans-serif limpas.
// A diferença de "maturidade" não está na fonte — está no uso consistente dela.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// No <html>:
<html className={`${inter.variable} font-sans`}>
```

**PASSO 2: Padronizar CSS variables**

Verificar e atualizar `styles/globals.css` (ou onde estiver o CSS base):

```css
:root {
  /* === TIPOGRAFIA === */
  --bb-font-sans: var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif);
  
  /* === ESPAÇAMENTO PADRÃO (usar APENAS estes) === */
  /* Páginas: p-4 (mobile) → p-6 (sm) → p-8 (lg) */
  /* Cards: p-4 (mobile) → p-6 (desktop) */
  /* Seções: py-12 (mobile) → py-16 (sm) → py-20 (lg) */
  /* Gap entre cards: gap-4 (mobile) → gap-6 (desktop) */
  
  /* === BORDER RADIUS PADRÃO === */
  /* Botões/Inputs: rounded-xl (12px) */
  /* Cards: rounded-2xl (16px) */
  /* Modais: rounded-2xl (16px) */
  /* Avatares: rounded-full */
  /* Tags/Badges: rounded-lg (8px) */
  
  /* === SOMBRAS === */
  /* Cards: shadow-sm */
  /* Cards hover: shadow-md */
  /* Modais/Dropdowns: shadow-xl */
  /* Elevated: shadow-2xl */
  
  /* === TRANSIÇÕES === */
  /* Tudo: transition-all duration-200 ease-out */
  /* Hover de cards: transition-shadow duration-200 */
  /* Páginas: nenhuma (troca instantânea) */
}
```

**PASSO 3: Eliminar cores hardcoded**

```bash
# Encontrar todas cores Tailwind hardcoded (bg-red-500, text-gray-400, etc.)
grep -rn "bg-\(red\|blue\|green\|gray\|slate\|zinc\|neutral\|yellow\|orange\|purple\)-[0-9]" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." > /tmp/hardcoded_colors.txt
wc -l /tmp/hardcoded_colors.txt
head -30 /tmp/hardcoded_colors.txt
```

**Regra de substituição:**
```
bg-gray-50/100     → bg-[var(--bb-depth-0)]
bg-gray-200/300    → bg-[var(--bb-depth-1)]
bg-gray-800/900    → bg-[var(--bb-depth-2)]
text-gray-400/500  → text-[var(--bb-ink-3)]
text-gray-600      → text-[var(--bb-ink-2)]
text-gray-900      → text-[var(--bb-ink-1)]
text-white         → text-[var(--bb-ink-0)] (em fundos escuros)
bg-red-600/700     → bg-[var(--bb-brand)]
text-red-600       → text-[var(--bb-brand)]
border-gray-200    → border-[var(--bb-depth-1)]
border-gray-700    → border-[var(--bb-depth-2)]
```

NÃO substituir tudo de uma vez — fazer por arquivo, testar que não quebra.
Priorizar: login, landing, dashboard admin, shells.

**PASSO 4: Eliminar emojis de UI, substituir por ícones Lucide**

```bash
# Listar todos emojis em componentes
grep -rn "🏛️\|🥋\|📊\|💰\|🎯\|⚡\|🔥\|📝\|👤\|🎉\|🏆\|📅\|💪\|📱\|💳\|🏋️" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\."
```

Regra de substituição:
```
🏛️ → <Building2 className="h-5 w-5" />
🥋 → <Award className="h-5 w-5" />  (ou UserPlus)
📊 → <BarChart3 className="h-5 w-5" />
💰 → <DollarSign className="h-5 w-5" />
🎯 → <Target className="h-5 w-5" />
📝 → <FileText className="h-5 w-5" />
👤 → <User className="h-5 w-5" />
🎉 → <PartyPopper className="h-5 w-5" />
🏆 → <Trophy className="h-5 w-5" />
📅 → <Calendar className="h-5 w-5" />
💪 → <Dumbbell className="h-5 w-5" />
📱 → <Smartphone className="h-5 w-5" />
💳 → <CreditCard className="h-5 w-5" />

import { Building2, Award, BarChart3, ... } from 'lucide-react';
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: design system — tipografia, cores var(--bb-*), zero emojis em UI"
git push origin main
```

---

## BLOCO 03 — LANDING PAGE PREMIUM
### Primeira impressão — tem que ser impecável

**Diagnóstico:**
```bash
LANDING=$(find app -maxdepth 3 -name "page.tsx" | grep -v "login\|admin\|professor\|dashboard\|teen\|kids\|parent\|recepcao\|franqueador\|superadmin" | head -1)
echo "Landing: $LANDING"
wc -l "$LANDING"
cat "$LANDING" | head -150
```

**O que a landing de um software maduro tem:**

1. **Hero section** — Headline poderosa (max 8 palavras), sub-headline (1 frase), 1 CTA primário, 1 secundário. Sem "Preparando seu tatame..." como loading.

2. **Social proof ACIMA da dobra** — "X academias confiam no BlackBelt" ou "Gerencie sua academia como os melhores". A Tecnofit mostra "7.000 clientes, 900.000 alunos" logo na home.

3. **Mockup do produto** — Screenshot real do dashboard (não dados fake genéricos).

4. **Seções limpas com muito espaçamento** — `py-20 lg:py-32` entre seções.

5. **Depoimentos** — Mesmo que inicialmente sejam de beta testers.

6. **Footer profissional** — CNPJ (ou CPF de MEI), endereço, links, redes sociais.

**Correções na landing:**

```tsx
// REGRAS DE ESTILO PARA A LANDING:

// Hero
<section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--bb-ink-1)] leading-[1.1]">
      {/* MAX 8 palavras. Direto. Sem firula. */}
      Sua academia no piloto automático.
    </h1>
    <p className="mt-6 text-lg sm:text-xl text-[var(--bb-ink-3)] max-w-2xl mx-auto leading-relaxed">
      Gestão completa para academias de artes marciais. Check-in, turmas,
      cobranças, graduações e relatórios — tudo em um só lugar.
    </p>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/cadastrar-academia"
        className="h-14 px-8 inline-flex items-center justify-center rounded-xl bg-[var(--bb-brand)] text-white font-semibold text-base transition-all duration-200 hover:opacity-90">
        Começar grátis — 7 dias
      </Link>
      <Link href="/login"
        className="h-14 px-8 inline-flex items-center justify-center rounded-xl border border-[var(--bb-depth-2)] text-[var(--bb-ink-2)] font-medium text-base transition-all duration-200 hover:bg-[var(--bb-depth-1)]">
        Já tenho conta
      </Link>
    </div>
  </div>
</section>

// Seções de features
<section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--bb-ink-1)] text-center mb-4">
      {/* Cada seção: título + subtítulo + cards */}
    </h2>
    <p className="text-lg text-[var(--bb-ink-3)] text-center max-w-2xl mx-auto mb-16">
      {/* Subtítulo explicativo */}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Cards de features */}
    </div>
  </div>
</section>
```

**Remover o loading "Preparando seu tatame...":**
```bash
grep -rn "Preparando seu tatame\|Preparando" app/ components/ --include="*.tsx" | head -5
# Substituir por loading instantâneo ou skeleton
```

Se a landing tem loading state, provavelmente é porque está buscando dados no useEffect. Landing page de produto NÃO busca dados — é estática. Se tiver `useEffect` com fetch na landing, remover e usar conteúdo hardcoded.

**Footer profissional:**
```tsx
<footer className="border-t border-[var(--bb-depth-1)] py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Coluna 1: Logo + descrição curta */}
      <div>
        <span className="text-xl font-bold text-[var(--bb-ink-1)]">BlackBelt</span>
        <p className="mt-3 text-sm text-[var(--bb-ink-3)]">
          Gestão inteligente para academias de artes marciais.
        </p>
      </div>
      {/* Coluna 2: Produto */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--bb-ink-2)] mb-3">Produto</h4>
        <ul className="space-y-2 text-sm text-[var(--bb-ink-3)]">
          <li><Link href="/precos">Planos e preços</Link></li>
          <li><Link href="/changelog">Novidades</Link></li>
          <li><Link href="/status">Status do sistema</Link></li>
        </ul>
      </div>
      {/* Coluna 3: Suporte */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--bb-ink-2)] mb-3">Suporte</h4>
        <ul className="space-y-2 text-sm text-[var(--bb-ink-3)]">
          <li><Link href="/contato">Contato</Link></li>
          <li><Link href="/ajuda">Central de ajuda</Link></li>
        </ul>
      </div>
      {/* Coluna 4: Legal */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--bb-ink-2)] mb-3">Legal</h4>
        <ul className="space-y-2 text-sm text-[var(--bb-ink-3)]">
          <li><Link href="/privacidade">Privacidade</Link></li>
          <li><Link href="/termos">Termos de uso</Link></li>
          <li><Link href="/excluir-conta">Excluir conta</Link></li>
        </ul>
      </div>
    </div>
    <div className="mt-12 pt-8 border-t border-[var(--bb-depth-1)] flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-xs text-[var(--bb-ink-4)]">
        © 2026 BlackBelt. Todos os direitos reservados.
      </p>
      <p className="text-xs text-[var(--bb-ink-4)]">
        Vespasiano, MG — Brasil
      </p>
    </div>
  </div>
</footer>
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: landing page premium — hero, seções, footer profissional"
git push origin main
```

---

## BLOCO 04 — TELA DE LOGIN PREMIUM
### Segunda impressão mais importante — onde o usuário decide usar ou não

**A tela de login atual tem problemas:**
1. Preview do dashboard com dados fake óbvios (45 alunos, R$ 15.8k)
2. Botões Google/Apple podem estar espremidos no mobile
3. Link "← Voltar para a página inicial" parece provisório
4. Rodapé com "Recebeu um convite?" não é padrão de SaaS enterprise
5. Botão "Entrando..." visível antes de clicar (deve ser estado de loading APÓS clicar)

**Login de software maduro tem:**
- Layout limpo, sem distrações
- Logo grande e profissional
- Frase curta (1 linha): "Acesse sua academia"
- Campos email + senha com design impecável
- Botões OAuth (Google, Apple) limpos
- Link discreto para cadastro
- Footer mínimo: Privacidade | Termos | Contato

**Implementar:**

```tsx
// PADRÃO DE LOGIN ENTERPRISE

// Layout principal: split-screen no desktop, full no mobile
<div className="flex min-h-screen bg-[var(--bb-depth-0)]">

  {/* LADO ESQUERDO — Brand (desktop only) */}
  <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col items-center justify-center bg-[var(--bb-depth-1)] relative overflow-hidden">
    {/* Fundo com gradiente sutil, NÃO dados fake */}
    <div className="relative z-10 max-w-sm text-center px-8">
      <h2 className="text-3xl font-bold text-[var(--bb-ink-1)] mb-4">
        BlackBelt
      </h2>
      <p className="text-base text-[var(--bb-ink-3)] leading-relaxed">
        A plataforma de gestão mais completa para academias de artes marciais.
      </p>
      {/* Feature bullets discretos — sem dados fake */}
      <div className="mt-8 space-y-3 text-left">
        {[
          'Check-in inteligente por QR Code',
          'Gestão de turmas e professores',
          'Controle financeiro completo',
          'Graduação e progressão de faixas',
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm text-[var(--bb-ink-2)]">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--bb-brand)] shrink-0" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* LADO DIREITO — Formulário (sempre visível) */}
  <div className="flex w-full lg:w-[55%] xl:w-[50%] flex-col items-center justify-center px-4 sm:px-8 lg:px-16">
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--bb-ink-1)]">BlackBelt</h1>
      </div>

      {/* Título */}
      <h2 className="text-xl font-semibold text-[var(--bb-ink-1)] mb-1">Entrar</h2>
      <p className="text-sm text-[var(--bb-ink-3)] mb-8">
        Acesse sua academia com segurança.
      </p>

      {/* OAuth — empilhado no mobile, lado a lado no sm+ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button className="flex-1 h-12 rounded-xl border border-[var(--bb-depth-2)] flex items-center justify-center gap-2 text-sm font-medium text-[var(--bb-ink-2)] transition-all duration-200 hover:bg-[var(--bb-depth-1)]">
          <GoogleIcon /> Google
        </button>
        <button className="flex-1 h-12 rounded-xl border border-[var(--bb-depth-2)] flex items-center justify-center gap-2 text-sm font-medium text-[var(--bb-ink-2)] transition-all duration-200 hover:bg-[var(--bb-depth-1)]">
          <AppleIcon /> Apple
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--bb-depth-1)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--bb-depth-0)] px-3 text-[var(--bb-ink-4)]">
            ou continue com email
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--bb-ink-2)] mb-1.5">Email</label>
          <input type="email" className="w-full h-12 px-4 rounded-xl border border-[var(--bb-depth-2)] bg-transparent text-[var(--bb-ink-1)] text-sm placeholder:text-[var(--bb-ink-4)] focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)] focus:border-transparent transition-all duration-200" placeholder="seu@email.com" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-[var(--bb-ink-2)]">Senha</label>
            <Link href="/esqueci-senha" className="text-xs text-[var(--bb-brand)] hover:underline">Esqueceu?</Link>
          </div>
          <input type="password" className="w-full h-12 px-4 rounded-xl border border-[var(--bb-depth-2)] bg-transparent text-[var(--bb-ink-1)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-brand)] focus:border-transparent transition-all duration-200" />
        </div>
        <button type="submit" className="w-full h-12 rounded-xl bg-[var(--bb-brand)] text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50">
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      {/* Cadastro */}
      <p className="mt-8 text-center text-sm text-[var(--bb-ink-3)]">
        Não tem conta?{' '}
        <Link href="/cadastrar-academia" className="text-[var(--bb-brand)] font-medium hover:underline">
          Cadastre sua academia
        </Link>
      </p>

      {/* Footer mínimo */}
      <div className="mt-12 flex justify-center gap-4 text-xs text-[var(--bb-ink-4)]">
        <Link href="/privacidade" className="hover:text-[var(--bb-ink-3)]">Privacidade</Link>
        <Link href="/termos" className="hover:text-[var(--bb-ink-3)]">Termos</Link>
        <Link href="/contato" className="hover:text-[var(--bb-ink-3)]">Contato</Link>
      </div>

    </div>
  </div>
</div>
```

**O que REMOVER da tela de login atual:**
- Preview do dashboard com dados fake (45 alunos, R$ 15.8k, check-ins recentes)
- Carrossel de cores no rodapé
- Botão "Tenho um convite" como CTA separado (mover pra link inline ou página de cadastro)
- Texto "Entrando..." visível antes de clicar (deve ser estado do botão)
- "← Voltar para a página inicial" (não necessário — logo clicável já serve)

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: login premium — layout enterprise limpo, sem dados fake"
git push origin main
```

---

## BLOCO 05 — DASHBOARD ADMIN PREMIUM
### A tela que o dono da academia mais vê — precisa ser impecável

**Diagnóstico:**
```bash
ADMIN_DASH=$(find app -path "*admin*" -maxdepth 3 -name "page.tsx" | head -1)
echo "Dashboard admin: $ADMIN_DASH"
cat "$ADMIN_DASH" | head -100

# Verificar shell do admin
find components/shell -name "*Admin*" -o -name "*admin*" | head -5
```

**Padrões de dashboard enterprise:**

1. **Header da página** — "Dashboard" com saudação: "Bom dia, Gregory" + data atual
2. **KPI cards** — 4 cards no topo: Alunos ativos, Presença do mês, Receita do mês, Inadimplência
3. **Gráficos** — Recharts com design limpo, cores consistentes
4. **Sem emojis** — ícones Lucide em vez de emojis
5. **Dados mock REALISTAS** — variação, não números redondos

```tsx
// PADRÃO DE KPI CARD ENTERPRISE
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
  {kpis.map((kpi) => (
    <div key={kpi.label} className="rounded-2xl border border-[var(--bb-depth-1)] bg-[var(--bb-depth-0)] p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--bb-ink-3)]">{kpi.label}</span>
        <kpi.icon className="h-5 w-5 text-[var(--bb-ink-4)]" />
      </div>
      <div className="text-2xl font-bold text-[var(--bb-ink-1)]">{kpi.value}</div>
      <div className={`mt-1 text-xs font-medium ${kpi.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}% vs. mês anterior
      </div>
    </div>
  ))}
</div>

// KPIs com dados REALISTAS (não redondos):
const mockKpis = [
  { label: 'Alunos ativos', value: '127', trend: 4.2, icon: Users },
  { label: 'Presença mensal', value: '83%', trend: 2.1, icon: CalendarCheck },
  { label: 'Receita', value: 'R$ 24.830', trend: 7.5, icon: TrendingUp },
  { label: 'Inadimplência', value: '8,3%', trend: -1.4, icon: AlertCircle },
];
```

**Gráficos Recharts com estilo profissional:**
```tsx
// Cores dos gráficos: usar brand + neutros
const CHART_COLORS = {
  primary: '#C62828',    // var(--bb-brand)
  secondary: '#EF5350',  // brand mais claro
  neutral: '#64748B',    // slate-500
  success: '#10B981',    // emerald-500
  background: 'transparent',
};

// Estilo do Recharts:
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#C62828" stopOpacity={0.15} />
        <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-depth-1)" />
    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--bb-ink-4)" />
    <YAxis tick={{ fontSize: 12 }} stroke="var(--bb-ink-4)" />
    <Tooltip
      contentStyle={{
        backgroundColor: 'var(--bb-depth-0)',
        border: '1px solid var(--bb-depth-2)',
        borderRadius: '12px',
        fontSize: '13px',
      }}
    />
    <Area type="monotone" dataKey="receita" stroke="#C62828" fill="url(#colorRevenue)" strokeWidth={2} />
  </AreaChart>
</ResponsiveContainer>
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: dashboard admin premium — KPIs, gráficos, dados realistas"
git push origin main
```

---

## BLOCO 06 — SHELLS E NAVEGAÇÃO CONSISTENTES
### Sidebar, bottom nav, header — mesma identidade em todos os roles

**Diagnóstico:**
```bash
echo "=== SHELLS ==="
find components/shell -name "*.tsx" | sort

echo ""
echo "=== VERIFICAR CONSISTÊNCIA ==="
for f in $(find components/shell -name "*.tsx"); do
  echo "--- $(basename $f) ---"
  echo "  Linhas: $(wc -l < $f)"
  echo "  Sidebar: $(grep -c 'sidebar\|Sidebar\|w-64\|w-72' $f)"
  echo "  Bottom nav: $(grep -c 'bottom\|Bottom\|fixed.*bottom' $f)"
  echo "  Header: $(grep -c 'header\|Header\|top-0\|sticky' $f)"
  echo "  Rounded: $(grep -oh 'rounded-[a-z0-9]*' $f | sort -u | tr '\n' ' ')"
  echo ""
done
```

**Padrões que TODOS os shells devem seguir:**

```tsx
// SIDEBAR (desktop) — TODOS os shells admin/professor/recepcao/franqueador/superadmin
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-[var(--bb-depth-1)] bg-[var(--bb-depth-0)]">
  {/* Logo */}
  <div className="h-16 flex items-center px-6 border-b border-[var(--bb-depth-1)]">
    <span className="text-lg font-bold text-[var(--bb-ink-1)]">BlackBelt</span>
  </div>
  {/* Nav items */}
  <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {items.map((item) => (
      <Link key={item.href} href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${isActive ? 'bg-[var(--bb-brand)] text-white' : 'text-[var(--bb-ink-3)] hover:bg-[var(--bb-depth-1)] hover:text-[var(--bb-ink-1)]'}
        `}>
        <item.icon className="h-5 w-5 shrink-0" />
        {item.label}
      </Link>
    ))}
  </nav>
  {/* User section */}
  <div className="p-4 border-t border-[var(--bb-depth-1)]">
    {/* Avatar + nome + role */}
  </div>
</aside>

// BOTTOM NAV (mobile) — shells com bottom nav (aluno, professor, teen, kids, parent)
<nav className="fixed bottom-0 inset-x-0 lg:hidden border-t border-[var(--bb-depth-1)] bg-[var(--bb-depth-0)] z-50 safe-area-bottom">
  <div className="flex items-center justify-around h-16">
    {items.map((item) => (
      <Link key={item.href} href={item.href}
        className={`flex flex-col items-center justify-center w-full h-full text-xs
          ${isActive ? 'text-[var(--bb-brand)]' : 'text-[var(--bb-ink-4)]'}
        `}>
        <item.icon className="h-5 w-5 mb-0.5" />
        <span>{item.label}</span>
      </Link>
    ))}
  </div>
</nav>

// MAIN CONTENT — TODOS
<main className="lg:ml-64 min-h-screen">
  <div className="p-4 sm:p-6 lg:p-8">
    {children}
  </div>
</main>

// MOBILE HEADER (quando tem sidebar) — hamburger menu
<header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-[var(--bb-depth-1)] bg-[var(--bb-depth-0)]">
  <button onClick={toggleMenu} className="p-2 -ml-2">
    <Menu className="h-5 w-5 text-[var(--bb-ink-2)]" />
  </button>
  <span className="text-sm font-semibold text-[var(--bb-ink-1)]">BlackBelt</span>
  <div className="w-8" /> {/* spacer */}
</header>
```

**Garantir consistência em TODOS os shells:**
- Mesma largura de sidebar (w-64)
- Mesma altura de header mobile (h-14)
- Mesma altura de bottom nav (h-16)
- Mesmos rounded (rounded-xl para items ativos)
- Mesmas cores para ativo (bg-[var(--bb-brand)] text-white)
- Mesmas transições (transition-all duration-200)

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: shells consistentes — sidebar, bottom nav, header padronizados"
git push origin main
```

---

## BLOCO 07 — MICROINTERAÇÕES E TRANSIÇÕES
### O que separa "funciona" de "premium"

**Adicionar transições globais suaves:**

```css
/* Em styles/globals.css ou equivalente */

/* Transição suave para links e botões */
a, button, [role="button"] {
  transition: all 0.2s ease-out;
}

/* Cards com hover sutil */
.card-hover {
  transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
}
.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Skeleton loading suave (NÃO usar texto "Carregando...") */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bb-depth-1) 25%, var(--bb-depth-2) 50%, var(--bb-depth-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

/* Page transitions - fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: fadeIn 0.3s ease-out;
}
```

**Substituir TODOS os "Carregando..." / "Preparando..." por skeletons:**

```bash
# Encontrar todos os loading text
grep -rn "Carregando\|Preparando\|Loading\.\.\.\|Aguarde" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\."
```

Substituir por skeleton components:
```tsx
// ERRADO — texto de loading
{loading && <p>Carregando...</p>}

// CORRETO — skeleton (mostra a estrutura da página enquanto carrega)
{loading && (
  <div className="space-y-4">
    <div className="skeleton h-8 w-48" />
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-3/4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  </div>
)}
```

**Botão de submit com loading state no PRÓPRIO botão:**
```tsx
// ERRADO
<button>Entrando...</button>  // Sempre mostra "Entrando..."

// CORRETO
<button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Entrando...
    </span>
  ) : 'Entrar'}
</button>
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "design: microinterações — skeletons, transições, hover states premium"
git push origin main
```

---

## BLOCO 08 — VERIFICAÇÃO FINAL + COPY PROFISSIONAL + TAG

**Copy profissional — substituir linguagem de dev por linguagem de produto:**

```bash
# Encontrar textos que parecem de dev, não de produto
grep -rn "Em breve\|em breve\|TODO\|teste\|Teste\|debug\|Debug\|example\|HACK\|workaround" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\.\|placeholder="
```

**Regras de copy:**
```
"Em breve" → remover o item do menu
"Carregando..." → skeleton (sem texto)
"Preparando seu tatame..." → remover (landing é estática)
"Erro ao carregar" → "Não foi possível carregar. Tente novamente."
"Salvo com sucesso!" → "Alterações salvas."
"Tem certeza?" → "Esta ação não pode ser desfeita."
"Deletar" → "Remover" (menos agressivo)
"OK" → "Confirmar" ou "Entendi"
```

**Verificação final:**
```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  VERIFICAÇÃO VISUAL FINAL                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Emojis em UI (deve ser 0)
EMOJIS=$(grep -rn "🏛️\|🥋\|📊\|💰\|🎯\|📝\|👤\|🎉\|🏆\|📅\|💪\|📱\|💳" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | wc -l | tr -d ' ')
echo "Emojis em UI: $EMOJIS (ideal: 0)"

# Cores hardcoded
HARDCODED=$(grep -rn "bg-\(red\|blue\|green\|gray\|slate\)-[0-9]" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | wc -l | tr -d ' ')
echo "Cores hardcoded: $HARDCODED (ideal: mínimo)"

# Loading text
LOADING_TEXT=$(grep -rn "Carregando\.\.\.\|Preparando\.\.\.\|Loading\.\.\." app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | wc -l | tr -d ' ')
echo "Loading com texto: $LOADING_TEXT (ideal: 0, usar skeleton)"

# "Em breve"
EM_BREVE=$(grep -rn "Em breve\|Coming soon" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | wc -l | tr -d ' ')
echo "Em breve: $EM_BREVE (ideal: 0)"

# Build
pnpm typecheck && echo "✅ TypeScript" || echo "❌ TypeScript"
pnpm build && echo "✅ Build" || echo "❌ Build"
```

**Tag:**
```bash
git add -A && git commit -m "design: polish final — copy profissional, verificação visual"
git push origin main

git tag -a v6.0.0-premium-visual -m "BlackBelt App v6.0.0 — Visual Premium Enterprise
- design: design system (tipografia, cores var(--bb-*), espaçamento)
- design: zero emojis em UI — ícones Lucide
- design: landing page premium (hero, seções, footer)
- design: login premium (split-screen enterprise)
- design: dashboard admin (KPIs, gráficos profissionais)
- design: shells consistentes (sidebar, bottom nav, header)
- design: microinterações (skeletons, transições, hover states)
- design: copy profissional (linguagem de produto, não de dev)
- Zero 'Carregando...', zero 'Em breve', zero dados fake óbvios"

git push origin v6.0.0-premium-visual
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt POLISH VISUAL PREMIUM do BlackBelt App. Verifique o último commit com `git log --oneline -5` e continue do próximo BLOCO. O objetivo é: visual de software enterprise maduro. Design system consistente (var(--bb-*)), zero emojis em UI, skeletons em vez de "Carregando...", landing/login/dashboard premium, shells padronizados. NUNCA delete isMock(). CSS var(--bb-*).
```

---

## FIM DO MEGA PROMPT

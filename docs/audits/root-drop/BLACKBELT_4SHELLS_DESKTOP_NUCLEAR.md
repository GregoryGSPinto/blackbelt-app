# BLACKBELT v2 — FIX DESKTOP LAYOUT: RECEPCIONISTA + ADULTO + KIDS + TEEN
## 4 Perfis Com Layout Mobile no Desktop — Corrigir TODOS de Uma Vez

> **PROBLEMA GLOBAL:** Vários perfis estão renderizando layout mobile no desktop:
> conteúdo estreito centralizado, bottom nav aparecendo em telas grandes,
> sem sidebar. O padrão do BlackBelt para TODOS os perfis é:
>
> - **Desktop (lg: ≥1024px):** Sidebar fixa à esquerda (260px) + conteúdo flex-1 full width
> - **Tablet (md: 768-1023px):** Bottom nav OU sidebar overlay + conteúdo full width
> - **Mobile (<768px):** Bottom nav + conteúdo full width
>
> **USE O AdminShell COMO REFERÊNCIA — ELE JÁ FUNCIONA CORRETO NO DESKTOP.**

---

## ANTES DE COMEÇAR — INVENTÁRIO OBRIGATÓRIO

```bash
# 1. Encontre TODOS os shells
find . -path "*/shell/*Shell*" -name "*.tsx" | sort

# 2. Veja o AdminShell (REFERÊNCIA — funciona correto no desktop)
cat $(find . -path "*/shell/AdminShell*" -name "*.tsx" | head -1)

# 3. Veja cada shell problemático
cat $(find . -path "*/shell/RecepcaoShell*" -name "*.tsx" | head -1)
cat $(find . -path "*/shell/MainShell*" -name "*.tsx" | head -1)
cat $(find . -path "*/shell/KidsShell*" -name "*.tsx" | head -1)
cat $(find . -path "*/shell/TeenShell*" -name "*.tsx" | head -1)

# 4. Veja os layouts de cada route group
cat $(find . -path "*/(recepcao)/layout*" -name "*.tsx" | head -1)
cat $(find . -path "*/(main)/layout*" -name "*.tsx" | head -1)
cat $(find . -path "*/(kids)/layout*" -name "*.tsx" | head -1)
cat $(find . -path "*/(teen)/layout*" -name "*.tsx" | head -1)

# 5. Liste TODAS as páginas de cada perfil
find . -path "*/(recepcao)/*" -name "page.tsx" | sort
find . -path "*/(main)/*" -name "page.tsx" | sort
find . -path "*/(kids)/*" -name "page.tsx" | sort
find . -path "*/(teen)/*" -name "page.tsx" | sort

# 6. Entenda o padrão do sidebar do AdminShell
grep -n "sidebar\|Sidebar\|lg:flex\|lg:hidden\|lg:block\|lg:w-\|hidden lg:\|bottom" $(find . -path "*/shell/AdminShell*" -name "*.tsx" | head -1)

# 7. Verifique breakpoints/responsividade
grep -rn "lg:ml-\|lg:pl-\|max-w-md\|max-w-sm\|max-w-lg\|w-\[.*px\]" components/shell/ --include="*.tsx" | head -20
```

LEIA TUDO. Entenda EXATAMENTE como o AdminShell faz sidebar desktop + bottom nav mobile. REPLIQUE esse padrão nos 4 shells abaixo.

---

## PADRÃO UNIVERSAL DE SHELL — COPIAR DO AdminShell

Todo shell do BlackBelt DEVE seguir esta estrutura:

```tsx
// ESTRUTURA BASE DE QUALQUER SHELL
export function [Profile]Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>

      {/* ═══ SIDEBAR DESKTOP (visível apenas lg+) ═══ */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] lg:z-40"
             style={{ backgroundColor: 'var(--bb-depth-2)', borderRight: '1px solid var(--bb-glass-border)' }}>
        {/* Logo + role */}
        <div className="h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
          <span className="font-display text-lg font-bold" style={{ color: 'var(--bb-brand)' }}>BlackBelt</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--bb-ink-60)', backgroundColor: 'var(--bb-depth-3)' }}>
            {ROLE_LABEL}
          </span>
        </div>

        {/* Nav items com grupos */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navGroups.map(group => (
            <div key={group.label}>
              {group.label && (
                <p className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider font-semibold"
                   style={{ color: 'var(--bb-ink-40)' }}>
                  {group.label}
                </p>
              )}
              {group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200 ${isActive ? '' : 'hover:translate-x-0.5'}`}
                    style={{
                      backgroundColor: isActive ? 'var(--bb-brand-surface)' : 'transparent',
                      color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                      borderLeft: isActive ? '3px solid var(--bb-brand)' : '3px solid transparent',
                    }}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && <span className="ml-auto ...">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: avatar + nome + logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
          {/* Avatar + nome + role + botão logout */}
        </div>
      </aside>

      {/* ═══ SIDEBAR MOBILE OVERLAY (quando hamburger aberto) ═══ */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto"
                 style={{ backgroundColor: 'var(--bb-depth-2)' }}>
            {/* Mesmos items do sidebar desktop */}
          </aside>
        </>
      )}

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6"
                style={{ backgroundColor: 'var(--bb-depth-1)', borderBottom: '1px solid var(--bb-glass-border)' }}>
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <span className="lg:hidden font-display font-bold" style={{ color: 'var(--bb-brand)' }}>BlackBelt</span>
          </div>
          {/* Right: notificações, settings, avatar */}
          <div className="flex items-center gap-2">
            {/* ... bell, settings, avatar ... */}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* ═══ BOTTOM NAV MOBILE (visível apenas <lg) ═══ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around h-16"
           style={{
             backgroundColor: 'var(--bb-depth-2)',
             borderTop: '1px solid var(--bb-glass-border)',
             paddingBottom: 'env(safe-area-inset-bottom)',
             backdropFilter: 'blur(20px)',
           }}>
        {bottomNavItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 min-w-[64px]">
              <item.icon className="w-5 h-5" style={{ color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }} />
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-40)' }}>
                {item.label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--bb-brand)' }} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

**CLASSES CRÍTICAS:**
- Sidebar: `hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px]`
- Content: `lg:ml-[260px]`
- Bottom nav: `lg:hidden fixed bottom-0 inset-x-0`
- Page padding: `pb-24 lg:pb-6` (espaço para bottom nav no mobile)

---

═══════════════════════════════════════════════════════════════
## PERFIL 1 — RECEPCIONISTA (RecepcaoShell)
═══════════════════════════════════════════════════════════════

### Arquivo: `components/shell/RecepcaoShell.tsx` (REWRITE)

**Role label:** "Recepção"

**SIDEBAR DESKTOP — Itens de navegação:**

```typescript
import {
  LayoutDashboard, Search, UserPlus, DollarSign, Clock,
  MessageSquare, FileText, User, Settings, Menu, Bell,
  CalendarCheck, Users
} from 'lucide-react';

const navGroups = [
  {
    label: 'OPERAÇÃO',
    items: [
      { label: 'Painel do Dia',   href: '/recepcao',              icon: LayoutDashboard },
      { label: 'Atendimento',     href: '/recepcao/atendimento',  icon: Search },
      { label: 'Cadastro Rápido', href: '/recepcao/cadastro',     icon: UserPlus },
      { label: 'Check-in Alunos', href: '/recepcao/checkin',      icon: CalendarCheck },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { label: 'Caixa do Dia',      href: '/recepcao/caixa',          icon: DollarSign },
      { label: 'Experimentais',      href: '/recepcao/experimentais',  icon: Clock },
    ],
  },
  {
    label: 'COMUNICAÇÃO',
    items: [
      { label: 'Mensagens', href: '/recepcao/mensagens', icon: MessageSquare },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { label: 'Perfil',        href: '/recepcao/perfil',        icon: User },
      { label: 'Configurações', href: '/recepcao/configuracoes', icon: Settings },
    ],
  },
];
```

**BOTTOM NAV MOBILE — 5 itens:**

```typescript
const bottomNavItems = [
  { label: 'Painel',      href: '/recepcao',              icon: LayoutDashboard },
  { label: 'Atendimento', href: '/recepcao/atendimento',  icon: Search },
  { label: 'Cadastro',    href: '/recepcao/cadastro',     icon: UserPlus },
  { label: 'Caixa',       href: '/recepcao/caixa',        icon: DollarSign },
  { label: 'Mais',        href: '#more',                  icon: Menu },
];
// "Mais" abre drawer com: Check-in Alunos, Experimentais, Mensagens, Perfil, Config
```

### Corrigir TODAS as páginas /recepcao/*:

Cada página DEVE usar:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
```

Páginas que DEVEM ter layout desktop otimizado:

| Rota | Layout Desktop |
|------|----------------|
| `/recepcao` | KPI cards em grid 4 cols + aulas hoje em tabela + check-ins recentes |
| `/recepcao/atendimento` | Busca full-width + resultado em tabela ampla |
| `/recepcao/cadastro` | Form em 2 colunas no desktop |
| `/recepcao/checkin` | Lista de alunos + toggle presença full-width |
| `/recepcao/caixa` | Tabela de transações + resumo lateral |
| `/recepcao/experimentais` | Cards de experimentais + tabela histórico |
| `/recepcao/mensagens` | Split view: lista conversas (320px) + chat (flex-1) |
| `/recepcao/perfil` | Form 2 colunas |
| `/recepcao/configuracoes` | Tabs com forms responsivos |

---

═══════════════════════════════════════════════════════════════
## PERFIL 2 — ALUNO ADULTO (MainShell)
═══════════════════════════════════════════════════════════════

### Arquivo: `components/shell/MainShell.tsx` (REWRITE)

**Role label:** "Aluno"

**SIDEBAR DESKTOP — Itens de navegação:**

```typescript
import {
  LayoutDashboard, Calendar, QrCode, TrendingUp, Trophy,
  Target, BarChart3, Video, Swords, Medal, UserPlus,
  MessageSquare, CreditCard, ShoppingBag, User, Settings, Menu, Bell
} from 'lucide-react';

const navGroups = [
  {
    label: 'PRINCIPAL',
    items: [
      { label: 'Dashboard',  href: '/dashboard',         icon: LayoutDashboard },
      { label: 'Turmas',     href: '/dashboard/turmas',  icon: Calendar },
      { label: 'Check-in',   href: '/dashboard/checkin', icon: QrCode, highlight: true },
    ],
  },
  {
    label: 'MEU PROGRESSO',
    items: [
      { label: 'Evolução',    href: '/dashboard/progresso',   icon: TrendingUp },
      { label: 'Conquistas',  href: '/dashboard/conquistas',  icon: Trophy },
      { label: 'Metas',       href: '/metas',                 icon: Target },
      { label: 'Meu Treino',  href: '/dashboard/meu-progresso', icon: BarChart3 },
    ],
  },
  {
    label: 'CONTEÚDO',
    items: [
      { label: 'Biblioteca', href: '/dashboard/conteudo', icon: Video },
      { label: 'Torneios',   href: '/torneios',           icon: Swords },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { label: 'Ranking',    href: '/dashboard/ranking',    icon: Medal },
      { label: 'Indicar',    href: '/indicar',              icon: UserPlus },
      { label: 'Mensagens',  href: '/dashboard/mensagens',  icon: MessageSquare },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { label: 'Carteirinha',   href: '/carteirinha',               icon: CreditCard },
      { label: 'Loja',          href: '/dashboard/loja',            icon: ShoppingBag },
      { label: 'Perfil',        href: '/perfil',                    icon: User },
      { label: 'Configurações', href: '/dashboard/configuracoes',   icon: Settings },
    ],
  },
];
```

**BOTTOM NAV MOBILE — 5 itens:**

```typescript
const bottomNavItems = [
  { label: 'Home',       href: '/dashboard',             icon: LayoutDashboard },
  { label: 'Turmas',     href: '/dashboard/turmas',      icon: Calendar },
  { label: 'Check-in',   href: '/dashboard/checkin',     icon: QrCode },  // botão central destaque
  { label: 'Progresso',  href: '/dashboard/progresso',   icon: TrendingUp },
  { label: 'Mais',       href: '#more',                  icon: Menu },
];
// "Mais" abre drawer com todos os outros itens
```

### Corrigir TODAS as páginas do adulto:

Cada página DEVE usar:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
```

| Rota | Layout Desktop |
|------|----------------|
| `/dashboard` | Dashboard emocional: KPIs em grid 4 cols, streak, próxima aula, conquistas recentes |
| `/dashboard/turmas` | Grid de turmas em cards 2-3 cols |
| `/dashboard/checkin` | Scanner/manual + histórico |
| `/dashboard/progresso` | Gráficos Recharts lado a lado (2 cols) |
| `/dashboard/conquistas` | Grid de badges 3-4 cols |
| `/metas` | Cards de metas em 2 cols + progresso |
| `/dashboard/meu-progresso` | Analytics com gráficos full-width |
| `/dashboard/conteudo` | Grid Netflix-style (3-4 cols de vídeos) |
| `/torneios` | Cards de campeonatos 2-3 cols |
| `/dashboard/ranking` | Tabela full-width |
| `/indicar` | Código + recompensas em 2 cols |
| `/dashboard/mensagens` | Split view: lista (320px) + chat (flex-1) |
| `/carteirinha` | Card visual centrado + detalhes laterais |
| `/dashboard/loja` | Grid de produtos 3-4 cols |
| `/perfil` | Form/tabs 2 colunas ou full-width tabs |
| `/dashboard/configuracoes` | Tabs com forms responsivos |

---

═══════════════════════════════════════════════════════════════
## PERFIL 3 — TEEN (TeenShell)
═══════════════════════════════════════════════════════════════

### Arquivo: `components/shell/TeenShell.tsx` (REWRITE)

**Role label:** "Teen"
**VISUAL:** Manter a estética gamer/vibrante, mas com sidebar desktop funcional.

**SIDEBAR DESKTOP — Itens de navegação:**

```typescript
import {
  Gamepad2, Calendar, QrCode, TrendingUp, Trophy, Flame,
  Star, Video, Medal, User, Settings, MessageSquare, Menu, Bell
} from 'lucide-react';

const navGroups = [
  {
    label: 'ARENA',
    items: [
      { label: 'Dashboard',    href: '/teen',              icon: Gamepad2 },
      { label: 'Turmas',       href: '/teen/turmas',       icon: Calendar },
      { label: 'Check-in',     href: '/teen/checkin',      icon: QrCode, highlight: true },
    ],
  },
  {
    label: 'EVOLUÇÃO',
    items: [
      { label: 'Ranking',      href: '/teen/ranking',      icon: Medal },
      { label: 'Conquistas',   href: '/teen/conquistas',   icon: Trophy },
      { label: 'Desafios',     href: '/teen/desafios',     icon: Flame },
      { label: 'Season Pass',  href: '/teen/season',       icon: Star },
    ],
  },
  {
    label: 'CONTEÚDO',
    items: [
      { label: 'Vídeos',       href: '/teen/conteudo',     icon: Video },
      { label: 'Academia',     href: '/teen/academia',     icon: TrendingUp },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { label: 'Mensagens',    href: '/teen/mensagens',    icon: MessageSquare },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { label: 'Perfil',        href: '/teen/perfil',        icon: User },
      { label: 'Configurações', href: '/teen/configuracoes', icon: Settings },
    ],
  },
];
```

**BOTTOM NAV MOBILE — 5 itens:**

```typescript
const bottomNavItems = [
  { label: 'Arena',      href: '/teen',              icon: Gamepad2 },
  { label: 'Ranking',    href: '/teen/ranking',      icon: Medal },
  { label: 'Check-in',   href: '/teen/checkin',      icon: QrCode },  // centro, destaque
  { label: 'Conquistas', href: '/teen/conquistas',   icon: Trophy },
  { label: 'Mais',       href: '#more',              icon: Menu },
];
```

**DIFERENÇA VISUAL DO TEEN:**
- Sidebar pode ter gradientes sutis ou accent diferente (roxo/azul gamer)
- Pode ter XP bar no topo do sidebar
- Itens ativos podem ter glow effect sutil
- MAS a ESTRUTURA (sidebar 260px + content flex-1) é IDÊNTICA aos outros shells

### Corrigir TODAS as páginas do teen:

| Rota | Layout Desktop |
|------|----------------|
| `/teen` | Dashboard gamer: XP bar, level, ranking position, streak, próximas aulas em cards grid |
| `/teen/turmas` | Grid de turmas |
| `/teen/checkin` | Check-in + histórico |
| `/teen/ranking` | Tabela/leaderboard full-width |
| `/teen/conquistas` | Grid de badges 3-4 cols gamer style |
| `/teen/desafios` | Cards de desafios em 2 cols |
| `/teen/season` | Season pass visual com tiers |
| `/teen/conteudo` | Grid de vídeos |
| `/teen/academia` | Conteúdo teórico |
| `/teen/mensagens` | Split view |
| `/teen/perfil` | Perfil gamer |
| `/teen/configuracoes` | Tabs config |

---

═══════════════════════════════════════════════════════════════
## PERFIL 4 — KIDS (KidsShell)
═══════════════════════════════════════════════════════════════

### Arquivo: `components/shell/KidsShell.tsx` (REWRITE)

**Role label:** "Kids"
**VISUAL:** Lúdico, colorido, ícones grandes, textos curtos. Mas desktop PRECISA de sidebar.

**SIDEBAR DESKTOP — Itens de navegação:**

```typescript
import {
  Home, Star, BookOpen, Trophy, Smile, Settings, Menu
} from 'lucide-react';

const navGroups = [
  {
    label: '', // Kids não precisa de labels de grupo — simples
    items: [
      { label: 'Início',       href: '/kids',               icon: Home },
      { label: 'Minhas Estrelas', href: '/kids/recompensas', icon: Star },
      { label: 'Aprender!',    href: '/kids/academia',      icon: BookOpen },
      { label: 'Conquistas',   href: '/kids/conquistas',    icon: Trophy },
      { label: 'Meu Perfil',   href: '/kids/perfil',        icon: Smile },
      { label: 'Config',       href: '/kids/configuracoes', icon: Settings },
    ],
  },
];
```

**DIFERENÇA VISUAL DO KIDS:**
- Sidebar: ícones maiores (24px em vez de 20px)
- Labels: font-size 15px em vez de 14px
- Items: padding mais generoso (py-3.5 em vez de py-2.5)
- Border-radius: mais arredondado (rounded-xl)
- Cores: mais vibrantes, mas via CSS variables
- Mascote/emoji no topo da sidebar
- SEM grupo labels (é criança, manter simples)
- SEM mensagens, SEM check-in autônomo, SEM financeiro

**BOTTOM NAV MOBILE — 3-4 itens (SIMPLES):**

```typescript
const bottomNavItems = [
  { label: 'Início',    href: '/kids',               icon: Home },
  { label: 'Estrelas',  href: '/kids/recompensas',   icon: Star },
  { label: 'Aprender',  href: '/kids/academia',      icon: BookOpen },
  { label: 'Perfil',    href: '/kids/perfil',        icon: Smile },
];
```

**IMPORTANTE:** Kids NÃO tem mensagens, NÃO tem drawer "Mais", NÃO tem check-in. Tudo é simples e seguro.

### Corrigir TODAS as páginas do kids:

| Rota | Layout Desktop |
|------|----------------|
| `/kids` | Dashboard lúdico: mascote, estrelas, próxima aula, card grande colorido |
| `/kids/recompensas` | Grid de figurinhas/estrelas 3-4 cols |
| `/kids/academia` | Conteúdo com emojis, quizzes lúdicos |
| `/kids/conquistas` | Grid de badges infantis |
| `/kids/perfil` | Card visual colorido |
| `/kids/configuracoes` | Opções simples (mascote, cor, sons) |

---

═══════════════════════════════════════════════════════════════
## PASSO FINAL — CORRIGIR LARGURA DE TODAS AS PÁGINAS
═══════════════════════════════════════════════════════════════

**VARREDURA OBRIGATÓRIA — executar para TODOS os 4 perfis:**

```bash
# Encontrar páginas com largura restritiva (o bug principal)
grep -rn "max-w-md\|max-w-sm\|max-w-lg\|max-w-xl\|max-w-2xl\|max-w-3xl" \
  app/\(recepcao\)/ app/\(main\)/ app/\(kids\)/ app/\(teen\)/ \
  --include="*.tsx" | grep -v node_modules

# Encontrar containers que centralizam estreito
grep -rn "mx-auto.*max-w-\|w-full.*max-w-" \
  app/\(recepcao\)/ app/\(main\)/ app/\(kids\)/ app/\(teen\)/ \
  --include="*.tsx" | grep -v "max-w-7xl\|max-w-screen\|max-w-full"
```

**PARA CADA RESULTADO:**
- Se é um container de página → trocar para `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`
- Se é um form/modal → pode manter `max-w-2xl` ou `max-w-3xl`
- Se é `max-w-md` ou `max-w-sm` num wrapper de página → **REMOVER** — esse é o bug!

**VERIFICAR QUE GRIDS USAM BREAKPOINTS:**

```bash
# Todas as páginas devem ter grids responsivos
grep -rn "grid-cols-1" app/\(recepcao\)/ app/\(main\)/ app/\(kids\)/ app/\(teen\)/ --include="*.tsx" | head -30
```

Se uma página tem `grid grid-cols-1` sem breakpoints (sem `md:grid-cols-2`, `lg:grid-cols-3`), o conteúdo vai ficar empilhado no desktop. Adicionar breakpoints.

**PADRÃO DE GRID POR TIPO DE CONTEÚDO:**

```
KPI cards:          grid grid-cols-2 md:grid-cols-4 gap-4
Cards de conteúdo:  grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6
Badges/conquistas:  grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4
Tabelas:            w-full overflow-x-auto
Split view (msgs):  flex flex-col lg:flex-row
Formulários:        grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl
Dashboards:         grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6
```

---

═══════════════════════════════════════════════════════════════
## BUILD, TESTE E DEPLOY
═══════════════════════════════════════════════════════════════

```bash
# 1. Typecheck
pnpm typecheck
# Se erros → corrija TODOS antes de prosseguir

# 2. Build
pnpm build
# Se erros → corrija TODOS antes de prosseguir

# 3. Verificação — para CADA perfil, confirmar desktop vs mobile:

# RECEPCIONISTA (julia@guerreiros.com / BlackBelt@2026):
# Desktop ≥1024px:
#   ✓ Sidebar visível com items: Painel, Atendimento, Cadastro, Check-in, Caixa, Experimentais, Mensagens, Perfil, Config
#   ✓ Conteúdo ocupa todo espaço à direita
#   ✓ SEM bottom nav
# Mobile <768px:
#   ✓ Sidebar hidden
#   ✓ Bottom nav com 5 items
#   ✓ Conteúdo full width

# ADULTO (joao@email.com / BlackBelt@2026):
# Desktop:
#   ✓ Sidebar com grupos: Principal, Meu Progresso, Conteúdo, Social, Conta
#   ✓ Dashboard com KPIs em grid, não empilhado vertical
# Mobile:
#   ✓ Bottom nav: Home, Turmas, Check-in, Progresso, Mais

# TEEN (lucas.teen@email.com / BlackBelt@2026):
# Desktop:
#   ✓ Sidebar gamer com: Arena, Evolução, Conteúdo, Social, Conta
#   ✓ Visual vibrante mas funcional
# Mobile:
#   ✓ Bottom nav: Arena, Ranking, Check-in, Conquistas, Mais

# KIDS (miguel.kids@email.com / BlackBelt@2026):
# Desktop:
#   ✓ Sidebar simples com ícones grandes: Início, Estrelas, Aprender, Conquistas, Perfil, Config
#   ✓ SEM mensagens, SEM check-in
# Mobile:
#   ✓ Bottom nav 4 items: Início, Estrelas, Aprender, Perfil

# 4. Commit e push
git add -A
git commit -m "feat: desktop layout fix — sidebar navigation for recepcao, adulto, teen, kids shells + full-width responsive pages"
git push origin main --force
```

---

═══════════════════════════════════════════════════════════════
## REGRAS ABSOLUTAS — NÃO VIOLAR NENHUMA
═══════════════════════════════════════════════════════════════

1. **USE O AdminShell COMO REFERÊNCIA** — copie a estrutura exata de sidebar/bottom nav dele
2. **ZERO cores hardcoded** — tudo via `var(--bb-*)` do ThemeContext
3. **Sidebar: `hidden lg:flex lg:fixed lg:w-[260px]`** — mesma classe em TODOS os shells
4. **Content: `lg:ml-[260px]`** — compensar a sidebar em TODOS os shells
5. **Bottom nav: `lg:hidden fixed bottom-0`** — esconde no desktop em TODOS os shells
6. **`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`** — container padrão de TODAS as páginas
7. **REMOVA `max-w-md`, `max-w-sm`, `max-w-lg`** de containers de página (esse é o bug!)
8. **Grids com breakpoints:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` etc.
9. **NÃO altere** AdminShell, ProfessorShell, ParentShell (já corrigidos ou corretos)
10. **NÃO altere** SuperAdminShell nem FranqueadorShell
11. **isMock()** — não quebre os services existentes
12. **Skeleton loading** — não remova skeletons existentes
13. **Touch targets** mínimo 44px em mobile (48px para kids)
14. **Kids: SEM mensagens, SEM check-in autônomo, SEM financeiro** — perfil protegido
15. **Teen: mensagens LIMITADAS (só professores)** — perfil supervisionado
16. **`pnpm typecheck && pnpm build` — ZERO erros antes do commit**
17. **`git push origin main --force`** — force push conforme solicitado

---

## COMANDO PARA COLAR NO CLAUDE CODE:

```
Leia o arquivo BLACKBELT_4SHELLS_DESKTOP_NUCLEAR.md na raiz do projeto. Execute TODOS os passos na ordem. Quatro perfis (Recepcionista, Adulto, Teen, Kids) estão com layout mobile no desktop — conteúdo estreito centralizado e bottom nav aparecendo em telas grandes. Use o AdminShell como referência e reescreva RecepcaoShell, MainShell, TeenShell e KidsShell com sidebar fixa desktop (260px, hidden lg:flex) + bottom nav mobile (lg:hidden). Corrija TODAS as páginas desses 4 perfis: remova max-w-md/sm/lg de containers, use max-w-7xl mx-auto, adicione grids responsivos com breakpoints. Respeite ThemeContext, isMock(), skeleton loading. pnpm typecheck && pnpm build ZERO erros. git commit e git push origin main --force. Comece agora.
```

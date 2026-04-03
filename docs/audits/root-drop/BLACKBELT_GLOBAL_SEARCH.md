# BLACKBELT v2 — BUSCA GLOBAL: LUPA NO HEADER DE TODOS OS PERFIS
## 4 Agentes — Componente, Integração, Dados, Deploy

> **CONTEXTO:** O software está muito completo — muitas páginas, funcionalidades, menus.
> Os usuários precisam de uma forma rápida de encontrar o que procuram.
> A lupa (🔍) no canto superior direito abre uma barra de busca tipo Command Palette
> (estilo Cmd+K do VS Code / Spotlight do Mac) que pesquisa por:
> - Páginas/rotas do app ("Financeiro", "Alunos", "Turmas")
> - Ações rápidas ("Novo Aluno", "Gerar Cobrança", "Fazer Check-in")
> - Alunos por nome (se admin/professor/recepcionista)
> - Turmas por nome
>
> **REGRA:** Funciona em TODOS os 9 perfis. Cada perfil vê apenas o que tem acesso.

---

## AGENTE 1 — CRIAR COMPONENTE DE BUSCA GLOBAL

**Missão:** Criar o componente `CommandPalette` / `GlobalSearch` que abre ao clicar na lupa ou Cmd+K.

### 1.1 Criar componente

Criar `components/search/GlobalSearch.tsx`:

```
VISUAL:

┌──────────────────────────────────────────────────────────┐
│  🔍 Buscar páginas, alunos, ações...                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PÁGINAS                                                 │
│  📊 Dashboard                                    Enter ↵│
│  👥 Alunos                                              │
│  📚 Turmas                                              │
│  💰 Financeiro                                          │
│                                                          │
│  AÇÕES RÁPIDAS                                          │
│  ➕ Novo Aluno                                           │
│  ➕ Nova Turma                                           │
│  ✅ Fazer Check-in                                       │
│  💳 Gerar Cobrança                                       │
│                                                          │
│  ALUNOS (se digitou nome)                               │
│  🥋 João Mendes — Azul — BJJ Adulto Manhã               │
│  🥋 Maria Silva — Branca — BJJ Kids                     │
│                                                          │
│  Esc para fechar · ↑↓ para navegar · Enter para abrir   │
└──────────────────────────────────────────────────────────┘
```

**Funcionalidades do componente:**

1. **Overlay modal** com backdrop escuro (z-50)
2. **Input de busca** com autofocus, placeholder "Buscar páginas, alunos, ações..."
3. **Filtragem em tempo real** conforme o usuário digita
4. **Navegação por teclado** — ↑↓ para mover seleção, Enter para abrir, Esc para fechar
5. **Atalho Cmd+K (Mac) / Ctrl+K (Windows)** para abrir de qualquer lugar
6. **Categorias:** Páginas, Ações Rápidas, Alunos/Membros (busca no Supabase)
7. **Debounce** na busca de alunos (300ms) para não sobrecarregar
8. **Resultados contextuais** — cada perfil vê apenas suas páginas/ações

### 1.2 Estrutura do componente

```typescript
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Search, X, ArrowRight, Users, BookOpen, DollarSign, Plus, CheckSquare } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  category: 'pagina' | 'acao' | 'aluno' | 'turma';
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

// Mapa de páginas por role
const PAGES_BY_ROLE: Record<string, SearchItem[]> = {
  superadmin: [
    { id: 'sa-dashboard', label: 'Mission Control', category: 'pagina', icon: '📊', href: '/superadmin' },
    { id: 'sa-cockpit', label: 'Cockpit', category: 'pagina', icon: '🎛️', href: '/superadmin/cockpit' },
    { id: 'sa-academias', label: 'Academias', category: 'pagina', icon: '🏛️', href: '/superadmin/academias' },
    { id: 'sa-pipeline', label: 'Pipeline', category: 'pagina', icon: '📈', href: '/superadmin/pipeline' },
    { id: 'sa-prospeccao', label: 'Prospecção', category: 'pagina', icon: '🎯', href: '/superadmin/prospeccao' },
    { id: 'sa-receita', label: 'Receita', category: 'pagina', icon: '💰', href: '/superadmin/receita' },
    { id: 'sa-planos', label: 'Planos', category: 'pagina', icon: '📋', href: '/superadmin/planos' },
    { id: 'sa-features', label: 'Features', category: 'pagina', icon: '🔧', href: '/superadmin/features' },
    { id: 'sa-analytics', label: 'Analytics', category: 'pagina', icon: '📊', href: '/superadmin/analytics' },
    { id: 'sa-comunicacao', label: 'Comunicação', category: 'pagina', icon: '📨', href: '/superadmin/comunicacao' },
    { id: 'sa-compete', label: 'Compete', category: 'pagina', icon: '🏆', href: '/superadmin/compete' },
    { id: 'sa-onboarding', label: 'Onboarding', category: 'pagina', icon: '🚀', href: '/superadmin/onboarding' },
    { id: 'sa-auditoria', label: 'Auditoria', category: 'pagina', icon: '🔍', href: '/superadmin/auditoria' },
    { id: 'sa-suporte', label: 'Suporte', category: 'pagina', icon: '🎧', href: '/superadmin/suporte' },
    { id: 'sa-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/superadmin/perfil' },
  ],
  admin: [
    { id: 'ad-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/admin' },
    { id: 'ad-alunos', label: 'Alunos', category: 'pagina', icon: '👥', href: '/admin/alunos' },
    { id: 'ad-turmas', label: 'Turmas', category: 'pagina', icon: '📚', href: '/admin/turmas' },
    { id: 'ad-financeiro', label: 'Financeiro', category: 'pagina', icon: '💰', href: '/admin/financeiro' },
    { id: 'ad-professores', label: 'Professores', category: 'pagina', icon: '👨‍🏫', href: '/admin/professores' },
    { id: 'ad-graduacoes', label: 'Graduações', category: 'pagina', icon: '🥋', href: '/admin/graduacoes' },
    { id: 'ad-presenca', label: 'Presença', category: 'pagina', icon: '✅', href: '/admin/presenca' },
    { id: 'ad-convites', label: 'Convites', category: 'pagina', icon: '✉️', href: '/admin/convites' },
    { id: 'ad-contratos', label: 'Contratos', category: 'pagina', icon: '📄', href: '/admin/contratos' },
    { id: 'ad-comunicacao', label: 'Comunicação', category: 'pagina', icon: '📨', href: '/admin/comunicacao' },
    { id: 'ad-relatorios', label: 'Relatórios', category: 'pagina', icon: '📈', href: '/admin/relatorios' },
    { id: 'ad-configuracoes', label: 'Configurações', category: 'pagina', icon: '⚙️', href: '/admin/configuracoes' },
    { id: 'ad-plano', label: 'Meu Plano', category: 'pagina', icon: '💳', href: '/admin/plano' },
    { id: 'ad-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/admin/perfil' },
  ],
  professor: [
    { id: 'pr-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/professor' },
    { id: 'pr-turmas', label: 'Minhas Turmas', category: 'pagina', icon: '📚', href: '/professor/turmas' },
    { id: 'pr-chamada', label: 'Chamada', category: 'pagina', icon: '✅', href: '/professor/chamada' },
    { id: 'pr-alunos', label: 'Alunos', category: 'pagina', icon: '👥', href: '/professor/alunos' },
    { id: 'pr-avaliacoes', label: 'Avaliações', category: 'pagina', icon: '📝', href: '/professor/avaliacoes' },
    { id: 'pr-conteudo', label: 'Conteúdo', category: 'pagina', icon: '🎥', href: '/professor/conteudo' },
    { id: 'pr-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/professor/perfil' },
  ],
  recepcao: [
    { id: 'rc-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/recepcao' },
    { id: 'rc-checkin', label: 'Check-in', category: 'pagina', icon: '✅', href: '/recepcao/checkin' },
    { id: 'rc-alunos', label: 'Alunos', category: 'pagina', icon: '👥', href: '/recepcao/alunos' },
    { id: 'rc-financeiro', label: 'Financeiro', category: 'pagina', icon: '💰', href: '/recepcao/financeiro' },
    { id: 'rc-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/recepcao/perfil' },
  ],
  aluno_adulto: [
    { id: 'al-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/dashboard' },
    { id: 'al-checkin', label: 'Check-in', category: 'pagina', icon: '✅', href: '/dashboard/checkin' },
    { id: 'al-treinos', label: 'Treinos', category: 'pagina', icon: '🏋️', href: '/dashboard/treinos' },
    { id: 'al-ranking', label: 'Ranking', category: 'pagina', icon: '🏆', href: '/dashboard/ranking' },
    { id: 'al-conquistas', label: 'Conquistas', category: 'pagina', icon: '🎖️', href: '/dashboard/conquistas' },
    { id: 'al-biblioteca', label: 'Biblioteca', category: 'pagina', icon: '📚', href: '/dashboard/biblioteca' },
    { id: 'al-financeiro', label: 'Financeiro', category: 'pagina', icon: '💰', href: '/dashboard/financeiro' },
    { id: 'al-contrato', label: 'Contrato', category: 'pagina', icon: '📄', href: '/dashboard/contrato' },
    { id: 'al-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/dashboard/perfil' },
  ],
  aluno_teen: [
    { id: 'te-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/teen' },
    { id: 'te-checkin', label: 'Check-in', category: 'pagina', icon: '✅', href: '/teen/checkin' },
    { id: 'te-missoes', label: 'Missões', category: 'pagina', icon: '🎯', href: '/teen/missoes' },
    { id: 'te-ranking', label: 'Ranking', category: 'pagina', icon: '🏆', href: '/teen/ranking' },
    { id: 'te-conquistas', label: 'Conquistas', category: 'pagina', icon: '🎖️', href: '/teen/conquistas' },
    { id: 'te-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/teen/perfil' },
  ],
  aluno_kids: [
    { id: 'ki-dashboard', label: 'Início', category: 'pagina', icon: '🏠', href: '/kids' },
    { id: 'ki-estrelas', label: 'Estrelas', category: 'pagina', icon: '⭐', href: '/kids/estrelas' },
    { id: 'ki-figurinhas', label: 'Figurinhas', category: 'pagina', icon: '🎨', href: '/kids/figurinhas' },
  ],
  responsavel: [
    { id: 'pa-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/parent' },
    { id: 'pa-filhos', label: 'Meus Filhos', category: 'pagina', icon: '👨‍👧‍👦', href: '/parent/filhos' },
    { id: 'pa-precheckin', label: 'Pré-Check-in', category: 'pagina', icon: '✅', href: '/parent/precheckin' },
    { id: 'pa-financeiro', label: 'Financeiro', category: 'pagina', icon: '💰', href: '/parent/financeiro' },
    { id: 'pa-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/parent/perfil' },
  ],
  franqueador: [
    { id: 'fr-dashboard', label: 'Dashboard', category: 'pagina', icon: '📊', href: '/franqueador' },
    { id: 'fr-rede', label: 'Rede', category: 'pagina', icon: '🌐', href: '/franqueador/rede' },
    { id: 'fr-financeiro', label: 'Financeiro', category: 'pagina', icon: '💰', href: '/franqueador/financeiro' },
    { id: 'fr-perfil', label: 'Meu Perfil', category: 'pagina', icon: '👤', href: '/franqueador/perfil' },
  ],
};

// Ações rápidas por role
const ACTIONS_BY_ROLE: Record<string, SearchItem[]> = {
  admin: [
    { id: 'act-novo-aluno', label: 'Novo Aluno', description: 'Cadastrar novo aluno', category: 'acao', icon: '➕', href: '/admin/alunos/novo' },
    { id: 'act-nova-turma', label: 'Nova Turma', description: 'Criar nova turma', category: 'acao', icon: '➕', href: '/admin/turmas/nova' },
    { id: 'act-gerar-cobranca', label: 'Gerar Cobrança', description: 'Cobrar aluno', category: 'acao', icon: '💳', href: '/admin/financeiro' },
    { id: 'act-convite', label: 'Gerar Convite', description: 'Link de cadastro', category: 'acao', icon: '✉️', href: '/admin/convites' },
    { id: 'act-checkin', label: 'Fazer Check-in', description: 'Check-in manual', category: 'acao', icon: '✅', href: '/admin/presenca' },
  ],
  professor: [
    { id: 'act-chamada', label: 'Fazer Chamada', description: 'Abrir chamada da turma', category: 'acao', icon: '✅', href: '/professor/chamada' },
    { id: 'act-avaliar', label: 'Avaliar Aluno', description: 'Registrar avaliação', category: 'acao', icon: '📝', href: '/professor/avaliacoes' },
    { id: 'act-conteudo', label: 'Publicar Conteúdo', description: 'Upload de vídeo/material', category: 'acao', icon: '🎥', href: '/professor/conteudo' },
  ],
  recepcao: [
    { id: 'act-checkin-rc', label: 'Fazer Check-in', description: 'Check-in de aluno', category: 'acao', icon: '✅', href: '/recepcao/checkin' },
    { id: 'act-cadastrar-rc', label: 'Cadastrar Aluno', description: 'Novo cadastro', category: 'acao', icon: '➕', href: '/recepcao/alunos' },
  ],
  superadmin: [
    { id: 'act-nova-academia', label: 'Nova Academia', description: 'Cadastrar academia', category: 'acao', icon: '🏛️', href: '/superadmin/academias' },
    { id: 'act-novo-plano', label: 'Novo Plano', description: 'Criar plano', category: 'acao', icon: '📋', href: '/superadmin/planos' },
  ],
};
```

### 1.3 Funcionalidades do componente

**Abrir/fechar:**
- Clicar na lupa → abre
- Cmd+K / Ctrl+K → abre
- Esc → fecha
- Clicar no backdrop → fecha

**Busca:**
- Filtrar PAGES_BY_ROLE[role] + ACTIONS_BY_ROLE[role] pelo texto digitado
- Se o texto tem 3+ caracteres e o role é admin/professor/recepcao/superadmin → buscar alunos no Supabase (debounce 300ms)
- Buscar por: `memberships JOIN profiles ON profile_id WHERE display_name ILIKE '%texto%' AND academy_id = activeAcademyId`
- Limitar a 5 resultados de alunos

**Navegação:**
- ↑↓ move a seleção (highlight visual)
- Enter navega para o item selecionado (router.push)
- Click no item navega

**Visual:**
- Fundo: `var(--bb-depth-1)` com borda `var(--bb-glass-border)`
- Input: fundo `var(--bb-depth-2)`
- Items: hover com `var(--bb-depth-3)`
- Item selecionado: fundo `var(--bb-brand)` com opacity 10%
- Categorias: headers cinza uppercase pequeno
- Atalho "⌘K" exibido na lupa como badge

### 1.4 Build e commit

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: GlobalSearch component — command palette com busca por páginas, ações e alunos"
```

---

## AGENTE 2 — INTEGRAR A LUPA EM TODOS OS HEADERS

**Missão:** Adicionar o botão da lupa (🔍) no header de TODOS os 9 perfis.

### 2.1 Verificar como o header funciona

```bash
# Encontrar o header compartilhado
grep -rn "ShellHeader\|HeaderBar\|TopBar\|header" components/shell/ --include='*.tsx' -l | head -10

# Verificar se já existe lupa em algum perfil
grep -rn "Search\|search\|🔍\|lupa\|buscar\|Buscar" components/shell/ --include='*.tsx' | head -20
```

### 2.2 Se existe ShellHeader compartilhado

Adicionar o botão de busca ao ShellHeader:

```tsx
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { Search } from 'lucide-react';

// No header, ao lado do sino de notificações:
const [searchOpen, setSearchOpen] = useState(false);

// Botão da lupa:
<button
  onClick={() => setSearchOpen(true)}
  className="relative p-2 rounded-lg transition-colors hover:opacity-80"
  style={{ color: 'var(--bb-ink-300)' }}
  aria-label="Buscar"
  title="Buscar (⌘K)"
>
  <Search className="w-5 h-5" />
  <kbd className="absolute -top-1 -right-1 text-[9px] px-1 rounded"
    style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-400)' }}>
    ⌘K
  </kbd>
</button>

{/* Modal de busca */}
<GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
```

### 2.3 Se cada shell tem header próprio

Adicionar em CADA shell individualmente. A ordem no header deve ser:

```
[Logo/Título]                    [🔍 Busca] [🔔 Notificações] [⚙️ Config] [Avatar]
```

### 2.4 Atalho global Cmd+K

O atalho deve funcionar em QUALQUER página. Adicionar no componente GlobalSearch:

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
    }
  }
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

Mas o listener precisa estar MONTADO mesmo quando o modal está fechado. Então o GlobalSearch deve ser montado SEMPRE (não condicionalmente), e controlar visibilidade internamente.

### 2.5 Verificar CADA perfil

```bash
for SHELL in AdminShell SuperAdminShell ProfessorShell RecepcaoShell MainShell TeenShell KidsShell ParentShell FranqueadorShell; do
  FILE=$(find components/shell -name "${SHELL}.tsx" | head -1)
  HAS_SEARCH=$(grep -c "GlobalSearch\|SearchButton\|search.*open\|Search" "$FILE" 2>/dev/null)
  echo "$SHELL: $([ $HAS_SEARCH -gt 0 ] && echo '✅ tem busca' || echo '❌ falta busca')"
done
```

Para CADA shell que falta busca → adicionar.

**Exceção Kids:** O perfil Kids pode ter uma versão simplificada (sem atalho Cmd+K, só o ícone de lupa) com resultados limitados.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: lupa de busca global no header de todos os 9 perfis — Cmd+K para abrir"
```

---

## AGENTE 3 — BUSCA DE ALUNOS NO SUPABASE

**Missão:** Implementar a busca real de alunos/membros no Supabase quando o usuário digita 3+ caracteres.

### 3.1 Implementar busca

No GlobalSearch, quando o input tem 3+ caracteres e o role é admin/professor/recepcao:

```typescript
// Debounce de 300ms
useEffect(() => {
  if (query.length < 3 || !canSearchMembers) {
    setMemberResults([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      const supabase = createBrowserClient();
      const academyId = getActiveAcademyId();

      if (!academyId) return;

      // Buscar memberships com profile data
      const { data } = await supabase
        .from('memberships')
        .select('id, role, profiles!inner(id, display_name, avatar_url)')
        .eq('academy_id', academyId)
        .eq('status', 'active')
        .ilike('profiles.display_name', `%${query}%`)
        .limit(5);

      if (data) {
        const results: SearchItem[] = data.map((m: any) => ({
          id: `member-${m.id}`,
          label: m.profiles?.display_name || 'Sem nome',
          description: translateRole(m.role),
          category: 'aluno' as const,
          icon: '🥋',
          href: m.role === 'admin' ? `/admin/alunos/${m.profiles?.id}` : undefined,
        }));
        setMemberResults(results);
      }
    } catch (err) {
      console.error('[GlobalSearch] Erro ao buscar membros:', err);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [query, canSearchMembers]);
```

### 3.2 Busca de turmas

Se o role é admin/professor:

```typescript
// Buscar turmas pelo nome
const { data: turmas } = await supabase
  .from('classes')
  .select('id, name')
  .eq('academy_id', academyId)
  .ilike('name', `%${query}%`)
  .limit(3);
```

### 3.3 Verificar que as rotas de destino existem

Para cada página listada em PAGES_BY_ROLE, verificar que a rota existe:

```bash
echo "=== VERIFICAR ROTAS ==="
# Extrair hrefs do GlobalSearch
grep -oP "href: '[^']+'" components/search/GlobalSearch.tsx | sed "s/href: '//;s/'$//" | while read route; do
  page=$(find app -path "*${route}*page.tsx" 2>/dev/null | head -1)
  [ -z "$page" ] && echo "❌ $route" || echo "✅ $route"
done
```

Remover do PAGES_BY_ROLE qualquer rota que NÃO existe (para não gerar 404 ao clicar).

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: busca de alunos e turmas via Supabase — debounce 300ms, resultados por academia"
```

---

## AGENTE 4 — DEPLOY E VERIFICAÇÃO

### 4.1 Verificação

```bash
echo "════════════════════════════════════════"
echo "VERIFICAÇÃO — BUSCA GLOBAL"
echo "════════════════════════════════════════"

# Componente existe
echo "GlobalSearch: $([ -f components/search/GlobalSearch.tsx ] && echo '✅' || echo '❌')"

# Todos os shells têm busca
for SHELL in AdminShell SuperAdminShell ProfessorShell RecepcaoShell MainShell TeenShell KidsShell ParentShell FranqueadorShell; do
  FILE=$(find components/shell -name "${SHELL}.tsx" | head -1)
  HAS=$(grep -c "GlobalSearch" "$FILE" 2>/dev/null)
  echo "  $SHELL: $([ $HAS -gt 0 ] && echo '✅' || echo '❌')"
done

# Build limpo
pnpm typecheck && pnpm build
```

### 4.2 Commit final e deploy

```bash
git add -A
git commit -m "feat: busca global (⌘K) — command palette em todos os 9 perfis, busca de páginas, ações, alunos e turmas"
git push origin main
npx vercel --prod --force --yes
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_GLOBAL_SEARCH.md nesta pasta. Execute os 4 agentes NA ORDEM:

AGENTE 1: Criar components/search/GlobalSearch.tsx — command palette com overlay, input autofocus, categorias (Páginas, Ações, Alunos, Turmas), navegação por teclado ↑↓ Enter Esc, visual com CSS vars --bb-*. Mapear páginas e ações por role para todos os 9 perfis. Commit.

AGENTE 2: Integrar o botão 🔍 (lupa) no header de TODOS os 9 shells — ao lado do sino de notificações. Atalho Cmd+K / Ctrl+K global. Badge "⌘K" na lupa. Verificar que cada shell tem. Commit.

AGENTE 3: Implementar busca real de alunos e turmas no Supabase com debounce 300ms. Verificar que as rotas de destino existem — remover do mapa as que não existem. Commit.

AGENTE 4: Build limpo, verificação de todos os shells, deploy com vercel --prod --force --yes.

O componente deve funcionar em TODOS os 9 perfis, mostrando APENAS as páginas que cada perfil tem acesso. Visual escuro com CSS vars --bb-*. PT-BR em toda a UI. Comece agora.
```

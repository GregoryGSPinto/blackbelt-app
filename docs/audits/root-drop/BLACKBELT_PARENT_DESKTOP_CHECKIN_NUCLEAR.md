# BLACKBELT v2 — FIX PARENT DESKTOP LAYOUT + CHECK-IN DOS FILHOS
## O Painel do Responsável Está com Layout Mobile no Desktop. Corrija TUDO.

> **PROBLEMA:** A página /parent e o ParentShell estão renderizando
> layout mobile (conteúdo estreito centralizado + bottom nav) mesmo em telas desktop.
> O padrão do BlackBelt para TODOS os perfis é:
> - **Desktop (lg+):** Sidebar fixa à esquerda + conteúdo ocupa todo o espaço restante
> - **Mobile:** Bottom nav + conteúdo full width
>
> **FEATURE NOVA:** Pais podem fazer check-in dos filhos diretamente pelo app.
> Quando o pai/mãe leva o filho à academia, ele pode registrar a presença.

---

## ANTES DE COMEÇAR — INVENTÁRIO OBRIGATÓRIO

```bash
# 1. Encontre o shell do parent
find . -path "*/shell/ParentShell*" -o -path "*/shell/parent*" | sort
find . -path "*/(parent)/*" -name "*.tsx" | sort
find . -path "*/(parent)/layout*" | sort

# 2. Encontre os outros shells para referência do padrão desktop
find . -path "*/shell/AdminShell*" -o -path "*/shell/ProfessorShell*" -o -path "*/shell/MainShell*" | sort

# 3. Veja como o AdminShell implementa sidebar desktop
cat $(find . -path "*/shell/AdminShell*" -name "*.tsx" | head -1)

# 4. Veja o ParentShell atual
cat $(find . -path "*/shell/ParentShell*" -name "*.tsx" | head -1)

# 5. Veja o layout do parent
cat $(find . -path "*/(parent)/layout*" -name "*.tsx" | head -1)

# 6. Veja a page principal do parent
cat $(find . -path "*/(parent)/parent/page.tsx" | head -1)

# 7. Encontre o serviço de check-in existente
find . -path "*/api/checkin*" -o -path "*/api/attendance*" -o -path "*/api/presenca*" | sort
cat $(find . -path "*/api/checkin*" -o -path "*/api/attendance*" | head -1)

# 8. Verifique como outros shells fazem sidebar + bottom nav
grep -rn "lg:hidden\|hidden lg:flex\|lg:block\|sidebar\|bottom-nav\|BottomNav" components/shell/ --include="*.tsx" | head -30
```

LEIA TUDO. Entenda o padrão. Agora execute.

---

## PASSO 1 — REESCREVER O ParentShell COM LAYOUT DESKTOP CORRETO

O ParentShell DEVE seguir o MESMO padrão dos outros shells do BlackBelt.
Use o AdminShell como referência primária.

### Arquivo: `components/shell/ParentShell.tsx` (REWRITE COMPLETO)

**ESTRUTURA OBRIGATÓRIA:**

```
DESKTOP (lg+):
┌──────────────────────────────────────────────────────────┐
│                      TOP BAR                              │
│  Left: "BlackBelt" + "Responsável"                       │
│  Right: ? icon, bell, settings, avatar (PO)              │
├────────────┬─────────────────────────────────────────────┤
│            │                                              │
│  SIDEBAR   │           MAIN CONTENT                       │
│  (260px)   │           (flex-1, padding)                  │
│            │                                              │
│  ─────     │   Conteúdo das páginas do parent             │
│  Filhos    │   ocupa TODO o espaço horizontal             │
│  Agenda    │   com max-w-7xl mx-auto para legibilidade    │
│  Presenças │                                              │
│  Check-in  │                                              │
│  ─────     │                                              │
│  Mensagens │                                              │
│  Pagamentos│                                              │
│  ─────     │                                              │
│  Perfil    │                                              │
│            │                                              │
│  ── foot ──│                                              │
│  Avatar    │                                              │
│  Patricia  │                                              │
│  Logout    │                                              │
└────────────┴─────────────────────────────────────────────┘

MOBILE (<lg):
┌──────────────────────────────┐
│         TOP BAR              │
│  "BlackBelt" | icons         │
├──────────────────────────────┤
│                              │
│       MAIN CONTENT           │
│       (full width)           │
│       (padding p-4)          │
│                              │
│                              │
├──────────────────────────────┤
│  BOTTOM NAV (fixed bottom)   │
│  Filhos | Agenda | Check-in  │
│        | Mensagens | Mais    │
└──────────────────────────────┘
```

### SIDEBAR DESKTOP — Itens de navegação:

```typescript
const parentNavItems = [
  // Grupo: FAMÍLIA
  { group: 'FAMÍLIA' },
  { label: 'Filhos',     href: '/parent',            icon: Users,        description: 'Visão geral dos filhos' },
  { label: 'Agenda',     href: '/parent/agenda',     icon: Calendar,     description: 'Aulas e eventos' },
  { label: 'Presenças',  href: '/parent/presencas',  icon: CheckSquare,  description: 'Histórico de presença' },
  { label: 'Check-in',   href: '/parent/checkin',    icon: QrCode,       description: 'Registrar presença',
    highlight: true  // ← destaque visual, cor accent/brand
  },

  // Grupo: COMUNICAÇÃO
  { group: 'COMUNICAÇÃO' },
  { label: 'Mensagens',    href: '/parent/mensagens',    icon: MessageSquare, badge: 'unreadCount' },
  { label: 'Autorizações', href: '/parent/autorizacoes', icon: ShieldCheck,   badge: 'pendingCount' },

  // Grupo: FINANCEIRO
  { group: 'FINANCEIRO' },
  { label: 'Pagamentos', href: '/parent/pagamentos', icon: DollarSign },

  // Grupo: CONTA
  { group: 'CONTA' },
  { label: 'Perfil',        href: '/parent/perfil',        icon: User },
  { label: 'Configurações', href: '/parent/configuracoes', icon: Settings },
];
```

### BOTTOM NAV MOBILE — 5 itens máximo:

```typescript
const bottomNavItems = [
  { label: 'Filhos',    href: '/parent',           icon: Users },
  { label: 'Agenda',    href: '/parent/agenda',    icon: Calendar },
  { label: 'Check-in',  href: '/parent/checkin',   icon: QrCode,
    isCenter: true  // ← botão central destacado, maior, cor accent/brand
  },
  { label: 'Mensagens', href: '/parent/mensagens', icon: MessageSquare, badge: true },
  { label: 'Mais',      href: '#',                 icon: Menu,
    isDrawer: true  // ← abre drawer com: Presenças, Autorizações, Pagamentos, Perfil, Config
  },
];
```

### REGRAS VISUAIS DO SHELL:

1. **Sidebar background:** `var(--bb-depth-2)` com `border-right: 1px solid var(--bb-glass-border)`
2. **Sidebar width:** 260px desktop, colapsável para 80px com toggle
3. **Item ativo:** `bg var(--bb-brand-surface)`, cor `var(--bb-brand)`, font-weight 600, barra vertical 3px `var(--bb-brand)` na esquerda
4. **Item hover:** `bg var(--bb-depth-4)`, `translateX(2px)` sutil
5. **Grupo labels:** 11px, uppercase, tracking-wide, `var(--bb-ink-40)`
6. **Check-in item:** Background `var(--bb-brand-surface)` permanente, ícone com leve pulse se tem aula ativa
7. **Bottom nav mobile:** `backdrop-filter: blur(20px)`, safe-area padding, item ativo = `var(--bb-brand)`
8. **Bottom nav check-in (centro):** Botão circular maior (56px), `bg var(--bb-brand)`, ícone branco, `translateY(-8px)` para destacar acima dos outros
9. **Drawer "Mais":** overlay que sobe de baixo com os itens que não couberam no bottom nav
10. **Top bar:** mesma estrutura dos outros shells — logo left, actions right
11. **ZERO cores hardcoded** — tudo via ThemeContext/CSS variables
12. **Transições:** sidebar collapse `width 0.3s cubic-bezier(0.4, 0, 0.2, 1)`, nav items `color 0.2s`

### RESPONSIVIDADE OBRIGATÓRIA:

```
< 768px (mobile):   bottom nav + content full width + no sidebar
768-1023px (tablet): bottom nav + content full width + no sidebar (ou sidebar overlay)
≥ 1024px (desktop):  sidebar fixa + no bottom nav + content flex-1
```

Use estas classes Tailwind:
```
sidebar:   hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 lg:left-0
bottomNav: flex lg:hidden fixed bottom-0 inset-x-0
content:   lg:ml-[260px] pb-20 lg:pb-0
```

---

## PASSO 2 — CORRIGIR O LAYOUT DA PÁGINA PRINCIPAL /parent

### Arquivo: `app/(parent)/parent/page.tsx` (REWRITE)

O dashboard do responsável DEVE ocupar todo o espaço horizontal no desktop.
NÃO pode ficar estreito no centro da tela como está agora.

**LAYOUT DESKTOP (lg+):**

```
┌─────────────────────────────────────────────────────────────┐
│  Olá, Patricia!                                              │
│  Acompanhe a evolução dos seus filhos                       │
│                                                              │
│  ┌──────────── AÇÕES PENDENTES (se houver) ──────────────┐  │
│  │ 🏆 Prof. quer indicar Sophia para campeonato [Ação]   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Tab: Todos] [Tab: Sophia (16)] [Tab: Helena (8)]          │
│                                                              │
│  ┌─ CARD SOPHIA ──────────────┐ ┌─ CARD HELENA ───────────┐ │
│  │  👤 Sophia · TEEN          │ │  👤 Helena · KIDS         │ │
│  │  Faixa Verde               │ │  Faixa Cinza              │ │
│  │                            │ │                           │ │
│  │  TURMA        PRESENÇA     │ │  TURMA        PRESENÇA    │ │
│  │  BJJ Teen Av  Hoje 16:30  │ │  BJJ Kids     Ontem 14h  │ │
│  │                            │ │                           │ │
│  │  FREQ MENSAL  VÍDEOS      │ │  FREQ MENSAL  ESTRELAS   │ │
│  │  ████░░ 75%   12 este mês │ │  ██████ 90%   ⭐⭐⭐⭐⭐  │ │
│  │                            │ │                           │ │
│  │  📅 Próx: Ter 16h BJJ    │ │  📅 Próx: Qua 14h BJJ   │ │
│  │                            │ │                           │ │
│  │  [Check-in ✓] [Jornada]  │ │  [Check-in ✓] [Jornada]  │ │
│  └────────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│  ┌────────────── CONSOLIDADO FINANCEIRO ─────────────────┐  │
│  │  Total família: R$ 248/mês  ·  ✅ Todos em dia        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ATIVIDADE RECENTE                                           │
│  • Sophia fez check-in hoje às 16:30 — BJJ Teen Avançado   │
│  • Helena ganhou 3 estrelas no treino de ontem              │
│  • Fatura março paga — R$ 248                               │
└─────────────────────────────────────────────────────────────┘
```

**REGRAS DE LAYOUT:**

1. **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`
2. **Cards de filhos:** `grid grid-cols-1 md:grid-cols-2 gap-6` — lado a lado no desktop, empilhados no mobile
3. **Dentro de cada card:** grid interno com 2 colunas para as métricas (turma/presença, freq/vídeos)
4. **Botão "Check-in" no card:** botão primário que abre flow de check-in rápido para aquele filho específico
5. **Ações pendentes:** full width, cards com borda esquerda colorida (urgência)
6. **Consolidado financeiro:** full width, background `var(--bb-depth-2)`
7. **Atividade recente:** timeline com dots e linhas conectoras

**CADA card de filho DEVE ter um botão "Fazer Check-in" que:**
- Se tem aula ativa agora → botão primário brilhante "Check-in Agora ✓"
- Se não tem aula agora → botão outline "Próx. check-in: Ter 16h"
- Ao clicar → modal de confirmação (ver Passo 3)

---

## PASSO 3 — SISTEMA DE CHECK-IN PARA PAIS

### 3A. Service

Crie ou atualize `lib/api/responsavel-checkin.service.ts`:

```typescript
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/utils/service-helpers';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/monitoring/logger';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface DependenteCheckinInfo {
  dependenteId: string;
  dependenteNome: string;
  dependenteAvatar?: string;
  tipoPerfil: 'teen' | 'kids';
  faixa: string;
  faixaCor: string;
  aulaAtiva: AulaAtiva | null;       // null se não tem aula agora
  proximaAula: ProximaAula | null;
  ultimoCheckin: string | null;       // ISO date
  checkinHoje: boolean;              // já fez check-in hoje?
  streakDias: number;
}

export interface AulaAtiva {
  id: string;
  turmaId: string;
  turmaNome: string;
  modalidade: string;
  professorNome: string;
  horarioInicio: string;            // "16:00"
  horarioFim: string;               // "17:30"
  local?: string;
}

export interface ProximaAula {
  id: string;
  turmaNome: string;
  dia: string;                      // "Terça"
  horario: string;                  // "16:00"
  modalidade: string;
}

export interface CheckinResult {
  success: boolean;
  dependenteNome: string;
  turmaNome: string;
  horario: string;
  streakDias: number;
  mensagem: string;                 // "Check-in de Sophia registrado com sucesso!"
  conquistaDesbloqueada?: string;   // "Streak de 10 dias!"
}

export interface CheckinHistorico {
  id: string;
  dependenteId: string;
  dependenteNome: string;
  data: string;
  horario: string;
  turmaNome: string;
  modalidade: string;
  registradoPor: 'pai' | 'professor' | 'qr_code' | 'proprio';
}

// ═══════════════════════════════════════
// SERVICE FUNCTIONS
// ═══════════════════════════════════════

/** Lista dependentes com info de check-in (aula ativa, status) */
export async function getDependentesCheckin(responsavelId: string): Promise<DependenteCheckinInfo[]> {
  if (isMock()) {
    await new Promise(r => setTimeout(r, 500));
    return mockDependentesCheckin;
  }

  try {
    const supabase = createClient();
    // TODO: Query real
    // 1. Buscar dependentes do responsável
    // 2. Para cada dependente, buscar turma ativa (horário atual)
    // 3. Verificar se já fez check-in hoje
    // 4. Buscar próxima aula
    return mockDependentesCheckin;
  } catch (error) {
    handleServiceError(error, 'getDependentesCheckin');
    return [];
  }
}

/** Registra check-in do filho feito pelo pai */
export async function registrarCheckinFilho(
  responsavelId: string,
  dependenteId: string,
  aulaId: string
): Promise<CheckinResult> {
  if (isMock()) {
    await new Promise(r => setTimeout(r, 800));
    const dep = mockDependentesCheckin.find(d => d.dependenteId === dependenteId);
    return {
      success: true,
      dependenteNome: dep?.dependenteNome || 'Filho',
      turmaNome: dep?.aulaAtiva?.turmaNome || 'Turma',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      streakDias: (dep?.streakDias || 0) + 1,
      mensagem: `Check-in de ${dep?.dependenteNome} registrado com sucesso!`,
      conquistaDesbloqueada: (dep?.streakDias || 0) >= 9 ? 'Streak de 10 dias!' : undefined,
    };
  }

  try {
    const supabase = createClient();
    // TODO: Insert real no Supabase
    // 1. Verificar que responsavelId é realmente responsável do dependenteId
    // 2. Verificar que aulaId está ativa agora
    // 3. Verificar que não tem check-in duplicado hoje
    // 4. Inserir na tabela attendance com registrado_por = 'responsavel'
    // 5. Atualizar streak
    // 6. Retornar resultado
    const dep = mockDependentesCheckin.find(d => d.dependenteId === dependenteId);
    return {
      success: true,
      dependenteNome: dep?.dependenteNome || 'Filho',
      turmaNome: dep?.aulaAtiva?.turmaNome || 'Turma',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      streakDias: (dep?.streakDias || 0) + 1,
      mensagem: `Check-in de ${dep?.dependenteNome} registrado com sucesso!`,
    };
  } catch (error) {
    handleServiceError(error, 'registrarCheckinFilho');
    return {
      success: false,
      dependenteNome: '',
      turmaNome: '',
      horario: '',
      streakDias: 0,
      mensagem: 'Erro ao registrar check-in. Tente novamente.',
    };
  }
}

/** Histórico de check-ins dos filhos */
export async function getHistoricoCheckins(
  responsavelId: string,
  filtro?: { dependenteId?: string; mes?: number; ano?: number }
): Promise<CheckinHistorico[]> {
  if (isMock()) {
    await new Promise(r => setTimeout(r, 400));
    let resultado = mockHistoricoCheckins;
    if (filtro?.dependenteId) {
      resultado = resultado.filter(c => c.dependenteId === filtro.dependenteId);
    }
    return resultado;
  }

  try {
    const supabase = createClient();
    // TODO: Query real
    return mockHistoricoCheckins;
  } catch (error) {
    handleServiceError(error, 'getHistoricoCheckins');
    return [];
  }
}

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const mockDependentesCheckin: DependenteCheckinInfo[] = [
  {
    dependenteId: 'dep-sophia-001',
    dependenteNome: 'Sophia',
    tipoPerfil: 'teen',
    faixa: 'Verde',
    faixaCor: '#22c55e',
    aulaAtiva: {
      id: 'aula-001',
      turmaId: 'turma-teen-avancado',
      turmaNome: 'BJJ Teen Avançado',
      modalidade: 'Jiu-Jitsu',
      professorNome: 'Prof. Fernanda',
      horarioInicio: '16:00',
      horarioFim: '17:30',
      local: 'Tatame 1',
    },
    proximaAula: {
      id: 'aula-002',
      turmaNome: 'BJJ Teen Avançado',
      dia: 'Terça',
      horario: '16:00',
      modalidade: 'Jiu-Jitsu',
    },
    ultimoCheckin: new Date().toISOString(),
    checkinHoje: true,
    streakDias: 8,
  },
  {
    dependenteId: 'dep-helena-002',
    dependenteNome: 'Helena',
    tipoPerfil: 'kids',
    faixa: 'Cinza',
    faixaCor: '#9ca3af',
    aulaAtiva: null,  // Não tem aula agora
    proximaAula: {
      id: 'aula-003',
      turmaNome: 'BJJ Kids Iniciante',
      dia: 'Quarta',
      horario: '14:00',
      modalidade: 'Jiu-Jitsu',
    },
    ultimoCheckin: new Date(Date.now() - 86400000).toISOString(),
    checkinHoje: false,
    streakDias: 5,
  },
];

const mockHistoricoCheckins: CheckinHistorico[] = [
  {
    id: 'ch-001',
    dependenteId: 'dep-sophia-001',
    dependenteNome: 'Sophia',
    data: new Date().toISOString(),
    horario: '16:05',
    turmaNome: 'BJJ Teen Avançado',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'pai',
  },
  {
    id: 'ch-002',
    dependenteId: 'dep-sophia-001',
    dependenteNome: 'Sophia',
    data: new Date(Date.now() - 86400000).toISOString(),
    horario: '16:10',
    turmaNome: 'BJJ Teen Avançado',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'qr_code',
  },
  {
    id: 'ch-003',
    dependenteId: 'dep-helena-002',
    dependenteNome: 'Helena',
    data: new Date(Date.now() - 86400000).toISOString(),
    horario: '14:08',
    turmaNome: 'BJJ Kids Iniciante',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'professor',
  },
  {
    id: 'ch-004',
    dependenteId: 'dep-sophia-001',
    dependenteNome: 'Sophia',
    data: new Date(Date.now() - 172800000).toISOString(),
    horario: '16:02',
    turmaNome: 'BJJ Teen Avançado',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'proprio',
  },
  {
    id: 'ch-005',
    dependenteId: 'dep-helena-002',
    dependenteNome: 'Helena',
    data: new Date(Date.now() - 172800000).toISOString(),
    horario: '14:15',
    turmaNome: 'BJJ Kids Iniciante',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'pai',
  },
  {
    id: 'ch-006',
    dependenteId: 'dep-sophia-001',
    dependenteNome: 'Sophia',
    data: new Date(Date.now() - 259200000).toISOString(),
    horario: '16:00',
    turmaNome: 'BJJ Teen Avançado',
    modalidade: 'Jiu-Jitsu',
    registradoPor: 'pai',
  },
];
```

---

### 3B. Página de Check-in: `app/(parent)/parent/checkin/page.tsx` (CRIAR)

**LAYOUT:**

```
DESKTOP:
┌───────────────────────────────────────────────────────────┐
│  📱 Check-in dos Filhos                                    │
│  Registre a presença quando trouxer seus filhos à academia │
│                                                            │
│  ┌──── SOPHIA ────────────┐  ┌──── HELENA ────────────┐   │
│  │  👤 Sophia              │  │  👤 Helena              │   │
│  │  TEEN · Faixa Verde     │  │  KIDS · Faixa Cinza     │   │
│  │  🔥 Streak: 8 dias      │  │  🔥 Streak: 5 dias      │   │
│  │                         │  │                         │   │
│  │  ✅ AULA ATIVA AGORA    │  │  ⏳ SEM AULA AGORA      │   │
│  │  BJJ Teen Avançado      │  │                         │   │
│  │  16:00 - 17:30          │  │  Próxima:               │   │
│  │  Prof. Fernanda         │  │  Qua 14:00 — BJJ Kids  │   │
│  │  Tatame 1               │  │                         │   │
│  │                         │  │                         │   │
│  │  [✓ REGISTRADO 16:05]  │  │  [Check-in indisponível]│   │
│  │  (já fez check-in)     │  │  (sem aula ativa)       │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                            │
│  ──── HISTÓRICO RECENTE ────────────────────────────────   │
│                                                            │
│  📅 Hoje                                                    │
│  • Sophia — BJJ Teen Avançado 16:05 — registrado por pai  │
│                                                            │
│  📅 Ontem                                                   │
│  • Sophia — BJJ Teen Avançado 16:10 — QR Code             │
│  • Helena — BJJ Kids Iniciante 14:08 — professor          │
│                                                            │
│  📅 2 dias atrás                                            │
│  • Sophia — BJJ Teen Avançado 16:02 — próprio             │
│  • Helena — BJJ Kids Iniciante 14:15 — registrado por pai │
│                                                            │
│  [Ver histórico completo →]                                │
└───────────────────────────────────────────────────────────┘
```

**COMPORTAMENTO:**

1. Cards de filhos: `grid grid-cols-1 md:grid-cols-2 gap-6`
2. Se filho tem aula ativa E não fez check-in hoje:
   - Botão GRANDE verde pulsante: "✓ Fazer Check-in"
   - Touch target mínimo 56px height
   - Ao clicar → modal de confirmação
3. Se filho já fez check-in hoje:
   - Botão desabilitado: "✓ Registrado às 16:05"
   - Cor `var(--bb-green-subtle)` de fundo
4. Se filho NÃO tem aula ativa:
   - Botão desabilitado cinza: "Sem aula ativa"
   - Mostra próxima aula abaixo
5. **Modal de confirmação:**
   ```
   ┌──────────────────────────────┐
   │   Confirmar Check-in         │
   │                              │
   │   👤 Sophia                  │
   │   📚 BJJ Teen Avançado      │
   │   🕐 16:00 - 17:30          │
   │   👨‍🏫 Prof. Fernanda         │
   │                              │
   │  [Cancelar]  [✓ Confirmar]  │
   └──────────────────────────────┘
   ```
6. **Tela de sucesso (após confirmar):**
   - Overlay fullscreen temporário (2.5 segundos)
   - ✓ grande animado (escala 0→1)
   - "Check-in de Sophia registrado!"
   - "🔥 Streak: 9 dias!"
   - Se conquistaDesbloqueada: confetti + badge
   - Auto-dismiss ou tap para fechar
7. **Histórico:** agrupado por dia, com badge indicando quem registrou (pai, professor, QR, próprio)
   - Badge "pai" = azul
   - Badge "professor" = roxo
   - Badge "QR Code" = verde
   - Badge "próprio" = cinza

---

## PASSO 4 — CORRIGIR TODAS AS PÁGINAS DO PARENT PARA DESKTOP

PARA CADA página existente em `app/(parent)/parent/`:

1. **Remova qualquer `max-w-md`, `max-w-sm`, `max-w-lg` ou `w-full` com largura fixa estreita** que esteja limitando o conteúdo
2. **Use este container padrão em TODAS as páginas:**
   ```tsx
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
     {/* conteúdo */}
   </div>
   ```
3. **Grids de cards:** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
4. **Seções lado a lado:** `grid grid-cols-1 lg:grid-cols-2 gap-6`
5. **Tabelas:** `overflow-x-auto` no mobile, tabela normal no desktop
6. **Forms/modals:** `max-w-2xl` (não `max-w-sm`)
7. **Skeleton loading** deve respeitar o mesmo grid

**Páginas que DEVEM existir e estar corretas:**

| Rota | Descrição | Layout Desktop |
|------|-----------|----------------|
| `/parent` | Dashboard filhos | Cards grid 2 cols + financeiro + timeline |
| `/parent/agenda` | Agenda familiar | Calendário semana full width |
| `/parent/presencas` | Histórico presença | Tabela full width + filtros |
| `/parent/checkin` | **NOVO** Check-in filhos | Cards grid 2 cols + histórico |
| `/parent/mensagens` | Mensagens professores | Lista lateral + chat (tipo WhatsApp Web) |
| `/parent/autorizacoes` | Autorizações | Cards + tabs (pendentes/histórico/controle) |
| `/parent/pagamentos` | Faturas e pagamentos | Tabela + cards de resumo |
| `/parent/perfil` | Perfil do responsável | Form 2 cols no desktop |
| `/parent/configuracoes` | Config e preferências | Form com seções |

**PARA /parent/mensagens NO DESKTOP:**
Usar layout split-view (como WhatsApp Web):
```
┌────────────────┬─────────────────────────────────────┐
│  CONVERSAS     │         CHAT ATIVO                   │
│  (320px)       │                                      │
│                │  Prof. Fernanda · sobre Sophia       │
│  🔵 Fernanda   │                                      │
│    sobre Sophia│  [mensagens aqui]                    │
│                │                                      │
│  André         │                                      │
│    sobre Helena│  ________________________________    │
│                │  [Escreva sua mensagem...] [Enviar]  │
└────────────────┴─────────────────────────────────────┘
```

---

## PASSO 5 — INTEGRAR CHECK-IN RÁPIDO NO DASHBOARD

No dashboard principal (`/parent/page.tsx`), CADA card de filho deve ter um botão de check-in rápido:

```tsx
{/* Dentro do card de cada dependente */}
{dependente.aulaAtiva && !dependente.checkinHoje ? (
  <button
    onClick={() => handleQuickCheckin(dependente)}
    className="w-full flex items-center justify-center gap-2 px-4 py-3
               rounded-xl font-semibold text-white
               transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    style={{ backgroundColor: 'var(--bb-brand)' }}
  >
    <QrCode className="w-5 h-5" />
    Check-in Agora
  </button>
) : dependente.checkinHoje ? (
  <div className="w-full flex items-center justify-center gap-2 px-4 py-3
                  rounded-xl font-medium opacity-70"
       style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
    <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
    Presente hoje às {formatTime(dependente.ultimoCheckin)}
  </div>
) : (
  <div className="w-full flex items-center justify-center gap-2 px-4 py-3
                  rounded-xl text-sm"
       style={{ backgroundColor: 'var(--bb-depth-3)', color: 'var(--bb-ink-40)' }}>
    <Clock className="w-4 h-4" />
    Próx: {dependente.proximaAula?.dia} {dependente.proximaAula?.horario}
  </div>
)}
```

O `handleQuickCheckin` abre o mesmo modal de confirmação do Passo 3B, mas sem sair da página. Após sucesso, atualiza o card inline (muda para "Presente hoje").

---

## PASSO 6 — LAYOUT DO (parent) LAYOUT.TSX

O layout deve usar o ParentShell reescrito:

### Arquivo: `app/(parent)/layout.tsx`

```tsx
import { ParentShell } from '@/components/shell/ParentShell';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentShell>{children}</ParentShell>;
}
```

NÃO deve ter nenhum wrapper extra que limite a largura. O ParentShell já gerencia sidebar + content area.

O `{children}` dentro do ParentShell deve estar dentro de:
```tsx
<main className="flex-1 lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
  {/* Top bar */}
  <div className="sticky top-0 z-30 ...">...</div>

  {/* Content */}
  <div className="flex-1">
    {children}
  </div>
</main>
```

---

## PASSO 7 — BUILD, TESTE E DEPLOY

```bash
# 1. Typecheck
pnpm typecheck

# Se erros → corrija TODOS antes de prosseguir

# 2. Build
pnpm build

# Se erros → corrija TODOS antes de prosseguir

# 3. Verificação visual — abra CADA página e confirme:

# Login como responsável: patricia@email.com / BlackBelt@2026
# Ou use as credenciais de teste disponíveis

# DESKTOP (redimensione browser para ≥1024px):
# ✓ /parent — sidebar visível, cards lado a lado, sem bottom nav
# ✓ /parent/agenda — calendário full width
# ✓ /parent/presencas — tabela full width
# ✓ /parent/checkin — cards de check-in lado a lado
# ✓ /parent/mensagens — split view (lista + chat)
# ✓ /parent/autorizacoes — cards full width com tabs
# ✓ /parent/pagamentos — tabela + cards
# ✓ /parent/perfil — form 2 colunas

# MOBILE (redimensione para <768px):
# ✓ /parent — bottom nav visível, sidebar escondida, conteúdo full width
# ✓ Bottom nav check-in centralizado e destacado
# ✓ Drawer "Mais" abre com itens restantes
# ✓ Touch targets ≥ 44px em todos os botões

# 4. Commit
git add -A
git commit -m "feat: parent desktop layout — sidebar nav, full-width content, parent check-in system"
git push origin main
```

---

## REGRAS ABSOLUTAS — NÃO VIOLAR NENHUMA

1. **ZERO cores hardcoded** — tudo via `var(--bb-*)` do ThemeContext
2. **Sidebar desktop** segue EXATAMENTE o padrão do AdminShell/ProfessorShell
3. **Bottom nav mobile** segue o padrão existente dos outros shells
4. **isMock()** em todos os services — mock com delay / else → Supabase placeholder
5. **handleServiceError** em todos os catch blocks
6. **logger** de `@/lib/monitoring/logger` — NÃO `console.log`
7. **Skeleton loading** em TODAS as páginas que carregam dados
8. **Toast** para TODAS as ações (check-in, enviar mensagem, etc.)
9. **Touch targets** mínimo 44px em mobile
10. **NÃO altere** páginas de outros perfis (/admin/*, /professor/*, /dashboard/*, /teen/*, /kids/*, /superadmin/*)
11. **Lucide React** para ícones
12. **Recharts** para gráficos
13. **Mobile-first** mas DESKTOP BONITO — o problema é justamente o desktop estar feio
14. **O check-in do pai** é distinto do check-in do aluno — registra `registrado_por: 'responsavel'` na tabela
15. **O pai SÓ vê dados dos SEUS filhos** — filtro de segurança em todos os services
16. **pnpm typecheck && pnpm build — ZERO erros — antes do commit**

---

## COMANDO PARA COLAR NO CLAUDE CODE:

```
Leia o arquivo BLACKBELT_PARENT_DESKTOP_CHECKIN_NUCLEAR.md na raiz do projeto. Execute TODOS os 7 passos na ordem. O ParentShell está renderizando layout mobile no desktop (conteúdo estreito centralizado + bottom nav). Reescreva o ParentShell com sidebar desktop fixa (padrão AdminShell) + bottom nav mobile. Corrija TODAS as páginas /parent/* para usar full-width no desktop com grids responsivos. Crie o sistema de check-in para pais (service + página /parent/checkin + check-in rápido no dashboard). Respeite ThemeContext, isMock(), skeleton loading. pnpm typecheck && pnpm build ZERO erros. Commit e push. Comece agora.
```

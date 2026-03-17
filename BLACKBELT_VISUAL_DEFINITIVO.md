# BLACKBELT v2 — O VISUAL DEFINITIVO

> Meu absoluto melhor. Não existe próximo nível depois deste.
> Quando o dono da academia abre, ele para de respirar por 3 segundos.
> Quando o aluno vê sua promoção de faixa, ele grava a tela e posta no Instagram.
> Quando o concorrente vê, ele sabe que perdeu.

---

## A IDENTIDADE QUE NINGUÉM MAIS TEM

O BlackBelt não é "software de academia com tema escuro".
O BlackBelt é a FAIXA. A faixa de artes marciais.

A faixa é o símbolo universal de progresso, disciplina e respeito.
Cada cor conta uma história. Cada graduação é uma conquista de vida.
O app inteiro respira isso.

ELEMENTO VISUAL CENTRAL: A FAIXA
- Cada perfil de aluno é envolvido pela cor da sua faixa
- A barra de progresso para próxima faixa é LITERALMENTE uma faixa desenhada
- A transição de cores da faixa (branca→azul→roxa→marrom→preta) é o gradiente do sistema
- Headers de página têm uma faixa sutil horizontal como accent line
- A sidebar tem uma faixa vertical fina na posição do item ativo

ELEMENTO VISUAL SECUNDÁRIO: O TATAME
- Texturas sutis que remetem a tatame aparecem em backgrounds
- Grid pattern sutil (como as linhas do tatame) em áreas de conteúdo
- O feeling é: você está DENTRO da academia quando usa o app

---

## FASE V1 — A FUNDAÇÃO QUE DEFINE TUDO

```
Antes de tocar qualquer componente, instale a fundação visual inteira.

1. TIPOGRAFIA QUE IMPRESSIONA:

Importar do Google Fonts em app/layout.tsx:
- Display: "Instrument Sans" (ou "Bricolage Grotesque") weight 700, 800
  Alternativa: "General Sans" se disponível via CDN
  Esta fonte NÃO é genérica. Tem personalidade. Cantos suaves, proporcional, moderna.
- Body: mesma família weight 400, 500, 600
- Mono: "JetBrains Mono" weight 400, 500, 600
  Para números grandes, timers, valores monetários.

Em tailwind.config.ts:
fontFamily: {
  sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
  display: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
}

HIERARQUIA — cada nível tem propósito:
- HERO NUMBER: font-mono, 52px, weight 700, tracking-[-0.04em], line-height 1
  Uso: KPI principal do dashboard, score do aluno, receita do mês
- PAGE TITLE: font-display, 28px, weight 700, tracking-[-0.02em]
- SECTION: font-display, 18px, weight 600, tracking-[-0.01em]
- CARD TITLE: font-sans, 15px, weight 600
- BODY: font-sans, 14px, weight 400, leading-relaxed
- CAPTION: font-sans, 12px, weight 500, uppercase, tracking-[0.08em]
  Uso: labels de KPI, headers de tabela, categorias
- OVERLINE: font-mono, 11px, weight 500, uppercase, tracking-[0.12em]
  Uso: status badges, timestamps, metadata

2. PALETA — NÃO SÃO CORES. É ATMOSFERA.

Os cinzas NÃO são neutros. Tem subtone frio (azulado) que dá profundidade.
O vermelho NÃO é flat. Tem profundidade com gradiente.

Em globals.css:

:root {
  /* === ATMOSFERA ESCURA (default) === */
  
  /* Profundidade — 5 níveis de elevação */
  --bb-depth-1: #06070A;        /* o mais profundo — fundo do app */
  --bb-depth-2: #0C0E14;        /* sidebar, areas fixas */
  --bb-depth-3: #12141C;        /* cards, surfaces */
  --bb-depth-4: #1A1D28;        /* cards hover, dropdowns */
  --bb-depth-5: #242836;        /* inputs, areas interativas */
  
  /* Texto — warmth controlado */
  --bb-ink-100: #F4F4F7;        /* títulos, texto primário */
  --bb-ink-80: #B8BCC8;         /* texto secundário, descrições */
  --bb-ink-60: #7C8194;         /* labels, captions */
  --bb-ink-40: #4A4F63;         /* placeholders, disabled */
  --bb-ink-20: #2A2E3E;         /* bordas fortes, dividers */
  
  /* A Marca — Vermelho BlackBelt */
  --bb-brand: #EF4444;
  --bb-brand-deep: #B91C1C;
  --bb-brand-light: #FCA5A5;
  --bb-brand-glow: 0 0 40px rgba(239, 68, 68, 0.15);
  --bb-brand-glow-strong: 0 0 60px rgba(239, 68, 68, 0.25);
  --bb-brand-surface: rgba(239, 68, 68, 0.06);
  --bb-brand-surface-hover: rgba(239, 68, 68, 0.12);
  --bb-brand-gradient: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  
  /* Contextuais */
  --bb-success: #22C55E;
  --bb-success-surface: rgba(34, 197, 94, 0.08);
  --bb-warning: #EAB308;
  --bb-warning-surface: rgba(234, 179, 8, 0.08);
  --bb-info: #3B82F6;
  --bb-info-surface: rgba(59, 130, 246, 0.08);
  
  /* Faixas — as cores que definem o universo */
  --bb-belt-white: #E8E8E8;
  --bb-belt-gray: #9CA3AF;
  --bb-belt-yellow: #EAB308;
  --bb-belt-orange: #F97316;
  --bb-belt-green: #22C55E;
  --bb-belt-blue: #3B82F6;
  --bb-belt-purple: #8B5CF6;
  --bb-belt-brown: #92400E;
  --bb-belt-black: #1C1917;
  
  /* Superfícies */
  --bb-glass: rgba(255, 255, 255, 0.03);
  --bb-glass-border: rgba(255, 255, 255, 0.06);
  --bb-glass-border-hover: rgba(255, 255, 255, 0.12);
  
  /* Sombras atmosféricas */
  --bb-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --bb-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --bb-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4);
  --bb-shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.5);
  --bb-shadow-xl: 0 16px 60px rgba(0, 0, 0, 0.6);
  
  /* Radius — consistente, arredondado sem infantilizar */
  --bb-radius-sm: 8px;
  --bb-radius-md: 12px;
  --bb-radius-lg: 16px;
  --bb-radius-xl: 20px;
  --bb-radius-2xl: 24px;
  --bb-radius-full: 9999px;
}

/* === ATMOSFERA CLARA === */
.light {
  --bb-depth-1: #F5F6FA;
  --bb-depth-2: #FFFFFF;
  --bb-depth-3: #FFFFFF;
  --bb-depth-4: #F0F1F5;
  --bb-depth-5: #E8E9EF;
  --bb-ink-100: #0F1117;
  --bb-ink-80: #3D4155;
  --bb-ink-60: #6B7085;
  --bb-ink-40: #9CA0B0;
  --bb-ink-20: #D5D7E0;
  --bb-glass: rgba(0, 0, 0, 0.02);
  --bb-glass-border: rgba(0, 0, 0, 0.06);
  --bb-glass-border-hover: rgba(0, 0, 0, 0.12);
  --bb-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --bb-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --bb-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
  --bb-shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.1);
}

3. O FUNDO DO APP — ATMOSFERA, NÃO COR SÓLIDA:

body (dark):
  background-color: var(--bb-depth-1);
  /* Mesh gradient sutil que dá vida ao fundo */
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(239, 68, 68, 0.015) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 80% 30%, rgba(59, 130, 246, 0.01) 0%, transparent 70%);
  /* Noise texture imperceptível — adiciona granulação fotográfica */
  /* Gerar SVG noise inline ou usar pseudo-element com opacity 0.015 */

4. A FAIXA COMO ELEMENTO UI:

Crie components/ui/BeltStripe.tsx:
- Uma faixa horizontal fina (3px height) com a cor da faixa do aluno
- Aparece em: topo do card do aluno, accent line em headers, progress bar
- Tem gradiente sutil (cor da faixa + versão mais clara nas pontas)
- Usada EXTENSIVAMENTE em todo o app como elemento unificador

Crie components/ui/BeltProgress.tsx:
- Barra de progresso que PARECE uma faixa de artes marciais
- Background: faixa atual (ex: azul)
- Foreground preenchendo: gradiente da faixa atual → próxima (ex: azul→roxo)
- Border radius diferenciado (simula tecido da faixa)
- Ao hover: tooltip mostra "68% para faixa roxa · ~2 meses"
- ANIMAÇÃO: preenche suavemente da esquerda ao carregar (ease-out 1s)

Crie components/ui/BeltBadge.tsx:
- Badge que mostra a faixa do aluno
- NÃO é texto "Azul" num retângulo
- É um mini visual de faixa: retângulo fino com cor, pontas arredondadas
  simulando textura de tecido
- Hover: nome da faixa em tooltip
- Variantes: sm (inline com nome), md (em cards), lg (em perfil)

5. CARD — O ELEMENTO MAIS USADO:

Crie components/ui/Card.tsx com variantes:

DEFAULT:
  background: var(--bb-depth-3);
  border: 1px solid var(--bb-glass-border);
  border-radius: var(--bb-radius-lg);
  padding: 24px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover (se interativo):
    border-color: var(--bb-glass-border-hover);
    box-shadow: var(--bb-shadow-sm);
    transform: translateY(-2px);

ACCENT (com faixa no topo):
  Mesmo que default + BeltStripe no topo (3px, cor da faixa)

GLOW (para atenção):
  border-color: var(--bb-brand);
  box-shadow: var(--bb-brand-glow);
  background: var(--bb-brand-surface);

GLASS:
  background: var(--bb-glass);
  backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid var(--bb-glass-border);

6. ANIMAÇÕES — COREOGRAFIA, NÃO EFEITOS ALEATÓRIOS:

Toda animação tem PROPÓSITO e TIMING preciso:

@keyframes reveal {
  from { opacity: 0; transform: translateY(12px) scale(0.98); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes beltGlow {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: var(--bb-brand-glow-strong); }
}

@keyframes fireFlicker {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  25% { transform: scale(1.1) rotate(-2deg); opacity: 0.9; }
  75% { transform: scale(0.95) rotate(2deg); opacity: 1; }
}

.animate-reveal {
  animation: reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

/* Stagger com delay progressivo */
[data-stagger] > * {
  opacity: 0;
  animation: reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
[data-stagger] > *:nth-child(1) { animation-delay: 0.05s; }
[data-stagger] > *:nth-child(2) { animation-delay: 0.1s; }
[data-stagger] > *:nth-child(3) { animation-delay: 0.15s; }
[data-stagger] > *:nth-child(4) { animation-delay: 0.2s; }
[data-stagger] > *:nth-child(5) { animation-delay: 0.25s; }
[data-stagger] > *:nth-child(6) { animation-delay: 0.3s; }
[data-stagger] > *:nth-child(7) { animation-delay: 0.35s; }
[data-stagger] > *:nth-child(8) { animation-delay: 0.4s; }

Crie hook useCountUp(target, duration = 800, decimals = 0):
  const [value, setValue] = useState(0);
  useEffect: requestAnimationFrame loop que incrementa de 0 ao target
  com easing easeOutExpo
  Retorna: value formatado

Usar em TODOS os KPIs numéricos dos dashboards.
```

---

## FASE V2 — LOGIN CINEMATOGRÁFICO

```
O login é um EVENTO, não um formulário.

FULLSCREEN. SEM SCROLL. CADA ELEMENTO APARECE COM TIMING.

BACKGROUND:
- Cor base: #06070A
- Mesh gradient:
  radial-gradient(ellipse 50% 50% at 50% 40%, rgba(239, 68, 68, 0.06) 0%, transparent 60%),
  radial-gradient(ellipse 40% 40% at 20% 60%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
  radial-gradient(ellipse 40% 40% at 80% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)
- Noise overlay: pseudo-element com SVG noise, opacity 0.02
- RESULTADO: fundo profundo e vivo, não flat preto

CARD CENTRAL:
- background: rgba(12, 14, 20, 0.7)
- backdrop-filter: blur(24px) saturate(1.3)
- border: 1px solid rgba(255, 255, 255, 0.06)
- border-radius: 24px
- padding: 48px 40px
- max-width: 420px
- box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)
  (inset shadow no topo simula luz vindo de cima)

SEQUÊNCIA DE ANIMAÇÃO (coreografada):
0.0s: card aparece (scale 0.95→1, opacity 0→1, blur 8px→0)
0.2s: logo aparece (fade + translateY -8px→0)
0.4s: tagline aparece (fade, mais sutil)
0.6s: input email aparece (reveal from bottom)
0.7s: input senha aparece (reveal from bottom)
0.9s: botão entrar aparece (reveal from bottom)
1.1s: "criar conta" aparece (fade)

LOGO:
- SVG ou texto "BLACKBELT" em font-display 36px weight 800
- Tracking: -0.03em
- Color: var(--bb-brand)
- Filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.3))
- Uma faixa vermelha fina (40px width, 3px height) abaixo do logo, centralizada

TAGLINE:
- "O sistema operacional da sua academia"
- font-sans 13px, var(--bb-ink-60), tracking 0.08em, uppercase
- MUITO sutil. Só complementa.

INPUTS:
- background: var(--bb-depth-5)
- border: 1px solid var(--bb-glass-border)
- border-radius: var(--bb-radius-md)
- height: 48px, padding: 0 16px
- font-size: 14px
- Ícone à esquerda (Mail, Lock) em var(--bb-ink-40), 18px
- Focus: border-color var(--bb-brand), box-shadow 0 0 0 3px rgba(239,68,68,0.12)
- Transição: all 0.2s ease

BOTÃO ENTRAR:
- background: var(--bb-brand-gradient)
- height: 48px, border-radius: var(--bb-radius-md)
- font-weight: 700, font-size: 15px, color: white
- Hover: box-shadow var(--bb-brand-glow), transform translateY(-1px)
- Active: transform translateY(0), filter brightness(0.9)
- Loading: texto "Entrando..." + spinner 16px branco
- BRILHO: pseudo-element ::after com gradient branco que desliza da esquerda
  pra direita infinitamente (shimmer sutil) quando loading

ERRO:
- Card faz shake (keyframe: translateX -8, 8, -4, 4, 0 em 0.3s)
- Mensagem aparece acima do botão em var(--bb-brand), font-size 13px
- Input com erro: border-color var(--bb-brand)

SUCESSO:
- Card faz scale 0.97 + opacity 0 em 0.3s
- Crossfade para o dashboard
```

---

## FASE V3 — SIDEBAR: A COLUNA VERTEBRAL VISUAL

```
A sidebar DEFINE o tom do app. É a primeira coisa visual contínua.

DESKTOP (260px width):

BACKGROUND: var(--bb-depth-2)
BORDER RIGHT: 1px solid var(--bb-glass-border)

TOPO (logo area, 80px height):
- "BLACKBELT" em font-display 20px weight 800 var(--bb-brand)
  com letter-spacing -0.02em
- Ou logo SVG se existir
- Filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.15))
- Abaixo: nome da academia em 12px var(--bb-ink-60) + plano badge

FAIXA VISUAL:
- Uma linha vertical de 3px no lado esquerdo da sidebar
- Posição: acompanha o item ativo (transition top 0.25s ease)
- Cor: var(--bb-brand)
- Glow: box-shadow 3px 0 12px rgba(239, 68, 68, 0.3)
- ESTA FAIXA VERTICAL É A IDENTIDADE DO APP.

ITEMS DE NAVEGAÇÃO:
- Padding: 10px 16px
- Border-radius: var(--bb-radius-sm)
- Gap entre items: 2px
- Ícone: 20px, Lucide React, stroke-width 1.5
- Label: 14px weight 500
- NORMAL: color var(--bb-ink-60), bg transparent
- HOVER: bg var(--bb-depth-4), color var(--bb-ink-80), translateX(2px)
- ATIVO: bg var(--bb-brand-surface), color var(--bb-brand),
  font-weight 600, ícone var(--bb-brand)
  + faixa vertical posicionada neste item

AGRUPAMENTO:
- Divider entre grupos: 1px solid var(--bb-glass-border), margin 12px 16px
- Label de grupo: OVERLINE style (11px, uppercase, tracking wide, var(--bb-ink-40))
  ex: "GESTÃO", "CONTEÚDO", "CONFIGURAÇÕES"

FOOTER:
- Posição: bottom da sidebar, fixed
- Avatar 36px com borda 2px var(--bb-glass-border)
- Nome: 13px weight 600, var(--bb-ink-100)
- Role: 11px var(--bb-ink-60)
- Ícone settings + logout (hover: var(--bb-brand))

COLLAPSED (80px):
- Só ícones, centralizados
- Tooltip com label ao hover (fade-in com delay 200ms)
- Logo vira ícone (BB ou 🥋)
- Transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)

MOBILE BOTTOM NAV:
- 5 ícones máximo
- Background: var(--bb-depth-2) com backdrop-filter blur(20px)
- Border top: 1px solid var(--bb-glass-border)
- Safe area: padding-bottom env(safe-area-inset-bottom)
- Ativo: ícone var(--bb-brand) + dot vermelho 4px abaixo do ícone
- Transition: color 0.2s, transform 0.2s
- Ativo: translateY(-2px)
```

---

## FASE V4 — DASHBOARD ADMIN: O COMMAND CENTER

```
Este dashboard precisa dar a sensação de PODER. O dono vê tudo.

LAYOUT:
- Sem scroll horizontal. Tudo em coluna no mobile.
- Desktop: grid de 12 colunas com gaps de 16px
- Cada seção entra com animation reveal staggered

HEADER CONTEXTUAL:
Não é saudação genérica. É CONTEXTUAL E BOLD.
- "Bom dia, Roberto." em 28px weight 700
- Abaixo: frase contextual em 14px var(--bb-ink-60)
  Se tudo OK: "Sua academia está 92% saudável hoje."
  Se riscos: "2 alunos precisam da sua atenção."
  Se record: "Parabéns! Melhor mês de receita."

KPIs (4 cards em row, staggered):
Cada KPI:
  background: var(--bb-depth-3)
  border: 1px solid var(--bb-glass-border)
  border-radius: var(--bb-radius-lg)
  padding: 24px
  
  OVERLINE: "ALUNOS ATIVOS" (11px, uppercase, tracking wide, var(--bb-ink-40))
  HERO NUMBER: "25" em font-mono 44px weight 700 var(--bb-ink-100)
    → useCountUp animation (0→25 em 800ms, easeOutExpo)
  TREND: badge inline "↑ 2 vs fev" em var(--bb-success) se positivo
    ou "↓ 3% vs fev" em var(--bb-warning) se negativo
    Background: var(--bb-success-surface) ou var(--bb-warning-surface)
    Font-mono 12px weight 500
  SPARKLINE: linha mini (40px width, 20px height) no canto superior direito
    mostrando tendência dos últimos 7 dias. Stroke 1.5px, cor contextual.

RECEITA card: KPI com "R$ 3.847" onde R$ é em 14px e 3.847 é em 44px font-mono
  O ponto dos milhares usa . não , (padrão BR)

CENTRAL DE ATENÇÃO:
  Card com variante GLOW se tem alertas:
    border-left: 3px solid var(--bb-brand)
    background: var(--bb-brand-surface)
    box-shadow: var(--bb-brand-glow)
  
  Header: "AÇÃO NECESSÁRIA" em OVERLINE var(--bb-brand)
  
  Cada alerta:
    Row com: ícone circular (🔴 fundo vermelho sutil) + info + ações
    "Guilherme Neves" em 15px weight 600
    "8 dias sem aparecer · Faixa roxa · 13 meses" em 13px var(--bb-ink-60)
    Botões: [Mensagem] [Perfil] [Ligar] em ghost style, var(--bb-brand) ao hover
    
  Se 0 alertas:
    border-left cor var(--bb-success)
    background var(--bb-success-surface)
    "✅ Tudo em ordem. Sua academia está saudável." em var(--bb-success)

TIMELINE DO DIA:
  Linha vertical fina (1px var(--bb-glass-border)) com dots
  Dot da aula atual: 10px, var(--bb-brand), animation beltGlow (pulsa)
  Dot passado: 8px, var(--bb-ink-40)
  Dot futuro: 8px, var(--bb-glass-border)
  Cada aula: card mini com horário (font-mono), turma, professor, alunos

GRÁFICOS:
  Recharts com tema customizado:
  - Fundo: transparente
  - Grid: stroke var(--bb-ink-20) opacity 0.5
  - Barras: gradient vertical (var(--bb-brand) no topo → var(--bb-brand-deep) na base)
  - Tooltip: bg var(--bb-depth-4), border var(--bb-glass-border),
    border-radius var(--bb-radius-md), shadow var(--bb-shadow-md)
    Texto: var(--bb-ink-100)
  - Eixos: var(--bb-ink-40), font-mono 11px
  - Animação: barras crescem de baixo com stagger
```

---

## FASE V5 — PERFIL DO ALUNO: A PÁGINA QUE EMOCIONA

```
Quando o aluno abre seu perfil, ele vê sua HISTÓRIA no tatame.

HERO SECTION (200px height):
- Background: gradiente sutil usando a cor da faixa do aluno
  ex faixa azul: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 70%)
  sobre var(--bb-depth-2)
- FAIXA HORIZONTAL: 4px no topo do hero, cor da faixa, full width
  com glow: box-shadow 0 2px 20px [cor da faixa com opacity 0.3]

- Avatar: 88px, border 3px solid [cor da faixa], border-radius full
  box-shadow: 0 0 0 4px var(--bb-depth-2), 0 0 20px [cor da faixa opacity 0.2]
- Nome: 24px weight 700 var(--bb-ink-100)
- Linha de stats: badges inline
  "142 aulas" | "11 meses" | "🔥 12" | "#2"
  Cada badge: bg var(--bb-depth-4), border-radius full, padding 4px 12px,
  font-mono 12px weight 500

- BeltProgress (o elemento mais bonito):
  Container 100% width, 12px height
  Background: [cor da faixa atual] com opacity 0.2
  Foreground: gradiente [cor atual → cor próxima] 
  Preenchimento animado (0%→68% em 1.2s com easeOutExpo)
  Label abaixo: "Azul → Roxa · 68%" em 12px var(--bb-ink-60)
  ESTE COMPONENTE deve parecer uma faixa de artes marciais estilizada

TABS:
- Background: var(--bb-depth-2)
- Tab ativo: var(--bb-ink-100) + borda bottom 2px var(--bb-brand) 
- Tab inativo: var(--bb-ink-60) + sem borda
- Transition: color 0.2s, border 0.2s
- Content: fade-in ao trocar tab

JORNADA (Tab 1):
Timeline vertical com:
- Linha: 2px, gradiente vertical (var(--bb-brand) no topo → var(--bb-ink-20) na base)
- Cada marco: dot 12px na linha + card à direita
  Animation: reveal com stagger (cada item 0.1s depois do anterior)
  Scroll: items carregam ao entrar no viewport (Intersection Observer)

PROMOÇÃO DE FAIXA na timeline:
  Card com:
  - Borda left 4px na cor da NOVA faixa
  - Background: gradient sutil da nova faixa com opacity 0.05
  - "PROMOVIDO: Azul → Roxa" em weight 700 com cores das faixas
  - "148 aulas · 11 meses · Score 88" em var(--bb-ink-60)
  - Ícone 🥋 com glow da cor da nova faixa

HEATMAP (Tab Presenças):
Grid de quadrados (52 colunas × 7 linhas = 1 ano):
- Treinou forte: var(--bb-success) opacity 1
- Treinou leve: var(--bb-success) opacity 0.5
- Faltou: var(--bb-depth-4) 
- Cada quadrado: 12px, border-radius 3px, gap 3px
- Hover: scale 1.5 + tooltip com data e info
- Labels: meses abaixo, dias da semana à esquerda (3 letras, var(--bb-ink-40))
- BORDA: var(--bb-depth-3), border-radius var(--bb-radius-lg), padding 16px
```

---

## FASE V6 — PROMOÇÃO DE FAIXA: O MOMENTO INSTAGRAM

```
A promoção de faixa é A experiência que o aluno vai querer compartilhar.
Precisa ser tão bonita que ele grava a tela.

QUANDO PROFESSOR CONFIRMA A PROMOÇÃO:

SEQUÊNCIA CINEMATOGRÁFICA (5 segundos):

0.0s: tela escurece (overlay rgba(0,0,0,0.9) com fade-in 0.3s)

0.5s: faixa ANTIGA aparece no centro da tela
  - Visual: retângulo 200px × 16px com a cor da faixa antiga
  - Nó no centro (simulando amarração)
  - Scale-in de 0.8→1 com blur 4px→0

1.5s: faixa antiga se DESFAZ
  - Animation: blur 0→8px + opacity 1→0 + translateY 0→-20px
  - Partículas da cor antiga se dispersam (8-12 pequenos quadrados 
    que se movem em direções aleatórias e desaparecem)

2.0s: faixa NOVA aparece
  - Vem de baixo: translateY 40px→0 + scale 0.9→1 + blur 4px→0
  - Glow forte: box-shadow 0 0 60px [cor nova com opacity 0.4]
  - A cor da nova faixa PULSA uma vez (scale 1→1.05→1 em 0.3s)

2.5s: nome do aluno aparece abaixo
  - "João Pedro Almeida" em 24px weight 700 branco
  - Fade-in + translateY 12→0

3.0s: texto emocional
  - "Faixa Azul" na cor da faixa, 18px weight 600
  - "148 aulas · 11 meses de dedicação"
  - "Avaliado por Prof. André da Silva"
  - Cada linha com stagger fade-in

4.0s: confetti
  - NÃO confetti genérico. Confetti na cor da NOVA FAIXA + dourado
  - 30-40 partículas, variando tamanho (4-8px)
  - Caem com gravidade + rotação
  - Duration: 3 segundos

5.0s: botões aparecem
  - [Compartilhar] [Ver minha jornada] [Fechar]
  - Fade-in + translateY

IMPLEMENTAÇÃO:
- Tudo em CSS keyframes + requestAnimationFrame para partículas
- Container: position fixed, inset 0, z-index 9999
- Confetti: canvas ou divs absolutas com animation
- Sem biblioteca externa (demonstra craft)
- ESC ou click em fechar: fade-out rápido (0.2s)

PARA O ALUNO (quando abre o app depois):
- Banner no topo do dashboard:
  Background: gradient da cor da nova faixa com opacity 0.1
  Border: 1px solid [cor da faixa]
  "🎉 Você foi promovido para Faixa Azul!"
  [Ver minha jornada →]
  Persiste 7 dias. Dismissável.
```

---

## FASE V7 — PERFIS VISUAIS DISTINTOS

```
Cada perfil tem PERSONALIDADE VISUAL PRÓPRIA.
Não é "mesmo app com dados diferentes". É experiência diferente.

ADMIN:
- Tom: executivo, dados, controle
- Palette accent: vermelho (brand)
- Dashboard: KPIs enormes, gráficos, tabelas, alertas
- Feeling: "eu comando este negócio"

PROFESSOR:
- Tom: funcional, prático, foco no aluno
- Palette accent: vermelho + azul para turmas
- Dashboard: próxima aula dominante, lista de alunos com contexto
- Feeling: "eu ensino melhor com este app"

ALUNO ADULTO:
- Tom: jornada pessoal, evolução, emoção contida
- Palette accent: COR DA FAIXA DO ALUNO (muda per user!)
  Se azul: tons azuis nos accents
  Se roxa: tons roxos
  Se branca: vermelho (brand default)
- Dashboard: progresso dominante, faixa visual, streak, conteúdo
- Feeling: "eu estou evoluindo"

TEEN:
- Tom: energético, gamificado, visual forte
- Palette accent: gradiente vibrante (vermelho→âmbar→amarelo)
- Elementos mais BOLD: XP bar grossa, ranking com medalhas brilhantes
- Animações mais expressivas (bounces, scales maiores)
- Background gradient mais colorido (mesh com mais cor)
- Feeling: "esse app é MEU"

KIDS:
- Tom: lúdico, positivo, simples
- Palette: MAIS CLARO que o resto do app (mesmo em dark mode)
  Background: var(--bb-depth-2) ao invés de var(--bb-depth-1)
- Border-radius: var(--bb-radius-2xl) em tudo (mais arredondado)
- Ícones: maiores (24px→32px), mais coloridos
- Texto: maior (16px base), mais espaçamento
- Estrelas: ⭐ douradas com CSS filter drop-shadow dourado
- Figurinhas: cards com border 2px colorida, hover wobble animation
- NADA de texto negativo. Só positivo. Só motivação.
- Feeling: "que legal!"

RESPONSÁVEL:
- Tom: acolhedor, informativo, seguro
- Palette accent: azul (segurança, confiança) + vermelho para pagamentos
- Cards dos filhos: cada um com BeltStripe da cor da faixa deles
- Dashboard: consolidado, claro, direto
- Feeling: "meu filho está bem"
```

---

## FASE V8 — STREAMING: CINEMA DA ACADEMIA

```
A tela de conteúdo é um PRODUTO DENTRO DO PRODUTO.
Quando o aluno abre, ele esquece que está num app de gestão.

FUNDO: var(--bb-depth-1) — o mais escuro possível. Imersão total.

HERO (topo, 300px):
- Background: thumbnail do vídeo em destaque com overlay gradient
  (transparent → var(--bb-depth-1) de cima pra baixo)
- Título do vídeo em 28px weight 700 branco
- Professor, duração, faixa
- Botão [▶ Assistir] grande com glow
- Apenas 1 vídeo featured aqui (o mais relevante pro aluno)

CONTINUAR ASSISTINDO:
Cards 280px width × 160px height:
- Thumbnail REAL ou placeholder bonito (gradiente escuro + ícone play + título)
- Overlay gradiente bottom (transparent → var(--bb-depth-1))
- Progress bar 3px no bottom (var(--bb-brand))
- Hover: scale 1.03, shadow-lg, border var(--bb-brand) sutil
- Botão play CIRCULAR (48px, branco, opacity 0→1 ao hover) centralizado
- Scroll horizontal com scroll-snap: type x mandatory
  padding: 0 24px, gap 16px
- Título abaixo: 14px weight 600 + "5:26 restantes" var(--bb-ink-60)

TRILHAS:
Cards verticais (240px width):
- Thumbnail (aspectratio 16/9) com overlay
- Badge de faixa (BeltBadge) no canto superior
- "Fundamentos BJJ" em 15px weight 600
- "5 aulas · 52min" em 12px var(--bb-ink-60)
- Progress bar se em andamento
- 🔒 se faixa insuficiente:
  Thumbnail com filter blur(4px) + opacity 0.5
  Overlay com ícone cadeado + "Faixa Azul necessária" em 12px
```

---

## FASE V9 — MODO AULA: PERFEIÇÃO FUNCIONAL

```
Tela fullscreen, escura, sem distração. Cada pixel serve à chamada.

BACKGROUND: var(--bb-depth-1)
SEM SIDEBAR. SEM BOTTOM NAV. Tela dedicada.

HEADER BAR (64px):
- Left: voltar (ícone chevron) + nome da turma 18px weight 600
- Center: TIMER em font-mono 28px weight 500 var(--bb-ink-100)
  "00:23:45" com glow vermelho sutil ao redor
  brilho: text-shadow: 0 0 20px rgba(239, 68, 68, 0.2)
- Right: [📱 QR Code] [✅ Encerrar] botões

LISTA DE ALUNOS:
Cada card: min-height 72px, full width
  background: var(--bb-depth-3)
  border: 1px solid var(--bb-glass-border)
  border-radius: var(--bb-radius-md)
  padding: 16px 20px
  margin-bottom: 8px
  
  LAYOUT:
  [Avatar 44px] [Info] ............................ [Status Badge]
  
  Avatar: border 2px [cor da faixa]
  Info:
    Nome: 15px weight 600 var(--bb-ink-100)
    Meta: "Azul · Streak 12 🔥 · Score 88" em 12px var(--bb-ink-60)
    Nota (se tem): "📝 Foco em passagem" em 12px var(--bb-ink-40) italic
  
  Status:
    PRESENTE (QR): badge verde com glow
      bg var(--bb-success-surface), color var(--bb-success)
      "Presente" + horário "19:05"
      border-left: 3px solid var(--bb-success)
    PRESENTE (manual): mesmo mas sem horário
    AUSENTE: badge neutro
      bg var(--bb-depth-4), color var(--bb-ink-40)
      "Ausente"
  
  INTERAÇÃO:
  - TAP no card inteiro: toggle presença
  - Transição: background suave 0.2s + border-left aparece/some
  - Haptic: vibração leve no mobile
  - Feedback visual: green flash sutil (border-color pisca verde 0.3s)

QR CODE MODAL:
  - Overlay: rgba(0,0,0,0.85) + backdrop-filter blur(8px)
  - QR: 280px, fundo branco, border-radius 20px, padding 20px
    box-shadow: 0 0 40px rgba(255,255,255,0.1)
  - Timer CIRCULAR ao redor do QR:
    SVG circle com stroke-dasharray animado (countdown visual)
    Cor: var(--bb-brand), stroke-width 3px
    "Expira em 4:32" abaixo em font-mono var(--bb-ink-60)
  - "Alunos escaneando..." com 3 dots animados
  - Lista de nomes aparecendo:
    Cada nome: fade-in + translateY com delay stagger
    "✅ João Pedro — 19:05"
    "✅ Ana Carol — 19:06"
```

---

## FASE V10 — OS DETALHES INVISÍVEIS QUE DEFINEM QUALIDADE

```
Estes detalhes são o que separa software amador de profissional.
O usuário não percebe conscientemente. Mas sente.

1. SCROLLBAR:
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--bb-ink-20);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: var(--bb-ink-40); }
/* Firefox */
* { scrollbar-width: thin; scrollbar-color: var(--bb-ink-20) transparent; }

2. SELEÇÃO DE TEXTO:
::selection {
  background: rgba(239, 68, 68, 0.2);
  color: var(--bb-ink-100);
}

3. FOCUS RING:
*:focus-visible {
  outline: 2px solid var(--bb-brand);
  outline-offset: 2px;
  border-radius: var(--bb-radius-sm);
}

4. SKELETON SHIMMER:
.skeleton {
  background: linear-gradient(90deg,
    var(--bb-depth-4) 0%,
    var(--bb-depth-5) 40%,
    var(--bb-depth-4) 80%
  );
  background-size: 300% 100%;
  animation: shimmer 2s ease-in-out infinite;
  border-radius: var(--bb-radius-sm);
}
@keyframes shimmer {
  0% { background-position: 300% 0; }
  100% { background-position: -300% 0; }
}

5. TOOLTIP:
  background: var(--bb-depth-4);
  border: 1px solid var(--bb-glass-border);
  border-radius: var(--bb-radius-sm);
  padding: 6px 12px;
  font-size: 12px;
  color: var(--bb-ink-80);
  box-shadow: var(--bb-shadow-md);
  animation: fadeIn 0.15s ease;
  max-width: 200px;
  pointer-events: none;

6. TOAST:
  Position: fixed bottom-right (desktop), bottom-center (mobile)
  background: var(--bb-depth-3);
  border: 1px solid var(--bb-glass-border);
  border-left: 3px solid [cor contextual];
  border-radius: var(--bb-radius-md);
  padding: 14px 20px;
  shadow: var(--bb-shadow-lg);
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  Progress bar no bottom: 2px, shrinks de 100%→0% em 4s
  Auto-dismiss após 4s com fade-out.

7. MODAL:
  Overlay: rgba(0, 0, 0, 0.7) + backdrop-filter blur(4px)
  animation: fadeIn 0.2s ease
  Card: var(--bb-depth-3), border var(--bb-glass-border),
  border-radius var(--bb-radius-xl), shadow var(--bb-shadow-xl)
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)
  (scale 0.95→1 + opacity 0→1)

8. PREVENT FOUC (flash of unstyled content):
Script inline no <head> do layout que aplica dark class ANTES do React:
Já descrito no prompt anterior de tema.

9. SMOOTH SCROLL:
html { scroll-behavior: smooth; }
Mas desabilitar para usuários que preferem: @media (prefers-reduced-motion: reduce)

10. CURSOR:
Links e botões: cursor pointer (óbvio mas verificar)
Inputs: cursor text
Disabled: cursor not-allowed + opacity 0.5
Drag: cursor grab → grabbing
```

---

## EXECUÇÃO

```
Cole no Claude Code:

"Leia o BLACKBELT_VISUAL_DEFINITIVO.md nesta pasta.
Este prompt transforma o visual do app inteiro de genérico para premium.

Execute TODAS as fases (V1 até V10) em sequência.

REGRA ABSOLUTA:
- Usar APENAS CSS variables definidas na V1 (nunca hardcode de cor)
- Tailwind utilities + custom CSS onde necessário
- Importar fontes Instrument Sans + JetBrains Mono do Google Fonts
- A faixa (BeltStripe, BeltProgress, BeltBadge) é o elemento visual central
- TODAS as telas devem usar o novo design system
- Animações com timing preciso (não genéricas)
- Manter funcionalidade — APENAS mudar visual e interações
- Testar dark E light mode
- Build deve passar ao final
- Commit: 'design: visual definitivo — athletic luxury identity'
- Push

Comece agora."
```

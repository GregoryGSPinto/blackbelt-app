# BLACKBELT v2 — LANDING PAGE ENTERPRISE
# Reescrever a landing page para converter donos de academia em clientes

## PROBLEMA ATUAL

A landing page tem 2 páginas coladas (hero "Evolua a cada treino" + seção completa "O software que toda academia precisa"), números fictícios (500+ academias), hero vago, sem screenshots do produto, pricing escondido, e formulário de contato genérico.

Resultado: página confusa, longa demais, sem foco, sem conversão.

## MISSÃO

Reescrever como UMA ÚNICA landing page coesa que:
- Comunica valor em 5 segundos
- Mostra o produto (screenshots/mockups)
- Mostra pricing transparente
- Converte dono de academia em trial de 7 dias
- Funciona perfeitamente no celular (83% do tráfego é mobile)
- Carrega rápido (LCP < 2s)

---

## REGRAS ABSOLUTAS

1. **UMA ÚNICA PÁGINA.** Deletar a duplicação. Um hero, um footer, uma narrativa.
2. **ZERO números falsos.** Nada de "500+ academias" ou "25.000+ alunos". Se não temos dados reais, não inventamos.
3. **var(--bb-depth-*) e var(--bb-ink-*).** Zero cores hardcoded.
4. **Mobile-first.** Desktop é adaptação do mobile, não o contrário.
5. **LCP < 2s.** Nenhuma imagem pesada. Nenhum JS blocking. CSS animations only.
6. **CTA único e claro.** "Começar Grátis — 7 Dias" em TODOS os CTAs. Nenhum CTA secundário concorrente.
7. **Português do Brasil natural.** Sem anglicismos forçados. "Gestão" não "Management".
8. **pnpm typecheck && pnpm build** — ZERO erros.

---

## SEÇÃO 1 — DELETAR A DUPLICAÇÃO (5 min)

### 1A. Identificar a estrutura atual

```bash
cat app/page.tsx | head -20
# OU
cat app/\(public\)/page.tsx | head -20
# OU (a landing pode estar em /landing)
find app -name "page.tsx" -path "*landing*" -o -name "page.tsx" -path "*public*" | head -5
```

### 1B. Entender o que está renderizando

A página atual renderiza DUAS seções distintas que parecem duas landing pages diferentes.
Precisa virar UMA SÓ com esta estrutura:

```
1. NAVBAR (fixa, blur, simples)
2. HERO (5 segundos para converter)
3. PROBLEMA → SOLUÇÃO (por que o dono precisa disso)
4. PRODUTO (screenshots/mockups do app)
5. PERFIS (como cada tipo de usuário usa)
6. PRICING (5 planos transparentes)
7. DEPOIMENTOS (honestos)
8. FAQ (accordion)
9. CTA FINAL
10. FOOTER
```

Nada mais. Nada menos. Cada seção tem propósito. Se não converte, não entra.

---

## SEÇÃO 2 — REESCREVER A LANDING PAGE COMPLETA (40 min)

### DIREÇÃO ESTÉTICA

**Tone:** Premium, sério, profissional. O dono de academia é um empresário — ele não quer ver landing page de startup hipster. Ele quer ver um software que parece confiável, sólido, que não vai sumir amanhã.

**Palette:** Dark mode (fundo escuro = premium). Vermelho BlackBelt (#C62828) como accent. Branco para texto principal. Cinza para secundário. Sem gradientes chamativos.

**Typography:** Uma fonte display marcante para headlines (não Inter, não Roboto — buscar algo com personalidade como Outfit, Sora, Satoshi ou similar via Google Fonts). Fonte body legível (pode ser a que já usa).

**Layout:** Generous whitespace. Seções com padding vertical grande (py-24 lg:py-32). Nada apertado. Cada seção respira.

**Motion:** Fade-in sutil ao scroll (CSS only, intersection observer). Nada exagerado. Profissional, não circense.

### 2A. NAVBAR

```
Fixa no topo. Blur no scroll (backdrop-filter: blur(12px)).
Logo "BLACKBELT" à esquerda.
Links: Funcionalidades | Perfis | Planos | FAQ
CTA: botão "Começar Grátis" (vermelho, pequeno) à direita.
Subtexto debaixo do CTA (12px): "7 dias grátis — sem cartão"
Mobile: hamburger → drawer com links + CTA.
```

### 2B. HERO — 5 SEGUNDOS

Este é o elemento mais importante da página inteira. O dono de academia decide aqui se continua scrollando ou fecha a aba.

```
HEADLINE (max 8 palavras, foco em RESULTADO para o dono):
  "Sua academia funcionando no automático."

SUBHEADLINE (1 frase, 15-20 palavras):
  "Check-in, turmas, cobranças e presença — tudo num app que seus alunos e professores vão amar."

CTA:
  Botão grande: "COMEÇAR GRÁTIS — 7 DIAS"
  Texto abaixo: "Sem cartão de crédito. Cancele quando quiser."

VISUAL:
  Mockup do dashboard do admin (pode ser um div estilizado que SIMULA uma tela do app).
  NÃO é imagem — é HTML/CSS puro, renderizado inline, para carregar instantaneamente.
  Mostra: 3-4 KPI cards (45 alunos, R$15.800 receita, 87% presença, 3 turmas hoje).
  Cantos arredondados, sombra, visual de "app real".
```

**HERO MOCKUP — IMPLEMENTAÇÃO:**

Criar um componente `components/landing/DashboardMockup.tsx`:

```tsx
// Mockup visual do dashboard — HTML/CSS puro, sem imagem, carrega instantâneo
export function DashboardMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border max-w-lg mx-auto lg:mx-0"
         style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-xs ml-2" style={{ color: 'var(--bb-ink-400)' }}>BlackBelt — Dashboard</span>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <KPICard label="Alunos Ativos" value="45" trend="+3 este mês" icon="👥" />
        <KPICard label="Receita" value="R$ 15.800" trend="+12% vs anterior" icon="💰" />
        <KPICard label="Presença" value="87%" trend="Acima da média" icon="📊" />
        <KPICard label="Turmas Hoje" value="3" trend="Próxima às 19h" icon="🥋" />
      </div>
      {/* Activity preview */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bb-ink-400)' }}>ÚLTIMOS CHECK-INS</div>
        <div className="space-y-2">
          <ActivityRow name="João Pedro" time="há 5 min" belt="azul" />
          <ActivityRow name="Maria Clara" time="há 12 min" belt="roxa" />
          <ActivityRow name="Lucas Teen" time="há 18 min" belt="amarela" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend, icon }: { label: string; value: string; trend: string; icon: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bb-depth-3)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--bb-ink-400)' }}>{label}</span>
        <span>{icon}</span>
      </div>
      <div className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: '#22C55E' }}>{trend}</div>
    </div>
  );
}

function ActivityRow({ name, time, belt }: { name: string; time: string; belt: string }) {
  const beltColors: Record<string, string> = {
    branca: '#F8FAFC', azul: '#3B82F6', roxa: '#8B5CF6', amarela: '#EAB308', marrom: '#92400E',
  };
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 rounded-lg" style={{ background: 'var(--bb-depth-4)' }}>
      <div className="w-2 h-6 rounded-full" style={{ background: beltColors[belt] || '#94A3B8' }} />
      <span className="text-sm font-medium flex-1" style={{ color: 'var(--bb-ink-200)' }}>{name}</span>
      <span className="text-xs" style={{ color: 'var(--bb-ink-500)' }}>{time}</span>
    </div>
  );
}
```

**Layout do Hero:**
```
Desktop: 2 colunas — texto à esquerda, mockup à direita
Mobile: stack — texto em cima, mockup embaixo (menor)
Background: gradient sutil radial (vermelho escuro em 5% opacity no canto)
```

### 2C. PROBLEMA → SOLUÇÃO

Antes de mostrar features, falar a DOR do dono de academia.

```
Headline: "Você não abriu uma academia pra virar cobrador."

3 cards lado a lado (mobile: stack):

Card 1: "📋 Caderno e WhatsApp"
  "Controle de presença no papel. Cobrança por mensagem.
   Lista de alunos na planilha. Você sabe que precisa mudar."

Card 2: "💸 Inadimplência que dói"
  "Todo mês é a mesma história: aluno que sumiu, mensalidade atrasada,
   cobrança constrangedora. Isso consome seu tempo e energia."

Card 3: "😰 Sem visão do negócio"
  "Quantos alunos você tem de verdade? Qual sua taxa de retenção?
   Quanto entrou este mês? Se você não sabe, está voando às cegas."

Transição: "O BlackBelt resolve tudo isso. Em um app."
```

### 2D. PRODUTO — MOSTRAR O APP

Seção com 3-4 mockups do app mostrando telas diferentes.

```
Headline: "Veja como funciona"

3 tabs clicáveis (ou scroll horizontal no mobile):

Tab 1: "Dashboard do Admin"
  → Mockup do dashboard (reutilizar DashboardMockup ou variação)
  → Texto: "KPIs em tempo real. Receita, presença, inadimplência. No celular."

Tab 2: "Check-in por QR Code"
  → Mockup de tela de check-in (botão grande "FAZER CHECK-IN" + QR icon)
  → Texto: "Aluno chegou? 3 segundos e a presença está registrada."

Tab 3: "Painel do Responsável"
  → Mockup do dashboard do pai (card com nome do filho, presença do mês, próxima aula)
  → Texto: "Pais acompanham tudo. Presença, evolução, pagamentos. Sem ligar pra academia."

Tab 4: "Cobranças Automáticas"
  → Mockup de tela financeira (lista de faturas com status pago/pendente/vencido)
  → Texto: "PIX e boleto automáticos. Lembrete antes do vencimento. Zero constrangimento."
```

**TODOS os mockups são HTML/CSS puro** — não são imagens. Carregam instantaneamente.
Criar componentes: `CheckinMockup`, `ParentMockup`, `BillingMockup`.

### 2E. PERFIS — 6 EXPERIÊNCIAS

```
Headline: "Cada pessoa tem sua experiência"
Subheadline: "9 perfis especializados. Cada um vê só o que precisa."

Grid 3x2 (mobile: 2x3) de cards pequenos:

[Admin]        [Professor]     [Aluno]
Dashboard,     Modo aula,      Check-in,
turmas,        avaliações,     progresso,
financeiro     técnicas        conquistas

[Teen]         [Kids]          [Pais]
XP, ranking,   Estrelas,       Presença,
desafios,      figurinhas,     evolução,
conquistas     diversão        pagamentos

Cada card:
  - Ícone/emoji no topo
  - Nome do perfil (bold)
  - 3 palavras-chave (cinza)
  - Hover: borda vermelha sutil
```

**NÃO expandir em seções longas.** O visitante não quer ler 4 parágrafos sobre cada perfil. Ele quer entender em 2 segundos que existe um perfil pra cada pessoa.

### 2F. PRICING — TRANSPARENTE

```
Headline: "Planos simples, sem surpresa"
Subheadline: "7 dias grátis em qualquer plano. Sem cartão de crédito."

5 cards em row (mobile: scroll horizontal ou stack):

STARTER          ESSENCIAL        PRO ★            BLACK BELT       ENTERPRISE
R$ 97/mês        R$ 197/mês       R$ 347/mês       R$ 597/mês       Sob consulta

50 alunos        150 alunos       300 alunos        Ilimitado        Ilimitado
3 turmas         10 turmas        Ilimitado         Ilimitado        Ilimitado
1 professor      3 professores    10 professores    Ilimitado        Ilimitado
Check-in         + Financeiro     + Streaming       + White-label    + API
                 + Relatórios     + Gamificação     + Multi-unidade  + Suporte dedicado
                                  + Campeonatos     + Integrações    + SLA

[Começar Grátis] [Começar Grátis] [Começar Grátis]  [Começar Grátis] [Falar com a Gente]

Card PRO com destaque: borda vermelha, badge "Mais Popular"
```

**IMPORTANTE:** Cada botão "Começar Grátis" leva para `/cadastrar-academia?plan=PLANO` (pré-seleciona o plano no wizard).

### 2G. DEPOIMENTOS — HONESTOS

```
Headline: "O que dizem sobre o BlackBelt"

REGRA: NÃO usar nomes falsos com sobrenome de celebridade.
NÃO usar "Alliance BJJ" ou academias reais que não são clientes.

OPÇÃO A (se tiver depoimentos reais):
  Usar depoimentos reais das 2 academias que vão testar.

OPÇÃO B (se não tiver ainda):
  Substituir por seção "Feito por quem entende o tatame":
  
  "O BlackBelt foi criado por praticantes de artes marciais
   que vivem o dia a dia de uma academia. Cada funcionalidade
   foi pensada para resolver problemas reais — não por um
   time de tech que nunca pisou num tatame."
   
  — Gregory Pinto, Fundador

  Isso é honesto, é real, e comunica autenticidade.
```

### 2H. FAQ — CONCISO

```
Accordion com 6-8 perguntas:

1. "Preciso de cartão de crédito para começar?"
   → Não. O trial de 7 dias é 100% grátis. Você só informa dados de pagamento quando escolher um plano.

2. "Funciona para qualquer arte marcial?"
   → Sim. Jiu-Jitsu, Judô, Karatê, MMA, Muay Thai, Taekwondo — qualquer modalidade.

3. "Como funciona o check-in dos alunos?"
   → O aluno abre o app, escaneia o QR Code na academia, e a presença é registrada. Leva 3 segundos.

4. "E se eu já uso outro sistema?"
   → Sem problema. Você pode rodar os dois em paralelo durante o trial. Se gostar, migramos seus dados.

5. "Tem contrato de fidelidade?"
   → Não. Cancele quando quiser, sem multa.

6. "Funciona no celular?"
   → Sim. Web app que funciona em qualquer celular. Também disponível para iOS e Android.

7. "Meus alunos precisam baixar alguma coisa?"
   → Não obrigatoriamente. O app funciona no navegador do celular. Mas se quiserem, podem instalar direto da tela.

8. "Como funciona o suporte?"
   → WhatsApp direto com a equipe. Resposta em até 24h úteis.
```

### 2I. CTA FINAL

```
Background: gradiente sutil vermelho escuro
Headline: "Pronto para tirar sua academia do papel?"
Subheadline: "7 dias grátis. Sem cartão. Sem compromisso."
Botão grande: "COMEÇAR AGORA"
Texto abaixo: "Ou fale com a gente pelo WhatsApp"
Link WhatsApp: https://wa.me/5531999990000 (número do Gregory)
```

### 2J. FOOTER

```
Simples, limpo:

Coluna 1: Logo BLACKBELT + tagline "Gestão de academias de artes marciais"
Coluna 2: Produto (Funcionalidades, Planos, FAQ)
Coluna 3: Legal (Termos de Uso, Privacidade, Contato)
Coluna 4: Contato (WhatsApp, Email)

Linha final: "© 2026 BlackBelt. Feito com 🥋 em Minas Gerais."
```

---

## SEÇÃO 3 — ANIMAÇÕES DE SCROLL (10 min)

### 3A. Intersection Observer para fade-in

```typescript
// components/landing/FadeInSection.tsx
'use client';
import { useRef, useEffect, useState, type ReactNode } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export function FadeInSection({ children, delay = 0, direction = 'up' }: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: 'translateY(30px)',
    left: 'translateX(-30px)',
    right: 'translateX(30px)',
    none: 'none',
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : transforms[direction],
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

### 3B. Aplicar em cada seção

Cada seção da landing fica dentro de `<FadeInSection>` com delays escalonados:

```tsx
<FadeInSection>
  <HeroSection />
</FadeInSection>

<FadeInSection delay={100}>
  <ProblemSection />
</FadeInSection>

<FadeInSection delay={100}>
  <ProductSection />
</FadeInSection>
```

---

## SEÇÃO 4 — NAVBAR FIXA COM BLUR (5 min)

```typescript
// components/landing/LandingNavbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
      style={{
        background: scrolled ? 'rgba(10, 10, 14, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bb-glass-border)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: '#C62828' }}>
          BLACKBELT
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>Funcionalidades</a>
          <a href="#perfis" className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>Perfis</a>
          <a href="#planos" className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>Planos</a>
          <a href="#faq" className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>FAQ</a>
          <Link href="/login" className="text-sm" style={{ color: 'var(--bb-ink-300)' }}>Entrar</Link>
          <Link
            href="/cadastrar-academia"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#C62828' }}
          >
            Começar Grátis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 mb-1 rounded" style={{ background: 'var(--bb-ink-200)' }} />
          <div className="w-5 h-0.5 mb-1 rounded" style={{ background: 'var(--bb-ink-200)' }} />
          <div className="w-5 h-0.5 rounded" style={{ background: 'var(--bb-ink-200)' }} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden px-4 py-6 space-y-4" style={{ background: 'var(--bb-depth-2)' }}>
          <a href="#funcionalidades" className="block text-sm" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
          <a href="#perfis" className="block text-sm" onClick={() => setMenuOpen(false)}>Perfis</a>
          <a href="#planos" className="block text-sm" onClick={() => setMenuOpen(false)}>Planos</a>
          <a href="#faq" className="block text-sm" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link href="/login" className="block text-sm" onClick={() => setMenuOpen(false)}>Entrar</Link>
          <Link
            href="/cadastrar-academia"
            className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#C62828' }}
          >
            Começar Grátis — 7 Dias
          </Link>
        </div>
      )}
    </nav>
  );
}
```

---

## SEÇÃO 5 — GOOGLE FONT PREMIUM (2 min)

Adicionar fonte display marcante. Opções (escolher UMA):

```html
<!-- Em app/layout.tsx ou via next/font -->
<!-- Opção 1: Outfit (moderna, clean) -->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

<!-- Opção 2: Sora (geométrica, premium) -->
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

<!-- Opção 3: Plus Jakarta Sans (elegante) -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

Aplicar SOMENTE na landing page (não nos shells internos):
```css
.landing-page { font-family: 'Outfit', sans-serif; }
.landing-page h1, .landing-page h2 { font-weight: 800; letter-spacing: -0.02em; }
```

---

## SEÇÃO 6 — WHATSAPP CTA (3 min)

O dono de academia brasileiro resolve tudo por WhatsApp. Adicionar botão flutuante.

```typescript
// components/landing/WhatsAppFAB.tsx
export function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/5531999990000?text=Olá! Quero saber mais sobre o BlackBelt"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      style={{ background: '#25D366' }}
      aria-label="Fale pelo WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.486l4.607-1.209A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.17 0-4.187-.58-5.935-1.593l-.424-.254-2.73.716.73-2.666-.277-.44A9.777 9.777 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/>
      </svg>
    </a>
  );
}
```

**IMPORTANTE:** Trocar `5531999990000` pelo número real do Gregory.

---

## SEÇÃO 7 — PERFORMANCE (5 min)

### 7A. Sem imagens pesadas

A landing NÃO deve carregar nenhuma imagem. Todos os "mockups" são HTML/CSS puro.
Se alguma imagem existir, converter para SVG inline ou remover.

### 7B. Meta tags SEO

```tsx
// No head da landing page
export const metadata = {
  title: 'BlackBelt — Gestão de Academias de Artes Marciais',
  description: 'Check-in, turmas, cobranças e presença para academias de jiu-jitsu, judô, karatê e MMA. 7 dias grátis.',
  keywords: 'gestão academia, artes marciais, jiu jitsu, bjj, check-in, turmas, presença, cobrança',
  openGraph: {
    title: 'BlackBelt — Sua academia funcionando no automático',
    description: 'Check-in, turmas, cobranças e presença. 7 dias grátis.',
    url: 'https://blackbelts.com.br',
    siteName: 'BlackBelt',
    type: 'website',
  },
};
```

### 7C. Verificar load time

```bash
# Após build, verificar size
pnpm build 2>&1 | grep "page\|route\|size" | head -20
```

A landing page (/) deve ser < 100KB gzip. Se maior, há componentes pesados sendo importados.

---

## SEÇÃO 8 — VERIFICAÇÃO E PUSH (5 min)

### 8A. Verificar que a landing é UMA ÚNICA página

```bash
# A landing deve ser UM arquivo
wc -l app/page.tsx 2>/dev/null || wc -l app/\(public\)/page.tsx 2>/dev/null
# Se for muito longa, verificar se tem componentes separados
find components/landing -name "*.tsx" | sort
```

### 8B. Verificar links

Todos os links `#funcionalidades`, `#perfis`, `#planos`, `#faq` devem ter `id` correspondente nas seções.

```bash
grep -n "id=\"funcionalidades\"\|id=\"perfis\"\|id=\"planos\"\|id=\"faq\"" app/page.tsx
# OU no arquivo correto da landing
```

### 8C. Build e push

```bash
pnpm typecheck — ZERO erros
pnpm build — ZERO erros

git add -A
git commit -m "feat: landing page enterprise — hero mockup, pricing transparent, honest testimonials, WhatsApp CTA, fade animations"
git push origin main --force
```

### 8D. Relatório

```
╔═══════════════════════════════════════════════════════════╗
║  BLACKBELT — LANDING PAGE REPORT                         ║
╠═══════════════════════════════════════════════════════════╣

ANTES:
  Duas páginas coladas, hero vago, números falsos,
  sem mockup do produto, pricing escondido

DEPOIS:
  ✅ Uma única página coesa
  ✅ Hero "Sua academia funcionando no automático" (5 segundos)
  ✅ Dashboard mockup HTML/CSS (zero imagens, LCP < 2s)
  ✅ Seção Problema → Solução (dor do dono)
  ✅ 4 mockups do produto (admin, check-in, pais, financeiro)
  ✅ 6 cards de perfis (compacto)
  ✅ 5 planos com pricing transparente
  ✅ Depoimentos honestos (sem números falsos)
  ✅ FAQ accordion (8 perguntas)
  ✅ WhatsApp FAB flutuante
  ✅ Navbar fixa com blur
  ✅ Fonte premium (Outfit/Sora)
  ✅ Fade-in animations (CSS + IntersectionObserver)
  ✅ Mobile-first
  ✅ SEO meta tags

╚═══════════════════════════════════════════════════════════╝
```

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_LANDING.md. Verifique estado: wc -l app/page.tsx 2>/dev/null && find components/landing -name "*.tsx" 2>/dev/null | sort && pnpm typecheck 2>&1 | tail -5. Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

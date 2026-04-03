# BLACKBELT APP — MEGA PROMPT STORE-READY
## 10 Agents Sequenciais: Bugs Críticos → UX → Features → Store Polish
## Data: 02/04/2026 | Repo: GregoryGSPinto/blackbelt-app

---

> **INSTRUÇÕES DE EXECUÇÃO — LEIA ANTES DE COMEÇAR:**
>
> 1. Este prompt tem 10 BLOCOS sequenciais. Execute UM por vez, na ordem.
> 2. Cada bloco termina com: `pnpm typecheck && pnpm build` → commit → push
> 3. Se o build FALHAR: corrija ANTES de avançar. NUNCA pule um bloco.
> 4. Se ficar travado num erro por mais de 5 minutos: anote no commit e siga.
> 5. Cada push no GitHub triggera deploy automático no Vercel.
> 6. REGRAS INVIOLÁVEIS:
>    - NUNCA delete blocos `isMock()` — sempre manter mock + real
>    - `handleServiceError(error)` em todo catch block
>    - CSS: usar `var(--bb-*)` — ZERO cores hardcoded
>    - Toast PT-BR em toda ação do usuário (sucesso e erro)
>    - Skeleton loading + empty states em toda página
>    - Mobile-first: Tailwind responsive, touch targets 44px mínimo
>    - Kids: ZERO mensagens, ZERO financeiro, UI playful
>    - Professor: upload only, sem link pasting
>    - TypeScript strict: ZERO `any`, ZERO `@ts-ignore`
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **REPO:** `https://github.com/GregoryGSPinto/blackbelt-app`
> **DEPLOY:** `https://blackbeltv2.vercel.app`
> **SUPABASE PROJECT:** `tdplmmodmumryzdosmpv`
> **ACADEMY_ID (demo):** `809f2763-0096-4cfa-8057-b5b029cbc62f`
> **BRAND COLOR:** `#C62828`

---

## BLOCO 01 — SESSÃO E PERFIL (Bug Crítico #1 e #2)
### "Meu Perfil" e "Configurações" não abre + Sessão expira

**Problema:** Ao acessar "Meu Perfil" ou "Configurações", a página fica em loading infinito. A sessão expira ao tentar acessar essas páginas. Isso indica que o componente de perfil está fazendo uma chamada que falha silenciosamente (provável: query ao Supabase sem RLS correto, ou o cookie `bb-active-role` / `bb-token` está expirado e o componente não faz fallback para mock).

**Diagnóstico — execute primeiro:**
```bash
# 1. Encontrar TODAS as páginas de perfil e configurações
find app -type f -name "page.tsx" | xargs grep -l -i "perfil\|profile\|configurac\|settings" 2>/dev/null

# 2. Encontrar os services relacionados
find lib/api -type f -name "*.ts" | xargs grep -l -i "perfil\|profile\|configurac\|settings" 2>/dev/null

# 3. Verificar se há fetch de dados sem tratamento de erro
grep -rn "getProfile\|fetchProfile\|getSettings\|fetchSettings\|getUserProfile" app/ components/ lib/ --include="*.ts" --include="*.tsx" | head -30

# 4. Verificar se há useEffect sem cleanup ou sem catch
grep -rn "useEffect" app/ --include="*.tsx" -A 5 | grep -B 2 "getProfile\|fetchProfile\|getSettings" | head -30

# 5. Verificar o AuthContext/SessionContext
grep -rn "AuthContext\|AuthProvider\|SessionContext\|useAuth\|useSession" lib/contexts/ lib/hooks/ --include="*.ts" --include="*.tsx" | head -20

# 6. Verificar o middleware — sessão expirada deve redirecionar, não travar
cat middleware.ts | head -50
```

**Correção — aplique TUDO:**

1. **Em TODA página de perfil/configurações**, garantir este padrão:
```tsx
'use client';
import { useState, useEffect } from 'react';
import { isMock } from '@/lib/api/utils'; // ou onde estiver
import { handleServiceError } from '@/lib/monitoring/service-error'; // ou equivalente

export default function MeuPerfilPage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getProfile(); // service call
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          handleServiceError(err);
          setError('Não foi possível carregar o perfil. Tente novamente.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <EmptyState message="Perfil não encontrado" />;

  return <ProfileContent data={data} />;
}
```

2. **No service de perfil** (`lib/api/profile*.ts` ou similar), garantir:
   - Branch `isMock()` retorna dados mock completos (NUNCA vazio)
   - Branch real tem try/catch com `handleServiceError`
   - Se a query Supabase falha por RLS, o catch NÃO deve travar a UI
   - Timeout de 10 segundos máximo

3. **No AuthContext/Provider**, garantir:
   - Se `getUser()` falha (sessão expirada), limpar cookies e redirecionar para `/login`
   - NUNCA ficar em estado de loading infinito — usar timeout
   - Se `bb-active-role` cookie não existe, redirecionar para `/selecionar-perfil`

4. **Adicionar guard de sessão global** — componente wrapper:
```tsx
// components/shared/SessionGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Se depois de 15s ainda está carregando, sessão morreu
      if (!checked) {
        document.cookie = 'bb-token=; Max-Age=0; path=/';
        document.cookie = 'bb-active-role=; Max-Age=0; path=/';
        router.push('/login');
      }
    }, 15000);
    setChecked(true);
    return () => clearTimeout(timeout);
  }, []);

  return <>{children}</>;
}
```

5. **Na página de configurações**, mesmo padrão: loading → error → empty → content.

**Verificação:**
```bash
# Confirmar que NÃO existe nenhuma página de perfil/config sem tratamento de erro
grep -rn "useEffect" app/ --include="*.tsx" -A 10 | grep -B 5 "getProfile\|fetchProfile\|getSettings\|loadProfile" | grep -v "catch\|handleServiceError" | head -20
# Deve retornar VAZIO

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: perfil e configurações — loading infinito + sessão expirada (#1, #2)"
git push origin main
```

---

## BLOCO 02 — ANALYTICS DE CAMPEONATO (Bug Crítico #3 e #4)
### Botão "Analytics" não funciona + Dados incorretos

**Problema:** O botão "Analytics" de campeonato não faz nada ao clicar. A tela de analytics pode estar com dados incorretos ou quebrada.

**Diagnóstico:**
```bash
# 1. Encontrar o botão de Analytics de campeonato
grep -rn "analytics\|Analytics" app/ components/ --include="*.tsx" | grep -i "campeonat\|championship\|compete\|torneio" | head -20

# 2. Encontrar a página de analytics
find app -path "*campeonat*" -o -path "*championship*" -o -path "*compete*" -o -path "*torneio*" | head -20

# 3. Verificar se o botão tem onClick
grep -rn "Analytics" components/ --include="*.tsx" -B 2 -A 5 | grep -i "onClick\|href\|Link\|router\|push" | head -10

# 4. Verificar o service de analytics de campeonato
find lib/api -type f -name "*.ts" | xargs grep -l -i "analytics\|championship\|compete" 2>/dev/null | head -10

# 5. Verificar se existe rota de analytics
find app -type d -name "analytics" | head -10
```

**Correção:**

1. **Se o botão NÃO tem onClick/href:** Adicionar navegação para a página de analytics:
```tsx
// O botão deve ter:
onClick={() => router.push(`/admin/campeonatos/${campeonatoId}/analytics`)}
// OU se usar Link:
<Link href={`/admin/campeonatos/${campeonatoId}/analytics`}>
```

2. **Se a página de analytics NÃO existe:** Criar página completa:
```
app/(admin)/admin/campeonatos/[id]/analytics/page.tsx
```
Com:
   - Total de inscritos (por categoria, por faixa, por peso)
   - Gráfico de inscrições ao longo do tempo (Recharts LineChart)
   - Taxa de comparecimento (confirmados vs presentes)
   - Receita do campeonato (inscrições pagas)
   - Top academias por número de atletas
   - Distribuição por gênero e faixa etária
   - Status das lutas (pendentes, em andamento, finalizadas)
   - Export para PDF com jsPDF

3. **Se a página EXISTE mas dados estão errados:**
   - Verificar o service: `isMock()` deve retornar dados coerentes
   - Verificar se os cálculos estão corretos (soma, média, contagem)
   - Verificar se os gráficos Recharts recebem dados no formato certo
   - Dados mock devem ter variedade realista (não tudo zerado ou igual)

4. **Mock data para analytics deve ser realista:**
```typescript
// lib/api/championship-analytics.ts (ou nome equivalente)
function getMockAnalytics(championshipId: string): ChampionshipAnalytics {
  return {
    totalInscritos: 87,
    totalConfirmados: 72,
    totalPresentes: 68,
    taxaComparecimento: 94.4,
    receitaTotal: 1305000, // centavos = R$ 13.050
    inscricoesPorDia: [
      { date: '2026-03-01', count: 5 },
      { date: '2026-03-05', count: 12 },
      { date: '2026-03-10', count: 18 },
      { date: '2026-03-15', count: 25 },
      { date: '2026-03-20', count: 15 },
      { date: '2026-03-25', count: 8 },
      { date: '2026-03-28', count: 4 },
    ],
    porCategoria: [
      { categoria: 'Adulto Masculino', count: 34 },
      { categoria: 'Adulto Feminino', count: 18 },
      { categoria: 'Juvenil', count: 22 },
      { categoria: 'Master', count: 13 },
    ],
    porFaixa: [
      { faixa: 'Branca', count: 28 },
      { faixa: 'Azul', count: 22 },
      { faixa: 'Roxa', count: 18 },
      { faixa: 'Marrom', count: 12 },
      { faixa: 'Preta', count: 7 },
    ],
    topAcademias: [
      { nome: 'Guerreiros do Tatame', atletas: 15 },
      { nome: 'Alliance BJJ', atletas: 12 },
      { nome: 'Gracie Barra', atletas: 10 },
      { nome: 'Nova União', atletas: 8 },
      { nome: 'Atos BJJ', atletas: 7 },
    ],
    statusLutas: { pendentes: 12, emAndamento: 0, finalizadas: 45 },
  };
}
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: analytics de campeonato — botão + página + dados (#3, #4)"
git push origin main
```

---

## BLOCO 03 — VER PLANOS + EXTRAIR PDF (Bug Crítico #5 e #6)
### Botão "Ver Planos" dá bug + "Extrair para PDF" não funciona

**Diagnóstico:**
```bash
# 1. Encontrar botão "Ver Planos"
grep -rn "Ver Planos\|verPlanos\|ver-planos\|planos" app/ components/ --include="*.tsx" | grep -i "button\|onClick\|Link\|href" | head -20

# 2. Encontrar a página de planos
find app -path "*planos*" -o -path "*pricing*" -o -path "*plans*" | head -10

# 3. Encontrar funcionalidade de export PDF no dashboard
grep -rn "pdf\|PDF\|exportPdf\|exportToPdf\|html2pdf\|jspdf\|jsPDF" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -30

# 4. Verificar se html2pdf está importado corretamente
grep -rn "html2pdf\|import.*html2pdf\|require.*html2pdf" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -10

# 5. Verificar o dashboard page
find app -type f -name "page.tsx" | xargs grep -l -i "dashboard\|painel" 2>/dev/null | head -10
```

**Correção "Ver Planos":**

1. Identificar para onde o botão navega. Caminhos prováveis:
   - `/precos` (público)
   - `/admin/planos` (admin vê planos da academia)
   - `/superadmin/planos` (superadmin gerencia planos da plataforma)

2. Se o botão aponta para rota que não existe: criar a rota ou corrigir o href.

3. Se a página existe mas dá erro:
   - Verificar se o service tem branch `isMock()` funcional
   - Verificar se os dados de planos estão no formato esperado
   - Os 5 planos devem estar hardcoded no mock:
     - Starter: R$ 97/mês
     - Essencial: R$ 197/mês
     - Pro: R$ 347/mês (mais popular)
     - Black Belt: R$ 597/mês
     - Enterprise: sob consulta

4. Se o erro é de validação de formulário ou query param: corrigir.

**Correção "Extrair para PDF":**

1. **Verificar se `html2pdf.js` está sendo importado dinamicamente:**
```typescript
// CORRETO — import dinâmico (html2pdf não funciona no server-side)
const exportToPdf = async (elementId: string, filename: string) => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Elemento não encontrado para exportação');
      return;
    }
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    
    toast.info('Gerando PDF...');
    await html2pdf().set(opt).from(element).save();
    toast.success('PDF exportado com sucesso!');
  } catch (err) {
    handleServiceError(err);
    toast.error('Erro ao gerar PDF. Tente novamente.');
  }
};
```

2. **O elemento alvo precisa ter um `id`:**
```tsx
<div id="dashboard-content">
  {/* conteúdo do dashboard */}
</div>
<Button onClick={() => exportToPdf('dashboard-content', 'dashboard-blackbelt')}>
  Extrair para PDF
</Button>
```

3. **Se `html2pdf.js` está no package.json mas o import falha:** Verificar se o `html2pdf.js.d.ts` na raiz está correto:
```typescript
// html2pdf.js.d.ts
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
  }
  
  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
    toPdf(): Html2PdfInstance;
    output(type: string): Promise<string>;
  }
  
  export default function html2pdf(): Html2PdfInstance;
}
```

4. **Se preferir jsPDF puro (mais confiável):**
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportDashboardPdf = (dashboardData: DashboardData) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('BlackBelt — Relatório do Dashboard', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Adicionar tabelas com autoTable
    autoTable(doc, {
      startY: 40,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Alunos', String(dashboardData.totalAlunos)],
        ['Alunos Ativos', String(dashboardData.alunosAtivos)],
        ['Taxa de Presença', `${dashboardData.taxaPresenca}%`],
        ['Receita Mensal', `R$ ${(dashboardData.receitaMensal / 100).toFixed(2)}`],
      ],
    });
    
    doc.save('dashboard-blackbelt.pdf');
    toast.success('PDF exportado com sucesso!');
  } catch (err) {
    handleServiceError(err);
    toast.error('Erro ao gerar PDF');
  }
};
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: ver planos + extrair PDF no dashboard (#5, #6)"
git push origin main
```

---

## BLOCO 04 — GERAR LINK (Bug Crítico #7)
### "Gerar Link" não aceita campos preenchidos — valida como vazio

**Problema:** Ao preencher todos os campos do formulário de "Gerar Link" (provavelmente link de convite ou link de inscrição), a validação rejeita como se estivessem vazios. Isso é um bug clássico de formulários React — o state não está sincronizado com o input visível.

**Diagnóstico:**
```bash
# 1. Encontrar o componente/página de "Gerar Link"
grep -rn "Gerar Link\|gerarLink\|gerar-link\|GenerateLink\|InviteLink\|LinkGenerator" app/ components/ --include="*.tsx" | head -20

# 2. Verificar o formulário e validação
grep -rn "Gerar Link" app/ components/ --include="*.tsx" -A 30 | head -60

# 3. Verificar se há controlled/uncontrolled conflict
grep -rn "Gerar Link" app/ components/ --include="*.tsx" -B 5 -A 50 | grep -i "value=\|onChange=\|ref=\|register\|useForm\|useState" | head -20

# 4. Verificar chamada de validação
grep -rn "Gerar Link" app/ components/ --include="*.tsx" -B 5 -A 50 | grep -i "required\|validate\|error\|invalid\|trim\|length" | head -20
```

**Causas prováveis e correções:**

1. **State não atualiza (onChange não funciona):**
```tsx
// ERRADO — value sem onChange ou com onChange que não atualiza
<input value={nome} />

// CORRETO
<input value={nome} onChange={(e) => setNome(e.target.value)} />
```

2. **Validação lê do ref em vez do state:**
```tsx
// ERRADO — mistura controlled (value) com uncontrolled (ref)
const inputRef = useRef<HTMLInputElement>(null);
// ...
if (!inputRef.current?.value) { setError('Campo obrigatório'); }
// Mas o input usa value={state} e o ref.current.value pode estar dessincronizado

// CORRETO — validar pelo state
if (!nome.trim()) { setError('Campo obrigatório'); }
```

3. **Formulário com submit que lê FormData em vez do state:**
```tsx
// ERRADO
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const nome = data.get('nome') as string; // pode ser vazio se o input não tem name
  if (!nome) { toast.error('Preencha o nome'); return; }
};

// CORRETO — se usa state, validar pelo state
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!nome.trim()) { toast.error('Preencha o nome'); return; }
  if (!email.trim()) { toast.error('Preencha o email'); return; }
  // gerar link...
};
```

4. **Input dentro de componente customizado que não propaga onChange:**
   - Verificar se o componente `<Input />` customizado repassa `onChange` e `value`
   - Verificar se não há `defaultValue` conflitando com `value`

5. **Depois de corrigir a validação**, garantir que o link é gerado:
```tsx
const gerarLink = async () => {
  // Validação
  if (!nome.trim() || !tipo) {
    toast.error('Preencha todos os campos obrigatórios');
    return;
  }
  
  try {
    setGenerating(true);
    const link = isMock()
      ? `https://blackbeltv2.vercel.app/convite/${crypto.randomUUID().slice(0, 8)}`
      : await generateInviteLink({ nome, tipo, academyId });
    
    setGeneratedLink(link);
    await navigator.clipboard.writeText(link);
    toast.success('Link gerado e copiado!');
  } catch (err) {
    handleServiceError(err);
    toast.error('Erro ao gerar link');
  } finally {
    setGenerating(false);
  }
};
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: gerar link — validação de formulário rejeita campos preenchidos (#7)"
git push origin main
```

---

## BLOCO 05 — TUTORIAL DUPLICADO (Bug UX #1)
### Tutorial aparecendo duplicado nos perfis

**Problema:** O tutorial/onboarding spotlight aparece mais de uma vez nos mesmos perfis (Admin, Professor, etc).

**Diagnóstico:**
```bash
# 1. Encontrar componentes de tutorial
grep -rn "tutorial\|Tutorial\|onboarding\|Onboarding\|Spotlight\|spotlight\|tour\|Tour\|has_seen_tour\|hasSeenTour" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -30

# 2. Verificar onde o tutorial é renderizado
grep -rn "Tutorial\|Spotlight\|TourProvider\|TutorialProvider" app/ --include="*.tsx" | head -20

# 3. Verificar persistência do flag "já viu"
grep -rn "has_seen_tour\|hasSeenTour\|tutorialSeen\|tourCompleted\|TUTORIAL_SEEN" lib/ components/ --include="*.ts" --include="*.tsx" | head -20
```

**Correção:**

1. **O tutorial deve ser controlado POR PERFIL**, não global:
```tsx
// Chave de storage deve incluir o role
const TUTORIAL_KEY = `bb-tutorial-seen-${activeRole}`;

// Verificar se já viu
const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY) === 'true';

// Marcar como visto
const markTutorialSeen = () => {
  localStorage.setItem(TUTORIAL_KEY, 'true');
  // Se Supabase real, salvar no profiles também:
  if (!isMock()) {
    supabase.from('profiles').update({ has_seen_tour: true }).eq('user_id', userId).eq('role', activeRole);
  }
};
```

2. **Garantir que o componente Tutorial/Spotlight está em apenas UM local:**
   - Deve estar no shell do layout (ex: `AdminShell`, `ProfessorShell`), NÃO em páginas individuais
   - Se aparece em múltiplos shells, garantir que cada um verifica a chave do seu role

3. **Se o tutorial é um componente global** (type `TutorialProvider` no layout root), garantir:
   - Verificação `hasSeenTutorial` antes de renderizar
   - `useEffect` com `[]` (executa UMA vez)
   - Sem re-render que reseta o estado

4. **Remover duplicatas:**
   - Se o mesmo `<Tutorial />` ou `<Spotlight />` está importado em mais de um local dentro do mesmo perfil, remover as duplicatas
   - Manter apenas na shell do role (ex: `components/shell/AdminShell.tsx`)

**Verificação:**
```bash
# Confirmar que não há tutorial duplicado
grep -rn "<Tutorial\|<Spotlight\|<TourProvider\|<OnboardingTour" app/ components/shell/ --include="*.tsx" | sort
# Deve ter no MÁXIMO 1 por shell (Admin, Professor, etc)

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "fix: tutorial duplicado — persistência por perfil + remoção de duplicatas (UX#1)"
git push origin main
```

---

## BLOCO 06 — SUPER ADMIN: PLANOS CUSTOMIZADOS (Feature #1 e #2)
### Criar planos com nome customizado + Exibir planos cadastrados

**Implementação:**

1. **Página `/superadmin/planos`** — se não existe, criar. Se existe, expandir.

```bash
# Verificar o que existe
find app -path "*superadmin*plano*" | head -10
find lib/api -name "*plan*" -o -name "*plano*" | head -10
```

2. **A página deve ter:**
   - Tabela com os planos atuais (Starter, Essencial, Pro, Black Belt, Enterprise)
   - Cada linha mostra: nome, preço, features, status (ativo/inativo), total de academias usando
   - Botão "Criar Novo Plano" abre modal/drawer com:
     - Campo nome (texto livre, max 50 chars) — **ESTE É O PEDIDO DO GREGORY**
     - Preço mensal (em reais, converte para centavos ao salvar)
     - Limites: max alunos, max professores, max turmas, storage GB, tem vídeo, tem IA, tem compete
     - Switch ativo/inativo
   - Editar plano existente (mesmo modal, preenchido)
   - NÃO permitir deletar os 5 planos padrão (apenas desativar)

3. **Service `lib/api/superadmin-plans.ts`** (ou nome existente):
```typescript
export interface PlatformPlan {
  id: string;
  name: string;  // <- nome customizado
  slug: string;
  priceMonthly: number; // centavos
  priceYearly: number; // centavos
  isDefault: boolean; // planos padrão não podem ser deletados
  isActive: boolean;
  limits: {
    maxStudents: number;
    maxProfessors: number;
    maxClasses: number;
    storageGb: number;
    hasVideo: boolean;
    hasAi: boolean;
    hasCompete: boolean;
    hasApi: boolean;
  };
  academiesCount: number; // quantas academias usam
  createdAt: string;
}

// isMock() branch deve retornar os 5 planos padrão + 1 customizado de exemplo
function getMockPlans(): PlatformPlan[] {
  return [
    { id: '1', name: 'Starter', slug: 'starter', priceMonthly: 9700, priceYearly: 97200, isDefault: true, isActive: true, limits: { maxStudents: 50, maxProfessors: 2, maxClasses: 5, storageGb: 1, hasVideo: false, hasAi: false, hasCompete: false, hasApi: false }, academiesCount: 12, createdAt: '2026-01-01' },
    { id: '2', name: 'Essencial', slug: 'essencial', priceMonthly: 19700, priceYearly: 197200, isDefault: true, isActive: true, limits: { maxStudents: 150, maxProfessors: 5, maxClasses: 15, storageGb: 5, hasVideo: false, hasAi: false, hasCompete: true, hasApi: false }, academiesCount: 25, createdAt: '2026-01-01' },
    { id: '3', name: 'Pro', slug: 'pro', priceMonthly: 34700, priceYearly: 347200, isDefault: true, isActive: true, limits: { maxStudents: 500, maxProfessors: 15, maxClasses: 50, storageGb: 20, hasVideo: true, hasAi: true, hasCompete: true, hasApi: true }, academiesCount: 42, createdAt: '2026-01-01' },
    { id: '4', name: 'Black Belt', slug: 'black-belt', priceMonthly: 59700, priceYearly: 597200, isDefault: true, isActive: true, limits: { maxStudents: 2000, maxProfessors: 50, maxClasses: 200, storageGb: 100, hasVideo: true, hasAi: true, hasCompete: true, hasApi: true }, academiesCount: 8, createdAt: '2026-01-01' },
    { id: '5', name: 'Enterprise', slug: 'enterprise', priceMonthly: 0, priceYearly: 0, isDefault: true, isActive: true, limits: { maxStudents: 99999, maxProfessors: 999, maxClasses: 9999, storageGb: 1000, hasVideo: true, hasAi: true, hasCompete: true, hasApi: true }, academiesCount: 2, createdAt: '2026-01-01' },
    { id: '6', name: 'Jiu-Jitsu Plus', slug: 'jiu-jitsu-plus', priceMonthly: 24700, priceYearly: 247200, isDefault: false, isActive: true, limits: { maxStudents: 200, maxProfessors: 8, maxClasses: 25, storageGb: 10, hasVideo: true, hasAi: false, hasCompete: true, hasApi: false }, academiesCount: 3, createdAt: '2026-03-15' },
  ];
}
```

4. **Migration SQL** (próximo número disponível):
```sql
-- Se a tabela de planos já existe, adicionar campo name customizado
-- Se não existe, criar
ALTER TABLE platform_plans ADD COLUMN IF NOT EXISTS custom_name TEXT;
ALTER TABLE platform_plans ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE platform_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: superadmin — planos customizados + painel de planos existentes (F#1, F#2)"
git push origin main
```

---

## BLOCO 07 — DADOS BANCÁRIOS: TIPO DE EMPRESA (Feature #3)
### Adicionar campo "tipo de empresa" com opção "Outro" + seletor

**Diagnóstico:**
```bash
# Encontrar formulário de dados bancários
grep -rn "dados bancários\|dadosBancarios\|banking\|bank\|conta bancária\|conta-bancaria" app/ components/ --include="*.tsx" -i | head -20

# Encontrar o service
grep -rn "banking\|bank\|dadosBancarios" lib/api/ --include="*.ts" | head -10

# Verificar types
grep -rn "BankingData\|DadosBancarios\|CompanyType\|TipoEmpresa" lib/types/ --include="*.ts" | head -10
```

**Implementação:**

1. **Adicionar enum de tipo de empresa no types:**
```typescript
export const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI — Microempreendedor Individual' },
  { value: 'me', label: 'ME — Microempresa' },
  { value: 'epp', label: 'EPP — Empresa de Pequeno Porte' },
  { value: 'ltda', label: 'LTDA — Sociedade Limitada' },
  { value: 'sa', label: 'S/A — Sociedade Anônima' },
  { value: 'eireli', label: 'EIRELI' },
  { value: 'slu', label: 'SLU — Sociedade Limitada Unipessoal' },
  { value: 'associacao', label: 'Associação' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'pessoa_fisica', label: 'Pessoa Física (CPF)' },
  { value: 'outro', label: 'Outro' },
] as const;
```

2. **No formulário de dados bancários, adicionar:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Tipo de Empresa</label>
  <select
    value={companyType}
    onChange={(e) => setCompanyType(e.target.value)}
    className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm"
  >
    <option value="">Selecione o tipo...</option>
    {COMPANY_TYPES.map((t) => (
      <option key={t.value} value={t.value}>{t.label}</option>
    ))}
  </select>
  
  {companyType === 'outro' && (
    <input
      type="text"
      value={companyTypeOther}
      onChange={(e) => setCompanyTypeOther(e.target.value)}
      placeholder="Especifique o tipo de empresa..."
      className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm mt-2"
    />
  )}
</div>
```

3. **Migration:**
```sql
ALTER TABLE academies ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'mei';
ALTER TABLE academies ADD COLUMN IF NOT EXISTS company_type_other TEXT;
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: dados bancários — tipo de empresa com opção Outro (F#3)"
git push origin main
```

---

## BLOCO 08 — CADASTRO DE ALUNOS APROFUNDADO (Feature #4)
### Incluir forma de pagamento, dia de vencimento e demais dados

**Diagnóstico:**
```bash
# Encontrar formulário de cadastro de aluno
grep -rn "cadastro.*aluno\|StudentForm\|AlunoForm\|createStudent\|createAluno\|novoAluno\|novo-aluno" app/ components/ --include="*.tsx" -i | head -20

# Encontrar modal/drawer de novo aluno
grep -rn "NovoAluno\|NewStudent\|AddStudent\|CadastroAluno" components/ --include="*.tsx" | head -10

# Ver os campos atuais
grep -rn "matricula\|enrollment" lib/types/ --include="*.ts" | head -10
```

**Implementação — adicionar ao formulário de cadastro/edição de aluno:**

1. **Seção "Dados Financeiros" no formulário:**
```tsx
{/* === SEÇÃO FINANCEIRA === */}
<div className="border-t border-[var(--bb-depth-1)] pt-6 mt-6">
  <h3 className="text-lg font-semibold text-[var(--bb-ink-1)] mb-4">Dados Financeiros</h3>
  
  {/* Forma de Pagamento */}
  <div className="space-y-2">
    <label className="text-sm font-medium">Forma de Pagamento</label>
    <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}
      className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm">
      <option value="">Selecione...</option>
      <option value="particular">Particular (Boleto/Pix)</option>
      <option value="gympass">GymPass</option>
      <option value="totalpass">TotalPass</option>
      <option value="smartfit">Smart Fit</option>
      <option value="cortesia">Cortesia</option>
      <option value="funcionario">Funcionário</option>
      <option value="bolsista">Bolsista</option>
      <option value="avulso">Avulso (Aula Avulsa)</option>
    </select>
  </div>
  
  {/* Dia de Vencimento — só aparece se forma é "particular" */}
  {formaPagamento === 'particular' && (
    <div className="space-y-2 mt-4">
      <label className="text-sm font-medium">Dia de Vencimento</label>
      <select value={diaVencimento} onChange={(e) => setDiaVencimento(Number(e.target.value))}
        className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm">
        <option value={0}>Selecione o dia...</option>
        {[1,5,10,15,20,25].map(d => (
          <option key={d} value={d}>Dia {d}</option>
        ))}
      </select>
    </div>
  )}
  
  {/* Valor da Mensalidade — só para particular */}
  {formaPagamento === 'particular' && (
    <div className="space-y-2 mt-4">
      <label className="text-sm font-medium">Valor da Mensalidade (R$)</label>
      <input type="number" step="0.01" min="0"
        value={valorMensalidade}
        onChange={(e) => setValorMensalidade(e.target.value)}
        placeholder="Ex: 149.90"
        className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm"
      />
    </div>
  )}
  
  {/* Plano do Aluno */}
  <div className="space-y-2 mt-4">
    <label className="text-sm font-medium">Plano</label>
    <select value={planoAluno} onChange={(e) => setPlanoAluno(e.target.value)}
      className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm">
      <option value="">Selecione...</option>
      <option value="mensal">Mensal</option>
      <option value="trimestral">Trimestral</option>
      <option value="semestral">Semestral</option>
      <option value="anual">Anual</option>
    </select>
  </div>
  
  {/* Status Financeiro */}
  <div className="space-y-2 mt-4">
    <label className="text-sm font-medium">Status Financeiro</label>
    <select value={statusFinanceiro} onChange={(e) => setStatusFinanceiro(e.target.value)}
      className="w-full rounded-lg border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-3 text-sm">
      <option value="em_dia">Em dia</option>
      <option value="pendente">Pendente</option>
      <option value="inadimplente">Inadimplente</option>
      <option value="isento">Isento</option>
    </select>
  </div>
</div>
```

2. **No service e type, adicionar os campos:**
```typescript
interface StudentFinancialData {
  paymentMethod: 'particular' | 'gympass' | 'totalpass' | 'smartfit' | 'cortesia' | 'funcionario' | 'bolsista' | 'avulso';
  dueDay?: number; // 1-28
  monthlyFee?: number; // centavos
  plan?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  financialStatus: 'em_dia' | 'pendente' | 'inadimplente' | 'isento';
}
```

3. **Migration:**
```sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'particular';
ALTER TABLE students ADD COLUMN IF NOT EXISTS due_day INTEGER DEFAULT 10;
ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_fee INTEGER; -- centavos
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_plan TEXT DEFAULT 'mensal';
ALTER TABLE students ADD COLUMN IF NOT EXISTS financial_status TEXT DEFAULT 'em_dia';
```

4. **No dashboard do aluno**, esses dados devem ser visíveis (read-only para o aluno).

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: cadastro de alunos aprofundado — pagamento, vencimento, plano (F#4)"
git push origin main
```

---

## BLOCO 09 — TICKETS + CATRACA (Pesquisa #1 e #2)
### Documentar decisão sobre Tickets + Pesquisa de APIs de catraca

**Para Tickets:**
```bash
# Verificar se existe sistema de tickets
grep -rn "ticket\|Ticket\|support-ticket\|suporte-ticket" app/ components/ lib/ --include="*.tsx" --include="*.ts" | head -20
find app -path "*ticket*" | head -10
```

Se EXISTE:
- Documentar o que faz em `docs/TICKETS_SYSTEM.md`
- Garantir que está acessível e funcional no perfil correto (Admin? SuperAdmin?)
- Se está incompleto/mock, documentar o que falta

Se NÃO EXISTE:
- Criar `docs/TICKETS_SYSTEM.md` com decisão: "Sistema de tickets planejado para v5.0 — não é escopo de lançamento"

**Para Catraca — Criar documento de pesquisa:**

```bash
cat > docs/INTEGRACAO_CATRACA.md << 'DOC'
# Integração com Catraca/Roleta de Entrada
## Status: PESQUISA — Não implementado

## APIs Pesquisadas

### 1. Henry (henry.com.br)
- **Modelos:** Orion, Primme, Nova
- **Comunicação:** API REST + TCP/IP
- **Integração:** Via Henry Cloud API ou SDK local
- **Abordagem:** Webhook de check-in → libera catraca via API
- **Complexidade:** Média — requer servidor local para comunicação TCP com a catraca

### 2. Topdata (topdata.com.br)
- **Modelos:** Inner Acesso, Top Flex
- **Comunicação:** API REST + DLL/SDK Windows
- **Integração:** TopConnect Cloud API
- **Abordagem:** QR Code do aluno lido pela catraca → valida via API BlackBelt
- **Complexidade:** Média — documentação limitada

### 3. Control iD (controlid.com.br)
- **Modelos:** iDBlock, iDFace, iDUHF
- **Comunicação:** API REST nativa (melhor documentação)
- **Integração:** Control iD Cloud + API local
- **Abordagem:** Biometria/QR na catraca → webhook → BlackBelt valida → libera
- **Complexidade:** Baixa/Média — API REST bem documentada

### 4. Intelbras (intelbras.com.br)
- **Modelos:** SS 3530, SS 5530
- **Comunicação:** API REST + MQTT
- **Integração:** Intelbras Cloud API
- **Abordagem:** Similar ao Control iD
- **Complexidade:** Média

## Abordagem Recomendada

1. **Fase 1 (v5.x):** Integração genérica via webhook
   - BlackBelt expõe endpoint `/api/checkin/validate`
   - Catraca envia request com QR code/biometria
   - BlackBelt responde com liberação ou bloqueio
   - Compatível com qualquer fabricante que suporte webhooks

2. **Fase 2 (v6.x):** SDKs específicos por fabricante
   - Control iD primeiro (melhor API)
   - Henry segundo (mais instalado no Brasil)

## Estimativa: 2-4 semanas de desenvolvimento para Fase 1
DOC
```

**Verificação:**
```bash
pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "docs: sistema de tickets + pesquisa integração catraca (P#1, P#2)"
git push origin main
```

---

## BLOCO 10 — STORE POLISH FINAL + TAG
### Limpeza, verificações finais, e tag de release

**Checklist final:**
```bash
# 1. ZERO erros TypeScript
pnpm typecheck 2>&1 | tail -5

# 2. Build limpo
pnpm build 2>&1 | tail -10

# 3. ZERO TODOs/FIXMEs em código de produção
grep -rn "TODO\|FIXME\|HACK\|XXX" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v "test-" | head -20

# 4. ZERO console.log em produção (exceto em dev/test)
grep -rn "console\.log\|console\.warn\|console\.error" app/ components/ --include="*.tsx" | grep -v "// debug\|// TODO\|handleServiceError\|monitoring\|logger" | head -20

# 5. ZERO any em TypeScript
grep -rn ": any\|as any" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".d.ts" | grep -v "test" | head -20

# 6. Verificar que /privacidade-menores está no PUBLIC_PATHS
grep "privacidade-menores" middleware.ts

# 7. Verificar que todas as URLs públicas retornam 200
echo "Verificar manualmente no browser:"
echo "  https://blackbeltv2.vercel.app/login"
echo "  https://blackbeltv2.vercel.app/privacidade"
echo "  https://blackbeltv2.vercel.app/termos"
echo "  https://blackbeltv2.vercel.app/excluir-conta"
echo "  https://blackbeltv2.vercel.app/contato"
echo "  https://blackbeltv2.vercel.app/privacidade-menores"

# 8. Verificar referência Apple Watch
grep -rn "Apple Watch\|apple watch\|watchOS" app/ components/ --include="*.tsx" | head -5
# Se encontrar: substituir por linguagem genérica ("dispositivos wearable" ou remover)

# 9. Limpar console.logs desnecessários
find app components -name "*.tsx" -exec grep -l "console.log" {} \; | while read f; do
  echo "⚠️  console.log em: $f"
done

# 10. Verificar imports não utilizados (se ESLint pegar)
pnpm lint 2>&1 | grep -i "unused\|no-unused" | head -10
```

**Correções finais:**

1. **Se há `console.log` em produção:** Substituir por `logger.debug()` ou remover
2. **Se há `any`:** Tipar corretamente
3. **Se há TODOs:** Resolver ou mover para `docs/BACKLOG.md`
4. **Apple Watch:** Se referenciado sem integração real, mudar para linguagem genérica
5. **Lint warnings:** Corrigir os mais graves

**Tag de release:**
```bash
git add -A && git commit -m "chore: store polish final — limpeza, verificações, documentação"
git push origin main

# Tag
git tag -a v5.0.0-store-ready -m "BlackBelt App v5.0.0 — Store Ready
- fix: perfil/configurações loading infinito
- fix: sessão expirada com recovery
- fix: analytics de campeonato completo
- fix: ver planos funcional
- fix: export PDF no dashboard
- fix: gerar link validação de formulário
- fix: tutorial duplicado por perfil
- feat: planos customizados no SuperAdmin
- feat: tipo de empresa nos dados bancários
- feat: cadastro de alunos com dados financeiros
- docs: sistema de tickets + integração catraca
- chore: store polish, zero TODOs, zero console.logs"

git push origin v5.0.0-store-ready
```

**Relatório final — criar:**
```bash
cat > docs/STORE_READY_REPORT_v5.md << 'REPORT'
# BlackBelt App — Store Ready Report v5.0.0
## Data: $(date +%Y-%m-%d)

### Bugs Críticos Resolvidos
| # | Bug | Status |
|---|-----|--------|
| 1 | Meu Perfil loading infinito | ✅ Resolvido |
| 2 | Sessão expira em Meu Perfil | ✅ Resolvido |
| 3 | Botão Analytics campeonato | ✅ Resolvido |
| 4 | Analytics dados incorretos | ✅ Resolvido |
| 5 | Ver Planos bug | ✅ Resolvido |
| 6 | Extrair PDF dashboard | ✅ Resolvido |
| 7 | Gerar Link validação | ✅ Resolvido |

### Bugs UX Resolvidos
| # | Bug | Status |
|---|-----|--------|
| 1 | Tutorial duplicado | ✅ Resolvido |

### Features Implementadas
| # | Feature | Status |
|---|---------|--------|
| 1 | Planos customizados SuperAdmin | ✅ Implementado |
| 2 | Painel planos existentes | ✅ Implementado |
| 3 | Tipo de empresa dados bancários | ✅ Implementado |
| 4 | Cadastro alunos com financeiro | ✅ Implementado |

### Pesquisa/Documentação
| # | Item | Status |
|---|------|--------|
| 1 | Sistema de Tickets | ✅ Documentado |
| 2 | Integração Catraca | ✅ Pesquisado |

### Próximos Passos (Gregory)
1. Criar conta Apple Developer ($99/ano)
2. Criar conta Google Play Console ($25)
3. Testar em dispositivo real (iPhone + Android)
4. Gerar feature graphic 1024x500 para Google Play
5. Preencher formulários nos consoles (Age Rating, Privacy Labels, Data Safety)
6. Configurar Asaas sandbox para pagamentos reais
7. Configurar Resend para emails transacionais
8. Beta com 2 academias interessadas
REPORT
```

```bash
git add -A && git commit -m "docs: store ready report v5.0.0"
git push origin main
```

---

## COMANDO DE RETOMADA

Se o Claude Code parar no meio da execução, cole este comando para retomar:

```
Retome a execução do MEGA PROMPT STORE-READY do BlackBelt App. Verifique qual foi o último commit com `git log --oneline -5` e identifique qual BLOCO foi o último completado. Continue a partir do próximo BLOCO seguindo TODAS as regras do prompt original. Lembre-se: pnpm typecheck && pnpm build → commit → push entre cada bloco. NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR. handleServiceError em todo catch.
```

---

## FIM DO MEGA PROMPT

# BLACKBELT v2 — REVISÃO ENTERPRISE: MATURIDADE DE 20 ANOS
## 9 Agentes Especializados — Um Por Perfil — Benchmark Internacional

> **CONTEXTO:** O BlackBelt v2 compete com Zen Planner ($99-299/mês, 300+ academias),
> Mindbody (líder global), Tecnofit (16.000 negócios no Brasil), ABC Evo, iDojo, SYSMMA,
> Kicksite, e IBLACKBELT. Para ter maturidade de 20 anos de mercado, CADA perfil precisa
> das ferramentas que esses líderes oferecem — e mais.
>
> **MÉTODO:** 9 agentes, um por perfil, na ordem hierárquica.
> Cada agente: audita o que existe → compara com benchmark → lista o que falta →
> corrige/cria o que é essencial → commita.
>
> **PRINCÍPIO:** Não é sobre ter 500 páginas. É sobre cada página que EXISTE funcionar
> perfeitamente para o uso DIÁRIO. Um dono de academia que abre o app às 7h da manhã
> precisa ver em 3 segundos: quem veio hoje, quem deve, quem está sumido.

---

## PRÉ-EXECUÇÃO: INVENTÁRIO COMPLETO

```bash
echo "═══════════════════════════════════════════════════"
echo "INVENTÁRIO ENTERPRISE — $(date)"
echo "═══════════════════════════════════════════════════"

set -a && source .env.local 2>/dev/null && set +a

# Contar tudo
echo "Páginas: $(find app -name 'page.tsx' | wc -l)"
echo "Componentes: $(find components -name '*.tsx' | wc -l)"
echo "Services: $(find lib/api -name '*.ts' 2>/dev/null | wc -l)"
echo "Migrations: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l)"

# Para CADA perfil: listar páginas, sidebar items, e rotas funcionais
for ROLE_DIR in superadmin admin professor recepcao main teen kids parent franqueador; do
  echo ""
  echo "═══ $ROLE_DIR ═══"
  PAGES=$(find app -path "*${ROLE_DIR}*" -name 'page.tsx' 2>/dev/null | wc -l)
  echo "  Páginas: $PAGES"
  find app -path "*${ROLE_DIR}*" -name 'page.tsx' 2>/dev/null | sort
done

# Tabelas no Supabase
echo ""
echo "═══ SUPABASE ═══"
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  TABLE_COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,dict) else '?')" 2>/dev/null)
  echo "  Tabelas: $TABLE_COUNT"
fi
```

Salvar em `docs/review/enterprise-inventory.md` e commitar.

---

## AGENTE 1 — SUPER ADMIN (Gregory — CEO da Plataforma)

**Benchmark:** Painel de SaaS multi-tenant tipo Stripe Dashboard, Paddle, ChartMogul.

**O Super Admin precisa ver e fazer DIARIAMENTE:**

### Checklist de funcionalidades:

```
DASHBOARD (Mission Control):
□ MRR (Receita Recorrente Mensal) em tempo real
□ ARR (Receita Anual)
□ Número de academias ativas vs inativas vs trial
□ Churn rate (academias que cancelaram)
□ Gráfico MRR últimos 12 meses
□ Novas academias vs churn (gráfico comparativo)
□ Top 5 academias por receita
□ Academias em risco (trial expirando, uso baixo)
□ Ticket médio
□ Alunos totais na plataforma

ACADEMIAS:
□ Lista com filtros (status, plano, cidade, modalidade)
□ Detalhe da academia (dados, plano, uso, membros, receita)
□ Alterar plano da academia
□ Suspender / reativar academia
□ Impersonar (logar como admin da academia)
□ Histórico de mudanças (audit log)

PLANOS:
□ CRUD de planos (Starter R$79 até Enterprise)
□ Editar preços, limites, features
□ Ver distribuição de academias por plano

FINANCEIRO:
□ Receita por plano
□ Inadimplência de academias (quem não pagou a plataforma)
□ Projeção de receita

ONBOARDING:
□ Gerar link de cadastro para nova academia
□ Ver academias em trial (quantos dias faltam)
□ Ver funil: lead → trial → pago → churn

SUPORTE:
□ Tickets de suporte das academias
□ Status de tickets (aberto, em andamento, resolvido)

COMPETE (Campeonatos):
□ Aprovar campeonatos criados por academias
□ Ver campeonatos pendentes de aprovação

COMUNICAÇÃO:
□ Enviar comunicado para TODAS as academias
□ Enviar comunicado para academias específicas (por plano, cidade)
```

### Auditar e corrigir:

```bash
echo "=== SUPER ADMIN ==="
find app/(superadmin) -name 'page.tsx' | sort

# Para cada página: verificar se carrega dados reais
for PAGE in $(find app/(superadmin) -name 'page.tsx' | sort); do
  echo "--- $PAGE ---"
  # Verificar se usa isMock ou dados reais
  grep -c "isMock\|mock\|Mock\|MOCK" "$PAGE" 2>/dev/null
  # Verificar se tem loading state
  grep -c "loading\|Loading\|skeleton\|Skeleton" "$PAGE" 2>/dev/null
  # Verificar se tem empty state
  grep -c "empty\|Empty\|Nenhum\|nenhum" "$PAGE" 2>/dev/null
done
```

Para cada página que está em mock ou vazia → verificar se o service faz query real → se a tabela existe no Supabase → corrigir.

**FOCO:** As 5 páginas mais importantes do Super Admin devem funcionar com dados reais:
1. Dashboard/Mission Control — KPIs reais
2. Academias — lista real com dados reais
3. Planos — CRUD funcional
4. Receita — números reais
5. Pipeline — funil real

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(superadmin): audit + fix — dashboard KPIs, academias, planos, receita"
```

---

## AGENTE 2 — ADMIN / OWNER (Dono da Academia)

**Benchmark:** Zen Planner + Tecnofit + iDojo. O dono é o usuário MAIS IMPORTANTE — se ele não gostar, cancela.

**O Dono precisa ver às 7h da manhã:**

### Checklist:

```
DASHBOARD:
□ Bom dia, [Nome]. Hoje é [dia].
□ Alunos ativos (número)
□ Presença hoje (check-ins)
□ Inadimplentes (número com badge vermelho)
□ Receita do mês (realizado vs previsto)
□ Aulas de hoje (lista com professor, horário, alunos/vagas)
□ Atividade recente (últimos check-ins, pagamentos)
□ Alunos em risco (sem treinar há 14+ dias)
□ Aniversariantes da semana

ALUNOS:
□ Lista com foto, nome, faixa, plano, status pagamento
□ Filtros: faixa, turma, status (ativo/inativo/trial), tipo vínculo
□ Busca por nome
□ Cadastro novo aluno (dados pessoais + financeiro + turma)
□ Editar aluno (todos os campos)
□ Ver perfil completo (presenças, pagamentos, graduações, avaliações)
□ Ações em massa (enviar mensagem, gerar cobrança)
□ Exportar CSV

TURMAS:
□ Lista de turmas (nome, modalidade, professor, horário, alunos matriculados)
□ Criar/editar/excluir turma
□ Grade de horários visual (calendário semanal)
□ Matrícula de aluno na turma

FINANCEIRO:
□ Resumo: recebido, pendente, atrasado, previsto
□ Por tipo de vínculo (particular, gympass, cortesia, etc.)
□ Lista de faturas com filtros (mês, status, tipo)
□ Gerar faturas do mês
□ Dar baixa manual
□ Cobrar via Asaas (quando configurado)
□ Exportar relatório financeiro

PRESENÇA:
□ Check-ins de hoje por turma
□ Histórico de presença por aluno
□ Relatório de presença por período
□ Taxa de presença por turma

GRADUAÇÕES:
□ Alunos por faixa (dashboard visual)
□ Alunos elegíveis para promoção (presença mínima atingida)
□ Registrar graduação (de-para, data, professor que avaliou)
□ Histórico de graduações

COMUNICAÇÃO:
□ Enviar mensagem para turma
□ Enviar mensagem para aluno individual
□ Enviar mensagem para todos
□ Templates de mensagem (cobrança, lembrete, parabéns)

CONVITES:
□ Gerar link de convite (para aluno se cadastrar)
□ Ver convites pendentes
□ Aula experimental (link público)

CONFIGURAÇÕES:
□ Dados da academia (nome, endereço, CNPJ, logo)
□ Horário de funcionamento
□ Modalidades oferecidas
□ Configurar dia de vencimento padrão
□ Configurar mínimo GymPass check-ins
□ Dados bancários (para receber)

RELATÓRIOS:
□ Alunos ativos vs inativos (gráfico)
□ Receita mensal (gráfico últimos 12 meses)
□ Presença média por turma
□ Retenção (quem renovou vs quem cancelou)
□ Alunos novos vs cancelados por mês

MEU PLANO (SaaS):
□ Ver plano atual (Starter/Essencial/Pro/BlackBelt)
□ Ver uso (alunos/professores/unidades vs limite)
□ Ver faturas da plataforma
□ Upgrade/downgrade
```

### Auditar e corrigir:

Para CADA item do checklist → verificar se existe página + se funciona + se tem dados reais.
Se não existe → criar página mínima funcional.
Se existe mas não funciona → corrigir service/query.
Se funciona com mock → migrar para real se tabela existe.

**PRIORIDADE (usar todos os dias):**
1. Dashboard com dados reais
2. Lista de alunos com status financeiro
3. Financeiro com resumo e faturas
4. Presença / check-ins
5. Turmas

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(admin): audit + fix — dashboard, alunos, financeiro, presença, turmas"
```

---

## AGENTE 3 — PROFESSOR

**Benchmark:** Zen Planner Staff App, Tecnofit Professor.

**O Professor precisa ao chegar na academia:**

### Checklist:

```
DASHBOARD:
□ Bom dia, [Nome]. Hoje você tem [N] aulas.
□ Aulas de hoje (horário, turma, alunos inscritos/capacidade)
□ Aula atual ou próxima destacada
□ Alunos ativos totais
□ Avaliações pendentes

CHAMADA (Presença):
□ Selecionar turma/aula
□ Lista de alunos matriculados com checkbox
□ Marcar presença individual
□ Marcar todos presentes / ausentes
□ Ver quem já fez check-in (auto-checkin do aluno)
□ Salvar chamada → registra check-ins em batch

TURMAS:
□ Ver minhas turmas (lista)
□ Ver alunos por turma
□ Grade de horários

ALUNOS:
□ Ver perfil do aluno (presenças, faixa, avaliações)
□ Buscar aluno por nome

AVALIAÇÕES:
□ Avaliar aluno (técnica, disciplina, presença — notas)
□ Registrar observações
□ Ver histórico de avaliações

CONTEÚDO:
□ Upload de vídeo (Bunny Stream)
□ Ver biblioteca de vídeos
□ Compartilhar vídeo com turma

GRADUAÇÕES:
□ Ver alunos elegíveis (presença mínima + avaliação positiva)
□ Sugerir promoção de faixa ao admin

PERFIL:
□ Editar dados pessoais
□ Especialidades, CREF, certificações
```

### Auditar e corrigir:

Verificar CADA funcionalidade do checklist no ProfessorShell + páginas do professor.

**PRIORIDADE:**
1. Dashboard com aulas de hoje (dados reais)
2. Chamada funcional (check-in em batch por turma)
3. Lista de alunos com perfil
4. Avaliações

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(professor): audit + fix — dashboard, chamada, alunos, avaliações"
```

---

## AGENTE 4 — RECEPCIONISTA

**Benchmark:** Tecnofit Recepção, ABC Evo Totem.

### Checklist:

```
DASHBOARD:
□ Alunos esperados hoje (por turma/horário)
□ Check-ins realizados hoje
□ Últimos check-ins (feed em tempo real)
□ Aniversariantes de hoje
□ Inadimplentes (lista rápida — quem não pode entrar?)

CHECK-IN:
□ Buscar aluno por nome → fazer check-in
□ Check-in por QR Code (ler QR do aluno)
□ Verificar se aluno está em dia antes do check-in
□ Aviso visual se inadimplente (borda vermelha)

ALUNOS:
□ Cadastrar novo aluno (dados básicos + turma)
□ Buscar aluno
□ Ver informações básicas (plano, vencimento, turma)
□ NÃO pode editar dados financeiros (só admin)

COBRANÇAS:
□ Gerar cobrança avulsa (aula experimental, loja)
□ Registrar pagamento em dinheiro/PIX

MENSAGENS:
□ Enviar WhatsApp de lembrete (link direto)
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(recepcao): audit + fix — dashboard, checkin, cadastro, cobranças"
```

---

## AGENTE 5 — ALUNO ADULTO

**Benchmark:** Zen Planner Member App, Tecnofit App do Aluno.

### Checklist:

```
DASHBOARD:
□ Saudação personalizada
□ Próxima aula (horário, turma, professor)
□ Streak de presença (🔥 12 dias)
□ Faixa atual + progresso para próxima
□ Conquistas recentes
□ Avisos da academia

CHECK-IN:
□ Botão grande "FAZER CHECK-IN" (se tem aula agora)
□ Histórico de check-ins (calendário com dias marcados)

MINHAS AULAS:
□ Turmas matriculadas
□ Grade de horários
□ Cancelar aula (se permitido)

PERFIL:
□ Dados pessoais
□ Faixa e histórico de graduações
□ Peso, altura, objetivo, lesões

FINANCEIRO:
□ Minhas faturas (pago, pendente, atrasado)
□ Plano atual
□ Contrato

BIBLIOTECA:
□ Vídeos de técnicas
□ Filtrar por faixa/modalidade

RANKING:
□ Posição no ranking da academia
□ Comparação com outros alunos (presença, XP)

CONQUISTAS:
□ Badges conquistados
□ Próximos badges (quanto falta)
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(aluno-adulto): audit + fix — dashboard, checkin, financeiro, ranking"
```

---

## AGENTE 6 — ALUNO TEEN (Gamificação)

**Benchmark:** Duolingo + Zen Planner + elementos de jogos.

### Checklist (tudo do adulto +):

```
GAMIFICAÇÃO:
□ XP total + nível atual
□ Barra de progresso para próximo nível
□ Missões diárias/semanais (treinar 3x, assistir vídeo, etc.)
□ Ranking entre teens da academia
□ Conquistas/badges com visual chamativo
□ Streak com visual de fogo (🔥)

VISUAL:
□ UI mais vibrante que o adulto (cor default rosa/personalizado)
□ Animações sutis em conquistas
□ Avatar customizável (ou iniciais com cor de destaque)

RESPONSÁVEL VINCULADO:
□ Ver quem é seu responsável (readonly)
□ Notificações vão para o responsável também
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(teen): audit + fix — gamificação, missões, ranking, visual vibrante"
```

---

## AGENTE 7 — ALUNO KIDS (Simplificado e Divertido)

**Benchmark:** Khan Academy Kids, ABCmouse — UI para crianças.

### Checklist:

```
VISUAL:
□ UI grande, colorida, com ícones grandes
□ Fonte maior, menos texto
□ Emojis e animações
□ Sem botões perigosos (excluir conta, pagamento, etc.)
□ Sem chat/mensagens (COPPA compliance)

CONTEÚDO:
□ Estrelas acumuladas (presença = estrela)
□ Figurinhas/badges colecionáveis
□ Evolução visual da faixa (com animação)
□ Mural de conquistas

NÃO DEVE TER:
□ Financeiro
□ Configurações avançadas
□ Chat/mensagens diretas
□ Zona de perigo / excluir conta
□ Alterar senha (responsável gerencia)
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(kids): audit + fix — UI divertida, estrelas, figurinhas, sem features adultas"
```

---

## AGENTE 8 — RESPONSÁVEL (Pai/Mãe)

**Benchmark:** Zen Planner Parent Portal, ClassDojo Parents.

### Checklist:

```
DASHBOARD:
□ Cards por filho: nome, faixa, presença hoje, streak
□ Alerta se filho não foi à academia essa semana
□ Próximas aulas dos filhos
□ Pagamentos consolidados

PRÉ-CHECK-IN:
□ Selecionar filho
□ Ver próximas aulas do filho
□ Agendar presença (pré-check-in)
□ Ver pré-check-ins agendados
□ Cancelar pré-check-in

CHECK-IN:
□ Fazer check-in do filho (quando leva à academia)
□ Ver se filho já fez check-in hoje
□ Histórico de presenças por filho

FINANCEIRO:
□ Faturas dos filhos (consolidado)
□ Status de pagamento por filho
□ Histórico de pagamentos

EVOLUÇÃO:
□ Faixa atual de cada filho
□ Histórico de graduações
□ Avaliações do professor
□ Notas/observações

COMUNICAÇÃO:
□ Mensagens da academia
□ Avisos dos professores
□ Relatório de presença semanal (automático)

CONTROLES PARENTAIS:
□ Definir horários permitidos de acesso (teen)
□ Ver atividade do filho no app
□ Aprovar participação em eventos
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "review(responsavel): audit + fix — dashboard filhos, checkin, financeiro, evolução"
```

---

## AGENTE 9 — FRANQUEADOR + VALIDAÇÃO FINAL

### 9A — Franqueador

```
DASHBOARD:
□ Visão consolidada de todas as academias da rede
□ Receita total vs por unidade
□ Alunos totais vs por unidade
□ Ranking de academias (por receita, presença, satisfação)
□ Compliance (todas seguindo padrões?)

ACADEMIAS:
□ Lista de academias da rede
□ Comparativo entre academias
□ Alertas de performance baixa
```

### 9B — Validação Final Cruzada

```bash
echo "═══════════════════════════════════════════════════"
echo "VALIDAÇÃO FINAL — MATURIDADE 20 ANOS"
echo "═══════════════════════════════════════════════════"

# 1. Zero 404s
echo "=== ZERO 404s ==="
grep -rn "href=" components/shell/ --include='*.tsx' | grep -oP "href=['\"]([^'\"]+)" | sed "s/href=['\"]//g" | sort -u | while read route; do
  page=$(find app -path "*${route}*page.tsx" 2>/dev/null | head -1)
  [ -z "$page" ] && echo "  ❌ $route"
done

# 2. Zero botões sem ação
echo ""
echo "=== BOTÕES SEM AÇÃO ==="
grep -rn '<button\|<Button' app/ --include='*.tsx' | grep -v 'onClick\|disabled\|type="submit"\|href\|node_modules\|.next' | wc -l
echo "botões sem onClick (deve ser 0 ou poucos)"

# 3. Zero loading infinito
echo ""
echo "=== LOADING SEM FINALLY ==="
for f in $(grep -rl 'setLoading\|setIsLoading' app/ --include='*.tsx'); do
  has_finally=$(grep -c 'finally' "$f")
  has_loading=$(grep -c 'setLoading\|setIsLoading' "$f")
  if [ "$has_loading" -gt 0 ] && [ "$has_finally" -eq 0 ]; then
    echo "  ⚠️ $f"
  fi
done

# 4. Zero inglês na UI
echo ""
echo "=== INGLÊS NA UI ==="
grep -rn '"Save"\|"Cancel"\|"Delete"\|"Edit"\|"Loading"\|"Error"\|"Submit"\|"Close"' app/ components/ --include='*.tsx' | grep -v 'import\|console\|type\|interface\|//' | wc -l
echo "ocorrências (deve ser 0)"

# 5. Todos os perfis têm sidebar + header + busca + notificação + sair
echo ""
echo "=== SHELLS COMPLETOS ==="
for SHELL in AdminShell SuperAdminShell ProfessorShell RecepcaoShell MainShell TeenShell KidsShell ParentShell FranqueadorShell; do
  FILE=$(find components/shell -name "${SHELL}.tsx" | head -1)
  [ -z "$FILE" ] && echo "❌ $SHELL: NÃO EXISTE" && continue
  BELLS=$(grep -c "NotificationBell" "$FILE" 2>/dev/null)
  SEARCH=$(grep -c "CommandPalette\|searchOpen" "$FILE" 2>/dev/null)
  LOGOUT=$(grep -c "Sair\|logout" "$FILE" 2>/dev/null)
  STICKY=$(grep -c "sticky\|h-screen" "$FILE" 2>/dev/null)
  FEEDBACK=$(grep -c "Feedback\|SidebarFeedback" "$FILE" 2>/dev/null)
  echo "$SHELL: 🔔=$BELLS 🔍=$SEARCH 🚪=$LOGOUT 📌=$STICKY 💬=$FEEDBACK"
done

# 6. Build limpo
pnpm typecheck && pnpm build
```

### 9C — Commit e Deploy

```bash
git add -A
git commit -m "enterprise: revisão 20 anos maturidade — 9 perfis auditados, benchmark internacional

Benchmark: Zen Planner, Mindbody, Tecnofit, ABC Evo, iDojo, SYSMMA, Kicksite, IBLACKBELT
9 agentes: SuperAdmin, Admin, Professor, Recepção, Aluno Adulto, Teen, Kids, Responsável, Franqueador

Cada perfil verificado:
- Dashboard com dados reais
- Funcionalidades essenciais do dia a dia
- Zero 404, zero loading infinito, zero botões mortos
- PT-BR, CSS vars, mobile-first
- Sidebar sticky, busca global, notificações, logout"

git push origin main
npx vercel --prod --force --yes
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_ENTERPRISE_REVIEW.md nesta pasta. Este é o prompt mais importante do projeto. Execute os 9 agentes NA ORDEM HIERÁRQUICA:

AGENTE 1 (Super Admin): Auditar CADA página do /superadmin. Dashboard Mission Control deve mostrar KPIs reais. Academias, Planos, Receita devem funcionar. Corrigir o que não funciona. Commit.

AGENTE 2 (Admin/Owner): O MAIS IMPORTANTE. Dashboard com dados reais do dia. Lista de alunos com status financeiro. Financeiro com resumo e faturas. Presença/check-ins. Turmas. Graduações. Se algo está em mock e a tabela existe no Supabase, migrar para real. Commit.

AGENTE 3 (Professor): Dashboard com aulas de hoje. Chamada funcional. Lista de alunos. Avaliações. Commit.

AGENTE 4 (Recepcionista): Dashboard com check-ins do dia. Check-in por busca. Cadastro rápido. Commit.

AGENTE 5 (Aluno Adulto): Dashboard com streak e próxima aula. Check-in. Financeiro. Ranking. Commit.

AGENTE 6 (Teen): Tudo do adulto + gamificação (XP, missões, ranking teen). Visual vibrante. Commit.

AGENTE 7 (Kids): UI simplificada e divertida. Estrelas, figurinhas. Sem features adultas. Commit.

AGENTE 8 (Responsável): Dashboard por filho. Pré-check-in e check-in dos filhos. Financeiro consolidado. Evolução. Commit.

AGENTE 9 (Franqueador + Validação): Visão consolidada da rede. DEPOIS: validação cruzada — zero 404, zero loading infinito, zero botões mortos, zero inglês na UI. Build limpo. Push. Deploy.

REGRAS ABSOLUTAS:
- Se uma página existe mas mostra dados mock E a tabela existe no Supabase → MIGRAR para real
- Se uma página não existe mas é essencial para o uso diário → CRIAR página mínima funcional
- Se um botão existe mas não faz nada → IMPLEMENTAR ou REMOVER
- NÃO criar páginas decorativas — cada página deve FUNCIONAR
- Priorizar o que o usuário USA TODO DIA sobre features raramente usadas
- pnpm typecheck && pnpm build ZERO erros entre CADA agente

Comece pelo inventário pré-execução agora.
```

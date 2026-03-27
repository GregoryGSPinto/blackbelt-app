# CHECKLIST MESTRE DE USABILIDADE — BLACKBELT v2 + PRIMALWOD
## Auditoria Completa: O Que Existe, O Que Falta, O Que Está Parcial

> **INSTRUÇÕES PARA O CLAUDE CODE:**
> 
> Leia este arquivo inteiro. Para CADA item, faça a verificação descrita na coluna "COMO AUDITAR".
> Preencha a coluna STATUS com:
> - ✅ EXISTE — código implementado, funcional, testável
> - ⚠️ PARCIAL — existe algo mas incompleto (detalhar o que falta)
> - ❌ NÃO EXISTE — nenhum código relacionado
> - 🔇 N/A — não se aplica ao app atual
>
> Gere um relatório final com contagem: X existe, Y parcial, Z falta.
> Separe por app (BB = BlackBelt, PW = PrimalWOD).
>
> COMO VERIFICAR:
> ```bash
> # Para cada item, rodar combinações de:
> grep -rn "TERMO" lib/ app/ components/ --include="*.ts" --include="*.tsx" | head -20
> find app -name "page.tsx" -path "*ROTA*" | head -5
> cat ARQUIVO | head -50
> ```

---

## BLOCO 1 — ARQUITETURA DE IDENTIDADE (conta / pessoa / perfil / vínculo)

### 1.1 Separação conta vs pessoa vs perfil vs vínculo

**O que é:** Separar claramente no modelo de dados:
- **Conta** = entrada no Supabase Auth (email + senha). Um email = uma conta.
- **Pessoa** = identidade real (nome, CPF, data nascimento, telefone). Uma pessoa pode ter 0 ou 1 conta.
- **Perfil** = papel no sistema (admin, professor, aluno_adulto, aluno_teen, aluno_kids, responsavel, recepcionista, franqueador, superadmin). Uma pessoa pode ter N perfis.
- **Vínculo** = relação com academia/box E com família. Perfil X pertence à academia Y. Responsável Z é pai de Aluno W.

**Por que importa:** Hoje, se Roberto é Admin e Responsável, provavelmente tem 2 linhas na tabela `profiles` com o mesmo `user_id`. Mas se a esposa dele (sem conta) precisar buscar o filho, não tem como representar "pessoa sem conta que é responsável". E se um professor dá aula em 2 academias, precisa de 2 profiles distintos com a mesma pessoa por trás.

**COMO AUDITAR:**
```bash
# Verificar modelo atual
grep -rn "interface Profile\|type Profile\|profiles" lib/types/ --include="*.ts" | head -10
grep -rn "user_id\|userId\|account" lib/types/ --include="*.ts" | head -10
# Verificar se existe tabela/type "pessoa" ou "person" separada de "profile"
grep -rn "Person\|Pessoa\|person\|pessoa" lib/ --include="*.ts" | head -10
# Verificar se existe tabela/type "vinculo" ou "link" ou "membership"
grep -rn "Vinculo\|vinculo\|membership\|Membership\|academy_member" lib/ --include="*.ts" | head -10
```

**O que deveria existir (modelo alvo):**
```typescript
// Tabela: accounts (= Supabase Auth)
// Já existe nativamente no Supabase

// Tabela: people (pessoa física)
interface Person {
  id: string;
  account_id?: string;        // nullable — pessoa sem conta (kids, cônjuge)
  full_name: string;
  cpf?: string;               // único se preenchido
  birth_date?: string;
  phone?: string;
  email?: string;             // pode diferir do email da conta
  gender?: string;
  avatar_url?: string;
  created_at: string;
}

// Tabela: profiles (papel no sistema)
interface Profile {
  id: string;
  person_id: string;          // FK → people
  academy_id?: string;        // FK → academies/boxes (null pra superadmin)
  role: UserRole;
  status: 'draft' | 'pending' | 'invited' | 'active' | 'suspended' | 'archived';
  is_primary: boolean;        // perfil padrão ao logar
  permissions: object;        // permissões customizadas por role
  created_at: string;
}

// Tabela: family_links (vínculo familiar)
interface FamilyLink {
  id: string;
  guardian_person_id: string;  // FK → people (pai/mãe)
  dependent_person_id: string; // FK → people (filho)
  relationship: 'pai' | 'mae' | 'avo' | 'tio' | 'responsavel_legal';
  is_primary_guardian: boolean;
  is_financial_responsible: boolean; // quem paga
  can_authorize: boolean;     // pode autorizar eventos
  receives_notifications: boolean;
  created_at: string;
}
```

**STATUS BB:** ___
**STATUS PW:** ___
**DETALHES:** ___

---

### 1.2 Múltiplos perfis na mesma conta

**O que é:** Uma mesma conta (email) pode ter N perfis ativos simultaneamente. Roberto loga uma vez e pode ser Admin da Guerreiros BJJ E Responsável do Lucas Teen E Aluno Adulto na academia do parceiro.

**COMO AUDITAR:**
```bash
# Verificar se o AuthContext suporta múltiplos profiles
grep -rn "profiles\|activeProfile\|selectProfile\|switchProfile" lib/contexts/ --include="*.tsx" | head -10
# Verificar se existe tela de seleção de perfil
find app -name "page.tsx" -path "*selecionar*" -o -name "page.tsx" -path "*select-profile*" | head -5
# Verificar se existe lógica de multi-profile no middleware
grep -rn "profiles\|multiple.*profile\|multi.*role" middleware.ts | head -10
```

**O que deveria existir:**
- Query `profiles WHERE user_id = current_user` retorna array (não single)
- Se array.length > 1 → mostrar seletor de perfil
- `activeProfileId` salvo em sessionStorage pra persistir entre refreshes
- Endpoint/função `switchProfile(profileId)` que muda o contexto sem logout
- Middleware valida que o `activeProfileId` pertence ao `user_id` autenticado

**STATUS BB:** ___
**STATUS PW:** ___

---

### 1.3 Troca rápida de contexto (sem logout)

**O que é:** Dentro do app, no header ou menu lateral, ter um seletor que mostra:
- "Você está vendo como: Admin — Guerreiros BJJ"
- Dropdown com outros perfis: "Responsável — Lucas", "Aluno — Parceiro Gym"
- Ao trocar, redireciona pra dashboard do novo perfil instantaneamente

**Cenário especial Responsável:** Além de trocar de PERFIL, o responsável troca de DEPENDENTE:
- "Vendo: Pedro (Kids)" → "Trocar para: Ana (Teen)" → "Trocar para: Meu Perfil"

**COMO AUDITAR:**
```bash
grep -rn "ProfileSwitcher\|ContextSwitcher\|ProfileSelector\|SwitchProfile" components/ --include="*.tsx" | head -10
grep -rn "activeProfile\|currentProfile\|switchProfile" components/shell/ --include="*.tsx" | head -10
grep -rn "selectChild\|seletorFilho\|dependentSelector\|ChildSelector" components/ app/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 1.4 Evolução de ciclo de vida (sem recriar conta)

**O que é:** Permitir transições naturais sem perder histórico:
- Kids → Teen (fez 13 anos → muda role, ganha login próprio, mantém estrelas/figurinhas)
- Teen → Adulto (fez 18 → muda role, perde gamificação teen, mantém histórico)
- Aluno → Professor (formou → ganha perfil professor, mantém perfil aluno)
- Responsável → Aluno (pai decide treinar também → ganha perfil aluno, mantém responsável)

**COMO AUDITAR:**
```bash
grep -rn "evolve\|transition\|upgrade.*role\|promote\|changeRole" lib/ --include="*.ts" | head -10
grep -rn "ALTER.*role\|UPDATE.*role\|change_role\|evolve_profile" supabase/ --include="*.sql" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 2 — CENTRAL DA FAMÍLIA

### 2.1 Área do Responsável completa

**O que é:** Dashboard unificado para o pai/mãe com:
- Seletor de filhos/dependentes no topo
- Frequência de cada filho
- Agenda familiar (calendário com aulas de TODOS os filhos)
- Avisos e comunicados
- Pagamentos consolidados
- Documentos
- Autorizações pendentes

**COMO AUDITAR:**
```bash
find app -path "*parent*" -o -path "*responsavel*" -o -path "*guardian*" | grep page.tsx | sort
ls -la lib/api/responsavel* 2>/dev/null || ls -la lib/api/guardian* 2>/dev/null || ls -la lib/api/parent* 2>/dev/null
grep -rn "dependente\|dependent\|filho\|child.*select" app/ components/ --include="*.tsx" | head -10
```

**Páginas esperadas BB:** `/parent`, `/parent/jornada/[id]`, `/parent/agenda`, `/parent/pagamentos`, `/parent/mensagens`, `/parent/autorizacoes`, `/parent/relatorios`, `/parent/configuracoes`
**Páginas esperadas PW:** `/responsavel`, `/responsavel/filhos`, `/responsavel/agenda`, `/responsavel/pagamentos`, `/responsavel/mensagens`, `/responsavel/autorizacoes`, `/responsavel/configuracoes`

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.2 Responsável cria perfil Kids (sem email)

**O que é:** No painel do Responsável, botão "Adicionar Filho" → formulário:
- Nome da criança
- Data de nascimento (validação 5-12 anos)
- Gênero (opcional)
- Observações médicas/alergias
- Turma desejada (dropdown)
- SEM email, SEM senha
- Acesso pelo app do pai ou código PIN de 4 dígitos

**COMO AUDITAR:**
```bash
grep -rn "addChild\|criarFilho\|addKids\|createKids\|cadastrarFilho" app/ lib/ components/ --include="*.tsx" --include="*.ts" | head -10
find app -path "*adicionar*filho*" -o -path "*add*child*" -o -path "*novo*dependente*" | head -5
grep -rn "guardian_children\|family_links\|GuardianChild\|FamilyLink" lib/ supabase/ --include="*.ts" --include="*.sql" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.3 Responsável cria perfil Teen (com controle parental)

**O que é:** Mesmo fluxo do Kids, mas para 13-17 anos:
- Modo 1: Teen SEM login próprio (igual Kids)
- Modo 2: Teen COM login próprio (pai define email + senha)
- Controle parental: can_change_email, can_change_password, is_suspended, suspended_until

**COMO AUDITAR:**
```bash
grep -rn "createTeen\|criarTeen\|teenRegistration\|addTeen" app/ lib/ --include="*.tsx" --include="*.ts" | head -10
grep -rn "parentalControl\|parental_control\|controleParental" lib/ --include="*.ts" | head -10
grep -rn "suspend\|suspender\|bloquear\|deactivate.*teen" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.4 Ativação por convite para Teen

**O que é:** Convite por email, link, ou WhatsApp com status: enviado → pendente → ativado → expirado.

**COMO AUDITAR:**
```bash
grep -rn "invite\|convite\|Invite\|Convite" lib/api/ --include="*.ts" | head -10
find app -path "*convite*" -o -path "*invite*" | head -10
grep -rn "status.*pending\|status.*accepted\|status.*expired" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.5 Cadastro "Criar Família" (fluxo único)

**O que é:** Wizard de 6 etapas: dados responsável → dependente 1 → dependente 2 → turma → financeiro → envio de convites. Reaproveitamento inteligente de dados para irmãos.

**COMO AUDITAR:**
```bash
grep -rn "CreateFamily\|CriarFamilia\|FamilyWizard\|MatriculaFamiliar\|WizardMatricula" app/ components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.6 Vínculo de responsável principal e secundário

**O que é:** Definir: principal vs secundário, quem recebe cobrança, quem recebe aviso, quem pode autorizar.

**COMO AUDITAR:**
```bash
grep -rn "primary.*guardian\|secondary.*guardian\|responsavel.*principal\|financial.*responsible" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 2.7 Cobrança familiar (financeiro por família)

**O que é:** Aluno ≠ pagador ≠ responsável. Visão agrupada por família. Sugestão de Plano Família.

**COMO AUDITAR:**
```bash
grep -rn "family.*billing\|cobranca.*familiar\|pagador\|payer\|financial_responsible" lib/ --include="*.ts" | head -10
grep -rn "plano.*familia\|family.*plan\|desconto.*familia" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 3 — PERMISSÕES E AUTONOMIA POR FAIXA ETÁRIA

### 3.1 Permissões separadas por faixa etária (Kids vs Teen vs Adulto)

**O que é:** Kids nunca mensagem. Teen configurável. Adulto acesso completo.

**COMO AUDITAR:**
```bash
grep -rn "permission\|permissao\|canAccess\|hasPermission\|rolePermissions" lib/ --include="*.ts" | head -10
grep -rn "kids.*message\|kids.*chat\|kids.*mensag" app/ components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 3.2 Autonomia parcial do Teen (configurável por academia)

**O que é:** Cada academia decide: teen pode check-in sozinho? Ver pagamentos? Alterar dados? Participar do ranking geral?

**COMO AUDITAR:**
```bash
grep -rn "teen.*config\|teen.*settings\|academy.*teen\|box.*teen" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 4 — CADASTRO E ONBOARDING

### 4.1 Admin/Owner cadastrar aluno direto pelo painel

**O que é:** Botão "Cadastrar Aluno" → formulário direto → sistema cria conta + envia email com senha temporária.

**COMO AUDITAR:**
```bash
grep -rn "createStudent\|criarAluno\|cadastrarAluno\|addStudent\|registerStudent" app/ lib/ --include="*.tsx" --include="*.ts" | head -10
grep -rn "admin\.createUser\|adminCreateUser\|createUser.*admin" lib/ --include="*.ts" | head -10
grep -rn "needs_password_change\|temporary_password\|senha_temporaria" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.2 Admin cadastrar staff com fluxo unificado

**O que é:** Um formulário: seleciona role (professor/recepcionista/admin) → campos dinâmicos → cadastro direto ou convite.

**COMO AUDITAR:**
```bash
find app -path "*equipe*" -o -path "*team*" -o -path "*staff*" | grep page.tsx | head -5
grep -rn "createStaff\|addTeam\|inviteStaff\|convidar.*equipe" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.3 Cadastro rápido para recepção (30 segundos)

**O que é:** Nome + telefone = suficiente pra começar. Resto completa depois. Salvar rascunho.

**COMO AUDITAR:**
```bash
grep -rn "quickRegister\|cadastroRapido\|fastRegister\|minimalRegister" app/ lib/ --include="*.tsx" --include="*.ts" | head -10
grep -rn "draft\|rascunho\|pendente\|pending.*registration" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.4 Cadastro de aluno experimental (visitante)

**O que é:** Formulário mínimo, perfil temporário 7 dias, conversão posterior, lead no CRM.

**COMO AUDITAR:**
```bash
grep -rn "experimental\|trial.*student\|visitante\|walkIn\|walk_in\|aula.*experimental" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.5 Rascunho de cadastro (estados de perfil)

**O que é:** Status: rascunho → pendente → convidado → ativo → suspenso → arquivado.

**COMO AUDITAR:**
```bash
grep -rn "ProfileStatus\|UserStatus\|status.*enum\|status.*draft\|status.*archived" lib/types/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.6 Importação de alunos em massa (CSV/Excel)

**O que é:** Upload de planilha → preview → batch insert → relatório final. Template para download.

**COMO AUDITAR:**
```bash
grep -rn "import.*csv\|import.*excel\|importar.*alunos\|bulk.*create\|batch.*import" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
grep -rn "Papaparse\|papaparse\|SheetJS\|xlsx\|csv.*parse" package.json | head -5
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.7 Wizard de setup da academia/box (primeiro login)

**O que é:** 5 steps guiados quando academia/box está vazia. Sai do wizard com sistema funcional.

**COMO AUDITAR:**
```bash
grep -rn "SetupWizard\|OnboardingWizard\|FirstLogin\|setup.*wizard" app/ components/ --include="*.tsx" | head -10
grep -rn "setup_completed\|onboarding_completed\|has_completed_setup" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.8 Wizard de matrícula inteligente

**O que é:** Cadastro individual guiado com stepper e progresso.

**COMO AUDITAR:**
```bash
grep -rn "MatriculaWizard\|EnrollmentWizard\|wizardMatricula" app/ components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.9 Duplicação inteligente para irmãos

**O que é:** Reaproveitar endereço, responsável, pagador ao cadastrar segundo filho.

**COMO AUDITAR:**
```bash
grep -rn "sibling\|irmao\|duplicate.*data\|reuse.*address\|copy.*guardian" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.10 Entrada pela store clara (primeira tela)

**O que é:** "Sou academia", "Sou aluno", "Sou responsável", "Tenho convite", "Já tenho conta".

**COMO AUDITAR:**
```bash
cat app/page.tsx | head -40
grep -rn "sou.*academia\|sou.*aluno\|user.*type.*select\|role.*onboarding" app/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 4.11 Busca de academia/box

**O que é:** Buscar por nome, cidade, código, link de convite, geolocation.

**COMO AUDITAR:**
```bash
grep -rn "searchAcademy\|buscarAcademia\|findBox\|academy.*search\|box.*search\|join.*code" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 5 — HOME POR PAPEL ORIENTADA POR TAREFA

### 5.1 Dashboard Admin orientado por tarefa

**O que é:** Pendências, ações rápidas, cadastros incompletos — não só KPIs.

**COMO AUDITAR:**
```bash
cat app/\(admin\)/admin/page.tsx 2>/dev/null | head -60 || cat app/\(admin-box\)/admin-box/page.tsx 2>/dev/null | head -60
grep -rn "QuickAction\|acaoRapida\|pending\|pendencia" app/ components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 5.2 Dashboard Professor orientado por tarefa

**O que é:** Próximas aulas, chamada pendente, alunos sem avaliação, alunos em risco.

**COMO AUDITAR:**
```bash
cat app/\(professor\)/professor/page.tsx 2>/dev/null | head -60 || cat app/\(coach\)/coach/page.tsx 2>/dev/null | head -60
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 5.3 Dashboard Responsável orientado por tarefa

**O que é:** Agenda filhos hoje, avisos não lidos, pagamentos pendentes, autorizações.

**COMO AUDITAR:**
```bash
cat app/\(parent\)/parent/page.tsx 2>/dev/null | head -60 || cat app/\(responsavel\)/responsavel/page.tsx 2>/dev/null | head -60
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 5.4 Dashboard Aluno/Atleta orientado por tarefa

**O que é:** Próxima aula, check-in rápido, progresso, recados, conquistas.

**COMO AUDITAR:**
```bash
cat app/\(dashboard\)/dashboard/page.tsx 2>/dev/null | head -60 || cat app/\(athlete\)/athlete/page.tsx 2>/dev/null | head -60
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 5.5 Ações rápidas em todos os perfis

**O que é:** Cards clicáveis no topo do dashboard, contextuais por role.

**COMO AUDITAR:**
```bash
grep -rn "QuickAction\|ActionButton\|ShortcutCard\|acaoRapida" components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 6 — ONBOARDING E TUTORIAL

### 6.1 Tutorial diferente por papel

**O que é:** Admin, Professor, Aluno, Responsável, Teen, Kids — cada um com tutorial próprio.

**COMO AUDITAR:**
```bash
grep -rn "Tutorial\|tutorial\|Onboarding\|onboarding\|Walkthrough" components/ lib/ --include="*.tsx" --include="*.ts" | head -15
grep -rn "TUTORIAL_ADMIN\|TUTORIAL_PROFESSOR\|tutorial.*role" lib/ components/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 6.2 Tutorial contextual (dicas por tela)

**O que é:** Tooltips de ajuda no primeiro uso de cada feature.

**COMO AUDITAR:**
```bash
grep -rn "ContextualHelp\|Tooltip.*help\|HelpIcon\|contextual.*help" components/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 6.3 Empty states inteligentes (com CTA)

**O que é:** Páginas vazias que ensinam a próxima ação com botão de ação.

**COMO AUDITAR:**
```bash
grep -rn "EmptyState\|emptyState\|empty-state\|noData" components/ app/ --include="*.tsx" | head -15
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 7 — OPERAÇÃO E BUSCA

### 7.1 Status visual de cadastro incompleto

**O que é:** Badges e indicadores de dados faltantes no painel admin.

**COMO AUDITAR:**
```bash
grep -rn "incomplete\|incompleto\|missing.*data\|pending.*setup" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 7.2 Painel de inconsistências operacionais

**O que é:** Tela "Corrigir Pendências" com lista de inconsistências e ação direta.

**COMO AUDITAR:**
```bash
grep -rn "Inconsistencia\|inconsistency\|pendencia\|DataQuality\|dataHealth" app/ lib/ --include="*.tsx" --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 7.3 Busca global operacional (Ctrl+K)

**O que é:** Busca em tudo: alunos, turmas, cobranças, responsáveis. Resultados categorizados.

**COMO AUDITAR:**
```bash
grep -rn "CommandPalette\|GlobalSearch\|SearchModal\|Ctrl.*K\|cmd.*k\|omnisearch" components/ app/ --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 7.4 Timeline única do aluno/atleta

**O que é:** Histórico completo: matrícula, presença, graduações/PRs, pagamentos, competições.

**COMO AUDITAR:**
```bash
grep -rn "Timeline\|timeline\|historico\|StudentHistory\|AthleteHistory" app/ lib/ components/ --include="*.tsx" --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 8 — COMUNICAÇÃO

### 8.1 Comunicação segmentada (por turma, faixa etária, status)

**COMO AUDITAR:**
```bash
grep -rn "segment\|segmentacao\|audiencia\|target.*audience\|filter.*recipients" lib/api/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 8.2 Comunicação orientada por vínculo (aviso kids vai pro pai)

**COMO AUDITAR:**
```bash
grep -rn "notification.*guardian\|notificar.*responsavel\|notify.*parent\|resolveRecipients" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 8.3 Templates de mensagem com variáveis

**COMO AUDITAR:**
```bash
grep -rn "template.*message\|MessageTemplate\|templateMensagem\|placeholder\|{nome" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 8.4 Lembretes automáticos de inadimplência

**COMO AUDITAR:**
```bash
grep -rn "reminder\|lembrete\|dunning\|overdue\|inadimpl\|payment.*reminder" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 8.5 Mensagem automática de aniversário

**COMO AUDITAR:**
```bash
grep -rn "birthday\|aniversario\|birth_date.*notification\|aniversariante" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 8.6 Centro de notificações com filtro e ação direta

**COMO AUDITAR:**
```bash
grep -rn "NotificationCenter\|notification.*center\|markAsRead\|notification.*filter" components/ lib/ --include="*.tsx" --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 9 — CHECK-IN E PRESENÇA

### 9.1 Check-in com regra por perfil (adulto, teen, kids mediado, professor, visitante)

**COMO AUDITAR:**
```bash
grep -rn "checkin\|checkIn\|check_in\|presenca\|attendance" lib/api/ --include="*.ts" | head -10
grep -rn "checkin.*role\|role.*checkin\|kids.*checkin" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 9.2 Check-in por QR code

**COMO AUDITAR:**
```bash
grep -rn "qrcode\|QRCode\|qr.*code\|scan.*qr" lib/ app/ components/ package.json --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 9.3 Check-in por geolocation

**COMO AUDITAR:**
```bash
grep -rn "geolocation\|navigator.geolocation\|haversine\|proximity" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 10 — DOCUMENTOS E AUTORIZAÇÕES

### 10.1 Autorização digital para eventos/competições

**COMO AUDITAR:**
```bash
grep -rn "authorization\|autorizacao\|authorize\|consent\|permissao.*evento" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 10.2 Documentos por núcleo familiar

**COMO AUDITAR:**
```bash
grep -rn "document\|documento\|contract\|contrato\|atestado\|certificate" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 11 — MOBILE E CAPACITOR

### 11.1 Mobile-first (botões 44px+, fluxos curtos, safe areas)

**COMO AUDITAR:**
```bash
grep -rn "min-h-\[44\]\|h-11\|h-12\|touch-target\|safe-area\|safeArea" components/ app/ --include="*.tsx" --include="*.css" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 11.2 Recursos nativos Capacitor (câmera, push, share, biometria)

**COMO AUDITAR:**
```bash
grep -rn "@capacitor" package.json | head -10
grep -rn "Camera\|PushNotification\|Share\|Clipboard\|Network\|BiometricAuth" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

### 11.3 Offline leve (cache agenda, fila check-ins, sync)

**COMO AUDITAR:**
```bash
grep -rn "offline\|serviceWorker\|IndexedDB\|indexedDB\|idb\|localForage" lib/ app/ --include="*.ts" --include="*.tsx" | head -10
grep -rn "navigator.onLine\|offline.*mode\|network.*status" lib/ --include="*.ts" | head -10
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 12 — RECEPÇÃO PREMIUM

### 12.1 Modo recepção forte (matrícula rápida, check-in, busca, 2a via, agenda, caixa)

**COMO AUDITAR:**
```bash
find app -path "*recepcao*" -o -path "*reception*" -o -path "*secretario*" | grep page.tsx | sort
find app -path "*recepcao*" -o -path "*reception*" -o -path "*secretario*" | grep page.tsx | wc -l
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## BLOCO 13 — MEDIÇÃO E OBSERVABILIDADE

### 13.1 Medição de usabilidade (PostHog/Sentry + eventos trackados)

**COMO AUDITAR:**
```bash
grep -rn "posthog\|PostHog\|sentry\|Sentry\|analytics\|trackEvent\|capture" lib/ app/ --include="*.ts" --include="*.tsx" | head -15
grep -rn "NEXT_PUBLIC_POSTHOG\|NEXT_PUBLIC_SENTRY\|SENTRY_DSN" .env* | head -5
```

**STATUS BB:** ___
**STATUS PW:** ___

---

## RESUMO DE CONTAGEM

> **PREENCHER APÓS AUDITORIA:**
>
> ### BlackBelt v2
> - ✅ EXISTE: ___/40
> - ⚠️ PARCIAL: ___/40
> - ❌ NÃO EXISTE: ___/40
> - 🔇 N/A: ___/40
>
> ### PrimalWOD
> - ✅ EXISTE: ___/40
> - ⚠️ PARCIAL: ___/40
> - ❌ NÃO EXISTE: ___/40
> - 🔇 N/A: ___/40
>
> ### Top 10 gaps mais críticos (por impacto no usuário final):
> 1. ___
> 2. ___
> 3. ___
> 4. ___
> 5. ___
> 6. ___
> 7. ___
> 8. ___
> 9. ___
> 10. ___

---

## COMANDO PARA O CLAUDE CODE

### Para BlackBelt v2:
```
Leia o arquivo CHECKLIST_USABILIDADE_MESTRE_COMPLETO.md na raiz do projeto.

Para CADA um dos 40 itens, execute os comandos da seção "COMO AUDITAR" e preencha:
- STATUS BB: ✅ (existe e funciona) / ⚠️ (parcial — detalhar) / ❌ (não existe) / 🔇 (N/A)
- DETALHES: arquivos encontrados, o que existe, o que falta

Ao final, gere o RESUMO DE CONTAGEM com totais e Top 10 gaps.
Salve como AUDITORIA_USABILIDADE_BB.md na raiz do projeto.

NÃO altere nenhum código. Apenas audite e documente.
```

### Para PrimalWOD:
```
Leia o arquivo CHECKLIST_USABILIDADE_MESTRE_COMPLETO.md na raiz do projeto.

Para CADA um dos 40 itens, execute os comandos da seção "COMO AUDITAR" e preencha:
- STATUS PW: ✅ (existe e funciona) / ⚠️ (parcial — detalhar) / ❌ (não existe) / 🔇 (N/A)
- DETALHES: arquivos encontrados, o que existe, o que falta

Ao final, gere o RESUMO DE CONTAGEM com totais e Top 10 gaps.
Salve como AUDITORIA_USABILIDADE_PW.md na raiz do projeto.

NÃO altere nenhum código. Apenas audite e documente.
```

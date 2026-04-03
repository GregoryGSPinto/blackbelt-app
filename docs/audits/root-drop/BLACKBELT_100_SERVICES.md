# BLACKBELT v2 — ZERAR OS 36 SERVICES RESTANTES
# De 84% real para 100% — Nenhum service fica mock-only

## CONTEXTO

O relatório enterprise mostrou:
- 227 services total + 3 gateways = 230
- 191 (84%) com queries Supabase reais
- 36 (~16%) ainda retornam dados mock quando `!isMock()`
- 7/7 services críticos JÁ são reais
- Build: ZERO erros. TypeScript strict.

Este prompt converte os 36 restantes. Nenhum service fica mock-only após este prompt.

---

## REGRAS ABSOLUTAS

1. **PRESERVAR blocos mock.** `isMock()` branching NUNCA é deletado.
2. **handleServiceError** em CADA catch block.
3. **NÃO criar tabelas novas.** Usar as 234 tabelas que já existem nas migrations. Se uma tabela não existe, usar JSONB em tabela existente ou settings da academy.
4. **academy_id em TODA query** (multi-tenant).
5. **Fallback gracioso** quando o service depende de API externa (Asaas, WhatsApp, email, etc.): salvar no Supabase + retornar `{ configured: false }` se a API key não existir.
6. **pnpm typecheck && pnpm build** — ZERO erros ao final de CADA seção.
7. **Commit a cada seção.**
8. **Máximo 5 minutos por service.** Se é complexo demais, implementar o CRUD básico e deixar features avançadas para depois.

---

## SEÇÃO 1 — INVENTÁRIO EXATO (5 min)

### 1A. Identificar os 36 services

```bash
echo "=== SERVICES SEM .from() NO RAMO REAL ==="
for f in $(find lib/api -name "*.service.ts" | sort); do
  # Verifica se tem isMock() branching
  HAS_MOCK=$(grep -c "isMock\b" "$f" 2>/dev/null || echo 0)
  
  if [ "$HAS_MOCK" -gt 0 ]; then
    # Verifica se tem .from() fora de blocos mock
    # Crude check: se o arquivo tem .from( E isMock, provavelmente tem ramo real
    HAS_FROM=$(grep -c "\.from(" "$f" 2>/dev/null || echo 0)
    
    if [ "$HAS_FROM" -eq 0 ]; then
      echo "🔴 $f (sem .from() — mock only)"
    fi
  else
    # Sem isMock() — pode ser helper ou já 100% real
    HAS_FROM=$(grep -c "\.from(" "$f" 2>/dev/null || echo 0)
    if [ "$HAS_FROM" -eq 0 ]; then
      echo "⚪ $f (sem isMock, sem .from() — helper/util?)"
    fi
  fi
done

echo ""
echo "=== SERVICES COM throw 'Not implemented' ==="
grep -rln "throw.*Not implemented\|throw.*TODO\|throw.*FIXME" lib/api/ --include="*.service.ts" | sort
```

### 1B. Para cada service identificado, anotar:
- Nome do arquivo
- Funções exportadas
- Tabela que deveria usar (inferir do nome e contexto)
- Complexidade (SIMPLES = CRUD / MÉDIO = joins / COMPLEXO = API externa)

Salvar como `REMAINING_SERVICES.md` na raiz.

**Commit:** `docs: inventory of remaining 36 mock-only services`

---

## SEÇÃO 2 — PADRÃO DE CONVERSÃO (referência)

Todo service convertido DEVE seguir este padrão:

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/utils/mock';
import { handleServiceError } from '@/lib/monitoring/service-error';

export async function listAlgo(academyId: string): Promise<AlgoDTO[]> {
  if (isMock()) {
    return mockListAlgo(academyId);
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tabela')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as AlgoDTO[];
  } catch (err) {
    handleServiceError(err, 'service.listAlgo');
    return []; // fallback seguro — NUNCA throw
  }
}
```

### Para services que dependem de API externa:

```typescript
export async function enviarWhatsApp(data: WhatsAppDTO): Promise<WhatsAppResult> {
  if (isMock()) {
    return mockEnviarWhatsApp(data);
  }

  try {
    const supabase = getSupabaseClient();
    
    // SEMPRE salvar no banco (log/auditoria)
    const { data: log, error } = await supabase
      .from('notification_logs')
      .insert({
        type: 'whatsapp',
        recipient: data.phone,
        content: data.message,
        status: 'pending',
        academy_id: data.academyId,
      })
      .select()
      .single();

    if (error) throw error;

    // Tentar API externa SE configurada
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (apiKey) {
      // Chamar API real
      // Atualizar log com status: 'sent'
    } else {
      // Atualizar log com status: 'not_configured'
      await supabase
        .from('notification_logs')
        .update({ status: 'not_configured', metadata: { reason: 'API key not set' } })
        .eq('id', log.id);
    }

    return { id: log.id, sent: !!apiKey, configured: !!apiKey };
  } catch (err) {
    handleServiceError(err, 'whatsapp.enviar');
    return { id: '', sent: false, configured: false };
  }
}
```

---

## SEÇÃO 3 — CONVERTER SERVICES TIER A: COMUNICAÇÃO E SOCIAL (15 min)

### 3A. mensagens.service.ts
Tabela: `messages`
- `getConversations(profileId)` → `messages` GROUP BY sender/recipient, com último message
- `getMessages(conversationId, profileId)` → `messages` WHERE (sender=me AND recipient=other) OR (sender=other AND recipient=me)
- `send(senderId, recipientId, content, academyId)` → INSERT `messages`
- `markRead(conversationId, profileId)` → UPDATE `messages` SET read=true

### 3B. notificacoes.service.ts
Tabela: `notifications`
- `list(profileId)` → `notifications` WHERE profile_id ORDER BY created_at DESC
- `markRead(ids)` → UPDATE `notifications` SET read=true WHERE id IN (ids)
- `markAllRead(profileId)` → UPDATE WHERE profile_id AND read=false
- `getUnreadCount(profileId)` → SELECT count WHERE read=false
- `getPreferences(profileId)` → `profiles` → settings JSONB field

### 3C. feed.service.ts
Tabela: `messages` com channel='academy' (broadcast) ou criar view
- `getFeed(academyId)` → últimas atividades (check-ins, graduações, conquistas)
- Se tabela activity_feed não existe: compor de múltiplas tabelas (attendance + belt_progressions + student_achievements)

### 3D. comunicados.service.ts
Tabela: `messages` com channel='academy'
- `list(academyId)` → messages WHERE channel='academy' AND academy_id
- `create(data)` → INSERT messages com recipient_id=NULL (broadcast)
- `getById(id)` → single message

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — communication services (messages, notifications, feed, announcements)`

---

## SEÇÃO 4 — CONVERTER SERVICES TIER B: GAMIFICAÇÃO E CONTEÚDO (15 min)

### 4A. conquistas.service.ts / achievements.service.ts
Tabela: `achievements` + `student_achievements`
- `listAvailable(academyId)` → `achievements` SELECT all
- `listByStudent(studentId)` → `student_achievements` JOIN `achievements`
- `grant(studentId, achievementId)` → INSERT `student_achievements` + INSERT `xp_ledger`
- `checkAndGrant(studentId)` → lógica: verificar requirements vs dados reais

### 4B. xp.service.ts
Tabela: `xp_ledger`
- `getXP(studentId)` → SUM(amount) FROM xp_ledger WHERE student_id
- `getLevel(xp)` → cálculo local (0-100=1, 100-300=2, etc.)
- `getLeaderboard(academyId, limit?)` → xp_ledger GROUP BY student_id ORDER BY SUM DESC
- `addXP(studentId, amount, reason, referenceId?)` → INSERT xp_ledger

### 4C. ranking.service.ts
Tabela: `xp_ledger` + `attendance` + `students`
- `getByAcademia(academyId)` → students com total XP + total attendance, ordenado
- `getByTurma(classId)` → mesma lógica filtrada por class_enrollments

### 4D. streaming.service.ts / content.service.ts
Tabela: usar `settings` JSONB na academia ou tabela de content se existir
- Se tabela `videos` ou `content` existe nas migrations → usar
- Se não existe → armazenar em `academy_settings.content_library` JSONB
- `listVideos(academyId, filters?)` → SELECT com filtros
- `getVideo(id)` → single
- Fallback: retornar array vazio se tabela não existe (graceful)

### 4E. playlists.service.ts
Mesma lógica — se tabela existe, usar. Se não, JSONB em profiles.settings
- `getUserPlaylists(profileId)` → SELECT
- `create(profileId, name)` → INSERT
- `addVideo(playlistId, videoId)` → UPDATE array

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — gamification and content services (achievements, XP, ranking, streaming, playlists)`

---

## SEÇÃO 5 — CONVERTER SERVICES TIER C: PEDAGÓGICO (15 min)

### 5A. avaliacao-tecnica.service.ts / evaluations
Tabela: `evaluations`
- `list(academyId, filters?)` → evaluations com joins em students + profiles
- `getByStudent(studentId)` → evaluations WHERE student_id
- `create(data)` → INSERT evaluations
- `update(id, data)` → UPDATE evaluations

### 5B. graduacoes.service.ts / evolucao.service.ts
Tabela: `belt_progressions` + `students`
- `listByAcademy(academyId)` → belt_progressions JOIN students JOIN profiles
- `listByStudent(studentId)` → belt_progressions WHERE student_id ORDER BY promoted_at DESC
- `promote(studentId, toBelt, toStripes, professorId)` → INSERT belt_progressions + UPDATE students(belt, stripes)

### 5C. plano-aula.service.ts / diario-aula.service.ts
Tabela: usar `classes` com campo JSONB `lesson_plans` ou tabela dedicada se existir
- `getPlans(classId)` → SELECT lesson_plans ou tabela dedicada
- `createPlan(classId, data)` → INSERT/UPDATE
- `getDiario(classId, date)` → registros de aula do dia

### 5D. banco-tecnicas.service.ts
Tabela: JSONB na academia ou tabela se existir
- `list(academyId, modality?)` → técnicas da modalidade
- `getById(id)` → single
- Se tabela não existe → usar campo JSONB em `academies.settings`

### 5E. metas.service.ts
Tabela: JSONB em `students` ou tabela dedicada
- `getByStudent(studentId)` → metas do aluno
- `create(studentId, data)` → INSERT
- `updateProgress(metaId, progress)` → UPDATE

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — pedagogical services (evaluations, belt progression, lesson plans, techniques, goals)`

---

## SEÇÃO 6 — CONVERTER SERVICES TIER D: OPERACIONAL ADMIN (15 min)

### 6A. relatorios.service.ts
Não precisa de tabela própria — faz queries agregadas:
- `getPresencaReport(academyId, period)` → attendance GROUP BY student, class
- `getFinanceiroReport(academyId, period)` → invoices GROUP BY status, month
- `getAlunoReport(studentId)` → attendance + evaluations + belt_progressions do aluno
- `getRankingReport(academyId)` → xp_ledger + attendance agregado

### 6B. eventos.service.ts
Tabela: usar `messages` com type='event' ou JSONB
- `list(academyId)` → events da academia
- `create(data)` → INSERT
- `update(id, data)` → UPDATE
- `getById(id)` → single

### 6C. loja.service.ts / estoque.service.ts
Tabela: se `products` existe → usar. Se não → JSONB em academies.settings
- `listProducts(academyId)` → SELECT
- `getById(id)` → single
- `createProduct(data)` → INSERT
- `updateStock(productId, quantity)` → UPDATE

### 6D. indicacao.service.ts / referral.service.ts
Tabela: JSONB ou tabela se existir
- `generateLink(studentId)` → gerar código único
- `listReferrals(studentId)` → quem indicou
- `applyDiscount(referralCode)` → validar e aplicar

### 6E. carteirinha.service.ts
Tabela: `students` (já tem os dados) + `profiles`
- `generate(studentId)` → retornar dados do aluno formatados para carteirinha
- `getQRData(studentId)` → string para QR code (studentId + academyId)
- Não precisa tabela extra — compõe dos dados existentes

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — operational admin services (reports, events, store, referrals, ID card)`

---

## SEÇÃO 7 — CONVERTER SERVICES TIER E: PERFIS ESPECIALIZADOS (20 min)

### 7A. Teen services (teen-*.service.ts)

Todos usam tabelas que JÁ existem:
- `teen-dashboard.service.ts` → compor de: students(belt, xp) + attendance(streak) + xp_ledger(total) + student_achievements(recent)
- `teen-gamificacao.service.ts` → xp_ledger + student_achievements
- `teen-desafios.service.ts` → achievements WHERE category='challenge' + student_achievements
- `teen-ranking.service.ts` → xp_ledger GROUP BY student ORDER BY SUM DESC (mesmo que ranking.service)
- `teen-perfil.service.ts` → profiles + students JOIN

Para CADA teen service:
1. Abrir o arquivo
2. No ramo `!isMock()`, implementar query usando tabelas existentes
3. Se função retorna dados compostos → fazer múltiplas queries e compor

### 7B. Kids services (kids-*.service.ts)

- `kids-estrelas.service.ts` → xp_ledger (XP = estrelas para kids)
- `kids-figurinhas.service.ts` → student_achievements (achievements = figurinhas para kids)
- `kids-recompensas.service.ts` → achievements WHERE category IN ('reward', 'challenge')
- `kids-faixa.service.ts` → students(belt, stripes) + belt_progressions
- `kids-personalizacao.service.ts` → profiles.settings JSONB (avatar, tema, cor favorita)
- `kids-aventuras.service.ts` → compor de achievements + xp como "missões" e "aventuras"

### 7C. Responsável services (responsavel-*.service.ts)

- `responsavel-dashboard.service.ts` → guardian_links JOIN students JOIN profiles + attendance do mês
- `responsavel-jornada.service.ts` → belt_progressions + evaluations dos filhos
- `responsavel-agenda.service.ts` → class_enrollments JOIN classes dos filhos (schedule)
- `responsavel-financeiro.service.ts` → invoices JOIN students WHERE student IN (filhos)
- `responsavel-mensagens.service.ts` → messages WHERE sender/recipient = guardianProfileId
- `responsavel-autorizacoes.service.ts` → JSONB em guardian_links ou tabela se existir
- `responsavel-relatorio.service.ts` → compor de attendance + evaluations + belt_progressions

### 7D. Franqueador services (franqueador-*.service.ts)

- `franqueador-dashboard.service.ts` → franchise_academies JOIN academies + aggregate (total alunos, receita por academia)
- `franqueador-academias.service.ts` → franchise_academies JOIN academies WHERE network_id
- `franqueador-relatorios.service.ts` → aggregated queries por academia na rede
- `franqueador-financeiro.service.ts` → invoices aggregado por academia

### 7E. Recepcionista services (se existirem separados)

- Recepcionista usa os MESMOS services do admin (student, checkin, class) mas com permissões limitadas
- Se existir service próprio → redirecionar para os services existentes
- Se não → nada a fazer

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — specialized profile services (teen, kids, parent, franchise, reception)`

---

## SEÇÃO 8 — CONVERTER SERVICES TIER F: INTEGRAÇÕES EXTERNAS (10 min)

Estes services dependem de APIs externas. O padrão é: **salvar no Supabase + tentar API se configurada.**

### 8A. whatsapp.service.ts
- Salvar em `notification_logs` com type='whatsapp'
- Se `WHATSAPP_API_KEY` existe → chamar API
- Se não → status='not_configured', mensagem fica logada mas não enviada

### 8B. email.service.ts
- Salvar em `notification_logs` com type='email'
- Se `EMAIL_API_KEY` ou `RESEND_API_KEY` existe → chamar API
- Se não → status='not_configured'

### 8C. nfe.service.ts
- Salvar em `invoices.metadata` JSONB com nfe_status
- Se `NFE_API_KEY` existe → chamar API de emissão
- Se não → retornar `{ configured: false, message: 'Configure em Configurações → Fiscal' }`

### 8D. push-notification.service.ts
- Salvar em `notifications` tabela
- Se VAPID keys existem → tentar Web Push
- Se não → notificação fica no banco (visível no app, não enviada como push)

### 8E. sms.service.ts (se existir)
- Mesmo padrão: salvar + tentar API + fallback gracioso

### 8F. calendar-sync.service.ts (se existir)
- Se Google Calendar API configurada → sincronizar
- Se não → retornar `{ configured: false }`

### 8G. analytics.service.ts / posthog
- Se POSTHOG_API_KEY existe → enviar eventos
- Se não → log local apenas

**PARA TODOS:** O fallback NUNCA é throw. É SEMPRE um retorno gracioso com `{ configured: false }`.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: real Supabase — external integration services with graceful fallback`

---

## SEÇÃO 9 — ELIMINAR TODO throw 'Not implemented' (10 min)

### 9A. Varrer TODOS os services

```bash
echo "=== THROWS RESTANTES ==="
grep -rn "throw.*Not implemented\|throw.*TODO\|throw.*FIXME\|throw new Error('Not" lib/api/ --include="*.ts" | grep -v "node_modules\|mock\|\.mock\." | sort
```

### 9B. Para CADA throw encontrado:

Substituir por implementação real (query Supabase) OU fallback gracioso:

```typescript
// ANTES (quebra a página):
throw new Error('Not implemented');

// DEPOIS (funciona sem dados):
console.warn('[service.method] Implementação pendente — retornando vazio');
return []; // ou {} ou null, dependendo do tipo de retorno
```

**REGRA: Após esta seção, `grep "throw.*Not implemented" lib/api/` deve retornar ZERO resultados.**

```bash
echo "=== VERIFICAÇÃO FINAL ==="
THROWS=$(grep -rn "throw.*Not implemented\|throw.*TODO" lib/api/ --include="*.ts" | grep -v "mock\|\.mock\." | wc -l)
echo "Throws restantes: $THROWS"
if [ "$THROWS" -gt 0 ]; then
  echo "❌ AINDA TEM THROWS — CORRIGIR ANTES DE CONTINUAR"
  grep -rn "throw.*Not implemented\|throw.*TODO" lib/api/ --include="*.ts" | grep -v "mock\|\.mock\."
fi
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `fix: zero throws — all services return graceful fallback`

---

## SEÇÃO 10 — VERIFICAÇÃO FINAL E RELATÓRIO (10 min)

### 10A. Recontagem

```bash
echo "=== RECONTAGEM FINAL ==="
echo "Total service files:" && find lib/api -name "*.service.ts" | wc -l
echo ""
echo "Services com .from() queries:" && grep -rl "\.from(" lib/api/ --include="*.service.ts" 2>/dev/null | wc -l
echo ""
echo "Services COM isMock():" && grep -rl "isMock\b" lib/api/ --include="*.service.ts" 2>/dev/null | wc -l
echo ""
echo "Services com throw 'Not implemented':" && grep -rl "throw.*Not implemented" lib/api/ --include="*.service.ts" 2>/dev/null | grep -v mock | wc -l
echo ""
echo "Tabelas usadas nos services:" && grep -rhn "\.from(['\"]" lib/api/ --include="*.ts" | grep -oP "\.from\(['\"]\\K[^'\"]+" | sort -u | wc -l
```

### 10B. Relatório

```
╔═══════════════════════════════════════════════════════════╗
║  BLACKBELT v2 — SERVIÇOS 100% REAL                       ║
╠═══════════════════════════════════════════════════════════╣

ANTES:
  Services total:     227
  🟢 Real:            191 (84%)
  🟡 Mock fallback:   36 (16%)
  🔴 Throws:          [N]

DEPOIS:
  Services total:     227
  🟢 Real:            [N] ([%])
  🟡 Mock fallback:   [N] ([%])
  🔴 Throws:          0 (0%) ✅

SERVICES CONVERTIDOS NESTE PROMPT:
  Seção 3 — Comunicação:    [N] services
  Seção 4 — Gamificação:    [N] services
  Seção 5 — Pedagógico:     [N] services
  Seção 6 — Operacional:    [N] services
  Seção 7 — Perfis:         [N] services
  Seção 8 — Integrações:    [N] services
  Seção 9 — Throws fix:     [N] eliminados

INTEGRAÇÕES EXTERNAS (requerem API keys):
  WhatsApp:     [Pronto para configurar ✅ / Não]
  Email:        [Pronto para configurar ✅ / Não]
  NFe:          [Pronto para configurar ✅ / Não]
  Push:         [Pronto para configurar ✅ / Não]
  Analytics:    [Pronto para configurar ✅ / Não]

NOTA: [X/10]

╚═══════════════════════════════════════════════════════════╝
```

### 10C. Push final

```bash
pnpm typecheck — ZERO erros
pnpm build — ZERO erros

git add -A
git commit -m "feat: 100% services real — all 227 services connected to Supabase, zero throws, graceful fallbacks"
git push origin main --force
```

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_100_SERVICES.md. Verifique estado: grep -c "throw.*Not implemented" lib/api/*.service.ts lib/api/**/*.service.ts 2>/dev/null | grep -v ":0$" && grep -rl "\.from(" lib/api/ --include="*.service.ts" | wc -l && pnpm typecheck 2>&1 | tail -5. Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

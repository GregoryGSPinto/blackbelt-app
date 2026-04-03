# BLACKBELT v2 — MEGA FINAL: TUDO QUE FALTA + TESTES + STORE READY

Este é o último mega prompt. Implementa TUDO que falta pra paridade com PrimalWOD e prepara pra Apple/Play Store. 12 blocos sequenciais. Cada bloco: typecheck + build + commit + push.

ANTES DE TUDO — Estado atual:
```bash
git log --oneline -5
echo "Pages: $(find app -name 'page.tsx' | wc -l)"
echo "Services: $(find lib/api -name '*.service.ts' | wc -l)"
echo "Migrations: $(ls supabase/migrations/*.sql | wc -l)"
echo "API Routes: $(find app/api -name 'route.ts' | wc -l)"
echo "Mocks: $(find lib/mocks -name '*.mock.ts' 2>/dev/null | wc -l)"
```

---

## BLOCO 1 — PUSH NOTIFICATIONS COMPLETO (9 templates)

Verificar se já foi implementado no mega anterior:
```bash
find lib -name "*push*" -o -name "*notification*" | head -10
grep -rn "NOTIFICATION_TEMPLATES\|sendPushNotification\|registerDeviceToken" lib/ | head -5
ls supabase/migrations/*push* supabase/migrations/*069* 2>/dev/null
```

Se já existir, PULAR pro bloco 2. Se não:

1.1 — Migration supabase/migrations/069_push_notifications.sql:
```sql
CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios','android','web')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, platform)
);
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tokens" ON device_tokens FOR ALL USING (profile_id = get_my_profile_id());

CREATE TABLE IF NOT EXISTS push_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES academies(id),
  template text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','clicked')),
  sent_at timestamptz DEFAULT now()
);
ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_log_academy" ON push_log FOR ALL USING (academy_id = get_my_academy_id());

CREATE TABLE IF NOT EXISTS push_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  class_reminder boolean DEFAULT true,
  checkin_confirmed boolean DEFAULT true,
  belt_promotion boolean DEFAULT true,
  payment_due boolean DEFAULT true,
  trial_reminder boolean DEFAULT true,
  new_enrollment boolean DEFAULT true,
  contract_signed boolean DEFAULT true,
  health_alert boolean DEFAULT true,
  feedback_received boolean DEFAULT true,
  quiet_start time DEFAULT '22:00',
  quiet_end time DEFAULT '07:00',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE push_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_prefs" ON push_preferences FOR ALL USING (profile_id = get_my_profile_id());
```

1.2 — Service lib/api/push-notifications.service.ts:
9 templates de notificação:
- class_reminder: "Aula em {{minutes}} min! {{modality}} com {{professor}}"
- checkin_confirmed: "Check-in confirmado! Bom treino!"
- belt_promotion: "Parabéns pela graduação! {{belt}}"
- payment_due: "Mensalidade R${{value}} vence em {{days}} dias"
- trial_reminder: "Faltam {{days}} dias do seu trial!"
- new_enrollment: "Novo aluno: {{student_name}} em {{modality}}"
- contract_signed: "{{student_name}} assinou o contrato"
- health_alert: "Atestado de {{student_name}} vence em {{days}} dias"
- feedback_received: "Novo feedback — nota {{rating}}/5"

Funções:
- sendPushNotification(profileId, template, variables, academyId)
- registerDeviceToken(profileId, token, platform)
- getPreferences(profileId) / updatePreferences(profileId, data)
- getPushLog(academyId, filters?) / getPushAnalytics(academyId)
- checkDuplicate(profileId, template, 24h)
- respectQuietHours(profileId)
isMock() em tudo.

1.3 — Capacitor integration lib/native/push-notifications.ts:
initPushNotifications(), listeners para registration/received/action.

1.4 — Página admin /admin/notificacoes:
- KPIs: enviadas hoje, taxa entrega, taxa clique
- Lista de notificações recentes
- Botão "Enviar notificação manual" (select template + destinatários)

1.5 — Página aluno /dashboard/configuracoes → seção "Notificações":
- Toggles por tipo de notificação
- Horário silencioso

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: push notifications — 9 templates, preferences, analytics, quiet hours" && git push origin main
```

---

## BLOCO 2 — PRÉ-CHECK-IN 2 ETAPAS

Verificar:
```bash
grep -rn "pre.*checkin\|preCheckin\|pre_checkin" lib/ supabase/ | head -5
ls supabase/migrations/*070* 2>/dev/null
```

Se já existir, PULAR. Se não:

2.1 — Migration supabase/migrations/070_pre_checkin.sql:
```sql
CREATE TABLE IF NOT EXISTS pre_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) NOT NULL,
  class_id uuid REFERENCES classes(id) NOT NULL,
  class_date date NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','attended','no_show')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, class_id, class_date)
);
ALTER TABLE pre_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pre_checkin_academy" ON pre_checkins FOR ALL USING (academy_id = get_my_academy_id());
CREATE POLICY "pre_checkin_student" ON pre_checkins FOR INSERT WITH CHECK (student_id = get_my_profile_id());
```

2.2 — Service lib/api/pre-checkin.service.ts:
- preCheckin(academyId, studentId, classId, date)
- cancelPreCheckin(preCheckinId)
- listPreCheckins(academyId, classId, date)
- getMyPreCheckins(studentId, date?)
- convertToAttendance(preCheckinId)
- getClassExpectedCount(classId, date)
isMock() em tudo.

2.3 — No dashboard do aluno: botão "Vou treinar!" nas próximas aulas
2.4 — No dashboard do professor: "Alunos esperados" com contagem
2.5 — No check-in efetivo: se aluno fez pré-check-in, marcar como 'attended'

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: pre-checkin 2 etapas — intenção + presença confirmada" && git push origin main
```

---

## BLOCO 3 — BIOMETRIA NO CHECK-IN

3.1 — Criar lib/native/biometric-checkin.ts:
```typescript
import { Capacitor } from '@capacitor/core';

export async function biometricCheckin(): Promise<{ success: boolean; method: string }> {
  if (!Capacitor.isNativePlatform()) return { success: false, method: 'not_native' };
  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    const result = await BiometricAuth.authenticate({
      reason: 'Confirme sua identidade para fazer check-in',
      cancelTitle: 'Cancelar',
    });
    return { success: true, method: result.biometryType || 'biometric' };
  } catch { return { success: false, method: 'biometric_failed' }; }
}
```

3.2 — Na tela de check-in do aluno: botão "Check-in com biometria" ao lado do QR
3.3 — Se biometria OK → registrar attendance com method='biometric'

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: biometric checkin — Face ID / Touch ID" && git push origin main
```

---

## BLOCO 4 — AVALIAÇÃO FÍSICA + PDF 7 PÁGINAS

Este é o bloco mais complexo. O PrimalWOD tem avaliação física completa com PDF profissional.

4.1 — Migration supabase/migrations/071_physical_assessment.sql:
```sql
CREATE TABLE IF NOT EXISTS physical_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) NOT NULL,
  assessor_id uuid REFERENCES profiles(id), -- professor que avaliou
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Dados pessoais
  age int,
  gender text CHECK (gender IN ('male','female','other')),
  
  -- Composição corporal
  weight_kg numeric(5,1),
  height_cm numeric(5,1),
  bmi numeric(4,1), -- calculado
  body_fat_percent numeric(4,1),
  lean_mass_kg numeric(5,1), -- calculado
  fat_mass_kg numeric(5,1), -- calculado
  
  -- Circunferências (cm) — bilaterais
  neck_cm numeric(4,1),
  chest_cm numeric(4,1),
  waist_cm numeric(4,1),
  hip_cm numeric(4,1),
  right_arm_cm numeric(4,1),
  left_arm_cm numeric(4,1),
  right_forearm_cm numeric(4,1),
  left_forearm_cm numeric(4,1),
  right_thigh_cm numeric(4,1),
  left_thigh_cm numeric(4,1),
  right_calf_cm numeric(4,1),
  left_calf_cm numeric(4,1),
  
  -- Dobras cutâneas (mm) — Jackson-Pollock 7 dobras
  chest_fold numeric(4,1),
  abdomen_fold numeric(4,1),
  thigh_fold numeric(4,1),
  triceps_fold numeric(4,1),
  subscapular_fold numeric(4,1),
  suprailiac_fold numeric(4,1),
  midaxillary_fold numeric(4,1),
  
  -- Pressão arterial e frequência
  systolic_bp int, -- mmHg
  diastolic_bp int,
  resting_hr int, -- bpm
  
  -- Mobilidade (graus ou classificação)
  ankle_dorsiflexion_right numeric(4,1),
  ankle_dorsiflexion_left numeric(4,1),
  hip_flexion_right numeric(4,1),
  hip_flexion_left numeric(4,1),
  shoulder_flexion_right numeric(4,1),
  shoulder_flexion_left numeric(4,1),
  thoracic_rotation_right numeric(4,1),
  thoracic_rotation_left numeric(4,1),
  
  -- Testes funcionais (adaptado pra artes marciais)
  sit_reach_cm numeric(4,1), -- flexibilidade
  plank_seconds int, -- resistência core
  pushups_count int,
  pullups_count int,
  squat_depth text CHECK (squat_depth IN ('full','parallel','above_parallel','limited')),
  
  -- Fotos (URLs)
  photo_front_url text,
  photo_side_url text,
  photo_back_url text,
  
  -- Observações e metas
  observations text,
  goals text,
  next_assessment_date date,
  
  -- PDF
  pdf_url text,
  pdf_generated_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE physical_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessment_academy" ON physical_assessments FOR ALL USING (academy_id = get_my_academy_id());
CREATE POLICY "assessment_student" ON physical_assessments FOR SELECT USING (student_id = get_my_profile_id());

CREATE INDEX IF NOT EXISTS idx_assessments_student ON physical_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON physical_assessments(assessment_date);
```

4.2 — Service lib/api/physical-assessment.service.ts:
- createAssessment(academyId, studentId, data)
- getAssessment(assessmentId)
- listAssessments(academyId, filters?)
- getStudentAssessments(studentId) — histórico
- updateAssessment(assessmentId, data)
- calculateBMI(weight, height)
- calculateBodyFat(gender, age, folds) — Jackson-Pollock 7
- calculateLeanMass(weight, bodyFatPercent)
- classifyBMI(bmi) — WHO: underweight/normal/overweight/obese
- classifyBodyFat(percent, gender, age) — ACSM
- classifyBloodPressure(systolic, diastolic) — AHA
- classifyRestingHR(hr, gender) — ACSM
- getEvolution(studentId) — comparação entre avaliações
isMock() em tudo com dados realistas.

4.3 — PDF Generator lib/reports/physical-assessment-pdf.ts:
Usar jsPDF (pnpm add jspdf) pra gerar PDF de 7 páginas:

PÁGINA 1 — Capa + Dados Pessoais:
- Logo BlackBelt no topo
- "AVALIAÇÃO FÍSICA"
- Nome do aluno, idade, data
- Nome do avaliador, academia
- Foto do aluno (se disponível)

PÁGINA 2 — Composição Corporal:
- Peso, altura, IMC (com classificação WHO: cores verde/amarelo/vermelho)
- % Gordura (com classificação ACSM)
- Massa magra vs massa gorda (gráfico pizza simples)
- Tabela: medida | valor | classificação

PÁGINA 3 — Circunferências:
- Tabela bilateral: região | direito | esquerdo | diferença
- Body map SVG simplificado com as medidas plotadas
- Relação cintura/quadril com classificação

PÁGINA 4 — Dobras Cutâneas:
- 7 dobras com valores
- Soma total
- Cálculo Jackson-Pollock → % gordura
- Gráfico barras horizontal com cada dobra

PÁGINA 5 — Testes Funcionais + Pressão:
- Pressão arterial com classificação AHA (cores)
- FC repouso com classificação
- Prancha (segundos) com classificação
- Flexões, barras, agachamento
- Flexibilidade (banco de Wells)

PÁGINA 6 — Mobilidade:
- Dorsiflexão tornozelo (graus) com semáforo
- Flexão quadril com semáforo
- Mobilidade ombro com semáforo
- Rotação torácica com semáforo
- Tabela: articulação | D | E | normal | status

PÁGINA 7 — Evolução + Metas:
- Se tem avaliação anterior: gráficos de linha mostrando evolução
  - Peso ao longo do tempo
  - % gordura ao longo do tempo
  - Circunferências comparadas
- Observações do professor
- Metas definidas
- Data da próxima avaliação
- Rodapé: "Gerado por BlackBelt — [data]"

4.4 — API Route app/api/assessments/[id]/pdf/route.ts:
- Autenticação obrigatória
- Gerar PDF via jsPDF
- Retornar como download

4.5 — Páginas:
- /admin/avaliacoes — lista de avaliações com filtros
- /admin/avaliacoes/nova — formulário wizard (5 steps: dados, circunferências, dobras, testes, fotos)
- /admin/avaliacoes/[id] — detalhe com botão "Baixar PDF"
- /professor/avaliacoes — professor vê e cria avaliações
- /dashboard/avaliacoes — aluno vê suas avaliações + evolução

4.6 — Menu:
- AdminShell: "Avaliações" (ClipboardList icon) após "Saúde"
- ProfessorShell: "Avaliações"
- MainShell (aluno): "Avaliações"

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: physical assessment + 7-page PDF — composition, circumferences, folds, mobility, evolution" && git push origin main
```

---

## BLOCO 5 — SEO / ANALYTICS / OG IMAGE

Verificar:
```bash
cat app/layout.tsx | grep -n "openGraph\|og:" | head -5
ls public/robots.txt app/sitemap.ts public/og-image.png 2>/dev/null
```

5.1 — Metadata completo no app/layout.tsx (se não existir):
```typescript
export const metadata: Metadata = {
  title: { default: 'BlackBelt — Gestão de Academias de Artes Marciais', template: '%s | BlackBelt' },
  description: 'Sistema completo para academias de BJJ, Judô, Karatê e MMA. Check-in, turmas, cobranças e presença.',
  keywords: ['academia','artes marciais','bjj','jiu jitsu','judô','karatê','mma','check-in','gestão'],
  metadataBase: new URL('https://blackbelts.com.br'),
  openGraph: {
    type: 'website', locale: 'pt_BR', url: 'https://blackbelts.com.br',
    title: 'BlackBelt — Gestão de Academias', description: 'Sistema completo para academias de artes marciais.',
    siteName: 'BlackBelt', images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'BlackBelt', images: ['/og-image.png'] },
  robots: { index: true, follow: true },
};
```

5.2 — public/robots.txt
5.3 — app/sitemap.ts (6 URLs públicas)
5.4 — Google Analytics (components/analytics/GoogleAnalytics.tsx condicional)
5.5 — OG Image (public/og-image.png — gerar SVG 1200x630 com fundo carmesim + "BB" + texto)

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: SEO metadata, OG image, robots.txt, sitemap, Google Analytics" && git push origin main
```

---

## BLOCO 6 — INFRAESTRUTURA PRODUÇÃO

6.1 — .env.example completo (todas as variáveis)
6.2 — CLAUDE.md (stack, comandos, estrutura, regras)
6.3 — scripts/health-check.sh (Supabase, pages, services, build, Vercel)
6.4 — scripts/backup-db.sh (migrations + env seguro)
6.5 — .vercelignore (ios, android, backups, docs/screenshots)
6.6 — Atualizar package.json com scripts mobile completos

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: production infrastructure — health check, backup, .env.example, CLAUDE.md" && git push origin main
```

---

## BLOCO 7 — CAPACITOR + STORE ASSETS COMPLETOS

7.1 — Gerar ícones todos os tamanhos:
Criar scripts/generate-icons.ts usando @resvg/resvg-js (já no projeto):
- Android: mipmap-mdpi a xxxhdpi (48-192px) + round + foreground
- iOS: AppIcon.appiconset (20-1024px) + Contents.json
- PWA: icon-72 a icon-512 + maskable
- Favicon: já existe
- OG image: 1200x630
- apple-touch-icon.png: 180x180

Design: gradiente carmesim #B71C1C→#C62828, "BB BELT" tipografia branca

7.2 — Splash screen (Capacitor config)
7.3 — Atualizar capacitor.config.ts com todos os plugins
7.4 — Android: npx cap add android (se não existir), build.gradle, AndroidManifest permissions
7.5 — iOS: npx cap add ios (se possível), Info.plist permissions
7.6 — npx cap sync

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: store assets — icons all sizes, splash, capacitor sync" && git push origin main
```

---

## BLOCO 8 — STORE METADATA + RELEASE GUIDE

8.1 — Atualizar docs/STORE_METADATA.md com conteúdo FINAL:
- App Name, Subtitle, Description completa (features por perfil)
- Keywords, Category, Age Rating
- Privacy/Support/Marketing URLs
- Review Notes com credenciais
- Data Safety (Google) — tabela completa
- App Privacy (Apple) — linked/not linked
- What's New v1.0.0
- Screenshots necessários por dispositivo

8.2 — Criar docs/RELEASE_GUIDE.md:
- Android: keystore, gradle, bundleRelease, Play Console
- iOS: Xcode, archive, App Store Connect
- Checklist pré-submissão (20 itens)
- Custos: Google R$130, Apple R$500/ano

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "docs: store metadata final + release guide completo" && git push origin main
```

---

## BLOCO 9 — SCRIPTS DE TESTE FORMAIS (paridade 781+ testes)

O PrimalWOD tem 781 testes em 6 scripts. BlackBelt precisa do mesmo.

Criar scripts de teste em scripts/tests/:

9.1 — scripts/tests/test-marketplace.ts (meta: 98 testes):
```bash
# Testar contra Supabase real
set -a && source .env.local && set +a
```
Testar: categorias, produtos CRUD, variações, guia tamanhos, carrinho, checkout, pedidos, estoque, reviews, seed, RLS.

9.2 — scripts/tests/test-contracts.ts (meta: 158 testes):
Testar: software template, academy templates, student contracts, upload PDF, assinatura SHA256, histórico, versionamento, dicas jurídicas, validações limites legais (multa 2%, juros 1%), numberToWords, dateToExtensive, gate trial, gate matrícula.

9.3 — scripts/tests/test-trial-system.ts (meta: 193 testes):
Testar: cadastro rápido, trial_students CRUD, activity log, config, WhatsApp links, mensagens day-by-day, conversão, feedback, dashboard KPIs, professor badges, landing page form, QR code, automações, seed.

9.4 — scripts/tests/test-health-system.ts (meta: 137 testes):
Testar: PAR-Q 7 perguntas, histórico médico, condições artes marciais, emergência, atestado médico, restrições treino, ciência risco, LGPD consent, incidentes, pre-training check, config, renovação anual, professor alertas.

9.5 — scripts/tests/test-conduct-code.ts (meta: 77 testes):
Testar: template CRUD, aceite, versionamento, ocorrências, sanções progressivas, upload PDF, config, clearance check-in.

9.6 — scripts/tests/test-invites-feedback.ts (meta: 118 testes):
Testar: criar usuário API, magic link, profile + membership, roles bloqueadas, feedback CRUD, rating, sidebar em shells, admin feedbacks page.

FORMATO de cada teste:
```typescript
let passed = 0, failed = 0, total = 0;

function test(name: string, fn: () => Promise<boolean> | boolean) {
  total++;
  try {
    const result = typeof fn === 'function' ? fn() : fn;
    const ok = result instanceof Promise ? await result : result;
    if (ok) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ ${name}`); }
  } catch (e) {
    failed++; console.log(`  ❌ ${name} — ${e.message}`);
  }
}

// ... testes ...

console.log(`\n${passed}/${total} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

Cada script deve:
- Importar o service correspondente
- Chamar CADA função exportada
- Verificar retorno (não null, não [], formato correto)
- Verificar mock e real (se Supabase disponível)
- Verificar RLS (user A não vê dados de user B)
- Verificar validações (limites, formatos, obrigatórios)

9.7 — Script runner (scripts/run-all-tests.sh):
```bash
#!/bin/bash
echo "=== BLACKBELT v2 — TEST SUITE ==="
TOTAL_PASS=0; TOTAL_FAIL=0

for TEST in scripts/tests/test-*.ts; do
  echo ""; echo "▶ Running $(basename $TEST)..."
  RESULT=$(npx tsx "$TEST" 2>&1)
  echo "$RESULT"
  P=$(echo "$RESULT" | grep -o '[0-9]*/[0-9]* passed' | grep -o '^[0-9]*')
  F=$(echo "$RESULT" | grep -o '[0-9]* failed' | grep -o '^[0-9]*')
  TOTAL_PASS=$((TOTAL_PASS + ${P:-0}))
  TOTAL_FAIL=$((TOTAL_FAIL + ${F:-0}))
done

echo ""
echo "========================================="
echo "TOTAL: $TOTAL_PASS passed, $TOTAL_FAIL failed"
echo "========================================="
```

```bash
pnpm typecheck && pnpm build
chmod +x scripts/run-all-tests.sh scripts/tests/*.ts
git add -A && git commit -m "test: 781+ formal tests — marketplace, contracts, trial, health, conduct, invites" && git push origin main
```

---

## BLOCO 10 — RODAR TODOS OS TESTES

```bash
bash scripts/run-all-tests.sh 2>&1 | tee test-results.txt
cat test-results.txt | tail -20
```

Se QUALQUER teste falhar:
1. Ler o erro
2. CORRIGIR o service/mock/migration
3. Rerodar o teste específico: npx tsx scripts/tests/test-NOME.ts
4. Repetir até 0 failed

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: test corrections — [X] tests fixed" && git push origin main
```

---

## BLOCO 11 — HEALTH CHECK COMPLETO

Rodar o health check:
```bash
bash scripts/health-check.sh 2>&1

# Verificação manual adicional
echo "=== STORE READINESS ==="
echo "Build: $(pnpm build 2>&1 | grep -q 'Failed' && echo FAIL || echo PASS)"
echo "OG Image: $(ls public/og-image.png 2>/dev/null && echo OK || echo MISSING)"
echo "Favicon: $(ls app/icon.svg public/favicon.svg 2>/dev/null | head -1 && echo OK || echo MISSING)"
echo "robots.txt: $(ls public/robots.txt 2>/dev/null && echo OK || echo MISSING)"
echo "sitemap: $(ls app/sitemap.ts 2>/dev/null && echo OK || echo MISSING)"
echo ".well-known: $(ls public/.well-known/apple-app-site-association 2>/dev/null && echo OK || echo MISSING)"
echo "STORE_METADATA: $(ls docs/STORE_METADATA.md 2>/dev/null && echo OK || echo MISSING)"
echo "RELEASE_GUIDE: $(ls docs/RELEASE_GUIDE.md 2>/dev/null && echo OK || echo MISSING)"
echo "CLAUDE.md: $(ls CLAUDE.md 2>/dev/null && echo OK || echo MISSING)"
echo ".env.example: $(ls .env.example 2>/dev/null && echo OK || echo MISSING)"
echo ""
echo "Pages: $(find app -name 'page.tsx' | wc -l)"
echo "Services: $(find lib/api -name '*.service.ts' | wc -l)"
echo "Migrations: $(ls supabase/migrations/*.sql | wc -l)"
echo "API Routes: $(find app/api -name 'route.ts' | wc -l)"
echo "Tests: $(grep -r 'passed' test-results.txt 2>/dev/null | tail -1)"
```

---

## BLOCO 12 — TAG FINAL + RELATÓRIO

```bash
# Tag de release
git tag v3.0.0-store-ready
git push origin v3.0.0-store-ready

# Relatório final
cat << 'REPORT'
========================================
BLACKBELT v2 — FINAL REPORT v3.0.0
========================================

FEATURES IMPLEMENTADAS:
✅ 10 Dashboards (todos perfis + franqueador)
✅ Check-in 3 métodos (app, QR, biometria)
✅ Pré-check-in 2 etapas
✅ Marketplace com guia tamanhos artes marciais
✅ Contratos jurídicos (CC, CDC, LGPD, CONFEF, ECA)
✅ Aula Experimental 7 dias
✅ Sistema Saúde PAR-Q+ completo
✅ Código de Conduta 20 artigos
✅ Avaliação Física + PDF 7 páginas
✅ Push Notifications 9 templates
✅ Feedback flutuante sidebar
✅ Convite por email + magic link auto-login
✅ Admin reset senha membro
✅ Graduações e faixas
✅ Compete (campeonatos)
✅ Streaming de vídeo
✅ Gamificação teen + kids
✅ Capacitor build prep
✅ SEO/Analytics/OG
✅ Infraestrutura produção

TESTES: XXX+ passed, 0 failed

PENDÊNCIAS MANUAIS:
1. Conta Google Play Developer (R$130)
2. Conta Apple Developer (US$99/ano)
3. Keystore Android (keytool)
4. Screenshots reais de device
5. Firebase project para push real
6. Domínio custom (opcional)
7. Contas: Resend, Asaas, Sentry

STORE READINESS: 10/10
========================================
REPORT
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: BlackBelt v3.0.0 — feature complete, store ready, XXX+ tests" && git push origin main
```

---

## REGRAS ABSOLUTAS

1. isMock() em TODOS os services — NUNCA deletar mock blocks
2. var(--bb-*) em TODAS as cores
3. PT-BR em todas as mensagens
4. handleServiceError em todos os catch blocks
5. Skeleton loading em todas as listas
6. Empty states bonitos em todas as páginas
7. Mobile-first
8. Cada bloco: typecheck + build + commit + push
9. Se algo do bloco anterior já existe: PULAR pro próximo
10. Se o contexto encher: reportar último bloco completado

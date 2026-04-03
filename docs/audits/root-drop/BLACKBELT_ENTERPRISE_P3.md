# BLACKBELT v2 — ENTERPRISE PRODUCTION (FASE 3 de 3)
# Seed Realista, Performance, Segurança, Verificação Final

## PRÉ-REQUISITO: FASES 1 e 2 concluídas

---

## SEÇÃO 9 — SEED DE DADOS REALISTAS PARA DEMO (25 min)

A academia demo precisa parecer REAL. Nomes brasileiros, dados plausíveis, histórico convincente.

### 9A. Criar scripts/seed-demo-data.ts

Este script popula dados ALÉM dos users (que foram criados na Fase 1).
Requer que os users já existam no Auth.

```typescript
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACADEMY_ID = 'acad-guerreiros-001';

async function seedDemoData() {
  console.log('🥋 Populando dados demo — Guerreiros do Tatame\n');

  // ═══ TURMAS ═══
  console.log('📚 Criando turmas...');
  const classes = [
    {
      id: 'class-jjadulto-001',
      name: 'Jiu-Jitsu Adulto',
      modality: 'jiu_jitsu',
      professor_id: null, // preenchido depois
      max_students: 25,
      schedule: [
        { day: 'monday', start: '19:00', end: '20:30' },
        { day: 'wednesday', start: '19:00', end: '20:30' },
        { day: 'friday', start: '19:00', end: '20:30' },
      ],
      level: 'all',
      description: 'Aula de Jiu-Jitsu Brasileiro para adultos, todos os níveis.',
    },
    {
      id: 'class-judokids-001',
      name: 'Judô Infantil',
      modality: 'judo',
      professor_id: null,
      max_students: 20,
      schedule: [
        { day: 'tuesday', start: '17:00', end: '18:00' },
        { day: 'thursday', start: '17:00', end: '18:00' },
      ],
      level: 'beginner',
      min_age: 5,
      max_age: 12,
      description: 'Aula de Judô para crianças de 5 a 12 anos.',
    },
    {
      id: 'class-karateteen-001',
      name: 'Karatê Adolescente',
      modality: 'karate',
      professor_id: null,
      max_students: 20,
      schedule: [
        { day: 'saturday', start: '10:00', end: '11:30' },
      ],
      level: 'intermediate',
      min_age: 12,
      max_age: 17,
      description: 'Karatê Shotokan para adolescentes.',
    },
    {
      id: 'class-mma-001',
      name: 'MMA Avançado',
      modality: 'mma',
      professor_id: null,
      max_students: 15,
      schedule: [
        { day: 'tuesday', start: '20:00', end: '21:30' },
        { day: 'thursday', start: '20:00', end: '21:30' },
      ],
      level: 'advanced',
      description: 'Treino de MMA para competidores e avançados.',
    },
  ];

  // Buscar professor IDs
  const { data: professors } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('academy_id', ACADEMY_ID)
    .eq('role', 'professor');

  const prof1 = professors?.find(p => p.email === 'professor@guerreiros.com')?.id;
  const prof2 = professors?.find(p => p.email === 'professor2@guerreiros.com')?.id;

  classes[0].professor_id = prof1 || null;
  classes[1].professor_id = prof2 || null;
  classes[2].professor_id = prof1 || null;
  classes[3].professor_id = prof2 || null;

  for (const cls of classes) {
    const { error } = await supabase.from('classes').upsert({
      ...cls,
      academy_id: ACADEMY_ID,
      status: 'active',
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) console.error(`  ❌ Turma ${cls.name}:`, error.message);
    else console.log(`  ✅ ${cls.name}`);
  }

  // ═══ ALUNOS EXTRAS ═══
  console.log('\n👥 Criando alunos extras...');
  const extraStudents = [
    { name: 'Maria Clara de Oliveira', email: 'mariaclara@email.com', belt: 'azul', stripes: 1, role: 'aluno_adulto' },
    { name: 'Pedro Henrique Santos', email: 'pedroh@email.com', belt: 'branca', stripes: 3, role: 'aluno_adulto' },
    { name: 'Ana Beatriz Lima', email: 'anab@email.com', belt: 'roxa', stripes: 0, role: 'aluno_adulto' },
    { name: 'Gabriel Souza Costa', email: 'gabriel@email.com', belt: 'branca', stripes: 1, role: 'aluno_adulto' },
    { name: 'Juliana Ferreira', email: 'juliana@email.com', belt: 'azul', stripes: 0, role: 'aluno_adulto' },
    { name: 'Ricardo Almeida Jr', email: 'ricardo@email.com', belt: 'marrom', stripes: 2, role: 'aluno_adulto' },
    { name: 'Camila Rodrigues', email: 'camila@email.com', belt: 'branca', stripes: 2, role: 'aluno_adulto' },
    { name: 'Thiago Nascimento', email: 'thiago@email.com', belt: 'azul', stripes: 3, role: 'aluno_adulto' },
    { name: 'Larissa Mendes', email: 'larissa@email.com', belt: 'branca', stripes: 0, role: 'aluno_adulto' },
    { name: 'Felipe Barbosa', email: 'felipe@email.com', belt: 'roxa', stripes: 1, role: 'aluno_adulto' },
    { name: 'Isabella Martins', email: 'isabella@email.com', belt: 'amarela', stripes: 2, role: 'aluno_teen', birth_date: '2010-08-20' },
    { name: 'Enzo Gabriel Silva', email: 'enzo@email.com', belt: 'laranja', stripes: 0, role: 'aluno_teen', birth_date: '2011-11-05' },
    { name: 'Sofia Alves', email: 'sofia@email.com', belt: 'branca', stripes: 1, role: 'aluno_kids', birth_date: '2018-04-10' },
    { name: 'Miguel Santos Oliveira', email: 'miguel@email.com', belt: 'branca', stripes: 0, role: 'aluno_kids', birth_date: '2017-07-25' },
    { name: 'Valentina Costa', email: 'valentina@email.com', belt: 'branca', stripes: 2, role: 'aluno_kids', birth_date: '2016-12-03' },
  ];

  for (const stu of extraStudents) {
    // Criar auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: stu.email,
      password: 'BlackBelt@2026',
      email_confirm: true,
      user_metadata: { display_name: stu.name, role: stu.role },
    });

    let userId: string;
    if (authError) {
      if (authError.message.includes('already')) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const existing = users?.users?.find(u => u.email === stu.email);
        if (!existing) continue;
        userId = existing.id;
      } else { console.error(`  ❌ ${stu.name}:`, authError.message); continue; }
    } else {
      userId = authData.user.id;
    }

    // Profile
    await supabase.from('profiles').upsert({
      id: userId, user_id: userId, email: stu.email,
      display_name: stu.name, role: stu.role, academy_id: ACADEMY_ID,
    }, { onConflict: 'id' });

    // Student
    await supabase.from('students').upsert({
      profile_id: userId, academy_id: ACADEMY_ID,
      belt: stu.belt, stripes: stu.stripes,
      birth_date: (stu as any).birth_date || null,
      enrollment_date: randomDateLastYear(),
      status: 'active',
    }, { onConflict: 'profile_id' });

    // Membership
    await supabase.from('memberships').upsert({
      profile_id: userId, academy_id: ACADEMY_ID,
      role: stu.role, status: 'active',
    }, { onConflict: 'profile_id,academy_id' });

    console.log(`  ✅ ${stu.name} (${stu.belt} ${stu.stripes}°)`);
  }

  // ═══ MATRÍCULAS ═══
  console.log('\n📋 Matriculando alunos nas turmas...');
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, profile_id, profiles!inner(role)')
    .eq('academy_id', ACADEMY_ID);

  for (const student of allStudents ?? []) {
    const role = (student as any).profiles?.role;
    let classId: string;

    if (role === 'aluno_kids') classId = 'class-judokids-001';
    else if (role === 'aluno_teen') classId = 'class-karateteen-001';
    else classId = Math.random() > 0.5 ? 'class-jjadulto-001' : 'class-mma-001';

    await supabase.from('class_enrollments').upsert({
      class_id: classId,
      student_id: student.id,
      status: 'active',
    }, { onConflict: 'class_id,student_id' }).then(({ error }) => {
      if (error && !error.message.includes('duplicate')) {
        console.error(`  ⚠️ Matrícula ${student.id}:`, error.message);
      }
    });
  }
  console.log(`  ✅ ${(allStudents ?? []).length} matrículas processadas`);

  // ═══ CHECK-INS (últimos 60 dias) ═══
  console.log('\n📊 Gerando histórico de presenças (60 dias)...');
  let checkinCount = 0;

  for (const student of allStudents ?? []) {
    // Cada aluno tem 2-4 check-ins por semana nos últimos 60 dias
    const frequencyPerWeek = 2 + Math.floor(Math.random() * 3);
    const totalCheckins = frequencyPerWeek * 8; // ~8 semanas

    for (let i = 0; i < totalCheckins; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(17 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      const { error } = await supabase.from('attendance').insert({
        academy_id: ACADEMY_ID,
        student_id: student.id,
        check_in_at: date.toISOString(),
        method: Math.random() > 0.3 ? 'qr_code' : 'manual',
      });

      if (!error) checkinCount++;
    }
  }
  console.log(`  ✅ ${checkinCount} check-ins gerados`);

  // ═══ PLANOS ═══
  console.log('\n💰 Criando planos...');
  const plans = [
    { id: 'plan-mensal-001', name: 'Mensal', price_cents: 15000, interval: 'monthly', max_classes_per_week: 3 },
    { id: 'plan-trimestral-001', name: 'Trimestral', price_cents: 13500, interval: 'quarterly', max_classes_per_week: 5 },
    { id: 'plan-ilimitado-001', name: 'Ilimitado', price_cents: 19900, interval: 'monthly', max_classes_per_week: null },
    { id: 'plan-kids-001', name: 'Kids/Teen', price_cents: 12000, interval: 'monthly', max_classes_per_week: 2 },
  ];

  for (const plan of plans) {
    await supabase.from('plans').upsert({
      ...plan,
      academy_id: ACADEMY_ID,
      status: 'active',
      modalities: ['jiu_jitsu', 'judo', 'karate', 'mma'],
    }, { onConflict: 'id' });
    console.log(`  ✅ ${plan.name} — R$ ${(plan.price_cents / 100).toFixed(2)}`);
  }

  // ═══ FATURAS (últimos 3 meses) ═══
  console.log('\n🧾 Gerando faturas...');
  let invoiceCount = 0;

  for (const student of (allStudents ?? []).slice(0, 20)) {
    const plan = plans[Math.floor(Math.random() * plans.length)];

    // Criar subscription
    await supabase.from('subscriptions').upsert({
      student_id: student.id,
      plan_id: plan.id,
      academy_id: ACADEMY_ID,
      status: 'active',
      started_at: randomDateLastYear(),
      gateway: 'manual',
    }, { onConflict: 'student_id,plan_id' }).catch(() => {});

    // 3 faturas (últimos 3 meses)
    for (let month = 0; month < 3; month++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() - month);
      dueDate.setDate(5);

      const isPaid = month > 0 || Math.random() > 0.2; // 80% do mês atual pago
      const isOverdue = !isPaid && month === 0 && Math.random() > 0.5;

      await supabase.from('invoices').insert({
        student_id: student.id,
        academy_id: ACADEMY_ID,
        amount_cents: plan.price_cents,
        due_date: dueDate.toISOString().split('T')[0],
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
        paid_at: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 86400000).toISOString() : null,
        payment_method: isPaid ? (Math.random() > 0.5 ? 'pix' : 'boleto') : null,
      });
      invoiceCount++;
    }
  }
  console.log(`  ✅ ${invoiceCount} faturas geradas`);

  // ═══ GRADUAÇÕES ═══
  console.log('\n🥋 Criando histórico de graduações...');
  const beltProgression = [
    { from: 'branca', to: 'branca', toStripes: 1 },
    { from: 'branca', to: 'branca', toStripes: 2 },
    { from: 'branca', to: 'branca', toStripes: 3 },
    { from: 'branca', to: 'branca', toStripes: 4 },
    { from: 'branca', to: 'azul', toStripes: 0 },
  ];

  for (const student of (allStudents ?? []).slice(0, 8)) {
    const numProgressions = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numProgressions; i++) {
      const prog = beltProgression[Math.min(i, beltProgression.length - 1)];
      const daysAgo = (numProgressions - i) * 90 + Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      await supabase.from('belt_progressions').insert({
        student_id: student.id,
        academy_id: ACADEMY_ID,
        from_belt: prog.from,
        from_stripes: i > 0 ? beltProgression[i - 1].toStripes : 0,
        to_belt: prog.to,
        to_stripes: prog.toStripes,
        promoted_by: prof1,
        promoted_at: date.toISOString(),
        notes: 'Promovido após avaliação técnica',
      });
    }
  }
  console.log('  ✅ Graduações geradas');

  // ═══ CONQUISTAS ═══
  console.log('\n🏆 Criando catálogo de conquistas...');
  const achievements = [
    { name: 'Primeira Aula', description: 'Fez o primeiro check-in', icon: '🥋', category: 'attendance', requirement: { type: 'checkins', value: 1 }, xp_reward: 50 },
    { name: 'Guerreiro da Semana', description: '5 check-ins em uma semana', icon: '🔥', category: 'attendance', requirement: { type: 'weekly_checkins', value: 5 }, xp_reward: 100 },
    { name: 'Consistência', description: '30 dias de streak', icon: '📅', category: 'attendance', requirement: { type: 'streak', value: 30 }, xp_reward: 500 },
    { name: 'Evolução', description: 'Recebeu primeira graduação', icon: '⬆️', category: 'belt', requirement: { type: 'belt_promotion', value: 1 }, xp_reward: 200 },
    { name: 'Centurião', description: '100 check-ins total', icon: '💯', category: 'attendance', requirement: { type: 'checkins', value: 100 }, xp_reward: 1000 },
    { name: 'Social Butterfly', description: 'Enviou 10 mensagens', icon: '💬', category: 'social', requirement: { type: 'messages', value: 10 }, xp_reward: 50 },
    { name: 'Madrugador', description: 'Check-in antes das 8h', icon: '🌅', category: 'attendance', requirement: { type: 'early_checkin', value: 1 }, xp_reward: 30 },
    { name: 'Competidor', description: 'Participou de um campeonato', icon: '🏅', category: 'challenge', requirement: { type: 'competition', value: 1 }, xp_reward: 300 },
  ];

  for (const ach of achievements) {
    await supabase.from('achievements').upsert(ach, { onConflict: 'name' }).catch(() => {});
  }
  console.log(`  ✅ ${achievements.length} conquistas criadas`);

  // ═══ XP PARA TEENS ═══
  console.log('\n⭐ Gerando XP para alunos teen...');
  const { data: teens } = await supabase
    .from('students')
    .select('id')
    .eq('academy_id', ACADEMY_ID)
    .in('profile_id', (await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'aluno_teen')
      .eq('academy_id', ACADEMY_ID)
    ).data?.map(p => p.id) || []);

  for (const teen of teens ?? []) {
    const xpEntries = 10 + Math.floor(Math.random() * 30);
    for (let i = 0; i < xpEntries; i++) {
      await supabase.from('xp_ledger').insert({
        student_id: teen.id,
        amount: 5 + Math.floor(Math.random() * 50),
        reason: ['attendance', 'achievement', 'quiz'][Math.floor(Math.random() * 3)],
      });
    }
  }
  console.log('  ✅ XP gerado');

  // ═══ FRANCHISE ═══
  console.log('\n🏢 Configurando rede de franquias...');
  const { data: franqueadorProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'franqueador@guerreiros.com')
    .single();

  if (franqueadorProfile) {
    await supabase.from('franchise_networks').upsert({
      id: 'net-guerreiros-001',
      name: 'Rede Guerreiros do Tatame',
      owner_profile_id: franqueadorProfile.id,
    }, { onConflict: 'id' });

    await supabase.from('franchise_academies').upsert({
      network_id: 'net-guerreiros-001',
      academy_id: ACADEMY_ID,
    }, { onConflict: 'network_id,academy_id' });

    console.log('  ✅ Rede de franquias configurada');
  }

  // ═══ RESUMO ═══
  console.log('\n═══════════════════════════════════════');
  console.log('🎉 SEED COMPLETO — Guerreiros do Tatame');
  console.log('═══════════════════════════════════════');
  console.log(`Turmas: ${classes.length}`);
  console.log(`Alunos: ${(allStudents ?? []).length + extraStudents.length}`);
  console.log(`Check-ins: ${checkinCount}`);
  console.log(`Faturas: ${invoiceCount}`);
  console.log(`Planos: ${plans.length}`);
  console.log(`Conquistas: ${achievements.length}`);
  console.log('═══════════════════════════════════════');
}

function randomDateLastYear(): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 365));
  return d.toISOString();
}

seedDemoData().catch(console.error);
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `feat: realistic demo seed — 25+ students, 4 classes, 60 days history, invoices, achievements`

---

## SEÇÃO 10 — PERFORMANCE E SEGURANÇA (15 min)

### 10A. Dynamic imports para componentes pesados

```bash
# Encontrar imports pesados
grep -rn "from 'recharts'" app/ components/ --include="*.tsx" | head -10
grep -rn "QRScanner\|QRCode" app/ components/ --include="*.tsx" | head -10
```

Para cada componente pesado, converter para dynamic import:
```typescript
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/components/charts/MonthlyChart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-800 rounded-lg" />,
  ssr: false,
});
```

### 10B. Verificar next/image

```bash
# Imagens <img> que devem ser next/image
grep -rn "<img " app/ components/ --include="*.tsx" | grep -v "// " | head -10
```

Converter `<img>` para `<Image>` do next/image onde aplicável.

### 10C. Verificar tokens em memória (segurança)

```bash
grep -rn "localStorage\|sessionStorage" lib/ app/ components/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|sw.js" | head -10
```

**Tokens NUNCA devem ir para localStorage/sessionStorage.** Supabase gerencia via cookies httpOnly.
Se encontrar armazenamento de token no storage, REMOVER.

### 10D. Verificar variáveis de ambiente não expostas

```bash
# Service role key NUNCA deve aparecer em código client-side
grep -rn "SERVICE_ROLE\|service_role" lib/ app/ components/ --include="*.ts" --include="*.tsx" | grep -v "server\|api/\|scripts/" | head -10
```

Se encontrar referência a service_role fora de server/api/scripts → REMOVER.

### 10E. Suspense boundaries

Adicionar `<Suspense>` nos layouts de cada route group:

```typescript
// app/(admin)/layout.tsx (e todos os outros)
import { Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      }>
        {children}
      </Suspense>
    </AdminShell>
  );
}
```

### 10F. Error boundaries

```typescript
// components/shared/ErrorBoundary.tsx
'use client';
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-bold text-red-500 mb-2">Algo deu errado</h2>
          <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Adicionar nos layouts.

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `perf: dynamic imports, next/image, suspense, error boundaries, security audit`

---

## SEÇÃO 11 — VERIFICAÇÃO FINAL ENTERPRISE (15 min)

### 11A. Build limpo

```bash
echo "=== TYPECHECK ==="
pnpm typecheck 2>&1 | tail -10
echo ""
echo "=== BUILD ==="
pnpm build 2>&1 | tail -20
echo ""
echo "=== GREP PROBLEMAS ==="
grep -rn "throw new Error('Not implemented')\|TODO:\|FIXME:" lib/api/ --include="*.ts" | grep -v "mock\|isMock" | head -10
echo ""
echo "=== CATCH SEM HANDLE ==="
grep -rn "catch\s*(" lib/api/ --include="*.ts" | grep -v "handleServiceError\|mock\|test\|// " | head -10
echo ""
echo "=== ANY TYPES ==="
grep -rn ": any\b\|as any" lib/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|\.d\.ts" | wc -l
```

### 11B. Verificar que NENHUM service crítico é mock-only

```bash
echo "=== SERVICES CRÍTICOS — RAMO REAL ==="
for service in admin student checkin class billing professor parent; do
  FILE=$(find lib/api -name "*${service}*" -type f | head -1)
  if [ -n "$FILE" ]; then
    HAS_SUPABASE=$(grep -c "supabase.*from\|\.from(" "$FILE" 2>/dev/null || echo 0)
    HAS_MOCK=$(grep -c "isMock" "$FILE" 2>/dev/null || echo 0)
    echo "  $service: supabase=$HAS_SUPABASE, mock_branches=$HAS_MOCK → $FILE"
  else
    echo "  ❌ $service: ARQUIVO NÃO ENCONTRADO"
  fi
done
```

### 11C. Verificar env vars necessárias

```bash
echo "=== ENV VARS USADAS ==="
grep -rhn "process.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" | \
  grep -oP 'process\.env\.\K[A-Z_]+' | sort -u
```

### 11D. RELATÓRIO FINAL ENTERPRISE

Imprimir:

```
╔═══════════════════════════════════════════════════════════╗
║  BLACKBELT v2 — RELATÓRIO ENTERPRISE FINAL               ║
╠═══════════════════════════════════════════════════════════╣

📊 BUILD
   TypeScript:     [PASS ✅ / FAIL ❌] ([N] erros)
   Next.js Build:  [PASS ✅ / FAIL ❌]
   Bundle Size:    [N] KB gzip

🔐 SUPABASE
   Client:         [Singleton ✅ / Outro]
   Key Format:     [JWT eyJ / sb_publishable]
   @supabase/ssr:  [versão]
   Migration:      050_enterprise_consolidation.sql
   Tabelas:        [N] criadas
   RLS:            [N]/[N] tabelas protegidas
   Policies:       [N] policies

🔑 AUTH (9 PERFIS)
   1. Super Admin        → /superadmin    [✅/❌]
   2. Admin              → /admin         [✅/❌]
   3. Professor           → /professor     [✅/❌]
   4. Recepcionista      → /recepcao      [✅/❌]
   5. Aluno Adulto       → /aluno         [✅/❌]
   6. Aluno Teen         → /teen          [✅/❌]
   7. Aluno Kids         → /kids          [✅/❌]
   8. Responsável        → /responsavel   [✅/❌]
   9. Franqueador        → /franqueador   [✅/❌]

⚙️ SERVICES
   Total:          [N]
   🟢 Real:        [N] ([%])
   🟡 Parcial:     [N] ([%])
   🔴 Mock only:   [N] ([%])
   Críticos real:  [7/7 ou N/7]

💳 PAGAMENTOS
   Gateway:        [Asaas pronto / Manual / Não configurado]
   Strategy:       [Plugável ✅]
   Webhook:        [Endpoint criado ✅]
   Instruções:     [Documentadas ✅]

📡 OFFLINE
   Service Worker: [Configurado ✅ / Não]
   Manifest:       [Configurado ✅ / Não]
   Check-in Queue: [Implementado ✅ / Não]
   Indicator:      [Implementado ✅ / Não]

🏛️ DADOS DEMO
   Academia:       Guerreiros do Tatame [✅/❌]
   Alunos:         [N] ([N] adultos, [N] teen, [N] kids)
   Turmas:         [N]
   Check-ins:      [N] (últimos 60 dias)
   Faturas:        [N]
   Planos:         [N]
   Graduações:     [N]
   Conquistas:     [N]

🛡️ SEGURANÇA
   Tokens em memória:     [✅/❌]
   Service key protegida: [✅/❌]
   RLS em todas tabelas:  [✅/❌]
   Error boundaries:      [✅/❌]

📱 PWA
   Manifest:       [✅/❌]
   Icons:          [✅/❌]
   Installable:    [✅/❌]

════════════════════════════════════════════════════════════

📋 CREDENCIAIS DE TESTE:
   gregoryguimaraes12@gmail.com / @Greg1994 → Super Admin
   admin@guerreiros.com / BlackBelt@2026 → Admin
   professor@guerreiros.com / BlackBelt@2026 → Professor
   recepcionista@guerreiros.com / BlackBelt@2026 → Recepcionista
   adulto@guerreiros.com / BlackBelt@2026 → Aluno Adulto
   teen@guerreiros.com / BlackBelt@2026 → Aluno Teen
   kids@guerreiros.com / BlackBelt@2026 → Aluno Kids
   responsavel@guerreiros.com / BlackBelt@2026 → Responsável
   franqueador@guerreiros.com / BlackBelt@2026 → Franqueador

════════════════════════════════════════════════════════════

🎯 NOTA ENTERPRISE: [X/10]

[Avaliação 100% honesta. Não inflar. Não minimizar.]
[O que funciona perfeitamente]
[O que precisa de ação manual do Gregory (Supabase Dashboard, Vercel, gateway)]
[O que ainda precisa de mais desenvolvimento]

════════════════════════════════════════════════════════════

🔜 PRÓXIMOS PASSOS PARA PRODUÇÃO REAL:
1. [Ação manual mais importante]
2. [Segunda mais importante]
3. [Terceira]
4. [...]

════════════════════════════════════════════════════════════

📋 ENV VARS PARA VERCEL (copiar e colar):
   NEXT_PUBLIC_SUPABASE_URL = https://tdplmmodmumryzdosmpv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [a key correta]
   NEXT_PUBLIC_USE_MOCK = false
   
   ⚠️ Opcionais (quando configurar pagamento):
   PAYMENT_GATEWAY = asaas
   ASAAS_API_KEY = [sua key]
   ASAAS_SANDBOX = true
   
   ❌ NUNCA na Vercel (só local):
   SUPABASE_SERVICE_ROLE_KEY

╚═══════════════════════════════════════════════════════════╝
```

### 11E. Push final

```bash
pnpm typecheck — ZERO erros
pnpm build — ZERO erros

git add -A
git commit -m "release: BlackBelt v2 Enterprise — all services real, payment gateway, offline-first, demo seed"
git push origin main --force
```

---

## COMANDO DE RETOMADA — FASE 3

```
Continue de onde parou na FASE 3 do BLACKBELT_ENTERPRISE_P3.md. Verifique estado: ls scripts/seed-demo-data.ts 2>/dev/null && pnpm typecheck 2>&1 | tail -5 && cat AUDIT_SERVICES.md 2>/dev/null | grep -c "🟢". Continue da próxima seção incompleta. ZERO erros. Commit e push. Comece agora.
```

---

## COMANDO MASTER — EXECUTAR AS 3 FASES

```
Existem 3 arquivos na raiz do projeto:
- BLACKBELT_ENTERPRISE_P1.md (Fase 1: Diagnóstico, Auth, Schema)
- BLACKBELT_ENTERPRISE_P2.md (Fase 2: Services, Pagamento, Offline)
- BLACKBELT_ENTERPRISE_P3.md (Fase 3: Seed, Performance, Verificação)

Leia a FASE 1 primeiro. Execute TODAS as seções na ordem. Ao terminar a Fase 1, leia a Fase 2 e execute. Ao terminar a Fase 2, leia a Fase 3 e execute. pnpm typecheck && pnpm build ZERO erros a cada seção. Commit a cada seção. O relatório final da Seção 11 é OBRIGATÓRIO. Comece agora.
```

/**
 * Seed Franchise — BlackBelt v2
 *
 * Popula as tabelas de franquia com dados realistas para 3 unidades.
 * Idempotente: usa upsert (on conflict) ou deleta-e-recria onde necessario.
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/seed-franchise.ts
 */

import { createClient } from '@supabase/supabase-js';

// ── ENV ──────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── CONSTANTS ────────────────────────────────────────────────────────
const FRANCHISE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const ACADEMIES = {
  vespasiano: '809f2763-0096-4cfa-8057-b5b029cbc62f',
  bhCentro:   'fd32f7fb-4621-40e7-b5f7-3a2903c82994',
  contagem:   'e0a4033e-7c0b-4408-ac03-d9749962a33b',
} as const;

const FRANQUEADOR_ID = 'c579e4e6-0681-4e31-835d-1692f8e878d2'; // Fernando Almeida

// Fixed UUIDs for idempotency
const UNIT_IDS = {
  vespasiano: '11111111-aaaa-4000-bbbb-000000000001',
  bhCentro:   '11111111-aaaa-4000-bbbb-000000000002',
  contagem:   '11111111-aaaa-4000-bbbb-000000000003',
};

const ACADEMY_IDS = {
  vespasiano: '22222222-aaaa-4000-bbbb-000000000001',
  bhCentro:   '22222222-aaaa-4000-bbbb-000000000002',
  contagem:   '22222222-aaaa-4000-bbbb-000000000003',
};

const BROADCAST_IDS = {
  b1: '33333333-aaaa-4000-bbbb-000000000001',
  b2: '33333333-aaaa-4000-bbbb-000000000002',
};

// ── HELPERS ──────────────────────────────────────────────────────────

function ok(label: string, count: number) {
  console.log(`  ✓ ${label}: ${count} registros`);
}

function fail(label: string, err: unknown) {
  const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : String(err);
  console.error(`  ✗ ${label}: ${msg}`);
}

// ── SEED ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('══════════════════════════════════════════');
  console.log(' Seed Franchise — BlackBelt v2');
  console.log('══════════════════════════════════════════\n');

  // ─── 0. Ensure franchise_networks row exists (table may not exist in remote) ───
  console.log('0. Franchise network...');
  {
    const { error } = await supabase
      .from('franchise_networks')
      .upsert({
        id: FRANCHISE_ID,
        name: 'Guerreiros do Tatame Franquias',
        owner_profile_id: FRANQUEADOR_ID,
      }, { onConflict: 'id' });
    if (error) {
      // Table may not exist in remote DB — not critical, franchise_id is just a UUID reference
      console.log('  ⚠ franchise_networks nao disponivel (tabela pode nao existir). Prosseguindo...');
    } else {
      ok('franchise_networks', 1);
    }
  }

  // ─── 1. franchise_units (3) ───
  console.log('\n1. Franchise units...');
  {
    // Note: migration 090 columns (manager_name, manager_email, students_count,
    // revenue_monthly, health_score, compliance_score, opened_at) are NOT in the
    // remote DB yet. Using only base columns from migration 038.
    const units = [
      {
        id: UNIT_IDS.vespasiano,
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.vespasiano,
        name: 'Guerreiros Vespasiano',
        city: 'Vespasiano',
        state: 'MG',
        address: 'Av. Prefeito Sebastiao Fernandes, 500 - Centro',
        phone: '(31) 99999-0001',
        status: 'ativa',
      },
      {
        id: UNIT_IDS.bhCentro,
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.bhCentro,
        name: 'Guerreiros BH Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua da Bahia, 1234 - Centro',
        phone: '(31) 99999-0002',
        status: 'ativa',
      },
      {
        id: UNIT_IDS.contagem,
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.contagem,
        name: 'Guerreiros Contagem',
        city: 'Contagem',
        state: 'MG',
        address: 'Rua das Flores, 789 - Industrial',
        phone: '(31) 99999-0003',
        status: 'ativa',
      },
    ];

    const { error } = await supabase
      .from('franchise_units')
      .upsert(units, { onConflict: 'id' });
    if (error) fail('franchise_units', error);
    else ok('franchise_units', units.length);
  }

  // ─── 2. franchise_academies (3) ───
  console.log('\n2. Franchise academies...');
  {
    const academies = [
      {
        id: ACADEMY_IDS.vespasiano,
        franchise_id: FRANCHISE_ID,
        name: 'Guerreiros Vespasiano',
        city: 'Vespasiano',
        students_count: 45,
        revenue: 12000,
        attendance_rate: 85,
        nps: 8.5,
        status: 'ativa',
      },
      {
        id: ACADEMY_IDS.bhCentro,
        franchise_id: FRANCHISE_ID,
        name: 'Guerreiros BH Centro',
        city: 'Belo Horizonte',
        students_count: 25,
        revenue: 7000,
        attendance_rate: 78,
        nps: 9.0,
        status: 'ativa',
      },
      {
        id: ACADEMY_IDS.contagem,
        franchise_id: FRANCHISE_ID,
        name: 'Guerreiros Contagem',
        city: 'Contagem',
        students_count: 35,
        revenue: 5500,
        attendance_rate: 82,
        nps: 7.8,
        status: 'ativa',
      },
    ];

    const { error } = await supabase
      .from('franchise_academies')
      .upsert(academies, { onConflict: 'id' });
    if (error) fail('franchise_academies', error);
    else ok('franchise_academies', academies.length);
  }

  // ─── 3. franchise_financials (18: 3 units × 6 months) ───
  console.log('\n3. Franchise financials...');
  {
    const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

    // Vespasiano: R$8000 → R$12000 growing
    const vespRevenues = [8000, 8800, 9600, 10400, 11200, 12000];
    // BH Centro: R$3000 → R$7000 growing fast
    const bhRevenues   = [3000, 3800, 4600, 5400, 6200, 7000];
    // Contagem: R$5000 → R$5500 stable
    const ctgRevenues  = [5000, 5100, 5200, 5300, 5400, 5500];

    const financials: Array<{
      id: string;
      franchise_id: string;
      academy_id: string;
      month: string;
      revenue: number;
      royalties: number;
    }> = [];

    const buildFinancials = (academyId: string, revenues: number[], prefix: string) => {
      months.forEach((month, i) => {
        const rev = revenues[i];
        financials.push({
          id: `${prefix}-${month}`.replace(/[^a-f0-9-]/g, '0').padEnd(36, '0').slice(0, 8) +
              '-0000-4000-a000-' + (i + 1).toString().padStart(12, '0'),
          franchise_id: FRANCHISE_ID,
          academy_id: academyId,
          month,
          revenue: rev,
          royalties: Math.round(rev * 0.05 * 100) / 100, // 5%
        });
      });
    };

    // Use deterministic UUIDs for idempotency
    const vespFinIds = months.map((_, i) => `44444441-aaaa-4000-bbbb-${(i + 1).toString().padStart(12, '0')}`);
    const bhFinIds   = months.map((_, i) => `44444442-aaaa-4000-bbbb-${(i + 1).toString().padStart(12, '0')}`);
    const ctgFinIds  = months.map((_, i) => `44444443-aaaa-4000-bbbb-${(i + 1).toString().padStart(12, '0')}`);

    const fins: typeof financials = [];
    months.forEach((month, i) => {
      fins.push({
        id: vespFinIds[i],
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.vespasiano,
        month,
        revenue: vespRevenues[i],
        royalties: Math.round(vespRevenues[i] * 0.05 * 100) / 100,
      });
      fins.push({
        id: bhFinIds[i],
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.bhCentro,
        month,
        revenue: bhRevenues[i],
        royalties: Math.round(bhRevenues[i] * 0.05 * 100) / 100,
      });
      fins.push({
        id: ctgFinIds[i],
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.contagem,
        month,
        revenue: ctgRevenues[i],
        royalties: Math.round(ctgRevenues[i] * 0.05 * 100) / 100,
      });
    });

    const { error } = await supabase
      .from('franchise_financials')
      .upsert(fins, { onConflict: 'id' });
    if (error) fail('franchise_financials', error);
    else ok('franchise_financials', fins.length);
  }

  // ─── 4. franchise_compliance_checks (3) ───
  console.log('\n4. Franchise compliance checks...');
  {
    const checks = [
      {
        id: '55555555-aaaa-4000-bbbb-000000000001',
        academy_id: ACADEMIES.vespasiano,
        academy_name: 'Guerreiros Vespasiano',
        overall_score: 95,
        results: JSON.stringify([
          { item: 'Identidade visual', score: 100, status: 'conforme' },
          { item: 'Curriculo padrao', score: 95, status: 'conforme' },
          { item: 'NPS minimo 7.5', score: 100, status: 'conforme' },
          { item: 'Higiene e limpeza', score: 90, status: 'conforme' },
          { item: 'Documentacao em dia', score: 90, status: 'conforme' },
        ]),
        checked_at: '2026-03-15T10:00:00Z',
        checked_by: FRANQUEADOR_ID,
      },
      {
        id: '55555555-aaaa-4000-bbbb-000000000002',
        academy_id: ACADEMIES.bhCentro,
        academy_name: 'Guerreiros BH Centro',
        overall_score: 88,
        results: JSON.stringify([
          { item: 'Identidade visual', score: 95, status: 'conforme' },
          { item: 'Curriculo padrao', score: 85, status: 'parcial' },
          { item: 'NPS minimo 7.5', score: 100, status: 'conforme' },
          { item: 'Higiene e limpeza', score: 80, status: 'parcial' },
          { item: 'Documentacao em dia', score: 80, status: 'parcial' },
        ]),
        checked_at: '2026-03-15T14:00:00Z',
        checked_by: FRANQUEADOR_ID,
      },
      {
        id: '55555555-aaaa-4000-bbbb-000000000003',
        academy_id: ACADEMIES.contagem,
        academy_name: 'Guerreiros Contagem',
        overall_score: 72,
        results: JSON.stringify([
          { item: 'Identidade visual', score: 70, status: 'parcial' },
          { item: 'Curriculo padrao', score: 60, status: 'nao_conforme' },
          { item: 'NPS minimo 7.5', score: 80, status: 'conforme' },
          { item: 'Higiene e limpeza', score: 75, status: 'parcial' },
          { item: 'Documentacao em dia', score: 75, status: 'parcial' },
        ]),
        checked_at: '2026-03-15T16:00:00Z',
        checked_by: FRANQUEADOR_ID,
      },
    ];

    const { error } = await supabase
      .from('franchise_compliance_checks')
      .upsert(checks, { onConflict: 'id' });
    if (error) fail('franchise_compliance_checks', error);
    else ok('franchise_compliance_checks', checks.length);
  }

  // ─── 5. franchise_alerts (3) ───
  // DB constraint: type IN ('high_churn','overdue','attendance_drop','low_nps')
  // DB constraint: severity IN ('warning','critical')
  console.log('\n5. Franchise alerts...');
  {
    const alerts = [
      {
        id: '66666666-aaaa-4000-bbbb-000000000001',
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.contagem,
        academy_name: 'Guerreiros Contagem',
        type: 'overdue',
        message: 'Royalty do mes 2026-02 atrasado ha 15 dias. Valor: R$275,00.',
        severity: 'critical',
      },
      {
        id: '66666666-aaaa-4000-bbbb-000000000002',
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.contagem,
        academy_name: 'Guerreiros Contagem',
        type: 'low_nps',
        message: 'Score de compliance abaixo de 75% (72%). Acao corretiva necessaria.',
        severity: 'warning',
      },
      {
        id: '66666666-aaaa-4000-bbbb-000000000003',
        franchise_id: FRANCHISE_ID,
        academy_id: ACADEMIES.bhCentro,
        academy_name: 'Guerreiros BH Centro',
        type: 'high_churn',
        message: 'Crescimento de +15% na receita no ultimo trimestre. Parabens!',
        severity: 'warning',
      },
    ];

    const { error } = await supabase
      .from('franchise_alerts')
      .upsert(alerts, { onConflict: 'id' });
    if (error) fail('franchise_alerts', error);
    else ok('franchise_alerts', alerts.length);
  }

  // ─── 6. franchise_curriculos (1) ───
  console.log('\n6. Franchise curriculos...');
  {
    const curriculos = [
      {
        id: '77777777-aaaa-4000-bbbb-000000000001',
        franchise_id: FRANCHISE_ID,
        modalidade: 'Jiu-Jitsu',
        nome: 'Curriculo Padrao Guerreiros — Jiu-Jitsu',
        descricao: 'Curriculo oficial da rede Guerreiros para Jiu-Jitsu, cobrindo faixa branca ate preta.',
        modulos: JSON.stringify([
          {
            nome: 'Modulo 1 — Fundamentos (Branca)',
            descricao: 'Base, guarda fechada, montada, raspagens basicas',
            faixa: 'branca',
            duracao_meses: 12,
            tecnicas: ['guarda fechada', 'montada', 'side control', 'raspagem tesoura', 'armlock da guarda'],
          },
          {
            nome: 'Modulo 2 — Intermediario (Azul)',
            descricao: 'Guarda aberta, passagens, transicoes, finalizacoes',
            faixa: 'azul',
            duracao_meses: 18,
            tecnicas: ['de la riva', 'spider guard', 'berimbolo', 'passagem toreando', 'triangle'],
          },
          {
            nome: 'Modulo 3 — Avancado (Roxa/Marrom)',
            descricao: 'Jogo de competicao, leg locks, wrestle-up, game plan',
            faixa: 'roxa',
            duracao_meses: 24,
            tecnicas: ['heel hook', 'k-guard', 'wrestle-up', 'leg drag', 'lasso guard'],
          },
        ]),
      },
    ];

    const { error } = await supabase
      .from('franchise_curriculos')
      .upsert(curriculos, { onConflict: 'id' });
    if (error) fail('franchise_curriculos', error);
    else ok('franchise_curriculos', curriculos.length);
  }

  // ─── 7. franchise_standards (3) ───
  console.log('\n7. Franchise standards...');
  {
    const standards = [
      {
        id: '88888888-aaaa-4000-bbbb-000000000001',
        franchise_id: FRANCHISE_ID,
        category: 'visual',
        name: 'Identidade Visual Padrao',
        description: 'Todas as unidades devem seguir o manual de identidade visual da rede Guerreiros.',
        required: true,
        checklist_items: JSON.stringify([
          'Logo Guerreiros na fachada',
          'Cores padrao (preto, dourado, branco)',
          'Uniforme padrao para professores',
          'Tatame com logo central',
          'Material de marketing padronizado',
        ]),
        deadline: '2026-06-30',
      },
      {
        id: '88888888-aaaa-4000-bbbb-000000000002',
        franchise_id: FRANCHISE_ID,
        category: 'pedagogico',
        name: 'Curriculo Oficial',
        description: 'Todas as unidades devem seguir o curriculo oficial de Jiu-Jitsu da rede.',
        required: true,
        checklist_items: JSON.stringify([
          'Curriculo Guerreiros implementado',
          'Avaliacao trimestral de alunos',
          'Registro de evolucao por faixa',
          'Plano de aula semanal documentado',
        ]),
        deadline: '2026-04-30',
      },
      {
        id: '88888888-aaaa-4000-bbbb-000000000003',
        franchise_id: FRANCHISE_ID,
        category: 'qualidade',
        name: 'NPS Minimo 7.5',
        description: 'Todas as unidades devem manter NPS acima de 7.5 na pesquisa trimestral.',
        required: true,
        checklist_items: JSON.stringify([
          'Pesquisa NPS aplicada trimestralmente',
          'Plano de acao para NPS < 7.5',
          'Resposta a detratores em 48h',
          'Relatorio mensal de satisfacao',
        ]),
        deadline: '2026-03-31',
      },
    ];

    const { error } = await supabase
      .from('franchise_standards')
      .upsert(standards, { onConflict: 'id' });
    if (error) fail('franchise_standards', error);
    else ok('franchise_standards', standards.length);
  }

  // ─── 8. franchise_broadcasts (2) + receipts (6) ───
  console.log('\n8. Franchise broadcasts + receipts...');
  {
    const broadcasts = [
      {
        id: BROADCAST_IDS.b1,
        franchise_id: FRANCHISE_ID,
        type: 'comunicado',
        subject: 'Novo curriculo de Jiu-Jitsu disponivel',
        body: 'Prezados franqueados, o novo curriculo padrao de Jiu-Jitsu ja esta disponivel no sistema. Favor implementar ate 30/04/2026. Qualquer duvida, entre em contato.',
        channels: JSON.stringify(['email', 'push']),
        recipient_ids: [ACADEMIES.vespasiano, ACADEMIES.bhCentro, ACADEMIES.contagem],
        sent_at: '2026-03-20T09:00:00Z',
        created_by: FRANQUEADOR_ID,
      },
      {
        id: BROADCAST_IDS.b2,
        franchise_id: FRANCHISE_ID,
        type: 'comunicado',
        subject: 'Lembrete: Pagamento de royalties marco/2026',
        body: 'Lembramos que o pagamento dos royalties referentes a marco/2026 vence em 10/04/2026. Unidades com pagamento em dia terao desconto de 2% no proximo mes.',
        channels: JSON.stringify(['email']),
        recipient_ids: [ACADEMIES.vespasiano, ACADEMIES.bhCentro, ACADEMIES.contagem],
        sent_at: '2026-03-28T08:00:00Z',
        created_by: FRANQUEADOR_ID,
      },
    ];

    const { error: bErr } = await supabase
      .from('franchise_broadcasts')
      .upsert(broadcasts, { onConflict: 'id' });
    if (bErr) fail('franchise_broadcasts', bErr);
    else ok('franchise_broadcasts', broadcasts.length);

    const receipts = [
      // Broadcast 1 receipts
      {
        id: '99999991-aaaa-4000-bbbb-000000000001',
        broadcast_id: BROADCAST_IDS.b1,
        academy_id: ACADEMIES.vespasiano,
        academy_name: 'Guerreiros Vespasiano',
        status: 'lido',
        read_at: '2026-03-20T10:30:00Z',
      },
      {
        id: '99999991-aaaa-4000-bbbb-000000000002',
        broadcast_id: BROADCAST_IDS.b1,
        academy_id: ACADEMIES.bhCentro,
        academy_name: 'Guerreiros BH Centro',
        status: 'lido',
        read_at: '2026-03-20T14:00:00Z',
      },
      {
        id: '99999991-aaaa-4000-bbbb-000000000003',
        broadcast_id: BROADCAST_IDS.b1,
        academy_id: ACADEMIES.contagem,
        academy_name: 'Guerreiros Contagem',
        status: 'entregue',
        read_at: null,
      },
      // Broadcast 2 receipts
      {
        id: '99999992-aaaa-4000-bbbb-000000000001',
        broadcast_id: BROADCAST_IDS.b2,
        academy_id: ACADEMIES.vespasiano,
        academy_name: 'Guerreiros Vespasiano',
        status: 'lido',
        read_at: '2026-03-28T09:15:00Z',
      },
      {
        id: '99999992-aaaa-4000-bbbb-000000000002',
        broadcast_id: BROADCAST_IDS.b2,
        academy_id: ACADEMIES.bhCentro,
        academy_name: 'Guerreiros BH Centro',
        status: 'enviado',
        read_at: null,
      },
      {
        id: '99999992-aaaa-4000-bbbb-000000000003',
        broadcast_id: BROADCAST_IDS.b2,
        academy_id: ACADEMIES.contagem,
        academy_name: 'Guerreiros Contagem',
        status: 'enviado',
        read_at: null,
      },
    ];

    const { error: rErr } = await supabase
      .from('franchise_broadcast_receipts')
      .upsert(receipts, { onConflict: 'id' });
    if (rErr) fail('franchise_broadcast_receipts', rErr);
    else ok('franchise_broadcast_receipts', receipts.length);
  }

  // ─── 9. franchise_leads (3) ───
  console.log('\n9. Franchise leads...');
  {
    const leads = [
      {
        id: 'aaaaaaaa-aaaa-4000-bbbb-000000000001',
        franchise_id: FRANCHISE_ID,
        name: 'Ricardo Mendes',
        email: 'ricardo@email.com',
        phone: '(31) 98888-1111',
        city: 'Betim',
        state: 'MG',
        investment_capacity: 80000,
        experience: 'Faixa roxa, 5 anos de experiencia como instrutor. Tem espaco proprio de 120m2.',
        stage: 'analise',
        viability_score: 85,
        onboarding_step: 'analise_documentos',
        notes: 'Candidato forte. Espaco ja adequado para tatame. Boa localizacao.',
      },
      {
        id: 'aaaaaaaa-aaaa-4000-bbbb-000000000002',
        franchise_id: FRANCHISE_ID,
        name: 'Patricia Oliveira',
        email: 'patricia@email.com',
        phone: '(31) 98888-2222',
        city: 'Santa Luzia',
        state: 'MG',
        investment_capacity: 60000,
        experience: 'Empreendedora, faixa azul. Experiencia em gestao de academia de musculacao.',
        stage: 'lead',
        viability_score: 72,
        onboarding_step: null,
        notes: 'Interesse demonstrado na feira de franquias. Agendar reuniao.',
      },
      {
        id: 'aaaaaaaa-aaaa-4000-bbbb-000000000003',
        franchise_id: FRANCHISE_ID,
        name: 'Marcos Ferreira',
        email: 'marcos@email.com',
        phone: '(31) 98888-3333',
        city: 'Sabara',
        state: 'MG',
        investment_capacity: 120000,
        experience: 'Faixa preta, professor ha 10 anos. Quer abrir uma franquia propria.',
        stage: 'aprovado',
        viability_score: 92,
        onboarding_step: 'assinatura_contrato',
        notes: 'Aprovado. Experiencia excelente. Espaco em negociacao na regiao central de Sabara.',
      },
    ];

    const { error } = await supabase
      .from('franchise_leads')
      .upsert(leads, { onConflict: 'id' });
    if (error) fail('franchise_leads', error);
    else ok('franchise_leads', leads.length);
  }

  // ─── 10. VERIFICACAO ───
  console.log('\n══════════════════════════════════════════');
  console.log(' Verificacao de contagens');
  console.log('══════════════════════════════════════════\n');

  const tables = [
    'franchise_networks',
    'franchise_units',
    'franchise_academies',
    'franchise_financials',
    'franchise_compliance_checks',
    'franchise_alerts',
    'franchise_curriculos',
    'franchise_standards',
    'franchise_broadcasts',
    'franchise_broadcast_receipts',
    'franchise_leads',
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${table}: ERRO — ${error.message}`);
    } else {
      console.log(`  ${table}: ${count} registros`);
    }
  }

  console.log('\nSeed concluido!');
}

seed().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});

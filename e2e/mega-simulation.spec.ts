import { test } from '@playwright/test';
import { ALL_USERS, login, logout, visitPage, InteractionResult } from './mega-helpers';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════════════════
// ROUTES — from `find app -name 'page.tsx' | sort` (282 pages)
// Dynamic [id]/[slug]/[token] routes excluded (need specific IDs)
// ═══════════════════════════════════════════════════════════════

const ROUTES: Record<string, string[]> = {
  admin: [
    '/admin',
    '/admin/acesso',
    '/admin/acesso/proximidade',
    '/admin/alunos',
    '/admin/analytics',
    '/admin/analytics/churn',
    '/admin/analytics/professores',
    '/admin/auditoria',
    '/admin/aula-experimental',
    '/admin/automacoes',
    '/admin/calendario',
    '/admin/campanhas',
    '/admin/campeonatos',
    '/admin/comercial',
    '/admin/comunicados',
    '/admin/configuracoes',
    '/admin/configuracoes/audit-log',
    '/admin/configuracoes/marca',
    '/admin/configuracoes/pagamento',
    '/admin/configuracoes/sso',
    '/admin/conteudo',
    '/admin/contratos',
    '/admin/convites',
    '/admin/crm',
    '/admin/curriculo',
    '/admin/equipe',
    '/admin/espacos',
    '/admin/estoque',
    '/admin/eventos',
    '/admin/financeiro',
    '/admin/gamificacao',
    '/admin/gamificacao/recompensas',
    '/admin/graduacoes',
    '/admin/importar',
    '/admin/inadimplencia',
    '/admin/indicar',
    '/admin/integracoes/api',
    '/admin/integracoes/webhooks',
    '/admin/iot',
    '/admin/leads',
    '/admin/liga',
    '/admin/loja',
    '/admin/loja/pedidos',
    '/admin/loja/produtos',
    '/admin/marketplace',
    '/admin/mensagens',
    '/admin/notificacoes',
    '/admin/nps',
    '/admin/pedagogico',
    '/admin/perfil',
    '/admin/plano-plataforma',
    '/admin/plano',
    '/admin/plugins',
    '/admin/relatorio-professores',
    '/admin/relatorios',
    '/admin/retencao',
    '/admin/royalties',
    '/admin/setup-wizard',
    '/admin/setup',
    '/admin/sistema',
    '/admin/site',
    '/admin/substituicao',
    '/admin/tecnicas',
    '/admin/torneios',
    '/admin/turmas',
    '/admin/unidades',
    '/admin/whatsapp',
    '/admin/wizard',
  ],
  professor: [
    '/professor',
    '/professor/agenda',
    '/professor/alertas',
    '/professor/alunos',
    '/professor/analise-luta',
    '/professor/avaliacao-fisica',
    '/professor/avaliacoes',
    '/professor/calendario',
    '/professor/configuracoes',
    '/professor/conteudo',
    '/professor/diario',
    '/professor/duvidas',
    '/professor/mensagens',
    '/professor/perfil',
    '/professor/periodizacao',
    '/professor/plano-aula',
    '/professor/plano-treino',
    '/professor/presenca',
    '/professor/relatorios',
    '/professor/tecnicas',
    '/professor/turma-ativa',
    '/professor/turmas',
    '/meus-cursos',
    '/meus-cursos/financeiro',
    '/meus-cursos/novo',
    '/plano-aula',
    '/turma-ativa',
    '/turma-ativa/gravar',
  ],
  recepcionista: [
    '/recepcao',
    '/recepcao/acesso',
    '/recepcao/agenda',
    '/recepcao/atendimento',
    '/recepcao/cadastro',
    '/recepcao/caixa',
    '/recepcao/checkin',
    '/recepcao/cobrancas',
    '/recepcao/configuracoes',
    '/recepcao/experimentais',
    '/recepcao/mensagens',
  ],
  aluno_adulto: [
    '/dashboard',
    '/dashboard/checkin',
    '/dashboard/configuracoes',
    '/dashboard/conquistas',
    '/dashboard/conteudo',
    '/dashboard/mensagens',
    '/dashboard/meu-progresso',
    '/dashboard/perfil',
    '/dashboard/perfil/pagamentos',
    '/dashboard/progresso',
    '/dashboard/turmas',
    '/academia',
    '/academia/glossario',
    '/avaliacao-fisica',
    '/battle-pass',
    '/carrinho',
    '/carteirinha',
    '/certificados',
    '/checkout-loja',
    '/comunidade',
    '/curriculo',
    '/desafios',
    '/eventos',
    '/feed',
    '/hall-da-fama',
    '/indicar',
    '/liga',
    '/loja',
    '/loja/desejos',
    '/mensagens',
    '/metas',
    '/perfil',
    '/perfil/notificacoes',
    '/perfil/privacidade',
    '/periodizacao',
    '/personal-ai',
    '/plano-treino',
    '/planos',
    '/progresso/videos',
    '/recompensas',
    '/saude',
    '/season',
    '/tecnicas',
    '/titulos',
    '/torneios',
  ],
  aluno_teen: [
    '/teen',
    '/teen/academia',
    '/teen/configuracoes',
    '/teen/conquistas',
    '/teen/conteudo',
    '/teen/desafios',
    '/teen/mensagens',
    '/teen/perfil',
    '/teen/ranking',
    '/teen/season',
    '/teen/turmas',
  ],
  aluno_kids: [
    '/kids',
    '/kids/academia',
    '/kids/configuracoes',
    '/kids/conquistas',
    '/kids/conteudo',
    '/kids/figurinhas',
    '/kids/minha-faixa',
    '/kids/perfil',
    '/kids/recompensas',
  ],
  responsavel: [
    '/parent',
    '/parent/agenda',
    '/parent/autorizacoes',
    '/parent/checkin',
    '/parent/configuracoes',
    '/parent/mensagens',
    '/parent/notificacoes',
    '/parent/pagamentos',
    '/parent/perfil',
    '/parent/presencas',
    '/parent/relatorios',
  ],
  franqueador: [
    '/franqueador',
    '/franqueador/comunicacao',
    '/franqueador/configuracoes',
    '/franqueador/curriculo',
    '/franqueador/expansao',
    '/franqueador/padroes',
    '/franqueador/royalties',
    '/franqueador/unidades',
  ],
  superadmin: [
    '/superadmin',
    '/superadmin/academias',
    '/superadmin/analytics',
    '/superadmin/auditoria',
    '/superadmin/beta',
    '/superadmin/compete',
    '/superadmin/comunicacao',
    '/superadmin/configuracoes',
    '/superadmin/configuracoes/storage',
    '/superadmin/contatos',
    '/superadmin/features',
    '/superadmin/health',
    '/superadmin/onboarding',
    '/superadmin/pipeline',
    '/superadmin/planos',
    '/superadmin/prospeccao',
    '/superadmin/receita',
    '/superadmin/suporte',
    '/superadmin/usuarios',
  ],
};

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastrar-academia',
  '/ajuda',
  '/app-store',
  '/aula-experimental',
  '/beta-invite',
  '/blog',
  '/campeonatos',
  '/changelog',
  '/compete',
  '/compete/ranking',
  '/completar-cadastro',
  '/contato',
  '/developers',
  '/developers/api-reference',
  '/developers/sandbox',
  '/marketplace',
  '/precos',
  '/privacidade',
  '/ranking',
  '/sobre',
  '/status',
  '/termos',
  '/esqueci-senha',
  '/comecar',
];

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

const allResults: Record<string, InteractionResult[]> = {};

test.describe.serial('MEGA SIMULATION', () => {

  test('PUBLIC pages', async ({ page }) => {
    const results: InteractionResult[] = [];
    for (const route of PUBLIC_ROUTES) {
      console.log(`\n── PUBLIC: ${route} ──`);
      const r = await visitPage(page, route);
      results.push(...r);
      for (const item of r) {
        if (item.result !== 'ok') {
          console.log(`  ${item.result === 'crash' ? '💥' : item.result === 'empty' ? '⚠️' : '❌'} ${item.element} → ${item.details}`);
        }
      }
    }
    allResults['public'] = results;
  });

  for (const user of ALL_USERS) {
    const routes = ROUTES[user.role] ?? [];

    test(`${user.role.toUpperCase()} — ${user.email} (${routes.length} pages)`, async ({ page }) => {
      const results: InteractionResult[] = [];

      const ok = await login(page, user);
      if (!ok) {
        results.push({ page: '/login', element: 'auth', action: 'login', result: 'error', details: `Login failed: ${user.email}` });
        allResults[user.role] = results;
        return;
      }
      results.push({ page: '/login', element: 'auth', action: 'login', result: 'ok', details: user.role });

      for (const route of routes) {
        console.log(`\n── ${user.role.toUpperCase()}: ${route} ──`);
        const r = await visitPage(page, route);
        results.push(...r);
        for (const item of r) {
          if (item.result !== 'ok') {
            console.log(`  ${item.result === 'crash' ? '💥' : item.result === 'empty' ? '⚠️' : '❌'} ${item.element} → ${item.details}`);
          }
        }
      }

      allResults[user.role] = results;
      await logout(page);
    });
  }
});

test.afterAll(() => {
  const lines: string[] = [];
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║     BLACKBELT v2 — MEGA SIMULAÇÃO REPORT                    ║');
  lines.push(`║     ${new Date().toISOString().substring(0, 19)}                              ║`);
  lines.push('╠═══════════════════════════════════════════════════════════════╣');

  let grandTotal = 0, grandOk = 0, grandErr = 0, grandCrash = 0, grandEmpty = 0;

  for (const [role, results] of Object.entries(allResults)) {
    const ok = results.filter(r => r.result === 'ok').length;
    const err = results.filter(r => r.result === 'error').length;
    const crash = results.filter(r => r.result === 'crash').length;
    const empty = results.filter(r => r.result === 'empty').length;
    const total = results.length;
    grandTotal += total; grandOk += ok; grandErr += err; grandCrash += crash; grandEmpty += empty;
    const score = total > 0 ? Math.round(ok / total * 100) : 0;
    const icon = crash > 0 ? '💥' : err > 0 ? '❌' : '✅';
    lines.push(`║  ${icon} ${role.toUpperCase().padEnd(16)} ${String(ok).padStart(3)}/${String(total).padStart(3)} OK (${String(score).padStart(3)}%)  💥${String(crash).padStart(2)} ❌${String(err).padStart(2)} ⚠️${String(empty).padStart(2)} ║`);

    const problems = results.filter(r => r.result !== 'ok');
    for (const p of problems.slice(0, 5)) {
      const line = `     ${p.page} → ${p.element}: ${p.details}`.substring(0, 59);
      lines.push(`║  ${line.padEnd(59)}║`);
    }
    if (problems.length > 5) {
      lines.push(`║     ... +${problems.length - 5} more`.padEnd(62) + '║');
    }
  }

  const grandScore = grandTotal > 0 ? Math.round(grandOk / grandTotal * 100) : 0;
  lines.push('╠═══════════════════════════════════════════════════════════════╣');
  lines.push(`║  TOTAL: ${grandOk}/${grandTotal} (${grandScore}%)`.padEnd(62) + '║');
  lines.push(`║  ✅ ${grandOk}  ❌ ${grandErr}  💥 ${grandCrash}  ⚠️ ${grandEmpty}`.padEnd(62) + '║');
  const statusLabel = grandScore >= 90 ? 'PRODUCTION-READY ✅' : grandScore >= 70 ? 'NEEDS FIXES ⚠️' : 'NOT READY ❌';
  lines.push(`║  STATUS: ${statusLabel}`.padEnd(62) + '║');
  lines.push('╚═══════════════════════════════════════════════════════════════╝');

  const report = lines.join('\n');
  console.log(report);

  try {
    fs.writeFileSync('e2e/MEGA_SIMULATION_REPORT.txt', report);
    fs.writeFileSync('e2e/mega-results.json', JSON.stringify(allResults, null, 2));
  } catch (e) {
    console.error('Failed to write report files:', e);
  }
});

import { test } from '@playwright/test';
import { USERS, login, testPage, PageResult } from './helpers';
import * as fs from 'fs';

// ══════════════════════════════════════════════
// PUBLIC ROUTES — no login needed
// ══════════════════════════════════════════════
const PUBLIC_ROUTES = [
  '/',
  '/ajuda',
  '/app-store',
  '/aula-experimental',
  '/beta-invite',
  '/blog',
  '/cadastrar-academia',
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
];

// ══════════════════════════════════════════════
// AUTH ROUTES — no login needed
// ══════════════════════════════════════════════
const AUTH_ROUTES = [
  '/login',
  '/cadastro',
  '/comecar',
  '/esqueci-senha',
  '/redefinir-senha',
  '/selecionar-perfil',
  '/senha-alterada',
];

// ══════════════════════════════════════════════
// ROUTES PER PROFILE — extracted from: find app -name 'page.tsx'
// Dynamic [id] routes excluded (need real IDs)
// ══════════════════════════════════════════════
const ROUTES: Record<string, string[]> = {
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
    '/admin/plano',
    '/admin/plano-plataforma',
    '/admin/plugins',
    '/admin/relatorio-professores',
    '/admin/relatorios',
    '/admin/retencao',
    '/admin/royalties',
    '/admin/setup',
    '/admin/setup-wizard',
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
    // Routes under (professor) group but not /professor prefix
    '/meus-cursos',
    '/meus-cursos/novo',
    '/meus-cursos/financeiro',
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
    // (main) group routes
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
    '/academia',
    '/academia/glossario',
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
    // Also under (parent) group
    '/agenda',
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
};

// Also: /network/page and /onboarding — will test with admin
const MISC_AUTHENTICATED_ROUTES = [
  '/network',
  '/onboarding',
];

// ══════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════

test.describe.serial('Full BlackBelt Audit', () => {
  const allResults: Record<string, PageResult[]> = {};

  // Test public routes without login
  test('public pages (no login)', async ({ page }) => {
    const results: PageResult[] = [];
    for (const route of PUBLIC_ROUTES) {
      const result = await testPage(page, route);
      results.push(result);
      const icon = result.status === 'ok' ? 'OK' :
                   result.status === 'empty' ? 'EMPTY' :
                   result.status === 'redirect' ? 'REDIR' : 'FAIL';
      console.log(`  [public] ${route} => ${icon} (${result.loadTime}ms) ${result.details.substring(0, 80)}`);
    }
    allResults['public'] = results;
  });

  // Test auth routes without login
  test('auth pages (no login)', async ({ page }) => {
    const results: PageResult[] = [];
    for (const route of AUTH_ROUTES) {
      const result = await testPage(page, route);
      results.push(result);
      const icon = result.status === 'ok' ? 'OK' :
                   result.status === 'empty' ? 'EMPTY' :
                   result.status === 'redirect' ? 'REDIR' : 'FAIL';
      console.log(`  [auth] ${route} => ${icon} (${result.loadTime}ms) ${result.details.substring(0, 80)}`);
    }
    allResults['auth'] = results;
  });

  // Test each role
  for (const user of USERS) {
    const routes = ROUTES[user.role] ?? [];

    test(`[${user.role}] login + ${routes.length} pages`, async ({ page }) => {
      const results: PageResult[] = [];

      const loggedIn = await login(page, user);
      if (!loggedIn) {
        results.push({
          url: '/login',
          status: 'error',
          consoleErrors: [],
          emptyIndicators: [],
          loadTime: 0,
          details: `LOGIN FAILED for ${user.email}`,
        });
        allResults[user.role] = results;
        return;
      }

      results.push({
        url: '/login',
        status: 'ok',
        consoleErrors: [],
        emptyIndicators: [],
        loadTime: 0,
        details: `Login OK => ${page.url()}`,
      });

      // Navigate misc authenticated routes for admin only
      const routesToTest = user.role === 'admin'
        ? [...routes, ...MISC_AUTHENTICATED_ROUTES]
        : routes;

      for (const route of routesToTest) {
        const result = await testPage(page, route);
        results.push(result);

        const icon = result.status === 'ok' ? 'OK' :
                     result.status === 'empty' ? 'EMPTY' :
                     result.status === 'redirect' ? 'REDIR' : 'FAIL';
        console.log(`  [${user.role}] ${route} => ${icon} (${result.loadTime}ms) ${result.details.substring(0, 80)}`);
      }

      allResults[user.role] = results;
    });
  }

  test.afterAll(async () => {
    const report: string[] = [];
    report.push('=================================================');
    report.push('  BLACKBELT v2 — FULL AUDIT REPORT');
    report.push('  ' + new Date().toISOString());
    report.push('=================================================');
    report.push('');

    let totalOk = 0, totalEmpty = 0, totalError = 0, totalCrash = 0, totalRedirect = 0, totalNotFound = 0;

    for (const [role, results] of Object.entries(allResults)) {
      const ok = results.filter(r => r.status === 'ok').length;
      const empty = results.filter(r => r.status === 'empty').length;
      const error = results.filter(r => r.status === 'error').length;
      const crash = results.filter(r => r.status === 'crash').length;
      const redirect = results.filter(r => r.status === 'redirect').length;
      const notFound = results.filter(r => r.status === 'not_found').length;

      totalOk += ok; totalEmpty += empty; totalError += error;
      totalCrash += crash; totalRedirect += redirect; totalNotFound += notFound;

      report.push('');
      report.push(`-- ${role.toUpperCase()} (${results.length} pages) --`);
      report.push(`   OK: ${ok}  Empty: ${empty}  Error: ${error}  Crash: ${crash}  Redirect: ${redirect}  404: ${notFound}`);

      for (const r of results) {
        if (r.status !== 'ok') {
          report.push(`   [${r.status.toUpperCase()}] ${r.url}`);
          if (r.details) report.push(`      => ${r.details.substring(0, 120)}`);
          if (r.consoleErrors.length > 0) {
            report.push(`      Console errors: ${r.consoleErrors.slice(0, 3).join('; ').substring(0, 150)}`);
          }
        }
      }
    }

    const total = totalOk + totalEmpty + totalError + totalCrash + totalRedirect + totalNotFound;
    report.push('');
    report.push('=================================================');
    report.push('  SUMMARY');
    report.push('=================================================');
    report.push(`  Total pages tested: ${total}`);
    report.push(`  OK:       ${totalOk}`);
    report.push(`  Empty:    ${totalEmpty}`);
    report.push(`  Error:    ${totalError}`);
    report.push(`  Crash:    ${totalCrash}`);
    report.push(`  Redirect: ${totalRedirect}`);
    report.push(`  404:      ${totalNotFound}`);
    report.push('=================================================');
    report.push('');

    const needsAttention = Object.entries(allResults)
      .flatMap(([role, results]) => results.filter(r => r.status !== 'ok' && r.status !== 'redirect').map(r => ({ role, ...r })));

    if (needsAttention.length > 0) {
      report.push('');
      report.push('-- PAGES NEEDING ATTENTION --');
      for (const r of needsAttention) {
        report.push(`[${r.role}] ${r.url} => ${r.status}: ${r.details.substring(0, 100)}`);
      }
    }

    const reportText = report.join('\n');
    console.log('\n' + reportText);

    fs.mkdirSync('e2e', { recursive: true });
    fs.writeFileSync('e2e/AUDIT_REPORT.txt', reportText);
    fs.writeFileSync('e2e/audit-results.json', JSON.stringify(allResults, null, 2));
    console.log('\nReport saved to: e2e/AUDIT_REPORT.txt');
    console.log('Raw data saved to: e2e/audit-results.json');
  });
});

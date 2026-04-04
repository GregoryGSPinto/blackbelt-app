import type {
  ActiveSession,
  SessionSummary,
  SessionDetail,
  ErrorSummary,
  PageErrorInfo,
  ErrorTrendPoint,
  PerformanceOverview,
  PagePerformance,
  DevicePerformance,
  PerformanceTrendPoint,
  DeviceBreakdownItem,
  BreakdownItem,
  DeviceModelInfo,
  ConnectionInfo,
  SupportTicket,
  TicketMetrics,
  EngagementOverview,
  PagePopularityItem,
  FeatureUsageItem,
  PeakHourItem,
  RetentionItem,
  TopUser,
} from '@/lib/api/suporte.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

const ACADEMIES = [
  { id: 'acad-01', name: 'Guerreiros BJJ' },
  { id: 'acad-02', name: 'Titans MMA' },
  { id: 'acad-03', name: 'Elite Fight' },
  { id: 'acad-04', name: 'Arte Suave' },
  { id: 'acad-05', name: 'Samurai Dojo' },
  { id: 'acad-06', name: 'Nova Era' },
  { id: 'acad-07', name: 'Dragon Force' },
  { id: 'acad-08', name: 'Leão Dourado' },
  { id: 'acad-09', name: 'Tropa de Elite' },
  { id: 'acad-10', name: 'Phoenix BJJ' },
  { id: 'acad-11', name: 'Black Belt Academy' },
  { id: 'acad-12', name: 'Oss Jiu-Jitsu' },
];

const ROLES: Array<'admin' | 'professor' | 'aluno_adulto' | 'aluno_teen' | 'responsavel' | 'recepcao'> = [
  'admin', 'professor', 'aluno_adulto', 'aluno_teen', 'responsavel', 'recepcao',
];

const NAMES = [
  'Rafael Pereira', 'João Mendes', 'Ana Costa', 'Pedro Santos', 'Lucas Oliveira',
  'Marcos Ribeiro', 'Maria Oliveira', 'Guilherme Ferreira', 'Camila Rodrigues',
  'Diego Almeida', 'Fernanda Martins', 'Bruno Nascimento', 'Juliana Souza',
  'André Barros', 'Tatiana Lima', 'Renato Carvalho', 'Patrícia Gomes',
  'Eduardo Freitas', 'Isabela Moreira', 'Thiago Correia', 'Larissa Nunes',
  'Vinícius Araújo', 'Daniela Rezende', 'Gabriel Teixeira', 'Carolina Pinto',
  'Roberto Cardoso', 'Amanda Duarte', 'Matheus Vieira', 'Natália Campos',
  'Felipe Azevedo', 'Aline Rocha', 'Henrique Monteiro', 'Bianca Castro',
  'Gustavo Melo', 'Raquel Dias', 'Leonardo Machado', 'Priscila Lopes',
  'Ricardo Batista', 'Vanessa Cunha', 'Caio Siqueira', 'Elaine Ramos',
  'Murilo Fonseca', 'Simone Guimarães', 'Hugo Sampaio', 'Débora Nogueira',
  'Otávio Reis', 'Cristiane Tavares', 'Nicolas Silveira', 'Letícia Prado',
  'Arthur Brandão', 'Mariana Medeiros', 'Samuel Borges', 'Lívia Andrade',
  'Rodrigo Moura', 'Bruna Xavier', 'Luciano Coelho',
];

const PAGES = [
  '/admin/dashboard', '/admin/turmas', '/admin/alunos', '/admin/financeiro',
  '/admin/relatorios', '/admin/configuracoes', '/admin/estoque', '/admin/contratos',
  '/professor', '/professor/turma-ativa', '/professor/diario', '/professor/avaliacoes',
  '/professor/plano-aula', '/professor/alunos',
  '/dashboard', '/treinos', '/evolucao', '/perfil', '/ranking',
  '/teen/dashboard', '/teen/missoes', '/teen/ranking',
  '/kids/dashboard', '/kids/estrelas',
  '/responsavel/dashboard', '/responsavel/evolucao', '/responsavel/financeiro',
  '/recepcao/painel', '/recepcao/checkin', '/recepcao/experimental',
];

const DEVICES: Array<{ model: string; type: 'mobile' | 'desktop' | 'tablet'; os: string; browser: string }> = [
  { model: 'iPhone 15 Pro', type: 'mobile', os: 'iOS 17.4', browser: 'Safari 17' },
  { model: 'iPhone 15', type: 'mobile', os: 'iOS 17.3', browser: 'Safari 17' },
  { model: 'iPhone 14 Pro Max', type: 'mobile', os: 'iOS 17.2', browser: 'Safari 17' },
  { model: 'iPhone 14', type: 'mobile', os: 'iOS 16.7', browser: 'Safari 16' },
  { model: 'iPhone 13', type: 'mobile', os: 'iOS 16.6', browser: 'Safari 16' },
  { model: 'iPhone 12', type: 'mobile', os: 'iOS 16.5', browser: 'Chrome 122' },
  { model: 'iPhone SE (3rd gen)', type: 'mobile', os: 'iOS 17.1', browser: 'Safari 17' },
  { model: 'Galaxy S24 Ultra', type: 'mobile', os: 'Android 14', browser: 'Chrome 122' },
  { model: 'Galaxy S24', type: 'mobile', os: 'Android 14', browser: 'Chrome 122' },
  { model: 'Galaxy S23', type: 'mobile', os: 'Android 14', browser: 'Chrome 121' },
  { model: 'Galaxy A54', type: 'mobile', os: 'Android 13', browser: 'Chrome 120' },
  { model: 'Galaxy A34', type: 'mobile', os: 'Android 13', browser: 'Chrome 119' },
  { model: 'Redmi Note 12', type: 'mobile', os: 'Android 13', browser: 'Chrome 121' },
  { model: 'Redmi Note 13 Pro', type: 'mobile', os: 'Android 14', browser: 'Chrome 122' },
  { model: 'Poco X5 Pro', type: 'mobile', os: 'Android 13', browser: 'Chrome 120' },
  { model: 'Moto G84', type: 'mobile', os: 'Android 13', browser: 'Chrome 121' },
  { model: 'Moto G73', type: 'mobile', os: 'Android 13', browser: 'Chrome 119' },
  { model: 'MacBook Pro 14"', type: 'desktop', os: 'macOS 14.3', browser: 'Safari 17' },
  { model: 'MacBook Air M2', type: 'desktop', os: 'macOS 14.2', browser: 'Chrome 122' },
  { model: 'iMac 24"', type: 'desktop', os: 'macOS 14.1', browser: 'Safari 17' },
  { model: 'Dell Inspiron 15', type: 'desktop', os: 'Windows 11', browser: 'Chrome 122' },
  { model: 'Lenovo ThinkPad X1', type: 'desktop', os: 'Windows 11', browser: 'Edge 122' },
  { model: 'HP Pavilion', type: 'desktop', os: 'Windows 10', browser: 'Chrome 121' },
  { model: 'Acer Aspire 5', type: 'desktop', os: 'Windows 11', browser: 'Firefox 123' },
  { model: 'iPad Pro 12.9"', type: 'tablet', os: 'iPadOS 17.3', browser: 'Safari 17' },
  { model: 'iPad Air', type: 'tablet', os: 'iPadOS 17.2', browser: 'Safari 17' },
  { model: 'Galaxy Tab S9', type: 'tablet', os: 'Android 14', browser: 'Chrome 122' },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hoursAgo(h: number): string {
  const d = new Date('2026-03-17T14:30:00-03:00');
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function minutesAgo(m: number): string {
  const d = new Date('2026-03-17T14:30:00-03:00');
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date('2026-03-17T14:30:00-03:00');
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ──────────────────────────────────────────────────────────────
// ACTIVE SESSIONS (45)
// ──────────────────────────────────────────────────────────────

const ACTIVE_SESSIONS: ActiveSession[] = Array.from({ length: 45 }, (_, i) => {
  const device = DEVICES[i % DEVICES.length];
  const acad = ACADEMIES[i % ACADEMIES.length];
  const role = ROLES[i % ROLES.length];
  const name = NAMES[i];
  const startedMinutesAgo = Math.floor(Math.random() * 45) + 1;
  return {
    id: `session-active-${String(i + 1).padStart(3, '0')}`,
    userId: `user-${String(i + 1).padStart(4, '0')}`,
    userName: name,
    userRole: role,
    academyId: acad.id,
    academyName: acad.name,
    currentPage: PAGES[i % PAGES.length],
    deviceType: device.type,
    deviceModel: device.model,
    os: device.os,
    browser: device.browser,
    ip: `189.${40 + (i % 60)}.${100 + (i % 155)}.${10 + i}`,
    city: randomItem(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Brasília', 'Fortaleza', 'Recife', 'Goiânia']),
    startedAt: minutesAgo(startedMinutesAgo),
    lastActivityAt: minutesAgo(Math.floor(Math.random() * startedMinutesAgo)),
    pagesViewed: Math.floor(Math.random() * 15) + 1,
    screenResolution: device.type === 'mobile' ? '390x844' : device.type === 'tablet' ? '1024x1366' : '1920x1080',
    connectionType: randomItem(['4g', 'wifi', 'wifi', 'wifi', '5g']),
  };
});

// ──────────────────────────────────────────────────────────────
// SESSION HISTORY SUMMARY (320 sessions, last 24h — aggregated)
// ──────────────────────────────────────────────────────────────

const SESSION_HISTORY: SessionSummary[] = Array.from({ length: 320 }, (_, i) => {
  const device = DEVICES[i % DEVICES.length];
  const acad = ACADEMIES[i % ACADEMIES.length];
  const role = ROLES[i % ROLES.length];
  const name = NAMES[i % NAMES.length];
  const durationMin = Math.floor(Math.random() * 30) + 2;
  const startHoursAgo = (i / 320) * 24;
  return {
    id: `session-hist-${String(i + 1).padStart(4, '0')}`,
    userId: `user-${String((i % 56) + 1).padStart(4, '0')}`,
    userName: name,
    userRole: role,
    academyId: acad.id,
    academyName: acad.name,
    deviceType: device.type,
    deviceModel: device.model,
    os: device.os,
    browser: device.browser,
    startedAt: hoursAgo(Math.floor(startHoursAgo)),
    endedAt: hoursAgo(Math.max(0, Math.floor(startHoursAgo) - 1)),
    durationMinutes: durationMin,
    pagesViewed: Math.floor(Math.random() * 12) + 1,
    city: randomItem(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Brasília']),
  };
});

// ──────────────────────────────────────────────────────────────
// SESSION DETAIL (for getSessionDetail)
// ──────────────────────────────────────────────────────────────

function buildSessionDetail(sessionId: string): SessionDetail {
  const active = ACTIVE_SESSIONS.find((s) => s.id === sessionId);
  const hist = SESSION_HISTORY.find((s) => s.id === sessionId);
  const source = active || hist;
  const name = source?.userName ?? 'Usuário Desconhecido';
  return {
    id: sessionId,
    userId: source?.userId ?? 'user-unknown',
    userName: name,
    userRole: source?.userRole ?? 'aluno_adulto',
    academyId: source?.academyId ?? 'acad-01',
    academyName: source?.academyName ?? 'Guerreiros BJJ',
    deviceType: source?.deviceType ?? 'mobile',
    deviceModel: (active?.deviceModel ?? (hist as SessionSummary | undefined)?.deviceModel) ?? 'iPhone 15 Pro',
    os: source?.os ?? 'iOS 17.4',
    browser: source?.browser ?? 'Safari 17',
    ip: active?.ip ?? '189.40.100.10',
    city: active?.city ?? (hist as SessionSummary | undefined)?.city ?? 'São Paulo',
    startedAt: source?.startedAt ?? minutesAgo(20),
    endedAt: (hist as SessionSummary | undefined)?.endedAt ?? null,
    durationMinutes: (hist as SessionSummary | undefined)?.durationMinutes ?? null,
    pagesViewed: source?.pagesViewed ?? 5,
    screenResolution: active?.screenResolution ?? '390x844',
    connectionType: active?.connectionType ?? 'wifi',
    pageHistory: [
      { path: '/dashboard', timestamp: minutesAgo(20), loadTimeMs: 1200 },
      { path: '/treinos', timestamp: minutesAgo(17), loadTimeMs: 800 },
      { path: '/evolucao', timestamp: minutesAgo(14), loadTimeMs: 950 },
      { path: '/ranking', timestamp: minutesAgo(10), loadTimeMs: 700 },
      { path: '/perfil', timestamp: minutesAgo(6), loadTimeMs: 650 },
    ],
    errors: [],
    performanceMetrics: {
      avgLCP: 1.8,
      avgFCP: 0.9,
      avgCLS: 0.05,
      avgTTFB: 0.32,
    },
  };
}

// ──────────────────────────────────────────────────────────────
// JS ERRORS (15)
// ──────────────────────────────────────────────────────────────

const JS_ERRORS = [
  // 3 critical
  {
    id: 'err-js-001',
    severity: 'critical' as const,
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at TurmaList (webpack-internal:///./app/(admin)/turmas/components/turma-list.tsx:45:23)
    at renderWithHooks (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:15486:18)
    at mountIndeterminateComponent (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:20103:13)
    at beginWork (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:21626:16)
    at HTMLUnknownElement.callCallback (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:4164:14)`,
    page: '/admin/turmas',
    count: 12,
    firstSeen: hoursAgo(18),
    lastSeen: minutesAgo(8),
    affectedUsers: 5,
    affectedSessions: 8,
    browser: 'Chrome 122',
    os: 'Android 14',
    resolved: false,
  },
  {
    id: 'err-js-002',
    severity: 'critical' as const,
    message: 'Unhandled Promise Rejection: NetworkError when attempting to fetch resource',
    stack: `Unhandled Promise Rejection: NetworkError when attempting to fetch resource
    at fetchWithRetry (webpack-internal:///./lib/api/checkin.service.ts:28:11)
    at async doCheckin (webpack-internal:///./lib/api/checkin.service.ts:45:18)
    at async FABCheckin.handleCheckin (webpack-internal:///./components/checkin/fab-checkin.tsx:67:7)
    at async handleClick (webpack-internal:///./components/checkin/fab-checkin.tsx:82:5)`,
    page: '/dashboard',
    count: 24,
    firstSeen: hoursAgo(12),
    lastSeen: minutesAgo(3),
    affectedUsers: 15,
    affectedSessions: 20,
    browser: 'Safari 17',
    os: 'iOS 17.4',
    resolved: false,
  },
  {
    id: 'err-js-003',
    severity: 'critical' as const,
    message: "RangeError: Maximum call stack size exceeded",
    stack: `RangeError: Maximum call stack size exceeded
    at calculateHealthScore (webpack-internal:///./lib/domain/rules.ts:312:15)
    at calculateHealthScore (webpack-internal:///./lib/domain/rules.ts:315:12)
    at calculateHealthScore (webpack-internal:///./lib/domain/rules.ts:315:12)
    at calculateHealthScore (webpack-internal:///./lib/domain/rules.ts:315:12)
    at HealthScoreCard (webpack-internal:///./app/(admin)/dashboard/components/health-score-card.tsx:23:20)`,
    page: '/admin/dashboard',
    count: 3,
    firstSeen: hoursAgo(4),
    lastSeen: hoursAgo(1),
    affectedUsers: 2,
    affectedSessions: 3,
    browser: 'Chrome 122',
    os: 'Windows 11',
    resolved: false,
  },
  // 5 error
  {
    id: 'err-js-004',
    severity: 'error' as const,
    message: "TypeError: Cannot read properties of null (reading 'scrollIntoView')",
    stack: `TypeError: Cannot read properties of null (reading 'scrollIntoView')
    at scrollToCurrentClass (webpack-internal:///./app/(professor)/turma-ativa/components/class-timeline.tsx:89:14)
    at useEffect (webpack-internal:///./app/(professor)/turma-ativa/components/class-timeline.tsx:102:7)
    at commitHookEffectListMount (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:23150:26)`,
    page: '/professor/turma-ativa',
    count: 7,
    firstSeen: hoursAgo(20),
    lastSeen: hoursAgo(2),
    affectedUsers: 3,
    affectedSessions: 5,
    browser: 'Safari 17',
    os: 'iOS 17.3',
    resolved: false,
  },
  {
    id: 'err-js-005',
    severity: 'error' as const,
    message: 'SyntaxError: Unexpected token < in JSON at position 0',
    stack: `SyntaxError: Unexpected token < in JSON at position 0
    at JSON.parse (<anonymous>)
    at parseResponse (webpack-internal:///./lib/api/financeiro.service.ts:67:23)
    at async getResumoFinanceiro (webpack-internal:///./lib/api/financeiro.service.ts:74:14)
    at async FinanceiroPage (webpack-internal:///./app/(admin)/financeiro/page.tsx:18:20)`,
    page: '/admin/financeiro',
    count: 5,
    firstSeen: hoursAgo(10),
    lastSeen: hoursAgo(3),
    affectedUsers: 2,
    affectedSessions: 4,
    browser: 'Chrome 121',
    os: 'Android 13',
    resolved: false,
  },
  {
    id: 'err-js-006',
    severity: 'error' as const,
    message: "Error: Hydration failed because the initial UI does not match what was rendered on the server",
    stack: `Error: Hydration failed because the initial UI does not match what was rendered on the server
    at throwOnHydrationMismatch (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:12225:9)
    at tryToClaimNextHydratableInstance (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:12416:7)
    at updateHostComponent (webpack-internal:///./node_modules/react-dom/cjs/react-dom.development.js:21357:5)
    at RankingPage (webpack-internal:///./app/(main)/ranking/page.tsx:34:3)`,
    page: '/ranking',
    count: 9,
    firstSeen: hoursAgo(22),
    lastSeen: hoursAgo(1),
    affectedUsers: 6,
    affectedSessions: 8,
    browser: 'Safari 16',
    os: 'iOS 16.7',
    resolved: false,
  },
  {
    id: 'err-js-007',
    severity: 'error' as const,
    message: "AbortError: The operation was aborted",
    stack: `AbortError: The operation was aborted
    at AbortSignal.throwIfAborted (webpack-internal:///./node_modules/next/dist/compiled/edge-runtime/index.js:1:23456)
    at fetchWithTimeout (webpack-internal:///./lib/utils/fetch-helpers.ts:15:12)
    at async getRelatorioAula (webpack-internal:///./lib/api/relatorio-aula.service.ts:34:14)
    at async RelatorioPage (webpack-internal:///./app/(professor)/diario/[id]/relatorio/page.tsx:22:18)`,
    page: '/professor/diario',
    count: 4,
    firstSeen: hoursAgo(6),
    lastSeen: hoursAgo(2),
    affectedUsers: 2,
    affectedSessions: 3,
    browser: 'Chrome 122',
    os: 'macOS 14.3',
    resolved: false,
  },
  {
    id: 'err-js-008',
    severity: 'error' as const,
    message: "NotAllowedError: play() failed because the user didn't interact with the document first",
    stack: `NotAllowedError: play() failed because the user didn't interact with the document first
    at HTMLMediaElement.play (webpack-internal:///./components/video/video-player.tsx:45:18)
    at autoPlayVideo (webpack-internal:///./components/video/video-player.tsx:52:5)
    at useEffect (webpack-internal:///./components/video/video-player.tsx:60:7)`,
    page: '/treinos',
    count: 11,
    firstSeen: hoursAgo(23),
    lastSeen: minutesAgo(45),
    affectedUsers: 8,
    affectedSessions: 10,
    browser: 'Safari 17',
    os: 'iOS 17.4',
    resolved: false,
  },
  // 7 warning
  {
    id: 'err-js-009',
    severity: 'warning' as const,
    message: 'Warning: Each child in a list should have a unique "key" prop',
    stack: `Warning: Each child in a list should have a unique "key" prop.
    Check the render method of AlunosList.
    at AlunosList (webpack-internal:///./app/(admin)/alunos/components/alunos-list.tsx:33:5)
    at div
    at AlunosPage (webpack-internal:///./app/(admin)/alunos/page.tsx:12:3)`,
    page: '/admin/alunos',
    count: 18,
    firstSeen: hoursAgo(24),
    lastSeen: minutesAgo(15),
    affectedUsers: 4,
    affectedSessions: 12,
    browser: 'Chrome 122',
    os: 'Windows 11',
    resolved: false,
  },
  {
    id: 'err-js-010',
    severity: 'warning' as const,
    message: "Warning: Can't perform a React state update on an unmounted component",
    stack: `Warning: Can't perform a React state update on an unmounted component.
    This is a no-op, but it indicates a memory leak in your application.
    at CheckinHistoryCard (webpack-internal:///./app/(main)/dashboard/components/checkin-history.tsx:28:5)
    at Dashboard (webpack-internal:///./app/(main)/dashboard/page.tsx:15:3)`,
    page: '/dashboard',
    count: 14,
    firstSeen: hoursAgo(22),
    lastSeen: minutesAgo(30),
    affectedUsers: 7,
    affectedSessions: 10,
    browser: 'Chrome 122',
    os: 'Android 14',
    resolved: false,
  },
  {
    id: 'err-js-011',
    severity: 'warning' as const,
    message: 'Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>',
    stack: `Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>.
    at div
    at EvolutionCard (webpack-internal:///./app/(main)/evolucao/components/evolution-card.tsx:18:7)
    at p
    at EvolucaoPage (webpack-internal:///./app/(main)/evolucao/page.tsx:30:5)`,
    page: '/evolucao',
    count: 6,
    firstSeen: hoursAgo(16),
    lastSeen: hoursAgo(4),
    affectedUsers: 3,
    affectedSessions: 4,
    browser: 'Firefox 123',
    os: 'Windows 11',
    resolved: false,
  },
  {
    id: 'err-js-012',
    severity: 'warning' as const,
    message: 'Warning: Received `true` for a non-boolean attribute `active`',
    stack: `Warning: Received \`true\` for a non-boolean attribute \`active\`.
    If you want to write it to the DOM, pass a string instead: active="true".
    at button
    at NavItem (webpack-internal:///./components/shell/nav-item.tsx:12:3)
    at nav
    at BottomNav (webpack-internal:///./components/shell/bottom-nav.tsx:25:5)`,
    page: '/dashboard',
    count: 22,
    firstSeen: hoursAgo(24),
    lastSeen: minutesAgo(5),
    affectedUsers: 12,
    affectedSessions: 18,
    browser: 'Chrome 122',
    os: 'Android 14',
    resolved: false,
  },
  {
    id: 'err-js-013',
    severity: 'warning' as const,
    message: 'ResizeObserver loop completed with undelivered notifications',
    stack: `ResizeObserver loop completed with undelivered notifications.
    at ResizeObserver callback (webpack-internal:///./components/ui/auto-resize-textarea.tsx:22:5)
    at MensagemInput (webpack-internal:///./app/(admin)/mensagens/components/mensagem-input.tsx:15:7)`,
    page: '/admin/configuracoes',
    count: 8,
    firstSeen: hoursAgo(14),
    lastSeen: hoursAgo(1),
    affectedUsers: 3,
    affectedSessions: 5,
    browser: 'Chrome 122',
    os: 'macOS 14.3',
    resolved: false,
  },
  {
    id: 'err-js-014',
    severity: 'warning' as const,
    message: 'Warning: A component is changing a controlled input to be uncontrolled',
    stack: `Warning: A component is changing a controlled input to be uncontrolled.
    This is likely caused by the value changing from a defined to undefined.
    at input
    at SearchInput (webpack-internal:///./components/ui/search-input.tsx:14:3)
    at AlunosPage (webpack-internal:///./app/(admin)/alunos/page.tsx:12:3)`,
    page: '/admin/alunos',
    count: 10,
    firstSeen: hoursAgo(20),
    lastSeen: hoursAgo(3),
    affectedUsers: 4,
    affectedSessions: 7,
    browser: 'Safari 17',
    os: 'macOS 14.2',
    resolved: false,
  },
  {
    id: 'err-js-015',
    severity: 'warning' as const,
    message: 'next/image: Image with src "/avatars/placeholder.png" has no width or height',
    stack: `next/image: Image with src "/avatars/placeholder.png" has no width or height.
    Please use the "fill" property or specify width and height.
    at Image (webpack-internal:///./node_modules/next/dist/client/image-component.js:1:1)
    at Avatar (webpack-internal:///./components/ui/avatar.tsx:10:5)
    at PerfilPage (webpack-internal:///./app/(main)/perfil/page.tsx:22:7)`,
    page: '/perfil',
    count: 15,
    firstSeen: hoursAgo(23),
    lastSeen: minutesAgo(12),
    affectedUsers: 9,
    affectedSessions: 13,
    browser: 'Chrome 120',
    os: 'Android 13',
    resolved: false,
  },
];

// ──────────────────────────────────────────────────────────────
// API ERRORS (8)
// ──────────────────────────────────────────────────────────────

const API_ERRORS = [
  // 2 timeout
  {
    id: 'err-api-001',
    type: 'timeout' as const,
    endpoint: '/api/relatorios/geral',
    method: 'GET' as const,
    statusCode: 504,
    message: 'Gateway Timeout: upstream request timed out after 30s',
    count: 6,
    firstSeen: hoursAgo(8),
    lastSeen: hoursAgo(1),
    avgResponseTimeMs: 30200,
    affectedUsers: 3,
  },
  {
    id: 'err-api-002',
    type: 'timeout' as const,
    endpoint: '/api/admin/dashboard/kpis',
    method: 'GET' as const,
    statusCode: 504,
    message: 'Gateway Timeout: database query exceeded 25s limit',
    count: 4,
    firstSeen: hoursAgo(6),
    lastSeen: hoursAgo(2),
    avgResponseTimeMs: 25800,
    affectedUsers: 2,
  },
  // 3 RLS denied
  {
    id: 'err-api-003',
    type: 'rls_denied' as const,
    endpoint: '/api/alunos/student-9999/evolucao',
    method: 'GET' as const,
    statusCode: 403,
    message: 'Row Level Security policy violation: user does not have permission to access student-9999 data',
    count: 3,
    firstSeen: hoursAgo(5),
    lastSeen: hoursAgo(3),
    avgResponseTimeMs: 45,
    affectedUsers: 1,
  },
  {
    id: 'err-api-004',
    type: 'rls_denied' as const,
    endpoint: '/api/financeiro/acad-07/faturamento',
    method: 'GET' as const,
    statusCode: 403,
    message: 'Row Level Security policy violation: cross-academy access denied for academy acad-07',
    count: 2,
    firstSeen: hoursAgo(12),
    lastSeen: hoursAgo(8),
    avgResponseTimeMs: 38,
    affectedUsers: 1,
  },
  {
    id: 'err-api-005',
    type: 'rls_denied' as const,
    endpoint: '/api/turmas/turma-042/alunos',
    method: 'GET' as const,
    statusCode: 403,
    message: 'Row Level Security policy violation: professor cannot access turma-042 (belongs to different unit)',
    count: 5,
    firstSeen: hoursAgo(18),
    lastSeen: hoursAgo(4),
    avgResponseTimeMs: 42,
    affectedUsers: 2,
  },
  // 3 not found
  {
    id: 'err-api-006',
    type: 'not_found' as const,
    endpoint: '/api/alunos/student-deleted-123',
    method: 'GET' as const,
    statusCode: 404,
    message: 'Student not found: student-deleted-123 may have been deactivated',
    count: 8,
    firstSeen: hoursAgo(20),
    lastSeen: minutesAgo(30),
    avgResponseTimeMs: 22,
    affectedUsers: 4,
  },
  {
    id: 'err-api-007',
    type: 'not_found' as const,
    endpoint: '/api/turmas/turma-legacy-005/horarios',
    method: 'GET' as const,
    statusCode: 404,
    message: 'Class schedule not found: turma-legacy-005 does not exist in current schema',
    count: 3,
    firstSeen: hoursAgo(15),
    lastSeen: hoursAgo(6),
    avgResponseTimeMs: 18,
    affectedUsers: 2,
  },
  {
    id: 'err-api-008',
    type: 'not_found' as const,
    endpoint: '/api/avaliacoes/eval-old-789',
    method: 'GET' as const,
    statusCode: 404,
    message: 'Evaluation not found: eval-old-789 was archived and is no longer accessible',
    count: 2,
    firstSeen: hoursAgo(10),
    lastSeen: hoursAgo(7),
    avgResponseTimeMs: 20,
    affectedUsers: 1,
  },
];

// ──────────────────────────────────────────────────────────────
// SUPPORT TICKETS (8)
// ──────────────────────────────────────────────────────────────

const SUPPORT_TICKETS: SupportTicket[] = [
  // 3 open
  {
    id: 'ticket-001',
    subject: 'Check-in não está funcionando pelo celular',
    description: 'Quando tento fazer check-in pelo app no celular, aparece um erro de rede e o check-in não é registrado.',
    status: 'open',
    priority: 'high',
    category: 'bug',
    createdBy: { userId: 'user-0012', userName: 'Juliana Souza', userRole: 'aluno_adulto', academyName: 'Elite Fight' },
    assignedTo: null,
    academyId: 'acad-03',
    academyName: 'Elite Fight',
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    resolvedAt: null,
    messages: [
      {
        id: 'msg-001-1',
        from: 'user',
        userName: 'Juliana Souza',
        text: 'Boa tarde! Estou tentando fazer check-in pelo celular desde ontem e não funciona. Aparece a mensagem "Erro de rede". Já tentei no WiFi e no 4G, o mesmo problema.',
        timestamp: hoursAgo(3),
      },
      {
        id: 'msg-001-2',
        from: 'system',
        userName: 'Sistema',
        text: 'Ticket criado automaticamente. Prioridade: alta. Categoria: bug.',
        timestamp: hoursAgo(3),
      },
    ],
  },
  {
    id: 'ticket-002',
    subject: 'Relatório financeiro com valores errados',
    description: 'O relatório mensal está mostrando valores diferentes do que temos no controle manual.',
    status: 'open',
    priority: 'medium',
    category: 'bug',
    createdBy: { userId: 'user-0003', userName: 'Ana Costa', userRole: 'admin', academyName: 'Arte Suave' },
    assignedTo: null,
    academyId: 'acad-04',
    academyName: 'Arte Suave',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(5),
    resolvedAt: null,
    messages: [
      {
        id: 'msg-002-1',
        from: 'user',
        userName: 'Ana Costa',
        text: 'O relatório financeiro do mês de fevereiro está mostrando R$ 23.450,00 mas no nosso controle temos R$ 25.100,00 de receita. Parece que 3 mensalidades não estão sendo contabilizadas.',
        timestamp: hoursAgo(6),
      },
      {
        id: 'msg-002-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Olá Ana! Obrigado por reportar. Vou verificar os registros de pagamento dessa academia. Pode me informar quais são os 3 alunos que acredita estarem faltando?',
        timestamp: hoursAgo(5),
      },
    ],
  },
  {
    id: 'ticket-003',
    subject: 'Dúvida sobre como cadastrar turma de kids',
    description: 'Preciso criar uma turma específica para crianças de 4 a 6 anos, mas não encontro a opção.',
    status: 'open',
    priority: 'low',
    category: 'question',
    createdBy: { userId: 'user-0020', userName: 'Thiago Correia', userRole: 'admin', academyName: 'Samurai Dojo' },
    assignedTo: null,
    academyId: 'acad-05',
    academyName: 'Samurai Dojo',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    resolvedAt: null,
    messages: [
      {
        id: 'msg-003-1',
        from: 'user',
        userName: 'Thiago Correia',
        text: 'Olá! Estou tentando cadastrar uma turma nova para crianças de 4 a 6 anos mas não acho onde seleciono a faixa etária. Onde configuro isso?',
        timestamp: hoursAgo(1),
      },
    ],
  },
  // 2 in_progress
  {
    id: 'ticket-004',
    subject: 'App travando na tela de avaliação',
    description: 'Ao abrir a tela de avaliação técnica, o app congela por 10-15 segundos antes de carregar.',
    status: 'in_progress',
    priority: 'high',
    category: 'bug',
    createdBy: { userId: 'user-0008', userName: 'Guilherme Ferreira', userRole: 'professor', academyName: 'Guerreiros BJJ' },
    assignedTo: 'dev-team',
    academyId: 'acad-01',
    academyName: 'Guerreiros BJJ',
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(4),
    resolvedAt: null,
    messages: [
      {
        id: 'msg-004-1',
        from: 'user',
        userName: 'Guilherme Ferreira',
        text: 'Pessoal, toda vez que abro a tela de avaliação técnica o app trava por uns 10-15 segundos. Isso acontece tanto no meu iPhone quanto no computador. Tenho 45 alunos na turma, será que é isso?',
        timestamp: hoursAgo(18),
      },
      {
        id: 'msg-004-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Oi Guilherme! Obrigado pelo relato. Sim, identificamos que turmas com mais de 30 alunos estão causando lentidão na renderização das avaliações. Já estamos trabalhando na otimização com paginação.',
        timestamp: hoursAgo(14),
      },
      {
        id: 'msg-004-3',
        from: 'user',
        userName: 'Guilherme Ferreira',
        text: 'Entendi, quando vocês acham que resolve? Preciso fazer avaliação até sexta.',
        timestamp: hoursAgo(8),
      },
      {
        id: 'msg-004-4',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Estamos priorizando esse fix. A previsão é de deploy até quinta-feira. Enquanto isso, uma alternativa é filtrar por faixa antes de abrir as avaliações — isso reduz o número de alunos carregados.',
        timestamp: hoursAgo(4),
      },
    ],
  },
  {
    id: 'ticket-005',
    subject: 'Integração com gateway de pagamento falhando',
    description: 'Boletos não estão sendo gerados automaticamente desde ontem.',
    status: 'in_progress',
    priority: 'critical',
    category: 'bug',
    createdBy: { userId: 'user-0001', userName: 'Rafael Pereira', userRole: 'admin', academyName: 'Guerreiros BJJ' },
    assignedTo: 'backend-team',
    academyId: 'acad-01',
    academyName: 'Guerreiros BJJ',
    createdAt: hoursAgo(22),
    updatedAt: hoursAgo(2),
    resolvedAt: null,
    messages: [
      {
        id: 'msg-005-1',
        from: 'user',
        userName: 'Rafael Pereira',
        text: 'Urgente! Os boletos pararam de ser gerados desde ontem à noite. Tenho 15 boletos que deveriam ter sido gerados hoje de manhã e nenhum foi criado.',
        timestamp: hoursAgo(22),
      },
      {
        id: 'msg-005-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Rafael, obrigado pelo alerta. Identificamos uma instabilidade na API do gateway de pagamento (Asaas). Estamos em contato com eles para resolver. Vou manter você atualizado.',
        timestamp: hoursAgo(20),
      },
      {
        id: 'msg-005-3',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Atualização: o gateway já normalizou. Estamos reprocessando os 15 boletos pendentes. Deve estar tudo ok em até 1 hora.',
        timestamp: hoursAgo(2),
      },
    ],
  },
  // 3 resolved
  {
    id: 'ticket-006',
    subject: 'Não consigo alterar minha foto de perfil',
    description: 'Ao tentar trocar a foto, aparece erro de upload.',
    status: 'resolved',
    priority: 'low',
    category: 'bug',
    createdBy: { userId: 'user-0029', userName: 'Natália Campos', userRole: 'aluno_adulto', academyName: 'Dragon Force' },
    assignedTo: 'dev-team',
    academyId: 'acad-07',
    academyName: 'Dragon Force',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    resolvedAt: daysAgo(1),
    messages: [
      {
        id: 'msg-006-1',
        from: 'user',
        userName: 'Natália Campos',
        text: 'Oi! Estou tentando trocar minha foto de perfil mas quando seleciono a imagem aparece "Erro no upload". Já tentei com fotos diferentes.',
        timestamp: daysAgo(3),
      },
      {
        id: 'msg-006-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Olá Natália! O erro pode estar relacionado ao tamanho da imagem. Qual o tamanho aproximado das fotos que está tentando enviar?',
        timestamp: daysAgo(3),
      },
      {
        id: 'msg-006-3',
        from: 'user',
        userName: 'Natália Campos',
        text: 'Uma tinha 8MB e a outra 5MB.',
        timestamp: daysAgo(2),
      },
      {
        id: 'msg-006-4',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Encontramos o problema! O limite estava configurado para 2MB mas não exibíamos essa informação. Atualizamos para aceitar até 10MB e melhoramos a mensagem de erro. Pode tentar novamente?',
        timestamp: daysAgo(1),
      },
      {
        id: 'msg-006-5',
        from: 'user',
        userName: 'Natália Campos',
        text: 'Funcionou perfeito agora! Obrigada!',
        timestamp: daysAgo(1),
      },
    ],
  },
  {
    id: 'ticket-007',
    subject: 'Como exportar lista de alunos em PDF?',
    description: 'Preciso gerar um relatório em PDF com todos os alunos ativos.',
    status: 'resolved',
    priority: 'low',
    category: 'question',
    createdBy: { userId: 'user-0014', userName: 'André Barros', userRole: 'admin', academyName: 'Nova Era' },
    assignedTo: 'support-team',
    academyId: 'acad-06',
    academyName: 'Nova Era',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    resolvedAt: daysAgo(4),
    messages: [
      {
        id: 'msg-007-1',
        from: 'user',
        userName: 'André Barros',
        text: 'Boa tarde, preciso gerar um relatório em PDF com a lista de todos os alunos ativos com nome, faixa e telefone. Como faço isso?',
        timestamp: daysAgo(5),
      },
      {
        id: 'msg-007-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Olá André! Você pode fazer isso em Relatórios > Alunos > Selecione "Alunos Ativos" e depois clique no botão "Exportar PDF" no canto superior direito. Lá você escolhe quais colunas quer incluir.',
        timestamp: daysAgo(5),
      },
      {
        id: 'msg-007-3',
        from: 'user',
        userName: 'André Barros',
        text: 'Perfeito, achei! Muito obrigado!',
        timestamp: daysAgo(4),
      },
    ],
  },
  {
    id: 'ticket-008',
    subject: 'Horário de aula não aparece para os alunos',
    description: 'Cadastrei novos horários mas os alunos não estão vendo no app.',
    status: 'resolved',
    priority: 'medium',
    category: 'bug',
    createdBy: { userId: 'user-0005', userName: 'Lucas Oliveira', userRole: 'admin', academyName: 'Titans MMA' },
    assignedTo: 'dev-team',
    academyId: 'acad-02',
    academyName: 'Titans MMA',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
    resolvedAt: daysAgo(5),
    messages: [
      {
        id: 'msg-008-1',
        from: 'user',
        userName: 'Lucas Oliveira',
        text: 'Cadastrei 3 novos horários de aula ontem mas nenhum dos alunos está vendo. No meu painel de admin aparece tudo certo.',
        timestamp: daysAgo(7),
      },
      {
        id: 'msg-008-2',
        from: 'support',
        userName: 'Suporte BlackBelt',
        text: 'Lucas, verificamos e encontramos um bug no cache de horários. O cache do lado do aluno não estava sendo invalidado quando novos horários eram cadastrados. Já corrigimos e fizemos deploy.',
        timestamp: daysAgo(6),
      },
      {
        id: 'msg-008-3',
        from: 'user',
        userName: 'Lucas Oliveira',
        text: 'Agora está aparecendo para todos. Valeu pela rapidez!',
        timestamp: daysAgo(5),
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// PERFORMANCE DATA
// ──────────────────────────────────────────────────────────────

const PERFORMANCE_OVERVIEW: PerformanceOverview = {
  avgLCP: 1.8,
  avgFCP: 0.9,
  avgCLS: 0.05,
  avgTTFB: 0.32,
  avgFID: 12,
  p75LCP: 2.4,
  p75FCP: 1.2,
  p75CLS: 0.08,
  p95LCP: 3.8,
  p95FCP: 1.9,
  p95CLS: 0.15,
  totalPageLoads: 4280,
  goodLCP: 72,
  needsImprovementLCP: 20,
  poorLCP: 8,
  goodFCP: 81,
  needsImprovementFCP: 14,
  poorFCP: 5,
  goodCLS: 88,
  needsImprovementCLS: 9,
  poorCLS: 3,
};

const PERFORMANCE_BY_PAGE: PagePerformance[] = [
  { page: '/admin/dashboard', avgLCP: 2.1, avgFCP: 1.0, avgCLS: 0.04, avgTTFB: 0.35, loadCount: 320, errorRate: 1.2 },
  { page: '/admin/turmas', avgLCP: 1.9, avgFCP: 0.8, avgCLS: 0.03, avgTTFB: 0.30, loadCount: 280, errorRate: 2.5 },
  { page: '/admin/alunos', avgLCP: 2.3, avgFCP: 1.1, avgCLS: 0.06, avgTTFB: 0.38, loadCount: 310, errorRate: 1.8 },
  { page: '/admin/financeiro', avgLCP: 2.5, avgFCP: 1.2, avgCLS: 0.04, avgTTFB: 0.42, loadCount: 190, errorRate: 3.1 },
  { page: '/admin/relatorios', avgLCP: 3.2, avgFCP: 1.5, avgCLS: 0.07, avgTTFB: 0.55, loadCount: 120, errorRate: 4.2 },
  { page: '/professor', avgLCP: 1.5, avgFCP: 0.7, avgCLS: 0.03, avgTTFB: 0.28, loadCount: 450, errorRate: 0.8 },
  { page: '/professor/turma-ativa', avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.05, avgTTFB: 0.32, loadCount: 380, errorRate: 1.5 },
  { page: '/professor/diario', avgLCP: 1.6, avgFCP: 0.8, avgCLS: 0.04, avgTTFB: 0.30, loadCount: 210, errorRate: 1.0 },
  { page: '/dashboard', avgLCP: 1.4, avgFCP: 0.7, avgCLS: 0.04, avgTTFB: 0.25, loadCount: 680, errorRate: 1.5 },
  { page: '/treinos', avgLCP: 1.6, avgFCP: 0.8, avgCLS: 0.05, avgTTFB: 0.28, loadCount: 420, errorRate: 2.0 },
  { page: '/evolucao', avgLCP: 1.8, avgFCP: 0.9, avgCLS: 0.06, avgTTFB: 0.32, loadCount: 350, errorRate: 1.2 },
  { page: '/ranking', avgLCP: 1.3, avgFCP: 0.6, avgCLS: 0.03, avgTTFB: 0.22, loadCount: 290, errorRate: 1.8 },
  { page: '/perfil', avgLCP: 1.2, avgFCP: 0.6, avgCLS: 0.02, avgTTFB: 0.20, loadCount: 250, errorRate: 0.5 },
  { page: '/teen/dashboard', avgLCP: 1.5, avgFCP: 0.7, avgCLS: 0.04, avgTTFB: 0.26, loadCount: 180, errorRate: 0.8 },
  { page: '/kids/dashboard', avgLCP: 1.4, avgFCP: 0.7, avgCLS: 0.03, avgTTFB: 0.24, loadCount: 140, errorRate: 0.6 },
  { page: '/responsavel/dashboard', avgLCP: 1.6, avgFCP: 0.8, avgCLS: 0.04, avgTTFB: 0.30, loadCount: 160, errorRate: 0.9 },
  { page: '/recepcao/painel', avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.05, avgTTFB: 0.32, loadCount: 220, errorRate: 1.1 },
  { page: '/recepcao/checkin', avgLCP: 1.3, avgFCP: 0.6, avgCLS: 0.02, avgTTFB: 0.22, loadCount: 310, errorRate: 0.4 },
];

const PERFORMANCE_BY_DEVICE: DevicePerformance[] = [
  { deviceType: 'mobile', avgLCP: 2.0, avgFCP: 1.0, avgCLS: 0.06, avgTTFB: 0.35, sampleSize: 2910, topModel: 'iPhone 15 Pro' },
  { deviceType: 'desktop', avgLCP: 1.4, avgFCP: 0.7, avgCLS: 0.03, avgTTFB: 0.25, sampleSize: 1198, topModel: 'MacBook Pro 14"' },
  { deviceType: 'tablet', avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.05, avgTTFB: 0.30, sampleSize: 172, topModel: 'iPad Pro 12.9"' },
];

const PERFORMANCE_TREND: PerformanceTrendPoint[] = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i).split('T')[0],
  avgLCP: 1.8 + (Math.random() * 0.6 - 0.3),
  avgFCP: 0.9 + (Math.random() * 0.3 - 0.15),
  avgCLS: 0.05 + (Math.random() * 0.03 - 0.015),
  p75LCP: 2.4 + (Math.random() * 0.8 - 0.4),
  totalPageLoads: 580 + Math.floor(Math.random() * 120),
}));

// ──────────────────────────────────────────────────────────────
// DEVICE / OS / BROWSER BREAKDOWNS
// ──────────────────────────────────────────────────────────────

const DEVICE_BREAKDOWN: DeviceBreakdownItem[] = [
  { type: 'mobile', percentage: 68, count: 2910, subBreakdown: [
    { label: 'iPhone', percentage: 40, count: 1712 },
    { label: 'Samsung', percentage: 20, count: 856 },
    { label: 'Xiaomi', percentage: 8, count: 342 },
  ]},
  { type: 'desktop', percentage: 28, count: 1198, subBreakdown: [
    { label: 'Mac', percentage: 14, count: 599 },
    { label: 'Windows PC', percentage: 14, count: 599 },
  ]},
  { type: 'tablet', percentage: 4, count: 172, subBreakdown: [
    { label: 'iPad', percentage: 3, count: 128 },
    { label: 'Android Tablet', percentage: 1, count: 44 },
  ]},
];

const OS_BREAKDOWN: BreakdownItem[] = [
  { label: 'iOS', percentage: 38, count: 1626 },
  { label: 'Android', percentage: 30, count: 1284 },
  { label: 'Windows', percentage: 18, count: 770 },
  { label: 'macOS', percentage: 14, count: 600 },
];

const BROWSER_BREAKDOWN: BreakdownItem[] = [
  { label: 'Chrome', percentage: 52, count: 2226 },
  { label: 'Safari', percentage: 35, count: 1498 },
  { label: 'Firefox', percentage: 8, count: 342 },
  { label: 'Edge', percentage: 5, count: 214 },
];

const DEVICE_MODELS: DeviceModelInfo[] = [
  { model: 'iPhone 15 Pro', count: 420, percentage: 9.8, avgLCP: 1.6, avgFCP: 0.7, avgCLS: 0.04, os: 'iOS 17.4', type: 'mobile' },
  { model: 'iPhone 15', count: 380, percentage: 8.9, avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.04, os: 'iOS 17.3', type: 'mobile' },
  { model: 'iPhone 14 Pro Max', count: 310, percentage: 7.2, avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.05, os: 'iOS 17.2', type: 'mobile' },
  { model: 'iPhone 14', count: 250, percentage: 5.8, avgLCP: 1.8, avgFCP: 0.8, avgCLS: 0.05, os: 'iOS 16.7', type: 'mobile' },
  { model: 'iPhone 13', count: 200, percentage: 4.7, avgLCP: 1.9, avgFCP: 0.9, avgCLS: 0.05, os: 'iOS 16.6', type: 'mobile' },
  { model: 'Galaxy S24 Ultra', count: 280, percentage: 6.5, avgLCP: 1.8, avgFCP: 0.8, avgCLS: 0.05, os: 'Android 14', type: 'mobile' },
  { model: 'Galaxy S24', count: 220, percentage: 5.1, avgLCP: 1.9, avgFCP: 0.9, avgCLS: 0.05, os: 'Android 14', type: 'mobile' },
  { model: 'Galaxy S23', count: 150, percentage: 3.5, avgLCP: 2.0, avgFCP: 0.9, avgCLS: 0.06, os: 'Android 14', type: 'mobile' },
  { model: 'Galaxy A54', count: 120, percentage: 2.8, avgLCP: 2.3, avgFCP: 1.1, avgCLS: 0.07, os: 'Android 13', type: 'mobile' },
  { model: 'Redmi Note 12', count: 130, percentage: 3.0, avgLCP: 2.5, avgFCP: 1.2, avgCLS: 0.08, os: 'Android 13', type: 'mobile' },
  { model: 'Redmi Note 13 Pro', count: 110, percentage: 2.6, avgLCP: 2.2, avgFCP: 1.0, avgCLS: 0.06, os: 'Android 14', type: 'mobile' },
  { model: 'Poco X5 Pro', count: 60, percentage: 1.4, avgLCP: 2.4, avgFCP: 1.1, avgCLS: 0.07, os: 'Android 13', type: 'mobile' },
  { model: 'Moto G84', count: 90, percentage: 2.1, avgLCP: 2.6, avgFCP: 1.2, avgCLS: 0.08, os: 'Android 13', type: 'mobile' },
  { model: 'Moto G73', count: 50, percentage: 1.2, avgLCP: 2.7, avgFCP: 1.3, avgCLS: 0.09, os: 'Android 13', type: 'mobile' },
  { model: 'iPhone SE (3rd gen)', count: 70, percentage: 1.6, avgLCP: 2.0, avgFCP: 0.9, avgCLS: 0.05, os: 'iOS 17.1', type: 'mobile' },
  { model: 'MacBook Pro 14"', count: 280, percentage: 6.5, avgLCP: 1.2, avgFCP: 0.6, avgCLS: 0.02, os: 'macOS 14.3', type: 'desktop' },
  { model: 'MacBook Air M2', count: 180, percentage: 4.2, avgLCP: 1.3, avgFCP: 0.6, avgCLS: 0.03, os: 'macOS 14.2', type: 'desktop' },
  { model: 'iMac 24"', count: 80, percentage: 1.9, avgLCP: 1.1, avgFCP: 0.5, avgCLS: 0.02, os: 'macOS 14.1', type: 'desktop' },
  { model: 'Dell Inspiron 15', count: 200, percentage: 4.7, avgLCP: 1.5, avgFCP: 0.7, avgCLS: 0.04, os: 'Windows 11', type: 'desktop' },
  { model: 'Lenovo ThinkPad X1', count: 150, percentage: 3.5, avgLCP: 1.4, avgFCP: 0.7, avgCLS: 0.03, os: 'Windows 11', type: 'desktop' },
  { model: 'HP Pavilion', count: 120, percentage: 2.8, avgLCP: 1.6, avgFCP: 0.8, avgCLS: 0.04, os: 'Windows 10', type: 'desktop' },
  { model: 'Acer Aspire 5', count: 90, percentage: 2.1, avgLCP: 1.7, avgFCP: 0.8, avgCLS: 0.04, os: 'Windows 11', type: 'desktop' },
  { model: 'iPad Pro 12.9"', count: 80, percentage: 1.9, avgLCP: 1.5, avgFCP: 0.7, avgCLS: 0.04, os: 'iPadOS 17.3', type: 'tablet' },
  { model: 'iPad Air', count: 48, percentage: 1.1, avgLCP: 1.6, avgFCP: 0.7, avgCLS: 0.04, os: 'iPadOS 17.2', type: 'tablet' },
  { model: 'Galaxy Tab S9', count: 44, percentage: 1.0, avgLCP: 1.8, avgFCP: 0.8, avgCLS: 0.05, os: 'Android 14', type: 'tablet' },
];

const CONNECTION_BREAKDOWN: ConnectionInfo[] = [
  { type: 'wifi', percentage: 62, count: 2653, avgLatencyMs: 45, avgLCP: 1.6 },
  { type: '4g', percentage: 25, count: 1070, avgLatencyMs: 85, avgLCP: 2.2 },
  { type: '5g', percentage: 8, count: 342, avgLatencyMs: 32, avgLCP: 1.5 },
  { type: '3g', percentage: 4, count: 171, avgLatencyMs: 180, avgLCP: 3.5 },
  { type: 'unknown', percentage: 1, count: 44, avgLatencyMs: 120, avgLCP: 2.8 },
];

// ──────────────────────────────────────────────────────────────
// ENGAGEMENT DATA
// ──────────────────────────────────────────────────────────────

const ENGAGEMENT_OVERVIEW: EngagementOverview = {
  dau: 35,
  wau: 52,
  mau: 58,
  dauWauRatio: 0.67,
  dauMauRatio: 0.60,
  avgSessionDurationMinutes: 12,
  avgPagesPerSession: 8.5,
  bounceRate: 15.2,
  avgSessionsPerUser: 2.3,
  totalSessions24h: 320,
  totalPageViews24h: 2720,
  newUsers7d: 8,
  returningUsers7d: 44,
};

const PAGE_POPULARITY: PagePopularityItem[] = [
  { page: '/dashboard', views: 680, uniqueUsers: 32, avgTimeOnPageSeconds: 45, bounceRate: 8.5, exitRate: 12.3 },
  { page: '/professor', views: 450, uniqueUsers: 12, avgTimeOnPageSeconds: 38, bounceRate: 5.2, exitRate: 15.8 },
  { page: '/treinos', views: 420, uniqueUsers: 28, avgTimeOnPageSeconds: 120, bounceRate: 10.1, exitRate: 18.5 },
  { page: '/professor/turma-ativa', views: 380, uniqueUsers: 11, avgTimeOnPageSeconds: 300, bounceRate: 2.1, exitRate: 8.3 },
  { page: '/evolucao', views: 350, uniqueUsers: 25, avgTimeOnPageSeconds: 90, bounceRate: 12.4, exitRate: 20.1 },
  { page: '/admin/dashboard', views: 320, uniqueUsers: 8, avgTimeOnPageSeconds: 55, bounceRate: 6.8, exitRate: 10.5 },
  { page: '/admin/alunos', views: 310, uniqueUsers: 7, avgTimeOnPageSeconds: 85, bounceRate: 8.2, exitRate: 14.7 },
  { page: '/recepcao/checkin', views: 310, uniqueUsers: 5, avgTimeOnPageSeconds: 25, bounceRate: 3.5, exitRate: 22.1 },
  { page: '/ranking', views: 290, uniqueUsers: 22, avgTimeOnPageSeconds: 60, bounceRate: 14.8, exitRate: 25.3 },
  { page: '/admin/turmas', views: 280, uniqueUsers: 7, avgTimeOnPageSeconds: 70, bounceRate: 7.5, exitRate: 13.2 },
  { page: '/perfil', views: 250, uniqueUsers: 20, avgTimeOnPageSeconds: 40, bounceRate: 18.5, exitRate: 30.2 },
  { page: '/recepcao/painel', views: 220, uniqueUsers: 5, avgTimeOnPageSeconds: 65, bounceRate: 4.2, exitRate: 9.8 },
  { page: '/professor/diario', views: 210, uniqueUsers: 10, avgTimeOnPageSeconds: 180, bounceRate: 3.8, exitRate: 11.5 },
  { page: '/admin/financeiro', views: 190, uniqueUsers: 6, avgTimeOnPageSeconds: 95, bounceRate: 9.1, exitRate: 16.4 },
  { page: '/teen/dashboard', views: 180, uniqueUsers: 14, avgTimeOnPageSeconds: 50, bounceRate: 11.3, exitRate: 15.7 },
  { page: '/responsavel/dashboard', views: 160, uniqueUsers: 10, avgTimeOnPageSeconds: 42, bounceRate: 13.6, exitRate: 18.9 },
  { page: '/kids/dashboard', views: 140, uniqueUsers: 8, avgTimeOnPageSeconds: 55, bounceRate: 10.8, exitRate: 14.2 },
  { page: '/admin/relatorios', views: 120, uniqueUsers: 5, avgTimeOnPageSeconds: 110, bounceRate: 7.3, exitRate: 20.5 },
];

const FEATURE_USAGE: FeatureUsageItem[] = [
  { feature: 'Check-in (QR Code)', usageCount: 245, uniqueUsers: 30, category: 'core', trend: 'up' },
  { feature: 'Visualizar turmas', usageCount: 210, uniqueUsers: 28, category: 'core', trend: 'stable' },
  { feature: 'Modo Aula (professor)', usageCount: 185, uniqueUsers: 11, category: 'core', trend: 'up' },
  { feature: 'Consultar evolução', usageCount: 170, uniqueUsers: 25, category: 'engagement', trend: 'up' },
  { feature: 'Ranking / Leaderboard', usageCount: 145, uniqueUsers: 22, category: 'gamification', trend: 'stable' },
  { feature: 'Registrar presença', usageCount: 140, uniqueUsers: 10, category: 'core', trend: 'stable' },
  { feature: 'Diário de aula', usageCount: 120, uniqueUsers: 9, category: 'professor', trend: 'up' },
  { feature: 'Relatório financeiro', usageCount: 95, uniqueUsers: 6, category: 'admin', trend: 'stable' },
  { feature: 'Avaliação técnica', usageCount: 85, uniqueUsers: 8, category: 'professor', trend: 'up' },
  { feature: 'Cadastrar aluno', usageCount: 78, uniqueUsers: 5, category: 'admin', trend: 'stable' },
  { feature: 'Missões XP (teen)', usageCount: 72, uniqueUsers: 14, category: 'gamification', trend: 'up' },
  { feature: 'Estrelas (kids)', usageCount: 65, uniqueUsers: 8, category: 'gamification', trend: 'up' },
  { feature: 'Mensagens', usageCount: 60, uniqueUsers: 18, category: 'communication', trend: 'stable' },
  { feature: 'Agendar aula experimental', usageCount: 45, uniqueUsers: 4, category: 'admin', trend: 'up' },
  { feature: 'Gerar contrato', usageCount: 38, uniqueUsers: 5, category: 'admin', trend: 'stable' },
  { feature: 'Consultar financeiro (responsável)', usageCount: 35, uniqueUsers: 10, category: 'parent', trend: 'stable' },
  { feature: 'Exportar relatório', usageCount: 28, uniqueUsers: 4, category: 'admin', trend: 'down' },
  { feature: 'Alterar perfil', usageCount: 22, uniqueUsers: 15, category: 'core', trend: 'stable' },
];

const PEAK_HOURS: PeakHourItem[] = [
  { hour: 0, sessions: 2, pageViews: 8 },
  { hour: 1, sessions: 1, pageViews: 3 },
  { hour: 2, sessions: 0, pageViews: 0 },
  { hour: 3, sessions: 0, pageViews: 0 },
  { hour: 4, sessions: 1, pageViews: 2 },
  { hour: 5, sessions: 3, pageViews: 12 },
  { hour: 6, sessions: 8, pageViews: 42 },
  { hour: 7, sessions: 15, pageViews: 95 },
  { hour: 8, sessions: 22, pageViews: 148 },
  { hour: 9, sessions: 28, pageViews: 185 },
  { hour: 10, sessions: 25, pageViews: 168 },
  { hour: 11, sessions: 20, pageViews: 132 },
  { hour: 12, sessions: 12, pageViews: 78 },
  { hour: 13, sessions: 14, pageViews: 92 },
  { hour: 14, sessions: 18, pageViews: 120 },
  { hour: 15, sessions: 22, pageViews: 145 },
  { hour: 16, sessions: 28, pageViews: 188 },
  { hour: 17, sessions: 35, pageViews: 245 },
  { hour: 18, sessions: 42, pageViews: 310 },
  { hour: 19, sessions: 45, pageViews: 338 },
  { hour: 20, sessions: 40, pageViews: 295 },
  { hour: 21, sessions: 30, pageViews: 210 },
  { hour: 22, sessions: 15, pageViews: 95 },
  { hour: 23, sessions: 6, pageViews: 28 },
];

const RETENTION_DATA: RetentionItem[] = [
  { day: 1, percentage: 85, users: 49 },
  { day: 3, percentage: 78, users: 45 },
  { day: 7, percentage: 72, users: 42 },
  { day: 14, percentage: 65, users: 38 },
  { day: 30, percentage: 58, users: 34 },
  { day: 60, percentage: 48, users: 28 },
  { day: 90, percentage: 42, users: 24 },
];

const ERROR_TREND: ErrorTrendPoint[] = Array.from({ length: 24 }, (_, i) => ({
  hour: hoursAgo(23 - i),
  critical: i < 4 ? 0 : i < 12 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3),
  error: Math.floor(Math.random() * 4) + 1,
  warning: Math.floor(Math.random() * 6) + 2,
  total: 0,
})).map((p) => ({ ...p, total: p.critical + p.error + p.warning }));

const TOP_USERS: TopUser[] = [
  { userId: 'user-0001', userName: 'Rafael Pereira', userRole: 'admin', academyName: 'Guerreiros BJJ', sessions: 18, totalMinutes: 245, pagesViewed: 210, lastSeen: minutesAgo(5) },
  { userId: 'user-0008', userName: 'Guilherme Ferreira', userRole: 'professor', academyName: 'Guerreiros BJJ', sessions: 15, totalMinutes: 320, pagesViewed: 185, lastSeen: minutesAgo(12) },
  { userId: 'user-0003', userName: 'Ana Costa', userRole: 'admin', academyName: 'Arte Suave', sessions: 14, totalMinutes: 198, pagesViewed: 172, lastSeen: minutesAgo(25) },
  { userId: 'user-0005', userName: 'Lucas Oliveira', userRole: 'admin', academyName: 'Titans MMA', sessions: 13, totalMinutes: 185, pagesViewed: 160, lastSeen: hoursAgo(1) },
  { userId: 'user-0012', userName: 'Juliana Souza', userRole: 'aluno_adulto', academyName: 'Elite Fight', sessions: 12, totalMinutes: 156, pagesViewed: 148, lastSeen: minutesAgo(40) },
  { userId: 'user-0020', userName: 'Thiago Correia', userRole: 'admin', academyName: 'Samurai Dojo', sessions: 11, totalMinutes: 142, pagesViewed: 130, lastSeen: hoursAgo(2) },
  { userId: 'user-0014', userName: 'André Barros', userRole: 'admin', academyName: 'Nova Era', sessions: 10, totalMinutes: 130, pagesViewed: 118, lastSeen: hoursAgo(3) },
  { userId: 'user-0002', userName: 'João Mendes', userRole: 'professor', academyName: 'Guerreiros BJJ', sessions: 10, totalMinutes: 275, pagesViewed: 115, lastSeen: minutesAgo(55) },
  { userId: 'user-0024', userName: 'Gabriel Teixeira', userRole: 'aluno_adulto', academyName: 'Phoenix BJJ', sessions: 9, totalMinutes: 108, pagesViewed: 95, lastSeen: hoursAgo(4) },
  { userId: 'user-0035', userName: 'Raquel Dias', userRole: 'responsavel', academyName: 'Leão Dourado', sessions: 8, totalMinutes: 72, pagesViewed: 68, lastSeen: hoursAgo(5) },
  { userId: 'user-0041', userName: 'Elaine Ramos', userRole: 'recepcao', academyName: 'Tropa de Elite', sessions: 8, totalMinutes: 310, pagesViewed: 85, lastSeen: minutesAgo(8) },
  { userId: 'user-0048', userName: 'Nicolas Silveira', userRole: 'aluno_teen', academyName: 'Black Belt Academy', sessions: 7, totalMinutes: 65, pagesViewed: 72, lastSeen: hoursAgo(6) },
];

// ──────────────────────────────────────────────────────────────
// ERRORS BY PAGE
// ──────────────────────────────────────────────────────────────

const ERRORS_BY_PAGE: PageErrorInfo[] = [
  { page: '/dashboard', jsErrors: 38, apiErrors: 2, totalErrors: 40, criticalCount: 24, errorRate: 5.9 },
  { page: '/admin/turmas', jsErrors: 12, apiErrors: 0, totalErrors: 12, criticalCount: 12, errorRate: 4.3 },
  { page: '/admin/alunos', jsErrors: 28, apiErrors: 8, totalErrors: 36, criticalCount: 0, errorRate: 11.6 },
  { page: '/admin/dashboard', jsErrors: 3, apiErrors: 4, totalErrors: 7, criticalCount: 3, errorRate: 2.2 },
  { page: '/admin/financeiro', jsErrors: 5, apiErrors: 2, totalErrors: 7, criticalCount: 0, errorRate: 3.7 },
  { page: '/professor/turma-ativa', jsErrors: 7, apiErrors: 0, totalErrors: 7, criticalCount: 0, errorRate: 1.8 },
  { page: '/professor/diario', jsErrors: 4, apiErrors: 0, totalErrors: 4, criticalCount: 0, errorRate: 1.9 },
  { page: '/treinos', jsErrors: 11, apiErrors: 0, totalErrors: 11, criticalCount: 0, errorRate: 2.6 },
  { page: '/evolucao', jsErrors: 6, apiErrors: 0, totalErrors: 6, criticalCount: 0, errorRate: 1.7 },
  { page: '/ranking', jsErrors: 9, apiErrors: 0, totalErrors: 9, criticalCount: 0, errorRate: 3.1 },
  { page: '/perfil', jsErrors: 15, apiErrors: 0, totalErrors: 15, criticalCount: 0, errorRate: 6.0 },
  { page: '/admin/configuracoes', jsErrors: 8, apiErrors: 0, totalErrors: 8, criticalCount: 0, errorRate: 4.5 },
  { page: '/admin/relatorios', jsErrors: 0, apiErrors: 6, totalErrors: 6, criticalCount: 0, errorRate: 5.0 },
];

// ──────────────────────────────────────────────────────────────
// TICKET METRICS
// ──────────────────────────────────────────────────────────────

const TICKET_METRICS: TicketMetrics = {
  totalOpen: 3,
  totalInProgress: 2,
  totalResolved: 3,
  totalAll: 8,
  avgResolutionTimeHours: 38.5,
  avgFirstResponseTimeMinutes: 42,
  satisfactionScore: 4.6,
  ticketsLast24h: 2,
  ticketsLast7d: 5,
  ticketsLast30d: 8,
  byCategory: [
    { category: 'bug', count: 5 },
    { category: 'question', count: 2 },
    { category: 'feature_request', count: 1 },
  ],
  byPriority: [
    { priority: 'critical', count: 1 },
    { priority: 'high', count: 2 },
    { priority: 'medium', count: 2 },
    { priority: 'low', count: 3 },
  ],
};

// ──────────────────────────────────────────────────────────────
// EXPORTED MOCK FUNCTIONS
// ──────────────────────────────────────────────────────────────

// Sessions
export async function mockGetActiveSessions(): Promise<ActiveSession[]> {
  await delay();
  return ACTIVE_SESSIONS.map((s) => ({ ...s }));
}

export async function mockGetSessionHistory(): Promise<SessionSummary[]> {
  await delay();
  return SESSION_HISTORY.map((s) => ({ ...s }));
}

export async function mockGetSessionDetail(sessionId: string): Promise<SessionDetail> {
  await delay();
  return buildSessionDetail(sessionId);
}

// Errors
export async function mockGetRecentErrors(): Promise<ErrorSummary> {
  await delay();
  return {
    jsErrors: JS_ERRORS.map((e) => ({ ...e })),
    apiErrors: API_ERRORS.map((e) => ({ ...e })),
    totalCritical: JS_ERRORS.filter((e) => e.severity === 'critical').length,
    totalError: JS_ERRORS.filter((e) => e.severity === 'error').length,
    totalWarning: JS_ERRORS.filter((e) => e.severity === 'warning').length,
    totalApiErrors: API_ERRORS.length,
    errorRate: 3.2,
    errorsLast1h: 8,
    errorsLast24h: JS_ERRORS.reduce((sum, e) => sum + e.count, 0) + API_ERRORS.reduce((sum, e) => sum + e.count, 0),
  };
}

export async function mockGetErrorsByPage(): Promise<PageErrorInfo[]> {
  await delay();
  return ERRORS_BY_PAGE.map((e) => ({ ...e }));
}

export async function mockGetErrorTrend(): Promise<ErrorTrendPoint[]> {
  await delay();
  return ERROR_TREND.map((e) => ({ ...e }));
}

// Performance
export async function mockGetPerformanceOverview(): Promise<PerformanceOverview> {
  await delay();
  return { ...PERFORMANCE_OVERVIEW };
}

export async function mockGetPerformanceByPage(): Promise<PagePerformance[]> {
  await delay();
  return PERFORMANCE_BY_PAGE.map((p) => ({ ...p }));
}

export async function mockGetPerformanceByDevice(): Promise<DevicePerformance[]> {
  await delay();
  return PERFORMANCE_BY_DEVICE.map((p) => ({ ...p }));
}

export async function mockGetPerformanceTrend(): Promise<PerformanceTrendPoint[]> {
  await delay();
  return PERFORMANCE_TREND.map((p) => ({ ...p }));
}

// Devices
export async function mockGetDeviceBreakdown(): Promise<DeviceBreakdownItem[]> {
  await delay();
  return DEVICE_BREAKDOWN.map((d) => ({ ...d, subBreakdown: d.subBreakdown.map((s) => ({ ...s })) }));
}

export async function mockGetOSBreakdown(): Promise<BreakdownItem[]> {
  await delay();
  return OS_BREAKDOWN.map((b) => ({ ...b }));
}

export async function mockGetBrowserBreakdown(): Promise<BreakdownItem[]> {
  await delay();
  return BROWSER_BREAKDOWN.map((b) => ({ ...b }));
}

export async function mockGetDeviceModels(): Promise<DeviceModelInfo[]> {
  await delay();
  return DEVICE_MODELS.map((d) => ({ ...d }));
}

export async function mockGetConnectionBreakdown(): Promise<ConnectionInfo[]> {
  await delay();
  return CONNECTION_BREAKDOWN.map((c) => ({ ...c }));
}

// Tickets
export async function mockGetTickets(): Promise<SupportTicket[]> {
  await delay();
  return SUPPORT_TICKETS.map((t) => ({ ...t, messages: t.messages.map((m) => ({ ...m })) }));
}

export async function mockGetTicket(id: string): Promise<SupportTicket> {
  await delay();
  const ticket = SUPPORT_TICKETS.find((t) => t.id === id);
  if (!ticket) {
    return SUPPORT_TICKETS[0];
  }
  return { ...ticket, messages: ticket.messages.map((m) => ({ ...m })) };
}

export async function mockCreateTicket(data: { subject: string; description: string; priority: string; category: string }): Promise<SupportTicket> {
  await delay();
  const newTicket: SupportTicket = {
    id: `ticket-${String(SUPPORT_TICKETS.length + 1).padStart(3, '0')}`,
    subject: data.subject,
    description: data.description,
    status: 'open',
    priority: data.priority as SupportTicket['priority'],
    category: data.category as SupportTicket['category'],
    createdBy: { userId: 'user-0001', userName: 'Rafael Pereira', userRole: 'admin', academyName: 'Guerreiros BJJ' },
    assignedTo: null,
    academyId: 'acad-01',
    academyName: 'Guerreiros BJJ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    messages: [
      {
        id: `msg-new-1`,
        from: 'user',
        userName: 'Rafael Pereira',
        text: data.description,
        timestamp: new Date().toISOString(),
      },
    ],
  };
  return newTicket;
}

export async function mockUpdateTicketStatus(id: string, status: string): Promise<SupportTicket> {
  await delay();
  const ticket = SUPPORT_TICKETS.find((t) => t.id === id) ?? SUPPORT_TICKETS[0];
  return {
    ...ticket,
    status: status as SupportTicket['status'],
    updatedAt: new Date().toISOString(),
    resolvedAt: status === 'resolved' ? new Date().toISOString() : ticket.resolvedAt,
    messages: ticket.messages.map((m) => ({ ...m })),
  };
}

export async function mockAddTicketMessage(id: string, from: string, text: string): Promise<SupportTicket> {
  await delay();
  const ticket = SUPPORT_TICKETS.find((t) => t.id === id) ?? SUPPORT_TICKETS[0];
  return {
    ...ticket,
    updatedAt: new Date().toISOString(),
    messages: [
      ...ticket.messages.map((m) => ({ ...m })),
      {
        id: `msg-added-${Date.now()}`,
        from: from as 'user' | 'support' | 'system',
        userName: from === 'support' ? 'Suporte BlackBelt' : 'Usuário',
        text,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function mockGetTicketMetrics(): Promise<TicketMetrics> {
  await delay();
  return { ...TICKET_METRICS, byCategory: TICKET_METRICS.byCategory.map((c) => ({ ...c })), byPriority: TICKET_METRICS.byPriority.map((p) => ({ ...p })) };
}

// Engagement
export async function mockGetEngagementOverview(): Promise<EngagementOverview> {
  await delay();
  return { ...ENGAGEMENT_OVERVIEW };
}

export async function mockGetPagePopularity(): Promise<PagePopularityItem[]> {
  await delay();
  return PAGE_POPULARITY.map((p) => ({ ...p }));
}

export async function mockGetFeatureUsage(): Promise<FeatureUsageItem[]> {
  await delay();
  return FEATURE_USAGE.map((f) => ({ ...f }));
}

export async function mockGetPeakHours(): Promise<PeakHourItem[]> {
  await delay();
  return PEAK_HOURS.map((p) => ({ ...p }));
}

export async function mockGetRetention(): Promise<RetentionItem[]> {
  await delay();
  return RETENTION_DATA.map((r) => ({ ...r }));
}

export async function mockGetTopUsers(): Promise<TopUser[]> {
  await delay();
  return TOP_USERS.map((u) => ({ ...u }));
}

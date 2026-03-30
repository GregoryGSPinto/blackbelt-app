// ── Profile Settings Mock Data ───────────────────────────────────────
// Used by ProfileSettingsPage for all roles when isMock() is true.

export type ProfileRole =
  | 'admin'
  | 'professor'
  | 'recepcao'
  | 'aluno_adulto'
  | 'aluno_teen'
  | 'aluno_kids'
  | 'responsavel'
  | 'franqueador'
  | 'superadmin';

export interface ProfileSettingsData {
  // ── Comum ───────────────────────────────────────────
  id: string;
  role: ProfileRole;
  display_name: string;
  email: string;
  phone: string;
  cpf: string;
  avatar_url: string | null;

  // Notificacoes
  notification_push: boolean;
  notification_email: boolean;
  notification_sms: boolean;

  // Preferencias
  theme_preference: 'light' | 'dark' | 'system';

  // ── Admin extras ─────────────────────────────────────
  academy_name?: string;
  academy_cnpj?: string;
  academy_address?: string;
  saas_plan?: string;

  // ── Professor extras ─────────────────────────────────
  graduation?: string;
  bio?: string;
  specialties?: string[];
  cref?: string;

  // ── Recepcao extras ──────────────────────────────────
  work_shift?: string;
  permissions?: string[];

  // ── Aluno adulto/teen extras ─────────────────────────
  weight?: number;
  height?: number;
  objective?: string;
  level?: string;
  injuries?: string;

  // ── Aluno teen extras ────────────────────────────────
  xp_level?: number;
  xp_current?: number;
  xp_next_level?: number;
  linked_guardian?: string;

  // ── Kids extras ──────────────────────────────────────
  nickname?: string;
  favorite_color?: string;
  favorite_emoji?: string;
  stars_count?: number;

  // ── Responsavel extras ───────────────────────────────
  linked_children?: { id: string; name: string; belt: string }[];
  parental_controls?: {
    chat_enabled: boolean;
    max_screen_time_minutes: number;
    content_filter: boolean;
  };

  // ── Franqueador extras ───────────────────────────────
  network_academies?: { id: string; name: string; city: string }[];

  // ── LGPD ────────────────────────────────────────────
  created_at?: string;
}

const delay = () => new Promise((r) => setTimeout(r, 400));

const BASE_DATA: Omit<ProfileSettingsData, 'role'> = {
  id: 'profile-1',
  display_name: 'Usuario BlackBelt',
  email: 'usuario@blackbelt.com',
  phone: '(11) 99999-0000',
  cpf: '123.456.789-00',
  avatar_url: null,
  notification_push: true,
  notification_email: true,
  notification_sms: false,
  theme_preference: 'system',
  created_at: '2025-04-10T00:00:00Z',
};

const ROLE_DATA: Record<ProfileRole, Partial<ProfileSettingsData>> = {
  admin: {
    display_name: 'Carlos Admin',
    email: 'admin@academia.com',
    academy_name: 'BlackBelt Academy Central',
    academy_cnpj: '12.345.678/0001-90',
    academy_address: 'Rua dos Tatames, 100 - Sao Paulo, SP',
    saas_plan: 'Plano Pro — R$ 299/mes',
  },
  professor: {
    display_name: 'Andre Galvao',
    email: 'professor@academia.com',
    graduation: 'Faixa Preta 3o Grau',
    bio: 'Professor de Jiu-Jitsu ha 15 anos. Competidor internacional e formador de faixas pretas.',
    specialties: ['Guarda', 'Passagem', 'Finalizacoes', 'Defesa Pessoal'],
    cref: '012345-G/SP',
  },
  recepcao: {
    display_name: 'Maria Recepcao',
    email: 'recepcao@academia.com',
    work_shift: 'Matutino (07:00 - 13:00)',
    permissions: ['Cadastro de alunos', 'Check-in', 'Caixa do dia', 'Experimentais'],
  },
  aluno_adulto: {
    display_name: 'Joao Pedro Almeida',
    email: 'joao@email.com',
    weight: 82.5,
    height: 178,
    objective: 'Competicao',
    level: 'Intermediario',
    injuries: 'Lesao no joelho esquerdo (menisco) — em tratamento',
  },
  aluno_teen: {
    display_name: 'Lucas Teen',
    email: 'lucas.teen@email.com',
    weight: 65,
    height: 170,
    objective: 'Evolucao tecnica',
    level: 'Iniciante',
    injuries: '',
    xp_level: 7,
    xp_current: 2450,
    xp_next_level: 3000,
    linked_guardian: 'Ana Silva (mae)',
  },
  aluno_kids: {
    display_name: 'Pedrinho',
    email: 'pais.pedrinho@email.com',
    nickname: 'Ninja Pedro',
    favorite_color: '#2563EB',
    favorite_emoji: '🥋',
    stars_count: 42,
  },
  responsavel: {
    display_name: 'Ana Silva',
    email: 'ana.silva@email.com',
    linked_children: [
      { id: 'child-1', name: 'Lucas Teen', belt: 'Amarela' },
      { id: 'child-2', name: 'Pedrinho', belt: 'Branca' },
    ],
    parental_controls: {
      chat_enabled: false,
      max_screen_time_minutes: 60,
      content_filter: true,
    },
  },
  franqueador: {
    display_name: 'Roberto Franqueador',
    email: 'roberto@rede.com',
    network_academies: [
      { id: 'acad-1', name: 'BlackBelt Central', city: 'Sao Paulo, SP' },
      { id: 'acad-2', name: 'BlackBelt Norte', city: 'Campinas, SP' },
      { id: 'acad-3', name: 'BlackBelt Sul', city: 'Curitiba, PR' },
      { id: 'acad-4', name: 'BlackBelt Leste', city: 'Rio de Janeiro, RJ' },
    ],
  },
  superadmin: {
    display_name: 'Super Admin',
    email: 'superadmin@blackbelt.com',
  },
};

export async function mockGetProfileSettings(role: ProfileRole): Promise<ProfileSettingsData> {
  await delay();
  return {
    ...BASE_DATA,
    role,
    ...ROLE_DATA[role],
  };
}

export async function mockUpdateProfileSettings(
  _role: ProfileRole,
  _data: Partial<ProfileSettingsData>,
): Promise<{ success: boolean }> {
  await delay();
  return { success: true };
}

export async function mockExportUserData(): Promise<object> {
  await delay();
  return {
    exportado_em: new Date().toISOString(),
    dados_pessoais: { ...BASE_DATA },
    historico_treinos: '142 aulas registradas',
    conquistas: '18 conquistas desbloqueadas',
    nota: 'Dados exportados conforme LGPD — Lei 13.709/2018',
  };
}

export async function mockDeleteAccount(): Promise<{ success: boolean }> {
  await delay();
  return { success: true };
}

export async function mockChangePassword(
  _currentPassword: string,
  _newPassword: string,
): Promise<{ success: boolean }> {
  await delay();
  return { success: true };
}

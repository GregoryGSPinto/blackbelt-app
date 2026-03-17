import type { Profile, User } from '@/lib/types';
import { Role } from '@/lib/types';
import { ServiceError } from '@/lib/api/errors';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  SelectProfileResponse,
} from '@/lib/api/auth.service';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AUDIT = { created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' };
const MOCK_ACADEMY_ID = 'academy-bb-001';
const MOCK_PASSWORD = 'senha123';

function createMockToken(
  userId: string,
  profileId: string,
  role: string,
  displayName: string,
  expiresInMinutes = 30,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    profile_id: profileId,
    role,
    academy_id: MOCK_ACADEMY_ID,
    display_name: displayName,
    iat: now,
    exp: now + expiresInMinutes * 60,
  };
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');
  return `${header}.${body}.${signature}`;
}

// ────────────────────────────────────────────────────────────
// Mock Data — 16 users, 17 profiles
// ────────────────────────────────────────────────────────────

const SEED_PASSWORD = 'BlackBelt@2026';

const MOCK_USERS: (User & { raw_password: string })[] = [
  // Original mock users (senha123)
  { id: 'user-admin', email: 'admin@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-prof', email: 'professor@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-adulto', email: 'adulto@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-teen', email: 'teen@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-resp', email: 'responsavel@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-reviewer', email: 'reviewer@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-multi', email: 'multiperfil@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  // Seed users matching Supabase (BlackBelt@2026)
  { id: 'user-roberto', email: 'roberto@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-andre', email: 'andre@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-joao', email: 'joao@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-lucas-teen', email: 'lucas.teen@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-helena-kids', email: 'helena.kids@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-patricia', email: 'patricia@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-camila', email: 'camila@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-fernanda', email: 'fernanda@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-thiago', email: 'thiago@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Recepcionista
  { id: 'user-julia', email: 'julia@guerreiros.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Alunos adultos extras
  { id: 'user-rafael', email: 'rafael@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-marcos', email: 'marcos@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-luciana', email: 'luciana@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-bruno', email: 'bruno@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-juliana', email: 'juliana@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-anacarol', email: 'ana.carol@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-matheus', email: 'matheus@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Teens extras
  { id: 'user-sophia-teen', email: 'sophia.teen@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-valentina-teen', email: 'valentina.teen@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Kids extras
  { id: 'user-miguel-kids', email: 'miguel.kids@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-gabriel-kids', email: 'gabriel.kids@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Responsaveis extras
  { id: 'user-carlos', email: 'carlos@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-renata', email: 'renata@email.com', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  // Super Admin
  { id: 'user-superadmin', email: 'super@blackbelt.app', password_hash: 'mock', raw_password: SEED_PASSWORD, ...AUDIT },
  { id: 'user-gregory', email: 'gregoryguimaraes12@gmail.com', password_hash: 'mock', raw_password: '@Greg1994', ...AUDIT },
];

const MOCK_PROFILES: Profile[] = [
  // Original mock profiles
  { id: 'prof-admin', user_id: 'user-admin', role: Role.Admin, display_name: 'Admin Master', avatar: null, ...AUDIT },
  { id: 'prof-professor', user_id: 'user-prof', role: Role.Professor, display_name: 'Sensei Carlos', avatar: null, ...AUDIT },
  { id: 'prof-adulto', user_id: 'user-adulto', role: Role.AlunoAdulto, display_name: 'João Silva', avatar: null, ...AUDIT },
  { id: 'prof-teen', user_id: 'user-teen', role: Role.AlunoTeen, display_name: 'Lucas Santos', avatar: null, ...AUDIT },
  { id: 'prof-resp', user_id: 'user-resp', role: Role.Responsavel, display_name: 'Maria Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-reviewer', user_id: 'user-reviewer', role: Role.Admin, display_name: 'Reviewer Admin', avatar: null, ...AUDIT },
  { id: 'prof-multi-adulto', user_id: 'user-multi', role: Role.AlunoAdulto, display_name: 'Pedro Costa', avatar: null, ...AUDIT },
  { id: 'prof-multi-resp', user_id: 'user-multi', role: Role.Responsavel, display_name: 'Pedro Costa', avatar: null, ...AUDIT },
  // Seed profiles (matching Supabase users)
  { id: 'prof-roberto', user_id: 'user-roberto', role: Role.Admin, display_name: 'Roberto Guerreiro', avatar: null, ...AUDIT },
  { id: 'prof-andre', user_id: 'user-andre', role: Role.Professor, display_name: 'André Santos', avatar: null, ...AUDIT },
  { id: 'prof-joao', user_id: 'user-joao', role: Role.AlunoAdulto, display_name: 'João Mendes', avatar: null, ...AUDIT },
  { id: 'prof-lucas-teen', user_id: 'user-lucas-teen', role: Role.AlunoTeen, display_name: 'Lucas Ferreira', avatar: null, ...AUDIT },
  { id: 'prof-helena-kids', user_id: 'user-helena-kids', role: Role.AlunoKids, display_name: 'Helena Costa', avatar: null, ...AUDIT },
  { id: 'prof-patricia', user_id: 'user-patricia', role: Role.Responsavel, display_name: 'Patrícia Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-camila', user_id: 'user-camila', role: Role.Admin, display_name: 'Camila Ferreira Santos', avatar: null, ...AUDIT },
  { id: 'prof-fernanda', user_id: 'user-fernanda', role: Role.Professor, display_name: 'Fernanda Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-thiago', user_id: 'user-thiago', role: Role.Professor, display_name: 'Thiago Nakamura', avatar: null, ...AUDIT },
  // Recepcionista
  { id: 'prof-julia', user_id: 'user-julia', role: Role.Recepcao, display_name: 'Julia Santos', avatar: null, ...AUDIT },
  // Alunos adultos extras
  { id: 'prof-rafael', user_id: 'user-rafael', role: Role.AlunoAdulto, display_name: 'Rafael Souza', avatar: null, ...AUDIT },
  { id: 'prof-marcos', user_id: 'user-marcos', role: Role.AlunoAdulto, display_name: 'Marcos Vieira', avatar: null, ...AUDIT },
  { id: 'prof-luciana', user_id: 'user-luciana', role: Role.AlunoAdulto, display_name: 'Luciana Ribeiro', avatar: null, ...AUDIT },
  { id: 'prof-bruno', user_id: 'user-bruno', role: Role.AlunoAdulto, display_name: 'Bruno Almeida', avatar: null, ...AUDIT },
  { id: 'prof-juliana', user_id: 'user-juliana', role: Role.AlunoAdulto, display_name: 'Juliana Torres', avatar: null, ...AUDIT },
  { id: 'prof-anacarol', user_id: 'user-anacarol', role: Role.AlunoAdulto, display_name: 'Ana Carolina', avatar: null, ...AUDIT },
  { id: 'prof-matheus', user_id: 'user-matheus', role: Role.AlunoAdulto, display_name: 'Matheus Lima', avatar: null, ...AUDIT },
  // Teens extras
  { id: 'prof-sophia-teen', user_id: 'user-sophia-teen', role: Role.AlunoTeen, display_name: 'Sophia Martins', avatar: null, ...AUDIT },
  { id: 'prof-valentina-teen', user_id: 'user-valentina-teen', role: Role.AlunoTeen, display_name: 'Valentina Costa', avatar: null, ...AUDIT },
  // Kids extras
  { id: 'prof-miguel-kids', user_id: 'user-miguel-kids', role: Role.AlunoKids, display_name: 'Miguel Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-gabriel-kids', user_id: 'user-gabriel-kids', role: Role.AlunoKids, display_name: 'Gabriel Santos', avatar: null, ...AUDIT },
  // Responsaveis extras
  { id: 'prof-carlos', user_id: 'user-carlos', role: Role.Responsavel, display_name: 'Carlos Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-renata', user_id: 'user-renata', role: Role.Responsavel, display_name: 'Renata Santos', avatar: null, ...AUDIT },
  // Super Admin
  { id: 'prof-superadmin', user_id: 'user-superadmin', role: Role.Superadmin, display_name: 'Gregory (Super Admin)', avatar: null, ...AUDIT },
  { id: 'prof-gregory', user_id: 'user-gregory', role: Role.Superadmin, display_name: 'Gregory Guimarães', avatar: null, ...AUDIT },
];

export function getProfilesByUserId(userId: string): Profile[] {
  return MOCK_PROFILES.filter((p) => p.user_id === userId);
}

export async function mockGetMyProfiles(userId: string): Promise<Profile[]> {
  await delay(100);
  return getProfilesByUserId(userId);
}

function getProfileById(profileId: string): Profile | undefined {
  return MOCK_PROFILES.find((p) => p.id === profileId);
}

// ────────────────────────────────────────────────────────────
// Mock Implementations
// ────────────────────────────────────────────────────────────

export async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  await delay();

  const user = MOCK_USERS.find(
    (u) => u.email === data.email && u.raw_password === data.password,
  );

  if (!user) {
    throw new ServiceError(401, 'auth.login', 'Email ou senha inválidos.');
  }

  const profiles = getProfilesByUserId(user.id);
  const firstProfile = profiles[0];

  const accessToken = createMockToken(
    user.id,
    firstProfile.id,
    firstProfile.role,
    firstProfile.display_name,
  );

  const refreshToken = createMockToken(
    user.id,
    firstProfile.id,
    firstProfile.role,
    firstProfile.display_name,
    60 * 24 * 7, // 7 days
  );

  return { accessToken, refreshToken, profiles };
}

export async function mockRegister(data: RegisterRequest): Promise<RegisterResponse> {
  await delay();

  const exists = MOCK_USERS.some((u) => u.email === data.email);
  if (exists) {
    throw new ServiceError(409, 'auth.register', 'Email já cadastrado.');
  }

  const user: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    password_hash: 'mock',
    ...AUDIT,
  };

  const profile: Profile = {
    id: `prof-${Date.now()}`,
    user_id: user.id,
    role: Role.AlunoAdulto,
    display_name: data.name,
    avatar: null,
    ...AUDIT,
  };

  return { user, profile };
}

export async function mockRefreshToken(token: string): Promise<RefreshResponse> {
  await delay();

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const accessToken = createMockToken(
      payload.sub,
      payload.profile_id,
      payload.role,
      payload.display_name,
    );
    return { accessToken };
  } catch {
    throw new ServiceError(401, 'auth.refresh', 'Refresh token inválido.');
  }
}

export async function mockSelectProfile(profileId: string): Promise<SelectProfileResponse> {
  await delay();

  const profile = getProfileById(profileId);
  if (!profile) {
    throw new ServiceError(404, 'auth.selectProfile', 'Perfil não encontrado.');
  }

  const accessToken = createMockToken(
    profile.user_id,
    profile.id,
    profile.role,
    profile.display_name,
  );

  return { accessToken, profile };
}

export async function mockLogout(): Promise<void> {
  await delay(100);
}

export async function mockForgotPassword(_email: string): Promise<void> {
  await delay();
}

export async function mockResetPassword(_token: string, _newPassword: string): Promise<void> {
  await delay();
}

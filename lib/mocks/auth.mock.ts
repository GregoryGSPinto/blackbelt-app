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
// Mock Data — 7 users, 8 profiles
// ────────────────────────────────────────────────────────────

const MOCK_USERS: (User & { raw_password: string })[] = [
  { id: 'user-admin', email: 'admin@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-prof', email: 'professor@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-adulto', email: 'adulto@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-teen', email: 'teen@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-resp', email: 'responsavel@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-reviewer', email: 'reviewer@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
  { id: 'user-multi', email: 'multiperfil@blackbelt.com', password_hash: 'mock', raw_password: MOCK_PASSWORD, ...AUDIT },
];

const MOCK_PROFILES: Profile[] = [
  { id: 'prof-admin', user_id: 'user-admin', role: Role.Admin, display_name: 'Admin Master', avatar: null, ...AUDIT },
  { id: 'prof-professor', user_id: 'user-prof', role: Role.Professor, display_name: 'Sensei Carlos', avatar: null, ...AUDIT },
  { id: 'prof-adulto', user_id: 'user-adulto', role: Role.AlunoAdulto, display_name: 'João Silva', avatar: null, ...AUDIT },
  { id: 'prof-teen', user_id: 'user-teen', role: Role.AlunoTeen, display_name: 'Lucas Santos', avatar: null, ...AUDIT },
  { id: 'prof-resp', user_id: 'user-resp', role: Role.Responsavel, display_name: 'Maria Oliveira', avatar: null, ...AUDIT },
  { id: 'prof-reviewer', user_id: 'user-reviewer', role: Role.Admin, display_name: 'Reviewer Admin', avatar: null, ...AUDIT },
  { id: 'prof-multi-adulto', user_id: 'user-multi', role: Role.AlunoAdulto, display_name: 'Pedro Costa', avatar: null, ...AUDIT },
  { id: 'prof-multi-resp', user_id: 'user-multi', role: Role.Responsavel, display_name: 'Pedro Costa', avatar: null, ...AUDIT },
];

function getProfilesByUserId(userId: string): Profile[] {
  return MOCK_PROFILES.filter((p) => p.user_id === userId);
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

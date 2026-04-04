import type { UserPreferences, AcademySettings } from '@/lib/types/preferences';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ── Default user preferences ─────────────────────────────────────────

function getDefaultPreferences(): UserPreferences {
  return {
    // Notifications
    notifications_app: {
      aula_em_breve: true,
      fatura_vencendo: true,
      promocao_faixa: true,
      mensagem_professor: true,
      conquista_nova: true,
      inatividade: false,
    },
    notifications_email: {
      fatura_vencendo: true,
      promocao_faixa: true,
      relatorio_mensal: true,
    },
    notifications_whatsapp: {
      aula_em_breve: false,
      fatura_vencendo: true,
    },
    notifications_push: true,
    notifications_sound: true,
    notifications_vibration: true,

    // Appearance
    theme: 'system',
    language: 'pt-BR',
    date_format: 'dd/mm/yyyy',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    sidebar_mode: 'auto',

    // Training (student specific)
    training_goal_weekly: 3,
    training_goal_monthly_percent: 80,
    streak_count_weekends: false,
    streak_rest_day: 'sunday',
    training_reminder_before: '30min',
    training_reminder_missed: true,
    training_reminder_weekly_goal: true,
    privacy_show_ranking: true,
    privacy_show_streak: true,
    privacy_show_achievements: true,
    privacy_professor_notes: true,
    video_quality: 'auto',
    video_download_offline: false,
    video_autoplay_next: true,

    // Professor specific
    timer_round_duration: '5:00',
    timer_interval: '1:00',
    timer_rounds: 5,
    timer_sound: 'bell',
    timer_vibration: true,
    attendance_type: 'qr_code',
    attendance_show_photo: true,
    attendance_sound: true,
    class_mode_show: ['timer', 'attendance', 'techniques'],
    class_mode_screen_on: true,
    class_mode_brightness: true,
    post_class_diary_reminder: true,
    post_class_evaluation_after: 3,
    post_class_auto_summary: true,

    // Teen specific
    nickname: '',
    avatar_emoji: '',
    displayed_title: '',

    // Kids specific
    mascot: 'dragon',
    favorite_color: '#EF4444',
    sounds_enabled: true,
    mascot_music: true,

    // Receptionist specific
    register_payments: true,
    auto_receipt: true,
    mandatory_cash_closing: true,
    quick_register_required_fields: ['name', 'phone', 'email'],
    default_class: '',
    default_modality: '',
    trial_duration_days: 7,
    trial_auto_reminder: true,
    trial_reminder_template: 'default',
  };
}

// ── Default academy settings ─────────────────────────────────────────

function getDefaultAcademySettings(): AcademySettings {
  return {
    name: 'Guerreiros BJJ',
    slug: 'guerreiros-bjj',
    phone: '(11) 99999-0000',
    email: 'contato@guerreirosbjj.com.br',
    website: 'https://guerreirosbjj.com.br',
    instagram: '@guerreirosbjj',

    cep: '01310-100',
    street: 'Rua das Artes Marciais, 123',
    neighborhood: 'Centro',
    city: 'Sao Paulo',
    state: 'SP',

    cnpj: '12.345.678/0001-00',
    legal_name: 'Guerreiros BJJ Ltda',
    state_registration: '123.456.789.000',

    modalities: ['Jiu-Jitsu', 'Muay Thai', 'Boxe', 'MMA'],

    hours: {
      monday: { open: '06:00', close: '22:00', is_open: true },
      tuesday: { open: '06:00', close: '22:00', is_open: true },
      wednesday: { open: '06:00', close: '22:00', is_open: true },
      thursday: { open: '06:00', close: '22:00', is_open: true },
      friday: { open: '06:00', close: '21:00', is_open: true },
      saturday: { open: '08:00', close: '14:00', is_open: true },
      sunday: { open: '00:00', close: '00:00', is_open: false },
    },

    primary_color: '#EF4444',
    secondary_color: '#B91C1C',

    checkin_methods: ['qr_code', 'manual'],
    qr_renewal_interval: '5min',
    late_tolerance_minutes: 15,
    allow_off_schedule_checkin: false,

    belt_system: 'ibjjf',
    min_time_between_graduations: '4months',
    min_attendance_for_graduation: 80,
    graduation_approval: ['professor', 'admin'],

    who_can_upload: ['admin', 'professor'],
    max_video_size_mb: 500,
    require_approval_before_publish: false,
  };
}

// ── Mock storage ─────────────────────────────────────────────────────

const mockPreferences: Record<string, UserPreferences> = {};
const mockAcademySettings: Record<string, AcademySettings> = {};

// ── Mock functions ───────────────────────────────────────────────────

export async function mockGetUserPreferences(
  _profileId: string,
): Promise<UserPreferences> {
  await delay();
  if (!mockPreferences[_profileId]) {
    mockPreferences[_profileId] = getDefaultPreferences();
  }
  return { ...mockPreferences[_profileId] };
}

export async function mockUpdateUserPreferences(
  _profileId: string,
  partial: Partial<UserPreferences>,
): Promise<void> {
  await delay();
  if (!mockPreferences[_profileId]) {
    mockPreferences[_profileId] = getDefaultPreferences();
  }
  mockPreferences[_profileId] = { ...mockPreferences[_profileId], ...partial };
}

export async function mockGetAcademySettings(
  _academyId: string,
): Promise<AcademySettings> {
  await delay();
  if (!mockAcademySettings[_academyId]) {
    mockAcademySettings[_academyId] = getDefaultAcademySettings();
  }
  return { ...mockAcademySettings[_academyId] };
}

export async function mockUpdateAcademySettings(
  _academyId: string,
  partial: Partial<AcademySettings>,
): Promise<void> {
  await delay();
  if (!mockAcademySettings[_academyId]) {
    mockAcademySettings[_academyId] = getDefaultAcademySettings();
  }
  mockAcademySettings[_academyId] = {
    ...mockAcademySettings[_academyId],
    ...partial,
  };
}

export async function mockChangePassword(
  _currentPassword: string,
  _newPassword: string,
): Promise<void> {
  await delay(500);
  if (_currentPassword === '') {
    throw new Error('Senha atual incorreta');
  }
}

export async function mockExportUserData(
  _profileId: string,
): Promise<{ url: string }> {
  await delay(1500);
  return { url: 'https://storage.example.com/exports/user-data.zip' };
}

export async function mockDeleteAccount(
  _profileId: string,
  _confirmText: string,
): Promise<void> {
  await delay(1000);
}

export async function mockDeactivateAcademy(
  _academyId: string,
): Promise<void> {
  await delay(1000);
}

export async function mockDeleteAcademy(
  _academyId: string,
  _confirmText: string,
): Promise<void> {
  await delay(1000);
}

export async function mockResetTutorial(_profileId: string): Promise<void> {
  await delay();
}

export async function mockResetChecklist(_profileId: string): Promise<void> {
  await delay();
}

export async function mockUploadAvatar(
  _profileId: string,
  _file: File,
): Promise<string> {
  await delay(800);
  return 'https://storage.example.com/avatars/new-avatar.jpg';
}

export async function mockUploadAcademyLogo(
  _academyId: string,
  _file: File,
): Promise<string> {
  await delay(800);
  return 'https://storage.example.com/logos/new-logo.jpg';
}

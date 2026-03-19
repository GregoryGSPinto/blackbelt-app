// ── User Preferences ─────────────────────────────────────────────────

export interface UserPreferences {
  // Notifications
  notifications_app: Record<string, boolean>;
  notifications_email: Record<string, boolean>;
  notifications_whatsapp: Record<string, boolean>;
  notifications_push: boolean;
  notifications_sound: boolean;
  notifications_vibration: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: string;
  date_format: 'dd/mm/yyyy' | 'dd_month';
  currency: string;
  timezone: string;
  sidebar_mode: 'expanded' | 'compact' | 'auto';

  // Training (student specific)
  training_goal_weekly: number;
  training_goal_monthly_percent: number;
  streak_count_weekends: boolean;
  streak_rest_day: string;
  training_reminder_before: string;
  training_reminder_missed: boolean;
  training_reminder_weekly_goal: boolean;
  privacy_show_ranking: boolean;
  privacy_show_streak: boolean;
  privacy_show_achievements: boolean;
  privacy_professor_notes: boolean;
  video_quality: string;
  video_download_offline: boolean;
  video_autoplay_next: boolean;

  // Professor specific
  timer_round_duration: string;
  timer_interval: string;
  timer_rounds: number;
  timer_sound: string;
  timer_vibration: boolean;
  attendance_type: string;
  attendance_show_photo: boolean;
  attendance_sound: boolean;
  class_mode_show: string[];
  class_mode_screen_on: boolean;
  class_mode_brightness: boolean;
  post_class_diary_reminder: boolean;
  post_class_evaluation_after: number;
  post_class_auto_summary: boolean;

  // Teen specific
  nickname: string;
  avatar_emoji: string;
  displayed_title: string;

  // Kids specific
  mascot: string;
  favorite_color: string;
  sounds_enabled: boolean;
  mascot_music: boolean;

  // Receptionist specific
  register_payments: boolean;
  auto_receipt: boolean;
  mandatory_cash_closing: boolean;
  quick_register_required_fields: string[];
  default_class: string;
  default_modality: string;
  trial_duration_days: number;
  trial_auto_reminder: boolean;
  trial_reminder_template: string;
}

// ── Academy Settings ─────────────────────────────────────────────────

export interface AcademySettings {
  // Basic info
  name: string;
  slug: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;

  // Address
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;

  // Business
  cnpj: string;
  legal_name: string;
  state_registration: string;

  // Modalities
  modalities: string[];

  // Hours
  hours: Record<string, { open: string; close: string; is_open: boolean }>;

  // Theme
  primary_color: string;
  secondary_color: string;

  // Check-in
  checkin_methods: string[];
  qr_renewal_interval: string;
  late_tolerance_minutes: number;
  allow_off_schedule_checkin: boolean;

  // Graduations
  belt_system: string;
  min_time_between_graduations: string;
  min_attendance_for_graduation: number;
  graduation_approval: string[];

  // Content
  who_can_upload: string[];
  max_video_size_mb: number;
  require_approval_before_publish: boolean;
}

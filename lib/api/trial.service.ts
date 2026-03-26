import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type TrialStatus = 'active' | 'converted' | 'expired' | 'cancelled' | 'no_show';
export type TrialSource = 'walk_in' | 'website' | 'instagram' | 'facebook' | 'google' | 'referral' | 'event' | 'whatsapp' | 'other';
export type ExperienceLevel = 'beginner' | 'some_experience' | 'intermediate' | 'advanced';
export type TrialActivityType = 'registered' | 'first_visit' | 'class_attended' | 'checkin' | 'viewed_schedule' | 'viewed_modality' | 'opened_app' | 'watched_video' | 'met_professor' | 'received_belt' | 'feedback_given' | 'plan_viewed' | 'conversion_started' | 'converted' | 'expired' | 'follow_up_call' | 'follow_up_whatsapp';

export interface TrialStudent {
  id: string;
  academy_id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  source: TrialSource;
  referred_by_profile_id?: string;
  modalities_interest: string[];
  experience_level: ExperienceLevel;
  goals?: string;
  how_heard_about?: string;
  has_health_issues: boolean;
  health_notes?: string;
  trial_start_date: string;
  trial_end_date: string;
  trial_classes_attended: number;
  trial_classes_limit: number;
  profile_id?: string;
  membership_id?: string;
  status: TrialStatus;
  converted_at?: string;
  converted_plan?: string;
  expiry_notified: boolean;
  rating?: number;
  feedback?: string;
  would_recommend?: boolean;
  admin_notes?: string;
  assigned_professor_id?: string;
  follow_up_date?: string;
  follow_up_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrialActivity {
  id: string;
  trial_student_id: string;
  academy_id: string;
  activity_type: TrialActivityType;
  details: Record<string, unknown>;
  created_at: string;
}

export interface TrialConfig {
  id: string;
  academy_id: string;
  trial_duration_days: number;
  trial_classes_limit: number;
  require_health_declaration: boolean;
  require_phone: boolean;
  require_email: boolean;
  auto_create_account: boolean;
  welcome_message: string;
  expiry_warning_message: string;
  expired_message: string;
  send_welcome_whatsapp: boolean;
  send_day3_reminder: boolean;
  send_day5_reminder: boolean;
  send_expiry_notification: boolean;
  send_post_expiry_offer: boolean;
  conversion_discount_percent: number;
  conversion_discount_valid_days: number;
  created_at: string;
  updated_at: string;
}

export interface TrialMetrics {
  total_trials: number;
  active_now: number;
  converted_count: number;
  conversion_rate: number;
  avg_classes_attended: number;
  top_source: string;
  top_modality: string;
  expiring_in_3_days: number;
}

export interface RegisterTrialData {
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  source: TrialSource;
  modalities_interest: string[];
  experience_level: ExperienceLevel;
  goals?: string;
  how_heard_about?: string;
  has_health_issues?: boolean;
  health_notes?: string;
  referred_by_profile_id?: string;
}

// ────────────────────────────────────────────────────────────
// REGISTRATION
// ────────────────────────────────────────────────────────────

export async function registerTrialStudent(
  academyId: string,
  data: RegisterTrialData,
): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockRegisterTrialStudent } = await import('@/lib/mocks/trial.mock');
      return mockRegisterTrialStudent(academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7);

    const { data: student, error } = await sb
      .from('trial_students')
      .insert({
        academy_id: academyId,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        birth_date: data.birth_date ?? null,
        source: data.source,
        referred_by_profile_id: data.referred_by_profile_id ?? null,
        modalities_interest: data.modalities_interest,
        experience_level: data.experience_level,
        goals: data.goals ?? null,
        how_heard_about: data.how_heard_about ?? null,
        has_health_issues: data.has_health_issues ?? false,
        health_notes: data.health_notes ?? null,
        trial_start_date: now.toISOString().split('T')[0],
        trial_end_date: trialEnd.toISOString().split('T')[0],
        trial_classes_attended: 0,
        trial_classes_limit: 7,
        status: 'active',
        expiry_notified: false,
        follow_up_done: false,
      })
      .select()
      .single();

    if (error || !student) {
      console.error('[registerTrialStudent]', error?.message);
      return null;
    }

    // Log 'registered' activity
    await sb.from('trial_activities').insert({
      trial_student_id: student.id,
      academy_id: academyId,
      activity_type: 'registered',
      details: { source: data.source },
    });

    return student as TrialStudent;
  } catch (error: unknown) {
    console.error('[registerTrialStudent]', (error as Error)?.message);
    return null;
  }
}

export async function registerTrialFromWebsite(
  academyId: string,
  data: RegisterTrialData,
): Promise<TrialStudent | null> {
  return registerTrialStudent(academyId, { ...data, source: 'website' });
}

// ────────────────────────────────────────────────────────────
// QUERIES
// ────────────────────────────────────────────────────────────

export async function listTrialStudents(
  academyId: string,
  filters?: {
    status?: TrialStatus;
    source?: TrialSource;
    modality?: string;
    professor_id?: string;
  },
): Promise<TrialStudent[]> {
  try {
    if (isMock()) {
      const { mockListTrialStudents } = await import('@/lib/mocks/trial.mock');
      return mockListTrialStudents(academyId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    let query = sb
      .from('trial_students')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.modality) {
      query = query.contains('modalities_interest', [filters.modality]);
    }
    if (filters?.professor_id) {
      query = query.eq('assigned_professor_id', filters.professor_id);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('[listTrialStudents]', error?.message);
      return [];
    }

    return data as TrialStudent[];
  } catch (error: unknown) {
    console.error('[listTrialStudents]', (error as Error)?.message);
    return [];
  }
}

export async function getTrialStudent(trialId: string): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockGetTrialStudent } = await import('@/lib/mocks/trial.mock');
      return mockGetTrialStudent(trialId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data, error } = await sb
      .from('trial_students')
      .select('*')
      .eq('id', trialId)
      .single();

    if (error || !data) {
      console.error('[getTrialStudent]', error?.message);
      return null;
    }

    return data as TrialStudent;
  } catch (error: unknown) {
    console.error('[getTrialStudent]', (error as Error)?.message);
    return null;
  }
}

export async function getTrialMetrics(academyId: string): Promise<TrialMetrics> {
  const fallback: TrialMetrics = {
    total_trials: 0,
    active_now: 0,
    converted_count: 0,
    conversion_rate: 0,
    avg_classes_attended: 0,
    top_source: '',
    top_modality: '',
    expiring_in_3_days: 0,
  };

  try {
    if (isMock()) {
      const { mockGetTrialMetrics } = await import('@/lib/mocks/trial.mock');
      return mockGetTrialMetrics(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data, error } = await sb
      .from('trial_students')
      .select('*')
      .eq('academy_id', academyId);

    if (error || !data || data.length === 0) {
      console.error('[getTrialMetrics]', error?.message);
      return fallback;
    }

    const trials = data as TrialStudent[];
    const total = trials.length;
    const active = trials.filter((t) => t.status === 'active');
    const converted = trials.filter((t) => t.status === 'converted');
    const totalClasses = trials.reduce((sum, t) => sum + (t.trial_classes_attended ?? 0), 0);

    // Top source
    const sourceCounts: Record<string, number> = {};
    for (const t of trials) {
      sourceCounts[t.source] = (sourceCounts[t.source] ?? 0) + 1;
    }
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    // Top modality
    const modalityCounts: Record<string, number> = {};
    for (const t of trials) {
      for (const m of t.modalities_interest ?? []) {
        modalityCounts[m] = (modalityCounts[m] ?? 0) + 1;
      }
    }
    const topModality = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    // Expiring in 3 days
    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const expiringIn3 = active.filter((t) => {
      const end = new Date(t.trial_end_date);
      return end >= now && end <= in3Days;
    });

    return {
      total_trials: total,
      active_now: active.length,
      converted_count: converted.length,
      conversion_rate: total > 0 ? converted.length / total : 0,
      avg_classes_attended: total > 0 ? totalClasses / total : 0,
      top_source: topSource,
      top_modality: topModality,
      expiring_in_3_days: expiringIn3.length,
    };
  } catch (error: unknown) {
    console.error('[getTrialMetrics]', (error as Error)?.message);
    return fallback;
  }
}

export async function getExpiringTrials(
  academyId: string,
  days: number,
): Promise<TrialStudent[]> {
  try {
    if (isMock()) {
      const { mockGetExpiringTrials } = await import('@/lib/mocks/trial.mock');
      return mockGetExpiringTrials(academyId, days);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await sb
      .from('trial_students')
      .select('*')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .gte('trial_end_date', now.toISOString().split('T')[0])
      .lte('trial_end_date', futureDate.toISOString().split('T')[0])
      .order('trial_end_date', { ascending: true });

    if (error || !data) {
      console.error('[getExpiringTrials]', error?.message);
      return [];
    }

    return data as TrialStudent[];
  } catch (error: unknown) {
    console.error('[getExpiringTrials]', (error as Error)?.message);
    return [];
  }
}

export async function getTrialActivity(trialId: string): Promise<TrialActivity[]> {
  try {
    if (isMock()) {
      const { mockGetTrialActivity } = await import('@/lib/mocks/trial.mock');
      return mockGetTrialActivity(trialId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data, error } = await sb
      .from('trial_activities')
      .select('*')
      .eq('trial_student_id', trialId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('[getTrialActivity]', error?.message);
      return [];
    }

    return data as TrialActivity[];
  } catch (error: unknown) {
    console.error('[getTrialActivity]', (error as Error)?.message);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// MANAGEMENT
// ────────────────────────────────────────────────────────────

export async function updateTrialStudent(
  trialId: string,
  data: Partial<TrialStudent>,
): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockUpdateTrialStudent } = await import('@/lib/mocks/trial.mock');
      return mockUpdateTrialStudent(trialId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data: updated, error } = await sb
      .from('trial_students')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', trialId)
      .select()
      .single();

    if (error || !updated) {
      console.error('[updateTrialStudent]', error?.message);
      return null;
    }

    return updated as TrialStudent;
  } catch (error: unknown) {
    console.error('[updateTrialStudent]', (error as Error)?.message);
    return null;
  }
}

export async function assignProfessor(trialId: string, professorId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockAssignProfessor } = await import('@/lib/mocks/trial.mock');
      return mockAssignProfessor(trialId, professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { error } = await sb
      .from('trial_students')
      .update({ assigned_professor_id: professorId, updated_at: new Date().toISOString() })
      .eq('id', trialId);

    if (error) {
      console.error('[assignProfessor]', error?.message);
    }
  } catch (error: unknown) {
    console.error('[assignProfessor]', (error as Error)?.message);
  }
}

export async function scheduleFollowUp(trialId: string, date: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockScheduleFollowUp } = await import('@/lib/mocks/trial.mock');
      return mockScheduleFollowUp(trialId, date);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { error } = await sb
      .from('trial_students')
      .update({ follow_up_date: date, follow_up_done: false, updated_at: new Date().toISOString() })
      .eq('id', trialId);

    if (error) {
      console.error('[scheduleFollowUp]', error?.message);
    }
  } catch (error: unknown) {
    console.error('[scheduleFollowUp]', (error as Error)?.message);
  }
}

export async function markFollowUpDone(trialId: string, notes?: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarkFollowUpDone } = await import('@/lib/mocks/trial.mock');
      return mockMarkFollowUpDone(trialId, notes ?? '');
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const updatePayload: Record<string, unknown> = {
      follow_up_done: true,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updatePayload.admin_notes = notes;
    }

    const { error } = await sb
      .from('trial_students')
      .update(updatePayload)
      .eq('id', trialId);

    if (error) {
      console.error('[markFollowUpDone]', error?.message);
    }
  } catch (error: unknown) {
    console.error('[markFollowUpDone]', (error as Error)?.message);
  }
}

export async function extendTrial(
  trialId: string,
  extraDays: number,
): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockExtendTrial } = await import('@/lib/mocks/trial.mock');
      return mockExtendTrial(trialId, extraDays);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    // Fetch current trial to get the existing end date
    const { data: current, error: fetchError } = await sb
      .from('trial_students')
      .select('trial_end_date')
      .eq('id', trialId)
      .single();

    if (fetchError || !current) {
      console.error('[extendTrial]', fetchError?.message);
      return null;
    }

    const currentEnd = new Date(current.trial_end_date);
    currentEnd.setDate(currentEnd.getDate() + extraDays);
    const newEndDate = currentEnd.toISOString().split('T')[0];

    const { data: updated, error } = await sb
      .from('trial_students')
      .update({ trial_end_date: newEndDate, updated_at: new Date().toISOString() })
      .eq('id', trialId)
      .select()
      .single();

    if (error || !updated) {
      console.error('[extendTrial]', error?.message);
      return null;
    }

    return updated as TrialStudent;
  } catch (error: unknown) {
    console.error('[extendTrial]', (error as Error)?.message);
    return null;
  }
}

export async function cancelTrial(
  trialId: string,
  reason?: string,
): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockCancelTrial } = await import('@/lib/mocks/trial.mock');
      return mockCancelTrial(trialId, reason ?? '');
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const updatePayload: Record<string, unknown> = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };
    if (reason !== undefined) {
      updatePayload.admin_notes = reason;
    }

    const { data: updated, error } = await sb
      .from('trial_students')
      .update(updatePayload)
      .eq('id', trialId)
      .select()
      .single();

    if (error || !updated) {
      console.error('[cancelTrial]', error?.message);
      return null;
    }

    return updated as TrialStudent;
  } catch (error: unknown) {
    console.error('[cancelTrial]', (error as Error)?.message);
    return null;
  }
}

export async function recordClassAttendance(
  trialId: string,
  classDetails: Record<string, unknown>,
): Promise<TrialActivity | null> {
  try {
    if (isMock()) {
      const { mockRecordClassAttendance } = await import('@/lib/mocks/trial.mock');
      return mockRecordClassAttendance(trialId, classDetails);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    // Fetch current trial to get academy_id and increment attendance
    const { data: current, error: fetchError } = await sb
      .from('trial_students')
      .select('academy_id, trial_classes_attended')
      .eq('id', trialId)
      .single();

    if (fetchError || !current) {
      console.error('[recordClassAttendance]', fetchError?.message);
      return null;
    }

    // Increment trial_classes_attended
    const { error: updateError } = await sb
      .from('trial_students')
      .update({
        trial_classes_attended: (current.trial_classes_attended ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trialId);

    if (updateError) {
      console.error('[recordClassAttendance]', updateError?.message);
    }

    // Insert activity
    const { data: activity, error: activityError } = await sb
      .from('trial_activities')
      .insert({
        trial_student_id: trialId,
        academy_id: current.academy_id,
        activity_type: 'class_attended',
        details: classDetails,
      })
      .select()
      .single();

    if (activityError || !activity) {
      console.error('[recordClassAttendance]', activityError?.message);
      return null;
    }

    return activity as TrialActivity;
  } catch (error: unknown) {
    console.error('[recordClassAttendance]', (error as Error)?.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// CONVERSION
// ────────────────────────────────────────────────────────────

export async function startConversion(
  trialId: string,
): Promise<{ redirect_url: string } | null> {
  try {
    if (isMock()) {
      const { mockStartConversion } = await import('@/lib/mocks/trial.mock');
      return mockStartConversion(trialId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    // Fetch trial student details
    const { data: student, error: fetchError } = await sb
      .from('trial_students')
      .select('*')
      .eq('id', trialId)
      .single();

    if (fetchError || !student) {
      console.error('[startConversion]', fetchError?.message);
      return null;
    }

    // Log activity
    await sb.from('trial_activities').insert({
      trial_student_id: trialId,
      academy_id: student.academy_id,
      activity_type: 'conversion_started',
      details: {},
    });

    const params = new URLSearchParams({
      trial_id: trialId,
      name: student.name ?? '',
      phone: student.phone ?? '',
    });
    if (student.email) {
      params.set('email', student.email);
    }

    return {
      redirect_url: `/matricula?${params.toString()}`,
    };
  } catch (error: unknown) {
    console.error('[startConversion]', (error as Error)?.message);
    return null;
  }
}

export async function convertTrial(
  trialId: string,
  planSlug: string,
): Promise<TrialStudent | null> {
  try {
    if (isMock()) {
      const { mockConvertTrial } = await import('@/lib/mocks/trial.mock');
      return mockConvertTrial(trialId, planSlug);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const now = new Date().toISOString();

    const { data: updated, error } = await sb
      .from('trial_students')
      .update({
        status: 'converted',
        converted_at: now,
        converted_plan: planSlug,
        updated_at: now,
      })
      .eq('id', trialId)
      .select()
      .single();

    if (error || !updated) {
      console.error('[convertTrial]', error?.message);
      return null;
    }

    // Log 'converted' activity
    await sb.from('trial_activities').insert({
      trial_student_id: trialId,
      academy_id: updated.academy_id,
      activity_type: 'converted',
      details: { plan_slug: planSlug },
    });

    return updated as TrialStudent;
  } catch (error: unknown) {
    console.error('[convertTrial]', (error as Error)?.message);
    return null;
  }
}

export async function getConversionOffer(
  trialId: string,
): Promise<{ discount_percent: number; valid_until: string } | null> {
  try {
    if (isMock()) {
      const { mockGetConversionOffer } = await import('@/lib/mocks/trial.mock');
      return mockGetConversionOffer(trialId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    // Fetch the trial student to get academy_id
    const { data: student, error: studentError } = await sb
      .from('trial_students')
      .select('academy_id, trial_end_date')
      .eq('id', trialId)
      .single();

    if (studentError || !student) {
      console.error('[getConversionOffer]', studentError?.message);
      return null;
    }

    // Fetch trial config for the academy
    const { data: config, error: configError } = await sb
      .from('trial_config')
      .select('conversion_discount_percent, conversion_discount_valid_days')
      .eq('academy_id', student.academy_id)
      .single();

    if (configError || !config) {
      console.error('[getConversionOffer]', configError?.message);
      return null;
    }

    if (!config.conversion_discount_percent || config.conversion_discount_percent <= 0) {
      return null;
    }

    const endDate = new Date(student.trial_end_date);
    endDate.setDate(endDate.getDate() + (config.conversion_discount_valid_days ?? 0));

    return {
      discount_percent: config.conversion_discount_percent,
      valid_until: endDate.toISOString().split('T')[0],
    };
  } catch (error: unknown) {
    console.error('[getConversionOffer]', (error as Error)?.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// FEEDBACK
// ────────────────────────────────────────────────────────────

export async function submitTrialFeedback(
  trialId: string,
  rating: number,
  feedback: string,
  wouldRecommend: boolean,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockSubmitTrialFeedback } = await import('@/lib/mocks/trial.mock');
      return mockSubmitTrialFeedback(trialId, rating, feedback, wouldRecommend);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data: updated, error } = await sb
      .from('trial_students')
      .update({
        rating,
        feedback,
        would_recommend: wouldRecommend,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trialId)
      .select('academy_id')
      .single();

    if (error || !updated) {
      console.error('[submitTrialFeedback]', error?.message);
      return;
    }

    // Log 'feedback_given' activity
    await sb.from('trial_activities').insert({
      trial_student_id: trialId,
      academy_id: updated.academy_id,
      activity_type: 'feedback_given',
      details: { rating, would_recommend: wouldRecommend },
    });
  } catch (error: unknown) {
    console.error('[submitTrialFeedback]', (error as Error)?.message);
  }
}

export async function getTrialFeedbacks(
  academyId: string,
): Promise<Array<{ trial_student: TrialStudent; rating: number; feedback: string }>> {
  try {
    if (isMock()) {
      const { mockGetTrialFeedbacks } = await import('@/lib/mocks/trial.mock');
      return mockGetTrialFeedbacks(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data, error } = await sb
      .from('trial_students')
      .select('*')
      .eq('academy_id', academyId)
      .not('rating', 'is', null)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('[getTrialFeedbacks]', error?.message);
      return [];
    }

    return (data as TrialStudent[]).map((student) => ({
      trial_student: student,
      rating: student.rating ?? 0,
      feedback: student.feedback ?? '',
    }));
  } catch (error: unknown) {
    console.error('[getTrialFeedbacks]', (error as Error)?.message);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────

export async function getTrialConfig(academyId: string): Promise<TrialConfig | null> {
  try {
    if (isMock()) {
      const { mockGetTrialConfig } = await import('@/lib/mocks/trial.mock');
      return mockGetTrialConfig(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data, error } = await sb
      .from('trial_config')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (error || !data) {
      console.error('[getTrialConfig]', error?.message);
      return null;
    }

    return data as TrialConfig;
  } catch (error: unknown) {
    console.error('[getTrialConfig]', (error as Error)?.message);
    return null;
  }
}

export async function updateTrialConfig(
  academyId: string,
  data: Partial<TrialConfig>,
): Promise<TrialConfig | null> {
  try {
    if (isMock()) {
      const { mockUpdateTrialConfig } = await import('@/lib/mocks/trial.mock');
      return mockUpdateTrialConfig(academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const { data: updated, error } = await sb
      .from('trial_config')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('academy_id', academyId)
      .select()
      .single();

    if (error || !updated) {
      console.error('[updateTrialConfig]', error?.message);
      return null;
    }

    return updated as TrialConfig;
  } catch (error: unknown) {
    console.error('[updateTrialConfig]', (error as Error)?.message);
    return null;
  }
}

export async function seedDefaultConfig(academyId: string): Promise<TrialConfig | null> {
  try {
    if (isMock()) {
      const { mockSeedDefaultConfig } = await import('@/lib/mocks/trial.mock');
      return mockSeedDefaultConfig(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const sb = createBrowserClient();

    const defaults = {
      academy_id: academyId,
      trial_duration_days: 7,
      trial_classes_limit: 7,
      require_health_declaration: false,
      require_phone: true,
      require_email: false,
      auto_create_account: false,
      welcome_message: 'Bem-vindo(a) ao seu período experimental! Aproveite todas as modalidades.',
      expiry_warning_message: 'Seu período experimental está acabando! Que tal garantir sua matrícula?',
      expired_message: 'Seu período experimental terminou. Entre em contato para conhecer nossos planos!',
      send_welcome_whatsapp: true,
      send_day3_reminder: true,
      send_day5_reminder: true,
      send_expiry_notification: true,
      send_post_expiry_offer: true,
      conversion_discount_percent: 10,
      conversion_discount_valid_days: 7,
    };

    const { data, error } = await sb
      .from('trial_config')
      .upsert(defaults, { onConflict: 'academy_id' })
      .select()
      .single();

    if (error || !data) {
      console.error('[seedDefaultConfig]', error?.message);
      return null;
    }

    return data as TrialConfig;
  } catch (error: unknown) {
    console.error('[seedDefaultConfig]', (error as Error)?.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// WHATSAPP (synchronous — no DB, no isMock needed)
// ────────────────────────────────────────────────────────────

export function generateWelcomeWhatsAppLink(
  student: TrialStudent,
  academyName?: string,
): string {
  const academy = academyName ?? 'nossa academia';
  const message = `Olá ${student.name}! 👋 Bem-vindo(a) à ${academy}! Seu período experimental de 7 dias começou. Aproveite todas as modalidades! Qualquer dúvida, estamos aqui. 🥋`;
  const phone = student.phone.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateFollowUpWhatsAppLink(
  student: TrialStudent,
  type: 'day3' | 'day5' | 'expiry' | 'offer',
  config?: TrialConfig,
): string {
  const phone = student.phone.replace(/\D/g, '');
  let message = '';

  switch (type) {
    case 'day3':
      message = `Oi ${student.name}! 😊 Já faz 3 dias do seu período experimental. Como está sendo a experiência? Tem alguma dúvida sobre as aulas ou horários? Estamos aqui pra te ajudar! 💪`;
      break;
    case 'day5':
      message = `Ei ${student.name}! 🥋 Seu período experimental está quase acabando! Já aproveitou todas as modalidades? Se precisar de ajuda pra escolher um plano, é só falar. Queremos te ver por aqui! 🔥`;
      break;
    case 'expiry':
      message = config?.expired_message
        ? `${student.name}, ${config.expired_message}`
        : `${student.name}, seu período experimental terminou! 😢 Foi ótimo ter você conosco. Que tal continuar essa jornada? Temos planos especiais esperando por você! Entre em contato pra saber mais. 🥋✨`;
      break;
    case 'offer': {
      const discount = config?.conversion_discount_percent ?? 10;
      message = `${student.name}, temos uma oferta especial pra você! 🎉 Como participou do período experimental, garantimos ${discount}% de desconto na sua matrícula. Essa oferta é por tempo limitado! Vem treinar com a gente! 💪🥋`;
      break;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

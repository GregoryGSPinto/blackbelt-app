import { getAdminClient } from '@/lib/supabase/admin';
import {
  computeCheckinGoalStatus,
  shouldSendCheckinAlert,
  type CheckinGoalStatus,
  type FinancialModel,
} from '@/lib/domain/student-financial';

export interface AutomaticAlertCandidate {
  academyId: string;
  membershipId: string;
  profileId: string;
  financialModel: FinancialModel;
  role: string;
  currentMonthCheckins: number;
  monthlyCheckinMinimum: number;
  alertDaysBeforeMonthEnd: number;
  lastAlertSentAt: string | null;
  referenceDate: Date;
}

export interface AutomaticAlertDecision {
  shouldSend: boolean;
  checkinGoalStatus: CheckinGoalStatus;
  recipients: Array<'student' | 'guardian' | 'owner'>;
}

interface RawProfileRow {
  id: string;
  academy_id: string;
  membership_id: string;
  profile_id: string;
  financial_model: FinancialModel;
  monthly_checkin_minimum: number;
  current_month_checkins: number;
  alert_days_before_month_end: number;
  last_alert_sent_at: string | null;
}

interface RawMembershipRow {
  id: string;
  profile_id: string;
  role: string;
}

interface ProcessAlertResult {
  processedProfiles: number;
  alertsCreated: number;
  skippedProfiles: number;
  updatedProfiles: number;
  academies: string[];
}

export function decideAutomaticCheckinAlert(candidate: AutomaticAlertCandidate): AutomaticAlertDecision {
  const checkinGoalStatus = computeCheckinGoalStatus({
    financialModel: candidate.financialModel,
    currentMonthCheckins: candidate.currentMonthCheckins,
    monthlyCheckinMinimum: candidate.monthlyCheckinMinimum,
    referenceDate: candidate.referenceDate,
  });

  const shouldSend = shouldSendCheckinAlert({
    financialModel: candidate.financialModel,
    checkinGoalStatus,
    alertDaysBeforeMonthEnd: candidate.alertDaysBeforeMonthEnd,
    lastAlertSentAt: candidate.lastAlertSentAt,
    referenceDate: candidate.referenceDate,
  });

  const recipients: Array<'student' | 'guardian' | 'owner'> = ['owner'];
  if (candidate.role === 'aluno_kids') recipients.unshift('guardian');
  else recipients.unshift('student');

  return { shouldSend, checkinGoalStatus, recipients };
}

async function fetchStudentsMap(academyId: string, profileIds: string[]) {
  const admin = getAdminClient();
  const { data } = await admin
    .from('students')
    .select('id, profile_id')
    .eq('academy_id', academyId)
    .in('profile_id', profileIds);

  return new Map((data ?? []).map((row: { id: string; profile_id: string }) => [row.profile_id, row.id]));
}

async function getCheckinCountsByProfile(academyId: string, profileIds: string[]) {
  const admin = getAdminClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const studentMap = await fetchStudentsMap(academyId, profileIds);
  const studentIds = Array.from(studentMap.values());

  const [attendanceRes, checkinsRes] = await Promise.all([
    studentIds.length > 0
      ? admin.from('attendance').select('student_id').in('student_id', studentIds).gte('checked_at', monthStart)
      : Promise.resolve({ data: [], error: null }),
    admin.from('checkins').select('profile_id').eq('academy_id', academyId).in('profile_id', profileIds).gte('check_in_at', monthStart),
  ]);

  const attendanceCounts = new Map<string, number>();
  const reverseStudents = new Map<string, string>();
  studentMap.forEach((studentId, profileId) => reverseStudents.set(studentId, profileId));

  for (const row of attendanceRes.data ?? []) {
    const profileId = reverseStudents.get((row as { student_id: string }).student_id);
    if (!profileId) continue;
    attendanceCounts.set(profileId, (attendanceCounts.get(profileId) ?? 0) + 1);
  }

  const checkinCounts = new Map<string, number>();
  for (const row of checkinsRes.data ?? []) {
    const profileId = (row as { profile_id: string }).profile_id;
    checkinCounts.set(profileId, (checkinCounts.get(profileId) ?? 0) + 1);
  }

  return { attendanceCounts, checkinCounts };
}

export async function processAutomaticStudentFinancialAlerts(
  options?: { academyId?: string; referenceDate?: Date },
): Promise<ProcessAlertResult> {
  const admin = getAdminClient();
  const referenceDate = options?.referenceDate ?? new Date();
  const referenceDay = referenceDate.toISOString().slice(0, 10);

  let profilesQuery = admin
    .from('student_financial_profiles')
    .select('id, academy_id, membership_id, profile_id, financial_model, monthly_checkin_minimum, current_month_checkins, alert_days_before_month_end, last_alert_sent_at')
    .in('financial_model', ['gympass', 'totalpass']);

  if (options?.academyId) profilesQuery = profilesQuery.eq('academy_id', options.academyId);

  const { data: rawProfiles, error } = await profilesQuery;
  if (error) throw error;
  if (!rawProfiles || rawProfiles.length === 0) {
    return { processedProfiles: 0, alertsCreated: 0, skippedProfiles: 0, updatedProfiles: 0, academies: [] };
  }

  const profilesByAcademy = new Map<string, RawProfileRow[]>();
  for (const profile of rawProfiles as RawProfileRow[]) {
    profilesByAcademy.set(profile.academy_id, [...(profilesByAcademy.get(profile.academy_id) ?? []), profile]);
  }

  let processedProfiles = 0;
  let alertsCreated = 0;
  let skippedProfiles = 0;
  let updatedProfiles = 0;

  for (const [academyId, academyProfiles] of profilesByAcademy.entries()) {
    const membershipIds = academyProfiles.map((profile) => profile.membership_id);
    const profileIds = academyProfiles.map((profile) => profile.profile_id);

    const [{ data: memberships }, { data: guardians }, { data: academy }, counts] = await Promise.all([
      admin.from('memberships').select('id, profile_id, role').in('id', membershipIds),
      admin.from('guardian_links').select('guardian_id, child_id').in('child_id', profileIds).eq('can_manage_payments', true),
      admin.from('academies').select('owner_id').eq('id', academyId).single(),
      getCheckinCountsByProfile(academyId, profileIds),
    ]);

    let ownerProfileId: string | null = null;
    if (academy?.owner_id) {
      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('user_id', academy.owner_id)
        .maybeSingle();
      ownerProfileId = (ownerProfile?.id as string | undefined) ?? null;
    }

    const membershipMap = new Map((memberships ?? []).map((row: RawMembershipRow) => [row.id, row]));
    const guardiansByChild = new Map<string, string[]>();
    for (const row of guardians ?? []) {
      const typed = row as { guardian_id: string; child_id: string };
      guardiansByChild.set(typed.child_id, [...(guardiansByChild.get(typed.child_id) ?? []), typed.guardian_id]);
    }

    for (const rawProfile of academyProfiles) {
      processedProfiles += 1;
      const membership = membershipMap.get(rawProfile.membership_id);
      if (!membership) {
        skippedProfiles += 1;
        continue;
      }

      const currentMonthCheckins = Math.max(
        rawProfile.current_month_checkins,
        counts.attendanceCounts.get(rawProfile.profile_id) ?? 0,
        counts.checkinCounts.get(rawProfile.profile_id) ?? 0,
      );

      const decision = decideAutomaticCheckinAlert({
        academyId,
        membershipId: rawProfile.membership_id,
        profileId: rawProfile.profile_id,
        financialModel: rawProfile.financial_model,
        role: membership.role,
        currentMonthCheckins,
        monthlyCheckinMinimum: rawProfile.monthly_checkin_minimum,
        alertDaysBeforeMonthEnd: rawProfile.alert_days_before_month_end,
        lastAlertSentAt: rawProfile.last_alert_sent_at,
        referenceDate,
      });

      const guardianIds = guardiansByChild.get(rawProfile.profile_id) ?? [];
      const finalRecipients: Array<{ type: 'student' | 'guardian' | 'owner'; recipientProfileId: string | null }> = [];

      if (decision.recipients.includes('student') && membership.role !== 'aluno_kids') {
        finalRecipients.push({ type: 'student', recipientProfileId: rawProfile.profile_id });
      }
      if (decision.recipients.includes('guardian')) {
        for (const guardianId of guardianIds) {
          finalRecipients.push({ type: 'guardian', recipientProfileId: guardianId });
        }
      }
      if (decision.recipients.includes('owner')) {
        finalRecipients.push({ type: 'owner', recipientProfileId: ownerProfileId });
      }

      const { error: updateError } = await admin
        .from('student_financial_profiles')
        .update({
          current_month_checkins: currentMonthCheckins,
          checkin_goal_status: decision.checkinGoalStatus,
        })
        .eq('membership_id', rawProfile.membership_id);

      if (updateError) throw updateError;
      updatedProfiles += 1;

      if (!decision.shouldSend || finalRecipients.length === 0) {
        skippedProfiles += 1;
        continue;
      }

      const missingCheckins = Math.max(rawProfile.monthly_checkin_minimum - currentMonthCheckins, 0);
      const payload = finalRecipients.map((recipient) => ({
        academy_id: academyId,
        membership_id: rawProfile.membership_id,
        profile_id: rawProfile.profile_id,
        recipient_profile_id: recipient.recipientProfileId,
        recipient_type: recipient.type,
        alert_kind: 'checkin_goal',
        channel: recipient.type === 'owner' ? 'dashboard' : 'internal',
        status: 'sent',
        alert_reference_date: referenceDay,
        remaining_checkins: missingCheckins,
        message: `Faltam ${missingCheckins} check-ins para a meta do mês.`,
      }));

      const { error: upsertError } = await admin.from('student_financial_alerts').upsert(payload, {
        onConflict: 'membership_id,alert_kind,recipient_type,alert_reference_date',
        ignoreDuplicates: true,
      });
      if (upsertError) throw upsertError;

      const { error: flagsError } = await admin
        .from('student_financial_profiles')
        .update({
          last_alert_sent_at: referenceDate.toISOString(),
          last_alert_sent_to_student: payload.some((row) => row.recipient_type === 'student'),
          last_alert_sent_to_guardian: payload.some((row) => row.recipient_type === 'guardian'),
          last_alert_sent_to_owner: payload.some((row) => row.recipient_type === 'owner'),
        })
        .eq('membership_id', rawProfile.membership_id);

      if (flagsError) throw flagsError;
      alertsCreated += payload.length;
    }
  }

  return {
    processedProfiles,
    alertsCreated,
    skippedProfiles,
    updatedProfiles,
    academies: Array.from(profilesByAcademy.keys()),
  };
}

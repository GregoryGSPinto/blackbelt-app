import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import { createBrowserClient } from '@/lib/supabase/client';

export interface StudentHealthScore {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: string;
  score: number; // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  frequency_score: number;
  financial_score: number;
  evolution_score: number;
  engagement_score: number;
  social_score: number;
  last_checkin: string | null;
  days_absent: number;
  subscription_status: string;
}

export interface AcademyHealthSummary {
  average_score: number;
  total_students: number;
  at_risk: number;
  critical: number;
  healthy: number;
}

function riskFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'high';
  return 'critical';
}

export async function getAcademyHealth(academyId: string): Promise<AcademyHealthSummary> {
  try {
    if (isMock()) {
      const { mockGetAcademyHealth } = await import('@/lib/mocks/health-score.mock');
      return mockGetAcademyHealth(academyId);
    }

    // Fetch all student health scores to compute summary
    const scores = await getStudentHealthScores(academyId);

    const total = scores.length;
    const average = total > 0 ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / total) : 0;
    const critical = scores.filter((s) => s.risk === 'critical').length;
    const atRisk = scores.filter((s) => s.risk === 'high' || s.risk === 'medium').length;
    const healthy = scores.filter((s) => s.risk === 'low').length;

    return { average_score: average, total_students: total, at_risk: atRisk, critical, healthy };
  } catch (error) { handleServiceError(error, 'healthScore.academyHealth'); }
}

export async function getStudentHealthScores(academyId: string): Promise<StudentHealthScore[]> {
  try {
    if (isMock()) {
      const { mockGetStudentHealthScores } = await import('@/lib/mocks/health-score.mock');
      return mockGetStudentHealthScores(academyId);
    }

    const supabase = createBrowserClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    // Fetch students with profiles
    const { data: students, error: studentsErr } = await supabase
      .from('students')
      .select('id, profile_id, belt, profiles(display_name, avatar)')
      .eq('academy_id', academyId);

    if (studentsErr) throw new ServiceError(500, 'healthScore.students', studentsErr.message);
    type StudentRow = { id: string; profile_id: string; belt: string; profiles: { display_name: string | null; avatar: string | null } | null };
    const typedStudents = (students ?? []) as StudentRow[];
    if (typedStudents.length === 0) return [];

    const studentIds = typedStudents.map((s) => s.id);

    // Fetch attendance in last 30 days
    const { data: attendance } = await supabase
      .from('attendance')
      .select('student_id, checked_in_at')
      .in('student_id', studentIds)
      .gte('checked_in_at', thirtyDaysAgo);

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('student_id, status')
      .in('student_id', studentIds);

    const attendanceMap = new Map<string, string[]>();
    for (const a of attendance || []) {
      const list = attendanceMap.get(a.student_id) || [];
      list.push(a.checked_in_at);
      attendanceMap.set(a.student_id, list);
    }

    const subMap = new Map<string, string>();
    for (const sub of subscriptions || []) {
      subMap.set(sub.student_id, sub.status);
    }

    return typedStudents.map((s) => {
      const profile = s.profiles;
      const sid = s.id;
      const checkins = attendanceMap.get(sid) || [];
      const subStatus = subMap.get(sid) || 'unknown';

      const lastCheckin = checkins.length > 0 ? checkins.sort().reverse()[0] : null;
      const daysAbsent = lastCheckin
        ? Math.floor((Date.now() - new Date(lastCheckin).getTime()) / 86400000)
        : 999;

      // Compute component scores
      const frequencyScore = Math.min(100, Math.round((checkins.length / 12) * 100));
      const financialScore = subStatus === 'active' ? 100 : subStatus === 'overdue' ? 20 : 50;
      const evolutionScore = Math.min(100, 50 + Math.floor(Math.random() * 30)); // placeholder
      const engagementScore = Math.min(100, Math.round((checkins.length / 8) * 100));
      const socialScore = 60; // placeholder until social features tracked

      const score = Math.round(
        frequencyScore * 0.3 +
        financialScore * 0.25 +
        evolutionScore * 0.2 +
        engagementScore * 0.15 +
        socialScore * 0.1
      );

      return {
        student_id: sid,
        display_name: profile?.display_name ?? 'Desconhecido',
        avatar: profile?.avatar ?? null,
        belt: s.belt ?? 'white',
        score,
        risk: riskFromScore(score),
        frequency_score: frequencyScore,
        financial_score: financialScore,
        evolution_score: evolutionScore,
        engagement_score: engagementScore,
        social_score: socialScore,
        last_checkin: lastCheckin,
        days_absent: daysAbsent,
        subscription_status: subStatus,
      };
    });
  } catch (error) { handleServiceError(error, 'healthScore.studentScores'); }
}

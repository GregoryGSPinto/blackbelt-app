import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';

export interface NpsSubmission {
  score: number;
  reason?: string;
  what_would_improve?: string;
  favorite_feature?: string;
  survey_trigger?: 'scheduled' | 'manual' | '7_day' | '30_day' | 'post_onboarding';
}

export interface NpsResult {
  id: string;
  academy_id: string;
  user_name: string;
  user_role: string;
  score: number;
  reason: string;
  what_would_improve: string;
  favorite_feature: string;
  survey_trigger: string;
  created_at: string;
}

export async function submitNps(data: NpsSubmission): Promise<boolean> {
  if (isMock()) { return true; }

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, display_name')
    .eq('user_id', user.id)
    .single();

  const { data: membership } = await supabase
    .from('memberships')
    .select('academy_id')
    .eq('profile_id', profile?.id ?? '')
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from('beta_nps').insert({
    academy_id: membership?.academy_id,
    user_id: user.id,
    user_name: profile?.display_name || user.email,
    user_role: profile?.role,
    score: data.score,
    reason: data.reason,
    what_would_improve: data.what_would_improve,
    favorite_feature: data.favorite_feature,
    survey_trigger: data.survey_trigger || 'manual',
  });

  return !error;
}

export async function getNpsData(academy_id?: string): Promise<{
  responses: NpsResult[];
  nps_score: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}> {
  if (isMock()) return { responses: [], nps_score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };

  const supabase = createBrowserClient();
  let query = supabase.from('beta_nps').select('*').order('created_at', { ascending: false });
  if (academy_id) query = query.eq('academy_id', academy_id);

  const { data } = await query;
  const responses = (data as NpsResult[]) || [];
  const total = responses.length;

  const promoters = responses.filter(r => r.score >= 9).length;
  const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
  const detractors = responses.filter(r => r.score <= 6).length;

  const nps_score = total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : 0;

  return { responses, nps_score, promoters, passives, detractors, total };
}

export async function shouldShowNpsSurvey(): Promise<{ show: boolean; trigger: string }> {
  if (isMock()) return { show: false, trigger: '' };

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { show: false, trigger: '' };

  const { data: lastNps } = await supabase
    .from('beta_nps')
    .select('created_at, survey_trigger')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastNps) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      const daysSinceSignup = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSignup >= 7) return { show: true, trigger: '7_day' };
    }
    return { show: false, trigger: '' };
  }

  const daysSinceLastNps = (Date.now() - new Date(lastNps.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastNps >= 30) return { show: true, trigger: '30_day' };

  return { show: false, trigger: '' };
}

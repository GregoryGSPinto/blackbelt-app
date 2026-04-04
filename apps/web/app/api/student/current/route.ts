import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/api/v1/auth-guard';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;

  const { auth } = authResult;
  const admin = getAdminClient();
  const { data: student, error } = await admin
    .from('students')
    .select('id, academy_id, profile_id')
    .eq('profile_id', auth.profileId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!student?.id) {
    return NextResponse.json({ studentId: null, academyId: auth.academyId, profileId: auth.profileId }, { status: 200 });
  }

  return NextResponse.json({
    studentId: student.id,
    academyId: student.academy_id,
    profileId: student.profile_id,
  });
}

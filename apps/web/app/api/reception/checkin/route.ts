import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/api/v1/auth-guard';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function mapFinancialStatus(billingStatus: string | null): 'em_dia' | 'atrasado' | 'inadimplente' {
  if (billingStatus === 'atrasado') return 'atrasado';
  if (billingStatus === 'cancelado' || billingStatus === 'pendente') return 'inadimplente';
  return 'em_dia';
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) {
    return authResult.error;
  }

  const admin = getAdminClient();
  const { academyId } = authResult.auth;
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length >= 2) {
    const { data: matchingProfiles, error: profileError } = await admin
      .from('profiles')
      .select('id, display_name, avatar, role')
      .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
      .ilike('display_name', `%${query}%`)
      .limit(20);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const matchedProfileIds = (matchingProfiles ?? []).map((profile) => profile.id).filter(Boolean);
    if (matchedProfileIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const { data: students, error } = await admin
      .from('students')
      .select(`
        id, belt, profile_id, academy_id,
        profiles!students_profile_id_fkey(id, display_name, avatar, role),
        class_enrollments(status, classes(modalities(name)))
      `)
      .eq('academy_id', academyId)
      .in('profile_id', matchedProfileIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const normalizedQuery = query.toLocaleLowerCase('pt-BR');
    const profileIds = (students ?? []).map((student) => student.profile_id).filter(Boolean);

    const billingMap = new Map<string, string>();
    if (profileIds.length > 0) {
      const { data: memberships } = await admin
        .from('memberships')
        .select('profile_id, billing_status')
        .eq('academy_id', academyId)
        .eq('status', 'active')
        .in('profile_id', profileIds);

      for (const membership of memberships ?? []) {
        billingMap.set(membership.profile_id, membership.billing_status ?? 'em_dia');
      }
    }

    const results = (students ?? [])
      .map((student) => {
        const profile = student.profiles as { display_name?: string; avatar?: string; role?: string } | null;
        const studentName = (profile?.display_name ?? '').trim();
        if (!studentName || !studentName.toLocaleLowerCase('pt-BR').includes(normalizedQuery)) {
          return null;
        }

        if (!['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(profile?.role ?? '')) {
          return null;
        }

        const enrollments = (student.class_enrollments ?? []).filter((item) => item.status === 'active');
        const classNode = enrollments[0]?.classes as unknown;
        const classRow = Array.isArray(classNode) ? classNode[0] : classNode;
        const modalitiesNode = (classRow as { modalities?: unknown } | null)?.modalities;
        const modalities = Array.isArray(modalitiesNode) ? modalitiesNode[0] : modalitiesNode;
        const modalityName = ((modalities as { name?: string } | null)?.name ?? '');
        const statusFinanceiro = mapFinancialStatus(billingMap.get(student.profile_id) ?? 'em_dia');

        return {
          id: student.id,
          nome: studentName,
          avatar: profile?.avatar ?? '',
          faixa: student.belt ?? 'white',
          turma: modalityName,
          statusFinanceiro,
          diasAtraso: statusFinanceiro === 'em_dia' ? 0 : 1,
          ultimoTreino: '',
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: checkins, error } = await admin
    .from('checkins')
    .select('id, profile_name, belt, class_name, person_type, check_in_at')
    .eq('academy_id', academyId)
    .gte('check_in_at', todayStart.toISOString())
    .is('check_out_at', null)
    .order('check_in_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const pessoas = (checkins ?? []).map((item) => ({
    id: item.id,
    nome: item.profile_name ?? '',
    avatar: '',
    faixa: item.belt ?? 'white',
    horaEntrada: new Date(item.check_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    turma: item.class_name ?? '',
    tipo: item.person_type ?? 'aluno',
  }));

  return NextResponse.json({
    pessoas,
    capacidade: {
      totalDentro: pessoas.length,
      capacidadeMax: 80,
      percentual: (pessoas.length / 80) * 100,
    },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) {
    return authResult.error;
  }

  const admin = getAdminClient();
  const { academyId, role } = authResult.auth;
  if (!['admin', 'recepcao', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Sem permissao para operar o check-in.' }, { status: 403 });
  }

  const body = await request.json();
  const action = body?.action as string | undefined;

  if (action === 'entry') {
    const studentId = body?.studentId as string | undefined;
    if (!studentId) {
      return NextResponse.json({ error: 'studentId obrigatorio.' }, { status: 400 });
    }

    const { data: student } = await admin
      .from('students')
      .select('id, academy_id, profile_id, belt, profiles!students_profile_id_fkey(display_name)')
      .eq('id', studentId)
      .eq('academy_id', academyId)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Aluno nao encontrado para check-in.' }, { status: 404 });
    }

    const profile = student.profiles as { display_name?: string } | null;
    const { data: inserted, error } = await admin
      .from('checkins')
      .insert({
        academy_id: student.academy_id,
        profile_id: student.profile_id,
        profile_name: profile?.display_name ?? '',
        person_type: 'aluno',
        belt: student.belt ?? 'white',
        check_in_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  }

  if (action === 'exit') {
    const checkinId = body?.checkinId as string | undefined;
    if (!checkinId) {
      return NextResponse.json({ error: 'checkinId obrigatorio.' }, { status: 400 });
    }

    const { error } = await admin
      .from('checkins')
      .update({ check_out_at: new Date().toISOString() })
      .eq('id', checkinId)
      .eq('academy_id', academyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'visitor') {
    const nome = (body?.nome as string | undefined)?.trim();
    const motivo = (body?.motivo as string | undefined)?.trim() ?? '';
    if (!nome) {
      return NextResponse.json({ error: 'Nome do visitante obrigatorio.' }, { status: 400 });
    }

    const { error } = await admin.from('visitantes').insert({
      academy_id: academyId,
      nome,
      motivo,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Acao de check-in invalida.' }, { status: 400 });
}

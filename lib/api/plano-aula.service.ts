import { isMock } from '@/lib/env';

// ── DTOs ─────────────────────────────────────────────────────────────

export interface TechniqueBlock {
  name: string;
  description: string;
  duration_minutes: number;
}

export interface LessonPlanDTO {
  id: string;
  class_id: string;
  date: string;
  theme: string;
  warmup: string;
  technique_1: TechniqueBlock;
  technique_2: TechniqueBlock;
  drilling: string;
  sparring: string;
  notes: string;
  professor_name: string;
  created_at: string;
}

export interface LessonPlanTemplateDTO {
  id: string;
  name: string;
  theme: string;
  warmup: string;
  technique_1: TechniqueBlock;
  technique_2: TechniqueBlock;
  drilling: string;
  sparring: string;
  notes: string;
}

export interface StudentHighlight {
  student_id: string;
  student_name: string;
  note: string;
}

export interface ClassNoteDTO {
  id: string;
  class_id: string;
  date: string;
  content: string;
  student_highlights: StudentHighlight[];
  attendance_count: number;
  professor_name: string;
  created_at: string;
}

export interface CreateLessonPlanPayload {
  class_id: string;
  academy_id: string;
  date: string;
  theme: string;
  warmup: string;
  technique_1: TechniqueBlock;
  technique_2: TechniqueBlock;
  drilling: string;
  sparring: string;
  notes: string;
}

export interface SaveClassNotePayload {
  class_id: string;
  academy_id: string;
  date: string;
  content: string;
  student_highlights: StudentHighlight[];
  attendance_count: number;
}

// ── Service Functions ────────────────────────────────────────────────

export async function getLessonPlans(classId: string): Promise<LessonPlanDTO[]> {
  try {
    if (isMock()) {
      const { mockGetLessonPlans } = await import('@/lib/mocks/plano-aula.mock');
      return mockGetLessonPlans(classId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('lesson_plans')
      .select(`
        id,
        class_id,
        date,
        theme,
        warmup,
        technique_1,
        technique_2,
        drilling,
        sparring,
        notes,
        created_at,
        profiles!lesson_plans_professor_id_fkey(display_name),
        classes!inner(units!inner(academy_id))
      `)
      .eq('class_id', classId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('[getLessonPlans] error:', error.message);
      return [];
    }

    return (data ?? []).map((lp: Record<string, unknown>) => {
      const profiles = lp.profiles as Record<string, unknown> | null;
      return {
        id: lp.id as string,
        class_id: lp.class_id as string,
        date: lp.date as string,
        theme: lp.theme as string,
        warmup: lp.warmup as string,
        technique_1: lp.technique_1 as TechniqueBlock,
        technique_2: lp.technique_2 as TechniqueBlock,
        drilling: lp.drilling as string,
        sparring: lp.sparring as string,
        notes: (lp.notes ?? '') as string,
        professor_name: (profiles?.display_name ?? '') as string,
        created_at: lp.created_at as string,
      };
    });
  } catch (error) {
    console.warn('[getLessonPlans] Fallback:', error);
    return [];
  }
}

export async function createLessonPlan(data: CreateLessonPlanPayload): Promise<LessonPlanDTO> {
  try {
    if (isMock()) {
      const { mockCreateLessonPlan } = await import('@/lib/mocks/plano-aula.mock');
      return mockCreateLessonPlan(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[createLessonPlan] error: Nao autenticado');
      return { id: '', class_id: data.class_id, date: data.date, theme: data.theme, warmup: data.warmup, technique_1: data.technique_1, technique_2: data.technique_2, drilling: data.drilling, sparring: data.sparring, notes: data.notes, professor_name: '', created_at: '' };
    }

    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('lesson_plans')
      .insert({
        class_id: data.class_id,
        professor_id: user.id,
        date: data.date,
        theme: data.theme,
        warmup: data.warmup,
        technique_1: data.technique_1,
        technique_2: data.technique_2,
        drilling: data.drilling,
        sparring: data.sparring,
        notes: data.notes,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.warn('[createLessonPlan] error:', error?.message ?? 'Erro ao criar plano');
      return { id: '', class_id: data.class_id, date: data.date, theme: data.theme, warmup: data.warmup, technique_1: data.technique_1, technique_2: data.technique_2, drilling: data.drilling, sparring: data.sparring, notes: data.notes, professor_name: '', created_at: '' };
    }

    // Fetch professor name for return
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    return {
      id: inserted.id,
      class_id: data.class_id,
      date: data.date,
      theme: data.theme,
      warmup: data.warmup,
      technique_1: data.technique_1,
      technique_2: data.technique_2,
      drilling: data.drilling,
      sparring: data.sparring,
      notes: data.notes,
      professor_name: (profile?.display_name ?? '') as string,
      created_at: now,
    };
  } catch (error) {
    console.warn('[createLessonPlan] Fallback:', error);
    return { id: '', class_id: data.class_id, date: data.date, theme: data.theme, warmup: data.warmup, technique_1: data.technique_1, technique_2: data.technique_2, drilling: data.drilling, sparring: data.sparring, notes: data.notes, professor_name: '', created_at: '' };
  }
}

export async function getTemplates(): Promise<LessonPlanTemplateDTO[]> {
  try {
    if (isMock()) {
      const { mockGetTemplates } = await import('@/lib/mocks/plano-aula.mock');
      return mockGetTemplates();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('lesson_plan_templates')
      .select('id, name, theme, warmup, technique_1, technique_2, drilling, sparring, notes')
      .order('name');

    if (error) {
      console.warn('[getTemplates] error:', error.message);
      return [];
    }

    return (data ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      name: t.name as string,
      theme: (t.theme ?? '') as string,
      warmup: (t.warmup ?? '') as string,
      technique_1: (t.technique_1 ?? { name: '', description: '', duration_minutes: 15 }) as TechniqueBlock,
      technique_2: (t.technique_2 ?? { name: '', description: '', duration_minutes: 15 }) as TechniqueBlock,
      drilling: (t.drilling ?? '') as string,
      sparring: (t.sparring ?? '') as string,
      notes: (t.notes ?? '') as string,
    }));
  } catch (error) {
    console.warn('[getTemplates] Fallback:', error);
    return [];
  }
}

export async function getClassNotes(classId: string): Promise<ClassNoteDTO[]> {
  try {
    if (isMock()) {
      const { mockGetClassNotes } = await import('@/lib/mocks/plano-aula.mock');
      return mockGetClassNotes(classId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('class_notes')
      .select(`
        id,
        class_id,
        date,
        content,
        student_highlights,
        attendance_count,
        created_at,
        profiles!class_notes_professor_id_fkey(display_name),
        classes!inner(units!inner(academy_id))
      `)
      .eq('class_id', classId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('[getClassNotes] error:', error.message);
      return [];
    }

    return (data ?? []).map((n: Record<string, unknown>) => {
      const profiles = n.profiles as Record<string, unknown> | null;
      return {
        id: n.id as string,
        class_id: n.class_id as string,
        date: n.date as string,
        content: n.content as string,
        student_highlights: (n.student_highlights ?? []) as StudentHighlight[],
        attendance_count: (n.attendance_count ?? 0) as number,
        professor_name: (profiles?.display_name ?? '') as string,
        created_at: n.created_at as string,
      };
    });
  } catch (error) {
    console.warn('[getClassNotes] Fallback:', error);
    return [];
  }
}

export async function saveClassNote(data: SaveClassNotePayload): Promise<ClassNoteDTO> {
  try {
    if (isMock()) {
      const { mockSaveClassNote } = await import('@/lib/mocks/plano-aula.mock');
      return mockSaveClassNote(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[saveClassNote] error: Nao autenticado');
      return { id: '', class_id: data.class_id, date: data.date, content: data.content, student_highlights: data.student_highlights, attendance_count: data.attendance_count, professor_name: '', created_at: '' };
    }

    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('class_notes')
      .insert({
        class_id: data.class_id,
        professor_id: user.id,
        date: data.date,
        content: data.content,
        student_highlights: data.student_highlights,
        attendance_count: data.attendance_count,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.warn('[saveClassNote] error:', error?.message ?? 'Erro ao salvar nota');
      return { id: '', class_id: data.class_id, date: data.date, content: data.content, student_highlights: data.student_highlights, attendance_count: data.attendance_count, professor_name: '', created_at: '' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    return {
      id: inserted.id,
      class_id: data.class_id,
      date: data.date,
      content: data.content,
      student_highlights: data.student_highlights,
      attendance_count: data.attendance_count,
      professor_name: (profile?.display_name ?? '') as string,
      created_at: now,
    };
  } catch (error) {
    console.warn('[saveClassNote] Fallback:', error);
    return { id: '', class_id: data.class_id, date: data.date, content: data.content, student_highlights: data.student_highlights, attendance_count: data.attendance_count, professor_name: '', created_at: '' };
  }
}

// ══ NUCLEAR: Planejamento Semanal ═══════════════════════════════════════

export interface PlanoAula {
  id: string;
  professorId: string;
  turmaId: string;
  turmaNome: string;
  data: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  aquecimento: { descricao: string; duracaoMinutos: number };
  tecnicaPrincipal: { tecnicas: TecnicaPlano[]; duracaoMinutos: number; observacoes?: string };
  pratica: { tipo: 'drill' | 'sparring_posicional' | 'sparring_livre'; descricao: string; duracaoMinutos: number; regras?: string };
  encerramento: { descricao: string; duracaoMinutos: number };
  duracaoTotal: number;
  temaDaSemana?: string;
  nivelFoco: string;
  materiais?: string;
  notas: string;
}

export interface TecnicaPlano {
  tecnicaId?: string;
  nome: string;
  posicao: string;
  descricao?: string;
  videoRef?: string;
}

export interface SemanaPlanejamento {
  semana: string;
  tema: string;
  aulas: PlanoAula[];
}

export interface CreatePlanoPayload {
  turmaId: string;
  data: string;
  aquecimento: { descricao: string; duracaoMinutos: number };
  tecnicaPrincipal: { tecnicas: TecnicaPlano[]; duracaoMinutos: number; observacoes?: string };
  pratica: { tipo: 'drill' | 'sparring_posicional' | 'sparring_livre'; descricao: string; duracaoMinutos: number; regras?: string };
  encerramento: { descricao: string; duracaoMinutos: number };
  temaDaSemana?: string;
  nivelFoco: string;
  materiais?: string;
  notas: string;
}

const EMPTY_PLANO: PlanoAula = {
  id: '',
  professorId: '',
  turmaId: '',
  turmaNome: '',
  data: '',
  status: 'planejado',
  aquecimento: { descricao: '', duracaoMinutos: 0 },
  tecnicaPrincipal: { tecnicas: [], duracaoMinutos: 0 },
  pratica: { tipo: 'drill', descricao: '', duracaoMinutos: 0 },
  encerramento: { descricao: '', duracaoMinutos: 0 },
  duracaoTotal: 0,
  nivelFoco: '',
  notas: '',
};

function mapRowToPlano(row: Record<string, unknown>): PlanoAula {
  const cls = row.classes as Record<string, unknown> | null;
  const modalities = cls?.modalities as Record<string, unknown> | null;
  return {
    id: row.id as string,
    professorId: row.professor_id as string,
    turmaId: row.class_id as string,
    turmaNome: (modalities?.name ?? '') as string,
    data: row.date as string,
    status: (row.status ?? 'planejado') as PlanoAula['status'],
    aquecimento: (row.aquecimento ?? { descricao: '', duracaoMinutos: 0 }) as PlanoAula['aquecimento'],
    tecnicaPrincipal: (row.tecnica_principal ?? { tecnicas: [], duracaoMinutos: 0 }) as PlanoAula['tecnicaPrincipal'],
    pratica: (row.pratica ?? { tipo: 'drill', descricao: '', duracaoMinutos: 0 }) as PlanoAula['pratica'],
    encerramento: (row.encerramento ?? { descricao: '', duracaoMinutos: 0 }) as PlanoAula['encerramento'],
    duracaoTotal: (row.duracao_total ?? 0) as number,
    temaDaSemana: (row.tema_da_semana ?? undefined) as string | undefined,
    nivelFoco: (row.nivel_foco ?? '') as string,
    materiais: (row.materiais ?? undefined) as string | undefined,
    notas: (row.notas ?? '') as string,
  };
}

export async function createPlano(dados: CreatePlanoPayload): Promise<PlanoAula> {
  try {
    if (isMock()) {
      const { mockCreatePlano } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockCreatePlano(dados);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('[createPlano] error: Nao autenticado');
      return { ...EMPTY_PLANO };
    }

    const duracaoTotal = dados.aquecimento.duracaoMinutos + dados.tecnicaPrincipal.duracaoMinutos + dados.pratica.duracaoMinutos + dados.encerramento.duracaoMinutos;
    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('planos_aula')
      .insert({
        professor_id: user.id,
        class_id: dados.turmaId,
        date: dados.data,
        status: 'planejado',
        aquecimento: dados.aquecimento,
        tecnica_principal: dados.tecnicaPrincipal,
        pratica: dados.pratica,
        encerramento: dados.encerramento,
        duracao_total: duracaoTotal,
        tema_da_semana: dados.temaDaSemana ?? null,
        nivel_foco: dados.nivelFoco,
        materiais: dados.materiais ?? null,
        notas: dados.notas,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        classes(modalities(name))
      `)
      .single();

    if (error || !inserted) {
      console.warn('[createPlano] error:', error?.message ?? 'Erro ao criar plano');
      return { ...EMPTY_PLANO };
    }

    return mapRowToPlano(inserted);
  } catch (error) {
    console.warn('[createPlano] Fallback:', error);
    return { ...EMPTY_PLANO };
  }
}

export async function updatePlano(id: string, dados: Partial<CreatePlanoPayload>): Promise<PlanoAula> {
  try {
    if (isMock()) {
      const { mockUpdatePlano } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockUpdatePlano(id, dados);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dados.turmaId !== undefined) updateFields.class_id = dados.turmaId;
    if (dados.data !== undefined) updateFields.date = dados.data;
    if (dados.aquecimento !== undefined) updateFields.aquecimento = dados.aquecimento;
    if (dados.tecnicaPrincipal !== undefined) updateFields.tecnica_principal = dados.tecnicaPrincipal;
    if (dados.pratica !== undefined) updateFields.pratica = dados.pratica;
    if (dados.encerramento !== undefined) updateFields.encerramento = dados.encerramento;
    if (dados.temaDaSemana !== undefined) updateFields.tema_da_semana = dados.temaDaSemana;
    if (dados.nivelFoco !== undefined) updateFields.nivel_foco = dados.nivelFoco;
    if (dados.materiais !== undefined) updateFields.materiais = dados.materiais;
    if (dados.notas !== undefined) updateFields.notas = dados.notas;

    // Recalc duration if any time-relevant field changed
    if (dados.aquecimento || dados.tecnicaPrincipal || dados.pratica || dados.encerramento) {
      // Fetch current to fill missing
      const { data: current } = await supabase.from('planos_aula').select('aquecimento, tecnica_principal, pratica, encerramento').eq('id', id).single();
      const aq = (dados.aquecimento ?? (current?.aquecimento as PlanoAula['aquecimento'] | null) ?? { descricao: '', duracaoMinutos: 0 });
      const tp = (dados.tecnicaPrincipal ?? (current?.tecnica_principal as PlanoAula['tecnicaPrincipal'] | null) ?? { tecnicas: [], duracaoMinutos: 0 });
      const pr = (dados.pratica ?? (current?.pratica as PlanoAula['pratica'] | null) ?? { tipo: 'drill' as const, descricao: '', duracaoMinutos: 0 });
      const en = (dados.encerramento ?? (current?.encerramento as PlanoAula['encerramento'] | null) ?? { descricao: '', duracaoMinutos: 0 });
      updateFields.duracao_total = aq.duracaoMinutos + tp.duracaoMinutos + pr.duracaoMinutos + en.duracaoMinutos;
    }

    const { data: updated, error } = await supabase
      .from('planos_aula')
      .update(updateFields)
      .eq('id', id)
      .select(`
        *,
        classes(modalities(name))
      `)
      .single();

    if (error || !updated) {
      console.warn('[updatePlano] error:', error?.message ?? 'Erro ao atualizar plano');
      return { ...EMPTY_PLANO, id };
    }

    return mapRowToPlano(updated);
  } catch (error) {
    console.warn('[updatePlano] Fallback:', error);
    return { ...EMPTY_PLANO, id };
  }
}

export async function listPlanos(professorId: string, periodo?: string): Promise<PlanoAula[]> {
  try {
    if (isMock()) {
      const { mockListPlanos } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockListPlanos(professorId, periodo);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('planos_aula')
      .select(`
        *,
        classes(modalities(name))
      `)
      .eq('professor_id', professorId)
      .order('date', { ascending: false });

    if (periodo) {
      // periodo format: "YYYY-MM" — filter by month
      const start = `${periodo}-01`;
      const [y, m] = periodo.split('-').map(Number);
      const endDate = new Date(y, m, 0); // last day of month
      const end = `${y}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      query = query.gte('date', start).lte('date', end);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[listPlanos] error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapRowToPlano(row));
  } catch (error) {
    console.warn('[listPlanos] Fallback:', error);
    return [];
  }
}

export async function getSemana(professorId: string, semana: string): Promise<SemanaPlanejamento> {
  try {
    if (isMock()) {
      const { mockGetSemana } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockGetSemana(professorId, semana);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // semana format: "YYYY-Www" (ISO week) — derive Monday..Sunday
    const [yearStr, weekStr] = semana.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    // ISO week date to Monday
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('planos_aula')
      .select(`
        *,
        classes(modalities(name))
      `)
      .eq('professor_id', professorId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.warn('[getSemana] error:', error.message);
      return { semana, tema: '', aulas: [] };
    }

    const aulas = (data ?? []).map((row: Record<string, unknown>) => mapRowToPlano(row));
    // Derive tema from first aula with temaDaSemana set
    const tema = aulas.find((a: PlanoAula) => a.temaDaSemana)?.temaDaSemana ?? '';

    return { semana, tema, aulas };
  } catch (error) {
    console.warn('[getSemana] Fallback:', error);
    return { semana, tema: '', aulas: [] };
  }
}

export async function duplicarPlano(id: string, novaData: string): Promise<PlanoAula> {
  try {
    if (isMock()) {
      const { mockDuplicarPlano } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockDuplicarPlano(id, novaData);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch original
    const { data: original, error: fetchError } = await supabase
      .from('planos_aula')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      console.warn('[duplicarPlano] error: Plano original nao encontrado', fetchError?.message);
      return { ...EMPTY_PLANO };
    }

    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('planos_aula')
      .insert({
        professor_id: original.professor_id,
        class_id: original.class_id,
        date: novaData,
        status: 'planejado',
        aquecimento: original.aquecimento,
        tecnica_principal: original.tecnica_principal,
        pratica: original.pratica,
        encerramento: original.encerramento,
        duracao_total: original.duracao_total,
        tema_da_semana: original.tema_da_semana,
        nivel_foco: original.nivel_foco,
        materiais: original.materiais,
        notas: original.notas,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        classes(modalities(name))
      `)
      .single();

    if (error || !inserted) {
      console.warn('[duplicarPlano] error:', error?.message ?? 'Erro ao duplicar plano');
      return { ...EMPTY_PLANO };
    }

    return mapRowToPlano(inserted);
  } catch (error) {
    console.warn('[duplicarPlano] Fallback:', error);
    return { ...EMPTY_PLANO };
  }
}

export async function getProximaAula(professorId: string): Promise<PlanoAula | null> {
  try {
    if (isMock()) {
      const { mockGetProximaAula } = await import('@/lib/mocks/plano-aula-nuclear.mock');
      return mockGetProximaAula(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('planos_aula')
      .select(`
        *,
        classes(modalities(name))
      `)
      .eq('professor_id', professorId)
      .gte('date', today)
      .in('status', ['planejado', 'em_andamento'])
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[getProximaAula] error:', error.message);
      return null;
    }

    if (!data) return null;

    return mapRowToPlano(data as Record<string, unknown>);
  } catch (error) {
    console.warn('[getProximaAula] Fallback:', error);
    return null;
  }
}

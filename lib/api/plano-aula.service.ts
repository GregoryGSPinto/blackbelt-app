import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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

    if (error) throw new ServiceError(500, 'plano-aula.list', error.message);

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
    handleServiceError(error, 'plano-aula.getLessonPlans');
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
    if (!user) throw new ServiceError(401, 'plano-aula.create', 'Nao autenticado');

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

    if (error || !inserted) throw new ServiceError(500, 'plano-aula.create', error?.message ?? 'Erro ao criar plano');

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
    handleServiceError(error, 'plano-aula.createLessonPlan');
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

    if (error) throw new ServiceError(500, 'plano-aula.templates', error.message);

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
    handleServiceError(error, 'plano-aula.getTemplates');
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

    if (error) throw new ServiceError(500, 'plano-aula.notes', error.message);

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
    handleServiceError(error, 'plano-aula.getClassNotes');
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
    if (!user) throw new ServiceError(401, 'plano-aula.saveNote', 'Nao autenticado');

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

    if (error || !inserted) throw new ServiceError(500, 'plano-aula.saveNote', error?.message ?? 'Erro ao salvar nota');

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
    handleServiceError(error, 'plano-aula.saveClassNote');
  }
}

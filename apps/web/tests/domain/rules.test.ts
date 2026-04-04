import { describe, it, expect } from 'vitest';
import {
  canEnrollInClass,
  canPromoteBelt,
  canMarkAttendance,
  isAttendanceValid,
  canSendMessage,
  canGrantAchievement,
  canAccessContent,
  isGuardianRequired,
  canManageSubscription,
} from '@/lib/domain/rules';
import type { Student, Profile, Modality, Video, Achievement, Attendance } from '@/lib/types';
import { Role, BeltLevel, AchievementType, AttendanceMethod } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// Helpers para mock data inline
// ────────────────────────────────────────────────────────────

const AUDIT = { created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' };

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 'student-1',
    profile_id: 'profile-1',
    academy_id: 'academy-1',
    belt: BeltLevel.White,
    started_at: '2025-01-01T00:00:00Z',
    ...AUDIT,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    user_id: 'user-1',
    role: Role.Professor,
    display_name: 'Test User',
    avatar: null,
    ...AUDIT,
    ...overrides,
  };
}

function makeModality(overrides: Partial<Modality> = {}): Modality {
  return {
    id: 'modality-1',
    academy_id: 'academy-1',
    name: 'Jiu-Jitsu',
    belt_required: BeltLevel.White,
    ...AUDIT,
    ...overrides,
  };
}

function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'video-1',
    academy_id: 'academy-1',
    title: 'Técnica Básica',
    url: 'https://example.com/video-1',
    belt_level: BeltLevel.White,
    duration: 300,
    ...AUDIT,
    ...overrides,
  };
}

function makeAttendance(overrides: Partial<Attendance> = {}): Attendance {
  return {
    id: 'att-1',
    student_id: 'student-1',
    class_id: 'class-1',
    checked_at: '2025-06-15T10:00:00Z',
    method: AttendanceMethod.QrCode,
    ...AUDIT,
    ...overrides,
  };
}

function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'ach-1',
    student_id: 'student-1',
    type: AchievementType.AttendanceStreak,
    granted_at: '2025-06-15T10:00:00Z',
    granted_by: 'profile-prof',
    ...AUDIT,
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// 1. canEnrollInClass
// ────────────────────────────────────────────────────────────

describe('canEnrollInClass', () => {
  it('permite matrícula quando faixa do aluno é superior à exigida', () => {
    const student = makeStudent({ belt: BeltLevel.Blue });
    const modality = makeModality({ belt_required: BeltLevel.Yellow });

    const result = canEnrollInClass(student, modality);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('recusa matrícula quando faixa do aluno é inferior à exigida', () => {
    const student = makeStudent({ belt: BeltLevel.White });
    const modality = makeModality({ belt_required: BeltLevel.Green });

    const result = canEnrollInClass(student, modality);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('insuficiente');
  });

  it('permite matrícula quando faixa é exatamente a mínima exigida', () => {
    const student = makeStudent({ belt: BeltLevel.Orange });
    const modality = makeModality({ belt_required: BeltLevel.Orange });

    const result = canEnrollInClass(student, modality);

    expect(result.allowed).toBe(true);
  });

  it('permite matrícula em modalidade sem exigência (white)', () => {
    const student = makeStudent({ belt: BeltLevel.White });
    const modality = makeModality({ belt_required: BeltLevel.White });

    const result = canEnrollInClass(student, modality);

    expect(result.allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 2. canPromoteBelt
// ────────────────────────────────────────────────────────────

describe('canPromoteBelt', () => {
  it('permite promoção com faixa superior e presenças suficientes', () => {
    const student = makeStudent({ belt: BeltLevel.White });

    const result = canPromoteBelt(student, BeltLevel.Gray, 25);

    expect(result.allowed).toBe(true);
  });

  it('recusa promoção para faixa igual à atual', () => {
    const student = makeStudent({ belt: BeltLevel.Blue });

    const result = canPromoteBelt(student, BeltLevel.Blue, 999);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('superior');
  });

  it('recusa promoção para faixa inferior à atual', () => {
    const student = makeStudent({ belt: BeltLevel.Purple });

    const result = canPromoteBelt(student, BeltLevel.Green, 999);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('superior');
  });

  it('recusa promoção com presenças insuficientes', () => {
    const student = makeStudent({ belt: BeltLevel.White });

    const result = canPromoteBelt(student, BeltLevel.Gray, 10);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('insuficientes');
  });

  it('permite promoção com presenças exatamente no mínimo exigido', () => {
    const student = makeStudent({ belt: BeltLevel.White });

    // MIN_ATTENDANCE_FOR_PROMOTION[Gray] = 20
    const result = canPromoteBelt(student, BeltLevel.Gray, 20);

    expect(result.allowed).toBe(true);
  });

  it('recusa promoção com 1 presença abaixo do mínimo', () => {
    const student = makeStudent({ belt: BeltLevel.White });

    const result = canPromoteBelt(student, BeltLevel.Gray, 19);

    expect(result.allowed).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// 3. canMarkAttendance
// ────────────────────────────────────────────────────────────

describe('canMarkAttendance', () => {
  it('permite quando professor é responsável pela turma', () => {
    const professor = makeProfile({ id: 'prof-1', role: Role.Professor });
    const classEntity = { professor_id: 'prof-1' };

    const result = canMarkAttendance(professor, classEntity);

    expect(result.allowed).toBe(true);
  });

  it('recusa quando perfil não é professor nem admin', () => {
    const student = makeProfile({ id: 'aluno-1', role: Role.AlunoAdulto });
    const classEntity = { professor_id: 'prof-1' };

    const result = canMarkAttendance(student, classEntity);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('professores ou admins');
  });

  it('recusa quando professor não é o responsável pela turma', () => {
    const professor = makeProfile({ id: 'prof-2', role: Role.Professor });
    const classEntity = { professor_id: 'prof-1' };

    const result = canMarkAttendance(professor, classEntity);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('não é responsável');
  });

  it('permite quando admin marca presença em qualquer turma', () => {
    const admin = makeProfile({ id: 'admin-1', role: Role.Admin });
    const classEntity = { professor_id: 'prof-1' };

    const result = canMarkAttendance(admin, classEntity);

    expect(result.allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 4. isAttendanceValid
// ────────────────────────────────────────────────────────────

describe('isAttendanceValid', () => {
  it('permite check-in quando não há presença registrada no dia', () => {
    const result = isAttendanceValid('student-1', 'class-1', '2025-06-15', []);

    expect(result.allowed).toBe(true);
  });

  it('recusa check-in duplicado no mesmo dia/turma/aluno', () => {
    const existing = [
      makeAttendance({
        student_id: 'student-1',
        class_id: 'class-1',
        checked_at: '2025-06-15T08:00:00Z',
      }),
    ];

    const result = isAttendanceValid('student-1', 'class-1', '2025-06-15', existing);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('já registrou');
  });

  it('permite check-in do mesmo aluno em turma diferente no mesmo dia', () => {
    const existing = [
      makeAttendance({
        student_id: 'student-1',
        class_id: 'class-2',
        checked_at: '2025-06-15T08:00:00Z',
      }),
    ];

    const result = isAttendanceValid('student-1', 'class-1', '2025-06-15', existing);

    expect(result.allowed).toBe(true);
  });

  it('permite check-in do mesmo aluno na mesma turma em dia diferente', () => {
    const existing = [
      makeAttendance({
        student_id: 'student-1',
        class_id: 'class-1',
        checked_at: '2025-06-14T08:00:00Z',
      }),
    ];

    const result = isAttendanceValid('student-1', 'class-1', '2025-06-15', existing);

    expect(result.allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 5. canSendMessage
// ────────────────────────────────────────────────────────────

describe('canSendMessage', () => {
  it('permite admin enviar mensagem para qualquer perfil', () => {
    const admin = makeProfile({ role: Role.Admin });
    const recipient = makeProfile({ role: Role.Professor });

    expect(canSendMessage(admin, recipient).allowed).toBe(true);
  });

  it('permite professor enviar mensagem para aluno adulto', () => {
    const professor = makeProfile({ role: Role.Professor });
    const aluno = makeProfile({ role: Role.AlunoAdulto });

    expect(canSendMessage(professor, aluno).allowed).toBe(true);
  });

  it('permite aluno adulto enviar mensagem para professor', () => {
    const aluno = makeProfile({ role: Role.AlunoAdulto });
    const professor = makeProfile({ role: Role.Professor });

    expect(canSendMessage(aluno, professor).allowed).toBe(true);
  });

  it('permite professor enviar mensagem para aluno teen', () => {
    const professor = makeProfile({ role: Role.Professor });
    const teen = makeProfile({ role: Role.AlunoTeen });

    expect(canSendMessage(professor, teen).allowed).toBe(true);
  });

  it('permite responsável enviar mensagem para professor', () => {
    const responsavel = makeProfile({ role: Role.Responsavel });
    const professor = makeProfile({ role: Role.Professor });

    expect(canSendMessage(responsavel, professor).allowed).toBe(true);
  });

  it('permite professor enviar mensagem para responsável', () => {
    const professor = makeProfile({ role: Role.Professor });
    const responsavel = makeProfile({ role: Role.Responsavel });

    expect(canSendMessage(professor, responsavel).allowed).toBe(true);
  });

  it('recusa mensagem de aluno Kids', () => {
    const kids = makeProfile({ role: Role.AlunoKids });
    const professor = makeProfile({ role: Role.Professor });

    const result = canSendMessage(kids, professor);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Kids');
  });

  it('recusa mensagem para aluno Kids', () => {
    const professor = makeProfile({ role: Role.Professor });
    const kids = makeProfile({ role: Role.AlunoKids });

    const result = canSendMessage(professor, kids);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Kids');
  });

  it('recusa mensagem entre dois alunos', () => {
    const aluno1 = makeProfile({ role: Role.AlunoAdulto });
    const aluno2 = makeProfile({ role: Role.AlunoAdulto });

    const result = canSendMessage(aluno1, aluno2);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('não permitido');
  });
});

// ────────────────────────────────────────────────────────────
// 6. canGrantAchievement
// ────────────────────────────────────────────────────────────

describe('canGrantAchievement', () => {
  it('permite professor conceder conquista inédita ao aluno', () => {
    const professor = makeProfile({ role: Role.Professor });

    const result = canGrantAchievement(
      professor,
      'student-1',
      AchievementType.AttendanceStreak,
      [],
    );

    expect(result.allowed).toBe(true);
  });

  it('permite admin conceder conquista', () => {
    const admin = makeProfile({ role: Role.Admin });

    const result = canGrantAchievement(
      admin,
      'student-1',
      AchievementType.BeltPromotion,
      [],
    );

    expect(result.allowed).toBe(true);
  });

  it('recusa quando perfil não é professor nem admin', () => {
    const aluno = makeProfile({ role: Role.AlunoAdulto });

    const result = canGrantAchievement(
      aluno,
      'student-1',
      AchievementType.AttendanceStreak,
      [],
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('professores ou admins');
  });

  it('recusa conquista duplicada para o mesmo aluno', () => {
    const professor = makeProfile({ role: Role.Professor });
    const existing = [
      makeAchievement({
        student_id: 'student-1',
        type: AchievementType.AttendanceStreak,
      }),
    ];

    const result = canGrantAchievement(
      professor,
      'student-1',
      AchievementType.AttendanceStreak,
      existing,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('já possui');
  });

  it('permite conquista do mesmo tipo para aluno diferente', () => {
    const professor = makeProfile({ role: Role.Professor });
    const existing = [
      makeAchievement({
        student_id: 'student-other',
        type: AchievementType.AttendanceStreak,
      }),
    ];

    const result = canGrantAchievement(
      professor,
      'student-1',
      AchievementType.AttendanceStreak,
      existing,
    );

    expect(result.allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 7. canAccessContent
// ────────────────────────────────────────────────────────────

describe('canAccessContent', () => {
  it('permite acesso quando faixa do aluno é superior à do vídeo', () => {
    const student = makeStudent({ belt: BeltLevel.Purple });
    const video = makeVideo({ belt_level: BeltLevel.Yellow });

    expect(canAccessContent(student, video).allowed).toBe(true);
  });

  it('recusa acesso quando faixa do aluno é inferior à do vídeo', () => {
    const student = makeStudent({ belt: BeltLevel.White });
    const video = makeVideo({ belt_level: BeltLevel.Blue });

    const result = canAccessContent(student, video);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('insuficiente');
  });

  it('permite acesso quando faixa é exatamente a exigida pelo vídeo', () => {
    const student = makeStudent({ belt: BeltLevel.Green });
    const video = makeVideo({ belt_level: BeltLevel.Green });

    expect(canAccessContent(student, video).allowed).toBe(true);
  });

  it('permite qualquer aluno acessar conteúdo de faixa branca', () => {
    const student = makeStudent({ belt: BeltLevel.White });
    const video = makeVideo({ belt_level: BeltLevel.White });

    expect(canAccessContent(student, video).allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 8. isGuardianRequired
// ────────────────────────────────────────────────────────────

describe('isGuardianRequired', () => {
  it('exige responsável para menor de 18 anos', () => {
    const result = isGuardianRequired(12);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Menor de 18');
  });

  it('não exige responsável para adulto (>= 18 anos)', () => {
    const result = isGuardianRequired(25);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('não exige responsável para aluno com exatamente 18 anos', () => {
    const result = isGuardianRequired(18);

    expect(result.allowed).toBe(true);
  });

  it('exige responsável para aluno com 17 anos (limite inferior)', () => {
    const result = isGuardianRequired(17);

    expect(result.allowed).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// 9. canManageSubscription
// ────────────────────────────────────────────────────────────

describe('canManageSubscription', () => {
  it('permite admin gerenciar qualquer assinatura', () => {
    const admin = makeProfile({ id: 'admin-1', role: Role.Admin });

    const result = canManageSubscription(admin, 'student-1', []);

    expect(result.allowed).toBe(true);
  });

  it('permite responsável gerenciar assinatura do seu dependente', () => {
    const guardian = makeProfile({ id: 'guardian-1', role: Role.Responsavel });

    const result = canManageSubscription(guardian, 'student-1', ['guardian-1']);

    expect(result.allowed).toBe(true);
  });

  it('recusa responsável que não é guardian do aluno', () => {
    const guardian = makeProfile({ id: 'guardian-2', role: Role.Responsavel });

    const result = canManageSubscription(guardian, 'student-1', ['guardian-1']);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('responsável do aluno');
  });

  it('recusa professor tentando gerenciar assinatura', () => {
    const professor = makeProfile({ id: 'prof-1', role: Role.Professor });

    const result = canManageSubscription(professor, 'student-1', []);

    expect(result.allowed).toBe(false);
  });

  it('recusa aluno tentando gerenciar própria assinatura', () => {
    const aluno = makeProfile({ id: 'profile-1', role: Role.AlunoAdulto });

    const result = canManageSubscription(aluno, 'student-1', []);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('admin ou responsável');
  });
});

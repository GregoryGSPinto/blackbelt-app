import type {
  TrialStudent,
  TrialStatus,
  TrialSource,
  ExperienceLevel,
  TrialActivity,
  TrialActivityType,
  TrialConfig,
  TrialMetrics,
} from '@/lib/api/trial.service';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Helper: date arithmetic
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// 1. Mock Trial Students (10)
// ---------------------------------------------------------------------------
const TRIAL_STUDENTS: TrialStudent[] = [
  // ── Active: day 1 ──
  {
    id: 'trial-s-1',
    academy_id: 'academy-1',
    name: 'Lucas Ferreira da Silva',
    email: 'lucas.ferreira@email.com',
    phone: '(11) 99999-1001',
    birth_date: '1998-05-12',
    source: 'instagram' as TrialSource,
    modalities_interest: ['BJJ', 'Muay Thai'],
    experience_level: 'beginner' as ExperienceLevel,
    goals: 'Perder peso e aprender defesa pessoal',
    how_heard_about: 'Anúncio no Instagram',
    has_health_issues: false,
    trial_start_date: daysAgo(1),
    trial_end_date: daysFromNow(6),
    trial_classes_attended: 1,
    trial_classes_limit: 5,
    status: 'active' as TrialStatus,
    expiry_notified: false,
    assigned_professor_id: 'prof-1',
    follow_up_date: daysFromNow(2),
    follow_up_done: false,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  // ── Active: day 4 ──
  {
    id: 'trial-s-2',
    academy_id: 'academy-1',
    name: 'Beatriz Oliveira Santos',
    email: 'bia.oliveira@email.com',
    phone: '(11) 99999-1002',
    birth_date: '2001-09-23',
    source: 'website' as TrialSource,
    modalities_interest: ['BJJ'],
    experience_level: 'some_experience' as ExperienceLevel,
    goals: 'Competir em campeonatos amadores',
    how_heard_about: 'Pesquisa no Google',
    has_health_issues: false,
    trial_start_date: daysAgo(4),
    trial_end_date: daysFromNow(3),
    trial_classes_attended: 3,
    trial_classes_limit: 5,
    status: 'active' as TrialStatus,
    expiry_notified: false,
    assigned_professor_id: 'prof-1',
    follow_up_date: daysFromNow(1),
    follow_up_done: false,
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
  },
  // ── Active: day 6 (expiring soon) ──
  {
    id: 'trial-s-3',
    academy_id: 'academy-1',
    name: 'Thiago Nascimento Rocha',
    email: 'thiago.rocha@email.com',
    phone: '(11) 99999-1003',
    birth_date: '1995-01-30',
    source: 'referral' as TrialSource,
    referred_by_profile_id: 'profile-42',
    modalities_interest: ['Judo', 'BJJ'],
    experience_level: 'intermediate' as ExperienceLevel,
    goals: 'Voltar a treinar depois de uma pausa',
    has_health_issues: true,
    health_notes: 'Lesão no ombro direito (recuperado, mas precisa de cuidado)',
    trial_start_date: daysAgo(6),
    trial_end_date: daysFromNow(1),
    trial_classes_attended: 4,
    trial_classes_limit: 5,
    status: 'active' as TrialStatus,
    expiry_notified: true,
    assigned_professor_id: 'prof-2',
    follow_up_date: daysAgo(1),
    follow_up_done: true,
    rating: 5,
    feedback: 'Academia excelente, professores muito atenciosos!',
    would_recommend: true,
    created_at: daysAgo(6),
    updated_at: daysAgo(0),
  },
  // ── Converted #1 ──
  {
    id: 'trial-s-4',
    academy_id: 'academy-1',
    name: 'Camila Rodrigues Almeida',
    email: 'camila.almeida@email.com',
    phone: '(11) 99999-1004',
    birth_date: '1993-11-08',
    source: 'google' as TrialSource,
    modalities_interest: ['Muay Thai'],
    experience_level: 'beginner' as ExperienceLevel,
    goals: 'Condicionamento físico',
    how_heard_about: 'Google Maps',
    has_health_issues: false,
    trial_start_date: daysAgo(20),
    trial_end_date: daysAgo(13),
    trial_classes_attended: 5,
    trial_classes_limit: 5,
    profile_id: 'profile-101',
    membership_id: 'membership-201',
    status: 'converted' as TrialStatus,
    converted_at: daysAgo(14),
    converted_plan: 'plano-mensal',
    expiry_notified: true,
    rating: 4,
    feedback: 'Gostei muito das aulas, só achei o vestiário pequeno.',
    would_recommend: true,
    admin_notes: 'Fechou plano mensal com desconto de 15%',
    assigned_professor_id: 'prof-3',
    follow_up_date: daysAgo(17),
    follow_up_done: true,
    created_at: daysAgo(20),
    updated_at: daysAgo(14),
  },
  // ── Converted #2 ──
  {
    id: 'trial-s-5',
    academy_id: 'academy-1',
    name: 'Rafael Henrique Costa',
    email: 'rafael.costa@email.com',
    phone: '(11) 99999-1005',
    birth_date: '1988-03-15',
    source: 'referral' as TrialSource,
    referred_by_profile_id: 'profile-55',
    modalities_interest: ['BJJ', 'Judo'],
    experience_level: 'some_experience' as ExperienceLevel,
    goals: 'Treinar com meu amigo que já é aluno',
    has_health_issues: false,
    trial_start_date: daysAgo(15),
    trial_end_date: daysAgo(8),
    trial_classes_attended: 5,
    trial_classes_limit: 5,
    profile_id: 'profile-102',
    membership_id: 'membership-202',
    status: 'converted' as TrialStatus,
    converted_at: daysAgo(9),
    converted_plan: 'plano-trimestral',
    expiry_notified: true,
    rating: 5,
    feedback: 'Melhor academia da região! Ambiente top.',
    would_recommend: true,
    admin_notes: 'Indicado pelo aluno João (profile-55). Fechou trimestral.',
    assigned_professor_id: 'prof-1',
    follow_up_date: daysAgo(12),
    follow_up_done: true,
    created_at: daysAgo(15),
    updated_at: daysAgo(9),
  },
  // ── Converted #3 ──
  {
    id: 'trial-s-6',
    academy_id: 'academy-1',
    name: 'Mariana Souza Pereira',
    email: 'mariana.sp@email.com',
    phone: '(11) 99999-1006',
    birth_date: '2000-07-20',
    source: 'event' as TrialSource,
    modalities_interest: ['Karate', 'BJJ'],
    experience_level: 'advanced' as ExperienceLevel,
    goals: 'Treinar Karate competitivo e começar BJJ',
    how_heard_about: 'Evento de artes marciais no parque',
    has_health_issues: false,
    trial_start_date: daysAgo(12),
    trial_end_date: daysAgo(5),
    trial_classes_attended: 4,
    trial_classes_limit: 5,
    profile_id: 'profile-103',
    membership_id: 'membership-203',
    status: 'converted' as TrialStatus,
    converted_at: daysAgo(6),
    converted_plan: 'plano-semestral',
    expiry_notified: true,
    rating: 5,
    feedback: 'Infraestrutura incrível, tatame ótimo!',
    would_recommend: true,
    admin_notes: 'Atleta com experiência. Vai competir pela academia.',
    assigned_professor_id: 'prof-2',
    follow_up_date: daysAgo(9),
    follow_up_done: true,
    created_at: daysAgo(12),
    updated_at: daysAgo(6),
  },
  // ── Expired #1 ──
  {
    id: 'trial-s-7',
    academy_id: 'academy-1',
    name: 'Felipe Augusto Barbosa',
    email: 'felipe.barbosa@email.com',
    phone: '(11) 99999-1007',
    birth_date: '1990-12-03',
    source: 'facebook' as TrialSource,
    modalities_interest: ['BJJ'],
    experience_level: 'beginner' as ExperienceLevel,
    goals: 'Experimentar',
    how_heard_about: 'Anúncio no Facebook',
    has_health_issues: false,
    trial_start_date: daysAgo(14),
    trial_end_date: daysAgo(7),
    trial_classes_attended: 2,
    trial_classes_limit: 5,
    status: 'expired' as TrialStatus,
    expiry_notified: true,
    rating: 3,
    feedback: 'Achei legal mas o horário não encaixa.',
    would_recommend: false,
    admin_notes: 'Problema de horário. Talvez retorne quando tiver aula mais cedo.',
    assigned_professor_id: 'prof-1',
    follow_up_date: daysAgo(10),
    follow_up_done: true,
    created_at: daysAgo(14),
    updated_at: daysAgo(7),
  },
  // ── Expired #2 ──
  {
    id: 'trial-s-8',
    academy_id: 'academy-1',
    name: 'Juliana Aparecida Lima',
    phone: '(11) 99999-1008',
    birth_date: '1997-04-18',
    source: 'whatsapp' as TrialSource,
    modalities_interest: ['Muay Thai', 'Karate'],
    experience_level: 'beginner' as ExperienceLevel,
    has_health_issues: true,
    health_notes: 'Asma leve, usa bombinha quando necessário',
    trial_start_date: daysAgo(10),
    trial_end_date: daysAgo(3),
    trial_classes_attended: 1,
    trial_classes_limit: 5,
    status: 'expired' as TrialStatus,
    expiry_notified: true,
    follow_up_date: daysAgo(7),
    follow_up_done: true,
    admin_notes: 'Perdeu interesse depois da primeira aula. Follow-up feito sem sucesso.',
    created_at: daysAgo(10),
    updated_at: daysAgo(3),
  },
  // ── Cancelled ──
  {
    id: 'trial-s-9',
    academy_id: 'academy-1',
    name: 'André Luiz Teixeira',
    email: 'andre.teixeira@email.com',
    phone: '(11) 99999-1009',
    birth_date: '1985-08-25',
    source: 'walk_in' as TrialSource,
    modalities_interest: ['BJJ', 'Muay Thai'],
    experience_level: 'some_experience' as ExperienceLevel,
    goals: 'Retomar treinos',
    has_health_issues: false,
    trial_start_date: daysAgo(5),
    trial_end_date: daysFromNow(2),
    trial_classes_attended: 2,
    trial_classes_limit: 5,
    status: 'cancelled' as TrialStatus,
    expiry_notified: false,
    admin_notes: 'Cancelou pois mudou de cidade. Pediu indicação de academia no Rio.',
    assigned_professor_id: 'prof-1',
    follow_up_done: false,
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
  },
  // ── No-show ──
  {
    id: 'trial-s-10',
    academy_id: 'academy-1',
    name: 'Isabela Cristina Moreira',
    email: 'isabela.moreira@email.com',
    phone: '(11) 99999-1010',
    source: 'instagram' as TrialSource,
    modalities_interest: ['Muay Thai'],
    experience_level: 'beginner' as ExperienceLevel,
    goals: 'Emagrecer',
    how_heard_about: 'Stories de uma amiga',
    has_health_issues: false,
    trial_start_date: daysAgo(8),
    trial_end_date: daysAgo(1),
    trial_classes_attended: 0,
    trial_classes_limit: 5,
    status: 'no_show' as TrialStatus,
    expiry_notified: true,
    admin_notes: 'Nunca apareceu. Tentamos contato 3x por WhatsApp sem resposta.',
    follow_up_date: daysAgo(5),
    follow_up_done: true,
    created_at: daysAgo(8),
    updated_at: daysAgo(1),
  },
];

// ---------------------------------------------------------------------------
// 2. Activity Logs
// ---------------------------------------------------------------------------
const TRIAL_ACTIVITIES: TrialActivity[] = [
  // ── trial-s-1 (active day 1): 3 activities ──
  {
    id: 'act-1-1',
    trial_student_id: 'trial-s-1',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'instagram', ip: '189.10.22.45' },
    created_at: daysAgo(1),
  },
  {
    id: 'act-1-2',
    trial_student_id: 'trial-s-1',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'qrcode' },
    created_at: daysAgo(1),
  },
  {
    id: 'act-1-3',
    trial_student_id: 'trial-s-1',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(1),
  },

  // ── trial-s-2 (active day 4): 5 activities ──
  {
    id: 'act-2-1',
    trial_student_id: 'trial-s-2',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'website', landing_page: '/aula-experimental' },
    created_at: daysAgo(4),
  },
  {
    id: 'act-2-2',
    trial_student_id: 'trial-s-2',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(4),
  },
  {
    id: 'act-2-3',
    trial_student_id: 'trial-s-2',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(4),
  },
  {
    id: 'act-2-4',
    trial_student_id: 'trial-s-2',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ All Levels', professor: 'André Santos', duration_min: 75 },
    created_at: daysAgo(2),
  },
  {
    id: 'act-2-5',
    trial_student_id: 'trial-s-2',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(1),
  },

  // ── trial-s-3 (active day 6): 7 activities ──
  {
    id: 'act-3-1',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'referral', referred_by: 'profile-42' },
    created_at: daysAgo(6),
  },
  {
    id: 'act-3-2',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'qrcode' },
    created_at: daysAgo(6),
  },
  {
    id: 'act-3-3',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Judo Adulto', professor: 'Fernanda Oliveira', duration_min: 60 },
    created_at: daysAgo(6),
  },
  {
    id: 'act-3-4',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ All Levels', professor: 'André Santos', duration_min: 75 },
    created_at: daysAgo(4),
  },
  {
    id: 'act-3-5',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Judo Adulto', professor: 'Fernanda Oliveira', duration_min: 60 },
    created_at: daysAgo(3),
  },
  {
    id: 'act-3-6',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(1),
  },
  {
    id: 'act-3-7',
    trial_student_id: 'trial-s-3',
    academy_id: 'academy-1',
    activity_type: 'feedback_given' as TrialActivityType,
    details: { rating: 5, would_recommend: true },
    created_at: daysAgo(0),
  },

  // ── trial-s-4 (converted): 8 activities ──
  {
    id: 'act-4-1',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'google' },
    created_at: daysAgo(20),
  },
  {
    id: 'act-4-2',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(20),
  },
  {
    id: 'act-4-3',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Muay Thai Iniciantes', professor: 'Carlos Lima', duration_min: 60 },
    created_at: daysAgo(20),
  },
  {
    id: 'act-4-4',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Muay Thai Iniciantes', professor: 'Carlos Lima', duration_min: 60 },
    created_at: daysAgo(18),
  },
  {
    id: 'act-4-5',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Muay Thai All Levels', professor: 'Carlos Lima', duration_min: 75 },
    created_at: daysAgo(16),
  },
  {
    id: 'act-4-6',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'plan_viewed' as TrialActivityType,
    details: { plan_slug: 'plano-mensal', price: 199.9 },
    created_at: daysAgo(15),
  },
  {
    id: 'act-4-7',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'conversion_started' as TrialActivityType,
    details: { plan_slug: 'plano-mensal' },
    created_at: daysAgo(14),
  },
  {
    id: 'act-4-8',
    trial_student_id: 'trial-s-4',
    academy_id: 'academy-1',
    activity_type: 'converted' as TrialActivityType,
    details: { plan_slug: 'plano-mensal', discount_percent: 15 },
    created_at: daysAgo(14),
  },

  // ── trial-s-5 (converted): 7 activities ──
  {
    id: 'act-5-1',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'referral', referred_by: 'profile-55' },
    created_at: daysAgo(15),
  },
  {
    id: 'act-5-2',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'qrcode' },
    created_at: daysAgo(15),
  },
  {
    id: 'act-5-3',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(15),
  },
  {
    id: 'act-5-4',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Judo Adulto', professor: 'Fernanda Oliveira', duration_min: 60 },
    created_at: daysAgo(13),
  },
  {
    id: 'act-5-5',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'met_professor' as TrialActivityType,
    details: { professor: 'André Santos', notes: 'Conversa sobre objetivos' },
    created_at: daysAgo(13),
  },
  {
    id: 'act-5-6',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'conversion_started' as TrialActivityType,
    details: { plan_slug: 'plano-trimestral' },
    created_at: daysAgo(9),
  },
  {
    id: 'act-5-7',
    trial_student_id: 'trial-s-5',
    academy_id: 'academy-1',
    activity_type: 'converted' as TrialActivityType,
    details: { plan_slug: 'plano-trimestral', discount_percent: 10 },
    created_at: daysAgo(9),
  },

  // ── trial-s-6 (converted): 8 activities ──
  {
    id: 'act-6-1',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'event', event_name: 'Festival de Artes Marciais Ibirapuera' },
    created_at: daysAgo(12),
  },
  {
    id: 'act-6-2',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(12),
  },
  {
    id: 'act-6-3',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Karate Avançado', professor: 'Sensei Tanaka', duration_min: 90 },
    created_at: daysAgo(12),
  },
  {
    id: 'act-6-4',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(10),
  },
  {
    id: 'act-6-5',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Karate Avançado', professor: 'Sensei Tanaka', duration_min: 90 },
    created_at: daysAgo(8),
  },
  {
    id: 'act-6-6',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ All Levels', professor: 'André Santos', duration_min: 75 },
    created_at: daysAgo(7),
  },
  {
    id: 'act-6-7',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'plan_viewed' as TrialActivityType,
    details: { plan_slug: 'plano-semestral', price: 149.9 },
    created_at: daysAgo(7),
  },
  {
    id: 'act-6-8',
    trial_student_id: 'trial-s-6',
    academy_id: 'academy-1',
    activity_type: 'converted' as TrialActivityType,
    details: { plan_slug: 'plano-semestral', discount_percent: 0 },
    created_at: daysAgo(6),
  },

  // ── trial-s-7 (expired): 4 activities ──
  {
    id: 'act-7-1',
    trial_student_id: 'trial-s-7',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'facebook' },
    created_at: daysAgo(14),
  },
  {
    id: 'act-7-2',
    trial_student_id: 'trial-s-7',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(14),
  },
  {
    id: 'act-7-3',
    trial_student_id: 'trial-s-7',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(14),
  },
  {
    id: 'act-7-4',
    trial_student_id: 'trial-s-7',
    academy_id: 'academy-1',
    activity_type: 'expired' as TrialActivityType,
    details: { classes_attended: 2, classes_limit: 5 },
    created_at: daysAgo(7),
  },

  // ── trial-s-8 (expired): 3 activities ──
  {
    id: 'act-8-1',
    trial_student_id: 'trial-s-8',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'whatsapp' },
    created_at: daysAgo(10),
  },
  {
    id: 'act-8-2',
    trial_student_id: 'trial-s-8',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(9),
  },
  {
    id: 'act-8-3',
    trial_student_id: 'trial-s-8',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Muay Thai Iniciantes', professor: 'Carlos Lima', duration_min: 60 },
    created_at: daysAgo(9),
  },

  // ── trial-s-9 (cancelled): 4 activities ──
  {
    id: 'act-9-1',
    trial_student_id: 'trial-s-9',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'walk_in' },
    created_at: daysAgo(5),
  },
  {
    id: 'act-9-2',
    trial_student_id: 'trial-s-9',
    academy_id: 'academy-1',
    activity_type: 'first_visit' as TrialActivityType,
    details: { checkin_method: 'recepcao' },
    created_at: daysAgo(5),
  },
  {
    id: 'act-9-3',
    trial_student_id: 'trial-s-9',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'BJJ Fundamentos', professor: 'André Santos', duration_min: 60 },
    created_at: daysAgo(5),
  },
  {
    id: 'act-9-4',
    trial_student_id: 'trial-s-9',
    academy_id: 'academy-1',
    activity_type: 'class_attended' as TrialActivityType,
    details: { class_name: 'Muay Thai All Levels', professor: 'Carlos Lima', duration_min: 75 },
    created_at: daysAgo(3),
  },

  // ── trial-s-10 (no_show): 3 activities ──
  {
    id: 'act-10-1',
    trial_student_id: 'trial-s-10',
    academy_id: 'academy-1',
    activity_type: 'registered' as TrialActivityType,
    details: { source: 'instagram' },
    created_at: daysAgo(8),
  },
  {
    id: 'act-10-2',
    trial_student_id: 'trial-s-10',
    academy_id: 'academy-1',
    activity_type: 'follow_up_whatsapp' as TrialActivityType,
    details: { message_type: 'welcome', sent: true },
    created_at: daysAgo(8),
  },
  {
    id: 'act-10-3',
    trial_student_id: 'trial-s-10',
    academy_id: 'academy-1',
    activity_type: 'follow_up_whatsapp' as TrialActivityType,
    details: { message_type: 'day3', sent: true, response: false },
    created_at: daysAgo(5),
  },
];

// ---------------------------------------------------------------------------
// 3. Default Trial Config
// ---------------------------------------------------------------------------
const TRIAL_CONFIGS: TrialConfig[] = [
  {
    id: 'trial-config-1',
    academy_id: 'academy-1',
    trial_duration_days: 7,
    trial_classes_limit: 5,
    require_health_declaration: true,
    require_phone: true,
    require_email: false,
    auto_create_account: true,
    welcome_message:
      'Bem-vindo(a) à nossa academia! Seu período experimental de 7 dias começa agora. Aproveite!',
    expiry_warning_message:
      'Seu período experimental está acabando! Fale conosco para garantir condições especiais de matrícula.',
    expired_message:
      'Seu período experimental terminou. Entre em contato para conhecer nossos planos com desconto exclusivo!',
    send_welcome_whatsapp: true,
    send_day3_reminder: true,
    send_day5_reminder: true,
    send_expiry_notification: true,
    send_post_expiry_offer: true,
    conversion_discount_percent: 15,
    conversion_discount_valid_days: 3,
    created_at: daysAgo(90),
    updated_at: daysAgo(5),
  },
];

// ---------------------------------------------------------------------------
// 4. Mock Functions
// ---------------------------------------------------------------------------

// ── Registration ──

export async function mockRegisterTrialStudent(
  academyId: string,
  data: Partial<TrialStudent>,
): Promise<TrialStudent> {
  await delay();
  const config = TRIAL_CONFIGS.find((c) => c.academy_id === academyId) ?? TRIAL_CONFIGS[0];
  const now = new Date().toISOString();
  const student: TrialStudent = {
    id: `trial-s-${Date.now()}`,
    academy_id: academyId,
    name: data.name ?? '',
    email: data.email,
    phone: data.phone ?? '',
    birth_date: data.birth_date,
    source: data.source ?? 'walk_in',
    referred_by_profile_id: data.referred_by_profile_id,
    modalities_interest: data.modalities_interest ?? [],
    experience_level: data.experience_level ?? 'beginner',
    goals: data.goals,
    how_heard_about: data.how_heard_about,
    has_health_issues: data.has_health_issues ?? false,
    health_notes: data.health_notes,
    trial_start_date: now,
    trial_end_date: daysFromNow(config.trial_duration_days),
    trial_classes_attended: 0,
    trial_classes_limit: config.trial_classes_limit,
    status: 'active',
    expiry_notified: false,
    follow_up_done: false,
    created_at: now,
    updated_at: now,
  };
  TRIAL_STUDENTS.push(student);

  // Auto-add registration activity
  TRIAL_ACTIVITIES.push({
    id: `act-${Date.now()}`,
    trial_student_id: student.id,
    academy_id: academyId,
    activity_type: 'registered',
    details: { source: student.source },
    created_at: now,
  });

  return { ...student };
}

export async function mockRegisterTrialFromWebsite(
  academyId: string,
  data: Partial<TrialStudent>,
): Promise<TrialStudent> {
  return mockRegisterTrialStudent(academyId, {
    ...data,
    source: 'website',
    how_heard_about: data.how_heard_about ?? 'Site da academia',
  });
}

// ── Queries ──

export async function mockListTrialStudents(
  academyId: string,
  filters?: {
    status?: TrialStatus;
    source?: TrialSource;
    modality?: string;
    search?: string;
  },
): Promise<TrialStudent[]> {
  await delay();
  let result = TRIAL_STUDENTS.filter((s) => s.academy_id === academyId).map((s) => ({ ...s }));

  if (filters?.status) {
    result = result.filter((s) => s.status === filters.status);
  }
  if (filters?.source) {
    result = result.filter((s) => s.source === filters.source);
  }
  if (filters?.modality) {
    result = result.filter((s) => s.modalities_interest.includes(filters.modality!));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone.includes(q),
    );
  }

  return result;
}

export async function mockGetTrialStudent(trialId: string): Promise<TrialStudent | null> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  return student ? { ...student } : null;
}

export async function mockGetTrialMetrics(academyId: string): Promise<TrialMetrics> {
  await delay();
  const students = TRIAL_STUDENTS.filter((s) => s.academy_id === academyId);
  const active = students.filter((s) => s.status === 'active');
  const converted = students.filter((s) => s.status === 'converted');

  const totalClasses = students.reduce((sum, s) => sum + s.trial_classes_attended, 0);
  const avgClasses = students.length > 0 ? Math.round((totalClasses / students.length) * 10) / 10 : 0;

  // Count sources
  const sourceCounts: Record<string, number> = {};
  students.forEach((s) => {
    sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1;
  });
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  // Count modalities
  const modalityCounts: Record<string, number> = {};
  students.forEach((s) => {
    s.modalities_interest.forEach((m) => {
      modalityCounts[m] = (modalityCounts[m] || 0) + 1;
    });
  });
  const topModality =
    Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  // Expiring in 3 days
  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);
  const expiring = active.filter((s) => {
    const end = new Date(s.trial_end_date);
    return end >= now && end <= in3Days;
  });

  return {
    total_trials: students.length,
    active_now: active.length,
    converted_count: converted.length,
    conversion_rate:
      students.length > 0
        ? Math.round((converted.length / students.length) * 100 * 10) / 10
        : 0,
    avg_classes_attended: avgClasses,
    top_source: topSource,
    top_modality: topModality,
    expiring_in_3_days: expiring.length,
  };
}

export async function mockGetExpiringTrials(
  academyId: string,
  days: number,
): Promise<TrialStudent[]> {
  await delay();
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() + days);

  return TRIAL_STUDENTS.filter((s) => {
    if (s.academy_id !== academyId || s.status !== 'active') return false;
    const end = new Date(s.trial_end_date);
    return end >= now && end <= cutoff;
  }).map((s) => ({ ...s }));
}

export async function mockGetTrialActivity(trialId: string): Promise<TrialActivity[]> {
  await delay();
  return TRIAL_ACTIVITIES.filter((a) => a.trial_student_id === trialId)
    .map((a) => ({ ...a, details: { ...a.details } }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

// ── Management ──

export async function mockUpdateTrialStudent(
  trialId: string,
  data: Partial<TrialStudent>,
): Promise<TrialStudent> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  Object.assign(student, data, { updated_at: new Date().toISOString() });
  return { ...student };
}

export async function mockAssignProfessor(trialId: string, professorId: string): Promise<void> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.assigned_professor_id = professorId;
  student.updated_at = new Date().toISOString();
}

export async function mockScheduleFollowUp(trialId: string, date: string): Promise<void> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.follow_up_date = date;
  student.follow_up_done = false;
  student.updated_at = new Date().toISOString();
}

export async function mockMarkFollowUpDone(trialId: string, notes: string): Promise<void> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.follow_up_done = true;
  student.admin_notes = notes;
  student.updated_at = new Date().toISOString();

  TRIAL_ACTIVITIES.push({
    id: `act-${Date.now()}`,
    trial_student_id: trialId,
    academy_id: student.academy_id,
    activity_type: 'follow_up_call',
    details: { notes },
    created_at: new Date().toISOString(),
  });
}

export async function mockExtendTrial(trialId: string, extraDays: number): Promise<TrialStudent> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  const currentEnd = new Date(student.trial_end_date);
  currentEnd.setDate(currentEnd.getDate() + extraDays);
  student.trial_end_date = currentEnd.toISOString();
  student.status = 'active';
  student.expiry_notified = false;
  student.updated_at = new Date().toISOString();

  return { ...student };
}

export async function mockCancelTrial(trialId: string, reason: string): Promise<TrialStudent> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.status = 'cancelled';
  student.admin_notes = reason;
  student.updated_at = new Date().toISOString();

  return { ...student };
}

export async function mockRecordClassAttendance(
  trialId: string,
  classDetails: Record<string, unknown>,
): Promise<TrialActivity> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.trial_classes_attended += 1;
  student.updated_at = new Date().toISOString();

  const isFirst = student.trial_classes_attended === 1;

  const activity: TrialActivity = {
    id: `act-${Date.now()}`,
    trial_student_id: trialId,
    academy_id: student.academy_id,
    activity_type: isFirst ? 'first_visit' : 'class_attended',
    details: { ...classDetails },
    created_at: new Date().toISOString(),
  };
  TRIAL_ACTIVITIES.push(activity);

  return { ...activity, details: { ...activity.details } };
}

// ── Conversion ──

export async function mockStartConversion(
  trialId: string,
): Promise<{ redirect_url: string }> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  TRIAL_ACTIVITIES.push({
    id: `act-${Date.now()}`,
    trial_student_id: trialId,
    academy_id: student.academy_id,
    activity_type: 'conversion_started',
    details: {},
    created_at: new Date().toISOString(),
  });

  return {
    redirect_url: `/academia/${student.academy_id}/matricula?trial=${trialId}`,
  };
}

export async function mockConvertTrial(
  trialId: string,
  planSlug: string,
): Promise<TrialStudent> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  const now = new Date().toISOString();
  student.status = 'converted';
  student.converted_at = now;
  student.converted_plan = planSlug;
  student.profile_id = `profile-${Date.now()}`;
  student.membership_id = `membership-${Date.now()}`;
  student.updated_at = now;

  TRIAL_ACTIVITIES.push({
    id: `act-${Date.now()}`,
    trial_student_id: trialId,
    academy_id: student.academy_id,
    activity_type: 'converted',
    details: { plan_slug: planSlug },
    created_at: now,
  });

  return { ...student };
}

export async function mockGetConversionOffer(
  trialId: string,
): Promise<{ discount_percent: number; valid_until: string } | null> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) return null;

  // Only active or expired students within the offer window get an offer
  if (student.status !== 'active' && student.status !== 'expired') return null;

  const config =
    TRIAL_CONFIGS.find((c) => c.academy_id === student.academy_id) ?? TRIAL_CONFIGS[0];

  if (config.conversion_discount_percent <= 0) return null;

  const endDate = new Date(student.trial_end_date);
  const validUntil = new Date(endDate);
  validUntil.setDate(validUntil.getDate() + config.conversion_discount_valid_days);

  // If the offer window has passed, no offer
  if (validUntil < new Date()) return null;

  return {
    discount_percent: config.conversion_discount_percent,
    valid_until: validUntil.toISOString(),
  };
}

// ── Feedback ──

export async function mockSubmitTrialFeedback(
  trialId: string,
  rating: number,
  feedback: string,
  wouldRecommend: boolean,
): Promise<void> {
  await delay();
  const student = TRIAL_STUDENTS.find((s) => s.id === trialId);
  if (!student) throw new Error(`Trial student ${trialId} not found`);

  student.rating = rating;
  student.feedback = feedback;
  student.would_recommend = wouldRecommend;
  student.updated_at = new Date().toISOString();

  TRIAL_ACTIVITIES.push({
    id: `act-${Date.now()}`,
    trial_student_id: trialId,
    academy_id: student.academy_id,
    activity_type: 'feedback_given',
    details: { rating, would_recommend: wouldRecommend },
    created_at: new Date().toISOString(),
  });
}

export async function mockGetTrialFeedbacks(
  academyId: string,
): Promise<Array<{ trial_student: TrialStudent; rating: number; feedback: string }>> {
  await delay();
  return TRIAL_STUDENTS.filter(
    (s) =>
      s.academy_id === academyId &&
      s.rating !== undefined &&
      s.feedback !== undefined,
  ).map((s) => ({
    trial_student: { ...s },
    rating: s.rating!,
    feedback: s.feedback!,
  }));
}

// ── Student-facing ──

export async function mockGetMyTrialInfo(academyId: string): Promise<TrialStudent | null> {
  await delay();
  // Return the day-4 student (trial-s-2) for a richer dashboard experience
  const student = TRIAL_STUDENTS.find(
    (s) => s.id === 'trial-s-2' && s.academy_id === academyId,
  );
  return student ? { ...student } : null;
}

// ── Config ──

export async function mockGetTrialConfig(academyId: string): Promise<TrialConfig> {
  await delay();
  const config = TRIAL_CONFIGS.find((c) => c.academy_id === academyId);
  if (!config) throw new Error(`Trial config for academy ${academyId} not found`);
  return { ...config };
}

export async function mockUpdateTrialConfig(
  academyId: string,
  data: Partial<TrialConfig>,
): Promise<TrialConfig> {
  await delay();
  const config = TRIAL_CONFIGS.find((c) => c.academy_id === academyId);
  if (!config) throw new Error(`Trial config for academy ${academyId} not found`);

  Object.assign(config, data, { updated_at: new Date().toISOString() });
  return { ...config };
}

export async function mockSeedDefaultConfig(academyId: string): Promise<TrialConfig> {
  await delay();

  // Remove existing config if any
  const existingIdx = TRIAL_CONFIGS.findIndex((c) => c.academy_id === academyId);
  if (existingIdx >= 0) TRIAL_CONFIGS.splice(existingIdx, 1);

  const now = new Date().toISOString();
  const config: TrialConfig = {
    id: `trial-config-${Date.now()}`,
    academy_id: academyId,
    trial_duration_days: 7,
    trial_classes_limit: 5,
    require_health_declaration: true,
    require_phone: true,
    require_email: false,
    auto_create_account: true,
    welcome_message:
      'Bem-vindo(a) à nossa academia! Seu período experimental de 7 dias começa agora. Aproveite!',
    expiry_warning_message:
      'Seu período experimental está acabando! Fale conosco para garantir condições especiais de matrícula.',
    expired_message:
      'Seu período experimental terminou. Entre em contato para conhecer nossos planos com desconto exclusivo!',
    send_welcome_whatsapp: true,
    send_day3_reminder: true,
    send_day5_reminder: true,
    send_expiry_notification: true,
    send_post_expiry_offer: true,
    conversion_discount_percent: 15,
    conversion_discount_valid_days: 3,
    created_at: now,
    updated_at: now,
  };

  TRIAL_CONFIGS.push(config);
  return { ...config };
}

// ── WhatsApp ──

export async function mockGenerateWelcomeWhatsAppLink(trialStudent: TrialStudent): Promise<string> {
  await delay();
  const phone = trialStudent.phone.replace(/\D/g, '');
  const firstName = trialStudent.name.split(' ')[0];
  const message = encodeURIComponent(
    `Olá ${firstName}! 👋 Bem-vindo(a) à nossa academia! Estamos muito felizes com a sua visita. ` +
      `Seu período experimental já começou e você tem 7 dias para aproveitar nossas aulas. ` +
      `Qualquer dúvida, é só chamar aqui! 🥋💪 Bons treinos!`,
  );
  return `https://wa.me/55${phone}?text=${message}`;
}

export async function mockGenerateFollowUpWhatsAppLink(
  trialStudent: TrialStudent,
  type: 'day3' | 'day5' | 'expiry' | 'offer',
): Promise<string> {
  await delay();
  const phone = trialStudent.phone.replace(/\D/g, '');
  const firstName = trialStudent.name.split(' ')[0];

  const config =
    TRIAL_CONFIGS.find((c) => c.academy_id === trialStudent.academy_id) ?? TRIAL_CONFIGS[0];

  let text = '';

  switch (type) {
    case 'day3':
      text =
        `Oi ${firstName}! Já se passaram 3 dias desde sua primeira visita. ` +
        `Como está sendo a experiência? 😊 Esperamos você nas próximas aulas! ` +
        `Lembre-se: você ainda tem aulas disponíveis no seu período experimental. ` +
        `Vamos treinar? 🥊🔥`;
      break;

    case 'day5':
      text =
        `${firstName}, faltam apenas 2 dias para o fim do seu período experimental! ⏳ ` +
        `Não perca a chance de aproveitar ao máximo. Temos aulas incríveis esperando por você. ` +
        `Quer saber sobre nossos planos? É só responder aqui! 💬🥋`;
      break;

    case 'expiry':
      text =
        `${firstName}, seu período experimental terminou. 😢 ` +
        `Foi ótimo ter você treinando conosco! Queremos muito que você continue essa jornada. ` +
        `Entre em contato para conhecer nossos planos e condições especiais para novos alunos. ` +
        `Estamos te esperando! 🤝💪`;
      break;

    case 'offer':
      text =
        `${firstName}, preparamos uma condição especial para você! 🎉 ` +
        `${config.conversion_discount_percent}% de desconto na matrícula se você fechar ` +
        `nos próximos ${config.conversion_discount_valid_days} dias! ` +
        `Essa é a sua chance de continuar evoluindo com a gente. ` +
        `Vamos conversar? Responda aqui! 🥋🔥💰`;
      break;
  }

  const message = encodeURIComponent(text);
  return `https://wa.me/55${phone}?text=${message}`;
}

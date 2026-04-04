import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// --- Types (matching migration 067) ---

export type IncidentCategory = 'hygiene' | 'disrespect' | 'aggression' | 'property_damage' | 'sparring_violation' | 'attendance' | 'substance' | 'harassment' | 'safety_violation' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type SanctionType = 'verbal_warning' | 'written_warning' | 'suspension' | 'ban' | 'community_service' | 'other';

export interface ConductTemplate {
  id: string;
  academy_id: string;
  version: number;
  title: string;
  content: string;
  is_active: boolean;
  is_system: boolean;
  custom_pdf_url?: string;
  published_at?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ConductAcceptance {
  id: string;
  academy_id: string;
  profile_id: string;
  template_id: string;
  template_version: number;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ConductIncident {
  id: string;
  academy_id: string;
  profile_id: string;
  reported_by_id?: string;
  incident_date: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  witnesses?: string[];
  evidence_urls?: string[];
  class_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ConductSanction {
  id: string;
  academy_id: string;
  profile_id: string;
  incident_id?: string;
  issued_by_id?: string;
  sanction_type: SanctionType;
  description: string;
  severity_level: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  student_acknowledged: boolean;
  acknowledged_at?: string;
  appeal_notes?: string;
  appeal_resolved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConductConfig {
  id: string;
  academy_id: string;
  require_acceptance_on_signup: boolean;
  auto_escalate_sanctions: boolean;
  notify_on_incident: boolean;
  notify_on_sanction: boolean;
  suspension_after_warnings: number;
  ban_after_suspensions: number;
  created_at: string;
  updated_at: string;
}

// --- Templates ---

export async function getActiveTemplate(academyId: string): Promise<ConductTemplate | null> {
  try {
    if (isMock()) {
      const { mockGetActiveTemplate } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetActiveTemplate(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_code_templates')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductTemplate;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function getTemplateHistory(academyId: string): Promise<ConductTemplate[]> {
  try {
    if (isMock()) {
      const { mockGetTemplateHistory } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetTemplateHistory(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_code_templates')
      .select('*')
      .eq('academy_id', academyId)
      .order('version', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return [];
    }

    return data as unknown as ConductTemplate[];
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return [];
  }
}

export async function createTemplate(academyId: string, content: string, title?: string): Promise<ConductTemplate | null> {
  try {
    if (isMock()) {
      const { mockCreateTemplate } = await import('@/lib/mocks/conduct-code.mock');
      return mockCreateTemplate(academyId, content, title);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get latest version number
    const { data: latest } = await supabase
      .from('conduct_code_templates')
      .select('version')
      .eq('academy_id', academyId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = latest ? Number(latest.version) + 1 : 1;

    const { data, error } = await supabase
      .from('conduct_code_templates')
      .insert({
        academy_id: academyId,
        title: title ?? 'Código de Conduta',
        content,
        version: nextVersion,
        is_active: false,
        is_system: false,
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductTemplate;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function updateTemplate(id: string, data: Partial<ConductTemplate>): Promise<ConductTemplate | null> {
  try {
    if (isMock()) {
      const { mockUpdateTemplate } = await import('@/lib/mocks/conduct-code.mock');
      return mockUpdateTemplate(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, updated_at: _ua, ...updateData } = data;

    const { data: row, error } = await supabase
      .from('conduct_code_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return row as unknown as ConductTemplate;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function publishTemplate(id: string): Promise<ConductTemplate | null> {
  try {
    if (isMock()) {
      const { mockPublishTemplate } = await import('@/lib/mocks/conduct-code.mock');
      return mockPublishTemplate(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get the template to know its academy
    const { data: tpl } = await supabase
      .from('conduct_code_templates')
      .select('academy_id')
      .eq('id', id)
      .single();

    if (!tpl) {
      logServiceError(new Error('Template not found'), 'conduct-code');
      return null;
    }

    // Deactivate all other templates for this academy
    await supabase
      .from('conduct_code_templates')
      .update({ is_active: false })
      .eq('academy_id', tpl.academy_id);

    // Activate and publish this one
    const { data, error } = await supabase
      .from('conduct_code_templates')
      .update({ is_active: true, published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductTemplate;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

const DEFAULT_CONDUCT_CODE_PT = `CÓDIGO DE CONDUTA DA ACADEMIA

Art. 1 — Higiene Pessoal
Todo praticante deve apresentar-se para o treino com higiene pessoal adequada. Unhas das mãos e dos pés devem estar cortadas e limpas. O kimono (gi) ou uniforme de treino deve estar limpo e sem odores desagradáveis. É obrigatório o uso de chinelos ou calçados ao transitar fora da área de treino. O uso de desodorante é obrigatório. Praticantes com condições de pele contagiosas (micoses, impetigo, herpes, etc.) devem informar o professor e abster-se do treino até liberação médica.

Art. 2 — Uniforme e Equipamento
O praticante deve utilizar o uniforme oficial da academia ou kimono em bom estado de conservação, sem rasgos ou manchas. Não é permitido treinar sem camisa sob o kimono (exceto em aulas específicas de no-gi onde a academia permitir rash guard). Protetores bucais são obrigatórios durante treinos de sparring. O uso de equipamentos de proteção adicionais (coquilha, joelheiras, cotoveleiras) é recomendado e pode ser exigido pelo professor em determinadas atividades.

Art. 3 — Pontualidade e Frequência
O praticante deve chegar ao local de treino com pelo menos 5 minutos de antecedência para aquecimento e preparação. Atrasos superiores a 10 minutos podem resultar na não permissão de participação na aula, a critério do professor. Ausências prolongadas sem justificativa podem resultar em revisão do status de matrícula. O praticante deve comunicar antecipadamente ao professor quando precisar se ausentar por período prolongado.

Art. 4 — Respeito e Conduta Interpessoal
Todo praticante deve tratar colegas, professores, funcionários e visitantes com respeito e cordialidade. Linguagem ofensiva, xingamentos, insultos ou provocações verbais não serão tolerados dentro ou nas proximidades da academia. Discussões pessoais devem ser resolvidas fora do ambiente de treino. A saudação (cumprimento) ao professor e aos colegas ao entrar e sair do tatame é parte da tradição e deve ser respeitada.

Art. 5 — Comportamento durante Sparring (Randori/Rola)
O sparring deve ser conduzido com controle e respeito ao parceiro. É proibido aplicar técnicas com força excessiva deliberada com intenção de machucar. O praticante deve respeitar o sinal de desistência (tap/batida) imediatamente, soltando qualquer técnica de finalização. É proibido recusar-se a treinar com um colega por motivos discriminatórios. Praticantes mais experientes devem ajudar os iniciantes, controlando a intensidade adequadamente.

Art. 6 — Técnicas Proibidas e Restrições
É proibida a aplicação de técnicas banidas pela academia ou inadequadas para o nível de graduação do praticante. Slam (erguer e arremessar o oponente ao solo) é proibido. Técnicas de neck crank (torção cervical) são proibidas para faixas abaixo de roxa, salvo instrução específica do professor. Heel hooks e outras técnicas de perna restritivas seguem a regulamentação definida pelo professor para cada nível. O professor pode restringir técnicas adicionais conforme julgar necessário para segurança.

Art. 7 — Hierarquia e Respeito à Graduação
O sistema de graduação deve ser respeitado. Somente o professor responsável pode conceder promoções de faixa. É proibido utilizar faixa ou grau de graduação não concedido oficialmente. Alunos devem atender prontamente às instruções do professor durante a aula. Perguntas e sugestões são bem-vindas, desde que feitas de maneira respeitosa e no momento adequado.

Art. 8 — Substâncias Proibidas e Doping
É terminantemente proibido comparecer à academia sob efeito de álcool, drogas ilícitas ou qualquer substância que comprometa a capacidade motora ou o julgamento. O uso de substâncias para melhoria de desempenho (esteroides anabolizantes, EPO, etc.) é desaconselhado e pode resultar em sanções se comprovado. Não é permitido fumar, vaporizar ou consumir bebidas alcoólicas nas dependências da academia. A academia reserva-se o direito de solicitar afastamento de praticante que aparente estar sob efeito de substâncias.

Art. 9 — Conservação do Patrimônio
Todo praticante deve zelar pela conservação das instalações, equipamentos e materiais da academia. Danos causados por mau uso ou negligência poderão ser cobrados do responsável. É proibido comer ou beber (exceto água) na área do tatame. Equipamentos devem ser devolvidos ao local correto após o uso. Qualquer dano ou defeito observado em equipamentos deve ser reportado à administração imediatamente.

Art. 10 — Uso de Celulares e Dispositivos Eletrônicos
O uso de celulares durante a aula é proibido, exceto em casos de emergência previamente comunicados ao professor. Celulares devem permanecer no modo silencioso dentro da área de treino. O uso de smartwatches e dispositivos vestíveis de monitoramento é permitido desde que não ofereçam risco de lesão ao parceiro de treino (modelos volumosos devem ser removidos).

Art. 11 — Fotografias e Gravações
Fotografias e gravações de vídeo dentro da academia são permitidas apenas com autorização prévia da administração. É proibido fotografar ou filmar outros praticantes sem o consentimento deles. A publicação de imagens ou vídeos que exponham negativamente a academia, seus alunos ou professores é passível de sanção. A academia pode utilizar imagens de treinos para fins de divulgação, salvo manifestação contrária por escrito do praticante.

Art. 12 — Visitantes e Aulas Experimentais
Visitantes devem ser previamente autorizados pela administração e acompanhados por um responsável. Praticantes de aula experimental devem seguir todas as regras deste código de conduta. Visitantes não autorizados não podem permanecer na área de treino. A academia reserva-se o direito de recusar a entrada de visitantes sem necessidade de justificativa.

Art. 13 — Supervisão de Menores
Praticantes menores de 18 anos devem ter o consentimento dos pais ou responsáveis legais para treinar. Pais e responsáveis são bem-vindos a assistir às aulas, devendo permanecer na área designada para espectadores. Crianças que não estejam participando de aula não devem permanecer desacompanhadas nas dependências da academia. Qualquer questão disciplinar envolvendo menores será comunicada aos pais ou responsáveis.

Art. 14 — Relato de Lesões
Toda lesão ocorrida durante o treino deve ser imediatamente reportada ao professor. O praticante lesionado deve interromper a atividade até avaliação adequada. Lesões que requeiram atendimento médico devem ser documentadas junto à administração. O retorno ao treino após lesão significativa pode exigir apresentação de atestado médico liberatório. É proibido treinar com lesão que possa ser agravada ou que represente risco aos demais.

Art. 15 — Requisitos Médicos
A academia recomenda que todo praticante realize exame médico periódico para prática esportiva. Praticantes com condições médicas preexistentes (cardiopatias, epilepsia, diabetes, asma, etc.) devem informar ao professor antes de iniciar os treinos. A academia pode solicitar atestado médico de aptidão para a prática a qualquer momento. Gestantes devem apresentar autorização médica específica para continuar treinando.

Art. 16 — Pertences Pessoais
A academia não se responsabiliza por objetos de valor deixados nas dependências. Recomenda-se não trazer joias, relógios de valor ou grandes quantias em dinheiro. Armários, quando disponíveis, devem ser utilizados com cadeado próprio. Pertences esquecidos serão mantidos na recepção por período de 30 dias, após o qual serão doados.

Art. 17 — Conduta em Mídias Sociais
O praticante deve abster-se de publicar conteúdos que prejudiquem a imagem da academia, de seus professores ou colegas em redes sociais. Críticas e sugestões devem ser direcionadas diretamente à administração pelos canais oficiais. O cyberbullying direcionado a qualquer membro da academia será tratado com a mesma gravidade que o bullying presencial. Representar-se falsamente como instrutor ou representante da academia em mídias sociais é proibido.

Art. 18 — Discriminação e Assédio
A academia tem política de tolerância zero para qualquer forma de discriminação por raça, cor, etnia, gênero, orientação sexual, religião, idade, deficiência ou qualquer outra condição. Assédio moral ou sexual será tratado com máxima severidade e poderá resultar em expulsão imediata. Qualquer incidente de discriminação ou assédio deve ser reportado à administração, que garantirá sigilo e tomará providências. A academia compromete-se a manter um ambiente inclusivo e seguro para todos.

Art. 19 — Progressão de Sanções
As sanções por violação deste código seguem escala progressiva: (a) Advertência verbal pelo professor; (b) Advertência escrita formal registrada em prontuário; (c) Suspensão temporária das atividades, com prazo definido; (d) Desligamento definitivo da academia. A gravidade da infração pode determinar a aplicação direta de sanções mais severas, a critério da administração. O praticante sancionado pode apresentar recurso por escrito à administração em até 5 dias úteis. Infrações de natureza criminal serão comunicadas às autoridades competentes independentemente das sanções administrativas.

Art. 20 — Disposições Finais
A matrícula na academia implica a aceitação integral deste código de conduta. A academia reserva-se o direito de atualizar este código, comunicando as alterações a todos os praticantes. Casos omissos serão analisados e decididos pela administração da academia. Este código entra em vigor na data de sua publicação e tem validade indeterminada. O desconhecimento das regras não isenta o praticante de suas obrigações.`;

export async function seedDefaultTemplate(academyId: string): Promise<ConductTemplate | null> {
  try {
    if (isMock()) {
      const { mockSeedDefaultTemplate } = await import('@/lib/mocks/conduct-code.mock');
      return mockSeedDefaultTemplate(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Check if academy already has a template
    const { data: existing } = await supabase
      .from('conduct_code_templates')
      .select('id')
      .eq('academy_id', academyId)
      .limit(1)
      .single();

    if (existing) {
      // Already has a template, return the active one
      return getActiveTemplate(academyId);
    }

    const { data, error } = await supabase
      .from('conduct_code_templates')
      .insert({
        academy_id: academyId,
        title: 'Código de Conduta da Academia',
        content: DEFAULT_CONDUCT_CODE_PT,
        version: 1,
        is_active: true,
        is_system: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductTemplate;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

// --- Acceptance ---

export async function acceptConductCode(
  academyId: string,
  profileId: string,
  templateId: string,
  version: number,
): Promise<ConductAcceptance | null> {
  try {
    if (isMock()) {
      const { mockAcceptConductCode } = await import('@/lib/mocks/conduct-code.mock');
      return mockAcceptConductCode(academyId, profileId, templateId, version);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_code_acceptances')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        template_id: templateId,
        template_version: version,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductAcceptance;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function hasAcceptedLatest(academyId: string, profileId: string): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockHasAcceptedLatest } = await import('@/lib/mocks/conduct-code.mock');
      return mockHasAcceptedLatest(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get the active template version
    const { data: tpl } = await supabase
      .from('conduct_code_templates')
      .select('id, version')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!tpl) return false;

    // Check if this profile has accepted this version
    const { data: acceptance } = await supabase
      .from('conduct_code_acceptances')
      .select('id')
      .eq('academy_id', academyId)
      .eq('profile_id', profileId)
      .eq('template_id', tpl.id)
      .eq('template_version', tpl.version)
      .limit(1)
      .single();

    return !!acceptance;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return false;
  }
}

export async function getAcceptances(
  academyId: string,
  filters?: { profileId?: string; templateId?: string },
): Promise<ConductAcceptance[]> {
  try {
    if (isMock()) {
      const { mockGetAcceptances } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetAcceptances(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('conduct_code_acceptances')
      .select('*')
      .eq('academy_id', academyId)
      .order('accepted_at', { ascending: false });

    if (filters?.profileId) query = query.eq('profile_id', filters.profileId);
    if (filters?.templateId) query = query.eq('template_id', filters.templateId);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return [];
    }

    return data as unknown as ConductAcceptance[];
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return [];
  }
}

export async function getAcceptanceStats(
  academyId: string,
): Promise<{ total_students: number; accepted: number; pending: number }> {
  try {
    if (isMock()) {
      const { mockGetAcceptanceStats } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetAcceptanceStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Count total active students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .eq('role', 'student');

    // Get active template
    const { data: tpl } = await supabase
      .from('conduct_code_templates')
      .select('id, version')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!tpl) {
      return { total_students: totalStudents ?? 0, accepted: 0, pending: totalStudents ?? 0 };
    }

    // Count acceptances for the active template version
    const { count: acceptedCount } = await supabase
      .from('conduct_code_acceptances')
      .select('id', { count: 'exact', head: true })
      .eq('academy_id', academyId)
      .eq('template_id', tpl.id)
      .eq('template_version', tpl.version);

    const total = totalStudents ?? 0;
    const accepted = acceptedCount ?? 0;

    return {
      total_students: total,
      accepted,
      pending: total - accepted,
    };
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return { total_students: 0, accepted: 0, pending: 0 };
  }
}

// --- Incidents ---

export async function reportIncident(
  academyId: string,
  profileId: string,
  data: {
    reported_by_id?: string;
    incident_date: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    description: string;
    witnesses?: string[];
    evidence_urls?: string[];
    class_id?: string;
  },
): Promise<ConductIncident | null> {
  try {
    if (isMock()) {
      const { mockReportIncident } = await import('@/lib/mocks/conduct-code.mock');
      return mockReportIncident(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('conduct_incidents')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        reported_by_id: data.reported_by_id,
        incident_date: data.incident_date,
        category: data.category,
        severity: data.severity,
        description: data.description,
        witnesses: data.witnesses ?? [],
        evidence_urls: data.evidence_urls ?? [],
        class_id: data.class_id,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return row as unknown as ConductIncident;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function listIncidents(
  academyId: string,
  filters?: { profileId?: string; category?: IncidentCategory; severity?: IncidentSeverity },
): Promise<ConductIncident[]> {
  try {
    if (isMock()) {
      const { mockListIncidents } = await import('@/lib/mocks/conduct-code.mock');
      return mockListIncidents(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('conduct_incidents')
      .select('*')
      .eq('academy_id', academyId)
      .order('incident_date', { ascending: false });

    if (filters?.profileId) query = query.eq('profile_id', filters.profileId);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.severity) query = query.eq('severity', filters.severity);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return [];
    }

    return data as unknown as ConductIncident[];
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return [];
  }
}

export async function getIncident(id: string): Promise<ConductIncident | null> {
  try {
    if (isMock()) {
      const { mockGetIncident } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetIncident(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductIncident;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function updateIncident(id: string, data: Partial<ConductIncident>): Promise<ConductIncident | null> {
  try {
    if (isMock()) {
      const { mockUpdateIncident } = await import('@/lib/mocks/conduct-code.mock');
      return mockUpdateIncident(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, updated_at: _ua, ...updateData } = data;

    const { data: row, error } = await supabase
      .from('conduct_incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return row as unknown as ConductIncident;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

// --- Sanctions ---

export async function issueSanction(
  academyId: string,
  profileId: string,
  data: {
    incident_id?: string;
    issued_by_id?: string;
    sanction_type: SanctionType;
    description: string;
    severity_level: number;
    start_date: string;
    end_date?: string;
  },
): Promise<ConductSanction | null> {
  try {
    if (isMock()) {
      const { mockIssueSanction } = await import('@/lib/mocks/conduct-code.mock');
      return mockIssueSanction(academyId, profileId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('conduct_sanctions')
      .insert({
        academy_id: academyId,
        profile_id: profileId,
        incident_id: data.incident_id,
        issued_by_id: data.issued_by_id,
        sanction_type: data.sanction_type,
        description: data.description,
        severity_level: data.severity_level,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: true,
        student_acknowledged: false,
      })
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return row as unknown as ConductSanction;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function listSanctions(
  academyId: string,
  filters?: { profileId?: string; activeOnly?: boolean; type?: SanctionType },
): Promise<ConductSanction[]> {
  try {
    if (isMock()) {
      const { mockListSanctions } = await import('@/lib/mocks/conduct-code.mock');
      return mockListSanctions(academyId, filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('conduct_sanctions')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (filters?.profileId) query = query.eq('profile_id', filters.profileId);
    if (filters?.activeOnly) query = query.eq('is_active', true);
    if (filters?.type) query = query.eq('sanction_type', filters.type);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return [];
    }

    return data as unknown as ConductSanction[];
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return [];
  }
}

export async function getStudentDisciplinaryRecord(
  academyId: string,
  profileId: string,
): Promise<{ incidents: ConductIncident[]; sanctions: ConductSanction[] }> {
  try {
    if (isMock()) {
      const { mockGetStudentDisciplinaryRecord } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetStudentDisciplinaryRecord(academyId, profileId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const [incidentsResult, sanctionsResult] = await Promise.all([
      supabase
        .from('conduct_incidents')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .order('incident_date', { ascending: false }),
      supabase
        .from('conduct_sanctions')
        .select('*')
        .eq('academy_id', academyId)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false }),
    ]);

    return {
      incidents: (incidentsResult.data ?? []) as unknown as ConductIncident[],
      sanctions: (sanctionsResult.data ?? []) as unknown as ConductSanction[],
    };
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return { incidents: [], sanctions: [] };
  }
}

export async function acknowledgeSanction(sanctionId: string): Promise<ConductSanction | null> {
  try {
    if (isMock()) {
      const { mockAcknowledgeSanction } = await import('@/lib/mocks/conduct-code.mock');
      return mockAcknowledgeSanction(sanctionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_sanctions')
      .update({
        student_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', sanctionId)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductSanction;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function appealSanction(sanctionId: string, notes: string): Promise<ConductSanction | null> {
  try {
    if (isMock()) {
      const { mockAppealSanction } = await import('@/lib/mocks/conduct-code.mock');
      return mockAppealSanction(sanctionId, notes);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_sanctions')
      .update({
        appeal_notes: notes,
        appeal_resolved: false,
      })
      .eq('id', sanctionId)
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductSanction;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

// --- Config ---

export async function getConductConfig(academyId: string): Promise<ConductConfig | null> {
  try {
    if (isMock()) {
      const { mockGetConductConfig } = await import('@/lib/mocks/conduct-code.mock');
      return mockGetConductConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('conduct_config')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductConfig;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function updateConductConfig(
  academyId: string,
  data: Partial<ConductConfig>,
): Promise<ConductConfig | null> {
  try {
    if (isMock()) {
      const { mockUpdateConductConfig } = await import('@/lib/mocks/conduct-code.mock');
      return mockUpdateConductConfig(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, academy_id: _aid, created_at: _ca, updated_at: _ua, ...updateData } = data;

    const { data: row, error } = await supabase
      .from('conduct_config')
      .update(updateData)
      .eq('academy_id', academyId)
      .select()
      .single();

    if (error || !row) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return row as unknown as ConductConfig;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

export async function seedDefaultConductConfig(academyId: string): Promise<ConductConfig | null> {
  try {
    if (isMock()) {
      const { mockSeedDefaultConductConfig } = await import('@/lib/mocks/conduct-code.mock');
      return mockSeedDefaultConductConfig(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Check if config already exists
    const { data: existing } = await supabase
      .from('conduct_config')
      .select('id')
      .eq('academy_id', academyId)
      .limit(1)
      .single();

    if (existing) {
      return getConductConfig(academyId);
    }

    const { data, error } = await supabase
      .from('conduct_config')
      .insert({
        academy_id: academyId,
        require_acceptance_on_signup: true,
        auto_escalate_sanctions: true,
        notify_on_incident: true,
        notify_on_sanction: true,
        suspension_after_warnings: 3,
        ban_after_suspensions: 2,
      })
      .select()
      .single();

    if (error || !data) {
      logServiceError(error, 'conduct-code');
      return null;
    }

    return data as unknown as ConductConfig;
  } catch (error) {
    logServiceError(error, 'conduct-code');
    return null;
  }
}

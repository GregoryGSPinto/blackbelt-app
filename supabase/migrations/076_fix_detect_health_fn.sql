-- Fix detect_data_health_issues: profiles doesn't have academy_id,
-- needs to go through memberships table
DROP FUNCTION IF EXISTS detect_data_health_issues(UUID);
CREATE OR REPLACE FUNCTION detect_data_health_issues(p_academy_id UUID)
RETURNS INTEGER AS $$
DECLARE
  issues_found INTEGER := 0;
  v_count INTEGER;
BEGIN
  -- Limpar issues resolvidas antigas (>30 dias)
  DELETE FROM data_health_issues
  WHERE academy_id = p_academy_id AND is_resolved = true
    AND resolved_at < now() - interval '30 days';

  -- Alunos menores sem responsavel vinculado
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'familia', 'high', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' e menor mas nao tem responsavel vinculado',
    'Vincular responsavel',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN memberships m ON m.profile_id = pr.id AND m.academy_id = p_academy_id
  WHERE pr.role IN ('aluno_kids', 'aluno_teen')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND (pr.person_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM family_links fl WHERE fl.dependent_person_id = pr.person_id
    ))
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'familia' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Alunos sem turma
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'turma', 'medium', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' nao esta em nenhuma turma',
    'Definir turma',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN memberships m ON m.profile_id = pr.id AND m.academy_id = p_academy_id
  WHERE pr.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND NOT EXISTS (SELECT 1 FROM class_enrollments ce WHERE ce.student_id = pr.id AND ce.status = 'active')
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'turma' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Kids que completaram 13 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 13 anos - considere promover para Teen',
    'Promover para Teen',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN memberships m ON m.profile_id = pr.id AND m.academy_id = p_academy_id
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.role = 'aluno_kids'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 13
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 13%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Teens que completaram 18 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT
    p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 18 anos - considere promover para Adulto',
    'Promover para Adulto',
    '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN memberships m ON m.profile_id = pr.id AND m.academy_id = p_academy_id
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.role = 'aluno_teen'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 18
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 18%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  RETURN issues_found;
END;
$$ LANGUAGE plpgsql;

-- Fix seed user roles (all were created as 'admin' by the onboarding trigger)
-- This migration sets the correct role for each seed user

-- Temporarily disable role-change trigger
ALTER TABLE profiles DISABLE TRIGGER prevent_role_escalation_trigger;

UPDATE profiles SET role = 'professor', display_name = 'Andre Luis da Silva'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'professor@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'recepcao', display_name = 'Julia Recepcionista'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'recepcionista@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'aluno_adulto', display_name = 'Joao Pedro Almeida'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'aluno@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'aluno_teen', display_name = 'Lucas Teen'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teen@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'aluno_kids', display_name = 'Miguel Kids'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kids@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'responsavel', display_name = 'Maria Responsavel'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'responsavel@guerreiros.com')
  AND role = 'admin';

UPDATE profiles SET role = 'franqueador', display_name = 'Fernando Franqueador'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'franqueador@email.com')
  AND role = 'admin';

UPDATE profiles SET role = 'superadmin', display_name = 'Gregory Guimaraes Pinto'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'greg@email.com')
  AND role != 'superadmin';

-- Update membership roles to match profile roles
UPDATE memberships SET role = 'professor'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'professor@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'recepcao'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'recepcionista@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'aluno_adulto'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'aluno@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'aluno_teen'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teen@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'aluno_kids'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kids@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'responsavel'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'responsavel@guerreiros.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'franqueador'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'franqueador@email.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

UPDATE memberships SET role = 'superadmin'
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'greg@email.com'))
  AND academy_id = '809f2763-0096-4cfa-8057-b5b029cbc62f';

-- Re-enable trigger
ALTER TABLE profiles ENABLE TRIGGER prevent_role_escalation_trigger;

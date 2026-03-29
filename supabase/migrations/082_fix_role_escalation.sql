-- ═══════════════════════════════════════════════════════════
-- FIX CRÍTICO: Bloquear escalação de privilégio via profiles.role
-- VULN-001: Qualquer usuário autenticado podia alterar seu próprio role
-- ═══════════════════════════════════════════════════════════

-- Trigger que impede alteração do campo role por não-admins
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Se role não mudou, permitir
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Apenas superadmin pode alterar roles
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Admin pode alterar roles dentro da sua academia (exceto para superadmin)
  IF NEW.role != 'superadmin' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.memberships m ON m.profile_id = p.id
    WHERE p.user_id = auth.uid() AND m.role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Alteração de role não permitida. Apenas administradores podem alterar perfis.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela profiles
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

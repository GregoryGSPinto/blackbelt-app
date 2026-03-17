-- ============================================================
-- BlackBelt v2 — Migration 014: Sistema de Convites por Link
-- ============================================================

-- Tabela de tokens de convite
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,

  -- Configuracao do convite
  token VARCHAR(64) UNIQUE NOT NULL,
  target_role VARCHAR(30) NOT NULL CHECK (target_role IN (
    'admin', 'professor',
    'aluno_adulto', 'aluno_teen', 'aluno_kids',
    'responsavel'
  )),

  -- Personalizacao
  label VARCHAR(100) NOT NULL,
  description TEXT,

  -- Controle de uso
  max_uses INTEGER DEFAULT NULL,   -- NULL = ilimitado
  current_uses INTEGER DEFAULT 0,

  -- Validade
  expires_at TIMESTAMPTZ DEFAULT NULL,  -- NULL = nunca expira
  is_active BOOLEAN DEFAULT true,

  -- Auditoria
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de quem usou cada token
CREATE TABLE IF NOT EXISTS public.invite_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.invite_tokens(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  used_at TIMESTAMPTZ DEFAULT now(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON public.invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_academy ON public.invite_tokens(academy_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_active ON public.invite_tokens(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_invite_uses_token ON public.invite_uses(token_id);

-- Trigger updated_at
CREATE TRIGGER invite_tokens_updated_at
  BEFORE UPDATE ON public.invite_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_uses ENABLE ROW LEVEL SECURITY;

-- Admin/gestor da academia pode gerenciar tokens da sua academia
CREATE POLICY "Admin manages own academy invite tokens"
  ON public.invite_tokens
  FOR ALL
  USING (
    academy_id IN (
      SELECT p.academy_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin')
    )
  );

-- Qualquer usuario pode ler um token pelo codigo (para validacao publica)
CREATE POLICY "Anyone can validate invite token by code"
  ON public.invite_tokens
  FOR SELECT
  USING (true);

-- Admin pode ver usos dos tokens da sua academia
CREATE POLICY "Admin views own academy invite uses"
  ON public.invite_uses
  FOR SELECT
  USING (
    token_id IN (
      SELECT it.id FROM public.invite_tokens it
      WHERE it.academy_id IN (
        SELECT p.academy_id FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin')
      )
    )
  );

-- Qualquer usuario autenticado pode inserir uso (ao se cadastrar)
CREATE POLICY "Authenticated users can register invite use"
  ON public.invite_uses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

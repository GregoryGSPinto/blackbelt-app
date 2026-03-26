const ERROR_MAP: Record<string, string> = {
  // Supabase Auth
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Seu email ainda nao foi confirmado. Reenvie a confirmacao para continuar.',
  'User already registered': 'Este email ja tem uma conta.',
  'Password should be at least': 'A senha precisa ter pelo menos 8 caracteres.',
  'Token expired': 'Sessao expirada. Faca login novamente.',
  'Invalid Refresh Token': 'Sua sessao nao e mais valida. Entre novamente.',
  'Auth session missing!': 'Nao foi possivel validar este link. Solicite um novo email.',
  'Email rate limit exceeded': 'Voce tentou muitas vezes. Aguarde alguns minutos antes de reenviar.',

  // Supabase RLS
  'new row violates row-level security': 'Sem permissao para esta acao.',
  'violates row-level security policy': 'Sem permissao para acessar estes dados.',

  // Supabase DB
  'duplicate key value violates unique': 'Este registro ja existe.',
  'violates foreign key constraint': 'Este item esta vinculado a outros dados.',
  'violates not-null constraint': 'Preencha todos os campos obrigatorios.',

  // Network
  'Failed to fetch': 'Sem conexao com o servidor. Verifique sua internet.',
  'NetworkError': 'Sem conexao. Verifique sua internet.',
  'Load failed': 'Erro ao carregar. Tente novamente.',
  'AbortError': 'A requisicao demorou demais. Tente novamente.',
  'TypeError: Failed to fetch': 'Sem conexao. Verifique sua internet.',

  // Supabase PostgREST
  'PGRST116': 'Nenhum resultado encontrado.',

  // JWT
  'JWT expired': 'Sessao expirada. Faca login novamente.',

  // Storage
  'Bucket not found': 'Armazenamento nao configurado.',
  'Payload too large': 'Arquivo muito grande. Maximo: 50MB.',
  'storage/object-not-found': 'Arquivo nao encontrado.',

  // Postgres error codes
  '23505': 'Este registro ja existe.',
  '23503': 'Nao e possivel excluir — ha dados vinculados.',
  '42P01': 'Recurso temporariamente indisponivel.',

  // Permission
  'permission denied': 'Sem permissao para esta acao.',

  // Generic
  'Internal Server Error': 'Erro no servidor. Tente novamente em alguns minutos.',
  'Not Found': 'Pagina nao encontrada.',
  'Unauthorized': 'Acesso nao autorizado. Faca login.',
  'Forbidden': 'Voce nao tem permissao para esta acao.',
  'Rate limit': 'Muitas tentativas. Aguarde um momento.',
};

export function translateError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  for (const [key, translation] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Fallback generico — NUNCA mostrar mensagem tecnica pro usuario
  return 'Algo deu errado. Tente novamente.';
}

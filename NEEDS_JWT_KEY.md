# ATENÇÃO: Formato da Anon Key

A chave `NEXT_PUBLIC_SUPABASE_ANON_KEY` atual está no formato `sb_publishable_*`.

Projetos Supabase mais recentes usam este formato e ele funciona normalmente.
Se você encontrar erros de autenticação, verifique se o formato está correto no
**Supabase Dashboard → Settings → API → Project API keys**.

## Onde atualizar se necessário:

1. `.env.local` (desenvolvimento local)
2. **Vercel → Settings → Environment Variables** (produção)

## Verificar no Supabase Dashboard:

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto `tdplmmodmumryzdosmpv`
3. Settings → API → copie a `anon` / `public` key
4. Se o formato for `eyJ...` (JWT), atualize nos locais acima

# BLACKBELT v2 — FIX: Botão de Login "Entrando..." sem credenciais

## Bug
O botão de login mostra "Entrando..." (estado loading) mesmo sem o usuário ter digitado email e senha. O botão deveria estar:
- **Desabilitado** quando email OU senha estão vazios
- Mostrando texto "Entrar" (não "Entrando...")
- Só mudar para "Entrando..." APÓS o clique com campos preenchidos

## Diagnóstico

```bash
# 1. Encontrar a página/componente de login
find app components -name "*.tsx" | xargs grep -l "Entrando\|login\|Login\|signIn\|sign-in" | grep -v node_modules | head -20

# 2. Ver o estado do botão
grep -n "Entrando\|isLoading\|loading\|disabled\|submitting\|isSubmitting" $(find app components -name "*.tsx" | xargs grep -l "Entrando\|login\|Login" | grep -v node_modules | head -5)
```

## Correção

No componente de login (provavelmente `app/(auth)/login/page.tsx` ou `components/auth/LoginForm.tsx`):

1. **O estado `isLoading` deve iniciar como `false`:**
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   ```
   Se está iniciando como `true` → trocar para `false`.

2. **O botão deve ter disabled quando campos vazios:**
   ```tsx
   <button
     type="submit"
     disabled={isLoading || !email.trim() || !password.trim()}
   >
     {isLoading ? 'Entrando...' : 'Entrar'}
   </button>
   ```

3. **`setIsLoading(true)` só deve ser chamado DENTRO do handleSubmit, APÓS validação:**
   ```typescript
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault()
     if (!email.trim() || !password.trim()) return
     setIsLoading(true)
     try {
       // ... login logic
     } catch (error) {
       handleServiceError(error)
     } finally {
       setIsLoading(false)
     }
   }
   ```

4. **Verificar se NÃO existe useEffect que seta loading para true no mount:**
   ```bash
   grep -n "useEffect" <arquivo-de-login> | head -10
   ```
   Se existir `useEffect(() => { setIsLoading(true) }, [])` → REMOVER.

5. **Verificar se não há redirect automático setando loading:**
   Se existir lógica tipo "se já logado, redireciona" que seta loading antes de verificar → garantir que o loading só é setado quando de fato está redirecionando, não como estado inicial.

6. **Build e push:**
   ```bash
   pnpm typecheck && pnpm build
   git add -A
   git commit -m "fix: login button showing 'Entrando...' without credentials — disable when empty, init loading as false"
   git push origin main
   ```

## Regras
- Manter `handleServiceError(error)` no catch
- Manter PT-BR ("Entrar" / "Entrando...")
- Manter CSS vars (zero cores hardcoded)
- O `finally` SEMPRE reseta `setIsLoading(false)` para evitar botão travado

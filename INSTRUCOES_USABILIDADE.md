# Instrucoes Manuais -- Ativar Usabilidade no Supabase

## 1. Rodar a Migration

Va em: https://supabase.com/dashboard -> blackbelt-production -> SQL Editor

Cole o conteudo completo do arquivo:
`supabase/migrations/074_usability_tables.sql`

Clique RUN. Deve retornar "Success. No rows returned."

> **Nota:** As migrations 071-073 ja criaram `people`, `family_links` e colunas
> basicas em `profiles`. A migration 074 complementa com as tabelas restantes
> (academy_teen_config, profile_evolution_log, data_health_issues, family_invoices,
> student_timeline_events), funcoes helper e todas as RLS policies.
> Todos os comandos usam `IF NOT EXISTS` / `CREATE OR REPLACE`, entao e seguro
> rodar mesmo que as migrations anteriores ja tenham sido executadas.

## 2. Rodar o Seed

No terminal do projeto:

```bash
# Usando variaveis do .env.local (se existirem)
npx tsx scripts/seed-usability.ts

# OU passando as variaveis diretamente
SUPABASE_SERVICE_ROLE_KEY=SUA_KEY NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co npx tsx scripts/seed-usability.ts
```

O seed cria:
- 12 pessoas (4 responsaveis, 4 teens, 4 kids)
- 7 vinculos familiares
- Config de autonomia teen
- Controles parentais nos 4 teens
- Faturas familiares (jan-mar 2026)
- Eventos de timeline
- Deteccao automatica de inconsistencias

## 3. Verificar

```bash
npx tsx scripts/verify-usability.ts

# OU com variaveis explicitas
SUPABASE_SERVICE_ROLE_KEY=SUA_KEY NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co npx tsx scripts/verify-usability.ts
```

Todas as verificacoes devem passar (0 falhas).

## 4. Deploy Edge Functions

```bash
supabase functions deploy admin-create-user
supabase functions deploy evolve-profile
```

Se necessario, fazer login primeiro:
```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
```

## 5. Testar no Browser

- https://blackbeltv2.vercel.app/login
- Login: patricia@email.com / BlackBelt@2026 -> Central da Familia
- Login: admin@guerreiros.com / BlackBelt@2026 -> Pendencias + Timeline + Config Teen

### Fluxos para testar:

1. **Central da Familia (responsavel):** Ver dependentes, faturas agrupadas, controles
2. **Painel de Pendencias (admin):** Ver inconsistencias detectadas automaticamente
3. **Timeline do Aluno (admin):** Historico unificado de matricula, presencas, evolucao
4. **Config Autonomia Teen (admin):** Configuracoes -> Autonomia Teen
5. **Criar Aluno (admin):** Wizard de cadastro -> chama edge function admin-create-user
6. **Evoluir Perfil (admin):** Kids->Teen ou Teen->Adulto -> chama edge function evolve-profile

## Troubleshooting

### Migration falhou
- Verifique se a tabela `academies` existe (pre-requisito)
- Verifique se a tabela `announcements` existe (para ALTER TABLE)
- Verifique se a tabela `class_enrollments` existe (usada na funcao detect_data_health_issues)

### Seed falhou
- A academia "Guerreiros do Tatame" precisa existir (rode o seed principal antes)
- O service role key precisa ter permissao de escrita

### Edge functions nao deployam
- Certifique-se de ter o Supabase CLI instalado: `npm install -g supabase`
- Faca `supabase login` e `supabase link` antes do deploy

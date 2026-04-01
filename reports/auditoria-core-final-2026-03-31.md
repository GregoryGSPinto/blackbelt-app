# Auditoria Cirurgica - Core Final - 2026-03-31

## Escopo

- `/parent/filhos/novo`
- resolucao de `guardian / guardian_links / profiles.person_id / people.account_id`
- recepcao check-in e autocomplete
- `setup-payments`
- `charge-student`

## Causas raiz encontradas

### 1. Responsavel ↔ dependente

- O banco ativo estava consistente: os perfis `responsavel` criados no smoke tinham `person_id` preenchido.
- O problema estava no frontend:
  - `NovoFilhoPage` dependia apenas de `profile.user_id`, mas consultava `profile.id`.
  - se `user_id` hidratasse antes de `id`, a tentativa de resolver `person_id` podia falhar e nunca rerodar.
  - a pagina ainda dependia de leitura client-side de `profiles/people`, sujeita a estado de sessao e RLS.

### 2. Check-in principal

- O autocomplete buscava a partir de `students` com filtro aninhado em `profiles.display_name`.
- Na pratica, a busca da recepcao carregava a rota, mas nao renderizava a sugestao do aluno esperado.
- A causa mais provavel era a combinacao de join/filtro aninhado frágil no Supabase para esse caso.

### 3. Cobranca manual externa

- A academia seeded do smoke (`Academia Guerreiros do Tatame`) estava sem configuracao de recebimento:
  - `bank_account_configured = false`
  - `asaas_subaccount_id = null`
  - `asaas_subaccount_api_key = null`
- O ambiente atual usa `ASAAS_SANDBOX=false`, entao qualquer tentativa de setup automatico faria write em ambiente real do gateway.
- Sem ambiente seguro/homologacao disponivel e sem subconta ativa da academia, o write externo real continua dependente de infraestrutura/configuracao externa.

## Correcao planejada nesta execucao

- Resolver o responsavel autenticado via rota server-side autenticada, com fallback confiavel por `user_id` e reparo de `person_id` no perfil quando necessario.
- Reescrever a busca de check-in para partir de `profiles` e trazer `students` via `inner join`, removendo a ambiguidade do filtro por nome.
- Revalidar a cobranca manual com prova explicita do bloqueio externo e tentar o maximo seguro possivel sem write indevido em gateway real.

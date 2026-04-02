# Auditoria Cirúrgica

## Já está bom
- `NEXT_PUBLIC_USE_MOCK=false` no ambiente local e Supabase/Asaas configurados.
- `pnpm typecheck` verde.
- `pnpm test` verde com 147 testes.
- Central da Plataforma já tem rota agregada real em `/api/superadmin/platform-central` e serviço servidor consolidado.
- Há base real para auth, memberships, students, `student_payments`, `student_financial_profiles`, telemetry e health snapshots.

## Parcial / inconsistente
- Onboarding público cria academia direto pelo browser service e não usa um contrato servidor consistente para criação completa da tenant.
- Cadastro rápido de aluno ainda envia `academy-1` hardcoded no payload.
- API de criação de aluno cria aluno/perfil, mas não fecha bem atualização de perfil, guardian bootstrap e dados financeiros iniciais.
- Cobrança manual existe, porém o vínculo entre membership, perfil financeiro e cobrança não está fechado de ponta a ponta.
- Há páginas de operação com dados reais misturados a placeholders/hardcodes fora do mock mode.

## Ainda fake / mock dominante
- Há muitos mocks espalhados fora do core, inclusive em áreas administrativas e algumas páginas de professor/superadmin.
- Parte da UX ainda depende de estados locais ou dados simulados em vez de queries reais.

## Depende de banco ativo
- Onboarding/auth real.
- Criação e listagem de alunos.
- Vínculo responsável ↔ aluno.
- Financeiro por aluno, cobranças e baixa manual.
- Platform Central / observabilidade.

## Quebra maturidade percebida
- Hardcodes de tenant (`academy-1`) em fluxo crítico.
- Contratos backend duplicados para onboarding.
- Cadastro de aluno com criação parcial de responsável.
- Pagamentos manuais e cobrança avulsa sem consolidação suficiente no perfil financeiro do aluno.

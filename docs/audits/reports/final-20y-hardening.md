# BlackBelt Hardening Report — 2026-03-31

## 1. Implementado e corrigido nesta execução

### Auth e autorização
- Corrigido risco de autenticação em `app/api/v1/auth-guard.ts`:
  - antes o guard podia resolver a primeira `membership` ativa encontrada, sem amarrar ao usuário autenticado;
  - agora resolve os `profiles` do usuário real, respeita `bb-academy-id` e `bb-active-role`, e só então devolve contexto autenticado;
  - adicionada fallback explícita para `superadmin`.
- Corrigido endurecimento de troca de perfil em `lib/api/auth.service.ts`:
  - `selectProfile()` agora exige sessão válida;
  - o `profileId` selecionado precisa pertencer ao `user.id` autenticado.

### Configurações admin
- Removidos hardcodes operacionais do admin settings:
  - `app/(admin)/admin/configuracoes/page.tsx` não usa mais `admin-1`;
  - a tela agora lê `profile.id` do contexto de auth e a academia ativa do cookie real;
  - uploads, export LGPD, desativação/exclusão de conta e academia passaram a usar contexto ativo real;
  - quando não existe perfil/academia válidos, a UI mostra erro explícito em vez de operar em falso-positivo.
- Removido hardcode de academia no gateway de pagamento:
  - `app/(admin)/admin/configuracoes/pagamento/page.tsx` não usa mais `academy-bb-001`;
  - a tela depende da academia ativa real e falha de forma honesta quando esse contexto não existe.

### Financeiro real
- Endurecido `app/api/academy/setup-payments/route.ts`:
  - valida campos obrigatórios;
  - exige usuário autenticado;
  - exige vínculo `admin` com a academia ou papel `superadmin`;
  - registra auditoria com `profile_id` do operador.
- Endurecido `app/api/academy/charge-student/route.ts`:
  - valida `academyId`, `studentProfileId`, `amountCents`, `dueDate`, `studentName`;
  - exige operador com papel `admin` ou `recepcao` da academia, ou `superadmin`;
  - exige que o aluno exista como membership ativa na academia;
  - marca `source` entre `manual_charge` e `recurring_charge`;
  - falha de forma explícita para academia inexistente, subconta Asaas ausente ou subconta não ativa.

## 2. Arquivos alterados
- `app/api/v1/auth-guard.ts`
- `lib/api/auth.service.ts`
- `app/(admin)/admin/configuracoes/page.tsx`
- `app/(admin)/admin/configuracoes/pagamento/page.tsx`
- `app/api/academy/setup-payments/route.ts`
- `app/api/academy/charge-student/route.ts`

## 3. Migrations aplicadas ou criadas
- Nenhuma migration nova criada nesta execução.
- Nenhuma migration aplicada nesta execução.

## 4. Seed ajustado
- Nenhum seed ajustado nesta execução.

## 5. Types regenerados
- Nenhum type de banco regenerado nesta execução.

## 6. Fluxos diretamente endurecidos
- Seleção de perfil e resolução de contexto autenticado.
- Configurações do admin usando perfil/academia reais.
- Configuração de recebimento Asaas por academia com autorização real.
- Geração de cobrança por aluno com autorização real e validação de vínculo.

## 7. Testes executados
- `pnpm test`
  - Resultado: `18` suites aprovadas, `147` testes aprovados.

## 8. Resultado do typecheck
- `pnpm typecheck`
  - Resultado do código alterado: os erros de tipagem introduzidos nesta execução foram corrigidos.
  - Limite real do repositório: o `tsconfig.json` inclui `.next/types/**/*.ts`, então o `tsc --noEmit` fica sensível ao estado transitório da pasta `.next` durante/antes do build. Em uma das execuções, o comando falhou por arquivos `.next/types` ausentes, sem apontar erro de código-fonte nos arquivos alterados.

## 9. Resultado do build
- `pnpm build`
  - O build avançou até compilação e lint com warnings conhecidos.
  - Warnings observados:
    - Sentry/OpenTelemetry com `Critical dependency`;
    - vários warnings de hooks React e `no-img-element` espalhados pelo produto.
  - Limite desta execução:
    - o processo de build permaneceu em execução após a fase de warnings/lint e não retornou status final dentro da janela usada aqui.
    - portanto, **não há prova final de build concluído com sucesso nesta execução**.

## 10. Resultado de smoke
- Smoke end-to-end não executado nesta execução.
- Não houve smoke controlado contra backend Asaas ou Supabase real nesta execução.

## 11. Pronto no código
- Guard de API sem resolver membership de outro usuário por engano.
- Seleção de perfil vinculada ao usuário autenticado.
- Settings admin sem IDs fixos nos fluxos alterados.
- Setup de pagamentos e cobrança por aluno com validação mínima operacional e autorização por academia.

## 12. Pronto no banco ativo/local
- Não houve alteração comprovada de banco ativo/local nesta execução.
- Não houve aplicação de migration nem seed nesta execução.

## 13. Pronto para piloto
- Melhorou a confiabilidade percebida em auth operacional e cobrança backend.
- Ainda não considero o módulo financeiro ou o core inteiro “prontos para piloto sério” sem:
  - validação real contra banco ativo;
  - smoke de cobrança/check-in/onboarding;
  - fechamento dos hardcodes remanescentes nas demais áreas admin/superadmin.

## 14. Pronto em produção
- Nada adicional ficou comprovadamente pronto em produção nesta execução.

## 15. Dependências externas / credenciais / rede
- Asaas real não foi exercitado nesta execução.
- Supabase ativo não foi migrado nem semeado nesta execução.
- Build final não foi comprovado até saída 0.

## 16. Gaps restantes mais relevantes
- Hardcodes administrativos ainda existentes em áreas como:
  - `app/(superadmin)/superadmin/configuracoes/page.tsx`
  - `app/(admin)/admin/whatsapp/page.tsx`
  - `app/(admin)/admin/graduacoes/page.tsx`
  - `app/(admin)/admin/auditoria/page.tsx`
  - `app/(admin)/admin/convites/page.tsx`
  - `app/(admin)/admin/site/page.tsx`
- O repositório ainda depende de `.next/types` para `typecheck`, o que reduz previsibilidade operacional da validação local.
- Não houve fechamento de migrations/seed/schema nesta execução.
- Não houve smoke real de onboarding, check-in, financeiro por aluno e Central da Plataforma.

## 17. Nota honesta de maturidade após esta execução
- Antes desta execução, havia fragilidade real em auth/contexto e rotas financeiras com autorização insuficiente e UI admin operando com hardcodes.
- Depois desta execução, o produto fica **mais seguro e menos improvisado** nesses pontos específicos.
- Nota honesta desta execução isolada:
  - **ganho real de hardening local**: alto nos pontos alterados;
  - **ganho de maturidade global do produto**: moderado;
  - **estado geral após esta execução**: ainda não atinge “software veterano”, mas remove algumas das fragilidades mais perigosas e enganosas do core administrativo/financeiro.

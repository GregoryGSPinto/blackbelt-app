# Auditoria UX por Persona — 2026-04-01

## Nota inicial por persona

| Persona | Nota | Status | Gap principal |
| --- | --- | --- | --- |
| Owner/Admin | 8.3 | quase madura | dashboard forte, mas carregamento base ainda genérico demais |
| Recepção | 7.8 | precisa ajuste | busca/check-in ainda sem feedback claro para zero resultado e pesquisa em andamento |
| Professor | 8.0 | quase madura | rotina principal boa, mas sem saída clara quando contexto não carrega |
| Aluno adulto | 7.9 | precisa ajuste | dashboard forte, mas ainda cai em tela muda se faltar contexto do aluno |
| Teen | 7.7 | precisa ajuste | boa linguagem visual, mas contexto ausente vira tela vazia |
| Kids | 7.6 | precisa ajuste | fluxo amigável, mas erro/contexto ausente ainda some da tela |
| Responsável | 8.2 | quase madura | jornada principal já sólida, mas falha de carregamento ainda fica silenciosa |
| Super Admin | 8.5 | quase madura | central forte, mas fallback inicial ainda genérico e sem contexto |

## Gaps reais

- Todos os layouts principais usam o mesmo spinner cru no `Suspense`, sem dizer qual área está carregando nem o que fazer se demorar.
- A seleção de perfil ainda dispara auto-seleção durante o render, o que é frágil e dificulta feedback previsível.
- Dashboards de aluno adulto, teen e kids ainda podem cair em `return null` quando o contexto real do aluno não chega.
- O dashboard do responsável silencia erro de carregamento e parece “sem conteúdo” em vez de assumir falha operacional.
- O check-in da recepção ainda não diferencia claramente: digitando pouco, buscando, sem resultado e resultado pronto.

## Quick wins de maior impacto

- Padronizar fallback de carregamento por papel com contexto visível.
- Remover auto-ação no render da seleção de perfil.
- Trocar telas mudas por `empty/error states` úteis nas homepages das personas de aluno.
- Dar feedback de busca real no check-in da recepção.
- Expor erro operacional do responsável com saída de recuperação.

## Bloqueios reais

- Ainda existe dependência estrutural de contexto autenticado correto por perfil.
- O hook `useStudentId()` ainda merece uma rodada própria de hardening global para eliminar fallback invisível em todo o app sem risco de regressão ampla.

## Ordem de correção desta execução

1. Estados base compartilhados por papel
2. Seleção de perfil
3. Homepages de aluno/teen/kids/responsável
4. Check-in da recepção
5. Smoke operacional por persona

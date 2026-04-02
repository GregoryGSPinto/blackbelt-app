# BlackBelt v2 — Criterios de Go/No-Go para Lancamento Publico

## Criterios OBRIGATORIOS (todos devem ser TRUE)

| # | Criterio | Meta | Medicao |
|---|----------|------|---------|
| 1 | Academias ativas | >= 2 | beta_academies status=active |
| 2 | Bugs criticos abertos | 0 | beta_feedback priority=critical AND status!=resolved |
| 3 | NPS | >= +30 | Dashboard NPS |
| 4 | Uptime ultimos 7d | >= 99% | UptimeRobot |
| 5 | Build sem erros | TRUE | pnpm typecheck && pnpm build |
| 6 | Todos os logins funcionam | TRUE | Manual: super admin, admin, prof, aluno, responsavel |
| 7 | Check-in funciona | TRUE | Teste em device real |
| 8 | Pagamento funciona | TRUE | Teste com R$1 real (quando gateway ativo) |

## Criterios DESEJAVEIS (pelo menos 4 de 6)

| # | Criterio | Meta | Medicao |
|---|----------|------|---------|
| 1 | Alunos cadastrados pelas academias beta | >= 20 | profiles count |
| 2 | Check-ins nos ultimos 7 dias | >= 30 | attendances count |
| 3 | Feature usage diversidade | >= 5 features diferentes usadas | beta_feature_usage |
| 4 | Tempo medio de resolucao de bugs | <= 48h | feedback stats |
| 5 | Pelo menos 1 academia quer pagar | TRUE | conversa com beta tester |
| 6 | Screenshots reais para stores | >= 6 por dispositivo | Arquivos em resources/ |

## Timeline

| Semana | Marco |
|--------|-------|
| 1 | 2 academias onboarded, usando diariamente |
| 2 | Bugs criticos resolvidos, NPS >= 0 |
| 3 | Features mais pedidas implementadas |
| 4 | Go/No-Go: avaliar criterios acima |
| 5 | Se GO: publicar nas stores (TestFlight + Google Internal) |
| 6 | Se GO: abrir para publico |

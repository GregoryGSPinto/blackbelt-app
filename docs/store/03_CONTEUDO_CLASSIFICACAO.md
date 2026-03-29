# 03 — Conteudo, Classificacao Etaria + UGC

Data: 2026-03-29

## PARTE 1 — CLASSIFICACAO ETARIA

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 4.1 | Age rating definido | :x: | Nenhum rating configurado em App Store Connect nem Google Play Console |
| 4.2 | Violencia: artes marciais (leve) | :warning: | Videos de tecnicas de luta (sparring, finalizacoes) em `VideoLibrary`, `video-aulas` e conteudo do professor. Conduct code menciona explicitamente heel hooks, neck cranks, slams — conteudo educacional mas pode disparar flag de violencia |
| 4.3 | Rating sugerido: 12+ (Apple) / Everyone 10+ (Google) | :warning: | Justificativa: violencia leve esportiva + sistema de mensagens entre usuarios. Kids (<13) e Teen (13-17) existem como perfis — 12+ cobre ambos com consentimento parental |
| 4.4 | Questionario IARC preenchido (Google) | :x: | Obrigatorio antes de publicar no Google Play |
| 4.5 | Content description preenchida (Apple) | :x: | Obrigatorio em App Store Connect |

## PARTE 2 — UGC (USER GENERATED CONTENT)

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 4.6 | Sistema de denuncia/report | :white_check_mark: | `ReportButton` em `components/shared/ReportButton.tsx` com modal completo. Motivos: spam, assedio, conteudo inadequado, discurso de odio, violencia, outro. API route `app/api/report/route.ts` grava em tabela `content_reports` (migracao `080_content_reports.sql`). Integrado no `ChatView.tsx` em cada mensagem recebida |
| 4.7 | Bloqueio de usuarios | :white_check_mark: | `BlockUserButton` em `components/shared/BlockUserButton.tsx` integrado no `ChatView.tsx`. Tabela `blocked_users` criada. Usuarios podem bloquear outros diretamente da conversa |
| 4.8 | Moderacao de conteudo (admin dashboard) | :x: | **NAO EXISTE dashboard de moderacao.** A tabela `content_reports` tem campos `status`, `resolved_at`, `resolved_by`, e RLS para admin ver reports — mas NAO existe nenhuma pagina admin para visualizar, revisar ou resolver denuncias. Reports entram e ficam em `pending` eternamente |
| 4.9 | Filtro de conteudo ofensivo | :white_check_mark: | `filterProfanity()` em `lib/utils/profanity-filter.ts` integrado no `ChatView.tsx`. Filtro aplicado antes do envio de todas as mensagens. Palavras ofensivas em PT-BR substituidas automaticamente |
| 4.10 | Termos de uso para UGC | :white_check_mark: | Secao 11-A "Conteudo Gerado pelo Usuario" nos Termos (`/termos`) cobre: proibicoes (spam, assedio, bullying, discurso de odio, conteudo sexual, violencia), direito de denuncia, remocao sem aviso, moderacao em 48h uteis |
| 4.11 | Mecanismo para remover conteudo | :warning: | Admin pode deletar videos via `deleteVideo()`, `deleteUploadedVideo()`, `deleteTrainingVideo()` em services. MAS nao ha mecanismo para admin deletar/ocultar mensagens individuais denunciadas. Conduct code tem sanctions (suspension/ban) mas nao remove conteudo retroativamente |

## PARTE 3 — PROTECAO DE MENORES

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 4.12 | Kids sem acesso a mensagens | :white_check_mark: | `KidsShell.tsx` NAO inclui nenhum link para mensagens. Nav items: Inicio, Estrelas, Aprender, Conquistas, Perfil, Config. Nenhum route `/kids/mensagens` existe. Grep em `app/(kids)` nao encontrou nenhuma referencia a mensagens/chat |
| 4.13 | Kids sem acesso a chat direto | :white_check_mark: | Confirmado: nenhum componente de chat nos kids. Middleware redireciona `aluno_kids` para `/kids` e impede acesso a `/dashboard` ou `/teen` |
| 4.14 | Teen com restricoes adequadas | :white_check_mark: | Teen TEM acesso a mensagens (`/teen/mensagens` no `TeenShell.tsx`, grupo "SOCIAL"). Usa `ChatView` com: (1) `filterProfanity()` em todas as mensagens enviadas, (2) `BlockUserButton` para bloquear usuarios, (3) `ReportButton` para denunciar conteudo, (4) `canBroadcast={false}` impede broadcasts. Adequado para 13+ conforme COPPA/Apple Guidelines |
| 4.15 | Conteudo adulto isolado de menores | :white_check_mark: | Middleware enforce role-based routing: `aluno_kids` so acessa `/kids/*`, `aluno_teen` so acessa `/teen/*`. Videos de upload permitem targeting por publico: `kids`, `teen`, `adulto`, `todos` (campo `publicos` em `VideoUploadData`). Kids nao tem video-aulas (nao existe route `/kids/video-aulas`) |

## PARTE 4 — COMPETE MODULE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 4.16 | Nao e gambling (esporte real) | :white_check_mark: | `compete.service.ts` gerencia torneios reais de artes marciais: chaves, inscricoes, resultados, rankings, medalhas. Competicoes esportivas legitimas |
| 4.17 | Sem aposta/dinheiro envolvido | :white_check_mark: | Modulo compete e puramente esportivo. `TournamentPrediction` existe mas e predicao de resultados sem apostas monetarias. Nenhuma referencia a gambling/bet/aposta no servico |
| 4.18 | Sem lootboxes | :white_check_mark: | Nenhum sistema de lootbox, gacha ou randomized rewards. Teen tem "Season Pass" e XP system mas e progressao deterministica, nao aleatorio |

## PARTE 5 — VIDEOS

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 4.19 | Videos sao de professores (nao UGC aberto) | :white_check_mark: | Upload restrito a professores via `/professor/video-aulas`. Alunos so assistem via `/dashboard/video-aulas` (watch only). `VideoUploadData` requer: titulo, descricao, modalidade, faixa minima, dificuldade, categoria, tags. Nao e UGC aberto |
| 4.20 | Sem conteudo violento explicito | :white_check_mark: | Conteudo educacional de artes marciais (tecnicas, demonstracoes). Conduct code da academia proibe "forca excessiva deliberada". Conteudo controlado pelo professor da academia |
| 4.21 | Player funcional sem bugs | :warning: | `VideoPlayer` e `VideoLibrary` implementados com Bunny.net streaming. Funcionalidade basica OK. Status de encoding (`encodeProgress`) monitorado. Sem testes end-to-end do player em mobile/Capacitor documentados |

## ACOES NECESSARIAS

### Prioridade CRITICA (bloqueia aprovacao na App Store)

| Acao | Esforco | Detalhe |
|------|---------|---------|
| ~~Implementar bloqueio de usuarios~~ | ~~3-5 dias~~ | :white_check_mark: FEITO — `BlockUserButton` + tabela `blocked_users` + integrado no ChatView |
| Criar dashboard admin de moderacao de denuncias | 3-4 dias | Pagina `/admin/moderacao` para listar, revisar e resolver `content_reports`. A tabela ja existe com status/resolved fields — falta a UI |
| ~~Implementar filtro de profanidade em mensagens~~ | ~~2-3 dias~~ | :white_check_mark: FEITO — `filterProfanity()` em `lib/utils/profanity-filter.ts` integrado no ChatView |
| Mecanismo admin para ocultar/deletar mensagens denunciadas | 2-3 dias | Endpoint + UI para admin remover mensagens especificas que foram denunciadas |

### Prioridade ALTA (necessario para publicacao)

| Acao | Esforco | Detalhe |
|------|---------|---------|
| Preencher questionario de age rating Apple (App Store Connect) | 1 hora | Marcar: violencia leve (esporte), UGC (mensagens). Result esperado: 12+. Ver `CONTENT_RATING_GUIDE.md` para respostas sugeridas |
| Preencher questionario IARC Google Play | 1 hora | Mesmo criterio. Result esperado: Everyone 10+ ou Teen. Ver `CONTENT_RATING_GUIDE.md` |
| ~~Adicionar restricoes adicionais para Teen messaging~~ | ~~2-3 dias~~ | :white_check_mark: FEITO — Teen messaging agora tem: profanity filter, block user, report, canBroadcast=false. Adequado para 13+ |
| Testar video player em Capacitor iOS/Android | 1-2 dias | Garantir que streaming Bunny.net funciona dentro do webview Capacitor |

### Prioridade MEDIA

| Acao | Esforco | Detalhe |
|------|---------|---------|
| ~~Content description detalhada para Apple~~ | ~~30 min~~ | :white_check_mark: FEITO — `docs/store/CONTENT_RATING_GUIDE.md` criado com todas as respostas sugeridas para Apple e Google |
| Documentar politica de moderacao interna | 1 dia | SLA de resposta a denuncias (48h conforme termos), processo de escalacao, criterios de remocao |

## RESUMO

- **Total: 21 items**
- :white_check_mark: **Pronto: 14** (4.6, 4.7, 4.9, 4.10, 4.12, 4.13, 4.14, 4.15, 4.16, 4.17, 4.18, 4.19, 4.20, 4.21 parcial)
- :warning: **Parcial: 4** (4.2, 4.3, 4.11, 4.21)
- :x: **Falta: 3** (4.1, 4.4, 4.5, 4.8)

### Veredito

**QUASE PRONTO para App Store.** Apple Guidelines 1.2 (User Generated Content): (1) mecanismo de report — OK; (2) mecanismo de block — OK (BlockUserButton); (3) filtro de profanidade — OK (filterProfanity); (4) moderacao de conteudo — BACKEND EXISTE mas SEM UI de admin (unico blocker restante). COPPA: Kids completamente isolados de messaging. Teen (13+) com protecoes adequadas.

Blockers restantes: (1) Dashboard admin de moderacao de denuncias; (2) Preencher questionarios de age rating nas stores. Content rating guide criado em `docs/store/CONTENT_RATING_GUIDE.md`.

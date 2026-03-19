# BLACKBELT v2 — INVENTARIO COMPLETO + GAP ANALYSIS
## Data: 2026-03-19

---

# RESUMO EXECUTIVO

| Metrica | Valor |
|---------|-------|
| Total de paginas (page.tsx) | **265** |
| Total de services (*.service.ts) | **217** |
| Total de funcoes exportadas nos services | **1.855** |
| Services com Supabase real | **23** (10,6%) |
| Services somente mock | **194** (89,4%) |
| Total de mocks (*.mock.ts) | **203** |
| Total de linhas de mock | **30.110** |
| Total de tabelas Supabase | **97** (unicas) |
| Total de migracoes SQL | **34** |
| Total de componentes reutilizaveis | **99** |
| Total de API routes | **17** |
| Total de hooks customizados | **13** |
| Total de shells | **8** |
| Total de edge functions | **11** |
| Total de testes | **12** |
| Total de linhas de codigo (TS/TSX) | **197.786** |
| Total de arquivos TypeScript | **978** |
| Paginas funcionando (UI completa) | **140** (52,8%) |
| Paginas parciais (UI + TODO) | **120** (45,3%) |
| Paginas stub/vazias | **5** (1,9%) |
| Prontidao para DEMO | **7/10** |
| Prontidao para PRODUCAO | **3/10** |
| Prontidao para ESCALA | **2/10** |

---

# FASE 1 — INVENTARIO TECNICO

---

## 1A. TODAS AS PAGINAS (265 total)

### (admin) — 67 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /admin | 1480 | ✅ | mock+supabase | Dashboard KPIs completo com charts, churn, pedagogico |
| 2 | /admin/acesso | 165 | ✅ | mock | Controle de acesso |
| 3 | /admin/acesso/proximidade | 258 | ⚠️ | mock | UI com TODO |
| 4 | /admin/alunos | 548 | ⚠️ | mock | Lista alunos, tem TODO |
| 5 | /admin/alunos/[id] | 704 | ✅ | mock | Detalhe do aluno |
| 6 | /admin/analytics | 99 | ✅ | mock | Hub de analytics |
| 7 | /admin/analytics/churn | 177 | ✅ | mock | Predicao de churn |
| 8 | /admin/analytics/professores | 194 | ✅ | mock | Analytics de professores |
| 9 | /admin/auditoria | 429 | ✅ | mock | Log de auditoria |
| 10 | /admin/aula-experimental | 681 | ⚠️ | mock | Aulas experimentais, TODO |
| 11 | /admin/automacoes | 90 | ✅ | mock | Automacoes |
| 12 | /admin/calendario | 7 | ✅ | mock | Redirect p/ CalendarView |
| 13 | /admin/campanhas | 371 | ⚠️ | mock | Campanhas marketing, TODO |
| 14 | /admin/campeonatos | 583 | ⚠️ | mock | Listagem campeonatos, TODO |
| 15 | /admin/campeonatos/[id]/arbitragem | 420 | ⚠️ | mock | Arbitragem, TODO |
| 16 | /admin/campeonatos/[id]/pesagem | 260 | ✅ | mock | Pesagem |
| 17 | /admin/comercial | 306 | ⚠️ | mock | Painel comercial, TODO |
| 18 | /admin/comunicados | 613 | ⚠️ | mock | Comunicados, TODO |
| 19 | /admin/configuracoes | 1205 | ⚠️ | mock | Config geral, TODO |
| 20 | /admin/configuracoes/audit-log | 121 | ✅ | mock | Audit log |
| 21 | /admin/configuracoes/marca | 140 | ⚠️ | mock | Branding, TODO |
| 22 | /admin/configuracoes/pagamento | 569 | ⚠️ | mock | Config pagamento, TODO |
| 23 | /admin/configuracoes/sso | 124 | ⚠️ | mock | SSO, TODO |
| 24 | /admin/conteudo | 86 | ✅ | mock | Gestao conteudo |
| 25 | /admin/contratos | 371 | ⚠️ | mock | Contratos, TODO |
| 26 | /admin/convites | 806 | ⚠️ | mock | Convites, TODO |
| 27 | /admin/curriculo | 268 | ⚠️ | mock | Curriculo, TODO |
| 28 | /admin/equipe | 162 | ⚠️ | mock | Gestao equipe, TODO |
| 29 | /admin/espacos | 86 | ✅ | mock | Espacos/salas |
| 30 | /admin/estoque | 376 | ⚠️ | mock | Estoque, TODO |
| 31 | /admin/eventos | 613 | ⚠️ | mock | Eventos, TODO |
| 32 | /admin/financeiro | 426 | ⚠️ | mock | Financeiro, TODO |
| 33 | /admin/gamificacao/recompensas | 351 | ⚠️ | mock | Recompensas, TODO |
| 34 | /admin/graduacoes | 721 | ✅ | mock | Graduacoes completo |
| 35 | /admin/importar | 398 | ✅ | mock | Importacao dados |
| 36 | /admin/inadimplencia | 551 | ⚠️ | mock | Inadimplencia, TODO |
| 37 | /admin/indicar | 89 | ✅ | mock | Indicacao |
| 38 | /admin/integracoes/api | 130 | ⚠️ | mock | API keys, TODO |
| 39 | /admin/integracoes/webhooks | 143 | ⚠️ | mock | Webhooks, TODO |
| 40 | /admin/iot | 353 | ✅ | mock | IoT/beacons |
| 41 | /admin/leads | 74 | ✅ | mock | Leads |
| 42 | /admin/liga | 184 | ✅ | mock | Liga interna |
| 43 | /admin/loja | 74 | ✅ | mock | Hub loja |
| 44 | /admin/loja/pedidos | 333 | ⚠️ | mock | Pedidos, TODO |
| 45 | /admin/loja/produtos | 403 | ⚠️ | mock | Produtos, TODO |
| 46 | /admin/marketplace | 220 | ✅ | mock | Marketplace |
| 47 | /admin/notificacoes | 401 | ✅ | mock | Notificacoes |
| 48 | /admin/nps | 297 | ✅ | mock | NPS survey |
| 49 | /admin/pedagogico | 1371 | ⚠️ | mock | Pedagogico grande mas TODO |
| 50 | /admin/perfil | 311 | ✅ | mock | Perfil admin |
| 51 | /admin/plano | 756 | ⚠️ | mock | Plano academia, TODO |
| 52 | /admin/plano-plataforma | 84 | ✅ | mock | Plano plataforma |
| 53 | /admin/plugins | 243 | ⚠️ | mock | Plugins, TODO |
| 54 | /admin/relatorio-professores | 455 | ✅ | mock | Relatorio professores |
| 55 | /admin/relatorios | 164 | ✅ | mock | Hub relatorios |
| 56 | /admin/retencao | 1045 | ✅ | mock | Retencao/churn completo |
| 57 | /admin/royalties | 168 | ✅ | mock | Royalties |
| 58 | /admin/setup-wizard | 17 | ✅ | mock | Redirect wizard |
| 59 | /admin/sistema | 103 | ✅ | mock | Info sistema |
| 60 | /admin/site | 848 | ⚠️ | mock | Landing builder, TODO |
| 61 | /admin/substituicao | 399 | ⚠️ | mock | Substituicao prof, TODO |
| 62 | /admin/tecnicas | 240 | ⚠️ | mock | Banco tecnicas, TODO |
| 63 | /admin/torneios | 79 | ✅ | mock | Torneios |
| 64 | /admin/turmas | 816 | ⚠️ | mock | Turmas, TODO |
| 65 | /admin/unidades | 106 | ⚠️ | mock | Unidades, TODO |
| 66 | /admin/whatsapp | 1545 | ⚠️ | mock | WhatsApp grande mas TODO |
| 67 | /admin/wizard | 639 | ⚠️ | mock | Setup wizard, TODO |

### (auth) — 9 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /login | 601 | ⚠️ | supabase | Login funcional, tem TODOs |
| 2 | /cadastro | 956 | ⚠️ | supabase | Cadastro completo, TODOs |
| 3 | /cadastro/[token] | 464 | ⚠️ | supabase | Cadastro por token, TODOs |
| 4 | /comecar | 353 | ⚠️ | mock | Onboarding, TODOs |
| 5 | /convite/[token] | 336 | ✅ | supabase | Convite por token |
| 6 | /esqueci-senha | 360 | ⚠️ | supabase | Esqueci senha, TODOs |
| 7 | /redefinir-senha | 327 | ⚠️ | supabase | Redefinir senha, TODOs |
| 8 | /selecionar-perfil | 68 | ✅ | supabase | Selecao de perfil |
| 9 | /senha-alterada | 233 | ✅ | mock | Confirmacao senha |

### (professor) — 32 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /professor | 1020 | ⚠️ | mock | Dashboard grande, TODOs |
| 2 | /professor/agenda | 115 | ✅ | mock | Agenda |
| 3 | /professor/alertas | 367 | ✅ | mock | Alertas |
| 4 | /professor/alunos | 183 | ⚠️ | mock | Lista alunos, TODO |
| 5 | /professor/alunos/[id] | 1517 | ⚠️ | mock | Detalhe aluno, TODO |
| 6 | /professor/analise-luta | 269 | ⚠️ | mock | Analise de luta, TODO |
| 7 | /professor/avaliacao-fisica | 254 | ⚠️ | mock | Avaliacao fisica, TODO |
| 8 | /professor/avaliacoes | 710 | ⚠️ | mock | Avaliacoes, TODO |
| 9 | /professor/calendario | 7 | ✅ | mock | CalendarView redirect |
| 10 | /professor/configuracoes | 203 | ⚠️ | mock | Configuracoes, TODO |
| 11 | /professor/conteudo | 1453 | ⚠️ | mock | Conteudo grande, TODO |
| 12 | /professor/diario | 551 | ⚠️ | mock | Diario de aula, TODO |
| 13 | /professor/duvidas | 425 | ⚠️ | mock | Duvidas, TODO |
| 14 | /professor/mensagens | 298 | ⚠️ | mock | Mensagens, TODO |
| 15 | /professor/perfil | 396 | ✅ | mock | Perfil professor |
| 16 | /professor/periodizacao | 261 | ⚠️ | mock | Periodizacao, TODO |
| 17 | /professor/plano-aula | 559 | ✅ | mock | Plano de aula |
| 18 | /professor/plano-treino | 246 | ⚠️ | mock | Plano treino, TODO |
| 19 | /professor/presenca | 236 | ⚠️ | mock | Presenca, TODO |
| 20 | /professor/relatorios | 791 | ⚠️ | mock | Relatorios, TODO |
| 21 | /professor/tecnicas | 426 | ⚠️ | mock | Tecnicas, TODO |
| 22 | /professor/turma-ativa | 492 | ⚠️ | mock | Turma ativa, TODO |
| 23 | /professor/turmas | 326 | ✅ | mock | Turmas professor |
| 24 | /turma-ativa | 380 | ✅ | mock | Turma ativa (top-level) |
| 25 | /turma-ativa/gravar | 271 | ✅ | mock | Gravar aula |
| 26 | /plano-aula | 716 | ⚠️ | mock | Plano aula alt, TODO |
| 27 | /avaliar/[studentId] | 626 | ⚠️ | mock | Avaliar aluno, TODO |
| 28 | /promover/[studentId] | 398 | ⚠️ | mock | Promover aluno, TODO |
| 29 | /analise-video/[id] | 376 | ⚠️ | mock | Analise video, TODO |
| 30 | /meus-cursos | 111 | ✅ | mock | Meus cursos |
| 31 | /meus-cursos/novo | 338 | ⚠️ | mock | Novo curso, TODO |
| 32 | /meus-cursos/financeiro | 202 | ⚠️ | mock | Financeiro cursos, TODO |

### (main) — Aluno Adulto — 55 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /dashboard | 504 | ✅ | supabase | Dashboard completo |
| 2 | /dashboard/checkin | 82 | ✅ | supabase | Check-in QR |
| 3 | /dashboard/configuracoes | 203 | ⚠️ | mock | Config, TODO |
| 4 | /dashboard/conquistas | 322 | ✅ | mock | Conquistas/badges |
| 5 | /dashboard/conteudo | 688 | ⚠️ | mock | Conteudo, TODO |
| 6 | /dashboard/conteudo/[id] | 1106 | ⚠️ | mock | Video player, TODO |
| 7 | /dashboard/mensagens | 88 | ⚠️ | mock | Mensagens, TODO |
| 8 | /dashboard/meu-progresso | 545 | ✅ | mock | Meu progresso |
| 9 | /dashboard/perfil | 605 | ✅ | supabase | Perfil completo |
| 10 | /dashboard/perfil/pagamentos | 126 | ✅ | mock | Pagamentos |
| 11 | /dashboard/progresso | 79 | ✅ | mock | Progresso hub |
| 12 | /dashboard/turmas | 120 | ✅ | mock | Turmas |
| 13 | /academia | 347 | ✅ | mock | Modulos teoricos |
| 14 | /academia/[moduloId] | 441 | ✅ | mock | Modulo detalhe |
| 15 | /academia/[moduloId]/quiz | 536 | ✅ | mock | Quiz |
| 16 | /academia/glossario | 259 | ⚠️ | mock | Glossario, TODO |
| 17 | /analise-luta/[videoId] | 292 | ✅ | mock | Analise de luta |
| 18 | /avaliacao-fisica | 228 | ✅ | mock | Avaliacao fisica |
| 19 | /battle-pass | 276 | ✅ | mock | Battle pass |
| 20 | /campeonatos/[id]/inscricao | 350 | ✅ | mock | Inscricao campeonato |
| 21 | /carrinho | 141 | ⚠️ | mock | Carrinho, TODO |
| 22 | /carteirinha | 189 | ⚠️ | mock | Carteirinha, TODO |
| 23 | /certificados | 137 | ✅ | mock | Certificados |
| 24 | /checkout/[planId] | 187 | ✅ | mock | Checkout plano |
| 25 | /checkout-loja | 342 | ⚠️ | mock | Checkout loja, TODO |
| 26 | /comunidade | 387 | ⚠️ | mock | Comunidade, TODO |
| 27 | /curriculo | 131 | ✅ | mock | Curriculo |
| 28 | /desafios | 68 | ✅ | mock | Desafios |
| 29 | /eventos | 257 | ✅ | mock | Eventos |
| 30 | /feed | 85 | ✅ | mock | Feed social |
| 31 | /hall-da-fama | 182 | ✅ | mock | Hall da fama |
| 32 | /indicar | 391 | ⚠️ | mock | Indicar amigo, TODO |
| 33 | /liga | 164 | ✅ | mock | Liga interna |
| 34 | /loja | 321 | ⚠️ | mock | Loja, TODO |
| 35 | /loja/[id] | 278 | ✅ | mock | Produto detalhe |
| 36 | /loja/desejos | 172 | ✅ | mock | Lista desejos |
| 37 | /mensagens | 529 | ⚠️ | mock | Mensagens, TODO |
| 38 | /metas | 610 | ⚠️ | mock | Metas pessoais, TODO |
| 39 | /pedidos/[id] | 268 | ✅ | mock | Detalhe pedido |
| 40 | /perfil | 775 | ✅ | supabase | Perfil completo |
| 41 | /perfil/notificacoes | 156 | ✅ | mock | Notificacoes perfil |
| 42 | /perfil/privacidade | 114 | ✅ | mock | Privacidade |
| 43 | /periodizacao | 175 | ✅ | mock | Periodizacao |
| 44 | /personal-ai | 307 | ⚠️ | mock | Personal AI, TODO |
| 45 | /plano-treino | 170 | ✅ | mock | Plano de treino |
| 46 | /planos | 90 | ⚠️ | mock | Planos, TODO |
| 47 | /predicao/[championshipId] | 229 | ✅ | mock | Predicao campeonato |
| 48 | /progresso/videos | 154 | ⚠️ | mock | Videos progresso, TODO |
| 49 | /progresso/videos/[id] | 152 | ✅ | mock | Video detalhe |
| 50 | /recompensas | 253 | ✅ | mock | Recompensas |
| 51 | /saude | 285 | ✅ | mock | Saude/wearables |
| 52 | /season | 212 | ✅ | mock | Season pass |
| 53 | /tecnicas | 242 | ⚠️ | mock | Tecnicas, TODO |
| 54 | /titulos | 200 | ✅ | mock | Titulos |
| 55 | /torneios | 79 | ✅ | mock | Torneios |

### (teen) — 11 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /teen | 286 | ✅ | mock | Dashboard teen gamificado |
| 2 | /teen/academia | 271 | ✅ | mock | Academia teorica |
| 3 | /teen/configuracoes | 203 | ⚠️ | mock | Config, TODO |
| 4 | /teen/conquistas | 293 | ✅ | mock | Conquistas |
| 5 | /teen/conteudo | 353 | ✅ | mock | Conteudo |
| 6 | /teen/conteudo/[id] | 378 | ⚠️ | mock | Video detalhe, TODO |
| 7 | /teen/desafios | 282 | ✅ | mock | Desafios |
| 8 | /teen/perfil | 262 | ✅ | mock | Perfil gamer |
| 9 | /teen/ranking | 279 | ✅ | mock | Ranking |
| 10 | /teen/season | 348 | ✅ | mock | Season pass |
| 11 | /teen/turmas | 205 | ✅ | mock | Turmas |

### (kids) — 9 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /kids | 282 | ✅ | mock | Dashboard kids ludico |
| 2 | /kids/academia | 313 | ⚠️ | mock | Academia, TODO |
| 3 | /kids/conquistas | 268 | ✅ | mock | Conquistas |
| 4 | /kids/conteudo | 390 | ✅ | mock | Conteudo |
| 5 | /kids/conteudo/[id] | 503 | ⚠️ | mock | Video detalhe, TODO |
| 6 | /kids/figurinhas | 319 | ✅ | mock | Album figurinhas |
| 7 | /kids/minha-faixa | 248 | ✅ | mock | Minha faixa |
| 8 | /kids/perfil | 477 | ✅ | mock | Perfil |
| 9 | /kids/recompensas | 292 | ✅ | mock | Recompensas |

### (parent) — 12 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /parent | 688 | ✅ | mock | Dashboard familiar |
| 2 | /parent/autorizacoes | 484 | ✅ | mock | Autorizacoes |
| 3 | /parent/checkout/[planId] | 165 | ✅ | mock | Checkout |
| 4 | /parent/configuracoes | 203 | ⚠️ | mock | Config, TODO |
| 5 | /parent/jornada/[id] | 263 | ✅ | mock | Jornada filho |
| 6 | /parent/mensagens | 273 | ⚠️ | mock | Mensagens, TODO |
| 7 | /parent/notificacoes | 353 | ✅ | mock | Notificacoes |
| 8 | /parent/pagamentos | 115 | ✅ | mock | Pagamentos |
| 9 | /parent/perfil | 247 | ✅ | mock | Perfil |
| 10 | /parent/presencas | 270 | ✅ | mock | Presencas |
| 11 | /parent/relatorios | 476 | ✅ | mock | Relatorios |
| 12 | /agenda | 275 | ✅ | mock | Agenda familiar |

### (franqueador) — 7 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /franqueador | 249 | ⚠️ | mock | Dashboard, TODO |
| 2 | /franqueador/comunicacao | 420 | ⚠️ | mock | Comunicacao, TODO |
| 3 | /franqueador/curriculo | 277 | ✅ | mock | Curriculo |
| 4 | /franqueador/expansao | 430 | ⚠️ | mock | Expansao, TODO |
| 5 | /franqueador/padroes | 396 | ⚠️ | mock | Padroes, TODO |
| 6 | /franqueador/royalties | 287 | ✅ | mock | Royalties |
| 7 | /franqueador/unidades | 294 | ⚠️ | mock | Unidades, TODO |

### (network) — 1 pagina

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /network | 164 | ⚠️ | mock | Dashboard rede, TODO |

### (recepcao) — 7 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /recepcao | 326 | ✅ | mock | Dashboard recepcao |
| 2 | /recepcao/acesso | 303 | ⚠️ | mock | Acesso, TODO |
| 3 | /recepcao/atendimento | 303 | ⚠️ | mock | Atendimento, TODO |
| 4 | /recepcao/cadastro | 557 | ⚠️ | mock | Cadastro, TODO |
| 5 | /recepcao/caixa | 307 | ⚠️ | mock | Caixa, TODO |
| 6 | /recepcao/experimentais | 338 | ⚠️ | mock | Experimentais, TODO |
| 7 | /recepcao/mensagens | 218 | ⚠️ | mock | Mensagens, TODO |

### (superadmin) — 16 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /superadmin | 769 | ✅ | mock | Dashboard SA completo |
| 2 | /superadmin/academias | 1221 | ⚠️ | mock | Academias, TODO |
| 3 | /superadmin/academias/[id] | 221 | ✅ | mock | Detalhe academia |
| 4 | /superadmin/analytics | 517 | ✅ | mock | Analytics plataforma |
| 5 | /superadmin/auditoria | 20 | ❌ | mock | Stub minimo |
| 6 | /superadmin/compete | 504 | ⚠️ | mock | Compete, TODO |
| 7 | /superadmin/comunicacao | 794 | ⚠️ | mock | Comunicacao, TODO |
| 8 | /superadmin/contatos | 220 | ✅ | mock | Contatos |
| 9 | /superadmin/features | 826 | ⚠️ | mock | Feature flags, TODO |
| 10 | /superadmin/health | 505 | ⚠️ | mock | Health, TODO |
| 11 | /superadmin/onboarding | 296 | ⚠️ | mock | Onboarding, TODO |
| 12 | /superadmin/page | 769 | ✅ | mock | Dashboard |
| 13 | /superadmin/pipeline | 1044 | ⚠️ | mock | Pipeline CRM, TODO |
| 14 | /superadmin/planos | 865 | ✅ | mock | Planos/pricing |
| 15 | /superadmin/prospeccao | 2636 | ⚠️ | supabase | Prospeccao real (Google Places + Claude AI) |
| 16 | /superadmin/receita | 444 | ✅ | mock | Receita MRR/ARR |
| 17 | /superadmin/suporte | 1832 | ⚠️ | mock | Suporte, TODO |

### (public) — 37 paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | /ajuda | 419 | ⚠️ | mock | FAQ, TODO |
| 2 | /app-store | 185 | ⚠️ | mock | App store, TODO |
| 3 | /app-store/[id] | 211 | ✅ | mock | Detalhe plugin |
| 4 | /aula-experimental | 73 | ⚠️ | mock | Experimental, TODO |
| 5 | /blog | 26 | ❌ | mock | Stub com dados hardcoded |
| 6 | /cadastrar-academia | 685 | ⚠️ | supabase | Cadastro academia, TODO |
| 7 | /campeonatos | 209 | ⚠️ | mock | Campeonatos, TODO |
| 8 | /campeonatos/[id] | 237 | ⚠️ | mock | Detalhe, TODO |
| 9 | /campeonatos/[id]/live | 236 | ⚠️ | mock | Live, TODO |
| 10 | /campeonatos/[id]/resultados | 241 | ⚠️ | mock | Resultados, TODO |
| 11 | /changelog | 124 | ✅ | mock | Changelog |
| 12 | /compete | 361 | ⚠️ | supabase | Hub compete, TODO |
| 13 | /compete/[slug] | 541 | ✅ | supabase | Pagina torneio |
| 14 | /compete/[slug]/bracket | 321 | ✅ | supabase | Chaveamento |
| 15 | /compete/[slug]/bracket/[categoriaId] | 353 | ✅ | supabase | Bracket categoria |
| 16 | /compete/[slug]/inscricao | 458 | ⚠️ | supabase | Inscricao, TODO |
| 17 | /compete/[slug]/live | 363 | ✅ | supabase | Live score |
| 18 | /compete/[slug]/resultados | 305 | ⚠️ | supabase | Resultados, TODO |
| 19 | /compete/atleta/[id] | 265 | ✅ | supabase | Perfil atleta |
| 20 | /compete/ranking | 336 | ✅ | supabase | Ranking |
| 21 | /completar-cadastro | 516 | ⚠️ | mock | Completar cadastro, TODO |
| 22 | /contato | 55 | ✅ | mock | Pagina contato |
| 23 | /developers | 140 | ✅ | mock | Portal developers |
| 24 | /developers/api-reference | 319 | ✅ | mock | API reference |
| 25 | /developers/sandbox | 270 | ✅ | mock | Sandbox |
| 26 | /g/[slug] | 1282 | ⚠️ | supabase | Landing page publica, TODO |
| 27 | /landing | 592 | ✅ | mock | Landing page principal |
| 28 | /marketplace | 221 | ⚠️ | mock | Marketplace, TODO |
| 29 | /marketplace/[id] | 264 | ✅ | mock | Detalhe plugin |
| 30 | /precos | 18 | ✅ | mock | Redirect precos |
| 31 | /privacidade | 911 | ✅ | mock | Politica privacidade |
| 32 | /ranking/atleta/[id] | 241 | ✅ | mock | Perfil atleta |
| 33 | /ranking | 234 | ✅ | mock | Ranking geral |
| 34 | /sobre | 31 | ✅ | mock | Sobre nos |
| 35 | /status | 183 | ✅ | mock | Status page |
| 36 | /termos | 717 | ✅ | mock | Termos de uso |
| 37 | /verificar/[code] | 181 | ✅ | mock | Verificacao |

### Outras paginas

| # | Rota | Linhas | Status | Supabase | Observacao |
|---|------|--------|--------|----------|------------|
| 1 | / (root) | 301 | ⚠️ | mock | Redirect page, TODO |
| 2 | /onboarding | 470 | ⚠️ | supabase | Onboarding wizard, TODO |

---

## 1B. TODOS OS SERVICES (217 total)

### Services com Supabase Real (23 services)

| # | Service | Funcoes Exportadas | Calls Supabase | Observacao |
|---|---------|-------------------|----------------|------------|
| 1 | admin.service.ts | 7 | 9 | Dashboard KPIs reais |
| 2 | aluno.service.ts | 15 | 5 | Dashboard aluno real, tem TODO |
| 3 | auth.service.ts | 16 | 33 | Auth completo (login, OAuth, signup) |
| 4 | avaliacao.service.ts | 10 | 5 | Avaliacoes reais |
| 5 | checkin.service.ts | 6 | 16 | Check-in real |
| 6 | churn-prediction.service.ts | 10 | 4 | Predicao churn real |
| 7 | compete.service.ts | 57 | 173 | Compete MUITO completo |
| 8 | crm.service.ts | 6 | 0 | Import direto do client |
| 9 | evaluation.service.ts | 4 | 1 | Avaliacoes |
| 10 | financeiro.service.ts | 6 | 8 | Financeiro real |
| 11 | health-score.service.ts | 4 | 0 | Import direto do client |
| 12 | horarios.service.ts | 5 | 1 | Horarios |
| 13 | landing-page.service.ts | 15 | 5 | Landing pages reais |
| 14 | onboarding.service.ts | 7 | 5 | Onboarding real |
| 15 | payment-gateway.service.ts | 19 | 5 | Gateway pagamento |
| 16 | perfil.service.ts | 23 | 6 | Perfil real |
| 17 | plano-aula.service.ts | 22 | 2 | Plano de aula, tem TODO |
| 18 | professor.service.ts | 7 | 7 | Professor real |
| 19 | qrcode.service.ts | 4 | 0 | QR code |
| 20 | turma-ativa.service.ts | 5 | 0 | Turma ativa |
| 21 | turmas.service.ts | 12 | 19 | Turmas completo |
| 22 | tutorial.service.ts | 7 | 0 | Tutorial progress |
| 23 | whatsapp.service.ts | 20 | 6 | WhatsApp real |

### Services Mock-Only (194 services)

Todos os 194 services restantes seguem o padrao isMock() → dynamic import do mock.
Nenhum deles faz chamadas reais ao Supabase. Exemplos dos maiores:

| # | Service | Funcoes | Observacao |
|---|---------|---------|------------|
| 1 | suporte.service.ts | 62 | Suporte completo (mock) |
| 2 | compete.service.ts | 57 | Compete (duplicado real + mock) |
| 3 | pedagogico.service.ts | 38 | Pedagogico extenso |
| 4 | video-experience.service.ts | 31 | Experiencia video |
| 5 | content-management.service.ts | 25 | Gestao conteudo |
| 6 | video-upload.service.ts | 24 | Upload video |
| 7 | perfil.service.ts | 23 | Perfil |
| 8 | prospeccao.service.ts | 23 | Prospeccao |
| 9 | plano-aula.service.ts | 22 | Plano de aula |
| 10 | academia-teorica.service.ts | 22 | Academia teorica |

**Total de funcoes exportadas: 1.855**
**Services com Supabase: 23 (10,6%)**
**Services mock-only: 194 (89,4%)**

---

## 1C. TODOS OS MOCKS (203 arquivos)

| Estatistica | Valor |
|-------------|-------|
| Total de arquivos mock | 203 |
| Total de linhas | 30.110 |
| Media de linhas por mock | 148 |

### Top 10 mocks (por tamanho):

| # | Mock | Linhas |
|---|------|--------|
| 1 | academia-teorica.mock.ts | 1.679 |
| 2 | suporte.mock.ts | 1.459 |
| 3 | streaming.mock.ts | 1.313 |
| 4 | video-experience.mock.ts | 967 |
| 5 | pedagogico.mock.ts | 808 |
| 6 | compete.mock.ts | 705 |
| 7 | in-app-notification.mock.ts | 678 |
| 8 | pricing.mock.ts | 581 |
| 9 | video-upload.mock.ts | 526 |
| 10 | superadmin.mock.ts | 498 |

---

## 1D. TODAS AS TABELAS SUPABASE (97 tabelas unicas)

### Por migracao:

| # | Migracao | Tabelas | Descricao |
|---|----------|---------|-----------|
| 1 | 001_auth_profiles | 1 | profiles |
| 2 | 002_tenants | 3 | academies, units, memberships |
| 3 | 003_classes | 5 | modalities, students, guardians, classes, class_enrollments |
| 4 | 004_attendance | 1 | attendance |
| 5 | 005_pedagogic | 2 | progressions, evaluations |
| 6 | 006_content | 4 | videos, series, series_videos, video_progress |
| 7 | 007_social | 3 | achievements, messages, notifications |
| 8 | 008_financial | 3 | plans, subscriptions, invoices |
| 9 | 010_auth_trigger | 1 | push_tokens |
| 10 | 011_seed_tables | 11 | leads, events, event_registrations, student_xp, challenges, challenge_progress, feed_posts, feed_likes, feed_comments, class_notes, nps_responses |
| 11 | 014_invite_tokens | 2 | invite_tokens, invite_uses |
| 12 | 015_superadmin | 3 | plans (recreate), academy_onboard_tokens, academy_onboard_uses |
| 13 | 021_modular_pricing | 6 | pricing_tiers, pricing_modules, pricing_packages, academy_subscriptions, module_usage_tracking, billing_history |
| 14 | 022_tutorial_progress | 1 | tutorial_progress |
| 15 | 023_telemetry | 3 | telemetry_sessions, telemetry_events, support_tickets |
| 16 | 024_prospeccao | 2 | prospects, prospect_contacts |
| 17 | 025_app_stores | 1 | push_tokens (recreate) |
| 18 | 026_academia_teorica | 6 | theory_modules, theory_lessons, theory_progress, theory_quiz_attempts, theory_certificates, glossary_terms |
| 19 | 028_video_experience | 10 | video_progress, video_likes, video_ratings, video_saves, video_comments, comment_likes, video_questions, question_votes, video_notes, video_chapters |
| 20 | 029_contact_messages | 1 | contact_messages |
| 21 | 031_sales_features | 11 | whatsapp_configs/templates/messages/automations, payment_customers/charges/subscriptions, landing_page_configs/leads, churn_predictions/actions |
| 22 | 033_video_upload | 5 | video_class_assignments, video_audiences, video_series, video_series_items, storage_usage |
| 23 | 034_pedagogico | 8 | academy_curricula, curriculum_modules/techniques/progress, pedagogical_meetings, meeting_participants/actions, incidents |
| 24 | 035_compete | 10 | tournament_circuits/tournaments/categories/registrations/brackets/matches, athlete_profiles, academy_tournament_stats, tournament_predictions/feed |

**Total RLS policies + enables: 469**
**Total indexes: 244**

---

## 1E. TODOS OS COMPONENTES REUTILIZAVEIS (99 total)

### UI Primitivos (20)

| # | Componente | Usado em |
|---|-----------|----------|
| 1 | Avatar.tsx | 32+ paginas |
| 2 | Badge.tsx | 35+ paginas |
| 3 | BeltBadge.tsx | 5+ paginas |
| 4 | BeltProgress.tsx | 3+ paginas |
| 5 | BeltPromotionCeremony.tsx | 2+ paginas |
| 6 | BeltStripe.tsx | 3+ paginas |
| 7 | Button.tsx | 135+ paginas |
| 8 | Card.tsx | 134+ paginas |
| 9 | EmptyState.tsx | 9+ paginas |
| 10 | ErrorBoundary.tsx | 0 paginas (nao usado!) |
| 11 | ErrorState.tsx | ~0 paginas |
| 12 | Input.tsx | 35+ paginas |
| 13 | Modal.tsx | 89+ paginas |
| 14 | PageError.tsx | ~0 paginas |
| 15 | PageSkeleton.tsx | ~3 paginas |
| 16 | Skeleton.tsx | 112+ paginas |
| 17 | Spinner.tsx | ~5 paginas |
| 18 | Toast.tsx | provider level |

### Shells (8 + 5 utilitarios)

| # | Shell | Nav Links | Perfil |
|---|-------|-----------|--------|
| 1 | AdminShell.tsx | ~42 items | Admin |
| 2 | ProfessorShell.tsx | ~44 items | Professor |
| 3 | SuperAdminShell.tsx | ~24 items | SuperAdmin |
| 4 | MainShell.tsx | ~5 items | Aluno Adulto |
| 5 | TeenShell.tsx | ~5 items | Teen |
| 6 | KidsShell.tsx | ~8 items | Kids |
| 7 | ParentShell.tsx | ~5 items | Responsavel |
| 8 | RecepcaoShell.tsx | ~9 items | Recepcionista |

### Shared (20)

AvatarUploader, BulkActionBar, Celebrations, CommandPalette, CookieBanner, DayRecap, EmptyState, EmptyStates, InsightCard, LanguageSelector, OfflineBanner, PageHeader, PlanLimitBanner, ProactiveSuggestions, ProfileSwitcher, QuickActions, SkeletonLoaders, StatusDoDia, ThemeToggle, TutorialSettings, UpgradeModal, VoiceSummary, WelcomeMessage

### Outros (AI, Auth, Billing, Calendar, etc.)

| Pasta | Qtd | Componentes |
|-------|-----|-------------|
| ai/ | 3 | CoachChat, PostureCamera, VoiceAssistant |
| auth/ | 9 | AuthLayoutFrame, ChangePasswordSection, DateInput, EmailInput, NameInput, PasswordInput, PasswordRules, PasswordStrengthMeter, PhoneInput, RegistrationWizard |
| billing/ | 3 | DiscoveryBanner, ModuleGate, UpsellCard |
| calendar/ | 1 | CalendarView |
| certificado/ | 1 | CertificadoTemplate |
| championship/ | 1 | BracketView |
| checkin/ | 2 | FABCheckin, QRScanner |
| compete/ | 3 | BracketView, LiveScoreboard, SocialCard |
| landing/ | 7 | BenefitSection, CTAFinal, DesktopLanding, LandingFooter, LandingHero, ScrollDownArrow, TeenKidsSection, TestimonialCarousel |
| legal/ | 1 | ParentalConsent |
| marketplace/ | 2 | ReviewCard, ReviewForm |
| notifications/ | 1 | NotificationBell |
| onboarding/ | 1 | OnboardingWizard |
| pwa/ | 2 | InstallPrompt, ServiceWorkerRegistrar |
| reports/ | 1 | ReportViewer |
| streaming/ | 1 | SeriesPlayer |
| support/ | 2 | SupportWidget, TelemetryInit |
| tutorial/ | 5 | TutorialComplete, TutorialFAB, TutorialOverlay, TutorialProvider, TutorialWelcome |
| video/ | 3 | AnnotatedPlayer, VideoThumbnailGenerator, VideoUploader |

---

## 1F. TODAS AS MIGRACOES (34 arquivos)

| # | Arquivo | Descricao |
|---|---------|-----------|
| 1 | 001_auth_profiles.sql | Profiles base |
| 2 | 002_tenants.sql | Academias, unidades, memberships |
| 3 | 003_classes.sql | Modalidades, alunos, turmas |
| 4 | 004_attendance.sql | Presenca |
| 5 | 005_pedagogic.sql | Progressoes, avaliacoes |
| 6 | 006_content.sql | Videos, series |
| 7 | 007_social.sql | Conquistas, mensagens, notificacoes |
| 8 | 008_financial.sql | Planos, assinaturas, faturas |
| 9 | 009_seed.sql | Seed inicial |
| 10 | 010_auth_trigger_and_policies.sql | Triggers e politicas |
| 11 | 011_seed_tables.sql | Tabelas extras (leads, eventos, etc) |
| 12 | 012_enforce_rls_all_tables.sql | RLS enforcement |
| 13 | 013_performance_indexes.sql | Indexes de performance |
| 14 | 014_invite_tokens.sql | Tokens de convite |
| 15 | 015_superadmin.sql | Super admin tables |
| 16 | 016_indexes.sql | Indexes adicionais |
| 17 | 017_go_live_fixes.sql | Correcoes go-live |
| 18 | 018_fix_rls_cross_tenant.sql | Fix RLS cross-tenant |
| 19 | 019_fix_profiles_rls_recursion.sql | Fix recursao profiles |
| 20 | 020_fix_memberships_rls_recursion.sql | Fix recursao memberships |
| 21 | 021_modular_pricing.sql | Pricing modular |
| 22 | 022_tutorial_progress.sql | Progresso tutorial |
| 23 | 023_telemetry.sql | Telemetria e suporte |
| 24 | 024_prospeccao.sql | Prospeccao |
| 25 | 025_app_stores.sql | Push tokens |
| 26 | 026_academia_teorica.sql | Academia teorica |
| 27 | 028_video_experience.sql | Experiencia de video |
| 28 | 029_contact_messages.sql | Mensagens de contato |
| 29 | 030_academy_acknowledged.sql | Ciencia academia |
| 30 | 031_sales_features.sql | WhatsApp, pagamento, landing, churn |
| 31 | 032_sales_features_rls_seed.sql | RLS e seed sales |
| 32 | 033_video_upload.sql | Upload de video |
| 33 | 034_pedagogico.sql | Pedagogico avancado |
| 34 | 035_compete.sql | Compete/torneios |

---

## 1G. TODOS OS SHELLS (8)

| # | Shell | Nav Items | Perfil | Tem sidebar | Tem bottom nav |
|---|-------|-----------|--------|-------------|----------------|
| 1 | AdminShell | ~42 | Admin | ✅ | ✅ (mobile) |
| 2 | ProfessorShell | ~44 | Professor | ❌ | ✅ |
| 3 | SuperAdminShell | ~24 | SuperAdmin | ✅ | ✅ (mobile) |
| 4 | MainShell | ~5 | Aluno Adulto | ❌ | ✅ |
| 5 | TeenShell | ~5 | Teen | ❌ | ✅ |
| 6 | KidsShell | ~8 | Kids | ❌ | ✅ |
| 7 | ParentShell | ~5 | Responsavel | ❌ | ✅ |
| 8 | RecepcaoShell | ~9 | Recepcionista | ❌ | ✅ |

**NOTA:** Franqueador nao usa Shell — tem layout inline no layout.tsx do route group. Network nao tem layout.

---

## 1H. TODAS AS API ROUTES (17)

| # | Rota | Metodo | Descricao |
|---|------|--------|-----------|
| 1 | /api/auth/register | POST | Registro de usuario |
| 2 | /api/auth/reset-child-password | POST | Reset senha crianca |
| 3 | /api/contato | POST | Formulario de contato |
| 4 | /api/health | GET | Health check |
| 5 | /api/leads | POST | Captura de leads |
| 6 | /api/prospeccao/buscar | POST | Buscar academias (Google Places) |
| 7 | /api/prospeccao/enriquecer | POST | Enriquecer dados (Claude AI) |
| 8 | /api/prospeccao/mensagem | POST | Gerar mensagem prospeccao |
| 9 | /api/telemetry | POST | Telemetria |
| 10 | /api/v1/attendance | GET/POST | Presenca (API publica) |
| 11 | /api/v1/classes | GET | Turmas (API publica) |
| 12 | /api/v1/events | GET | Eventos (API publica) |
| 13 | /api/v1/invoices | GET | Faturas (API publica) |
| 14 | /api/v1/plans | GET | Planos (API publica) |
| 15 | /api/v1/students | GET | Alunos (API publica) |
| 16 | /api/webhooks/payment | POST | Webhook pagamento (Asaas) |
| 17 | /api/webhooks/whatsapp | POST | Webhook WhatsApp |

---

## 1I. TODOS OS HOOKS CUSTOMIZADOS (13)

| # | Hook | Descricao |
|---|------|-----------|
| 1 | useActiveAcademy.ts | ID da academia ativa |
| 2 | useAuth.ts | Autenticacao |
| 3 | useCart.ts | Carrinho de compras |
| 4 | useChartTheme.ts | Tema dos graficos |
| 5 | useCountUp.ts | Animacao de contagem |
| 6 | useDashboardLayout.ts | Layout dashboard |
| 7 | useProductTour.ts | Tour do produto |
| 8 | useScrollReveal.ts | Animacao scroll |
| 9 | useServiceData.ts | Fetch generico de services |
| 10 | useSignedVideoUrl.ts | URL assinada para video |
| 11 | useStudentId.ts | ID do aluno logado |
| 12 | useToast.ts | Notificacoes toast |
| 13 | useTutorial.ts | Sistema de tutorial |

---

## 1J. TODAS AS INTEGRACOES EXTERNAS

| # | Integracao | Status | Arquivos |
|---|-----------|--------|----------|
| 1 | **Supabase** (Auth + DB + Storage + Realtime) | ✅ Real | lib/supabase/client.ts, admin.ts, 23 services |
| 2 | **Google Places API** | ✅ Real | lib/integrations/google-places.ts (362 linhas), app/api/prospeccao/ |
| 3 | **Claude AI (Anthropic)** | ✅ Real | lib/integrations/claude-analysis.ts (361 linhas) |
| 4 | **Asaas** (gateway pagamento) | ⚠️ Parcial | lib/api/gateways/asaas.gateway.ts (119 linhas), webhook configurado |
| 5 | **WhatsApp** (Z-API ou similar) | ⚠️ Parcial | .env tem WHATSAPP_API_KEY/URL/INSTANCE, webhook configurado |
| 6 | **PostHog** (analytics) | ⚠️ Config existe | .env tem NEXT_PUBLIC_POSTHOG_KEY |
| 7 | **Sentry** (error tracking) | ⚠️ Config existe | .env tem SENTRY_DSN, 2 refs no codigo |
| 8 | **Resend** (email) | ⚠️ Config existe | .env tem RESEND_API_KEY, 17 email templates |
| 9 | **Stripe** (pagamento alt) | ⚠️ Config existe | .env tem STRIPE_SECRET_KEY |
| 10 | **APNs / FCM** (push) | ⚠️ Config existe | .env tem APNS/FCM keys, edge function send-push |
| 11 | **Capacitor** (mobile) | ⚠️ Configurado | capacitor.config.ts existe |
| 12 | **PWA** | ⚠️ Parcial | manifest.json + sw.js existem, InstallPrompt nao usado |
| 13 | **Twilio** | ❌ Nao encontrado | Nenhuma referencia no codigo |
| 14 | **Zapier** | ⚠️ Mock only | zapier.service.ts existe mas mock only |

---

# FASE 2 — INVENTARIO FUNCIONAL

---

## SUPER ADMIN

| # | Funcionalidade | Pagina | Status | Supabase | Observacao |
|---|----------------|--------|--------|----------|------------|
| 1 | Ver dashboard (MRR, academias, churn) | /superadmin | ✅ | mock | KPIs completos |
| 2 | Listar academias | /superadmin/academias | ⚠️ | mock | Lista com TODO |
| 3 | Criar academia manual | /superadmin/academias | ⚠️ | mock | Formulario existe mas TODO |
| 4 | Gerar link de cadastro | /superadmin/academias | ⚠️ | mock | Funcao existe mas TODO |
| 5 | Dar ciencia de nova academia | /superadmin | ✅ | mock | Card acknowledgement |
| 6 | Buscar academias (prospeccao) | /superadmin/prospeccao | ✅ | supabase | Google Places + Claude AI real |
| 7 | Pipeline CRM | /superadmin/pipeline | ⚠️ | mock | Pipeline completo mas TODO |
| 8 | Enviar WhatsApp de prospeccao | /superadmin/prospeccao | ⚠️ | mock | UI existe mas TODO |
| 9 | Ver suporte (sessoes ao vivo) | /superadmin/suporte | ⚠️ | mock | Grande (1832 linhas) mas TODO |
| 10 | Ver erros do app | /superadmin/suporte | ⚠️ | mock | Tab de erros |
| 11 | Ver performance (Web Vitals) | /superadmin/suporte | ⚠️ | mock | Tab performance |
| 12 | Ver dispositivos dos usuarios | /superadmin/suporte | ⚠️ | mock | Tab dispositivos |
| 13 | Gerenciar tickets | /superadmin/suporte | ⚠️ | mock | Tab tickets |
| 14 | Ver engajamento (DAU/WAU) | /superadmin/analytics | ✅ | mock | Analytics |
| 15 | Gerenciar planos/precos | /superadmin/planos | ✅ | mock | CRUD planos |
| 16 | Gerenciar feature flags | /superadmin/features | ⚠️ | mock | UI com TODO |
| 17 | Ver receita (MRR/ARR) | /superadmin/receita | ✅ | mock | Graficos receita |
| 18 | Aprovar campeonatos | /superadmin/compete | ⚠️ | mock | UI com TODO |
| 19 | Ver storage global | /superadmin | ✅ | mock | Card storage |
| 20 | Impersonar academia | /superadmin | ⚠️ | mock | Service existe mas nao integrado |

## ADMIN DA ACADEMIA

| # | Funcionalidade | Pagina | Status | Supabase | PlanGate |
|---|----------------|--------|--------|----------|----------|
| 1 | Ver dashboard (KPIs) | /admin | ✅ | supabase+mock | core |
| 2 | Criar turma | /admin/turmas | ⚠️ | mock | core |
| 3 | Editar turma | /admin/turmas | ⚠️ | mock | core |
| 4 | Excluir turma | /admin/turmas | ⚠️ | mock | core |
| 5 | Cadastrar aluno | /admin/alunos | ⚠️ | mock | core |
| 6 | Editar aluno | /admin/alunos | ⚠️ | mock | core |
| 7 | Ver aluno detalhado | /admin/alunos/[id] | ✅ | mock | core |
| 8 | Gerar convite (link) | /admin/convites | ⚠️ | mock | pro |
| 9 | Ver financeiro | /admin/financeiro | ⚠️ | mock | essencial |
| 10 | Enviar cobranca WhatsApp | /admin/whatsapp | ⚠️ | mock | pro |
| 11 | Config automacoes WhatsApp | /admin/whatsapp | ⚠️ | mock | pro |
| 12 | Editar landing page | /admin/site | ⚠️ | mock | pro |
| 13 | Ver alunos em risco (churn) | /admin/retencao | ✅ | supabase | blackbelt |
| 14 | Coord pedagog | /admin/pedagogico | ⚠️ | mock | blackbelt |
| 15 | Criar campeonato | /admin/campeonatos | ⚠️ | mock | blackbelt |
| 16 | Ver/gerar relatorios | /admin/relatorios | ✅ | mock | pro |
| 17 | Gerenciar graduacoes | /admin/graduacoes | ✅ | mock | essencial |
| 18 | Ver/gerenciar conteudo | /admin/conteudo | ✅ | mock | pro |
| 19 | Config pagamento | /admin/config/pagamento | ⚠️ | mock | blackbelt |
| 20 | Ver meu plano | /admin/plano | ⚠️ | mock | core |
| 21 | Configuracoes gerais | /admin/configuracoes | ⚠️ | mock | core |
| 22 | Acoes em massa | /admin/alunos | ❌ | — | — |
| 23 | Exportar CSV | varios | ⚠️ | — | — |
| 24 | Busca global (Ctrl+K) | header | ❌ | — | — |

## PROFESSOR

| # | Funcionalidade | Pagina | Status | Supabase |
|---|----------------|--------|--------|----------|
| 1 | Ver dashboard | /professor | ⚠️ | mock |
| 2 | Ver turmas | /professor/turmas | ✅ | mock |
| 3 | Modo aula (QR, timer) | /turma-ativa | ✅ | supabase |
| 4 | Marcar presenca | /turma-ativa | ✅ | supabase |
| 5 | Avaliar aluno (radar) | /avaliar/[id] | ⚠️ | mock |
| 6 | Upload video | /professor/conteudo | ⚠️ | mock |
| 7 | Criar serie videos | /professor/conteudo | ⚠️ | mock |
| 8 | Ver duvidas pendentes | /professor/duvidas | ⚠️ | mock |
| 9 | Responder duvida | /professor/duvidas | ⚠️ | mock |
| 10 | Diario de aula | /professor/diario | ⚠️ | mock |
| 11 | Plano de aula | /professor/plano-aula | ✅ | supabase |
| 12 | Banco de tecnicas | /professor/tecnicas | ⚠️ | mock |
| 13 | Mensagens | /professor/mensagens | ⚠️ | mock |
| 14 | Registrar ocorrencia | /professor/alunos | ⚠️ | mock |
| 15 | Configuracoes | /professor/configuracoes | ⚠️ | mock |
| 16 | Gravar aula (video) | /turma-ativa/gravar | ✅ | mock |

## ALUNO ADULTO

| # | Funcionalidade | Pagina | Status | Supabase |
|---|----------------|--------|--------|----------|
| 1 | Ver dashboard (faixa, streak) | /dashboard | ✅ | supabase |
| 2 | Fazer check-in (QR) | /dashboard/checkin | ✅ | supabase |
| 3 | Ver turmas/horarios | /dashboard/turmas | ✅ | mock |
| 4 | Ver progresso de faixa | /dashboard/progresso | ✅ | mock |
| 5 | Ver conquistas/badges | /dashboard/conquistas | ✅ | mock |
| 6 | Assistir video | /dashboard/conteudo/[id] | ⚠️ | mock |
| 7 | Curtir video | /dashboard/conteudo/[id] | ⚠️ | mock |
| 8 | Comentar video | /dashboard/conteudo/[id] | ⚠️ | mock |
| 9 | Postar duvida | /dashboard/conteudo/[id] | ⚠️ | mock |
| 10 | Salvar nota pessoal | /dashboard/conteudo/[id] | ⚠️ | mock |
| 11 | Avaliar video (estrelas) | /dashboard/conteudo/[id] | ⚠️ | mock |
| 12 | Estudar modulo teorico | /academia | ✅ | mock |
| 13 | Fazer quiz | /academia/[id]/quiz | ✅ | mock |
| 14 | Ver certificado | /certificados | ✅ | mock |
| 15 | Buscar glossario | /academia/glossario | ⚠️ | mock |
| 16 | Ver perfil/carteirinha | /dashboard/perfil | ✅ | supabase |
| 17 | Configuracoes | /dashboard/configuracoes | ⚠️ | mock |
| 18 | Alterar senha | /dashboard/configuracoes | ⚠️ | mock |

## TEEN

| # | Funcionalidade | Status | Supabase |
|---|----------------|--------|----------|
| 1 | Dashboard gamificado (XP bar) | ✅ | mock |
| 2 | XP por acao | ✅ | mock |
| 3 | Ranking | ✅ | mock |
| 4 | Season pass | ✅ | mock |
| 5 | Desafios semanais | ✅ | mock |
| 6 | Perfil gamer | ✅ | mock |
| 7 | Academia teorica | ✅ | mock |
| 8 | Conquistas | ✅ | mock |
| 9 | Turmas | ✅ | mock |

## KIDS

| # | Funcionalidade | Status | Supabase |
|---|----------------|--------|----------|
| 1 | Dashboard ludico (estrelas) | ✅ | mock |
| 2 | Figurinhas/album | ✅ | mock |
| 3 | Minha faixa | ✅ | mock |
| 4 | Recompensas | ✅ | mock |
| 5 | Conteudo | ✅ | mock |
| 6 | Conquistas | ✅ | mock |
| 7 | Perfil | ✅ | mock |
| 8 | Academia | ⚠️ | mock |

## RESPONSAVEL

| # | Funcionalidade | Pagina | Status | Supabase |
|---|----------------|--------|--------|----------|
| 1 | Dashboard familiar | /parent | ✅ | mock |
| 2 | Seletor de filhos | /parent | ✅ | mock |
| 3 | Agenda familiar | /agenda | ✅ | mock |
| 4 | Chat com professor | /parent/mensagens | ⚠️ | mock |
| 5 | Pagamentos | /parent/pagamentos | ✅ | mock |
| 6 | Autorizacoes | /parent/autorizacoes | ✅ | mock |
| 7 | Relatorios | /parent/relatorios | ✅ | mock |
| 8 | Redefinir senha do filho | /parent/configuracoes | ⚠️ | mock |
| 9 | Presencas | /parent/presencas | ✅ | mock |
| 10 | Notificacoes | /parent/notificacoes | ✅ | mock |

## RECEPCIONISTA

| # | Funcionalidade | Pagina | Status | Supabase |
|---|----------------|--------|--------|----------|
| 1 | Dashboard do dia | /recepcao | ✅ | mock |
| 2 | Busca de aluno | /recepcao/atendimento | ⚠️ | mock |
| 3 | Cadastro rapido | /recepcao/cadastro | ⚠️ | mock |
| 4 | Caixa do dia | /recepcao/caixa | ⚠️ | mock |
| 5 | Experimentais | /recepcao/experimentais | ⚠️ | mock |
| 6 | Mensagens | /recepcao/mensagens | ⚠️ | mock |
| 7 | Controle acesso | /recepcao/acesso | ⚠️ | mock |

## FRANQUEADOR

| # | Funcionalidade | Pagina | Status | Supabase |
|---|----------------|--------|--------|----------|
| 1 | Dashboard da rede | /franqueador | ⚠️ | mock |
| 2 | Unidades | /franqueador/unidades | ⚠️ | mock |
| 3 | Royalties | /franqueador/royalties | ✅ | mock |
| 4 | Padroes/compliance | /franqueador/padroes | ⚠️ | mock |
| 5 | Expansao | /franqueador/expansao | ⚠️ | mock |
| 6 | Comunicacao | /franqueador/comunicacao | ⚠️ | mock |
| 7 | Curriculo | /franqueador/curriculo | ✅ | mock |

---

# FASE 3 — INVENTARIO DE FLUXOS

| # | Fluxo | Steps | Status | Observacao |
|---|-------|-------|--------|------------|
| 1 | Cadastro academia (link superadmin) | gerar link -> dono abre -> wizard -> ativa | ⚠️ | Link gerado em mock, cadastro real funciona parcial |
| 2 | Cadastro academia (manual superadmin) | preenche -> cria -> ativa | ⚠️ | UI existe, service mock |
| 3 | Convite aluno | admin gera -> aluno abre -> cadastra -> entra | ⚠️ | Tokens real, cadastro real, mas TODOs |
| 4 | Login email/senha | /login -> email -> senha -> dashboard | ✅ | Funciona com Supabase real |
| 5 | Login Google | /login -> Google -> callback -> dashboard | ⚠️ | OAuth configurado, callback existe |
| 6 | Login Apple | /login -> Apple -> callback -> dashboard | ⚠️ | OAuth configurado, callback existe |
| 7 | Esqueci senha | /login -> esqueci -> email -> link -> nova senha | ⚠️ | UI completa, Supabase real, mas TODOs |
| 8 | Selecao de perfil | login -> multiplos perfis -> seleciona -> dashboard | ✅ | Funciona com Supabase real |
| 9 | Tutorial primeiro acesso | login -> boas-vindas -> tutorial steps -> completa | ⚠️ | TutorialProvider existe mas pouco integrado (1 pagina) |
| 10 | Check-in por QR | professor gera QR -> aluno escaneia -> presenca | ✅ | Supabase real, edge function |
| 11 | Avaliacao de aluno | professor seleciona -> radar -> salva | ⚠️ | UI existe, Supabase parcial |
| 12 | Graduacao | aluno pronto -> professor aprova -> admin confirma | ⚠️ | UI existe, edge function existe, fluxo completo mock |
| 13 | Upload de video | professor grava -> upload -> categoriza -> publica | ⚠️ | VideoUploader componente, service mock |
| 14 | Assistir video | aluno abre -> player -> comenta -> curte -> nota | ⚠️ | Player existe, interacoes mock |
| 15 | Quiz teorico | aluno abre modulo -> licoes -> quiz -> certificado | ✅ | Fluxo completo (mock data) |
| 16 | Cobranca WhatsApp | admin seleciona template -> aluno -> envia | ⚠️ | UI grande (1545 linhas) mas mock, service tem Supabase |
| 17 | Inscricao campeonato | atleta abre /compete -> inscreve -> paga -> confirma | ⚠️ | Compete real (Supabase), inscricao TODO |
| 18 | Campeonato ao vivo | organizer gera bracket -> resultados -> ao vivo | ✅ | Compete Supabase real, live scoreboard |
| 19 | Landing page publica | /g/[slug] -> formulario -> lead criado | ⚠️ | Landing page Supabase, formulario TODO |
| 20 | Prospeccao | busca -> Google Places -> IA analisa -> CRM | ✅ | Real: Google Places + Claude AI + Supabase |
| 21 | Bloqueio por plano | acessa modulo premium -> PlanGate -> upgrade | ⚠️ | ModuleGate/UpgradeModal existem, pouco integrados (8 usos) |
| 22 | Trial -> Discovery -> Ativo | 7 dias -> 90 dias -> bloqueio real | ❌ | Nao implementado end-to-end |
| 23 | Exportar CSV | admin lista -> exportar -> download CSV | ⚠️ | lib/reports/export.ts existe, poucas paginas integram |
| 24 | Busca global | Ctrl+K -> digita -> resultado -> navega | ❌ | CommandPalette componente existe mas 0 usos |

---

# FASE 4 — INVENTARIO DE UX

| # | Elemento | Existe | Consistente | Observacao |
|---|---------|--------|-------------|------------|
| 1 | Skeleton loading | ✅ 112/265 paginas | ⚠️ | 42% das paginas |
| 2 | EmptyState em listas | ⚠️ 9 paginas | ❌ | Muito baixo, maioria das listas sem empty state |
| 3 | Toast em acoes CRUD | ⚠️ 121 paginas | ⚠️ | 45% das paginas, nao universal |
| 4 | Erros em portugues | ⚠️ | ⚠️ | ServiceError existe, nao todas as paginas usam |
| 5 | Filtros nas listas | ✅ 150 paginas | ✅ | Maioria das listas tem filtro/busca |
| 6 | Exportar CSV/PDF | ⚠️ 24 refs | ❌ | Existe lib/reports/export.ts, poucos integrados |
| 7 | Acoes em massa (BulkActionBar) | ⚠️ componente existe | ❌ | Componente criado, quase nao usado |
| 8 | Busca global (Ctrl+K) | ❌ | ❌ | CommandPalette existe, 0 integracoes |
| 9 | Checklist primeiros passos | ⚠️ | ❌ | OnboardingWizard existe, integracao fraca |
| 10 | Tutorial primeiro acesso | ⚠️ | ❌ | TutorialProvider + TutorialFAB existem, 1 pagina usa |
| 11 | Boas-vindas personalizada | ⚠️ | ❌ | WelcomeMessage componente, 1 uso |
| 12 | Refazer tutorial | ⚠️ | ⚠️ | TutorialSettings componente existe |
| 13 | Suporte (FAQ + ticket) | ⚠️ | ❌ | SupportWidget existe, 0 integracoes |
| 14 | Acessibilidade (aria-labels) | ⚠️ 65 arquivos | ❌ | ~25% dos componentes, inconsistente |
| 15 | Responsividade 320px | ✅ 157 paginas | ⚠️ | 59% com classes responsive (md:/lg:/sm:) |
| 16 | Dark mode | ❌ | ❌ | 0 paginas com classes dark: |
| 17 | Animacoes de entrada | ✅ 198 paginas | ✅ | 75% das paginas com animacoes |
| 18 | PlanGate (bloqueio por plano) | ⚠️ | ❌ | ModuleGate + UpgradeModal existem, 8 usos |
| 19 | Banner trial/discovery | ⚠️ | ❌ | DiscoveryBanner componente existe, 0 usos |
| 20 | Acoes rapidas no dashboard | ⚠️ | ❌ | QuickActions componente existe, 0 usos |

---

# FASE 5 — GAP ANALYSIS

---

## LISTA A — BUGS E PROBLEMAS

| # | Problema | Onde | Severidade | Como Corrigir |
|---|---------|------|-----------|---------------|
| 1 | ErrorBoundary nunca usado — erros nao tratados crasham a pagina | Todas as paginas | **Alta** | Adicionar ErrorBoundary no root layout e shells |
| 2 | Dark mode inexistente apesar de ThemeToggle existir | Global | Media | Implementar variantes dark: em todas as classes |
| 3 | OfflineBanner nunca integrado — sem feedback offline | Global | Media | Integrar no root layout |
| 4 | CookieBanner nunca integrado — potencial nao-compliance LGPD | Global | **Alta** | Integrar no root layout |
| 5 | EmptyState em apenas 9 paginas — listas vazias sem feedback | Listas | Media | Adicionar EmptyState em todas as listas |
| 6 | CommandPalette criado mas nunca integrado — Ctrl+K nao funciona | Global | Baixa | Integrar no AdminShell/root |
| 7 | SupportWidget criado mas nunca integrado | Global | Baixa | Integrar nos shells |
| 8 | PlanGate/ModuleGate com apenas 8 usos — modulos premium acessiveis | Modulos premium | **Alta** | Integrar em todos os modulos pro/blackbelt |
| 9 | DiscoveryBanner com 0 usos — trial/discovery nao comunica | Admin | Media | Integrar no AdminShell |
| 10 | WelcomeMessage com 1 uso — onboarding fraco | Primeiro login | Media | Integrar em todos os dashboards |
| 11 | QuickActions com 0 usos — feature criada e nunca integrada | Dashboards | Baixa | Integrar nos dashboards |
| 12 | TutorialProvider com 1 uso — tutorial quase inexistente | Global | Media | Integrar em todos os shells |
| 13 | i18n configurado (3 idiomas) mas useTranslations nao usado | Global | Baixa | Strings hardcoded em PT-BR |
| 14 | InstallPrompt PWA com apenas 1 uso | Mobile | Media | Integrar no root layout |
| 15 | aluno.service.ts tem TODO em codigo real | lib/api | Media | Completar implementacao |
| 16 | plano-aula.service.ts tem TODO em codigo real | lib/api | Media | Completar implementacao |

## LISTA B — FUNCIONALIDADES INCOMPLETAS

| # | Funcionalidade | O que Existe | O que Falta | Esforco |
|---|----------------|-------------|-------------|---------|
| 1 | **Auth completo** | Login, OAuth, cadastro, esqueci senha com Supabase | Reset senha do filho real, MFA | Medio |
| 2 | **Dashboard Admin** | KPIs reais com Supabase + charts | CRUD de turmas/alunos ainda mock | Medio |
| 3 | **Turmas** | Service com Supabase real, UI com TODO | CRUD completo na UI | Medio |
| 4 | **Alunos** | Service com Supabase parcial, UI com TODO | CRUD na UI, busca avancada | Medio |
| 5 | **Financeiro** | Service com Supabase real | Geracao PDF, envio email, reconciliacao | Alto |
| 6 | **WhatsApp** | UI completa (1545 linhas), Supabase real | Integracao Z-API real, automacoes | Alto |
| 7 | **Compete/Torneios** | 57 funcoes, Supabase real, live scoreboard | Inscricao online, pagamento | Medio |
| 8 | **Landing Pages** | Config Supabase real, builder | Publicacao real, analytics | Medio |
| 9 | **Conteudo/Videos** | Upload componente, player | Storage real, CDN, transcoding | Alto |
| 10 | **Pedagogico** | UI extensa (1371 linhas) | Service mock only | Alto |
| 11 | **Recepcao** | Dashboard ok, 6 sub-paginas | Todas as sub-paginas mock/TODO | Medio |
| 12 | **Franqueador** | 7 paginas, layout funcional | Todas mock, KPIs nao reais | Alto |
| 13 | **Pagamentos** | Gateway Asaas (119 linhas), webhook | Cobranca automatica real, retry | Alto |
| 14 | **Push Notifications** | Edge function send-push, tokens | Integracao real com APNs/FCM | Medio |
| 15 | **Exportacao** | lib/reports/export.ts | Integracao em todas as listas | Baixo |
| 16 | **NPS** | UI completa | Service mock only, envio real | Medio |
| 17 | **Graduacoes** | UI completa, edge function | Fluxo end-to-end real | Medio |
| 18 | **Check-in** | QR real com Supabase | Proximity check (BLE) nao real | Medio |
| 19 | **Campanhas Marketing** | UI existe (371 linhas) | Service mock, envio real | Alto |

## LISTA C — FUNCIONALIDADES QUE NAO EXISTEM

| # | Funcionalidade | Por que Precisa | Qual Perfil | Esforco | Prioridade |
|---|----------------|----------------|-------------|---------|-----------|
| 1 | **Backup/export de dados** | LGPD exige portabilidade | Admin | Medio | **Alta** |
| 2 | **Exclusao de conta (LGPD)** | LGPD Art. 18 | Todos | Medio | **Alta** |
| 3 | **Rate limiting** | Seguranca | API | Baixo | **Alta** |
| 4 | **CSRF protection** | Seguranca | API | Baixo | **Alta** |
| 5 | **Audit trail real** | Compliance | Admin | Medio | Alta |
| 6 | **Cobranca recorrente automatica** | Receita | Admin | Alto | **Alta** |
| 7 | **Nota fiscal (NFe)** | Obrigacao fiscal | Admin | Alto | Alta |
| 8 | **Multi-tenancy real** | Producao | Admin | Alto | **Alta** |
| 9 | **Fila de jobs** | Escalabilidade | Sistema | Alto | Alta |
| 10 | **CDN para videos** | Performance | Sistema | Medio | Alta |
| 11 | **Testes E2E** | Qualidade | Dev | Alto | Alta |
| 12 | **Monitoring/alerting** | Operacao | DevOps | Medio | Alta |
| 13 | **CI/CD completo** | Deployment | DevOps | Medio | Media |
| 14 | **Blue/green deployment** | Zero downtime | DevOps | Alto | Media |
| 15 | **Webhook retry logic** | Confiabilidade | Sistema | Medio | Media |
| 16 | **Email transacional real** | Comunicacao | Todos | Medio | Alta |
| 17 | **Relatorios PDF** | Gestao | Admin | Medio | Media |
| 18 | **Dashboard real-time** | UX | Admin | Medio | Media |
| 19 | **Multi-idioma real** | Internacionalizacao | Todos | Alto | Baixa |
| 20 | **Accessibilidade WCAG 2.1** | Inclusao/legal | Todos | Alto | Media |
| 21 | **Performance budget** | UX | Sistema | Baixo | Media |
| 22 | **A/B testing** | Growth | SuperAdmin | Medio | Baixa |
| 23 | **Network layout/shell** | Multi-unidade | Network | Baixo | Baixa |

---

# FASE 6 — RELATORIO FINAL

---

## RESUMO NUMERICO

| Categoria | Total | Funciona ✅ | Parcial ⚠️ | Nao funciona ❌ |
|-----------|-------|------------|------------|----------------|
| Paginas | 265 | 140 (52,8%) | 120 (45,3%) | 5 (1,9%) |
| Services | 217 | 23 (10,6%) com Supabase | 194 (89,4%) mock only | 0 |
| Funcoes exportadas | 1.855 | ~200 reais | ~1.655 mock | — |
| Tabelas Supabase | 97 | — | — | — |
| Migracoes | 34 | 34 | — | — |
| Componentes | 99 | ~60 usados | ~25 pouco usados | ~14 nunca usados |
| API Routes | 17 | 17 | — | — |
| Hooks | 13 | 13 | — | — |
| Shells | 8 | 8 | — | — |
| Edge Functions | 11 | ~4 reais | ~7 stub | — |
| Testes | 12 | 12 | — | — |
| Fluxos E2E | 24 | 5 (20,8%) | 17 (70,8%) | 2 (8,3%) |
| Elementos UX | 20 | 4 (20%) | 10 (50%) | 6 (30%) |

---

## SCORES DE PRONTIDAO

### Prontidao para DEMO: 7/10

**Motivo:** A UI e impressionante em amplitude (265 paginas, 10 perfis). Em modo mock, o app funciona bem para demonstracoes. Charts, animacoes, multi-perfil, shells — tudo visualmente completo. O demo precisa apenas garantir que nao cliquem em botoes de CRUD real.

### Prontidao para PRODUCAO: 3/10

**Motivo:** Apenas 23 de 217 services conectam ao Supabase real (10,6%). Fluxos criticos como CRUD de alunos/turmas, financeiro, video upload, e WhatsApp estao em mock. Auth e check-in funcionam real. Sem LGPD compliance (backup, exclusao, cookie consent), sem rate limiting, sem error boundary. Financeiro sem cobranca automatica real.

### Prontidao para ESCALA (20+ academias): 2/10

**Motivo:** Sem multi-tenancy validado em producao, sem monitoring, sem CI/CD completo, sem testes E2E, sem CDN, sem fila de jobs, sem backup automatizado. A base de dados (97 tabelas, 469 RLS policies, 244 indexes) e solida, mas nunca foi testada sob carga real.

---

## RECOMENDACOES DE PRIORIDADE

### FAZER AGORA (antes de mostrar para clientes reais)

1. **ErrorBoundary no root layout** — crashes nao tratados
2. **CookieBanner integracao** — LGPD compliance
3. **CRUD alunos/turmas real** — fluxo basico da academia (admin.service, turmas.service ja tem Supabase)
4. **Financeiro basico real** — listar faturas, gerar cobranca (financeiro.service ja tem Supabase)
5. **PlanGate em todos os modulos premium** — monetizacao desde dia 1
6. **EmptyState em todas as listas** — UX basica
7. **ErrorBoundary + erro em portugues** — tratamento de erros

### FAZER NO PRIMEIRO MES

1. **WhatsApp real** — integracao Z-API (service ja tem Supabase)
2. **Video upload real** — Supabase Storage
3. **Landing page publicacao real** — ja tem builder
4. **Cobranca automatica** — Asaas gateway ja existe
5. **Email transacional** — Resend configurado, templates existem
6. **Tutorial first-access** — TutorialProvider ja existe
7. **Push notifications reais** — edge function existe
8. **Exportar CSV funcional** — lib/reports/export.ts existe

### FAZER NO PRIMEIRO TRIMESTRE

1. **Pedagogico real** — UI extensa pronta
2. **Recepcao completa** — 6 paginas mock
3. **Campeonatos completo** — compete ja e real
4. **Franqueador real** — 7 paginas mock
5. **NPS real** — UI pronta
6. **Audit trail real** — tabela e service existem
7. **Busca global (Ctrl+K)** — CommandPalette ja criado
8. **Testes E2E** — pelo menos fluxos criticos
9. **Dark mode** — ThemeToggle ja existe
10. **i18n real** — 3 idiomas ja traduzidos

### FAZER QUANDO ESCALAR (20+ academias)

1. **CDN para videos** — performance
2. **Fila de jobs** — processamento assincrono
3. **Blue/green deployment** — zero downtime
4. **A/B testing** — growth
5. **Network/multi-unidade** — apenas 1 pagina stub
6. **IoT/beacons reais** — hardware integration
7. **Marketplace real** — pagamento entre academias
8. **API publica v2** — SDK e webhooks outgoing
9. **Accessibilidade WCAG 2.1** — compliance
10. **Multi-idioma real** — expansao internacional

---

## MAPA DE DEPENDENCIAS PARA PRODUCAO

```
CAMADA 1 (semana 1-2): Auth ✅ → CRUD Alunos → CRUD Turmas → Presenca ✅
CAMADA 2 (semana 3-4): Financeiro Real → Cobranca → WhatsApp Real
CAMADA 3 (mes 2):      Video Upload → Conteudo Real → Pedagogico
CAMADA 4 (mes 3):      Campeonatos → Landing Pages → NPS → Campanhas
CAMADA 5 (trimestre 2): Franqueador → Recepcao → Network → Marketplace
```

---

## NOTA FINAL

O projeto BlackBelt v2 e impressionante em amplitude: **265 paginas, 217 services, 97 tabelas, 99 componentes, 10 perfis de usuario**. A arquitetura esta bem pensada (isMock bifurcation, RLS, multi-tenant design). O principal gap e a conversao de mock para Supabase real — 89,4% dos services sao mock-only. A UI esta muito avancada, com animacoes, charts, e layouts responsivos. O caminho para producao e claro: converter services de mock para real, começando pelos fluxos criticos (CRUD basico, financeiro, comunicacao).

**Linha de resumo:** UI 8/10 | Backend 3/10 | Infra 2/10 | DevOps 2/10 | Seguranca 3/10

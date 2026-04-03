# BLACKBELT v2 — PROMPT MONSTRO: CORRIGIR TODOS OS 304 ITENS PENDENTES
## De 51% Para 95%+ De Cobertura De Usabilidade

> A auditoria encontrou 514 ✅, 127 ⚠️, 177 ❌ de 1012 checkboxes.
> Este prompt corrige TODOS os ⚠️ e ❌.
>
> REGRAS:
> - Execute BLOCO a BLOCO (1→2→3→...→10)
> - Commit + push ao final de CADA bloco
> - Build DEVE passar entre commits
> - Cada service: padrão isMock() + mock realista + handleServiceError
> - Cada página: skeleton loading, ThemeContext, mobile-first, empty state
> - Cada form: validação, onSubmit funcional, loading state, toast feedback
> - Cada botão: handler real (nunca vazio)
> - Cada modal: abre, fecha (X/overlay/ESC), ações funcionam
> - Cada tabela: busca, filtro, paginação (se 20+ itens), empty state
> - NUNCA use 'any'. NUNCA delete mock blocks. NUNCA hardcode cores.

---

═══════════════════════════════════════════════════════════════
BLOCO 1 — RECEPCIONISTA: De 37% Para 90%+ (PRIORIDADE MÁXIMA)
═══════════════════════════════════════════════════════════════

A recepcionista é a PRIMEIRA pessoa que o dono testa quando avalia o software.
Se não funciona bem, ele cancela.

### 1.0 Verificar estado atual

```bash
echo "=== RECEPCIONISTA ==="
find app/ -path "*recepcao*page.tsx" | sort
find lib/api/ -name "*recepcao*" | sort
grep -n "href=" components/shell/RecepcaoShell.tsx 2>/dev/null | head -20
```

### 1.1 Dashboard (/recepcao) — COMPLETAR

O dashboard da recepcionista precisa ser o mais RÁPIDO do app.
Ela abre e em 1 segundo sabe tudo que importa.

```
Verificar app/(recepcao)/recepcao/page.tsx

SE NÃO TEM ou está incompleto, implementar:

Service: lib/api/recepcao-dashboard.service.ts
- getResumoHoje() → {
    aulaAtual: { turma, professor, presentes, capacidade, sala, horarioFim } | null,
    proximasAulas: { turma, horario, professor, sala, matriculados }[],
    checkinsHoje: { nome, avatar, faixa, hora, turma }[],
    aniversariantes: { nome, data }[],
    alertas: { tipo: 'inadimplente_presente'|'experimental'|'vencimento', texto, alunoNome }[],
    totalDentro: number,
    capacidadeMax: number
  }

Mock: 1 aula em andamento (BJJ Adulto, Prof André, 18/25 presentes, Tatame 1),
3 próximas aulas, 8 check-ins hoje, 2 aniversariantes, 3 alertas
(1 inadimplente chegou, 1 experimental 14h, 1 mensalidade vence amanhã).

Página:
- SEÇÃO "Agora": card destaque com aula em andamento (turma, professor, X/Y presentes, timer)
- SEÇÃO "Hoje": timeline vertical das próximas aulas com horário, turma, professor
- SEÇÃO "Últimos check-ins": lista com avatar, nome, faixa, horário (últimas 2h)
- SEÇÃO "Atenção": cards de alerta (inadimplente em vermelho, experimental em azul, vencimento em amarelo)
- SEÇÃO "Aniversariantes": nomes + "🎂 Parabéns!"
- HEADER: relógio atual + "Lotação: X/Y" com barra de ocupação
```

### 1.2 Check-in (/recepcao/checkin) — COMPLETAR

```
Verificar se existe. SE incompleto:

Service: lib/api/recepcao-checkin.service.ts
- buscarAluno(query: string) → { id, nome, avatar, faixa, turma, statusFinanceiro, ultimoTreino }[]
- registrarEntrada(alunoId) → { success, message }
- registrarSaida(alunoId) → { success }
- getDentroAgora() → { nome, avatar, faixa, horaEntrada, turma }[]
- registrarVisitante(nome, motivo) → { success }

Mock: 5 resultados de busca, 12 pessoas dentro agora

Página:
- INPUT de busca com FOCO AUTOMÁTICO (useRef + focus no mount)
  Autocomplete: ao digitar 2+ chars, lista aparece
- Ao selecionar aluno: card mostra foto, nome, faixa
  Se em dia: badge verde "Em dia ✅"
  Se atrasado: badge vermelho "Atrasado X dias ⚠️" + aviso
  Botão "Registrar Entrada" (grande, verde, 1 clique)
- LISTA "Dentro agora": tabela com avatar, nome, faixa, hora entrada
  Botão "Registrar Saída" por pessoa
- Barra de capacidade: X/Y com % (verde < 70%, amarelo 70-90%, vermelho > 90%)
- Botão "Registrar Visitante" → modal simples (nome + motivo)
```

### 1.3 Matrículas (/recepcao/cadastro ou /recepcao/matriculas) — COMPLETAR

```
Service: lib/api/recepcao-matriculas.service.ts
- criarMatricula(dados) → { success, alunoId }
- getMatriculasRecentes(limit) → Matricula[]
- getMatriculasPendentes() → Matricula[]

Mock: 3 matrículas recentes, 2 pendentes

Página:
- Botão "Nova Matrícula" → formulário multi-step:
  Step 1: Dados pessoais (nome*, email*, telefone*, CPF, nascimento*)
  Step 2: Endereço (rua, número, bairro, cidade, CEP)
  Step 3: Academia (modalidade*, turma*, plano pagamento)
  Step 4: Documentos (upload RG, atestado médico — opcionais)
  Step 5: Se menor 18: dados responsável + checkbox consentimento parental
  Step 6: Contrato (texto do contrato + checkbox "Li e aceito")
  Botão "Finalizar" → toast "Matrícula realizada!"

  * = campo obrigatório com validação

- Aba "Recentes": lista de últimas matrículas
- Aba "Pendentes": matrículas faltando documento ou pagamento
- Progress indicator nos steps (1/6, 2/6, etc.)
- Botões "Próximo" e "Voltar" entre steps
```

### 1.4 Cobranças (/recepcao/cobrancas) — COMPLETAR

```
Service: lib/api/recepcao-cobrancas.service.ts
- getInadimplentes() → { nome, avatar, valor, diasAtraso, telefone, email }[]
- registrarPagamento(alunoId, valor, forma) → { success }
- getHistoricoPagamentos(alunoId) → Pagamento[]

Mock: 8 inadimplentes (2-45 dias de atraso), formas: dinheiro, pix, cartão, boleto

Página:
- TABELA de inadimplentes:
  Colunas: Avatar | Nome | Valor | Dias atraso | Ações
  Ordenada por dias de atraso (mais antigo primeiro)
  Badge de urgência: 1-7 dias (amarelo), 8-30 (laranja), 30+ (vermelho)
- AÇÕES por inadimplente:
  Botão "WhatsApp" → abre whatsapp://send?phone=NUMERO&text=TEMPLATE
    Template: "Olá {nome}! Sua mensalidade de R${valor} venceu há {dias} dias. Posso ajudar?"
  Botão "Registrar Pagamento" → modal:
    Valor (pré-preenchido), Forma (select: dinheiro/pix/cartão/boleto), Data
    Confirmar → toast "Pagamento de R$X registrado!"
  Botão "Ver Histórico" → modal com lista de pagamentos anteriores
- RESUMO no topo: Total inadimplente: R$ X.XXX,XX | X alunos
```

### 1.5 Experimentais (/recepcao/experimentais) — COMPLETAR

```
Service: lib/api/recepcao-experimental.service.ts
- getExperimentaisHoje() → Experimental[]
- agendarExperimental(dados) → { success, id }
- marcarChegou(id) → void
- marcarNaoVeio(id) → void
- marcarMatriculou(id) → void
- getFollowUpsPendentes() → Experimental[]
- getFunilConversao() → { agendadas, vieram, matricularam }

Mock: 2 experimentais hoje (1 agendada, 1 em aula), 3 follow-ups pendentes,
funil: 10 agendadas → 7 vieram → 3 matricularam (30%)

Página:
- SEÇÃO "Hoje": cards grandes para cada experimental:
  Nome | Telefone | Turma | Horário | Status
  Botões: [✅ Chegou!] [❌ Não veio] [📱 Ligar]
  Quando "Chegou": status → "Em aula", após aula: [🎉 Matricular!] [📅 Follow-up] [❌ Desistiu]
  "Matricular!" → redireciona para /recepcao/cadastro com dados pré-preenchidos

- SEÇÃO "Follow-ups pendentes":
  Lista: Nome | Dias desde experimental | Telefone
  Botões: [📱 Ligar] [📱 WhatsApp: "Oi {nome}, gostou da aula?"]

- SEÇÃO "Funil": 
  Barras visuais: Agendadas (10) → Vieram (7) → Matricularam (3)
  Taxa de conversão: 30%

- BOTÃO "Nova Experimental" → modal:
  Nome*, Telefone*, Email, Idade, Modalidade, Turma+Data+Horário,
  Origem (select: indicação/Instagram/Google/walk-in/outro), Observações
  "Agendar" → toast "Experimental agendada!"
```

### 1.6 Mensagens Rápidas (/recepcao/mensagens) — COMPLETAR

```
Service: lib/api/recepcao-mensagens.service.ts
- getTemplates(categoria?) → Template[]
- enviarWhatsApp(telefone, texto) → void (abre whatsapp://send)

Mock: 10 templates (2 cobrança, 2 confirmação, 2 lembrete, 2 follow-up, 1 boas-vindas, 1 saudades)

Página:
- BUSCA de aluno (autocomplete) → ao selecionar mostra nome + telefone
- GRID de templates por categoria (cards coloridos por tipo):
  💰 Cobrança | ✅ Confirmação | 🔔 Lembrete | 📞 Follow-up | 👋 Boas-vindas | 😢 Saudades
- Clicar em template → preview com variáveis substituídas ({nome}, {valor}, {data})
- Botão "Enviar WhatsApp" → window.open(whatsapp://send?phone=X&text=Y)
- HISTÓRICO de envios do dia (lista simples)
```

### 1.7 Agenda (/recepcao/agenda) — CRIAR SE NÃO EXISTE

```
Página simples:
- Calendário semanal (grade com dias × horários)
- Cada slot mostra: turma (cor por modalidade) + professor
- Experimentais agendadas em destaque (borda azul pontilhada)
- Eventos da academia
- Clicar em slot → detalhes
```

### 1.8 Acesso / Controle (/recepcao/acesso) — COMPLETAR SE EXISTE

```
Se a página já existe mas está parcial:
- Garantir que lista "Dentro agora" funciona
- Garantir que barra de ocupação calcula corretamente
- Garantir que "Registrar Entrada/Saída" funciona
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: recepcionista complete — checkin, matriculas, cobrancas, experimentais, mensagens, agenda"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 2 — PROFESSOR: De 49% Para 90%+ 
═══════════════════════════════════════════════════════════════

### 2.1 Verificar estado atual

```bash
echo "=== PROFESSOR ==="
find app/ -path "*professor*page.tsx" | sort
find lib/api/ -name "*professor*" -o -name "*avalia*" -o -name "*plano-aula*" | sort
grep -n "href=" components/shell/ProfessorShell.tsx 2>/dev/null | head -20
```

### 2.2 Modo Aula (/professor/presenca) — COMPLETAR

```
O modo aula é o KILLER FEATURE do professor. Ele abre no celular
durante a aula e faz a chamada enquanto ensina.

Verificar se existe. SE parcial:

Service: completar recepcao-checkin ou criar professor-presenca.service.ts
- getTurmasHoje() → { id, nome, horario, sala, alunos[] }[]
- getAlunosTurma(turmaId) → { id, nome, avatar, faixa }[]
- salvarPresenca(turmaId, data, presencas: { alunoId, presente, atrasado? }[]) → { success }
- getHistoricoPresenca(turmaId, mes?) → PresencaDia[]

Página — DOIS MODOS:

MODO 1 — Chamada simples:
- Selecionar turma → lista de alunos com toggle (presente/ausente)
- Botão "Salvar Presença" → toast

MODO 2 — Modo Aula (tela cheia mobile-otimizada):
- Timer da aula (cronômetro correndo, formato MM:SS)
- Nome da turma + sala + data
- Lista de alunos: GRANDE (um por linha, toque para marcar)
  ✅ Verde = presente | ❌ Vermelho = ausente | ⏰ Amarelo = atrasado
  Cada nome com avatar/iniciais + faixa (bolinha colorida)
  Toque = toggle presente/ausente
  Long press = marcar como atrasado
- Contadores: "15/18 presentes"
- Botão fixo no rodapé: "Finalizar Aula" → salvar tudo → toast "Aula finalizada! 15 presentes."
- Botão "Aluno não matriculado presente" → campo nome (para visitante/experimental)

TELA DE SELEÇÃO DE TURMA:
- Cards com turma de hoje (próxima aula em destaque)
- Se só tem 1 turma no horário: ir direto para ela
```

### 2.3 Avaliações (/professor/avaliacoes) — COMPLETAR

```
Service: lib/api/professor-avaliacoes.service.ts (ou avaliacoes.service.ts)
- criarAvaliacao(dados) → { success }
- getAvaliacoes(filtros?) → Avaliacao[]
- getAvaliacoesAluno(alunoId) → Avaliacao[]

Mock: 10 avaliações de alunos variados

Página:
- LISTA de avaliações feitas (tabela: Aluno | Data | Nota | Pronto graduar?)
- Filtrar por turma / por aluno / por data
- Botão "Nova Avaliação" → form:
  - Selecionar aluno (autocomplete dos alunos das suas turmas)
  - Critérios (1-5 estrelas cada):
    □ Técnica em pé
    □ Técnica no chão (guarda, passagem, finalização)
    □ Defesa e escapatória
    □ Condicionamento físico
    □ Conhecimento teórico (regras, posições)
    □ Comportamento e disciplina
    □ Evolução desde última avaliação
  - Nota geral (calculada automaticamente = média dos critérios)
  - Observações (textarea)
  - Toggle "Pronto para graduar?" 
  - Botão "Salvar" → toast

- Clicar em avaliação → ver detalhes em modal
- Radar chart (Recharts) mostrando os 7 critérios do aluno
```

### 2.4 Planos de Aula (/professor/planos-aula) — COMPLETAR

```
Service: lib/api/professor-planos-aula.service.ts
- criarPlano(dados) → { success, id }
- getPlanos(filtros?) → PlanoAula[]
- getPlano(id) → PlanoAula
- editarPlano(id, dados) → { success }
- duplicarPlano(id) → { success, novoId }

Mock: 5 planos variados (BJJ, Judô, técnicas diferentes)

Página:
- LISTA de planos (cards: Título | Turma | Data | Status)
- Filtrar por turma / por data
- Botão "Novo Plano" → form:
  - Título* (ex: "Passagem de guarda - Semana 3")
  - Turma(s)* (multi-select)
  - Data de aplicação (date picker)
  - SEÇÕES do plano:
    - Aquecimento (textarea — ex: "Corrida 5min, ginástica natural, puxada")
    - Técnica principal (textarea — ex: "Passagem de guarda toreando")
    - Detalhe técnico (textarea — passo a passo)
    - Drills / exercícios (textarea — "Repetição em dupla 5x cada lado")
    - Sparring / Randori (textarea — "Randori 5min, foco em guarda")
    - Volta à calma (textarea — "Alongamento, roda de conversa")
  - Observações
  - Botão "Salvar" → toast

- Clicar em plano → ver detalhes (visualização limpa tipo "plano de aula impresso")
- Botão "Duplicar" → cria cópia com "(Cópia)" no título
- Botão "Editar"
- Botão "Excluir" → confirmar
```

### 2.5 Meus Alunos (/professor/alunos) — COMPLETAR

```
Verificar se existe. Garantir que:
- Lista mostra APENAS alunos das turmas deste professor (não todos da academia)
- Clicar em aluno → ficha com: faixa, frequência, avaliações, evolução
- Botão "Avaliar" → form de avaliação (mesma do 2.3)
- Botão "Recomendar para graduação" → toast "Recomendação enviada ao admin"
- Filtro por turma e por faixa
- Busca por nome
```

### 2.6 Calendário (/professor/calendario) — CRIAR SE NÃO EXISTE

```
Página simples:
- Calendário mensal com dias que tem aula (turmas do professor)
- Clicar em dia → lista de aulas daquele dia
- Eventos da academia marcados
- Graduações agendadas
```

### 2.7 Conteúdo (/professor/conteudo) — COMPLETAR

```
Verificar que o upload de vídeo funciona:
- Form com: Título, URL YouTube/Vimeo (NÃO upload de arquivo), Descrição, Categoria, Turma, Nível
- IMPORTANTE: professor cola LINK, não faz upload de arquivo
- Botão "Enviar para aprovação" funciona
- Lista de vídeos enviados com status (pendente/aprovado/rejeitado)
```

### 2.8 Sidebar e Navegação

```
Verificar que TODOS os links do ProfessorShell apontam para páginas existentes.
Se algum link dá 404: criar a página.
Garantir que link ativo está highlighted.
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: professor complete — modo aula, avaliacoes, planos de aula, alunos, calendario, conteudo"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 3 — ADMIN: De 55% Para 90%+
═══════════════════════════════════════════════════════════════

### 3.1 Verificar estado atual

```bash
echo "=== ADMIN ==="
find app/ -path "*admin*page.tsx" | grep -v superadmin | sort
find lib/api/ -name "*admin*" -o -name "*crm*" -o -name "*convite*" | sort
```

### 3.2 CRM / Leads (/admin/crm) — COMPLETAR

```
Service: lib/api/admin-crm.service.ts
- getLeads(filtros?) → Lead[]
- criarLead(dados) → { success, id }
- moverLead(id, novoStatus) → { success }
- addNota(leadId, texto) → { success }
- getConversaoFunil() → { etapa, count }[]

Mock: 15 leads em diferentes etapas do funil

Página — KANBAN VISUAL:
- Colunas arrastáveis (drag-and-drop ou botões "Mover para"):
  Novo → Contatado → Agendou experimental → Fez experimental → Matriculou → Perdido
- Cada card: Nome | Telefone | Origem | Última interação
- Clicar em card → modal detalhes:
  Histórico de notas, botão "Adicionar nota", botão "Agendar follow-up"
- Botão "Novo Lead" → modal form: Nome*, Telefone*, Email, Origem (select), Modalidade
- Filtrar por origem (indicação, Instagram, Google, walk-in)
- No topo: funil visual com % de conversão entre etapas

SE drag-and-drop é complexo demais: usar SELECT no card para mover entre etapas.
```

### 3.3 Convites (/admin/convites) — COMPLETAR

```
Service: lib/api/admin-convites.service.ts
- gerarConvite(role, opcoes?) → { link, codigo, expiresAt }
- getConvites() → Convite[]
- desativarConvite(id) → { success }

Mock: 5 convites gerados (diferentes roles)

Página:
- GERAR CONVITE:
  Select de role: Professor | Aluno Adulto | Responsável | Recepcionista
  Opções: expiração (7 dias, 30 dias, sem expiração)
  Botão "Gerar Link" → link aparece
  Botão "Copiar" (clipboard API) → toast "Link copiado!"
  Botão "Compartilhar WhatsApp" → abre whatsapp com link

- LISTA de convites gerados:
  Tabela: Role | Código | Criado em | Expira | Usado? | Ações
  Botão "Desativar" → confirmar

- QUEM USOU: para convites já usados, mostrar nome/email de quem se cadastrou
```

### 3.4 Importação de Alunos (/admin/importacao) — COMPLETAR

```
Service: lib/api/admin-importacao.service.ts
- processarPlanilha(file) → { preview: Row[], erros: Erro[] }
- confirmarImportacao(dados) → { importados, erros }
- downloadModelo() → Blob (CSV template)

Mock: simular processamento com delay

Página:
- Botão "Baixar Planilha Modelo" → download CSV com colunas: nome,email,telefone,nascimento,faixa,turma
- Upload de arquivo (drag & drop ou botão)
  Aceita: .csv, .xlsx
- PREVIEW: tabela com dados que serão importados
  Linhas com erro em vermelho (email inválido, campo obrigatório vazio)
  Contador: "X alunos válidos, Y com erro"
- Botão "Importar X alunos" → loading → toast "X alunos importados!"
- Relatório de erros: "Linha 5: email inválido, Linha 12: nome vazio"
```

### 3.5 Relatórios (/admin/relatorios) — COMPLETAR

```
Service: lib/api/admin-relatorios.service.ts
- getRelatorioFrequencia(filtros) → dados
- getRelatorioFinanceiro(filtros) → dados
- getRelatorioAlunos(filtros) → dados
- getRelatorioRetencao(filtros) → dados

Mock: dados realistas para cada tipo

Página com TABS:
- Tab "Frequência":
  Filtros: turma, período (mês)
  Gráfico de barras: frequência por turma
  Tabela: Aluno | Turma | Presenças | Faltas | % | Tendência (↑↓)
  Exportar CSV

- Tab "Financeiro":
  Filtros: período
  Gráfico de linhas: receita × despesa × lucro por mês
  KPIs: receita total, ticket médio, inadimplência
  Exportar CSV

- Tab "Alunos":
  Gráfico: novos vs cancelados por mês
  Distribuição por faixa (pizza)
  Distribuição por idade (barras)
  Distribuição por turma (barras)
  Exportar CSV

- Tab "Retenção":
  % de renovação mês a mês
  Tempo médio de permanência
  Top 5 motivos de cancelamento
  Exportar CSV
```

### 3.6 Gestão de Alunos (/admin/alunos) — COMPLETAR PARCIAIS

```
Verificar os itens ⚠️:
- Botão "Graduar" → form: selecionar nova faixa → confirmar → toast
- Botão "Trancar matrícula" → modal: motivo (select) + observação → confirmar
- Botão "Cancelar matrícula" → modal: motivo + observação → confirmar
- Botão "Transferir turma" → modal: selecionar turma → confirmar
- Botão "Exportar lista" → gerar CSV com todos os alunos
- Ficha do aluno: verificar que TODOS os dados aparecem (frequência, pagamentos, avaliações)
- Form de edição: verificar que TODOS os campos funcionam e salvam
```

### 3.7 Gestão de Turmas (/admin/turmas) — COMPLETAR PARCIAIS

```
Verificar:
- Form de criar turma: TODOS os campos (modalidade, professor, dias, horário, sala, capacidade, nível)
- Editar turma funciona
- Desativar turma funciona
- Adicionar aluno à turma funciona
- Remover aluno da turma funciona
- Ver lista de alunos matriculados na turma
```

### 3.8 Eventos (/admin/eventos) — COMPLETAR

```
Verificar se existe e está funcional:
- Form completo: nome, data, horário, local, descrição, tipo, público, inscrição, valor
- Lista/calendário de eventos
- Detalhes com inscritos
- Cancelar evento funciona
```

### 3.9 Gamificação (/admin/gamificacao) — COMPLETAR

```
Verificar:
- Lista de badges/conquistas existentes
- Criar nova conquista funciona (nome, descrição, critério, ícone)
- Ranking de alunos por XP
- Atribuir conquista manualmente
```

### 3.10 Dashboard Admin — COMPLETAR PARCIAIS

```
Verificar que TODOS os KPIs mostram dados (não "0" estático):
- Total alunos ativos → número + gráfico sparkline
- Receita do mês → valor em R$ + comparação com mês anterior
- Inadimplência → % + valor
- Frequência média → %
- Aulas de hoje → timeline
- Central de atenção → aniversariantes, alunos sumidos, vencimentos
- Feed de atividade → últimos eventos

Quick actions devem funcionar:
- "Novo Aluno" → abre form
- "Novo Comunicado" → abre form
- "Ver Financeiro" → navega
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: admin complete — CRM kanban, convites, importacao, relatorios, eventos, gamificacao"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 4 — ALUNO ADULTO: De 60% Para 90%+
═══════════════════════════════════════════════════════════════

### 4.1 Indicações (/dashboard/indicar ou /indicar) — COMPLETAR

```
Service: lib/api/indicacoes.service.ts
- getMeuLink() → { link, codigo }
- getMinhasIndicacoes() → { nome, data, status: 'pendente'|'matriculou', recompensa? }[]

Mock: link pessoal + 4 indicações (2 matricularam, 2 pendentes)

Página:
- Card grande: "Seu link de indicação" + link copiável
  Botão "Copiar" → clipboard → toast "Link copiado!"
  Botão "Compartilhar WhatsApp" → abre WhatsApp com texto
- Lista de indicações feitas:
  Nome | Data | Status (badge verde "Matriculou!" / amarelo "Pendente")
- Recompensas: "2 indicações converteram → 10% desconto na próxima mensalidade"
```

### 4.2 Loja (/dashboard/loja ou /loja) — COMPLETAR

```
Service: lib/api/loja.service.ts
- getProdutos(filtros?) → Produto[]
- getProduto(id) → Produto
- adicionarCarrinho(produtoId, qtd, tamanho?) → { success }
- getCarrinho() → CarrinhoItem[]
- finalizarPedido(carrinho) → { success, pedidoId }
- getMeusPedidos() → Pedido[]

Mock: 8 produtos (2 kimonos, 2 faixas, 2 rashguards, 1 luva, 1 protetor bucal)
Preços entre R$ 29,90 e R$ 349,90

Página:
- GRID de produtos (cards com imagem placeholder, nome, preço)
- Filtrar por categoria
- Clicar em produto → modal: foto, descrição, tamanhos, preço
  Botão "Adicionar ao carrinho"
- Ícone de carrinho no header com badge de quantidade
- Página carrinho: lista de itens + total + "Finalizar Pedido"
- "Meus Pedidos": lista com status (pendente, pago, enviado, entregue)
```

### 4.3 Comunidade / Mural (/dashboard/comunidade) — COMPLETAR

```
Verificar:
- Feed de posts funciona
- Criar post (texto + foto) funciona
- Curtir post funciona
- Comentar funciona
- Ver comunicados fixados
```

### 4.4 Mensagens — COMPLETAR

```
Verificar:
- Lista de conversas funciona
- Enviar mensagem funciona (pelo menos visualmente com mock)
- RESTRIÇÃO: só pode ver conversas com professores e admin (não outros alunos)
- Criar nova conversa: listar apenas professores das suas turmas + admin
```

### 4.5 Conquistas e Ranking — COMPLETAR PARCIAIS

```
Verificar:
- Badges desbloqueados mostram com data
- Badges trancados mostram condição
- Ranking mostra posição do aluno destacada
- Filtro por turma funciona
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: aluno adulto complete — indicacoes, loja, comunidade, mensagens, conquistas"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 5 — SUPER ADMIN: De 65% Para 90%+
═══════════════════════════════════════════════════════════════

### 5.1 Completar páginas parciais

```
Verificar e completar:

/superadmin/academias:
- Botão "Entrar como admin" (impersonation) → funciona? Se não: implementar
  Salvar academyId em cookie/context → redirect para /admin → banner no topo "Visualizando como Roberto"
- Botão "Suspender/Reativar" funciona
- Botão "Mudar plano" funciona
- Botão "Estender trial" funciona
- Filtros (status, plano) funcionam

/superadmin/usuarios:
- Tabela carrega com dados
- Busca funciona
- Filtros (role, academia) funcionam
- Detalhes do usuário abrem

/superadmin/financeiro:
- Gráfico de receita carrega
- Lista de inadimplentes
- Projeção
- Exportar funciona (pelo menos gera CSV mockado)

/superadmin/planos:
- Tabela de planos editável
- Editar preço funciona
- Editar limites funciona
- Ver quantas academias em cada plano

/superadmin/suporte:
- Tickets listam
- Filtros funcionam
- Responder ticket funciona
- Mudar status funciona
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: superadmin complete — impersonation, financeiro, planos, suporte, usuarios"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 6 — TEEN + KIDS + RESPONSÁVEL + FRANQUEADOR (fixes menores)
═══════════════════════════════════════════════════════════════

### 6.1 Teen — Completar parciais

```
- /teen/desafios: verificar que desafios têm progress tracking funcional
  Aceitar desafio → tracker atualiza → completar → animação + XP
- /teen/season: verificar que season pass tem trilha visual funcional
- /teen/ranking: top 3 em pódio visual, minha posição destacada
```

### 6.2 Kids — Verificar restrições

```
VERIFICAÇÃO CRÍTICA (Apple exige):
grep -rn "mensagens\|messages\|chat\|Message" app/\(kids\)/ 2>/dev/null
→ DEVE retornar ZERO. Se retornar algo: REMOVER.

grep -n "href=" components/shell/KidsShell.tsx 2>/dev/null
→ Verificar que NÃO tem link para mensagens, loja, financeiro, ranking com dados reais.

Se alguma dessas restrições está violada: CORRIGIR IMEDIATAMENTE.
```

### 6.3 Responsável — Completar parciais

```
- /parent/autorizacoes: verificar que form de autorização funciona
  Autorizar / Negar → salva → toast
  Ver autorizações passadas
  Revogar funciona

- /parent/financeiro: verificar que mostra pagamentos e boletos
  Download de boleto/comprovante funciona (pelo menos mock)

- /parent/notificacoes: verificar que lista notificações
  Marcar como lida funciona
  Configurar quais receber funciona
```

### 6.4 Franqueador — Completar parciais

```
- /franqueador/unidades: verificar lista + detalhes + métricas comparativas
- /franqueador/royalties: verificar tabela + status pagamento
- /franqueador/curriculo: verificar gestão de currículo padrão
- /franqueador/expansao: verificar pipeline + mapa (ou lista de regiões)
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: teen, kids, responsavel, franqueador — all partial items completed"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 7 — FLUXOS CROSS-PERFIL
═══════════════════════════════════════════════════════════════

### 7.1 Fluxo de Graduação

```
Verificar que TODA a cadeia funciona:
1. Professor avalia aluno → marca "pronto para graduar" ✓
2. Notificação chega para admin (verificar no service de notificações)
3. Admin vê na lista de graduações pendentes
4. Admin aprova → seleciona data
5. Graduação registrada → faixa do aluno muda no perfil
6. Aluno vê nova faixa no dashboard

SE ALGUMA PEÇA FALTA: criar.
Mínimo: professor marca "pronto" → admin vê lista de pendentes → admin confirma → faixa muda.
```

### 7.2 Fluxo de Mensagens

```
Verificar que:
1. Admin envia mensagem → professor recebe (lista de conversas atualiza)
2. Professor envia mensagem → aluno recebe
3. Aluno envia mensagem → professor recebe
4. Responsável envia mensagem → professor recebe
5. Admin envia comunicado → todos recebem
6. Kids NÃO pode enviar/receber mensagens

Mínimo funcional: cada perfil vê conversas mockadas com os destinatários corretos do seu role.
Verificar que o service de mensagens filtra por role corretamente.
```

### 7.3 Fluxo de Experimental → Matrícula

```
Verificar:
1. Recepcionista agenda experimental ✓
2. Experimental aparece no dashboard da recepcionista ✓
3. "Chegou!" → status muda ✓
4. "Matricular!" → redireciona para form de matrícula com dados pré-preenchidos
5. Matrícula completa → aluno aparece no /admin/alunos
6. CRM: lead muda para "Matriculou"

SE link de experimental → matrícula NÃO funciona: implementar passagem de dados via query params ou context.
```

### 7.4 Fluxo de Check-in

```
Verificar:
1. Aluno chega → recepcionista busca no check-in → registra entrada
2. Professor vê aluno na lista de presença da turma
3. Professor marca presença
4. Aluno vê frequência atualizada no dashboard
5. Admin vê relatório de frequência

Mínimo: cada peça funciona individualmente com mock. Dados não precisam sincronizar em real-time (mock é OK).
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: cross-profile flows — graduation, messaging, experimental-enrollment, checkin"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 8 — COMPONENTES GLOBAIS FALTANTES
═══════════════════════════════════════════════════════════════

### 8.1 Sistema de Notificações

```
Verificar em CADA perfil:
- Sino no header funciona
- Badge com número aparece
- Clicar abre dropdown com notificações
- Clicar em notificação navega para contexto
- "Marcar todas como lidas" funciona

SE NÃO EXISTE OU PARCIAL:
Criar components/shared/NotificationsDropdown.tsx
- Usa service: lib/api/notificacoes.service.ts
- Mock: 5-10 notificações por perfil (contextuais ao role)
- Badge mostra count de não-lidas
- Dropdown lista últimas 10
- Clicar marca como lida + navega
```

### 8.2 Busca Global (se planejada)

```
Se existe no header mas não funciona:
- Implementar busca que retorna: alunos, turmas, páginas
- Resultados agrupados por tipo
- Clicar navega
- ESC fecha

SE NÃO planejada: ignorar (não obrigatório para v1).
```

### 8.3 Primeiro Acesso / Tutorial

```
Verificar se existe sistema de tutorial/onboarding para novos usuários.
SE NÃO EXISTE:
Criar modal simples de boas-vindas para admin no primeiro login:
- "Bem-vindo ao BlackBelt! 🥋"
- 3 steps: "Configure sua academia" → "Cadastre alunos" → "Crie turmas"
- Botão "Começar" e "Pular"
- Flag no localStorage: tutorial_completo = true (não mostra de novo)
```

### 8.4 Exportação (CSV)

```
Verificar que TODA tabela que deveria ter "Exportar" funciona:
- /admin/alunos → exportar CSV
- /admin/financeiro → exportar CSV
- /admin/relatorios → exportar CSV
- /admin/presenca → exportar CSV

SE função exportToCSV não funciona para alguma tabela: conectar.

Mínimo: gerar CSV com dados atuais da tabela + download automático.
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "feat: global components — notifications, search, onboarding, CSV export"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 9 — FORMS E BOTÕES PARCIAIS (⚠️ restantes)
═══════════════════════════════════════════════════════════════

```
Este bloco é um SWEEP final. Pegue CADA item ⚠️ restante e complete.

METODOLOGIA:
1. Abra o BLACKBELT_CHECKLIST_RESULTADO.md
2. Filtre por ⚠️
3. Para cada ⚠️ que ainda não foi corrigido nos blocos anteriores:
   - Se é form que não submete → conectar ao service
   - Se é botão sem ação → implementar
   - Se é modal que não abre → corrigir
   - Se é dados mock insuficientes → adicionar mais dados
   - Se é validação faltando → adicionar
   - Se é loading state faltando → adicionar
   - Se é toast faltando → adicionar

VERIFICAÇÃO:
grep -c "⚠️" BLACKBELT_CHECKLIST_RESULTADO.md
→ Anotar quantos ⚠️ existem
→ Corrigir todos
→ Contar de novo (deve ser 0 ou próximo)
```

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "fix: all partial items completed — forms submit, buttons work, modals open, validation added"
git push origin main
```

═══════════════════════════════════════════════════════════════
BLOCO 10 — VERIFICAÇÃO FINAL + RELATÓRIO
═══════════════════════════════════════════════════════════════

```
10.1 Build limpo:
pnpm typecheck 2>&1 → ZERO erros
pnpm build 2>&1 → ZERO erros

10.2 Recontagem do checklist:
Releia o BLACKBELT_CHECKLIST_RESULTADO.md e atualize CADA item
que foi corrigido neste prompt (⚠️→✅, ❌→✅).

Salve como BLACKBELT_CHECKLIST_RESULTADO_V2.md com todos os status atualizados.

10.3 Relatório final:
```

RELATÓRIO PROMPT MONSTRO
═══════════════════════════════════════════════════════════════

ANTES:
  ✅ 514 (51%) | ⚠️ 127 (13%) | ❌ 177 (18%) | 🔇 11 (1%)

DEPOIS:
  ✅ ___ (__%) | ⚠️ ___ (__%) | ❌ ___ (__%) | 🔇 ___ (__%)

POR PERFIL (DEPOIS):
  Recepcionista:  ✅ __ | ⚠️ __ | ❌ __  (era 37%)
  Professor:      ✅ __ | ⚠️ __ | ❌ __  (era 49%)
  Admin:          ✅ __ | ⚠️ __ | ❌ __  (era 55%)
  Aluno Adulto:   ✅ __ | ⚠️ __ | ❌ __  (era 60%)
  Super Admin:    ✅ __ | ⚠️ __ | ❌ __  (era 65%)
  Teen:           ✅ __ | ⚠️ __ | ❌ __  (era 81%)
  Responsável:    ✅ __ | ⚠️ __ | ❌ __  (era 83%)
  Franqueador:    ✅ __ | ⚠️ __ | ❌ __  (era 85%)
  Kids:           ✅ __ | ⚠️ __ | ❌ __  (era 94%)
  Cross-perfil:   ✅ __ | ⚠️ __ | ❌ __  (era 40%)
  Globais:        ✅ __ | ⚠️ __ | ❌ __

COMMITS:
  1. "feat: recepcionista complete" — Bloco 1
  2. "feat: professor complete" — Bloco 2
  3. "feat: admin complete" — Bloco 3
  4. "feat: aluno adulto complete" — Bloco 4
  5. "feat: superadmin complete" — Bloco 5
  6. "feat: teen, kids, responsavel, franqueador" — Bloco 6
  7. "feat: cross-profile flows" — Bloco 7
  8. "feat: global components" — Bloco 8
  9. "fix: all partial items" — Bloco 9

ARQUIVOS CRIADOS: ___
ARQUIVOS MODIFICADOS: ___
LINHAS ADICIONADAS: ___

PENDÊNCIAS (se houver):
  - ___

═══════════════════════════════════════════════════════════════

```bash
git add -A
git commit -m "qa: usability checklist v2 — target 90%+ coverage across all profiles"
git push origin main
```

---

## REGRAS DURANTE TODA A EXECUÇÃO

1. BLOCO a BLOCO. Commit + push ao final de cada.
2. Build DEVE passar entre blocos.
3. Prioridade: Recepcionista → Professor → Admin (os que a academia usa mais).
4. Cada service: isMock() + mock realista (nomes brasileiros, R$, datas recentes).
5. Cada página: skeleton, ThemeContext, mobile-first, empty state.
6. Cada form: validação visual, onSubmit funcional, loading, toast.
7. Cada botão: handler real. ZERO onClick vazios.
8. NUNCA 'any'. NUNCA hardcode cores. NUNCA delete mocks.
9. Se ficar travado 5+ min: anotar e seguir.
10. Ler BLACKBELT_CHECKLIST_RESULTADO.md como referência de O QUE FALTA.

## COMECE AGORA. BLOCO 1 (Recepcionista).

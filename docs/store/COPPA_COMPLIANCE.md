# COPPA Compliance — BlackBelt

Data: 2026-03-29
Documento de conformidade com COPPA (Children's Online Privacy Protection Act) e LGPD Art. 14 (proteção de dados de menores).

---

## 1. Visão Geral

O BlackBelt inclui perfis dedicados para menores de idade:
- **Kids** (menores de 13 anos) — interface altamente restrita
- **Teen** (13 a 17 anos) — interface com restrições moderadas

Ambos os perfis são sempre vinculados a uma conta de **Responsável** (pai/mãe/tutor legal) que exerce controle total sobre a conta do menor.

---

## 2. Política de Coleta de Dados de Crianças

### 2.1. Dados coletados de menores (Kids, < 13 anos)

| Dado | Coletado | Finalidade | Base legal |
|------|----------|------------|------------|
| Nome completo | Sim | Identificação na lista de chamada da academia | Consentimento parental |
| Data de nascimento | Sim | Verificação de idade e cálculo de faixa etária | Consentimento parental |
| Faixa/Graduação | Sim | Registro de progressão marcial | Execução de contrato (academia) |
| Presença em aulas | Sim | Controle de frequência | Execução de contrato (academia) |
| Foto de perfil | Opcional | Identificação visual pelo professor | Consentimento parental explícito |

### 2.2. Dados NÃO coletados de menores (Kids)

| Dado | Motivo |
|------|--------|
| Email pessoal | Login é via conta do responsável |
| Telefone | Não aplicável para menores de 13 |
| Localização/GPS | Não coletado de nenhum perfil |
| Dados de dispositivo | Não coletado para Kids |
| Conteúdo de mensagens | Kids NÃO têm acesso a mensagens |
| Conteúdo gerado (UGC) | Kids NÃO podem criar ou compartilhar conteúdo |

---

## 3. Mecanismo de Consentimento Parental

### 3.1. Fluxo de cadastro de menor

1. **Responsável** (já autenticado) acessa a seção de cadastro de dependentes
2. Sistema verifica a idade do responsável (deve ser ≥ 18 anos)
3. Responsável insere dados do menor (nome, data de nascimento)
4. Sistema calcula a idade e classifica automaticamente como Kids (< 13) ou Teen (13-17)
5. Para Kids: exibe tela de **consentimento parental explícito** com:
   - Lista de dados que serão coletados
   - Finalidade de cada dado
   - Direitos do responsável (acesso, retificação, exclusão)
   - Link para política de privacidade de menores
6. Responsável deve marcar checkbox de consentimento e confirmar
7. Conta do menor é criada **vinculada** ao responsável

### 3.2. Verificação de idade

- A verificação de idade é feita pela data de nascimento informada pelo responsável
- Nenhum menor pode criar conta sozinho — o cadastro é sempre feito pelo responsável
- O sistema aplica restrições automaticamente com base na idade calculada

### 3.3. Revogação de consentimento

O responsável pode a qualquer momento:
- Solicitar exclusão da conta do menor via `/excluir-conta`
- Solicitar acesso aos dados do menor
- Revogar o consentimento, o que resulta na desativação da conta

---

## 4. Isolamento do Perfil Kids

O perfil Kids possui as seguintes restrições de segurança, implementadas tanto no frontend quanto no backend (RLS):

### 4.1. Funcionalidades BLOQUEADAS para Kids

| Funcionalidade | Status | Implementação |
|----------------|--------|---------------|
| Sistema de mensagens | BLOQUEADO | Shell Kids não renderiza rotas de mensagem |
| Chat / comunicação direta | BLOQUEADO | Nenhum canal de comunicação direto |
| Criação de conteúdo (UGC) | BLOQUEADO | Sem upload, sem posts, sem comentários |
| Compartilhamento social | BLOQUEADO | Sem botões de share ou integração social |
| Visualização de dados financeiros | BLOQUEADO | Sem acesso a faturas, pagamentos ou planos |
| Edição de perfil completa | BLOQUEADO | Apenas responsável pode editar dados |
| Acesso a perfis de outros alunos | BLOQUEADO | Sem listagem de outros usuários |
| Busca de academias (marketplace) | BLOQUEADO | Sem acesso ao marketplace |

### 4.2. Funcionalidades PERMITIDAS para Kids

| Funcionalidade | Descrição |
|----------------|-----------|
| Dashboard simplificado | Resumo visual da próxima aula e faixa atual |
| Check-in de presença | Registro de presença nas aulas (supervisionado) |
| Visualização de faixa | Ver a própria faixa e requisitos da próxima |
| Vídeo-aulas | Assistir vídeos educacionais de técnica (somente visualização) |
| Horário de aulas | Ver grade de aulas e horários |

### 4.3. Interface simplificada

- Navegação reduzida com menos itens no menu
- Ícones maiores e linguagem simplificada
- Sem elementos de gamificação que incentivem uso excessivo
- Sem notificações push para perfis Kids

---

## 5. Minimização de Dados

### 5.1. Princípio

O BlackBelt segue o princípio de minimização de dados para menores: coletar apenas o estritamente necessário para a prestação do serviço da academia.

### 5.2. Retenção

| Dado | Período de retenção | Ação após expiração |
|------|---------------------|---------------------|
| Dados de presença | Enquanto aluno ativo + 1 ano | Anonimização |
| Dados de graduação | Enquanto aluno ativo + 5 anos | Anonimização (histórico marcial tem valor) |
| Dados de perfil | Até exclusão da conta | Anonimização completa via Edge Function |
| Foto de perfil | Até exclusão da conta | Exclusão do storage |

### 5.3. Exclusão de conta

A exclusão de conta de menor segue o mesmo fluxo seguro dos adultos:
1. Responsável solicita exclusão via `/excluir-conta`
2. Supabase Edge Function `handle-deletion-request` processa a anonimização
3. Dados pessoais são substituídos por valores anonimizados
4. Registros de presença e graduação são mantidos de forma agregada (sem identificação pessoal)
5. Fotos e arquivos são excluídos do storage

---

## 6. Publicidade e Analytics

### 6.1. Publicidade

- O BlackBelt **NÃO exibe nenhuma publicidade** em nenhum perfil, incluindo Kids e Teen
- **NÃO há** anúncios de terceiros
- **NÃO há** anúncios contextuais
- **NÃO há** marketing direcionado a menores
- **NÃO há** compras dentro do app para menores

### 6.2. Analytics

| Ferramenta | Ativa para Kids | Ativa para Teen | Ativa para Adultos |
|-----------|-----------------|-----------------|-------------------|
| PostHog | NÃO | Limitado (sem PII) | Sim |
| Sentry (error tracking) | NÃO | Sim (apenas erros, sem PII) | Sim |
| Cookies de rastreamento | NÃO | NÃO | Apenas com consentimento |

> **Nota**: A desativação de analytics para perfis Kids deve ser verificada e garantida antes da submissão nas stores. Ver item S15 do relatório de readiness.

---

## 7. Controles do Responsável (Guardian Controls)

O responsável tem os seguintes controles sobre contas de menores vinculados:

| Controle | Disponível | Descrição |
|----------|-----------|-----------|
| Visualizar presença | Sim | Ver frequência em aulas do menor |
| Visualizar progresso de faixa | Sim | Acompanhar evolução marcial |
| Visualizar pagamentos | Sim | Ver faturas e status de pagamento da mensalidade |
| Editar dados do menor | Sim | Alterar nome, foto, dados cadastrais |
| Comunicar com professor | Sim | Enviar mensagens ao professor sobre o menor |
| Solicitar exclusão de conta | Sim | Pedir remoção completa dos dados do menor |
| Revogar consentimento | Sim | Desativar a conta do menor |
| Transferir responsabilidade | Sim | Vincular menor a outro responsável |
| Visualizar atividade do menor | Sim | Dashboard com resumo de atividades |

---

## 8. Conformidade Legal

### 8.1. COPPA (EUA)

| Requisito COPPA | Status BlackBelt |
|-----------------|------------------|
| Aviso de privacidade claro para dados de menores | Sim — /privacidade-menores |
| Consentimento parental verificável antes da coleta | Sim — cadastro apenas via responsável |
| Possibilidade de revisar dados coletados | Sim — responsável visualiza todos os dados |
| Possibilidade de solicitar exclusão | Sim — /excluir-conta |
| Não condicionar participação à coleta excessiva | Sim — apenas dados essenciais |
| Não exibir publicidade comportamental para menores | Sim — zero publicidade |

### 8.2. LGPD Art. 14 (Brasil)

| Requisito LGPD Art. 14 | Status BlackBelt |
|------------------------|------------------|
| Tratamento no melhor interesse da criança | Sim — interface restrita e protetiva |
| Consentimento específico de pelo menos um dos pais | Sim — responsável consente no cadastro |
| Informações sobre tratamento de forma simples e acessível | Sim — /privacidade-menores em linguagem clara |
| Não condicionar jogos/apps à coleta excessiva | Sim — gamificação mínima para Kids |
| Esforços razoáveis para verificar consentimento parental | Sim — conta do responsável verificada por email |

### 8.3. Families Policy (Google Play)

| Requisito | Status |
|-----------|--------|
| Target audience inclui crianças | Parcial — BlackBelt não é "designed for children", mas inclui perfis para crianças sob supervisão parental |
| Cumprimento Families Policy | O BlackBelt é primariamente um app B2B para empresas (academias). O módulo Kids é secundário e sempre supervisionado por adultos |
| Anúncios certificados (se aplicável) | N/A — zero publicidade |
| APIs de localização para menores | N/A — não coleta localização |

> **Nota sobre Google Families Policy**: O BlackBelt deve declarar no Google Play Console que seu público-alvo NÃO é primariamente crianças. O app é "Business" destinado a academias (empresas). O módulo Kids existe como funcionalidade de um app B2B, não como app infantil. Isso evita os requisitos mais rigorosos do programa Families do Google.

---

## 9. Contato para Questões de Privacidade de Menores

| Campo | Valor |
|-------|-------|
| Email | gregoryguimaraes12@gmail.com |
| Página | https://blackbelts.com.br/privacidade-menores |
| Responsável | DPO / Encarregado de Dados (a ser nomeado — ver item S7 do relatório de readiness) |

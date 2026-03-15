# BlackBelt — Store Review Credentials

## Credenciais de Demo para Reviewer

### Admin
- **Email:** admin@demo.blackbelt.app
- **Senha:** Demo@2026!
- **Perfil:** Administrador da academia
- **O que testar:** Dashboard com KPIs, gestão de turmas, financeiro, relatórios

### Professor
- **Email:** professor@demo.blackbelt.app
- **Senha:** Demo@2026!
- **Perfil:** Professor de BJJ
- **O que testar:** Modo Aula, gerar QR Code, avaliar alunos, mensagens

### Aluno Adulto
- **Email:** aluno@demo.blackbelt.app
- **Senha:** Demo@2026!
- **Perfil:** Aluno adulto faixa branca
- **O que testar:** Check-in, progresso de faixa, conteúdo, conquistas

### Responsável
- **Email:** responsavel@demo.blackbelt.app
- **Senha:** Demo@2026!
- **Perfil:** Responsável por 2 alunos (kids/teen)
- **O que testar:** Ver presença dos filhos, pagamentos

## Fluxos para Testar

### 1. Login e Navegação
1. Abrir o app → Tela de login
2. Inserir credenciais do aluno → Dashboard do aluno
3. Navegar por: Turmas, Progresso, Conteúdo, Perfil

### 2. Check-in
1. Login como aluno
2. Tocar no botão de check-in (FAB vermelho)
3. Selecionar "Check-in Manual" (QR não disponível em review)
4. Confirmar → Toast de sucesso

### 3. Ver Turmas e Horários
1. Ir para aba "Turmas"
2. Ver lista de turmas com horários
3. Clicar em uma turma → Detalhes

### 4. Progresso de Faixa
1. Ir para "Progresso"
2. Ver timeline de faixas
3. Ver requisitos para próxima faixa

### 5. Conteúdo em Vídeo
1. Ir para "Conteúdo"
2. Filtrar por faixa
3. Clicar em um vídeo → Player

### 6. Fluxo do Professor
1. Login como professor
2. Ver turmas do dia
3. Iniciar "Modo Aula" → Lista de chamada
4. Marcar presença dos alunos

### 7. Fluxo Admin
1. Login como admin
2. Dashboard com métricas
3. Financeiro → Ver faturas, planos
4. Relatórios → Gerar relatório de presença

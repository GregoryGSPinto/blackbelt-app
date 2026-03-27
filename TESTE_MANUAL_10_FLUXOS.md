# BlackBelt v2 — Teste Manual dos 10 Fluxos Criticos
# Executar no browser em https://blackbeltv2.vercel.app

## PRE-REQUISITO
- Migrations rodadas no Supabase
- Seeds rodados (principal + usabilidade)
- Deploy feito na Vercel

---

## FLUXO 1: Login de cada perfil
Para cada credencial abaixo, testar:
- [ ] Abre /login
- [ ] Digita email + senha
- [ ] Clica "Entrar"
- [ ] Redireciona para o dashboard correto
- [ ] Dashboard carrega dados (nao fica spinner infinito)
- [ ] Nome do usuario aparece no header

Credenciais:
- [ ] admin@guerreiros.com / BlackBelt@2026 → /admin
- [ ] andre@guerreiros.com / BlackBelt@2026 → /professor
- [ ] joao@email.com / BlackBelt@2026 → /dashboard
- [ ] lucas.teen@email.com / BlackBelt@2026 → /teen
- [ ] patricia@email.com / BlackBelt@2026 → /parent
- [ ] julia@guerreiros.com / BlackBelt@2026 → /recepcao
- [ ] gregoryguimaraes12@gmail.com / @Greg1994 → /superadmin

---

## FLUXO 2: Admin cadastra aluno
- [ ] Login como admin
- [ ] Navega para /admin/alunos
- [ ] Clica "Cadastrar Aluno"
- [ ] Preenche: Nome "Teste Silva", Email "teste@teste.com", Telefone "(31) 99999-9999"
- [ ] Seleciona turma
- [ ] Clica "Cadastrar"
- [ ] Toast de sucesso aparece
- [ ] Aluno aparece na lista
- [ ] Se email fornecido: aluno consegue logar com senha temporaria

---

## FLUXO 3: Criar familia (admin)
- [ ] Login como admin
- [ ] Navega para /admin/cadastro-familia (ou botao "Criar Familia")
- [ ] Step 1: preenche dados do responsavel
- [ ] Step 2: adiciona filho (data nascimento → sistema detecta Kids ou Teen)
- [ ] Step 3: adiciona segundo filho (dados do responsavel pre-preenchidos)
- [ ] Step 4: seleciona turma para cada filho
- [ ] Step 5: seleciona plano
- [ ] Step 6: revisa e confirma
- [ ] Toast de sucesso
- [ ] Responsavel aparece na lista com filhos vinculados

---

## FLUXO 4: Responsavel ve Central da Familia
- [ ] Login como patricia@email.com
- [ ] Dashboard mostra filhos (Sophia e Miguel)
- [ ] Seletor de dependente funciona (trocar entre Sophia e Miguel)
- [ ] Agenda mostra aulas dos dois filhos
- [ ] Pagamentos mostra faturas consolidadas
- [ ] Total mensal correto
- [ ] Autorizacoes listam pendencias (se existem)

---

## FLUXO 5: Responsavel adiciona filho
- [ ] Login como responsavel
- [ ] Navega para configuracoes → Meus Filhos
- [ ] Clica "Adicionar Filho"
- [ ] Preenche nome + data nascimento (8 anos = Kids)
- [ ] Salva
- [ ] Filho aparece na lista de dependentes
- [ ] Dashboard atualiza com novo filho

---

## FLUXO 6: Check-in do aluno
- [ ] Login como aluno adulto (joao@email.com)
- [ ] Dashboard mostra proxima aula
- [ ] Botao de check-in visivel
- [ ] Clica check-in → toast "Presenca registrada!"
- [ ] Frequencia atualiza

---

## FLUXO 7: Professor faz chamada
- [ ] Login como professor (andre@guerreiros.com)
- [ ] Dashboard mostra "Aulas de hoje"
- [ ] Clica na turma → lista de alunos
- [ ] Marca presenca de 3 alunos
- [ ] Salva chamada
- [ ] Toast de sucesso

---

## FLUXO 8: Comunicado por turma
- [ ] Login como admin
- [ ] Navega para comunicados → Novo comunicado
- [ ] Seleciona "Enviar para turma: BJJ Avancado"
- [ ] Escreve mensagem
- [ ] Preview mostra "Sera enviado para X pessoas"
- [ ] Envia
- [ ] Login como aluno da turma → notificacao aparece

---

## FLUXO 9: Pagamento do responsavel
- [ ] Login como responsavel
- [ ] Navega para pagamentos
- [ ] Ve faturas consolidadas por filho
- [ ] Fatura pendente mostra botao "Pagar"
- [ ] Clica pagar → abre link de pagamento (Asaas) ou mostra QR Pix

---

## FLUXO 10: Excluir conta
- [ ] Login como aluno de teste
- [ ] Navega para configuracoes
- [ ] Scrolla ate "Zona de Perigo"
- [ ] Clica "Excluir Minha Conta"
- [ ] Modal pede confirmacao
- [ ] Digita "EXCLUIR MINHA CONTA"
- [ ] Confirma
- [ ] Logout automatico
- [ ] Tenta logar novamente → "Usuario nao encontrado"

---

## RESULTADO

Para cada fluxo, anotar:
- OK: Funciona completamente
- PARCIAL: Funciona parcialmente (descrever o que nao funcionou)
- FALHA: Nao funciona (descrever o erro)

Meta: 10/10 OK antes de submeter pras stores.

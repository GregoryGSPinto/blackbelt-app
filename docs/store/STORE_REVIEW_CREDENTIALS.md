# Store Review Credentials -- BlackBelt v2

Data: 2026-03-29
Status: RASCUNHO (contas precisam ser criadas no ambiente de producao)

---

## Informacoes do App

| Campo | Valor |
|-------|-------|
| Nome | BlackBelt |
| Bundle ID (iOS) | app.blackbelt.academy |
| Package (Android) | app.blackbelt.academy |
| Versao | 1.0.0 |
| Categoria | Business / Sports |
| Descricao | B2B SaaS para gestao de academias de artes marciais |

---

## Demo Account -- Apple App Review

| Campo | Valor |
|-------|-------|
| Email | admin@demo.blackbelt.app |
| Senha | Demo@2026! |
| Role | Administrador da academia |
| Academia | Guerreiros do Tatame (demo) |
| Status | **PRECISA SER CRIADA** |

> **IMPORTANTE**: Esta conta precisa ser criada no ambiente de producao antes da submissao.
> O reviewer da Apple precisa conseguir fazer login sem nenhum passo adicional (sem verificacao de email, sem 2FA).

---

## Demo Account -- Google Play Review

Mesmas credenciais acima. Google Play tambem exige credenciais de teste quando o app tem login obrigatorio.

---

## Contas Adicionais (para teste completo)

| Role | Email | Senha | O que testar |
|------|-------|-------|--------------|
| Admin | admin@demo.blackbelt.app | Demo@2026! | Dashboard KPIs, gestao de turmas, financeiro, relatorios, configuracoes |
| Professor | professor@demo.blackbelt.app | Demo@2026! | Modo Aula, QR Code, chamada, avaliacoes, video-aulas, mensagens |
| Aluno Adulto | aluno@demo.blackbelt.app | Demo@2026! | Check-in, progresso de faixa, conteudo em video, conquistas |
| Responsavel | responsavel@demo.blackbelt.app | Demo@2026! | Dashboard dos filhos, presenca, pagamentos, consentimento |

---

## App Review Notes (Apple)

Texto para colar no campo "Notes for Review" do App Store Connect:

```
BlackBelt is a B2B SaaS platform for martial arts academy management. It requires authentication because all data is academy-specific and role-based.

DEMO CREDENTIALS:
- Email: admin@demo.blackbelt.app
- Password: Demo@2026!

This account has full admin access to a demo academy ("Guerreiros do Tatame") pre-populated with sample data including students, classes, attendance records, and financial data.

KEY FEATURES TO TEST:
1. Dashboard — Overview with KPIs (students, revenue, attendance)
2. Classes — Schedule and class management
3. Attendance — Check-in system (use "Manual Check-in" as QR scanner requires physical proximity)
4. Students — Student roster and belt progression
5. Finance — Invoices and payment tracking
6. Video Content — Instructional video library (Bunny Stream CDN)

IMPORTANT NOTES:
- Payments are processed via external gateway (Asaas), not In-App Purchase. BlackBelt is a B2B tool — academies pay a monthly SaaS subscription, not individual users.
- The Kids module (for children under 13) has restricted functionality: no messaging, no UGC, simplified UI, parental consent required.
- Push notifications require a physical device to test.
- The app connects to our backend at https://blackbeltv2.vercel.app which is active 24/7.
- No ads are displayed anywhere in the app.
```

---

## Instrucoes de Teste -- Fluxos Principais

### 1. Login e Navegacao
1. Abrir o app -> Tela de login
2. Inserir credenciais do admin -> Dashboard do administrador
3. Navegar por: Dashboard, Turmas, Alunos, Financeiro, Configuracoes

### 2. Dashboard Admin
1. Apos login como admin
2. Ver KPIs: total de alunos, receita, frequencia do mes
3. Ver graficos de evolucao
4. Ver alertas e notificacoes

### 3. Gestao de Turmas
1. Ir para "Turmas"
2. Ver lista de turmas com horarios e modalidades
3. Clicar em uma turma -> Detalhes com lista de alunos inscritos
4. Ver calendario semanal

### 4. Check-in (como Aluno)
1. Logout -> Login como aluno@demo.blackbelt.app
2. Tocar no botao de check-in (FAB vermelho)
3. Selecionar "Check-in Manual" (QR nao disponivel em review)
4. Confirmar -> Toast de sucesso

### 5. Progresso de Faixa (como Aluno)
1. Ir para "Progresso"
2. Ver timeline de faixas com data de cada graduacao
3. Ver requisitos para proxima faixa (presenca, tempo, avaliacao)

### 6. Video-Aulas
1. Ir para "Conteudo" ou "Video-Aulas"
2. Ver biblioteca de videos filtrada por faixa
3. Clicar em um video -> Player (Bunny Stream CDN)
4. Progresso salvo automaticamente

### 7. Fluxo do Professor
1. Logout -> Login como professor@demo.blackbelt.app
2. Ver turmas do dia no dashboard
3. Iniciar "Modo Aula" -> Lista de chamada
4. Marcar presenca dos alunos -> Confirmar

### 8. Financeiro (como Admin)
1. Login como admin
2. Ir para "Financeiro"
3. Ver faturas pendentes e pagas
4. Ver planos e assinaturas
5. Gerar relatorio financeiro

### 9. Responsavel
1. Logout -> Login como responsavel@demo.blackbelt.app
2. Ver dashboard com filhos vinculados
3. Ver presenca e progresso de cada filho
4. Ver pagamentos

---

## Backend e Infraestrutura

| Componente | URL / Detalhes | Status |
|------------|----------------|--------|
| Frontend + API | https://blackbeltv2.vercel.app | Ativo 24/7 |
| Database | Supabase (PostgreSQL) | Ativo 24/7 |
| Video CDN | Bunny Stream | Ativo 24/7 |
| Email | Resend | Ativo |
| Pagamentos | Asaas (sandbox para demo) | Ativo |
| Monitoring | Sentry (quando configurado) | Parcial |

---

## Notas Importantes para Revisores

1. **Modelo de negocio**: SaaS B2B — academias pagam mensalidade via boleto/pix (gateway Asaas). NAO usa In-App Purchase porque o pagamento e da academia (pessoa juridica), nao do usuario final.

2. **Modulo Kids**: Criancas menores de 13 anos tem acesso restrito:
   - Sem sistema de mensagens
   - Sem criacao de conteudo (UGC)
   - Interface simplificada
   - Cadastro requer consentimento parental ativo
   - Em conformidade com LGPD Art. 14 e COPPA

3. **9 perfis de usuario**: SuperAdmin, Admin, Gestor, Professor, Recepcao, Aluno Adulto, Aluno Teen, Aluno Kids, Responsavel. Cada perfil tem dashboard e permissoes distintas controladas por RLS no banco de dados.

4. **Camera**: Usada para escanear QR Code de check-in e (opcionalmente) foto do aluno. Nao e funcionalidade principal.

5. **Push Notifications**: Notificacoes de chamada, avisos de aula, lembretes de pagamento. Requerem device fisico.

6. **Dados offline**: App e online-first. Nao ha cache offline significativo.

7. **Multi-tenancy**: Cada academia e um tenant isolado. Dados nunca vazam entre academias (garantido por RLS com `get_my_academy_ids()`).

---

## Checklist Pre-Submissao

- [ ] Criar contas demo no ambiente de producao
- [ ] Verificar que login funciona sem verificacao de email
- [ ] Popular academia demo com dados realistas
- [ ] Testar todos os 9 fluxos acima em device fisico
- [ ] Adicionar NSCameraUsageDescription ao Info.plist
- [ ] Preencher Data Safety form (Google)
- [ ] Preencher Content Rating IARC (Google)
- [ ] Definir target audience (Google)
- [ ] Colar App Review Notes no App Store Connect
- [ ] Colar credenciais no campo "Demo Account" de ambas as stores

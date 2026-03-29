# 04 — Store Listing + Metadata + Assets

Data: 2026-03-29

---

## PARTE 1 — IDENTIDADE DO APP

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 5.1 | Nome do app definido (max 30 chars) | ✅ | "BlackBelt" (9 chars) — definido em `capacitor.config.ts` e `manifest.json` |
| 5.2 | Subtitle (Apple, max 30 chars) | ❌ | Nao existe em nenhum lugar. Precisa adicionar no App Store Connect |
| 5.3 | Short Description (Google, max 80 chars) | ❌ | Nao existe. Precisa adicionar no Google Play Console |
| 5.4 | Full Description (max 4000 chars) | ❌ | Nao existe. Precisa redigir PT-BR + EN |
| 5.5 | Keywords (Apple, max 100 chars) | ❌ | Nao definidas. Precisa criar lista otimizada |
| 5.6 | Categoria: Business | ⚠️ | Nao configurado ainda nas stores. `manifest.json` tem `["business","sports","education"]` — na App Store/Play Store, escolher "Business" como primaria |
| 5.7 | Promotional Text (Apple) | ❌ | Nao existe. Texto livre editavel sem review |

## PARTE 2 — ASSETS VISUAIS

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 5.8 | App Icon 1024x1024 (Apple) | ✅ | `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` — verificado 1024x1024px |
| 5.9 | App Icon 512x512 (Google) | ✅ | `public/icons/icon-512.png` — verificado 512x512px. Android mipmap icons tambem presentes em todas as densidades |
| 5.10 | Feature Graphic 1024x500 (Google) | ✅ | `docs/store-assets/feature-graphic.png` — verificado 1024x500px |
| 5.11 | Screenshots iPhone 6.7" (min 3) | ✅ | 5 screenshots 1290x2796 em `docs/screenshots/iPhone_15_Pro_Max_*.png` (Login, Dashboard, Alunos, Turmas, Financeiro) |
| 5.12 | Screenshots iPhone 6.5" (1284x2778) | ❌ | **FALTAM**. Nao ha screenshots nessa resolucao. Apple exige este tamanho separado para iPhone 14 Plus/13 Pro Max. As de 6.7" NAO sao aceitas como 6.5" |
| 5.13 | Screenshots iPad 12.9" | ✅ | 5 screenshots 2048x2732 em `docs/screenshots/iPad_Pro_12.9_*.png` |
| 5.14 | Screenshots Android phone | ✅ | 5 screenshots 1080x1920 em `docs/screenshots/Android_Phone_*.png` |
| 5.15 | Screenshots Android tablet 7" | ⚠️ | 5 screenshots 1200x1920 em `docs/screenshots/Android_7inch_*.png`. **Faltam screenshots de tablet 10"** — Google Play aceita mas recomenda ambos |
| 5.16 | App Preview video (opcional) | ❌ | Nenhum video. Opcional, mas altamente recomendado para conversao |
| 5.17 | Splash screen | ✅ | iOS: 3 variantes 2732x2732 em `Assets.xcassets/Splash.imageset/`. Android: todas as densidades em `drawable-*/splash.png`. Capacitor config com `SplashScreen` plugin |

**Nota sobre screenshots**: As 5 telas (Login, Dashboard, Alunos, Turmas, Financeiro) sao funcionais mas **nao tem moldura de device nem texto de destaque**. Screenshots "cruas" convertem muito menos. Existem tambem 16 screenshots com moldura em `docs/store-screenshots/` (8 iPhone, 8 Android) que parecem mais recentes e polidas — verificar se essas estao prontas para uso.

## PARTE 3 — INFORMACOES DE SUPORTE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 5.18 | Support URL | ✅ | `https://blackbeltv2.vercel.app/contato` — pagina funcional com formulario + email + telefone. `/suporte` redireciona para `/contato`. `/ajuda` tem FAQ |
| 5.19 | Marketing URL | ⚠️ | A raiz `https://blackbeltv2.vercel.app` e a landing page, mas e dominio Vercel. Ideal: `https://blackbelt.app` com dominio proprio |
| 5.20 | Privacy Policy URL | ✅ | `https://blackbeltv2.vercel.app/privacidade` — pagina completa com 12 secoes, LGPD, menores. Tambem existe `/privacidade-menores` e `/termos` |
| 5.21 | Contact email | ⚠️ | Hardcoded como `suporte@blackbelt.app` em `lib/config/legal.ts`. **PROBLEMA**: dominio `blackbelt.app` precisa ter email configurado (MX records) para funcionar. Se nao funciona, Apple/Google vao testar e rejeitar |
| 5.22 | Contact phone (Google) | ⚠️ | Hardcoded como `+55 11 99999-0000` — **PLACEHOLDER OBVIO**. Google pode rejeitar. Precisa numero real |

## PARTE 4 — CONTA DEMO PARA REVISORES

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 5.23 | Conta demo criada | ✅ | 4 contas documentadas: admin, professor, aluno, responsavel. Todas com `Demo@2026!` |
| 5.24 | Credenciais documentadas | ✅ | `docs/STORE_REVIEW_CREDENTIALS.md` — completo com emails, senhas, descricao de cada perfil |
| 5.25 | App Review Notes escritas | ⚠️ | O doc `STORE_REVIEW_CREDENTIALS.md` tem 7 fluxos de teste detalhados, **mas** ainda falta o texto formatado para o campo "App Review Notes" do App Store Connect (max 4000 chars, texto simples, sem markdown). Tambem falta mencionaar que pagamentos sao B2B externos |

## PARTE 5 — LOCALIZACAO

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 5.26 | UI em PT-BR | ✅ | Todo o app em PT-BR conforme regra do projeto |
| 5.27 | Store listing em PT-BR | ❌ | Nenhum texto de listing redigido ainda |
| 5.28 | Store listing em EN (opcional) | ❌ | Nao existe. Recomendado para visibilidade internacional |

---

## DRAFTS PARA AS STORES

### Nome do App
**BlackBelt** (9 chars)

### Subtitle (Apple, max 30 chars)
```
Gestao de Academias Marciais
```
(29 chars)

### Short Description (Google, max 80 chars)
```
Gerencie sua academia de artes marciais: alunos, presencas, graduacoes e mais.
```
(78 chars)

### Full Description (PT-BR, max 4000 chars)

```
BlackBelt e a plataforma completa para gestao de academias de artes marciais. Desenvolvida por quem entende o tatame, a ferramenta organiza toda a operacao da sua academia em um unico app — do check-in dos alunos ao controle financeiro.

PARA DONOS DE ACADEMIA E ADMINISTRADORES
• Dashboard com KPIs em tempo real: alunos ativos, presencas do mes, receita, inadimplencia
• Gestao completa de alunos: cadastro, historico, documentos, contato de responsaveis
• Controle financeiro: faturas, planos, receitas, relatorios de inadimplencia
• Grade de turmas e horarios com gestao de vagas
• Sistema de graduacao com requisitos por faixa e historico de exames
• Relatorios exportaveis para tomada de decisao
• Marketplace de academias para atrair novos alunos
• Gestao de campeonatos com chaves e resultados

PARA PROFESSORES
• Modo Aula: lista de chamada digital com QR Code
• Avaliacao de alunos com criterios personalizados
• Biblioteca de video-aulas para compartilhar com a turma
• Comunicacao direta com alunos e responsaveis
• Visualizacao da saude e evolucao dos alunos

PARA ALUNOS
• Check-in rapido por QR Code ou manual
• Acompanhamento do progresso de faixa com requisitos detalhados
• Acesso a video-aulas e conteudo exclusivo da academia
• Historico completo de presencas e graduacoes
• Conquistas e gamificacao para manter a motivacao

PARA RESPONSAVEIS (PAIS)
• Acompanhe a presenca e evolucao dos seus filhos
• Visualize pagamentos e faturas
• Comunicacao direta com professores
• Perfil dedicado para menores (Kids e Teen) com protecao de dados

9 PERFIS ESPECIALIZADOS
BlackBelt atende todos os envolvidos na academia com interfaces dedicadas: Administrador, Professor, Aluno Adulto, Teen, Kids, Responsavel, Recepcao, Super Admin e visitantes.

SEGURANCA E PRIVACIDADE
• Dados protegidos com criptografia
• Conformidade com LGPD
• Politica especial para dados de menores
• Cada academia isolada com multi-tenancy seguro

MODALIDADES
Jiu-Jitsu (BJJ), Judo, Karate, Taekwondo, MMA, Muay Thai, Boxe, Capoeira e qualquer arte marcial.

Experimente gratis. Transforme a gestao da sua academia.
```
(1.828 chars)

### Full Description (EN, max 4000 chars)

```
BlackBelt is the all-in-one management platform for martial arts academies. Built by people who understand the mat, it organizes your entire academy operation in a single app — from student check-ins to financial control.

FOR ACADEMY OWNERS AND ADMINISTRATORS
• Real-time dashboard with KPIs: active students, monthly attendance, revenue, delinquency
• Complete student management: registration, history, documents, guardian contacts
• Financial control: invoices, plans, revenue, delinquency reports
• Class schedules with capacity management
• Belt graduation system with requirements and exam history
• Exportable reports for decision-making

FOR INSTRUCTORS
• Class Mode: digital attendance with QR Code
• Student evaluation with custom criteria
• Video lesson library to share with students
• Direct communication with students and guardians

FOR STUDENTS
• Quick check-in via QR Code
• Belt progress tracking with detailed requirements
• Access to video lessons and exclusive content
• Complete attendance and graduation history
• Achievements and gamification

FOR PARENTS/GUARDIANS
• Track your children's attendance and progress
• View payments and invoices
• Direct communication with instructors
• Dedicated profiles for minors with data protection

9 SPECIALIZED PROFILES
BlackBelt serves everyone in the academy with dedicated interfaces: Administrator, Instructor, Adult Student, Teen, Kids, Guardian, Front Desk, Super Admin, and visitors.

Supports BJJ, Judo, Karate, Taekwondo, MMA, Muay Thai, Boxing, Capoeira, and any martial art.

Try it free. Transform your academy management.
```
(1.291 chars)

### Keywords (Apple, max 100 chars)
```
academia,artes marciais,bjj,jiu-jitsu,judo,karate,mma,gestao,presenca,alunos,faixas,graduacao
```
(93 chars)

### Promotional Text (Apple, max 170 chars)
```
Gerencie sua academia de artes marciais com BlackBelt: check-in por QR Code, controle de faixas, financeiro e video-aulas. 9 perfis especializados. Experimente gratis!
```
(168 chars)

### Category
- **Apple App Store**: Business (Primary), Education (Secondary)
- **Google Play**: Business

### Contact Info
- **Email**: suporte@blackbelt.app (PRECISA CONFIGURAR MX RECORDS)
- **Phone**: +55 11 99999-0000 (PRECISA NUMERO REAL)
- **Support URL**: https://blackbeltv2.vercel.app/contato
- **Privacy URL**: https://blackbeltv2.vercel.app/privacidade
- **Terms URL**: https://blackbeltv2.vercel.app/termos
- **Marketing URL**: https://blackbeltv2.vercel.app (ideal: https://blackbelt.app)

### App Review Notes (Apple — Draft, max 4000 chars)

```
BlackBelt is a B2B SaaS platform for martial arts academy management. It is NOT a consumer app — it is sold to academy owners who then invite their staff and students.

DEMO CREDENTIALS:

1. Admin (Academy Owner):
   Email: admin@demo.blackbelt.app
   Password: Demo@2026!
   What to test: Dashboard with KPIs, student management, financial reports, class schedules.

2. Professor (Instructor):
   Email: professor@demo.blackbelt.app
   Password: Demo@2026!
   What to test: Class Mode with attendance, student evaluation, video lessons, messaging.

3. Student:
   Email: aluno@demo.blackbelt.app
   Password: Demo@2026!
   What to test: Check-in, belt progress tracking, video content, attendance history.

4. Guardian (Parent):
   Email: responsavel@demo.blackbelt.app
   Password: Demo@2026!
   What to test: View children's attendance, payments, communicate with instructors.

TEST FLOW:
1. Open app → Login screen appears
2. Enter student credentials → Student dashboard loads
3. Tap check-in button (red FAB) → Select "Manual Check-in" (QR not available in review)
4. Confirm → Success toast
5. Navigate to: Classes, Progress, Content, Profile
6. Log out and try other profiles

PAYMENTS:
This app does NOT process payments in-app. BlackBelt is a B2B SaaS — academy owners subscribe through our website (blackbeltv2.vercel.app/precos). Students and parents do NOT pay through the app. Financial features shown in the app are management tools for academy owners to track external invoices.

CHILDREN'S DATA:
The app includes Kids and Teen profiles managed by parent/guardian accounts. All minor data handling complies with LGPD (Brazilian GDPR). See our children's privacy policy at: blackbeltv2.vercel.app/privacidade-menores

The app requires an internet connection to function.
```
(1.620 chars)

---

## ACOES NECESSARIAS

### Prioridade ALTA (bloqueiam submissao)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| A1 | Redigir Subtitle para App Store Connect | 5 min | Gregory — usar draft acima |
| A2 | Redigir Short Description para Google Play Console | 5 min | Gregory — usar draft acima |
| A3 | Redigir Full Description PT-BR para ambas as stores | 15 min | Gregory — usar draft acima, ajustar se necessario |
| A4 | Definir Keywords no App Store Connect | 5 min | Gregory — usar draft acima |
| A5 | Gerar screenshots iPhone 6.5" (1284x2778) | 1h | 5 screenshots minimas. Pode gerar no simulador iPhone 14 Plus ou redimensionar as de 6.7" |
| A6 | Configurar email `suporte@blackbelt.app` com MX records | 1h | Infra — dominio precisa receber email. Apple/Google testam o email |
| A7 | Substituir telefone placeholder `+55 11 99999-0000` | 5 min | Gregory — colocar numero real em `lib/config/legal.ts` |
| A8 | Copiar App Review Notes para App Store Connect | 10 min | Gregory — usar draft acima no campo "Notes" da versao |
| A9 | Redigir Promotional Text para Apple | 5 min | Gregory — usar draft acima |

### Prioridade MEDIA (melhoram aprovacao e conversao)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| M1 | Adicionar moldura de device + texto de destaque nas screenshots | 3h | Designer. Ferramenta: screenshots.pro ou appscreens.com. As 16 screenshots em `docs/store-screenshots/` parecem ter isso — validar |
| M2 | Gerar screenshots Android tablet 10" | 1h | 5 screenshots. Pode redimensionar as de 7" |
| M3 | Redigir Full Description em EN | 15 min | Usar draft acima |
| M4 | Redigir Store Listing em EN para ambas as stores | 30 min | Subtitle + Short Desc + Full Desc + Keywords |
| M5 | Configurar dominio proprio `blackbelt.app` como Marketing URL | 2h | Infra — comprar/configurar dominio se nao tem |
| M6 | Gravar App Preview video (15-30s) | 4h | Opcional mas aumenta conversao em ~25%. Mostrar check-in QR + dashboard + progresso de faixa |

### Prioridade BAIXA (nice-to-have)

| # | Acao | Esforco | Responsavel |
|---|------|---------|-------------|
| B1 | Criar versao EN do store listing completo | 1h | Para visibilidade em stores internacionais |
| B2 | A/B test de screenshots (Google Play Experiments) | 2h | Apos primeiro lancamento |

---

## RESUMO

| Metrica | Valor |
|---------|-------|
| **Total de itens auditados** | 28 |
| **Pronto** | 13 (46%) |
| **Parcial** | 5 (18%) |
| **Falta** | 10 (36%) |

### O que esta BOM
- App icon em todas as resolucoes (iOS 1024x1024, Android 512x512 + mipmaps)
- Feature Graphic 1024x500 para Google Play
- Screenshots existem para iPhone 6.7", iPad 12.9", Android phone, Android tablet 7"
- Splash screens configuradas para iOS e Android
- Pagina de suporte/contato funcional
- Politica de privacidade completa (12 secoes, LGPD, menores)
- Termos de uso existem
- Contas demo criadas e documentadas com fluxos de teste
- UI toda em PT-BR
- manifest.json bem configurado

### O que BLOQUEIA lancamento
1. **Faltam TODOS os textos de listing** — nenhum subtitle, short description, full description, keywords ou promotional text foi inserido nas stores. Os drafts acima resolvem isso.
2. **Faltam screenshots iPhone 6.5"** — Apple exige este tamanho separado. Sem ele, a submissao falha.
3. **Email de suporte provavelmente nao funciona** — `suporte@blackbelt.app` precisa de MX records configurados.
4. **Telefone e placeholder** — `+55 11 99999-0000` sera rejeitado pelo Google.

### Esforco estimado total
- **Bloqueadores**: ~2-3 horas (maioria e copiar drafts + gerar screenshots 6.5")
- **Melhorias**: ~8-10 horas (molduras, video, dominio)

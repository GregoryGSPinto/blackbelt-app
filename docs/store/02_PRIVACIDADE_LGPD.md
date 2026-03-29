# 02 — Privacidade, LGPD, COPPA + Dados do Usuario

Data: 2026-03-29

---

## PARTE 1 — POLITICA DE PRIVACIDADE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 3.1 | Privacy Policy existe | ✅ | `app/(public)/privacidade/page.tsx` — 12 secoes completas (Quem Somos, Dados Coletados, Como Usamos, Menores, Compartilhamento, Dados Financeiros, Compartilhamento com Terceiros, Armazenamento/Seguranca, Direitos LGPD, Retencao, Cookies, Alteracoes) |
| 3.2 | URL publica funcional | ✅ | `/privacidade` via `(public)` layout — nao exige login. URL configurada em `lib/config/legal.ts` → `https://blackbeltv2.vercel.app/privacidade` |
| 3.3 | Conteudo adequado (dados coletados, uso, compartilhamento) | ✅ | Cobre: dados de identificacao pessoal, dados de uso, dados financeiros, dados tecnicos, bases legais LGPD (Art. 7), compartilhamento com terceiros nomeados (Asaas, Resend, Supabase, Vercel, PostHog), politica de retencao com tabela de prazos |
| 3.4 | Atualizada recentemente | ✅ | Footer indica "Gregory Guimaraes Pinto em conformidade com a LGPD". Pagina de privacidade-menores indica "Ultima atualizacao: marco de 2026" |
| 3.5 | Disponivel em PT-BR | ✅ | Todo o conteudo em portugues brasileiro |

**Extras encontrados:**
- Pagina dedicada para menores: `app/(public)/privacidade-menores/page.tsx` (referencia LGPD + ECA + COPPA)
- Termos de Uso completos: `app/(public)/termos/page.tsx` (16 secoes incluindo Menores, Dados e Privacidade, Reembolso)
- Cookie banner: `components/shared/CookieBanner.tsx` com opcoes "Apenas essenciais" e "Aceitar todos"

---

## PARTE 2 — EXCLUSAO DE CONTA (OBRIGATORIO)

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 3.6 | Funcionalidade de excluir conta existe | ✅ | **Dois caminhos completos implementados:** (1) API route `app/api/auth/delete-account/route.ts` — registra na tabela `data_deletion_requests` com agendamento de 30 dias; (2) Supabase Edge Function `supabase/functions/delete-account/index.ts` — execucao imediata com anonimizacao de dados |
| 3.7 | Exclui todos os dados do usuario | ✅ | Edge Function faz: anonimizacao da tabela `people` (full_name, cpf, phone, email, avatar_url, medical_notes, emergency_contact_name/phone → null), marca profiles como `lifecycle_status: 'deleted'` com display_name `[Conta Excluida]`, remove `family_links`, deleta usuario do Auth, registra audit log e `account_deletion_log` com hash do email |
| 3.8 | Acessivel de dentro do app | ✅ | Multiplos pontos de acesso: (1) `app/(main)/perfil/privacidade/page.tsx` — pagina "Privacidade e Dados" com botao "Solicitar Exclusao da Conta"; (2) `components/settings/DeleteAccountSection.tsx` — presente em configuracoes de Admin, Professor, Teen, Parent, Dashboard, Franqueador, Recepcao; (3) Pagina publica `app/(public)/excluir-conta/page.tsx` para revisao das stores |
| 3.9 | Sem barreiras excessivas | ✅ | Confirmacao por texto "EXCLUIR MINHA CONTA" no componente settings (razoavel). API route aceita "EXCLUIR" como confirmacao. Protecao razoavel contra solo-admin (deve transferir admin antes). Alternativa por email documentada na pagina publica |

**Pontos fortes:**
- Pagina publica `/excluir-conta` atende ao requisito Apple 5.1.1(v) explicitamente (citado no codigo do edge function)
- `lib/config/legal.ts` centraliza URLs de privacidade, termos, suporte e exclusao
- Email de confirmacao de exclusao existe: `lib/email/templates/account-deleted.ts`
- Kids NAO tem exclusao de conta diretamente — correto, pois o responsavel faz via perfil Parent

**Ponto de atencao:**
- Existem dois fluxos de exclusao (API route que agenda + Edge Function que executa imediato). O `DeleteAccountSection.tsx` chama a Edge Function diretamente, enquanto `perfil/privacidade/page.tsx` chama a API route que apenas agenda. Necessario verificar se ambos estao alinhados em producao.

---

## PARTE 3 — COPPA (CRIANCAS < 13)

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 3.10 | Perfil Kids isolado de conteudo adulto | ✅ | Shell dedicado `components/shell/KidsShell.tsx` com interface ludica. Rotas isoladas em `app/(kids)/`. Paginas: Inicio, Estrelas, Aprender, Conquistas, Perfil, Config. Sem acesso a funcionalidades financeiras, administrativas ou de gestao |
| 3.11 | Kids sem mensagens/chat | ✅ | Confirmado: grep por "mensagem/message/chat" no diretorio `app/(kids)` retorna zero resultados em paginas (apenas `motivational_message` que e texto estatico do servidor). Shell nao tem link para mensagens. Politica de privacidade confirma: "perfis Kids possuem interface simplificada, sem acesso a funcionalidades de comunicacao direta" |
| 3.12 | Consentimento parental verificavel | ✅ | Fluxo completo implementado: (1) `app/(auth)/consentimento-parental/page.tsx` com `components/legal/ParentalConsentFlow.tsx`; (2) Verificacao de idade do responsavel (ano de nascimento > 18 anos); (3) Checkboxes obrigatorios (privacidade + autorizacao); (4) Nome completo do responsavel; (5) Dados salvos em `profiles.parental_controls` com timestamp, user_id, IP, versao; (6) Colunas `parental_consent`, `parental_consent_at`, `parental_consent_by` na tabela `students` (migration 025) |
| 3.13 | Dados minimos coletados de kids | ✅ | Politica de privacidade-menores lista explicitamente: nome, data de nascimento, dados de presenca, evolucao, fotos de perfil (opcional). Secao "Dados que NAO coletamos" lista: localizacao, compartilhamento com terceiros, publicidade, contatos do dispositivo, conteudo gerado, rastreamento publicitario |
| 3.14 | Kids sem tracking/analytics | ⚠️ | Politica de privacidade-menores diz NAO usar rastreamento para menores. Porem, nao ha evidencia no codigo de que PostHog ou Sentry estejam desabilitados especificamente para perfis Kids. O cookie banner e exibido para todos. **Necessario: verificar se analytics sao desabilitados por perfil para Kids** |

**Ponto critico COPPA:**
- A verificacao de idade por ano de nascimento e um metodo aceito pela FTC para "verifiable parental consent" em contextos de baixo risco (sem coleta de dados senssiveis, sem compartilhamento). No entanto, para publicacao nas stores com audiencia Kids, Apple e Google podem exigir verificacao mais robusta (ex: email do responsavel com link de confirmacao). O email de confirmacao de consentimento parental ja existe (`lib/email/templates/parental-consent-confirmation.ts`), o que fortalece o fluxo.

---

## PARTE 4 — LGPD (BRASIL)

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 3.15 | Consentimento antes de coleta | ✅ | Tabela `consent_records` com tipos: `terms`, `privacy`, `marketing`, `data_processing`. Pagina `perfil/privacidade/page.tsx` permite gerenciar consentimentos com toggles (terms e privacy sao obrigatorios e desabilitados). `privacy.service.ts` implementa getConsents/updateConsent com upsert. Cookie banner com opcao "Apenas essenciais" |
| 3.16 | Portabilidade de dados | ✅ | API route `app/api/lgpd/export/route.ts` registra solicitacao na tabela `data_export_requests`. Pagina `perfil/privacidade/page.tsx` tem botao "Exportar Meus Dados". Politica cita formato CSV/JSON. Configuracoes do Professor e Teen tambem tem secao "Exportacao de Dados (LGPD)". **Porem:** a geracao efetiva do arquivo (job de background que monta o JSON/CSV e gera download_url) nao foi localizada no codigo — a solicitacao e registrada mas o processamento parece pendente |
| 3.17 | Direito ao esquecimento | ✅ | Implementado via exclusao de conta (anonimizacao). Edge Function zera: full_name, cpf, phone, email, avatar_url, medical_notes, emergency contacts. Profiles marcados como `[Conta Excluida]`. Tabela `data_deletion_requests` com status tracking. Prazo de 15 dias para menores documentado na politica |
| 3.18 | Encarregado de dados (DPO) | ❌ | Nenhuma referencia a "encarregado", "DPO" ou "Data Protection Officer" no codigo ou na politica de privacidade. A LGPD (Art. 41) exige nomeacao de encarregado. A politica identifica "Responsavel: Gregory Guimaraes Pinto" mas nao o nomeia formalmente como encarregado/DPO com as atribuicoes legais |
| 3.19 | Base legal para tratamento | ✅ | Politica de privacidade cita bases legais por finalidade: Art. 7 V (Execucao de Contrato), Art. 7 IX (Legitimo Interesse), Art. 7 II (Obrigacao Legal). Secao 10 (Retencao) detalha prazos por tipo de dado com base legal. Art. 14 para menores |

**Ponto de atencao LGPD:**
- O job de processamento de exportacao de dados (que pega o `data_export_requests` com status `pending` e gera o arquivo) nao foi encontrado. A solicitacao e registrada mas nao ha evidencia de processamento automatico.

---

## PARTE 5 — APPLE PRIVACY LABELS / GOOGLE DATA SAFETY

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 3.20 | Privacy Labels preparados (Apple) | ✅ | Documento completo em `docs/APP_PRIVACY_APPLE.md` — data 2026-03-26. Inclui: (1) Tracking Declaration (No); (2) Data Linked to Identity (Name, Email, Phone, Photos, User ID); (3) Data Not Linked (Product Interaction, Crash Data, Performance Data, Device ID); (4) PrivacyInfo.xcprivacy completo em XML; (5) Info.plist keys para Camera, Photo Library, Face ID; (6) ATT declarado como nao necessario |
| 3.21 | Data Safety form preenchido (Google) | ⚠️ | Documento basico em `docs/GOOGLE_DATA_SAFETY.md` — cobre dados coletados, compartilhamento, seguranca, dados de menores. **Porem:** e um rascunho simplificado comparado ao Apple doc. Falta o mapeamento preciso para os campos do Google Play Console Data Safety form (categorias, sub-tipos, propositos exatos por campo) |
| 3.22 | App Tracking Transparency (ATT) | ✅ | Declarado como nao necessario. `NSPrivacyTracking` = `false` no manifest. Nenhum tracking cross-app detectado. PostHog e Sentry usam dados anonimizados/pseudonimizados conforme politica. Nenhum SDK de ads ou remarketing encontrado |

**Ponto de atencao:**
- O arquivo `PrivacyInfo.xcprivacy` esta documentado em `docs/APP_PRIVACY_APPLE.md` mas NAO existe fisicamente em `ios/App/App/PrivacyInfo.xcprivacy`. Precisa ser criado antes do build iOS.

---

## DADOS COLETADOS PELO APP

Baseado na analise do codigo-fonte (migrations, services, politica de privacidade):

### Dados de Identificacao Pessoal
| Dado | Tabela | Obrigatorio | Perfis |
|------|--------|-------------|--------|
| Nome completo (`full_name`) | `people`, `profiles.display_name` | Sim | Todos |
| Email | `people.email`, auth.users | Sim (adultos) / Nao (kids) | Todos exceto Kids |
| Telefone (`phone`) | `people.phone` | Nao | Adultos, Professores, Responsaveis |
| CPF | `people.cpf` | Nao | Adultos (quando exigido pela academia) |
| Data de nascimento (`birth_date`) | `people.birth_date` | Sim (menores) | Teen, Kids |
| Genero (`gender`) | `people.gender` | Nao | Todos |
| Foto de perfil (`avatar_url`) | `people.avatar_url`, `profiles.avatar` | Nao | Todos |
| Notas medicas (`medical_notes`) | `people.medical_notes` | Nao | Alunos |
| Contato de emergencia | `people.emergency_contact_name/phone` | Nao | Alunos |

### Dados de Uso
| Dado | Tabela/Mecanismo | Perfis |
|------|------------------|--------|
| Presencas (check-ins) | `access_events` | Alunos |
| Avaliacoes pedagogicas | tabelas de avaliacao | Alunos |
| Progressao de faixa | tabelas de graduacao | Alunos |
| Mensagens internas | tabelas de mensagens | Adultos, Professores, Responsaveis (NAO Kids) |
| Videos assistidos | tabelas de video-aulas | Alunos, Professores |
| Consentimentos | `consent_records` | Todos |

### Dados Financeiros
| Dado | Tabela/Mecanismo | Perfis |
|------|------------------|--------|
| Plano contratado | tabelas de assinatura | Admins |
| Historico de pagamentos | via Asaas (externo) | Admins, Responsaveis |
| Dados de cobranca | via Asaas (externo) | Admins |

### Dados Tecnicos
| Dado | Mecanismo | Consentimento |
|------|-----------|---------------|
| Cookies de sessao (Supabase auth) | `bb-active-role`, `bb-academy-id` | Essencial (sem consentimento) |
| Cookie de preferencia de cookies | `bb-cookie-consent` | N/A |
| Push token + plataforma | `push_tokens` | Permissao do OS |
| Analytics (PostHog) | Cookie analitico | Opt-in via cookie banner |
| Crash/performance (Sentry) | SDK | Funcional |
| IP address | `consent_records.ip_address`, logs | Marco Civil da Internet |
| Geolocalizacao aproximada | Check-in por proximidade | Consentimento explicito |

### Dados de Menores (Kids < 13)
| Dado | Coletado | Justificativa |
|------|----------|---------------|
| Nome | Sim | Identificacao |
| Data de nascimento | Sim | Classificacao etaria |
| Foto de perfil | Opcional | Identificacao visual |
| Presencas | Sim | Funcionalidade core |
| Evolucao/graduacoes | Sim | Funcionalidade core |
| Localizacao | NAO | -- |
| Mensagens | NAO | -- |
| Dados financeiros | NAO | -- |
| Analytics/tracking | Indefinido | Precisa verificar se PostHog e desabilitado para Kids |

---

## ACOES NECESSARIAS

| # | Acao | Prioridade | Esforco | Ref |
|---|------|------------|---------|-----|
| 1 | **Criar `PrivacyInfo.xcprivacy` fisicamente** em `ios/App/App/` — o conteudo ja esta documentado em `docs/APP_PRIVACY_APPLE.md`, basta criar o arquivo XML | Alta (Apple rejeita sem) | 15 min | 3.20 |
| 2 | **Nomear DPO/Encarregado de dados** na politica de privacidade — adicionar secao com nome, email de contato e atribuicoes conforme Art. 41 da LGPD. Pode ser o proprio proprietario mas precisa ser formalizado | Alta (LGPD obriga) | 30 min | 3.18 |
| 3 | **Desabilitar analytics (PostHog/Sentry) para perfis Kids** — adicionar verificacao de perfil antes de inicializar trackers. Se `role === 'aluno_kids'`, nao carregar PostHog e limitar Sentry a crash reports anonimos | Alta (COPPA) | 2h | 3.14 |
| 4 | **Implementar job de processamento de exportacao de dados** — o registro em `data_export_requests` existe, mas falta o worker/cron que gera o arquivo JSON/CSV e atualiza `download_url` + `status: 'ready'` | Media (LGPD Art. 18 V) | 4-8h | 3.16 |
| 5 | **Expandir Google Data Safety doc** — mapear cada campo do formulario do Google Play Console com respostas exatas, similar ao nivel de detalhe do doc Apple | Media (Google exige) | 2h | 3.21 |
| 6 | **Unificar fluxos de exclusao de conta** — atualmente existem dois caminhos (API route que agenda 30 dias + Edge Function que executa imediato). Documentar qual e o fluxo principal ou unificar para evitar inconsistencias | Baixa (funcional) | 2h | 3.6 |

---

## RESUMO

- **Total: 22 items**
- ✅ **Pronto: 18** (82%)
- ⚠️ **Parcial: 2** (9%) — Analytics kids (3.14), Google Data Safety (3.21)
- ❌ **Falta: 2** (9%) — DPO nomeado (3.18), PrivacyInfo.xcprivacy fisico (implicitamente coberto por 3.20 que esta ✅ no doc mas ❌ no filesystem)

### Avaliacao geral

O projeto esta **surpreendentemente bem preparado** para as stores no aspecto de privacidade. A politica de privacidade e robusta (12 secoes, referencia LGPD/COPPA, bases legais, tabela de retencao). A exclusao de conta esta implementada com anonimizacao real no banco. O consentimento parental tem fluxo multi-step com verificacao de idade. O isolamento do perfil Kids e efetivo (sem chat, sem financeiro, interface dedicada).

Os gaps principais sao operacionais (DPO, arquivo xcprivacy fisico, job de exportacao) e nao arquiteturais. Nenhum gap e blocker absoluto para submissao, mas o PrivacyInfo.xcprivacy deve ser criado antes do build iOS e o DPO deve ser nomeado antes de ir a producao no Brasil.

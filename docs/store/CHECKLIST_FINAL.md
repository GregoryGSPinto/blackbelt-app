# Checklist Final de Pré-Submissão — BlackBelt

Data: 2026-03-29
Checklist completo para submissão no Apple App Store e Google Play Store.

---

## Apple App Store

### Conta e Certificados

- [ ] Conta Apple Developer Program criada e aprovada (US$99/ano)
- [ ] Certificado de distribuição iOS gerado (Distribution Certificate)
- [ ] Provisioning Profile de distribuição criado (App Store Distribution)
- [ ] App ID registrado: `app.blackbelt.academy`
- [ ] TEAM_ID preenchido no apple-app-site-association (AASA)
- [ ] Entitlement para Associated Domains configurado
- [ ] Push notification entitlement configurado
- [ ] App registrado no App Store Connect

### Build

- [ ] Build de produção gerada sem erros (`pnpm build && npx cap sync ios`)
- [ ] Archive criado no Xcode (Product > Archive)
- [ ] Build uploaded para App Store Connect via Xcode ou Transporter
- [ ] Build processada com sucesso no App Store Connect (sem erros de validação)
- [ ] Version number: 1.0.0
- [ ] Build number incrementado corretamente
- [ ] `NSCameraUsageDescription` presente no Info.plist
- [ ] `NSPhotoLibraryUsageDescription` presente no Info.plist
- [ ] `PrivacyInfo.xcprivacy` criado e adicionado ao target
- [ ] Sem crashes em teste de 30 minutos no device real
- [ ] App funciona em iPhone e iPad

### Metadata e Listing

- [ ] App Name: "BlackBelt"
- [ ] Subtitle: "Gestão de Academias Marciais" (29 chars)
- [ ] Promotional Text colado (168 chars — ver STORE_METADATA.md)
- [ ] Description PT-BR colada (ver STORE_METADATA.md)
- [ ] Description EN colada na localização English
- [ ] Keywords coladas (93 chars — ver STORE_METADATA.md)
- [ ] What's New preenchido ("Versão inicial do BlackBelt" ou similar)
- [ ] Support URL: https://blackbeltv2.vercel.app/contato
- [ ] Marketing URL: https://blackbeltv2.vercel.app
- [ ] Privacy Policy URL: https://blackbeltv2.vercel.app/privacidade

### Screenshots e Assets

- [ ] App Icon 1024x1024 uploaded
- [ ] Screenshots iPhone 6.7" (1290x2796) — mínimo 3, ideal 5
- [ ] Screenshots iPhone 6.5" (1284x2778) — mínimo 3, ideal 5
- [ ] Screenshots iPad 12.9" (2048x2732) — mínimo 3, ideal 5
- [ ] App Preview video (opcional, mas recomendado)

### Privacy Labels (App Privacy)

- [ ] Seção "Data Used to Track You": declarar que NÃO rastreia
- [ ] Seção "Data Linked to You": declarar dados coletados (nome, email, usage data)
- [ ] Seção "Data Not Linked to You": declarar dados de diagnóstico (se aplicável)
- [ ] Verificar se declarações batem com PrivacyInfo.xcprivacy

### Age Rating

- [ ] Age rating preenchido: 12+
- [ ] Categorias marcadas: Infrequent/Mild Mature/Suggestive Themes (artes marciais)
- [ ] Unrestricted Web Access: No
- [ ] Gambling: No
- [ ] Made for Kids: NO (app é B2B, não infantil)

### App Review

- [ ] App Review Notes coladas (ver STORE_METADATA.md — seção Apple App Review Notes)
- [ ] Demo Account Email: roberto@guerreiros.com
- [ ] Demo Account Password: BlackBelt@2026
- [ ] Login testado com credenciais demo — funciona sem 2FA/verificação de email
- [ ] Contact Information para reviewer preenchida (nome, email, telefone)

### Categorias

- [ ] Primary Category: Business
- [ ] Secondary Category: Education

### Compliance

- [ ] Não usa IAP — justificativa B2B pronta (ver APPLE_MONETIZATION_JUSTIFICATION.md)
- [ ] Não usa IDFA (App Tracking Transparency não necessário)
- [ ] Não usa criptografia proprietária (usa HTTPS padrão — declarar isenção)
- [ ] Conteúdo de menores documentado (ver COPPA_COMPLIANCE.md)

---

## Google Play Store

### Conta e Configuração

- [ ] Conta Google Play Console criada (US$25 taxa única)
- [ ] Verificação de organização aprovada (pode levar até 14 dias)
- [ ] Developer profile preenchido (nome, email, telefone, website)

### Build

- [ ] Keystore Android gerado e armazenado em local seguro
- [ ] signingConfigs configurado em `android/app/build.gradle`
- [ ] AAB (Android App Bundle) gerado sem erros
- [ ] AAB assinado com keystore de produção
- [ ] Version code e version name configurados
- [ ] `google-services.json` configurado (Firebase para push notifications)
- [ ] Sem crashes em teste de 30 minutos no device real
- [ ] App funciona em phones e tablets

### Store Listing

- [ ] App Name: "BlackBelt"
- [ ] Short Description colada (78 chars — ver STORE_METADATA.md)
- [ ] Full Description PT-BR colada (ver STORE_METADATA.md)
- [ ] Full Description EN colada na localização English
- [ ] App Icon 512x512 uploaded
- [ ] Feature Graphic 1024x500 uploaded
- [ ] Screenshots phone (1080x1920) — mínimo 2, ideal 5+
- [ ] Screenshots tablet 7" (1200x1920) — recomendado
- [ ] Screenshots tablet 10" — recomendado
- [ ] App Category: Business
- [ ] Contact email funcional (NÃO placeholder)
- [ ] Contact phone real (NÃO +55 11 99999-0000)
- [ ] Website URL: https://blackbeltv2.vercel.app
- [ ] Privacy Policy URL: https://blackbeltv2.vercel.app/privacidade

### Data Safety Form

- [ ] Seção preenchida no Google Play Console
- [ ] Coleta de dados declarada: nome, email, foto (opcional), dados de uso
- [ ] Compartilhamento com terceiros: Supabase (infra), Bunny (vídeo CDN), Asaas (pagamentos)
- [ ] Criptografia em trânsito: Sim (HTTPS)
- [ ] Exclusão de dados: Sim (usuário pode solicitar via /excluir-conta)
- [ ] Dados de menores declarados conforme política de crianças
- [ ] Referência: GOOGLE_DATA_SAFETY_FORM.md

### Content Rating (IARC)

- [ ] Questionário IARC preenchido no Play Console
- [ ] Rating esperado: Everyone 10+ (Mild Violence — artes marciais educacional)
- [ ] Categorias respondidas: Violence (mild, educational), User Interaction (messaging)
- [ ] Sem gambling, sem nudity, sem profanity intencional

### Target Audience e Conteúdo Infantil

- [ ] Target audience declarado: 13+ (NÃO declarar "primarily for children")
- [ ] App é B2B — target é academias de artes marciais (empresas)
- [ ] Se questionado sobre crianças: módulo Kids é funcionalidade secundária sob supervisão parental
- [ ] Não inscrever no programa Designed for Families
- [ ] Documentação COPPA pronta (ver COPPA_COMPLIANCE.md)

### Policies

- [ ] App não viola política de conteúdo do Google Play
- [ ] Sem marcas registradas de terceiros (mocks limpos)
- [ ] Modelo de monetização documentado (B2B SaaS, sem Google Play Billing obrigatório)

---

## Ambas as Stores — Verificações Gerais

### Backend e Infraestrutura

- [ ] Backend ativo 24/7: https://blackbeltv2.vercel.app
- [ ] Supabase (banco de dados) ativo e respondendo
- [ ] Bunny Stream (vídeo CDN) ativo
- [ ] Asaas (gateway de pagamento) ativo (sandbox para demo)
- [ ] Email de suporte funcional (recebe e responde emails)

### Contas Demo

- [ ] Conta admin criada no ambiente de produção: roberto@guerreiros.com / BlackBelt@2026
- [ ] Conta professor criada: professor@demo.blackbelt.app / Demo@2026!
- [ ] Conta aluno criada: aluno@demo.blackbelt.app / Demo@2026!
- [ ] Conta responsável criada: responsavel@demo.blackbelt.app / Demo@2026!
- [ ] Academia demo "Guerreiros do Tatame" populada com dados realistas
- [ ] Login funciona sem verificação de email e sem 2FA
- [ ] Todos os fluxos principais testados com cada conta

### Qualidade e Estabilidade

- [ ] Zero crashes em 30 minutos de uso contínuo
- [ ] App carrega em menos de 5 segundos no primeiro acesso
- [ ] Todas as telas carregam sem erro (testar navegação completa)
- [ ] Skeleton loading funciona em todas as listas
- [ ] Empty states aparecem quando não há dados
- [ ] Error boundaries capturam erros sem crash
- [ ] `pnpm build` passa sem erros
- [ ] `pnpm typecheck` passa sem erros
- [ ] `pnpm lint` passa sem erros (ou apenas warnings não-bloqueantes)

### Build Limpo

- [ ] Sem console.log de debug em produção
- [ ] Sem TODO/FIXME críticos em código de produção
- [ ] Sem credenciais/secrets hardcoded (exceto em .env)
- [ ] Sem referências a localhost ou URLs de desenvolvimento
- [ ] Sem marcas registradas de terceiros em mocks

### Legal e Compliance

- [ ] Política de privacidade acessível e funcional
- [ ] Política de privacidade de menores acessível
- [ ] Termos de uso acessíveis
- [ ] Página de exclusão de conta funcional (/excluir-conta)
- [ ] Página de suporte/contato funcional (/contato)
- [ ] Telefone de contato é número real (NÃO placeholder)
- [ ] Email de contato funcional (MX records configurados)

### Documentação Pronta

- [ ] STORE_METADATA.md — textos de listing ✅
- [ ] STORE_REVIEW_CREDENTIALS.md — credenciais demo ✅
- [ ] APPLE_MONETIZATION_JUSTIFICATION.md — justificativa IAP ✅
- [ ] COPPA_COMPLIANCE.md — conformidade menores ✅
- [ ] GOOGLE_DATA_SAFETY_FORM.md — formulário data safety ✅
- [ ] Este checklist (CHECKLIST_FINAL.md) ✅

---

## Ações Pendentes (Gregory)

| # | Ação | Prioridade | Status |
|---|------|-----------|--------|
| 1 | Criar conta Apple Developer Program | ALTA | [ ] |
| 2 | Criar conta Google Play Console | ALTA | [ ] |
| 3 | Substituir telefone placeholder por número real em `lib/config/legal.ts` | ALTA | [ ] |
| 4 | Configurar MX records para suporte@blackbelt.app | ALTA | [ ] |
| 5 | Gerar screenshots iPhone 6.5" (1284x2778) | ALTA | [ ] |
| 6 | Gerar certificados iOS (distribuição + provisioning) | ALTA | [ ] |
| 7 | Gerar keystore Android | ALTA | [ ] |
| 8 | Configurar Firebase (google-services.json + GoogleService-Info.plist) | ALTA | [ ] |
| 9 | Criar contas demo no ambiente de produção | ALTA | [ ] |
| 10 | Popular academia demo com dados realistas | ALTA | [ ] |
| 11 | Copiar todos os textos de listing para as stores | MÉDIA | [ ] |
| 12 | Preencher IARC + Data Safety + Privacy Labels | MÉDIA | [ ] |
| 13 | Testar build em device físico (iOS + Android) | ALTA | [ ] |
| 14 | Submeter para review | FINAL | [ ] |

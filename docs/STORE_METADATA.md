# BlackBelt v2 — Store Metadata

## App Store (iOS)

- **App Name:** BlackBelt — Gestão de Academias
- **Subtitle:** Check-in, turmas, cobranças e presença
- **Category:** Business
- **Secondary Category:** Sports
- **Age Rating:** 4+
- **Price:** Free (in-app subscription)
- **Privacy URL:** https://blackbeltv2.vercel.app/privacidade
- **Support URL:** https://blackbeltv2.vercel.app/contato
- **Marketing URL:** https://blackbeltv2.vercel.app
- **Keywords:** academia,artes marciais,jiu jitsu,bjj,check-in,turmas,presença,cobrança,gestão,karate,judo,mma

### Description

BlackBelt é o sistema de gestão completo para academias de artes marciais. Gerencie alunos, turmas, presença, cobranças e comunicação em um único app.

- Dashboard com KPIs em tempo real
- Check-in por QR Code, proximidade ou recepção
- Gestão de turmas e horários
- Cobranças via PIX, boleto ou cartão (Asaas)
- 9 perfis: Admin, Professor, Aluno, Teen, Kids, Responsável e mais
- Gamificação para alunos teen
- Relatórios financeiros e de presença
- Comunicação com responsáveis
- Loja interna da academia

### Review Notes

```
Email: roberto@guerreiros.com
Password: BlackBelt@2026
Profile: Admin — Academia "Guerreiros do Tatame"
The app requires an academy account. Use the credentials above to access the full admin experience.
```

## Google Play (Android)

- **App Name:** BlackBelt — Gestão de Academias
- **Short Description (80 chars):** Gestão completa para academias de artes marciais. Check-in, turmas e progresso.
- **Full Description:** (mesma do iOS acima)
- **Category:** Business
- **Content Rating:** Everyone
- **Privacy Policy URL:** https://blackbeltv2.vercel.app/privacidade
- **Contact Email:** gregoryguimaraes12@gmail.com
- **Contact Phone:** +55 31 99679-3625

### Data Safety

- Account creation required: Yes
- Data shared with third parties: No
- Data collected: Name, email, phone (for account), usage data (analytics)
- Data encrypted in transit: Yes
- Data deletion: Users can request via app or https://blackbeltv2.vercel.app/excluir-conta

## Screenshots

Gerados automaticamente em `docs/screenshots/` via `scripts/take-screenshots.sh`.

| Dispositivo | Resolução | Arquivos |
|-------------|-----------|----------|
| iPhone 15 Pro Max | 1290x2796 | iPhone_15_Pro_Max_*.png |
| iPhone 8 Plus | 1242x2208 | iPhone_8_Plus_*.png |
| iPad Pro 12.9" | 2048x2732 | iPad_Pro_12.9_*.png |
| Android Phone | 1080x1920 | Android_Phone_*.png |
| Android 7" | 1200x1920 | Android_7inch_*.png |

## Configuração Supabase para Testes

Para permitir login sem confirmação de email (ambiente de teste/review):

1. Supabase Dashboard → Authentication → Providers → Email
2. Desmarcar "Confirm email"
3. Isso permite que reviewers da Apple/Google façam login com as credenciais de teste

Para produção com clientes reais, reativar confirmação de email.

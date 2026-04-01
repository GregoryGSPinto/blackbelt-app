# BlackBelt Store Review Credentials Template

Data: 2026-04-01
Objetivo: material pronto para preencher antes da submissão

## Status

- Verificado no código: o app exige login para uso principal
- Dependente de console/conta: `sim`
- Situação atual: `pendente`

## Conta principal para review

Preencher com uma conta real em produção ou ambiente estável de review. Não submeter com placeholders.

| Campo | Preencher |
|---|---|
| Environment | Production / Stable review environment |
| Login URL | `https://blackbeltv2.vercel.app/login` |
| Email | `REPLACE_WITH_REAL_REVIEW_EMAIL` |
| Password | `REPLACE_WITH_REAL_REVIEW_PASSWORD` |
| Role | `Academy admin` |
| Academy name | `REPLACE_WITH_DEMO_ACADEMY_NAME` |
| OTP / 2FA | `Disabled for reviewer` |
| Email verification | `Already completed` |
| Required seed data | `Students, classes, attendance, invoices, videos` |

## Contas complementares

Criar apenas se forem necessárias para provar fluxos específicos.

| Role | Email | Password | Uso |
|---|---|---|---|
| Professor | `REPLACE_WITH_REAL_EMAIL` | `REPLACE_WITH_REAL_PASSWORD` | Aula, chamada, conteúdo |
| Student | `REPLACE_WITH_REAL_EMAIL` | `REPLACE_WITH_REAL_PASSWORD` | Check-in, progresso, conteúdo |
| Guardian | `REPLACE_WITH_REAL_EMAIL` | `REPLACE_WITH_REAL_PASSWORD` | Filhos, presença, pagamentos |

## Texto pronto para App Review Notes

```text
BlackBelt is a B2B SaaS app for martial arts academy management. Login is required because all data is academy-specific and role-based.

Review account:
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

This account has administrator access to a demo academy with sample students, classes, attendance records, invoices, and video content.

How to review:
1. Sign in with the account above.
2. Open Dashboard to verify KPIs and operational overview.
3. Open Students and Classes to verify academy management flows.
4. Open Finance to verify invoice and payment tracking.
5. Open Content to verify the video library.

Important notes:
- This app does not sell digital goods to end users. BlackBelt is sold as a B2B SaaS subscription to academy owners outside the app.
- Student billing inside the product is an academy operational feature, not a BlackBelt subscription purchase.
- If camera-based QR check-in is not practical during review, use the manual check-in flow.
- Push notifications require a physical device and may not be visible in simulator-based review.
```

## Texto pronto para Google Play App Access

```text
The app requires authentication because it is a role-based management platform for martial arts academies.

Login URL: https://blackbeltv2.vercel.app/login
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

This account has administrator access to a demo academy with sample students, classes, attendance records, invoices, and video content.

No OTP, email verification, or secondary approval should be required for this review account.
```

## Checklist mínimo antes de colar nos consoles

- [ ] Conta real criada
- [ ] Login provado em dispositivo físico
- [ ] Sem OTP/2FA
- [ ] Sem obrigar troca de senha no primeiro acesso
- [ ] Dados demo suficientes para navegação
- [ ] Financeiro com exemplos realistas
- [ ] Conteúdo em vídeo acessível
- [ ] Manual check-in funcional como fallback

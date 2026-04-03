# Store Review Credentials Template

Data: 2026-04-01
Estado: `pendente externo`

## Conta principal obrigatória

| Campo | Valor |
|---|---|
| Login URL | `https://blackbeltv2.vercel.app/login` |
| Email | `REPLACE_WITH_REAL_REVIEW_EMAIL` |
| Password | `REPLACE_WITH_REAL_REVIEW_PASSWORD` |
| Role | `Academy admin` |
| Academy | `REPLACE_WITH_DEMO_ACADEMY_NAME` |
| OTP / 2FA | `Disabled` |
| Email verification | `Already completed` |

## Seed mínimo obrigatório

- alunos cadastrados
- turmas criadas
- presença/check-in com dados
- financeiro com faturas
- vídeos/conteúdo disponíveis

## Texto para Apple Review Notes

```text
BlackBelt is a B2B SaaS app for martial arts academy management. Login is required because all data is academy-specific and role-based.

Review account:
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

This account has administrator access to a demo academy with students, classes, attendance, invoices, and content already populated.

Account deletion can be requested inside the app or at https://blackbeltv2.vercel.app/excluir-conta. The request is registered immediately and final deletion occurs within up to 30 days.

Public support is available at https://blackbeltv2.vercel.app/suporte.

The current validated mobile runtime connects to the hosted application backend at https://blackbeltv2.vercel.app.
```

## Texto para Google App Access

```text
The app requires authentication because it is a role-based management platform for martial arts academies.

Login URL: https://blackbeltv2.vercel.app/login
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

No OTP, email verification, or password reset should be required for the review account.
```

## Checklist

- [ ] conta criada em ambiente real
- [ ] sem OTP/2FA
- [ ] sem troca de senha obrigatória
- [ ] login testado no app móvel
- [ ] dados demo suficientes
- [ ] links internos principais navegáveis

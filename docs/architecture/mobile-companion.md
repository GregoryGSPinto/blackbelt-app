# Mobile Companion

## Papel do mobile

iOS e Android são companions operacionais do produto autenticado BlackBelt. Eles representam o mesmo sistema que roda em `app.blackbelt.com`, não um site comercial embrulhado.

## Relação com web e API

- runtime do app: `app.blackbelt.com`
- backend: `api.blackbelt.com`
- marketing: `blackbelt.com`

O bundle mobile deve depender apenas do runtime do app e das páginas públicas operacionais necessárias para stores, auth e suporte.

## Rotas públicas store-safe

- `termos`
- `privacidade`
- `privacidade-menores`
- `suporte`
- `excluir-conta`
- `status`
- auth, convite, reset e onboarding

## Estado atual honesto

- a base de Capacitor já está integrada ao app autenticado
- ainda existem blockers de release fora desta reorganização estrutural, como placeholders de deep link e assinatura mobile
- a documentação de stores e release vive em `docs/store/` e `docs/release/`

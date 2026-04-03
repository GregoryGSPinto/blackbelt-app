# blackbelt-site

Scaffold do repositório público comercial do BlackBelt.

Este starter existe para manter a fronteira correta com `blackbelt-app`: o app autenticado e o companion mobile permanecem no núcleo operacional, enquanto aquisição, storytelling e conteúdo institucional vivem em `blackbelts.com.br`.

## Responsabilidades

- landing
- planos
- demo
- trial
- contato comercial
- páginas institucionais
- pricing e aquisição
- blog e SEO
- páginas legais que a operação decidir publicar fora do app
- SEO, aquisição e storytelling comercial

## Estrutura Inicial

```text
blackbelt-site/
  app/
    (marketing)/
    (legal)/
    (support)/
    api/
  components/
    marketing/
    forms/
    legal/
  content/
  public/
  styles/
  tests/
  scripts/
  docs/
  .github/
```

## Deploy

- produção: `blackbelts.com.br`
- preview: Vercel
- superfície alvo: `blackbelts.com.br`
- o app autenticado fica em `app.blackbelts.com.br`
- redirects temporários no app podem apontar para este domínio durante a extração

## Passos Remotos

```bash
gh repo create blackbelt-site --public --description "Public marketing website for BlackBelt"
```

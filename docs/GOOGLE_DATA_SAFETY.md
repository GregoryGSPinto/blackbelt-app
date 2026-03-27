# BlackBelt v2 — Google Play Data Safety Declarations

## Dados coletados:

### Informacoes pessoais
- Nome (obrigatorio para cadastro)
- Email (obrigatorio para login, opcional para kids)
- Telefone (obrigatorio para contato)
- Data de nascimento (para determinar faixa etaria)
- CPF (opcional, usado para contratos)
- Fotos (opcional, perfil)

### Dados de uso
- Frequencia/presenca (funcionalidade core)
- Interacoes no app (analytics PostHog)
- Crash logs (Sentry)

### Dados financeiros
- Historico de pagamentos (via Asaas — processado externamente)
- Plano/assinatura

## Compartilhamento:
- Asaas: dados financeiros para processamento de pagamento
- Resend: email para envio de comunicacoes
- PostHog: dados anonimizados de uso
- Sentry: crash reports com contexto

## Seguranca:
- Dados criptografados em transito (HTTPS/TLS)
- Dados criptografados em repouso (Supabase encripta)
- Usuario pode solicitar exclusao (botao in-app)

## Dados de menores:
- Coleta dados de menores de 13 anos COM consentimento parental verificavel
- NAO exibe anuncios
- NAO compartilha dados de menores com terceiros
- NAO rastreia localizacao de menores

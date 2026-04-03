# Sistema de Tickets de Suporte

## Status: PLANEJADO — Nao e escopo de lancamento v5.0

## Situacao Atual

O BlackBelt possui um widget de suporte (`SupportWidget`) e servico de monitoramento
de sessoes (`suporte.service.ts`), mas **nao possui um sistema formal de tickets**.

O suporte atual e feito via:
- Widget de suporte in-app (chat rapido)
- Pagina publica `/suporte` para contato
- Pagina publica `/contato` como fallback

## Decisao

Sistema de tickets **nao e requisito para lancamento nas stores**.
Sera implementado em versao futura (v5.x ou v6.x) com:

1. **Criacao de ticket** pelo usuario (qualquer role)
2. **Fila de atendimento** visivel para Admin e SuperAdmin
3. **Categorizacao**: Bug, Duvida, Financeiro, Sugestao
4. **Status flow**: Aberto → Em andamento → Resolvido → Fechado
5. **Notificacoes** push/email para atualizacoes
6. **SLA tracking** por categoria

## Alternativa Atual

Para o lancamento, o suporte e gerenciado externamente (email/WhatsApp),
com o widget in-app servindo como ponto de contato inicial.

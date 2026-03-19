# BlackBelt v2 — Roadmap Fases 2 e 3

## Status Atual
- **Fase 1 (Vendas):** ✅ Implementada
  - WhatsApp Integration (30 templates, automações, histórico)
  - Gateway de Pagamento (Asaas/Stripe, PIX, boleto, cartão)
  - Landing Page Pública (/g/[slug] com formulário experimental)
  - Previsão de Churn (score algorítmico, ações sugeridas)

---

## Fase 2 — Retenção e Operação
> Executar após 5+ academias ativas

### Feature 5: Sincronização Google/Apple Calendar
- **Prioridade:** Alta
- **Estimativa:** 1 sprint (2 semanas)
- **Descrição:** Gerar feed iCal (.ics) por aluno. O aluno adiciona a URL no app de calendário e as aulas sincronizam automaticamente.
- **Escopo:** generateICalFeed, getCalendarUrl, toggle em configurações, QR code para o aluno

### Feature 6: Assinatura Digital de Contratos
- **Prioridade:** Alta
- **Estimativa:** 2 sprints
- **Descrição:** Templates de contrato com variáveis, envio por WhatsApp/email, assinatura com dedo (canvas touch), PDF gerado com timestamp + IP.
- **Escopo:** CRUD de templates, página /assinar/[token], geração de PDF, integração WhatsApp

### Feature 7: Marketing Automático (Sequências)
- **Prioridade:** Média
- **Estimativa:** 2 sprints
- **Descrição:** Sequências de mensagens baseadas em eventos/tempo (onboarding, reativação, lead→matrícula, upsell).
- **Escopo:** 4 sequências pré-definidas, editor drag & drop, stats de conversão

### Feature 8: Torneios com Chaveamento
- **Prioridade:** Média
- **Estimativa:** 3 sprints
- **Descrição:** Campeonato completo: inscrição → pesagem → chaveamento automático → registro de resultado → pódio.
- **Escopo:** Bracket SVG interativo, eliminatória simples/dupla, certificado PDF

### Feature 9: Relatório de Progresso Imprimível
- **Prioridade:** Alta
- **Estimativa:** 1 sprint
- **Descrição:** PDF bonito com evolução do aluno (presença, critérios, conquistas, observação do professor). Envio por WhatsApp aos pais.
- **Escopo:** Geração de PDF, envio em lote, dashboard do responsável

---

## Fase 3 — Escala
> Executar após 20+ academias ativas

### Feature 10: Internacionalização (i18n)
- **Prioridade:** Alta (para expansão)
- **Estimativa:** 3 sprints
- **Descrição:** next-intl para pt-BR, en-US, es-ES. Toda string visível traduzida. Datas/moedas formatadas por locale.
- **Dependência:** Nenhuma feature bloqueante

### Feature 11: Multi-Moeda
- **Prioridade:** Média
- **Estimativa:** 1 sprint
- **Descrição:** Suporte a BRL, USD, EUR, MXN, COP. Moeda definida por academia. Gateway por região (Asaas Brasil, Stripe global, MercadoPago LATAM).
- **Dependência:** Feature 10 (i18n)

### Feature 12: Marketplace de Conteúdo
- **Prioridade:** Baixa
- **Estimativa:** 4 sprints
- **Descrição:** Professores renomados vendem cursos para academias da plataforma. Revenue share 70/30.
- **Dependência:** Sistema de vídeos completo

### Feature 13: API Pública + Webhooks
- **Prioridade:** Alta
- **Estimativa:** 3 sprints
- **Descrição:** REST API documentada com OAuth2. Endpoints para students, classes, attendance, invoices. Webhooks para eventos. Swagger/OpenAPI.
- **Dependência:** Nenhuma

### Feature 14: Integração com Federações
- **Prioridade:** Baixa (MOAT competitivo)
- **Estimativa:** 4+ sprints
- **Descrição:** Registro de faixa reconhecido por IBJJF/CBJJ. QR code na carteirinha valida faixa. Ranking federado. Certificados digitais assinados.
- **Dependência:** Features 10, 13

---

## Prioridade de Execução

| # | Feature | Prioridade | Estimativa | Dependências |
|---|---------|-----------|------------|-------------|
| 5 | Calendar Sync | Alta | 2 sem | - |
| 6 | Assinatura Digital | Alta | 4 sem | - |
| 9 | Relatório Progresso | Alta | 2 sem | - |
| 7 | Marketing Automático | Média | 4 sem | Feature 1 (WhatsApp) |
| 8 | Torneios | Média | 6 sem | - |
| 10 | i18n | Alta | 6 sem | - |
| 13 | API Pública | Alta | 6 sem | - |
| 11 | Multi-Moeda | Média | 2 sem | Feature 10 |
| 12 | Marketplace | Baixa | 8 sem | Vídeos |
| 14 | Federações | Baixa | 8+ sem | Features 10, 13 |

---

*Documento gerado em Março 2026. Atualizar conforme evolução do produto.*

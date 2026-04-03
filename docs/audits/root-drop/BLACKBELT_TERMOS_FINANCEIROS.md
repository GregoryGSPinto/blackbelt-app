# BLACKBELT v2 + PRIMALWOD — ATUALIZAR TERMOS COM CLÁUSULAS FINANCEIRAS
## Incluir: taxas, Asaas como processador, repasse, reembolso, subconta
## Aceite obrigatório no wizard de cadastro

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B4)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - ESTE PROMPT É PARA O BLACKBELT v2
> - Depois gero versão adaptada pro PrimalWOD

---

## BLOCO 1 — ATUALIZAR PÁGINA DE TERMOS DE USO

Encontrar a página de termos existente:
```bash
find app -path "*termos*" -name "page.tsx" | head -5
```

Abrir o arquivo e ADICIONAR as seguintes seções (não apagar o que já existe — inserir APÓS as cláusulas existentes):

### Seções a adicionar:

```markdown
## 7. Planos e Assinatura

7.1. O BlackBelt oferece planos de assinatura mensal para academias de artes marciais.
Os planos disponíveis, seus valores e funcionalidades estão detalhados na página de
cadastro e podem ser atualizados a qualquer momento mediante aviso prévio de 30 dias.

7.2. Todo novo cadastro recebe um período de teste gratuito de 7 (sete) dias corridos,
com acesso completo a todas as funcionalidades da plataforma.

7.3. Ao final do período de teste, a cobrança da assinatura será gerada automaticamente
no método de pagamento escolhido durante o cadastro (PIX, boleto bancário ou cartão
de crédito).

7.4. O ciclo de cobrança é mensal, contado a partir da data de vencimento do período
de teste.

7.5. O não pagamento da assinatura por mais de 15 (quinze) dias após o vencimento
poderá resultar na suspensão temporária do acesso à plataforma. Os dados da academia
serão mantidos por 90 (noventa) dias após a suspensão.

7.6. O cancelamento da assinatura pode ser solicitado a qualquer momento, sem multa
ou taxa de cancelamento. O acesso permanece ativo até o fim do período já pago.

## 8. Processamento de Pagamentos

8.1. Os pagamentos da assinatura do BlackBelt são processados pela empresa Asaas
Gestão Financeira S.A. (CNPJ 19.540.550/0001-21), instituição de pagamento autorizada
pelo Banco Central do Brasil sob o código 461.

8.2. O BlackBelt não armazena dados de cartão de crédito. Todas as informações
financeiras são processadas diretamente pelo Asaas, em conformidade com os padrões
de segurança PCI-DSS.

8.3. Os métodos de pagamento aceitos são: PIX, boleto bancário e cartão de crédito
(Visa, Mastercard, Elo, American Express, Discover e Hipercard).

8.4. Pagamentos via PIX são confirmados instantaneamente. Boletos bancários têm prazo
de compensação de até 1 (um) dia útil após o pagamento. Pagamentos via cartão de
crédito são processados conforme prazos da operadora.

## 9. Cobrança de Alunos (Funcionalidade da Plataforma)

9.1. O BlackBelt oferece uma funcionalidade que permite à academia gerar cobranças
para seus alunos diretamente pela plataforma (mensalidades, matrículas e outros
serviços).

9.2. Para utilizar essa funcionalidade, o responsável pela academia deve configurar
seus dados bancários dentro da plataforma (menu Configurações > Dados Bancários).

9.3. Ao configurar os dados bancários, será criada automaticamente uma subconta
de pagamento vinculada à academia, processada pelo Asaas. Esta subconta é de
titularidade do responsável pela academia.

9.4. As cobranças geradas pela academia para seus alunos são processadas pela
subconta da academia no Asaas. O valor recebido é depositado diretamente na
conta bancária informada pelo responsável da academia.

9.5. O BlackBelt NÃO intermedia, retém ou tem acesso aos valores recebidos pela
academia de seus alunos. A relação financeira entre a academia e seus alunos é
de responsabilidade exclusiva da academia.

9.6. As taxas cobradas pelo Asaas sobre as transações da subconta da academia
são de responsabilidade da academia. As taxas vigentes podem ser consultadas em
https://www.asaas.com/precos-e-taxas e incluem:
  - PIX: R$ 0,99 por cobrança recebida (primeiros 3 meses), R$ 1,99 após
  - Boleto: R$ 0,99 por boleto compensado (primeiros 3 meses), R$ 1,99 após
  - Cartão de crédito: 1,99% + R$ 0,49 (primeiros 3 meses), 2,99% + R$ 0,49 após

9.7. O BlackBelt não cobra taxa adicional sobre as transações realizadas pela
academia com seus alunos. As únicas taxas aplicáveis são as do processador
de pagamento (Asaas).

9.8. O BlackBelt não se responsabiliza por eventuais disputas, chargebacks,
estornos ou inadimplência entre a academia e seus alunos.

## 10. Política de Reembolso

10.1. Em caso de cobrança indevida da assinatura do BlackBelt, o valor será
estornado integralmente em até 7 (sete) dias úteis após a solicitação.

10.2. Não há reembolso proporcional para cancelamentos realizados no meio
do ciclo de cobrança. O acesso permanece ativo até o fim do período pago.

10.3. O período de teste gratuito não gera direito a reembolso, pois não
há cobrança durante este período.

10.4. Reembolsos de cobranças realizadas pela academia a seus alunos devem
ser tratados diretamente entre a academia e o aluno, através da subconta
Asaas da academia.
```

### Implementação:

1. Encontrar o componente/página de termos
2. Localizar onde as seções terminam (último número de seção)
3. Adicionar as seções 7-10 acima, ajustando a numeração se necessário
4. Manter o estilo visual existente (headings, parágrafos, espaçamento)
5. Adicionar a data de atualização: "Última atualização: março de 2026"

**Commit:** `legal: add payment terms — plans, Asaas processing, subaccount, fees, refund policy`

---

## BLOCO 2 — ATUALIZAR POLÍTICA DE PRIVACIDADE

Encontrar a página de privacidade:
```bash
find app -path "*privacidade*" -name "page.tsx" | head -5
```

Adicionar as seguintes seções:

```markdown
## Dados Financeiros

X.1. Para processamento de pagamentos, coletamos: nome completo, CPF ou CNPJ,
e-mail de cobrança, telefone e, quando aplicável, endereço completo.

X.2. Esses dados são compartilhados exclusivamente com o Asaas Gestão Financeira
S.A. (CNPJ 19.540.550/0001-21), nosso processador de pagamentos, para fins de:
  - Criação de conta de pagamento
  - Processamento de cobranças
  - Emissão de boletos e PIX
  - Prevenção a fraudes

X.3. Dados de cartão de crédito NÃO são armazenados pelo BlackBelt. São processados
diretamente pelo Asaas em ambiente seguro com certificação PCI-DSS.

X.4. Para a funcionalidade de cobrança de alunos, os dados bancários informados pelo
responsável da academia (banco, agência, conta) são armazenados de forma criptografada
e utilizados exclusivamente para criação e manutenção da subconta de pagamento no Asaas.

X.5. Dados financeiros são retidos pelo período exigido pela legislação fiscal
brasileira (5 anos) e pela política de retenção do Asaas.

## Compartilhamento com Terceiros

Y.1. Compartilhamos dados pessoais apenas com:
  - Asaas Gestão Financeira S.A. — processamento de pagamentos
  - Resend Inc. — envio de e-mails transacionais
  - Supabase Inc. — armazenamento de dados (banco de dados)
  - Vercel Inc. — hospedagem da aplicação

Y.2. Nenhum dado pessoal é vendido, alugado ou compartilhado com terceiros
para fins de marketing ou publicidade.
```

**Commit:** `legal: update privacy policy — financial data, Asaas sharing, data retention`

---

## BLOCO 3 — CHECKBOX DE ACEITE NO WIZARD DE CADASTRO

Encontrar o wizard de cadastro:
```bash
grep -rn "cadastrar-academia\|onboarding\|wizard" app/ --include="*.tsx" | head -10
```

No ÚLTIMO step do wizard (antes do botão "Finalizar" ou "Criar Academia"), adicionar:

```tsx
{/* Aceite dos termos */}
<div className="flex items-start gap-3 mt-6 p-4 rounded-lg"
  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
  <input
    type="checkbox"
    id="accept-terms"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
    className="mt-1 h-4 w-4 rounded"
  />
  <label htmlFor="accept-terms" className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
    Li e aceito os{' '}
    <a href="/termos" target="_blank" className="underline font-medium"
      style={{ color: 'var(--bb-brand)' }}>
      Termos de Uso
    </a>{' '}
    e a{' '}
    <a href="/privacidade" target="_blank" className="underline font-medium"
      style={{ color: 'var(--bb-brand)' }}>
      Política de Privacidade
    </a>
    , incluindo as condições de pagamento, processamento via Asaas e taxas aplicáveis.
  </label>
</div>
```

- Adicionar state: `const [acceptedTerms, setAcceptedTerms] = useState(false);`
- Desabilitar botão de finalizar se `!acceptedTerms`
- Salvar timestamp do aceite no banco: `terms_accepted_at: new Date().toISOString()`

Se a tabela `academies` não tem coluna `terms_accepted_at`, criar migration:
```sql
ALTER TABLE academies ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS terms_version VARCHAR(10) DEFAULT 'v1.0';
```

**Commit:** `legal: mandatory terms acceptance in onboarding wizard`

---

## BLOCO 4 — FOOTER COM LINKS ATUALIZADOS

Verificar se o footer da landing page e do app tem links para:
- Termos de Uso
- Política de Privacidade

Se não tem, adicionar. Se já tem, verificar que os links estão corretos.

Também adicionar no footer do dashboard (dentro dos shells):
```tsx
<div className="text-xs text-center py-2" style={{ color: 'var(--bb-ink-40)' }}>
  <a href="/termos" className="hover:underline">Termos de Uso</a>
  {' · '}
  <a href="/privacidade" className="hover:underline">Política de Privacidade</a>
</div>
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `legal: footer links to terms and privacy`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_TERMOS_FINANCEIROS.md. Verifique estado:
grep -q "Processamento de Pagamentos\|Asaas" app/**/termos/page.tsx 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
grep -q "Dados Financeiros\|Asaas" app/**/privacidade/page.tsx 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
grep -q "acceptedTerms\|accept-terms" app/**/cadastrar*/page.tsx 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```

---

## PARA O PRIMALWOD

Após executar no BlackBelt, executar no PrimalWOD com as seguintes adaptações:
- "BlackBelt" → "PrimalWOD"
- "academia" → "box"
- "aluno" → "atleta"
- "var(--bb-*)" → "var(--pw-*)"
- Planos: Starter R$99, Pro R$199, Unlimited R$349
- Rota: `/cadastrar-academia` → verificar rota real do PrimalWOD

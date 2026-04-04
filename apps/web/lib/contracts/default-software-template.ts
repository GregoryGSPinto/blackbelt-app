// BlackBelt v2 — Default Software License Contract Template (PT-BR)

/**
 * Returns the default HTML template for the BlackBelt SaaS software license agreement.
 *
 * Placeholders:
 *   {{ACADEMY_NAME}}, {{ACADEMY_CNPJ}}, {{OWNER_NAME}}, {{OWNER_CPF}},
 *   {{PLAN_NAME}}, {{MONTHLY_VALUE}}, {{PAYMENT_DAY}},
 *   {{CONTRACT_START_DATE}}, {{DIGITAL_HASH}}, {{SIGNATURE_DATE}}, {{SIGNATURE_IP}}
 */
export function getDefaultSoftwareContractHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contrato de Licenca de Software — BlackBelt</title>
<style>
  body {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    max-width: 800px;
    margin: 40px auto;
    padding: 0 40px;
  }
  h1 {
    text-align: center;
    font-size: 16pt;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  h2 {
    font-size: 13pt;
    margin-top: 28px;
    margin-bottom: 8px;
  }
  p {
    text-align: justify;
    margin-bottom: 10px;
  }
  .header-subtitle {
    text-align: center;
    font-size: 11pt;
    color: #555;
    margin-bottom: 32px;
  }
  .signature-block {
    margin-top: 48px;
    border-top: 1px solid #ccc;
    padding-top: 24px;
    font-size: 10pt;
    color: #555;
  }
  .clause-number {
    font-weight: bold;
  }
</style>
</head>
<body>

<h1>Contrato de Licenca de Uso de Software SaaS</h1>
<p class="header-subtitle">Plataforma BlackBelt — Gestao para Academias de Artes Marciais</p>

<!-- CLAUSULA 1 — PREAMBULO -->
<h2><span class="clause-number">Clausula 1.</span> Preambulo</h2>
<p>
  <strong>CONTRATADA:</strong> BlackBelt Tecnologia, nome empresarial de Gregory Guimaraes Pinto,
  pessoa juridica de direito privado, com sede em Vespasiano, Estado de Minas Gerais,
  doravante denominada simplesmente <strong>BLACKBELT</strong>.
</p>
<p>
  <strong>CONTRATANTE:</strong> {{ACADEMY_NAME}}, inscrita no CNPJ sob o numero {{ACADEMY_CNPJ}},
  representada neste ato por {{OWNER_NAME}}, portador(a) do CPF {{OWNER_CPF}},
  doravante denominada simplesmente <strong>CONTRATANTE</strong>.
</p>
<p>
  As partes acima identificadas celebram o presente Contrato de Licenca de Uso de Software
  como Servico (SaaS), que se regera pelas clausulas e condicoes a seguir estipuladas.
</p>

<!-- CLAUSULA 2 — OBJETO -->
<h2><span class="clause-number">Clausula 2.</span> Objeto</h2>
<p>
  2.1. O presente contrato tem por objeto a concessao de licenca de uso, em carater nao exclusivo
  e intransferivel, da plataforma digital BlackBelt, sistema de gestao integrada para academias
  de artes marciais, disponibilizado na modalidade SaaS (Software as a Service) via internet.
</p>
<p>
  2.2. A plataforma compreende, conforme o plano contratado, funcionalidades de gestao de alunos,
  financeiro, check-in, contratos, comunicacao, gamificacao, relatorios e demais modulos
  disponiveis no plano selecionado.
</p>

<!-- CLAUSULA 3 — PLANO E VALORES -->
<h2><span class="clause-number">Clausula 3.</span> Plano e Valores</h2>
<p>
  3.1. O CONTRATANTE opta pelo plano <strong>{{PLAN_NAME}}</strong>, com mensalidade no valor de
  <strong>{{MONTHLY_VALUE}}</strong>, com vencimento todo dia <strong>{{PAYMENT_DAY}}</strong> de cada mes.
</p>
<p>
  3.2. O valor da mensalidade sera reajustado anualmente pelo indice IGPM/FGV ou, na sua ausencia,
  pelo IPCA/IBGE, o que for mais favoravel ao CONTRATANTE, sempre aplicado no mes de aniversario
  do contrato.
</p>
<p>
  3.3. Em caso de atraso no pagamento, incidira multa moratoria de 2% (dois por cento) sobre o
  valor da parcela em atraso, conforme art. 52 do Codigo de Defesa do Consumidor (Lei 8.078/90),
  acrescida de juros de mora de 1% (um por cento) ao mes, pro rata die, conforme art. 406 do
  Codigo Civil (Lei 10.406/2002).
</p>
<p>
  3.4. O pagamento podera ser realizado por boleto bancario, cartao de credito, PIX ou outro
  meio disponibilizado pela BLACKBELT.
</p>

<!-- CLAUSULA 4 — NIVEL DE SERVICO (SLA) -->
<h2><span class="clause-number">Clausula 4.</span> Nivel de Servico (SLA)</h2>
<p>
  4.1. A BLACKBELT compromete-se a manter a disponibilidade da plataforma em no minimo
  99,5% (noventa e nove virgula cinco por cento) do tempo, calculado mensalmente, excluindo-se
  periodos de manutencao programada.
</p>
<p>
  4.2. Manutencoes programadas serao comunicadas com antecedencia minima de 48 (quarenta e oito)
  horas, preferencialmente realizadas em horarios de menor utilizacao.
</p>
<p>
  4.3. Chamados de suporte tecnico serao respondidos em ate 24 (vinte e quatro) horas uteis apos
  o registro.
</p>

<!-- CLAUSULA 5 — VIGENCIA -->
<h2><span class="clause-number">Clausula 5.</span> Vigencia</h2>
<p>
  5.1. O presente contrato tera vigencia a partir de {{CONTRACT_START_DATE}}, por prazo indeterminado,
  precedido de periodo experimental (trial) de 7 (sete) dias corridos, durante o qual o
  CONTRATANTE podera utilizar a plataforma sem custo.
</p>
<p>
  5.2. Qualquer das partes podera rescindir o presente contrato, sem justa causa, mediante
  comunicacao por escrito com antecedencia minima de 30 (trinta) dias, conforme art. 473 do
  Codigo Civil.
</p>
<p>
  5.3. Ao final do periodo de trial, caso o CONTRATANTE nao manifeste interesse em cancelar,
  o contrato passara automaticamente a vigorar em regime de cobranca regular.
</p>

<!-- CLAUSULA 6 — OBRIGACOES DA CONTRATADA -->
<h2><span class="clause-number">Clausula 6.</span> Obrigacoes da CONTRATADA</h2>
<p>
  6.1. Manter a plataforma em pleno funcionamento, conforme os niveis de servico estabelecidos
  na Clausula 4.
</p>
<p>
  6.2. Realizar backups periodicos dos dados do CONTRATANTE, com retencao minima de 30 (trinta) dias.
</p>
<p>
  6.3. Garantir a transmissao segura de dados por meio de criptografia TLS (Transport Layer Security).
</p>
<p>
  6.4. Notificar o CONTRATANTE sobre incidentes de seguranca que possam afetar seus dados pessoais
  em ate 72 (setenta e duas) horas apos a ciencia do incidente, conforme art. 48 da Lei Geral de
  Protecao de Dados (Lei 13.709/2018 — LGPD).
</p>

<!-- CLAUSULA 7 — OBRIGACOES DO CONTRATANTE -->
<h2><span class="clause-number">Clausula 7.</span> Obrigacoes do CONTRATANTE</h2>
<p>
  7.1. Efetuar o pagamento da mensalidade na data de vencimento estipulada.
</p>
<p>
  7.2. Manter seus dados cadastrais atualizados na plataforma.
</p>
<p>
  7.3. Nao realizar engenharia reversa, descompilar, desmontar ou de qualquer forma tentar obter
  o codigo-fonte da plataforma, conforme protecao estabelecida pela Lei 9.609/98 (Lei de Software).
</p>
<p>
  7.4. Utilizar a plataforma em conformidade com a legislacao vigente, responsabilizando-se pelo
  conteudo inserido e pelos dados de terceiros processados.
</p>

<!-- CLAUSULA 8 — PROTECAO DE DADOS (LGPD) -->
<h2><span class="clause-number">Clausula 8.</span> Protecao de Dados Pessoais (LGPD)</h2>
<p>
  8.1. Para os fins da Lei 13.709/2018 (LGPD), o CONTRATANTE figura como <strong>Controlador</strong>
  dos dados pessoais de seus alunos e colaboradores, e a BLACKBELT figura como <strong>Operador</strong>,
  tratando os dados exclusivamente conforme as instrucoes do Controlador e nos limites do presente contrato.
</p>
<p>
  8.2. A base legal para o tratamento de dados e a execucao de contrato, conforme art. 7, inciso V,
  da LGPD.
</p>
<p>
  8.3. Os titulares dos dados terao assegurados todos os direitos previstos no art. 18 da LGPD,
  incluindo acesso, correcao, anonimizacao, portabilidade e eliminacao de dados.
</p>
<p>
  8.4. A BLACKBELT nao compartilhara os dados do CONTRATANTE com terceiros, salvo quando
  estritamente necessario para a prestacao do servico ou por determinacao legal.
</p>

<!-- CLAUSULA 9 — PROPRIEDADE INTELECTUAL -->
<h2><span class="clause-number">Clausula 9.</span> Propriedade Intelectual</h2>
<p>
  9.1. A plataforma BlackBelt, incluindo seu codigo-fonte, interface, design, marca, logotipo,
  documentacao e todos os materiais associados, sao de propriedade exclusiva da BLACKBELT,
  protegidos pela Lei 9.609/98 (Lei de Software) e pela Lei 9.610/98 (Lei de Direitos Autorais).
</p>
<p>
  9.2. O presente contrato nao transfere ao CONTRATANTE qualquer direito de propriedade intelectual
  sobre a plataforma.
</p>

<!-- CLAUSULA 10 — LIMITACAO DE RESPONSABILIDADE -->
<h2><span class="clause-number">Clausula 10.</span> Limitacao de Responsabilidade</h2>
<p>
  10.1. A responsabilidade total da BLACKBELT por quaisquer danos decorrentes deste contrato
  fica limitada ao valor equivalente a 12 (doze) mensalidades pagas pelo CONTRATANTE.
</p>
<p>
  10.2. A BLACKBELT nao sera responsavel por danos indiretos, incidentais, consequenciais, lucros
  cessantes ou perda de dados decorrentes do uso ou impossibilidade de uso da plataforma.
</p>
<p>
  10.3. Nenhuma das partes sera responsavel por falhas ou atrasos causados por eventos de forca
  maior ou caso fortuito, conforme art. 393 do Codigo Civil.
</p>

<!-- CLAUSULA 11 — RESCISAO -->
<h2><span class="clause-number">Clausula 11.</span> Rescisao</h2>
<p>
  11.1. Qualquer das partes podera rescindir o contrato sem justa causa mediante aviso previo
  de 30 (trinta) dias.
</p>
<p>
  11.2. Apos a rescisao, a BLACKBELT disponibilizara ao CONTRATANTE a portabilidade de seus dados
  em formato padrao (CSV/JSON) pelo periodo de 90 (noventa) dias, findo o qual os dados serao
  eliminados de forma segura.
</p>
<p>
  11.3. Constituem motivos para rescisao imediata por justa causa: (a) inadimplencia superior a
  60 dias; (b) uso ilicito da plataforma; (c) violacao de direitos de propriedade intelectual.
</p>

<!-- CLAUSULA 12 — CONFIDENCIALIDADE -->
<h2><span class="clause-number">Clausula 12.</span> Confidencialidade</h2>
<p>
  12.1. As partes comprometem-se a manter sigilo sobre todas as informacoes confidenciais obtidas
  em razao deste contrato, incluindo dados tecnicos, comerciais, financeiros e estrategicos.
</p>
<p>
  12.2. A obrigacao de confidencialidade permanecera vigente pelo prazo de 2 (dois) anos apos
  a rescisao ou termino do contrato.
</p>

<!-- CLAUSULA 13 — FORO -->
<h2><span class="clause-number">Clausula 13.</span> Foro</h2>
<p>
  13.1. As partes elegem o foro da Comarca de Vespasiano, Estado de Minas Gerais, para dirimir
  quaisquer controversias oriundas do presente contrato, com renuncia expressa a qualquer outro,
  por mais privilegiado que seja, nos termos do art. 63 do Codigo de Processo Civil (Lei 13.105/2015).
</p>

<!-- CLAUSULA 14 — ASSINATURA DIGITAL -->
<h2><span class="clause-number">Clausula 14.</span> Assinatura Digital</h2>
<p>
  14.1. O presente contrato e firmado em formato eletronico, com validade juridica assegurada
  pela Lei 14.063/2020 e pela Medida Provisoria 2.200-2/2001, que instituem a Infraestrutura de
  Chaves Publicas Brasileira (ICP-Brasil) e reconhecem a validade de assinaturas eletronicas
  avancadas.
</p>
<p>
  14.2. A assinatura eletronica aposta a este contrato equivale a assinatura manuscrita para todos
  os efeitos legais, sendo registrada com os seguintes dados de autenticacao:
</p>

<div class="signature-block">
  <p><strong>Hash do contrato:</strong> {{DIGITAL_HASH}}</p>
  <p><strong>Data e hora da assinatura:</strong> {{SIGNATURE_DATE}}</p>
  <p><strong>IP de origem:</strong> {{SIGNATURE_IP}}</p>
  <p style="margin-top: 24px;">
    E, por estarem de pleno acordo, as partes firmam o presente instrumento eletronicamente.
  </p>
</div>

</body>
</html>`;
}

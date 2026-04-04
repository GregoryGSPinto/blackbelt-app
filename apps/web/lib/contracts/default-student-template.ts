// BlackBelt v2 — Default Student Contract Template (PT-BR)

/**
 * Returns the default HTML template for the academy–student enrollment contract.
 *
 * Placeholders:
 *   {{ACADEMY_NAME}}, {{ACADEMY_CNPJ}}, {{ACADEMY_ADDRESS}},
 *   {{STUDENT_NAME}}, {{STUDENT_CPF}}, {{STUDENT_EMAIL}}, {{STUDENT_BIRTH_DATE}},
 *   {{GUARDIAN_NAME}}, {{GUARDIAN_CPF}},
 *   {{PLAN_NAME}}, {{MONTHLY_VALUE}}, {{ENROLLMENT_FEE}}, {{PAYMENT_DAY}},
 *   {{START_DATE}}, {{END_DATE}}, {{DURATION_MONTHS}}, {{MODALITIES}},
 *   {{DIGITAL_HASH}}, {{SIGNATURE_DATE}}, {{SIGNATURE_IP}}
 */
export function getDefaultStudentContractHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contrato de Matricula — {{ACADEMY_NAME}}</title>
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
  .minor-section {
    background: #f9f9f9;
    border-left: 3px solid #999;
    padding: 12px 16px;
    margin: 12px 0;
  }
</style>
</head>
<body>

<h1>Contrato de Prestacao de Servicos de Ensino</h1>
<p class="header-subtitle">Matricula — Artes Marciais</p>

<!-- CLAUSULA 1 — PREAMBULO -->
<h2><span class="clause-number">Clausula 1.</span> Preambulo e Identificacao das Partes</h2>
<p>
  <strong>CONTRATADA:</strong> {{ACADEMY_NAME}}, inscrita no CNPJ sob o numero {{ACADEMY_CNPJ}},
  com sede em {{ACADEMY_ADDRESS}}, doravante denominada simplesmente <strong>ACADEMIA</strong>.
</p>
<p>
  <strong>CONTRATANTE:</strong> {{STUDENT_NAME}}, portador(a) do CPF {{STUDENT_CPF}},
  e-mail {{STUDENT_EMAIL}}, data de nascimento {{STUDENT_BIRTH_DATE}},
  doravante denominado(a) simplesmente <strong>ALUNO(A)</strong>.
</p>
<div class="minor-section">
  <p>
    <strong>RESPONSAVEL LEGAL</strong> (quando o(a) ALUNO(A) for menor de 18 anos):
    {{GUARDIAN_NAME}}, portador(a) do CPF {{GUARDIAN_CPF}}, que neste ato assina como
    representante legal do(a) ALUNO(A), conforme disposto no Estatuto da Crianca e do
    Adolescente (Lei 8.069/1990).
  </p>
</div>
<p>
  As partes acima identificadas celebram o presente Contrato de Prestacao de Servicos de
  Ensino de Artes Marciais, que se regera pelas clausulas e condicoes a seguir estipuladas.
</p>

<!-- CLAUSULA 2 — OBJETO -->
<h2><span class="clause-number">Clausula 2.</span> Objeto</h2>
<p>
  2.1. O presente contrato tem por objeto a prestacao de servicos de ensino de artes marciais
  pela ACADEMIA ao(a) ALUNO(A), nas seguintes modalidades: <strong>{{MODALITIES}}</strong>.
</p>
<p>
  2.2. A ACADEMIA declara possuir registro junto ao Conselho Regional de Educacao Fisica (CREF),
  conforme exigido pela Lei 6.839/80, e compromete-se a disponibilizar profissionais devidamente
  habilitados para a instrucao das modalidades contratadas.
</p>

<!-- CLAUSULA 3 — VALORES E FORMA DE PAGAMENTO -->
<h2><span class="clause-number">Clausula 3.</span> Valores e Forma de Pagamento</h2>
<p>
  3.1. O(A) ALUNO(A) opta pelo plano <strong>{{PLAN_NAME}}</strong>, com mensalidade no valor de
  <strong>{{MONTHLY_VALUE}}</strong>, com vencimento todo dia <strong>{{PAYMENT_DAY}}</strong> de cada mes.
</p>
<p>
  3.2. Taxa de matricula: <strong>{{ENROLLMENT_FEE}}</strong>, devida no ato da inscricao.
</p>
<p>
  3.3. Em caso de atraso no pagamento, incidira multa moratoria de 2% (dois por cento) sobre o
  valor da parcela em atraso, conforme art. 52 do Codigo de Defesa do Consumidor (Lei 8.078/90),
  acrescida de juros de mora de 1% (um por cento) ao mes, pro rata die, conforme art. 406 do
  Codigo Civil (Lei 10.406/2002).
</p>
<p>
  3.4. O pagamento podera ser realizado por boleto bancario, cartao de credito, PIX ou outro
  meio disponibilizado pela ACADEMIA.
</p>

<!-- CLAUSULA 4 — HORARIOS E FREQUENCIA -->
<h2><span class="clause-number">Clausula 4.</span> Horarios e Frequencia</h2>
<p>
  4.1. O(A) ALUNO(A) devera frequentar as aulas conforme a grade de horarios definida pela
  ACADEMIA para o plano contratado, disponivel para consulta na plataforma digital.
</p>
<p>
  4.2. O controle de presenca sera realizado por meio de check-in digital na entrada da ACADEMIA.
</p>
<p>
  4.3. Sera admitida tolerancia de ate 15 (quinze) minutos para o inicio da aula. Apos esse
  periodo, a participacao ficara a criterio do instrutor responsavel.
</p>

<!-- CLAUSULA 5 — VIGENCIA -->
<h2><span class="clause-number">Clausula 5.</span> Vigencia</h2>
<p>
  5.1. O presente contrato tera vigencia de {{DURATION_MONTHS}} ({{DURATION_MONTHS}}) meses,
  com inicio em {{START_DATE}} e termino em {{END_DATE}}.
</p>
<p>
  5.2. Ao final do prazo de vigencia, o contrato sera renovado automaticamente por igual periodo,
  salvo manifestacao contraria de qualquer das partes com antecedencia minima de 30 (trinta) dias.
</p>
<p>
  5.3. O(A) ALUNO(A) tera direito ao arrependimento no prazo de 7 (sete) dias contados da
  assinatura deste contrato, conforme art. 49 do Codigo de Defesa do Consumidor, com restituicao
  integral dos valores pagos.
</p>
<p>
  5.4. Apos o prazo de arrependimento, o cancelamento devera ser solicitado conforme Clausula 10.
</p>

<!-- CLAUSULA 6 — OBRIGACOES DA ACADEMIA -->
<h2><span class="clause-number">Clausula 6.</span> Obrigacoes da ACADEMIA</h2>
<p>
  6.1. Disponibilizar estrutura adequada e segura para a pratica das modalidades contratadas,
  incluindo equipamentos em bom estado de conservacao.
</p>
<p>
  6.2. Manter profissionais com registro ativo no CREF para a instrucao das aulas.
</p>
<p>
  6.3. Dispor de kit de primeiros socorros e protocolos de atendimento a emergencias.
</p>
<p>
  6.4. Nao adotar praticas abusivas na prestacao de servicos, conforme art. 39 do Codigo
  de Defesa do Consumidor.
</p>
<p>
  6.5. Manter o ambiente limpo, higienizado e em conformidade com as normas sanitarias vigentes.
</p>

<!-- CLAUSULA 7 — OBRIGACOES DO ALUNO -->
<h2><span class="clause-number">Clausula 7.</span> Obrigacoes do(a) ALUNO(A)</h2>
<p>
  7.1. Efetuar o pagamento da mensalidade e demais taxas nas datas de vencimento estipuladas.
</p>
<p>
  7.2. Apresentar atestado medico de aptidao para a pratica de atividades fisicas, quando
  solicitado pela ACADEMIA.
</p>
<p>
  7.3. Utilizar vestimenta e equipamentos adequados para a pratica da modalidade, conforme
  orientacao da ACADEMIA.
</p>
<p>
  7.4. Zelar pelos equipamentos e instalacoes da ACADEMIA, responsabilizando-se por danos
  causados por mau uso, conforme art. 927 do Codigo Civil.
</p>
<p>
  7.5. Respeitar os demais alunos, instrutores e funcionarios, mantendo conduta compativel
  com o ambiente esportivo.
</p>

<!-- CLAUSULA 8 — SAUDE E RESPONSABILIDADE -->
<h2><span class="clause-number">Clausula 8.</span> Saude e Responsabilidade</h2>
<p>
  8.1. O(A) ALUNO(A) declara estar ciente de que a pratica de artes marciais envolve riscos
  inerentes, incluindo possibilidade de lesoes fisicas, e que possui aptidao fisica para
  a pratica da modalidade contratada.
</p>
<p>
  8.2. Clausulas que impliquem renuncia total ao direito de indenizacao por parte do(a) ALUNO(A)
  sao consideradas <strong>nulas de pleno direito</strong>, conforme art. 51, inciso I, do Codigo
  de Defesa do Consumidor.
</p>
<p>
  8.3. A ACADEMIA responde objetivamente por danos causados ao(a) ALUNO(A) decorrentes de
  defeito na prestacao do servico ou negligencia, conforme art. 14 do Codigo de Defesa
  do Consumidor.
</p>
<p>
  8.4. O(A) ALUNO(A) compromete-se a informar imediatamente a ACADEMIA sobre quaisquer
  condicoes de saude preexistentes, lesoes, alergias ou restricoes medicas que possam afetar
  a pratica das atividades.
</p>

<!-- CLAUSULA 9 — TRANCAMENTO -->
<h2><span class="clause-number">Clausula 9.</span> Trancamento de Matricula</h2>
<p>
  9.1. O(A) ALUNO(A) podera solicitar o trancamento da matricula por motivo de saude,
  mediante apresentacao de atestado medico, pelo prazo maximo de 90 (noventa) dias consecutivos.
</p>
<p>
  9.2. O trancamento por motivos pessoais sera permitido pelo prazo maximo de 30 (trinta) dias
  por ano, com suspensao da cobranca de mensalidades durante o periodo de trancamento.
</p>
<p>
  9.3. O periodo de trancamento nao sera computado para fins de vigencia contratual, prorrogando-se
  o prazo pelo mesmo periodo do trancamento.
</p>

<!-- CLAUSULA 10 — CANCELAMENTO -->
<h2><span class="clause-number">Clausula 10.</span> Cancelamento</h2>
<p>
  10.1. O cancelamento devera ser solicitado com antecedencia minima de 30 (trinta) dias,
  por escrito ou por meio digital na plataforma da ACADEMIA.
</p>
<p>
  10.2. Em caso de cancelamento antecipado, sera devida a devolucao proporcional dos valores
  pagos antecipadamente, conforme art. 51, inciso IV, do Codigo de Defesa do Consumidor,
  sendo vedada a retencao integral de valores.
</p>
<p>
  10.3. A multa por cancelamento antecipado nao podera exceder 10% (dez por cento) do valor
  restante do contrato, conforme jurisprudencia dominante e principio da razoabilidade.
</p>
<p>
  10.4. Nao sera devida multa de cancelamento quando: (a) o cancelamento ocorrer dentro do
  prazo de arrependimento de 7 dias; (b) houver mudanca de domicilio que impossibilite a
  frequencia; (c) houver incapacidade fisica comprovada por laudo medico.
</p>

<!-- CLAUSULA 11 — USO DE IMAGEM -->
<h2><span class="clause-number">Clausula 11.</span> Uso de Imagem</h2>
<p>
  11.1. A autorizacao para uso de imagem e tratada em instrumento <strong>separado e opcional</strong>,
  nao condicionando a matricula ou permanencia do(a) ALUNO(A) na ACADEMIA.
</p>
<p>
  11.2. Caso concedida, a autorizacao de uso de imagem e <strong>revogavel a qualquer tempo</strong>,
  mediante simples comunicacao do(a) ALUNO(A), conforme art. 8, paragrafo 4, da LGPD.
</p>
<p>
  11.3. As imagens serao utilizadas exclusivamente para fins de divulgacao institucional da
  ACADEMIA, vedado o uso para fins comerciais de terceiros.
</p>

<!-- CLAUSULA 12 — PROTECAO DE DADOS (LGPD) -->
<h2><span class="clause-number">Clausula 12.</span> Protecao de Dados Pessoais (LGPD)</h2>
<p>
  12.1. A ACADEMIA, na qualidade de <strong>Controladora</strong> dos dados pessoais, compromete-se
  a tratar os dados do(a) ALUNO(A) em conformidade com a Lei 13.709/2018 (LGPD).
</p>
<p>
  12.2. Os dados sensiveis coletados (dados de saude, biometria, etc.) serao tratados conforme
  as hipoteses previstas no art. 11 da LGPD, com as devidas medidas de seguranca.
</p>
<p>
  12.3. O(A) ALUNO(A) tera assegurados todos os direitos previstos no art. 18 da LGPD, incluindo:
  confirmacao de tratamento, acesso aos dados, correcao, anonimizacao, portabilidade e eliminacao.
</p>
<p>
  12.4. Os dados pessoais serao retidos pelo prazo de 5 (cinco) anos apos o encerramento da
  relacao contratual, para cumprimento de obrigacoes legais, sendo eliminados de forma segura
  apos esse periodo.
</p>

<!-- CLAUSULA 13 — REGULAMENTO INTERNO -->
<h2><span class="clause-number">Clausula 13.</span> Regulamento Interno</h2>
<p>
  13.1. O(A) ALUNO(A) declara ter ciencia e concordar com o regulamento interno da ACADEMIA,
  disponivel para consulta nas dependencias e na plataforma digital.
</p>
<p>
  13.2. O descumprimento do regulamento interno estara sujeito a sancoes progressivas:
  (a) advertencia verbal; (b) advertencia por escrito; (c) suspensao temporaria;
  (d) desligamento, conforme a gravidade da infracao.
</p>
<p>
  13.3. As sancoes serao aplicadas garantindo o direito ao contraditorio e a ampla defesa.
</p>

<!-- CLAUSULA 14 — DISPOSICOES PARA MENORES DE IDADE -->
<h2><span class="clause-number">Clausula 14.</span> Disposicoes Especiais para Menores de Idade</h2>
<div class="minor-section">
  <p>
    14.1. Quando o(a) ALUNO(A) for menor de 18 (dezoito) anos, o presente contrato devera ser
    firmado por seu responsavel legal, em conformidade com o Estatuto da Crianca e do Adolescente
    (Lei 8.069/1990).
  </p>
  <p>
    14.2. O responsavel legal responde solidariamente por todas as obrigacoes decorrentes deste
    contrato.
  </p>
  <p>
    14.3. O tratamento de dados pessoais de criancas e adolescentes observara o disposto no art. 14
    da LGPD, sendo realizado no melhor interesse do menor.
  </p>
  <p>
    14.4. A ACADEMIA adotara medidas especiais de protecao e seguranca para alunos menores de idade,
    incluindo controle de acesso e comunicacao direta com o responsavel legal.
  </p>
</div>

<!-- CLAUSULA 15 — FORO -->
<h2><span class="clause-number">Clausula 15.</span> Foro</h2>
<p>
  15.1. Para dirimir quaisquer controversias oriundas do presente contrato, fica eleito o foro do
  domicilio do consumidor, conforme art. 101, inciso I, do Codigo de Defesa do Consumidor
  (Lei 8.078/90).
</p>

<!-- CLAUSULA 16 — ASSINATURA DIGITAL -->
<h2><span class="clause-number">Clausula 16.</span> Assinatura Digital</h2>
<p>
  16.1. O presente contrato e firmado em formato eletronico, com validade juridica assegurada
  pela Lei 14.063/2020 e pela Medida Provisoria 2.200-2/2001, que instituem a Infraestrutura de
  Chaves Publicas Brasileira (ICP-Brasil) e reconhecem a validade de assinaturas eletronicas
  avancadas.
</p>
<p>
  16.2. A assinatura eletronica aposta a este contrato equivale a assinatura manuscrita para todos
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

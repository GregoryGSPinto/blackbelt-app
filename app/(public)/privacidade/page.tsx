export const metadata = { title: 'Política de Privacidade' };

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-bb-gray-900">Política de Privacidade</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-bb-gray-700">
        <p className="text-sm text-bb-gray-500">Última atualização: 01 de março de 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">1. Introdução</h2>
          <p>
            A BlackBelt respeita a privacidade dos seus usuários e está comprometida com a proteção
            dos dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">2. Dados Coletados</h2>
          <p>Coletamos os seguintes dados:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dados de identificação:</strong> nome, email, telefone, CPF</li>
            <li><strong>Dados de uso:</strong> presenças, evolução, avaliações, conquistas</li>
            <li><strong>Dados financeiros:</strong> informações de pagamento, histórico de faturas</li>
            <li><strong>Dados de navegação:</strong> logs de acesso, cookies (com consentimento)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">3. Finalidade do Tratamento</h2>
          <p>Os dados são tratados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Prestação do serviço de gestão da academia</li>
            <li>Comunicação entre academia, professores e alunos</li>
            <li>Processamento de pagamentos</li>
            <li>Geração de relatórios e análises</li>
            <li>Melhoria contínua da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">4. Base Legal</h2>
          <p>
            O tratamento dos dados é realizado com base no consentimento do titular, na execução
            de contrato, no cumprimento de obrigação legal e no legítimo interesse do controlador.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">5. Compartilhamento de Dados</h2>
          <p>
            Seus dados podem ser compartilhados com: a academia contratante (para gestão dos alunos),
            processadores de pagamento (Asaas, Stripe) e serviços de comunicação (email, WhatsApp).
            Não vendemos dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">6. Seus Direitos (LGPD)</h2>
          <p>Como titular dos dados, você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmação e acesso aos dados tratados</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados</li>
            <li>Revogação do consentimento</li>
            <li>Eliminação dos dados pessoais</li>
          </ul>
          <p>
            Para exercer seus direitos, acesse a seção <strong>Privacidade</strong> no seu perfil
            ou entre em contato com nosso DPO pelo email: privacidade@blackbelt.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">7. Segurança</h2>
          <p>
            Empregamos medidas técnicas e administrativas para proteger os dados pessoais,
            incluindo criptografia, controle de acesso e monitoramento contínuo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">8. Retenção de Dados</h2>
          <p>
            Os dados são mantidos pelo período necessário para as finalidades descritas ou
            conforme exigido por lei. Após a exclusão da conta, os dados são removidos em até 30 dias,
            exceto quando houver obrigação legal de retenção.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">9. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu consentimento,
            cookies analíticos para melhorar a experiência. Você pode gerenciar suas preferências
            de cookies no seu perfil.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">10. Contato</h2>
          <p>
            Encarregado de Proteção de Dados (DPO): privacidade@blackbelt.com
          </p>
        </section>
      </div>
    </div>
  );
}

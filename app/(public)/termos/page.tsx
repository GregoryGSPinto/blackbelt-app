export const metadata = { title: 'Termos de Uso' };

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-bb-gray-900">Termos de Uso</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-bb-gray-700">
        <p className="text-sm text-bb-gray-500">Última atualização: 01 de março de 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma BlackBelt, você concorda com estes Termos de Uso.
            Se não concordar com qualquer parte destes termos, não utilize a plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">2. Descrição do Serviço</h2>
          <p>
            A BlackBelt é uma plataforma SaaS de gestão para academias de artes marciais, oferecendo
            funcionalidades de gestão de alunos, turmas, financeiro, comunicação e relatórios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">3. Cadastro e Conta</h2>
          <p>
            O usuário é responsável pela veracidade das informações fornecidas no cadastro e pela
            segurança de suas credenciais de acesso. Notifique-nos imediatamente em caso de uso
            não autorizado da sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">4. Uso da Plataforma</h2>
          <p>O usuário compromete-se a utilizar a plataforma de acordo com a legislação vigente e estes Termos, não devendo:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Utilizar a plataforma para fins ilícitos</li>
            <li>Tentar acessar dados de outros usuários sem autorização</li>
            <li>Reproduzir, copiar ou redistribuir o conteúdo da plataforma</li>
            <li>Interferir no funcionamento normal da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">5. Pagamentos e Planos</h2>
          <p>
            Os planos e valores são definidos pela academia contratante. A BlackBelt atua como
            intermediadora tecnológica, não sendo responsável pela relação comercial entre academia e aluno.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo, marca, código e design da plataforma são de propriedade da BlackBelt.
            Os dados inseridos pelos usuários permanecem de propriedade dos mesmos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">7. Limitação de Responsabilidade</h2>
          <p>
            A BlackBelt não se responsabiliza por danos indiretos, incidentais ou consequentes
            decorrentes do uso da plataforma. Nosso esforço é manter a disponibilidade e segurança
            do serviço, mas não garantimos operação ininterrupta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">8. Alterações dos Termos</h2>
          <p>
            Reservamo-nos o direito de alterar estes Termos a qualquer momento. Alterações
            significativas serão comunicadas por email ou notificação na plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-bb-gray-900">9. Foro</h2>
          <p>
            Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões
            decorrentes destes Termos de Uso.
          </p>
        </section>
      </div>
    </div>
  );
}

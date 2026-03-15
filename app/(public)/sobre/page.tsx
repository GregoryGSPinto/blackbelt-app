export const metadata = { title: 'Sobre — BlackBelt' };

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-bb-gray-900">Sobre o BlackBelt</h1>
      <div className="space-y-6 text-bb-gray-700">
        <p>
          O BlackBelt nasceu da paixão pelas artes marciais e da frustração com ferramentas genéricas
          que não entendem a realidade de uma academia de lutas.
        </p>
        <p>
          Nossa missão é empoderar donos de academias, professores e alunos com uma plataforma que
          automatiza o operacional e potencializa o que importa: o treino, a evolução e a comunidade.
        </p>
        <h2 className="text-xl font-semibold text-bb-gray-900">Nossa Visão</h2>
        <p>
          Ser a plataforma de referência mundial para gestão de academias de artes marciais,
          conectando mais de 10.000 academias em 50 países até 2028.
        </p>
        <h2 className="text-xl font-semibold text-bb-gray-900">Valores</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Disciplina</strong> — Código limpo, entregas consistentes, melhoria contínua.</li>
          <li><strong>Respeito</strong> — Pela comunidade marcial, pelos dados dos usuários, pelo tempo do cliente.</li>
          <li><strong>Evolução</strong> — Assim como no tatame, buscamos crescer a cada dia.</li>
          <li><strong>Comunidade</strong> — Construímos juntos. Feedback dos clientes guia o roadmap.</li>
        </ul>
      </div>
    </div>
  );
}

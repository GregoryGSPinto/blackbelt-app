import { emailLayout } from './base';

export function classReminderEmail(data: { nome: string; modalidade: string; horario: string }): string {
  return emailLayout(
    `<p>Olá <strong>${data.nome}</strong>,</p>
<p>Lembrete: sua aula de <strong>${data.modalidade}</strong> começa às <strong>${data.horario}</strong>.</p>
<p>Prepare-se e venha treinar!</p>`,
    'https://blackbelts.com.br/turmas',
    'Ver Meus Horários',
  );
}

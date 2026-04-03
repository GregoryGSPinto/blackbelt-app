import { emailLayout } from './base';

export function welcomeEmail(data: { nome: string; academia: string }): string {
  return emailLayout(
    `<p>Olá <strong>${data.nome}</strong>,</p>
<p>Bem-vindo(a) ao <strong>${data.academia}</strong>! Sua jornada nas artes marciais começa agora.</p>
<p>No app BlackBelt você pode:</p>
<ul style="color:#333;line-height:2">
<li>Acompanhar suas presenças e evolução</li>
<li>Assistir vídeos de técnicas</li>
<li>Receber avaliações do seu professor</li>
<li>Conquistar badges e faixas</li>
</ul>
<p>Bons treinos!</p>`,
    'https://blackbelts.com.br/dashboard',
    'Acessar o App',
  );
}

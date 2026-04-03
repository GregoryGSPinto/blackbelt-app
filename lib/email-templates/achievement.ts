import { emailLayout } from './base';

export function achievementEmail(data: { nome: string; conquista: string; descricao: string }): string {
  return emailLayout(
    `<p>Parabéns <strong>${data.nome}</strong>!</p>
<p>Você desbloqueou uma nova conquista:</p>
<div style="background:#FFF3E0;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
<p style="font-size:32px;margin:0">🏆</p>
<p style="font-size:18px;font-weight:700;color:#333;margin:8px 0 4px">${data.conquista}</p>
<p style="font-size:14px;color:#666;margin:0">${data.descricao}</p>
</div>
<p>Continue treinando para desbloquear mais conquistas!</p>`,
    'https://blackbeltv2.vercel.app/dashboard/conquistas',
    'Ver Minhas Conquistas',
  );
}

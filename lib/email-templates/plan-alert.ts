import { emailLayout } from './base';

export interface PlanAlertData {
  nomeAdmin: string;
  academia: string;
  recurso: string;
  usadoAtual: number;
  limiteTotal: number;
  percentual: 80 | 90 | 100;
  planoAtual: string;
  linkUpgrade: string;
}

function getAlertLevel(percentual: number): { cor: string; bgCor: string; titulo: string; mensagem: string } {
  if (percentual >= 100) {
    return {
      cor: '#991B1B',
      bgCor: '#FEF2F2',
      titulo: 'Limite atingido!',
      mensagem: 'Voce atingiu o limite do seu plano. Faca upgrade para continuar adicionando.',
    };
  }
  if (percentual >= 90) {
    return {
      cor: '#92400E',
      bgCor: '#FFFBEB',
      titulo: 'Quase no limite!',
      mensagem: 'Voce esta proximo do limite do seu plano. Considere fazer upgrade.',
    };
  }
  return {
    cor: '#1E40AF',
    bgCor: '#EFF6FF',
    titulo: 'Aviso de uso',
    mensagem: 'Voce ja utilizou 80% do limite do seu plano.',
  };
}

export function planAlertEmail(data: PlanAlertData): string {
  const alert = getAlertLevel(data.percentual);

  return emailLayout(
    `<p>Ola <strong>${data.nomeAdmin}</strong>,</p>

<div style="background:${alert.bgCor};border-left:4px solid ${alert.cor};border-radius:8px;padding:16px;margin:16px 0">
<p style="font-size:16px;font-weight:700;color:${alert.cor};margin:0 0 8px">${alert.titulo}</p>
<p style="font-size:14px;color:${alert.cor};margin:0">${alert.mensagem}</p>
</div>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr style="background:#f5f5f5">
<td style="padding:12px;border:1px solid #eee;font-weight:600">Academia</td>
<td style="padding:12px;border:1px solid #eee">${data.academia}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Recurso</td>
<td style="padding:12px;border:1px solid #eee">${data.recurso}</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Uso atual</td>
<td style="padding:12px;border:1px solid #eee">${data.usadoAtual} de ${data.limiteTotal} (${data.percentual}%)</td>
</tr>
<tr>
<td style="padding:12px;border:1px solid #eee;font-weight:600">Plano atual</td>
<td style="padding:12px;border:1px solid #eee">${data.planoAtual}</td>
</tr>
</table>

<p>Faca upgrade do seu plano para desbloquear mais recursos e continuar crescendo.</p>`,
    data.linkUpgrade,
    'Ver Planos Disponiveis',
  );
}

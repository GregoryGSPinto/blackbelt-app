import type { TemplateMensagem, EnvioMensagem } from '@/lib/api/recepcao-mensagens.service';

export function mockGetTemplates(): TemplateMensagem[] {
  return [
    { id: 't-1', nome: 'Cobranca Amigavel', categoria: 'cobranca', texto: 'Oi {nome}! Notamos que sua mensalidade de {mes} (R$ {valor}) ainda esta em aberto. Pode regularizar pelo PIX ou na recepcao? Qualquer duvida estamos aqui! 🥋', variaveis: ['nome', 'mes', 'valor'] },
    { id: 't-2', nome: 'Cobranca Urgente', categoria: 'cobranca', texto: 'Ola {nome}, sua mensalidade esta com {dias} dias de atraso (R$ {valor}). Para evitar suspensao, regularize ate {prazo}. Estamos a disposicao!', variaveis: ['nome', 'dias', 'valor', 'prazo'] },
    { id: 't-3', nome: 'Confirmacao Aula Experimental', categoria: 'confirmacao', texto: 'Oi {nome}! Confirmando sua aula experimental de {modalidade} amanha as {horario}. Traga roupa leve e agua. Estamos te esperando! 🥋💪', variaveis: ['nome', 'modalidade', 'horario'] },
    { id: 't-4', nome: 'Confirmacao Matricula', categoria: 'confirmacao', texto: 'Bem-vindo(a) ao Guerreiros do Tatame, {nome}! 🎉 Sua matricula foi confirmada. Sua primeira aula e {turma} as {horario}. Oss!', variaveis: ['nome', 'turma', 'horario'] },
    { id: 't-5', nome: 'Lembrete de Aula', categoria: 'lembrete', texto: 'Oi {nome}! Lembrete: sua aula de {turma} e hoje as {horario}. Nos vemos no tatame! 🥋', variaveis: ['nome', 'turma', 'horario'] },
    { id: 't-6', nome: 'Lembrete Vencimento', categoria: 'lembrete', texto: '{nome}, sua mensalidade vence em {dias} dias (R$ {valor}). Pagamento pode ser feito via PIX, cartao ou na recepcao. 📋', variaveis: ['nome', 'dias', 'valor'] },
    { id: 't-7', nome: 'Follow-up Experimental', categoria: 'follow_up', texto: 'Oi {nome}! Como foi sua experiencia na aula de {modalidade}? Estamos com condicoes especiais para matricula essa semana. Posso te contar mais? 😊', variaveis: ['nome', 'modalidade'] },
    { id: 't-8', nome: 'Follow-up Ausencia', categoria: 'follow_up', texto: 'Oi {nome}, sentimos sua falta! Faz {dias} dias que voce nao treina. Esta tudo bem? Sua turma de {turma} te espera! 💪', variaveis: ['nome', 'dias', 'turma'] },
    { id: 't-9', nome: 'Boas-vindas', categoria: 'boas_vindas', texto: 'Seja bem-vindo(a) ao Guerreiros do Tatame, {nome}! 🥋 Aqui esta seu acesso ao app: {link}. Login: {email}. Sua jornada comeca agora! Oss!', variaveis: ['nome', 'link', 'email'] },
    { id: 't-10', nome: 'Aniversario', categoria: 'boas_vindas', texto: 'Feliz aniversario, {nome}! 🎂🥋 Que esse novo ano traga muitas conquistas no tatame e na vida. De presente, 10% OFF na proxima mensalidade! Oss!', variaveis: ['nome'] },
  ];
}

export function mockEnviarMensagem(_data: { alunoNome: string; templateId: string; canal: string }): { ok: boolean } {
  return { ok: true };
}

export function mockGetHistoricoEnvios(): EnvioMensagem[] {
  return [
    { id: 'e-1', horario: '08:30', alunoNome: 'Carlos Mendes', templateNome: 'Cobranca Amigavel', canal: 'whatsapp', status: 'lido' },
    { id: 'e-2', horario: '08:45', alunoNome: 'Juliana Rodrigues', templateNome: 'Cobranca Urgente', canal: 'whatsapp', status: 'entregue' },
    { id: 'e-3', horario: '09:00', alunoNome: 'Fernanda Lima', templateNome: 'Confirmacao Aula Experimental', canal: 'whatsapp', status: 'lido' },
    { id: 'e-4', horario: '10:15', alunoNome: 'Pedro Santos', templateNome: 'Lembrete de Aula', canal: 'whatsapp', status: 'enviado' },
    { id: 'e-5', horario: '11:00', alunoNome: 'Lucas Ferreira', templateNome: 'Aniversario', canal: 'whatsapp', status: 'lido' },
  ];
}

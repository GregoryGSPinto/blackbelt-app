// ============================================================
// BlackBelt v2 — WhatsApp Link Utility (F6)
// Gera links wa.me para mensagens pre-preenchidas.
// Nao requer API do WhatsApp Business.
// ============================================================

/**
 * Gera link wa.me que abre WhatsApp com mensagem pre-preenchida.
 * No celular, abre o WhatsApp diretamente.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Limpar telefone: remover (, ), -, espacos e +
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Adicionar codigo do Brasil se nao tem (11 digitos = celular BR sem codigo pais)
  const fullPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  // Encode a mensagem
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

/**
 * Substitui variaveis em um template de mensagem.
 * Variaveis sao marcadas com {chave}.
 */
export function getWhatsAppMessage(template: string, variables: Record<string, string>): string {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replaceAll(`{${key}}`, value);
  }
  return message;
}

/**
 * Templates pre-definidos de mensagens WhatsApp.
 * Usar com getWhatsAppMessage() para substituir variaveis.
 */
export const WA_TEMPLATES = {
  cobranca_vencendo:
    'Ola {nome}! Sua mensalidade de R$ {valor} na {academia} vence amanha ({data}). Pague pelo link: {link_pagamento}',
  cobranca_atrasada:
    'Ola {nome}, sua mensalidade de R$ {valor} na {academia} esta {dias} dias atrasada. Regularize pelo link: {link_pagamento}',
  convite_aluno:
    'Ola {nome}! Voce foi convidado para a academia {academia}. Acesse: {link_convite}',
  lembrete_aula:
    'Ola {nome}! Lembrete: sua aula de {modalidade} e amanha as {hora}. Te esperamos na {academia}!',
  aniversario:
    'Feliz aniversario, {nome}! A familia {academia} deseja tudo de melhor pra voce!',
  convite_teen:
    'Ola! {nome_pai} cadastrou {nome_teen} na {academia}. Para ativar a conta, acesse: {link_ativacao}',
} as const;

export type WhatsAppTemplate = keyof typeof WA_TEMPLATES;

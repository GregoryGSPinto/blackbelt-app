// BlackBelt v2 — Contract Utility Functions

const UNITS = [
  '', 'um', 'dois', 'tres', 'quatro', 'cinco',
  'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'quatorze', 'quinze',
  'dezesseis', 'dezessete', 'dezoito', 'dezenove',
];

const TENS = [
  '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
  'sessenta', 'setenta', 'oitenta', 'noventa',
];

const HUNDREDS = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
];

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/**
 * Convert number (0..999999) to Brazilian Portuguese words.
 * Examples: 100 → "cem", 149 → "cento e quarenta e nove", 1000 → "mil"
 */
export function numberToWords(value: number): string {
  if (value < 0) return 'menos ' + numberToWords(Math.abs(value));
  if (value === 0) return 'zero';

  const n = Math.floor(value);
  if (n === 0) return 'zero';

  if (n === 100) return 'cem';
  if (n === 1000) return 'mil';

  const parts: string[] = [];

  // Thousands (1..999)
  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mil');
    } else {
      parts.push(numberToWordsBelow1000(thousands) + ' mil');
    }
  }

  if (remainder > 0) {
    // "e" when remainder < 100 OR when remainder hundreds portion is 0
    // e.g., "mil e cem", "dois mil e trezentos", "mil e cinquenta"
    if (thousands > 0) {
      parts.push('e');
    }
    if (remainder === 100) {
      parts.push('cem');
    } else {
      parts.push(numberToWordsBelow1000(remainder));
    }
  }

  return parts.join(' ');
}

function numberToWordsBelow1000(n: number): string {
  if (n <= 0) return '';
  if (n < 20) return UNITS[n];

  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return TENS[ten];
    return TENS[ten] + ' e ' + UNITS[unit];
  }

  // 100..999
  if (n === 100) return 'cem';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return HUNDREDS[hundred];
  return HUNDREDS[hundred] + ' e ' + numberToWordsBelow1000(rest);
}

/**
 * Convert a date to Brazilian Portuguese extensive format.
 * Example: "26 de marco de 2026"
 */
export function dateToExtensive(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/**
 * Format cents to Brazilian currency with extensive text.
 * Example: 14900 → "R$ 149,00 (cento e quarenta e nove reais)"
 */
export function formatCurrencyExtensive(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  const reaisStr = reais.toLocaleString('pt-BR');
  const centavosStr = centavos.toString().padStart(2, '0');
  const formatted = `R$ ${reaisStr},${centavosStr}`;

  const parts: string[] = [];

  if (reais > 0) {
    parts.push(numberToWords(reais) + (reais === 1 ? ' real' : ' reais'));
  }

  if (centavos > 0) {
    if (reais > 0) parts.push('e');
    parts.push(numberToWords(centavos) + (centavos === 1 ? ' centavo' : ' centavos'));
  }

  if (reais === 0 && centavos === 0) {
    parts.push('zero reais');
  }

  return `${formatted} (${parts.join(' ')})`;
}

/**
 * Generate a simple hash fingerprint from content.
 * Not crypto-secure — used as a contract signing fingerprint.
 * Returns a hex string.
 */
export function generateHash(content: string): string {
  // DJB2-based hash (two passes for 64-bit-like fingerprint)
  let h1 = 5381;
  let h2 = 52711;

  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + ch) | 0;
    h2 = ((h2 << 5) + h2 + ch) | 0;
  }

  // Ensure positive and convert to 16-char hex
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return hex1 + hex2;
}

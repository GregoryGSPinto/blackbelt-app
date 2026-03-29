// ────────────────────────────────────────────────────────────
// Profanity Filter — PT-BR
// Apple Guideline 1.2 / Google Policy 4.19
// ────────────────────────────────────────────────────────────

const BLOCKED_WORDS: string[] = [
  'porra',
  'caralho',
  'merda',
  'foda',
  'fodase',
  'fodasse',
  'puta',
  'putaria',
  'arrombado',
  'arrombada',
  'cuzao',
  'cuzão',
  'vagabundo',
  'vagabunda',
  'viado',
  'veado',
  'bicha',
  'sapatao',
  'sapatão',
  'retardado',
  'retardada',
  'imbecil',
  'idiota',
  'babaca',
  'otario',
  'otário',
  'otaria',
  'otária',
  'desgraçado',
  'desgraçada',
  'fdp',
  'pqp',
  'vtnc',
  'vsf',
  'buceta',
  'piranha',
  'corno',
  'lixo humano',
  'escoria',
  'escória',
  'nojento',
  'nojenta',
];

/**
 * Builds a regex that matches whole words from the blocked list.
 * Case-insensitive and supports accented characters.
 */
function buildRegex(): RegExp {
  const escaped = BLOCKED_WORDS.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  // \b doesn't handle accented chars well, so we use lookahead/lookbehind for word boundaries
  return new RegExp(`(?<=^|\\s|[^a-záàâãéèêíìîóòôõúùûç])(${escaped.join('|')})(?=$|\\s|[^a-záàâãéèêíìîóòôõúùûç])`, 'gi');
}

const PROFANITY_REGEX = buildRegex();

/**
 * Check if text contains any profanity.
 */
export function containsProfanity(text: string): boolean {
  PROFANITY_REGEX.lastIndex = 0;
  return PROFANITY_REGEX.test(text);
}

/**
 * Filter profanity from text, replacing matched words with asterisks.
 * Returns the cleaned text and whether any word was flagged.
 */
export function filterProfanity(text: string): { clean: string; flagged: boolean } {
  PROFANITY_REGEX.lastIndex = 0;
  let flagged = false;

  const clean = text.replace(PROFANITY_REGEX, (match) => {
    flagged = true;
    return '*'.repeat(match.length);
  });

  return { clean, flagged };
}

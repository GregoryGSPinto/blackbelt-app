// BlackBelt v2 — API Key Configuration
// Server-only: these functions access server environment variables.

export function getGooglePlacesKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY não configurada');
  return key;
}

export function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY não configurada');
  return key;
}

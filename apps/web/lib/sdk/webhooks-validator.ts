export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}

export interface WebhookEvent<T = Record<string, unknown>> {
  event: string;
  timestamp: string;
  data: T;
}

export function parseWebhookEvent<T = Record<string, unknown>>(body: string): WebhookEvent<T> {
  return JSON.parse(body) as WebhookEvent<T>;
}

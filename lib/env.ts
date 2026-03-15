export function isMock(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export function validateEnv(): void {
  const required: string[] = [];

  if (!isMock()) {
    required.push('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

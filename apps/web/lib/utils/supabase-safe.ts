// BlackBelt v2 — Safe Supabase Query Wrapper
// NEVER throws — always returns fallback value on error.

export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error(`[${context}] Supabase error:`, error.message);
      return fallback;
    }
    return data ?? fallback;
  } catch (err) {
    console.error(`[${context}] Unexpected error:`, err);
    return fallback;
  }
}

/** Safe single-record query — returns null on error instead of throwing */
export async function safeSupabaseSingle<T>(
  queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>,
  context: string,
): Promise<T | null> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error(`[${context}] Supabase error:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[${context}] Unexpected error:`, err);
    return null;
  }
}

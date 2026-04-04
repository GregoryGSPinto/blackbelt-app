import { isMock } from '@/lib/env';
import { createBrowserClient } from '@/lib/supabase/client';

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: { type: 'fix' | 'feature' | 'improvement'; text: string }[];
  published_at: string | null;
  is_draft: boolean;
  created_at: string;
}

export async function getPublishedChangelog(): Promise<ChangelogEntry[]> {
  if (isMock()) return [];
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('beta_changelog')
    .select('*')
    .eq('is_draft', false)
    .order('published_at', { ascending: false });
  return (data as ChangelogEntry[]) || [];
}

export async function getAllChangelog(): Promise<ChangelogEntry[]> {
  if (isMock()) return [];
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('beta_changelog')
    .select('*')
    .order('created_at', { ascending: false });
  return (data as ChangelogEntry[]) || [];
}

export async function createChangelogEntry(entry: Omit<ChangelogEntry, 'id' | 'created_at'>): Promise<boolean> {
  if (isMock()) return true;
  const supabase = createBrowserClient();
  const { error } = await supabase.from('beta_changelog').insert(entry);
  return !error;
}

export async function publishChangelogEntry(id: string): Promise<boolean> {
  if (isMock()) return true;
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('beta_changelog')
    .update({ is_draft: false, published_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

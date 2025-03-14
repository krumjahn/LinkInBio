import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export interface HistoryRecord {
  id?: string;
  created_at?: string;
  input: string;
  output: string;
  type: 'title' | 'suggestion' | 'news';
  metadata?: Record<string, any>;
}

export async function saveToHistory(record: Omit<HistoryRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('history')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHistory(type?: HistoryRecord['type']) {
  let query = supabase
    .from('history')
    .select('*')
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

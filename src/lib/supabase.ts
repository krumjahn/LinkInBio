import { createClient } from '@supabase/supabase-js';

// Supabase configuration from project settings
const supabaseUrl = 'https://hkbvjdgowdksdkluyirh.supabase.co';
const supabaseAnonKey = encodeURIComponent('ZgbTkjY#^0E5M3VzP%TB');
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM';

// Create regular client for data operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Create admin client for schema management
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Initialize the database schema
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Try to fetch from the history table to check if it exists
    const { error: checkError } = await adminClient
      .from('history')
      .select('count')
      .limit(1);

    // If table doesn't exist, create it
    if (checkError?.message?.includes('relation "history" does not exist')) {
      console.log('Creating history table...');
      
      // Create a test record to force table creation with the correct schema
      const { error: createError } = await adminClient
        .from('history')
        .insert([
          {
            input: 'test',
            output: 'test',
            type: 'news',
            metadata: {}
          }
        ])
        .select();

      if (createError) {
        console.error('Error creating history table:', createError);
        return false;
      }

      // Clean up test record
      await adminClient
        .from('history')
        .delete()
        .eq('input', 'test');

      console.log('Database initialized successfully');
    } else {
      console.log('History table already exists');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export interface HistoryRecord {
  id?: string;
  created_at?: string;
  input: string;
  output: string;
  type: 'news' | 'title' | 'suggestion';
  metadata?: Record<string, any>;
}

export async function saveToHistory(record: Omit<HistoryRecord, 'id' | 'created_at'>) {
  try {
    console.log('Attempting to save to history:', record);
    
    // First, check if the table exists
    const { error: tableError } = await supabase
      .from('history')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Error checking history table:', tableError);
      // If table doesn't exist, try to create it
      const createTable = `
        create table if not exists history (
          id uuid default uuid_generate_v4() primary key,
          created_at timestamp with time zone default timezone('utc'::text, now()),
          input text not null,
          output text not null,
          type text not null check (type in ('news', 'title', 'suggestion')),
          metadata jsonb
        );
      `;
      const { error: createError } = await supabase.rpc('create_history_table', { sql: createTable });
      if (createError) {
        console.error('Error creating history table:', createError);
        throw createError;
      }
    }

    // Now try to insert the record
    const { data, error } = await supabase
      .from('history')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error inserting record:', error);
      throw error;
    }

    console.log('Successfully saved to history:', data);
    return data;
  } catch (error) {
    console.error('Error in saveToHistory:', error);
    // Don't throw the error, just log it and return null
    return null;
  }
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
  if (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
  return data;
}

export async function getHistoryById(id: string) {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching history by id:', error);
    throw error;
  }
  return data;
}

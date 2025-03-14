import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for Supabase configuration (from MCP server)
const supabaseUrl = 'https://hkbvjdgowdksdkluyirh.supabase.co';
const supabaseAnonKey = 'ZgbTkjY#^0E5M3VzP%TB';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM';

// Log Supabase configuration
console.log('Supabase URL:', supabaseUrl);
console.log('Using Supabase MCP server configuration');

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing required configuration for Supabase');
  if (!supabaseUrl) console.error('Supabase URL is not set');
  if (!supabaseAnonKey) console.error('Supabase Anon Key is not set');
  if (!supabaseServiceKey) console.error('Supabase Service Key is not set');
}

// Create regular client for data operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Create admin client for schema management
export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Export a function to check if Supabase is properly configured
export function checkSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is incomplete. Please check your environment variables:\n' +
      (!supabaseUrl ? '- NEXT_PUBLIC_SUPABASE_URL is missing\n' : '') +
      (!supabaseAnonKey ? '- NEXT_PUBLIC_SUPABASE_ANON_KEY is missing\n' : '')
    );
  }
  return true;
}

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
    // Validate the record before attempting any operations
    if (!record.input || !record.output || !record.type) {
      throw new Error('Invalid history record: missing required fields');
    }

    // Ensure we're using the admin client for table operations
    const { error: tableError } = await adminClient
      .from('history')
      .select('id')
      .limit(1);

    if (tableError?.message?.includes('relation "history" does not exist')) {
      console.log('Creating history table...');
      
      // Create the history table with the correct schema
      const { error: createError } = await adminClient
        .from('history')
        .insert({
          input: 'test',
          output: 'test',
          type: 'news',
          metadata: {}
        })
        .select()
        .single();

      // If we get here, the table was created automatically

      if (createError) {
        console.error('Error creating history table:', createError);
        throw createError;
      }

      console.log('History table created successfully');
    }

    // Validate the record before insertion
    if (!record.input || !record.output || !record.type) {
      throw new Error('Invalid history record: missing required fields');
    }

    // Now try to insert the record using the admin client
    const { data, error: insertError } = await adminClient
      .from('history')
      .insert({
        ...record,
        metadata: record.metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting record:', insertError);
      throw insertError;
    }

    console.log('Successfully saved to history:', data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in saveToHistory:', errorMessage);
    throw new Error(`Failed to save to history: ${errorMessage}`);
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

import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for Supabase configuration
const supabaseUrl = 'https://hkbvjdgowdksdkluyirh.supabase.co';

// NOTE: Based on testing, only the service role key works reliably
// The anon key with special characters causes connection issues
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM';

// Log Supabase configuration only on the server side
if (typeof window === 'undefined') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using Supabase service role key for all operations');
}

// Validate configuration
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required configuration for Supabase');
  if (!supabaseUrl) console.error('Supabase URL is not set');
  if (!supabaseServiceKey) console.error('Supabase Service Key is not set');
}

// Create regular client for data operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Add debug logging
console.log('Supabase client created successfully');

// Test the connection on initialization
if (typeof window === 'undefined') {
  // Only run this on the server to avoid console spam
  supabase.from('history').select('count').then(({ data, error }) => {
    if (error) {
      console.error('Initial Supabase connection test failed:', error);
    } else {
      console.log('Initial Supabase connection test succeeded:', data);
    }
  });
}

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

// Provide a function to get a fresh client instance (useful for client-side)
export function getSupabaseClient() {
  console.log('Creating fresh Supabase client instance');
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  });
}

// Export a function to check if Supabase is properly configured
export function checkSupabaseConfig() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase configuration is incomplete. Please check your configuration:\n' +
      (!supabaseUrl ? '- Supabase URL is missing\n' : '') +
      (!supabaseServiceKey ? '- Supabase Service Key is missing\n' : '')
    );
  }
  console.log('Supabase configuration check passed');
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
  type: 'news' | 'title' | 'suggestion' | 'outline';
  metadata?: Record<string, any>;
}

export async function saveToHistory(record: Omit<HistoryRecord, 'id' | 'created_at'>) {
  try {
    // Only save title generation, outline, and suggestion history, not news analysis
    if (record.type !== 'title' && record.type !== 'outline' && record.type !== 'suggestion') {
      console.log('Skipping save to history for unsupported record type:', record.type);
      return null;
    }
    
    // Validate the record before attempting any operations
    if (!record.input || !record.output) {
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
    if (!record.input || !record.output) {
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

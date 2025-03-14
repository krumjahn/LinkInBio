import { createClient } from '@supabase/supabase-js';

// Get environment variables from the Supabase MCP server configuration
const supabaseUrl = 'https://hkbvjdgowdksdkluyirh.supabase.co';
const supabaseAnonKey = 'ZgbTkjY#^0E5M3VzP%TB';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM';

// Create admin client for all operations
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

async function testMcpConnection() {
  console.log('Testing Supabase MCP connection...');
  console.log('URL:', supabaseUrl);
  console.log('Service Role Key (first 10 chars):', supabaseServiceKey.substring(0, 10) + '...');

  try {
    // Test 1: Check if the history table exists
    console.log('\nTest 1: Check History Table');
    const { data: tableInfo, error: tableError } = await adminClient
      .from('history')
      .select('count');

    if (tableError) {
      console.error('Error checking history table:', tableError);
      
      // If table doesn't exist, create it
      if (tableError.message.includes('relation "history" does not exist')) {
        console.log('Creating history table...');
        
        // Create the history table with the correct schema
        const { error: createError } = await adminClient.rpc('create_table_if_not_exists', {
          table_name: 'history',
          schema_sql: `
            CREATE TABLE IF NOT EXISTS history (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
              input TEXT NOT NULL,
              output TEXT NOT NULL,
              type TEXT NOT NULL CHECK (type IN ('news', 'title', 'suggestion')),
              metadata JSONB DEFAULT '{}'::jsonb
            );
          `
        });

        if (createError) {
          console.error('Error creating history table:', createError);
        } else {
          console.log('History table created successfully');
        }
      }
    } else {
      console.log('History table exists:', tableInfo);
    }

    // Test 2: Insert a test record
    console.log('\nTest 2: Insert Test Record');
    const testRecord = {
      input: 'test-mcp-connection',
      output: JSON.stringify({ test: true }),
      type: 'news',
      metadata: { test: true, source: 'mcp-server' }
    };

    const { data: insertData, error: insertError } = await adminClient
      .from('history')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('Error inserting test record:', insertError);
    } else {
      console.log('Test record inserted successfully:', insertData);

      // Clean up test record
      const { error: deleteError } = await adminClient
        .from('history')
        .delete()
        .eq('input', 'test-mcp-connection');

      if (deleteError) {
        console.error('Error deleting test record:', deleteError);
      } else {
        console.log('Test record deleted successfully');
      }
    }

    console.log('\nMCP connection test completed');
  } catch (error) {
    console.error('Unexpected error during MCP connection test:', error);
  }
}

// Run the test
testMcpConnection();

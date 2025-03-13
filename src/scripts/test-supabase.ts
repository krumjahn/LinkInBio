import { supabase } from '../lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test 1: Simple health check
    console.log('\nTest 1: Health Check');
    const { data: healthCheck, error: healthError } = await supabase
      .from('history')
      .select('count');

    if (healthError) {
      console.error('Health check failed:', healthError);
      if (healthError.message.includes('invalid api key')) {
        console.error('API key validation failed. Please check your API key configuration.');
      }
      if (healthError.message.includes('relation "history" does not exist')) {
        console.error('History table not found. This is expected if no records have been created yet.');
      }
    } else {
      console.log('Health check passed:', healthCheck);
    }

    // Test 2: Try to insert a test record
    console.log('\nTest 2: Insert Test');
    const testRecord = {
      input: 'test-connection',
      output: JSON.stringify({ test: true }),
      type: 'news',
      metadata: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('history')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('Insert test failed:', insertError);
    } else {
      console.log('Insert test passed:', insertData);

      // Clean up test record
      const { error: deleteError } = await supabase
        .from('history')
        .delete()
        .eq('input', 'test-connection');

      if (deleteError) {
        console.error('Failed to clean up test record:', deleteError);
      } else {
        console.log('Test record cleaned up successfully');
      }
    }

    // Test 3: Configuration check
    console.log('\nTest 3: Configuration Check');
    console.log('URL:', supabase.supabaseUrl);
    console.log('API Key (first 10 chars):', supabase.supabaseKey.substring(0, 10) + '...');

  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }
}

// Run the tests
testSupabaseConnection();

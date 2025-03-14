// Debug script for Supabase connection issues
import { createClient } from '@supabase/supabase-js';

// Different approaches to try
async function main() {
  console.log('=== SUPABASE CONNECTION DEBUGGING ===');
  
  const supabaseUrl = 'https://hkbvjdgowdksdkluyirh.supabase.co';
  const supabaseAnonKey = 'ZgbTkjY#^0E5M3VzP%TB';
  
  console.log('Original key:', supabaseAnonKey);
  
  // Approach 1: Direct usage without encoding
  try {
    console.log('\n=== APPROACH 1: Direct usage ===');
    const client1 = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Client created successfully');
    const { data: data1, error: error1 } = await client1.from('history').select('count');
    
    if (error1) {
      console.error('Error with direct usage:', error1);
    } else {
      console.log('Success with direct usage:', data1);
    }
  } catch (e) {
    console.error('Exception with direct usage:', e);
  }
  
  // Approach 2: URL encoding the key
  try {
    console.log('\n=== APPROACH 2: URL encoding ===');
    const encodedKey = encodeURIComponent(supabaseAnonKey);
    console.log('Encoded key:', encodedKey);
    const client2 = createClient(supabaseUrl, encodedKey);
    console.log('Client created successfully');
    const { data: data2, error: error2 } = await client2.from('history').select('count');
    
    if (error2) {
      console.error('Error with URL encoding:', error2);
    } else {
      console.log('Success with URL encoding:', data2);
    }
  } catch (e) {
    console.error('Exception with URL encoding:', e);
  }
  
  // Approach 3: Manual character replacement
  try {
    console.log('\n=== APPROACH 3: Manual character replacement ===');
    const manuallyEncodedKey = supabaseAnonKey
      .replace('#', '%23')
      .replace('^', '%5E')
      .replace('%', '%25');
    console.log('Manually encoded key:', manuallyEncodedKey);
    const client3 = createClient(supabaseUrl, manuallyEncodedKey);
    console.log('Client created successfully');
    const { data: data3, error: error3 } = await client3.from('history').select('count');
    
    if (error3) {
      console.error('Error with manual encoding:', error3);
    } else {
      console.log('Success with manual encoding:', data3);
    }
  } catch (e) {
    console.error('Exception with manual encoding:', e);
  }
  
  // Approach 4: Using a different key format (removing special characters)
  try {
    console.log('\n=== APPROACH 4: Alternative key format ===');
    // This is just for testing - in production you'd use the real key
    const alternativeKey = 'ZgbTkjY0E5M3VzPTB'; // Removed special chars
    console.log('Alternative key:', alternativeKey);
    const client4 = createClient(supabaseUrl, alternativeKey);
    console.log('Client created successfully');
    const { data: data4, error: error4 } = await client4.from('history').select('count');
    
    if (error4) {
      console.error('Error with alternative key:', error4);
    } else {
      console.log('Success with alternative key:', data4);
    }
  } catch (e) {
    console.error('Exception with alternative key:', e);
  }
  
  // Approach 5: Using environment variables
  try {
    console.log('\n=== APPROACH 5: Using service role key ===');
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM';
    const client5 = createClient(supabaseUrl, serviceKey);
    console.log('Client created successfully');
    const { data: data5, error: error5 } = await client5.from('history').select('count');
    
    if (error5) {
      console.error('Error with service role key:', error5);
    } else {
      console.log('Success with service role key:', data5);
    }
  } catch (e) {
    console.error('Exception with service role key:', e);
  }
}

main().catch(console.error);

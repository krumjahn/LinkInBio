// Verify Supabase connection and history functionality
import { supabase, adminClient, saveToHistory, getHistory } from '../lib/supabase';

async function main() {
  console.log('=== SUPABASE VERIFICATION SCRIPT ===');
  
  try {
    // 1. Test basic connection with regular client
    console.log('\n1. Testing regular client connection...');
    const { data: regularData, error: regularError } = await supabase
      .from('history')
      .select('count');
      
    if (regularError) {
      console.error('Regular client connection failed:', regularError);
    } else {
      console.log('Regular client connection successful:', regularData);
    }
    
    // 2. Test connection with admin client
    console.log('\n2. Testing admin client connection...');
    const { data: adminData, error: adminError } = await adminClient
      .from('history')
      .select('count');
      
    if (adminError) {
      console.error('Admin client connection failed:', adminError);
    } else {
      console.log('Admin client connection successful:', adminData);
    }
    
    // 3. Test saving to history
    console.log('\n3. Testing saveToHistory function...');
    const testRecord = {
      input: 'Test input ' + new Date().toISOString(),
      output: JSON.stringify([{ title: 'Test Title', score: 85 }]),
      type: 'title' as const,
      metadata: { source: 'verification script' }
    };
    
    try {
      const savedRecord = await saveToHistory(testRecord);
      console.log('Record saved successfully:', savedRecord);
      
      // 4. Test retrieving history
      console.log('\n4. Testing getHistory function...');
      const history = await getHistory('title');
      console.log(`Retrieved ${history.length} history records`);
      
      // Find our test record
      const foundRecord = history.find(r => r.input === testRecord.input);
      if (foundRecord) {
        console.log('Test record found in history:', foundRecord);
      } else {
        console.error('Test record not found in history!');
      }
      
    } catch (saveError) {
      console.error('Error saving to history:', saveError);
    }
    
  } catch (error) {
    console.error('Unexpected error during verification:', error);
  }
}

main()
  .then(() => console.log('\n=== VERIFICATION COMPLETE ==='))
  .catch(console.error);

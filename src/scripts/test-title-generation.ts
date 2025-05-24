// Test script for title generation and history saving
// Using fetch instead of axios
import { getHistory } from '../lib/supabase';

async function main() {
  console.log('=== TITLE GENERATION AND HISTORY TEST ===');
  
  // 1. Check existing history records
  console.log('\n1. Checking existing history records...');
  try {
    const existingHistory = await getHistory('title');
    console.log(`Found ${existingHistory.length} existing title generation records`);
    
    if (existingHistory.length > 0) {
      console.log('Most recent record:', {
        id: existingHistory[0].id,
        input: existingHistory[0].input,
        created_at: existingHistory[0].created_at,
        type: existingHistory[0].type
      });
    }
  } catch (error) {
    console.error('Error checking history:', error);
  }
  
  // 2. Generate new titles
  console.log('\n2. Generating new titles...');
  const topic = 'artificial intelligence trends ' + new Date().toISOString().slice(0, 16);
  
  try {
    console.log(`Generating titles for topic: "${topic}"`);
    const response = await fetch('http://localhost:3000/api/generate-titles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Title generation successful!');
    console.log(`Generated ${data.titles.length} titles`);
    console.log('First title:', data.titles[0]);
    
    // 3. Verify the new record was saved to history
    console.log('\n3. Verifying history was updated...');
    // Wait a moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedHistory = await getHistory('title');
    console.log(`Found ${updatedHistory.length} title generation records after generation`);
    
    // Find our test record
    const newRecord = updatedHistory.find(r => r.input === topic);
    if (newRecord) {
      console.log('New record found in history:', {
        id: newRecord.id,
        input: newRecord.input,
        created_at: newRecord.created_at,
        type: newRecord.type
      });
      console.log('Test PASSED: Title generation history is working correctly!');
    } else {
      console.error('Test FAILED: New record not found in history!');
    }
    
  } catch (error) {
    console.error('Error generating titles:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('Response error data:', (error as any).response?.data);
    }
  }
}

main()
  .then(() => console.log('\n=== TEST COMPLETE ==='))
  .catch(console.error);

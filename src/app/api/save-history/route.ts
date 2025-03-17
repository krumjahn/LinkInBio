import { NextResponse } from 'next/server'
import { saveToHistory } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { input, output, type, metadata } = await request.json()

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    if (!output) {
      return NextResponse.json({ error: 'Output is required' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    console.log('Saving to history:', { input, type, metadata })

    // Save to Supabase history
    try {
      const historyRecord = {
        input,
        output,
        type,
        metadata: metadata || {}
      }
      
      console.log('History record to save:', historyRecord)
      const savedRecord = await saveToHistory(historyRecord)
      console.log('Successfully saved to history:', savedRecord)
      
      return NextResponse.json({ 
        success: true,
        message: 'Successfully saved to history',
        record: savedRecord
      })
      
    } catch (error) {
      console.error('Error saving to history:')
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      } else {
        console.error('Unknown error:', error)
      }
      
      throw error
    }
    
  } catch (error) {
    console.error('Error in save-history API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save to history' },
      { status: 500 }
    )
  }
}

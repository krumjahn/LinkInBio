import { NextResponse } from 'next/server'

// API keys should be in environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  console.error('Missing API key: OpenRouter')
}

export async function POST(request: Request) {
  try {
    const { prompt, topic, sectionTitle } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    if (!sectionTitle) {
      return NextResponse.json({ error: 'Section title is required' }, { status: 400 })
    }

    console.log('Regenerating section with prompt:', prompt)

    // Call OpenRouter API with the x-ai/grok-2-1212 model
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/krumjahn/App',
          'X-Title': 'Content Tools'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-2-1212',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status}`, errorText);
      throw new Error(`OpenRouter API returned ${response.status}: ${errorText}`)
    }

    // Extract the content from the response
    const data = await response.json()
    console.log('OpenRouter API response:', JSON.stringify(data))
    
    if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
      console.error('Invalid response format from OpenRouter API:', data)
      
      // Check if there's an error message in the response
      if (data && data.error) {
        throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`)
      } else {
        throw new Error('Invalid response format from OpenRouter API')
      }
    }
    
    const content = data.choices[0].message.content
    console.log('Raw section regeneration response:', content)

    // Parse the JSON array from the content
    let subsections: string[] = []
    try {
      // Find JSON in the response (in case the model adds extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const jsonContent = jsonMatch[0]
        subsections = JSON.parse(jsonContent)
      } else {
        // If no JSON array is found, try to extract lines that look like subsection titles
        subsections = content
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^["'\d\.\-\*]+\s*/, '').trim()) // Remove quotes, numbers, bullets, etc.
          .filter((line: string) => line.length > 0)
          .slice(0, 3) // Take at most 3 subsections
      }
      
      // Validate the subsections
      if (!Array.isArray(subsections) || subsections.length === 0) {
        throw new Error('Invalid subsections structure')
      }
      
    } catch (error) {
      console.error('Error parsing subsections:', error)
      console.error('Raw content:', content)
      
      // Create fallback subsections
      subsections = [
        `Key aspects of ${sectionTitle}`,
        `How ${sectionTitle} impacts your audience`,
        `Best practices for ${sectionTitle}`
      ]
    }

    console.log('Successfully parsed subsections:', subsections)

    return NextResponse.json({ subsections })
    
  } catch (error) {
    console.error('Error regenerating section:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate section' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { saveToHistory } from '@/lib/supabase'

// API keys should be in environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  console.error('Missing API key: OpenRouter')
}

interface OutlineSection {
  title: string
  subSections: string[]
}

interface ArticleOutline {
  title: string
  introduction: string
  sections: OutlineSection[]
  conclusion: string
}

export async function POST(request: Request) {
  try {
    const { title, topic, wordCount = 2000 } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const prompt = `You are a professional content outline creator. Create a detailed outline for a ${wordCount}-word blog article with the title: "${title}" about the topic: "${topic}".

The outline should include:
1. An engaging introduction (summarize what this will cover)
2. 4-6 main sections with descriptive headings
3. 2-3 subsections under each main section
4. A conclusion section

Format the response as a JSON object with this structure:
{
  "title": "The exact title provided",
  "introduction": "Brief description of what the introduction should cover",
  "sections": [
    {
      "title": "Section 1 Title",
      "subSections": ["Subsection 1.1 Title", "Subsection 1.2 Title", "Subsection 1.3 Title"]
    },
    {
      "title": "Section 2 Title",
      "subSections": ["Subsection 2.1 Title", "Subsection 2.2 Title"]
    }
  ],
  "conclusion": "Brief description of what the conclusion should cover"
}

Make sure each section and subsection title is descriptive, engaging, and SEO-friendly. The outline should flow logically and cover the topic comprehensively.`

    console.log('Generating outline with prompt:', prompt)

    // Call OpenRouter API (using Claude 3.5 Haiku model)
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
          model: 'openai/gpt-3.5-turbo',
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
    console.log('Raw outline response:', content)

    // Parse the JSON from the content
    let outline: ArticleOutline
    try {
      // Find JSON in the response (in case the model adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const jsonContent = jsonMatch[0]
      outline = JSON.parse(jsonContent)
      
      // Validate the outline structure
      if (!outline.title || !outline.introduction || !Array.isArray(outline.sections) || !outline.conclusion) {
        throw new Error('Invalid outline structure')
      }
      
      // Ensure each section has a title and subsections
      outline.sections.forEach(section => {
        if (!section.title || !Array.isArray(section.subSections)) {
          throw new Error('Invalid section structure')
        }
      })
      
    } catch (error) {
      console.error('Error parsing outline:', error)
      console.error('Raw content:', content)
      return NextResponse.json({ 
        error: 'Failed to parse outline from AI response',
        rawContent: content
      }, { status: 500 })
    }

    console.log('Successfully parsed outline:', outline)

    // Save to Supabase history
    try {
      console.log('Saving outline generation to history...')
      const historyRecord = {
        input: `${title} - ${topic}`,
        output: JSON.stringify(outline),
        type: 'title' as const,
        metadata: {
          type: 'outline',
          title,
          topic,
          wordCount,
          model: 'openai/gpt-3.5-turbo',
          timestamp: new Date().toISOString()
        }
      }
      
      console.log('History record to save:', historyRecord)
      const savedRecord = await saveToHistory(historyRecord)
      console.log('Successfully saved outline to history:', savedRecord)
    } catch (error) {
      console.error('Error saving outline to history:')
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      } else {
        console.error('Unknown error:', error)
      }
    }

    return NextResponse.json({ outline })
    
  } catch (error) {
    console.error('Error generating outline:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate outline' },
      { status: 500 }
    )
  }
}

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

interface ArticleSection {
  title: string
  content: string
  subSections: {
    title: string
    content: string
  }[]
}

interface Article {
  title: string
  introduction: string
  sections: ArticleSection[]
  conclusion: string
}

export async function POST(request: Request) {
  try {
    const { outline, topic, wordCount = 2000 } = await request.json()

    if (!outline || !outline.title || !outline.sections) {
      return NextResponse.json({ error: 'Valid outline is required' }, { status: 400 })
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Calculate approximate word count per section
    const totalSections = outline.sections.reduce(
      (count, section) => count + 1 + section.subSections.length, 
      0
    ) + 2 // +2 for intro and conclusion
    
    const wordsPerSection = Math.floor(wordCount / totalSections)
    
    // Intro and conclusion get slightly more words
    const introWords = Math.floor(wordsPerSection * 1.2)
    const conclusionWords = Math.floor(wordsPerSection * 1.2)
    
    // Main sections and subsections get the standard allocation
    const mainSectionWords = wordsPerSection
    const subSectionWords = wordsPerSection

    const prompt = `You are a professional blog writer. Write a ${wordCount}-word blog article based on the following outline about the topic: "${topic}".

TITLE: ${outline.title}

OUTLINE:
Introduction: ${outline.introduction} (approximately ${introWords} words)

${outline.sections.map((section, i) => `
Section ${i+1}: ${section.title}
${section.subSections.map((sub, j) => `- Subsection ${i+1}.${j+1}: ${sub}`).join('\n')}
`).join('\n')}

Conclusion: ${outline.conclusion} (approximately ${conclusionWords} words)

FORMAT INSTRUCTIONS:
1. Write the full article following the exact structure of the outline
2. For each section and subsection, include the exact title from the outline
3. Format the response as a JSON object with this structure:
{
  "title": "The exact title",
  "introduction": "Full introduction text",
  "sections": [
    {
      "title": "Section 1 Title",
      "content": "Main section content",
      "subSections": [
        {
          "title": "Subsection 1.1 Title",
          "content": "Subsection content"
        },
        {
          "title": "Subsection 1.2 Title",
          "content": "Subsection content"
        }
      ]
    }
  ],
  "conclusion": "Full conclusion text"
}

WRITING GUIDELINES:
- Make the content engaging, informative, and well-researched
- Include relevant statistics, examples, and quotes where appropriate
- Use a conversational but professional tone
- Ensure the content flows logically between sections
- Include appropriate transition phrases between sections
- Aim for approximately ${mainSectionWords} words for main section content and ${subSectionWords} words for each subsection
- Write in a way that demonstrates expertise on the topic`

    console.log('Generating article with prompt:', prompt)

    // Call OpenRouter API (using Gemma model)
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
    console.log('Raw article response length:', content.length)

    // Parse the JSON from the content
    let article: Article
    try {
      // Find JSON in the response (in case the model adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const jsonContent = jsonMatch[0]
      article = JSON.parse(jsonContent)
      
      // Validate the article structure
      if (!article.title || !article.introduction || !Array.isArray(article.sections) || !article.conclusion) {
        throw new Error('Invalid article structure')
      }
      
      // Ensure each section has required fields
      article.sections.forEach(section => {
        if (!section.title || !section.content || !Array.isArray(section.subSections)) {
          throw new Error('Invalid section structure')
        }
        
        section.subSections.forEach(sub => {
          if (!sub.title || !sub.content) {
            throw new Error('Invalid subsection structure')
          }
        })
      })
      
    } catch (error) {
      console.error('Error parsing article:', error)
      return NextResponse.json({ 
        error: 'Failed to parse article from AI response',
        rawContent: content.substring(0, 1000) + '...' // Only return a preview
      }, { status: 500 })
    }

    console.log('Successfully parsed article with sections:', article.sections.length)

    // Save to Supabase history
    try {
      console.log('Saving article generation to history...')
      const historyRecord = {
        input: `${article.title} - ${topic}`,
        output: JSON.stringify({
          title: article.title,
          wordCount,
          sectionCount: article.sections.length
        }),
        type: 'title' as const,
        metadata: {
          type: 'article',
          title: article.title,
          topic,
          wordCount,
          model: 'openai/gpt-3.5-turbo',
          timestamp: new Date().toISOString()
        }
      }
      
      console.log('History record to save:', historyRecord)
      const savedRecord = await saveToHistory(historyRecord)
      console.log('Successfully saved article to history:', savedRecord)
    } catch (error) {
      console.error('Error saving article to history:')
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      } else {
        console.error('Unknown error:', error)
      }
    }

    return NextResponse.json({ article })
    
  } catch (error) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate article' },
      { status: 500 }
    )
  }
}

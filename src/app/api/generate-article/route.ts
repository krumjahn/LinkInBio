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
      (count: number, section: OutlineSection) => count + 1 + section.subSections.length, 
      0
    ) + 2 // +2 for intro and conclusion
    
    const wordsPerSection = Math.floor(wordCount / totalSections)
    
    // Intro and conclusion get slightly more words
    const introWords = Math.floor(wordsPerSection * 1.2)
    const conclusionWords = Math.floor(wordsPerSection * 1.2)
    
    // Main sections and subsections get the standard allocation
    const mainSectionWords = wordsPerSection
    const subSectionWords = wordsPerSection

    const prompt = `You are a master blog writer. Write a blog article on the topic "${topic}" based on the following outline:

TITLE: ${outline.title}

OUTLINE:
Introduction:
WHAT: This is about ${outline.introduction}
WHO: This piece is for readers interested in ${topic}
PROMISE: By the time you finish reading this piece, you will understand ${outline.introduction}
CREDIBILITY: I have researched and compiled the most relevant information on ${topic}

${outline.sections.map((section: OutlineSection, i: number) => `
Point ${i+1}: ${section.title}
${section.subSections.map((sub: string) => `- ${sub}`).join('\n')}
`).join('\n')}

Conclusion: ${outline.conclusion}
CTA: Learn more about ${topic} and apply these insights

A few rules:
Introduce the topic. Use short punchy sentences. Keep the line spacing.
Use this format:
In 1 sentence, make a strong declarative statement about the topic.
In 3-5 sentences, describe why there is a problem, why it needs to be solved. And that we are going to solve it.
In 1 sentence, tell the reader what you are going to talk about and point out the benefits for reading.

Write each section.
Use this format:
In 1 sentence, introduce a common problem your target audience related to this section.
In 1 sentence, explain the reason this is an issue.
In 3 short bullets, offer surprising or counterintuitive tips to solve it.
In 1 sentence, point out the big benefit for following the tips.
In 3 sentences, give a fact, story, or example that proves the section point.
In 1 sentence, tell why the fact, story, or example matters to the section point.
In 2 sentences, wrap up with a poignant takeaway that reinforces the section point.
In 1 sentence, setup what's coming next, making the flow coherent.

Finally, at the very end, give the reader 1 final takeaway.

TONE GUIDELINES:
- Conversational and approachable: Use a friendly, informal tone that feels like a one-on-one conversation.
- Authoritative yet humble: Draw from personal experiences and industry knowledge to establish credibility, while maintaining humility.
- Visionary and forward-thinking: Present innovative ideas and future trends with confidence, challenging conventional wisdom.
- Anecdotal: Incorporate personal stories and real-world examples to illustrate points and make concepts relatable.
- Concise and impactful: Use short, punchy sentences (12 words max) and brief paragraphs to maintain engagement.
- Thought-provoking: Pose questions and present ideas that challenge readers to think differently.
- Passionate and inspiring: Convey genuine enthusiasm for the subject, aiming to motivate and excite the reader.
- Tech-savvy: Demonstrate understanding of technology trends when relevant to the topic.
- Business-oriented: Focus on practical applications, strategies, and market dynamics when applicable.
- Slightly informal: Use contractions and occasional colloquial phrases to maintain an accessible tone.
- Name-dropping: Reference relevant well-known figures and companies to add context and credibility.
- Metaphorical: Use analogies and comparisons to explain complex ideas in simpler terms.

When writing, aim to:
- Start with a hook or provocative statement
- Use personal anecdotes to illustrate larger points
- Incorporate current trends and cutting-edge concepts when relevant
- Challenge existing paradigms and present innovative solutions
- Conclude with forward-looking statements or calls to action

The tone should resonate with entrepreneurs, tech enthusiasts, and business professionals while remaining accessible to a general audience interested in innovation and future trends.

FORMAT INSTRUCTIONS:
Format the response as a JSON object with this structure:
{
  "title": "${outline.title}",
  "introduction": "Full introduction text following the format above",
  "sections": [
    {
      "title": "Section Title",
      "content": "Main section content following the format above",
      "subSections": [
        {
          "title": "Subsection Title",
          "content": "Subsection content"
        }
      ]
    }
  ],
  "conclusion": "Full conclusion text with final takeaway"
}`

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
          model: 'x-ai/grok-2-1212',
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

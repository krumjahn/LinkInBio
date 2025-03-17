import { NextResponse } from 'next/server'
import { saveToHistory, initializeDatabase } from '@/lib/supabase'
import { parseString } from 'xml2js'

// Initialize database on server start
initializeDatabase().catch(console.error)

interface TitleSuggestion {
  title: string
  newsScore: number
  searchScore: number
  score: number
  reasoning: string
}

// API keys should be in environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const NEWS_API_KEY = process.env.NEWS_API_KEY

if (!OPENROUTER_API_KEY) {
  console.error('Missing API key: OpenRouter')
}

if (!NEWS_API_KEY) {
  console.error('Missing API key: NewsAPI')
}

async function fetchNewsArticles(topic: string) {
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=relevancy&pageSize=5&language=en`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY || ''
      }
    })

    if (!response.ok) {
      throw new Error(`NewsAPI returned ${response.status}`)
    }

    const data = await response.json()
    return data.articles || []
  } catch (error) {
    console.error('Error fetching news articles:', error)
    return []
  }
}

async function fetchGoogleSuggestions(topic: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=${encodeURIComponent(topic)}`,
      {
        headers: {
          'Accept': 'application/xml'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Google Suggestions API returned ${response.status}`)
    }

    const responseText = await response.text()
    
    return new Promise((resolve, reject) => {
      parseString(responseText, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err)
          return resolve([])
        }
        
        try {
          // Add proper null/undefined checking
          if (result && result.toplevel && result.toplevel.CompleteSuggestion) {
            const suggestions = result.toplevel.CompleteSuggestion.map(
              (item: any) => item.suggestion[0].$.data
            )
            resolve(suggestions)
          } else {
            console.log('No suggestions found in Google response')
            resolve([])
          }
        } catch (e) {
          console.error('Error extracting suggestions:', e)
          resolve([])
        }
      })
    })
  } catch (error) {
    console.error('Error fetching Google suggestions:', error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { topic, titleType = 'blog' } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    console.log(`Generating ${titleType} titles for topic: ${topic}`)

    // 1. Fetch news articles related to the topic
    console.log('Fetching related news articles...')
    const newsArticles = await fetchNewsArticles(topic)
    console.log(`Found ${newsArticles.length} related news articles`)

    // 2. Fetch Google search suggestions
    console.log('Fetching Google search suggestions...')
    const searchSuggestions = await fetchGoogleSuggestions(topic)
    console.log(`Found ${searchSuggestions.length} search suggestions`)

    // 3. Format the context for the AI
    const newsContext = newsArticles.map((article: any, index: number) => 
      `News Article ${index + 1}: ${article.title} - ${article.description || 'No description'}`
    ).join('\n\n')

    const searchContext = searchSuggestions.length > 0 
      ? `Related Search Queries:\n${searchSuggestions.join('\n')}`
      : 'No related search queries found.'

    // 4. Determine the title type prompt
    let titleTypePrompt = ''
    let titleCount = 5
    
    switch (titleType) {
      case 'blog':
        titleTypePrompt = `
- Create engaging, click-worthy blog post titles
- Use numbers, power words, and emotional triggers
- Focus on benefits, curiosity, and problem-solving
- Aim for 60-70 characters in length`
        titleCount = 7
        break
      
      case 'listicle':
        titleTypePrompt = `
- Create numbered list titles (e.g., "7 Ways to...")
- Focus on practical tips, strategies, or examples
- Use specific numbers (odd numbers often perform better)
- Make the benefit or outcome clear`
        titleCount = 5
        break
      
      case 'how-to':
        titleTypePrompt = `
- Create instructional "How to" titles
- Focus on specific processes or methods
- Include clear outcomes or benefits
- Use power words like "easy," "simple," or "quick"`
        titleCount = 5
        break
      
      case 'question':
        titleTypePrompt = `
- Create titles framed as questions
- Target specific pain points or curiosities
- Use "Why," "How," "What," or "Is" to start
- Make questions specific and intriguing`
        titleCount = 5
        break
      
      default:
        titleTypePrompt = `
- Create engaging, click-worthy blog post titles
- Use numbers, power words, and emotional triggers
- Focus on benefits, curiosity, and problem-solving
- Aim for 60-70 characters in length`
        titleCount = 7
    }

    // 5. Create the AI prompt
    const prompt = `You are a professional content strategist specializing in creating high-performing titles based on search trends and news.

TOPIC: ${topic}

NEWS CONTEXT:
${newsContext}

SEARCH CONTEXT:
${searchContext}

TITLE TYPE: ${titleType}
${titleTypePrompt}

TASK:
Generate ${titleCount} unique, engaging titles for the topic "${topic}" that will perform well in both search and social media.

For each title:
1. Create a compelling title
2. Rate its news relevance score from 1-10
3. Rate its search optimization score from 1-10
4. Provide a brief reasoning for why this title will perform well

Format your response as a JSON array of objects with these properties:
[
  {
    "title": "Your Compelling Title Here",
    "newsScore": 8,
    "searchScore": 7,
    "score": 7.5,
    "reasoning": "Brief explanation of why this title works well"
  }
]

The "score" field should be the average of newsScore and searchScore.

TITLE CREATION GUIDELINES:
- Analyze both news articles and search suggestions for patterns
- Use proven headline patterns that match search intent
- Make titles both timely (news) and evergreen (search trends)
- Reference specific news stories and search trends in your reasoning`

    let aiResponse;
    try {
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

      const data = await response.json()
      console.log('OpenRouter API response:', JSON.stringify(data))
      
      // Add proper error handling for missing data
      if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
        console.error('Invalid response format from OpenRouter API:', data)
        
        // Check if there's an error message in the response
        if (data && data.error) {
          throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`)
        } else {
          throw new Error('Invalid response format from OpenRouter API')
        }
      }
      
      aiResponse = data.choices[0].message.content
    } catch (error) {
      console.error('Error calling OpenRouter API:', error)
      return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 })
    }

    // 6. Parse the AI response
    let titles: TitleSuggestion[] = []
    try {
      // Find JSON in the response (in case the model adds extra text)
      const jsonMatch = aiResponse.match(/\[\s\S]*\]/)
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
      
      // Validate the titles
      if (!Array.isArray(titles) || titles.length === 0) {
        throw new Error('Invalid titles format')
      }
      
      // Ensure each title has the required fields
      titles.forEach(title => {
        if (!title.title || typeof title.newsScore !== 'number' || typeof title.searchScore !== 'number') {
          throw new Error('Invalid title object structure')
        }
        
        // Calculate score if not provided
        if (!title.score) {
          title.score = (title.newsScore + title.searchScore) / 2
        }
        
        // Ensure reasoning is present
        if (!title.reasoning) {
          title.reasoning = 'This title combines news relevance with search optimization.'
        }
      })
      
      console.log(`Successfully parsed ${titles.length} titles`)
    } catch (error) {
      console.error('Error parsing titles:', error)
      console.error('Raw response:', aiResponse)
      
      // Attempt to create a basic response if parsing fails
      titles = [
        {
          title: `${titleCount} Essential Tips About ${topic} You Need to Know`,
          newsScore: 5,
          searchScore: 7,
          score: 6,
          reasoning: 'Fallback title due to parsing error. Numbered lists perform well.'
        },
        {
          title: `How to Master ${topic}: A Comprehensive Guide`,
          newsScore: 4,
          searchScore: 8,
          score: 6,
          reasoning: 'Fallback title due to parsing error. How-to guides are popular.'
        }
      ]
    }

    // 7. Save to history
    try {
      console.log('Saving title generation to history...')
      await saveToHistory({
        input: topic,
        output: JSON.stringify(titles),
        type: 'title',
        metadata: {
          titleType,
          newsArticles: newsArticles.length,
          searchSuggestions: searchSuggestions.length,
          model: 'openai/gpt-3.5-turbo',
          timestamp: new Date().toISOString()
        }
      })
      console.log('Successfully saved to history')
    } catch (error) {
      console.error('Error saving to history:', error)
      // Continue even if history save fails
    }

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('Error generating titles:', error)
    return NextResponse.json({ 
      error: 'Failed to generate titles: ' + (error as Error).message 
    }, { status: 500 })
  }
}

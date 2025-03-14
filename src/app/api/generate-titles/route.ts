import { NextResponse } from 'next/server'
import axios from 'axios'
import { saveToHistory, initializeDatabase } from '@/lib/supabase'

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
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || process.env.NEWS_API_KEY

if (!OPENROUTER_API_KEY || !NEWS_API_KEY) {
  console.error('Missing API keys:', { 
    hasOpenRouter: !!OPENROUTER_API_KEY, 
    hasNewsApi: !!NEWS_API_KEY 
  })
  throw new Error('Missing required API keys in environment variables')
}

async function fetchNewsArticles(topic: string) {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=relevancy&pageSize=5&language=en`,
      {
        headers: {
          'X-Api-Key': NEWS_API_KEY
        }
      }
    )
    return response.data.articles
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

import { parseString } from 'xml2js'

async function fetchGoogleSuggestions(topic: string): Promise<string[]> {
  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=${encodeURIComponent(topic)}`,
      {
        headers: {
          'Accept': 'application/xml'
        }
      }
    )

    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err)
          resolve([])
          return
        }

        const suggestions = result?.toplevel?.CompleteSuggestion
          ?.map((item: any) => item.suggestion?.[0]?.$?.data)
          .filter(Boolean) || []

        resolve(suggestions)
      })
    })
  } catch (error) {
    console.error('Error fetching Google suggestions:', error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Fetch recent news articles
    const articles = await fetchNewsArticles(topic)
    const newsContext = articles.length > 0 
      ? `\n\nRecent news articles about this topic:\n${articles
          .map((article: any) => `- ${article.title}\n  ${article.description || ''}`)
          .join('\n')}` 
      : ''

    // Fetch Google search suggestions
    const suggestions: string[] = await fetchGoogleSuggestions(topic)
    const searchContext = suggestions.length > 0
      ? `\n\nPopular Google searches related to this topic:\n${suggestions.map((s: string) => `- ${s}`).join('\n')}` 
      : ''

    const prompt = `You are a blog title expert. Generate 10 engaging, SEO-optimized blog titles for the topic: "${topic}".

Here are some recent news articles about this topic:${newsContext}

Here are popular Google searches related to this topic:${searchContext}

For each title:
1. Make it attention-grabbing and unique by combining insights from both news articles and search trends
2. Consider SEO best practices and incorporate high-performing search terms
3. Aim for high click-through rates by addressing current user interests

Format each title as:
Title: [The Title]
NewsScore: [1-100] (based on relevance to current news and trending topics)
SearchScore: [1-100] (based on search volume and keyword optimization)
OverallScore: [1-100] (weighted average: 40% news + 60% search)
Reasoning: [Explain how the title combines news angles with search trends, and why it will perform well]

Remember to:
- Lead with the most newsworthy angle from current articles
- Incorporate high-volume search terms naturally
- Use proven headline patterns that match search intent
- Make titles both timely (news) and evergreen (search trends)
- Reference specific news stories and search trends in your reasoning`

    let aiResponse;
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemma-3-27b-it:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://github.com/krumjahn/App',
            'X-Title': 'Blog Title Generator'
          }
        }
      )
      
      if (!response.data) {
        throw new Error('No data received from OpenRouter API')
      }

      if (!response.data?.choices?.[0]?.message?.content) {
        console.error('Invalid response format from OpenRouter:', response.data)
        throw new Error('Invalid response format from AI service')
      }
      
      aiResponse = response.data;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error)
      throw new Error('Failed to get response from OpenRouter API: ' + (error as Error).message)
    }

    const content = aiResponse.choices[0].message.content
    console.log('Raw AI response:', content)

    // Parse the response into structured data
    let titles: TitleSuggestion[] = []
    let parseError: Error | null = null
    
    try {
      // Split by triple dashes or double newlines to separate titles more reliably
      const blocks = content.split(/---+|\n\s*\n/).filter(Boolean)
      
      for (const block of blocks) {
        const lines = block.split('\n').map((line: string) => line.trim())
        let currentTitle: Partial<TitleSuggestion> = {}
        let multilineReasoning = ''
        let isReadingReasoning = false

        for (const line of lines) {
          if (!line) continue

          // Handle numbered titles with asterisks (e.g., "**8. Title:** The Future of Code")
          if (line.match(/^\*{0,2}\d+\.?\s*Title\:{0,1}\s*/) || line.startsWith('Title:')) {
            currentTitle.title = line.replace(/^\*{0,2}\d+\.?\s*Title\:{0,1}\s*/, '').trim()
          } else if (line.match(/^\*{0,2}NewsScore\:{0,1}\s*/) || line.startsWith('NewsScore:')) {
            const score = line.replace(/^\*{0,2}NewsScore\:{0,1}\s*/, '').trim()
            const numScore = parseInt(score.split(/[^0-9]/)[0], 10)
            if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
              currentTitle.newsScore = numScore
            }
          } else if (line.match(/^\*{0,2}SearchScore\:{0,1}\s*/) || line.startsWith('SearchScore:')) {
            const score = line.replace(/^\*{0,2}SearchScore\:{0,1}\s*/, '').trim()
            const numScore = parseInt(score.split(/[^0-9]/)[0], 10)
            if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
              currentTitle.searchScore = numScore
            }
          } else if (line.match(/^\*{0,2}OverallScore\:{0,1}\s*/) || line.startsWith('OverallScore:')) {
            const score = line.replace(/^\*{0,2}OverallScore\:{0,1}\s*/, '').trim()
            const numScore = parseInt(score.split(/[^0-9]/)[0], 10)
            if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
              currentTitle.score = numScore
            }
          } else if (line.match(/^\*{0,2}Reasoning\:{0,1}\s*/) || line.startsWith('Reasoning:')) {
            isReadingReasoning = true
            multilineReasoning = line.replace(/^\*{0,2}Reasoning\:{0,1}\s*/, '').trim()
          } else if (isReadingReasoning) {
            multilineReasoning += ' ' + line.trim()
          }
        }

        // Set the complete reasoning
        if (multilineReasoning) {
          currentTitle.reasoning = multilineReasoning.trim()
        }

        // Validate the title and add it if the required fields are present
        if (currentTitle.title) {
          // Set default values for missing fields
          if (typeof currentTitle.newsScore !== 'number' || isNaN(currentTitle.newsScore)) {
            console.log(`Setting default newsScore for title: ${currentTitle.title}`)
            currentTitle.newsScore = 70 // Default score
          }
          
          if (typeof currentTitle.searchScore !== 'number' || isNaN(currentTitle.searchScore)) {
            console.log(`Setting default searchScore for title: ${currentTitle.title}`)
            currentTitle.searchScore = 70 // Default score
          }
          
          if (typeof currentTitle.score !== 'number' || isNaN(currentTitle.score)) {
            // Calculate overall score as average of news and search scores
            currentTitle.score = Math.round((currentTitle.newsScore + currentTitle.searchScore) / 2)
            console.log(`Calculated overall score for title: ${currentTitle.title} = ${currentTitle.score}`)
          }
          
          if (!currentTitle.reasoning) {
            currentTitle.reasoning = 'This title combines current trends with search optimization.'
            console.log(`Setting default reasoning for title: ${currentTitle.title}`)
          }
          
          // Add the title to the results
          titles.push(currentTitle as TitleSuggestion)
          console.log(`Added title: ${currentTitle.title}`)
        } else {
          console.log('Skipping invalid title block:', currentTitle)
        }
      }

      // Try a more aggressive parsing approach if no titles were found
      if (titles.length === 0) {
        console.log('No titles found with standard parsing, attempting alternative parsing...');
        
        // Look for title-like patterns in the raw content
        const titleMatches = content.match(/(?:Title:|\*\*\d+\.\s*Title:\*\*|\d+\.\s*Title:)\s*([^\n]+)/g);
        
        if (titleMatches && titleMatches.length > 0) {
          console.log('Found potential titles using alternative parsing:', titleMatches.length);
          
          for (const match of titleMatches) {
            const title = match.replace(/(?:Title:|\*\*\d+\.\s*Title:\*\*|\d+\.\s*Title:)\s*/, '').trim();
            console.log('Extracted title:', title);
            
            if (title) {
              titles.push({
                title,
                newsScore: 75,
                searchScore: 75,
                score: 75,
                reasoning: 'This title was extracted using alternative parsing.'
              });
            }
          }
        }
        
        // If we still have no titles, log and throw an error
        if (titles.length === 0) {
          console.error('No valid titles found in response after all parsing attempts');
          console.error('Raw content:', content);
          throw new Error('No valid titles could be parsed from the response. Please try again with a different topic.');
        }
      }
    } catch (error: unknown) {
      parseError = error instanceof Error ? error : new Error('Unknown error parsing AI response');
      console.error('Error parsing AI response:', error);
      console.error('Raw content:', content);
      throw new Error(
        'Failed to parse valid titles from AI response: ' + 
        (error instanceof Error ? error.message : 'Unknown error')
      );
    }

    console.log('Successfully parsed titles:', titles)

    // Save to Supabase history
    try {
      console.log('Saving title generation results to history...');
      const historyRecord = {
        input: topic,
        output: JSON.stringify(titles),
        type: 'title' as const,
        metadata: {
          newsArticles: articles.length,
          suggestions: suggestions.length,
          generatedTitles: titles.length,
          model: 'google/gemma-3-27b-it:free',
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('History record to save:', historyRecord);
      const savedRecord = await saveToHistory(historyRecord);
      console.log('Successfully saved to history:', savedRecord);
    } catch (error: unknown) {
      // Log but don't fail if history saving fails
      console.error('Error saving to history:');
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error:', error);
      }
    }

    return NextResponse.json({ 
      titles,
      metadata: {
        newsArticles: articles.length,
        suggestions: suggestions.length
      }
    })
  } catch (error: unknown) {
    console.error(
      'Error generating titles:', 
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

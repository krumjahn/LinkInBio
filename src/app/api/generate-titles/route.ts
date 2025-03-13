import { NextResponse } from 'next/server'
import axios from 'axios'

interface TitleSuggestion {
  title: string
  newsScore: number
  searchScore: number
  score: number
  reasoning: string
}

const OPENROUTER_API_KEY = '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'

async function fetchNewsArticles(topic: string) {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=relevancy&pageSize=5&language=en`,
      {
        headers: {
          'X-Api-Key': 'e0a665da9488411580cac8e79e8d114f'
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

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-zero:free',
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

    const content = response.data.choices[0].message.content

    // Parse the response into structured data
    const titles = content.split('\n\n').filter(Boolean).map((block: string) => {
      const titleMatch = block.match(/Title: (.+)/)
      const newsScoreMatch = block.match(/NewsScore: (\d+)/)
      const searchScoreMatch = block.match(/SearchScore: (\d+)/)
      const overallScoreMatch = block.match(/OverallScore: (\d+)/)
      const reasoningMatch = block.match(/Reasoning: (.+)/)

      return {
        title: titleMatch?.[1] || '',
        newsScore: parseInt(newsScoreMatch?.[1] || '0', 10),
        searchScore: parseInt(searchScoreMatch?.[1] || '0', 10),
        score: parseInt(overallScoreMatch?.[1] || '0', 10),
        reasoning: reasoningMatch?.[1] || ''
      }
    }).filter((title: TitleSuggestion) => title.title && title.score && title.newsScore && title.searchScore)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('Error generating titles:', error)
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

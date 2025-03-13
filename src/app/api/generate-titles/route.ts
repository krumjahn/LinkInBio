import { NextResponse } from 'next/server'
import axios from 'axios'

interface TitleSuggestion {
  title: string
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

    const prompt = `You are a blog title expert. Generate 10 engaging, SEO-optimized blog titles for the topic: "${topic}".

Here are some recent news articles about this topic to help inform your suggestions:${newsContext}

For each title:
1. Make it attention-grabbing and unique
2. Consider SEO best practices and current trends from the news
3. Aim for high click-through rates
4. Score it from 1-100 based on potential performance
5. Provide brief reasoning for the score, referencing relevant news if applicable

Format each title as:
Title: [The Title]
Score: [1-100]
Reasoning: [Brief explanation of score]

Remember to:
- Vary the title formats (how-to, listicles, questions, etc.)
- Make them compelling for the target audience
- Reference current trends and news where relevant
- Ensure titles are timely and newsworthy`

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
      const scoreMatch = block.match(/Score: (\d+)/)
      const reasoningMatch = block.match(/Reasoning: (.+)/)

      return {
        title: titleMatch?.[1] || '',
        score: parseInt(scoreMatch?.[1] || '0', 10),
        reasoning: reasoningMatch?.[1] || ''
      }
    }).filter((title: TitleSuggestion) => title.title && title.score)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('Error generating titles:', error)
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import axios from 'axios'
import * as xml2js from 'xml2js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/xml'
        }
      }
    )

    // Parse XML response
    const parser = new xml2js.Parser()
    const result = await parser.parseStringPromise(response.data)
    interface GoogleSuggestion {
      suggestion: [{ $: { data: string } }]
    }

    interface GoogleResponse {
      toplevel?: {
        CompleteSuggestion?: GoogleSuggestion[]
      }
    }

    const suggestions = (result as GoogleResponse).toplevel?.CompleteSuggestion?.map(
      (item) => item.suggestion[0].$.data
    ).filter(Boolean) || []

    // Generate news-style suggestions
    const newsTemplates = [
      `Latest Trends in ${query} for 2025`,
      `How ${query} is Transforming Business`,
      `The Future of ${query}: Expert Predictions`,
      `Top 10 ${query} Strategies That Work`,
      `Why ${query} Matters More Than Ever`,
      `${query} Best Practices for Success`
    ]

    type Source = 'google' | 'news'
    type Volume = 'High' | 'Medium' | 'Low'

    interface TitleSuggestion {
      title: string
      source: Source
      searchVolume: Volume
      competition: Volume
    }

    const results: TitleSuggestion[] = [
      ...suggestions.map((title: string) => ({
        title,
        source: 'google' as const,
        searchVolume: 'Medium' as Volume,
        competition: 'Low' as Volume
      })),
      ...newsTemplates.map((title: string) => ({
        title,
        source: 'news' as const,
        searchVolume: 'High' as Volume,
        competition: (Math.random() > 0.5 ? 'Low' : 'Medium') as Volume
      }))
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}

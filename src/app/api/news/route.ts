import { NextResponse } from 'next/server'
import axios from 'axios'

const NEWS_API_KEY = 'e0a665da9488411580cac8e79e8d114f'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=5&language=en`,
      {
        headers: {
          'X-Api-Key': NEWS_API_KEY
        }
      }
    )

    return NextResponse.json({ articles: response.data.articles })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

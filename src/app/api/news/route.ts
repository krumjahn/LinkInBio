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
    console.log('Fetching news for query:', query)
    // Try top headlines first
    let url = `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&pageSize=5&language=en`
    let response = await axios.get(url, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    })

    // If no top headlines, fall back to everything endpoint
    if (!response.data.articles?.length) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=5&language=en`
      response = await axios.get(url, {
        headers: {
          'X-Api-Key': NEWS_API_KEY
        }
      })
    }
    console.log('NewsAPI URL:', url)

    console.log('Using URL:', url)
    console.log('Found articles:', response.data.articles?.length || 0)

    console.log('NewsAPI response:', response.data)
    return NextResponse.json({ articles: response.data.articles })
  } catch (error: any) {
    console.error('Error fetching news:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        details: error.message,
        status: error.response?.status
      },
      { 
        status: error.response?.status || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  }
}

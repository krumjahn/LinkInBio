'use client'

import { useState } from 'react'
import { Button } from "../../../../components/ui/button"
import { Card } from "../../../../components/ui/card"
import Link from "next/link"
import { motion } from 'framer-motion'
import axios from 'axios'

interface NewsArticle {
  title: string
  description: string
  url: string
  source: {
    name: string
  }
  publishedAt: string
}

interface SuggestionResult {
  title: string
  score: number
  reasoning: string
}

export default function BlogTitleResearcher() {
  const [topic, setTopic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [error, setError] = useState<string | null>(null)

  const analyzeSuggestions = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch news articles
      const newsResponse = await axios.get(`/api/news?q=${encodeURIComponent(topic)}`)
      setNewsArticles(newsResponse.data.articles)

      // Generate titles using the news context
      const response = await axios.post('/api/generate-titles', { topic })
      setSuggestions(response.data.titles)
    } catch (error) {
      console.error('Error analyzing suggestions:', error)
      setError('An error occurred while fetching suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-black text-white p-8">
          <Link href="/content-tools" className="text-white/90 hover:text-white flex items-center gap-2 mb-6 transition-colors duration-200 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Tools</span>
          </Link>
          
          <motion.h1 
            className="text-5xl font-bold mb-3 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Blog Title Researcher
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-2xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Find high-potential blog titles using search trends and news
          </motion.p>
        </div>

        <div className="p-8">
          <div className="space-y-8">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1 text-gray-700">
                Enter your blog topic
              </label>
              <div className="flex gap-4">
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., artificial intelligence, content marketing, etc."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
                <Button
                  onClick={analyzeSuggestions}
                  disabled={!topic.trim() || isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {newsArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Related News</h2>
                <div className="space-y-4">
                  {newsArticles.map((article, index) => (
                    <motion.div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-100 transition-colors duration-200 rounded-lg -m-4 p-4"
                      >
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        {article.description && (
                          <p className="mt-1 text-sm text-gray-600">{article.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>{article.source.name}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">AI-Generated Titles</h2>
                <p className="text-gray-600 mb-6">Based on current news and trends, here are your optimized blog titles:</p>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              suggestion.score >= 80 ? 'bg-green-100 text-green-800' :
                              suggestion.score >= 60 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              Score: {suggestion.score}/100
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">{suggestion.title}</h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion.title)
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}

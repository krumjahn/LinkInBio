'use client'

import { useState, useRef } from 'react'
import { Button } from "../../../../components/ui/button"
import { Card } from "../../../../components/ui/card"
import Link from "next/link"
import { motion } from 'framer-motion'
// Removed axios import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  newsScore: number
  searchScore: number
  reasoning: string
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

interface ArticleSubSection {
  title: string
  content: string
}

interface ArticleSection {
  title: string
  content: string
  subSections: ArticleSubSection[]
}

interface Article {
  title: string
  introduction: string
  sections: ArticleSection[]
  conclusion: string
}

const getScoreColor = (score: number) => {
  if (score >= 85) return 'bg-green-100 text-green-800'
  if (score >= 70) return 'bg-blue-100 text-blue-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export default function BlogTitleResearcher() {
  // Basic state
  const [topic, setTopic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Title type selection
  const [titleType, setTitleType] = useState<'general' | 'howto' | 'comparison' | 'listicle' | 'review'>('general')
  
  // Selected title for outline generation
  const [selectedTitle, setSelectedTitle] = useState<string>('')
  
  // Outline state
  const [outline, setOutline] = useState<ArticleOutline | null>(null)
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false)
  const [outlineError, setOutlineError] = useState<string | null>(null)
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)
  const [regeneratingSectionIndex, setRegeneratingSectionIndex] = useState<number | null>(null)
  
  // Article state
  const [article, setArticle] = useState<Article | null>(null)
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false)
  const [articleError, setArticleError] = useState<string | null>(null)
  
  // Workflow state
  const [activeStep, setActiveStep] = useState<'titles' | 'outline' | 'article'>('titles')

  const analyzeSuggestions = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    setError(null)
    
    // Reset any previous outline or article
    setOutline(null)
    setArticle(null)
    setSelectedTitle('')
    setActiveStep('titles')

    try {
      // Fetch news articles
      console.log('Fetching news for topic:', topic)
      const newsResponse = await fetch(`/api/news?q=${encodeURIComponent(topic)}`)
      const newsData = await newsResponse.json()
      console.log('News response:', newsData)
      setNewsArticles(newsData.articles || [])

      // Generate titles using the news context and title type
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          titleType
        })
      })
      const responseData = await response.json()
      console.log('Title generation response:', responseData)
      setSuggestions(responseData.titles || [])
      console.log('Updated suggestions state:', responseData.titles || [])
    } catch (error) {
      console.error('Error analyzing suggestions:', error)
      setError('An error occurred while fetching suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to generate an outline for a selected title
  const generateOutline = async (title: string) => {
    if (!title.trim()) return
    
    setSelectedTitle(title)
    setIsGeneratingOutline(true)
    setOutlineError(null)
    setOutline(null)
    setArticle(null)
    
    try {
      console.log('Generating outline for title:', title)
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          topic,
          wordCount: 2000 // Default word count
        })
      })
      
      const responseData = await response.json()
      console.log('Outline generation response:', responseData)
      setOutline(responseData.outline)
      setActiveStep('outline')
    } catch (error) {
      console.error('Error generating outline:', error)
      setOutlineError('An error occurred while generating the outline. Please try again.')
    } finally {
      setIsGeneratingOutline(false)
    }
  }

  // Function to regenerate a specific section in the outline
  const regenerateSection = async (sectionIndex: number) => {
    if (!outline) return
    
    const section = outline.sections[sectionIndex]
    if (!section) return
    
    setRegeneratingSectionIndex(sectionIndex)
    
    try {
      console.log(`Regenerating section ${sectionIndex}: ${section.title}`)
      
      // Create a prompt specifically for regenerating this section
      const prompt = `Generate 2-3 engaging subsections for the following section of a blog post about "${topic}" with the title "${outline.title}".

Section title: "${section.title}"

The subsections should be descriptive, engaging, and SEO-friendly. Return only the subsection titles as a JSON array of strings. For example: ["First Subsection Title", "Second Subsection Title", "Third Subsection Title"]`
      
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          topic,
          sectionTitle: section.title
        })
      })
      
      const responseData = await response.json()
      console.log('Section regeneration response:', responseData)
      
      if (responseData.subsections && Array.isArray(responseData.subsections)) {
        // Update the outline with the new subsections
        const updatedOutline = {...outline}
        updatedOutline.sections[sectionIndex].subSections = responseData.subsections
        setOutline(updatedOutline)
      } else {
        // Fallback if the API doesn't return the expected format
        console.error('Invalid response format for section regeneration:', responseData)
        // Create some generic subsections as fallback
        const updatedOutline = {...outline}
        updatedOutline.sections[sectionIndex].subSections = [
          `Key aspects of ${section.title}`,
          `How ${section.title} impacts your audience`,
          `Best practices for ${section.title}`
        ]
        setOutline(updatedOutline)
      }
    } catch (error) {
      console.error(`Error regenerating section ${sectionIndex}:`, error)
      // Don't set a global error, just log it
    } finally {
      setRegeneratingSectionIndex(null)
    }
  }
  
  // Function to save the current outline to history
  const saveOutlineToHistory = async () => {
    if (!outline) return
    
    try {
      console.log('Saving outline to history...')
      const response = await fetch('/api/save-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: `${outline.title} - ${topic}`,
          output: JSON.stringify(outline),
          type: 'outline',
          metadata: {
            title: outline.title,
            topic,
            timestamp: new Date().toISOString()
          }
        })
      })
      
      const responseData = await response.json()
      console.log('Outline saved to history:', responseData)
      return true
    } catch (error) {
      console.error('Error saving outline to history:', error)
      return false
    }
  }
  
  // Function to generate a full article from an outline
  const generateArticle = async () => {
    if (!outline) return
    
    setIsGeneratingArticle(true)
    setArticleError(null)
    setArticle(null)
    
    try {
      console.log('Generating article from outline:', outline)
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          outline,
          topic,
          wordCount: 2000 // Default word count
        })
      })
      
      const responseData = await response.json()
      console.log('Article generation response:', responseData)
      setArticle(responseData.article)
      setActiveStep('article')
    } catch (error) {
      console.error('Error generating article:', error)
      setArticleError('An error occurred while generating the article. Please try again.')
    } finally {
      setIsGeneratingArticle(false)
    }
  }

  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Title Research</h1>
        <Link 
          href="/content-tools/history" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </Link>
      </div>

      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-black text-white p-8">
          
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
              </div>
            </div>
            
            <div>
              <h3 className="block text-sm font-medium mb-3 text-gray-700">
                Select title type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { id: 'general', label: 'General' },
                  { id: 'howto', label: 'How To' },
                  { id: 'comparison', label: 'Comparison' },
                  { id: 'listicle', label: 'Listicle' },
                  { id: 'review', label: 'Review' }
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setTitleType(type.id as any)}
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${titleType === type.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${titleType === type.id ? 'bg-black' : 'border border-gray-300'}`}></div>
                      <span>{type.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Button
                onClick={analyzeSuggestions}
                disabled={!topic.trim() || isLoading}
                className="w-full py-3 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Titles...
                  </div>
                ) : (
                  'Generate Titles'
                )}
              </Button>
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

            {activeStep === 'titles' && suggestions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">AI-Generated Titles</h2>
                <p className="text-gray-600 mb-6">Based on current news and trends, here are your optimized blog titles. Select a title to generate an outline:</p>
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
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">News:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getScoreColor(suggestion.newsScore)}`}>
                                {suggestion.newsScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Search:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getScoreColor(suggestion.searchScore)}`}>
                                {suggestion.searchScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Overall:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(suggestion.score)}`}>
                                {suggestion.score}/100
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">{suggestion.title}</h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(suggestion.title)
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => generateOutline(suggestion.title)}
                            disabled={isGeneratingOutline}
                          >
                            {isGeneratingOutline && selectedTitle === suggestion.title ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                              </div>
                            ) : (
                              'Create Outline'
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Outline Section */}
            {activeStep === 'outline' && outline && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Blog Outline</h2>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveStep('titles')}
                    >
                      Back to Titles
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={saveOutlineToHistory}
                    >
                      Save Outline
                    </Button>
                    <Button 
                      onClick={generateArticle} 
                      disabled={isGeneratingArticle}
                    >
                      {isGeneratingArticle ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </div>
                      ) : (
                        'Generate Article'
                      )}
                    </Button>
                  </div>
                </div>
                
                {outlineError && (
                  <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
                    {outlineError}
                  </div>
                )}
                
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold mb-4">{outline.title}</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Introduction</h4>
                    <p className="text-gray-700">{outline.introduction}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Main Sections</h4>
                    <div className="space-y-4">
                      {outline.sections.map((section, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            {editingSectionIndex === index ? (
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => {
                                  const updatedOutline = {...outline};
                                  updatedOutline.sections[index].title = e.target.value;
                                  setOutline(updatedOutline);
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded font-medium text-base"
                              />
                            ) : (
                              <h5 className="font-medium">{section.title}</h5>
                            )}
                            <div className="flex gap-2 ml-3">
                              <button 
                                onClick={() => setEditingSectionIndex(editingSectionIndex === index ? null : index)}
                                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                              >
                                {editingSectionIndex === index ? 'Done' : 'Edit'}
                              </button>
                              <button 
                                onClick={() => {
                                  setRegeneratingSectionIndex(index);
                                  // Call API to regenerate just this section
                                  regenerateSection(index);
                                }}
                                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                disabled={regeneratingSectionIndex === index}
                              >
                                {regeneratingSectionIndex === index ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Regenerating...
                                  </span>
                                ) : 'Regenerate'}
                              </button>
                            </div>
                          </div>
                          
                          {editingSectionIndex === index ? (
                            <div className="mt-2 mb-3">
                              {section.subSections.map((subSection, subIndex) => (
                                <div key={subIndex} className="mb-2">
                                  <input
                                    type="text"
                                    value={subSection}
                                    onChange={(e) => {
                                      const updatedOutline = {...outline};
                                      updatedOutline.sections[index].subSections[subIndex] = e.target.value;
                                      setOutline(updatedOutline);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              ))}
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    const updatedOutline = {...outline};
                                    updatedOutline.sections[index].subSections.push('');
                                    setOutline(updatedOutline);
                                  }}
                                  className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                                >
                                  + Add Subsection
                                </button>
                              </div>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1">
                              {section.subSections.map((subSection, subIndex) => (
                                <li key={subIndex} className="text-gray-700">{subSection}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Conclusion</h4>
                    <p className="text-gray-700">{outline.conclusion}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Article Section */}
            {activeStep === 'article' && article && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Generated Article</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveStep('outline')}
                  >
                    Back to Outline
                  </Button>
                </div>
                
                {articleError && (
                  <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
                    {articleError}
                  </div>
                )}
                
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
                  
                  <div className="mb-8">
                    <div className="prose max-w-none">
                      <p>{article.introduction}</p>
                    </div>
                  </div>
                  
                  {article.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                      <div className="prose max-w-none mb-6">
                        <p>{section.content}</p>
                      </div>
                      
                      {section.subSections.map((subSection, subIndex) => (
                        <div key={subIndex} className="mb-4 ml-6">
                          <h3 className="text-xl font-semibold mb-2">{subSection.title}</h3>
                          <div className="prose max-w-none">
                            <p>{subSection.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
                    <div className="prose max-w-none">
                      <p>{article.conclusion}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => {
                        // Create a formatted version of the article for copying
                        const formattedArticle = `# ${article.title}

${article.introduction}

${article.sections.map(section => {
  return `## ${section.title}

${section.content}

${section.subSections.map(sub => `### ${sub.title}

${sub.content}`).join('\n\n')}`;
}).join('\n\n')}

## Conclusion

${article.conclusion}`;
                        
                        navigator.clipboard.writeText(formattedArticle);
                      }}
                      className="w-full py-3"
                    >
                      Copy Full Article (Markdown)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { GlowEffect } from "../../../components/ui/glow-effect"
import Link from "next/link"
import axios from 'axios'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

// Add the icon to the library
library.add(faWandMagicSparkles)

type TitleFormat = 'whisper' | 'hormozi' | 'specific' | 'tangible';

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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'
const MODEL = 'google/gemma-2-9b-it:free'

export default function ViralBlogTitleGenerator() {
  const [blogTitle, setBlogTitle] = useState('')
  const [audience, setAudience] = useState('')
  const [promise, setPromise] = useState('')
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [titleFormat, setTitleFormat] = useState<TitleFormat>('specific')
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    // Animate title on page load
    setTitleVisible(true)
  }, [])

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
  }
  
  // Function to handle copy with visual feedback
  const handleCopy = (text: string, index: number) => {
    copyToClipboard(text);
    setCopiedIndex(index);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const generateTitles = async () => {
    // For specific format, require topic, audience, and promise
    if (titleFormat === 'specific') {
      if (!blogTitle.trim() || !audience.trim() || !promise.trim()) {
        setError('Please enter topic, audience, and promise for the Specific Format')
        return
      }
    } else {
      // For other formats, just require the blog title
      if (!blogTitle.trim()) return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Simplified for demo
      setGeneratedTitles([
        `7 Essential ${blogTitle} Strategies for ${audience} to ${promise} Within 60 Days`,
        `The Ultimate ${blogTitle} Blueprint: How ${audience} Can ${promise} in Half the Time`,
        `Why Most ${audience} Fail at ${blogTitle} and How You Can ${promise} Instead`,
        `${blogTitle} Mastery: A Step-by-Step Guide for ${audience} to ${promise}`,
        `From Novice to Expert: How ${audience} Can Use ${blogTitle} to ${promise}`
      ])
    } catch (err) {
      console.error('Error generating titles:', err)
      setError('An error occurred while generating titles. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.3,
        duration: 0.6
      }
    }
  }

  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    })
  }

  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-black text-white p-8">
          <Link href="/" className="text-white/90 hover:text-white flex items-center gap-2 mb-6 transition-colors duration-200 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Home</span>
          </Link>
          
          <motion.h1 
            className="text-5xl font-bold mb-3 text-center"
            initial="hidden"
            animate={titleVisible ? "visible" : "hidden"}
            variants={titleVariants}
          >
            Viral Blog Title Generator
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-2xl mx-auto text-center"
            initial="hidden"
            animate={titleVisible ? "visible" : "hidden"}
            variants={subtitleVariants}
          >
            Transform your ideas into attention-grabbing headlines
          </motion.p>
        </div>

        <div className="p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">1. Select Your Format</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    titleFormat === 'whisper' 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setTitleFormat('whisper')}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-2 ${titleFormat === 'whisper' ? 'bg-black' : 'border border-gray-300'}`}></div>
                    <span className="font-medium">Whisper Technique</span>
                  </div>
                  <p className="text-xs text-gray-500">Add parenthetical statements that build trust, address obstacles, highlight benefits, or show outcomes.</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    titleFormat === 'hormozi' 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setTitleFormat('hormozi')}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-2 ${titleFormat === 'hormozi' ? 'bg-black' : 'border border-gray-300'}`}></div>
                    <span className="font-medium">Hormozi Format</span>
                  </div>
                  <p className="text-xs text-gray-500">Use the "How to (Goal) without (Problem) even if (Obstacle)" structure for compelling titles.</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    titleFormat === 'specific' 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setTitleFormat('specific')}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-2 ${titleFormat === 'specific' ? 'bg-black' : 'border border-gray-300'}`}></div>
                    <span className="font-medium">Specific Format</span>
                  </div>
                  <p className="text-xs text-gray-500">Create targeted headlines that clearly identify topic, audience, and promise/outcome.</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    titleFormat === 'tangible' 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setTitleFormat('tangible')}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-2 ${titleFormat === 'tangible' ? 'bg-black' : 'border border-gray-300'}`}></div>
                    <span className="font-medium">Tangible Format</span>
                  </div>
                  <p className="text-xs text-gray-500">Transform vague concepts into specific, measurable outcomes with concrete numbers and timeframes.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">2. Enter Your Information</h2>
              
              {titleFormat === 'specific' ? (
                // Three input fields for Specific Format
                <div className="space-y-4">
                  <div>
                    <label htmlFor="blogTitle" className="block text-sm font-medium mb-1 text-gray-700">
                      Enter your topic
                    </label>
                    <input
                      id="blogTitle"
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="e.g., Project Management Tips"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium mb-1 text-gray-700">
                      Enter your target audience
                    </label>
                    <input
                      id="audience"
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g., Entry-Level Project Managers"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="promise" className="block text-sm font-medium mb-1 text-gray-700">
                      Enter your promise/outcome
                    </label>
                    <input
                      id="promise"
                      type="text"
                      value={promise}
                      onChange={(e) => setPromise(e.target.value)}
                      placeholder="e.g., Get Promoted In Their First 30 Days"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    />
                  </div>
                </div>
              ) : titleFormat === 'tangible' ? (
                // Single input field for Tangible Format
                <div>
                  <label htmlFor="blogTitle" className="block text-sm font-medium mb-1 text-gray-700">
                    Enter your headline or topic
                  </label>
                  <input
                    id="blogTitle"
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="e.g., Make more money with email marketing"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                  />
                </div>
              ) : (
                // Single input field for Whisper and Hormozi formats
                <div>
                  <label htmlFor="blogTitle" className="block text-sm font-medium mb-1 text-gray-700">
                    {titleFormat === 'whisper' 
                      ? 'Enter your blog title' 
                      : 'Enter your topic (YAA - Your Achievable Aim)'}
                  </label>
                  <input
                    id="blogTitle"
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder={titleFormat === 'whisper' 
                      ? 'e.g., How to Grow Your Email List' 
                      : 'e.g., grow your email list'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                  />
                </div>
              )}
              
              <div className="relative mt-6">
                <GlowEffect
                  colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
                  mode="colorShift"
                  blur="soft"
                  duration={3}
                  scale={0.9}
                />
                <button
                  onClick={generateTitles}
                  disabled={
                    (titleFormat === 'specific' ? (!blogTitle.trim() || !audience.trim() || !promise.trim()) : 
                    titleFormat === 'tangible' ? !blogTitle.trim() : !blogTitle.trim()) 
                    || isLoading
                  }
                  className="relative w-full py-3 text-lg font-medium transition-all duration-200 bg-zinc-950 text-white rounded-md outline outline-1 outline-[#fff2f21f] flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2 h-5 w-5" />
                      Generate Viral Titles
                    </div>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <p className="font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Error:
                  </p>
                  <p className="mt-1 ml-7">{error}</p>
                </div>
              )}
            </div>

            {generatedTitles.length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Generated Titles</h2>
                <div className="space-y-4">
                  {generatedTitles.map((title, index) => (
                    <motion.div 
                      key={index} 
                      className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={resultVariants}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-gray-600 mb-2 flex items-center">
                            <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
                            Title {index + 1}
                          </h3>
                          <p className="text-lg font-medium text-gray-800">{title}</p>
                        </div>
                        <Button 
                          variant={copiedIndex === index ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => handleCopy(title, index)}
                          className={`ml-4 flex-shrink-0 ${copiedIndex === index ? 'bg-black text-white' : 'border-gray-300 text-gray-700'}`}
                        >
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {titleFormat === 'specific' && (
              <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-6 rounded-xl">
                <h3 className="font-medium mb-2 text-gray-700">About the "Specific Format":</h3>
                <p>A good headline must answer 3 questions to be specific and compelling:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>What is this about?</strong> The specific topic (e.g., "6 Tips For Project Managers")</li>
                  <li><strong>Who is this for?</strong> The specific audience (e.g., "Entry-Level Project Managers")</li>
                  <li><strong>Why should they read it?</strong> The specific promise/outcome (e.g., "To Get Promoted In Their First 30 Days")</li>
                </ul>
                <p className="mt-2">This format creates highly targeted headlines that clearly communicate value to a specific audience, making them more likely to click and engage with your content.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}

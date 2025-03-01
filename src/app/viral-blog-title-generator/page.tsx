'use client'

import { useState } from 'react'
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import Link from "next/link"
import axios from 'axios'

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
  const [titleFormat, setTitleFormat] = useState<TitleFormat>('whisper')
  const [error, setError] = useState<string | null>(null)

  const generateTitlesWithAI = async (prompt: string) => {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://localhost:3000',
            'X-Title': 'Viral Blog Title Generator'
          }
        }
      )

      const content = response.data.choices[0].message.content
      return content
    } catch (err) {
      console.error('Error calling OpenRouter API:', err)
      throw new Error('Failed to generate titles. Please try again.')
    }
  }

  // Function to clean up title text
  const cleanTitle = (title: string): string => {
    // Remove numbers and asterisks at the beginning (like "1. " or "* " or "#1: ")
    let cleaned = title.replace(/^([\*\d]+[\.\)\:]|\#\d+[\.\)\:]|\*\s*)/i, '')
    
    // Remove markdown formatting (** for bold)
    cleaned = cleaned.replace(/\*\*/g, '')
    
    // Remove any whisper type label at the end (like "- *Trust Whisper*" or "- Trust Whisper")
    cleaned = cleaned.replace(/\s*[-–—]\s*\**\s*(Trust|Obstacle|Benefit|Outcome)\s*Whisper\s*\**\s*$/i, '')
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim()
    
    return cleaned
  }

  const parseWhisperTitles = (content: string): string[] => {
    try {
      // Remove any introductory text
      const contentWithoutIntro = content.replace(/^(here are|here's|i've created|i have created).*?\n/i, '')
      
      // Extract the 4 titles from the AI response
      const lines = contentWithoutIntro.split('\n').filter(line => line.trim() !== '')
      const titles: string[] = []
      
      // First, try to find lines with the expected format
      for (const line of lines) {
        // Look for lines that contain a whisper in parentheses
        if (line.includes('(') && line.includes(')')) {
          // Clean the title first
          let cleanedLine = cleanTitle(line)
          
          // Remove any quotes around the entire line
          cleanedLine = cleanedLine.replace(/^["'](.*)["']$/g, '$1')
          
          // Remove whisper type labels from the parenthetical part
          // This regex looks for patterns like "Trust Whisper:", "Obstacle Whisper:", etc. inside parentheses
          cleanedLine = cleanedLine.replace(/\(\s*(Trust|Obstacle|Benefit|Outcome)\s*Whisper\s*:?\s*/i, '(')
          
          // Remove any trailing whisper type after the parentheses
          cleanedLine = cleanedLine.replace(/\)\s*[-–—]?\s*\**\s*(Trust|Obstacle|Benefit|Outcome)\s*Whisper\s*\**\s*$/i, ')')
          
          titles.push(cleanedLine)
        }
        // If we have 4 titles, we're done
        if (titles.length === 4) break
      }
      
      // If we couldn't extract titles with parentheses, try to find lines with whisper type labels
      if (titles.length < 4) {
        const whisperTypes = ['Trust Whisper', 'Obstacle Whisper', 'Benefit Whisper', 'Outcome Whisper']
        const typeTitles: string[] = []
        
        for (const type of whisperTypes) {
          for (const line of lines) {
            if (line.includes(type)) {
              // Extract the title part after the whisper type
              const match = line.match(new RegExp(`${type}[:\\s-]*\\s*["']?([^"']*)["']?`, 'i'))
              if (match && match[1]) {
                let title = match[1].trim()
                
                // If the title doesn't have parentheses, add them with the appropriate whisper
                if (!title.includes('(')) {
                  if (type === 'Trust Whisper') {
                    title = `${blogTitle} (Written By AI Experts)`
                  } else if (type === 'Obstacle Whisper') {
                    title = `${blogTitle} (Without Any Coding Experience)`
                  } else if (type === 'Benefit Whisper') {
                    title = `${blogTitle} (And How To Solve It)`
                  } else if (type === 'Outcome Whisper') {
                    title = `${blogTitle} (And Start Earning $250,000 Per Year In Your Sweatpants)`
                  }
                }
                
                typeTitles.push(title)
                break
              }
            }
          }
        }
        
        // Add any titles we found
        titles.push(...typeTitles)
      }
      
      // If we still don't have 4 titles, use fallback titles
      if (titles.length < 4) {
        const fallbackTitles = [
          `${blogTitle} (Written By AI Experts)`,
          `${blogTitle} (Without Any Coding Experience)`,
          `${blogTitle} (And How To Solve It)`,
          `${blogTitle} (And Start Earning $250,000 Per Year In Your Sweatpants)`
        ]
        
        // Add only the missing titles
        for (let i = titles.length; i < 4; i++) {
          titles.push(fallbackTitles[i])
        }
      }
      
      // Ensure we only return 4 titles
      return titles.slice(0, 4)
    } catch (err) {
      console.error('Error parsing whisper titles:', err)
      // Fallback to default titles if parsing fails
      return [
        `${blogTitle} (Written By A Twitter Creator With 100k Followers)`,
        `${blogTitle} (Without Spending Any Money On Ads)`,
        `${blogTitle} (And How To Solve It)`,
        `${blogTitle} (And Start Earning $250,000 Per Year In Your Sweatpants)`
      ]
    }
  }

  const parseSpecificTitles = (content: string): string[] => {
    try {
      // Remove any introductory text
      const contentWithoutIntro = content.replace(/^(here are|here's|i've created|i have created).*?\n/i, '')
      
      // Extract titles from the AI response
      const lines = contentWithoutIntro.split('\n').filter(line => line.trim() !== '')
      
      // Clean up the titles and take the first 5
      const titles = lines.slice(0, 5).map(line => cleanTitle(line))
      
      return titles
    } catch (err) {
      console.error('Error parsing specific titles:', err)
      // Fallback to default titles if parsing fails
      return [
        `6 Tips For ${blogTitle} To Get Promoted In Their First 30 Days`,
        `The Ultimate Guide To ${blogTitle} For Beginners In 2025`,
        `How ${blogTitle} Can Increase Productivity By 50% In Just One Week`,
        `Why Most ${blogTitle} Fail And How To Avoid Their Mistakes`,
        `${blogTitle}: The Complete Step-By-Step Blueprint For Success`
      ]
    }
  }

  const parseTangibleTitles = (content: string): string[] => {
    try {
      // Remove any introductory text
      const contentWithoutIntro = content.replace(/^(here are|here's|i've created|i have created).*?\n/i, '')
      
      // Extract titles from the AI response
      const lines = contentWithoutIntro.split('\n').filter(line => line.trim() !== '')
      
      // Filter out lines that are not actual titles
      const filteredLines = lines.filter(line => {
        const lowerLine = line.toLowerCase();
        
        // Skip lines that are analysis, headers, or explanatory text
        return !(
          lowerLine.startsWith('##') || 
          lowerLine.startsWith('intangible:') || 
          lowerLine.startsWith('intangible pieces:') ||
          lowerLine.startsWith('tangible headlines:') ||
          lowerLine.includes('this is a broad') ||
          lowerLine.includes('this implies') ||
          lowerLine.includes('doesn\'t specify') ||
          lowerLine.includes('analysis:') ||
          lowerLine.includes('action + result') ||
          lowerLine.includes('generic financial outcome') ||
          lowerLine.includes('somewhat tangible') ||
          lowerLine.includes('lacks specifics')
        );
      });
      
      // Look for actual tangible titles - these are typically complete sentences with specific metrics
      const titles = filteredLines
        .filter(line => {
          // Keep lines that have numbers (likely to be tangible metrics)
          // or specific time periods or concrete outcomes
          return (
            /\d/.test(line) || // Has numbers
            /per (day|week|month|year)/.test(line.toLowerCase()) || // Has time periods
            /(increase|boost|grow|earn|make|build|create|generate|launch|sell)/.test(line.toLowerCase()) // Has action verbs
          );
        })
        .map(line => {
          // If the line starts with "Tangible:", remove it
          let cleanedLine = line.replace(/^tangible:\s*/i, '').trim();
          
          // Remove explanatory text in parentheses at the end of the title
          cleanedLine = cleanedLine.replace(/\s*\([^)]*?(specific|income|goal|timeframe|monetization|method|target|valuation|ai tool)[^)]*?\)$/i, '');
          
          return cleanedLine;
        })
        .slice(0, 5) // Take up to 5 titles
        .map(line => cleanTitle(line));
      
      // If we couldn't find any good titles, use fallbacks
      if (titles.length === 0) {
        return [
          `Earn $500 per month writing creative content with ${blogTitle}`,
          `Generate 50 new leads in 30 days using ${blogTitle}`,
          `Build a portfolio of 10 client projects in 90 days with ${blogTitle}`,
          `Create 3 passive income streams worth $1,000/month with ${blogTitle}`,
          `Launch your first digital product that earns $2,000 in its first week using ${blogTitle}`
        ];
      }
      
      return titles;
    } catch (err) {
      console.error('Error parsing tangible titles:', err)
      // Fallback to default titles if parsing fails
      return [
        `Increase Your ${blogTitle} Revenue by $10,000 in 90 Days`,
        `Build a ${blogTitle} System That Generates 50 Leads per Week`,
        `Create Your First ${blogTitle} in 30 Days or Less`,
        `Reduce Your ${blogTitle} Workload by 15 Hours per Week`,
        `Transform Your ${blogTitle} Strategy and Close 3x More Deals This Quarter`
      ]
    }
  }

  const parseHormoziTitles = (content: string): string[] => {
    try {
      // Remove any introductory text
      const contentWithoutIntro = content.replace(/^(here are|here's|i've created|i have created).*?\n/i, '')
      
      // Extract the 7 titles from the AI response
      const lines = contentWithoutIntro.split('\n').filter(line => line.trim() !== '')
      const titles: string[] = []
      
      for (const line of lines) {
        // Look for lines that follow the Hormozi format
        if (line.toLowerCase().includes('how to') && 
            line.toLowerCase().includes('without') && 
            line.toLowerCase().includes('even if')) {
          titles.push(cleanTitle(line))
        }
        // If we have 7 titles, we're done
        if (titles.length === 7) break
      }
      
      // If we couldn't extract exactly 7 titles, use the first 7 non-empty lines
      if (titles.length !== 7) {
        return lines.slice(0, 7).map(line => cleanTitle(line))
      }
      
      return titles
    } catch (err) {
      console.error('Error parsing hormozi titles:', err)
      // Generate fallback titles
      const commonProblems = [
        "spending a fortune", "hiring expensive experts", "wasting hours on research",
        "using complicated tools", "needing technical skills", "getting overwhelmed by options",
        "making costly mistakes"
      ]
      const commonObstacles = [
        "you're a complete beginner", "you have limited time", "you're on a tight budget",
        "you've failed before", "you lack connections", "you have no prior experience",
        "you're starting from scratch"
      ]
      
      return Array.from({ length: 7 }, (_, i) => 
        `How to ${blogTitle} without ${commonProblems[i]} even if ${commonObstacles[i]}`
      )
    }
  }

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log('Text copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
  }

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
      let prompt: string
      let titles: string[] = []
      
      if (titleFormat === 'whisper') {
        prompt = `I am going to train you to use the "Whisper Technique."

The "Whisper Technique" is where you make your primary promise in your headline (and then you "whisper" a follow-up idea in parenthesis).

The things you can "whisper" are:
- A "trust me" sentence
- A "without this obstacle" sentence
- A "and with this additional benefit" sentence
- A "and so you can achieve this outcome too" sentence

For example:
- Trust Whisper: How to Grow Your Email List (Written By AI Experts)
- Obstacle Whisper: How to Grow Your Email List (Without Any Coding Experience)
- Benefit Whisper: How to Grow Your Email List (And How To Solve It)
- Outcome Whisper: How to Grow Your Email List (And Start Earning $250,000 Per Year In Your Sweatpants)

I will give you a headline and you will create 4 new headlines using the "Whisper Technique," one for each type of whisper.

My headline is: "${blogTitle}"

Please generate 4 headlines, one for each type of whisper. Format each headline as the original headline followed by the whisper in parentheses. DO NOT use quotes around the headlines. DO NOT include the whisper type in the parentheses.

For the Trust Whisper, please use "(Written By AI Experts)" as the whisper.
For the Obstacle Whisper, please use "(Without Any Coding Experience)" as the whisper.
For the Benefit Whisper, please use "(And How To Solve It)" as the whisper.
For the Outcome Whisper, please use "(And Start Earning $250,000 Per Year In Your Sweatpants)" as the whisper.`

        const content = await generateTitlesWithAI(prompt)
        titles = parseWhisperTitles(content)
      } else if (titleFormat === 'hormozi') {
        prompt = `I am going to give you a topic and I want you to generate article titles using the "How to (YAA) without (BOO) even if (Greatest Obstacle)" format.

"YAA" is the goal of the subtopic. For example, "Develop a training plan"
"BOO" is a common problem of the subtopic. For example, "don't know proper technique"
"Greatest Obstacle" is what is standing in the way. For example, "busy schedule"

My topic is: "${blogTitle}"

Please generate 7 headlines using the "How to (YAA) without (BOO) even if (Greatest Obstacle)" format. Make each headline unique with different problems and obstacles.`

        const content = await generateTitlesWithAI(prompt)
        titles = parseHormoziTitles(content)
      } else if (titleFormat === 'tangible') {
        prompt = `I am going to give you a headline and I want you to make it "TANGIBLE."

Your task is to transform intangible problems, benefits, or outcomes into TANGIBLE problems, benefits, or outcomes.

TANGIBLE problems, benefits, and outcomes are noun-oriented ("...to buy your first $1 million house")

Intangible problems, benefits, and outcomes are adjective-oriented ("...to live happily ever after").

For example:
Intangible: Make more money
Tangible: Make $2,000 in your first month of freelancing

Intangible: Fall in love
Tangible: Fall in love in your early 20s and reduce your risk of divorce by 35%

Intangible: Have a fulfilling career
Tangible: Have a career you are proud to talk about around the dinner table

Intangible: Get into real estate
Tangible: Buy your first single-family rental property within 6 months

Intangible: Become a pro email marketer
Tangible: Increase the open rate of your emails by 78%

My headline is: "${blogTitle}"

Please generate 5 tangible headlines based on this topic. Make each headline unique with different tangible elements.

IMPORTANT: 
1. Do NOT include any analysis or explanations in parentheses after the titles
2. Do NOT include phrases like "(Action + Result)" or "(Generic financial outcome)"
3. Only provide the actual tangible headlines, nothing else
4. Each headline should include specific numbers, timeframes, or measurable outcomes`

        const content = await generateTitlesWithAI(prompt)
        titles = parseTangibleTitles(content)
      } else if (titleFormat === 'specific') {
        prompt = `I am going to give you a headline and I want you to make more specific.

A good headline must answer 3 questions:
What is this about? (the specific topic)
Who is this for? (the specific type of audience)
And why should they read it? (the specific promise/outcome)

For example:
Using the headline "6 Tips For Entry-Level Project Managers To Get Promoted In Their First 30 Days"
The topic = Promotion Tips
The audience = Entry-Level Project Managers
The promise = Get promoted in your first 30 days

And to make a headline more specific...
For the topic:
Specify the topic within the topic (instead of "project management" pick a topic inside the umbrella topic of project management—like "task delegation" or "risk assessment" or "stakeholder communication" etc.).
Specify the application of the topic (project management "what" specific asset—like "project management techniques for software development" or "project management for remote teams" etc.).

For the audience:
Specify the level of the audience (beginner, intermediate, advanced, etc.)
Specify the role of the audience (manager, developer, designer, etc.)
Specify the industry of the audience (tech, finance, healthcare, etc.)

For the promise/outcome:
Specify the timeframe (in 30 days, in 1 week, etc.)
Specify the magnitude (2x, 10x, etc.)
Specify the quality (better, faster, cheaper, etc.)

My topic is: "${blogTitle}"
My target audience is: "${audience}"
My promise/outcome is: "${promise}"

Please generate 5 specific headlines that clearly identify the topic, audience, and promise/outcome. Make each headline unique with different specifics. Make sure to incorporate the target audience in each headline and include the promise/outcome in each headline.

IMPORTANT: Do NOT start the headlines with the audience name followed by a colon (e.g., "Entrepreneurs: ..."). Instead, incorporate the audience naturally within the headline.`

        // Return a Promise for specific title format
        const titlePromise = generateTitlesWithAI(prompt)
          .then(content => {
            return parseSpecificTitles(content);
          });
        
        // Await the Promise to get the titles
        titles = await titlePromise;
      }
      
      setGeneratedTitles(titles)
    } catch (err) {
      console.error('Error generating titles:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <Card className="max-w-3xl mx-auto bg-card text-card-foreground shadow-xl rounded-xl overflow-hidden p-6">
        <div className="mb-6">
          <Link href="/" className="text-blue-500 hover:text-blue-700 mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Viral Blog Title Generator</h1>
          <p className="text-muted-foreground">
            Transform your blog titles to make them more engaging and clickable using proven techniques.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Select Format:</label>
            <div className="flex flex-wrap space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                  type="radio"
                  checked={titleFormat === 'whisper'}
                  onChange={() => setTitleFormat('whisper')}
                  className="form-radio"
                />
                <span>Whisper Technique</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                  type="radio"
                  checked={titleFormat === 'hormozi'}
                  onChange={() => setTitleFormat('hormozi')}
                  className="form-radio"
                />
                <span>Hormozi Format</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                  type="radio"
                  checked={titleFormat === 'specific'}
                  onChange={() => setTitleFormat('specific')}
                  className="form-radio"
                />
                <span>Specific Format</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                  type="radio"
                  checked={titleFormat === 'tangible'}
                  onChange={() => setTitleFormat('tangible')}
                  className="form-radio"
                />
                <span>Tangible Format</span>
              </label>
            </div>
          </div>

          {titleFormat === 'specific' ? (
            // Two input fields for Specific Format
            <div className="space-y-4">
              <div>
                <label htmlFor="blogTitle" className="block text-sm font-medium mb-1">
                  Enter your topic
                </label>
                <input
                  id="blogTitle"
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g., Project Management Tips"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="audience" className="block text-sm font-medium mb-1">
                  Enter your target audience
                </label>
                <input
                  id="audience"
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., Entry-Level Project Managers"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="promise" className="block text-sm font-medium mb-1">
                  Enter your promise/outcome
                </label>
                <input
                  id="promise"
                  type="text"
                  value={promise}
                  onChange={(e) => setPromise(e.target.value)}
                  placeholder="e.g., Get Promoted In Their First 30 Days"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          ) : titleFormat === 'tangible' ? (
            // Single input field for Tangible Format
            <div>
              <label htmlFor="blogTitle" className="block text-sm font-medium mb-1">
                Enter your headline or topic
              </label>
              <input
                id="blogTitle"
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g., Make more money with email marketing"
                className="w-full p-2 border rounded-md"
              />
            </div>
          ) : (
            // Single input field for Whisper and Hormozi formats
            <div>
              <label htmlFor="blogTitle" className="block text-sm font-medium mb-1">
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
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}
          
          <Button 
            onClick={generateTitles} 
            disabled={
              (titleFormat === 'specific' ? (!blogTitle.trim() || !audience.trim() || !promise.trim()) : 
               titleFormat === 'tangible' ? !blogTitle.trim() : !blogTitle.trim()) 
              || isLoading
            }
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Viral Titles'}
          </Button>
          
          {error && (
            <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {generatedTitles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generated Titles:</h2>
            <div className="space-y-4">
              {titleFormat === 'whisper' ? (
                // Whisper Technique titles
                <>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Trust Whisper</h3>
                        <p className="text-lg">{generatedTitles[0]}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedTitles[0])}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Obstacle Whisper</h3>
                        <p className="text-lg">{generatedTitles[1]}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedTitles[1])}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Benefit Whisper</h3>
                        <p className="text-lg">{generatedTitles[2]}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedTitles[2])}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Outcome Whisper</h3>
                        <p className="text-lg">{generatedTitles[3]}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedTitles[3])}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </>
              ) : titleFormat === 'hormozi' ? (
                // Hormozi Format titles
                generatedTitles.map((title, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Hormozi Title {index + 1}</h3>
                        <p className="text-lg">{title}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(title)}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))
              ) : titleFormat === 'tangible' ? (
                // Tangible Format titles
                generatedTitles.map((title, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Tangible Title {index + 1}</h3>
                        <p className="text-lg">{title}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(title)}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                // Specific Format titles
                generatedTitles.map((title, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-1">{audience} Title</h3>
                        <p className="text-lg">{title}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(title)}
                        className="ml-2 flex-shrink-0"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {titleFormat === 'whisper' ? (
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">About the "Whisper Technique":</h3>
            <p>The "Whisper Technique" makes your headline more compelling by adding a parenthetical statement that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Trust Whisper:</strong> Builds credibility</li>
              <li><strong>Obstacle Whisper:</strong> Addresses a common challenge</li>
              <li><strong>Benefit Whisper:</strong> Highlights an additional benefit</li>
              <li><strong>Outcome Whisper:</strong> Shows the ultimate result</li>
            </ul>
          </div>
        ) : titleFormat === 'hormozi' ? (
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">About the "Hormozi Format":</h3>
            <p>The Alex Hormozi format uses the structure "How to (YAA) without (BOO) even if (Greatest Obstacle)" where:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>YAA (Your Achievable Aim):</strong> The goal or outcome you want to achieve</li>
              <li><strong>BOO (Common Problem):</strong> A common problem or pain point people face</li>
              <li><strong>Greatest Obstacle:</strong> A significant challenge that might prevent success</li>
            </ul>
            <p className="mt-2">This format creates highly clickable titles by addressing the goal, removing a common objection, and acknowledging a major obstacle.</p>
          </div>
        ) : titleFormat === 'tangible' ? (
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">About the "Tangible Format":</h3>
            <p>The Tangible Format transforms vague, intangible concepts into specific, measurable outcomes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Intangible:</strong> Adjective-oriented, vague outcomes (e.g., "Make more money")</li>
              <li><strong>Tangible:</strong> Noun-oriented, specific outcomes (e.g., "Make $2,000 in your first month")</li>
            </ul>
            <p className="mt-2">Examples of transformations:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Intangible: "Have a fulfilling career" → Tangible: "Have a career you are proud to talk about around the dinner table"</li>
              <li>Intangible: "Become a pro email marketer" → Tangible: "Increase the open rate of your emails by 78%"</li>
            </ul>
            <p className="mt-2">Tangible headlines are more compelling because they provide concrete, measurable outcomes that readers can visualize and aspire to achieve.</p>
          </div>
        ) : (
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">About the "Specific Format":</h3>
            <p>A good headline must answer 3 questions to be specific and compelling:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>What is this about?</strong> The specific topic (e.g., "6 Tips For Project Managers")</li>
              <li><strong>Who is this for?</strong> The specific audience (e.g., "Entry-Level Project Managers")</li>
              <li><strong>Why should they read it?</strong> The specific promise/outcome (e.g., "To Get Promoted In Their First 30 Days")</li>
            </ul>
            <p className="mt-2">This format creates highly targeted headlines that clearly communicate value to a specific audience, making them more likely to click and engage with your content.</p>
          </div>
        )}
      </Card>
    </main>
  )
}

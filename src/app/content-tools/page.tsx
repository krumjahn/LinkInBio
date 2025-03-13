'use client'

import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import Link from "next/link"
import { motion } from 'framer-motion'

export default function ContentTools() {
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Content Generation Tools
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-2xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Choose a tool to help create your content
          </motion.p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold mb-2">Email Newsletter Generator</h2>
                  <p className="text-gray-600 mb-4">Create engaging email newsletters that keep your audience informed and connected.</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/content-tools/email-newsletter">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold mb-2">Viral Blog Title Generator</h2>
                  <p className="text-gray-600 mb-4">Generate attention-grabbing blog titles that drive traffic and engagement.</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/content-tools/viral-blog-title">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold mb-2">Blog Title Researcher</h2>
                  <p className="text-gray-600 mb-4">Research and analyze trending topics to create data-driven blog titles.</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/content-tools/blog-title-research">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Card>
    </main>
  )
}

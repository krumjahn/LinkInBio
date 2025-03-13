'use client'

import { Button } from "../../../../components/ui/button"
import { Card } from "../../../../components/ui/card"
import Link from "next/link"
import { motion } from 'framer-motion'

export default function EmailNewsletterGenerator() {
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
            Email Newsletter Generator
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-2xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Create engaging newsletters that your subscribers will love
          </motion.p>
        </div>

        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-8">This tool is currently under development. Check back soon for updates!</p>
            <Button variant="outline" asChild>
              <Link href="/content-tools">
                Back to Tools
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}

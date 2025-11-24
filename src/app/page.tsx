'use client'

import { Cpu, Heart, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'

import Image from "next/image"
import Link from "next/link"
import { motion } from 'framer-motion'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-100 px-4 py-12 pt-24">
      <motion.div 
        className="relative mx-auto w-full max-w-md rounded-2xl bg-white/80 p-8 text-center shadow-lg backdrop-blur-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div 
          className="absolute -top-16 inset-x-0 flex justify-center"
          variants={itemVariants}
        >
          <Image
            src="/keith.jpg"
            alt="Profile"
            width={128}
            height={128}
            className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
            priority
          />
        </motion.div>
        
        <motion.h1 className="mt-16 text-3xl font-bold tracking-tight text-gray-900" variants={itemVariants}>Keith Rumjahn</motion.h1>
        <motion.p className="mt-2 text-gray-600" variants={itemVariants}>I talk about A.I. to improve your life. Top 50 verified n8n creator globally 🌍</motion.p>

        <motion.div className="mt-8 space-y-4" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="https://nas.io/rumjahn" className="block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md">
              Join my community
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="https://www.youtube.com/@LearnAIAutomation" className="block rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 shadow-md">
              Youtube
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="https://rumjahn.substack.com/" className="block rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 shadow-md">
              Join my newsletter
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="https://rumjahn.com" className="block rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 shadow-md">
              My blog
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="mt-8" variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-800">Resources</h2>
          <div className="mt-4 space-y-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="https://nas.io/portal/challenges/manage?id=691b21644a053b1e64105628" className="block rounded-xl bg-white p-4 text-left shadow-md">
                <div className="flex items-start gap-4">
                  <Image
                    src={`/ai-course.png?v=${Date.now()}`}
                    alt="A.I. Coding Automation Course"
                    width={64}
                    height={64}
                    className="rounded-lg bg-gray-200"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">Learn A.I. coding</h3>
                    <p className="text-sm text-gray-600">Learn to build an app that makes money</p>
                  </div>
                </div>
                <div className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white">
                  Enroll Now
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div className="mt-8" variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-800">My Products</h2>
          <div className="mt-4 space-y-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="https://applehealthdata.com/" className="block rounded-xl bg-white p-4 text-left shadow-md">
                <div className="flex items-start gap-4">
                  <Image
                    src="/appicon.png"
                    alt="Apple Health Data icon"
                    width={64}
                    height={64}
                    className="rounded-lg bg-gray-200"
                  />
                  <div className="flex-grow">
                                      <h3 className="font-semibold text-gray-900">Health Data A.I. analyzer</h3>
                                      <p className="text-sm text-gray-600">Use A.I. to unlock insights</p>                  </div>
                </div>
                <div className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white">
                  Download
                </div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="https://seo.rumjahn.com/" className="block rounded-xl bg-white p-4 text-left shadow-md">
                <div className="flex items-start gap-4">
                  <Image
                    src="/Gemini_Generated_Image_1fbvfd1fbvfd1fbv.png"
                    alt="n8n A.I. system icon"
                    width={64}
                    height={64}
                    className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200 object-cover"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">n8n SEO A.I. System</h3>
                    <p className="text-sm text-gray-600">n8n SEO A.I. System</p>
                  </div>
                </div>
                <div className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white">
                  Buy Now
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="mt-8 flex justify-center gap-6" variants={itemVariants}>
          <Link href="https://www.threads.net/@krumjahn" className="text-gray-500 transition-transform hover:scale-110 hover:text-indigo-600">
            <Twitter size={24} />
          </Link>
          
          <Link href="https://www.youtube.com/@LearnAIAutomation" className="text-gray-500 transition-transform hover:scale-110 hover:text-indigo-600">
            <Youtube size={24} />
          </Link>
          
          <Link href="https://www.instagram.com/krumjahn/" className="text-gray-500 transition-transform hover:scale-110 hover:text-indigo-600">
            <Instagram size={24} />
          </Link>
          
          <Link href="https://www.linkedin.com/in/krumjahn/" className="text-gray-500 transition-transform hover:scale-110 hover:text-indigo-600">
            <Linkedin size={24} />
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}

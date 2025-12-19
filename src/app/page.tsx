import { Instagram, Linkedin, Twitter, Youtube, ArrowRight, ExternalLink } from 'lucide-react'

import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const links = [
    {
      title: "Join my community",
      icon: "/globe.svg",
      url: "https://nas.io/rumjahn",
      btnText: "Join Now",
      description: ""
    },
    {
      title: "Youtube Channel",
      icon: "/window.svg",
      url: "https://www.youtube.com/@LearnAIAutomation",
      btnText: "Watch",
      description: ""
    },
    {
      title: "My Newsletter",
      icon: "/file.svg",
      url: "https://rumjahn.substack.com/",
      btnText: "Subscribe",
      description: ""
    },
    {
      title: "My Blog",
      icon: "/globe.svg",
      url: "https://rumjahn.com",
      btnText: "Read",
      description: ""
    }
  ];

  const products = [
    {
      title: "Join FREE A.I. Course",
      description: "Stop Watching AI Content.\nStart Getting Better At Using It.",
      image: "/freeCourse.jpg",
      url: "https://nas.io/rumjahn/challenges/master-vibe-coding-in-14-days-and-make-money-with-a-i-cohort-4-copy",
      btnText: "Enroll Now"
    },
    {
      title: "Health Data A.I. analyzer",
      description: "Use A.I. to unlock insights",
      image: "/appicon.png",
      url: "https://applehealthdata.com/",
      btnText: "Download"
    },
    {
      title: "n8n SEO A.I. System",
      description: "Automate your SEO workflow",
      image: "/Gemini_Generated_Image_1fbvfd1fbvfd1fbv.png",
      url: "https://seo.rumjahn.com/",
      btnText: "Buy Now"
    }
  ];

  return (
    <main className="min-h-screen w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-brand blur-md opacity-20 transform translate-y-2"></div>
            <Image
              src="/keith.jpg"
              alt="Profile"
              width={140}
              height={140}
              className="relative h-32 w-32 rounded-full border-4 border-white shadow-xl object-cover"
              priority
            />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Keith Rumjahn</h1>
          <p className="text-gray-600 max-w-sm text-lg">
            I talk about A.I. to improve your life. Top 50 verified n8n creator globally 🌍
          </p>

          <div className="mt-6 flex gap-4">
             <Link href="https://www.youtube.com/@LearnAIAutomation" className="text-gray-400 hover:text-brand transition-colors">
               <Youtube className="h-6 w-6" />
             </Link>
             <Link href="https://www.instagram.com/krumjahn/" className="text-gray-400 hover:text-brand transition-colors">
               <Instagram className="h-6 w-6" />
             </Link>
             <Link href="https://www.linkedin.com/in/krumjahn/" className="text-gray-400 hover:text-brand transition-colors">
               <Linkedin className="h-6 w-6" />
             </Link>
             <Link href="https://www.threads.net/@krumjahn" className="text-gray-400 hover:text-brand transition-colors">
               <Twitter className="h-6 w-6" />
             </Link>
          </div>
        </div>

        {/* Links Section - Styled as Product Cards */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
          
          {links.map((link, index) => (
            <div key={index} className="group transition-transform hover:-translate-y-0.5">
              <Link href={link.url} target="_blank" className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-brand/10 transition-colors">
                       <ExternalLink className="h-6 w-6 text-gray-600 group-hover:text-brand" />
                    </div>
                    <span className="font-semibold text-gray-900">{link.title}</span>
                  </div>
                  <div className="hidden sm:block px-4 py-2 bg-brand text-white text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    {link.btnText}
                  </div>
                  <ArrowRight className="sm:hidden h-5 w-5 text-gray-400 group-hover:text-brand" />
                </div>
              </Link>
            </div>
          ))}

          <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">Featured Products</h2>
          
          {products.map((product, index) => (
            <div key={index} className="group transition-transform hover:-translate-y-0.5">
              <Link href={product.url} target="_blank" className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                {index === 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="w-full">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={1600}
                        height={900}
                        className="w-full h-auto rounded-xl object-cover bg-gray-100"
                        priority
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl leading-snug group-hover:text-brand transition-colors">{product.title}</h3>
                      <p className="text-gray-600 mt-2 whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                    <div className="mt-1">
                      <span className="inline-block w-full text-center px-5 py-3 bg-gray-50 text-gray-700 font-semibold rounded-lg group-hover:bg-brand group-hover:text-white transition-all duration-300">
                        {product.btnText}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover bg-gray-100"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand transition-colors">{product.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex-shrink-0">
                      <span className="inline-block w-full sm:w-auto text-center px-5 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-lg group-hover:bg-brand group-hover:text-white transition-all duration-300">
                        {product.btnText}
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Keith Rumjahn. All rights reserved.</p>
        </div>
      </div>
    </main>
  )
}

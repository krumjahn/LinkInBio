import { Instagram, Linkedin, Twitter, Youtube, ArrowRight, ExternalLink, Sparkles, Users, Zap } from 'lucide-react'

import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const links = [
    {
      title: "Join my community",
      icon: "/globe.svg",
      url: "https://rumjahn.substack.com/",
      btnText: "Subscribe",
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
      title: "My Blog",
      icon: "/globe.svg",
      url: "https://rumjahn.com",
      btnText: "Read",
      description: ""
    }
  ];

  const products = [
    {
      title: "Keith AI — Free Community",
      description: "Learn AI from zero with free videos, agent resources, and a curated AI resource vault.",
      url: "https://www.skool.com/keith-ai-3958",
      btnText: "Join Free",
      community: "free" as const,
      featured: true
    },
    {
      title: "Keith AI — Paid Community",
      description: "Go deeper with practical AI systems, courses, and support for building with AI.",
      url: "https://www.skool.com/keith-ai-2326",
      btnText: "View Community",
      community: "paid" as const,
      featured: true
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
      image: "/Gemini_Generated_Image_pn0lexpn0lexpn0l.png",
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

        {/* Primary feature: upcoming book */}
        <Link
          href="https://rumjahn.com/book"
          className="group mb-12 grid overflow-hidden rounded-3xl bg-[#1d1e1a] shadow-xl transition-transform hover:-translate-y-1 sm:grid-cols-[0.8fr_1.2fr]"
        >
          <div className="relative flex min-h-[360px] items-center justify-center bg-gradient-to-br from-[#eee6d8] via-[#d8c7ae] to-[#a54d38] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.7),transparent_40%)]" />
            <Image
              src="/the-38x-company-book-cover.png"
              alt="The 38X Company book cover"
              width={992}
              height={1586}
              priority
              className="relative h-auto w-48 rotate-1 shadow-2xl transition-transform duration-300 group-hover:scale-[1.03] sm:w-52"
            />
          </div>
          <div className="flex flex-col justify-center p-8 text-white sm:p-10">
            <span className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#d98269]">My upcoming book</span>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">Build an AI company that gets 1% better every day.</h2>
            <p className="mt-4 leading-relaxed text-white/70">The practical guide to building AI workers that learn, coordinate, and keep your business moving while you&apos;re away.</p>
            <span className="mt-7 inline-flex items-center gap-2 font-bold text-white">Join the early-reader list <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
          </div>
        </Link>

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
                {product.featured ? (
                  <div className="flex flex-col gap-4">
                    <div
                      className={`relative flex h-52 w-full overflow-hidden rounded-xl p-6 text-white ${
                        product.community === "free"
                          ? "bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700"
                          : "bg-gradient-to-br from-violet-700 via-fuchsia-700 to-rose-600"
                      }`}
                    >
                      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
                      <div className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-black/15 blur-2xl" />
                      <div className="relative z-10 flex w-full flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                            Keith AI
                          </span>
                          {product.community === "free" ? <Users className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                        </div>
                        <div>
                          <Sparkles className="mb-3 h-8 w-8" />
                          <p className="max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                            {product.community === "free" ? "Learn AI. Build together." : "Turn AI skills into systems."}
                          </p>
                        </div>
                      </div>
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
                        src={product.image!}
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

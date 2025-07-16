'use client'

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <Card className="max-w-md mx-auto bg-card text-card-foreground shadow-xl rounded-xl overflow-hidden">
        <div className="relative w-32 h-32 mx-auto mt-8">
          <div className="rounded-full overflow-hidden w-32 h-32">
            <Image
              src="/keith.jpg"
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
        
        <div className="text-center mt-6 px-6">
          <h1 className="text-2xl font-bold">Keith Rumjahn</h1>
          <p className="text-muted-foreground mt-2">I talk about A.I. to improve your life. Top 50 verified n8n creator globally 🌍</p>
        </div>

        <div className="px-6 py-8 space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="https://nas.io/rumjahn">
              Join my community
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="https://www.youtube.com/@LearnAIAutomation">
              Youtube
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="https://rumjahn.substack.com/">
              Join my newsletter
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="https://rumjahn.com">
              My blog
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="https://seo.rumjahn.com/">
              n8n SEO A.I. System
            </Link>
          </Button>
        </div>

        <div className="flex justify-center gap-6 pb-8">
          <Link href="https://www.threads.net/@krumjahn" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.186v-.007c.024-3.581 1.205-6.334 3.509-8.184C7.56 2.35 10.414 1.5 13.814 1.5h.007c3.581.024 6.334 1.205 8.184 3.509C23.65 7.56 24.5 10.414 24.5 13.814v.007c-.024 3.581-1.205 6.334-3.509 8.184C18.44 23.65 15.586 24.5 12.186 24zm1.627-9.018c-.282-.072-.705-.179-1.131-.179-2.35 0-3.927 1.936-3.927 4.108 0 1.936.846 2.989 2.089 2.989 1.577 0 2.716-1.325 3.151-2.557.164-.47.235-.94.235-1.432v-2.929h-.417zm-1.131-1.936c2.445 0 3.997-1.842 3.997-4.108 0-2.65-2.163-3.997-4.955-3.997-3.01 0-5.173 1.936-5.173 4.679 0 2.65 2.163 3.997 4.955 3.997 1.131 0 2.163-.282 3.151-.752l.611 1.131c-1.131.564-2.35.846-3.762.846-3.574 0-6.617-1.842-6.617-5.267 0-3.574 3.151-6.146 7.463-6.146 3.574 0 6.617 1.842 6.617 5.267 0 3.574-3.151 6.146-7.463 6.146h-.611l-.188-1.796h-.035z"/>
            </svg>
          </Link>
          
          <Link href="https://www.facebook.com/rumjahn" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </Link>
          
          <Link href="https://www.instagram.com/krumjahn/" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </Link>
          
          <Link href="https://www.linkedin.com/in/krumjahn/" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
            </svg>
          </Link>
        </div>
      </Card>
    </main>
  )
}

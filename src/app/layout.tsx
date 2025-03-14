import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { MainNav } from "@/components/nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Tools - Blog Title Research & Analysis",
  description: "AI-powered tools for blog title research, news analysis, and content optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <Script
          src="https://umami.rumjahn.synology.me/script.js"
          data-website-id="f53cf938-91aa-4875-85d8-bd89f9c9da91"
          strategy="afterInteractive"
        />
        <div className="relative flex min-h-screen flex-col">
          <MainNav />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

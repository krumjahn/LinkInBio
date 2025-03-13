'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">
            Content Tools
          </span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4 text-sm font-medium overflow-x-auto pb-2">
          <Link
            href="/content-tools/email-newsletter"
            className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
              pathname === '/content-tools/email-newsletter' ? 'bg-gray-100' : ''
            }`}
          >
            Email Newsletter
          </Link>
          <Link
            href="/content-tools/viral-blog-title"
            className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
              pathname === '/content-tools/viral-blog-title' ? 'bg-gray-100' : ''
            }`}
          >
            Viral Blog Title
          </Link>
          <Link
            href="/content-tools/blog-title-research"
            className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
              pathname === '/content-tools/blog-title-research' ? 'bg-gray-100' : ''
            }`}
          >
            Blog Title Research
          </Link>
          <Link
            href="/content-tools/history"
            className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
              pathname === '/content-tools/history' ? 'bg-gray-100' : ''
            }`}
          >
            History
          </Link>
        </nav>
      </div>
    </nav>
  );
}

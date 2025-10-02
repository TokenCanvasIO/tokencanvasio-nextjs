// src/app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div>
        <h1 className="text-4xl font-bold">TokenCanvasIO Migration</h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          The Next.js migration is in progress.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View Blog
          </Link>
          <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View About Page
          </Link>
          <Link href="/white-paper" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View White Paper
          </Link>
          <Link href="/faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View FAQ
          </Link>
          <Link href="/privacy-policy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
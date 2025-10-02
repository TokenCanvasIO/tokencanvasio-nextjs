// src/app/page.js
import Link from 'next/link';
import { headers } from 'next/headers';
import { getBrandConfig_Server } from '@/brandConfig';

export default function HomePage() {
  const brandConfig = getBrandConfig_Server(headers());
  // Get the navigation links specific to the current brand
  const navLinks = brandConfig.navLinks.filter(link => link.path);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div>
        <h1 className="text-4xl font-bold">{brandConfig.title} Migration</h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          The Next.js migration is in progress.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View Blog
          </Link>
          {/* Dynamically generate links based on the brand's navLinks */}
          {navLinks.map(link => (
            <Link key={link.key} href={link.path} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
              View {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
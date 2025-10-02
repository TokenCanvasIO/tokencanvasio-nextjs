// src/app/HomePageClient.jsx
"use client";

import Link from 'next/link';
import { getBrandConfig_Client } from '@/brandConfig'; // Use the client function
import { useState, useEffect } from 'react';

export default function HomePageClient() {
  // Use state to get the brand config on the client
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    setBrand(getBrandConfig_Client());
  }, []);
  
  if (!brand) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
        <div>Loading...</div>
      </main>
    );
  }

  const navLinks = brand.navLinks.filter(link => link.path);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div>
        <h1 className="text-4xl font-bold">{brand.title} Migration</h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          The Next.js migration is in progress.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            View Blog
          </Link>
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
// src/components/Header.jsx
"use client";

import { useBrand } from '@/context/BrandContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

export default function Header() {
  const brand = useBrand();
  const pathname = usePathname();

  const docPaths = ['/about', '/faq', '/terms-of-service', '/privacy-policy', '/white-paper'];

  if (docPaths.includes(pathname)) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--background-primary)] text-[var(--text-primary)] z-50 h-[var(--header-height)] flex items-center px-4 shadow-md">
      <div className="flex-1">
        {/* Your left-side content, e.g., nav links */}
      </div>
      <div className="flex justify-center flex-1">
        {/* --- THIS IS THE FINAL FIX --- */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[var(--text-primary)] no-underline hover:opacity-80 transition-opacity"
        >
          {brand && <OptimizedImage src={brand.logo} alt={`${brand.title} Logo`} className="h-8 w-auto" />}
          <h1 className="text-xl font-bold">{brand?.title}</h1>
        </Link>
        {/* ------------------------- */}
      </div>
      <div className="flex-1 flex justify-end">
        {/* Your right-side content, e.g., auth button */}
      </div>
    </header>
  );
}
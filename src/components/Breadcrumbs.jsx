// src/components/Breadcrumbs.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { FaHome } from 'react-icons/fa';

// A helper function to format the slugs into readable titles
function formatSegment(segment) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const brand = useBrand();

  if (!pathname || pathname === '/') {
    return null; // Don't show breadcrumbs on the homepage
  }

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol>
        <li>
          <a href={brand?.meta.url} className="breadcrumb-link">
            <FaHome />
            <span className="sr-only">Home</span>
          </a>
        </li>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <li key={href}>
              <span className="breadcrumb-separator">/</span>
              {isLast ? (
                <span aria-current="page" className="breadcrumb-current">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link href={href} className="breadcrumb-link">
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
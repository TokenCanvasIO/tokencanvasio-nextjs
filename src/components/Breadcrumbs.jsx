// src/components/Breadcrumbs.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { FaHome } from 'react-icons/fa';

// A helper function to format URL slugs into readable titles
function formatSegment(segment) {
  return segment
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const brand = useBrand();

  // Don't show breadcrumbs on the homepage
  if (!pathname || pathname === '/') {
    return null;
  }

  // Create the segments of the URL. e.g., '/blog/my-post' becomes ['blog', 'my-post']
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol>
        {/* Always add the "Home" link first, pointing to the correct brand's site */}
        <li>
          <a href={brand?.meta.url} className="breadcrumb-link">
            <FaHome />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {/* Map over the URL segments to build the rest of the trail */}
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <li key={href}>
              <span className="breadcrumb-separator">/</span>
              {/* The last item is just text, not a link */}
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
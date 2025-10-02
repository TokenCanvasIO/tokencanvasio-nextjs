// src/app/blog/BlogListClient.jsx
"use client";

import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import OptimizedImage from '@/components/OptimizedImage';

export default function BlogListClient({ posts }) {
  const brand = useBrand();

  const validPosts = posts ? posts.filter(post => post.date) : [];

  return (
    <div className="flex flex-col gap-8">
      {validPosts.map(({ id, date, title, excerpt, author }) => (
        <a key={id} href={`/blog/${id}`} className="blog-card">
          <h2>{title}</h2>
          <p className="text-sm mt-1">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {excerpt && <p className="mt-4">{excerpt}</p>}
          {author && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
              {brand && (
                <OptimizedImage
                  src={brand.logo}
                  alt="Author Logo"
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{author}</p>
                <p className="text-sm">Solo Developer and Founder</p>
              </div>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
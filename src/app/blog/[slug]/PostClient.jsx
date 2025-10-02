// src/app/blog/[slug]/PostClient.jsx
"use client";

import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { FaArrowLeft } from 'react-icons/fa';

export default function PostClient({ postData }) {
  const brand = useBrand();

  // If there's no post data, show a loading or error message.
  if (!postData) {
    return <div className="doc-page-wrapper">Loading...</div>;
  }

  return (
    <div className="doc-page-wrapper">
      {brand && (
        <Link 
          href={brand.meta.url} 
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
        >
          <FaArrowLeft />
          Back to {brand.title}
        </Link>
      )}
      <article className="prose prose-invert max-w-none">
        <h1 className="doc-title">{postData.title}</h1>
        <div className="text-center text-gray-500 mb-8">
          {new Date(postData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
        </div>
        <div className="doc-text" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}
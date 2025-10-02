// src/app/blog/[slug]/page.jsx
import Link from 'next/link';
import { headers } from 'next/headers';
import { getBrandConfig_Server } from '@/brandConfig';
import { getPostData } from '@/lib/posts';
import { FaArrowLeft } from 'react-icons/fa';

export async function generateMetadata({ params }) {
  const postData = await getPostData(params.slug);
  return {
    title: postData.title,
  };
}

export default async function Post({ params }) {
  // Use the full headers object for brand detection
  const brandConfig = getBrandConfig_Server(headers());
  const postData = await getPostData(params.slug);

  return (
    <div className="doc-page-wrapper">
      <Link 
          href={brandConfig.meta.url} 
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
        >
          <FaArrowLeft />
          Back to {brandConfig.title}
      </Link>
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
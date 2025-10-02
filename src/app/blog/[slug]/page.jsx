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
  // 1. Get the brand info on the server
  const headersList = headers();
  const host = headersList.get('host');
  const brandConfig = getBrandConfig_Server(host);

  // 2. The server fetches the post data
  const postData = await getPostData(params.slug);

  return (
    <div className="doc-page-wrapper">
      <article className="prose prose-invert max-w-none">
        
        {/* 3. NEW: Back to Main Site Button */}
        <Link 
          href={brandConfig.meta.url} 
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
        >
          <FaArrowLeft />
          Back to {brandConfig.title}
        </Link>
        {/* ----------------------------- */}

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
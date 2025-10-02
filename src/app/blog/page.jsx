// src/app/blog/page.jsx
import { getSortedPostsData } from '@/lib/posts';
import BlogListClient from './BlogListClient';

export default function BlogIndexPage() {
  // 1. Data is fetched on the SERVER here, which is safe.
  const allPostsData = getSortedPostsData();

  return (
    <div className="blog-wrapper">
      <h1 className="doc-title mb-12">Blog</h1>
      {/* 2. The data is passed as a prop to the CLIENT component for display. */}
      <BlogListClient posts={allPostsData} />
    </div>
  );
}
// src/app/blog/page.jsx
import { getSortedPostsData } from '@/lib/posts';
import BlogListClient from './BlogListClient'; // Import our new Client Component

export default function BlogIndexPage() {
  // 1. Data is fetched on the SERVER here
  const allPostsData = getSortedPostsData();

  return (
    <div className="blog-wrapper">
      <h1 className="doc-title mb-12">Blog</h1>
      {/* 2. Data is passed as a prop to the CLIENT component */}
      <BlogListClient posts={allPostsData} />
    </div>
  );
}
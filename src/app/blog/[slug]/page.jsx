// src/app/blog/[slug]/page.jsx
import { getPostData } from '@/lib/posts';
import PostClient from './PostClient';

export async function generateMetadata({ params }) {
  const postData = await getPostData(params.slug);
  return {
    title: postData.title,
  };
}

export default async function PostPage({ params }) {
  // 1. Data is fetched on the SERVER here.
  const postData = await getPostData(params.slug);

  // 2. The data is passed as a prop to the Client Component.
  return <PostClient postData={postData} />;
}
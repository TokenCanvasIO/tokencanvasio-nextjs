// src/lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/brandConfig';

export function getSortedPostsData() {
  // Use environment variable for build-time brand detection
  const buildHost = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || '';
  const brand = getBrandConfig(buildHost);
  const brandFolder = brand.key === 'xrp' ? 'xrp' : 'default';
  const postsDirectory = path.join(process.cwd(), 'posts', brandFolder);
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    return {
      id,
      ...matterResult.data,
    };
  });
  
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  // Use environment variable for build-time brand detection
  const buildHost = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || '';
  const brand = getBrandConfig(buildHost);
  const brandFolder = brand.key === 'xrp' ? 'xrp' : 'default';
  const postsDirectory = path.join(process.cwd(), 'posts', brandFolder);
  
  const fileNames = fs.readdirSync(postsDirectory);
  
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(slug) {
  // Use environment variable for build-time brand detection
  const buildHost = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || '';
  const brand = getBrandConfig(buildHost);
  const brandFolder = brand.key === 'xrp' ? 'xrp' : 'default';
  const fullPath = path.join(process.cwd(), 'posts', brandFolder, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();
    
    return {
      slug,
      contentHtml,
      ...matterResult.data,
    };
  } catch (error) {
    // If the file doesn't exist (ENOENT), trigger a 404 page.
    if (error.code === 'ENOENT') {
      notFound();
    }
    // For any other errors, re-throw them.
    throw error;
  }
}
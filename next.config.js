/** @type {import('next').NextConfig} */

// This variable is automatically provided by Netlify during its build process.
const assetPrefix = process.env.URL || '';

const nextConfig = {
  // This is the crucial line.
  // It tells Next.js to use its full Netlify URL for all its assets.
  assetPrefix: process.env.NODE_ENV === 'production' ? assetPrefix : undefined,

  reactStrictMode: true,
};

module.exports = nextConfig;